import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
} from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { motion } from 'framer-motion';
import { playAudioBlob } from '../../../hooks/useInterviewMicrophone';
import { synthesizeInterviewQuestionAPI } from '../../../services/interviewVoiceService';
import InterviewAgentOrb from '../../../components/interview/InterviewAgentOrb';
import InterviewCameraPreview from '../../../components/interview/InterviewCameraPreview';

export default function DeviceCheckPanel({
  userId,
  interviewId,
  voiceConfig,
  onReady,
  onBack,
}) {
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const monitorFrameRef = useRef(null);
  const [previewStream, setPreviewStream] = useState(null);
  const [micGranted, setMicGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [speakerOk, setSpeakerOk] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [error, setError] = useState(null);
  const [testingSpeaker, setTestingSpeaker] = useState(false);
  const [testingDevices, setTestingDevices] = useState(false);

  const canStart = micGranted && cameraGranted;
  const voiceLabel = voiceConfig?.voice_label || voiceConfig?.tts_speaker || 'AI Interviewer';

  const stopLevelMonitor = useCallback(() => {
    if (monitorFrameRef.current) {
      cancelAnimationFrame(monitorFrameRef.current);
      monitorFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  const stopPreviewStream = useCallback(() => {
    stopLevelMonitor();
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    setPreviewStream(null);
    setMicGranted(false);
    setCameraGranted(false);
    setInputLevel(0);
  }, [stopLevelMonitor]);

  const testDevices = useCallback(async () => {
    setError(null);
    setTestingDevices(true);
    stopPreviewStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;
      setPreviewStream(stream);
      setMicGranted(stream.getAudioTracks().length > 0);
      setCameraGranted(stream.getVideoTracks().length > 0);

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

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
        if (frames < 240) {
          monitorFrameRef.current = requestAnimationFrame(monitor);
        } else {
          stopLevelMonitor();
        }
      };
      monitor();
    } catch (err) {
      stopPreviewStream();
      setError(err?.message || 'Camera and microphone access are required for this interview.');
    } finally {
      setTestingDevices(false);
    }
  }, [stopLevelMonitor, stopPreviewStream]);

  useEffect(() => {
    testDevices();
    return () => stopPreviewStream();
    // Request devices once when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } catch {
      setError('Speaker test failed. Check your volume and try again — you can still start if your microphone and camera work.');
    } finally {
      setTestingSpeaker(false);
    }
  };

  const handleStart = () => {
    const stream = streamRef.current;
    if (!stream) {
      setError('Allow camera and microphone before starting the interview.');
      return;
    }
    stopLevelMonitor();
    onReady?.(stream);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
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
          We record your voice and video for each answer. Allow camera and microphone access to continue.
          {voiceConfig?.voice_label && (
            <> Interviewer voice: <strong>{voiceConfig.voice_label}</strong>.</>
          )}
        </Typography>

        <InterviewAgentOrb
          phase={micGranted ? 'listening' : 'idle'}
          voiceLabel={voiceLabel}
          inputLevel={inputLevel}
          isRecording={micGranted}
          subtitle={
            testingDevices
              ? 'Requesting camera and microphone access…'
              : canStart
                ? (speakerOk ? 'Devices ready — start when you are.' : 'Camera and mic ready — test speaker, then start.')
                : 'Allow camera and microphone to continue.'
          }
        />

        <InterviewCameraPreview
          stream={previewStream}
          placeholder={testingDevices ? 'Waiting for camera access…' : 'Camera preview will appear here'}
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
              <VideocamRoundedIcon color={cameraGranted ? 'success' : 'action'} />
              <Typography sx={{ fontWeight: 700 }}>Camera & microphone</Typography>
              {canStart && <CheckCircleRoundedIcon sx={{ color: 'var(--success)', fontSize: 18 }} />}
            </Box>
            {micGranted && (
              <LinearProgress
                variant="determinate"
                value={inputLevel * 100}
                sx={{ height: 6, borderRadius: 3, mb: 1 }}
              />
            )}
            <Button
              variant={canStart ? 'outlined' : 'contained'}
              disabled={testingDevices}
              onClick={testDevices}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {testingDevices ? 'Checking devices…' : (canStart ? 'Re-test devices' : 'Allow camera & microphone')}
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
              disabled={!canStart || testingSpeaker}
              onClick={testSpeaker}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {testingSpeaker ? 'Playing sample…' : 'Test interviewer voice'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 3, gap: 1 }}>
          {canStart && !speakerOk && (
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', textAlign: 'right' }}>
              Camera and microphone are ready. Test your speaker if you can, then start.
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
              disabled={!canStart || testingDevices}
              onClick={handleStart}
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
