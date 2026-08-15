import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Button,
  Checkbox,
  CircularProgress,
  Link,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import PageContainer from '../../components/common/PageContainer';
import { EmptyState, TableRowsSkeleton } from '../../components/admin';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { getAdminUsersAPI, launchAdminInterviewsAPI } from '../../services';
import { parseApiError } from '../../utilities/apiErrorUtils';
import { readLaunchInterview, clearLaunchInterview } from '../../utilities/launchInterviewStorage';
import toast from 'react-hot-toast';

const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

function getInitials(firstName, lastName, email) {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

function exportCSV(users) {
  if (!users?.length) return;
  const headers = ['Email', 'First Name', 'Last Name', 'Created', 'Last Activity', 'Jobs', 'Visits'];
  const rows = users.map((u) => [
    u.email || '',
    u.first_name || '',
    u.last_name || '',
    u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
    u.last_activity_at ? new Date(u.last_activity_at).toLocaleDateString() : '',
    u.jobs_count ?? 0,
    u.career_visits_count ?? 0,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `launch-interviews-users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

const tableCellHeadSx = {
  fontWeight: 700,
  fontSize: 13,
  bgcolor: 'var(--grey-4)',
  borderBottom: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  letterSpacing: '0.02em',
  py: 1.5,
};

export default function LaunchInterviews() {
  const navigate = useNavigate();
  const location = useLocation();
  const [interview, setInterview] = useState(
    () => location.state?.interview || readLaunchInterview(),
  );
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Map());
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const fromNav = location.state?.interview;
    if (fromNav) {
      setInterview(fromNav);
    }
  }, [location.key, location.state?.interview]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminUsersAPI({ page, limit, search: searchDebounced || undefined })
      .then((res) => {
        setUsers(res?.data?.users || []);
        setTotal(res?.data?.total || 0);
      })
      .catch((err) => {
        setError(parseApiError(err, 'Failed to load users'));
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, [page, limit, searchDebounced]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const pageUserIds = users.map((u) => u.id);
  const selectedOnPageCount = pageUserIds.filter((id) => selectedUsers.has(id)).length;
  const allOnPageSelected = users.length > 0 && selectedOnPageCount === users.length;
  const someOnPageSelected = selectedOnPageCount > 0 && !allOnPageSelected;
  const selectedCount = selectedUsers.size;

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, { id: user.id, email: user.email || '' });
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      if (allOnPageSelected) {
        pageUserIds.forEach((id) => next.delete(id));
      } else {
        users.forEach((u) => next.set(u.id, { id: u.id, email: u.email || '' }));
      }
      return next;
    });
  };

  const handleLaunchInterviews = () => {
    if (!interview || selectedCount === 0) return;

    const selected = Array.from(selectedUsers.values());
    const users = selected.map((u) => ({ id: u.id, email: u.email }));
    const userIds = users.map((u) => u.id);
    const userEmails = users.map((u) => u.email);

    setLaunching(true);
    setError(null);
    launchAdminInterviewsAPI({
      interview_id: interview.id,
      title: interview.title,
      difficulty: interview.difficulty,
      description: interview.description,
      created_at: interview.created_at,
      users,
      user_ids: userIds,
      user_emails: userEmails,
    })
      .then((res) => {
        const launched = res?.data?.launched_count ?? userIds.length;
        const launchedTitle = interview.title;
        clearLaunchInterview();
        setSelectedUsers(new Map());
        setInterview(null);
        navigate('/admin/launch-interviews', { replace: true, state: null });
        toast.success(`Successfully launched "${launchedTitle}" for ${launched} user${launched === 1 ? '' : 's'}.`, {
          duration: 2000,
        });
      })
      .catch((err) => {
        setError(parseApiError(err, 'Failed to launch interviews'));
      })
      .finally(() => setLaunching(false));
  };

  return (
    <PageContainer
      sx={{
        maxWidth: 1400,
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        bgcolor: 'var(--bg-light)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
          pb: 3,
          borderBottom: '1px solid var(--divider)',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 22, md: 28 },
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Launch Interviews
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: 14 }}>
            Select users and launch mock interview sessions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'var(--text-muted)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 260,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: 'var(--bg-paper)',
                '& fieldset': { borderColor: 'var(--border-color)' },
                '&:hover fieldset': { borderColor: 'var(--border-hover)' },
              },
            }}
          />
          <Button
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => exportCSV(users)}
            disabled={!users.length}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              bgcolor: 'var(--bg-paper)',
              px: 2,
              '&:hover': {
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                bgcolor: 'var(--light-blue-bg-08)',
              },
            }}
          >
            Export CSV
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={launching ? <CircularProgress size={16} color="inherit" /> : <RocketLaunchRoundedIcon />}
            onClick={handleLaunchInterviews}
            disabled={!interview || selectedCount === 0 || launching}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              px: 2,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Launch Interview{selectedCount > 1 ? 's' : ''}
            {selectedCount > 0 ? ` (${selectedCount})` : ''}
          </Button>
        </Box>
      </Box>

      {!interview && (
        <Box
          sx={{
            mb: 3,
            py: 1.5,
            px: 2,
            borderRadius: '10px',
            bgcolor: 'var(--warning-bg, #fffbeb)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            No interview template selected.{' '}
            <Link component={RouterLink} to="/admin/interview-creation" sx={{ fontWeight: 600 }}>
              Go to Interview Creation
            </Link>{' '}
            and click a template card to launch.
          </Typography>
        </Box>
      )}

      {interview && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--dashboard-card-shadow)',
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: 'var(--light-blue-bg-08)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <QuizRoundedIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                {interview.title}
              </Typography>
              <Chip
                label={DIFFICULTY_LABELS[String(interview.difficulty).toLowerCase()] || interview.difficulty}
                size="small"
                sx={{
                  height: 22,
                  fontWeight: 700,
                  fontSize: 11,
                  bgcolor: 'var(--warning-bg, #fef9c3)',
                  color: 'var(--text-primary)',
                }}
              />
              {interview.created_at && (
                <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                  Created {new Date(interview.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--text-secondary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {interview.description || 'No description'}
            </Typography>
          </Box>
        </Paper>
      )}

      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '10px',
            bgcolor: 'var(--error-bg)',
            border: '1px solid rgba(220,38,38,0.2)',
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--error-dark)', fontWeight: 500 }}>
            {error}
          </Typography>
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--dashboard-card-shadow)',
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={tableCellHeadSx}>
                  <Checkbox
                    size="small"
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected}
                    onChange={toggleAllOnPage}
                    disabled={loading || users.length === 0}
                    sx={{ color: 'var(--text-muted)', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: 'var(--primary)' } }}
                  />
                </TableCell>
                <TableCell sx={tableCellHeadSx}>User</TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>Jobs</TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>Visits</TableCell>
                <TableCell sx={tableCellHeadSx}>Last Activity</TableCell>
                <TableCell sx={tableCellHeadSx}>Status</TableCell>
                <TableCell width={56} sx={tableCellHeadSx} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={8} cols={7} />
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ border: 'none' }}>
                    <EmptyState
                      icon={InboxOutlinedIcon}
                      title="No users found"
                      description="Try a different search term or check back later."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const isSelected = selectedUsers.has(u.id);
                  return (
                    <TableRow
                      key={u.id}
                      hover
                      selected={isSelected}
                      sx={{
                        '&:hover': { bgcolor: 'var(--light-blue-bg-02)' },
                        transition: 'background 0.15s ease',
                        '& td': { borderBottom: '1px solid var(--divider)' },
                        '&.Mui-selected': { bgcolor: 'var(--light-blue-bg-04)' },
                        '&.Mui-selected:hover': { bgcolor: 'var(--light-blue-bg-06)' },
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ py: 1.5 }}>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => toggleUser(u)}
                          sx={{ color: 'var(--text-muted)', '&.Mui-checked': { color: 'var(--primary)' } }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: 13,
                              fontWeight: 700,
                              bgcolor: 'var(--light-blue-bg-08)',
                              color: 'var(--primary)',
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(u.first_name, u.last_name, u.email)}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                lineHeight: 1.3,
                              }}
                            >
                              {u.email || '—'}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontSize: 12, color: 'var(--text-muted)' }}
                            >
                              Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', py: 1.5 }}>
                        {u.jobs_count ?? 0}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', py: 1.5 }}>
                        {u.career_visits_count ?? 0}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, color: 'var(--text-secondary)', py: 1.5 }}>
                        {u.last_activity_at
                          ? new Date(u.last_activity_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                          : '—'}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label="Active"
                          size="small"
                          sx={{
                            height: 22,
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: '0.02em',
                            bgcolor: 'var(--success-bg)',
                            color: 'var(--success-dark)',
                            border: 'none',
                            borderRadius: '999px',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                          title="View usage"
                          sx={{
                            color: 'var(--text-muted)',
                            '&:hover': { color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' },
                          }}
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={(_, p) => setPage(p + 1)}
          rowsPerPage={limit}
          rowsPerPageOptions={[limit]}
          sx={{
            borderTop: '1px solid var(--border-color)',
            bgcolor: 'var(--bg-paper)',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: 13,
              color: 'var(--text-secondary)',
            },
          }}
        />
      </Paper>
    </PageContainer>
  );
}
