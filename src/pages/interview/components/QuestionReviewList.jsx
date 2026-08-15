import { useCallback, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import FeedbackRoundedIcon from '@mui/icons-material/FeedbackRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import { getInterviewQuestionAnalysisAPI } from '../../../services/interviewService';
import { parseApiError } from '../../../utilities/apiErrorUtils';

function scoreColor(score) {
  const value = Number(score) || 0;
  if (value >= 75) return { color: 'var(--success-dark)', bgcolor: 'var(--success-bg)' };
  if (value >= 50) return { color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' };
  return { color: 'var(--warning-dark)', bgcolor: 'var(--warning-bg)' };
}

function ReviewField({ icon: Icon, label, value, accent }) {
  if (!value) return null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: accent ? 'var(--light-blue-bg-04)' : 'var(--bg-light)',
        border: '1px solid var(--border-color)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Icon sx={{ fontSize: 18, color: accent ? 'var(--primary)' : 'var(--text-muted)' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {value}
      </Typography>
    </Box>
  );
}

function QuestionSummaryItem({ summary, userId, interviewId, expanded, onToggle, analysisCache, onAnalysisLoaded }) {
  const order = summary.order;
  const question = summary.question || 'Question';
  const score = summary.score;
  const scoreStyle = score != null ? scoreColor(score) : null;

  const cacheKey = String(order);
  const cached = analysisCache[cacheKey];
  const loading = cached?.loading;
  const analysis = cached?.data;
  const loadError = cached?.error;

  const loadAnalysis = useCallback(async () => {
    if (!userId || order == null) return;
    if (cached?.data || cached?.loading) return;

    onAnalysisLoaded(cacheKey, { loading: true });

    try {
      const params = { order };
      if (interviewId != null && interviewId !== '') {
        params.interview_id = interviewId;
      }
      const res = await getInterviewQuestionAnalysisAPI(userId, params);
      onAnalysisLoaded(cacheKey, { loading: false, data: res?.data || null });
    } catch (err) {
      onAnalysisLoaded(cacheKey, {
        loading: false,
        error: parseApiError(err, 'Failed to load question analysis'),
      });
    }
  }, [userId, interviewId, order, cacheKey, cached?.data, cached?.loading, onAnalysisLoaded]);

  const handleToggle = (_, isExpanded) => {
    onToggle(isExpanded);
    if (isExpanded) {
      loadAnalysis();
    }
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleToggle}
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid var(--border-color)',
        borderRadius: '12px !important',
        mb: 1.5,
        overflow: 'hidden',
        '&:before': { display: 'none' },
        bgcolor: 'var(--bg-paper)',
        transition: 'box-shadow 0.2s',
        '&.Mui-expanded': {
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
          borderColor: 'rgba(37, 99, 235, 0.25)',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon sx={{ color: 'var(--primary)' }} />}
        sx={{
          px: 2,
          py: 1,
          minHeight: 56,
          '& .MuiAccordionSummary-content': { my: 1, alignItems: 'center', gap: 1.5 },
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            bgcolor: 'var(--light-blue-bg-08)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {order ?? '?'}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textAlign: 'left',
            }}
          >
            {question}
          </Typography>
          {!expanded && (
            <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 0.25, textAlign: 'left' }}>
              Score only — expand to analyze question-wise
            </Typography>
          )}
        </Box>
        {score != null && (
          <Chip
            label={`${Math.round(Number(score))}%`}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: 12,
              height: 28,
              flexShrink: 0,
              ...scoreStyle,
            }}
          />
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pb: 2.5, pt: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, gap: 1.5 }}>
            <CircularProgress size={32} sx={{ color: 'var(--primary)' }} />
            <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Analyzing question…
            </Typography>
          </Box>
        )}

        {loadError && !loading && (
          <Box>
            <Alert severity="error" sx={{ borderRadius: 2, mb: 1.5 }}>
              {loadError}
            </Alert>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AnalyticsRoundedIcon />}
              onClick={loadAnalysis}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Retry analysis
            </Button>
          </Box>
        )}

        {analysis && !loading && (
          <>
            <ReviewField icon={QuizRoundedIcon} label="Question Asked" value={analysis.question || question} accent />
            <ReviewField icon={RecordVoiceOverRoundedIcon} label="Your Answer" value={analysis.user_answer} />
            <ReviewField icon={LightbulbRoundedIcon} label="What You Said" value={analysis.what_you_said} accent />
            <ReviewField icon={TipsAndUpdatesRoundedIcon} label="How to Answer" value={analysis.how_to_answer} accent />
            <ReviewField icon={FeedbackRoundedIcon} label="Feedback" value={analysis.feedback} />

            {(analysis.score ?? score) != null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 0.5 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={100} size={44} thickness={5} sx={{ color: 'var(--grey-4)' }} />
                  <CircularProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, Number(analysis.score ?? score)))}
                    size={44}
                    thickness={5}
                    sx={{ color: scoreColor(analysis.score ?? score).color, position: 'absolute', left: 0 }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      color: scoreColor(analysis.score ?? score).color,
                    }}
                  >
                    {Math.round(Number(analysis.score ?? score))}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Question score
                </Typography>
              </Box>
            )}
          </>
        )}

        {!loading && !analysis && !loadError && (
          <Button
            variant="contained"
            disableElevation
            startIcon={<AnalyticsRoundedIcon />}
            onClick={loadAnalysis}
            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Analyze question-wise
          </Button>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

/** Normalize question_summaries from submit/performance (list-only fields). */
export function normalizeQuestionSummaries(report) {
  const raw = report?.question_summaries || report?.question_reviews || report?.questionReviews || [];

  if (!Array.isArray(raw)) return [];

  return raw.map((item, index) => ({
    order: item.order ?? item.question_order ?? index + 1,
    question: item.question || item.question_text || '',
    score: item.score ?? item.question_score,
  }));
}

export default function QuestionReviewList({
  summaries = [],
  userId,
  interviewId,
  averageScore,
}) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [analysisCache, setAnalysisCache] = useState({});

  const handleAnalysisLoaded = useCallback((key, patch) => {
    setAnalysisCache((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  }, []);

  if (!summaries.length) return null;

  const computedAvg =
    averageScore ??
    summaries.reduce((sum, s) => sum + (Number(s.score) || 0), 0) / summaries.length;

  return (
    <Box sx={{ textAlign: 'left', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
          Question-by-Question Review
        </Typography>
        <Chip
          label={`${summaries.length} question${summaries.length === 1 ? '' : 's'}`}
          size="small"
          sx={{ fontWeight: 700, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' }}
        />
      </Box>
      <Typography sx={{ fontSize: 13, color: 'var(--text-muted)', mb: 2 }}>
        Each question shows its score only. Expand or click <strong>Analyze question-wise</strong> to load your answer and detailed feedback.
        {Number.isFinite(computedAvg) && computedAvg > 0 && (
          <> Average question score: <strong>{Math.round(computedAvg)}%</strong>.</>
        )}
      </Typography>

      {summaries.map((summary) => (
        <QuestionSummaryItem
          key={summary.order}
          summary={summary}
          userId={userId}
          interviewId={interviewId}
          expanded={expandedOrder === summary.order}
          onToggle={(isExpanded) => setExpandedOrder(isExpanded ? summary.order : null)}
          analysisCache={analysisCache}
          onAnalysisLoaded={handleAnalysisLoaded}
        />
      ))}
    </Box>
  );
}
