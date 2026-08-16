import { useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
} from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { motion } from 'framer-motion';
import { playAudioBlob } from '../../../hooks/useInterviewMicrophone';
import { synthesizeInterviewQuestionAPI } from '../../../services/interviewVoiceService';
import InterviewAgentOrb from '../../../components/interview/InterviewAgentOrb';

export default function DeviceCheckPanel({
  userId,
  interviewId,
  voiceConfig,
  onReady,
  onBack,
}) {
  const [micGranted, setMicGranted] = useState(false);
  const [speakerOk, setSpeakerOk] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [error, setError] = useState(null);
  const [testingSpeaker, setTestingSpeaker] = useState(false);
  const [testingMic, setTestingMic] = useState(false);

  const canStart = micGranted;
  const voiceLabel = voiceConfig?.voice_label || voiceConfig?.tts_speaker || 'AI Interviewer';

  const testMicrophone = async () => {
    setError(null);
    setTestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      setMicGranted(true);

      const data = new Uint8Array(analyser.frequencyBinCount);
      let frames = 0;
      const monitor = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          const n = (data[i] - 128) / 128;
          sum += n * n;
        }
        setInputLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
        frames += 1;
        if (frames < 180) {
          requestAnimationFrame(monitor);
        } else {
          stream.getTracks().forEach((t) => t.stop());
          audioContext.close().catch(() => {});
        }
      };
      monitor();
    } catch (err) {
      setMicGranted(false);
      setError(err?.message || 'Microphone access denied');
    } finally {
      setTestingMic(false);
    }
  };

  const testSpeaker = async () => {
    setTestingSpeaker(true);
    setError(null);
    try {
      const sample = 'Hello, I will be your AI interviewer today. Please speak clearly when it is your turn to answer.';
      const response = await synthesizeInterviewQuestionAPI({
        user_id: userId,
        interview_id: Number(interviewId),
        question_order: 1,
        text: sample,
      });
      await playAudioBlob(response.data);
      setSpeakerOk(true);
    } catch (err) {
      setError('Speaker test failed. Check your volume and try again — you can still start if your microphone works.');
    } finally {
      setTestingSpeaker(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 20px 60px rgba(37, 99, 235, 0.1)',
          maxWidth: 640,
          mx: 'auto',
        }}
      >
        <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 1 }}>
          Device check
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', mb: 2, lineHeight: 1.6 }}>
          We use Sarvam AI voice for questions and speech recognition for your answers.
          {voiceConfig?.voice_label && (
            <> Interviewer voice: <strong>{voiceConfig.voice_label}</strong>.</>
          )}
          {!voiceConfig?.voice_label && voiceConfig?.tts_speaker && (
            <> Interviewer voice: <strong>{voiceConfig.tts_speaker}</strong>.</>
          )}
        </Typography>

        <InterviewAgentOrb
          phase={micGranted ? 'listening' : 'idle'}
          voiceLabel={voiceLabel}
          inputLevel={inputLevel}
          isRecording={micGranted}
          subtitle={
            micGranted
              ? (speakerOk ? 'Devices ready — start when you are.' : 'Microphone working — test speaker, then start.')
              : 'Allow microphone access to continue.'
          }
        />

        {error && (
          <Typography sx={{ color: 'var(--error-dark)', fontSize: 13, mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--bg-light)', border: '1px solid var(--border-color)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MicRoundedIcon color={micGranted ? 'success' : 'action'} />
              <Typography sx={{ fontWeight: 700 }}>Microphone</Typography>
              {micGranted && <CheckCircleRoundedIcon sx={{ color: 'var(--success)', fontSize: 18 }} />}
            </Box>
            {micGranted && (
              <LinearProgress
                variant="determinate"
                value={inputLevel * 100}
                sx={{ height: 6, borderRadius: 3, mb: 1 }}
              />
            )}
            <Button
              variant={micGranted ? 'outlined' : 'contained'}
              disabled={testingMic}
              onClick={testMicrophone}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {testingMic ? 'Checking microphone…' : (micGranted ? 'Re-test microphone' : 'Allow microphone')}
            </Button>
          </Box>

          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--bg-light)', border: '1px solid var(--border-color)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <VolumeUpRoundedIcon color={speakerOk ? 'success' : 'action'} />
              <Typography sx={{ fontWeight: 700 }}>Speaker</Typography>
              {speakerOk && <CheckCircleRoundedIcon sx={{ color: 'var(--success)', fontSize: 18 }} />}
            </Box>
            <Button
              variant="outlined"
              disabled={!micGranted || testingSpeaker}
              onClick={testSpeaker}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {testingSpeaker ? 'Playing sample…' : 'Test interviewer voice'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 3, gap: 1 }}>
          {micGranted && !speakerOk && (
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', textAlign: 'right' }}>
              Microphone ready. Test your speaker if you can, then start the interview.
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
            {onBack && (
              <Button onClick={onBack} sx={{ textTransform: 'none' }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              disabled={!canStart}
              onClick={onReady}
              sx={{
                ml: 'auto',
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 999,
                px: 3.5,
                py: 1.1,
                bgcolor: canStart ? 'var(--primary)' : undefined,
                boxShadow: canStart ? '0 10px 28px rgba(37,99,235,0.22)' : 'none',
              }}
            >
              Start interview
            </Button>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}
