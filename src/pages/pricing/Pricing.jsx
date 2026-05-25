import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getProfile } from '../../store/auth/authSlice';
import {
  Box,
  Typography,
  Button,
  Card,
  Alert,
  CircularProgress,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import { createOrderAPI, verifyPaymentAPI, getPublicPlansAPI } from '../../services';
import { useQuery } from '@tanstack/react-query';

// ─── Constants ────────────────────────────────────────────────────────────────

const PUBLIC_PLANS_QUERY_KEY = ['public', 'plans'];

const PLAN_STYLE_META = {
  free: {
    buttonText: 'Get Started for Free',
  },
  pro: {
    buttonText: 'Subscribe Now',
  },
  elite: {
    buttonText: 'Subscribe Now',
  },
};

const DEFAULT_MONTHLY_TOKENS = {
  free: 25000,
  pro: 500000,
  elite: -1,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });

// ─── Component ────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: plans = [], isLoading, isError } = useQuery({
    queryKey: PUBLIC_PLANS_QUERY_KEY,
    queryFn: async () => {
      const response = await getPublicPlansAPI();
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // Plans rarely change — cache for 5 min
  });

  const handleSubscribe = async (plan, style) => {
    if (plan.id === 'free') { navigate('/'); return; }
    setError(null);
    setSuccess(null);
    setLoadingPlanId(plan.id);

    try {
      const { data: orderData } = await createOrderAPI(plan.id);
      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error('Payment gateway failed to load. Please try again.');

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'HireMate',
        description: `${plan.name} Plan - Career Success`,
        handler: async (response) => {
          try {
            await verifyPaymentAPI({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: plan.id,
            });
            // Refresh Redux user so Navbar shows updated token balance immediately
            dispatch(getProfile());
            setSuccess(`Successfully subscribed to ${plan.name} plan!`);
          } catch (err) {
            setError(err.response?.data?.detail || 'Payment verification failed');
          } finally {
            setLoadingPlanId(null);
          }
        },
        modal: { ondismiss: () => setLoadingPlanId(null) },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to initiate payment';
      setError(msg);
      if (err.response?.status === 401) navigate('/login', { state: { from: '/pricing' } });
      setLoadingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <PageContainer
      sx={{
        px: { xs: 3, sm: 6, md: 8 },  // left/right margin
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box sx={{ textAlign: 'center' }}>

        {/* Badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 2,
            py: 0.75,
            borderRadius: '9999px',
            bgcolor: 'var(--pricing-accent)',
            color: 'var(--white)',
            fontSize: 'var(--font-size-helper)',
            fontWeight: 600,
            mb: 3,
          }}
        >
          <CheckRoundedIcon sx={{ fontSize: 18 }} />
          On a mission to solve unemployment
        </Box>

        {/* Heading */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            fontWeight: 700,
            color: 'var(--text-primary)',
            mb: 1,
            '& span': { color: 'var(--pricing-accent)' },
          }}
        >
          Get Hired <span>2.6x</span> Faster.
        </Typography>
        <Typography
          sx={{
            fontSize: 'var(--font-size-body)',
            color: 'var(--text-secondary)',
            mb: 3,
            maxWidth: 480,
            mx: 'auto',
          }}
        >
          Join thousands of professionals landing interviews with HireMate AI.
        </Typography>

        <Button
          onClick={() => navigate('/usage')}
          startIcon={<AccountBalanceWalletRoundedIcon />}
          sx={{ 
            mb: 6, 
            textTransform: 'none', 
            fontWeight: 700, 
            bgcolor: 'var(--primary)',
            color: 'white',
            px: 4,
            py: 1.2,
            borderRadius: '9999px',
            fontSize: '0.875rem',
            boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)',
            '&:hover': { 
              bgcolor: 'var(--primary-dark)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(6, 182, 212, 0.35)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          View your current usage & limits
        </Button>

        {/* Alerts */}
        {(isError || error) && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error || 'Failed to load subscription plans. Please try again later.'}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Plans Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: `repeat(${Math.min(plans.length, 3)}, 1fr)` },
            gap: 3,
            mb: 5,
          }}
        >
          {plans.map((plan) => {
            const meta = PLAN_STYLE_META[plan.id] || { buttonText: 'Subscribe' };
            const monthlyTokens = plan.monthly_tokens ?? DEFAULT_MONTHLY_TOKENS[plan.id] ?? 0;
            const isFeatured = Boolean(plan.is_featured);
            const highlight = isFeatured;
            const badge = isFeatured ? 'MOST POPULAR' : null;

            return (
              <Card
                key={plan.id}
                sx={{
                  position: 'relative',
                  borderRadius: 'var(--pricing-card-radius)',
                  boxShadow: 'var(--pricing-card-shadow)',
                  border: 2,
                  borderColor: highlight ? 'var(--pricing-accent)' : 'var(--pricing-card-border)',
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {badge && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: 12,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'var(--pricing-badge-bg)',
                      color: 'var(--white)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {badge}
                  </Box>
                )}

                <Box sx={{ p: 3, pt: badge ? 4 : 3, flexGrow: 1 }}>
                  <Typography
                    sx={{ fontSize: 'var(--font-size-section-header)', fontWeight: 700, color: 'var(--text-primary)', mb: 1 }}
                  >
                    {plan.name}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)', mb: 2, minHeight: 40 }}
                  >
                    {plan.description}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography component="span" sx={{ fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)' }}>
                      INR{' '}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {plan.amount / 100}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: 'var(--font-size-helper)', color: 'var(--text-muted)' }}>
                      /{plan.amount === 0 ? 'forever' : 'month'}
                    </Typography>
                  </Box>

                  {/* Monthly Tokens Budget Highlight */}
                  <Box sx={{ 
                    mb: 3, 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(6, 182, 212, 0.05)', 
                    border: '1px solid rgba(6, 182, 212, 0.1)',
                    textAlign: 'center'
                  }}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {monthlyTokens === -1 ? 'Unlimited' : monthlyTokens.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                      AI TOKENS / MONTH
                    </Typography>
                  </Box>

                  <Stack spacing={1.5} sx={{ mb: 4, textAlign: 'left' }}>
                    {(plan.features || []).map((feature, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <CheckCircleRoundedIcon sx={{ color: 'var(--pricing-accent)', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={highlight ? 'contained' : 'outlined'}
                    disabled={!!loadingPlanId}
                    onClick={() => handleSubscribe(plan, meta)}
                    sx={{
                      py: 1.25,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: 'var(--font-size-helper)',
                      borderRadius: 'var(--pricing-card-radius)',
                      ...(highlight
                        ? {
                            bgcolor: 'var(--pricing-accent)',
                            color: 'var(--white)',
                            '&:hover': { bgcolor: 'var(--pricing-accent-dark)' },
                          }
                        : {
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                            '&:hover': {
                              borderColor: 'var(--pricing-accent)',
                              bgcolor: 'var(--sidebar-item-hover-bg)',
                            },
                          }),
                    }}
                  >
                    {loadingPlanId === plan.id ? <CircularProgress size={24} color="inherit" /> : meta.buttonText}
                  </Button>
                </Box>
              </Card>
            );
          })}
        </Box>

        {/* Footer */}
        <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-muted)', mb: 2 }}>
          Cancel anytime • No hidden fees • Instant access
        </Typography>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-helper)',
            fontWeight: 600,
            textDecoration: 'none',
            '&:hover': { color: 'var(--primary)' },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          Back to Dashboard
        </Box>
      </Box>
    </PageContainer>
  );
}
