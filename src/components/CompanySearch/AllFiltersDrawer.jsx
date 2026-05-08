import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  Divider,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

export default function AllFiltersDrawer({ open, onClose, filters, onChange }) {
  const [activeSection, setActiveSection] = useState('basic');

  const handleConfirm = () => {
    onClose();
  };

  const handleJobFunctionRemove = () => {
    onChange({ ...filters, jobTitle: '' });
  };

  const quickFilters = [
    { label: filters.jobTitle || 'Full Stack Engineer', removable: false },
    { label: 'Full-time', removable: true },
    { label: 'Onsite', removable: true },
    { label: 'Remote', removable: true },
    { label: 'Hybrid', removable: true },
    { label: 'Entry Level', removable: true },
    { label: 'Mid Level', removable: true },
    { label: 'United States', removable: true },
  ];

  const sidebarSections = [
    {
      id: 'basic',
      title: 'Basic Job Criteria',
      subtitle: 'Job Function / Job Type / Work Model...',
    },
    {
      id: 'compensation',
      title: 'Compensation & Sponsorship',
      subtitle: 'Annual Salary / H1B Sponsorship...',
    },
    {
      id: 'interests',
      title: 'Areas of Interests',
      subtitle: 'Industry / Skill / Role(IC/Manager)...',
    },
    {
      id: 'company',
      title: 'Company Insights',
      subtitle: 'Company Search / Exclude Staffing Agency...',
    },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '100%',
          maxWidth: 900,
          bgcolor: '#f8fafc',
        },
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'white',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={onClose}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a' }}>
              Full Stack Engineer, US
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#1E3A8A',
              color: 'white',
              px: 3,
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            Confirm
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            px: 3,
            py: 2,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {quickFilters.map((filter, idx) => (
            <Chip
              key={idx}
              label={filter.label}
              onDelete={filter.removable ? () => {} : undefined}
              size="small"
              sx={{
                bgcolor: '#f1f5f9',
                fontWeight: 500,
                fontSize: '0.8125rem',
                '& .MuiChip-deleteIcon': {
                  fontSize: 16,
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 140px)' }}>
        <Box
          sx={{
            width: 240,
            bgcolor: 'white',
            borderRight: '1px solid #e2e8f0',
            p: 2,
            overflowY: 'auto',
          }}
        >
          {sidebarSections.map((section) => (
            <Box
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: activeSection === section.id ? '#f1f5f9' : 'transparent',
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', mb: 0.5 }}>
                {section.title}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                {section.subtitle}
              </Typography>
            </Box>
          ))}

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', mb: 1 }}>
              Applying for specific companies?
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
              Use filters in the{' '}
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Company insights</span> section
              to find your target companies.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 4,
            overflowY: 'auto',
          }}
        >
          {activeSection === 'basic' && (
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: '#0f172a',
                  mb: 3,
                }}
              >
                Basic Job Criteria
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    mb: 1,
                  }}
                >
                  * Job Function{' '}
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}
                  >
                    (select from drop-down for best results)
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip
                    label="Full Stack Engineer"
                    onDelete={handleJobFunctionRemove}
                    sx={{
                      bgcolor: '#dcfce7',
                      color: '#166534',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  />
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Please select/enter your expected job function"
                  sx={{
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 1 }}>
                  Excluded Title
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  defaultValue=""
                  sx={{
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                    },
                  }}
                >
                  <MenuItem value="">Select excluded titles</MenuItem>
                  <MenuItem value="intern">Intern</MenuItem>
                  <MenuItem value="junior">Junior</MenuItem>
                </Select>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 2 }}>
                  * Job Type
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.jobTypes?.includes('Full-time')}
                        sx={{
                          color: '#1E3A8A',
                          '&.Mui-checked': { color: '#1E3A8A' },
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.875rem' }}>Full-time</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{
                          color: '#1E3A8A',
                          '&.Mui-checked': { color: '#1E3A8A' },
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.875rem' }}>Contract</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{
                          color: '#1E3A8A',
                          '&.Mui-checked': { color: '#1E3A8A' },
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.875rem' }}>Part-time</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{
                          color: '#1E3A8A',
                          '&.Mui-checked': { color: '#1E3A8A' },
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.875rem' }}>Internship</Typography>}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 2 }}>
                  * Work Model
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.workModes?.includes('Onsite')}
                        sx={{
                          color: '#10b981',
                          '&.Mui-checked': { color: '#10b981' },
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.875rem' }}>Onsite</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.workModes?.includes('Remote')}
                        sx={{
                          color: '#10b981',
                          '&.Mui-checked': { color: '#10b981' },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '0.875rem' }}>Remote anywhere in the US</Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.workModes?.includes('Hybrid')}
                        sx={{
                          color: '#10b981',
                          '&.Mui-checked': { color: '#10b981' },
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.875rem' }}>Hybrid</Typography>}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 2 }}>
                  * Location
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Select
                    size="small"
                    defaultValue="anywhere"
                    sx={{ flex: 1, bgcolor: 'white' }}
                  >
                    <MenuItem value="anywhere">Anywhere in the US</MenuItem>
                    <MenuItem value="specific">Specific Location</MenuItem>
                  </Select>
                  <Select
                    size="small"
                    defaultValue="25"
                    sx={{ width: 100, bgcolor: 'white' }}
                  >
                    <MenuItem value="10">10mi</MenuItem>
                    <MenuItem value="25">25mi</MenuItem>
                    <MenuItem value="50">50mi</MenuItem>
                    <MenuItem value="100">100mi</MenuItem>
                  </Select>
                  <Select
                    size="small"
                    defaultValue="us"
                    sx={{ width: 140, bgcolor: 'white' }}
                  >
                    <MenuItem value="us">🇺🇸 United States</MenuItem>
                    <MenuItem value="ca">🇨🇦 Canada</MenuItem>
                    <MenuItem value="uk">🇬🇧 United Kingdom</MenuItem>
                  </Select>
                </Box>
                <Button
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: 'none',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                  }}
                >
                  Add
                </Button>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 2 }}>
                  * Experience Level
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{
                            color: '#10b981',
                            '&.Mui-checked': { color: '#10b981' },
                          }}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.875rem' }}>Intern/New Grad</Typography>}
                    />
                    <IconButton size="small">
                      <HelpOutlineIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.experienceLevels?.includes('Entry Level')}
                          sx={{
                            color: '#10b981',
                            '&.Mui-checked': { color: '#10b981' },
                          }}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.875rem' }}>Entry Level</Typography>}
                    />
                    <IconButton size="small">
                      <HelpOutlineIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.experienceLevels?.includes('Mid Level')}
                          sx={{
                            color: '#10b981',
                            '&.Mui-checked': { color: '#10b981' },
                          }}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.875rem' }}>Mid Level</Typography>}
                    />
                    <IconButton size="small">
                      <HelpOutlineIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{
                            color: '#10b981',
                            '&.Mui-checked': { color: '#10b981' },
                          }}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.875rem' }}>Senior Level</Typography>}
                    />
                    <IconButton size="small">
                      <HelpOutlineIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{
                            color: '#10b981',
                            '&.Mui-checked': { color: '#10b981' },
                          }}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.875rem' }}>Lead/Staff</Typography>}
                    />
                    <IconButton size="small">
                      <HelpOutlineIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{
                            color: '#10b981',
                            '&.Mui-checked': { color: '#10b981' },
                          }}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.875rem' }}>Director/Executive</Typography>}
                    />
                    <IconButton size="small">
                      <HelpOutlineIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                      Required Experience
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Any requirements
                    </Typography>
                  </Box>
                    <Switch
                      defaultChecked
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#1E3A8A',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: '#1E3A8A',
                        },
                      }}
                    />
                </Box>
              </Box>
            </Box>
          )}

          {activeSection === 'compensation' && (
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: '#0f172a',
                  mb: 3,
                }}
              >
                Compensation & Sponsorship
              </Typography>
              <Typography sx={{ color: '#64748b' }}>
                Configure salary range and H1B sponsorship preferences...
              </Typography>
            </Box>
          )}

          {activeSection === 'interests' && (
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: '#0f172a',
                  mb: 3,
                }}
              >
                Areas of Interests
              </Typography>
              <Typography sx={{ color: '#64748b' }}>
                Select industries, skills, and role preferences...
              </Typography>
            </Box>
          )}

          {activeSection === 'company' && (
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: '#0f172a',
                  mb: 3,
                }}
              >
                Company Insights
              </Typography>
              <Typography sx={{ color: '#64748b' }}>
                Search specific companies or exclude staffing agencies...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
