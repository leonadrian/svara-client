import React, { useState, useEffect } from 'react';
import { UserProfile, BusinessScenario, RecordingSession } from '../types/index';
import { getLocalRecordings } from '../localDb';
import { useServices } from '../services/ServiceContext';
import RecordingSessionDetail from './RecordingSessionDetail';
import ScenarioViewer from './ScenarioViewer';
import { 
  Users, PlayCircle, Clock, Check, AlertCircle, 
  BookOpen, ChevronRight, MessageSquare, Flame, Eye, HardDrive, Cloud, Play, Pause
} from 'lucide-react';

interface AgentDashboardProps {
  userProfile: UserProfile;
  scenarios: BusinessScenario[];
  recordings: RecordingSession[];
  onTriggerSimulator: (scenario: BusinessScenario) => void;
  onTriggerScenarioDetail: (scenario: BusinessScenario) => void;
  userNamesMap?: Record<string, string>;
}

export default function AgentDashboard({ 
  userProfile, 
  scenarios, 
  recordings, 
  onTriggerSimulator,
  onTriggerScenarioDetail,
  userNamesMap
}: AgentDashboardProps) {
  const { userService } = useServices();

  const [myTrainer, setMyTrainer] = useState<UserProfile | null>(null);
  const [loadingTrainer, setLoadingTrainer] = useState(false);
  const [localRecordings, setLocalRecordings] = useState<any[]>([]);
  const [selectedRecordForDrilldown, setSelectedRecordForDrilldown] = useState<any | null>(null);

  const assignedTrainerId = (userProfile as any).assignedTrainer;

  // Load Trainer profile if assigned
  useEffect(() => {
    if (assignedTrainerId) {
      fetchTrainerProfile();
    }
  }, [assignedTrainerId]);

  // Load local recordings on mount & whenever cloud recordings change
  useEffect(() => {
    loadLocalRecordings();
  }, [recordings]);

  const loadLocalRecordings = async () => {
    try {
      const dbRecords = await getLocalRecordings();
      // Only read records matching the current logged-in agent ID
      const filtered = dbRecords.filter(r => (r.agentSnapshot?.agentId || (r as any).agentId) === userProfile.userId);
      setLocalRecordings(filtered);
    } catch (err) {
      console.warn("Could not load local IndexedDB recordings inside AgentDashboard:", err);
    }
  };

  const fetchTrainerProfile = async () => {
    setLoadingTrainer(true);
    try {
      const trainer = await userService.getUser(assignedTrainerId!);
      if (trainer) {
        setMyTrainer(trainer);
      }
    } catch (err) {
      console.warn("Failed to fetch trainer info:", err);
    } finally {
      setLoadingTrainer(false);
    }
  };

  // Filter recordings belonging to this agent (Cloud)
  const myRecordings = recordings.filter(r => (r.agentSnapshot?.agentId || (r as any).agentId) === userProfile.userId);

  // Filter scenarios where this agent has been granted self-training access
  const allowedScenarios = scenarios.filter(sc => 
    sc.allowedAgents && sc.allowedAgents.includes(userProfile.userId)
  );

  // Merged local & cloud recordings helper
  const getMergedRecordings = () => {
    const merged: any[] = [];

    // Add Cloud recordings
    myRecordings.forEach((c) => {
      const scenId = c.scenarioSnapshot?.scenarioId || (c as any).businessScenarioId;
      const trainerId = c.agentSnapshot?.assignedTrainerId || (c as any).assignedTrainer;
      merged.push({
        id: c.id,
        title: `Latihan - Skenario Svara (Cloud)`,
        scenarioId: scenId,
        scenarioTitle: c.scenarioSnapshot?.scenarioTitle || scenarios.find(s => s.scenarioId === scenId)?.title || 'Guided Practice',
        scenarioCategory: scenarios.find(s => s.scenarioId === scenId)?.category || 'sales',
        agentId: c.agentSnapshot?.agentId || (c as any).agentId,
        agentName: c.agentSnapshot?.agentName || userProfile.userName,
        trainerId: trainerId,
        trainerName: c.agentSnapshot?.assignedTrainerName || userNamesMap?.[trainerId] || trainerId,
        duration: c.audioMetaData.durationSeconds,
        createdAt: c.startedAt,
        cloudAudioUrl: c.audioUrl,
        hasLocal: false,
        hasCloud: true,
        isUploaded: true,
        notes: (c as any).notes || ''
      });
    });

    // Merge Local recordings
    localRecordings.forEach((l) => {
      const existing = merged.find(m => m.id === l.id);
      if (existing) {
        existing.hasLocal = true;
        if (l.audioUrl) {
          existing.cloudAudioUrl = l.audioUrl;
          existing.hasCloud = true;
        }
      } else {
        const scenId = l.scenarioSnapshot?.scenarioId || (l as any).businessScenarioId;
        const trainerId = l.agentSnapshot?.assignedTrainerId || (l as any).assignedTrainer;
        merged.push({
          id: l.id,
          title: `Latihan - Skenario Svara (Lokal)`,
          scenarioId: scenId,
          scenarioTitle: l.scenarioSnapshot?.scenarioTitle || scenarios.find(s => s.scenarioId === scenId)?.title || 'Guided Practice',
          scenarioCategory: scenarios.find(s => s.scenarioId === scenId)?.category || 'sales',
          agentId: l.agentSnapshot?.agentId || (l as any).agentId,
          agentName: l.agentSnapshot?.agentName || userProfile.userName,
          trainerId: trainerId,
          trainerName: l.agentSnapshot?.assignedTrainerName || userNamesMap?.[trainerId] || trainerId,
          duration: l.audioMetaData?.durationSeconds || 12,
          createdAt: l.startedAt || l.endedAt,
          cloudAudioUrl: l.audioUrl || undefined,
          hasLocal: true,
          hasCloud: !!l.audioUrl,
          isUploaded: !!l.audioUrl,
          notes: l.notes || ''
        });
      }
    });

    // Sort newer first
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const records = getMergedRecordings();
  const totalCompleted = records.length;

  return (
    <div className="space-y-6" id="agent-dashboard">
      
      {/* Visual profile banner card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white p-8 rounded-3xl shadow-md border border-emerald-500/15">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-white/15 rounded-md font-mono text-[9px] uppercase tracking-wider font-extrabold text-teal-100">Active Agent</span>
              <span className="text-[11px] text-emerald-100 font-bold uppercase tracking-widest">• Svara Training Center</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display leading-tight flex items-center gap-2">
              Semangat Latihan, {userProfile.userName}!
            </h2>
            
            <div className="pt-2 text-xs text-emerald-100/95 font-medium leading-relaxed">
              {myTrainer ? (
                <p>Supervisor Trainer Pembimbing: <strong className="text-white bg-white/10 px-2 py-0.5 rounded-md">{myTrainer.userName}</strong></p>
              ) : (
                <p className="text-emerald-200">Anda belum ditugaskan ke Trainer tertentu. Semua latihan Anda berjalan mandiri.</p>
              )}
            </div>

            {/* Direct Start Live Practice session bypass button */}
            {allowedScenarios.length > 0 ? (
              <button
                onClick={() => onTriggerSimulator(allowedScenarios[0])}
                className="mt-4 px-5 py-2.5 bg-white text-teal-800 hover:bg-slate-50 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer border border-white/5"
                id="agent-direct-start-session-header"
              >
                <PlayCircle className="h-4.5 w-4.5 text-teal-850 fill-current animate-pulse" />
                <span>Mulai Sesi Percakapan Baru</span>
              </button>
            ) : (
              <div className="mt-4 text-[11px] text-teal-100 font-bold bg-emerald-990/40 border border-emerald-500/20 px-4 py-2.5 rounded-xl inline-block max-w-sm">
                Hubungi Trainer/Manager Anda untuk menugaskan akses skenario latihan mandiri.
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/20 shadow-xs">
            <Flame className="h-6 w-6 text-amber-400 animate-pulse" />
            <div className="text-left">
              <span className="text-[9px] text-emerald-300 font-bold block uppercase tracking-wider">Latihan Hari Ini</span>
              <span className="text-lg font-extrabold font-mono text-white">{totalCompleted} Sesi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats display grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Katalog Skenario</span>
            <span className="text-xl font-bold text-slate-800 font-display">{allowedScenarios.length} Skenario Latihan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Latihan Diselesaikan</span>
            <span className="text-xl font-bold text-slate-855 font-display">{totalCompleted} Sesi Latihan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Rerata Durasi Sesi</span>
            <span className="text-xl font-bold text-slate-800 font-display">
              {records.length > 0 
                ? Math.round(records.reduce((sum, r) => sum + (r.duration || 0), 0) / records.length) 
                : 0} Detik
            </span>
          </div>
        </div>

      </div>

      {/* Main split work board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenario Training Panel (Left 2cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-755 uppercase tracking-wider mb-2 text-left">Pilih Skenario Mandiri</h3>
            <span className="text-xs text-slate-400 font-medium">Mainkan dialog ganda untuk latihan</span>
          </div>

          <ScenarioViewer
            scenarios={allowedScenarios}
            userRole={userProfile.role}
            userNamesMap={userNamesMap}
            onTriggerSimulator={onTriggerSimulator}
            onTriggerScenarioDetail={onTriggerScenarioDetail}
          />
        </div>

        {/* Feedback & Integrated Recording Log Panel (Right 1col) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider leading-none">Feedback & Riwayat Latihan</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Daftar rekaman langsung dari buffer lokal dan sinkronisasi Cloud.</p>
            </div>
            
            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-slate-400 py-16 space-y-1.5">
                <SmileIcon className="h-9 w-9 text-slate-305 mb-1 animate-bounce" />
                <h5 className="text-xs font-bold text-slate-700">Riwayat Latihan Kosong</h5>
                <p className="text-[11px] leading-relaxed max-w-[200px]">Lakukan latihan mandiri pertama Anda sekarang untuk mencatat log audio!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
                {records.map((rec) => (
                  <div 
                    key={rec.id} 
                    onClick={() => setSelectedRecordForDrilldown(rec)}
                    className="bg-white p-3 border border-slate-150 hover:border-slate-350 hover:shadow-sm rounded-2xl transition-all cursor-pointer text-left space-y-2 animate-fade-in group"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 font-mono">
                        {new Date(rec.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                      </span>
                      
                      {/* Modern synchronization badges */}
                      <div className="flex items-center gap-1">
                        {rec.hasCloud ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-150/40">
                            <Cloud className="h-2 w-2" />
                            <span>Cloud</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-150/45">
                            <HardDrive className="h-2 w-2" />
                            <span>Lokal</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-extrabold text-slate-880 text-xs truncate group-hover:text-teal-700 group-hover:underline">
                        {rec.title}
                      </h5>
                      <div className="text-[10px] text-slate-500 font-medium font-sans flex items-center justify-between mt-0.5">
                        <span>Target: {rec.scenarioTitle}</span>
                        <span className="font-mono text-slate-400">{rec.duration}s</span>
                      </div>
                    </div>

                    {rec.notes && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic bg-slate-50 p-2 border border-slate-100 rounded-lg">
                        "{rec.notes}"
                      </p>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[9px] font-semibold text-slate-400 border-t border-slate-100/50">
                      <span>Reviewer: {rec.trainerName || 'Sistem Mandiri'}</span>
                      <span className="text-[9px] text-teal-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Lihat Drilldown <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-200 pt-3 mt-4 text-[10px] text-slate-400 leading-normal">
            Sebab penyimpanan IndexedDB terlacak offline, Anda dapat memutar audio kapan saja walau koneksi terputus. Klik baris rekaman untuk membuka dialog detail latihan.
          </div>
        </div>

      </div>

      {/* Drill-down side drawer modal */}
      {selectedRecordForDrilldown && (
        <RecordingSessionDetail 
          recording={selectedRecordForDrilldown} 
          scenarios={scenarios} 
          onClose={() => setSelectedRecordForDrilldown(null)} 
          userNamesMap={userNamesMap}
        />
      )}

    </div>
  );
}

function SmileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}
export { SmileIcon };
