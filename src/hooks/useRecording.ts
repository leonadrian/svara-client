import { useState } from 'react';
import { useServices } from '../services/ServiceContext';
import { UserProfile, BusinessScenario } from '../types/index';
import { 
  saveLocalRecording, getLocalRecordingAudio,
  deleteLocalRecording, updateLocalRecording 
} from '../localDb';
import { showToast, getExtensionFromMime } from '../utils';
import { resolveAudioUrl } from '../utils/audioUtils';

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
