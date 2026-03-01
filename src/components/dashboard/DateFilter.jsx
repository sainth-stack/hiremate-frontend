import { useState } from 'react';
import { Box, Button, ButtonGroup, TextField, Collapse } from '@mui/material';

const PRESETS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
];

export default function DateFilter({ value, onChange }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const handlePreset = (days) => {
    setShowCustom(false);
    onChange({ preset: days, from: null, to: null });
  };

  const handleCustomApply = () => {
    if (customFrom && customTo && customFrom <= customTo) {
      onChange({ preset: null, from: customFrom, to: customTo });
      setShowCustom(false);
    }
  };

  const isPresetActive = (days) => value?.preset === days && !value?.from;
  const isCustomActive = !!value?.from;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center',justifyContent: 'end', gap: 1.5 }}>
      <ButtonGroup
        size="small"
        variant="outlined"
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
          bgcolor: 'var(--bg-paper)',
          '& .MuiButton-root': {
            border: 'none',
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 700,
            px: 2,
            py: 0.9,
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease',
            '&:not(:last-of-type)': { borderRight: '1px solid var(--dashboard-border-subtle, var(--border-color))' },
            '&:active': { transform: 'scale(0.98)' },
          },
        }}
      >
        {PRESETS.map((p) => (
          <Button
            key={p.days}
            onClick={() => handlePreset(p.days)}
            sx={{
              color: isPresetActive(p.days) ? '#fff !important' : 'var(--text-secondary)',
              bgcolor: isPresetActive(p.days) ? 'var(--primary)' : 'transparent',
              '&:hover': {
                bgcolor: isPresetActive(p.days) ? 'var(--primary-dark)' : 'var(--light-blue-bg-08)',
                color: isPresetActive(p.days) ? '#fff !important' : 'var(--primary)',
              },
            }}
          >
            {p.label}
          </Button>
        ))}
        <Button
          onClick={() => setShowCustom((v) => !v)}
          sx={{
            color: isCustomActive ? '#fff !important' : showCustom ? 'var(--primary)' : 'var(--text-secondary)',
            bgcolor: isCustomActive ? 'var(--primary)' : 'transparent',
            '&:hover': {
              bgcolor: isCustomActive ? 'var(--primary-dark)' : 'var(--light-blue-bg-08)',
              color: isCustomActive ? '#fff !important' : 'var(--primary)',
            },
          }}
        >
          {isCustomActive ? `${value.from} → ${value.to}` : 'Custom'}
        </Button>
      </ButtonGroup>
      <Collapse in={showCustom} timeout={220} sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mt: 1.5,
            p: 2,
            borderRadius: '12px',
            bgcolor: 'var(--bg-paper)',
            border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
            boxShadow: '0 12px 30px rgba(16, 24, 40, 0.08)',
            transform: showCustom ? 'translateY(0)' : 'translateY(-4px)',
            opacity: showCustom ? 1 : 0,
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
        >
          <TextField
            type="date"
            size="small"
            label="From"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 160,
              '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(16, 24, 40, 0.01)' },
            }}
          />
          <TextField
            type="date"
            size="small"
            label="To"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 160,
              '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(16, 24, 40, 0.01)' },
            }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={handleCustomApply}
            sx={{
              textTransform: 'none',
              borderRadius: '10px',
              px: 2,
              py: 0.95,
              fontWeight: 800,
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': { boxShadow: '0 10px 20px rgba(37, 99, 235, 0.18)', transform: 'translateY(-1px)' },
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            Apply
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
