import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, CircularProgress } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { uploadResume } from '../../../store/resume/resumeSlice';
import CustomButton from '../../../components/common/CustomButton';
import SectionCard from './SectionCard';
import { CARD_BORDER_RADIUS } from '../constants';

const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];
const MAX_MB = 50;

export default function ResumeSection() {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const { parsedData, lastUpdated, loading, error } = useSelector((state) => state.resume);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);

  const hasResume = !!lastUpdated || !!fileName;

  const validateAndUpload = (file) => {
    if (!file) return;
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXT.includes(ext) || file.size > MAX_MB * 1024 * 1024) {
      return;
    }
    setFileName(file.name);
    dispatch(uploadResume(file));
  };

  const handleFileChange = (e) => {
    const file = e.target?.files?.[0];
    validateAndUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    validateAndUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleReplace = () => {
    inputRef.current?.click();
  };

  return (
    <SectionCard>
      <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', mb: 2 }}>
        Resume
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Uploading & parsing resume…
          </Typography>
        </Box>
      )}
      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}
        </Typography>
      )}

      {hasResume ? (
        <Box
          sx={{
            borderRadius: CARD_BORDER_RADIUS,
            border: '1px solid rgba(0,0,0,0.08)',
            p: 2,
            bgcolor: 'rgba(0,0,0,0.02)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {fileName || 'Resume uploaded'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : '—'}
              </Typography>
            </Box>
            <CustomButton variant="outlined" size="small" onClick={handleReplace} disabled={loading}>
              Replace
            </CustomButton>
          </Box>
          {parsedData && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'var(--primary)' }}>
              Parse resume → auto-fill all tabs
            </Typography>
          )}
        </Box>
      ) : (
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          sx={{
            height: 140,
            borderRadius: CARD_BORDER_RADIUS,
            border: '2px dashed',
            borderColor: dragOver ? 'var(--primary)' : 'rgba(0,0,0,0.12)',
            bgcolor: dragOver ? 'rgba(37, 99, 235, 0.04)' : 'rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background-color 0.2s',
            '&:hover': {
              borderColor: 'var(--primary)',
              bgcolor: 'rgba(37, 99, 235, 0.04)',
            },
          }}
        >
          <UploadFileOutlinedIcon sx={{ fontSize: 40, color: 'var(--text-secondary)', mb: 1 }} />
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            Drop your resume here or click to upload
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: 12, mt: 0.5 }}>
            PDF, DOC, DOCX (Max {MAX_MB}MB)
          </Typography>
        </Box>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </SectionCard>
  );
}
