import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Chip, Button, Tabs, Tab, Avatar, IconButton,
  Select, MenuItem, CircularProgress, Tooltip, Rating, Stack, Card,
  TextField, InputAdornment, Skeleton, Divider, LinearProgress,
} from '@mui/material';
import {
  X, ExternalLink, Mail, Linkedin, Copy, Video, Code, Phone,
  Building, Calendar, CheckCircle, Clock, AlertCircle, TrendingUp,
  Info, Sparkles, MapPin, Users, Briefcase, Star, Award, ThumbsUp,
  Factory, Globe, LinkIcon,
} from 'lucide-react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { format } from 'date-fns';
import {
  getApplicationAPI,
  addEventToCalendarAPI,
  getSalaryEstimateAPI,
} from '../../services/applicationsService';

const STATUS_COLORS = {
  applied: { bg: 'rgba(148,163,184,0.1)', text: '#64748B' },
  acknowledged: { bg: 'rgba(37,99,235,0.08)', text: '#2563EB' },
  in_review: { bg: 'rgba(245,158,11,0.08)', text: '#D97706' },
  interview_scheduled: { bg: 'rgba(124,58,237,0.08)', text: '#7C3AED' },
  interview_completed: { bg: 'rgba(99,102,241,0.08)', text: '#6366F1' },
  offer_received: { bg: 'rgba(16,185,129,0.08)', text: '#10B981' },
  rejected: { bg: 'rgba(239,68,68,0.08)', text: '#EF4444' },
  ghosted: { bg: 'rgba(148,163,184,0.1)', text: '#64748B' },
  withdrawn: { bg: 'rgba(245,158,11,0.08)', text: '#D97706' },
};

const EVENT_TYPE_CONFIG = {
  interview: { icon: Video, color: '#2563EB', label: 'Interview' },
  assessment: { icon: Code, color: '#F59E0B', label: 'Assessment' },
  technical_screen: { icon: Code, color: '#DC2626', label: 'Technical Screen' },
  culture_fit: { icon: Users, color: '#6366F1', label: 'Culture Fit' },
  offer_call: { icon: Phone, color: '#10B981', label: 'Offer Call' },
  onboarding: { icon: Building, color: '#10B981', label: 'Onboarding' },
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ height: '100%' }}>
      {value === index && <Box sx={{ height: '100%', overflow: 'auto' }}>{children}</Box>}
    </div>
  );
}

function OverviewTab({ app, onStatusChange }) {
  const statusColor = STATUS_COLORS[app.current_status] || STATUS_COLORS.applied;
  const companyProfile = app.company_profile;

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        {/* Company Header */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'var(--primary)',
                fontSize: '1.5rem',
                fontWeight: 900,
              }}
            >
              {app.company?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--text-primary)', mb: 0.5 }}>
                {app.company || 'Unknown Company'}
              </Typography>
              <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                {app.role || 'Untitled Role'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {app.platform && (
              <Chip
                label={app.platform}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: 'var(--light-blue-bg-08)' }}
              />
            )}
            <Chip
              label={app.current_status?.replace(/_/g, ' ') || 'applied'}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: statusColor.bg,
                color: statusColor.text,
              }}
            />
          </Box>
        </Box>

        {/* Company Profile */}
        {companyProfile && (
          <Card 
            sx={{ 
              p: 3, 
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <BusinessIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                COMPANY INSIGHTS
              </Typography>
            </Box>

            <Stack spacing={2.5}>
              {/* Core Info Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {companyProfile.industry && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mb: 0.5 }}>
                      <Briefcase size={13} color="var(--text-muted)" />
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        INDUSTRY
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {companyProfile.industry}
                    </Typography>
                  </Box>
                )}
                {companyProfile.size_range && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mb: 0.5 }}>
                      <Users size={13} color="var(--text-muted)" />
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        COMPANY SIZE
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {companyProfile.size_range} employees
                    </Typography>
                  </Box>
                )}
                {companyProfile.hq_location && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mb: 0.5 }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        HEADQUARTERS
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {companyProfile.hq_location}
                    </Typography>
                  </Box>
                )}
                {companyProfile.founded_year && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mb: 0.5 }}>
                      <Factory size={13} color="var(--text-muted)" />
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        FOUNDED
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {companyProfile.founded_year}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Glassdoor Rating - Enhanced */}
              {companyProfile.glassdoor_rating && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: '8px', 
                      bgcolor: 'rgba(16,185,129,0.05)',
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Award size={16} color="#10B981" />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981' }}>
                          GLASSDOOR RATING
                        </Typography>
                      </Box>
                      {companyProfile.linkedin_url && (
                        <Tooltip title="View on LinkedIn">
                          <IconButton 
                            size="small" 
                            href={companyProfile.linkedin_url} 
                            target="_blank"
                            sx={{ p: 0.5 }}
                          >
                            <Linkedin size={14} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>
                        {companyProfile.glassdoor_rating.toFixed(1)}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Rating
                          value={companyProfile.glassdoor_rating}
                          readOnly
                          precision={0.1}
                          size="medium"
                          sx={{ 
                            '& .MuiRating-iconFilled': { color: '#10B981' },
                            '& .MuiRating-iconEmpty': { color: 'rgba(16,185,129,0.2)' },
                          }}
                        />
                        <Box sx={{ mt: 0.5 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(companyProfile.glassdoor_rating / 5) * 100} 
                            sx={{ 
                              height: 4, 
                              borderRadius: 2,
                              bgcolor: 'rgba(16,185,129,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#10B981',
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          <ThumbsUp size={11} color="#10B981" />
                          <Typography sx={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>
                            {companyProfile.glassdoor_rating >= 4.0 ? 'Highly Rated' : 
                             companyProfile.glassdoor_rating >= 3.5 ? 'Well Rated' : 'Rated'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}

              {/* Company Description */}
              {companyProfile.description && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', mb: 1 }}>
                      ABOUT
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--text-secondary)', 
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {companyProfile.description}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Tech Stack */}
              {companyProfile.tech_stack && companyProfile.tech_stack.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, mb: 1.5, color: 'var(--text-muted)' }}>
                      TECH STACK
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {companyProfile.tech_stack.map((tech, idx) => (
                        <Chip
                          key={idx}
                          label={tech}
                          size="small"
                          icon={<Code size={12} />}
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 24, 
                            fontWeight: 700,
                            bgcolor: 'var(--light-blue-bg-08)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            '& .MuiChip-icon': {
                              color: 'var(--primary)',
                              fontSize: 12,
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </>
              )}

              {/* Domain Link */}
              {companyProfile.domain && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
                  <Globe size={12} color="var(--text-muted)" />
                  <Typography 
                    component="a" 
                    href={`https://${companyProfile.domain}`} 
                    target="_blank"
                    sx={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--primary)', 
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    {companyProfile.domain}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Card>
        )}

        {/* Applied Date */}
        {app.applied_date && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Applied on {format(new Date(app.applied_date), 'MMM dd, yyyy')}
            </Typography>
          </Box>
        )}

        {/* Next Action */}
        {app.next_action && (
          <Card
            sx={{
              p: 2,
              border: '2px solid var(--primary)',
              bgcolor: 'var(--light-blue-bg-08)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <TrendingUp size={18} color="var(--primary)" />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', mb: 0.5, color: 'var(--primary)' }}>
                  NEXT ACTION
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {app.next_action}
                </Typography>
              </Box>
            </Box>
          </Card>
        )}

        {/* Job URL */}
        {app.job_url && (
          <Button
            variant="outlined"
            startIcon={<ExternalLink size={16} />}
            href={app.job_url}
            target="_blank"
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            View Job Posting
          </Button>
        )}

        {/* Status Change */}
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', mb: 1, color: 'var(--text-muted)' }}>
            UPDATE STATUS
          </Typography>
          <Select
            value={app.current_status}
            onChange={(e) => onStatusChange(app.id, e.target.value)}
            fullWidth
            size="small"
            sx={{ fontWeight: 600 }}
          >
            {Object.keys(STATUS_COLORS).map((status) => (
              <MenuItem key={status} value={status}>
                {status.replace(/_/g, ' ').toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Last Activity */}
        {app.last_activity && (
          <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Last activity: {format(new Date(app.last_activity), 'MMM dd, yyyy')}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function HRContactsTab({ app }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', title: '', linkedin_url: '' });

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email);
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            HR & CONTACTS ({app.hr_contacts?.length || 0})
          </Typography>
          <Button
            size="small"
            onClick={() => setShowAddForm(!showAddForm)}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {showAddForm ? 'Cancel' : '+ Add Contact'}
          </Button>
        </Box>

        {showAddForm && (
          <Card sx={{ p: 2, border: '1px solid var(--border-color)' }}>
            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
              />
              <TextField
                size="small"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
              />
              <TextField
                size="small"
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                fullWidth
              />
              <TextField
                size="small"
                label="LinkedIn URL"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                fullWidth
              />
              <Button variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 700 }}>
                Save Contact
              </Button>
            </Stack>
          </Card>
        )}

        {!app.hr_contacts || app.hr_contacts.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', border: '1px dashed var(--border-color)' }}>
            <Mail size={32} color="var(--text-muted)" style={{ margin: '0 auto' }} />
            <Typography sx={{ mt: 2, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No HR contacts extracted yet
            </Typography>
            <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.75rem', mt: 0.5 }}>
              They'll appear once we process a reply email
            </Typography>
          </Card>
        ) : (
          app.hr_contacts.map((contact) => (
            <Card key={contact.id} sx={{ p: 2.5, border: '1px solid var(--border-color)' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'var(--primary)', fontWeight: 900, width: 44, height: 44 }}>
                  {contact.name?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {contact.name}
                  </Typography>
                  {contact.title && (
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)', mt: 0.25 }}>
                      {contact.title}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, alignItems: 'center' }}>
                    {contact.email && (
                      <>
                        <Tooltip title="Send email">
                          <IconButton
                            size="small"
                            href={`mailto:${contact.email}`}
                            sx={{ p: 0.5, color: 'var(--primary)' }}
                          >
                            <Mail size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy email">
                          <IconButton
                            size="small"
                            onClick={() => copyEmail(contact.email)}
                            sx={{ p: 0.5, color: 'var(--text-muted)' }}
                          >
                            <Copy size={16} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {contact.linkedin_url && (
                      <Tooltip title="LinkedIn">
                        <IconButton
                          size="small"
                          href={contact.linkedin_url}
                          target="_blank"
                          sx={{ p: 0.5, color: '#0077B5' }}
                        >
                          <Linkedin size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}

function TimelineTab({ app }) {
  const queryClient = useQueryClient();

  const addToCalendarMutation = useMutation({
    mutationFn: (eventId) => addEventToCalendarAPI(app.id, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(['application', app.id]);
    },
  });

  const formatEventDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return format(date, "EEE, MMM dd · h:mm a");
  };

  const events = app.interview_events || [];
  const history = app.history || [];

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          INTERVIEW TIMELINE
        </Typography>

        {events.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', border: '1px dashed var(--border-color)' }}>
            <Calendar size={32} color="var(--text-muted)" style={{ margin: '0 auto' }} />
            <Typography sx={{ mt: 2, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No interviews scheduled yet
            </Typography>
          </Card>
        ) : (
          <Box sx={{ position: 'relative', pl: 4 }}>
            {/* Timeline line */}
            <Box
              sx={{
                position: 'absolute',
                left: 15,
                top: 20,
                bottom: 20,
                width: 2,
                bgcolor: 'var(--border-color)',
              }}
            />

            <Stack spacing={3}>
              {events.map((event, idx) => {
                const config = EVENT_TYPE_CONFIG[event.event_type] || EVENT_TYPE_CONFIG.interview;
                const Icon = config.icon;

                return (
                  <Box key={event.id} sx={{ position: 'relative' }}>
                    {/* Node */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -38,
                        top: 4,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'white',
                        border: `2px solid ${config.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <Icon size={14} color={config.color} />
                    </Box>

                    {/* Event card */}
                    <Card sx={{ p: 2, border: '1px solid var(--border-color)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {event.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)', mt: 0.25 }}>
                            {formatEventDate(event.scheduled_at)}
                          </Typography>
                        </Box>
                        <Chip
                          label={config.label}
                          size="small"
                          sx={{
                            bgcolor: `${config.color}15`,
                            color: config.color,
                            fontWeight: 700,
                            fontSize: '0.65rem',
                          }}
                        />
                      </Box>

                      <Stack spacing={1}>
                        {event.duration_minutes && (
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Clock size={12} color="var(--text-muted)" />
                            <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {event.duration_minutes} min
                            </Typography>
                          </Box>
                        )}
                        {event.format && (
                          <Chip
                            label={event.format.replace('_', ' ')}
                            size="small"
                            sx={{ width: 'fit-content', fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                        {event.meeting_link && (
                          <Button
                            size="small"
                            startIcon={<Video size={14} />}
                            href={event.meeting_link}
                            target="_blank"
                            sx={{ textTransform: 'none', fontWeight: 700, width: 'fit-content' }}
                          >
                            Join Meeting
                          </Button>
                        )}
                        {event.notes && (
                          <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            {event.notes}
                          </Typography>
                        )}

                        {/* Calendar sync status */}
                        <Box sx={{ mt: 1 }}>
                          {event.calendar_event_id ? (
                            <Chip
                              icon={<CheckCircle size={12} />}
                              label="Added to Calendar"
                              size="small"
                              sx={{
                                bgcolor: 'rgba(16,185,129,0.08)',
                                color: '#10B981',
                                fontWeight: 700,
                                fontSize: '0.65rem',
                              }}
                            />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Calendar size={14} />}
                              onClick={() => addToCalendarMutation.mutate(event.id)}
                              disabled={addToCalendarMutation.isLoading}
                              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.7rem' }}
                            >
                              Add to Calendar
                            </Button>
                          )}
                        </Box>
                      </Stack>
                    </Card>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Status History */}
        {history.length > 0 && (
          <>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', mt: 3 }}>
              STATUS HISTORY
            </Typography>
            <Stack spacing={1.5}>
              {[...history].reverse().map((h) => (
                <Card key={h.id} sx={{ p: 2, border: '1px solid var(--border-color)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        {h.status?.replace(/_/g, ' ').toUpperCase()}
                      </Typography>
                      {h.summary && (
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)', mt: 0.5 }}>
                          {h.summary}
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {format(new Date(h.changed_at), 'MMM dd')}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
}

function SalaryTab({ app }) {
  const queryClient = useQueryClient();

  const { data: salaryEstimate, isLoading: isLoadingEstimate } = useQuery({
    queryKey: ['salary-estimate', app.id],
    queryFn: () => getSalaryEstimateAPI(app.id, false).then((r) => r.data),
    enabled: !!app.id,
  });

  const refreshMutation = useMutation({
    mutationFn: () => getSalaryEstimateAPI(app.id, true).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['salary-estimate', app.id], data);
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const isRefreshing = refreshMutation.isLoading;

  const formatSalary = (amount, currency = 'INR', compact = false) => {
    if (!amount) return null;
    const symbols = { USD: '$', INR: '₹', GBP: '£', EUR: '€' };
    const symbol = symbols[currency] || '₹';
    
    // For INR, use Indian numbering system (Lakhs/Crores)
    if (currency === 'INR') {
      if (compact) {
        // Compact format: ₹28L - ₹34L
        if (amount >= 10000000) {
          return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) {
          return `${symbol}${(amount / 100000).toFixed(1)}L`;
        } else {
          return `${symbol}${(amount / 1000).toFixed(0)}K`;
        }
      } else {
        // Full format with commas: ₹28,00,000
        return `${symbol}${amount.toLocaleString('en-IN')}`;
      }
    }
    
    // For other currencies, use K/M notation
    if (compact) {
      if (amount >= 1000000) {
        return `${symbol}${(amount / 1000000).toFixed(1)}M`;
      } else {
        return `${symbol}${(amount / 1000).toFixed(0)}K`;
      }
    } else {
      return `${symbol}${amount.toLocaleString('en-US')}`;
    }
  };

  const hasEstimate = salaryEstimate && !salaryEstimate.error;
  const hasJDSalary = app.salary_min && app.salary_max;

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              SALARY ESTIMATE
            </Typography>
            <Tooltip title="Based on role, company, your experience, and market data">
              <Info size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            </Tooltip>
          </Box>
          <Tooltip title={isRefreshing ? "Generating estimate..." : "Refresh estimate"}>
            <IconButton size="small" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <CircularProgress size={18} />
              ) : (
                <RefreshRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {isRefreshing || isLoadingEstimate ? (
          <Box sx={{ p: 4 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Stack spacing={3}>
                {/* Loading Message */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', mb: 0.5 }}>
                    {isRefreshing ? 'Recalculating Salary Estimate...' : 'Loading Salary Estimate...'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Analyzing market data, company info, and your profile
                  </Typography>
                </Box>
                
                {/* Skeleton Cards */}
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '12px' }} animation="wave" />
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '12px' }} animation="wave" />
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '12px' }} animation="wave" />
              </Stack>
            </motion.div>
          </Box>
        ) : hasEstimate ? (
          <>
            {/* Estimated Range - Enhanced */}
            <Card 
              sx={{ 
                p: 3.5, 
                border: '2px solid var(--primary)', 
                bgcolor: 'var(--light-blue-bg-08)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(59,130,246,0.15)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sparkles size={18} color="var(--primary)" />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: 0.5 }}>
                    AI ESTIMATED RANGE
                  </Typography>
                </Box>
                {salaryEstimate.cached && (
                  <Tooltip title="This is a cached estimate. Click refresh to recalculate with latest data.">
                    <Chip
                      label="CACHED"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        bgcolor: 'rgba(148,163,184,0.1)',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
              
              {/* Compact display for quick view */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {formatSalary(salaryEstimate.estimated_min, salaryEstimate.currency || 'INR', true)} – {formatSalary(salaryEstimate.estimated_max, salaryEstimate.currency || 'INR', true)}
                </Typography>
                {salaryEstimate.confidence && (
                  <Chip
                    label={salaryEstimate.confidence.toUpperCase()}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 20,
                      bgcolor:
                        salaryEstimate.confidence === 'high'
                          ? 'rgba(16,185,129,0.15)'
                          : salaryEstimate.confidence === 'medium'
                          ? 'rgba(245,158,11,0.15)'
                          : 'rgba(148,163,184,0.15)',
                      color:
                        salaryEstimate.confidence === 'high'
                          ? '#10B981'
                          : salaryEstimate.confidence === 'medium'
                          ? '#F59E0B'
                          : '#64748B',
                    }}
                  />
                )}
              </Box>
              
              {/* Full format display */}
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', mt: 1 }}>
                {formatSalary(salaryEstimate.estimated_min, salaryEstimate.currency || 'INR', false)} – {formatSalary(salaryEstimate.estimated_max, salaryEstimate.currency || 'INR', false)} per annum
              </Typography>
            </Card>

            {/* JD Salary - Enhanced */}
            {hasJDSalary && (
              <Card 
                sx={{ 
                  p: 3, 
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  bgcolor: 'rgba(245,158,11,0.03)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <WorkOutlineIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#F59E0B', letterSpacing: 0.5 }}>
                    JOB DESCRIPTION SALARY
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', mb: 0.5 }}>
                  {formatSalary(app.salary_min, app.salary_currency || 'INR', true)} – {formatSalary(app.salary_max, app.salary_currency || 'INR', true)}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {formatSalary(app.salary_min, app.salary_currency || 'INR', false)} – {formatSalary(app.salary_max, app.salary_currency || 'INR', false)} per annum
                </Typography>
              </Card>
            )}

            {/* Rationale */}
            {salaryEstimate.rationale && (
              <Card 
                sx={{ 
                  p: 3, 
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  bgcolor: 'rgba(99,102,241,0.02)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Info size={16} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', mb: 1 }}>
                      ESTIMATION RATIONALE
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {salaryEstimate.rationale}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )}

            {/* Data Sources */}
            {salaryEstimate.data_sources_note && (
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: '8px', 
                  bgcolor: 'rgba(148,163,184,0.05)',
                  border: '1px solid rgba(148,163,184,0.15)',
                }}
              >
                <Typography sx={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  💡 {salaryEstimate.data_sources_note}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Card 
            sx={{ 
              p: 5, 
              textAlign: 'center', 
              border: '2px dashed var(--border-color)',
              borderRadius: '12px',
              bgcolor: 'rgba(148,163,184,0.02)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 1, fontSize: '1rem' }}>
                No Salary Estimate Yet
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--text-secondary)', mb: 3, maxWidth: 280, margin: '0 auto' }}>
                Click the refresh button above to generate an AI-powered salary estimate based on market data
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Sparkles size={14} />}
                onClick={handleRefresh}
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
                }}
              >
                Generate Estimate
              </Button>
            </motion.div>
          </Card>
        )}
      </Stack>
    </Box>
  );
}

export default function ApplicationDrawer({ applicationId, onClose, onStatusChange }) {
  const [tab, setTab] = useState(0);

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplicationAPI(applicationId).then((r) => r.data),
    enabled: !!applicationId,
  });

  if (!applicationId) return null;

  return (
    <AnimatePresence>
      {applicationId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1300,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: 480,
              backgroundColor: 'var(--bg-paper)',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
              zIndex: 1400,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Application Details
              </Typography>
              <IconButton onClick={onClose} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid var(--border-color)' }}>
              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  },
                }}
              >
                <Tab label="Overview" />
                <Tab label="HR & Contacts" />
                <Tab label="Timeline" />
                <Tab label="Salary" />
              </Tabs>
            </Box>

            {/* Content */}
            {isLoading ? (
              <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
                <Stack spacing={3}>
                  {/* Header Skeleton */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={56} height={56} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="40%" height={24} />
                    </Box>
                  </Box>
                  
                  {/* Company Profile Skeleton */}
                  <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '12px' }} />
                  
                  {/* Action Cards Skeleton */}
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '12px' }} />
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '12px' }} />
                  
                  {/* Details Skeleton */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px' }} />
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px' }} />
                  </Box>
                </Stack>
              </Box>
            ) : app ? (
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <TabPanel value={tab} index={0}>
                  <OverviewTab app={app} onStatusChange={onStatusChange} />
                </TabPanel>
                <TabPanel value={tab} index={1}>
                  <HRContactsTab app={app} />
                </TabPanel>
                <TabPanel value={tab} index={2}>
                  <TimelineTab app={app} />
                </TabPanel>
                <TabPanel value={tab} index={3}>
                  <SalaryTab app={app} />
                </TabPanel>
              </Box>
            ) : (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <AlertCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>
                  Application Not Found
                </Typography>
                <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  This application may have been deleted or moved
                </Typography>
              </Box>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
