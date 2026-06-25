import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '../services/ServiceContext';
import { UserProfile, BusinessScenario, RecordingSession, RecordingSessionViewModel } from '../types/index';
import { getLocalRecordings } from '../localDb';

/**
 * Hook untuk memusatkan pengambilan data utama dashboard menggunakan TanStack Query.
 */
export function useDashboardData(userProfile: UserProfile) {
  const { userService, scenarioService, recordingService } = useServices();
  const isAgent = userProfile.role === 'agent';

  // 1. Mengambil data Users
  const { 
    data: users = [], 
    isLoading: isLoadingUsers,
    error: errorUsers
  } = useQuery<UserProfile[]>({
    queryKey: ['users', userProfile.role],
    queryFn: async () => {
      if (userProfile.role === 'trainer') {
        return await userService.getTrainerAgents(userProfile.userId, false);
      } else if (userProfile.role === 'superadmin' || userProfile.role === 'manager') {
        return await userService.getUsers();
      }
      return [];
    },
    enabled: userProfile.role !== 'agent',
    staleTime: 1000 * 60 * 5, 
  });

  // 2. Mengambil data Scenarios
  const {
    data: scenarios = [],
    isLoading: isLoadingScenarios,
    error: errorScenarios,
  } = useQuery<BusinessScenario[]>({
    queryKey: ['scenarios'],
    queryFn: async () => {
      return await scenarioService.getScenarios();
    },
    staleTime: 1000 * 60 * 5,
  });

  // 3. Mengambil data Recordings (Cloud)
  const {
    data: cloudRecordings = [],
    isLoading: isLoadingCloudRecordings,
    error: errorCloudRecordings,
  } = useQuery<RecordingSession[]>({
    queryKey: ['recordings', 'cloud', userProfile.userId],
    queryFn: async () => {
      return await recordingService.getRecordings(userProfile);
    },
    staleTime: 1000 * 60 * 2,
  });

  // 4. Mengambil data Recordings (Local/Offline)
  const {
    data: localRecordings = [],
    isLoading: isLoadingLocalRecordings,
    refetch: refetchLocalRecordings,
  } = useQuery<any[]>({
    queryKey: ['recordings', 'local', userProfile.userId],
    queryFn: async () => {
      return await getLocalRecordings();
    },
    // Karena ini IndexedDB (sangat cepat), kita bisa refetch lebih sering jika diperlukan
    staleTime: 0,
  });

  // 5. Membuat userNamesMap
  const userNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach(u => { map[u.userId] = u.userName; });
    map[userProfile.userId] = userProfile.userName;
    return map;
  }, [users, userProfile]);

  // 6. Menggabungkan Cloud dan Local menjadi ViewModel
  const mergedRecordings = useMemo<RecordingSessionViewModel[]>(() => {
    const merged: RecordingSessionViewModel[] = [];

    // Add Cloud recordings
    cloudRecordings.forEach((c) => {
      const agentId = c.agentSnapshot?.agentId || (c as any).agentId;
      if (isAgent && agentId !== userProfile.userId) {
        return;
      }
      const scenarioId = c.scenarioSnapshot?.scenarioId || (c as any).businessScenarioId;
      const trainerId = c.agentSnapshot?.assignedTrainerId || (c as any).assignedTrainer;

      merged.push({
        id: c.id,
        title: `Latihan - Skenario Svara (Cloud)`,
        scenarioId: scenarioId,
        scenarioTitle: c.scenarioSnapshot?.scenarioTitle || scenarios.find(s => s.scenarioId === scenarioId)?.title || 'Guided Practice',
        scenarioCategory: scenarios.find(s => s.scenarioId === scenarioId)?.category || 'sales',
        agentId: agentId,
        agentName: c.agentSnapshot?.agentName || userNamesMap?.[agentId] || agentId,
        trainerId: trainerId,
        trainerName: c.agentSnapshot?.assignedTrainerName || userNamesMap?.[trainerId] || trainerId,
        duration: c.audioMetaData?.durationSeconds || 0,
        createdAt: c.startedAt,
        cloudAudioUrl: c.audioUrl || undefined,
        hasLocal: false,
        hasCloud: true,
        isUploaded: true,
        notes: c.notes || (c as any).notes
      });
    });

    // Merge in Local recordings
    localRecordings.forEach((l) => {
      const agentId = l.agentSnapshot?.agentId || (l as any).agentId;
      if (isAgent && agentId && agentId !== userProfile.userId) {
        return;
      }
      const existing = merged.find(m => m.id === l.id);
      if (existing) {
        existing.hasLocal = true;
        if (l.audioUrl) {
          existing.cloudAudioUrl = l.audioUrl;
          existing.hasCloud = true;
        }
      } else {
        const scenarioId = l.scenarioSnapshot?.scenarioId || (l as any).businessScenarioId || 'free_practice_sales';
        const trainerId = l.agentSnapshot?.assignedTrainerId || (l as any).assignedTrainer;

        merged.push({
          id: l.id,
          title: l.title || `Latihan - Svara (Lokal)`,
          scenarioId: scenarioId,
          scenarioTitle: l.scenarioSnapshot?.scenarioTitle || scenarios.find(s => s.scenarioId === scenarioId)?.title || 'Guided Practice',
          scenarioCategory: scenarios.find(s => s.scenarioId === scenarioId)?.category || 'sales',
          agentId: agentId,
          agentName: l.agentSnapshot?.agentName || userNamesMap?.[agentId] || agentId || 'Belum Ditugaskan',
          trainerId: trainerId,
          trainerName: l.agentSnapshot?.assignedTrainerName || userNamesMap?.[trainerId] || trainerId || 'Self Review',
          duration: l.audioMetaData?.durationSeconds || l.duration || 12,
          createdAt: l.startedAt || l.endedAt || l.createdAt,
          cloudAudioUrl: l.audioUrl || undefined,
          hasLocal: true,
          hasCloud: !!l.audioUrl,
          isUploaded: !!l.audioUrl,
          notes: l.notes
        });
      }
    });

    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [cloudRecordings, localRecordings, scenarios, userNamesMap, isAgent, userProfile.userId]);

  return {
    users,
    isLoadingUsers,
    errorUsers: errorUsers as Error | null,
    
    scenarios,
    isLoadingScenarios,
    errorScenarios: errorScenarios as Error | null,
    
    recordings: mergedRecordings, // Expose the ViewModel instead of raw cloud recordings
    isLoadingRecordings: isLoadingCloudRecordings || isLoadingLocalRecordings,
    errorRecordings: errorCloudRecordings as Error | null,

    // Kombinasi status loading agar UI bisa menampilkan spinner universal
    isDashboardLoading: isLoadingUsers || isLoadingScenarios || isLoadingCloudRecordings || isLoadingLocalRecordings,
    
    refetchLocalRecordings
  };
}
