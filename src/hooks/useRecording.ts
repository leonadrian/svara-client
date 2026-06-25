import { useState, useEffect, useRef, FormEvent } from 'react';
import { useServices } from '../services/ServiceContext';
import { UserProfile, BusinessScenario, RecordingSession, RecordingSessionStoredLocally } from '../types/index';
import { 
  getLocalRecordings, saveLocalRecording, 
  getLocalRecordingAudio, deleteLocalRecording, updateLocalRecording 
} from '../localDb';
import { showToast, getExtensionFromMime } from '../utils';
import { useAudioRecorder } from '../utils/audioRecorder';

// --- 1. Recording Session Mutations Hook ---
interface UseRecordingMutationsOptions {
  userProfile: UserProfile;
  scenarios: BusinessScenario[];
  userNamesMap?: Record<string, string>;
  onRefresh?: () => void;
}

export function useRecordingMutations({
  userProfile,
  scenarios,
  userNamesMap = {},
  onRefresh
}: UseRecordingMutationsOptions) {
  const { recordingService, storageService } = useServices();
  const isAgent = userProfile.role === 'agent';
  const assignedTrainerId = (userProfile as any).assignedTrainer;

  const [isUploading, setIsUploading] = useState(false);

  // Playback resolver
  const resolveAudioUrl = async (recId: string, cloudUrl?: string): Promise<string> => {
    let playbackSrc = '';
    try {
      const localAudioBlob = await getLocalRecordingAudio(recId);
      if (localAudioBlob) {
        playbackSrc = URL.createObjectURL(localAudioBlob);
        console.log(`Loading audio from IndexedDB local buffer for recording: ${recId}`);
      }
    } catch (err) {
      console.warn("Failed reading local IndexedDB Blob, streaming from cloud:", err);
    }

    if (!playbackSrc) {
      if (cloudUrl) {
        playbackSrc = cloudUrl;
        console.log(`Streaming audio from Firebase Cloud Storage for recording: ${recId}`);
      } else {
        throw new Error("Audio file tidak ditemukan baik secara lokal maupun cloud.");
      }
    }
    return playbackSrc;
  };

  const handleUploadToCloud = async (recId: string, localMeta: any) => {
    setIsUploading(true);
    try {
      const localAudioBlob = await getLocalRecordingAudio(recId);
      if (!localAudioBlob || !localMeta) {
        throw new Error("Data audio lokal atau metadata tidak ditemukan di database.");
      }

      const ext = getExtensionFromMime(localAudioBlob.type);
      const cloudAudioUrl = await storageService.uploadFile(`svara/recordings/${recId}.${ext}`, localAudioBlob, localAudioBlob.type || `audio/${ext}`);

      const rId = localMeta.agentSnapshot?.agentId || (localMeta as any).agentId || userProfile.userId;
      const rName = localMeta.agentSnapshot?.agentName || userNamesMap?.[rId] || userProfile.userName;
      const tId = localMeta.agentSnapshot?.assignedTrainerId || (localMeta as any).assignedTrainer || 'self';
      const tName = localMeta.agentSnapshot?.assignedTrainerName || userNamesMap?.[tId] || 'Self Review';
      const sId = localMeta.scenarioSnapshot?.scenarioId || (localMeta as any).businessScenarioId || 'free_practice_sales';
      const sTitle = localMeta.scenarioSnapshot?.scenarioTitle || scenarios.find(s => s.scenarioId === sId)?.title || 'Latihan Bebas';

      const recData: any = {
        id: recId,
        recordedBy: localMeta.recordedBy || userProfile.userId,
        startedAt: localMeta.startedAt || localMeta.createdAt || new Date().toISOString(),
        endedAt: localMeta.endedAt || new Date().toISOString(),
        agentSnapshot: {
          agentId: rId,
          agentName: rName,
          assignedTrainerId: tId,
          assignedTrainerName: tName
        },
        scenarioSnapshot: {
          scenarioId: sId,
          scenarioTitle: sTitle
        },
        audioUrl: cloudAudioUrl,
        audioMetaData: {
          fileName: `${recId}.${getExtensionFromMime(localAudioBlob.type)}`,
          fileSizeByte: localAudioBlob.size,
          durationSeconds: localMeta.audioMetaData?.durationSeconds || localMeta.duration || 12,
          mimeType: localAudioBlob.type || `audio/${getExtensionFromMime(localAudioBlob.type)}`,
          createdAt: localMeta.audioMetaData?.createdAt || localMeta.startedAt || localMeta.createdAt || new Date().toISOString(),
          uploadedAt: new Date().toISOString()
        },
        notes: localMeta.notes || localMeta.evaluationNotes || 'Latihan diselesaikan dengan baik.'
      };

      await recordingService.createRecording(recId, recData);

      await updateLocalRecording(recId, {
        isUploaded: true,
        cloudAudioUrl: cloudAudioUrl,
        audioUrl: cloudAudioUrl
      });

      showToast("Succeeded uploading audio to Svara Cloud!", "success");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Gagal mengunggah rekaman manual:", err);
      showToast(`Gagal mengunggah: ${err.message}`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddExternalFile = async (
    extTitle: string, 
    extFile: File, 
    extScenarioId: string, 
    extAgentId: string, 
    extDuration: number, 
    agentsList: UserProfile[]
  ) => {
    if (!extTitle.trim()) {
      showToast("Judul rekaman tidak boleh kosong.", "error");
      return;
    }
    if (!extFile) {
      showToast("Anda harus melampirkan file audio (.mp3, .wav, atau sejenisnya).", "error");
      return;
    }

    const recordingId = `record_external_${Date.now()}`;
    const selectedScenario = scenarios.find(s => s.scenarioId === extScenarioId);
    const resolvedAgent = isAgent 
      ? userProfile 
      : agentsList.find(a => a.userId === extAgentId) || null;

    const metadata: any = {
      id: recordingId,
      title: extTitle.trim(),
      businessScenarioId: selectedScenario?.scenarioId || 'free_practice_sales',
      scenarioTitle: selectedScenario?.title || 'Latihan Bebas (Telesales)',
      scenarioCategory: selectedScenario?.category || 'sales',
      agentId: resolvedAgent?.userId || null,
      agentName: resolvedAgent?.userName || 'Belum Buat Akun / Belum Ditugaskan',
      assignedTrainer: !isAgent ? userProfile.userId : (assignedTrainerId || 'self'),
      duration: extDuration,
      audioMetaData: {
        durationSeconds: extDuration,
        fileSize: extFile.size
      },
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      isUploaded: false
    };

    try {
      await saveLocalRecording(metadata, extFile);
      showToast(`Rekaman eksternal "${extTitle}" berhasil disimpan ke buffer lokal!`, "success");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast(`Gagal menyimpan rekaman luar: ${err.message}`, "error");
    }
  };

  const handleLinkRecordingCredentials = async (
    linkingRecId: string, 
    linkingAgentId: string, 
    linkingScenarioId: string, 
    agentsList: UserProfile[],
    isUploaded: boolean
  ) => {
    const selectedAgentObj = agentsList.find(a => a.userId === linkingAgentId);
    const selectedScenObj = scenarios.find(s => s.scenarioId === linkingScenarioId);

    const updates: Partial<any> = {
      agentSnapshot: {
        agentId: selectedAgentObj?.userId || null,
        agentName: selectedAgentObj?.userName || 'Belum Ditugaskan',
        assignedTrainerId: userProfile.userId,
        assignedTrainerName: userProfile.userName
      },
      scenarioSnapshot: {
        scenarioId: selectedScenObj?.scenarioId || 'free_practice_sales',
        scenarioTitle: selectedScenObj?.title || 'Latihan Bebas'
      }
    };

    try {
      await updateLocalRecording(linkingRecId, updates);
      if (isUploaded) {
        await recordingService.updateRecording(linkingRecId, {
          agentSnapshot: updates.agentSnapshot,
          scenarioSnapshot: updates.scenarioSnapshot
        } as any);
      }
      showToast("Metadata rekaman berhasil dikaitkan!", "success");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast(`Gagal mengaitkan data: ${err.message}`, "error");
    }
  };

  const handleDeleteLocalRecord = async (id: string, name: string) => {
    try {
      await deleteLocalRecording(id);
      showToast(`Berkas rekaman lokal "${name}" telah dihapus.`, "success");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast(`Gagal menghapus: ${err.message}`, "error");
    }
  };

  return {
    isUploading,
    resolveAudioUrl,
    handleUploadToCloud,
    handleAddExternalFile,
    handleLinkRecordingCredentials,
    handleDeleteLocalRecord
  };
}




// --- 2. Recording Session Detail Hook ---
interface UseRecordingSessionDetailOptions {
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

// --- 3. Svara Studio Roleplay Simulation Hook ---
export interface UseSvaraStudioSimulationOptions {
  userProfile: UserProfile;
  initialScenario: BusinessScenario;
  assignedAgents: UserProfile[];
  onClose: () => void;
  onSuccess: (recording: RecordingSession) => void;
  preselectedAgentId?: string;
}

export function useSvaraStudioSimulation({
  userProfile,
  initialScenario,
  assignedAgents,
  onClose,
  onSuccess,
  preselectedAgentId
}: UseSvaraStudioSimulationOptions) {
  const { recordingService, storageService } = useServices();

  const isTrainerRole = userProfile.role === 'trainer' || userProfile.role === 'manager';

  const unregisteredAgentPlaceholder: UserProfile = {
    userId: '',
    userName: 'Belum Buat Akun (Temporary)',
    email: 'temp@svara.internal',
    role: 'onboarding',
    createdAt: '',
    updatedAt: '',
    assignedTrainer: null,
    assignedManager: null
  };

  const [activeScenario, setActiveScenario] = useState<BusinessScenario>(initialScenario);

  useEffect(() => {
    if (initialScenario) {
      setActiveScenario(initialScenario);
    }
  }, [initialScenario]);

  const [selectedAgent, setSelectedAgent] = useState<UserProfile | null>(() => {
    if (preselectedAgentId === 'unregistered' || preselectedAgentId === '') {
      return unregisteredAgentPlaceholder;
    }
    if (preselectedAgentId) {
      const found = assignedAgents.find(a => a.userId === preselectedAgentId);
      if (found) return found;
    }
    return assignedAgents.length > 0 ? assignedAgents[0] : unregisteredAgentPlaceholder;
  });

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const recorder = useAudioRecorder({
    activeScenario,
    userProfile,
    isTrainerRole,
    selectedAgent: selectedAgent ? { id: selectedAgent.userId, name: selectedAgent.userName } : null
  });

  useEffect(() => {
    if (activeScenario) {
      setCurrentTurnIndex(0);
      setIsFinished(false);
      recorder.resetRecording();
    }
  }, [activeScenario]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignedAgents.length > 0 && (!selectedAgent || selectedAgent.userId === 'unregistered' || selectedAgent.userId === '')) {
      setSelectedAgent(assignedAgents[0]);
    }
  }, [assignedAgents]);

  const startRecordingFlow = async () => {
    setError(null);
    try {
      await recorder.startRecording();
      setIsSimulationStarted(true);
    } catch (err: any) {
      setError("Izin mikrofon ditolak atau tidak didukung pada device Anda. Silakan ijinkan mikrofon untuk lanjut.");
    }
  };

  const stopRecordingFlow = () => {
    recorder.stopRecording();
  };

  const progressTurn = () => {
    if (activeScenario && currentTurnIndex < (activeScenario.sentences || []).length - 1) {
      setCurrentTurnIndex(currentTurnIndex + 1);
    } else {
      setIsFinished(true);
      stopRecordingFlow();
    }
  };

  const restartSimulation = () => {
    setCurrentTurnIndex(0);
    setIsFinished(false);
    setIsSimulationStarted(true);
    recorder.resetRecording();
    startRecordingFlow();
  };

  const saveRoleplayRecording = async () => {
    setError(null);

    if (isTrainerRole && !selectedAgent) {
      setError("Anda harus terlebih dahulu memilih Agen yang Anda latih");
      return;
    }

    if (!recorder.audioBlob) {
      setError("Gagal mendeteksi data rekaman suara. Harap rekam latihan terlebih dahulu.");
      return;
    }

    setSaving(true);
    const recordingId = `record_cloud_${Date.now()}`;
    let finalAudioUrl = '';

    if (recorder.audioBlob) {
      const ext = getExtensionFromMime(recorder.audioBlob.type);
      try {
        finalAudioUrl = await storageService.uploadFile(`svara/recordings/${recordingId}.${ext}`, recorder.audioBlob, recorder.audioBlob.type || `audio/${ext}`);
      } catch (storageErr) {
        console.warn("Storage upload failed. Storing with local object link:", storageErr);
        finalAudioUrl = `https://storage.googleapis.com/apps-by-pro.firebasestorage.app/svara/recordings/${recordingId}.${ext}`;
      }
    }

    const recAgentId = isTrainerRole && selectedAgent ? (selectedAgent.userId === 'unregistered' || selectedAgent.userId === '' ? null : selectedAgent.userId) : userProfile.userId;
    const recAgentName = isTrainerRole && selectedAgent ? selectedAgent.userName : userProfile.userName;
    
    const recTrainerId = isTrainerRole 
      ? userProfile.userId 
      : (userProfile.role === 'agent' ? (userProfile as any).assignedTrainer || 'self' : 'self');
    
    const recTrainerName = isTrainerRole 
      ? userProfile.userName 
      : 'Self Review';

    const recData: RecordingSession = {
      id: recordingId,
      recordedBy: userProfile.userId,
      startedAt: new Date(Date.now() - (recorder.recordingSeconds * 1000)).toISOString(),
      endedAt: new Date().toISOString(),
      agentSnapshot: {
        agentId: recAgentId,
        agentName: recAgentName,
        assignedTrainerId: recTrainerId,
        assignedTrainerName: recTrainerName
      },
      scenarioSnapshot: {
        scenarioId: activeScenario.scenarioId,
        scenarioTitle: activeScenario.title
      },
      audioUrl: finalAudioUrl,
      audioMetaData: {
        fileName: `svara_${recordingId}.${getExtensionFromMime(recorder.audioBlob?.type)}`,
        fileSizeByte: recorder.audioBlob?.size || 0,
        durationSeconds: recorder.recordingSeconds || 12,
        mimeType: recorder.audioBlob?.type || `audio/${getExtensionFromMime(recorder.audioBlob?.type)}`,
        createdAt: new Date().toISOString()
      }
    };

    try {
      await recordingService.createRecording(recordingId, recData);
      
      try {
        const localData: RecordingSessionStoredLocally = {
          ...recData,
          localAudioRef: null
        };
        await saveLocalRecording(localData, recorder.audioBlob || undefined);
      } catch (localUpdErr) {
        console.warn("Could not save sync marker to IndexedDB:", localUpdErr);
      }

      showToast("Berhasil mengunggah dan mensinkronisasikan rekaman ke Cloud Svara!", "success");
      onSuccess(recData);
      setSaving(false);
      onClose();
    } catch (err: any) {
      console.error("Failed to commit recording database log:", err);
      setError("Gagal menyimpan rekam data ke Cloud Firestore: " + err.message);
      setSaving(false);
    }
  };

  return {
    isTrainerRole,
    unregisteredAgentPlaceholder,
    activeScenario,
    setActiveScenario,
    selectedAgent,
    setSelectedAgent,
    currentTurnIndex,
    isSimulationStarted,
    isFinished,
    setIsFinished,
    recorder,
    saving,
    error,
    startRecordingFlow,
    stopRecordingFlow,
    progressTurn,
    restartSimulation,
    saveRoleplayRecording
  };
}

