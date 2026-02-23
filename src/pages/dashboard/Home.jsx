import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Link } from 'react-router-dom';

import PageContainer from '../../components/common/PageContainer';
import {
  getDashboardStatsAPI,
  getRecentApplicationsAPI,
  getCompaniesViewedAPI,
  getSavedJobsAPI,
  getApplicationsByDayAPI,
} from '../../services';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function formatCompanyDisplayName(name) {
  if (!name) return '';
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Job recommendations – commented out for now
// const RECOMMENDED_JOBS = [
//   {
//     title: 'Software Developer',
//     match: 85,
//     description:
//       'Responsible for designing, coding, and maintaining software applications, ensuring functionality and user experience.',
//     skills: ['JavaScript', 'React', 'Node.js'],
//   },
//   {
//     title: 'Frontend Developer',
//     match: 80,
//     description:
//       'Focuses on implementing visual elements that users see and interact with in a web application.',
//     skills: ['HTML', 'CSS', 'React'],
//   },
//   {
//     title: 'Backend Developer',
//     match: 78,
//     description:
//       'Builds and maintains server-side logic, databases, and APIs for scalable applications.',
//     skills: ['Python', 'Node.js', 'PostgreSQL'],
//   },
//   {
//     title: 'Full Stack Developer',
//     match: 82,
//     description:
//       'Works on both frontend and backend to deliver end-to-end features and integrations.',
//     skills: ['React', 'Node.js', 'MongoDB'],
//   },
//   {
//     title: 'UI/UX Engineer',
//     match: 75,
//     description:
//       'Creates user interfaces and experiences with a focus on accessibility and design systems.',
//     skills: ['Figma', 'React', 'CSS'],
//   },
// ];

const cardSx = {
  borderRadius: 2,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  height: '100%',
};

export default function Home() {
  const [stats, setStats] = useState({ jobs_applied: 0, jobs_saved: 0, companies_checked: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [companiesViewed, setCompaniesViewed] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applicationsByDay, setApplicationsByDay] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes, companiesRes, savedRes, byDayRes] = await Promise.all([
          getDashboardStatsAPI(),
          getRecentApplicationsAPI(10),
          getCompaniesViewedAPI(15),
          getSavedJobsAPI(),
          getApplicationsByDayAPI(14),
        ]);
        setStats(statsRes.data);
        setRecentApplications(recentRes.data || []);
        setCompaniesViewed(companiesRes.data || []);
        setSavedJobs(savedRes.data || []);
        setApplicationsByDay(byDayRes.data || []);
      } catch (err) {
        setStats({ jobs_applied: 0, jobs_saved: 0, companies_checked: 0 });
        setRecentApplications([]);
        setCompaniesViewed([]);
        setSavedJobs([]);
        setApplicationsByDay([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const STATS_CONFIG = [
    { label: 'Jobs Applied', value: stats.jobs_applied, icon: TrendingUpRoundedIcon, primary: true },
    { label: 'Jobs Saved', value: stats.jobs_saved, icon: BookmarkOutlinedIcon, primary: false },
    { label: 'Companies Checked', value: stats.companies_checked, icon: BusinessCenterOutlinedIcon, primary: false },
  ];

  return (
    <PageContainer sx={{ py: 2, bgcolor: 'var(--bg-light)' }}>
      {/* Main two-column layout */}
      <Box
        sx={{
          display: 'flex',
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
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="var(--text-secondary)">Loading stats...</Typography>
              </Box>
            ) : (
            STATS_CONFIG.map((stat) => {
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
            })
            )}
          </Box>

          {/* Card 1: Recommended job roles – commented out for now
          <Card sx={cardSx}>
            <CardContent>
              ...
            </CardContent>
          </Card>
          */}

          {/* Companies Viewed */}
          <Card sx={cardSx}>
            <CardContent sx={{ pb: '24px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'var(--light-blue-bg-08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BusinessRoundedIcon sx={{ fontSize: 22, color: 'var(--primary)' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="var(--text-primary)">
                    Companies viewed
                  </Typography>
                  <Typography variant="caption" color="var(--text-secondary)">
                    Career pages you've visited
                  </Typography>
                </Box>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
                </Box>
              ) : companiesViewed.length === 0 ? (
                <Box
                  sx={{
                    py: 4,
                    px: 2,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'var(--light-blue-bg-02)',
                    border: '1px dashed var(--border-color)',
                  }}
                >
                  <BusinessCenterOutlinedIcon sx={{ fontSize: 40, color: 'var(--text-muted)', mb: 1 }} />
                  <Typography variant="body2" color="var(--text-secondary)">
                    Use the HireMate extension on career pages to track companies you check.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {companiesViewed.map((c, idx) => (
                    <Box
                      key={idx}
                      component={MuiLink}
                      href={c.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 1.5,
                        px: 2,
                        borderRadius: 1.5,
                        border: '1px solid var(--border-color)',
                        bgcolor: 'var(--bg-paper)',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'var(--light-blue-bg-08)',
                          borderColor: 'var(--primary)',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: 'var(--primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                        }}
                      >
                        {(formatCompanyDisplayName(c.company_name) || '?')[0].toUpperCase()}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} color="var(--text-primary)">
                          {formatCompanyDisplayName(c.company_name)}
                        </Typography>
                        <Typography variant="caption" color="var(--text-muted)" sx={{ display: 'block', mt: 0.25 }}>
                          View career page
                        </Typography>
                      </Box>
                      <OpenInNewRoundedIcon sx={{ fontSize: 18, color: 'var(--primary)', flexShrink: 0 }} />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Jobs applied by day - chart */}
          <Card sx={cardSx}>
            <CardContent sx={{ pb: '24px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'var(--light-blue-bg-08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpRoundedIcon sx={{ fontSize: 22, color: 'var(--primary)' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="var(--text-primary)">
                    Total jobs applied by day
                  </Typography>
                  <Typography variant="caption" color="var(--text-secondary)">
                    Last 14 days
                  </Typography>
                </Box>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
                </Box>
              ) : (
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        const byDate = Object.fromEntries(
                          (applicationsByDay || []).map((d) => [d.date, d.count])
                        );
                        const result = [];
                        for (let i = 13; i >= 0; i--) {
                          const d = new Date();
                          d.setDate(d.getDate() - i);
                          const dateStr = d.toISOString().slice(0, 10);
                          result.push({
                            date: dateStr,
                            count: byDate[dateStr] || 0,
                            shortDate: d.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            }),
                          });
                        }
                        return result;
                      })()}
                      margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border-color)"
                        vertical={false}
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="shortDate"
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                        axisLine={{ stroke: 'var(--border-color)' }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                      />
                      <Tooltip
                        formatter={(value) => [value, 'Applications']}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          borderRadius: 8,
                          border: '1px solid var(--border-color)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          padding: '12px 16px',
                        }}
                        itemStyle={{ fontWeight: 600, color: 'var(--primary)' }}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--primary)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                        name="Applications"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
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
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : recentApplications.length === 0 ? (
                  <Typography variant="body2" color="var(--text-secondary)" sx={{ py: 2, textAlign: 'center' }}>
                    No applications yet. Use the HireMate extension to save jobs and track applications.
                  </Typography>
                ) : (
                recentApplications.map((app) => (
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
                          {(app.company || app.title || '?')[0].toUpperCase()}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={600} fontSize={'1rem'}>
                            {app.title || 'Untitled'}
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
                              {formatRelativeTime(app.created_at)}
                            </Box>
                          </Box>
                        </Box>
                        <Chip
                          label={(app.application_status || 'applied').replace(/^\w/, (c) => c.toUpperCase())}
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
                ))
                )}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ ...cardSx, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', mt: 2 }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography variant="h6" fontWeight={600} color="var(--text-primary)" sx={{ mb: 2 }}>
                Saved jobs
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : savedJobs.length === 0 ? (
                  <Typography variant="body2" color="var(--text-secondary)" sx={{ py: 2, textAlign: 'center' }}>
                    No saved jobs yet. Save jobs from the HireMate extension to view and apply here.
                  </Typography>
                ) : (
                  savedJobs.map((job) => (
                    <Card
                      key={job.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 1.5,
                        borderColor: 'var(--border-color)',
                        boxShadow: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="body2" fontWeight={600} color="var(--primary)" sx={{ mb: 0.5 }}>
                          {job.company || 'Unknown company'}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={600} fontSize="0.9rem">
                          {job.position_title || 'Untitled'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          {job.job_posting_url && (
                            <>
                              <Button
                                size="small"
                                component={MuiLink}
                                href={job.job_posting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outlined"
                                sx={{
                                  textTransform: 'none',
                                  py: 0.5,
                                  fontSize: '0.75rem',
                                  borderColor: 'var(--primary)',
                                  color: 'var(--primary)',
                                  '&:hover': { borderColor: 'var(--primary-light)', bgcolor: 'var(--light-blue-bg-08)' },
                                }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                component={MuiLink}
                                href={job.job_posting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="contained"
                                sx={{
                                  textTransform: 'none',
                                  py: 0.5,
                                  fontSize: '0.75rem',
                                  bgcolor: 'var(--primary)',
                                  '&:hover': { bgcolor: 'var(--primary-light)' },
                                }}
                              >
                                Apply
                              </Button>
                            </>
                          )}
                          {!job.job_posting_url && (
                            <Typography variant="caption" color="var(--text-muted)">
                              No link saved
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
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
              mt: 2,
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
