import { Box, Typography, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function LinearMeter({ value, color = 'primary' }) {
  return (
    <Box sx={{ height: 8, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <Box
        sx={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: '100%',
          borderRadius: 1,
          bgcolor: color === 'error' ? 'error.main' : color === 'warning' ? 'warning.main' : 'var(--primary)',
          transition: 'width 0.4s ease',
        }}
      />
    </Box>
  );
}

export default function ATSScoreCard({ score = 0, density = 0, warnings = [] }) {
  const scoreColor = score >= 70 ? 'primary' : score >= 40 ? 'warning' : 'error';

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: '#fff',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          ATS skill score
        </Typography>
        <Tooltip title="Skills are normalized for ATS parsing. Keep keywords relevant to your target role.">
          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
        </Tooltip>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: `var(--${scoreColor === 'primary' ? 'primary' : scoreColor === 'warning' ? 'warning' : 'error'})`, lineHeight: 1 }}>
            {score}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: 11 }}>out of 100</Typography>
          <Box sx={{ mt: 1 }}>
            <LinearMeter value={score} color={scoreColor} />
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Skill density</Typography>
          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: 11 }}>Relevant keywords</Typography>
          <Box sx={{ mt: 1 }}>
            <LinearMeter value={density} />
          </Box>
        </Box>
      </Box>

      {warnings.length > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Typography variant="caption" sx={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
            Warnings
          </Typography>
          {warnings.map((w, i) => (
            <Typography key={i} variant="caption" sx={{ display: 'block', fontSize: 11, color: 'warning.main' }}>
              • {w}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
