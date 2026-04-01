import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations
);

/**
 * Check if a user (or IP) has reached their daily limit
 */
export async function checkPremiumLimit(userId, ip) {
  // If no user, track by IP
  const idToTrack = userId || ip;
  const isPremium = userId ? await checkSubscription(userId) : false;

  const today = new Date().toISOString().split('T')[0];
  
  // Free users: 5 per day
  // Premium: Unlimited
  if (isPremium) return { allowed: true, premium: true };

  const { data, error } = await supabase
    .from('usage_stats')
    .select('check_count')
    .eq('user_id', idToTrack)
    .eq('usage_date', today)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  const count = data?.check_count || 0;
  const limit = 5;

  if (count >= limit) {
    return { allowed: false, count, limit, premium: false };
  }

  return { allowed: true, count, limit, premium: false };
}

/**
 * Increment the usage counter
 */
export async function incrementUsage(userId, ip) {
  const idToTrack = userId || ip;
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase.rpc('increment_usage', { 
    target_id: idToTrack,
    target_date: today 
  });
  
  return !error;
}

async function checkSubscription(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', userId)
    .single();
  
  return data?.subscription_status === 'premium';
}
