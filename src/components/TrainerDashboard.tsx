import React, { useState, useEffect } from 'react';
import { UserProfile, BusinessScenario, RecordingSession } from '../types/index';
import { showToast } from '../utils';
import { useServices } from '../services/ServiceContext';
import RecordingSessionDetail from './RecordingSessionDetail';
import ScenarioViewer from './ScenarioViewer';
import { 
  Award, Users, Plus, PlayCircle, Star, MessageSquare, Check, RefreshCw, 
  HelpCircle, ChevronRight, FileText, ArrowRight, Video, ListCollapse, Eye, Shield, Link2, AlertTriangle, UserCheck
} from 'lucide-react';

interface TrainerDashboardProps {
  userProfile: UserProfile;
  scenarios: BusinessScenario[];
  recordings: RecordingSession[];
  onTriggerScenarioBuilder: () => void;
  onTriggerSimulator: (scenario: BusinessScenario, preselectedAgentId?: string) => void;
  onTriggerScenarioDetail: (scenario: BusinessScenario) => void;
  userNamesMap?: Record<string, string>;
}

export default function TrainerDashboard({ 
  userProfile, 
  scenarios, 
  recordings, 
  onTriggerScenarioBuilder, 
  onTriggerSimulator,
  onTriggerScenarioDetail,
  userNamesMap
}: TrainerDashboardProps) {
  const { userService, scenarioService, recordingService } = useServices();

  const [assignedAgents, setAssignedAgents] = useState<UserProfile[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [errorAgents, setErrorAgents] = useState<string | null>(null);
  
  // Group recordings slide-down state
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [selectedRecordForDrilldown, setSelectedRecordForDrilldown] = useState<any | null>(null);

  // Tabs: 'agents' | 'scenarios' | 'recordings'
  const [activeTab, setActiveTab] = useState<'agents' | 'scenarios' | 'recordings'>('agents');

  // Filter scenarios authorized for this Trainer
  const availableScenarios = scenarios.filter(sc => 
    userProfile.role === 'superadmin' ||
    sc.createdBy === userProfile.userId || 
    (sc.allowedTrainers && sc.allowedTrainers.includes(userProfile.userId))
  );

  // Agent self-training permission controller states
  const [managingAccessScenario, setManagingAccessScenario] = useState<BusinessScenario | null>(null);
  const [allowedAgentsState, setAllowedAgentsState] = useState<string[]>([]);
  const [updatingDb, setUpdatingDb] = useState(false);

  // Unregistered / temporary recording linker states
  const [linkingRecording, setLinkingRecording] = useState<RecordingSession | null>(null);
  const [selectedMappingAgentId, setSelectedMappingAgentId] = useState('');

  useEffect(() => {
    fetchMyAgents();
  }, []);

  const fetchMyAgents = async () => {
    setLoadingAgents(true);
    setErrorAgents(null);

    try {
      const list = await userService.getTrainerAgents(userProfile.userId, userProfile.role === 'superadmin');
      setAssignedAgents(list);
      setLoadingAgents(false);
    } catch (err: any) {
      console.error("Failed to load supervisor's assigned agents: ", err);
      setErrorAgents("Gagal memuat agen bimbingan Anda: " + err.message);
      setLoadingAgents(false);
    }
  };

  // Filter recordings related to this trainer or their agents, or all if superadmin
  const myRecordings = recordings.filter(r => {
    if (userProfile.role === 'superadmin') return true;
    const trainerId = r.agentSnapshot?.assignedTrainerId || (r as any).assignedTrainer;
    const rAgentId = r.agentSnapshot?.agentId || (r as any).agentId;
    return trainerId === userProfile.userId || assignedAgents.some(a => a.userId === rAgentId);
  });

  const handleSaveAgentPermissions = async () => {
    if (!managingAccessScenario) return;
    setUpdatingDb(true);
    try {
      await scenarioService.updateScenario(managingAccessScenario.scenarioId, {
        allowedAgents: allowedAgentsState
      });
      showToast(`Hak akses mandiri agen berhasil disimpan untuk skenario "${managingAccessScenario.title}"!`, 'success');
      setManagingAccessScenario(null);
    } catch (err: any) {
      console.error("Error updating agent scenario permissions:", err);
      showToast("Gagal memperbarui hak akses: " + err.message, 'error');
    } finally {
      setUpdatingDb(false);
    }
  };

  const handleSaveLinkingRecording = async () => {
    if (!linkingRecording) return;
    const targetAgent = assignedAgents.find(a => a.userId === selectedMappingAgentId);
    if (!targetAgent) {
      showToast("Silakan pilih agen bimbingan Anda!", 'error');
      return;
    }
    setUpdatingDb(true);
    try {
      await recordingService.updateRecording(linkingRecording.id, {
        agentSnapshot: {
          agentId: targetAgent.userId,
          agentName: targetAgent.userName,
          assignedTrainerId: userProfile.userId,
          assignedTrainerName: userProfile.userName
        }
      } as any);
      showToast(`Rekaman bimbingan berhasil dikaitkan ke akun agen ${targetAgent.userName}!`, 'success');
      setLinkingRecording(null);
    } catch (err: any) {
      console.error("Error linking recording:", err);
      showToast("Gagal mengaitkan rekaman: " + err.message, 'error');
    } finally {
      setUpdatingDb(false);
    }
  };

  return (
    <div className="space-y-6" id="trainer-dashboard">
      
      {/* Banner info */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-white/10 rounded-md font-mono text-[9px] uppercase tracking-wider font-extrabold text-blue-100">Professional Account</span>
            <span className="text-[11px] text-indigo-200 font-bold uppercase tracking-widest">• Trainer Workspace</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display leading-tight">Halo, Trainer {userProfile.userName}!</h2>
          <p className="text-indigo-100/90 text-sm max-w-xl leading-relaxed">
            Svara dirancang untuk mempermudah Anda melatih keterampilan percakapan telesales & verifikasi agen bimbingan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 self-start md:self-center">
          <button
            onClick={onTriggerScenarioBuilder}
            className="py-2.5 px-5 bg-white text-indigo-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm hover:translate-y-[-1px] cursor-pointer"
            id="trainer-create-scenario"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Script Skenario</span>
          </button>
          <button
            onClick={() => {
              if (availableScenarios.length > 0) {
                onTriggerSimulator(availableScenarios[0]);
              } else {
                showToast("Belum ada skenario yang tersedia untuk pelatihan!", "info");
              }
            }}
            className="py-2.5 px-5 bg-indigo-600 border border-indigo-500 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 hover:translate-y-[-1px] cursor-pointer"
            id="trainer-new-session"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Sesi Latihan Baru</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tab Headers */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'agents' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Agen Pembimbing Saya ({assignedAgents.length})
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'scenarios' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Scenario Tersedia ({scenarios.length})
            </button>
            <button
              onClick={() => setActiveTab('recordings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'recordings' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Hasil Latihan Percakapan ({myRecordings.length})
            </button>
          </div>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase bg-white px-3 py-1.5 border border-slate-200/80 rounded-full">
            Status: AKTIF
          </span>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          
          {/* 1. AGENTS TAB */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div className="text-left border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 font-display">Pantau Perkembangan Agen Bimbingan</h3>
                <p className="text-xs text-slate-400">Pilih salah satu agen untuk melakukan drilldown riwayat latihan percakapan serta memberikan penilaian audio.</p>
              </div>

              {loadingAgents ? (
                <div className="py-12 text-center text-slate-400 font-medium">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-650" />
                  <span>Mengkoneksikan agen bimbingan...</span>
                </div>
              ) : errorAgents ? (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-750 text-xs rounded-xl text-left flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>{errorAgents}</span>
                </div>
              ) : assignedAgents.length === 0 ? (
                <div className="bg-slate-50 border border-slate-150/70 p-8 rounded-2xl text-center space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase">CARA PENDAFTARAN</span>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Bagikan ID Trainer unik Anda ke Agen saat mereka pertama kali melakukan pendaftaran. ID Anda:
                  </p>
                  <code className="block bg-slate-100 hover:bg-slate-200 p-2 text-indigo-750 font-mono text-xs max-w-xs mx-auto rounded-xl font-bold border border-slate-200 select-all">
                    {userProfile.userId}
                  </code>
                  <p className="text-[10px] text-slate-400 italic">
                    Ajukan nama Anda ({userProfile.userName}) sebagai trainer saat Agen bimbingan Anda melakukan pendaftaran akun pertama mereka.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedAgents.map((agent) => {
                    const agentRoleplays = recordings.filter(r => (r.agentSnapshot?.agentId || (r as any).agentId) === agent.userId);
                    const isExpanded = expandedAgentId === agent.userId;

                    return (
                      <div 
                        key={agent.userId} 
                        className={`bg-white border hover:shadow-md transition-all rounded-2xl p-5 cursor-pointer ${
                          isExpanded ? 'border-brand-500 ring-1 ring-brand-100 shadow-sm' : 'border-slate-150 hover:border-slate-300'
                        }`}
                        onClick={() => setExpandedAgentId(isExpanded ? null : agent.userId)}
                      >
                        <div className="flex items-center gap-3.5 text-left">
                          <div className="h-10 w-10 bg-indigo-50 border border-indigo-150 text-indigo-700 font-extrabold flex items-center justify-center rounded-xl text-sm font-display shadow-xs">
                            {agent.userName.charAt(0)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <span className="font-extrabold text-slate-900 block font-display text-sm md:text-base leading-tight truncate">{agent.userName}</span>
                            <span className="text-[10px] text-slate-400 font-mono block select-all truncate">{agent.email}</span>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 text-xs text-left grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Aktivitas Latihan</span>
                            <span className="font-semibold text-slate-700 mt-0.5 block">{agentRoleplays.length} kali diselesaikan</span>
                          </div>
                          <div className="text-right self-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (availableScenarios.length > 0) {
                                  onTriggerSimulator(availableScenarios[0], agent.userId);
                                } else {
                                  showToast("Buat naskah skenario telesales/verifikasi terlebih dahulu!", "info");
                                }
                              }}
                              className="px-2.5 py-1.5 bg-indigo-55/65 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                              id={`train-agent-${agent.userId}`}
                            >
                              Sesi Latihan Bareng
                            </button>
                          </div>
                        </div>

                        {/* Collapsible recordings list for clicked agent */}
                        {isExpanded && (
                          <div 
                            className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-left"
                            onClick={(e) => e.stopPropagation()} 
                          >
                            <h5 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Rekaman Hasil Latihan Agen:</h5>
                            {agentRoleplays.length === 0 ? (
                              <p className="text-[11px] text-slate-450 italic py-2">Belum ada sesi latihan dari agen ini yang terekam.</p>
                            ) : (
                              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                {agentRoleplays.map((rec) => {
                                  const scenId = rec.scenarioSnapshot?.scenarioId || (rec as any).businessScenarioId;
                                  const scenario = scenarios.find(s => s.scenarioId === scenId);
                                  const recTitle = rec.scenarioSnapshot?.scenarioTitle || scenario?.title || 'Custom Skenario';
                                  const recTime = rec.audioMetaData?.createdAt || rec.startedAt || new Date().toISOString();
                                  const recSec = rec.audioMetaData?.durationSeconds || 0;

                                  return (
                                    <div 
                                      key={rec.id}
                                      onClick={() => setSelectedRecordForDrilldown(rec)}
                                      className="p-2.5 border border-slate-100 hover:border-brand-500 hover:bg-slate-50/50 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                                    >
                                      <div className="min-w-0 pr-2">
                                        <span className="font-extrabold text-[11px] text-slate-850 truncate block">{recTitle}</span>
                                        <span className="text-[9px] text-slate-400 font-mono">
                                          {new Date(recTime).toLocaleDateString()} • {recSec}detik
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-indigo-600 font-bold shrink-0 flex items-center gap-0.5 bg-indigo-50 px-2 py-1 rounded-md">
                                        Review <ChevronRight className="h-3 w-3" />
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. SCENARIOS TAB */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-800 font-display">Katalog Skenario Pelatihan</h3>
                  <p className="text-xs text-slate-400">Kelola kurikulum pengajaran telesales/verifikasi dan delegasikan akses agen mandiri.</p>
                </div>
              </div>
              <ScenarioViewer
                scenarios={scenarios}
                userRole={userProfile.role}
                userNamesMap={userNamesMap}
                onTriggerSimulator={onTriggerSimulator}
                onTriggerScenarioDetail={onTriggerScenarioDetail}
                onTriggerScenarioBuilder={onTriggerScenarioBuilder}
                onManageAccess={(sc) => {
                  setAllowedAgentsState(sc.allowedAgents || []);
                  setManagingAccessScenario(sc);
                }}
              />
            </div>
          )}

          {/* 3. RECORDINGS TAB */}
          {activeTab === 'recordings' && (
            <div className="space-y-4">
              <div className="text-left border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 font-display">Log Sesi Latihan & Rekaman Percakapan</h3>
                <p className="text-xs text-slate-400">Mendengarkan rekaman audio simulasi, meninjau kepatuhan mandatory, dan melihat penilaian transkrip dialog.</p>
              </div>

              {myRecordings.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <PlayCircle className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs">Belum ada rekaman sesi latihan percakapan telesales dari agen bimbingan Anda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto text-left">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                        <th className="pb-3 pl-4">Skenario Latihan</th>
                        <th className="pb-3">Nama Agen</th>
                        <th className="pb-3">Durasi</th>
                        <th className="pb-3 pr-4">Tanggal Latihan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                      {myRecordings.map((rec) => {
                        const scenId = rec.scenarioSnapshot?.scenarioId || (rec as any).businessScenarioId;
                        const scenario = scenarios.find(s => s.scenarioId === scenId);
                        const recTitle = rec.scenarioSnapshot?.scenarioTitle || scenario?.title || 'Custom Skenario';
                        const agentId = rec.agentSnapshot?.agentId || (rec as any).agentId;
                        const recAgentName = rec.agentSnapshot?.agentName || userNamesMap?.[agentId] || rec.recordedBy || 'Mantan Agen';
                        const recSecs = rec.audioMetaData?.durationSeconds || 0;
                        const recTime = rec.audioMetaData?.createdAt || rec.startedAt || new Date().toISOString();

                        return (
                          <tr 
                            key={rec.id} 
                            onClick={() => setSelectedRecordForDrilldown(rec)}
                            className="hover:bg-slate-50/40 cursor-pointer transition-colors group"
                          >
                            <td className="py-4 pl-4 font-bold text-gray-800 group-hover:text-brand-600">{recTitle}</td>
                            <td className="py-4 text-xs font-medium text-gray-650">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="font-extrabold text-slate-705">{recAgentName}</span>
                                {(!agentId || agentId === 'unregistered') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMappingAgentId(assignedAgents.length > 0 ? assignedAgents[0].userId : '');
                                      setLinkingRecording(rec);
                                    }}
                                    className="ml-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-150 rounded-lg text-[9px] font-extrabold flex items-center gap-1 cursor-pointer uppercase tracking-wider transition-colors"
                                    title="Kaitkan hasil latihan mandiri ini ke akun agen bimbingan Anda yang sah"
                                  >
                                    <Link2 className="h-2.5 w-2.5" />
                                    <span>Kaitkan Agen</span>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-4 font-mono text-xs font-bold text-slate-600">{recSecs}detik</td>
                            <td className="py-4 text-left pr-4 text-xs text-gray-400 font-semibold">{new Date(recTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 2. Modal Kelola Hak Akses Mandiri Agen */}
      {managingAccessScenario && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-xl rounded-3xl w-full max-w-sm overflow-hidden animate-fade-in text-left">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black font-display tracking-tight flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-indigo-200" />
                  <span>Akses Mandiri Agen</span>
                </h3>
                <p className="text-[10px] text-indigo-200 mt-0.5 font-bold line-clamp-1">Skenario: "{managingAccessScenario.title}"</p>
              </div>
              <button 
                type="button" 
                onClick={() => setManagingAccessScenario(null)}
                className="text-white hover:text-slate-100 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <span className="text-slate-400 font-bold block leading-relaxed uppercase tracking-wider text-[9px]">PILIH AGEN YANG DIIZINKAN LATIHAN INDEPENDEN:</span>
              
              {assignedAgents.length === 0 ? (
                <p className="text-[11px] text-slate-450 italic py-4 text-center">Menunggu pendaftaran profil agen bimbingan...</p>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {assignedAgents.map((agent) => {
                    const isChecked = allowedAgentsState.includes(agent.userId);
                    return (
                      <label key={agent.userId} className="flex items-center gap-2.5 p-2 bg-white/40 hover:bg-white border hover:border-slate-150 rounded-lg cursor-pointer transition-all text-slate-700 text-xs font-bold">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setAllowedAgentsState(allowedAgentsState.filter(id => id !== agent.userId));
                            } else {
                              setAllowedAgentsState([...allowedAgentsState, agent.userId]);
                            }
                          }}
                          className="rounded text-brand-600 focus:ring-brand-500 cursor-pointer h-4 w-4"
                        />
                        <div>
                          <span className="font-extrabold text-slate-800 block text-xs leading-none">{agent.userName}</span>
                          <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{agent.email}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManagingAccessScenario(null)}
                  className="px-4 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-bold cursor-pointer text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveAgentPermissions}
                  disabled={updatingDb || assignedAgents.length === 0}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold font-display shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {updatingDb ? 'Menyimpan...' : 'Simpan Akses'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Link Hasil Rekaman Mandiri Ke Agen */}
      {linkingRecording && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-xl rounded-3xl w-full max-w-sm overflow-hidden animate-fade-in text-left">
            <div className="bg-gradient-to-r from-orange-650 to-orange-750 bg-brand-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black font-display tracking-tight flex items-center gap-2">
                  <Link2 className="h-4.5 w-4.5 text-white" />
                  <span>Kaitkan Hasil Latihan</span>
                </h3>
                <p className="text-[10px] text-indigo-100 mt-0.5">Sesi: ID {linkingRecording.id.substring(0, 8)}...</p>
              </div>
              <button 
                type="button" 
                onClick={() => setLinkingRecording(null)}
                className="text-white hover:text-slate-100 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold">
              <p className="text-slate-405 leading-relaxed">
                Silakan pilih agen bimbingan Anda yang sah untuk menerima riwayat rekaman latihan ini. Skenario: <strong className="text-slate-800">
                  {scenarios.find(s => s.scenarioId === linkingRecording.businessScenarioId)?.title || 'Latihan Telesales'}
                </strong>.
              </p>
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Agen yang Sah</label>
                <select
                  value={selectedMappingAgentId}
                  onChange={(e) => setSelectedMappingAgentId(e.target.value)}
                  className="w-full p-2.5 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold leading-normal focus:outline-indigo-500"
                >
                  <option value="">-- Pilih Agen Pembimbing --</option>
                  {assignedAgents.map((a) => (
                    <option key={a.userId} value={a.userId}>{a.userName} ({a.email})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLinkingRecording(null)}
                  className="px-4 py-1.5 border border-slate-250 bg-slate-50 hover:bg-slate-10 rounded-xl font-bold cursor-pointer text-slate-650"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveLinkingRecording}
                  disabled={updatingDb || !selectedMappingAgentId}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold font-display shadow-sm cursor-pointer disabled:opacity-40"
                >
                  {updatingDb ? 'Mengaitkan...' : 'Konfirmasi Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recording Session Detail Sub-Component */}
      {selectedRecordForDrilldown && (
        <RecordingSessionDetail 
          recording={{
            id: selectedRecordForDrilldown.id,
            title: `Latihan - Skenario Svara`,
            scenarioId: selectedRecordForDrilldown.scenarioSnapshot?.scenarioId || (selectedRecordForDrilldown as any).businessScenarioId,
            scenarioTitle: selectedRecordForDrilldown.scenarioSnapshot?.scenarioTitle || scenarios.find(s => s.scenarioId === (selectedRecordForDrilldown.scenarioSnapshot?.scenarioId || (selectedRecordForDrilldown as any).businessScenarioId))?.title || 'Guided Practice',
            scenarioCategory: scenarios.find(s => s.scenarioId === (selectedRecordForDrilldown.scenarioSnapshot?.scenarioId || (selectedRecordForDrilldown as any).businessScenarioId))?.category || 'sales',
            agentId: selectedRecordForDrilldown.agentSnapshot?.agentId || (selectedRecordForDrilldown as any).agentId,
            agentName: selectedRecordForDrilldown.agentSnapshot?.agentName || userNamesMap?.[selectedRecordForDrilldown.agentSnapshot?.agentId || ''] || 'Agen',
            trainerId: selectedRecordForDrilldown.agentSnapshot?.assignedTrainerId || (selectedRecordForDrilldown as any).assignedTrainer,
            trainerName: selectedRecordForDrilldown.agentSnapshot?.assignedTrainerName || userNamesMap?.[selectedRecordForDrilldown.agentSnapshot?.assignedTrainerId || ''] || 'Self Review',
            duration: selectedRecordForDrilldown.audioMetaData?.durationSeconds || 0,
            createdAt: selectedRecordForDrilldown.startedAt,
            cloudAudioUrl: selectedRecordForDrilldown.audioUrl,
            hasLocal: false,
            hasCloud: !!selectedRecordForDrilldown.audioUrl,
            isUploaded: !!selectedRecordForDrilldown.audioUrl,
            notes: (selectedRecordForDrilldown as any).notes
          }}
          onClose={() => setSelectedRecordForDrilldown(null)} 
          userNamesMap={userNamesMap}
          scenarios={scenarios}
        />
      )}

    </div>
  );
}
