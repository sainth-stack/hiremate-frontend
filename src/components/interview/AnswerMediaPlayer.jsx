import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import {
  downloadInterviewMediaBlob,
  fetchInterviewMediaBlob,
} from '../../services/interviewVoiceService';
import { parseApiError } from '../../utilities/apiErrorUtils';

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function extensionForBlob(blob, kind) {
  const type = blob?.type || '';
  if (type.includes('mpeg') || type.includes('mp3')) return kind === 'video' ? 'mp4' : 'mp3';
  if (type.includes('mp4')) return 'mp4';
  if (type.includes('webm')) return 'webm';
  return kind === 'video' ? 'mp4' : 'mp3';
}

function waitForCanPlay(element) {
  if (element.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      element.removeEventListener('canplay', onReady);
      element.removeEventListener('error', onError);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Could not decode media'));
    };
    element.addEventListener('canplay', onReady, { once: true });
    element.addEventListener('error', onError, { once: true });
  });
}

function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

export default function AnswerMediaPlayer({
  userId,
  interviewId,
  order,
  kind = 'audio',
  hasMedia = false,
  label,
  compact = false,
}) {
  const mediaRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [src, setSrc] = useState(null);

  const isVideo = kind === 'video';
  const defaultLabel = isVideo ? 'Your video answer' : 'Play answer recording';

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(() => {
    const el = mediaRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => {
    stopPlayback();
    cleanupObjectUrl();
  }, [cleanupObjectUrl, stopPlayback]);

  if (!hasMedia) return null;

  const loadAndPlay = async () => {
    setError(null);
    if (playing) {
      stopPlayback();
      return;
    }
    try {
      setLoading(true);
      let url = src;
      if (!url) {
        const blob = await fetchInterviewMediaBlob(userId, {
          interview_id: interviewId,
          order,
          kind,
        });
        if (!blob || blob.size < 32) {
          throw new Error('Recording file is empty');
        }
        url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setSrc(url);
        await waitForNextPaint();
      }
      const el = mediaRef.current;
      if (!el) {
        throw new Error('Player not ready');
      }
      el.onended = () => setPlaying(false);
      el.onpause = () => setPlaying(false);
      el.onplay = () => setPlaying(true);
      await waitForCanPlay(el);
      await el.play();
      setPlaying(true);
    } catch (err) {
      setError(parseApiError(err, `Could not play ${isVideo ? 'video' : 'recording'}`));
      stopPlayback();
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setError(null);
    try {
      setDownloading(true);
      const blob = await downloadInterviewMediaBlob(userId, {
        interview_id: interviewId,
        order,
        kind,
      });
      triggerBlobDownload(blob, `interview_q${order}_${kind}.${extensionForBlob(blob, kind)}`);
    } catch (err) {
      setError(parseApiError(err, 'Could not download file'));
    } finally {
      setDownloading(false);
    }
  };

  const controls = (
    <>
      <Button
        size="small"
        variant={compact ? 'outlined' : 'contained'}
        onClick={loadAndPlay}
        disabled={loading || downloading}
        startIcon={
          loading
            ? <CircularProgress size={14} />
            : playing
              ? <PauseRoundedIcon />
              : <PlayArrowRoundedIcon />
        }
        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, minWidth: compact ? 0 : undefined }}
      >
        {playing ? 'Pause' : (isVideo ? 'Play video' : 'Play')}
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={handleDownload}
        disabled={loading || downloading}
        startIcon={downloading ? <CircularProgress size={14} /> : <DownloadRoundedIcon />}
        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
      >
        Download
      </Button>
    </>
  );

  const hiddenMediaStyle = compact
    ? {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }
    : null;

  const mediaElement = isVideo ? (
    <video
      ref={mediaRef}
      src={src || undefined}
      controls
      playsInline
      preload="metadata"
      style={{
        width: '100%',
        maxHeight: compact ? 0 : 280,
        borderRadius: 8,
        backgroundColor: '#000',
        display: compact ? undefined : (src ? 'block' : 'none'),
        ...hiddenMediaStyle,
      }}
    />
  ) : (
    <audio
      ref={mediaRef}
      src={src || undefined}
      controls
      preload="metadata"
      style={{
        width: '100%',
        display: compact ? undefined : (src ? 'block' : 'none'),
        ...hiddenMediaStyle,
      }}
    />
  );

  if (compact) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        {controls}
        {error && (
          <Typography variant="caption" sx={{ color: 'var(--error-dark)' }}>
            {error}
          </Typography>
        )}
        <Box sx={{ position: 'relative', width: 0, height: 0, overflow: 'hidden' }}>
          {mediaElement}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'var(--light-blue-bg-04)',
        border: '1px solid rgba(37,99,235,0.15)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: src ? 1.5 : 1, flexWrap: 'wrap' }}>
        {isVideo
          ? <VideocamRoundedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
          : <VolumeUpRoundedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />}
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
          {label || defaultLabel}
        </Typography>
        {controls}
      </Box>
      {error && (
        <Typography sx={{ fontSize: 11, color: 'var(--error-dark)', mb: 1 }}>
          {error}
        </Typography>
      )}
      {mediaElement}
    </Box>
  );
}
