import React from 'react';
import { 
  Mic, Play, Pause, Cloud, HardDrive, UploadCloud, Plus, Link2, 
  Eye, RefreshCw, Search, Trash2, X, User
} from 'lucide-react';
import { UserProfile, BusinessScenario } from '../types/index';

interface RecordingSessionViewerRenderProps {
  userProfile: UserProfile;
  scenarios: BusinessScenario[];
  onClose: () => void;
  onRefreshCloud: () => void;
  userNamesMap?: Record<string, string>;
  onSelectRecording?: (recording: any) => void;

  // From hook state
  localRecordings: any[];
  loadingLocal: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  showAddExternal: boolean;
  setShowAddExternal: (val: boolean) => void;
  extTitle: string;
  setExtTitle: (val: string) => void;
  extScenarioId: string;
  setExtScenarioId: (val: string) => void;
  extAgentId: string;
  setExtAgentId: (val: string) => void;
  extDuration: number;
  setExtDuration: (val: number) => void;
  extFile: File | null;
  setExtFile: (file: File | null) => void;
  addingExternal: boolean;
  linkingRecId: string | null;
  setLinkingRecId: (val: string | null) => void;
  linkingAgentId: string;
  setLinkingAgentId: (val: string) => void;
  linkingScenarioId: string;
  setLinkingScenarioId: (val: string) => void;
  updatingLink: boolean;
  activePlayId: string | null;
  isPlaying: boolean;
  loadingAudioBlob: boolean;
  uploadingId: string | null;
  agentsList: UserProfile[];
  records: any[];
  
  // From hook functions
  handlePlayRecording: (recId: string, cloudAudioUrl?: string) => void;
  handleUploadToCloud: (recId: string) => void;
  handleAddExternalFile: (e: React.FormEvent) => void;
  handleLinkRecordingCredentials: (e: React.FormEvent) => void;
  handleDeleteLocalRecord: (id: string, name: string) => void;
}

export default function RecordingSessionViewerRender({
  userProfile,
  scenarios,
  onClose,
  userNamesMap,
  onSelectRecording,

  localRecordings,
  loadingLocal,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  showAddExternal,
  setShowAddExternal,
  extTitle,
  setExtTitle,
  extScenarioId,
  setExtScenarioId,
  extAgentId,
  setExtAgentId,
  extDuration,
  setExtDuration,
  extFile,
  setExtFile,
  addingExternal,
  linkingRecId,
  setLinkingRecId,
  linkingAgentId,
  setLinkingAgentId,
  linkingScenarioId,
  setLinkingScenarioId,
  updatingLink,
  activePlayId,
  isPlaying,
  loadingAudioBlob,
  uploadingId,
  agentsList,
  records,

  handlePlayRecording,
  handleUploadToCloud,
  handleAddExternalFile,
  handleLinkRecordingCredentials,
  handleDeleteLocalRecord,
}: RecordingSessionViewerRenderProps) {
  const isAgent = userProfile.role === 'agent';
  const isTrainerOrManager = userProfile.role === 'trainer' || userProfile.role === 'manager' || userProfile.role === 'superadmin';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="recording-session-viewer-overlay">
      <div className="bg-white border border-slate-200/80 shadow-2xl rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in text-left">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Mic className="h-5.5 w-5.5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display tracking-tight flex items-center gap-2">
                <span>Daftar Rekaman & Sesi Latihan</span>
              </h3>
              <p className="text-[11px] text-teal-100">Kelola riwayat suara, buffer offline localstorage, dan putar modul rekaman svara secara interaktif.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl text-xs bg-white/10 hover:bg-white/20 font-black cursor-pointer px-4 border border-white/5"
          >
            ✕ Tutup
          </button>
        </div>

        {/* Content Board */}
        <div className="flex-grow p-6 overflow-y-auto flex flex-col md:flex-row gap-6" style={{ minHeight: 0 }}>
          
          {/* Left Table / List pane */}
          <div className="flex-1 flex flex-col space-y-4" style={{ minWidth: 0 }}>
            {/* Filter Search bars */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari rekaman berdasarkan judul, skenario, agen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kategori:</span>
                <select
                  className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">Semua Kategori</option>
                  <option value="sales">Telesales</option>
                  <option value="verification">Verification KYC</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-grow border border-slate-200 rounded-2xl bg-slate-50/50 overflow-y-auto max-h-[55vh]" style={{ minHeight: '120px' }}>
              {loadingLocal ? (
                <div className="p-12 text-center text-slate-400 font-semibold gap-2 flex flex-col items-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-teal-600" />
                  <span>Membaca database IndexedDB...</span>
                </div>
              ) : records.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <HardDrive className="h-10 w-10 text-slate-300" />
                  <h4 className="font-bold text-slate-700 font-display">Log Rekaman Kosong</h4>
                  <p className="text-xs text-slate-400 max-w-sm">Mulai jalankan sesi simulator untuk mendapatkan hasil audio pertamamu atau tambahkan rekaman dari luar.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-150">
                  {records.map((rec) => {
                    const isLinkingThis = linkingRecId === rec.id;
                    const isPlayingThis = activePlayId === rec.id && isPlaying;

                    return (
                      <div key={rec.id} className="p-4 bg-white hover:bg-slate-55 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {rec.hasCloud ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-150" title="Rekaman tersimpan aman di Cloud">
                                <Cloud className="h-2.5 w-2.5 shrink-0" />
                                <span>Cloud Synced</span>
                              </span>
                            ) : null}
                            
                            {rec.hasLocal ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-150" title="Audio tersimpan di local IndexedDB buffer">
                                <HardDrive className="h-2.5 w-2.5 shrink-0" />
                                <span>Local Buffer</span>
                              </span>
                            ) : null}

                            {(!rec.agentId || rec.agentId === 'unregistered') && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-150">
                                Unassigned Agent
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-xs md:text-sm leading-snug truncate" title={rec.title}>{rec.title}</h4>
                          
                          <div className="text-[10px] text-slate-500 font-medium flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-sans">
                            <span className="flex items-center gap-1"><User className="h-3 w-3 text-slate-400" /> {rec.agentName}</span>
                            <span className="text-slate-300">•</span>
                            <span>Target: {rec.scenarioTitle}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-slate-400">{rec.duration}s</span>
                          </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handlePlayRecording(rec.id, rec.cloudAudioUrl)}
                            disabled={loadingAudioBlob && activePlayId === rec.id}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isPlayingThis
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-teal-50 hover:bg-teal-100 text-teal-700'
                            }`}
                            title="Play/Pause Audio"
                          >
                            {loadingAudioBlob && activePlayId === rec.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : isPlayingThis ? (
                              <Pause className="h-4 w-4 shrink-0 fill-current" />
                            ) : (
                              <Play className="h-4 w-4 shrink-0 fill-current" />
                            )}
                          </button>

                          {onSelectRecording && (
                            <button
                              onClick={() => onSelectRecording(rec)}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                              title="Tampilkan Detail Latihan Terperinci dan Penilaian"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Detail</span>
                            </button>
                          )}

                          {rec.hasLocal && !rec.hasCloud && (
                            <button
                              onClick={() => handleUploadToCloud(rec.id)}
                              disabled={uploadingId === rec.id}
                              className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                              title="Unggah berkas fisik audio ini ke Cloud database sekarang"
                            >
                              {uploadingId === rec.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <UploadCloud className="h-3.5 w-3.5" />
                              )}
                              <span>Upload</span>
                            </button>
                          )}

                          {isTrainerOrManager && (!rec.agentId || rec.agentId === 'unregistered' || rec.scenarioId === 'free_practice_sales') && (
                            <button
                              onClick={() => {
                                setLinkingRecId(rec.id);
                                setLinkingAgentId(rec.agentId === 'unregistered' || !rec.agentId ? (agentsList.length > 0 ? agentsList[0].userId : '') : rec.agentId);
                                setLinkingScenarioId(rec.scenarioId || (scenarios.length > 0 ? scenarios[0].scenarioId : ''));
                              }}
                              className="p-1.5 border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer"
                              title="Tautkan ke Agen & Skenario Utama"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {rec.hasLocal && (
                            <button
                              onClick={() => handleDeleteLocalRecord(rec.id, rec.title)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Hapus Cache Audio Lokal"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Action panel for uploads */}
          <div className="w-full md:w-80 space-y-4 shrink-0">
            
            <button
              onClick={() => setShowAddExternal(!showAddExternal)}
              className="w-full py-3 px-4 border border-dashed border-teal-200 text-teal-800 bg-teal-50/50 hover:bg-teal-50 rounded-2xl text-xs font-bold transition-all shadow-xxs flex items-center justify-center gap-2 cursor-pointer"
            >
              {showAddExternal ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showAddExternal ? 'Batal Tambah Rekaman' : 'Tambah Rekaman Luar'}</span>
            </button>

            {/* External File Upload Form */}
            {showAddExternal && (
              <form onSubmit={handleAddExternalFile} className="bg-slate-50 border border-slate-200/95 rounded-2xl p-4 space-y-3 animate-fade-in text-left">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5">TAMBAH FILE EKSTERNAL</h4>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Judul Rekaman</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Contoh: Rekaman Telesales Andi vs Budi..."
                    value={extTitle}
                    onChange={(e) => setExtTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Tautkan Skenario</label>
                  <select
                    className="w-full p-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                    value={extScenarioId}
                    onChange={(e) => setExtScenarioId(e.target.value)}
                  >
                    <option value="">Latihan Bebas / Tanpa Skenario</option>
                    {scenarios.map(s => (
                      <option key={s.scenarioId} value={s.scenarioId}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {isTrainerOrManager && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Pilih Agen</label>
                    <select
                      className="w-full p-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                      value={extAgentId}
                      onChange={(e) => setExtAgentId(e.target.value)}
                    >
                      <option value="">-- Biarkan Kosong (Unassigned) --</option>
                      {agentsList.map(a => (
                        <option key={a.userId} value={a.userId}>{a.userName} ({a.email})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Durasi (Detik)</label>
                  <input
                    type="number"
                    min={1}
                    max={1800}
                    value={extDuration}
                    onChange={(e) => setExtDuration(parseInt(e.target.value) || 30)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Pilih Berkas Audio</label>
                  <input
                    type="file"
                    required
                    accept="audio/*"
                    onChange={(e) => setExtFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2.5 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingExternal}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {addingExternal ? 'Menyimpan...' : 'Simpan Rekaman'}
                </button>
              </form>
            )}

            {/* Editing / Linking credentials overlay inside list */}
            {linkingRecId && (
              <form onSubmit={handleLinkRecordingCredentials} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-fade-in text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <Link2 className="h-3.5 w-3.5 animate-pulse" />
                    <span>KAITKAN METADATA</span>
                  </h4>
                  <button type="button" onClick={() => setLinkingRecId(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Hubungkan Skenario</label>
                  <select
                    className="w-full p-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800"
                    value={linkingScenarioId}
                    onChange={(e) => setLinkingScenarioId(e.target.value)}
                    required
                  >
                    <option value="">Latihan Bebas</option>
                    {scenarios.map(s => (
                      <option key={s.scenarioId} value={s.scenarioId}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Hubungkan Akun Agen</label>
                  <select
                    className="w-full p-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800"
                    value={linkingAgentId}
                    onChange={(e) => setLinkingAgentId(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Penerima --</option>
                    {agentsList.map(a => (
                      <option key={a.userId} value={a.userId}>{a.userName} ({a.email})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={updatingLink}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  {updatingLink ? 'Mengaitkan...' : 'Simpan Kaitan Akun'}
                </button>
              </form>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed font-medium">
              <span className="font-extrabold text-slate-700 block mb-1">Informasi Storage:</span>
              Gunakan Local Buffer untuk menghemat kuota Cloud Anda. Setiap kali pemutaran rekaman dipicu, Svara akan mengutamakan pemutaran file lokal sebelum mengambilnya dari server Cloud.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
