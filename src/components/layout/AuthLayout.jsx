import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import OpsBrainLogo from '../ui/OpsBrainLogo';

const FEATURES = [
  { 
    icon: SearchRoundedIcon, 
    text: 'Smart Job Search powered by AI',
    color: '#06B6D4'
  },
  { 
    icon: BoltRoundedIcon, 
    text: 'Auto Apply to jobs with one click',
    color: '#10B981'
  },
  { 
    icon: BarChartRoundedIcon, 
    text: 'Track applications with real-time analytics',
    color: '#06B6D4'
  },
  { 
    icon: MicRoundedIcon, 
    text: 'AI-powered mock interview practice',
    color: '#10B981'
  },
];

export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

      {/* ── Left panel ── */}
      <Box
        sx={{
          flex: { md: '0 0 48%' },
          background: 'linear-gradient(145deg, #0F1E35 0%, #1E3A8A 50%, #0F1E35 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: 6,
          py: 5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <Box sx={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
          <OpsBrainLogo variant="full" height={44} darkMode={true} />
        </Box>

        {/* Hero copy */}
        <Box sx={{ zIndex: 1 }}>
          <Box
            sx={{
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 1.25,
              px: 1.25, 
              py: 0.5, 
              borderRadius: '6px',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              mb: 3,
            }}
          >
            <Box 
              sx={{ 
                width: 5, 
                height: 5, 
                borderRadius: '50%', 
                bgcolor: '#06B6D4',
                boxShadow: '0 0 10px #06B6D4'
              }} 
            />
            <Typography 
              sx={{ 
                fontSize: 11, 
                fontWeight: 700, 
                color: 'rgba(255, 255, 255, 0.8)', 
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              AI-Powered Job Intelligence
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: { md: 38, lg: 48 },
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              mb: 2.5,
              fontFamily: '"Inter", "Poppins", system-ui, -apple-system, sans-serif',
            }}
          >
            The brain for{' '}
            <Box component="span" sx={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 800,
            }}>
              your career.
            </Box>
          </Typography>

          <Typography sx={{ 
            fontSize: 16, 
            color: 'rgba(255, 255, 255, 0.65)', 
            lineHeight: 1.65, 
            mb: 5, 
            maxWidth: 460, 
            fontWeight: 500,
            fontFamily: '"Inter", "Poppins", system-ui, -apple-system, sans-serif',
          }}>
            The enterprise-grade AI platform designed to automate your job search, 
            optimize your applications, and master your interviews.
          </Typography>

          {/* Feature list */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {FEATURES.map((f) => {
              const IconComponent = f.icon;
              return (
                <Box key={f.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                    bgcolor: `${f.color}15`,
                    border: `1px solid ${f.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconComponent sx={{ fontSize: 18, color: f.color }} />
                  </Box>
                  <Typography sx={{ fontSize: 14, color: '#cbd5e1', fontWeight: 500 }}>
                    {f.text}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Bottom tagline */}
        <Box sx={{ zIndex: 1 }}>
          <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
            Efficient. Trustworthy. AI-Powered. Goal-Oriented.
          </Typography>
        </Box>
      </Box>

      {/* ── Right panel (form) ── */}
      <Box
        sx={{
          flex: { md: '0 0 52%' },
          bgcolor: 'var(--bg-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 5, md: 4 },
          px: { xs: 2, sm: 5 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
