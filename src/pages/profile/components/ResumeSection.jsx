import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, CircularProgress, Alert, IconButton, Collapse } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { uploadResume } from '../../../store/resume/resumeSlice';
import CustomButton from '../../../components/common/CustomButton';
import SectionCard from './SectionCard';
import { CARD_BORDER_RADIUS } from '../constants';

const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];
const MAX_MB = 50;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function ResumeSection() {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const { parsedData, lastUpdated, loading, error } = useSelector((state) => state.resume);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [showError, setShowError] = useState(false);

  const hasResume = !!lastUpdated || !!fileName;

  // Auto-show errors when they occur from API
  useEffect(() => {
    if (error && !loading) {
      setShowError(true);
    }
  }, [error, loading]);

  // Clear uploading file name when upload completes
  useEffect(() => {
    if (!loading && uploadingFile) {
      // Small delay to show success before clearing
      const timer = setTimeout(() => {
        setUploadingFile(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, uploadingFile]);

  const validateFile = (file) => {
    if (!file) {
      return 'No file selected';
    }

    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    
    if (!ALLOWED_EXT.includes(ext)) {
      return `Invalid file type "${ext}". Please upload PDF, DOC, or DOCX files only.`;
    }

    if (file.size > MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `File too large (${sizeMB}MB). Maximum size is ${MAX_MB}MB.`;
    }

    if (file.size < 1024) {
      return 'File is too small. Please upload a valid resume.';
    }

    return null;
  };

  const validateAndUpload = (file) => {
    // Reset previous errors
    setValidationError(null);
    setShowError(false);

    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setShowError(true);
      return;
    }

    setFileName(file.name);
    setUploadingFile(file.name);
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

  const handleRetry = () => {
    setShowError(false);
    setValidationError(null);
    inputRef.current?.click();
  };

  const handleDismissError = () => {
    setShowError(false);
  };

  return (
    <SectionCard>
      <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', mb: 2 }}>
        Resume
      </Typography>

      {/* In-place Loading State */}
      {loading && (
        <Box
          sx={{
            borderRadius: CARD_BORDER_RADIUS,
            border: '2px solid rgba(37, 99, 235, 0.3)',
            p: 4,
            bgcolor: 'rgba(37, 99, 235, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s ease infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.05)', opacity: 0.8 },
              },
            }}
          >
            <CircularProgress size={40} sx={{ color: 'var(--primary)' }} />
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text-primary)',
                mb: 1,
              }}
            >
              Processing your resume...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--text-secondary)',
                fontSize: 14,
                mb: 0.5,
              }}
            >
              Extracting information and analyzing content
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                fontSize: 12,
              }}
            >
              {uploadingFile || 'Please wait...'}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mt: 1,
            }}
          >
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'var(--primary)',
                  animation: `bounce 1.4s ease-in-out ${index * 0.16}s infinite`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': { transform: 'scale(0)' },
                    '40%': { transform: 'scale(1)' },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Validation Error */}
      {!loading && (
        <>
          <Collapse in={showError && validationError}>
            <Alert
              severity="error"
              icon={<ErrorOutlineRoundedIcon />}
              action={
                <IconButton size="small" onClick={handleDismissError}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              }
              sx={{ mb: 2, fontSize: 14 }}
            >
              {validationError}
            </Alert>
          </Collapse>

          {/* Upload Error with Retry */}
          <Collapse in={error && showError}>
          <Alert
            severity="error"
            icon={<ErrorOutlineRoundedIcon />}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={handleRetry} color="inherit">
                  <RefreshRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleDismissError}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            }
            sx={{ mb: 2, fontSize: 14 }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Resume upload failed
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 13 }}>
                {error && typeof error === 'object' ? (error.message || JSON.stringify(error)) : (error || 'An error occurred')}
              </Typography>
            </Box>
          </Alert>
        </Collapse>
        </>
      )}

      {/* Upload/Resume Display (only show when not loading) */}
      {!loading && (
        <>
          {hasResume ? (
          <Box
            sx={{
              borderRadius: CARD_BORDER_RADIUS,
              border: '1px solid rgba(0,0,0,0.08)',
              p: 2.5,
              bgcolor: 'rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'rgba(37, 99, 235, 0.2)',
                bgcolor: 'rgba(37, 99, 235, 0.02)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fileName || 'Resume uploaded'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : '—'}
                </Typography>
              </Box>
              <CustomButton
                variant="outlined"
                size="small"
                onClick={handleReplace}
                disabled={loading}
                sx={{ flexShrink: 0 }}
              >
                Replace
              </CustomButton>
            </Box>
            {parsedData && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    animation: 'pulse 2s ease infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>
                  Profile auto-filled from resume
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !loading && inputRef.current?.click()}
            sx={{
              height: 160,
              borderRadius: CARD_BORDER_RADIUS,
              border: '2px dashed',
              borderColor: dragOver ? 'var(--primary)' : 'rgba(0,0,0,0.12)',
              bgcolor: dragOver ? 'rgba(37, 99, 235, 0.04)' : 'rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                borderColor: loading ? 'rgba(0,0,0,0.12)' : 'var(--primary)',
                bgcolor: loading ? 'rgba(0,0,0,0.02)' : 'rgba(37, 99, 235, 0.04)',
              },
              '&::before': dragOver
                ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.1))',
                    animation: 'shimmer 1.5s ease infinite',
                    '@keyframes shimmer': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' },
                    },
                  }
                : {},
            }}
          >
            <UploadFileOutlinedIcon
              sx={{
                fontSize: 48,
                color: dragOver ? 'var(--primary)' : 'var(--text-secondary)',
                mb: 1.5,
                transition: 'all 0.2s ease',
              }}
            />
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
                mb: 0.5,
              }}
            >
              {dragOver ? 'Drop to upload' : 'Drop your resume here or click to upload'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-secondary)',
                fontSize: 12,
                mb: 1,
              }}
            >
              PDF, DOC, DOCX (Max {MAX_MB}MB)
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                fontSize: 11,
                px: 3,
                textAlign: 'center',
              }}
            >
              Your resume will be analyzed to auto-fill your profile
            </Typography>
          </Box>
        )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={loading}
      />
    </SectionCard>
  );
}
