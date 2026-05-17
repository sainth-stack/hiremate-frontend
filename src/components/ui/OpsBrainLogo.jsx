import { Box } from '@mui/material';
import logoFull from '../../assets/opsbrain-logo-full.png';

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
  const logoAspectRatio = 1978 / 598;
  const width = Math.round(height * logoAspectRatio);
  const isDarkSurface = Boolean(darkMode);
  const logoWidth = variant === 'icon' ? height : variant === 'text' ? Math.round(width * 0.7) : width;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height,
        width: logoWidth,
        borderRadius: 0,
        px: 0,
        py: 0,
        bgcolor: 'transparent',
        ...sx,
      }}
    >
      <Box
        component="img"
        src={logoFull}
        alt="OpsBrain"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: variant === 'icon' ? 'left center' : variant === 'text' ? 'right center' : 'center',
          display: 'block',
          opacity: 1,
          filter: isDarkSurface
            ? 'contrast(1.12) saturate(1.08) drop-shadow(0 0 1px rgba(255,255,255,0.25))'
            : 'contrast(1.08) saturate(1.06)',
        }}
      />
    </Box>
  );
}
