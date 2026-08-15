import { useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import PageShell from './components/PageShell';
import InterviewIntro from './components/InterviewIntro';
import InterviewSession from './components/InterviewSession';
import InterviewReport, { InterviewSubmitting } from './components/InterviewReport';
import {
  getLaunchedInterviewAPI,
  getUserInterviewQuestionsAPI,
  submitUserInterviewAPI,
  getInterviewPerformanceAPI,
} from '../../services/interviewService';
import { parseApiError } from '../../utilities/apiErrorUtils';
import {
  normalizeQuestions,
  useInterviewSessionStore,
} from '../../store/interview/useInterviewSessionStore';
import { stopSpeaking } from '../../utilities/cartesiaTts';

export default function UserInterviewPage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interview_id');

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
  } = useInterviewSessionStore();

  const apiParams = interviewId ? { interview_id: interviewId } : {};
  const interview = interviewMeta?.interview || interviewMeta || {};

  const loadMetadata = useCallback(async () => {
    if (!userId || Number.isNaN(Number(userId))) {
      setError('Invalid interview link.');
      setPhase('error');
      return;
    }

    setPhase('loading');
    setError(null);

    try {
      const res = await getLaunchedInterviewAPI(userId, apiParams);
      setInterviewMeta(res?.data);

      if (res?.data?.status === 'completed') {
        try {
          const perf = await getInterviewPerformanceAPI(userId, apiParams);
          setReport(perf?.data || res?.data?.report || res?.data);
        } catch {
          if (res?.data?.report) {
            setReport(res.data.report);
          } else {
            setPhase('report');
          }
        }
      } else {
        setPhase('intro');
      }
    } catch (err) {
      setInterviewMeta({
        interview: { title: 'Interview Session', description: '' },
        user_id: userId,
        interview_id: interviewId,
      });
      setPhase('intro');
      console.warn('[Interview] Metadata load failed, continuing with intro:', err);
    }
  }, [userId, interviewId, setInterviewMeta, setError, setPhase, setReport]);

  useEffect(() => {
    resetSession();
    loadMetadata();
    return () => {
      stopSpeaking();
      resetSession();
    };
  }, [userId, interviewId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartInterview = async () => {
    setStarting(true);
    setError(null);

    try {
      const res = await getUserInterviewQuestionsAPI(userId, apiParams);
      const questions = normalizeQuestions(res?.data);

      if (!questions.length) {
        toast.error('No questions available for this interview.');
        setStarting(false);
        return;
      }

      startSession(questions);
    } catch (err) {
      const message = parseApiError(err, 'Failed to load interview questions.');
      setError(message);
      toast.error(message);
      setStarting(false);
    }
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
        user_id: Number(userId),
        interview_id: interviewId ? Number(interviewId) : undefined,
        jd,
        answers: allAnswers.map(({ question, answer }) => ({ question, answer })),
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

  if (phase === 'loading') {
    return (
      <PageShell>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 2 }}>
          <CircularProgress size={40} sx={{ color: 'var(--primary)' }} />
          <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            Loading interview…
          </Typography>
        </Box>
      </PageShell>
    );
  }

  if (phase === 'error' && !interviewMeta) {
    return (
      <PageShell>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'This interview link is invalid or has expired.'}
        </Alert>
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
          userId={Number(userId)}
          interviewId={interviewId ? Number(interviewId) : report?.interview_id}
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
        <InterviewSession onSubmit={handleSubmitInterview} />
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
