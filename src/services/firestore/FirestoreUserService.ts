import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { UserProfile } from '../../types/index';
import { IUserService } from '../interfaces';
import { cleanFirestoreData } from './utils';

const isMasterSuperadmin = (email: string): boolean => {
  const envVal = (import.meta as any).env?.VITE_SUPERADMIN_EMAILS || '';
  if (!envVal || !email) return false;
  const emails = envVal.split(',').map(e => e.trim().toLowerCase());
  return emails.includes(email.trim().toLowerCase());
};

export class FirestoreUserService implements IUserService {
  async getUser(id: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'svara/users/profiles', id));
      if (snap.exists()) {
        const data = snap.data();
        const userEmail = data.email || '';
        const rawRole = data.role || 'onboarding';
        const role = isMasterSuperadmin(userEmail) ? 'superadmin' : rawRole;

        return {
          userId: snap.id,
          userName: data.userName || data.name || '',
          email: userEmail,
          role: role,
          assignedTrainer: data.assignedTrainer || null,
          assignedManager: data.assignedManager || null,
          avatarUrl: data.avatarUrl || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `svara/users/profiles/${id}`);
      return null; // unreachable due to throw
    }
  }

  async getUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'svara/users/profiles'));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          userId: d.id,
          userName: data.userName || data.name || '',
          email: data.email || '',
          role: data.role || 'onboarding',
          assignedTrainer: data.assignedTrainer || null,
          assignedManager: data.assignedManager || null,
          avatarUrl: data.avatarUrl || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as UserProfile);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'svara/users/profiles');
      return [];
    }
  }

  async createUser(id: string, user: UserProfile): Promise<void> {
    try {
      const sanitized = cleanFirestoreData(user);
      await setDoc(doc(db, 'svara/users/profiles', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `svara/users/profiles/${id}`);
    }
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const sanitized = cleanFirestoreData(updates);
      await updateDoc(doc(db, 'svara/users/profiles', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `svara/users/profiles/${id}`);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'svara/users/profiles', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `svara/users/profiles/${id}`);
    }
  }

  subscribeUsers(onUpdate: (usersMap: Record<string, string>) => void, onError?: (err: any) => void): () => void {
    const unsub = onSnapshot(collection(db, 'svara/users/profiles'), (snapshot) => {
      const mapping: Record<string, string> = {
        'admin': 'Svara System',
        'demo_trainer_1': 'Diana Santoso'
      };
      snapshot.forEach((d) => {
        const u = d.data() as any;
        const uid = u.userId || u.id || d.id;
        const uname = u.userName || u.name;
        if (uid && uname) {
          mapping[uid] = uname;
        }
      });
      onUpdate(mapping);
    }, (err) => {
      console.warn("Real-time users mapping snapshot failed:", err);
      if (onError) onError(err);
    });
    return unsub;
  }

  subscribeUserProfile(id: string, onUpdate: (profile: UserProfile | null) => void, onError?: (err: any) => void): () => void {
    const unsub = onSnapshot(doc(db, 'svara/users/profiles', id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const userEmail = data.email || '';
        const rawRole = data.role || 'onboarding';
        const role = isMasterSuperadmin(userEmail) ? 'superadmin' : rawRole;

        onUpdate({
          userId: snapshot.id,
          userName: data.userName || data.name || '',
          email: userEmail,
          role: role,
          assignedTrainer: data.assignedTrainer || null,
          assignedManager: data.assignedManager || null,
          avatarUrl: data.avatarUrl || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as UserProfile);
      } else {
        onUpdate(null);
      }
    }, (err) => {
      console.warn("Real-time profile sync met an issue:", err);
      if (onError) onError(err);
    });
    return unsub;
  }

  subscribeUserList(onUpdate: (users: UserProfile[]) => void, onError?: (err: any) => void): () => void {
    const unsub = onSnapshot(collection(db, 'svara/users/profiles'), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data();
        list.push({
          userId: snap.id,
          userName: data.userName || data.name || '',
          email: data.email || '',
          role: data.role || 'onboarding',
          assignedTrainer: data.assignedTrainer || null,
          assignedManager: data.assignedManager || null,
          avatarUrl: data.avatarUrl || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as UserProfile);
      });
      onUpdate(list);
    }, (err) => {
      console.warn("Real-time user directory sync failed:", err);
      if (onError) onError(err);
    });
    return unsub;
  }

  async getTrainerAgents(trainerId: string, isSuperadmin: boolean): Promise<UserProfile[]> {
    try {
      const q = isSuperadmin
        ? query(collection(db, 'svara/users/profiles'), where('role', '==', 'agent'))
        : query(
            collection(db, 'svara/users/profiles'),
            where('role', '==', 'agent'),
            where('assignedTrainer', '==', trainerId)
          );
      const snapshot = await getDocs(q);
      const list: UserProfile[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data();
        list.push({
          userId: snap.id,
          userName: data.userName || data.name || '',
          email: data.email || '',
          role: data.role || 'onboarding',
          assignedTrainer: data.assignedTrainer || null,
          assignedManager: data.assignedManager || null,
          avatarUrl: data.avatarUrl || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as UserProfile);
      });
      return list;
    } catch (err) {
      console.error("Error loading trainer assigned agents in service: ", err);
      return [];
    }
  }

  async checkSuperadminExists(): Promise<boolean> {
    try {
      const q = query(collection(db, 'svara/users/profiles'), where('isSuperadmin', '==', true));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return true;
      }
      const q2 = query(collection(db, 'svara/users/profiles'), where('role', '==', 'manager'));
      const querySnapshot2 = await getDocs(q2);
      return !querySnapshot2.empty;
    } catch (err) {
      console.error("Failed to check superadmin existence in service:", err);
      return true;
    }
  }

  async registerPendingUser(userId: string, userName: string, email: string): Promise<UserProfile> {
    const now = new Date().toISOString();
    const formattedEmail = (email || '').toLowerCase().trim();
    const isMasterAdmin = isMasterSuperadmin(formattedEmail);
    const role = isMasterAdmin ? 'superadmin' : 'onboarding';

    const newProfile: UserProfile = {
      userId,
      userName: userName.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userId)}`,
      email: email || '',
      role: role,
      assignedTrainer: null,
      assignedManager: null,
      createdAt: now,
      updatedAt: now
    };
    await this.createUser(userId, newProfile);
    return newProfile;
  }
}
