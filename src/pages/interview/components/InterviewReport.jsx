import { Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuestionReviewList, { normalizeQuestionSummaries } from './QuestionReviewList';

function ScoreRing({ score }) {
  const value = Math.min(100, Math.max(0, Number(score) || 0));
  const color = value >= 75 ? 'var(--success)' : value >= 50 ? 'var(--primary)' : 'var(--warning)';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
      <CircularProgress variant="determinate" value={100} size={120} thickness={4} sx={{ color: 'var(--grey-4)' }} />
      <CircularProgress
        variant="determinate"
        value={value}
        size={120}
        thickness={4}
        sx={{ color, position: 'absolute', left: 0 }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}%
        </Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Score
        </Typography>
      </Box>
    </Box>
  );
}

export default function InterviewReport({ report, interviewTitle, userId, interviewId, onRetest, retesting = false }) {
  const score = report?.score ?? report?.overall_score ?? report?.final_score;
  const briefSummary = report?.summary || report?.feedback;
  const detailedSummary = report?.evaluation_summary;
  const summary = detailedSummary || briefSummary || report?.evaluation;
  const strengths = report?.strengths || report?.strengths_list || [];
  const improvements = report?.improvements || report?.areas_for_improvement || report?.weaknesses || [];
  const questionSummaries = normalizeQuestionSummaries(report);
  const averageQuestionScore = report?.average_question_score;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 24px 64px rgba(37, 99, 235, 0.12)',
          overflow: 'hidden',
          bgcolor: 'rgba(255,255,255,0.95)',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            px: 3,
            py: 5,
            background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(37,99,235,0.06) 100%)',
            borderBottom: '1px solid rgba(15,23,42,0.06)',
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 56, color: 'var(--success)', mb: 1 }} />
          <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 900, color: 'var(--text-primary)', mb: 0.5 }}>
            Interview Complete
          </Typography>
          <Typography sx={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {interviewTitle ? `"${interviewTitle}" — ` : ''}Your responses have been evaluated.
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          {score != null && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ScoreRing score={score} />
            </Box>
          )}

          {summary && (
            <Box sx={{ textAlign: 'left', mb: 3, p: 2.5, borderRadius: 2, bgcolor: 'var(--bg-light)', border: '1px solid var(--border-color)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <EmojiEventsRoundedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                  {detailedSummary ? 'Evaluation Summary' : 'Summary'}
                </Typography>
              </Box>
              {briefSummary && detailedSummary && briefSummary !== detailedSummary && (
                <Typography sx={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.75, whiteSpace: 'pre-wrap', mb: 1.5, fontWeight: 600 }}>
                  {typeof briefSummary === 'string' ? briefSummary : JSON.stringify(briefSummary, null, 2)}
                </Typography>
              )}
              <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                {typeof summary === 'string' ? summary : JSON.stringify(summary, null, 2)}
              </Typography>
            </Box>
          )}

          {strengths.length > 0 && (
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: 'var(--success-dark)', mb: 1 }}>
                Strengths
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {strengths.map((item, i) => (
                  <Typography component="li" key={i} sx={{ fontSize: 14, color: 'var(--text-secondary)', mb: 0.5 }}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {improvements.length > 0 && (
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: 'var(--warning-dark)', mb: 1 }}>
                Areas to Improve
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {improvements.map((item, i) => (
                  <Typography component="li" key={i} sx={{ fontSize: 14, color: 'var(--text-secondary)', mb: 0.5 }}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          <QuestionReviewList
            summaries={questionSummaries}
            userId={userId ?? report?.user_id}
            interviewId={interviewId ?? report?.interview_id}
            averageScore={averageQuestionScore}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
            {onRetest && (
              <Button
                variant="outlined"
                startIcon={retesting ? <CircularProgress size={16} /> : <RefreshRoundedIcon />}
                onClick={onRetest}
                disabled={retesting}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
              >
                {retesting ? 'Resetting…' : 'Retake interview'}
              </Button>
            )}
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              disableElevation
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function InterviewSubmitting() {
  return (
    <Box sx={{ textAlign: 'center', py: 12 }}>
      <CircularProgress size={48} sx={{ color: 'var(--primary)', mb: 3 }} />
      <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', mb: 1 }}>
        Evaluating Your Interview
      </Typography>
      <Typography sx={{ color: 'var(--text-secondary)', maxWidth: 400, mx: 'auto' }}>
        LangGraph is analyzing all your answers together. This may take a moment…
      </Typography>
    </Box>
  );
}
