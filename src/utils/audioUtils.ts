import { getLocalRecordingAudio } from '../localDb';

/**
 * Resolves the playback URL for a recording, preferring the local IndexedDB buffer
 * before falling back to the cloud storage URL.
 * 
 * @param recId The ID of the recording session
 * @param cloudUrl Optional Firebase Cloud Storage audio URL
 * @returns A promise resolving to the object URL or cloud URL string
 */
export async function resolveAudioUrl(recId: string, cloudUrl?: string): Promise<string> {
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
}
