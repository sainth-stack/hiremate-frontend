export function getOverallScore(report) {
  const value = report?.score ?? report?.overall_score ?? report?.final_score;
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function computeScoreStatus(score) {
  const value = Number(score) || 0;
  if (value >= 90) return 'Excellent';
  if (value >= 75) return 'Strong';
  if (value >= 60) return 'Good';
  if (value >= 40) return 'Needs Improvement';
  return 'Requires Significant Improvement';
}

export function getScoreStatus(report) {
  return report?.score_status || computeScoreStatus(getOverallScore(report));
}

export function scoreStatusStyles(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('excellent')) {
    return { color: 'var(--success-dark)', bgcolor: 'var(--success-bg)' };
  }
  if (normalized.includes('strong')) {
    return { color: '#166534', bgcolor: '#dcfce7' };
  }
  if (normalized.includes('good')) {
    return { color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' };
  }
  if (normalized.includes('needs')) {
    return { color: 'var(--warning-dark)', bgcolor: 'var(--warning-bg)' };
  }
  return { color: '#991b1b', bgcolor: '#fee2e2' };
}

export function scoreValueStyles(score) {
  const value = Number(score) || 0;
  if (value >= 75) return { color: 'var(--success-dark)' };
  if (value >= 60) return { color: 'var(--primary)' };
  if (value >= 40) return { color: 'var(--warning-dark)' };
  return { color: '#b45309' };
}

export function normalizeReportLists(report) {
  return {
    strengths: report?.strengths || report?.strengths_list || [],
    improvements: report?.improvements || report?.areas_for_improvement || report?.weaknesses || [],
    recommendations: report?.recommendations || [],
    categories: report?.categories || [],
    summary: report?.evaluation_summary || report?.summary || report?.evaluation || report?.feedback || '',
    briefSummary: report?.summary || '',
  };
}

export const DIMENSION_LABELS = {
  technical_correctness: 'Technical Correctness',
  completeness: 'Completeness',
  depth: 'Depth',
  practical_understanding: 'Practical Understanding',
  problem_solving: 'Problem Solving',
  communication: 'Communication',
  structure: 'Structure',
  relevance: 'Relevance',
};
