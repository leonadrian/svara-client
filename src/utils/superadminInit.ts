import { query, collection, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types/index';

/**
 * Checks Firestore users profiles collection to see if any superadmin or manager exists
 */
export async function checkSuperadminExists(): Promise<boolean> {
  try {
    const q = query(collection(db, 'svara/users/profiles'), where('role', '==', 'superadmin'));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return true;
    }

    // Double check if there are any managers in the system
    const q2 = query(collection(db, 'svara/users/profiles'), where('role', '==', 'manager'));
    const querySnapshot2 = await getDocs(q2);
    return !querySnapshot2.empty;
  } catch (err) {
    console.error("Failed to check if superadmin exists:", err);
    return true; // prevent double runs
  }
}

/**
 * Creates a brand new fully functioning Superadmin (which extends ManagerProfile)
 * @returns Promise<UserProfile> The fully created and saved Superadmin profile
 */
export async function initializeSuperadmin(
  email: string,
  name: string,
  userId: string
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const superadminProfile: UserProfile = {
    userId: userId,
    userName: name,
    email: email,
    role: 'superadmin',
    assignedTrainer: null,
    assignedManager: null,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userId)}`,
    createdAt: now,
    updatedAt: now
  };

  const path = `svara/users/profiles/${userId}`;
  try {
    const userRef = doc(db, 'svara/users/profiles', userId);
    await setDoc(userRef, superadminProfile);
    return superadminProfile;
  } catch (err: any) {
    console.error("Initialization of superadmin profile crashed:", err);
    throw err;
  }
}

/**
 * Validates the admin registration token
 */
export function validateAdminToken(token: string): boolean {
  const allowed = ['svara-superadmin-token-2026', 'SVARA-SUPERADMIN-2026', 'SVARA-ADMIN'];
  return allowed.includes(token.trim());
}

