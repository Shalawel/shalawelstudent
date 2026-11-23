import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  MasterySignals,
  SignalConfidenceTier,
  VoiceTelemetryInput,
  WhiteboardTelemetryInput,
} from '../utils/tutorMasteryEngine';
import type { RuntimeSessionType } from '../utils/tutorPedagogyEngine';
import type {
  RuntimeCognitiveState,
  RuntimeDecisionOutput,
} from '../utils/tutorRuntimeOrchestrator';

export interface TutorChatContext {
  sessionId?: string;
  studentId?: string;
  sessionType?: RuntimeSessionType;
  grade: string;
  curriculum?: string;
  subject: string;
  topic: string;
  voiceMode?: boolean;
  whiteboardMode?: boolean;
  remainingTime?: number;
  currentState?: RuntimeCognitiveState;
  masterySignals?: MasterySignals;
  consecutiveConfusionTurns?: number;
  recoveryAttemptsCount?: number;
  inactivitySeconds?: number;
  isClosingPhase?: boolean;
  whiteboardTelemetry?: WhiteboardTelemetryInput | null;
  voiceTelemetry?: VoiceTelemetryInput | null;
  interruptedTutorText?: string | null;
  stageTitle?: string;
  studentAngle?: number;
  lastAttempt?: string;
  problemContext?: {
    problemText?: string;
    fileName?: string;
    fileMimeType?: string;
    fileBase64?: string;
    fileTextContent?: string;
  };
}

export interface TutorHistoryItem {
  sender: 'maya' | 'student';
  text: string;
}

export interface TranscribeResult {
  transcript: string;
  speechConfidence: SignalConfidenceTier;
  codeSwitchingDetected: boolean;
}

export function useTutorVoice(muted: boolean) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTts, setIsLoadingTts] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [pendingReplay, setPendingReplay] = useState<{ id: string; text: string } | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [interruptedTutorContext, setInterruptedTutorContext] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeSpokenTextRef = useRef<string | null>(null);
  const isSpeakingRef = useRef(false);
  const ttsCacheRef = useRef<Map<string, string>>(new Map());
  const requestCounterRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  isSpeakingRef.current = isSpeaking;

  const stopSpeaking = useCallback((captureInterruption = false): string | null => {
    const captured =
      captureInterruption && isSpeakingRef.current && activeSpokenTextRef.current
        ? activeSpokenTextRef.current
        : null;
    if (captured) {
      setInterruptedTutorContext(captured);
    }

    requestCounterRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore speech synthesis cancellation errors
      }
    }
    activeSpokenTextRef.current = null;
    setIsSpeaking(false);
    setIsLoadingTts(false);
    setSpeakingId(null);
    return captured;
  }, []);

  const clearInterruptedContext = useCallback(() => {
    setInterruptedTutorContext(null);
  }, []);

  useEffect(() => {
    if (muted) {
      stopSpeaking(false);
    }
  }, [muted, stopSpeaking]);

  useEffect(() => {
    return () => {
      stopSpeaking(false);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, [stopSpeaking]);

  const speakWithBrowserSpeech = useCallback(
    (
      text: string,
      id: string,
      spokenCognitiveLoad: 'low' | 'moderate' | 'high' = 'low'
    ): boolean => {
      if (
        mutedRef.current ||
        typeof window === 'undefined' ||
        !('speechSynthesis' in window) ||
        typeof SpeechSynthesisUtterance === 'undefined'
      ) {
        return false;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate =
          spokenCognitiveLoad === 'high' ? 0.88 : spokenCognitiveLoad === 'moderate' ? 0.94 : 0.98;
        utterance.pitch = 1.03;

        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find(
            (v) =>
              /en/i.test(v.lang) &&
              /(google|samantha|victoria|karen|zira|female)/i.test(v.name)
          ) ||
          voices.find((v) => /en-US/i.test(v.lang)) ||
          voices.find((v) => /en/i.test(v.lang));
        if (preferred) {
          utterance.voice = preferred;
        }

        utterance.onstart = () => {
          activeSpokenTextRef.current = text;
          setAutoplayBlocked(false);
          setPendingReplay(null);
          setIsSpeaking(true);
          setSpeakingId(id);
        };
        utterance.onend = () => {
          activeSpokenTextRef.current = null;
          setIsSpeaking(false);
          setSpeakingId(null);
        };
        utterance.onerror = () => {
          activeSpokenTextRef.current = null;
          setIsSpeaking(false);
          setSpeakingId(null);
        };

        activeSpokenTextRef.current = text;
        setIsSpeaking(true);
        setSpeakingId(id);
        window.speechSynthesis.speak(utterance);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const playBase64Wav = useCallback(async (base64Audio: string, id: string, text: string) => {
    if (mutedRef.current) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    audioRef.current = audio;

    audio.onended = () => {
      activeSpokenTextRef.current = null;
      setIsSpeaking(false);
      setSpeakingId(null);
    };
    audio.onerror = () => {
      activeSpokenTextRef.current = null;
      setIsSpeaking(false);
      setSpeakingId(null);
      setVoiceError('Could not play tutor audio clip.');
    };

    try {
      activeSpokenTextRef.current = text;
      setAutoplayBlocked(false);
      setPendingReplay(null);
      setIsSpeaking(true);
      setSpeakingId(id);
      await audio.play();
    } catch {
      activeSpokenTextRef.current = null;
      setIsSpeaking(false);
      setSpeakingId(null);
      setAutoplayBlocked(true);
      setPendingReplay({ id, text });
    }
  }, []);

  const speakText = useCallback(
    async (
      text: string,
      id: string,
      spokenCognitiveLoad: 'low' | 'moderate' | 'high' = 'low'
    ) => {
      const clean = text.trim();
      if (!clean || mutedRef.current) return;

      const reqId = ++requestCounterRef.current;
      setVoiceError(null);

      const cacheKey = `${spokenCognitiveLoad}::${clean}`;
      const cached = ttsCacheRef.current.get(cacheKey);
      if (cached) {
        await playBase64Wav(cached, id, clean);
        return;
      }

      setIsLoadingTts(true);
      setSpeakingId(id);

      try {
        const res = await fetch('/api/tutor/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean, spokenCognitiveLoad }),
        });
        const data = (await res.json()) as {
          audioBase64?: string;
          fallbackMode?: 'browser_speech';
          notice?: string;
          error?: string;
        };

        if (reqId !== requestCounterRef.current) return;

        if (res.ok && data.fallbackMode === 'browser_speech') {
          setIsLoadingTts(false);
          const spoke = speakWithBrowserSpeech(clean, id, spokenCognitiveLoad);
          if (!spoke) {
            setIsSpeaking(false);
            setSpeakingId(null);
          }
          return;
        }

        if (!res.ok || !data.audioBase64) {
          if (res.status === 429 && speakWithBrowserSpeech(clean, id, spokenCognitiveLoad)) {
            setIsLoadingTts(false);
            return;
          }
          throw new Error(data.error || 'Tutor voice synthesis failed.');
        }

        ttsCacheRef.current.set(cacheKey, data.audioBase64);
        setIsLoadingTts(false);
        await playBase64Wav(data.audioBase64, id, clean);
      } catch (err: unknown) {
        if (reqId !== requestCounterRef.current) return;
        setIsLoadingTts(false);
        setIsSpeaking(false);
        setSpeakingId(null);
        setVoiceError(
          err instanceof Error ? err.message : 'Unable to reach tutor voice service.'
        );
      }
    },
    [playBase64Wav, speakWithBrowserSpeech]
  );

  const askTutorChat = useCallback(
    async (
      message: string,
      history: TutorHistoryItem[],
      context: TutorChatContext
    ): Promise<{ reply?: string; runtimeDecision?: RuntimeDecisionOutput; error?: string }> => {
      setIsThinking(true);
      setVoiceError(null);
      try {
        const res = await fetch('/api/tutor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history, context }),
        });
        const data = (await res.json()) as {
          reply?: string;
          runtimeDecision?: RuntimeDecisionOutput;
          error?: string;
        };
        if (!res.ok || !data.reply) {
          const errMsg = data.error || 'AI Tutor could not generate a reply.';
          setVoiceError(errMsg);
          return { error: errMsg };
        }
        return { reply: data.reply, runtimeDecision: data.runtimeDecision };
      } catch (err: unknown) {
        const errMsg =
          err instanceof Error ? err.message : 'Network error contacting AI Tutor.';
        setVoiceError(errMsg);
        return { error: errMsg };
      } finally {
        setIsThinking(false);
      }
    },
    []
  );

  const cleanupMicResources = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setMicLevel(0);
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setVoiceError(null);
    // Section 36: Voice Interruption Recovery — capture unfinished tutor narration on interrupt
    stopSpeaking(true);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceError(
        'Microphone recording is not available in this browser. Type below or click a voice prompt!'
      );
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      try {
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tickLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setMicLevel(Math.min(1, avg / 90));
          rafRef.current = requestAnimationFrame(tickLevel);
        };
        tickLevel();
      } catch {
        // Non-fatal: continue recording without level visualizer
      }

      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      return true;
    } catch {
      cleanupMicResources();
      setVoiceError(
        'Microphone access was denied or unavailable. Allow mic permission or type your question below.'
      );
      return false;
    }
  }, [cleanupMicResources, stopSpeaking]);

  const stopRecordingAndTranscribe = useCallback(async (): Promise<TranscribeResult | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      setIsRecording(false);
      cleanupMicResources();
      return null;
    }

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        setIsRecording(false);
        cleanupMicResources();

        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];

        if (blob.size < 200) {
          setVoiceError('No speech captured. Hold or tap Speak and say your answer clearly.');
          resolve(null);
          return;
        }

        setIsTranscribing(true);
        try {
          const base64 = await new Promise<string>((resBase64, rejBase64) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = String(reader.result || '');
              const idx = result.indexOf(',');
              resBase64(idx >= 0 ? result.slice(idx + 1) : result);
            };
            reader.onerror = () => rejBase64(new Error('Failed to read audio recording.'));
            reader.readAsDataURL(blob);
          });

          const response = await fetch('/api/tutor/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: mimeType.split(';')[0],
            }),
          });
          const data = (await response.json()) as {
            transcript?: string;
            speechConfidence?: SignalConfidenceTier;
            codeSwitchingDetected?: boolean;
            error?: string;
          };
          if (!response.ok) {
            throw new Error(data.error || 'Could not transcribe your voice.');
          }
          const transcript = (data.transcript || '').trim();
          if (!transcript) {
            setVoiceError('I did not catch that clearly — please try speaking again.');
            resolve(null);
            return;
          }
          resolve({
            transcript,
            speechConfidence: data.speechConfidence ?? 'high',
            codeSwitchingDetected: Boolean(data.codeSwitchingDetected),
          });
        } catch (err: unknown) {
          setVoiceError(
            err instanceof Error ? err.message : 'Voice transcription failed.'
          );
          resolve(null);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.stop();
    });
  }, [cleanupMicResources]);

  return {
    isSpeaking,
    isLoadingTts,
    speakingId,
    isRecording,
    isTranscribing,
    isThinking,
    micLevel,
    autoplayBlocked,
    pendingReplay,
    voiceError,
    interruptedTutorContext,
    setVoiceError,
    clearInterruptedContext,
    speakText,
    stopSpeaking,
    askTutorChat,
    startRecording,
    stopRecordingAndTranscribe,
  };
}

