import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { createIssueAPI } from '../../services';
import logoImg from '../../assets/opsbrain-logo-full.png';

const REASON_OPTIONS = [
  'Pop-up was too frequent',
  'Not enough jobs that matched my preferences',
  "Autofill didn't work on my target job platforms",
  'Autofill filled incorrect information',
  'Autofill was too slow',
  'Not enough daily credits for me',
  "I didn't know how to get started",
  'I found a job / no longer job searching',
];

function buildMetadata() {
  const ua = navigator.userAgent;
  return {
    url: window.location.href,
    user_agent: ua,
    browser: (() => {
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      return 'Unknown';
    })(),
    os: (() => {
      if (ua.includes('Win')) return 'Windows';
      if (ua.includes('Mac')) return 'macOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
      return 'Unknown';
    })(),
  };
}

export default function ExtensionUninstallPage() {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const metadata = useMemo(() => buildMetadata(), []);

  const handleToggleReason = (reason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((item) => item !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: 'Extension uninstall feedback',
        description: [
          selectedReasons.length ? `Selected reasons: ${selectedReasons.join(', ')}` : 'Selected reasons: none',
          comment.trim() ? `Additional feedback: ${comment.trim()}` : 'Additional feedback: none',
        ].join('\n'),
        category: 'other',
        source: 'extension',
        metadata: {
          ...metadata,
          feedback_type: 'extension_uninstall',
          reasons: selectedReasons,
        },
      };
      await createIssueAPI(payload);
      setSubmitted(true);
    } catch {
      setError('Could not submit feedback. Please try again or email support.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: 2,
        py: { xs: 3, sm: 6 },
        bgcolor: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 920,
          borderRadius: 3,
          border: '1px solid var(--border-color)',
          boxShadow: '0 12px 38px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          {submitted ? (
            <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 6 } }}>
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  bgcolor: 'rgba(16,185,129,0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <CheckCircleRoundedIcon sx={{ color: '#10b981', fontSize: 40 }} />
              </Box>
              <Typography sx={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', mb: 1 }}>
                Thanks for your feedback
              </Typography>
              <Typography sx={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                We shared your response with our support team.
              </Typography>
              <Typography sx={{ color: 'var(--text-secondary)', fontSize: 14, mt: 0.75 }}>
                If you need help, contact `sainathreddyguraka@gmail.com`.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' },
                gap: 3,
                alignItems: 'stretch',
              }}
            >
              <Box
                sx={{
                  borderRadius: 2,
                  border: '1px solid var(--border-color)',
                  bgcolor: 'var(--bg-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    component="img"
                    src={logoImg}
                    alt="OpsBrain"
                    sx={{ height: 44, objectFit: 'contain', mb: 2 }}
                  />
                  <Typography sx={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    We are sorry to see you go.
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: { xs: 23, sm: 28 }, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Help us improve OpsBrain
                </Typography>
                <Typography sx={{ mt: 0.5, mb: 2.5, color: 'var(--text-secondary)', fontSize: 14 }}>
                  Your feedback helps us improve extension quality and support.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <FormGroup sx={{ mb: 2 }}>
                  {REASON_OPTIONS.map((reason) => (
                    <FormControlLabel
                      key={reason}
                      control={
                        <Checkbox
                          checked={selectedReasons.includes(reason)}
                          onChange={() => handleToggleReason(reason)}
                          sx={{ color: 'var(--border-color)' }}
                        />
                      }
                      label={<Typography sx={{ color: 'var(--text-primary)', fontSize: 14 }}>{reason}</Typography>}
                    />
                  ))}
                </FormGroup>

                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Other feedback (optional)"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'var(--bg-paper)',
                    },
                  }}
                />

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{
                    width: '100%',
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: 'var(--btn-primary)',
                    '&:hover': { bgcolor: 'var(--btn-primary-hover)' },
                  }}
                >
                  {submitting ? <CircularProgress size={18} color="inherit" /> : 'Submit'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
