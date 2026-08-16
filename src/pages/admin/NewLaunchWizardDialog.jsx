import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import InterviewFlowStepper from '../../components/admin/interview/InterviewFlowStepper';
import DifficultyChip from '../../components/admin/interview/DifficultyChip';
import VoicePicker from '../../components/admin/interview/VoicePicker';
import { AddUserDialog } from '../../components/admin';
import { getAdminInterviewsAPI, getAdminUsersAPI, launchAdminInterviewsAPI } from '../../services';
import { getInterviewVoicesAPI } from '../../services/interviewVoiceService';
import { parseApiError } from '../../utilities/apiErrorUtils';

const WIZARD_STEPS = [
  { key: 'name', label: 'Campaign' },
  { key: 'template', label: 'Interview' },
  { key: 'people', label: 'Candidates' },
];

const NAME_SUGGESTIONS = [
  'Q1 Engineering — Batch 1',
  'Frontend Hiring — March 2026',
  'Campus Drive — Day 1',
];

function getInitials(firstName, lastName, email) {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

function displayName(user) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.email || 'User';
}

export default function NewLaunchWizardDialog({ open, onClose, onLaunched }) {
  const [step, setStep] = useState(0);
  const [launchName, setLaunchName] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(new Map());
  const [addUserOpen, setAddUserOpen] = useState(false);

  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState(null);
  const [voiceGroups, setVoiceGroups] = useState([]);
  const [voiceLanguages, setVoiceLanguages] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceLanguageCode, setVoiceLanguageCode] = useState('en-IN');
  const [silenceSubmitSeconds, setSilenceSubmitSeconds] = useState(10);
  const [pauseDurationSeconds, setPauseDurationSeconds] = useState(10);
  const [maxPausesPerInterview, setMaxPausesPerInterview] = useState(3);
  const [voicesLoading, setVoicesLoading] = useState(false);

  const refreshVoices = useCallback(async (createdVoice) => {
    setVoicesLoading(true);
    try {
      const voicesRes = await getInterviewVoicesAPI();
      const voiceData = voicesRes?.data || {};
      setVoiceGroups(voiceData.groups || []);
      setVoiceLanguages(voiceData.languages || []);
      if (createdVoice?.voice_id) {
        const createdOption = {
          id: createdVoice.voice_id,
          label: createdVoice.label,
          provider: createdVoice.provider || 'cartesia',
          tier: createdVoice.tier || 'cartesia_custom',
          language: createdVoice.language || voiceLanguageCode,
          description: createdVoice.description,
          clone_record_id: createdVoice.id,
        };
        setSelectedVoice(createdOption);
      } else if (!selectedVoice && voiceData.default_voice) {
        setSelectedVoice(voiceData.default_voice);
      }
      if (voiceData.default_language && !voiceLanguageCode) {
        setVoiceLanguageCode(voiceData.default_language);
      }
    } finally {
      setVoicesLoading(false);
    }
  }, [selectedVoice, voiceLanguageCode]);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setLaunchName('');
    setSelectedTemplate(null);
    setSelectedUsers(new Map());
    setSearch('');
    setError(null);
    setSelectedVoice(null);
    setVoiceLanguageCode('en-IN');
    setSilenceSubmitSeconds(10);
    setPauseDurationSeconds(10);
    setMaxPausesPerInterview(3);
    setTemplatesLoading(true);
    setVoicesLoading(true);
    Promise.all([
      getAdminInterviewsAPI(),
      getInterviewVoicesAPI(),
    ])
      .then(([templatesRes, voicesRes]) => {
        setTemplates(templatesRes?.data?.interviews || []);
        const voiceData = voicesRes?.data || {};
        setVoiceGroups(voiceData.groups || []);
        setVoiceLanguages(voiceData.languages || []);
        if (voiceData.default_voice) {
          setSelectedVoice(voiceData.default_voice);
        }
        if (voiceData.default_language) {
          setVoiceLanguageCode(voiceData.default_language);
        }
      })
      .finally(() => {
        setTemplatesLoading(false);
        setVoicesLoading(false);
      });
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(() => {
    if (step !== 2) return;
    setUsersLoading(true);
    getAdminUsersAPI({ page: 1, limit: 50, search: searchDebounced || undefined })
      .then((res) => setUsers(res?.data?.users || []))
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, [step, searchDebounced]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, { id: user.id, email: user.email || '', first_name: user.first_name, last_name: user.last_name });
      return next;
    });
  };

  const handleUserCreated = (user) => {
    if (!user?.id) return;
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      next.set(user.id, {
        id: user.id,
        email: user.email || '',
        first_name: user.first_name,
        last_name: user.last_name,
      });
      return next;
    });
    setSearch('');
    fetchUsers();
  };

  const canNext = () => {
    if (step === 0) return launchName.trim().length > 0;
    if (step === 1) return Boolean(selectedTemplate && selectedVoice);
    return selectedUsers.size > 0;
  };

  const handleLaunch = () => {
    if (!selectedTemplate || selectedUsers.size === 0 || !selectedVoice) return;
    setLaunching(true);
    setError(null);
    const launchUsers = Array.from(selectedUsers.values());
    launchAdminInterviewsAPI({
      launch_name: launchName.trim(),
      interview_id: selectedTemplate.id,
      title: selectedTemplate.title,
      difficulty: selectedTemplate.difficulty,
      description: selectedTemplate.description,
      created_at: selectedTemplate.created_at,
      voice_provider: selectedVoice.provider,
      voice_id: selectedVoice.id,
      voice_label: selectedVoice.label,
      tts_language_code: voiceLanguageCode,
      silence_submit_seconds: silenceSubmitSeconds,
      pause_duration_seconds: pauseDurationSeconds,
      max_pauses_per_interview: maxPausesPerInterview,
      users: launchUsers,
    })
      .then(() => {
        onLaunched?.();
        onClose();
      })
      .catch((err) => setError(parseApiError(err, 'Failed to launch interview')))
      .finally(() => setLaunching(false));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={launching ? undefined : onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            background: 'linear-gradient(135deg, var(--light-blue-bg-08) 0%, var(--bg-paper) 70%)',
            borderBottom: '1px solid var(--divider)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'var(--primary)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                }}
              >
                <RocketLaunchRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Launch interview
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mt: 0.25, maxWidth: 420 }}>
                  Three quick steps — name your campaign, pick an AI interview, assign candidates.
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} disabled={launching} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <InterviewFlowStepper steps={WIZARD_STEPS} activeIndex={step} />
        </Box>

        <DialogContent sx={{ pt: 2.5, pb: 1, minHeight: 280 }}>
          {error && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: '10px',
                bgcolor: 'var(--error-bg)',
                color: 'var(--error-dark)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </Box>
          )}

          {step === 0 && (
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.5 }}>Campaign name</Typography>
              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mb: 2 }}>
                Internal label for your dashboard — candidates see the interview title, not this name.
              </Typography>
              <TextField
                fullWidth
                autoFocus
                placeholder="e.g. Q3 Frontend Hiring — Batch 1"
                value={launchName}
                onChange={(e) => setLaunchName(e.target.value.slice(0, 255))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'var(--bg-paper)' } }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {NAME_SUGGESTIONS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    onClick={() => setLaunchName(s)}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 12,
                      bgcolor: 'var(--grey-4)',
                      '&:hover': { bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {step === 1 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: 'var(--primary)' }} />
                <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Choose a ready-made AI interview from Interview Studio.
                </Typography>
              </Box>
              {templatesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : templates.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 5,
                    px: 2,
                    borderRadius: '12px',
                    border: '1px dashed var(--border-color)',
                    bgcolor: 'var(--grey-4)',
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No interviews yet</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Create one in Interview Studio, then come back to launch it.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {templates.map((t) => {
                    const selected = selectedTemplate?.id === t.id;
                    return (
                      <Box
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
                          bgcolor: selected ? 'var(--light-blue-bg-04)' : 'var(--bg-paper)',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          '&:hover': { borderColor: 'var(--primary)', boxShadow: 'var(--dashboard-card-shadow)' },
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{t.title}</Typography>
                            <DifficultyChip difficulty={t.difficulty} />
                          </Box>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: 'var(--text-secondary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {t.summary || t.description}
                          </Typography>
                          {t.question_count && (
                            <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', mt: 0.75, fontWeight: 600 }}>
                              {t.question_count} questions
                            </Typography>
                          )}
                        </Box>
                        {selected && (
                          <CheckCircleRoundedIcon sx={{ color: 'var(--primary)', fontSize: 22, flexShrink: 0, mt: 0.25 }} />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {selectedTemplate && (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid var(--divider)' }}>
                  {voicesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <VoicePicker
                      groups={voiceGroups}
                      selectedVoice={selectedVoice}
                      onSelect={setSelectedVoice}
                      languageCode={voiceLanguageCode}
                      onLanguageChange={setVoiceLanguageCode}
                      languages={voiceLanguages}
                      onVoicesChanged={refreshVoices}
                    />
                  )}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid var(--divider)' }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.5 }}>Session rules</Typography>
                    <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mb: 2 }}>
                      Silence auto-submit, thinking pauses, and limits apply to the whole interview for each candidate.
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                      <TextField
                        label="Silence before submit (sec)"
                        type="number"
                        size="small"
                        value={silenceSubmitSeconds}
                        onChange={(e) => setSilenceSubmitSeconds(Math.min(30, Math.max(5, Number(e.target.value) || 10)))}
                        inputProps={{ min: 5, max: 30 }}
                      />
                      <TextField
                        label="Pause duration (sec)"
                        type="number"
                        size="small"
                        value={pauseDurationSeconds}
                        onChange={(e) => setPauseDurationSeconds(Math.min(60, Math.max(5, Number(e.target.value) || 10)))}
                        inputProps={{ min: 5, max: 60 }}
                      />
                      <TextField
                        label="Max pauses per interview"
                        type="number"
                        size="small"
                        value={maxPausesPerInterview}
                        onChange={(e) => setMaxPausesPerInterview(Math.min(10, Math.max(0, Number(e.target.value) || 3)))}
                        inputProps={{ min: 0, max: 10 }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Select candidates</Typography>
                  <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 0.25 }}>
                    Pick existing users or add someone new — they&apos;ll receive the interview invite.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddRoundedIcon />}
                  onClick={() => setAddUserOpen(true)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                    borderColor: 'var(--border-color)',
                    flexShrink: 0,
                  }}
                >
                  Add candidate
                </Button>
              </Box>

              {selectedUsers.size > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {Array.from(selectedUsers.values()).map((u) => (
                    <Chip
                      key={u.id}
                      label={displayName(u)}
                      size="small"
                      onDelete={() => toggleUser(u)}
                      sx={{ fontWeight: 600, fontSize: 12, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)' }}
                    />
                  ))}
                </Box>
              )}

              <TextField
                fullWidth
                size="small"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" sx={{ color: 'var(--text-muted)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'var(--bg-paper)' } }}
              />

              <Box
                sx={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  maxHeight: 280,
                  overflowY: 'auto',
                  bgcolor: 'var(--bg-paper)',
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'var(--grey-4)' }}>
                      <TableCell padding="checkbox" />
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: 'var(--text-secondary)' }}>
                        Candidate
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 5 }}>
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 5 }}>
                          <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 1.5 }}>
                            No users match your search.
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<PersonAddRoundedIcon />}
                            onClick={() => setAddUserOpen(true)}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                          >
                            Add new candidate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow
                          key={u.id}
                          hover
                          selected={selectedUsers.has(u.id)}
                          onClick={() => toggleUser(u)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={selectedUsers.has(u.id)} size="small" />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: 12,
                                  bgcolor: 'var(--light-blue-bg-08)',
                                  color: 'var(--primary)',
                                }}
                              >
                                {getInitials(u.first_name, u.last_name, u.email)}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                                  {displayName(u)}
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>

              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 1.5, fontWeight: 600 }}>
                {selectedUsers.size} selected · Ready to launch
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid var(--divider)', gap: 1, bgcolor: 'var(--bg-paper)' }}>
          {step > 0 && (
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => setStep((s) => s - 1)}
              disabled={launching}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Back
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          {step < 2 ? (
            <Button
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 2.5, boxShadow: 'none' }}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={launching ? <CircularProgress size={16} color="inherit" /> : <RocketLaunchRoundedIcon />}
              onClick={handleLaunch}
              disabled={!canNext() || launching}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 2.5, boxShadow: 'none' }}
            >
              {launching ? 'Launching…' : `Launch to ${selectedUsers.size} candidate${selectedUsers.size === 1 ? '' : 's'}`}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <AddUserDialog
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        title="Add candidate"
        subtitle="Create an account and we'll select them for this launch automatically."
        onCreated={handleUserCreated}
      />
    </>
  );
}
