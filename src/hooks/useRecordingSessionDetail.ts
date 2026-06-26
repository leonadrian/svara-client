import { useState, useEffect, useRef } from 'react';
import { getLocalRecordingAudio } from '../localDb';

export interface UseRecordingSessionDetailOptions {
  recording: {
    id: string;
    title: string;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: string;
    agentId: string | null;
    agentName: string;
    trainerId?: string;
    trainerName?: string;
    duration: number;
    createdAt: string;
    cloudAudioUrl?: string;
    hasLocal: boolean;
    hasCloud: boolean;
    isUploaded: boolean;
    notes?: string;
  };
}

export function useRecordingSessionDetail({
  recording
}: UseRecordingSessionDetailOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAudio = async () => {
      setLoadingAudio(true);
      try {
        if (recording.id) {
          const localBlob = await getLocalRecordingAudio(recording.id);
          if (localBlob && active) {
            const url = URL.createObjectURL(localBlob);
            setAudioSrc(url);
            setLoadingAudio(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not read local IndexedDB audio in detail:", err);
      }

      if (recording.cloudAudioUrl && active) {
        setAudioSrc(recording.cloudAudioUrl);
      }
      setLoadingAudio(false);
    };

    fetchAudio();

    return () => {
      active = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [recording]);

  const handleTogglePlay = () => {
    if (!audioSrc) return;

    if (!audioRef.current) {
      const audio = new Audio(audioSrc);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => {
        console.error("Audio playback error:", err);
      });
      setIsPlaying(true);
    }
  };

  return {
    isPlaying,
    audioSrc,
    loadingAudio,
    handleTogglePlay
  };
}
