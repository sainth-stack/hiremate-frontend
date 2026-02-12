import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';

// Static data for demo
const STATS = [
  {
    label: 'Overall Applications',
    value: 2,
    icon: TrendingUpRoundedIcon,
    primary: true,
  },
  { label: 'Interviewed', value: 0, icon: GroupsRoundedIcon, primary: false },
  { label: 'Offered', value: 0, icon: SchoolRoundedIcon, primary: false },
];

const RECOMMENDED_JOBS = [
  {
    title: 'Software Developer',
    match: 85,
    description:
      'Responsible for designing, coding, and maintaining software applications, ensuring functionality and user experience.',
    skills: ['JavaScript', 'React', 'Node.js'],
  },
  {
    title: 'Frontend Developer',
    match: 80,
    description:
      'Focuses on implementing visual elements that users see and interact with in a web application.',
    skills: ['HTML', 'CSS', 'React'],
  },
  {
    title: 'Backend Developer',
    match: 78,
    description:
      'Builds and maintains server-side logic, databases, and APIs for scalable applications.',
    skills: ['Python', 'Node.js', 'PostgreSQL'],
  },
  {
    title: 'Full Stack Developer',
    match: 82,
    description:
      'Works on both frontend and backend to deliver end-to-end features and integrations.',
    skills: ['React', 'Node.js', 'MongoDB'],
  },
  {
    title: 'UI/UX Engineer',
    match: 75,
    description:
      'Creates user interfaces and experiences with a focus on accessibility and design systems.',
    skills: ['Figma', 'React', 'CSS'],
  },
];

const RECENT_APPLICATIONS = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'Technology Company',
    location: 'Remote',
    time: '16h ago',
    initial: 'T',
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'Scoutit',
    location: 'India',
    time: '1d ago',
    initial: 'S',
  },
];

const cardSx = {
  borderRadius: 2,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  height: '100%',
};

const JOB_CARDS_GAP = 16;

export default function Home() {
  const jobScrollRef = useRef(null);
  const [jobCardWidth, setJobCardWidth] = useState(280);

  // Size job cards so exactly two fit in the visible area
  useEffect(() => {
    const el = jobScrollRef.current;
    if (!el) return;
    const updateWidth = () => {
      const w = el.clientWidth;
      if (w > 0) setJobCardWidth((w - JOB_CARDS_GAP) / 2);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrollJobs = (direction) => {
    const el = jobScrollRef.current;
    if (!el) return;
    const step = el.clientWidth;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <PageContainer sx={{ py: 2, bgcolor: 'var(--bg-light)' }}>
      {/* Main two-column layout */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'stretch',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Left column - 70% - three cards, 20px horizontal padding */}
        <Box
          sx={{
            flex: { md: '0 0 70%' },
            width: { md: '70%' },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            px: '20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Stats row - inside left column */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  sx={{
                    ...cardSx,
                    flex: '1 1 0',
                    minWidth: 0,
                    bgcolor: stat.primary ? 'var(--primary)' : 'var(--bg-paper)',
                    color: stat.primary ? 'var(--primary-contrast)' : 'var(--text-primary)',
                  }}
                >
                  <CardContent sx={{ position: 'relative', pb: '16px !important' }}>
                    {stat.primary && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }} />
                      </Box>
                    )}
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: stat.primary ? 0.9 : 0.8,
                        color: stat.primary ? 'inherit' : 'var(--text-secondary)',
                      }}
                    >
                      {stat.label}
                    </Typography>
                    {!stat.primary && (
                      <Box sx={{ mt: 1 }}>
                        <Icon sx={{ fontSize: 20, color: 'var(--text-muted)' }} />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Card 1: Recommended job roles */}
          <Card sx={cardSx}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600} color="var(--text-primary)">
                  Recommended job roles
                </Typography>
                <Button
                  size="small"
                  startIcon={<EditRoundedIcon />}
                  sx={{
                    color: 'var(--text-secondary)',
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'var(--light-blue-bg-02)' },
                  }}
                >
                  Edit preference
                </Button>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={() => scrollJobs(-1)}
                  sx={{ color: 'var(--text-secondary)', alignSelf: 'center', flexShrink: 0 }}
                >
                  <ChevronLeftRoundedIcon />
                </IconButton>
                <Box
                  ref={jobScrollRef}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    flex: 1,
                    minWidth: '500px',
                    minHeight: '250px',
                    maxHeight: '250px',
                    pb: 0.5,
                    scrollBehavior: 'smooth',
                    '&::-webkit-scrollbar': { height: 6 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'var(--grey-light)', borderRadius: 3 },
                  }}
                >
                  {RECOMMENDED_JOBS.map((job) => (
                    <Card
                      key={job.title}
                      variant="outlined"
                      sx={{
                        width: jobCardWidth,
                        minWidth: jobCardWidth,
                        flexShrink: 0,
                        borderRadius: 2,
                        borderColor: 'var(--border-color)',
                        boxShadow: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          '&:last-child': { pb: 2 },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>
                            {job.title}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.25,
                              color: 'var(--primary)',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              flexShrink: 0,
                            }}
                          >
                            <TrendingUpRoundedIcon sx={{ fontSize: 16 }} />
                            {job.match}%
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          color="var(--text-secondary)"
                          sx={{
                            mb: 1.5,
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            flex: 1,
                            minHeight: 0,
                          }}
                        >
                          {job.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                          {job.skills.map((s) => (
                            <Chip
                              key={s}
                              label={s}
                              size="small"
                              sx={{
                                bgcolor: 'var(--grey-4)',
                                color: 'var(--primary)',
                                fontWeight: 500,
                                '& .MuiChip-label': { px: 1 },
                              }}
                            />
                          ))}
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          sx={{
                            bgcolor: 'var(--primary)',
                            color: 'var(--primary-contrast)',
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            mt: 'auto',
                            '&:hover': { bgcolor: 'var(--primary-light)' },
                          }}
                        >
                          View jobs
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => scrollJobs(1)}
                  sx={{ color: 'var(--text-secondary)', alignSelf: 'center', flexShrink: 0 }}
                >
                  <ChevronRightRoundedIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          {/* Card 2: Upcoming Interviews */}
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="var(--text-primary)" sx={{ mb: 2 }}>
                Upcoming Interviews
              </Typography>
              <Box
                sx={{
                  border: '1px dashed var(--border-color)',
                  borderRadius: 2,
                  py: 4,
                  px: 2,
                  textAlign: 'center',
                  bgcolor: 'var(--bg-light)',
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'var(--grey-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 28, color: 'var(--text-muted)' }} />
                </Box>
                <Typography variant="body2" color="var(--text-secondary)">
                  You don&apos;t have any upcoming interviews scheduled. Once you get interview
                  invitations, they&apos;ll show up here.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Card 3: Third card - Application tips / Next steps */}
          {/* <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="var(--text-primary)" sx={{ mb: 1.5 }}>
                Next steps
              </Typography>
              <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 1.5 }}>
                Complete your profile and resume to get better job recommendations and track your
                applications in one place.
              </Typography>
              <Button
                component={Link}
                to="/profile"
                variant="outlined"
                size="small"
                sx={{
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  textTransform: 'none',
                  '&:hover': { borderColor: 'var(--primary-light)', bgcolor: 'var(--light-blue-bg-08)' },
                }}
              >
                Build Profile
              </Button>
            </CardContent>
          </Card> */}
        </Box>

        {/* Right column - 30%, 100vh */}
        <Box
          sx={{
            flex: { md: '0 0 calc(30% - 16px)' },
            width: { md: '30%' },
            minHeight: { xs: 'auto', md: '100vh' },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Card sx={{ ...cardSx, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography variant="h6" fontWeight={600} color="var(--text-primary)" sx={{ mb: 2 }}>
                Recently submitted applications
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto' }}>
                {RECENT_APPLICATIONS.map((app) => (
                  <Card
                    key={app.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      borderColor: 'var(--border-color)',
                      boxShadow: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'var(--text-secondary)',
                            color: 'var(--bg-paper)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          {app.initial}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={600} fontSize={'1rem'}>
                            {app.title}
                          </Typography>
                          <Typography variant="caption" color="var(--text-secondary)" fontSize={'0.8rem'}>
                            {app.company}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mt: 0.5,
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                            }}
                          >
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                              <LocationOnRoundedIcon sx={{ fontSize: 16 }} />
                              {app.location}
                            </Box>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                              <ScheduleRoundedIcon sx={{ fontSize: 16 }} />
                              {app.time}
                            </Box>
                          </Box>
                        </Box>
                        <Chip
                          label="Applied"
                          size="small"
                          sx={{
                            bgcolor: 'var(--grey-4)',
                            color: 'var(--text-secondary)',
                            fontWeight: 500,
                            '& .MuiChip-label': { px: 1 },
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Button
            component={Link}
            to="/application-tracker"
            fullWidth
            variant="outlined"
            startIcon={<WorkOutlineRoundedIcon />}
            sx={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              textTransform: 'none',
              py: 1.25,
              '&:hover': {
                borderColor: 'var(--primary)',
                bgcolor: 'var(--light-blue-bg-08)',
                color: 'var(--primary)',
              },
            }}
          >
            Go to Applications
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
