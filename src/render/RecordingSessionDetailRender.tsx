import React from 'react';
import { 
  Play, Pause, Clock, Calendar, User, HardDrive, Cloud, 
  BookOpen, X, Volume2, FileText, MessageSquare 
} from 'lucide-react';
import { BusinessScenario } from '../types/index';

interface RecordingSessionDetailRenderProps {
  recording: {
    id: string;
    title: string;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: string;
    agentId: string | null;
    agentName: string;
    trainerId?: string;
    trainerName?: string;
    duration: number;
    createdAt: string;
    cloudAudioUrl?: string;
    hasLocal: boolean;
    hasCloud: boolean;
    isUploaded: boolean;
    notes?: string;
  };
  scenarios: BusinessScenario[];
  onClose: () => void;
  userNamesMap?: Record<string, string>;

  // Hook states
  isPlaying: boolean;
  audioSrc: string | null;
  loadingAudio: boolean;
  handleTogglePlay: () => void;
}

export default function RecordingSessionDetailRender({
  recording,
  scenarios,
  onClose,
  userNamesMap,
  isPlaying,
  audioSrc,
  loadingAudio,
  handleTogglePlay,
}: RecordingSessionDetailRenderProps) {
  // Find matching scenario
  const scenario = scenarios.find(s => s.scenarioId === recording.scenarioId);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-200/80 shadow-2xl flex flex-col justify-between animate-slide-in font-sans text-left">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <span className="text-[10px] bg-indigo-50 border border-indigo-200/40 text-indigo-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Detail Latihan Terperinci
          </span>
          <h3 className="text-sm font-black text-slate-850 font-display mt-1.5 leading-snug line-clamp-1" title={recording.title}>
            {recording.title}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Main Stats and Drill-down Dialog Turns */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Core details mapping cards */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl text-xs text-slate-650 font-semibold shadow-xxs">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-extrabold">Peserta Sesi</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {recording.agentName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-extrabold">Tanggal Latihan</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {new Date(recording.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-extrabold">Durasi Rekaman</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {recording.duration} Detik ({formatDuration(recording.duration)})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-extrabold">Penyimpanan / Sinkronisasi</span>
            <span className="font-bold flex items-center gap-1 mt-0.5">
              {recording.hasCloud ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  <Cloud className="h-3 w-3 shrink-0 text-teal-600" />
                  <span>Cloud Synced</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  <HardDrive className="h-3 w-3 shrink-0 text-indigo-605" />
                  <span>Lokal Buffer</span>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Playback controller */}
        <div className="bg-slate-900 text-white rounded-2xl p-4.5 flex items-center justify-between shadow-md">
          <button 
            disabled={loadingAudio || !audioSrc}
            onClick={handleTogglePlay}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-55"
            id="detail-playback-btn"
          >
            {loadingAudio ? (
              <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isPlaying ? (
              <Pause className="h-4 w-4 fill-current text-white" />
            ) : (
              <Play className="h-4 w-4 fill-current text-white" />
            )}
          </button>
          <div className="flex-1 pl-4">
            <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest leading-none">Audio Pemutar Latihan</span>
            <span className="text-xs font-mono text-slate-200 mt-1 block truncate">
              {recording.hasLocal ? 'Membaca cache IndexedDB lokal' : 'Streaming dari Cloud storage'}
            </span>
          </div>
          <Volume2 className="h-4 w-4 text-slate-400" />
        </div>

        {/* Dialog Screenplay display (sentences lookup) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-extrabold text-slate-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              <span>Naskah Dialog Percakapan</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">
              {scenario?.title ? 'Skenario Terpandu' : 'Latihan Bebas/Spontan'}
            </span>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 bg-slate-50/30 p-2.5 border border-slate-150/60 rounded-2xl">
            {scenario?.sentences && scenario.sentences.length > 0 ? (
              scenario.sentences.map((turn, i) => {
                const isAgentText = turn.speaker === 'agent';
                const turnIntent = isAgentText ? turn.intentIds?.[0] : turn.responseType;
                return (
                  <div 
                    key={turn.sentenceId || i}
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      isAgentText 
                        ? 'bg-emerald-50/40 border-emerald-100/60 text-slate-800' 
                        : 'bg-indigo-50/20 border-indigo-150/40 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 bg-white/60 w-max px-1.5 py-0.5 rounded-md border border-slate-105">
                      <span className="font-black text-[8px] uppercase tracking-wide">
                        {isAgentText ? '🎙️ AGENT' : '👤 CUSTOMER'}
                      </span>
                      {turnIntent && (
                        <span className="text-[9px] text-slate-400 font-medium italic">({turnIntent})</span>
                      )}
                    </div>
                    <p className="font-medium text-slate-750">"{turn.text}"</p>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-1.5">
                <FileText className="h-7 w-7 text-slate-300" />
                <p className="text-xs leading-normal">
                  Latihan berjalan spontan/bebas tanpa naskah dialog kaku.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trainer comments/notes (If exists) */}
        <div className="space-y-2">
          <span className="font-extrabold text-slate-400 uppercase tracking-widest text-[9px] flex items-center gap-1 border-b border-slate-100 pb-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
            <span>Review & Catatan Masukan</span>
          </span>
          {recording.notes ? (
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs text-slate-700 italic leading-relaxed">
              "{recording.notes}"
              <span className="block text-[10px] text-slate-450 font-bold not-italic tracking-wide text-right mt-2 border-t border-slate-200/50 pt-1.5">
                Reviewer: {recording.trainerName || 'Sistem Mandiri'}
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Belum ada umpan balik tertulis pada latihan ini.</p>
          )}
        </div>

      </div>

      {/* Footer text explanation */}
      <div className="p-4.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-semibold leading-normal text-center shrink-0">
        Riwayat pengerjaan disinkronisasi dalam tata kelola Svara Bank Training Suite.
      </div>

    </div>
  );
}
