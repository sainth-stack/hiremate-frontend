import Cartesia from '@cartesia/cartesia-js';

let currentAudio = null;
let browserUtterance = null;

/** Voice ID from .env `LANDING_CHAT_VOICE=cartesia:VOICE_ID:lang` */
function getCartesiaVoiceId() {
  const voiceConfig = import.meta.env.LANDING_CHAT_VOICE || '';
  if (!voiceConfig) return null;

  const parts = String(voiceConfig).split(':');
  if (parts[0] === 'cartesia' && parts[1]) return parts[1];

  return voiceConfig;
}

function getCartesiaApiKey() {
  return import.meta.env.CARTESIA_API_KEY || '';
}

function getCartesiaModelId() {
  return import.meta.env.CARTESIA_MODEL_ID || '';
}

export function isCartesiaConfigured() {
  return Boolean(getCartesiaApiKey() && getCartesiaVoiceId() && getCartesiaModelId());
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  browserUtterance = null;
}

function speakBrowser(text, onStart, onEnd) {
  return new Promise((resolve) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
      onEnd?.();
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    browserUtterance = utterance;

    utterance.onstart = () => onStart?.();
    utterance.onend = () => {
      onEnd?.();
      resolve();
    };
    utterance.onerror = () => {
      onEnd?.();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

async function speakCartesia(text, onStart, onEnd) {
  const apiKey = getCartesiaApiKey();
  const voiceId = getCartesiaVoiceId();
  const modelId = getCartesiaModelId();

  if (!apiKey || !voiceId || !modelId) {
    return false;
  }

  try {
    const client = new Cartesia({ apiKey });
    const response = await client.tts.generate({
      model_id: modelId,
      transcript: text,
      voice: {
        mode: 'id',
        id: voiceId,
      },
      output_format: {
        container: 'mp3',
        encoding: 'mp3',
        sample_rate: 44100,
      },
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;

    onStart?.();

    await new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        resolve();
      };
      audio.onerror = reject;
      audio.play().catch(reject);
    });

    onEnd?.();
    return true;
  } catch (err) {
    console.warn('[TTS] Cartesia failed, using browser fallback:', err);
    return false;
  }
}

/** Speak question text — Cartesia when .env is configured, else browser speechSynthesis. */
export async function speakQuestion(text, { onStart, onEnd } = {}) {
  stopSpeaking();
  if (!text?.trim()) {
    onEnd?.();
    return;
  }

  const usedCartesia = await speakCartesia(text, onStart, onEnd);
  if (!usedCartesia) {
    await speakBrowser(text, onStart, onEnd);
  }
}
