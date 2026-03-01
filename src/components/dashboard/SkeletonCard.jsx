import { Box } from '@mui/material';

export default function SkeletonCard({ height = 128 }) {
  return (
    <Box
      sx={{
        height: typeof height === 'number' ? height : 128,
        borderRadius: 'var(--dashboard-card-radius)',
        border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
        background:
          'linear-gradient(90deg, rgba(15, 23, 42, 0.03) 0%, rgba(15, 23, 42, 0.06) 40%, rgba(15, 23, 42, 0.03) 80%)',
        backgroundSize: '240% 100%',
        animation: 'shimmer 1.25s ease-in-out infinite',
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '120% 0' },
          '100%': { backgroundPosition: '-120% 0' },
        },
      }}
    />
  );
}
