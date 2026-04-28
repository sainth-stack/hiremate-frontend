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

  const savedJobs = (jobs || []).filter((j) => j.application_status === 'saved');
  const appliedJobs = (jobs || []).filter((j) => j.application_status === 'applied');
  const interviewJobs = (jobs || []).filter((j) => j.application_status === 'interview');
  const offerJobs = (jobs || []).filter((j) => j.application_status === 'offer');
  const closedJobs = (jobs || []).filter((j) => j.application_status === 'closed');
  
  const totalSubmitted = appliedJobs.length + interviewJobs.length + offerJobs.length + closedJobs.length;

  // Factor 1: Application volume (20%) — max at 30 submitted apps
  const volumeScore = Math.min(totalSubmitted / 30, 1) * 20;

  // Factor 2: Application streak (15%) — max at 7-day streak
  const streak = computeStreak(summary.applications_by_day || []);
  const streakScore = Math.min(streak / 7, 1) * 15;

  // Factor 3: Company diversity (15%) — unique companies applied to, max at 10
  const uniqueCompanies = new Set(
    (jobs || [])
      .filter((j) => j.application_status !== 'saved')
      .map((j) => (j.company || '').toLowerCase())
      .filter(Boolean)
  ).size;
  const diversityScore = Math.min(uniqueCompanies / 10, 1) * 15;

  // Factor 4: Saved→Applied conversion (25%) — target 70%
  const totalJobs = savedJobs.length + totalSubmitted;
  const conversionRate = totalJobs > 0 ? totalSubmitted / totalJobs : 0;
  const conversionScore = Math.min(conversionRate / 0.7, 1) * 25;

  // Factor 5: Response rate (25%) — target 15%
  const responseRate = totalSubmitted > 0 ? interviewJobs.length / totalSubmitted : 0;
  const responseScore = Math.min(responseRate / 0.15, 1) * 25;

  const total = Math.round(
    volumeScore + streakScore + diversityScore + conversionScore + responseScore
  );

  return {
    score: Math.min(100, total),
    breakdown: {
      volume: { score: Math.round(volumeScore), max: 20, label: 'Applications Submitted', value: `${totalSubmitted} apps` },
      streak: { score: Math.round(streakScore), max: 15, label: 'Consistency Streak', value: `${streak} days` },
      diversity: { score: Math.round(diversityScore), max: 15, label: 'Company Diversity', value: `${uniqueCompanies} companies` },
      conversion: {
        score: Math.round(conversionScore),
        max: 25,
        label: 'Conversion Rate',
        value: `${Math.round(conversionRate * 100)}%`,
      },
      response: {
        score: Math.round(responseScore),
        max: 25,
        label: 'Interview Rate',
        value: `${Math.round(responseRate * 100)}%`,
      },
    },
    streak,
    conversionRate,
    responseRate,
  };
};

export const getScoreColor = (score) => {
  if (score >= 70) return { text: '#10B981', bg: 'rgba(16, 185, 129, 0.08)', ring: '#10B981', hex: '#10B981' };
  if (score >= 40) return { text: '#06B6D4', bg: 'rgba(6, 182, 212, 0.08)', ring: '#06B6D4', hex: '#06B6D4' };
  return { text: 'var(--primary)', bg: 'var(--light-blue-bg-08)', ring: 'var(--primary)', hex: '#1E3A8A' };
};

export const getScoreCoachingTip = (breakdown) => {
  if (!breakdown || typeof breakdown !== 'object') return 'Keep up the great work!';
  const factors = Object.values(breakdown);
  if (factors.length === 0) return 'Keep up the great work!';
  const worst = factors.reduce(
    (a, b) => ((a?.score ?? 0) / (a?.max || 1) < (b?.score ?? 0) / (b?.max || 1) ? a : b)
  );

  const tips = {
    'Applications Submitted': 'Submit 3-5 more applications this week to build momentum.',
    'Consistency Streak': 'Apply to at least 1 job daily to build a strong streak.',
    'Company Diversity': 'Expand your search to companies in adjacent industries.',
    'Conversion Rate': "Work through your saved jobs list - apply to 3 this week.",
    'Interview Rate': 'Tailor your resume to match job descriptions and use keywords.',
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
  const appliedJobs = jobList.filter((j) => j.application_status === 'applied');
  const interviewJobs = jobList.filter((j) => j.application_status === 'interview');
  const offerJobs = jobList.filter((j) => j.application_status === 'offer');
  const closedJobs = jobList.filter((j) => j.application_status === 'closed');
  
  const totalSubmitted = appliedJobs.length + interviewJobs.length + offerJobs.length + closedJobs.length;
  const staleJobs = savedJobs.filter((j) => getJobAge(j.created_at) > 21);
  const conversionRate = savedJobs.length + totalSubmitted > 0 ? totalSubmitted / (savedJobs.length + totalSubmitted) : 0;
  const responseRate = totalSubmitted > 0 ? interviewJobs.length / totalSubmitted : 0;

  if (offerJobs.length > 0) {
    insights.push({
      type: 'positive',
      icon: '🎉',
      title: `${offerJobs.length} offer${offerJobs.length > 1 ? 's' : ''} received!`,
      body: `Congratulations! Review your offers carefully and consider negotiating if needed.`,
      cta: null,
    });
  }

  if (streak >= 3) {
    insights.push({
      type: 'streak',
      icon: '🔥',
      title: `${streak}-day application streak!`,
      body: `You're on fire! Consistent applicants see 2-3x better response rates.`,
      cta: null,
    });
  }

  if (staleJobs.length > 0) {
    insights.push({
      type: 'warning',
      icon: '⏰',
      title: `${staleJobs.length} stale saved job${staleJobs.length > 1 ? 's' : ''}`,
      body: `These jobs are over 21 days old and may close soon. Apply or archive them.`,
      cta: { label: 'Review saved jobs', anchor: '#saved-jobs' },
    });
  }

  if (totalSubmitted >= 10 && responseRate < 0.08) {
    insights.push({
      type: 'coaching',
      icon: '📝',
      title: `Low response rate (${Math.round(responseRate * 100)}%)`,
      body: `Tailor your resume to match job keywords. Use action verbs and quantify achievements.`,
      cta: null,
    });
  }

  if (conversionRate < 0.4 && savedJobs.length >= 5) {
    insights.push({
      type: 'coaching',
      icon: '💡',
      title: `${savedJobs.length} jobs in your saved list`,
      body: `Set a goal to apply to 3 saved jobs this week to boost your pipeline.`,
      cta: { label: 'View saved jobs', anchor: '#saved-jobs' },
    });
  }

  if (responseRate >= 0.15 && totalSubmitted >= 5) {
    insights.push({
      type: 'positive',
      icon: '🎯',
      title: `Strong ${Math.round(responseRate * 100)}% response rate`,
      body: `Your applications are resonating! Keep tailoring each one to the job description.`,
      cta: null,
    });
  }

  if (peakDay && peakDay === today && insights.length < 3) {
    insights.push({
      type: 'pattern',
      icon: '📅',
      title: "Today's your peak application day",
      body: `You're most productive on ${peakDay}s. Make the most of it!`,
      cta: null,
    });
  }

  if (interviewJobs.length > 0 && offerJobs.length === 0 && insights.length < 3) {
    insights.push({
      type: 'coaching',
      icon: '🎤',
      title: `${interviewJobs.length} interview${interviewJobs.length > 1 ? 's' : ''} coming up`,
      body: `Prepare thoroughly: research the company, practice STAR method, and prepare questions.`,
      cta: null,
    });
  }

  return insights.slice(0, 3);
};
