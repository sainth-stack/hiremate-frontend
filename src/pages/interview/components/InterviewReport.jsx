import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuestionReviewList, { normalizeQuestionSummaries } from './QuestionReviewList';
import InterviewReportSkeleton from './InterviewReportSkeleton';
import {
  getOverallScore,
  getScoreStatus,
  normalizeReportLists,
  scoreStatusStyles,
  scoreValueStyles,
} from '../../../utilities/interviewReportUtils';

function ScoreDisplay({ score, status }) {
  const value = getOverallScore({ score });
  const statusLabel = status || getScoreStatus({ score: value });
  const statusStyle = scoreStatusStyles(statusLabel);
  const valueStyle = scoreValueStyles(value);

  return (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <Typography
        sx={{
          fontSize: { xs: 56, sm: 64 },
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          ...valueStyle,
        }}
      >
        {value}
        <Typography component="span" sx={{ fontSize: 24, fontWeight: 700, color: 'var(--text-muted)', ml: 0.5 }}>
          / 100
        </Typography>
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', mt: 0.75, mb: 1.5 }}>
        Overall Score
      </Typography>
      <Chip
        label={statusLabel}
        sx={{
          fontWeight: 800,
          fontSize: 12,
          height: 30,
          ...statusStyle,
        }}
      />
    </Box>
  );
}

function ReportSection({ title, children, icon: Icon }) {
  return (
    <Box
      sx={{
        textAlign: 'left',
        mb: 2.5,
        p: 2.5,
        borderRadius: 2.5,
        bgcolor: '#fff',
        border: '1px solid rgba(226,232,240,0.95)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        {Icon && <Icon sx={{ fontSize: 20, color: 'var(--primary)' }} />}
        <Typography sx={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function CategoryBreakdown({ categories }) {
  if (!categories?.length) return null;

  return (
    <ReportSection title="Score Breakdown" icon={TrendingUpRoundedIcon}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {categories.map((item) => {
          const score = Math.max(0, Math.min(100, Number(item.score) || 0));
          return (
            <Box key={item.name}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75, gap: 2 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.name}
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 800, ...scoreValueStyles(score) }}>
                  {score}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={score}
                aria-label={`${item.name} score ${score} out of 100`}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: 'var(--grey-4)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    bgcolor: score >= 75 ? 'var(--success)' : score >= 60 ? 'var(--primary)' : score >= 40 ? '#f59e0b' : '#ef4444',
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </ReportSection>
  );
}

function BulletList({ items, variant = 'neutral' }) {
  if (!items?.length) return null;

  const icon = variant === 'success'
    ? <CheckRoundedIcon sx={{ fontSize: 18, color: 'var(--success)', mt: 0.2, flexShrink: 0 }} />
    : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          {icon || (
            <Typography sx={{ color: 'var(--text-muted)', fontWeight: 800, lineHeight: 1.6, flexShrink: 0 }}>
              •
            </Typography>
          )}
          <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {item}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function InterviewReport({
  report,
  interviewTitle,
  userId,
  interviewId,
  onRetest,
  retesting = false,
  isRecruiterView = false,
}) {
  const score = getOverallScore(report);
  const status = getScoreStatus(report);
  const {
    strengths,
    improvements,
    recommendations,
    categories,
    summary,
  } = normalizeReportLists(report);
  const questionSummaries = normalizeQuestionSummaries(report);
  const hiring = report?.hiring_recommendation;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 24px 64px rgba(37, 99, 235, 0.08)',
          overflow: 'hidden',
          bgcolor: 'rgba(255,255,255,0.98)',
          maxWidth: 860,
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            px: 3,
            py: { xs: 4, sm: 5 },
            background: 'linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(239,246,255,0.85) 100%)',
            borderBottom: '1px solid rgba(15,23,42,0.06)',
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 52, color: 'var(--success)', mb: 1 }} />
          <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 900, color: 'var(--text-primary)', mb: 1 }}>
            Interview Complete
          </Typography>
          <Typography sx={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, maxWidth: 620, mx: 'auto' }}>
            Your interview has been evaluated across technical knowledge, problem-solving, practical understanding, and communication.
            {interviewTitle ? ` "${interviewTitle}"` : ''}
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: '#f8fafc' }}>
          <ScoreDisplay score={score} status={status} />

          {report?.score_calculation_note && (
            <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', mb: 2.5 }}>
              {report.score_calculation_note}
            </Typography>
          )}

          {isRecruiterView && hiring?.recommendation && (
            <ReportSection title="AI Hiring Recommendation">
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Chip label={hiring.recommendation} sx={{ fontWeight: 800, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' }} />
                {hiring.confidence != null && (
                  <Chip label={`Confidence: ${hiring.confidence}%`} variant="outlined" sx={{ fontWeight: 700 }} />
                )}
              </Box>
              <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {hiring.reason}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', mt: 1.5 }}>
                AI recommendation for recruiter review — not an automated hiring decision.
              </Typography>
            </ReportSection>
          )}

          <CategoryBreakdown categories={categories} />

          {summary && (
            <ReportSection title="AI Evaluation Summary" icon={TrendingUpRoundedIcon}>
              <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                {summary}
              </Typography>
            </ReportSection>
          )}

          {strengths.length > 0 && (
            <ReportSection title="Your Strengths">
              <BulletList items={strengths.slice(0, 5)} variant="success" />
            </ReportSection>
          )}

          {improvements.length > 0 && (
            <ReportSection title="Areas to Improve">
              <BulletList items={improvements.slice(0, 5)} />
            </ReportSection>
          )}

          <QuestionReviewList
            summaries={questionSummaries}
            userId={userId ?? report?.user_id}
            interviewId={interviewId ?? report?.interview_id}
          />

          {recommendations.length > 0 && (
            <ReportSection title="Recommended Next Steps" icon={SchoolRoundedIcon}>
              <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 1.5 }}>
                Based on this interview, focus on:
              </Typography>
              <BulletList items={recommendations.slice(0, 5)} />
              <Button
                component={RouterLink}
                to="/interview-practice"
                variant="outlined"
                sx={{ mt: 2, textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
              >
                Practice Weak Areas
              </Button>
            </ReportSection>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1, pt: 1 }}>
            {onRetest && (
              <Button
                variant="outlined"
                startIcon={retesting ? null : <RefreshRoundedIcon />}
                onClick={onRetest}
                disabled={retesting}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, px: 3 }}
              >
                {retesting ? 'Resetting…' : 'Retake Interview'}
              </Button>
            )}
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              disableElevation
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 999, px: 4 }}
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
    <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
      <Box sx={{ maxWidth: 860, mx: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '4px solid rgba(37,99,235,0.15)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 1s linear infinite',
              mx: 'auto',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', mb: 1 }}>
          Evaluating your interview…
        </Typography>
        <Typography sx={{ color: 'var(--text-secondary)', maxWidth: 460, mx: 'auto', lineHeight: 1.7, mb: 4 }}>
          We are analyzing your answers and preparing personalized feedback.
        </Typography>
        <InterviewReportSkeleton />
      </Box>
    </Box>
  );
}

export function InterviewReportError({ onRetry, onDashboard }) {
  return (
    <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', mb: 1 }}>
        We couldn&apos;t generate your interview report
      </Typography>
      <Typography sx={{ color: 'var(--text-secondary)', maxWidth: 460, mx: 'auto', lineHeight: 1.7, mb: 3 }}>
        Your interview responses are safe. Please try again.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onRetry && (
          <Button variant="contained" onClick={onRetry} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}>
            Retry Evaluation
          </Button>
        )}
        <Button
          component={RouterLink}
          to="/"
          variant="outlined"
          onClick={onDashboard}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
}
