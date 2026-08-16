import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import {
  cloneInterviewVoiceAPI,
  deleteInterviewVoiceCloneAPI,
  previewInterviewVoiceAPI,
} from '../../../services/interviewVoiceService';

const TIER_LABELS = {
  cartesia_custom: 'Custom Cloned Voices',
  cartesia_premium: 'Cartesia Premium — Indian Voices',
};

const PREVIEW_TEXT =
  'Namaste. I will be your AI interviewer today. Please speak clearly when it is your turn to answer.';

const CLONE_LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English (Indian)' },
  { value: 'hi', label: 'Hindi' },
];

const CLONE_SAMPLE_SCRIPT =
  'Hello, I will be your AI interviewer today. Please speak clearly and naturally.';

const MIN_CLONE_RECORD_MS = 3000;
const MAX_CLONE_RECORD_MS = 10000;

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${seconds}.${tenths}s`;
}

function blobToCloneFile(blob, filename = 'clone-recording.webm') {
  return new File([blob], filename, { type: blob.type || 'audio/webm' });
}

function parseCloneRecordId(voice) {
  return voice?.clone_record_id ?? null;
}

export default function VoicePicker({
  groups = [],
  selectedVoice,
  onSelect,
  languageCode = 'en-IN',
  onLanguageChange,
  languages = [],
  compact = false,
  onVoicesChanged,
}) {
  const [previewingKey, setPreviewingKey] = useState(null);
  const [previewLoadingKey, setPreviewLoadingKey] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [cloneLanguage, setCloneLanguage] = useState('en');
  const [cloneDescription, setCloneDescription] = useState('');
  const [cloneFile, setCloneFile] = useState(null);
  const [cloneInputMode, setCloneInputMode] = useState('record');
  const [isCloneRecording, setIsCloneRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordDurationMs, setRecordDurationMs] = useState(0);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneError, setCloneError] = useState(null);
  const [deletingCloneId, setDeletingCloneId] = useState(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const cloneRecorderRef = useRef(null);
  const cloneStreamRef = useRef(null);
  const cloneChunksRef = useRef([]);
  const cloneRecordStartRef = useRef(0);
  const cloneDurationTimerRef = useRef(null);
  const cloneAutoStopTimerRef = useRef(null);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setPreviewingKey(null);
    setPreviewLoadingKey(null);
  };

  const stopCloneRecordingTracks = useCallback(() => {
    cloneStreamRef.current?.getTracks?.().forEach((track) => track.stop());
    cloneStreamRef.current = null;
  }, []);

  const clearCloneRecordingTimers = useCallback(() => {
    if (cloneDurationTimerRef.current) {
      clearInterval(cloneDurationTimerRef.current);
      cloneDurationTimerRef.current = null;
    }
    if (cloneAutoStopTimerRef.current) {
      clearTimeout(cloneAutoStopTimerRef.current);
      cloneAutoStopTimerRef.current = null;
    }
  }, []);

  const stopCloneRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = cloneRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        clearCloneRecordingTimers();
        const blob = new Blob(cloneChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const durationMs = Date.now() - cloneRecordStartRef.current;
        setIsCloneRecording(false);
        stopCloneRecordingTracks();
        resolve({ blob, durationMs });
      };

      recorder.stop();
    });
  }, [clearCloneRecordingTimers, stopCloneRecordingTracks]);

  const resetCloneForm = useCallback(async () => {
    if (cloneRecorderRef.current?.state === 'recording') {
      await stopCloneRecording();
    }
    clearCloneRecordingTimers();
    stopCloneRecordingTracks();
    setCloneName('');
    setCloneLanguage('en');
    setCloneDescription('');
    setCloneFile(null);
    setRecordedBlob(null);
    setRecordDurationMs(0);
    setCloneInputMode('record');
    setIsCloneRecording(false);
    setCloneError(null);
    cloneChunksRef.current = [];
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearCloneRecordingTimers, stopCloneRecording, stopCloneRecordingTracks]);

  useEffect(() => () => {
    clearCloneRecordingTimers();
    stopCloneRecordingTracks();
    if (cloneRecorderRef.current?.state === 'recording') {
      cloneRecorderRef.current.stop();
    }
  }, [clearCloneRecordingTimers, stopCloneRecordingTracks]);

  const startCloneRecording = async () => {
    setCloneError(null);
    setRecordedBlob(null);
    setRecordDurationMs(0);
    cloneChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      stopCloneRecordingTracks();
      cloneStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      cloneRecorderRef.current = recorder;
      cloneRecordStartRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          cloneChunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      setIsCloneRecording(true);

      cloneDurationTimerRef.current = setInterval(() => {
        setRecordDurationMs(Date.now() - cloneRecordStartRef.current);
      }, 100);

      cloneAutoStopTimerRef.current = setTimeout(async () => {
        const result = await stopCloneRecording();
        if (result?.blob) {
          setRecordedBlob(result.blob);
          setRecordDurationMs(result.durationMs);
        }
      }, MAX_CLONE_RECORD_MS);
    } catch {
      setCloneError('Microphone access is required to record a voice sample.');
      setIsCloneRecording(false);
    }
  };

  const handleStopCloneRecording = async () => {
    const result = await stopCloneRecording();
    if (!result?.blob) return;

    if (result.durationMs < MIN_CLONE_RECORD_MS) {
      setCloneError(`Recording is too short — speak for at least ${MIN_CLONE_RECORD_MS / 1000} seconds.`);
      setRecordedBlob(null);
      setRecordDurationMs(0);
      return;
    }

    setRecordedBlob(result.blob);
    setRecordDurationMs(result.durationMs);
    setCloneError(null);
  };

  const getCloneClipFile = () => {
    if (cloneInputMode === 'upload') {
      return cloneFile;
    }
    if (recordedBlob) {
      return blobToCloneFile(recordedBlob);
    }
    return null;
  };

  const handlePreview = async (voice, event) => {
    event.stopPropagation();
    const voiceKey = `${voice.provider}:${voice.id}`;

    if (previewingKey === voiceKey) {
      stopPreview();
      return;
    }

    stopPreview();
    setPreviewError(null);
    setPreviewLoadingKey(voiceKey);

    try {
      const response = await previewInterviewVoiceAPI({
        voice_provider: voice.provider,
        voice_id: voice.id,
        tts_language_code: languageCode,
        text: PREVIEW_TEXT,
      });
      const url = URL.createObjectURL(response.data);
      const audio = new Audio(url);
      audioRef.current = audio;
      audioUrlRef.current = url;
      audio.onended = () => stopPreview();
      audio.onerror = () => {
        setPreviewError('Could not play voice preview. Try again.');
        stopPreview();
      };
      await audio.play();
      setPreviewingKey(voiceKey);
    } catch {
      setPreviewError('Could not play voice preview. Try again.');
    } finally {
      setPreviewLoadingKey(null);
    }
  };

  const handleSelect = (voice) => {
    stopPreview();
    onSelect?.(voice);
  };

  const handleCloneSubmit = async () => {
    if (!cloneName.trim()) {
      setCloneError('Voice name is required.');
      return;
    }

    const clipFile = getCloneClipFile();
    if (!clipFile) {
      setCloneError(
        cloneInputMode === 'upload'
          ? 'Upload a 3–10 second clean audio clip.'
          : 'Record a 3–10 second voice sample first.',
      );
      return;
    }

    setCloneLoading(true);
    setCloneError(null);
    try {
      const formData = new FormData();
      formData.append('clip', clipFile);
      formData.append('name', cloneName.trim());
      formData.append('cartesia_language', cloneLanguage);
      formData.append('tts_language_code', languageCode || 'en-IN');
      if (cloneDescription.trim()) {
        formData.append('description', cloneDescription.trim());
      }

      const response = await cloneInterviewVoiceAPI(formData);
      const created = response?.data;
      setCloneOpen(false);
      await resetCloneForm();
      await onVoicesChanged?.(created);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setCloneError(typeof detail === 'string' ? detail : 'Could not clone voice. Try another clip.');
    } finally {
      setCloneLoading(false);
    }
  };

  const handleDeleteClone = async (voice, event) => {
    event.stopPropagation();
    const cloneId = parseCloneRecordId(voice);
    if (!cloneId) return;

    setDeletingCloneId(cloneId);
    setPreviewError(null);
    try {
      await deleteInterviewVoiceCloneAPI(cloneId);
      if (selectedVoice?.id === voice.id) {
        onSelect?.(null);
      }
      await onVoicesChanged?.();
    } catch {
      setPreviewError('Could not delete cloned voice.');
    } finally {
      setDeletingCloneId(null);
    }
  };

  return (
    <Box>
      {!compact && (
        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.5 }}>
          Interviewer voice
        </Typography>
      )}
      {!compact && (
        <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mb: 2 }}>
          Choose a Cartesia Premium Indian voice or clone your own by recording here or uploading a sample. Sarvam is used for speech-to-text only.
        </Typography>
      )}

      {!compact && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<GraphicEqRoundedIcon />}
          onClick={async () => {
            await resetCloneForm();
            setCloneOpen(true);
          }}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Clone a voice
        </Button>
      )}

      {languages.length > 0 && onLanguageChange && (
        <FormControl fullWidth size="small" sx={{ mb: 2, maxWidth: 280 }}>
          <InputLabel id="voice-language-label">Language</InputLabel>
          <Select
            labelId="voice-language-label"
            label="Language"
            value={languageCode}
            onChange={(e) => {
              stopPreview();
              onLanguageChange(e.target.value);
            }}
          >
            {languages.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {previewError && (
        <Typography sx={{ fontSize: 12, color: 'var(--error-dark)', mb: 1.5 }}>
          {previewError}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {groups.map((group) => (
          <Box key={group.tier}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
              {TIER_LABELS[group.tier] || group.label}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(group.voices || []).map((voice) => {
                const selected = selectedVoice?.id === voice.id && selectedVoice?.provider === voice.provider;
                const voiceKey = `${voice.provider}:${voice.id}`;
                const isPreviewing = previewingKey === voiceKey;
                const isLoading = previewLoadingKey === voiceKey;
                const isCustom = group.tier === 'cartesia_custom';
                const cloneId = parseCloneRecordId(voice);
                const isDeleting = deletingCloneId === cloneId;

                return (
                  <Box
                    key={voiceKey}
                    onClick={() => handleSelect(voice)}
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
                      bgcolor: selected ? 'var(--light-blue-bg-04)' : 'var(--bg-paper)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { borderColor: 'var(--primary)' },
                    }}
                  >
                    {voice.featured && (
                      <StarRoundedIcon sx={{ color: 'var(--warning-dark)', fontSize: 18 }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {voice.label}
                      </Typography>
                      {voice.description && (
                        <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', mt: 0.25 }}>
                          {voice.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={isCustom ? 'Clone' : 'Cartesia'}
                      size="small"
                      sx={{ height: 22, fontSize: 10, fontWeight: 700 }}
                    />
                    {isCustom && cloneId && (
                      <Tooltip title="Delete clone">
                        <span>
                          <IconButton
                            size="small"
                            onClick={(event) => handleDeleteClone(voice, event)}
                            disabled={isDeleting}
                            sx={{ color: 'var(--text-secondary)' }}
                          >
                            {isDeleting ? <CircularProgress size={16} /> : <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    <Tooltip title={isPreviewing ? 'Stop preview' : 'Preview voice'}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={(event) => handlePreview(voice, event)}
                          disabled={Boolean(previewLoadingKey && !isLoading)}
                          sx={{
                            color: isPreviewing ? 'var(--primary)' : 'var(--text-secondary)',
                            bgcolor: isPreviewing ? 'var(--light-blue-bg-08)' : 'transparent',
                          }}
                        >
                          {isLoading ? (
                            <CircularProgress size={16} />
                          ) : isPreviewing ? (
                            <StopRoundedIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <VolumeUpRoundedIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      <Dialog
        open={cloneOpen}
        onClose={async () => {
          if (!cloneLoading) {
            await resetCloneForm();
            setCloneOpen(false);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Clone interviewer voice</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mb: 2 }}>
            Record here or upload a clear 3–10 second sample. Cartesia will create a custom voice for previews and live interviews.
          </Typography>

          <ToggleButtonGroup
            exclusive
            fullWidth
            value={cloneInputMode}
            onChange={(_, value) => {
              if (!value || cloneLoading || isCloneRecording) return;
              setCloneInputMode(value);
              setCloneError(null);
              setCloneFile(null);
              setRecordedBlob(null);
              setRecordDurationMs(0);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="record" sx={{ textTransform: 'none', fontWeight: 700 }}>
              <MicRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
              Record here
            </ToggleButton>
            <ToggleButton value="upload" sx={{ textTransform: 'none', fontWeight: 700 }}>
              <UploadFileRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
              Upload file
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            fullWidth
            size="small"
            label="Voice name"
            value={cloneName}
            onChange={(e) => setCloneName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="clone-language-label">Clone language</InputLabel>
            <Select
              labelId="clone-language-label"
              label="Clone language"
              value={cloneLanguage}
              onChange={(e) => setCloneLanguage(e.target.value)}
            >
              {CLONE_LANGUAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="Description (optional)"
            value={cloneDescription}
            onChange={(e) => setCloneDescription(e.target.value)}
            sx={{ mb: 2 }}
          />

          {cloneInputMode === 'record' ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: isCloneRecording ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                bgcolor: 'var(--bg-light)',
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', mb: 1 }}>
                Read this sample aloud
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, mb: 2, fontStyle: 'italic' }}>
                “{CLONE_SAMPLE_SCRIPT}”
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: recordedBlob ? 1.5 : 0 }}>
                {!isCloneRecording ? (
                  <Button
                    variant="contained"
                    startIcon={<FiberManualRecordRoundedIcon />}
                    onClick={startCloneRecording}
                    disabled={cloneLoading}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
                  >
                    {recordedBlob ? 'Record again' : 'Start recording'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<StopRoundedIcon />}
                    onClick={handleStopCloneRecording}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
                  >
                    Stop recording
                  </Button>
                )}
                {(isCloneRecording || recordedBlob) && (
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                    {formatDuration(recordDurationMs)} / 10.0s
                  </Typography>
                )}
              </Box>

              {isCloneRecording && (
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (recordDurationMs / MAX_CLONE_RECORD_MS) * 100)}
                  sx={{ mt: 1.5, height: 6, borderRadius: 3 }}
                />
              )}

              {recordedBlob && !isCloneRecording && (
                <Typography sx={{ fontSize: 12, color: 'var(--success-dark)', mt: 1 }}>
                  Recording ready — {formatDuration(recordDurationMs)} captured.
                </Typography>
              )}
            </Box>
          ) : (
            <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none' }}>
              {cloneFile ? cloneFile.name : 'Choose audio clip (3–10 seconds)'}
              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept="audio/*,.wav,.mp3,.webm,.ogg,.flac"
                onChange={(e) => {
                  setCloneFile(e.target.files?.[0] || null);
                  setCloneError(null);
                }}
              />
            </Button>
          )}

          {cloneError && (
            <Typography sx={{ fontSize: 12, color: 'var(--error-dark)', mt: 1.5 }}>
              {cloneError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={async () => {
              await resetCloneForm();
              setCloneOpen(false);
            }}
            disabled={cloneLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCloneSubmit}
            disabled={cloneLoading || isCloneRecording}
          >
            {cloneLoading ? 'Cloning…' : 'Create clone'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
