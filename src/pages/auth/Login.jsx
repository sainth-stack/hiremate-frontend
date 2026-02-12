import './style.scss';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Checkbox, FormControlLabel, Alert } from '@mui/material';
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/inputs/CustomInput';
import { login, clearError } from '../../store/auth/authSlice';

const REQUIRED_MSG = 'Required.';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Login success: always redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const errors = {
    email: touched.email && !email.trim() ? REQUIRED_MSG : '',
    password: touched.password && !password.trim() ? REQUIRED_MSG : '',
  };
  const showErrors = touched.email || touched.password;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email.trim() || !password.trim()) return;
    dispatch(login({ email: email.trim(), password }));
  };

  return (
    <Box className="auth-page">
      <Typography variant="h4" fontWeight={700} color="text.primary">
        Login to your account
      </Typography>

      <Box component="form" noValidate onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}
        <CustomInput
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={showErrors && !!errors.email}
          helperText={showErrors ? errors.email : ''}
        />
        <CustomInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={showErrors && !!errors.password}
          helperText={showErrors ? errors.password : ''}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={
            <Typography variant="body2" color="text.secondary">
              Remember this device
            </Typography>
          }
        />
        <CustomButton fullWidth type="submit" sx={{ py: 1.5 }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </CustomButton>
      </Box>

      <Typography className="auth-page__footer">
        Don&apos;t have an account?{' '}
        <Typography component={Link} to="/register">
          Register
        </Typography>
      </Typography>
    </Box>
  );
}
