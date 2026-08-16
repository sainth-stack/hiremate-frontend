// Browser live speech recognition for interview answer captions.
import { useCallback, useEffect, useRef, useState } from 'react';

function getSpeechRecognitionClass() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useLiveSpeechRecognition({ languageCode = 'en-IN', enabled = true }) {
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const finalPartsRef = useRef([]);

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionClass()));
  }, []);

  const resetTranscript = useCallback(() => {
    finalPartsRef.current = [];
    setLiveTranscript('');
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        // ignore stop errors
      }
    }
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!enabled) return false;

    const SpeechRecognition = getSpeechRecognitionClass();
    if (!SpeechRecognition) return false;

    stopListening();
    resetTranscript();

    const recognition = new SpeechRecognition();
    recognition.lang = languageCode || 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript?.trim();
        if (!text) continue;
        if (result.isFinal) {
          finalPartsRef.current.push(text);
        } else {
          interim = [interim, text].filter(Boolean).join(' ');
        }
      }
      const combined = [...finalPartsRef.current, interim].filter(Boolean).join(' ').trim();
      setLiveTranscript(combined);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      return true;
    } catch {
      setIsListening(false);
      return false;
    }
  }, [enabled, languageCode, resetTranscript, stopListening]);

  useEffect(() => () => stopListening(), [stopListening]);

  return {
    liveTranscript,
    isListening,
    supported,
    startListening,
    stopListening,
    resetTranscript,
    setLiveTranscript,
  };
}
