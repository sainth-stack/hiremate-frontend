import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Typography,
} from '@mui/material';

import PageContainer from '../../components/common/PageContainer';
import AdvancedFiltersBar from '../../components/CompanySearch/AdvancedFiltersBar';
import JobMatchCard from '../../components/CompanySearch/JobMatchCard';
import { fetchJobsCorpus } from '../../services/companySearchService';
import { fetchUserProfile, enrichJobsWithMatchScores } from '../../services/matchScoreService';

const EMPTY_FILTERS = {
  countries: [],
  jobTitle: '',
  experienceLevels: [],
  jobTypes: [],
  workModes: [],
  datePosted: 'Past 24 hours',
  yearsOfExperience: '',
  sortBy: 'recommended',
  industries: [],
  showHiddenJobs: false,
};

const PAGE_SIZE = 10;

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

export default function CompanySearchPage() {
  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS }));
  const debouncedFilters = useDebounced(filters, 400);
  const [page, setPage] = useState(1);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  // Fetch user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      const profile = await fetchUserProfile();
      setUserProfile(profile);
    };
    loadUserProfile();
  }, []);

  const queryParams = useMemo(() => {
    const p = { page, page_size: PAGE_SIZE };
    
    // Default to last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    p.posted_from = yesterday.toISOString().split('T')[0];
    
    // Only add filters if they have values
    if (debouncedFilters.jobTitle && debouncedFilters.jobTitle.trim()) {
      p.role = debouncedFilters.jobTitle;
    }
    if (debouncedFilters.countries && debouncedFilters.countries.length > 0) {
      p.location = debouncedFilters.countries[0];
    }
    
    // Apply date filter if specified
    if (debouncedFilters.datePosted && debouncedFilters.datePosted !== 'Past 24 hours') {
      const daysMap = {
        'Past week': 7,
        'Past month': 30,
      };
      const days = daysMap[debouncedFilters.datePosted];
      if (days) {
        const filterDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        p.posted_from = filterDate.toISOString().split('T')[0];
      }
    }
    
    return p;
  }, [debouncedFilters, page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs-advanced', queryParams],
    queryFn: () => fetchJobsCorpus(queryParams).then((r) => r.data),
    staleTime: 30_000,
  });

  const mockJobs = [
    {
      id: 1,
      title: 'Full Stack Software Developer',
      company: 'LivePerson',
      company_type: 'Artificial Intelligence (AI) · Big Data · Public Company',
      location: 'United States',
      remote: true,
      experience_level: 'Mid Level',
      salary_min: 120000,
      salary_max: 135000,
      posted_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      applicant_count: 33,
      h1b_sponsor: true,
      url: 'https://example.com',
      match_data: {
        overall: 88,
        experienceLevel: 95,
        skills: 85,
        industryExperience: 84,
      },
    },
    {
      id: 2,
      title: 'Full Stack Product Engineer (Java)',
      company: 'Allstate',
      company_type: 'Banking · Finance · Public Company',
      location: 'United States',
      remote: false,
      experience_level: 'Mid Level',
      salary_min: 85000,
      salary_max: 145000,
      posted_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      applicant_count: 25,
      no_h1b: true,
      url: 'https://example.com',
      match_data: {
        overall: 90,
        experienceLevel: 92,
        skills: 88,
        industryExperience: 90,
      },
    },
    {
      id: 3,
      title: 'Software Engineer I',
      company: 'Sony Interactive Entertainment',
      company_type: 'Entertainment / Consumer Goods · Music · Late Stage',
      location: 'United States, Madison, WI',
      remote: false,
      experience_level: 'New Grad, Entry Level',
      salary_min: 114000,
      salary_max: 172000,
      posted_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      applicant_count: 32,
      h1b_sponsor: true,
      work_life_balance: true,
      url: 'https://example.com',
      match_data: {
        overall: 97,
        experienceLevel: 100,
        skills: 95,
        industryExperience: 96,
      },
    },
    {
      id: 4,
      title: 'Senior Application Engineer- Python/JavaScript/Typescript',
      company: 'Egen',
      company_type: 'Big Data · Artificial Intelligence (AI) · Late Stage',
      location: 'United States',
      remote: true,
      experience_level: 'Mid, Senior Level',
      salary_min: 120000,
      salary_max: 140000,
      posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      applicant_count: 15,
      h1b_sponsor: true,
      url: 'https://example.com',
      match_data: {
        overall: 81,
        experienceLevel: 75,
        skills: 88,
        industryExperience: 80,
      },
    },
  ];

  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Enrich jobs with dynamic match scores based on user profile
  const rawJobs = data?.items || mockJobs;
  const jobs = useMemo(() => 
    enrichJobsWithMatchScores(rawJobs, userProfile),
    [rawJobs, userProfile]
  );
  const total = data?.total || mockJobs.length;

  return (
    <PageContainer>
      <Box sx={{ py: { xs: 2, md: 3 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: 'var(--text-primary)',
              fontSize: { xs: '1.375rem', md: '1.5rem' },
              letterSpacing: -0.2,
              mb: 0.5,
            }}
          >
            Company Search
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            Explore job opportunities from top companies
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <AdvancedFiltersBar filters={filters} onChange={setFilters} />
          {isFetching && !isLoading && (
            <LinearProgress
              sx={{
                mt: 2,
                borderRadius: 1,
                height: 3,
                bgcolor: 'var(--light-blue-bg)',
                '& .MuiLinearProgress-bar': { bgcolor: 'var(--primary)' },
              }}
            />
          )}
        </Box>

        {/* Jobs List */}
        <Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    height: 180,
                    bgcolor: 'var(--bg-paper)',
                    borderRadius: 'var(--dashboard-card-radius)',
                    border: '1px solid var(--dashboard-border-subtle)',
                  }}
                />
              ))}
            </Box>
          ) : jobs && jobs.length > 0 ? (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {jobs.map((job) => (
                  <JobMatchCard key={job.id} job={job} />
                ))}
              </Box>
              
              {/* Pagination */}
              {total > PAGE_SIZE && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 4,
                    alignItems: 'center',
                  }}
                >
                  <Button
                    variant="outlined"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderColor: 'var(--dashboard-border-subtle)',
                      color: 'var(--text-primary)',
                      borderRadius: '10px',
                      '&:hover': {
                        borderColor: 'var(--primary)',
                        bgcolor: 'var(--light-blue-bg)',
                      },
                    }}
                  >
                    Previous
                  </Button>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Page {page} of {Math.ceil(total / PAGE_SIZE)}
                  </Typography>
                  <Button
                    variant="outlined"
                    disabled={page >= Math.ceil(total / PAGE_SIZE)}
                    onClick={() => setPage((p) => p + 1)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderColor: 'var(--dashboard-border-subtle)',
                      color: 'var(--text-primary)',
                      borderRadius: '10px',
                      '&:hover': {
                        borderColor: 'var(--primary)',
                        bgcolor: 'var(--light-blue-bg)',
                      },
                    }}
                  >
                    Next
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                bgcolor: 'var(--bg-paper)',
                borderRadius: 'var(--dashboard-card-radius)',
                border: '1px solid var(--dashboard-border-subtle)',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: 'var(--text-primary)',
                  mb: 1,
                }}
              >
                No jobs found
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Try adjusting your filters to see more results
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
