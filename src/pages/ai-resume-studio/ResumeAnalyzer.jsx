import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FileUploadCustom from '../../components/uploadFiles';

const HERO_GRADIENT =
  'linear-gradient(90deg, rgba(51, 94, 222, 1) 0%, rgba(39, 39, 125, 1) 35%, rgba(54, 94, 214, 1) 100%)';

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  const handleAnalyze = async () => {
    if (!resumeFile) return;
    setAnalyzeError('');
    setAnalyzing(true);
    try {
      // analyze API call goes here
      const resumeUrl = URL.createObjectURL(resumeFile);
      navigate('/resume-analyze-score', {
        state: { resumeUrl, fileName: resumeFile.name },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Analysis failed. Please try again.';
      setAnalyzeError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: 'var(--bg-app)',
        overflowX: 'hidden',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* Blue gradient hero */}
      <Box
        sx={{
          background: HERO_GRADIENT,
          color: 'white',
          py: 3.5,
          px: { xs: 2.5, sm: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: 'auto', position: 'relative' }}>
          <IconButton
            onClick={() => navigate('/ai-resume-studio')}
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
            aria-label="Back to AI Resume Studio"
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-family)',
              fontWeight: 700,
              textAlign: 'center',
              fontSize: {
                xs: 'var(--font-size-section-header)',
                sm: 'var(--font-size-page-title)',
              },
              mb: 1,
            }}
          >
            Get Deep Insights on Your Resume
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              fontSize: 'var(--font-size-page-subtitle)',
              opacity: 0.95,
              mb: 2,
            }}
          >
            Analyze strengths, gaps and keyword matches between your resume and the job description
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              maxWidth: 560,
              mx: 'auto',
              fontSize: 'var(--font-size-helper)',
              opacity: 0.9,
              mb: 3,
            }}
          >
            Upload your resume and get a detailed AI-powered breakdown of how to make it stronger
            and more competitive.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
            <Chip
              icon={<InsightsRoundedIcon sx={{ fontSize: 18 }} />}
              label="Deep Analysis"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
            <Chip
              icon={<TrackChangesRoundedIcon sx={{ fontSize: 18 }} />}
              label="Keyword Match"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
            <Chip
              icon={<TrendingUpRoundedIcon sx={{ fontSize: 18 }} />}
              label="Improvement Tips"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />}
              label="AI-Powered"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          px: { xs: 2, sm: 4 },
          pt: 4,
          pb: 6,
        }}
      >
        <Card
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Card header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <InsightsRoundedIcon sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }}
                  color="var(--text-primary)"
                >
                  Resume Analyzer
                </Typography>
                <Typography
                  variant="body2"
                  color="var(--text-secondary)"
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--font-size-helper)',
                  }}
                >
                  Upload your resume to get a detailed AI-powered analysis
                </Typography>
              </Box>
            </Box>

            {/* Upload resume */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 500,
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--text-primary)',
                  mb: 1,
                }}
              >
                Upload Your Resume
              </Typography>
              <FileUploadCustom
                id="resume-analyzer-upload"
                label=""
                title="Choose your resume or drag & drop it here"
                subtitle="PDF, DOC, DOCX (Max 10MB)"
                accept=".pdf,.doc,.docx"
                allowedExtensions={['.pdf', '.doc', '.docx']}
                maxSizeMB={10}
                onFileUpload={(file) => setResumeFile(file)}
                sx={{ width: '100%' }}
              />
            </Box>

            {/* Error */}
            {analyzeError && (
              <Typography
                variant="body2"
                color="error"
                sx={{ fontFamily: 'var(--font-family)', mt: 1.5 }}
              >
                {analyzeError}
              </Typography>
            )}

            {/* Analyze button */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<InsightsRoundedIcon />}
              onClick={handleAnalyze}
              disabled={!resumeFile || analyzing}
              sx={{
                mt: 1,
                py: 1.5,
                bgcolor: 'var(--primary)',
                color: 'white',
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                borderRadius: 2,
                fontSize: '1rem',
                '&:hover': { bgcolor: 'var(--primary-dark)' },
                '&:disabled': {
                  bgcolor: 'rgba(0,0,0,0.12)',
                  color: 'rgba(0,0,0,0.26)',
                },
              }}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Resume'}
            </Button>

            <Typography
              variant="caption"
              color="var(--text-muted)"
              sx={{
                fontFamily: 'var(--font-family)',
                display: 'block',
                textAlign: 'center',
                mt: 1,
                fontSize: 'var(--font-size-helper)',
              }}
            >
              Upload your resume to get strengths, gaps, and keyword match insights
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
