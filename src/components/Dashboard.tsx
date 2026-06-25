import React, { useMemo } from 'react';
import { UserProfile, BusinessScenario } from '../types/index';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDashboardController } from '../hooks/useDashboardController';
import { DashboardRender } from '../render/dashboard/DashboardRender';
import { useServices } from '../services/ServiceContext';
import { RefreshCw } from 'lucide-react';
import { showToast } from '../utils';

interface DashboardProps {
  userProfile: UserProfile;
  onTriggerScenarioBuilder: () => void;
  onTriggerSimulator: (scenario: BusinessScenario, preselectedAgentId?: string) => void;
  onTriggerScenarioDetail: (scenario: BusinessScenario) => void;
}

export default function Dashboard({ userProfile, onTriggerScenarioBuilder, onTriggerSimulator, onTriggerScenarioDetail }: DashboardProps) {
  // 1. Fetching Data using TanStack Query
  const { 
    users, 
    scenarios, 
    recordings, 
    isDashboardLoading, 
    errorUsers, 
    errorScenarios, 
    errorRecordings,
    refetchLocalRecordings
  } = useDashboardData(userProfile);

  // 2. Controller for filtering, tabs, and UI state
  const controller = useDashboardController({
    userProfile,
    users,
    scenarios,
    recordings
  });

  const { userService } = useServices();

  // 3. UserNames map for easy lookups
  const userNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach(u => { map[u.userId] = u.userName; });
    map[userProfile.userId] = userProfile.userName; // include self
    return map;
  }, [users, userProfile]);

  // 4. API Handlers
  const handleApproveUser = async (userId: string, role: 'agent' | 'trainer') => {
    try {
      await userService.updateUser(userId, { role, updatedAt: new Date().toISOString() } as any);
      showToast(`User disetujui sebagai ${role}`, 'success');
      // Karena kita pakai TanStack Query, kita bisa memanggil refetch atau queryClient.invalidateQueries()
      // Namun agar simpel, data stale akan merefetch otomatis jika window focus/interval.
      // Di sistem real, kita panggil: queryClient.invalidateQueries({ queryKey: ['users'] })
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleRejectUser = async (userId: string) => {
    // Implement reject logic
    showToast(`Fungsi tolak belum diimplementasi di API layer`, 'error');
  };

  const handleAssignTrainer = async (agentId: string, trainerId: string) => {
    try {
      await userService.updateUser(agentId, { assignedTrainer: trainerId || null } as any);
      showToast(`Trainer berhasil diassign`, 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  if (isDashboardLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-brand-600">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-3 font-semibold">Memuat Dashboard...</span>
      </div>
    );
  }

  if (errorUsers || errorScenarios || errorRecordings) {
    return (
      <div className="p-8 bg-rose-50 text-rose-600 rounded-xl">
        <h3 className="font-bold">Gagal memuat data dashboard</h3>
        <p className="text-sm">Silakan periksa koneksi atau hubungi admin.</p>
      </div>
    );
  }

  return (
    <DashboardRender
      userProfile={userProfile}
      activeTab={controller.activeTab}
      setActiveTab={controller.setActiveTab}
      users={users}
      scenarios={scenarios}
      recordings={recordings}
      agentsOnly={controller.agentsOnly}
      trainersOnly={controller.trainersOnly}
      pendingProfiles={controller.pendingProfiles}
      assignedAgents={controller.assignedAgents}
      availableScenarios={controller.availableScenarios}
      myRecordings={controller.myRecordings}
      userNamesMap={userNamesMap}
      onTriggerScenarioBuilder={onTriggerScenarioBuilder}
      onSimulate={(s) => onTriggerSimulator(s)}
      onEditScenario={(s) => onTriggerScenarioDetail(s)}
      onAssignScenario={(s) => controller.setManagingAccessScenario(s)}
      onViewDetails={(r) => controller.setSelectedRecording(r)}
      onApproveUser={handleApproveUser}
      onRejectUser={handleRejectUser}
      onAssignTrainerToAgent={handleAssignTrainer}
      onRefreshRecordings={refetchLocalRecordings}
    />
  );
}
