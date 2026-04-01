import crypto from 'crypto';
import { supabase } from './supabase';
import { CACHE_TTL } from './constants';

/**
 * Generate a deterministic hash key for a claim
 */
function hashClaim(claim) {
  const normalized = claim.trim().toLowerCase().replace(/\s+/g, ' ');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Get a cached result for a claim from Supabase
 * @param {string} claim - The claim text
 * @returns {Promise<object|null>} Cached result or null
 */
export async function getCached(claim) {
  if (!supabase) return null; // Fallback if no Supabase credentials

  const key = hashClaim(claim);

  try {
    const { data, error } = await supabase
      .from('claims_cache')
      .select('result_data, created_at')
      .eq('hash_key', key)
      .single();

    if (error || !data) return null;

    // Check if cache has expired
    const age = Date.now() - new Date(data.created_at).getTime();
    if (age > CACHE_TTL) {
      // In a real environment you might run a cron job, but we'll try to delete expired lazily
      await supabase.from('claims_cache').delete().eq('hash_key', key).then();
      return null;
    }

    return { ...data.result_data, cached: true };
  } catch (error) {
    console.error('Supabase Cache Error (Get):', error);
    return null;
  }
}

/**
 * Store a result in Supabase cache
 * @param {string} claim - The claim text
 * @param {object} result - The verification result
 */
export async function setCache(claim, result) {
  if (!supabase) return;

  const key = hashClaim(claim);

  try {
    const { error } = await supabase
      .from('claims_cache')
      .upsert(
        {
          hash_key: key,
          claim_text: claim,
          result_data: result,
        },
        { onConflict: 'hash_key' }
      );

    if (error) {
      console.error('Supabase Cache Error (Set):', error.message);
    }
  } catch (err) {
    console.error('Supabase Setup Error:', err);
  }
}

/**
 * Get cache statistics (Supabase requires different implementation, disabled for now)
 */
export async function getCacheStats() {
  if (!supabase) return { size: 0, entries: 0 };
  
  const { count } = await supabase
    .from('claims_cache')
    .select('*', { count: 'exact', head: true });
    
  return {
    size: -1, // Not practically calculable from simple select
    entries: count || 0,
  };
}
