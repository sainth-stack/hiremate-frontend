import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function streamHasLiveVideo(stream) {
  return stream?.getVideoTracks?.().some((track) => track.readyState === 'live') ?? false;
}

function videoHasFrame(video) {
  return video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
}

export default function InterviewCameraPreview({ stream, placeholder = 'Camera preview' }) {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      setVideoReady(false);
      return undefined;
    }

    let cancelled = false;
    let fallbackTimer = null;

    const markReady = () => {
      if (!cancelled) setVideoReady(true);
    };

    const tryMarkReady = () => {
      if (cancelled) return;
      if (videoHasFrame(video) || streamHasLiveVideo(stream)) {
        markReady();
      }
    };

    setVideoReady(false);
    video.srcObject = stream;

    video.addEventListener('loadedmetadata', tryMarkReady);
    video.addEventListener('loadeddata', tryMarkReady);
    video.addEventListener('canplay', tryMarkReady);
    video.addEventListener('playing', markReady);

    const playAttempt = video.play();
    if (playAttempt?.then) {
      playAttempt.then(() => {
        tryMarkReady();
      }).catch(() => {});
    }

    tryMarkReady();

    fallbackTimer = window.setTimeout(() => {
      if (streamHasLiveVideo(stream)) {
        markReady();
      }
    }, 600);

    return () => {
      cancelled = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      video.removeEventListener('loadedmetadata', tryMarkReady);
      video.removeEventListener('loadeddata', tryMarkReady);
      video.removeEventListener('canplay', tryMarkReady);
      video.removeEventListener('playing', markReady);
    };
  }, [stream]);

  return (
    <Box
      sx={{
        mb: 2,
        maxWidth: 280,
        width: '100%',
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#0f172a',
          border: '1px solid rgba(226,232,240,0.95)',
        }}
      >
        <Box
          component="video"
          ref={videoRef}
          autoPlay
          muted
          playsInline
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: 'scaleX(-1)',
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        />

        {!stream && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
            }}
          >
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', textAlign: 'center' }}>
              {placeholder}
            </Typography>
          </Box>
        )}

        {stream && !videoReady && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              bgcolor: 'rgba(15,23,42,0.55)',
            }}
          >
            <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.85)' }} />
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
              Starting camera…
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
