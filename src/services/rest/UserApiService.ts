import { IUserService } from '../interfaces';
import { UserProfile } from '../../types/index';
import { apiFetch } from './apiClient';

const isMasterSuperadmin = (email: string): boolean => {
  const envVal = (import.meta as any).env?.VITE_SUPERADMIN_EMAILS || '';
  if (!envVal || !email) return false;
  const emails = envVal.split(',').map(e => e.trim().toLowerCase());
  return emails.includes(email.trim().toLowerCase());
};

const enrichProfileWithSuperadminOverride = (profile: UserProfile | null): UserProfile | null => {
  if (!profile) return null;
  const role = isMasterSuperadmin(profile.email) ? 'superadmin' : profile.role;
  return {
    ...profile,
    role,
    assignedTrainer: role === 'agent' ? (profile.assignedTrainer || '') : null,
    assignedManager: (role === 'agent' || role === 'trainer') ? (profile.assignedManager || '') : null
  } as UserProfile;
};

export class UserApiService implements IUserService {
  async getUser(id: string): Promise<UserProfile | null> {
    try {
      const profile = await apiFetch<UserProfile>(`/api/shared/users/${id}`);
      return enrichProfileWithSuperadminOverride(profile);
    } catch (err: any) {
      if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
        return null;
      }
      throw err;
    }
  }

  async getUsers(): Promise<UserProfile[]> {
    const list = await apiFetch<UserProfile[]>('/api/shared/users');
    return list.map(u => enrichProfileWithSuperadminOverride(u) as UserProfile);
  }

  async createUser(id: string, user: UserProfile): Promise<void> {
    await apiFetch(`/api/shared/users/${id}`, {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<void> {
    await apiFetch(`/api/shared/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteUser(id: string): Promise<void> {
    await apiFetch(`/api/shared/users/${id}`, {
      method: 'DELETE'
    });
  }

  subscribeUsers(onUpdate: (usersMap: Record<string, string>) => void, onError?: (err: any) => void): () => void {
    let active = true;
    const poll = async () => {
      try {
        const users = await this.getUsers();
        const mapping: Record<string, string> = {
          'admin': 'Svara System',
          'demo_trainer_1': 'Diana Santoso'
        };
        users.forEach(u => {
          if (u.userId && u.userName) {
            mapping[u.userId] = u.userName;
          }
        });
        if (active) onUpdate(mapping);
      } catch (err) {
        if (active && onError) onError(err);
      }
    };
    
    poll();
    const interval = setInterval(poll, 10000); // Poll every 10 seconds
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  subscribeUserProfile(id: string, onUpdate: (profile: UserProfile | null) => void, onError?: (err: any) => void): () => void {
    let active = true;
    const poll = async () => {
      try {
        const profile = await this.getUser(id);
        if (active) onUpdate(profile);
      } catch (err) {
        if (active && onError) onError(err);
      }
    };

    poll();
    const interval = setInterval(poll, 5000); // Poll profile every 5 seconds for status/role updates
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  subscribeUserList(onUpdate: (users: UserProfile[]) => void, onError?: (err: any) => void): () => void {
    let active = true;
    const poll = async () => {
      try {
        const users = await this.getUsers();
        if (active) onUpdate(users);
      } catch (err) {
        if (active && onError) onError(err);
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  async getTrainerAgents(trainerId: string, isSuperadmin: boolean): Promise<UserProfile[]> {
    return await apiFetch<UserProfile[]>(`/api/shared/users/trainer/${trainerId}/agents`);
  }

  async checkSuperadminExists(): Promise<boolean> {
    try {
      const res = await apiFetch<{ exists: boolean }>('/api/shared/users/check/superadmin');
      return res.exists;
    } catch (_) {
      return true;
    }
  }

  async registerPendingUser(userId: string, userName: string, email: string): Promise<UserProfile> {
    const res = await apiFetch<{ success: boolean; profile: UserProfile }>('/api/shared/profile', {
      method: 'POST',
      body: JSON.stringify({ userName, email })
    });
    return enrichProfileWithSuperadminOverride(res.profile) as UserProfile;
  }
}
