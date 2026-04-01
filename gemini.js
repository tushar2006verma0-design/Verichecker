import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';


/**
 * Verify a claim using Google Gemini API
 * @param {string} claim - The claim to verify
 * @returns {Promise<object>} Structured verification result
 */
export async function verifyWithGemini(claim, isPremium = false) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1, // Lower temperature for more stable JSON
      topP: 0.8,
      maxOutputTokens: isPremium ? 1500 : 600,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          verdict: { type: 'string', enum: ['TRUE', 'FALSE', 'MISLEADING', 'UNVERIFIABLE'] },
          confidence: { type: 'number' },
          category: { type: 'string' },
          explanation: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: isPremium ? 7 : 2
          },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                url: { type: 'string' },
                credibility: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] }
              },
              required: ['title', 'url', 'credibility']
            },
            minItems: 1,
            maxItems: isPremium ? 5 : 2
          }
        },
        required: ['verdict', 'confidence', 'category', 'explanation', 'sources']
      }
    },
  });

  const prompt = isPremium 
    ? `Perform a DEEP ANALYSIS on this claim. Provide 5-7 detailed points covering background, context, and specific evidentiary findings. Provide 3-5 credible sources. Return JSON: "${claim.replace(/"/g, '\\"')}"`
    : `Fact check this claim quickly. Provide a very brief explanation and only 1-2 sources. Return JSON: "${claim.replace(/"/g, '\\"')}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();

    // Remove markdown code fences if present
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    const parsed = JSON.parse(text);

    // Validate and normalize
    return {
      id: uuidv4(),
      claim,
      verdict: validateVerdict(parsed.verdict),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
      category: parsed.category || 'Other',
      explanation: Array.isArray(parsed.explanation)
        ? parsed.explanation.slice(0, 3)
        : ['Analysis could not be fully structured.'],
      sources: Array.isArray(parsed.sources)
        ? parsed.sources.slice(0, 5).map((s) => ({
            title: s.title || 'Unknown Source',
            url: s.url || '#',
            credibility: validateCredibility(s.credibility),
          }))
        : [],
      checkedAt: new Date().toISOString(),
      cached: false,
    };
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw error;
  }
}

/**
 * Fallback verification using Grok API (xAI) when Gemini is unavailable
 * @param {string} claim - The claim to verify
 * @returns {Promise<object>} Structured verification result
 */
export async function verifyWithBackup(claim) {
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    throw new Error('GROK_API_KEY is not configured');
  }

  const prompt = FACT_CHECK_PROMPT.replace('{claim}', claim.replace(/"/g, '\\"'));

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful and precise assistant parsing raw data into exactly structured JSON. Always format the output exactly as requested as a single raw JSON object.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'grok-beta',
      temperature: 0.3,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Grok API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  let text = data.choices?.[0]?.message?.content?.trim() || '{}';

  // Remove markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (parseError) {
    throw new Error('Grok API returned invalid JSON');
  }

  // Validate and normalize
  return {
    id: uuidv4(),
    claim,
    verdict: validateVerdict(parsed.verdict),
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
    category: parsed.category || 'Other',
    explanation: Array.isArray(parsed.explanation)
      ? parsed.explanation.slice(0, 3)
      : ['Analysis could not be fully structured.'],
    sources: Array.isArray(parsed.sources)
      ? parsed.sources.slice(0, 5).map((s) => ({
          title: s.title || 'Unknown Source',
          url: s.url || '#',
          credibility: validateCredibility(s.credibility),
        }))
      : [],
    checkedAt: new Date().toISOString(),
    cached: false,
    fallback: true,
  };
}

function validateVerdict(verdict) {
  const valid = ['TRUE', 'FALSE', 'MISLEADING', 'UNVERIFIABLE'];
  const upper = (verdict || '').toUpperCase();
  return valid.includes(upper) ? upper : 'UNVERIFIABLE';
}

function validateCredibility(cred) {
  const valid = ['HIGH', 'MEDIUM', 'LOW'];
  const upper = (cred || '').toUpperCase();
  return valid.includes(upper) ? upper : 'MEDIUM';
}
