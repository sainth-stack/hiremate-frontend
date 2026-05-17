import { Box, Typography, Chip, Button, Divider, IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

export default function RightSidebar({ savedFilters, upNextEvents, onRemoveSavedFilter }) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 20,
        width: 300,
        flexShrink: 0,
        display: { xs: 'none', xl: 'block' },
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: THEME.textPrimary }}>
            Your Saved Filters
          </Typography>
          <IconButton size="small">
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          {savedFilters && savedFilters.length > 0 ? (
            savedFilters.map((filter, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  borderBottom: idx < savedFilters.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: THEME.textPrimary,
                      mb: 0.25,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {filter.name}
                  </Typography>
                  {filter.description && (
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: THEME.textSecondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {filter.description}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => onRemoveSavedFilter && onRemoveSavedFilter(idx)}
                  sx={{ ml: 1 }}
                >
                  <EditOutlinedIcon sx={{ fontSize: 16, color: THEME.textSecondary }} />
                </IconButton>
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary, mb: 1.5 }}>
                No saved filters yet
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: THEME.primary,
                }}
              >
                Create Filter
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: THEME.textPrimary }}>
            Up Next
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {upNextEvents && upNextEvents.length > 0 ? (
            upNextEvents.map((event, idx) => (
              <Box
                key={idx}
                sx={{
                  bgcolor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: 1.5,
                  p: 2,
                  mb: idx < upNextEvents.length - 1 ? 1.5 : 0,
                  position: 'relative',
                }}
              >
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14, color: THEME.textSecondary }} />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: 'white',
                      border: '1px solid #fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 16, color: '#d97706' }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: THEME.textPrimary,
                        mb: 0.5,
                        lineHeight: 1.3,
                      }}
                    >
                      {event.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: THEME.textSecondary,
                        lineHeight: 1.4,
                        mb: 1,
                      }}
                    >
                      {event.description}
                    </Typography>
                    {event.date && (
                      <Typography
                        sx={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: '#92400e',
                        }}
                      >
                        {event.date}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {event.price && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 1.5,
                      pt: 1.5,
                      borderTop: '1px solid #fde68a',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: THEME.textPrimary,
                      }}
                    >
                      {event.price}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        height: 28,
                        px: 1.5,
                        borderColor: '#fbbf24',
                        color: '#92400e',
                        bgcolor: 'white',
                        '&:hover': {
                          bgcolor: '#fef3c7',
                          borderColor: '#f59e0b',
                        },
                      }}
                    >
                      Save My Spot Now
                    </Button>
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary, textAlign: 'center', py: 2 }}>
              No upcoming events
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
