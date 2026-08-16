import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useInterviewMicrophone } from '../../../hooks/useInterviewMicrophone';
import { useLiveSpeechRecognition } from '../../../hooks/useLiveSpeechRecognition';
import { useInterviewVoiceSession } from '../../../hooks/useInterviewVoiceSession';
import { useInterviewSessionStore } from '../../../store/interview/useInterviewSessionStore';
import { parseApiError } from '../../../utilities/apiErrorUtils';
import AnswerAudioPlayer from '../../../components/interview/AnswerAudioPlayer';
import InterviewAgentOrb from '../../../components/interview/InterviewAgentOrb';

const SESSION_LABELS = {
  ai_speaking: 'AI Speaking',
  listening: 'Your Turn',
  processing: 'Submitting answer…',
  ready: 'Answer Ready',
};

const SUBMITTING_PLACEHOLDER = 'Submitting your answer…';

export default function InterviewSession({ userId, interviewId, onSubmit }) {
  const {
    questions,
    currentQuestionIndex,
    answers,
    currentTranscript,
    isSpeaking,
    isProcessing,
    voiceConfig,
    setSpeaking,
    saveAnswer,
    goToNextQuestion,
    setCurrentTranscript,
    setProcessing,
    setRecording,
    setSessionPhase,
    submitting,
  } = useInterviewSessionStore();

  const spokenIndexRef = useRef(-1);
  const autoAdvanceRef = useRef(false);
  const isFinalizingRef = useRef(false);
  const finalizeRecordingRef = useRef(null);
  const handleNextRef = useRef(null);
  const liveTranscriptRef = useRef('');
  const [sessionPhase, setLocalSessionPhase] = useState('idle');

  const currentQuestion = questions[currentQuestionIndex];
  const total = questions.length;
  const isLast = currentQuestionIndex >= total - 1;
  const progress = total ? ((currentQuestionIndex + 1) / total) * 100 : 0;
  const questionText = currentQuestion?.question_text || currentQuestion?.question || '';
  const questionOrder = currentQuestion?.order ?? currentQuestionIndex + 1;
  const voiceLabel = voiceConfig?.voice_label || 'AI Interviewer';
  const sttLanguageCode = voiceConfig?.tts_language_code || 'en-IN';

  const {
    liveTranscript,
    startListening: startLiveListening,
    stopListening: stopLiveListening,
    resetTranscript: resetLiveTranscript,
  } = useLiveSpeechRecognition({
    languageCode: sttLanguageCode,
    enabled: true,
  });

  const handleSilenceRef = useRef(null);

  const {
    isRecording,
    inputLevel,
    silenceCountdown,
    startRecording,
    stopRecording,
    resetSilenceCountdown,
  } = useInterviewMicrophone({
    enabled: true,
    onSilence: () => handleSilenceRef.current?.(),
  });

  useEffect(() => {
    liveTranscriptRef.current = liveTranscript;
    if (isRecording && liveTranscript) {
      setCurrentTranscript(liveTranscript);
    }
  }, [isRecording, liveTranscript, setCurrentTranscript]);

  const beginAnswerCapture = useCallback(async () => {
    resetLiveTranscript();
    setCurrentTranscript('');
    await startRecording();
    startLiveListening();
    setRecording(true);
  }, [resetLiveTranscript, setCurrentTranscript, startRecording, startLiveListening, setRecording]);

  const handleSilence = useCallback(async () => {
    if (autoAdvanceRef.current || isFinalizingRef.current) return;
    autoAdvanceRef.current = true;
    await finalizeRecordingRef.current?.({ auto: true });
    autoAdvanceRef.current = false;
  }, []);

  handleSilenceRef.current = handleSilence;

  const { submitVoiceAnswer } = useInterviewVoiceSession({
    userId,
    interviewId,
    onProcessingChange: setProcessing,
    onError: (err) => toast.error(parseApiError(err, 'Voice processing failed')),
  });

  const askQuestion = useCallback(async (text) => {
    setLocalSessionPhase('ai_speaking');
    setSessionPhase('ai_speaking');
    setSpeaking(true);
    try {
      const response = await import('../../../services/interviewVoiceService').then((m) =>
        m.synthesizeInterviewQuestionAPI({
          user_id: userId,
          interview_id: Number(interviewId),
          question_order: questionOrder,
          text,
        })
      );
      const { playAudioBlob } = await import('../../../hooks/useInterviewMicrophone');
      await playAudioBlob(response.data);
    } catch (err) {
      toast.error(parseApiError(err, 'Failed to play question audio'));
    } finally {
      setSpeaking(false);
      setLocalSessionPhase('listening');
      setSessionPhase('listening');
      beginAnswerCapture().catch(() => {
        toast.error('Could not start microphone recording');
      });
    }
  }, [userId, interviewId, questionOrder, setSpeaking, setSessionPhase, beginAnswerCapture]);

  useEffect(() => {
    if (!questionText || spokenIndexRef.current === currentQuestionIndex) return;
    spokenIndexRef.current = currentQuestionIndex;

    const existingAnswer = useInterviewSessionStore.getState().answers.find(
      (item) => item.question_id === currentQuestion?.id
    );
    if (existingAnswer?.answer?.trim()) {
      setCurrentTranscript(existingAnswer.answer);
      setLocalSessionPhase('ready');
      setSessionPhase('ready');
      return;
    }

    setCurrentTranscript('');
    askQuestion(questionText);
  }, [currentQuestionIndex, questionText, askQuestion, setCurrentTranscript, currentQuestion?.id, setSessionPhase]);

  useEffect(() => {
    setRecording(isRecording);
  }, [isRecording, setRecording]);

  const finalizeRecording = async ({ auto = false } = {}) => {
    if (isFinalizingRef.current || isProcessing || isSpeaking) return;
    isFinalizingRef.current = true;
    stopLiveListening();
    setLocalSessionPhase('processing');
    setSessionPhase('processing');
    setRecording(false);
    setCurrentTranscript(SUBMITTING_PLACEHOLDER);

    const capturedTranscript = (liveTranscriptRef.current || '').trim();

    const result = await stopRecording();
    if (!result?.blob || result.blob.size < 1000) {
      if (!auto) toast.error('Recording too short — please speak your answer');
      setLocalSessionPhase('listening');
      setSessionPhase('listening');
      setCurrentTranscript('');
      beginAnswerCapture().catch(() => {});
      isFinalizingRef.current = false;
      return;
    }

    try {
      const data = await submitVoiceAnswer({
        questionId: currentQuestion?.id,
        questionOrder,
        questionText,
        blob: result.blob,
        durationMs: result.durationMs,
        currentQuestionIndex,
        clientTranscript: capturedTranscript,
      });
      const transcript = data?.transcript || data?.answer || capturedTranscript;
      saveAnswer(transcript, {
        audio_key: data?.audio_key,
        audio_url: data?.audio_url,
      });

      if (auto) {
        setCurrentTranscript('');
        handleNextRef.current?.({ auto: true });
        return;
      }

      setCurrentTranscript(transcript);
      setLocalSessionPhase('ready');
      setSessionPhase('ready');
    } catch {
      setLocalSessionPhase('listening');
      setSessionPhase('listening');
      setCurrentTranscript('');
      beginAnswerCapture().catch(() => {});
    } finally {
      isFinalizingRef.current = false;
    }
  };

  finalizeRecordingRef.current = finalizeRecording;

  const handleRethink = () => {
    autoAdvanceRef.current = false;
    resetSilenceCountdown();
  };

  const handleDoneSpeaking = () => {
    finalizeRecording({ auto: false });
  };

  const handleReplay = () => {
    askQuestion(questionText);
  };

  const handleNext = ({ auto = false } = {}) => {
    const state = useInterviewSessionStore.getState();
    const q = state.questions[state.currentQuestionIndex];
    const saved = state.answers.find((a) => a.question_id === q?.id);
    const answer = state.currentTranscript.trim()
      || currentTranscript.trim()
      || saved?.answer?.trim()
      || '';

    if (!answer) {
      if (!auto) toast.error('Please record or type an answer first');
      return;
    }

    if (!saved?.answer) {
      saveAnswer(answer);
    }
    if (isLast) {
      onSubmit();
      return;
    }
    goToNextQuestion();
  };

  handleNextRef.current = handleNext;

  const canProceed = currentTranscript.trim().length > 0
    && !isSpeaking
    && !isProcessing
    && !submitting
    && sessionPhase === 'ready'
    && currentTranscript !== SUBMITTING_PLACEHOLDER;
  const statusLabel = SESSION_LABELS[sessionPhase] || 'Preparing…';
  const savedAnswer = answers.find((item) => item.question_id === currentQuestion?.id);
  const hasRecordedAudio = Boolean(savedAnswer?.audio_key);
  const showManualControls = sessionPhase === 'ready' && !isRecording && !isProcessing;
  const answerFieldValue = sessionPhase === 'processing'
    ? SUBMITTING_PLACEHOLDER
    : currentTranscript;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: 2,
          bgcolor: 'rgba(255,255,255,0.92)',
          borderBottom: '1px solid rgba(15,23,42,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
            Question {currentQuestionIndex + 1} of {total}
          </Typography>
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: sessionPhase === 'listening' ? 'rgba(37,99,235,0.12)' : 'var(--bg-light)',
              color: sessionPhase === 'listening' ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          />
        </Box>
        <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--grey-4)', overflow: 'hidden' }}>
          <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: 'var(--primary)', borderRadius: 3, transition: 'width 0.35s ease' }} />
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 2, sm: 4 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            style={{ width: '100%', maxWidth: 760 }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 5,
                bgcolor: '#fff',
                border: '1px solid rgba(226,232,240,0.9)',
                boxShadow: '0 24px 64px rgba(15, 23, 42, 0.08)',
              }}
            >
              <InterviewAgentOrb
                phase={sessionPhase}
                voiceLabel={voiceLabel}
                inputLevel={inputLevel}
                silenceCountdown={silenceCountdown}
                isRecording={isRecording}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                {currentQuestion?.category && (
                  <Chip label={currentQuestion.category} size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
                )}
                {currentQuestion?.complexity && (
                  <Chip label={currentQuestion.complexity} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} />
                )}
                <IconButton size="small" onClick={handleReplay} disabled={isSpeaking || isProcessing} title="Replay question">
                  <ReplayRoundedIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: 18, sm: 21 },
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.55,
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                {questionText}
              </Typography>

              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  border: isRecording ? '2px solid rgba(37,99,235,0.45)' : '1px solid rgba(226,232,240,0.95)',
                  boxShadow: isRecording ? '0 0 0 4px rgba(37,99,235,0.08)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                  Your Answer
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={8}
                  placeholder={isRecording ? 'Speak now — your words will appear here live…' : 'Your answer appears here after you speak, or type manually…'}
                  value={answerFieldValue}
                  onChange={(e) => setCurrentTranscript(e.target.value)}
                  disabled={isProcessing || sessionPhase === 'processing' || (isRecording && Boolean(liveTranscript))}
                  sx={{
                    mb: hasRecordedAudio ? 1.5 : 2,
                    '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff', fontSize: 14 },
                  }}
                />

                {hasRecordedAudio && (
                  <Box sx={{ mb: 2 }}>
                    <AnswerAudioPlayer
                      userId={userId}
                      interviewId={interviewId}
                      order={questionOrder}
                      hasAudio={hasRecordedAudio}
                      label="Play your recording"
                      compact
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {isRecording && silenceCountdown != null && (
                      <Button
                        variant="outlined"
                        onClick={handleRethink}
                        disabled={isSpeaking || isProcessing || submitting}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
                      >
                        Keep speaking
                      </Button>
                    )}
                    {isRecording && !silenceCountdown && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleDoneSpeaking}
                        disabled={isSpeaking || isProcessing || submitting}
                        startIcon={<StopRoundedIcon />}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
                      >
                        Done speaking
                      </Button>
                    )}
                    {showManualControls && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setLocalSessionPhase('listening');
                          setSessionPhase('listening');
                          beginAnswerCapture().catch(() => toast.error('Could not restart microphone'));
                        }}
                        startIcon={<MicRoundedIcon />}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
                      >
                        Re-record
                      </Button>
                    )}
                    {isProcessing && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={18} />
                        <Typography variant="caption">Submitting your answer…</Typography>
                      </Box>
                    )}
                  </Box>

                  {showManualControls && (
                    <Button
                      variant="contained"
                      disabled={!canProceed}
                      onClick={() => handleNext({ auto: false })}
                      endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : (isLast ? <SendRoundedIcon /> : <ArrowForwardRoundedIcon />)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 800,
                        borderRadius: 999,
                        px: 3.5,
                        py: 1.1,
                        bgcolor: isLast ? '#7c3aed' : 'var(--primary)',
                        boxShadow: isLast
                          ? '0 10px 28px rgba(124,58,237,0.28)'
                          : '0 10px 28px rgba(37,99,235,0.22)',
                        '&:hover': {
                          bgcolor: isLast ? '#6d28d9' : undefined,
                        },
                      }}
                    >
                      {submitting ? 'Submitting…' : isLast ? 'Submit Interview' : 'Next Question'}
                    </Button>
                  )}
                </Box>

                <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                  {isRecording
                    ? silenceCountdown != null
                      ? 'Pause detected — submitting soon. Tap Keep speaking if you want to add more.'
                      : 'Speak naturally. After you finish, stay quiet for 5 seconds to submit automatically.'
                    : sessionPhase === 'processing'
                      ? 'Saving your answer and preparing the next question…'
                      : sessionPhase === 'ready'
                        ? 'Review your answer, then tap Next Question or Submit Interview.'
                        : 'The AI will ask each question aloud, then listen for your response.'}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
