import { Box, Typography, TextField } from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import JobDescriptionField from '../../../components/inputs/JobDescriptionField';

const inputSx = {
  fontFamily: 'var(--font-family)',
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: 'rgba(0,0,0,0.12)' },
    '&:hover fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' },
    '&.Mui-focused fieldset': { borderWidth: '2px' },
  },
};

export default function JobDescriptionInput({
  role = '',
  jobDescription = '',
  onRoleChange,
  onJobDescriptionChange,
  sx = {},
}) {
  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <WorkOutlineRoundedIcon sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
        <Typography
          sx={{
            fontFamily: 'var(--font-family)',
            fontWeight: 500,
            fontSize: 'var(--font-size-body)',
            color: 'var(--text-primary)',
          }}
        >
          What role are you applying for?
        </Typography>
      </Box>
      <TextField
        fullWidth
        value={role}
        onChange={(e) => onRoleChange?.(e.target.value)}
        placeholder="e.g., Senior Software Engineer, Product Manager..."
        variant="outlined"
        size="small"
        sx={{ mb: 1.5, ...inputSx }}
        InputProps={{ sx: { fontFamily: 'var(--font-family)' } }}
      />

      <JobDescriptionField
        value={jobDescription}
        onChange={onJobDescriptionChange}
      />
    </Box>
  );
}
