import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  InputAdornment,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  TextField,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneIcon from '@mui/icons-material/Tune';
import AllFiltersDrawer from './AllFiltersDrawer';

const DEFAULT_COUNTRIES = ['India', 'United States'];
const JOB_TITLES = [
  'Full Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Software Engineer',
  'DevOps Engineer',
  'Data Engineer',
  'Mobile Developer',
];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Staff'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES = ['Remote', 'Hybrid', 'Onsite'];
const DATE_POSTED_OPTIONS = ['Past 24 hours', 'Past week', 'Past month'];
const MENU_PROPS = {
  PaperProps: {
    sx: {
      maxHeight: 320,
      borderRadius: '12px',
      mt: 0.5,
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.1)',
    },
  },
};

export default function AdvancedFiltersBar({ filters, onChange, countryOptions = DEFAULT_COUNTRIES }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterControlSx = {
    minWidth: 156,
    '& .MuiOutlinedInput-root': {
      height: 42,
      borderRadius: '12px',
      bgcolor: '#fff',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#E2E8F0',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#b9c7e0',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1E3A8A',
        borderWidth: '1px',
      },
    },
  };

  const handleFilterChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleMultiSelectChange = (field, event) => {
    const value = event.target.value;
    onChange({ ...filters, [field]: typeof value === 'string' ? value.split(',') : value });
  };

  return (
    <Box
      sx={{
        p: { xs: 1.25, md: 1.4 },
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        bgcolor: '#f8fbff',
        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          placeholder="Search job title or company"
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          sx={{
            minWidth: { xs: '100%', md: 290 },
            flex: { xs: '1 1 100%', xl: '0 1 320px' },
            ...filterControlSx,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: 'var(--text-muted)' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Country */}
        <FormControl size="small" sx={{ minWidth: 170, ...filterControlSx }}>
          <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Country</InputLabel>
          <Select
            value={filters.countries?.[0] || ''}
            onChange={(e) => handleFilterChange('countries', e.target.value ? [e.target.value] : [])}
            label="Country"
            sx={{ fontSize: '0.875rem' }}
            MenuProps={MENU_PROPS}
          >
            <MenuItem value="">
              <em>All Countries</em>
            </MenuItem>
            {countryOptions.map((country) => (
              <MenuItem key={country} value={country} sx={{ fontSize: '0.875rem' }}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Job Title */}
        <FormControl size="small" sx={{ minWidth: 200, ...filterControlSx }}>
          <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Job Title</InputLabel>
          <Select
            value={filters.jobTitle || ''}
            onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
            label="Job Title"
            sx={{ fontSize: '0.875rem' }}
            MenuProps={MENU_PROPS}
          >
            <MenuItem value="">
              <em>All Roles</em>
            </MenuItem>
            {JOB_TITLES.map((title) => (
              <MenuItem key={title} value={title} sx={{ fontSize: '0.875rem' }}>
                {title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Experience Level */}
        <FormControl size="small" sx={{ minWidth: 170, ...filterControlSx }}>
          <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Experience</InputLabel>
          <Select
            multiple
            value={filters.experienceLevels || []}
            onChange={(e) => handleMultiSelectChange('experienceLevels', e)}
            input={<OutlinedInput label="Experience" />}
            MenuProps={MENU_PROPS}
            renderValue={(selected) =>
              selected.length === 0 ? (
                <em style={{ fontStyle: 'normal', color: 'var(--text-muted)' }}>Any Level</em>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.75rem',
                        bgcolor: 'rgba(30, 58, 138, 0.1)',
                        color: '#1E3A8A',
                      }}
                    />
                  ))}
                </Box>
              )
            }
            sx={{
              fontSize: '0.875rem',
            }}
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <MenuItem key={level} value={level} sx={{ fontSize: '0.875rem' }}>
                {level}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Job Type */}
        <FormControl size="small" sx={{ minWidth: 150, ...filterControlSx }}>
          <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Job Type</InputLabel>
          <Select
            multiple
            value={filters.jobTypes || []}
            onChange={(e) => handleMultiSelectChange('jobTypes', e)}
            input={<OutlinedInput label="Job Type" />}
            MenuProps={MENU_PROPS}
            renderValue={(selected) =>
              selected.length === 0 ? (
                <em style={{ fontStyle: 'normal', color: 'var(--text-muted)' }}>Any Type</em>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.75rem',
                        bgcolor: 'rgba(30, 58, 138, 0.1)',
                        color: '#1E3A8A',
                      }}
                    />
                  ))}
                </Box>
              )
            }
            sx={{
              fontSize: '0.875rem',
            }}
          >
            {JOB_TYPES.map((type) => (
              <MenuItem key={type} value={type} sx={{ fontSize: '0.875rem' }}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Work Mode */}
        <FormControl size="small" sx={{ minWidth: 150, ...filterControlSx }}>
          <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Work Mode</InputLabel>
          <Select
            multiple
            value={filters.workModes || []}
            onChange={(e) => handleMultiSelectChange('workModes', e)}
            input={<OutlinedInput label="Work Mode" />}
            MenuProps={MENU_PROPS}
            renderValue={(selected) =>
              selected.length === 0 ? (
                <em style={{ fontStyle: 'normal', color: 'var(--text-muted)' }}>Any Mode</em>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.75rem',
                        bgcolor: 'rgba(30, 58, 138, 0.1)',
                        color: '#1E3A8A',
                      }}
                    />
                  ))}
                </Box>
              )
            }
            sx={{
              fontSize: '0.875rem',
            }}
          >
            {WORK_MODES.map((mode) => (
              <MenuItem key={mode} value={mode} sx={{ fontSize: '0.875rem' }}>
                {mode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Posted */}
        <FormControl size="small" sx={{ minWidth: 160, ...filterControlSx }}>
          <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Date Posted</InputLabel>
          <Select
            value={filters.datePosted || 'Past 24 hours'}
            onChange={(e) => handleFilterChange('datePosted', e.target.value)}
            label="Date Posted"
            sx={{ fontSize: '0.875rem' }}
            MenuProps={MENU_PROPS}
          >
            {DATE_POSTED_OPTIONS.map((option) => (
              <MenuItem key={option} value={option} sx={{ fontSize: '0.875rem' }}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* More Filters Button */}
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderColor: '#d5deed',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            height: 42,
            px: 1.75,
            bgcolor: '#fff',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            '&:hover': {
              borderColor: '#1E3A8A',
              bgcolor: '#f5f9ff',
            },
          }}
        >
          More Filters
        </Button>
      </Box>

      <AllFiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={onChange}
      />
    </Box>
  );
}
