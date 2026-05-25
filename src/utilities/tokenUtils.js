/** Unlimited plan quota sentinel (matches backend TokenPricing.UNLIMITED_PLAN_THRESHOLD). */
export const UNLIMITED_TOKENS = -1;

const PLAN_DEFAULTS = {
  free: 25000,
  pro: 500000,
  elite: UNLIMITED_TOKENS,
};

export function isUnlimitedUser(user) {
  if (!user) return false;
  return user.monthly_tokens === UNLIMITED_TOKENS || user.token_balance === UNLIMITED_TOKENS;
}

export function getMonthlyTokenLimit(user) {
  if (isUnlimitedUser(user)) return UNLIMITED_TOKENS;
  return user?.monthly_tokens ?? PLAN_DEFAULTS[user?.subscription_plan] ?? 25000;
}

export function getRemainingTokens(user) {
  if (isUnlimitedUser(user)) return UNLIMITED_TOKENS;
  return user?.token_balance ?? 0;
}
