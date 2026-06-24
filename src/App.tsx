import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { UserProfile, BusinessScenario, RecordingSession } from './types/index';
import LandingPage from './components/LandingPage';
import ScenarioBuilder from './components/ScenarioBuilder';
import SvaraStudio from './components/SvaraStudio';
import ManagerDashboard from './components/ManagerDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import AgentDashboard from './components/AgentDashboard';
import SuperadminDashboard from './components/SuperadminDashboard';
import RecordingSessionViewer from './components/RecordingSessionViewer';
import RecordingSessionDetail from './components/RecordingSessionDetail';
import ToastContainer from './components/ToastContainer';
import { ServiceProvider, useServices } from './services/ServiceContext';
import { 
  Mic, LogOut, Shield, Database, RefreshCw, Layers
} from 'lucide-react';

export default function App() {
  return (
    <ServiceProvider>
      <AppContent />
    </ServiceProvider>
  );
}

function AppContent() {
  const { userService, scenarioService, recordingService } = useServices();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // Firestore DB states
  const [scenarios, setScenarios] = useState<BusinessScenario[]>([]);
  const [recordings, setRecordings] = useState<RecordingSession[]>([]);
  const [userNamesMap, setUserNamesMap] = useState<Record<string, string>>({});
  
  // Loading & Error states
  const [loadingDb, setLoadingDb] = useState(false);
  const [errorDb, setErrorDb] = useState<string | null>(null);

  // Modal displays controls
  const [isScenarioBuilderOpen, setIsScenarioBuilderOpen] = useState(false);
  const [isRecordingsLibraryOpen, setIsRecordingsLibraryOpen] = useState(false);
  const [activeSimulatorScenario, setActiveSimulatorScenario] = useState<BusinessScenario | null>(null);
  const [activeSimulatorAgentId, setActiveSimulatorAgentId] = useState<string | null>(null);
  const [activeDetailScenario, setActiveDetailScenario] = useState<BusinessScenario | null>(null);
  const [activeDetailRecording, setActiveDetailRecording] = useState<any | null>(null);
  const [editingScenario, setEditingScenario] = useState<BusinessScenario | null>(null);

  const [trainerAssignedAgents, setTrainerAssignedAgents] = useState<UserProfile[]>([]);

  // Dynamically load assigned agents for the trainer role in the simulator
  useEffect(() => {
    if (!currentUserProfile || (currentUserProfile.role !== 'trainer' && currentUserProfile.role !== 'manager')) {
      setTrainerAssignedAgents([]);
      return;
    }
    
    const fetchTrainerAgents = async () => {
      try {
        const list = await userService.getTrainerAgents(currentUserProfile.userId, currentUserProfile.role === 'superadmin');
        setTrainerAssignedAgents(list);
      } catch (err) {
        console.error("Error loading trainer assigned agents inside App: ", err);
      }
    };
    
    fetchTrainerAgents();
  }, [currentUserProfile]);

  // Subscribe to Firestore databases
  useEffect(() => {
    if (!currentUserProfile) return;

    setLoadingDb(true);
    setErrorDb(null);

    // Subscribe real-time Scenarios list
    const unsubscribeScenarios = scenarioService.subscribeScenarios((list) => {
      setScenarios(list);
      setLoadingDb(false);
    }, (err) => {
      console.warn("Real-time scenarios snapshot failed:", err);
      setErrorDb("Scenarios Sync Error: " + err.message);
      setLoadingDb(false);
    });

    // Subscribe real-time Recordings list
    const unsubscribeRecordings = recordingService.subscribeRecordings(currentUserProfile, (list) => {
      setRecordings(list);
    }, (err) => {
      console.warn("Real-time recordings snapshot failed:", err);
    });

    // Subscribe real-time svara-users for user name mapping
    const unsubscribeUsers = userService.subscribeUsers((mapping) => {
      setUserNamesMap(mapping);
    }, (err) => {
      console.warn("Real-time users snapshot failed:", err);
    });

    return () => {
      unsubscribeScenarios();
      unsubscribeRecordings();
      unsubscribeUsers();
    };
  }, [currentUserProfile]);

  const handleProfileSynced = (profile: UserProfile | null) => {
    setCurrentUserProfile(profile);
  };

  // Subscribe to real-time profile changes for auth status updates (approval flow)
  useEffect(() => {
    if (!currentUserProfile) return;

    const unsubscribe = userService.subscribeUserProfile(currentUserProfile.userId, (profileData) => {
      if (profileData) {
        // Only update if critical fields changed
        if (
          profileData.role !== currentUserProfile.role ||
          (profileData.role === 'agent' && (profileData as any).assignedTrainer !== (currentUserProfile as any).assignedTrainer) ||
          profileData.userName !== currentUserProfile.userName
        ) {
          setCurrentUserProfile(profileData);
        }
      }
    }, (err) => {
      console.warn("Real-time profile sync met an issue:", err);
    });

    return () => unsubscribe();
  }, [currentUserProfile?.userId]);

  const handleUserSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUserProfile(null);
    } catch (err) {
      console.error("Logout process met an issue:", err);
    }
  };

  // Switch role function for testing/evaluation frictionless ease
  const forceSwitchRole = (targetRole: 'manager' | 'trainer' | 'agent' | 'superadmin') => {
    if (!currentUserProfile) return;
    const switched: UserProfile = {
      ...currentUserProfile,
      role: targetRole
    } as any;
    setCurrentUserProfile(switched);
  };

  if (currentUserProfile && currentUserProfile.role === 'onboarding') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-zinc-50 font-sans" id="svara-pending-screen">
        <header className="bg-white border-b border-slate-200/80 shadow-xs h-20 flex items-center shrink-0">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20">
                <Mic className="h-5.5 w-5.5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold tracking-tight text-slate-900 block font-display">SVARA</span>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-widest mt-[-2px]">Agent Training Platform</span>
              </div>
            </div>
            <button
              onClick={handleUserSignOut}
              className="p-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-red-500 rounded-xl transition-all cursor-pointer shadow-xs bg-white flex items-center gap-2 text-xs font-semibold"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200/80 shadow-xl rounded-2xl p-8 text-center transition-all">
            <div className="mx-auto h-16 w-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 animate-pulse">
              <Shield className="h-8 w-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-950 tracking-tight font-display">Akun Menunggu Persetujuan</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Terima kasih telah mendaftar, <strong className="text-slate-900">{currentUserProfile.userName}</strong>! Profil Anda saat ini berada dalam antrean divisi persetujuan.
            </p>

            <div className="my-6 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl text-left space-y-2.5 text-xs text-slate-500">
              <div>
                <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">Email Terdaftar:</span>
                <span className="font-mono text-slate-600 select-all">{currentUserProfile.email}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">ID Akun Svara:</span>
                <span className="font-mono text-[10px] text-slate-400 select-all">{currentUserProfile.userId}</span>
              </div>
              <div className="border-t border-slate-200/60 pt-2.5">
                <span className="font-semibold text-slate-750 block leading-normal mb-1">Status Keamanan Divisi Svara</span>
                Sesuai sistem tata kelola Svara, peran (Manager/Trainer/Agent) dan supervisor pembimbing harus dialokasikan secara manual oleh Superadmin/Dev. Akun Anda akan aktif secara otomatis begitu disetujui.
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={async () => {
                  try {
                    const latest = await userService.getUser(currentUserProfile.userId);
                    if (latest) {
                      if (latest.role !== 'onboarding') {
                        setCurrentUserProfile(latest);
                      } else {
                        const alertBox = document.getElementById("pending-indicator");
                        if (alertBox) {
                          alertBox.textContent = "Status Anda masih Pending. Harap tunggu persetujuan Superadmin.";
                          alertBox.classList.remove("hidden");
                          setTimeout(() => {
                            alertBox.classList.add("hidden");
                          }, 3000);
                        }
                      }
                    }
                  } catch (e) {
                    console.error("Manual status fetch failed:", e);
                  }
                }}
                className="w-full py-3 px-5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-500/10 transition-all font-display"
              >
                <RefreshCw className="h-4 w-4 animate-spin-slow" />
                <span>Perbarui Status Akses</span>
              </button>
              
              <div id="pending-indicator" className="hidden text-[11px] font-semibold text-amber-600 bg-amber-50 rounded-lg p-2 animate-fade-in border border-amber-100 mb-2"></div>
            </div>
          </div>
        </main>
        
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium">
          <p>© 2026 Svara Platform. Semua Hak Dilindungi. Menunggu Persetujuan Admin Utama.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm h-20 flex items-center shrink-0">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20">
              <Mic className="h-5.5 w-5.5 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold font-display tracking-tight text-slate-900 block uppercase">Svara</span>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-widest mt-[-2px]">Agent Training Platform</span>
            </div>
          </div>

          {currentUserProfile && (
            <div className="flex items-center gap-4">
              
              {/* Library & Buffer Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsRecordingsLibraryOpen(true)}
                className="px-3.5 py-2 border border-teal-250 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xxs cursor-pointer flex items-center gap-1.5"
                title="Buka Pustaka Rekaman & Offline Buffer"
                id="header-recordings-library-btn"
              >
                <Layers className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Pustaka Rekaman & Buffer</span>
              </button>

              {/* Role Indicator Profile Tag */}
              <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 p-1.5 px-3.5 rounded-2xl">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-800 block leading-tight">{currentUserProfile.userName}</span>
                  <span className="text-[9px] text-slate-400 font-mono block tracking-tight">{currentUserProfile.email}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  currentUserProfile.role === 'superadmin'
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : currentUserProfile.role === 'manager' 
                      ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                      : currentUserProfile.role === 'trainer' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  {currentUserProfile.role}
                </span>
              </div>

              {/* Official Superadmin / Dual Role Perspective Toggler */}
              {currentUserProfile.role === 'superadmin' && (
                <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/60 p-1 rounded-xl shadow-xxs">
                  <span className="text-[9px] font-black text-indigo-700 uppercase px-2 hidden lg:block tracking-wider">Peran:</span>
                  <select
                    value={currentUserProfile.role}
                    onChange={(e) => forceSwitchRole(e.target.value as any)}
                    className="text-xs font-bold text-indigo-900 bg-white border border-indigo-200/60 rounded-lg p-1 px-2.5 tracking-tight cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    title="Pilih Tampilan Dashboard"
                  >
                    <option value="superadmin" className="text-xs">👑 Dashboard Superadmin</option>
                    <option value="manager" className="text-xs">🏢 Dashboard Manager</option>
                    <option value="trainer" className="text-xs">🎓 Dashboard Trainer</option>
                    <option value="agent" className="text-xs">🎧 Simulator Agent</option>
                  </select>
                </div>
              )}

              {/* Log Out button */}
              <button
                onClick={handleUserSignOut}
                className="p-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer shadow-xs bg-white"
                title="Keluar / Ganti Akun"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>
          )}
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentUserProfile ? (
          <LandingPage onProfileSynced={handleProfileSynced} />
        ) : (
          <div className="space-y-8">
            
            {/* Database sync monitoring banner (Only displayed if cloud is experiencing queries delays) */}
            {errorDb && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
                <span>{errorDb}</span>
                <button onClick={() => setErrorDb(null)} className="font-bold underline text-[9px] uppercase tracking-wider">Dismiss</button>
              </div>
            )}

            {/* Role-Based Dashboard Routing */}
            {currentUserProfile.role === 'superadmin' && (
              <SuperadminDashboard 
                userProfile={currentUserProfile}
              />
            )}

            {currentUserProfile.role === 'manager' && (
              <ManagerDashboard 
                userProfile={currentUserProfile}
                scenarios={scenarios}
                recordings={recordings}
                onTriggerScenarioBuilder={() => setIsScenarioBuilderOpen(true)}
                onTriggerSimulator={(sc) => setActiveSimulatorScenario(sc)}
                onTriggerScenarioDetail={(sc) => setActiveDetailScenario(sc)}
                userNamesMap={userNamesMap}
              />
            )}

            {currentUserProfile.role === 'trainer' && (
              <TrainerDashboard 
                userProfile={currentUserProfile}
                scenarios={scenarios}
                recordings={recordings}
                onTriggerScenarioBuilder={() => setIsScenarioBuilderOpen(true)}
                onTriggerSimulator={(sc, preselectedAgentId) => {
                  setActiveSimulatorScenario(sc);
                  setActiveSimulatorAgentId(preselectedAgentId || null);
                }}
                onTriggerScenarioDetail={(sc) => setActiveDetailScenario(sc)}
                userNamesMap={userNamesMap}
              />
            )}

            {currentUserProfile.role === 'agent' && (
              <AgentDashboard 
                userProfile={currentUserProfile}
                scenarios={scenarios}
                recordings={recordings}
                onTriggerSimulator={(sc) => setActiveSimulatorScenario(sc)}
                onTriggerScenarioDetail={(sc) => setActiveDetailScenario(sc)}
                userNamesMap={userNamesMap}
              />
            )}

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-450 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>© 2026 Svara Platform. Semua Hak Dilindungi. Dibuat dengan Firebase & Tailwind CSS.</p>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <Database className="h-3.5 w-3.5 text-brand-600" />
            <span>Project ID: apps-by-pro</span>
          </div>
        </div>
      </footer>

      {/* --- MODALS CONTROLLER PANEL --- */}

      {/* Scenario Creator Popup Modal */}
      {isScenarioBuilderOpen && currentUserProfile && (
        <ScenarioBuilder 
          userId={currentUserProfile.userId}
          editingScenario={editingScenario}
          userRole={currentUserProfile.role}
          scenarios={scenarios}
          onClose={() => {
            setIsScenarioBuilderOpen(false);
            setEditingScenario(null);
          }}
          onSaveSuccess={(sc) => {
            const exists = scenarios.some(s => s.scenarioId === sc.scenarioId);
            if (exists) {
              setScenarios(scenarios.map(s => s.scenarioId === sc.scenarioId ? sc : s));
            } else {
              setScenarios([sc, ...scenarios]);
            }
            setEditingScenario(null);
          }}
        />
      )}

      {/* Roleplay Interactive Simulator Modal */}
      {activeSimulatorScenario && currentUserProfile && (
        <SvaraStudio 
          userProfile={currentUserProfile}
          scenario={activeSimulatorScenario}
          assignedAgents={trainerAssignedAgents}
          onClose={() => {
            setActiveSimulatorScenario(null);
            setActiveSimulatorAgentId(null);
          }}
          onSuccess={(rec) => {
            setRecordings([rec, ...recordings]);
          }}
          preselectedAgentId={activeSimulatorAgentId || undefined}
          allScenarios={
            currentUserProfile.role === 'manager'
              ? scenarios
              : currentUserProfile.role === 'trainer'
              ? scenarios.filter(sc => 
                  sc.createdBy === currentUserProfile.userId || 
                  (sc.allowedTrainers && sc.allowedTrainers.includes(currentUserProfile.userId))
                )
              : scenarios.filter(sc => 
                  sc.allowedAgents && sc.allowedAgents.includes(currentUserProfile.userId)
                )
          }
        />
      )}

      {/* Scenario Detail View Modal */}
      {activeDetailScenario && (
        <ScenarioBuilder 
          userId={currentUserProfile?.userId || ''}
          userRole={currentUserProfile?.role || 'agent'}
          editingScenario={activeDetailScenario}
          isReadOnly={true}
          scenarios={scenarios}
          onClose={() => setActiveDetailScenario(null)}
          onStartRoleplay={() => {
            setActiveSimulatorScenario(activeDetailScenario);
            setActiveDetailScenario(null);
          }}
          onEditScenario={
            (currentUserProfile?.userId === activeDetailScenario.createdBy)
              ? () => {
                  setEditingScenario(activeDetailScenario);
                  setIsScenarioBuilderOpen(true);
                  setActiveDetailScenario(null);
                }
              : undefined
          }
          onSaveSuccess={() => {}}
        />
      )}

      {/* Recording Session Viewer List & Buffer Modal */}
      {isRecordingsLibraryOpen && currentUserProfile && (
        <RecordingSessionViewer
          userProfile={currentUserProfile}
          scenarios={scenarios}
          cloudRecordings={recordings}
          userNamesMap={userNamesMap}
          onClose={() => setIsRecordingsLibraryOpen(false)}
          onRefreshCloud={() => {
            console.log("Log rekaman disinkronkan otomatis via live snapshot!");
          }}
          onSelectRecording={(rec) => {
            setActiveDetailRecording(rec);
          }}
        />
      )}

      {/* Recording Session Detail View */}
      {activeDetailRecording && (
        <RecordingSessionDetail
          recording={activeDetailRecording}
          scenarios={scenarios}
          onClose={() => setActiveDetailRecording(null)}
          userNamesMap={userNamesMap}
        />
      )}

      {/* Global Toast Container */}
      <ToastContainer />

    </div>
  );
}
