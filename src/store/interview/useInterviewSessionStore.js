import { create } from 'zustand';

const initialState = {
  phase: 'intro',
  interviewMeta: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  currentTranscript: '',
  isSpeaking: false,
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

  startSession: (questions) =>
    set({
      questions,
      currentQuestionIndex: 0,
      answers: [],
      currentTranscript: '',
      phase: 'session',
      error: null,
      starting: false,
    }),

  setSpeaking: (isSpeaking) => set({ isSpeaking }),

  setCurrentTranscript: (currentTranscript) => set({ currentTranscript }),

  saveAnswer: (answer) => {
    const { questions, currentQuestionIndex, answers } = get();
    const q = questions[currentQuestionIndex];
    if (!q) return;

    const questionText = q.question_text || q.question || '';
    const entry = {
      question: questionText,
      answer: String(answer || '').trim(),
      question_id: q.id,
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
      set({ currentQuestionIndex: currentQuestionIndex + 1, currentTranscript: '' });
      return true;
    }
    return false;
  },

  setReport: (report) => set({ report, phase: 'report', submitting: false }),
}));

export function normalizeQuestions(data) {
  const list = Array.isArray(data) ? data : data?.questions || [];
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
