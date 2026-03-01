/**
 * Dashboard utilities — pure computation functions (no React, no side effects)
 */
import { differenceInDays, parseISO, format, getDay } from 'date-fns';

// ─── Status grouping ─────────────────────────────────────────────
export const APPLIED_STATUSES = ['applied', 'interview', 'closed', 'offer'];
export const STATUS_ORDER = ['saved', 'applied', 'interview', 'offer', 'closed'];

export const groupByStatus = (jobs) => {
  return (jobs || []).reduce((acc, job) => {
    const s = job.application_status || 'saved';
    acc[s] = (acc[s] || []).concat(job);
    return acc;
  }, {});
};

// ─── Job age ─────────────────────────────────────────────────────
export const getJobAge = (createdAt) => {
  if (!createdAt) return 999;
  try {
    return differenceInDays(new Date(), parseISO(createdAt));
  } catch {
    return 999;
  }
};

export const getAgeBadge = (createdAt) => {
  const days = getJobAge(createdAt);
  if (days <= 7) return { label: 'Fresh', color: 'green', days };
  if (days <= 21) return { label: 'Aging', color: 'amber', days };
  return { label: 'Stale', color: 'red', days };
};

// ─── Career Health Score ──────────────────────────────────────────
export const computeCareerScore = (summary, jobs) => {
  if (!summary || !jobs) return { score: 0, breakdown: {}, streak: 0, conversionRate: 0, responseRate: 0 };

  const totalSaved = (jobs || []).filter((j) => j.application_status === 'saved').length;
  const totalApplied = (jobs || []).filter((j) =>
    APPLIED_STATUSES.includes(j.application_status)
  ).length;
  const totalInterview = (jobs || []).filter((j) => j.application_status === 'interview').length;

  // Factor 1: Application volume (20%) — max at 30 apps
  const volumeScore = Math.min(totalApplied / 30, 1) * 20;

  // Factor 2: Application streak (15%) — max at 7-day streak
  const streak = computeStreak(summary.applications_by_day || []);
  const streakScore = Math.min(streak / 7, 1) * 15;

  // Factor 3: Company diversity (15%) — unique companies applied to, max at 10
  const uniqueCompanies = new Set(
    (jobs || [])
      .filter((j) => APPLIED_STATUSES.includes(j.application_status))
      .map((j) => (j.company || '').toLowerCase())
      .filter(Boolean)
  ).size;
  const diversityScore = Math.min(uniqueCompanies / 10, 1) * 15;

  // Factor 4: Saved→Applied conversion (25%) — target 70%
  const savedTotal = totalSaved + totalApplied;
  const conversionRate = savedTotal > 0 ? totalApplied / savedTotal : 0;
  const conversionScore = Math.min(conversionRate / 0.7, 1) * 25;

  // Factor 5: Response rate (25%) — target 20%
  const responseRate = totalApplied > 0 ? totalInterview / totalApplied : 0;
  const responseScore = Math.min(responseRate / 0.2, 1) * 25;

  const total = Math.round(
    volumeScore + streakScore + diversityScore + conversionScore + responseScore
  );

  return {
    score: Math.min(100, total),
    breakdown: {
      volume: { score: Math.round(volumeScore), max: 20, label: 'Application Volume' },
      streak: { score: Math.round(streakScore), max: 15, label: 'Consistency Streak' },
      diversity: { score: Math.round(diversityScore), max: 15, label: 'Company Diversity' },
      conversion: {
        score: Math.round(conversionScore),
        max: 25,
        label: 'Saved → Applied Rate',
        value: `${Math.round(conversionRate * 100)}%`,
      },
      response: {
        score: Math.round(responseScore),
        max: 25,
        label: 'Response Rate',
        value: `${Math.round(responseRate * 100)}%`,
      },
    },
    streak,
    conversionRate,
    responseRate,
  };
};

export const getScoreColor = (score) => {
  if (score >= 70) return { text: 'var(--success)', bg: 'var(--success-bg)', ring: 'var(--success)', hex: '#22c55e' };
  if (score >= 40) return { text: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.08)', ring: 'var(--warning)', hex: '#f59e0b' };
  return { text: 'var(--primary)', bg: 'var(--light-blue-bg-08)', ring: 'var(--primary)', hex: '#2563eb' };
};

export const getScoreCoachingTip = (breakdown) => {
  if (!breakdown || typeof breakdown !== 'object') return 'Keep up the great work!';
  const factors = Object.values(breakdown);
  const worst = factors.reduce(
    (a, b) => ((a?.score ?? 0) / (a?.max || 1) < (b?.score ?? 0) / (b?.max || 1) ? a : b)
  );

  const tips = {
    'Application Volume': 'Apply to 5 more jobs this week to boost your volume score.',
    'Consistency Streak': 'Apply at least once daily to build your streak.',
    'Company Diversity': 'Try applying to companies in new industries.',
    'Saved → Applied Rate': "You have saved jobs not applied to — work through your saved list.",
    'Response Rate': 'Consider tailoring your resume for each application.',
  };
  return tips[worst?.label] || 'Keep up the great work!';
};

// ─── Streak ──────────────────────────────────────────────────────
export const computeStreak = (applicationsByDay) => {
  if (!applicationsByDay?.length) return 0;
  const sorted = [...applicationsByDay].sort((a, b) =>
    (b.date || '').localeCompare(a.date || '')
  );
  let streak = 0;
  let prev = new Date();
  prev.setHours(0, 0, 0, 0);

  for (const day of sorted) {
    if (!day.date) continue;
    try {
      const d = parseISO(day.date);
      const diff = differenceInDays(prev, d);
      if (diff <= 1 && (day.count || 0) > 0) {
        streak++;
        prev = d;
      } else if ((day.count || 0) === 0) {
        continue;
      } else {
        break;
      }
    } catch {
      continue;
    }
  }
  return streak;
};

// ─── Peak apply day ───────────────────────────────────────────────
export const getPeakApplyDay = (applicationsByDay) => {
  if (!applicationsByDay?.length) return null;
  const byDow = [0, 0, 0, 0, 0, 0, 0];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (const item of applicationsByDay) {
    if ((item.count || 0) > 0 && item.date) {
      try {
        const dow = getDay(parseISO(item.date));
        byDow[dow] += item.count;
      } catch {
        // skip invalid dates
      }
    }
  }
  const max = Math.max(...byDow);
  if (max === 0) return null;
  return DAYS[byDow.indexOf(max)];
};

// ─── Company interest signal ───────────────────────────────────────
export const getCompanySignal = (visits, hasApplied, lastVisitDate) => {
  if (hasApplied) return { label: 'Applied ✓', color: 'green', priority: 0 };
  const parsed = lastVisitDate ? parseISO(lastVisitDate) : new Date();
  const daysAgo = differenceInDays(new Date(), parsed);
  if (visits >= 3 && daysAgo <= 7) return { label: '🔥 High Interest', color: 'red', priority: 1 };
  if (daysAgo <= 7) return { label: '👀 Active', color: 'purple', priority: 2 };
  if (daysAgo <= 14) return { label: '⚠️ Going Cold', color: 'amber', priority: 3 };
  return { label: '🧊 Cold', color: 'gray', priority: 4 };
};

// ─── Smart insights generator ─────────────────────────────────────
export const generateInsights = (summary, jobs) => {
  const insights = [];
  if (!summary && !jobs) return insights;

  const streak = computeStreak((summary || {}).applications_by_day || []);
  const peakDay = getPeakApplyDay((summary || {}).applications_by_day || []);
  const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date().getDay()
  ];
  const jobList = jobs || [];
  const savedJobs = jobList.filter((j) => j.application_status === 'saved');
  const appliedJobs = jobList.filter((j) => APPLIED_STATUSES.includes(j.application_status));
  const interviewJobs = jobList.filter((j) => j.application_status === 'interview');
  const staleJobs = savedJobs.filter((j) => getJobAge(j.created_at) > 21);
  const conversionRate =
    savedJobs.length + appliedJobs.length > 0
      ? appliedJobs.length / (savedJobs.length + appliedJobs.length)
      : 0;
  const responseRate = appliedJobs.length > 0 ? interviewJobs.length / appliedJobs.length : 0;

  if (streak >= 3) {
    insights.push({
      type: 'streak',
      icon: '🔥',
      title: `${streak}-day streak!`,
      body: `You've applied consistently for ${streak} days. Consistent applicants get 2x more interview callbacks.`,
      cta: null,
    });
  }

  if (peakDay && peakDay === today) {
    insights.push({
      type: 'pattern',
      icon: '📅',
      title: "Today is your best day to apply",
      body: `You apply 3x more on ${peakDay}s than any other day. Strike while the iron's hot.`,
      cta: null,
    });
  } else if (peakDay) {
    insights.push({
      type: 'pattern',
      icon: '📅',
      title: `You apply most on ${peakDay}s`,
      body: `Based on your history, ${peakDay} is your most productive application day.`,
      cta: null,
    });
  }

  if (conversionRate < 0.5 && savedJobs.length >= 3) {
    insights.push({
      type: 'coaching',
      icon: '💡',
      title: `${savedJobs.length} saved jobs waiting`,
      body: `Your saved→applied rate is ${Math.round(conversionRate * 100)}%. Try applying to 2 saved jobs today.`,
      cta: { label: 'View saved jobs', anchor: '#saved-jobs' },
    });
  }

  if (staleJobs.length > 0) {
    insights.push({
      type: 'warning',
      icon: '⏰',
      title: `${staleJobs.length} jobs may be closing`,
      body: `You have ${staleJobs.length} saved job${staleJobs.length > 1 ? 's' : ''} over 21 days old. Review them before they close.`,
      cta: { label: 'Review stale jobs', anchor: '#saved-jobs' },
    });
  }

  if (appliedJobs.length >= 5 && responseRate < 0.1) {
    insights.push({
      type: 'coaching',
      icon: '📝',
      title: `Low response rate (${Math.round(responseRate * 100)}%)`,
      body: `You've applied to ${appliedJobs.length} jobs but gotten few responses. Consider tailoring your resume for each role.`,
      cta: null,
    });
  }

  if (responseRate >= 0.2 && appliedJobs.length >= 3) {
    insights.push({
      type: 'positive',
      icon: '🎯',
      title: 'Strong response rate!',
      body: `${Math.round(responseRate * 100)}% of your applications led to interviews — well above average.`,
      cta: null,
    });
  }

  return insights.slice(0, 3);
};
