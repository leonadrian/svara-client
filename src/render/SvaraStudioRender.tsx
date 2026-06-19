import React, { useRef, useEffect } from 'react';
import { 
  Mic, StopCircle, Play, Pause, Save, CheckCircle2, ChevronRight,
  Award, Clock, Check, Volume2, X, AlignLeft, Info, Settings, Star
} from 'lucide-react';
import { BusinessScenario, UserProfile } from '../types/index';
import { renderHighlightedText } from '../utils';

export interface SvaraStudioRenderProps {
  userProfile: UserProfile;
  activeScenario: BusinessScenario;
  assignedAgents: UserProfile[];
  onClose: () => void;
  allScenarios?: BusinessScenario[];
  isTrainerRole: boolean;
  unregisteredAgentPlaceholder: UserProfile;
  selectedAgent: UserProfile | null;
  setSelectedAgent: (agent: UserProfile | null) => void;
  currentTurnIndex: number;
  isSimulationStarted: boolean;
  isFinished: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  audioUrl: string | null;
  isPlayingBack: boolean;
  waveBars: number[];
  saving: boolean;
  error: string | null;
  startRecordingFlow: () => Promise<void>;
  stopRecordingFlow: () => void;
  progressTurn: () => void;
  setIsFinished: (val: boolean) => void;
  restartSimulation: () => void;
  togglePlayback: () => void;
  setActiveScenario: (sc: BusinessScenario) => void;
  saveRoleplayRecording: () => Promise<void>;
}

export function SvaraStudioRender({
  userProfile,
  activeScenario,
  assignedAgents,
  onClose,
  allScenarios,
  isTrainerRole,
  unregisteredAgentPlaceholder,
  selectedAgent,
  setSelectedAgent,
  currentTurnIndex,
  isSimulationStarted,
  isFinished,
  isRecording,
  recordingSeconds,
  audioUrl,
  isPlayingBack,
  waveBars,
  saving,
  error,
  startRecordingFlow,
  stopRecordingFlow,
  progressTurn,
  setIsFinished,
  restartSimulation,
  togglePlayback,
  setActiveScenario,
  saveRoleplayRecording
}: SvaraStudioRenderProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center z-50 p-3 overflow-y-auto" id="simulator-overlay">
      <div className="bg-slate-50 w-full max-w-5xl rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col my-4 max-h-[95vh] animate-scale-up">
        
        {/* Modal Toolbar Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-left">
            <div className="p-2 bg-indigo-500/15 text-indigo-300 rounded-xl border border-indigo-500/20">
              <Mic className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black font-display tracking-tight uppercase">SvaraStudio — Ruang Latihan Realtime</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Sandi Skenario Lintas-Platform: {activeScenario?.scenarioId}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* 1. SETUP / PRE-FLIGHT BRIEFING SCREEN */}
        {!isSimulationStarted && !isFinished && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left" style={{ maxHeight: 'calc(96vh - 75px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Selector configurations (1/3 COL) */}
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="h-4 w-4 text-indigo-500" />
                    <span>Konfigurasi Sesi</span>
                  </h4>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-650 uppercase tracking-widest">Skenario Terpilih</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-250 rounded-xl bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      value={activeScenario?.scenarioId || ''}
                      onChange={(e) => {
                        if (allScenarios) {
                          const found = allScenarios.find(s => s.scenarioId === e.target.value);
                          if (found) setActiveScenario(found);
                        }
                      }}
                    >
                      {allScenarios && allScenarios.length > 0 ? (
                        allScenarios.map((sc) => (
                          <option key={sc.scenarioId} value={sc.scenarioId}>
                            🎓 [{sc.category.toUpperCase()}] {sc.title}
                          </option>
                        ))
                      ) : (
                        <option value="">Tidak ada skenario tersedia</option>
                      )}
                    </select>
                  </div>

                  {isTrainerRole && (
                    <div className="bg-slate-55 border border-slate-200 rounded-2xl p-4 space-y-1.5 shadow-xxs bg-white">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider">Pilih Agent yang Dilatih</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-shadow"
                        value={selectedAgent?.userId === 'unregistered' || selectedAgent?.userId === '' || !selectedAgent?.userId ? '' : selectedAgent.userId}
                        onChange={(e) => {
                          if (e.target.value === '') {
                            setSelectedAgent(unregisteredAgentPlaceholder);
                          } else {
                            const found = assignedAgents.find(a => a.userId === e.target.value);
                            if (found) setSelectedAgent(found);
                          }
                        }}
                      >
                        {assignedAgents.map((a) => (
                          <option key={a.userId} value={a.userId}>{a.userName} ({a.email})</option>
                        ))}
                        <option value="">-- Belum Buat Akun (Temporary) --</option>
                      </select>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 font-semibold leading-relaxed">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={startRecordingFlow}
                  className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-brand-600/15 hover:translate-y-[-1px] cursor-pointer flex items-center justify-center gap-2"
                  id="start-roleplay-flow-btn"
                >
                  <Mic className="h-4.5 w-4.5" />
                  <span>Mulai & Nyalakan Rekaman</span>
                </button>
              </div>

              {/* Briefing Card info (2/3 COL) */}
              <div className="md:col-span-2 space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-brand-500" />
                    <span>Petunjuk Teknis Simulasi Dialog Svara</span>
                  </h4>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xxs space-y-4">
                  <h2 className="text-lg font-black text-slate-900 font-display leading-tight">{activeScenario?.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{activeScenario?.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Kategori Skenario:</span>
                      <span className="text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-md border border-brand-100 inline-block font-sans">
                        {activeScenario?.category === 'sales' ? 'Telesales Pro' : 'KYC / Verifikasi Compliance'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Total Giliran:</span>
                      <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 inline-block font-mono">
                        {activeScenario?.sentences?.length || 0} Giliran Dialog
                      </span>
                    </div>
                  </div>

                  <div className="bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-xl text-left text-xs text-indigo-950 font-medium leading-relaxed space-y-1">
                    <p className="font-extrabold text-indigo-900">💡 Alur Latihan:</p>
                    <ol className="list-decimal pl-4.5 space-y-1 mt-1 text-indigo-900/80">
                      <li>Klik tombol <strong>Mulai & Nyalakan Rekaman</strong> di samping kiri.</li>
                      <li>Bacalah baris dialog Agen. Klik tombol <strong>Turn Berikutnya</strong> untuk memajukan dialog.</li>
                      <li>Svara akan merekam seluruh suara Anda. Klik <strong>Selesai Simulasi</strong> jika giliran terakhir habis.</li>
                    </ol>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. ACTIVE ROLEPLAY SIMULATION DIALOG VIEW */}
        {isSimulationStarted && !isFinished && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-150 overflow-hidden" style={{ height: 'calc(96vh - 75px)' }}>
            
            {/* Control Sidebar (Left 1/3) */}
            <div className="p-6 space-y-6 text-left flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 border border-rose-100 rounded-md">
                    🔴 Recording Live
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-700">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {isTrainerRole && selectedAgent && (
                  <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl text-xs space-y-1 shadow-xxs">
                    <span className="text-[10px] text-indigo-650 uppercase tracking-wider font-extrabold block">Mitra Agen Berlatih:</span>
                    <p className="font-bold text-slate-800">{selectedAgent.userName}</p>
                    <span className="text-[9px] text-slate-400 font-mono block select-all">{selectedAgent.email}</span>
                  </div>
                )}

                {/* Animated waves */}
                <div className="flex items-center justify-center gap-1 h-14 bg-slate-100 rounded-2xl my-5 border border-slate-200">
                  {waveBars.map((bar, idx) => (
                    <span 
                      key={idx} 
                      className={`w-1 rounded-full transition-all duration-100 ${
                        isRecording ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'
                      }`}
                      style={{ height: `${bar}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsFinished(true);
                    stopRecordingFlow();
                  }}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm transition-transform active:scale-95"
                  id="stop-recording-and-finish-btn"
                >
                  <StopCircle className="h-4.5 w-4.5" />
                  <span>Selesai & Stop Rekaman</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopRecordingFlow();
                    onClose();
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-750 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  id="cancel-simulator-btn"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Batal Latihan (Reset)</span>
                </button>
              </div>
            </div>

            {/* Screenplay Panel (Right 2/3) */}
            <div className="md:col-span-2 p-6 flex flex-col bg-white text-left overflow-hidden">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block leading-3">Naskah Panduan Diskusi</span>
                  <h4 className="text-base font-black text-slate-900 leading-snug mt-0.5">{activeScenario?.title}</h4>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full flex items-center gap-1 font-mono">
                  <AlignLeft className="h-3.5 w-3.5 text-slate-400" />
                  <span>{activeScenario?.sentences?.length || 0} Baris Dialog</span>
                </span>
              </div>

              {/* Scrollable Screenplay Container */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[58vh]" style={{ scrollBehavior: 'smooth' }}>
                {(activeScenario?.sentences || []).map((turn, i) => {
                  const isAgent = turn.speaker === 'agent';
                  const turnIntent = isAgent ? turn.intentIds?.[0] : turn.responseType;

                  return (
                    <div 
                      key={turn.sentenceId || i}
                      className={`flex flex-col p-4.5 rounded-2xl transition-all border ${
                        isAgent 
                          ? 'bg-emerald-50/20 border-emerald-100/50 mr-12 ml-2' 
                          : 'bg-indigo-50/20 border-indigo-100/30 ml-12 mr-2'
                      }`}
                    >
                      <div className={`flex items-center gap-2 mb-2 ${isAgent ? 'justify-start' : 'justify-end'}`}>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md ${
                          isAgent 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-700 text-white'
                        }`}>
                          {isAgent ? '🎙️ AGENT (PERAN ANDA)' : '👤 CUSTOMER / PELANGGAN'}
                        </span>
                        {turnIntent && (
                          <span className="text-[10px] italic text-slate-500 font-medium">
                            ({turnIntent})
                          </span>
                        )}
                      </div>

                      <p className={`text-sm md:text-base font-medium leading-relaxed text-slate-850 ${isAgent ? 'text-left font-semibold' : 'text-left'}`}>
                        "{renderHighlightedText(turn.text || '')}"
                      </p>

                      {isAgent && (turn.intentIds || ((turn as any).scenarioPointIds || (turn as any).pointIds)) && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100/65 text-left pr-4">
                          <div className="space-y-3">
                            {/* Intent IDs */}
                            {turn.intentIds && turn.intentIds.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100/85 text-slate-500">
                                  🎯 Komunikasi Intent
                                </span>
                                <span className="text-xs font-bold text-slate-600">
                                  {turn.intentIds.join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Scenario Point IDs (Kandungan Kalimat) */}
                            {(((turn as any).scenarioPointIds || (turn as any).pointIds) && (((turn as any).scenarioPointIds || (turn as any).pointIds).length > 0)) && (
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-wider block text-slate-450">
                                  📌 Kandungan Informasi Kalimat (Wadah Poin):
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(((turn as any).scenarioPointIds || (turn as any).pointIds) || []).map((pid: string) => {
                                    const pt = (activeScenario.scenarioPoints || []).find(p => p.pointId === pid);
                                    if (!pt) return null;
                                    return (
                                      <span 
                                        key={pid} 
                                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border shadow-4xs ${
                                          pt.pointType === 'mandatory' 
                                            ? 'bg-red-50 text-red-700 border-red-200 shadow-xxs' 
                                            : pt.pointType === 'key_point' 
                                            ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xxs' 
                                            : 'bg-teal-50 text-teal-850 border-teal-200 shadow-xxs'
                                        }`}
                                      >
                                        {pt.pointName} 
                                        <span className="opacity-60 text-[8px] font-semibold ml-1">
                                          ({pt.pointType === 'mandatory' ? 'Wajib' : pt.pointType === 'key_point' ? 'USP' : 'Kualifikasi'})
                                        </span>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-semibold text-center italic">
                Saran: Bacalah dialogue script di atas dengan intonasi yang percaya diri, empati tinggi, dan profesional.
              </div>
            </div>

          </div>
        )}

        {/* 3. FINISHED / EVALUATION SCORING SCREEN */}
        {isFinished && (
          <div className="flex-1 overflow-y-auto p-12 space-y-8 text-center flex flex-col items-center justify-center animate-fade-in" style={{ maxHeight: 'calc(96vh - 75px)' }}>
            <div className="space-y-3 max-w-md mx-auto">
              <CheckCircle2 className="h-14 w-14 text-teal-600 mx-auto" />
              <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight leading-none">Simulasi Selesai Dihentikan!</h2>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Suara latihan Anda telah berhasil dicadangkan di memori lokal peramban. Silakan tinjau kembali hasil rekaman suara Anda di bawah ini dan unggah hasilnya ke cloud.
              </p>
            </div>

            {/* Audio review playback */}
            {audioUrl && (
              <div className="w-full max-w-md mx-auto bg-white border border-slate-200/95 rounded-2xl p-5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-slate-400">Audio Preview</h5>
                    <p className="text-xs font-bold text-slate-800">Durasi Sesi: {recordingSeconds} detik</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="py-2 px-4.5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {isPlayingBack ? (
                    <>
                      <Pause className="h-3.5 w-3.5 fill-current" />
                      <span>Pause Playback</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Dengarkan Ulang</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="w-full max-w-md mx-auto text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 font-semibold leading-relaxed text-left">
                {error}
              </div>
            )}

            <div className="pt-4 flex items-center justify-center gap-4 w-full">
              <button
                type="button"
                onClick={restartSimulation}
                className="py-3 px-6 border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Ulangi Latihan
              </button>
              <button
                type="button"
                onClick={saveRoleplayRecording}
                disabled={saving}
                className="py-3 px-8 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-45 h-11"
              >
                <Save className="h-4.5 w-4.5" />
                <span>{saving ? 'Mengunggah...' : 'Simpan & Unggah Sesi Cloud'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
