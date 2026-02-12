import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';

const PLANS = [
  {
    id: 'daily',
    title: 'Daily',
    description: "You've spent more by accident.",
    price: '199.00',
    period: 'day',
    highlight: false,
  },
  {
    id: 'weekly',
    title: 'Weekly',
    description: 'A night out or an interview, your call.',
    price: '999.00',
    period: 'week',
    highlight: true,
    badge: 'BEST DEAL',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    description: "It's cheaper than skipping it, we've done the math.",
    price: '2499.00',
    period: 'month',
    highlight: false,
  },
];

const FEATURES = [
  'Unlimited resume generation',
  'AI-powered auto-fill',
  'Smart role recommendations',
  'Unlimited resume storage',
  'Application tracker',
];

export default function Pricing() {
  return (
    <PageContainer maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Box sx={{ textAlign: 'center' }}>
        {/* Mission badge */}
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
            mb: 5,
            maxWidth: 480,
            mx: 'auto',
          }}
        >
          91% of our users report getting an interview within 2 weeks of subscribing
        </Typography>

        {/* Pricing cards */}
        <Box
          sx={{
            width: { xs: '100%', sm: '80%' },
            maxWidth: 1200,
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 5,
          }}
        >
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              sx={{
                position: 'relative',
                borderRadius: 'var(--pricing-card-radius)',
                boxShadow: 'var(--pricing-card-shadow)',
                border: 2,
                borderColor: plan.highlight ? 'var(--pricing-accent)' : 'var(--pricing-card-border)',
                overflow: 'visible',
              }}
            >
              {plan.badge && (
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
                  {plan.badge}
                </Box>
              )}
              <CardContent sx={{ p: 3, pt: plan.badge ? 4 : 3 }}>
                <Typography
                  sx={{
                    fontSize: 'var(--font-size-section-header)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    mb: 1,
                  }}
                >
                  {plan.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 'var(--font-size-helper)',
                    color: 'var(--text-secondary)',
                    mb: 2,
                  }}
                >
                  {plan.description}
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography component="span" sx={{ fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)' }}>
                    INR{' '}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography component="span" sx={{ fontSize: 'var(--font-size-helper)', color: 'var(--text-muted)' }}>
                    /{plan.period}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant={plan.highlight ? 'contained' : 'outlined'}
                  sx={{
                    py: 1.25,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 'var(--font-size-helper)',
                    borderRadius: 'var(--pricing-card-radius)',
                    ...(plan.highlight
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
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Features */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 2 }}>
          <LockRoundedIcon sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
          <Typography sx={{ fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)' }}>
            Every plan unlocks everything
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
            mb: 4,
          }}
        >
          {FEATURES.map((feature) => (
            <Box
              key={feature}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '9999px',
                bgcolor: 'var(--pricing-accent)',
                color: 'var(--white)',
                fontSize: 'var(--font-size-helper)',
                fontWeight: 500,
              }}
            >
              <CheckRoundedIcon sx={{ fontSize: 16 }} />
              {feature}
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            mb: 2,
          }}
        >
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
