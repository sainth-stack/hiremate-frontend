import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PageContainer from '../../components/common/PageContainer';
import FileUploadCustom from '../../components/uploadFiles';

const HERO_GRADIENT =
  'linear-gradient(90deg, rgba(51, 94, 222, 1) 0%, rgba(39, 39, 125, 1) 35%, rgba(54, 94, 214, 1) 100%)';

export default function ResumeGenerator() {
  return (
    <Box sx={{ minHeight: '100%', background: 'var(--bg-app)', overflowX: 'hidden', fontFamily: 'var(--font-family)' }}>
      {/* Top hero section - gradient only */}
      <Box
        sx={{
          background: HERO_GRADIENT,
          color: 'white',
          pt: 2,
          pb: 3,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: 'auto', height: '350px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Chip
              label="Welcome back, gurusai!"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
              }}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-family)',
              fontWeight: 700,
              textAlign: 'center',
              fontSize: { xs: 'var(--font-size-section-header)', sm: 'var(--font-size-page-title)' },
              mb: 1,
            }}
          >
            Land Your Dream Job
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              fontSize: 'var(--font-size-page-subtitle)',
              opacity: 0.95,
              mb: 3,
            }}
          >
            with an AI-tailored resume
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              maxWidth: 560,
              mx: 'auto',
              fontSize: 'var(--font-size-helper)',
              opacity: 0.9,
              mb: 5,
            }}
          >
            Paste any job description and get a perfectly customized resume in seconds. ATS-optimized. Interview-ready.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Chip
              icon={<BoltRoundedIcon sx={{ fontSize: 18 }} />}
              label="30 seconds"
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
              label="ATS-optimized"
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
              icon={<BusinessCenterRoundedIcon sx={{ fontSize: 18 }} />}
              label="Industry-proven"
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

      {/* Main content — .container: flex, gap 20px; .left 55% one big box; .right 45% two equal boxes */}
      <PageContainer sx={{ pt: 4, pb: 3, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <Box
          className="container"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: '20px',
            width: '100%',
            marginLeft:"10px",
            
            minWidth: 0,
            minHeight: { md: 460 },
            alignItems: 'stretch',
          }}
        >
          {/* .left — single big box, 55% of (100% - gap) */}
          <Box
            className="left"
            sx={{
              flex: { xs: '0 0 auto', md: '0 0 calc((100% - 20px) * 0.55)' },
              width: { xs: '100%', md: 'auto' },
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              
            }}
          >
            <Card
              className="big-box"
              sx={{
                height: '100%',
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeRoundedIcon sx={{ color: 'var(--primary)', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--label-font-weight)' }} color="var(--text-primary)">
                      Resume Generator
                    </Typography>
                  </Box>
                  <Chip label="5" size="small" sx={{ fontFamily: 'var(--font-family)', bgcolor: 'var(--light-blue-bg)', color: 'var(--primary)', fontWeight: 'var(--label-font-weight)' }} />
                </Box>
                <Typography variant="body2" color="var(--text-secondary)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-body)', mb: 2 }}>
                  Paste a job description to get started
                </Typography>

                <FileUploadCustom
                  label=""
                  title="Paste Your Job Description"
                  buttonText="Tap to paste"
                  subtitle="Copy a job posting from LinkedIn, Indeed, or anywhere else and paste it here"
                  id="resume-job-paste"
                  sx={{ mb: 0.5 }}
                />
                <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)', display: 'block', textAlign: 'center', mt: 0.5 }}>
                  or Ctrl+V
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AutoAwesomeRoundedIcon />}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    bgcolor: 'var(--primary)',
                    color: 'white',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--label-font-weight)',
                    '&:hover': { bgcolor: 'var(--primary-dark)' },
                  }}
                >
                  Generate My Resume
                  <Chip label="5 left" size="small" sx={{ ml: 1, bgcolor: 'var(--primary-dark)', color: 'white', height: 22 }} />
                </Button>

                <Box sx={{ display: 'flex', gap: 2, mt: 1.5, justifyContent: 'center' }}>
                  <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}>
                    800+ resumes generated today
                  </Typography>
                  <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}>
                    ~30 sec average
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* .right — two equal boxes, 45% of (100% - gap), gap 20px */}
          <Box
            className="right"
            sx={{
              flex: { xs: '0 0 auto', md: '0 0 calc((100% - 20px) * 0.45)' },
              width: { xs: '100%', md: 'auto' },
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              paddingRight:"15px",
            }}
          >
            <Card
              className="small-box"
              sx={{
                flex: 1,
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                bgcolor: 'var(--light-blue-bg)',
                border: '1px solid var(--light-blue-bg-15)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontFamily: 'var(--font-family)', color: 'white', fontWeight: 700, fontSize: 'var(--font-size-tab)' }}>C</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--label-font-weight)' }} color="var(--text-primary)">Chrome Extension</Typography>
                    <Typography variant="body2" color="var(--text-secondary)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)', mb: 0.5 }}>One-click apply on LinkedIn</Typography>
                    <Typography variant="body2" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)', mb: 1 }}>
                      Generate resumes directly from any LinkedIn job posting. No copy-paste needed.
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
                      startIcon={<GetAppRoundedIcon sx={{ fontSize: 18 }} />}
                      sx={{ fontFamily: 'var(--font-family)', color: 'var(--primary)', fontWeight: 'var(--label-font-weight)', textTransform: 'none', p: 0, minWidth: 0 }}
                    >
                      Install Free Extension
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card
              className="small-box"
              sx={{
                flex: 1,
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DescriptionOutlinedIcon sx={{ color: 'var(--text-secondary)' }} />
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--label-font-weight)' }} color="var(--text-primary)">Recent Resumes</Typography>
                </Box>
                <Box
                  sx={{
                    py: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'var(--bg-light)',
                    borderRadius: 1,
                  }}
                >
                  <DescriptionOutlinedIcon sx={{ fontSize: 48, color: 'var(--icon)', mb: 0.5 }} />
                  <Typography variant="body2" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }} textAlign="center">
                    No resumes yet. Generate your first resume above!
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Bottom feature cards */}
        <Grid container spacing={4} sx={{ mt: 4 , marginLeft:"10px", marginRight:"10px" }} >
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardContent sx={{ p: 4, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                <TrackChangesRoundedIcon sx={{ color: 'var(--primary)', fontSize: 32, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--label-font-weight)' }} color="var(--text-primary)">ATS-Optimized</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }} color="var(--text-secondary)">Beats applicant tracking systems</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardContent sx={{ p: 4, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                <BoltRoundedIcon sx={{ color: 'var(--warning)', fontSize: 32, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--label-font-weight)' }} color="var(--text-primary)">30 Second Generation</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }} color="var(--text-secondary)">Instant professional results</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardContent sx={{ p: 4, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                <TrendingUpRoundedIcon sx={{ color: 'var(--primary)', fontSize: 32, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--label-font-weight)' }} color="var(--text-primary)">3.2x More Callbacks</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }} color="var(--text-secondary)">Proven to get interviews</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </PageContainer>
    </Box>
  );
}
