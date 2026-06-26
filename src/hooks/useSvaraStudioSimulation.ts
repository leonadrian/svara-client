import { useState, useEffect } from 'react';
import { useServices } from '../services/ServiceContext';
import { UserProfile, BusinessScenario, RecordingSession, RecordingSessionStoredLocally } from '../types/index';
import { saveLocalRecording } from '../localDb';
import { showToast, getExtensionFromMime } from '../utils';
import { useAudioRecorder } from '../utils/audioRecorder';
import { buildAgentSnapshot, buildScenarioSnapshot } from '../utils/transformers';

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

    const agentSnapshot = buildAgentSnapshot(userProfile, isTrainerRole, selectedAgent);
    const scenarioSnapshot = buildScenarioSnapshot(activeScenario);

    const recData: RecordingSession = {
      id: recordingId,
      recordedBy: userProfile.userId,
      startedAt: new Date(Date.now() - (recorder.recordingSeconds * 1000)).toISOString(),
      endedAt: new Date().toISOString(),
      agentSnapshot,
      scenarioSnapshot,
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
