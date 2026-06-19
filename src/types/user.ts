// types/user.ts

export type UserRole =
|'onboarding' // role saat pertama kali daftar, pada dasarnya masih belum punya akses ke dalam aplikasi
|'agent' // role minimum untuk bisa akses aplikasi, di approve oleh manager/superadmin.
|'trainer' 
|'manager'
|'superadmin'

/**
 * =================================================
 * BASE CONTRACT (KONTRAK DASAR)
 * =================================================
 */

export interface BaseUserProfile {
  userId: string;
  userName: string;
  avatarUrl?: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * ==================================================
 * SPECIFIC ROLE PROFILES (KONTRAK ROLE SPESIFIK)
 * MENG-EXTENDS BASE CONTRACT
 * ==================================================
 */
export interface OnboardingProfile extends BaseUserProfile {
  role: 'onboarding';
  assignedTrainer: null;
  assignedManager: null;
}

export interface AgentProfile extends BaseUserProfile {
  role: 'agent';
  assignedTrainer: string;
  assignedManager: string;
}

export interface TrainerProfile extends BaseUserProfile {
  role: 'trainer';
  assignedTrainer: null;
  assignedManager: string;
}

export interface ManagerProfile extends BaseUserProfile {
  role: 'manager'|'superadmin';
  assignedTrainer: null;
  assignedManager: null;
}

/**
 * ====================================================
 * KONTRAK UTAMA YANG DIGUNAKAN
 * ====================================================
 */
export type UserProfile =
|OnboardingProfile
|AgentProfile
|TrainerProfile
|ManagerProfile


/**
 * ====================================================
 * RIWAYAT UNTUK KEPERLUAN AUDIT / DETAIL KRONOLOGIS
 * ====================================================
 */
export interface UserProfileHistory {
  id: string; // primaryKey
  userId: string; // foreign key untuk relasi dengan UserProfile
  role: UserRole;
  assignedTrainer: string | null;
  assignedManager: string | null;
  updatedAt: string;
  updatedBy: string;
  notes?: string;
}