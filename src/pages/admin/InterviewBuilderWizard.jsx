import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InterviewFlowStepper from '../../components/admin/interview/InterviewFlowStepper';
import InterviewQuestionCard from '../../components/admin/interview/InterviewQuestionCard';
import DifficultyChip from '../../components/admin/interview/DifficultyChip';
import {
  CREATION_STEPS,
  DIFFICULTY_CONFIG,
  DIFFICULTY_OPTIONS,
  DESCRIPTION_PLACEHOLDER,
  GENERATION_MESSAGES,
  TITLE_MAX_LENGTH,
  QUESTION_COUNT_OPTIONS,
} from '../../components/admin/interview/constants';
import {
  createAdminInterviewAPI,
  updateAdminInterviewAPI,
  updateAdminInterviewQuestionsAPI,
  regenerateAdminInterviewQuestionsAPI,
  deleteAdminInterviewAPI,
  getAdminInterviewAPI,
} from '../../services';
import { parseApiError, parseApiFieldErrors } from '../../utilities/apiErrorUtils';
import toast from 'react-hot-toast';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: 14,
    bgcolor: 'var(--bg-paper)',
    '& fieldset': { borderColor: 'var(--border-color)' },
    '&:hover fieldset': { borderColor: 'var(--border-hover)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
  },
};

const labelSx = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-label)',
  mb: 1,
  display: 'block',
};

function GeneratingStep({ messageIndex }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          boxShadow: '0 12px 32px rgba(37, 99, 235, 0.3)',
        }}
      >
        <AutoAwesomeRoundedIcon sx={{ fontSize: 36, color: '#fff' }} />
      </Box>
      <CircularProgress size={32} sx={{ mb: 2.5, color: 'var(--primary)' }} />
      <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', mb: 1 }}>
        Building your interview
      </Typography>
      <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.6 }}>
        {GENERATION_MESSAGES[messageIndex % GENERATION_MESSAGES.length]}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 2 }}>
        AI is drafting conversational questions tailored to this role…
      </Typography>
    </Box>
  );
}

export default function InterviewBuilderWizard({ mode = 'create', initialInterview = null, onClose, onSaved, onDeleted }) {
  const navigate = useNavigate();
  const isEdit = mode === 'edit' && initialInterview?.id;
  const isReviewOnly = mode === 'review' && initialInterview?.id;

  const [step, setStep] = useState(isReviewOnly ? 2 : 0);
  const [title, setTitle] = useState(initialInterview?.title || '');
  const [difficulty, setDifficulty] = useState(String(initialInterview?.difficulty || 'medium').toLowerCase());
  const [description, setDescription] = useState(initialInterview?.description || '');
  const [interview, setInterview] = useState(initialInterview);
  const [questions, setQuestions] = useState(initialInterview?.questions || []);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [dirtyQuestions, setDirtyQuestions] = useState(false);
  const [questionCount, setQuestionCount] = useState(initialInterview?.question_count || 15);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isReviewOnly || !initialInterview?.id) return;
    if (initialInterview.questions?.length) return;

    getAdminInterviewAPI(initialInterview.id)
      .then((res) => {
        const detail = res?.data;
        if (detail) {
          setInterview(detail);
          setQuestions(detail.questions || []);
        }
      })
      .catch((err) => setError(parseApiError(err, 'Failed to load questions')));
  }, [isReviewOnly, initialInterview?.id, initialInterview?.questions?.length]);

  useEffect(() => {
    if (step !== 1) return undefined;
    const timer = setInterval(() => setMessageIndex((i) => i + 1), 2200);
    return () => clearInterval(timer);
  }, [step]);

  const validateDefine = () => {
    const errs = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) errs.title = 'Interview title is required';
    else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      errs.title = `Title must be at most ${TITLE_MAX_LENGTH} characters`;
    }
    if (!description.trim()) errs.description = 'Job description / context is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateDefine()) return;

    setError(null);
    setStep(1);
    setGenerating(true);

    const payload = {
      title: title.trim(),
      difficulty,
      description: description.trim(),
      question_count: questionCount,
    };

    try {
      let detail;
      if (isEdit) {
        const updateRes = await updateAdminInterviewAPI(initialInterview.id, payload);
        setStep(1);
        const regenRes = await regenerateAdminInterviewQuestionsAPI(initialInterview.id, payload);
        detail = regenRes?.data || updateRes?.data;
      } else {
        const res = await createAdminInterviewAPI(payload);
        detail = res?.data;
      }

      if (!detail?.questions?.length && detail?.id) {
        const full = await getAdminInterviewAPI(detail.id);
        detail = full?.data || detail;
      }

      setInterview(detail);
      setQuestions(detail?.questions || []);
      setStep(2);
      toast.success(isEdit ? 'Interview updated' : `Interview created with ${questionCount} tailored questions`);
      onSaved?.(detail);
    } catch (err) {
      const fieldErrors = parseApiFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
        setStep(0);
      } else {
        setError(parseApiError(err, 'Failed to generate interview questions'));
        setStep(0);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleQuestionChange = useCallback((questionId, newText) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, question_text: newText } : q)),
    );
    setDirtyQuestions(true);
  }, []);

  const saveQuestionEdits = async () => {
    if (!interview?.id || !dirtyQuestions) return true;

    setSaving(true);
    setError(null);
    try {
      await updateAdminInterviewQuestionsAPI(
        interview.id,
        questions.map((q) => ({ id: q.id, question_text: q.question_text })),
      );
      setDirtyQuestions(false);
      toast.success('Questions saved');
      return true;
    } catch (err) {
      setError(parseApiError(err, 'Failed to save question edits'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleLaunch = async () => {
    const ok = await saveQuestionEdits();
    if (!ok || !interview) return;
    navigate('/admin/launch-interviews');
  };

  const handleDelete = () => {
    if (!interview?.id) return;
    setDeleting(true);
    deleteAdminInterviewAPI(interview.id)
      .then(() => {
        toast.success('Interview deleted');
        setDeleteOpen(false);
        onDeleted?.(interview);
        onClose?.();
      })
      .catch((err) => setError(parseApiError(err, 'Failed to delete interview')))
      .finally(() => setDeleting(false));
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        bgcolor: 'var(--bg-paper)',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flexShrink: 0, px: 3, pt: 2.5, pb: 0, borderBottom: '1px solid var(--divider)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={onClose}
            disabled={generating || saving}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'var(--text-secondary)' }}
          >
            Back to templates
          </Button>
          {step === 2 && interview && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DifficultyChip difficulty={interview.difficulty} />
              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                {questions.length} questions
              </Typography>
              {interview.id && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => setDeleteOpen(true)}
                  disabled={saving || deleting}
                  sx={{ textTransform: 'none', fontWeight: 600, ml: 1 }}
                >
                  Delete
                </Button>
              )}
            </Box>
          )}
        </Box>
        <InterviewFlowStepper steps={CREATION_STEPS} activeIndex={step} />
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mx: 3, mt: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 3, py: 3 }}>
        {step === 0 && (
          <Box sx={{ maxWidth: 720, mx: 'auto' }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', mb: 0.5 }}>
              Define the interview
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', mb: 3, lineHeight: 1.6 }}>
              Give the AI enough context to write questions the way a real hiring manager would ask them — role-specific, conversational, and progressively challenging.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography component="label" sx={labelSx}>
                Interview title <Typography component="span" sx={{ color: 'var(--error)' }}>*</Typography>
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. Senior Frontend Engineer — Product Team"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH));
                  if (formErrors.title) setFormErrors((p) => ({ ...p, title: '' }));
                }}
                error={Boolean(formErrors.title)}
                helperText={formErrors.title || `${title.length}/${TITLE_MAX_LENGTH}`}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography component="label" sx={labelSx}>Overall difficulty</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                {DIFFICULTY_OPTIONS.map((level) => {
                  const config = DIFFICULTY_CONFIG[level];
                  const selected = difficulty === level;
                  return (
                    <Box
                      key={level}
                      onClick={() => setDifficulty(level)}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
                        bgcolor: selected ? 'var(--light-blue-bg-04)' : 'var(--bg-paper)',
                        transition: 'all 0.15s ease',
                        '&:hover': { borderColor: selected ? 'var(--primary)' : 'var(--border-hover)' },
                      }}
                    >
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {config.label}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', mt: 0.25 }}>
                        {config.subtitle}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography component="label" sx={labelSx}>
                Role & job context <Typography component="span" sx={{ color: 'var(--error)' }}>*</Typography>
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={10}
                placeholder={DESCRIPTION_PLACEHOLDER}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (formErrors.description) setFormErrors((p) => ({ ...p, description: '' }));
                }}
                error={Boolean(formErrors.description)}
                helperText={formErrors.description || 'Include role, stack, seniority, and what you want to assess'}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography component="label" sx={labelSx}>Number of questions</Typography>
              <FormControl fullWidth sx={inputSx}>
                <InputLabel id="question-count-label">Questions to ask</InputLabel>
                <Select
                  labelId="question-count-label"
                  label="Questions to ask"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  {QUESTION_COUNT_OPTIONS.map((count) => (
                    <MenuItem key={count} value={count}>
                      {count} questions
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 1 }}>
                Voice selection happens when you launch the interview to candidates.
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={handleGenerate}
              disabled={generating}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '12px',
                px: 3,
                py: 1.25,
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
              }}
            >
              {isEdit ? 'Update & regenerate questions' : 'Generate interview questions'}
            </Button>
          </Box>
        )}

        {step === 1 && <GeneratingStep messageIndex={messageIndex} />}

        {step === 2 && (
          <Box sx={{ maxWidth: 860, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleRoundedIcon sx={{ color: 'var(--success-dark)', fontSize: 22 }} />
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Review your questions
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong>{interview?.title}</strong> — {questions.length} questions ordered like a real interview: warm-up → core skills → deep dive. Edit any wording before launching.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              {[...questions]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((q, index) => (
                  <InterviewQuestionCard
                    key={q.id ?? index}
                    question={q}
                    index={index}
                    editable
                    onQuestionChange={handleQuestionChange}
                  />
                ))}
            </Box>
          </Box>
        )}
      </Box>

      {step === 2 && (
        <Box
          sx={{
            flexShrink: 0,
            px: 3,
            py: 2,
            borderTop: '1px solid var(--divider)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            bgcolor: 'rgba(248, 250, 252, 0.8)',
          }}
        >
          <Typography sx={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {dirtyQuestions ? 'Unsaved question edits' : 'Ready to assign candidates'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {!isReviewOnly && (
              <Button
                variant="outlined"
                onClick={() => setStep(0)}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
              >
                Edit details
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={saveQuestionEdits}
              disabled={!dirtyQuestions || saving}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
            >
              {saving ? 'Saving…' : 'Save questions'}
            </Button>
            <Button
              variant="contained"
              startIcon={<RocketLaunchRoundedIcon />}
              onClick={handleLaunch}
              disabled={saving}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
              }}
            >
              Continue to launch
            </Button>
          </Box>
        </Box>
      )}
      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete interview?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Delete <strong>{interview?.title}</strong>? This removes all generated questions and any linked launch history. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
