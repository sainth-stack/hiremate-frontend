import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import JobDescriptionInput from './JobDescriptionInput';
import {
  generateResumeAPI,
  listResumesAPI,
  uploadResumeAPI,
  updateResumeAPI,
  deleteResumeAPI,
} from '../../services';
import { BASE_URL } from '../../utilities/const';

const HERO_GRADIENT =
  'linear-gradient(90deg, rgba(51, 94, 222, 1) 0%, rgba(39, 39, 125, 1) 35%, rgba(54, 94, 214, 1) 100%)';

const BACKEND_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');
const getResumeFullUrl = (url) =>
  url && (url.startsWith('http://') || url.startsWith('https://'))
    ? url
    : `${BACKEND_ORIGIN}${url || ''}`;

const RESUME_GEN_SELECTED_KEY = 'resumeGeneratorSelectedId';
const getStoredSelectedId = () => {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(RESUME_GEN_SELECTED_KEY);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
};
const setStoredSelectedId = (id) => {
  try {
    if (id != null) localStorage.setItem(RESUME_GEN_SELECTED_KEY, String(id));
  } catch (e) {
    void e;
  }
};

const fetchResumes = (setResumes) => {
  listResumesAPI()
    .then(({ data }) => setResumes(Array.isArray(data) ? data : []))
    .catch(() => setResumes([]));
};

const creditsLeft = 4;

export default function ResumeGeneratorStart() {
  const navigate = useNavigate();

  // Generator state
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Recent Resumes state
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(getStoredSelectedId);
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editResume, setEditResume] = useState(null);
  const [editName, setEditName] = useState('');
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchResumes(setResumes);
  }, []);

  useEffect(() => {
    if (resumes.length === 0) return;
    const storedId = getStoredSelectedId();
    const validId =
      storedId && resumes.some((r) => r.id === storedId) ? storedId : resumes[0].id;
    setSelectedResumeId(validId);
  }, [resumes]);

  useEffect(() => {
    if (selectedResumeId != null) setStoredSelectedId(selectedResumeId);
  }, [selectedResumeId]);

  const handleManualUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name || '').toLowerCase().slice(-4);
    if (!['.pdf', '.doc', '.docx'].some((x) => ext.endsWith(x))) return;
    setUploading(true);
    uploadResumeAPI(file)
      .then(() => {
        listResumesAPI().then(({ data }) => {
          const list = Array.isArray(data) ? data : [];
          setResumes(list);
          const defaultResume = list.find((r) => r.is_default) || list[0];
          if (defaultResume) {
            setSelectedResumeId(defaultResume.id);
            setStoredSelectedId(defaultResume.id);
          }
        });
      })
      .catch(() => {})
      .finally(() => {
        setUploading(false);
        e.target.value = '';
      });
  };

  const handleOpenInNewTab = async (r) => {
    const url = `${BASE_URL}/resume/${r.id}/file`;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Failed to load');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error('Preview failed:', err);
    }
  };

  const openEdit = (r) => {
    setEditResume(r);
    setEditName(r.resume_name || '');
    setEditText(r.resume_text || '');
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditResume(null);
  };
  const saveEdit = async () => {
    if (!editResume) return;
    const name = (editName || '').trim();
    if (!name) return;
    setSaving(true);
    try {
      const { data } = await updateResumeAPI(editResume.id, {
        resume_name: name,
        resume_text: editText ?? editResume.resume_text ?? '',
      });
      setResumes((prev) =>
        prev.map((r) =>
          r.id === data.id
            ? { ...r, resume_name: data.resume_name, resume_text: data.resume_text ?? r.resume_text }
            : r
        )
      );
      closeEdit();
    } catch (err) {
      console.error('Failed to save resume:', err);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (r) => setDeleteId(r.id);
  const cancelDelete = () => setDeleteId(null);
  const doDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteResumeAPI(deleteId);
      setResumes((prev) => {
        const next = prev.filter((r) => r.id !== deleteId);
        if (selectedResumeId === deleteId && next.length > 0) {
          setSelectedResumeId(next[0].id);
        } else if (next.length === 0) {
          setSelectedResumeId(null);
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to delete resume:', err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription?.trim()) return;
    setError('');
    setGenerating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.random() * 6 + 3));
    }, 400);
    try {
      const { data } = await generateResumeAPI({
        job_title: jobRole?.trim() || 'Resume',
        job_description: jobDescription.trim(),
      });
      setProgress(100);
      fetchResumes(setResumes);
      if (data?.resume_id) setSelectedResumeId(data.resume_id);
      setTimeout(() => navigate('/resume-generator/build'), 400);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Resume generation failed. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: 'var(--bg-app)',
        overflowX: 'hidden',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* Blue gradient hero */}
      <Box
        sx={{
          background: HERO_GRADIENT,
          color: 'white',
          py: 3.5,
          px: { xs: 2.5, sm: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: 'auto', position: 'relative' }}>
          <IconButton
            onClick={() => navigate('/ai-resume-studio')}
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
            aria-label="Back to AI Resume Studio"
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-family)',
              fontWeight: 700,
              textAlign: 'center',
              fontSize: {
                xs: 'var(--font-size-section-header)',
                sm: 'var(--font-size-page-title)',
              },
              mb: 1,
            }}
          >
            Build a Professional Resume in Minutes
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              fontSize: 'var(--font-size-page-subtitle)',
              opacity: 0.95,
              mb: 2,
            }}
          >
            Create a job-winning resume tailored to your experience and target role using AI
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              maxWidth: 560,
              mx: 'auto',
              fontSize: 'var(--font-size-helper)',
              opacity: 0.9,
              mb: 3,
            }}
          >
            Paste any job description and get a perfectly customized resume in seconds.
            ATS-optimized. Interview-ready.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
            <Chip
              icon={<BoltRoundedIcon sx={{ fontSize: 18 }} />}
              label="30 seconds"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
            <Chip
              icon={<TrackChangesRoundedIcon sx={{ fontSize: 18 }} />}
              label="ATS-optimized"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
            <Chip
              icon={<BusinessCenterRoundedIcon sx={{ fontSize: 18 }} />}
              label="Industry-proven"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          px: { xs: 2, sm: 4 },
          pt: 4,
          pb: 6,
          minHeight: 'calc(100vh - 220px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 3,
              alignItems: 'stretch',
            }}
          >
            {/* Left – Resume Generator card */}
            <Box
              sx={{
                flex: '0 0 calc((100% - 24px) * 0.73)',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Card header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AutoAwesomeRoundedIcon sx={{ color: 'white', fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }}
                          color="var(--text-primary)"
                        >
                          Resume Generator
                        </Typography>
                        <Typography
                          variant="body2"
                          color="var(--text-secondary)"
                          sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}
                        >
                          Paste a job description to get started
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      icon={<CardGiftcardRoundedIcon sx={{ fontSize: 16 }} />}
                      label={creditsLeft}
                      size="small"
                      sx={{
                        fontFamily: 'var(--font-family)',
                        bgcolor: 'var(--light-blue-bg)',
                        color: 'var(--primary)',
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  {/* Generating progress or input form */}
                  {generating ? (
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 6,
                      }}
                    >
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          bgcolor: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <AutoAwesomeRoundedIcon sx={{ color: 'white', fontSize: 40 }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          mb: 0.5,
                        }}
                      >
                        Creating Your Perfect Resume
                      </Typography>
                      <Typography
                        variant="body2"
                        color="var(--text-muted)"
                        sx={{ fontFamily: 'var(--font-family)', mb: 2 }}
                      >
                        Processing your resume...
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progress, 100)}
                        sx={{
                          width: '100%',
                          maxWidth: 320,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'var(--bg-light)',
                          '& .MuiLinearProgress-bar': { borderRadius: 4 },
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="var(--text-muted)"
                        sx={{ fontFamily: 'var(--font-family)', mt: 1 }}
                      >
                        {Math.round(Math.min(progress, 100))}% complete
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <JobDescriptionInput
                        role={jobRole}
                        jobDescription={jobDescription}
                        onRoleChange={setJobRole}
                        onJobDescriptionChange={setJobDescription}
                      />
                      {error && (
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{ fontFamily: 'var(--font-family)', mt: 1 }}
                        >
                          {error}
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AutoAwesomeRoundedIcon />}
                        onClick={handleGenerate}
                        disabled={!jobDescription?.trim()}
                        sx={{
                          mt: 2,
                          py: 1.5,
                          bgcolor: 'var(--primary)',
                          color: 'white',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 600,
                          borderRadius: 2,
                          '&:hover': { bgcolor: 'var(--primary-dark)' },
                          '&:disabled': {
                            bgcolor: 'rgba(0,0,0,0.12)',
                            color: 'rgba(0,0,0,0.26)',
                          },
                        }}
                      >
                        Generate My Resume
                        <Chip
                          label={`${creditsLeft} left`}
                          size="small"
                          sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white', height: 22 }}
                        />
                      </Button>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          mt: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="var(--text-muted)"
                          sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}
                        >
                          800+ resumes generated today
                        </Typography>
                        <Typography
                          variant="caption"
                          color="var(--text-muted)"
                          sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}
                        >
                          •
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BoltRoundedIcon sx={{ fontSize: 14, color: 'var(--warning)' }} />
                          <Typography
                            variant="caption"
                            color="var(--text-muted)"
                            sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}
                          >
                            ~30 sec average
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Right – Recent Resumes card */}
            <Box
              sx={{
                flex: '0 0 calc((100% - 24px) * 0.27)',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    '&:last-child': { pb: 2.5 },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionOutlinedIcon sx={{ color: 'var(--text-secondary)' }} />
                      <Typography
                        sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }}
                        color="var(--text-primary)"
                      >
                        Recent Resumes
                      </Typography>
                    </Box>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <Tooltip title="Upload resume (PDF, DOC, DOCX)">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={uploading ? null : <AddRoundedIcon sx={{ fontSize: 18 }} />}
                        onClick={handleManualUpload}
                        disabled={uploading}
                        sx={{
                          fontFamily: 'var(--font-family)',
                          textTransform: 'none',
                          fontWeight: 600,
                          minWidth: 0,
                        }}
                      >
                        {uploading ? 'Uploading…' : 'Upload'}
                      </Button>
                    </Tooltip>
                  </Box>

                  {resumes.length === 0 ? (
                    <Box
                      sx={{
                        py: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'var(--bg-light)',
                        borderRadius: 1,
                        minHeight: 120,
                        flex: 1,
                      }}
                    >
                      <DescriptionOutlinedIcon sx={{ fontSize: 48, color: 'var(--icon)', mb: 0.5 }} />
                      <Typography
                        variant="body2"
                        color="var(--text-muted)"
                        sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}
                        textAlign="center"
                      >
                        No resumes yet. Generate your first resume!
                      </Typography>
                    </Box>
                  ) : (
                    <List dense sx={{ width: '100%', overflow: 'auto', flex: 1 }}>
                      {resumes.map((r) => {
                        const isSelected = r.id === selectedResumeId;
                        return (
                          <ListItem
                            key={r.id}
                            onClick={() => setSelectedResumeId(r.id)}
                            selected={isSelected}
                            sx={{
                              py: 0.75,
                              borderRadius: 1,
                              cursor: 'pointer',
                              bgcolor: isSelected ? 'var(--light-blue-bg)' : 'transparent',
                            }}
                            secondaryAction={
                              <Box
                                sx={{ display: 'flex', gap: 0.25 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Tooltip title="Preview in new tab">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenInNewTab(r)}
                                    aria-label="Preview in new tab"
                                  >
                                    <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => openEdit(r)}
                                    aria-label="Edit"
                                  >
                                    <EditRoundedIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => confirmDelete(r)}
                                    aria-label="Delete"
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            }
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    fontFamily: 'var(--font-family)',
                                    fontSize: 'var(--font-size-helper)',
                                    fontWeight: isSelected ? 600 : 500,
                                  }}
                                >
                                  {r.resume_name}
                                </Typography>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={closeEdit}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
      >
        <DialogTitle
          sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-primary)' }}
        >
          Review & Edit Your Resume
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: 'var(--font-family)', mb: 2 }}
          >
            Your resume has been tailored to the job description. Edit any content below and save
            to update your PDF.
          </Typography>
          <TextField
            fullWidth
            label="Resume Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            size="small"
            sx={{ mb: 2, '& .MuiInputBase-root': { fontFamily: 'var(--font-family)' } }}
          />
          {editResume?.resume_url && (
            <Box sx={{ mb: 2 }}>
              <Button
                size="small"
                startIcon={<OpenInNewRoundedIcon />}
                component="a"
                href={getResumeFullUrl(editResume.resume_url)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}
              >
                Preview PDF in new tab
              </Button>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            minRows={12}
            maxRows={20}
            label="Resume Content"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Edit resume content. Changes will update the stored text and regenerate the PDF."
            helperText="Your edits will be saved and the PDF will be regenerated automatically."
            sx={{ '& .MuiInputBase-root': { fontFamily: 'var(--font-family)', fontSize: '0.9rem' } }}
            InputProps={{ sx: { bgcolor: 'var(--bg-light)', borderRadius: 1 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={closeEdit} sx={{ fontFamily: 'var(--font-family)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveEdit}
            disabled={saving || !(editName || '').trim() || !editResume}
            sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : 'Save & Update PDF'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId != null} onClose={cancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: 'var(--font-family)' }}>Delete Resume</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'var(--font-family)' }}>
            Are you sure you want to delete this resume? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelDelete} sx={{ fontFamily: 'var(--font-family)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={doDelete}
            sx={{ fontFamily: 'var(--font-family)' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
