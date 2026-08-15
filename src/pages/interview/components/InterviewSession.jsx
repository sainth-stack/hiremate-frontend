import { useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterviewSessionStore } from '../../../store/interview/useInterviewSessionStore';
import { speakQuestion, stopSpeaking } from '../../../utilities/cartesiaTts';

export default function InterviewSession({ onSubmit }) {
  const {
    questions,
    currentQuestionIndex,
    currentTranscript,
    isSpeaking,
    setSpeaking,
    saveAnswer,
    goToNextQuestion,
    setCurrentTranscript,
    submitting,
  } = useInterviewSessionStore();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const spokenIndexRef = useRef(-1);
  const currentQuestion = questions[currentQuestionIndex];
  const total = questions.length;
  const isLast = currentQuestionIndex >= total - 1;
  const progress = total ? ((currentQuestionIndex + 1) / total) * 100 : 0;

  const questionText = currentQuestion?.question_text || currentQuestion?.question || '';

  const askQuestion = useCallback(async (text) => {
    await speakQuestion(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, [setSpeaking]);

  useEffect(() => {
    if (!questionText || spokenIndexRef.current === currentQuestionIndex) return;
    spokenIndexRef.current = currentQuestionIndex;
    resetTranscript();
    setCurrentTranscript('');
    askQuestion(questionText);
  }, [currentQuestionIndex, questionText, askQuestion, resetTranscript, setCurrentTranscript]);

  useEffect(() => {
    if (listening) {
      setCurrentTranscript(transcript);
    }
  }, [transcript, listening, setCurrentTranscript]);

  useEffect(() => () => {
    stopSpeaking();
    SpeechRecognition.stopListening();
  }, []);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
  };

  const handleReplay = () => {
    askQuestion(questionText);
  };

  const handleNext = () => {
    const answer = currentTranscript.trim();
    if (!answer) return;

    SpeechRecognition.stopListening();
    stopSpeaking();
    saveAnswer(answer);
    resetTranscript();

    if (isLast) {
      onSubmit();
      return;
    }

    goToNextQuestion();
  };

  const canProceed = currentTranscript.trim().length > 0 && !isSpeaking && !submitting;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: 2,
          bgcolor: 'rgba(255,255,255,0.9)',
          borderBottom: '1px solid rgba(15,23,42,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
            Question {currentQuestionIndex + 1} of {total}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {questions.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: i === currentQuestionIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: i < currentQuestionIndex ? 'var(--success)' : i === currentQuestionIndex ? 'var(--primary)' : 'var(--grey-4)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'var(--grey-4)',
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'var(--primary)' },
          }}
        />
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 },
          py: 4,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            style={{ width: '100%', maxWidth: 720 }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 20px 60px rgba(37, 99, 235, 0.1)',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {currentQuestion?.category && (
                  <Chip label={currentQuestion.category} size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
                )}
                {currentQuestion?.complexity && (
                  <Chip
                    label={currentQuestion.complexity}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: 11 }}
                  />
                )}
                {isSpeaking && (
                  <Chip
                    icon={<VolumeUpRoundedIcon sx={{ fontSize: '16px !important' }} />}
                    label="AI Speaking"
                    size="small"
                    sx={{
                      ml: 'auto',
                      bgcolor: 'var(--light-blue-bg-08)',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      animation: 'pulse 1.5s infinite',
                      '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.65 } },
                    }}
                  />
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: 18, sm: 22 },
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                  letterSpacing: '-0.02em',
                }}
              >
                {questionText}
              </Typography>

              {currentQuestion?.overview && (
                <Typography sx={{ mt: 2, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {currentQuestion.overview}
                </Typography>
              )}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton size="small" onClick={handleReplay} disabled={isSpeaking} title="Replay question">
                  <ReplayRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Answer area */}
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.85)',
                border: listening ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                boxShadow: listening ? '0 0 0 4px rgba(37,99,235,0.12)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Your Answer
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={4}
                maxRows={10}
                placeholder={browserSupportsSpeechRecognition ? 'Tap the mic and speak, or type here…' : 'Type your answer here…'}
                value={currentTranscript}
                onChange={(e) => {
                  resetTranscript();
                  SpeechRecognition.stopListening();
                  setCurrentTranscript(e.target.value);
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'var(--bg-light)',
                    fontSize: 14,
                  },
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                {browserSupportsSpeechRecognition ? (
                  <Button
                    variant={listening ? 'contained' : 'outlined'}
                    color={listening ? 'error' : 'primary'}
                    onClick={toggleListening}
                    disabled={isSpeaking || submitting}
                    startIcon={listening ? <MicOffRoundedIcon /> : <MicRoundedIcon />}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    {listening ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                ) : (
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                    Speech recognition not supported — type your answer
                  </Typography>
                )}

                <Button
                  variant="contained"
                  disabled={!canProceed}
                  onClick={handleNext}
                  endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : (isLast ? <SendRoundedIcon /> : <ArrowForwardRoundedIcon />)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: 2,
                    px: 3,
                    boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                  }}
                >
                  {submitting ? 'Submitting…' : isLast ? 'Submit Interview' : 'Next Question'}
                </Button>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
