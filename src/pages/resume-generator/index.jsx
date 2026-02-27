import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PageContainer from '../../components/common/PageContainer';
import PdfViewer from '../../components/PdfViewer';
import JobDescriptionInput from './JobDescriptionInput';
import { getResumeWorkspaceAPI, generateResumeAPI, updateResumeAPI, deleteResumeAPI, uploadResumeAPI } from '../../services';
import { BASE_URL } from '../../utilities/const';

const BACKEND_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');
const getResumeFullUrl = (url) =>
  url && (url.startsWith('http://') || url.startsWith('https://')) ? url : `${BACKEND_ORIGIN}${url || ''}`;

const HERO_GRADIENT =
  'linear-gradient(90deg, rgba(51, 94, 222, 1) 0%, rgba(39, 39, 125, 1) 35%, rgba(54, 94, 214, 1) 100%)';

const RESUME_GEN_STORAGE_KEY = 'resumeGeneratorView';
const RESUME_GEN_SELECTED_KEY = 'resumeGeneratorSelectedId';

const getStoredView = () => {
  if (typeof window === 'undefined') return 'inputs';
  try {
    return localStorage.getItem(RESUME_GEN_STORAGE_KEY) || 'inputs';
  } catch {
    return 'inputs';
  }
};

const setStoredView = (showInputs) => {
  try {
    localStorage.setItem(RESUME_GEN_STORAGE_KEY, showInputs ? 'inputs' : 'preview');
  } catch (e) {
    void e;
  }
};

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
  getResumeWorkspaceAPI()
    .then(({ data }) => setResumes(Array.isArray(data?.resumes) ? data.resumes : []))
    .catch(() => setResumes([]));
};

export default function ResumeGenerator() {
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resumes, setResumes] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editResume, setEditResume] = useState(null);
  const [editName, setEditName] = useState('');
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [generateError, setGenerateError] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(getStoredSelectedId);
  const [showInputForm, setShowInputForm] = useState(() => getStoredView() === 'inputs');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const creditsLeft = 4;

  const handleManualUpload = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name || '').toLowerCase().slice(-4);
    if (!['.pdf', '.doc', '.docx'].some((x) => ext.endsWith(x))) {
      return;
    }
    setUploading(true);
    uploadResumeAPI(file)
      .then(() => {
        getResumeWorkspaceAPI().then(({ data }) => {
          const list = Array.isArray(data?.resumes) ? data.resumes : [];
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

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const previewPdfUrl = selectedResume
    ? `${BASE_URL}/resume/${selectedResume.id}/file`
    : null;
  const previewPdfFile = previewPdfUrl && token ? { url: previewPdfUrl, httpHeaders: { Authorization: `Bearer ${token}` } } : previewPdfUrl ? { url: previewPdfUrl } : null;
  const downloadUrl = previewPdfUrl;
  const hasResumeToPreview = selectedResume && previewPdfFile;

  useEffect(() => {
    getResumeWorkspaceAPI()
      .then(({ data }) => {
        const list = Array.isArray(data?.resumes) ? data.resumes : [];
        setResumes(list);
        const tc = data?.tailor_context;
        const params = new URLSearchParams(window.location.search);
        if (params.get('tailor') === '1' && tc) {
          if (tc.job_description) {
            setJobDescription(tc.job_description);
            if (tc.job_title) setJobRole(tc.job_title);
            setShowInputForm(true);
          }
        }
      })
      .catch(() => setResumes([]));
  }, []);

  useEffect(() => {
    if (resumes.length === 0) return;
    const storedId = getStoredSelectedId();
    const validId = storedId && resumes.some((r) => r.id === storedId) ? storedId : resumes[0].id;
    setSelectedResumeId(validId);
  }, [resumes]);

  useEffect(() => {
    if (selectedResumeId != null) setStoredSelectedId(selectedResumeId);
  }, [selectedResumeId]);

  useEffect(() => {
    if (resumes.length === 0) setShowInputForm(true);
  }, [resumes.length]);

  useEffect(() => {
    if (resumes.length > 0 && !generating) setStoredView(showInputForm);
  }, [showInputForm, resumes.length, generating]);

  const handleGenerate = async () => {
    if (!jobDescription?.trim()) return;
    setGenerateError('');
    setGenerating(true);
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.random() * 6 + 3));
    }, 400);
    try {
      const { data } = await generateResumeAPI({
        job_title: jobRole?.trim() || 'Resume',
        job_description: jobDescription?.trim(),
      });
      setProgress(100);
      fetchResumes(setResumes);
      setSelectedResumeId(data?.resume_id ?? null);
      setShowInputForm(false);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Resume generation failed. Please try again.';
      setGenerateError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      clearInterval(progressInterval);
      setGenerating(false);
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
          r.id === data.id ? { ...r, resume_name: data.resume_name, resume_text: (data.resume_text ?? r.resume_text) } : r
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
  const handleDownload = async () => {
    if (!selectedResume || !downloadUrl) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(downloadUrl, { headers });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (selectedResume.resume_name?.replace(/\s/g, '_') || 'resume') + '.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
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

  const showInputs = showInputForm || generating || !hasResumeToPreview;

  return (
    <Box sx={{ minHeight: '100%', background: 'var(--bg-app)', overflowX: 'hidden', fontFamily: 'var(--font-family)' }}>
      <Box sx={{ background: HERO_GRADIENT, color: 'white', py: 3.5, px: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Chip label="Welcome back, gurusai!" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'var(--label-font-weight)' }} />
          </Box>
          <Typography variant="h4" sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, textAlign: 'center', fontSize: { xs: 'var(--font-size-section-header)', sm: 'var(--font-size-page-title)' }, mb: 1 }}>
            Land Your Dream Job
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-family)', textAlign: 'center', fontSize: 'var(--font-size-page-subtitle)', opacity: 0.95, mb: 2 }}>
            with an AI-tailored resume
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-family)', textAlign: 'center', maxWidth: 560, mx: 'auto', fontSize: 'var(--font-size-helper)', opacity: 0.9, mb: 3 }}>
            Paste any job description and get a perfectly customized resume in seconds. ATS-optimized. Interview-ready.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
            <Chip icon={<BoltRoundedIcon sx={{ fontSize: 18 }} />} label="30 seconds" size="small" sx={{ fontFamily: 'var(--font-family)', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'var(--label-font-weight)', '& .MuiChip-icon': { color: 'aliceblue' } }} />
            <Chip icon={<TrackChangesRoundedIcon sx={{ fontSize: 18 }} />} label="ATS-optimized" size="small" sx={{ fontFamily: 'var(--font-family)', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'var(--label-font-weight)', '& .MuiChip-icon': { color: 'aliceblue' } }} />
            <Chip icon={<BusinessCenterRoundedIcon sx={{ fontSize: 18 }} />} label="Industry-proven" size="small" sx={{ fontFamily: 'var(--font-family)', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'var(--label-font-weight)', '& .MuiChip-icon': { color: 'aliceblue' } }} />
          </Box>
        </Box>
      </Box>

      <PageContainer sx={{ pt: 4, pb: 4, px: { xs: 2.5, sm: 4 }, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%', minHeight: { md: 520 }, alignItems: 'stretch' }}>
          <Box sx={{ flex: { xs: '0 0 auto', md: '0 0 calc((100% - 24px) * 0.55)' }, width: { xs: '100%', md: 'auto' }, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AutoAwesomeRoundedIcon sx={{ color: 'white', fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }} color="var(--text-primary)">
                        Resume Generator
                      </Typography>
                      <Typography variant="body2" color="var(--text-secondary)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}>
                        Paste a job description to get started
                      </Typography>
                    </Box>
                  </Box>
                  <Chip icon={<CardGiftcardRoundedIcon sx={{ fontSize: 16 }} />} label={creditsLeft} size="small" sx={{ fontFamily: 'var(--font-family)', bgcolor: 'var(--light-blue-bg)', color: 'var(--primary)', fontWeight: 600 }} />
                </Box>

                {generating ? (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                    <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <AutoAwesomeRoundedIcon sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>
                      Creating Your Perfect Resume
                    </Typography>
                    <Typography variant="body2" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', mb: 2 }}>
                      Processing your resume...
                    </Typography>
                    <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ width: '100%', maxWidth: 320, height: 8, borderRadius: 4, bgcolor: 'var(--bg-light)', '& .MuiLinearProgress-bar': { borderRadius: 4 } }} />
                    <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', mt: 1 }}>
                      {Math.round(Math.min(progress, 100))}% complete
                    </Typography>
                  </Box>
                ) : showInputs ? (
                  <>
                    <JobDescriptionInput
                      role={jobRole}
                      jobDescription={jobDescription}
                      onRoleChange={setJobRole}
                      onJobDescriptionChange={setJobDescription}
                      sx={{ mt: 1.5 }}
                    />
                    {generateError && (
                      <Typography variant="body2" color="error" sx={{ fontFamily: 'var(--font-family)', mb: 1 }}>
                        {generateError}
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<AutoAwesomeRoundedIcon />}
                      onClick={handleGenerate}
                      disabled={!jobDescription?.trim()}
                      sx={{
                        mt: 1.5,
                        py: 1.5,
                        bgcolor: 'var(--primary)',
                        color: 'white',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 600,
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'var(--primary-dark)' },
                        '&:disabled': { bgcolor: 'rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.26)' },
                      }}
                    >
                      Generate My Resume
                      <Chip label={`${creditsLeft} left`} size="small" sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white', height: 22 }} />
                    </Button>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}>
                        800+ resumes generated today
                      </Typography>
                      <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}>
                        •
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BoltRoundedIcon sx={{ fontSize: 14, color: 'var(--warning)' }} />
                        <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}>
                          ~30 sec average
                        </Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }} color="var(--text-primary)">
                        {selectedResume?.resume_name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditRoundedIcon sx={{ fontSize: 18 }} />}
                          onClick={() => openEdit(selectedResume)}
                          sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                          onClick={handleDownload}
                          sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}
                        >
                          Download
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />}
                          onClick={() => setShowInputForm(true)}
                          sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', color: 'var(--primary)' }}
                        >
                          Generate New
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ borderRadius: 1, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
                      <PdfViewer file={previewPdfFile} fillContainer sx={{ width: '100%', minHeight: 380 }} />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: '0 0 auto', md: '0 0 calc((100% - 24px) * 0.45)' }, width: { xs: '100%', md: 'auto' }, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ flex: '0 0 auto', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', bgcolor: 'var(--light-blue-bg)', border: '1px solid var(--light-blue-bg-15)' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ fontFamily: 'var(--font-family)', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>C</Typography>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }} color="var(--text-primary)">Chrome Extension</Typography>
                    <Typography variant="body2" color="var(--text-secondary)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}>One-click apply on LinkedIn</Typography>
                    <Typography variant="body2" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}>
                      Generate resumes directly from any LinkedIn job posting. No copy-paste needed.
                    </Typography>
                    <Button size="small" endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />} startIcon={<GetAppRoundedIcon sx={{ fontSize: 16 }} />} sx={{ fontFamily: 'var(--font-family)', color: 'var(--primary)', fontWeight: 600, textTransform: 'none', p: 0, mt: 0.5, minWidth: 0 }}>
                      Install Free Extension
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, minHeight: 0, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionOutlinedIcon sx={{ color: 'var(--text-secondary)' }} />
                    <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }} color="var(--text-primary)">Recent Resumes</Typography>
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
                      sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', fontWeight: 600, minWidth: 0 }}
                    >
                      {uploading ? 'Uploading…' : 'Upload'}
                    </Button>
                  </Tooltip>
                </Box>
                {resumes.length === 0 ? (
                  <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--bg-light)', borderRadius: 1, minHeight: 120 }}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 48, color: 'var(--icon)', mb: 0.5 }} />
                    <Typography variant="body2" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }} textAlign="center">
                      No resumes yet. Generate your first resume above!
                    </Typography>
                  </Box>
                ) : (
                  <List dense sx={{ width: '100%' }}>
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
                            <Box sx={{ display: 'flex', gap: 0.25 }} onClick={(e) => e.stopPropagation()}>
                              <Tooltip title="Preview in new tab">
                                <IconButton size="small" onClick={() => handleOpenInNewTab(r)} aria-label="Preview in new tab">
                                  <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => openEdit(r)} aria-label="Edit">
                                  <EditRoundedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => confirmDelete(r)} aria-label="Delete" sx={{ color: 'error.main' }}>
                                  <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          }
                        >
                          <ListItemText
                            primary={
                              <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)', fontWeight: isSelected ? 600 : 500 }}>
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

        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <TrackChangesRoundedIcon sx={{ color: 'var(--primary)', fontSize: 28, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }} color="var(--text-primary)">ATS-Optimized</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }} color="var(--text-secondary)">Beats applicant tracking systems</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <BoltRoundedIcon sx={{ color: 'var(--warning)', fontSize: 28, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }} color="var(--text-primary)">30 Second Generation</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }} color="var(--text-secondary)">Instant professional results</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <TrendingUpRoundedIcon sx={{ color: 'var(--primary)', fontSize: 28, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }} color="var(--text-primary)">3.2x More Callbacks</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }} color="var(--text-secondary)">Proven to get interviews</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </PageContainer>

      <Dialog
        open={editOpen}
        onClose={closeEdit}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
          Review & Edit Your Resume
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'var(--font-family)', mb: 2 }}>
            Your resume has been tailored to the job description. Edit any content below and save to update your PDF.
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
            sx={{
              '& .MuiInputBase-root': { fontFamily: 'var(--font-family)', fontSize: '0.9rem' },
            }}
            InputProps={{
              sx: {
                bgcolor: 'var(--bg-light)',
                borderRadius: 1,
              },
            }}
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

      <Dialog open={deleteId != null} onClose={cancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: 'var(--font-family)' }}>Delete Resume</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'var(--font-family)' }}>Are you sure you want to delete this resume? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelDelete} sx={{ fontFamily: 'var(--font-family)' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={doDelete} sx={{ fontFamily: 'var(--font-family)' }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
