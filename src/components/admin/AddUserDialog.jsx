import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { createAdminUserAPI } from '../../services';
import { parseApiError } from '../../utilities/apiErrorUtils';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: 'var(--bg-paper)',
    '& fieldset': { borderColor: 'var(--border-color)' },
    '&:hover fieldset': { borderColor: 'var(--border-hover)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
  },
};

const DEFAULT_PASSWORD = 'Welcome@123';

export default function AddUserDialog({
  open,
  onClose,
  onCreated,
  showAdminToggle = false,
  title = 'Add new user',
  subtitle = 'Create an account so they can sign in and take interviews.',
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword(DEFAULT_PASSWORD);
    setShowPassword(false);
    setIsAdmin(false);
    setError(null);
  }, [open]);

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.trim().length >= 6;

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    createAdminUserAPI({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password: password.trim(),
      is_admin: showAdminToggle ? isAdmin : false,
    })
      .then((res) => {
        onCreated?.(res?.data);
        onClose();
      })
      .catch((err) => setError(parseApiError(err, 'Failed to create user')))
      .finally(() => setSubmitting(false));
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'var(--light-blue-bg-08)',
              color: 'var(--primary)',
              flexShrink: 0,
            }}
          >
            <PersonAddRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>{title}</Typography>
            <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mt: 0.35 }}>{subtitle}</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} disabled={submitting} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: '10px',
              bgcolor: 'var(--error-bg)',
              color: 'var(--error-dark)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {error}
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', mb: 0.75 }}>
              First name
            </Typography>
            <TextField
              fullWidth
              size="small"
              autoFocus
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              sx={fieldSx}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', mb: 0.75 }}>
              Last name
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              sx={fieldSx}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', mb: 0.75 }}>
            Email
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="email"
            placeholder="jane.doe@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={fieldSx}
          />
        </Box>

        <Box sx={{ mb: showAdminToggle ? 1.5 : 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', mb: 0.75 }}>
            Temporary password
          </Typography>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Share this with the user. They can change it after first login."
            FormHelperTextProps={{ sx: { fontSize: 11, mt: 0.75 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                    {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />
        </Box>

        {showAdminToggle && (
          <FormControlLabel
            control={
              <Checkbox
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Grant admin access
              </Typography>
            }
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid var(--divider)', gap: 1 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <PersonAddRoundedIcon />}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 2.5 }}
        >
          {submitting ? 'Creating…' : 'Create user'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
