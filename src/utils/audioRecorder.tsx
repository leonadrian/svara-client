import { useState, useEffect, useRef } from 'react';
import { BusinessScenario, UserProfile, RecordingSessionStoredLocally } from '../types/index';
import { saveLocalRecording } from '../localDb';
import { convertWebmToMp3 } from './audioConverter';
import { buildAgentSnapshot, buildScenarioSnapshot } from './transformers';

export interface UseAudioRecorderOptions {
  activeScenario: BusinessScenario | null;
  userProfile: UserProfile;
  isTrainerRole: boolean;
  selectedAgent: { id: string; name: string } | null;
  onStopCallback?: (blob: Blob, url: string) => void;
}

export function useAudioRecorder(options: UseAudioRecorderOptions) {
  const { activeScenario, userProfile, isTrainerRole, selectedAgent, onStopCallback } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [waveBars, setWaveBars] = useState<number[]>([
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  // Clean timer & recorder on unmount
  useEffect(() => {
    return () => {
      stopRecordingTimer();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Timer controls
  const startRecordingTimer = () => {
    setRecordingSeconds(0);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Waveform visualizer simulation
  const updateWaveform = () => {
    if (animationRef.current !== null) {
      setWaveBars(Array.from({ length: 20 }, () => Math.floor(Math.random() * 55) + 10));
      animationRef.current = requestAnimationFrame(updateWaveform);
    }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlayingBack(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recordOptions = { mimeType: 'audio/webm' };
      let mediaRecorder: MediaRecorder;

      try {
        mediaRecorder = new MediaRecorder(stream, recordOptions);
      } catch (err) {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const rawWebmBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });

        // Stop all audio tracks to free mic resource
        stream.getTracks().forEach((track) => track.stop());

        // Calculate precise elapsed duration to avoid stale React closure values
        const preciseDuration = Math.round((Date.now() - startTimeRef.current) / 1000) || 5;

        setIsConverting(true);
        let finalBlob = rawWebmBlob;
        let ext = 'webm';

        try {
          console.log("Mulai konversi rekaman ke MP3...");
          finalBlob = await convertWebmToMp3(rawWebmBlob);
          ext = 'mp3';
          console.log("Konversi ke MP3 sukses! Ukuran berkas:", finalBlob.size);
        } catch (err) {
          console.warn("Gagal konversi ke MP3, menggunakan fallback WebM asli:", err);
        } finally {
          setIsConverting(false);
        }

        setAudioBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);

        // AUTO-SAVE to local DB as backup offline buffer immediately!
        try {
          const tempId = `record_loc_${Date.now()}`;

          const metadata: RecordingSessionStoredLocally = {
            id: tempId,
            agentSnapshot: buildAgentSnapshot(userProfile, isTrainerRole, selectedAgent),
            scenarioSnapshot: buildScenarioSnapshot(activeScenario),
            startedAt: new Date(startTimeRef.current).toISOString(),
            endedAt: new Date().toISOString(),
            recordedBy: userProfile.userId,
            audioUrl: null,
            audioMetaData: {
              fileName: `svara_${tempId}.${ext}`,
              fileSizeByte: finalBlob.size,
              durationSeconds: preciseDuration,
              mimeType: finalBlob.type || `audio/${ext}`,
              createdAt: new Date().toISOString()
            },
            localAudioRef: null
          };
          await saveLocalRecording(metadata, finalBlob);
          console.log("Offline backup successfully saved inside client IndexedDB:", tempId);
        } catch (localSaveErr) {
          console.warn("Failed saving background backup to offline store:", localSaveErr);
        }

        if (onStopCallback) {
          onStopCallback(finalBlob, url);
        }
      };

      setIsRecording(true);
      mediaRecorder.start(200); // chunk size
      startRecordingTimer();

      // Start waveform animated bars
      animationRef.current = requestAnimationFrame(updateWaveform);
    } catch (err: any) {
      console.error("Failed to access microphone inside Svara: ", err);
      throw err;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      stopRecordingTimer();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingBack(false);
      audioPlayerRef.current = audio;
    }

    if (audioPlayerRef.current) {
      if (isPlayingBack) {
        audioPlayerRef.current.pause();
        setIsPlayingBack(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlayingBack(true);
      }
    }
  };

  const resetRecording = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlayingBack(false);
    setWaveBars([20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20]);
    stopRecordingTimer();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
  };

  return {
    isRecording,
    isConverting,
    recordingSeconds,
    audioUrl,
    setAudioUrl,
    audioBlob,
    setAudioBlob,
    isPlayingBack,
    setIsPlayingBack,
    waveBars,
    startRecording,
    stopRecording,
    togglePlayback,
    resetRecording
  };
}
