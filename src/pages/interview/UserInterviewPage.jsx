import { useEffect, useCallback, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import PageShell from './components/PageShell';
import InterviewIntro from './components/InterviewIntro';
import DeviceCheckPanel from './components/DeviceCheckPanel';
import InterviewSession from './components/InterviewSession';
import InterviewReport, { InterviewSubmitting } from './components/InterviewReport';
import {
  getLaunchedInterviewAPI,
  getUserInterviewQuestionsAPI,
  submitUserInterviewAPI,
  getInterviewPerformanceAPI,
  retestInterviewAPI,
} from '../../services/interviewService';
import { interviewSessionAPI } from '../../services/authService';
import { setAuthSession } from '../../store/auth/authSlice';
import { parseApiError } from '../../utilities/apiErrorUtils';
import {
  normalizeQuestions,
  useInterviewSessionStore,
} from '../../store/interview/useInterviewSessionStore';
import {
  getInterviewVoiceConfigAPI,
  getInterviewSessionProgressAPI,
} from '../../services/interviewVoiceService';

export default function UserInterviewPage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const interviewId = searchParams.get('interview_id');
  const linkToken = searchParams.get('token');

  const authUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loggedInUserId = authUser?.id != null ? Number(authUser.id) : null;
  const pathUserId = userId && !Number.isNaN(Number(userId)) ? Number(userId) : null;
  const apiUserId = pathUserId ?? loggedInUserId;

  const [sessionReady, setSessionReady] = useState(false);
  const [retesting, setRetesting] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState(null);
  const [showDeviceCheck, setShowDeviceCheck] = useState(false);

  const {
    phase,
    interviewMeta,
    report,
    error,
    starting,
    setInterviewMeta,
    setError,
    setStarting,
    setSubmitting,
    startSession,
    setReport,
    setPhase,
    resetSession,
    setVoiceConfig: setStoreVoiceConfig,
    restoreProgress,
  } = useInterviewSessionStore();

  const apiParams = interviewId ? { interview_id: interviewId } : {};
  const interview = interviewMeta?.interview || interviewMeta || {};

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      if (!pathUserId || !interviewId) {
        setError('Invalid interview link.');
        setPhase('error');
        setSessionReady(true);
        return;
      }

      if (linkToken) {
        if (!loggedInUserId || loggedInUserId !== pathUserId) {
          try {
            const res = await interviewSessionAPI({
              user_id: pathUserId,
              interview_id: Number(interviewId),
              token: linkToken,
            });
            dispatch(setAuthSession({
              token: res.data.access_token,
              user: res.data.user,
            }));
          } catch (err) {
            if (!cancelled) {
              setError(parseApiError(err, 'This interview link is invalid or has expired.'));
              setPhase('error');
              setSessionReady(true);
            }
            return;
          }
        }
      } else if (!isAuthenticated) {
        navigate('/login', {
          state: { from: `${location.pathname}${location.search}` },
          replace: true,
        });
        return;
      } else if (loggedInUserId && loggedInUserId !== pathUserId && !authUser?.is_admin) {
        setError('This interview was assigned to another account. Sign in with the invited email or use the link from your invitation.');
        setPhase('error');
        setSessionReady(true);
        return;
      }

      if (!cancelled) setSessionReady(true);
    }

    setSessionReady(false);
    bootstrapSession();
    return () => { cancelled = true; };
  }, [pathUserId, interviewId, linkToken, loggedInUserId, isAuthenticated, authUser?.is_admin, dispatch, navigate, location.pathname, location.search, setError, setPhase]);

  const loadMetadata = useCallback(async () => {
    if (!apiUserId) {
      setError('Invalid interview link.');
      setPhase('error');
      return;
    }

    setPhase('loading');
    setError(null);

    try {
      const res = await getLaunchedInterviewAPI(apiUserId, apiParams);
      setInterviewMeta(res?.data);

      if (res?.data?.status === 'completed') {
        try {
          const perf = await getInterviewPerformanceAPI(apiUserId, apiParams);
          setReport(perf?.data || res?.data?.report || res?.data);
        } catch {
          if (res?.data?.report) {
            setReport(res.data.report);
          } else {
            setReport(res?.data || {});
          }
        }
        return;
      }

      setPhase('intro');
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 403) {
        setError(
          typeof detail === 'string'
            ? detail
            : 'This interview was assigned to another account. Sign out and sign in with the invited email.',
        );
        setPhase('error');
        return;
      }
      if (status === 404) {
        setError(
          typeof detail === 'string'
            ? detail
            : 'No interview assignment found. Check the link or contact your recruiter.',
        );
        setPhase('error');
        return;
      }
      setInterviewMeta({
        interview: { title: 'Interview Session', description: '' },
        user_id: apiUserId,
        interview_id: interviewId,
      });
      setPhase('intro');
      console.warn('[Interview] Metadata load failed, continuing with intro:', err);
    }
  }, [apiUserId, interviewId, apiParams, setInterviewMeta, setError, setPhase, setReport]);

  useEffect(() => {
    if (!sessionReady) return;
    resetSession();
    loadMetadata();
    return () => {
      resetSession();
    };
  }, [sessionReady, pathUserId, interviewId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVoiceConfig = useCallback(async () => {
    if (!apiUserId || !interviewId) return null;
    try {
      const res = await getInterviewVoiceConfigAPI(apiUserId, apiParams);
      const config = res?.data || null;
      setVoiceConfig(config);
      setStoreVoiceConfig(config);
      return config;
    } catch (err) {
      console.warn('[Interview] Voice config load failed:', err);
      return null;
    }
  }, [apiUserId, interviewId, apiParams, setStoreVoiceConfig]);

  const handleStartInterview = async () => {
    setStarting(true);
    setError(null);

    try {
      await loadVoiceConfig();
      setShowDeviceCheck(true);
      setPhase('device_check');
    } catch (err) {
      const message = parseApiError(err, 'Failed to prepare interview.');
      setError(message);
      toast.error(message);
    } finally {
      setStarting(false);
    }
  };

  const handleDeviceCheckReady = async () => {
    setStarting(true);
    setError(null);

    try {
      const [questionsRes, progressRes] = await Promise.all([
        getUserInterviewQuestionsAPI(apiUserId, apiParams),
        getInterviewSessionProgressAPI(apiUserId, apiParams).catch(() => null),
      ]);

      const questions = normalizeQuestions(questionsRes?.data);
      if (!questions.length) {
        toast.error('No questions available for this interview.');
        setStarting(false);
        return;
      }

      const progress = progressRes?.data;
      const voice = {
        voice_provider: questionsRes?.data?.voice_provider || voiceConfig?.voice_provider,
        voice_id: questionsRes?.data?.voice_id || voiceConfig?.voice_id,
        voice_label: questionsRes?.data?.voice_label || voiceConfig?.voice_label,
        tts_speaker: questionsRes?.data?.tts_speaker || voiceConfig?.tts_speaker,
        tts_language_code: questionsRes?.data?.tts_language_code || voiceConfig?.tts_language_code,
        question_count: questionsRes?.data?.question_count || voiceConfig?.question_count,
      };

      if (progress?.checkpoints?.length) {
        restoreProgress({
          checkpoints: progress.checkpoints,
          currentQuestionIndex: progress.current_question_index || 0,
        });
      }

      startSession(questions, {
        voiceConfig: voice,
        currentQuestionIndex: progress?.current_question_index || 0,
        answers: progress?.answers || [],
      });
      setShowDeviceCheck(false);
    } catch (err) {
      const message = parseApiError(err, 'Failed to load interview questions.');
      setError(message);
      toast.error(message);
    } finally {
      setStarting(false);
    }
  };

  const handleBackFromDeviceCheck = () => {
    setShowDeviceCheck(false);
    setPhase('intro');
  };

  const handleSubmitInterview = async () => {
    const state = useInterviewSessionStore.getState();
    const allAnswers = state.answers;

    if (!allAnswers.length) {
      toast.error('Please answer at least one question.');
      return;
    }

    setSubmitting(true);

    try {
      const jd =
        interview.description ||
        interviewMeta?.interview?.description ||
        interviewMeta?.description ||
        '';

      const payload = {
        user_id: apiUserId,
        interview_id: interviewId ? Number(interviewId) : undefined,
        jd,
        answers: allAnswers.map(({ question, answer, audio_key, audio_url }) => ({
          question,
          answer,
          audio_key,
          audio_url,
        })),
      };

      const res = await submitUserInterviewAPI(payload);
      setReport(res?.data || { summary: 'Interview submitted successfully.' });
      toast.success('Interview submitted!');
    } catch (err) {
      const message = parseApiError(err, 'Failed to submit interview.');
      setError(message);
      toast.error(message);
      setSubmitting(false);
      setPhase('session');
    }
  };

  const handleRetest = async () => {
    if (!apiUserId || !interviewId) return;
    setRetesting(true);
    setError(null);
    try {
      await retestInterviewAPI({
        user_id: apiUserId,
        interview_id: Number(interviewId),
      });
      resetSession();
      toast.success('Interview reset — you can take it again.');
      await loadMetadata();
    } catch (err) {
      const message = parseApiError(err, 'Failed to reset interview.');
      setError(message);
      toast.error(message);
    } finally {
      setRetesting(false);
    }
  };

  if (!sessionReady || phase === 'loading') {
    return (
      <PageShell>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 2 }}>
          <CircularProgress size={40} sx={{ color: 'var(--primary)' }} />
          <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {linkToken && !isAuthenticated ? 'Signing you in…' : 'Loading interview…'}
          </Typography>
        </Box>
      </PageShell>
    );
  }

  if (phase === 'error' && !interviewMeta) {
    return (
      <PageShell>
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
          {error || 'This interview link is invalid or has expired.'}
        </Alert>
        {loggedInUserId && pathUserId && loggedInUserId !== pathUserId && !authUser?.is_admin && (
          <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 2 }}>
            You are signed in as {authUser?.email}. This link is for a different candidate account.
          </Typography>
        )}
        <Button variant="outlined" href="/login" sx={{ textTransform: 'none', fontWeight: 700 }}>
          Sign in with another account
        </Button>
      </PageShell>
    );
  }

  if (phase === 'submitting') {
    return (
      <PageShell>
        <InterviewSubmitting />
      </PageShell>
    );
  }

  if (phase === 'report') {
    return (
      <PageShell>
        {error && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <InterviewReport
          report={report}
          interviewTitle={interview.title}
          userId={apiUserId}
          interviewId={interviewId ? Number(interviewId) : report?.interview_id}
          onRetest={handleRetest}
          retesting={retesting}
        />
      </PageShell>
    );
  }

  if (phase === 'session') {
    return (
      <PageShell fullBleed>
        {error && (
          <Box sx={{ px: 2, pt: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}
        <InterviewSession
          userId={apiUserId}
          interviewId={interviewId ? Number(interviewId) : undefined}
          onSubmit={handleSubmitInterview}
        />
      </PageShell>
    );
  }

  if (phase === 'device_check' || showDeviceCheck) {
    return (
      <PageShell>
        {error && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <DeviceCheckPanel
          userId={apiUserId}
          interviewId={interviewId ? Number(interviewId) : undefined}
          voiceConfig={voiceConfig}
          onReady={handleDeviceCheckReady}
          onBack={handleBackFromDeviceCheck}
        />
        {starting && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </PageShell>
    );
  }

  return (
    <PageShell>
      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <InterviewIntro meta={interviewMeta} starting={starting} onStart={handleStartInterview} />
    </PageShell>
  );
}
