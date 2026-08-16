import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import { getInterviewAnswerAudioAPI } from '../../services/interviewVoiceService';
import { parseApiError } from '../../utilities/apiErrorUtils';

export default function AnswerAudioPlayer({
  userId,
  interviewId,
  order,
  hasAudio = false,
  label = 'Play answer recording',
  compact = false,
}) {
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [src, setSrc] = useState(null);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  if (!hasAudio) return null;

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
        const res = await getInterviewAnswerAudioAPI(userId, {
          interview_id: interviewId,
          order,
        });
        url = res?.data?.presigned_url;
        if (!url) throw new Error('Playback URL unavailable');
        setSrc(url);
      }

      const audio = audioRef.current || new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      audio.onplay = () => setPlaying(true);
      await audio.play();
      setPlaying(true);
    } catch (err) {
      setError(parseApiError(err, 'Could not play recording'));
      stopPlayback();
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={loadAndPlay}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={14} /> : playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />
          }
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, minWidth: 0 }}
        >
          {playing ? 'Pause' : 'Play'}
        </Button>
        {error && (
          <Typography variant="caption" sx={{ color: 'var(--error-dark)' }}>
            {error}
          </Typography>
        )}
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
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <VolumeUpRoundedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
      <Box sx={{ flex: 1, minWidth: 120 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
          {label}
        </Typography>
        {error && (
          <Typography sx={{ fontSize: 11, color: 'var(--error-dark)', mt: 0.25 }}>
            {error}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={loadAndPlay}
        disabled={loading}
        startIcon={
          loading ? <CircularProgress size={16} color="inherit" /> : playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />
        }
        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
      >
        {playing ? 'Pause' : 'Play recording'}
      </Button>
    </Box>
  );
}
