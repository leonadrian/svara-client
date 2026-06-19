/**
 * types/recording-session.ts
 * ===========================================================
 * end product dari sesi latihan percakapan antara Agent dan Trainer
 * menggunakan Business Scenario. Percakapan akan direkam untuk dievaluasi
 * hasil rekamannya.
 * ===========================================================
 */

export interface RecordingSession {
  id: string;
  recordedBy: string;
  startedAt: string; // dicatat saat tombol 'rekam' ditekan
  endedAt: string; //dicatat saat tombol 'selesai rekam' ditekan
  
  agentSnapshot: {
    agentId: string | null;
    agentName: string;
    assignedTrainerId: string;
    assignedTrainerName: string;
  }
  
  scenarioSnapshot: {
    scenarioId: string;
    scenarioTitle: string;
  }

  audioUrl: string | null;
  audioMetaData: AudioMetaData;
  notes?: string;
}

export interface LocalStorageExtension {
  localAudioRef: string | null;
  isUploaded?: boolean;
  notes?: string;   // Optional offline notes prior to cloud upload
  duration?: number;
  createdAt?: string;
  title?: string;
  cloudAudioUrl?: string;
}

export type RecordingSessionStoredLocally = RecordingSession & LocalStorageExtension;

// untuk ditampilkan pada UI/audio player
export interface AudioMetaData {
  fileName: string;
  fileSizeByte: number;
  durationSeconds: number;
  mimeType: string;
  createdAt: string; //timestamp file terbuat
  uploadedAt?: string;
}




