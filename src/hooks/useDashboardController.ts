import { useState, useMemo } from 'react';
import { UserProfile, BusinessScenario, RecordingSession, RecordingSessionViewModel } from '../types/index';

type DashboardTab = 'agents' | 'trainers' | 'approvals' | 'scenarios' | 'recordings' | 'overview';

interface DashboardControllerProps {
  userProfile: UserProfile;
  users: UserProfile[];
  scenarios: BusinessScenario[];
  recordings: RecordingSessionViewModel[];
}

/**
 * Hook untuk mengontrol logika presentasi/UI Dashboard (tab aktif, filter, dsb)
 */
export function useDashboardController({ userProfile, users, scenarios, recordings }: DashboardControllerProps) {
  // State untuk Tab Aktif
  const [activeTab, setActiveTab] = useState<DashboardTab>(
    userProfile.role === 'agent' ? 'overview' : 'agents'
  );

  // State untuk Modal & Drilldowns
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null);
  const [managingAccessScenario, setManagingAccessScenario] = useState<BusinessScenario | null>(null);

  // Filtering Data (menggunakan useMemo agar kalkulasi hanya terjadi jika deps berubah)
  
  const approvedProfiles = useMemo(() => users.filter(p => p.role !== 'onboarding'), [users]);
  const pendingProfiles = useMemo(() => users.filter(p => p.role === 'onboarding'), [users]);
  
  // Filter spesifik untuk Manager/Superadmin
  const trainersOnly = useMemo(() => approvedProfiles.filter(p => p.role === 'trainer' || p.role === 'superadmin'), [approvedProfiles]);
  const agentsOnly = useMemo(() => approvedProfiles.filter(p => p.role === 'agent'), [approvedProfiles]);
  
  // Filter spesifik untuk Trainer (mengambil agen yang di-assign ke trainer tersebut)
  // Catatan: Jika users sudah di-filter via API (getTrainerAgents), maka `users` di sini sudah spesifik agennya saja.
  const assignedAgents = useMemo(() => {
    if (userProfile.role === 'trainer') return users; // asumsi data sudah difilter oleh hook API
    return [];
  }, [users, userProfile.role]);

  // Filter Skenario berdasarkan role
  const availableScenarios = useMemo(() => {
    return scenarios.filter(sc => 
      userProfile.role === 'superadmin' ||
      sc.createdBy === userProfile.userId || 
      (sc.allowedTrainers && sc.allowedTrainers.includes(userProfile.userId)) ||
      (sc.allowedAgents && sc.allowedAgents.includes(userProfile.userId))
    );
  }, [scenarios, userProfile]);

  // Filter Rekaman (Recordings) berdasarkan role
  const myRecordings = useMemo(() => {
    return recordings.filter(r => {
      if (userProfile.role === 'superadmin' || userProfile.role === 'manager') return true;
      if (userProfile.role === 'agent') return r.agentId === userProfile.userId;
      
      // Untuk Trainer: tampilkan rekaman agen-agennya
      return r.trainerId === userProfile.userId || users.some(a => a.userId === r.agentId);
    });
  }, [recordings, users, userProfile]);

  return {
    activeTab,
    setActiveTab,
    selectedRecording,
    setSelectedRecording,
    managingAccessScenario,
    setManagingAccessScenario,
    
    // Computed Data
    approvedProfiles,
    pendingProfiles,
    trainersOnly,
    agentsOnly,
    assignedAgents,
    availableScenarios,
    myRecordings
  };
}
