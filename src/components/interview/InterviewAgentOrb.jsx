import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const ORB_SIZE = 148;

function orbGradient(phase) {
  if (phase === 'ai_speaking') {
    return 'radial-gradient(circle at 32% 28%, #dbeafe 0%, #60a5fa 34%, #2563eb 62%, #1e3a8a 100%)';
  }
  if (phase === 'processing') {
    return 'radial-gradient(circle at 32% 28%, #e0e7ff 0%, #818cf8 38%, #6366f1 68%, #4338ca 100%)';
  }
  if (phase === 'listening') {
    return 'radial-gradient(circle at 32% 28%, #eff6ff 0%, #93c5fd 36%, #3b82f6 64%, #1d4ed8 100%)';
  }
  return 'radial-gradient(circle at 32% 28%, #f8fafc 0%, #bfdbfe 38%, #60a5fa 68%, #2563eb 100%)';
}

export default function InterviewAgentOrb({
  phase = 'idle',
  voiceLabel = 'AI Interviewer',
  inputLevel = 0,
  silenceCountdown = null,
  isRecording = false,
  subtitle = null,
  silenceSubmitSeconds = 10,
  pauseCountdown = null,
  phaseOverride = null,
}) {
  const displayPhase = phaseOverride || phase;
  const isSpeaking = displayPhase === 'ai_speaking';
  const isListening = displayPhase === 'listening' && isRecording;
  const isPaused = displayPhase === 'paused';
  const pulseScale = isSpeaking ? 1.04 : 1;
  const glowOpacity = isSpeaking
    ? 0.55
    : isListening
      ? 0.32 + Math.min(inputLevel * 0.15, 0.12)
      : isPaused
        ? 0.2
        : 0.28;
  const totalSilenceSeconds = Math.max(1, Number(silenceSubmitSeconds) || 10);
  const ringProgress = silenceCountdown != null
    ? (totalSilenceSeconds - silenceCountdown) / totalSilenceSeconds
    : 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 3,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: ORB_SIZE + 56,
          height: ORB_SIZE + 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {silenceCountdown != null && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              opacity: 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            <svg width={ORB_SIZE + 56} height={ORB_SIZE + 56} viewBox="0 0 204 204">
              <circle
                cx="102"
                cy="102"
                r="96"
                fill="none"
                stroke="rgba(37,99,235,0.12)"
                strokeWidth="4"
              />
              <circle
                cx="102"
                cy="102"
                r="96"
                fill="none"
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 96}`}
                strokeDashoffset={`${2 * Math.PI * 96 * (1 - ringProgress)}`}
                transform="rotate(-90 102 102)"
              />
            </svg>
          </Box>
        )}

        <motion.div
          animate={{
            scale: pulseScale,
            opacity: 1,
          }}
          transition={{
            type: 'tween',
            duration: isSpeaking ? 0.45 : 0.2,
            ease: 'easeOut',
          }}
          style={{
            width: ORB_SIZE,
            height: ORB_SIZE,
            borderRadius: '50%',
            position: 'relative',
            background: orbGradient(displayPhase),
            boxShadow: `0 0 ${28 + glowOpacity * 40}px rgba(37, 99, 235, ${glowOpacity}), inset 0 -12px 24px rgba(15, 23, 42, 0.18), inset 0 16px 28px rgba(255,255,255,0.35)`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: '18%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.08) 45%, transparent 70%)',
            }}
          />
          {phase === 'processing' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: 'rgba(255,255,255,0.75)',
                borderRightColor: 'rgba(255,255,255,0.25)',
              }}
            />
          )}
        </motion.div>

        {isSpeaking && (
          <>
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.12, 0.35] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: ORB_SIZE + 36,
                height: ORB_SIZE + 36,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, rgba(59,130,246,0) 70%)',
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.28, 1], opacity: [0.22, 0.06, 0.22] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.3 }}
              style={{
                position: 'absolute',
                width: ORB_SIZE + 56,
                height: ORB_SIZE + 56,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, rgba(96,165,250,0) 72%)',
              }}
            />
          </>
        )}
      </Box>

      <Typography sx={{ mt: 1.5, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
        {voiceLabel}
      </Typography>

      <Box
        sx={{
          mt: 0.5,
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          textAlign: 'center',
        }}
      >
        {silenceCountdown != null ? (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Submitting in {silenceCountdown}s — tap Keep speaking to add more
          </Typography>
        ) : pauseCountdown != null ? (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--warning-dark)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Paused — resuming in {pauseCountdown}s
          </Typography>
        ) : subtitle ? (
          <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {subtitle}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {displayPhase === 'ai_speaking' && 'AI is asking the question'}
            {displayPhase === 'listening' && isRecording && `Speak clearly — stay quiet for ${totalSilenceSeconds}s when done`}
            {displayPhase === 'paused' && 'Take a moment — recording will resume automatically'}
            {displayPhase === 'processing' && 'Submitting your answer…'}
            {displayPhase === 'ready' && 'Review your answer, then continue'}
            {displayPhase === 'idle' && 'Preparing your interview…'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
