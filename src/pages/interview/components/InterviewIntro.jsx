import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import { motion } from 'framer-motion';

const DIFFICULTY_COLORS = {
  easy: { bgcolor: 'var(--success-bg)', color: 'var(--success-dark)' },
  medium: { bgcolor: 'var(--warning-bg)', color: 'var(--warning-dark)' },
  hard: { bgcolor: 'var(--error-bg)', color: 'var(--error-dark)' },
};

const TIPS = [
  { icon: RecordVoiceOverRoundedIcon, text: 'AI interviewer reads each question in a natural voice' },
  { icon: MicRoundedIcon, text: 'Speak your answer — auto-transcribed via Sarvam AI' },
  { icon: PsychologyRoundedIcon, text: 'Pause for 5 seconds when done — the interview moves on automatically' },
];

export default function InterviewIntro({ meta, starting, onStart }) {
  const interview = meta?.interview || meta || {};
  const difficulty = String(interview.difficulty || 'medium').toLowerCase();
  const diffStyle = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.medium;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 24px 64px rgba(37, 99, 235, 0.12)',
          overflow: 'hidden',
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Box
          sx={{
            px: { xs: 3, sm: 4 },
            py: { xs: 4, sm: 5 },
            background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(14,165,233,0.04) 100%)',
            borderBottom: '1px solid rgba(15,23,42,0.06)',
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--primary)',
              mb: 1.5,
            }}
          >
            Live AI Interview
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 26, sm: 32 },
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            {interview.title || 'Your Interview Session'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              label={difficulty}
              size="small"
              sx={{ height: 26, fontWeight: 700, fontSize: 12, textTransform: 'capitalize', ...diffStyle }}
            />
            {meta?.user_email && (
              <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                {meta.user_email}
              </Typography>
            )}
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {(interview.summary || interview.description) && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-label)', mb: 1 }}>
                About this interview
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                {interview.summary || interview.description}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
            {TIPS.map(({ icon: Icon, text }) => (
              <Box
                key={text}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'var(--bg-light)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: 'var(--light-blue-bg-08)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={starting}
            onClick={onStart}
            startIcon={<PlayArrowRoundedIcon />}
            sx={{
              py: 1.75,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: 16,
              boxShadow: '0 12px 32px rgba(37, 99, 235, 0.28)',
              '&:hover': { boxShadow: '0 16px 40px rgba(37, 99, 235, 0.35)' },
            }}
          >
            {starting ? 'Preparing Questions…' : 'Start Interview'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
