import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, BusinessScenario, RecordingSession, UserRole } from '../types/index';
import { useServices } from '../services/ServiceContext';
import RecordingSessionDetail from './RecordingSessionDetail';
import ScenarioViewer from './ScenarioViewer';
import { 
  Shield, Users, Award, FileText, PlayCircle, Plus, CheckCircle, 
  Trash, Edit2, Link2, Download, AlertCircle, RefreshCw, Play, Pause, Eye, BookOpen
} from 'lucide-react';

interface ManagerDashboardProps {
  userProfile: UserProfile;
  scenarios: BusinessScenario[];
  recordings: RecordingSession[];
  onTriggerScenarioBuilder: () => void;
  onTriggerSimulator: (scenario: BusinessScenario) => void;
  onTriggerScenarioDetail: (scenario: BusinessScenario) => void;
  userNamesMap?: Record<string, string>;
}

export default function ManagerDashboard({ 
  userProfile, 
  scenarios, 
  recordings, 
  onTriggerScenarioBuilder, 
  onTriggerSimulator,
  onTriggerScenarioDetail,
  userNamesMap
}: ManagerDashboardProps) {
  const { userService } = useServices();
  
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  // Filter & Toggle controls
  const [activeTab, setActiveTab] = useState<'agents' | 'trainers' | 'approvals' | 'scenarios' | 'recordings'>('agents');
  const [editingTrainerId, setEditingTrainerId] = useState<{ [agentId: string]: boolean }>({});
  const [selectedRecording, setSelectedRecording] = useState<RecordingSession | null>(null);
  const [selectedRecordForDrilldown, setSelectedRecordForDrilldown] = useState<RecordingSession | null>(null);
  const [scenariosList, setScenariosList] = useState<BusinessScenario[]>(scenarios);

  // Sync scenarios prop to local list
  useEffect(() => {
    setScenariosList(scenarios);
  }, [scenarios]);

  // Load user profiles
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);

    try {
      const list = await userService.getUsers();
      setProfiles(list);
      setLoadingUsers(false);
    } catch (err: any) {
      console.error("Failed to load user directory inside manager console: ", err);
      setErrorUsers("Gagal memuat daftar pengguna Svara: " + err.message);
      setLoadingUsers(false);
    }
  };

  const reassignAgentTrainer = async (agentId: string, trainerId: string) => {
    try {
      await userService.updateUser(agentId, { 
        assignedTrainer: trainerId || null,
        updatedAt: new Date().toISOString()
      } as any);
      setProfiles(profiles.map(p => p.userId === agentId ? { ...p, assignedTrainer: trainerId || null } : p));
      setEditingTrainerId({ ...editingTrainerId, [agentId]: false });
    } catch (err: any) {
      console.error("Failed to reassign agent to trainer:", err);
      setErrorUsers("Gagal mengassign agen ke trainer: " + err.message);
    }
  };

  const approvedProfiles = profiles.filter(p => p.role !== 'onboarding');
  const pendingProfiles = profiles.filter(p => p.role === 'onboarding');
  const trainersOnly = approvedProfiles.filter(p => p.role === 'trainer' || p.role === 'superadmin');
  const agentsOnly = approvedProfiles.filter(p => p.role === 'agent');
  const managersOnly = approvedProfiles.filter(p => p.role === 'manager');

  // Statistics calculation
  const totalCompletedRoleplays = recordings.length;

  return (
    <div className="space-y-6" id="manager-dashboard">
      
      {/* Dynamic Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Agen Aktif</span>
            <span className="text-2xl font-black text-slate-900 font-display">{agentsOnly.length} Agen</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Trainer Terdaftar</span>
            <span className="text-2xl font-black text-slate-900 font-display">{trainersOnly.length} Trainer</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <PlayCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Latihan Tersimpan</span>
            <span className="text-2xl font-black text-slate-900 font-display">{totalCompletedRoleplays} Sesi</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Skenario Aktif</span>
            <span className="text-2xl font-black text-slate-900 font-display">{scenariosList.length} Skenario</span>
          </div>
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
              Manajemen Agen
            </button>
            <button
              onClick={() => setActiveTab('trainers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'trainers' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Manajemen Trainer
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer relative flex items-center gap-2 ${
                activeTab === 'approvals' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span>Persetujuan Akun</span>
              {pendingProfiles.length > 0 && (
                <span className="bg-rose-600 text-[9px] font-black text-white leading-none px-1.5 py-0.5 rounded-full inline-flex items-center justify-center animate-bounce">
                  {pendingProfiles.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'scenarios' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Scenarios ({scenariosList.length})
            </button>
            <button
              onClick={() => setActiveTab('recordings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'recordings' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Hasil Rekaman Review
            </button>
          </div>

          <div>
            {activeTab === 'scenarios' && (
              <button
                onClick={onTriggerScenarioBuilder}
                className="py-1.5 px-3.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Scenario Baru</span>
              </button>
            )}
            
            {(activeTab === 'agents' || activeTab === 'trainers' || activeTab === 'approvals') && (
              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="p-1.5 px-3.5 bg-white text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`h-3 w-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Reload Directory</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {errorUsers && (
            <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>{errorUsers}</span>
            </div>
          )}

          {/* Tab 1: Agents */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Penugasan Agen ke Trainer (Agent Assignment Panel)</h3>
              
              {loadingUsers ? (
                <p className="text-center text-sm text-gray-400 py-6">Memuat data user directory...</p>
              ) : agentsOnly.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">Belum ada Agen yang mendaftar di sistem Svara.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                        <th className="pb-3">Nama Agen</th>
                        <th className="pb-3">Email Akun</th>
                        <th className="pb-3">Trainer Pembimbing Saat Ini</th>
                        <th className="pb-3 text-right">Aksi Penugasan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                      {agentsOnly.map((agent) => {
                        const assignedTrainer = trainersOnly.find(t => t.userId === agent.assignedTrainer);
                        const isEditing = editingTrainerId[agent.userId];

                        return (
                          <tr key={agent.userId} className="hover:bg-slate-50/40">
                            <td className="py-4 font-semibold text-gray-800">{agent.userName}</td>
                            <td className="py-4 font-mono text-xs text-gray-400">{agent.email}</td>
                            <td className="py-4">
                              {isEditing ? (
                                <select
                                  defaultValue={agent.assignedTrainer || ''}
                                  onChange={(e) => reassignAgentTrainer(agent.userId, e.target.value)}
                                  className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white font-medium"
                                >
                                  <option value="">-- Tanpa Trainer (Mandiri) --</option>
                                  {trainersOnly.map(t => (
                                    <option key={t.userId} value={t.userId}>{t.userName}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  assignedTrainer ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-500'
                                }}`}>
                                  {assignedTrainer ? `Trainer: ${assignedTrainer.userName}` : 'Belum Ditugaskan / Mandiri'}
                                </span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              {isEditing ? (
                                <button
                                  onClick={() => setEditingTrainerId({ ...editingTrainerId, [agent.userId]: false })}
                                  className="text-xs text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded px-2.5 py-1"
                                >
                                  Batal
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingTrainerId({ ...editingTrainerId, [agent.userId]: true })}
                                  className="text-xs text-brand-600 hover:text-brand-800 font-bold bg-brand-50 hover:bg-brand-100 rounded-lg px-3 py-1 cursor-pointer flex items-center gap-1.5 ml-auto"
                                >
                                  <Link2 className="h-3.5 w-3.5" />
                                  <span>Ganti Trainer</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Trainers */}
          {activeTab === 'trainers' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Daftar Trainer Svara Aktif ({trainersOnly.length})</h3>
              {loadingUsers ? (
                <p className="text-center text-sm text-gray-400 py-6">Memuat data user directory...</p>
              ) : trainersOnly.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">Belum ada Trainer yang bergabung dengan Svara.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainersOnly.map((t) => {
                    const supervisedAgents = agentsOnly.filter(a => a.assignedTrainer === t.userId);
                    return (
                      <div key={t.userId} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
                              <Award className="h-4 w-4" />
                            </span>
                            <h4 className="font-bold text-gray-800 font-display flex items-center gap-1.5 flex-wrap">
                              <span>{t.userName}</span>
                              {t.role === 'superadmin' && (
                                <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  Superadmin / Dual
                                </span>
                              )}
                            </h4>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono block mb-2">{t.email}</span>
                        </div>
                        <div className="border-t border-gray-50 pt-2.5">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Membimbing Agen:</span>
                          {supervisedAgents.length === 0 ? (
                            <span className="text-xs text-gray-400 italic">Belum ada agen dwi-pembimbing</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {supervisedAgents.map((a) => (
                                <span key={a.userId} className="text-[10px] bg-indigo-50 text-indigo-700 rounded-md font-bold px-2 py-0.5">
                                  {a.userName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Approvals */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Peninjauan & Persetujuan Akun Svara</h3>
                <p className="text-xs text-slate-500">Mencegah pendaftaran tidak sah. Di sini Anda dapat memvalidasi pengikut baru, mengalokasikan Peran (Manager, Trainer, atau Agent), dan langsung menetapkan partner mentor pembimbing.</p>
              </div>

              {pendingProfiles.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl border border-slate-205/65 p-10 text-center animate-fade-in">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">Antrean Bersih & Aman</h4>
                  <p className="text-slate-400 text-xs mt-1">Tidak ada pengajuan akun pending yang memerlukan aksi administrator saat ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingProfiles.map((p) => {
                    const assignmentOptions = [
                      ...trainersOnly.map(t => ({ id: t.userId, name: `${t.userName} (Trainer)`, role: 'trainer' })),
                      ...managersOnly.map(m => ({ id: m.userId, name: `${m.userName} (Manager - Dual Role)`, role: 'manager' }))
                    ];

                    return (
                      <PendingUserApprovalCard
                        key={p.userId}
                        profile={p}
                        assignmentOptions={assignmentOptions}
                        onApprove={async (role: UserRole, trainerId?: string) => {
                          try {
                            const now = new Date().toISOString();
                            await userService.updateUser(p.userId, {
                              role,
                              assignedTrainer: trainerId || null,
                              updatedAt: now
                            } as any);
                            // Sync changes locally too
                            setProfiles(prev => prev.map(item => item.userId === p.userId ? { 
                              ...item, 
                              role, 
                              assignedTrainer: trainerId || null, 
                              updatedAt: now 
                            } : item));
                          } catch (err: any) {
                            console.error("Failed to approve user:", err);
                            setErrorUsers("Gagal mengaktifkan akun: " + err.message);
                          }
                        }}
                        onDecline={async () => {
                          try {
                            await userService.deleteUser(p.userId);
                            setProfiles(prev => prev.filter(item => item.userId !== p.userId));
                          } catch (err: any) {
                            console.error("Failed to delete user doc on rejection:", err);
                            setErrorUsers("Gagal menolak akun: " + err.message);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Scenarios */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 gap-2">
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-800 font-display">Katalog Skenario Latihan Svara Bank</h3>
                  <p className="text-xs text-slate-400">Tinjau, uji coba, dan tambahkan skenario kurikulum dialog percakapan untuk agent.</p>
                </div>
              </div>
              <ScenarioViewer
                scenarios={scenariosList}
                userRole={userProfile.role}
                userNamesMap={userNamesMap}
                onTriggerSimulator={onTriggerSimulator}
                onTriggerScenarioDetail={onTriggerScenarioDetail}
                onTriggerScenarioBuilder={onTriggerScenarioBuilder}
              />
            </div>
          )}

          {/* Tab 4: Recordings review */}
          {activeTab === 'recordings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recordings List */}
              <div className="lg:col-span-2 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Riwayat Percakapan Roleplay Svara</h4>
                
                {recordings.length === 0 ? (
                  <p className="text-sm text-center text-gray-400 py-8">Belum ada riwayat rekaman tersimpan untuk direview.</p>
                ) : (
                  recordings.map((rec) => {
                    const scenId = rec.scenarioSnapshot?.scenarioId || (rec as any).businessScenarioId;
                    const mappedTitle = rec.scenarioSnapshot?.scenarioTitle || scenariosList.find(s => s.scenarioId === scenId)?.title || 'Latihan Mandiri';
                    const agentId = rec.agentSnapshot?.agentId || (rec as any).agentId;
                    const agentNameOutput = rec.agentSnapshot?.agentName || userNamesMap?.[agentId] || agentId || 'Agen';
                    const trainerId = rec.agentSnapshot?.assignedTrainerId || (rec as any).assignedTrainer;
                    const trainerNameOutput = rec.agentSnapshot?.assignedTrainerName || userNamesMap?.[trainerId] || trainerId || 'Self Review';
                    const hasTrainer = trainerId && trainerId !== 'self' && trainerId !== 'Self Review';
                    
                    return (
                      <div 
                        key={rec.id} 
                        onClick={() => {
                          setSelectedRecording(rec);
                          setSelectedRecordForDrilldown(rec);
                        }}
                        className="p-4 border border-slate-200 bg-white rounded-2xl cursor-pointer hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            hasTrainer ? 'bg-violet-100 text-violet-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {hasTrainer ? 'Bimbingan Trainer' : 'Latihan Mandiri'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{new Date(rec.startedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-1 mb-2">
                          <h4 className="font-bold text-gray-800 text-sm">{mappedTitle}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Agen: <strong className="text-gray-750 font-semibold">{agentNameOutput}</strong></span>
                            <span>Durasi: <strong className="text-gray-750 font-semibold">{rec.audioMetaData?.durationSeconds || 0}s</strong></span>
                          </div>
                        </div>

                        <div className="border-t border-gray-150 pt-2.5 mt-2 flex items-center justify-between text-[11px] text-gray-400">
                          <span>Pemberi Review: {trainerNameOutput}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-indigo-600 font-extrabold">Buka Tinjauan ➔</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Detail Player Panel */}
              <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                {selectedRecording ? (
                  <div className="space-y-4 text-left">
                    <div className="pb-3 border-b border-gray-200">
                      <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider block mb-1">Status Penilaian</span>
                      <h4 className="font-extrabold text-gray-800 font-display text-sm">
                        {selectedRecording.scenarioSnapshot?.scenarioTitle || scenariosList.find(s => s.scenarioId === (selectedRecording.scenarioSnapshot?.scenarioId || (selectedRecording as any).businessScenarioId))?.title || 'Latihan Spontan'}
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <div>
                        <span className="text-gray-400 block font-semibold text-[10px] uppercase">Agen Peserta</span>
                        <span className="font-bold text-gray-800">{selectedRecording.agentSnapshot?.agentName || userNamesMap?.[selectedRecording.agentSnapshot?.agentId || (selectedRecording as any).agentId] || (selectedRecording as any).agentId || 'Agen'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold text-[10px] uppercase">Reviewer / Trainer</span>
                        <span className="font-bold text-gray-800">{selectedRecording.agentSnapshot?.assignedTrainerName || userNamesMap?.[selectedRecording.agentSnapshot?.assignedTrainerId || (selectedRecording as any).assignedTrainer] || (selectedRecording as any).assignedTrainer || 'Evaluasi Mandiri'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold text-[10px] uppercase">Rekomendasi / Catatan</span>
                        <p className="bg-white p-3 border border-gray-200 rounded-xl leading-relaxed italic text-gray-650">
                          "{(selectedRecording as any).evaluationNotes || selectedRecording.notes || 'Belum ada catatan tertulis.'}"
                        </p>
                      </div>
                    </div>

                    {/* Interactive Voice Player */}
                    <div className="pt-2">
                      <AudioPlayerComponent url={selectedRecording.audioUrl} />
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-6">
                    <Shield className="h-8 w-8 text-gray-300 mb-2 animate-bounce" />
                    <p className="text-xs font-medium leading-relaxed">Pilih salah satu rekaman roleplay di sebelah kiri untuk meninjau rekaman audio & feedback kualitatif.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {selectedRecordForDrilldown && (
        <RecordingSessionDetail
          recording={{
            id: selectedRecordForDrilldown.id,
            title: `Latihan - Skenario Svara`,
            scenarioId: selectedRecordForDrilldown.scenarioSnapshot?.scenarioId || (selectedRecordForDrilldown as any).businessScenarioId,
            scenarioTitle: selectedRecordForDrilldown.scenarioSnapshot?.scenarioTitle || scenariosList.find(s => s.scenarioId === (selectedRecordForDrilldown.scenarioSnapshot?.scenarioId || (selectedRecordForDrilldown as any).businessScenarioId))?.title || 'Guided Practice',
            scenarioCategory: scenariosList.find(s => s.scenarioId === (selectedRecordForDrilldown.scenarioSnapshot?.scenarioId || (selectedRecordForDrilldown as any).businessScenarioId))?.category || 'sales',
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
            notes: (selectedRecordForDrilldown as any).evaluationNotes || selectedRecordForDrilldown.notes
          }}
          scenarios={scenariosList}
          onClose={() => setSelectedRecordForDrilldown(null)}
          userNamesMap={userNamesMap}
        />
      )}

    </div>
  );
}

// Simple Audio wrapper component safely handling browser playback errors
function AudioPlayerComponent({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current && url) {
      const audio = new Audio(url);
      audio.onended = () => setPlaying(false);
      audioRef.current = audio;
    }

    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
      }
    }
  };

  return (
    <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between">
      <button 
        onClick={toggle}
        className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl cursor-pointer"
        id="mgr-play-recording-btn"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex-1 pl-3 text-left">
        <span className="text-[10px] font-bold text-gray-400 block uppercase">Audio Player</span>
        <span className="text-xs font-mono text-gray-300 font-medium truncate w-32 block">Voice_Recording_File</span>
      </div>
      <a 
        href={url} 
        target="_blank" 
        rel="noreferrer"
        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

interface PendingUserApprovalCardProps {
  profile: UserProfile; 
  assignmentOptions: { id: string, name: string, role: string }[]; 
  onApprove: (role: UserRole, trainerId?: string) => Promise<void>;
  onDecline: () => Promise<void>;
  key?: React.Key;
}

function PendingUserApprovalCard({ 
  profile, 
  assignmentOptions, 
  onApprove, 
  onDecline 
}: PendingUserApprovalCardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('agent');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);

  useEffect(() => {
    if (assignmentOptions.length > 0) {
      setSelectedTrainerId(assignmentOptions[0].id);
    }
  }, [assignmentOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onApprove(selectedRole, selectedRole === 'agent' ? selectedTrainerId : undefined);
    setLoading(false);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 hover:shadow-sm transition-all flex flex-col md:flex-row gap-5 justify-between md:items-start animate-fade-in font-sans text-left">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
          <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold border border-amber-250/50 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Pengajuan Akun Baru
          </span>
        </div>
        <div>
          <h4 className="text-base font-black text-slate-900 font-display">{profile.userName}</h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5 select-all">{profile.email}</p>
        </div>
        <div className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 rounded-md px-2 py-1 inline-block">
          Terdaftar: {new Date(profile.createdAt).toLocaleString('id-ID')}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="md:w-96 bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Alokasikan Peran Utama:</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedRole('agent')}
              className={`py-2 rounded-lg border text-center transition-all font-bold ${
                selectedRole === 'agent' 
                  ? 'border-brand-500 bg-brand-600 text-white shadow-xs' 
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
              }`}
            >
              Agent
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('trainer')}
              className={`py-2 rounded-lg border text-center transition-all font-bold ${
                selectedRole === 'trainer' 
                  ? 'border-brand-500 bg-brand-600 text-white shadow-xs' 
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
              }`}
            >
              Trainer
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('manager')}
              className={`py-2 rounded-lg border text-center transition-all font-bold ${
                selectedRole === 'manager' 
                  ? 'border-brand-500 bg-brand-600 text-white shadow-xs' 
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
              }`}
            >
              Manager
            </button>
          </div>
        </div>

        {selectedRole === 'agent' && (
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Tugaskan Trainer Pendamping:</label>
            {assignmentOptions.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg leading-snug">
                🚨 Belum ada Trainer terdaftar. Akun Anda dapat berfungsi sebagai supervisor Fallback pembimbing. Silakan daftarkan trainer baru terlebih dahulu.
              </div>
            ) : (
              <select
                value={selectedTrainerId}
                onChange={(e) => setSelectedTrainerId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-lg font-bold text-slate-800 focus:outline-hidden"
                required
              >
                <option value="">-- Pilih Trainer Pembimbing --</option>
                {assignmentOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-slate-200/60">
          <button
            type="submit"
            disabled={loading || (selectedRole === 'agent' && !selectedTrainerId)}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all cursor-pointer disabled:opacity-40"
          >
            {loading ? 'Memproses...' : 'Setujui & Aktifkan'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              if (!confirmDecline) {
                setConfirmDecline(true);
                setTimeout(() => setConfirmDecline(false), 3000);
                return;
              }
              setLoading(true);
              await onDecline();
              setLoading(false);
            }}
            className={`py-2 px-3.5 border rounded-lg font-semibold transition-all cursor-pointer ${
              confirmDecline 
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 animate-pulse' 
                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
            }`}
          >
            {confirmDecline ? 'Yakin Tolak?' : 'Tolak'}
          </button>
        </div>
      </form>
    </div>
  );
}
