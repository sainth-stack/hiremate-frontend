import { useState } from 'react';
import { Box, Button, Chip, Typography, Popover } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';

function clampPercentage(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getMatchLevel(pct) {
  if (pct >= 85) {
    return {
      label: 'STRONG MATCH',
      color: '#10B981',
      ringBg: 'rgba(16, 185, 129, 0.15)',
    };
  }
  if (pct >= 70) {
    return {
      label: 'GOOD MATCH',
      color: '#1E3A8A',
      ringBg: 'rgba(30, 58, 138, 0.15)',
    };
  }
  if (pct >= 50) {
    return {
      label: 'FAIR MATCH',
      color: '#06B6D4',
      ringBg: 'rgba(6, 182, 212, 0.16)',
    };
  }
  return {
    label: 'LOW MATCH',
    color: '#64748B',
    ringBg: 'rgba(100, 116, 139, 0.2)',
  };
}

function companyInitials(name) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function formatPostedTime(postedAt) {
  if (!postedAt) return null;
  const postDate = new Date(postedAt);
  const postMs = postDate.getTime();
  if (Number.isNaN(postMs)) return null;

  const nowMs = Date.now();
  const diffMs = nowMs - postMs;
  if (diffMs < 0) return 'Just now';

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;
  const yearMs = 365 * dayMs;

  if (diffMs < minuteMs) return 'Just now';
  if (diffMs < hourMs) {
    const minutes = Math.floor(diffMs / minuteMs);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  if (diffMs < 2 * dayMs) return 'Yesterday';
  if (diffMs < weekMs) {
    const days = Math.floor(diffMs / dayMs);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  if (diffMs < monthMs) {
    const weeks = Math.floor(diffMs / weekMs);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  if (diffMs < yearMs) {
    const months = Math.floor(diffMs / monthMs);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  const years = Math.floor(diffMs / yearMs);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

function MatchPercentageCircle({ percentage, label, size = 120 }) {
  const safePercentage = clampPercentage(percentage);
  const strokeWidth = size >= 96 ? 8 : 6;
  const radius = (size - strokeWidth - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercentage / 100) * circumference;
  const matchInfo = getMatchLevel(safePercentage);
  const percentFontSize = size >= 110 ? '1.2rem' : '0.95rem';
  const labelFontSize = size >= 110 ? '0.62rem' : '0.55rem';

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        bgcolor: '#fff',
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={matchInfo.ringBg}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={matchInfo.color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: percentFontSize, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {safePercentage}%
        </Typography>
        {label && (
          <Typography sx={{ fontSize: labelFontSize, fontWeight: 700, color: 'var(--text-muted)', mt: 0.35, letterSpacing: '0.05em' }}>
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function MatchBreakdownPopover({ anchorEl, open, onClose, matchData }) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        '& .MuiPopover-paper': {
          width: 480,
          maxWidth: '90vw',
          borderRadius: 'var(--dashboard-card-radius)',
          boxShadow: 'var(--dashboard-card-shadow-hover)',
          border: '1px solid var(--dashboard-border-subtle)',
          mt: 1,
          bgcolor: 'var(--bg-paper)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', mb: 1 }}>
          Why This Job Is A Match
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, mb: 3 }}>
          {matchData.description || 'This role aligns well with your profile based on experience, skills, and industry background.'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center' }}>
            <MatchPercentageCircle percentage={matchData.experienceLevel || 0} size={84} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', mt: 1 }}>
              Experience<br/>Level
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <MatchPercentageCircle percentage={matchData.skills || 0} size={84} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', mt: 1 }}>
              Skills
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <MatchPercentageCircle percentage={matchData.industryExperience || 0} size={84} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', mt: 1 }}>
              Industry<br/>Experience
            </Typography>
          </Box>
        </Box>
      </Box>
    </Popover>
  );
}

export default function JobMatchCard({ job }) {
  const [matchAnchorEl, setMatchAnchorEl] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const handleMatchMouseEnter = (event) => {
    setMatchAnchorEl(event.currentTarget);
  };
  
  const handleMatchMouseLeave = () => {
    setMatchAnchorEl(null);
  };

  const initials = companyInitials(job.company);
  const matchOpen = Boolean(matchAnchorEl);
  
  // Get match data from job or use defaults
  const matchData = {
    overall: 85,
    experienceLevel: 100,
    skills: 80,
    industryExperience: 75,
    description: 'Strong match based on your profile',
    ...(job.match_data || {}),
  };
  const overallMatch = clampPercentage(matchData.overall);
  const matchInfo = getMatchLevel(overallMatch);

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const formatK = (val) => `$${Math.round(val / 1000)}K`;
    if (min && max) return `${formatK(min)}/yr - ${formatK(max)}/yr`;
    if (min) return `${formatK(min)}/yr`;
    return `${formatK(max)}/yr`;
  };

  const posted = formatPostedTime(job.posted_at);

  const salary = formatSalary(job.salary_min, job.salary_max);

  const getExperienceTag = () => {
    if (!job.experience_level) return null;
    const level = job.experience_level.toLowerCase();
    if (level.includes('entry') || level.includes('junior') || level.includes('new grad')) return 'Entry Level';
    if (level.includes('mid')) return 'Mid Level';
    if (level.includes('senior') || level.includes('sr')) return 'Senior';
    return job.experience_level;
  };

  const experienceTag = getExperienceTag();
  const jobType = job.job_type || 'Full-time';
  const locationLabel = job.location || 'India';
  const tags = [job.remote ? 'Remote' : 'Onsite', jobType, locationLabel];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'auto minmax(0, 1fr) auto' },
        alignItems: 'start',
        gap: { xs: 1.5, md: 1.75 },
        p: { xs: 1.5, md: 1.75 },
        bgcolor: 'var(--bg-paper)',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
        height: '100%',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)',
          borderColor: '#cdd9ef',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '12px',
          background: job.logo ? `url(${job.logo}) center/cover` : '#FF6B35',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontWeight: 800,
          fontSize: '1rem',
          color: 'white',
          letterSpacing: '-0.02em',
          boxShadow: '0 4px 10px rgba(255, 107, 53, 0.25)',
        }}
      >
        {!job.logo && initials}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
          {posted && (
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {posted}
            </Typography>
          )}
          {experienceTag && (
            <Chip
              label={experienceTag}
              size="small"
              sx={{
                height: 22,
                borderRadius: '999px',
                bgcolor: 'rgba(30, 58, 138, 0.08)',
                color: '#1E3A8A',
                fontWeight: 700,
                fontSize: '0.68rem',
              }}
            />
          )}
        </Box>

        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            color: 'var(--text-primary)',
            lineHeight: 1.25,
            mb: 0.45,
            letterSpacing: '-0.01em',
          }}
        >
          {job.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {job.company}
          </Typography>
          {job.company_type && (
            <>
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {job.company_type}
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.25, alignItems: 'center' }}>
          {job.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
              <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {job.location}
              </Typography>
            </Box>
          )}

          {job.remote && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
              <BusinessIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Remote
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
            <WorkOutlineIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
            <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {jobType}
            </Typography>
          </Box>

          {salary && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
              <AttachMoneyIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {salary}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                height: 24,
                borderRadius: '999px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.71rem',
                fontWeight: 600,
                color: '#334155',
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setIsSaved(!isSaved)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '10px',
              px: 1.65,
              py: 0.7,
              borderColor: isSaved ? '#1E3A8A' : '#d5deed',
              color: isSaved ? '#1E3A8A' : 'var(--text-secondary)',
              bgcolor: isSaved ? 'rgba(30, 58, 138, 0.08)' : 'transparent',
              '&:hover': { 
                borderColor: '#1E3A8A', 
                bgcolor: '#f5f9ff',
                color: '#1E3A8A',
              },
            }}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          
          <Button
            component="a"
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '10px',
              px: 1.65,
              py: 0.7,
              borderColor: '#d5deed',
              color: 'var(--text-secondary)',
              '&:hover': { 
                bgcolor: '#f5f9ff',
                borderColor: '#1E3A8A',
                color: '#1E3A8A',
              },
            }}
          >
            Quick Apply
          </Button>
          
          <Button
            component="a"
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="small"
            disableElevation
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '10px',
              px: 2,
              py: 0.7,
              bgcolor: '#1E3A8A',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.24)',
              '&:hover': { 
                bgcolor: '#0F1E35',
                boxShadow: '0 8px 16px rgba(30, 58, 138, 0.32)',
              },
            }}
          >
            Apply Now
          </Button>
        </Box>
      </Box>

      <Box
        onMouseEnter={handleMatchMouseEnter}
        onMouseLeave={handleMatchMouseLeave}
        sx={{
          display: 'grid',
          gap: 0.35,
          justifyItems: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          pr: { md: 0.25 },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          alignSelf: 'flex-start',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        }}
      >
        <MatchPercentageCircle percentage={overallMatch} label="MATCH" size={90} />
        <Chip
          label={matchInfo.label}
          size="small"
          sx={{
            height: 20,
            borderRadius: '999px',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: matchInfo.color,
            bgcolor: matchInfo.ringBg,
          }}
        />
      </Box>

      <MatchBreakdownPopover
        anchorEl={matchAnchorEl}
        open={matchOpen}
        onClose={handleMatchMouseLeave}
        matchData={matchData}
      />
    </Box>
  );
}
