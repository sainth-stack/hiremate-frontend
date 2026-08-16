import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Checkbox, FormControlLabel,
  Alert, Divider, Button, InputBase, IconButton,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import OpsBrainLogo from '../../components/ui/OpsBrainLogo';
import { login, clearError } from '../../store/auth/authSlice';
import { startGoogleLogin } from '../../services/authService';

function FieldLabel({ children }) {
  return (
    <Typography
      sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.75, display: 'block', letterSpacing: '0.01em' }}
    >
      {children}
    </Typography>
  );
}

function InputField({ icon: Icon, placeholder, value, onChange, onBlur, type = 'text', endAdornment, error }) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1.25, borderRadius: '10px',
        border: `1px solid ${error ? 'var(--error)' : 'var(--border-color)'}`,
        bgcolor: 'var(--bg-paper)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:focus-within': {
          borderColor: error ? 'var(--error)' : 'var(--primary)',
          boxShadow: error
            ? '0 0 0 4px rgba(220,38,38,0.08)'
            : '0 0 0 4px rgba(37,99,235,0.12)',
          bgcolor: 'var(--bg-paper)',
        },
        '&:hover': { 
          borderColor: error ? 'var(--error)' : 'var(--border-hover)',
        },
      }}
    >
      {Icon && <Icon sx={{ fontSize: 18, color: 'var(--text-muted)', flexShrink: 0 }} />}
      <InputBase
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        type={type}
        fullWidth
        sx={{
          fontSize: 14, fontWeight: 500,
          color: 'var(--text-primary)',
          '& input::placeholder': { color: 'var(--placeholder)', opacity: 1 },
        }}
      />
      {endAdornment}
    </Box>
  );
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const redirectTo = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const errors = {
    email: touched.email && !email.trim() ? 'Email is required' : '',
    password: touched.password && !password.trim() ? 'Password is required' : '',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email.trim() || !password.trim()) return;
    dispatch(login({ email: email.trim(), password }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Logo + heading */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <Box sx={{ mb: 4, display: { md: 'none' } }}>
          <OpsBrainLogo variant="full" height={38} darkMode={false} />
        </Box>
        <Typography 
          sx={{ 
            fontSize: 30, 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.03em', 
            mb: 1.25,
            fontFamily: '"Inter", "Poppins", system-ui, -apple-system, sans-serif'
          }}
        >
          Welcome back
        </Typography>
        <Typography 
          sx={{ 
            fontSize: 15, 
            color: 'var(--text-muted)', 
            fontWeight: 500,
            lineHeight: 1.6
          }}
        >
          Enter your details to access your account.
        </Typography>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearError())}
          sx={{
            mb: 2.5, borderRadius: 2, fontSize: 13,
            bgcolor: 'rgba(220,38,38,0.08)', color: 'var(--error)',
            border: '1px solid rgba(220,38,38,0.2)',
            '& .MuiAlert-icon': { color: 'var(--error)' },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2,width: '100%' }}>

        {/* Email */}
        <Box sx={{ width: '100%' }}>
          <FieldLabel>Email address</FieldLabel>
          <InputField
            icon={EmailOutlinedIcon}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={!!errors.email}
          />
          {errors.email && (
            <Typography sx={{ fontSize: 12, color: 'var(--error)', mt: 0.5, ml: 0.25 }}>{errors.email}</Typography>
          )}
        </Box>

        {/* Password */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <FieldLabel>Password</FieldLabel>
            <Typography
              component={Link}
              to="/forgot-password"
              sx={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Forgot password?
            </Typography>
          </Box>
          <InputField
            icon={LockOutlinedIcon}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            type={showPassword ? 'text' : 'password'}
            error={!!errors.password}
            endAdornment={
              <IconButton
                size="small"
                onClick={() => setShowPassword((v) => !v)}
                sx={{ color: 'var(--text-muted)', p: 0.25, flexShrink: 0 }}
                tabIndex={-1}
              >
                {showPassword
                  ? <VisibilityOffRoundedIcon sx={{ fontSize: 17 }} />
                  : <VisibilityRoundedIcon sx={{ fontSize: 17 }} />
                }
              </IconButton>
            }
          />
          {errors.password && (
            <Typography sx={{ fontSize: 12, color: 'var(--error)', mt: 0.5, ml: 0.25 }}>{errors.password}</Typography>
          )}
        </Box>

        {/* Remember me */}
        <FormControlLabel
          sx={{ mt: -0.5, mb: -0.5 }}
          control={
            <Checkbox
              size="small"
              sx={{
                color: 'var(--border-color)',
                '&.Mui-checked': { color: 'var(--primary)' },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Remember this device
            </Typography>
          }
        />

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 0.5, height: 44, borderRadius: '10px',
            textTransform: 'none', fontWeight: 700, fontSize: 15,
            bgcolor: 'var(--primary-dark)',
            background: loading ? undefined : 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
            boxShadow: '0 4px 12px rgba(15,30,53,0.25)',
            letterSpacing: '0.01em',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(15,30,53,0.3)',
              background: 'linear-gradient(135deg, #162a4a 0%, #2547a8 100%)',
            },
            '&:active': { transform: 'translateY(0)' },
            '&:disabled': { opacity: 0.7 },
          }}
        >
          {loading
            ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Signing in…
              </Box>
            )
            : 'Sign in'
          }
        </Button>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3, borderColor: 'var(--divider)' }}>
        <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, px: 1 }}>
          or continue with
        </Typography>
      </Divider>

      {/* Google */}
      <Button
        fullWidth
        variant="outlined"
        onClick={startGoogleLogin}
        sx={{
          height: 44, borderRadius: '10px', textTransform: 'none',
          fontWeight: 600, fontSize: 14, gap: 1.5,
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          bgcolor: 'var(--bg-paper)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          '&:hover': {
            borderColor: 'var(--border-hover)',
            bgcolor: 'var(--sidebar-item-hover-bg)',
          },
        }}
        startIcon={
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        }
      >
        Continue with Google
      </Button>

      {/* Footer */}
      <Typography sx={{ mt: 3, fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
        Don&apos;t have an account?{' '}
        <Typography
          component={Link}
          to="/register"
          sx={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Create one
        </Typography>
      </Typography>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}
