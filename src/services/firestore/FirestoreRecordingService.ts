import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { RecordingSession, UserProfile } from '../../types/index';
import { IRecordingService } from '../interfaces';
import { cleanFirestoreData } from './utils';

export class FirestoreRecordingService implements IRecordingService {
  async getRecordings(userProfile: UserProfile): Promise<RecordingSession[]> {
    try {
      let q = collection(db, 'svara/recordings/sessions') as any;
      if (userProfile.role === 'agent') {
        q = query(collection(db, 'svara/recordings/sessions'), where('agentSnapshot.agentId', '==', userProfile.userId));
      } else if (userProfile.role === 'trainer') {
        q = query(collection(db, 'svara/recordings/sessions'), where('agentSnapshot.assignedTrainerId', '==', userProfile.userId));
      }
      const snap = await getDocs(q);
      const list: RecordingSession[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) } as RecordingSession);
      });
      list.sort((a, b) => {
        const timeA = a.audioMetaData?.createdAt ? new Date(a.audioMetaData.createdAt).getTime() : 0;
        const timeB = b.audioMetaData?.createdAt ? new Date(b.audioMetaData.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'svara/recordings/sessions');
      return [];
    }
  }

  async getRecording(id: string): Promise<RecordingSession | null> {
    try {
      const snap = await getDoc(doc(db, 'svara/recordings/sessions', id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as RecordingSession;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `svara/recordings/sessions/${id}`);
      return null;
    }
  }

  async createRecording(id: string, recording: RecordingSession): Promise<void> {
    try {
      const sanitized = cleanFirestoreData(recording);
      await setDoc(doc(db, 'svara/recordings/sessions', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `svara/recordings/sessions/${id}`);
    }
  }

  async updateRecording(id: string, updates: Partial<RecordingSession>): Promise<void> {
    try {
      const sanitized = cleanFirestoreData(updates);
      await updateDoc(doc(db, 'svara/recordings/sessions', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `svara/recordings/sessions/${id}`);
    }
  }

  async deleteRecording(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'svara/recordings/sessions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `svara/recordings/sessions/${id}`);
    }
  }

  subscribeRecordings(userProfile: UserProfile, onUpdate: (recordings: RecordingSession[]) => void, onError?: (err: any) => void): () => void {
    let q = collection(db, 'svara/recordings/sessions') as any;
    if (userProfile.role === 'agent') {
      q = query(collection(db, 'svara/recordings/sessions'), where('agentSnapshot.agentId', '==', userProfile.userId));
    } else if (userProfile.role === 'trainer') {
      q = query(collection(db, 'svara/recordings/sessions'), where('agentSnapshot.assignedTrainerId', '==', userProfile.userId));
    }

    const unsub = onSnapshot(q, (snapshot: any) => {
      const list: RecordingSession[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) } as RecordingSession);
      });
      list.sort((a, b) => {
        const timeA = a.audioMetaData?.createdAt ? new Date(a.audioMetaData.createdAt).getTime() : 0;
        const timeB = b.audioMetaData?.createdAt ? new Date(b.audioMetaData.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      onUpdate(list);
    }, (err) => {
      console.warn("Real-time recordings sync failed:", err);
      if (onError) onError(err);
    });
    return unsub;
  }
}
