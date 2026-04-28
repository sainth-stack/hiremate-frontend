import { Box } from '@mui/material';

/**
 * OpsBrain Logo Component
 * Professional SaaS-level logo combining brain + circuit + lightning elements
 * Follows brand guidelines with clean, modern design
 */
export default function OpsBrainLogo({ 
  variant = 'full', // 'full' | 'icon' | 'text'
  height = 40, 
  darkMode = false,
  sx = {} 
}) {
  const primaryColor = darkMode ? '#ffffff' : '#0F1E35';
  const accentColor = '#06B6D4';
  const secondaryAccent = '#10B981';

  // Icon only (brain + circuit + lightning fusion)
  const LogoIcon = () => (
    <svg
      width={height}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor={secondaryAccent} />
        </linearGradient>
        <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={secondaryAccent} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Background circle with subtle glow */}
      <circle cx="24" cy="24" r="22" fill={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,30,53,0.03)'} />
      
      {/* Brain outline (left hemisphere) */}
      <path
        d="M18 14C16 14 14 15.5 14 18C14 19.5 14.5 20.5 15 21.5C14 22 13 23.5 13 25.5C13 28 14.5 30 17 30.5C17 31.5 17.5 33 19 33.5C19.5 34 21 34.5 22.5 34"
        stroke="url(#brain-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Brain outline (right hemisphere) */}
      <path
        d="M30 14C32 14 34 15.5 34 18C34 19.5 33.5 20.5 33 21.5C34 22 35 23.5 35 25.5C35 28 33.5 30 31 30.5C31 31.5 30.5 33 29 33.5C28.5 34 27 34.5 25.5 34"
        stroke="url(#brain-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Circuit nodes (tech element) */}
      <circle cx="20" cy="20" r="2" fill={accentColor} />
      <circle cx="28" cy="20" r="2" fill={secondaryAccent} />
      <circle cx="20" cy="28" r="2" fill={secondaryAccent} />
      <circle cx="28" cy="28" r="2" fill={accentColor} />
      <circle cx="24" cy="24" r="2.5" fill="url(#brain-gradient)" />

      {/* Circuit lines */}
      <line x1="20" y1="20" x2="22" y2="22" stroke="url(#circuit-gradient)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="20" x2="26" y2="22" stroke="url(#circuit-gradient)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="28" x2="22" y2="26" stroke="url(#circuit-gradient)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="28" x2="26" y2="26" stroke="url(#circuit-gradient)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Lightning bolt (AI power element) */}
      <path
        d="M24 10L22 18H26L24 26"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );

  // Text component
  const LogoText = () => (
    <Box
      component="span"
      sx={{
        fontFamily: '"Inter", "Poppins", system-ui, -apple-system, sans-serif',
        fontSize: height * 0.55,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: primaryColor,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      Ops
      <Box
        component="span"
        sx={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${secondaryAccent} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Brain
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: variant === 'full' ? 1.5 : 0,
        height: height,
        ...sx,
      }}
    >
      {(variant === 'full' || variant === 'icon') && <LogoIcon />}
      {(variant === 'full' || variant === 'text') && <LogoText />}
    </Box>
  );
}
