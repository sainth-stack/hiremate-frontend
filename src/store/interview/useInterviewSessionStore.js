import { create } from 'zustand';

const initialState = {
  phase: 'intro',
  interviewMeta: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  currentTranscript: '',
  isSpeaking: false,
  isProcessing: false,
  isRecording: false,
  voiceConfig: null,
  sessionPhase: 'idle',
  report: null,
  error: null,
  starting: false,
  submitting: false,
};

export const useInterviewSessionStore = create((set, get) => ({
  ...initialState,

  resetSession: () => set({ ...initialState }),

  setInterviewMeta: (interviewMeta) => set({ interviewMeta }),

  setPhase: (phase) => set({ phase }),

  setError: (error) => set({ error }),

  setStarting: (starting) => set({ starting }),

  setSubmitting: (submitting) =>
    set({ submitting, phase: submitting ? 'submitting' : get().phase }),

  setVoiceConfig: (voiceConfig) => set({ voiceConfig }),

  setSessionPhase: (sessionPhase) => set({ sessionPhase }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  setRecording: (isRecording) => set({ isRecording }),

  startSession: (questions, options = {}) =>
    set({
      questions,
      currentQuestionIndex: options.currentQuestionIndex ?? 0,
      answers: options.answers ?? [],
      currentTranscript: options.currentTranscript ?? '',
      voiceConfig: options.voiceConfig ?? get().voiceConfig,
      phase: 'session',
      sessionPhase: 'idle',
      error: null,
      starting: false,
    }),

  setSpeaking: (isSpeaking) =>
    set({ isSpeaking, sessionPhase: isSpeaking ? 'ai_speaking' : get().sessionPhase }),

  setCurrentTranscript: (currentTranscript) => set({ currentTranscript }),

  saveAnswer: (answer, extras = {}) => {
    const { questions, currentQuestionIndex, answers } = get();
    const q = questions[currentQuestionIndex];
    if (!q) return;

    const questionText = q.question_text || q.question || '';
    const existing = answers.find((a) => a.question_id === q.id) || {};
    const entry = {
      ...existing,
      question: questionText,
      answer: String(answer || '').trim(),
      question_id: q.id,
      order: q.order ?? currentQuestionIndex + 1,
      ...extras,
    };

    const idx = answers.findIndex((a) => a.question_id === q.id);
    const nextAnswers = [...answers];
    if (idx >= 0) nextAnswers[idx] = entry;
    else nextAnswers.push(entry);

    set({ answers: nextAnswers, currentTranscript: '' });
  },

  goToNextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        currentTranscript: '',
        sessionPhase: 'idle',
      });
      return true;
    }
    return false;
  },

  restoreProgress: ({ checkpoints = [], currentQuestionIndex = 0 }) => {
    const answers = checkpoints.map((item) => ({
      question_id: item.question_id,
      question: item.question,
      answer: item.transcript || item.answer,
      audio_key: item.audio_key,
      audio_url: item.audio_url,
      order: item.order,
    }));
    const currentCheckpoint = checkpoints.find(
      (item) => (item.order ?? 0) === currentQuestionIndex + 1
    ) || checkpoints.find((item) => item.order === currentQuestionIndex + 1);
    set({
      answers,
      currentQuestionIndex,
      currentTranscript: currentCheckpoint?.transcript || currentCheckpoint?.answer || '',
    });
  },

  setReport: (report) => set({ report, phase: 'report', submitting: false }),
}));

export function normalizeQuestions(data) {
  const list = data?.questions || data || [];
  return Array.isArray(list) ? list : [];
}
