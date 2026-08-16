import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AnswerAudioPlayer from '../../interview/AnswerAudioPlayer';

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

function buildAnswerAudioMap(answers) {
  const map = {};
  (answers || []).forEach((item, index) => {
    const order = item.order ?? index + 1;
    if (item.has_audio || item.audio_key) {
      map[order] = item;
    }
  });
  return map;
}

export default function AssigneeResultPanel({ assignee, interviewId }) {
  const report = assignee.report;
  const reviews = assignee.question_reviews || [];
  const answers = assignee.answers || [];
  const audioByOrder = buildAnswerAudioMap(answers);

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
        user_answer: review.user_answer || audioByOrder[review.order]?.answer,
        has_audio: review.has_audio || Boolean(audioByOrder[review.order]?.has_audio || audioByOrder[review.order]?.audio_key),
      }))
    : answers.map((a, i) => ({
        order: a.order ?? i + 1,
        question: a.question,
        user_answer: a.answer,
        has_audio: a.has_audio || Boolean(a.audio_key),
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Overall score</Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              {report.score ?? report.overall_score ?? '—'}%
            </Typography>
          </Box>
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
        const hasAudio = item.has_audio || Boolean(audioByOrder[order]?.has_audio || audioByOrder[order]?.audio_key);
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
                {item.score != null && (
                  <Chip label={`${item.score}%`} size="small" sx={{ ml: 'auto', mr: 1, height: 20, fontSize: 10, fontWeight: 700 }} />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0, bgcolor: 'rgba(248,250,252,0.8)' }}>
              {hasAudio && (
                <Box sx={{ mb: 1.5 }}>
                  <AnswerAudioPlayer
                    userId={assignee.user_id}
                    interviewId={interviewId}
                    order={order}
                    hasAudio={hasAudio}
                    label="Listen to candidate recording"
                  />
                </Box>
              )}
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', mb: 0.5 }}>Candidate answer</Typography>
              <Typography sx={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', mb: 1.5 }}>
                {userAnswer || '—'}
              </Typography>
              {item.how_to_answer && (
                <>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', mb: 0.5 }}>Coaching tip</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, mb: 1 }}>{item.how_to_answer}</Typography>
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
