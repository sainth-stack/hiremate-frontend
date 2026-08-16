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
  LinearProgress,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import FeedbackRoundedIcon from '@mui/icons-material/FeedbackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import { getInterviewQuestionAnalysisAPI } from '../../../services/interviewService';
import { parseApiError } from '../../../utilities/apiErrorUtils';
import { DIMENSION_LABELS, scoreValueStyles } from '../../../utilities/interviewReportUtils';
import AnswerAudioPlayer from '../../../components/interview/AnswerAudioPlayer';

function scoreChipStyle(score) {
  const value = Number(score) || 0;
  if (value >= 75) return { color: 'var(--success-dark)', bgcolor: 'var(--success-bg)' };
  if (value >= 60) return { color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' };
  if (value >= 40) return { color: 'var(--warning-dark)', bgcolor: 'var(--warning-bg)' };
  return { color: '#991b1b', bgcolor: '#fee2e2' };
}

function ReviewField({ icon: Icon, label, value, accent = false }) {
  if (!value) return null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: accent ? 'var(--light-blue-bg-04)' : '#fff',
        border: '1px solid rgba(226,232,240,0.95)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {Icon && <Icon sx={{ fontSize: 18, color: accent ? 'var(--primary)' : 'var(--text-muted)' }} />}
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

function DimensionScores({ dimensions }) {
  if (!dimensions || typeof dimensions !== 'object') return null;
  const entries = Object.entries(dimensions).filter(([, value]) => value != null);
  if (!entries.length) return null;

  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', border: '1px solid rgba(226,232,240,0.95)' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
        Evaluation Dimensions
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {entries.map(([key, value]) => {
          const score = Math.max(0, Math.min(100, Number(value) || 0));
          return (
            <Box key={key}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {DIMENSION_LABELS[key] || key.replace(/_/g, ' ')}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 800, ...scoreValueStyles(score) }}>
                  {score}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={score}
                sx={{ height: 6, borderRadius: 999, bgcolor: 'var(--grey-4)' }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function QuestionSummaryItem({ summary, userId, interviewId, expanded, onToggle, analysisCache, onAnalysisLoaded }) {
  const order = summary.order;
  const question = summary.question || 'Question';
  const score = summary.score;
  const scoreStyle = score != null ? scoreChipStyle(score) : null;

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

  const displayScore = analysis?.score ?? score;

  return (
    <Accordion
      expanded={expanded}
      onChange={handleToggle}
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid rgba(226,232,240,0.95)',
        borderRadius: '12px !important',
        mb: 1.5,
        overflow: 'hidden',
        bgcolor: '#fff',
        '&:before': { display: 'none' },
        '&.Mui-expanded': {
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.06)',
          borderColor: 'rgba(37, 99, 235, 0.2)',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon sx={{ color: 'var(--primary)' }} />}
        aria-controls={`question-panel-${order}`}
        id={`question-header-${order}`}
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
          Q{order ?? '?'}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--text-primary)',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: expanded ? 'unset' : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textAlign: 'left',
            }}
          >
            {question}
          </Typography>
          {!expanded && summary.category && (
            <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 0.25, textAlign: 'left' }}>
              {summary.category}
            </Typography>
          )}
        </Box>
        {displayScore != null && (
          <Chip
            label={`${Math.round(Number(displayScore))}/100`}
            size="small"
            sx={{ fontWeight: 800, fontSize: 12, height: 28, flexShrink: 0, ...scoreStyle }}
          />
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pb: 2.5, pt: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, gap: 1.5 }}>
            <CircularProgress size={32} sx={{ color: 'var(--primary)' }} />
            <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Loading analysis…
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
            <ReviewField icon={QuizRoundedIcon} label="Question" value={analysis.question || question} accent />
            <ReviewField icon={RecordVoiceOverRoundedIcon} label="Your Answer" value={analysis.user_answer} />
            {analysis.has_audio && (
              <AnswerAudioPlayer
                userId={userId}
                interviewId={interviewId}
                order={order}
                hasAudio={analysis.has_audio}
                label="Play your recorded answer"
              />
            )}

            {displayScore != null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Score:
                </Typography>
                <Chip
                  label={`${Math.round(Number(displayScore))}/100`}
                  size="small"
                  sx={{ fontWeight: 800, ...scoreChipStyle(displayScore) }}
                />
              </Box>
            )}

            <ReviewField
              icon={CheckCircleOutlineRoundedIcon}
              label="What You Did Well"
              value={analysis.what_went_well || analysis.what_you_said}
              accent
            />
            <ReviewField
              icon={HighlightOffRoundedIcon}
              label="What Was Missing"
              value={analysis.what_was_missing}
            />
            <ReviewField
              icon={TipsAndUpdatesRoundedIcon}
              label="Expected / Better Answer"
              value={analysis.better_answer || analysis.how_to_answer}
              accent
            />
            <ReviewField icon={FeedbackRoundedIcon} label="AI Feedback" value={analysis.feedback} />
            <ReviewField
              icon={AnalyticsRoundedIcon}
              label="Recommended Improvement"
              value={analysis.recommended_improvement}
            />
            <DimensionScores dimensions={analysis.dimensions} />
          </>
        )}

        {!loading && !analysis && !loadError && (
          <Button
            variant="contained"
            disableElevation
            startIcon={<AnalyticsRoundedIcon />}
            onClick={loadAnalysis}
            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
          >
            View Analysis
          </Button>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export function normalizeQuestionSummaries(report) {
  const raw = report?.question_summaries || report?.question_reviews || report?.questionReviews || [];

  if (!Array.isArray(raw)) return [];

  return raw.map((item, index) => ({
    order: item.order ?? item.question_order ?? index + 1,
    question: item.question || item.question_text || '',
    score: item.score ?? item.question_score,
    category: item.category,
    question_type: item.question_type,
  }));
}

export default function QuestionReviewList({
  summaries = [],
  userId,
  interviewId,
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

  return (
    <Box sx={{ textAlign: 'left', mb: 2.5 }}>
      <Typography sx={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', mb: 0.75 }}>
        Question-by-Question Review
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'var(--text-muted)', mb: 2 }}>
        Expand any question to review your answer, score breakdown, and personalized feedback.
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
