import { useCallback, useRef } from 'react';
import {
  playAudioBlob,
  stopActiveAudio,
} from './useInterviewMicrophone';
import {
  submitInterviewVoiceAnswerAPI,
  synthesizeInterviewQuestionAPI,
} from '../services/interviewVoiceService';

export function useInterviewVoiceSession({
  userId,
  interviewId,
  onTranscript,
  onProcessingChange,
  onError,
}) {
  const processingRef = useRef(false);

  const speakQuestion = useCallback(async (text) => {
    stopActiveAudio();
    const response = await synthesizeInterviewQuestionAPI({
      user_id: userId,
      interview_id: Number(interviewId),
      question_order: 1,
      text,
    });
    await playAudioBlob(response.data);
  }, [userId, interviewId]);

  const submitVoiceAnswer = useCallback(async (payload) => {
    if (processingRef.current) return null;
    processingRef.current = true;
    onProcessingChange?.(true);

    const buildFormData = () => {
      const formData = new FormData();
      formData.append('user_id', String(userId));
      formData.append('interview_id', String(interviewId));
      if (payload.questionId != null) formData.append('question_id', String(payload.questionId));
      formData.append('question_order', String(payload.questionOrder));
      formData.append('question_text', payload.questionText);
      formData.append('duration_ms', String(payload.durationMs || 0));
      if (payload.currentQuestionIndex != null) {
        formData.append('current_question_index', String(payload.currentQuestionIndex));
      }
      if (payload.clientTranscript?.trim()) {
        formData.append('client_transcript', payload.clientTranscript.trim());
      }
      formData.append('audio', payload.blob, `answer_q${payload.questionOrder}.webm`);
      return formData;
    };

    try {
      const response = await submitInterviewVoiceAnswerAPI(buildFormData());
      const transcript = response?.data?.transcript || response?.data?.answer || payload.clientTranscript || '';
      onTranscript?.(transcript, response?.data);
      return response?.data;
    } catch (err) {
      onError?.(err);
      throw err;
    } finally {
      processingRef.current = false;
      onProcessingChange?.(false);
    }
  }, [userId, interviewId, onTranscript, onProcessingChange, onError]);

  return {
    speakQuestion,
    submitVoiceAnswer,
  };
}
