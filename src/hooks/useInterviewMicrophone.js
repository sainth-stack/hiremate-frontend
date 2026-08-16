import { useCallback, useEffect, useRef, useState } from 'react';

const SPEECH_START_THRESHOLD = 0.022;
const SILENCE_RMS_THRESHOLD = 0.011;
const SILENCE_DURATION_MS = 5000;
const MIN_SPEECH_MS = 1500;
const MAX_RECORDING_MS = 180000;

export function useInterviewMicrophone({ onSilence, enabled = true }) {
  const [micGranted, setMicGranted] = useState(false);
  const [micError, setMicError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const [silenceCountdown, setSilenceCountdown] = useState(null);

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const rafRef = useRef(null);
  const speechStartedRef = useRef(false);
  const silenceStartedAtRef = useRef(null);
  const silenceFiredRef = useRef(false);
  const recordingStartRef = useRef(0);
  const durationTimerRef = useRef(null);
  const maxRecordTimerRef = useRef(null);
  const resolveStopRef = useRef(null);
  const isRecordingRef = useRef(false);
  const onSilenceRef = useRef(onSilence);
  const lastCountdownSecondRef = useRef(null);
  const levelSmoothRef = useRef(0);

  useEffect(() => {
    onSilenceRef.current = onSilence;
  }, [onSilence]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const stopStreamTracks = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopLevelMonitor = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (maxRecordTimerRef.current) {
      clearTimeout(maxRecordTimerRef.current);
      maxRecordTimerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    silenceStartedAtRef.current = null;
    silenceFiredRef.current = false;
    lastCountdownSecondRef.current = null;
    levelSmoothRef.current = 0;
    setSilenceCountdown(null);
  }, []);

  const updateSilenceCountdown = useCallback((secondsLeft) => {
    if (lastCountdownSecondRef.current === secondsLeft) return;
    lastCountdownSecondRef.current = secondsLeft;
    setSilenceCountdown(secondsLeft);
  }, []);

  const requestMicAccess = useCallback(async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      stopStreamTracks();
      streamRef.current = stream;
      setMicGranted(true);
      return stream;
    } catch (err) {
      const message = err?.message || 'Microphone access denied';
      setMicError(message);
      setMicGranted(false);
      throw err;
    }
  }, [stopStreamTracks]);

  const startLevelMonitor = useCallback((stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      if (!isRecordingRef.current) return;

      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const normalized = (data[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / data.length);
      levelSmoothRef.current = levelSmoothRef.current * 0.8 + rms * 0.2;
      const smoothRms = levelSmoothRef.current;
      setInputLevel(Math.min(1, smoothRms * 4));

      const elapsed = Date.now() - recordingStartRef.current;

      if (smoothRms >= SPEECH_START_THRESHOLD) {
        speechStartedRef.current = true;
        silenceStartedAtRef.current = null;
        lastCountdownSecondRef.current = null;
        setSilenceCountdown(null);
      } else if (
        speechStartedRef.current
        && elapsed > MIN_SPEECH_MS
        && smoothRms < SILENCE_RMS_THRESHOLD
      ) {
        if (!silenceStartedAtRef.current) {
          silenceStartedAtRef.current = Date.now();
        }
        const silenceElapsed = Date.now() - silenceStartedAtRef.current;
        const remainingMs = Math.max(0, SILENCE_DURATION_MS - silenceElapsed);
        const secondsLeft = Math.max(1, Math.ceil(remainingMs / 1000));
        updateSilenceCountdown(secondsLeft);

        if (remainingMs <= 0 && !silenceFiredRef.current) {
          silenceFiredRef.current = true;
          lastCountdownSecondRef.current = null;
          setSilenceCountdown(null);
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          onSilenceRef.current?.();
          return;
        }
      } else if (smoothRms >= SPEECH_START_THRESHOLD) {
        silenceStartedAtRef.current = null;
        lastCountdownSecondRef.current = null;
        setSilenceCountdown(null);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [updateSilenceCountdown]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }
      resolveStopRef.current = resolve;
      recorder.stop();
    });
  }, []);

  const startRecording = useCallback(async () => {
    if (!enabled) return null;

    let stream = streamRef.current;
    if (!stream) {
      stream = await requestMicAccess();
    }

    chunksRef.current = [];
    speechStartedRef.current = false;
    silenceStartedAtRef.current = null;
    silenceFiredRef.current = false;
    recordingStartRef.current = Date.now();
    lastCountdownSecondRef.current = null;
    levelSmoothRef.current = 0;
    setRecordingDurationMs(0);
    setSilenceCountdown(null);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data?.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      const durationMs = Date.now() - recordingStartRef.current;
      setIsRecording(false);
      stopLevelMonitor();
      setRecordingDurationMs(durationMs);
      resolveStopRef.current?.({
        blob,
        durationMs,
        mimeType: blob.type || 'audio/webm',
      });
      resolveStopRef.current = null;
    };

    recorder.start(250);
    setIsRecording(true);
    isRecordingRef.current = true;

    startLevelMonitor(stream);

    durationTimerRef.current = setInterval(() => {
      setRecordingDurationMs(Date.now() - recordingStartRef.current);
    }, 250);

    maxRecordTimerRef.current = setTimeout(() => {
      if (recorder.state === 'recording' && !silenceFiredRef.current) {
        silenceFiredRef.current = true;
        onSilenceRef.current?.();
      }
    }, MAX_RECORDING_MS);

    return recorder;
  }, [enabled, requestMicAccess, startLevelMonitor, stopLevelMonitor]);

  useEffect(() => () => {
    stopLevelMonitor();
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    stopStreamTracks();
  }, [stopLevelMonitor, stopStreamTracks]);

  const resetSilenceCountdown = useCallback(() => {
    silenceStartedAtRef.current = null;
    silenceFiredRef.current = false;
    lastCountdownSecondRef.current = null;
    setSilenceCountdown(null);
  }, []);

  return {
    micGranted,
    micError,
    isRecording,
    inputLevel,
    recordingDurationMs,
    silenceCountdown,
    requestMicAccess,
    startRecording,
    stopRecording,
    stopStreamTracks,
    resetSilenceCountdown,
  };
}

export async function playAudioBlob(blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    audio.play().catch(reject);
  });
}

export function stopActiveAudio() {
  // no-op placeholder for global audio cleanup if needed later
}
