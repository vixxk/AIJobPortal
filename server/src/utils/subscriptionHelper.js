const User = require('../modules/user/user.model');
const Order = require('../modules/payment/order.model');

const PLAN_LIMITS = {
  FREE: { spokenEnglish: 30, resumes: 1, resumesRewrites: 20, interviews: 4 },
  PRO: { spokenEnglish: 100, resumes: 10, resumesRewrites: 200, interviews: 30 },
  PRO_PLUS: { spokenEnglish: 150, resumes: 20, resumesRewrites: 400, interviews: 50 }
};

const PAY_PER_USE_PRICES = {
  INTERVIEW: 7,
  RESUME: 10,
  ENGLISH_TUTOR: 7
};

/**
 * Gets limits for a given plan key from the database, falling back to static config.
 */
const getPlanLimits = async (planKey) => {
  const SubscriptionPlanConfig = require('../modules/payment/subscriptionPlanConfig.model');
  try {
    const config = await SubscriptionPlanConfig.findOne({ planKey });
    if (config) {
      return {
        spokenEnglish: config.spokenEnglishLimit,
        resumes: config.resumesLimit,
        resumesRewrites: config.resumesLimit * 20, // count AI rewrites also, max resume count limit * 20
        interviews: config.interviewsLimit
      };
    }
  } catch (err) {
    console.error('Failed to fetch plan config from DB:', err.message);
  }
  // Fallback
  return PLAN_LIMITS[planKey] || PLAN_LIMITS.FREE;
};

/**
 * Gets the current pay-per-use price for a given feature.
 */
const getPayPerUsePrice = async (featureType) => {
  const PayPerUseConfig = require('../modules/payment/payPerUseConfig.model');
  try {
    const config = await PayPerUseConfig.findOne({ featureType });
    if (config) {
      return config.price;
    }
  } catch (err) {
    console.error('Failed to fetch pay-per-use config from DB:', err.message);
  }
  return PAY_PER_USE_PRICES[featureType] || 7;
};

/**
 * Checks if the user's monthly limits need to be reset and updates them.
 */
const checkAndResetLimits = async (user) => {
  if (user.role !== 'STUDENT') return user;

  const now = new Date();
  
  // 1. If PRO/PRO_PLUS period ended and subscription is not active, downgrade to FREE
  if (user.subscription.plan !== 'FREE' && user.subscription.currentPeriodEnd < now) {
    const freeLimits = await getPlanLimits('FREE');
    user.subscription.plan = 'FREE';
    user.subscription.status = 'EXPIRED';
    user.usageLimits.spokenEnglish.limit = freeLimits.spokenEnglish;
    user.usageLimits.resumes.limit = freeLimits.resumes;
    user.usageLimits.resumesRewrites.limit = freeLimits.resumesRewrites;
    user.usageLimits.interviews.limit = freeLimits.interviews;
    user.usageLimits.lastResetDate = now;
    user.usageLimits.spokenEnglish.used = 0;
    user.usageLimits.resumes.used = 0;
    user.usageLimits.resumesRewrites.used = 0;
    user.usageLimits.interviews.used = 0;
    await user.save();
    return user;
  }

  // 2. If it's a new billing cycle (more than 30 days since last reset for FREE plan, or since last reset date)
  const lastReset = new Date(user.usageLimits.lastResetDate || user.createdAt);
  const diffTime = Math.abs(now - lastReset);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 30) {
    const plan = user.subscription.plan || 'FREE';
    const limits = await getPlanLimits(plan);
    
    user.usageLimits.spokenEnglish.used = 0;
    user.usageLimits.resumes.used = 0;
    user.usageLimits.resumesRewrites.used = 0;
    user.usageLimits.interviews.used = 0;
    
    user.usageLimits.spokenEnglish.limit = limits.spokenEnglish;
    user.usageLimits.resumes.limit = limits.resumes;
    user.usageLimits.resumesRewrites.limit = limits.resumesRewrites;
    user.usageLimits.interviews.limit = limits.interviews;
    
    user.usageLimits.lastResetDate = now;
    await user.save();
  }
  
  return user;
};

/**
 * Checks if user has enough quota or needs pay-per-use.
 * Returns { allowed: boolean, payPerUseRequired: boolean, amount?: number }
 */
const checkQuota = async (userId, feature) => {
  let user = await User.findById(userId);
  if (!user) return { allowed: false, reason: 'User not found' };
  
  if (user.role !== 'STUDENT') {
    return { allowed: true, payPerUseRequired: false };
  }

  user = await checkAndResetLimits(user);

  let limit = 0;
  let used = 0;

  if (feature === 'spokenEnglish') {
    limit = user.usageLimits.spokenEnglish.limit;
    used = user.usageLimits.spokenEnglish.used;
  } else if (feature === 'resumes') {
    limit = user.usageLimits.resumes.limit;
    used = user.usageLimits.resumes.used;
  } else if (feature === 'resumesRewrites') {
    limit = user.usageLimits.resumesRewrites.limit;
    used = user.usageLimits.resumesRewrites.used;
  } else if (feature === 'interviews') {
    if (user.subscription.plan === 'FREE') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentInterviews = (user.usageLimits.interviews.dates || [])
        .map(d => new Date(d))
        .filter(d => d >= oneWeekAgo);

      const limits = await getPlanLimits('FREE');
      const weeklyLimit = limits.interviews || 1;

      if (recentInterviews.length >= weeklyLimit) {
        const oldestRecent = recentInterviews[0];
        const nextAllowed = new Date(oldestRecent.getTime() + 7 * 24 * 60 * 60 * 1000);
        const timeDiff = nextAllowed.getTime() - now.getTime();
        const daysRemaining = Math.max(1, Math.ceil(timeDiff / (24 * 60 * 60 * 1000)));

        const amount = await getPayPerUsePrice('INTERVIEW');
        return {
          allowed: false,
          payPerUseRequired: true,
          amount,
          type: 'INTERVIEW',
          reason: `Free plan is limited to ${weeklyLimit} mock interview${weeklyLimit > 1 ? 's' : ''} per week. You can start your next free interview in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}. Upgrade to PRO or PRO PLUS to get more interviews without weekly limits, or pay per use to start immediately!`
        };
      }
      return { allowed: true, payPerUseRequired: false };
    }

    limit = user.usageLimits.interviews.limit;
    used = user.usageLimits.interviews.used;
  }

  if (used < limit) {
    return { allowed: true, payPerUseRequired: false };
  }

  // Quota is exhausted, require pay-per-use
  let amount = 0;
  let type = '';
  if (feature === 'spokenEnglish') {
    amount = await getPayPerUsePrice('ENGLISH_TUTOR');
    type = 'ENGLISH_TUTOR';
  } else if (feature === 'resumes') {
    amount = await getPayPerUsePrice('RESUME');
    type = 'RESUME';
  } else if (feature === 'interviews') {
    amount = await getPayPerUsePrice('INTERVIEW');
    type = 'INTERVIEW';
  } else {
    return { allowed: false, payPerUseRequired: false, reason: 'Rewrite limit exceeded for this month.' };
  }

  return {
    allowed: false,
    payPerUseRequired: true,
    amount,
    type
  };
};

const incrementUsage = async (userId, feature) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'STUDENT') return;

  if (feature === 'spokenEnglish') {
    user.usageLimits.spokenEnglish.used += 1;
  } else if (feature === 'resumes') {
    user.usageLimits.resumes.used += 1;
  } else if (feature === 'resumesRewrites') {
    user.usageLimits.resumesRewrites.used += 1;
  } else if (feature === 'interviews') {
    user.usageLimits.interviews.used += 1;
    user.usageLimits.interviews.lastInterviewDate = new Date();
    
    if (!user.usageLimits.interviews.dates) {
      user.usageLimits.interviews.dates = [];
    }
    user.usageLimits.interviews.dates.push(new Date());
  }

  await user.save();
};

module.exports = {
  checkAndResetLimits,
  checkQuota,
  incrementUsage,
  getPlanLimits,
  getPayPerUsePrice,
  PLAN_LIMITS,
  PAY_PER_USE_PRICES
};
