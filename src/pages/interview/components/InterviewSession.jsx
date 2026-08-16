import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
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
import { consumeInterviewPauseAPI } from '../../../services/interviewVoiceService';

const SESSION_LABELS = {
  ai_speaking: 'AI Speaking',
  listening: 'Your Turn',
  paused: 'Paused',
  processing: 'Submitting answer…',
  ready: 'Answer Ready',
};

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
  const pendingSubmitRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const [sessionPhase, setLocalSessionPhase] = useState('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [pauseCountdown, setPauseCountdown] = useState(null);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [pausesRemaining, setPausesRemaining] = useState(
    voiceConfig?.pauses_remaining ?? voiceConfig?.max_pauses_per_interview ?? 3
  );

  const silenceSubmitSeconds = voiceConfig?.silence_submit_seconds ?? 10;
  const pauseDurationSeconds = voiceConfig?.pause_duration_seconds ?? 10;
  const maxPauses = voiceConfig?.max_pauses_per_interview ?? 3;

  useEffect(() => {
    if (voiceConfig?.pauses_remaining != null) {
      setPausesRemaining(voiceConfig.pauses_remaining);
    }
  }, [voiceConfig?.pauses_remaining]);

  useEffect(() => () => {
    if (pauseTimerRef.current) {
      clearInterval(pauseTimerRef.current);
    }
  }, []);

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
    resumeRecording,
    pauseRecording,
    stopRecording,
    resetSilenceCountdown,
  } = useInterviewMicrophone({
    enabled: true,
    silenceDurationMs: silenceSubmitSeconds * 1000,
    monitoringEnabled: !isPaused,
    onSilence: () => handleSilenceRef.current?.(),
  });

  useEffect(() => {
    liveTranscriptRef.current = liveTranscript;
    if (isRecording && liveTranscript) {
      setCurrentTranscript(liveTranscript);
    }
  }, [isRecording, liveTranscript, setCurrentTranscript]);

  const beginAnswerCapture = useCallback(async () => {
    setSubmitFailed(false);
    pendingSubmitRef.current = null;
    resetLiveTranscript();
    setCurrentTranscript('');
    await startRecording();
    startLiveListening();
    setRecording(true);
  }, [resetLiveTranscript, setCurrentTranscript, startRecording, startLiveListening, setRecording]);

  const handleSilence = useCallback(async () => {
    if (autoAdvanceRef.current || isFinalizingRef.current) return;
    autoAdvanceRef.current = true;
    await finalizeRecordingRef.current?.({ auto: true, fromSilence: true });
    autoAdvanceRef.current = false;
  }, []);

  handleSilenceRef.current = handleSilence;

  const { submitVoiceAnswer } = useInterviewVoiceSession({
    userId,
    interviewId,
    onProcessingChange: setProcessing,
  });

  const askQuestion = useCallback(async (text) => {
    setLocalSessionPhase('ai_speaking');
    setSessionPhase('ai_speaking');
    setSpeaking(true);
    try {
      const { synthesizeInterviewQuestionAPI } = await import('../../../services/interviewVoiceService');
      const response = await synthesizeInterviewQuestionAPI({
        user_id: userId,
        interview_id: Number(interviewId),
        question_order: questionOrder,
        text,
      });
      const { playAudioBlob } = await import('../../../hooks/useInterviewMicrophone');
      await playAudioBlob(response.data);
    } catch {
      toast('Voice playback unavailable — read the question below and answer when ready.', {
        id: 'voice-tts-fallback',
        icon: '🎙️',
      });
    } finally {
      setSpeaking(false);
      setLocalSessionPhase('listening');
      setSessionPhase('listening');
      beginAnswerCapture().catch(() => {
        toast.error('Could not start microphone recording', { id: 'mic-start-error' });
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

  const finalizeRecording = async ({ auto = false, retryPayload = null, fromSilence = false } = {}) => {
    if (isFinalizingRef.current || isProcessing || isSpeaking || isPaused) return;
    isFinalizingRef.current = true;
    stopLiveListening();
    setLocalSessionPhase('processing');
    setSessionPhase('processing');
    setRecording(false);

    let capturedTranscript = (liveTranscriptRef.current || currentTranscript || '').trim();
    let result = retryPayload;

    if (!result) {
      result = await stopRecording();
      capturedTranscript = capturedTranscript || (liveTranscriptRef.current || '').trim();
      if (capturedTranscript) {
        setCurrentTranscript(capturedTranscript);
      }
    }

    if (!result?.blob || result.blob.size < 1000) {
      if (!fromSilence) toast.error('Recording too short — please speak your answer');
      setLocalSessionPhase('listening');
      setSessionPhase('listening');
      if (!capturedTranscript) setCurrentTranscript('');
      beginAnswerCapture().catch(() => {});
      isFinalizingRef.current = false;
      return;
    }

    pendingSubmitRef.current = {
      blob: result.blob,
      durationMs: result.durationMs,
      clientTranscript: capturedTranscript,
    };

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
      pendingSubmitRef.current = null;
      setSubmitFailed(false);
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
    } catch (err) {
      if (capturedTranscript) {
        setCurrentTranscript(capturedTranscript);
      }
      toast.error(
        `${parseApiError(err, 'Could not save your answer')}. Tap Retry submit to try again.`,
        { id: 'voice-answer-error' },
      );
      setSubmitFailed(true);
      setLocalSessionPhase('ready');
      setSessionPhase('ready');
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

  const handleCompleteAndNext = () => {
    autoAdvanceRef.current = true;
    finalizeRecording({ auto: true });
  };

  const handleRetrySubmit = () => {
    if (!pendingSubmitRef.current) return;
    finalizeRecording({ auto: false, retryPayload: pendingSubmitRef.current });
  };

  const resumeFromPause = useCallback(async () => {
    if (pauseTimerRef.current) {
      clearInterval(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    setPauseCountdown(null);
    setIsPaused(false);
    setLocalSessionPhase('listening');
    setSessionPhase('listening');
    resetSilenceCountdown();
    await resumeRecording();
    startLiveListening();
    setRecording(true);
  }, [resetSilenceCountdown, resumeRecording, startLiveListening, setRecording, setSessionPhase]);

  const handlePause = async () => {
    if (isPaused || pausesRemaining <= 0 || isFinalizingRef.current || isProcessing) return;

    try {
      const res = await consumeInterviewPauseAPI({
        user_id: userId,
        interview_id: Number(interviewId),
      });
      setPausesRemaining(res?.data?.pauses_remaining ?? Math.max(0, pausesRemaining - 1));

      autoAdvanceRef.current = false;
      resetSilenceCountdown();
      await pauseRecording();
      stopLiveListening();
      setRecording(false);
      setIsPaused(true);
      setLocalSessionPhase('paused');
      setSessionPhase('paused');

      let remaining = pauseDurationSeconds;
      setPauseCountdown(remaining);
      pauseTimerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(pauseTimerRef.current);
          pauseTimerRef.current = null;
          resumeFromPause().catch(() => toast.error('Could not resume recording'));
        } else {
          setPauseCountdown(remaining);
        }
      }, 1000);
    } catch (err) {
      toast.error(parseApiError(err, 'Could not start pause'));
    }
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

  const savedAnswer = answers.find((item) => item.question_id === currentQuestion?.id);
  const hasRecordedAudio = Boolean(savedAnswer?.audio_key);
  const canProceed = (currentTranscript.trim().length > 0 || Boolean(savedAnswer?.answer?.trim()))
    && !isSpeaking
    && !isProcessing
    && !submitting
    && !isPaused
    && sessionPhase === 'ready';
  const statusLabel = SESSION_LABELS[sessionPhase] || 'Preparing…';
  const showManualControls = sessionPhase === 'ready' && !isRecording && !isProcessing && !isPaused;
  const showCompleteAndNext = isRecording && !isPaused && !isProcessing && !isSpeaking;
  const answerFieldValue = currentTranscript;
  const pauseDisabled = pausesRemaining <= 0 || isPaused || isProcessing || isSpeaking || !isRecording;
  const pauseTooltip = pausesRemaining <= 0
    ? `No pauses remaining (${maxPauses} per interview)`
    : `Pause for ${pauseDurationSeconds}s (${pausesRemaining} of ${maxPauses} left)`;

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
                pauseCountdown={pauseCountdown}
                isRecording={isRecording}
                silenceSubmitSeconds={silenceSubmitSeconds}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                <Chip
                  label={`Pauses left: ${pausesRemaining}/${maxPauses}`}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: 11 }}
                />
              </Box>

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
                  disabled={isProcessing || sessionPhase === 'processing' || isPaused || (isRecording && Boolean(liveTranscript))}
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
                    {isRecording && !isPaused && (
                      <Tooltip title={pauseTooltip} arrow>
                        <span>
                          <Button
                            variant="outlined"
                            onClick={handlePause}
                            disabled={pauseDisabled}
                            startIcon={<PauseRoundedIcon />}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
                          >
                            Pause ({pauseDurationSeconds}s)
                          </Button>
                        </span>
                      </Tooltip>
                    )}
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
                    {isRecording && !silenceCountdown && !isPaused && (
                      <Button
                        variant="outlined"
                        onClick={handleDoneSpeaking}
                        disabled={isSpeaking || isProcessing || submitting}
                        startIcon={<StopRoundedIcon />}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
                      >
                        Save & review
                      </Button>
                    )}
                    {submitFailed && (
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleRetrySubmit}
                        disabled={isProcessing || submitting}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
                      >
                        Retry submit
                      </Button>
                    )}
                    {showManualControls && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSubmitFailed(false);
                          pendingSubmitRef.current = null;
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

                  {(showManualControls || showCompleteAndNext) && (
                    <Button
                      variant="contained"
                      disabled={showManualControls ? !canProceed : (isProcessing || submitting)}
                      onClick={showCompleteAndNext ? handleCompleteAndNext : () => handleNext({ auto: false })}
                      endIcon={
                        isProcessing || submitting
                          ? <CircularProgress size={18} color="inherit" />
                          : (isLast ? <SendRoundedIcon /> : <ArrowForwardRoundedIcon />)
                      }
                      sx={{
                        textTransform: 'none',
                        fontWeight: 800,
                        borderRadius: 999,
                        px: 3.5,
                        py: 1.1,
                        bgcolor: isLast && !showCompleteAndNext ? '#7c3aed' : 'var(--primary)',
                        boxShadow: isLast && !showCompleteAndNext
                          ? '0 10px 28px rgba(124,58,237,0.28)'
                          : '0 10px 28px rgba(37,99,235,0.22)',
                        '&:hover': {
                          bgcolor: isLast && !showCompleteAndNext ? '#6d28d9' : undefined,
                        },
                      }}
                    >
                      {isProcessing || submitting
                        ? 'Submitting…'
                        : showCompleteAndNext
                          ? (isLast ? 'Complete & submit interview' : 'Complete & next question')
                          : (isLast ? 'Submit Interview' : 'Next Question')}
                    </Button>
                  )}
                </Box>

                <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                  {isRecording
                    ? isPaused
                      ? `Paused — recording resumes automatically in ${pauseCountdown ?? pauseDurationSeconds}s.`
                      : silenceCountdown != null
                        ? 'Pause detected — submitting soon. Tap Keep speaking or Complete & next question.'
                        : `Speak naturally, or tap Complete & next question when finished. Auto-submit after ${silenceSubmitSeconds}s of silence.`
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
