import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AnswerMediaPlayer from '../../interview/AnswerMediaPlayer';
import { getOverallScore, getScoreStatus, scoreStatusStyles, scoreValueStyles } from '../../../utilities/interviewReportUtils';

export const STATUS_CONFIG = {
  pending: { label: 'Not started', color: 'var(--text-muted)', bgcolor: 'var(--grey-4)' },
  in_progress: { label: 'In progress', color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' },
  completed: { label: 'Completed', color: 'var(--success-dark)', bgcolor: 'var(--success-bg)' },
};

export function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ height: 22, fontWeight: 700, fontSize: 11, color: cfg.color, bgcolor: cfg.bgcolor, border: 'none' }}
    />
  );
}

function buildAnswerMediaMap(answers) {
  const map = {};
  (answers || []).forEach((item, index) => {
    const order = item.order ?? index + 1;
    if (item.has_audio || item.audio_key || item.has_video || item.video_key) {
      map[order] = item;
    }
  });
  return map;
}

export default function AssigneeResultPanel({ assignee, interviewId }) {
  const report = assignee.report;
  const reviews = assignee.question_reviews || [];
  const answers = assignee.answers || [];
  const mediaByOrder = buildAnswerMediaMap(answers);
  const overallScore = getOverallScore(report || {});
  const scoreStatus = getScoreStatus(report || {});
  const hiring = report?.hiring_recommendation;

  if (assignee.status === 'pending') {
    return (
      <Box
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
          borderRadius: '12px',
          bgcolor: 'var(--grey-4)',
          border: '1px dashed var(--border-color)',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.5 }}>
          Not started yet
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Invitation sent — waiting for the candidate to begin.
        </Typography>
      </Box>
    );
  }

  const items = reviews.length
    ? reviews.map((review) => ({
        ...review,
        user_answer: review.user_answer || mediaByOrder[review.order]?.answer,
        has_audio: review.has_audio || Boolean(mediaByOrder[review.order]?.has_audio || mediaByOrder[review.order]?.audio_key),
        has_video: review.has_video || Boolean(mediaByOrder[review.order]?.has_video || mediaByOrder[review.order]?.video_key),
      }))
    : answers.map((a, i) => ({
        order: a.order ?? i + 1,
        question: a.question,
        user_answer: a.answer,
        has_audio: a.has_audio || Boolean(a.audio_key),
        has_video: a.has_video || Boolean(a.video_key),
      }));

  if (assignee.status === 'in_progress' && !items.length) {
    return (
      <Box
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
          borderRadius: '12px',
          bgcolor: 'var(--grey-4)',
          border: '1px dashed var(--border-color)',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.5 }}>
          Interview in progress
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Answers will appear here as the candidate completes questions.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {report && assignee.status === 'completed' && (
        <Box sx={{ mb: 2.5, p: 2.5, borderRadius: '12px', bgcolor: 'var(--light-blue-bg-04)', border: '1px solid var(--border-color)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Overall score</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', ...scoreValueStyles(overallScore) }}>
                {overallScore}/100
              </Typography>
              <Chip label={scoreStatus} size="small" sx={{ fontWeight: 800, ...scoreStatusStyles(scoreStatus) }} />
            </Box>
          </Box>

          {hiring?.recommendation && (
            <Box sx={{ mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#fff', border: '1px solid var(--border-color)' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'var(--text-label)', textTransform: 'uppercase', mb: 0.75 }}>
                AI Hiring Recommendation
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
                <Chip label={hiring.recommendation} size="small" sx={{ fontWeight: 800, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' }} />
                {hiring.confidence != null && (
                  <Chip label={`Confidence: ${hiring.confidence}%`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                )}
              </Box>
              {hiring.reason && (
                <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {hiring.reason}
                </Typography>
              )}
            </Box>
          )}

          {report.categories?.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'var(--text-label)', textTransform: 'uppercase', mb: 1 }}>
                Category Scores
              </Typography>
              {report.categories.map((item) => (
                <Box key={item.name} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{item.score}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={item.score} sx={{ height: 6, borderRadius: 999 }} />
                </Box>
              ))}
            </Box>
          )}

          {(report.evaluation_summary || report.summary) && (
            <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, mb: 1.5 }}>
              {report.evaluation_summary || report.summary}
            </Typography>
          )}
          {report.strengths?.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--success-dark)', textTransform: 'uppercase', mb: 0.5 }}>
                Strengths
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                {report.strengths.map((s, i) => (
                  <Typography component="li" key={i} sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 0.25 }}>
                    {s}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
          {report.improvements?.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--warning-dark)', textTransform: 'uppercase', mb: 0.5 }}>
                Areas to improve
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                {report.improvements.map((s, i) => (
                  <Typography component="li" key={i} sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 0.25 }}>
                    {s}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.25 }}>
        Question-by-question transcript ({items.length})
      </Typography>

      {items.map((item, index) => {
        const order = item.order ?? index + 1;
        const question = item.question || `Question ${order}`;
        const userAnswer = item.user_answer || '';
        const hasAudio = item.has_audio || Boolean(mediaByOrder[order]?.has_audio || mediaByOrder[order]?.audio_key);
        const hasVideo = item.has_video || Boolean(mediaByOrder[order]?.has_video || mediaByOrder[order]?.video_key);
        return (
          <Accordion
            key={order}
            disableGutters
            elevation={0}
            defaultExpanded={index === 0}
            sx={{
              mb: 1,
              border: '1px solid var(--border-color)',
              borderRadius: '10px !important',
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ minHeight: 48, px: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>Q{order}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {question}
                </Typography>
                {hasAudio && (
                  <Chip label="Audio" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' }} />
                )}
                {hasVideo && (
                  <Chip label="Video" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: '#fef3c7', color: '#92400e' }} />
                )}
                {item.score != null && (
                  <Chip label={`${item.score}/100`} size="small" sx={{ ml: 'auto', mr: 1, height: 20, fontSize: 10, fontWeight: 700 }} />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0, bgcolor: 'rgba(248,250,252,0.8)' }}>
              {hasAudio && (
                <Box sx={{ mb: 1.5 }}>
                  <AnswerMediaPlayer
                    userId={assignee.user_id}
                    interviewId={interviewId}
                    order={order}
                    kind="audio"
                    hasMedia={hasAudio}
                    label="Listen to candidate voice"
                    compact
                  />
                </Box>
              )}
              {hasVideo && (
                <Box sx={{ mb: 1.5 }}>
                  <AnswerMediaPlayer
                    userId={assignee.user_id}
                    interviewId={interviewId}
                    order={order}
                    kind="video"
                    hasMedia={hasVideo}
                    label="Watch candidate video"
                  />
                </Box>
              )}
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', mb: 0.5 }}>Candidate answer</Typography>
              <Typography sx={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', mb: 1.5 }}>
                {userAnswer || '—'}
              </Typography>
              {item.what_went_well && (
                <>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--success-dark)', mb: 0.5 }}>What went well</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, mb: 1 }}>{item.what_went_well}</Typography>
                </>
              )}
              {item.what_was_missing && (
                <>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--warning-dark)', mb: 0.5 }}>What was missing</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, mb: 1 }}>{item.what_was_missing}</Typography>
                </>
              )}
              {(item.better_answer || item.how_to_answer) && (
                <>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', mb: 0.5 }}>Better answer</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, mb: 1 }}>
                    {item.better_answer || item.how_to_answer}
                  </Typography>
                </>
              )}
              {item.feedback && (
                <>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', mb: 0.5 }}>Feedback</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.feedback}</Typography>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
