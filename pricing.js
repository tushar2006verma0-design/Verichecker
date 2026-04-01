/**
 * VeriCheck Pricing System (PPP-Enabled)
 */

export const PRICING_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    checksPerDay: 5,
    features: [
      'Standard AI Verification',
      'Basic Evidence Summary',
      'Ad-supported',
      'Daily usage limit'
    ]
  },
  PREMIUM: {
    id: 'premium',
    name: 'VeriCheck Premium',
    india: {
      monthly: 50, // ₹50
      yearly: 500, // ₹500
      currency: 'INR',
      symbol: '₹'
    },
    default: {
      monthly: 1.99, // $1.99
      yearly: 19.99, // $19.99
      currency: 'USD',
      symbol: '$'
    },
    features: [
      'Priority AI Processing',
      'Deep Analysis Mode (7+ points)',
      'Advanced Source Bias Detection',
      'Ad-Free Experience',
      'Export results as PDF/Report',
      'Unlimited checks'
    ]
  }
};

/**
 * Detect user region and get local pricing
 */
export function getRegionalPricing(countryCode = 'IN') {
  const isIndia = countryCode === 'IN';
  const plan = PRICING_PLANS.PREMIUM;
  const config = isIndia ? plan.india : plan.default;

  return {
    ...plan,
    priceDisplay: isIndia ? `${config.symbol}${config.monthly}` : `${config.symbol}${config.monthly}`,
    currency: config.currency,
    monthly: config.monthly,
    yearly: config.yearly,
    symbol: config.symbol,
    isPPP: !isIndia // In this case US/Global is 'Standard', India is 'PPP'
  };
}
