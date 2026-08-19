import { useCallback, useEffect, useRef, useState } from 'react';

const SPEECH_START_THRESHOLD = 0.022;
const SILENCE_RMS_THRESHOLD = 0.011;
const DEFAULT_SILENCE_DURATION_MS = 10000;
const MIN_SPEECH_MS = 1500;
const MAX_RECORDING_MS = 180000;

export function useInterviewMicrophone({
  onSilence,
  enabled = true,
  silenceDurationMs = DEFAULT_SILENCE_DURATION_MS,
  monitoringEnabled = true,
  recordVideo = true,
  initialStream = null,
}) {
  const [micGranted, setMicGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [previewStream, setPreviewStream] = useState(null);
  const [micError, setMicError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const [silenceCountdown, setSilenceCountdown] = useState(null);

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const videoStopResolveRef = useRef(null);
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
  const pauseStopRef = useRef(null);
  const isRecordingRef = useRef(false);
  const onSilenceRef = useRef(onSilence);
  const lastCountdownSecondRef = useRef(null);
  const levelSmoothRef = useRef(0);
  const monitoringEnabledRef = useRef(monitoringEnabled);
  const silenceDurationMsRef = useRef(silenceDurationMs);

  const levelEmitRef = useRef(0);
  const recordVideoRef = useRef(recordVideo);

  useEffect(() => {
    recordVideoRef.current = recordVideo;
  }, [recordVideo]);

  useEffect(() => {
    onSilenceRef.current = onSilence;
  }, [onSilence]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    monitoringEnabledRef.current = monitoringEnabled;
  }, [monitoringEnabled]);

  useEffect(() => {
    silenceDurationMsRef.current = silenceDurationMs;
  }, [silenceDurationMs]);

  useEffect(() => {
    if (!initialStream) return undefined;

    if (streamRef.current && streamRef.current !== initialStream) {
      streamRef.current.getTracks?.().forEach((track) => track.stop());
    }

    streamRef.current = initialStream;
    setPreviewStream(initialStream);
    setMicGranted(initialStream.getAudioTracks().some((track) => track.readyState === 'live'));
    setCameraGranted(
      !recordVideoRef.current
      || initialStream.getVideoTracks().some((track) => track.readyState === 'live'),
    );
    setMicError(null);

    return undefined;
  }, [initialStream]);

  const getAudioStream = useCallback((stream) => {
    const audioTracks = stream?.getAudioTracks?.() || [];
    if (!audioTracks.length) {
      throw new Error('No microphone track available');
    }
    return new MediaStream(audioTracks);
  }, []);

  const stopStreamTracks = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    setPreviewStream(null);
  }, []);

  const pickVideoMimeType = () => {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  const stopVideoRecorder = useCallback(() => new Promise((resolve) => {
    const recorder = videoRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      if (videoChunksRef.current.length) {
        resolve({
          blob: new Blob(videoChunksRef.current, { type: 'video/webm' }),
          mimeType: 'video/webm',
        });
        return;
      }
      resolve(null);
      return;
    }
    videoStopResolveRef.current = resolve;
    recorder.stop();
  }), []);

  const startVideoRecorder = useCallback((stream) => {
    if (!recordVideoRef.current || !stream?.getVideoTracks?.().length) return;
    const mimeType = pickVideoMimeType();
    if (!mimeType) return;
    try {
      videoChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      videoRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) videoChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: recorder.mimeType || 'video/webm' });
        videoStopResolveRef.current?.({
          blob,
          mimeType: blob.type || 'video/webm',
        });
        videoStopResolveRef.current = null;
      };
      recorder.start(500);
    } catch (err) {
      videoRecorderRef.current = null;
      console.warn('[Interview] Video recorder failed to start:', err);
    }
  }, []);

  const stopLevelMonitor = useCallback(({ clearCountdown = true } = {}) => {
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
    if (clearCountdown) {
      setSilenceCountdown(null);
    }
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
        video: recordVideoRef.current
          ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          }
          : false,
      });
      stopStreamTracks();
      streamRef.current = stream;
      setPreviewStream(stream);
      setMicGranted(true);
      setCameraGranted(!recordVideoRef.current || stream.getVideoTracks().length > 0);
      return stream;
    } catch (err) {
      const message = err?.message || 'Microphone access denied';
      setMicError(message);
      setMicGranted(false);
      setCameraGranted(false);
      throw err;
    }
  }, [stopStreamTracks]);

  const startRecorderSegment = useCallback((stream, { resetChunks = true } = {}) => {
    if (resetChunks) {
      chunksRef.current = [];
    }

    const mimeCandidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    let recorder = null;
    let selectedMime = '';

    for (const candidate of mimeCandidates) {
      if (candidate.includes('codecs=') && !MediaRecorder.isTypeSupported(candidate)) {
        continue;
      }
      try {
        recorder = candidate
          ? new MediaRecorder(stream, { mimeType: candidate })
          : new MediaRecorder(stream);
        selectedMime = recorder.mimeType || candidate || 'audio/webm';
        break;
      } catch {
        recorder = null;
      }
    }

    if (!recorder) {
      recorder = new MediaRecorder(stream);
      selectedMime = recorder.mimeType || 'audio/webm';
    }

    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data?.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      if (pauseStopRef.current) {
        pauseStopRef.current();
        pauseStopRef.current = null;
        return;
      }

      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || selectedMime || 'audio/webm' });
      const durationMs = Date.now() - recordingStartRef.current;
      const videoResult = await stopVideoRecorder();
      setIsRecording(false);
      isRecordingRef.current = false;
      stopLevelMonitor();
      setRecordingDurationMs(durationMs);
      resolveStopRef.current?.({
        blob,
        durationMs,
        mimeType: blob.type || 'audio/webm',
        videoBlob: videoResult?.blob || null,
        videoMimeType: videoResult?.mimeType || null,
        videoDurationMs: videoResult ? durationMs : null,
      });
      resolveStopRef.current = null;
    };

    try {
      recorder.start(250);
    } catch (err) {
      recorderRef.current = null;
      throw new Error(err?.message || 'Could not start audio recorder');
    }

    setIsRecording(true);
    isRecordingRef.current = true;
    return recorder;
  }, [stopLevelMonitor, stopVideoRecorder]);

  const startLevelMonitor = useCallback(async (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      if (!isRecordingRef.current || !monitoringEnabledRef.current) return;

      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const normalized = (data[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / data.length);
      levelSmoothRef.current = levelSmoothRef.current * 0.8 + rms * 0.2;
      const smoothRms = levelSmoothRef.current;
      const now = Date.now();
      if (now - levelEmitRef.current >= 120) {
        levelEmitRef.current = now;
        setInputLevel(Math.min(1, smoothRms * 4));
      }

      const elapsed = Date.now() - recordingStartRef.current;
      const silenceDuration = silenceDurationMsRef.current;

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
        const remainingMs = Math.max(0, silenceDuration - silenceElapsed);
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
        if (chunksRef.current.length) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          resolve({
            blob,
            durationMs: Date.now() - recordingStartRef.current,
            mimeType: blob.type || 'audio/webm',
          });
          return;
        }
        resolve(null);
        return;
      }
      resolveStopRef.current = resolve;
      recorder.stop();
    });
  }, []);

  const pauseRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state !== 'recording') {
        resolve(false);
        return;
      }

      stopLevelMonitor();
      if (videoRecorderRef.current?.state === 'recording') {
        videoRecorderRef.current.stop();
      }
      pauseStopRef.current = () => {
        setIsRecording(false);
        isRecordingRef.current = false;
        resolve(true);
      };
      recorder.stop();
    });
  }, [stopLevelMonitor]);

  const startRecording = useCallback(async ({ resetChunks = true } = {}) => {
    if (!enabled) return null;

    let stream = streamRef.current;
    if (!stream || !stream.getAudioTracks?.().some((track) => track.readyState === 'live')) {
      stream = await requestMicAccess();
    }

    const audioStream = getAudioStream(stream);

    speechStartedRef.current = false;
    silenceStartedAtRef.current = null;
    silenceFiredRef.current = false;
    if (resetChunks) {
      recordingStartRef.current = Date.now();
    }
    lastCountdownSecondRef.current = null;
    levelSmoothRef.current = 0;
    if (resetChunks) {
      setRecordingDurationMs(0);
    }
    setSilenceCountdown(null);

    startRecorderSegment(audioStream, { resetChunks });
    startVideoRecorder(stream);

    if (monitoringEnabledRef.current) {
      await startLevelMonitor(audioStream);
    }

    durationTimerRef.current = setInterval(() => {
      setRecordingDurationMs(Date.now() - recordingStartRef.current);
    }, 250);

    maxRecordTimerRef.current = setTimeout(() => {
      if (recorderRef.current?.state === 'recording' && !silenceFiredRef.current) {
        silenceFiredRef.current = true;
        onSilenceRef.current?.();
      }
    }, MAX_RECORDING_MS);

    return recorderRef.current;
  }, [enabled, getAudioStream, requestMicAccess, startLevelMonitor, startRecorderSegment, startVideoRecorder]);

  const resumeRecording = useCallback(async () => {
    speechStartedRef.current = false;
    silenceStartedAtRef.current = null;
    silenceFiredRef.current = false;
    lastCountdownSecondRef.current = null;
    levelSmoothRef.current = 0;
    setSilenceCountdown(null);
    return startRecording({ resetChunks: false });
  }, [startRecording]);

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
    cameraGranted,
    previewStream,
    micError,
    isRecording,
    inputLevel,
    recordingDurationMs,
    silenceCountdown,
    requestMicAccess,
    startRecording,
    resumeRecording,
    pauseRecording,
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
