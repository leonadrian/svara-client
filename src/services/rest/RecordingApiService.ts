import { IRecordingService } from '../interfaces';
import { RecordingSession, UserProfile } from '../../types/index';
import { apiFetch } from './apiClient';

export class RecordingApiService implements IRecordingService {
  async getRecordings(userProfile: UserProfile): Promise<RecordingSession[]> {
    return await apiFetch<RecordingSession[]>('/api/svara/recordings');
  }

  async getRecording(id: string): Promise<RecordingSession | null> {
    try {
      return await apiFetch<RecordingSession>(`/api/svara/recordings/${id}`);
    } catch (err: any) {
      if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
        return null;
      }
      throw err;
    }
  }

  async createRecording(id: string, recording: RecordingSession): Promise<void> {
    await apiFetch(`/api/svara/recordings/${id}`, {
      method: 'POST',
      body: JSON.stringify(recording)
    });
  }

  async updateRecording(id: string, updates: Partial<RecordingSession>): Promise<void> {
    await apiFetch(`/api/svara/recordings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteRecording(id: string): Promise<void> {
    await apiFetch(`/api/svara/recordings/${id}`, {
      method: 'DELETE'
    });
  }

  subscribeRecordings(userProfile: UserProfile, onUpdate: (recordings: RecordingSession[]) => void, onError?: (err: any) => void): () => void {
    let active = true;
    const poll = async () => {
      try {
        const recordings = await this.getRecordings(userProfile);
        if (active) onUpdate(recordings);
      } catch (err) {
        if (active && onError) onError(err);
      }
    };

    poll();
    const interval = setInterval(poll, 10000); // recordings list, poll every 10s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }
}
