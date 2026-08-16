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

  const submitVoiceAnswer = useCallback(async ({
    questionId,
    questionOrder,
    questionText,
    blob,
    durationMs,
    currentQuestionIndex,
    clientTranscript,
  }) => {
    if (processingRef.current) return null;
    processingRef.current = true;
    onProcessingChange?.(true);

    try {
      const formData = new FormData();
      formData.append('user_id', String(userId));
      formData.append('interview_id', String(interviewId));
      if (questionId != null) formData.append('question_id', String(questionId));
      formData.append('question_order', String(questionOrder));
      formData.append('question_text', questionText);
      formData.append('duration_ms', String(durationMs || 0));
      if (currentQuestionIndex != null) {
        formData.append('current_question_index', String(currentQuestionIndex));
      }
      if (clientTranscript?.trim()) {
        formData.append('client_transcript', clientTranscript.trim());
      }
      formData.append('audio', blob, `answer_q${questionOrder}.webm`);

      const response = await submitInterviewVoiceAnswerAPI(formData);
      const transcript = response?.data?.transcript || response?.data?.answer || '';
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
