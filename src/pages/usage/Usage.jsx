import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  LinearProgress,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PageContainer from '../../components/common/PageContainer';
import {
  getMonthlyTokenLimit,
  getRemainingTokens,
  isUnlimitedUser,
} from '../../utilities/tokenUtils';

export default function Usage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [timeLeft, setTimeLeft] = useState('');

  const activeUser = user;

  const isUnlimited = isUnlimitedUser(activeUser);
  const totalTokens = getMonthlyTokenLimit(activeUser);
  const remainingTokens = getRemainingTokens(activeUser);
  const usedTokens = isUnlimited
    ? activeUser?.total_tokens_consumed ?? 0
    : Math.max(0, totalTokens - remainingTokens);
  const usedPercent = isUnlimited ? 0 : Math.min(100, Math.round((usedTokens / totalTokens) * 100));

  useEffect(() => {
    if (!activeUser?.last_token_reset) return;

    const calculateTimeLeft = () => {
      const resetDate = new Date(activeUser.last_token_reset);
      resetDate.setDate(resetDate.getDate() + 30);
      
      const now = new Date();
      const diff = resetDate - now;

      if (diff <= 0) return 'Resetting...';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);

      return `${days}d ${hours}h ${mins}m`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, [activeUser?.last_token_reset]);

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Usage & Limits
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Track your token consumption and plan limits
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: 'var(--text-secondary)', textTransform: 'none' }}
          >
            Back
          </Button>
        </Box>

        {/* Main Usage Card */}
        <Card sx={{ 
          p: 4, 
          borderRadius: 3, 
          bgcolor: 'var(--card-bg)', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Stack spacing={4}>
            {/* Monthly Budget Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Monthly Token Budget
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    {isUnlimited ? 'No monthly limit' : `Resets in ${timeLeft || '—'}`}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {isUnlimited ? 'Unlimited' : `${usedPercent}% used`}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={usedPercent} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5, 
                  bgcolor: 'rgba(0,0,0,0.05)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    bgcolor: 'var(--primary)'
                  }
                }} 
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  {isUnlimited ? 'Unlimited Tokens' : `${remainingTokens.toLocaleString()} tokens remaining`}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  of {isUnlimited ? '∞' : totalTokens.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Quick Stats Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(6, 182, 212, 0.04)', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccountBalanceWalletRoundedIcon sx={{ fontSize: 18, color: 'var(--primary)' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    CURRENT BALANCE
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isUnlimited ? 'Unlimited' : remainingTokens.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <HistoryRoundedIcon sx={{ fontSize: 18, color: '#6366F1' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    LIFETIME CONSUMPTION
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {activeUser?.total_tokens_consumed?.toLocaleString() || 0}
                </Typography>
              </Box>
            </Box>

            {/* AI Action Costs Table */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                AI Feature Costs <InfoOutlinedIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 2 }}>
                Costs are based on actual AI tokens consumed per request.
              </Typography>
              <Stack spacing={1}>
                {[
                  { label: 'Resume Analysis / ATS Scan', cost: '~500 – 2,000 tokens' },
                  { label: 'AI Resume Tailoring', cost: '~1,500 – 4,000 tokens' },
                  { label: 'Mock Interview (per session)', cost: '~1,000 – 3,000 tokens' },
                  { label: 'Company Briefing', cost: '~500 – 1,500 tokens' },
                  { label: 'Chat / Interview Practice', cost: '~200 – 800 tokens / message' },
                  { label: 'Gmail Email Classification', cost: '~300 – 800 tokens / email' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                  }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {item.cost}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Card>

        {/* Upgrade Prompt */}
        {!isUnlimited && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/pricing')}
              sx={{
                bgcolor: 'var(--primary)',
                '&:hover': { bgcolor: 'var(--primary-dark)' },
                textTransform: 'none',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              Need more tokens? Upgrade Plan
            </Button>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
}
