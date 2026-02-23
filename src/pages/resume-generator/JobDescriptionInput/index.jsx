import { useState, useCallback } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';

const MAX_FILE_MB = 5;
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
  const [isDragging, setIsDragging] = useState(false);
  const [pasteError, setPasteError] = useState('');

  const handlePasteFromClipboard = useCallback(async () => {
    setPasteError('');
    try {
      const text = await navigator.clipboard.readText();
      if (text?.trim()) {
        onJobDescriptionChange?.(jobDescription ? `${jobDescription}\n\n${text}` : text);
      }
    } catch {
      setPasteError('Clipboard access denied. Use Ctrl+V to paste.');
    }
  }, [jobDescription, onJobDescriptionChange]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setPasteError('');
    const text = e.dataTransfer.getData('text/plain');
    if (text?.trim()) {
      onJobDescriptionChange?.(jobDescription ? `${jobDescription}\n\n${text}` : text);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const ext = (file.name || '').toLowerCase().split('.').pop();
    if (!['txt', 'pdf', 'doc', 'docx'].includes(ext)) {
      setPasteError('Please drop a .txt file or paste the job description text.');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setPasteError(`File too large. Max ${MAX_FILE_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string' && result.trim()) {
        onJobDescriptionChange?.(jobDescription ? `${jobDescription}\n\n${result}` : result);
      } else if (ext !== 'txt') {
        setPasteError('For PDF/DOC files, please copy the text and paste here (Ctrl+V).');
      }
    };
    if (ext === 'txt') {
      reader.readAsText(file);
    } else {
      setPasteError('For PDF/DOC files, please copy the text and paste here (Ctrl+V).');
    }
  };

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <WorkOutlineRoundedIcon sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
        <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 500, fontSize: 'var(--font-size-body)', color: 'var(--text-primary)' }}>
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

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionOutlinedIcon sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
          <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 500, fontSize: 'var(--font-size-body)', color: 'var(--text-primary)' }}>
            Job Description
          </Typography>
        </Box>
        <IconButton size="small" onClick={handlePasteFromClipboard} sx={{ color: 'var(--primary)' }} aria-label="Paste">
          <ContentPasteRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: isDragging ? '2px dashed var(--primary)' : '1px solid rgba(0,0,0,0.12)',
          borderRadius: 2,
          bgcolor: isDragging ? 'var(--light-blue-bg)' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        <TextField
          fullWidth
          multiline
          minRows={6}
          maxRows={14}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange?.(e.target.value)}
          placeholder="Paste the full job description here. Include responsibilities, requirements, and qualifications for the best results..."
          variant="outlined"
          InputProps={{
            sx: { fontFamily: 'var(--font-family)', '& fieldset': { border: 'none' } },
          }}
          sx={{ '& .MuiOutlinedInput-root': { p: 1.5 } }}
        />
      </Box>
      {pasteError && (
        <Typography variant="caption" color="error.main" sx={{ fontFamily: 'var(--font-family)', display: 'block', mt: 0.5 }}>
          {pasteError}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'var(--font-family)', display: 'block', mt: 0.5 }}>
        Paste the full JD (50+ chars) for better resume tailoring.
      </Typography>
    </Box>
  );
}
