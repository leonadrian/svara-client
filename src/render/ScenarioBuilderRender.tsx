import React from 'react';
import { 
  Plus, Trash, Check, MessageSquare, AlertCircle, Sparkles, Save, X, ArrowUp, ArrowDown, Edit2, Shield, PlayCircle 
} from 'lucide-react';
import { 
  BusinessScenario, 
  ScenarioSentence, 
  AgentSentence, 
  CustomerSentence, 
  CustomerResponseCategory 
} from '../types/business-scenario';
import { UserProfile } from '../types/index';

export interface ScenarioBuilderRenderProps {
  userId: string;
  onClose: () => void;
  editingScenario?: BusinessScenario | null;
  userRole?: string;
  isReadOnly?: boolean;
  onStartRoleplay?: () => void;
  onEditScenario?: () => void;
  title: string;
  setTitle: (value: string) => void;
  category: 'sales' | 'verification';
  setCategory: (value: 'sales' | 'verification') => void;
  description: string;
  setDescription: (value: string) => void;
  sentences: ScenarioSentence[];
  mandatoryPoints: { pointId: string; pointName: string }[];
  sellingPoints: { pointId: string; pointName: string }[];
  qualificationCriteria: { pointId: string; pointName: string }[];
  inputs: { mandatory: string; selling: string; qualification: string };
  setInputs: React.Dispatch<React.SetStateAction<{ mandatory: string; selling: string; qualification: string }>>;
  allAvailablePoints: { id: string; name: string; type: string }[];
  newSpeaker: 'customer' | 'agent';
  setNewSpeaker: (value: 'customer' | 'agent') => void;
  newText: string;
  setNewText: (value: string) => void;
  newIntent: string;
  setNewIntent: (value: string) => void;
  newResponseType: CustomerResponseCategory;
  setNewResponseType: (value: CustomerResponseCategory) => void;
  newSelectedPointIds: string[];
  setNewSelectedPointIds: (value: string[]) => void;
  submitting: boolean;
  error: string | null;
  trainers: UserProfile[];
  loadingTrainers: boolean;
  allowedTrainers: string[];
  setAllowedTrainers: (value: string[]) => void;
  editingIndex: number | null;
  setEditingIndex: (value: number | null) => void;
  editSpeaker: 'agent' | 'customer';
  setEditSpeaker: (value: 'agent' | 'customer') => void;
  editText: string;
  setEditText: (value: string) => void;
  editIntent: string;
  setEditIntent: (value: string) => void;
  editResponseType: CustomerResponseCategory;
  setEditResponseType: (value: CustomerResponseCategory) => void;
  editSelectedPointIds: string[];
  setEditSelectedPointIds: (value: string[]) => void;
  addSentence: () => void;
  removeSentence: (index: number) => void;
  moveSentence: (index: number, direction: 'up' | 'down') => void;
  startEditingSentence: (index: number, sen: ScenarioSentence) => void;
  saveEditSentence: () => void;
  addMandatoryPoint: () => void;
  removeMandatoryPoint: (pointId: string) => void;
  addSellingPoint: () => void;
  removeSellingPoint: (pointId: string) => void;
  addQualification: () => void;
  removeQualification: (pointId: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function ScenarioBuilderRender({
  userId,
  onClose,
  editingScenario,
  userRole,
  isReadOnly = false,
  onStartRoleplay,
  onEditScenario,
  title,
  setTitle,
  category,
  setCategory,
  description,
  setDescription,
  sentences,
  mandatoryPoints,
  sellingPoints,
  qualificationCriteria,
  inputs,
  setInputs,
  allAvailablePoints,
  newSpeaker,
  setNewSpeaker,
  newText,
  setNewText,
  newIntent,
  setNewIntent,
  newResponseType,
  setNewResponseType,
  newSelectedPointIds,
  setNewSelectedPointIds,
  submitting,
  error,
  trainers,
  loadingTrainers,
  allowedTrainers,
  setAllowedTrainers,
  editingIndex,
  setEditingIndex,
  editSpeaker,
  setEditSpeaker,
  editText,
  setEditText,
  editIntent,
  setEditIntent,
  editResponseType,
  setEditResponseType,
  editSelectedPointIds,
  setEditSelectedPointIds,
  addSentence,
  removeSentence,
  moveSentence,
  startEditingSentence,
  saveEditSentence,
  addMandatoryPoint,
  removeMandatoryPoint,
  addSellingPoint,
  removeSellingPoint,
  addQualification,
  removeQualification,
  handleSubmit
}: ScenarioBuilderRenderProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto font-sans" id="builder-modal-overlay">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-gray-150 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              {isReadOnly 
                ? 'Detail Skenario Latihan' 
                : editingScenario 
                  ? 'Edit Skenario Latihan (Builder)' 
                  : 'Buat Skenario Latihan Baru'}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-650 bg-white hover:bg-gray-100 p-1.5 rounded-lg border border-gray-250 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-105 rounded-xl p-3.5 flex items-center gap-2" id="scenario-builder-error">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Judul Skenario</label>
              {isReadOnly ? (
                <div className="text-sm font-extrabold text-slate-900 px-4 py-3 bg-slate-50 border border-slate-205 rounded-xl leading-relaxed">
                  {title}
                </div>
              ) : (
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="misal: Penawaran Kartu Kredit Platinum Svara Bank"
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-medium transition-all"
                />
              )}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kategori Pelayanan</label>
              {isReadOnly ? (
                <div className="text-sm font-bold text-indigo-900 px-4 py-3 bg-indigo-50/40 border border-indigo-150 rounded-xl">
                  {category === 'sales' ? '🎯 Sales & Telesales' : '🛡️ Pengecekan & Verifikasi'}
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-semibold transition-all"
                >
                  <option value="sales">🎯 Sales & Telesales</option>
                  <option value="verification">🛡️ Pengecekan & Verifikasi</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Deskripsi Kontekstual Skenario</label>
            {isReadOnly ? (
              <div className="text-xs font-semibold text-slate-650 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed whitespace-pre-wrap">
                {description || 'Tidak ada deskripsi.'}
              </div>
            ) : (
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Berikan info dasar mengenai profil nasabah, tujuan penelponan, rintangan dasar, dsb."
                className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-medium transition-all resize-none"
              />
            )}
          </div>

          {/* Trainer Rights assignment (for Manager) */}
          {(userRole === 'manager' && !isReadOnly) && (
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Pengaturan Keamanan Akses Trainer
                </h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tentukan trainer mana saja yang diperbolehkan melatih menggunakan skenario buatan Anda ini. Trainer bimbingan yang tidak dicentang tidak akan dapat melihat atau menggunakannya di dashboard mereka.
              </p>
              
              {loadingTrainers ? (
                <p className="text-xs text-gray-400 font-mono">Memuat daftar trainer...</p>
              ) : trainers.length === 0 ? (
                <p className="text-xs text-amber-600 font-medium">Belum ada akun trainer terdaftar.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {trainers.map((tr) => {
                    const isChecked = allowedTrainers.includes(tr.userId);
                    return (
                      <label 
                        key={tr.userId} 
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold ${
                          isChecked 
                            ? 'bg-indigo-50/60 border-indigo-250 text-indigo-900 shadow-xxs' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 h-4 w-4"
                          onChange={() => {
                            if (isChecked) {
                              setAllowedTrainers(allowedTrainers.filter(id => id !== tr.userId));
                            } else {
                              setAllowedTrainers([...allowedTrainers, tr.userId]);
                            }
                          }}
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-gray-800">{tr.userName}</span>
                          <span className="text-[10px] text-gray-400 font-normal">{tr.email}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Interactive Script Builder Section */}
          <div className="bg-slate-50/60 border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-6 text-left">
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <MessageSquare className="h-4 w-5 text-indigo-650" />
                <span>Rangkaian Skrip Percakapan Nasabah & Agent</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                {isReadOnly 
                  ? 'Tinjau model rangkaian percakapan dialog panduan untuk Agen dan Nasabah.' 
                  : 'Buat skrip panduan model percakapan percabangan. Anda bisa mengaitkan setiap kalimat ucapan Agen dengan parameter \'Scenario Points\' kritis agar Agen tahu wadah penyampaian yang tepat.'}
              </p>
            </div>

            {/* List turns */}
            <div className="space-y-3">
              {sentences.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400">
                  <MessageSquare className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-medium">Belum ada baris skrip percakapan. Silakan tambahkan baris di bawah beralur tanya jawab.</p>
                </div>
              ) : (
                sentences.map((sen, index) => (
                  <div key={sen.sentenceId} className="bg-white text-gray-800 rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all text-left space-y-3 relative overflow-hidden">                
                    {editingIndex === index ? (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={editSpeaker}
                            onChange={(e) => setEditSpeaker(e.target.value as any)}
                            className="text-xs font-bold border border-gray-200 rounded-lg p-1.5 bg-gray-50 focus:bg-white focus:outline-none"
                          >
                            <option value="customer">Nasabah (Customer)</option>
                            <option value="agent">Agen (Agent)</option>
                          </select>
                          
                          {editSpeaker === 'agent' ? (
                            <input
                              type="text"
                              value={editIntent}
                              onChange={(e) => setEditIntent(e.target.value)}
                              placeholder="Intensi ucapan (misal: Sapaan Awal)"
                              className="text-xs font-semibold border border-gray-200 rounded-lg p-1.5 flex-1 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <select
                              value={editResponseType}
                              onChange={(e) => setEditResponseType(e.target.value as CustomerResponseCategory)}
                              className="text-xs font-semibold border border-gray-200 rounded-lg p-1.5 flex-1 bg-gray-50 focus:bg-white focus:outline-none"
                            >
                              <option value="general">Umum / Respons Biasa</option>
                              <option value="objection font-semibold text-rose-700">Keberatan (Objection / Penolakan)</option>
                              <option value="question">Pertanyaan / Ingin Tahu Lebih</option>
                            </select>
                          )}
                        </div>

                        {/* Interactive edit selection of scenario points */}
                        {editSpeaker === 'agent' && allAvailablePoints.length > 0 && (
                          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 space-y-2 text-left">
                            <span className="text-[10px] font-bold text-indigo-850 uppercase tracking-wider block">
                              Pilih Parameter Penilaian Terkait untuk Kalimat Ini
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[120px] overflow-y-auto">
                              {allAvailablePoints.map((pt) => {
                                const isChecked = editSelectedPointIds.includes(pt.id);
                                const colorClass = pt.type === 'mandatory' ? 'border-red-200 focus:ring-red-500 text-red-650' :
                                                   pt.type === 'key_point' ? 'border-rose-200 focus:ring-rose-500 text-rose-650' :
                                                   'border-teal-200 focus:ring-teal-500 text-teal-650';
                                return (
                                  <label key={pt.id} className="flex items-start gap-2 p-1.5 bg-white border border-slate-150 rounded-lg text-xs font-semibold cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setEditSelectedPointIds(editSelectedPointIds.filter(id => id !== pt.id));
                                        } else {
                                          setEditSelectedPointIds([...editSelectedPointIds, pt.id]);
                                        }
                                      }}
                                      className={`rounded h-3.5 w-3.5 mt-0.5 shrink-0 ${colorClass}`}
                                    />
                                    <span className="leading-tight text-[11px]">{pt.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2.5 resize-none bg-gray-50 focus:bg-white outline-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-all font-semibold cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={saveEditSentence}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Simpan Perubahan</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                          sen.speaker === 'customer' ? 'bg-amber-400' : 'bg-indigo-500'
                        }`} />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              sen.speaker === 'customer' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                            }`}>
                              {sen.speaker === 'customer' ? 'Nasabah' : 'Agen'}
                            </span>
                            {sen.speaker === 'agent' ? (
                              <>
                                {sen.intentIds && sen.intentIds.length > 0 && (
                                  <span className="font-mono text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-200 p-0.5 px-2 rounded-full">
                                    📌 Intensi: {sen.intentIds[0]}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="font-mono text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-200 p-0.5 px-2 rounded-full">
                                  📌 Respons: {
                                  sen.responseType === 'objection' ? 'Keberatan' :
                                  sen.responseType === 'question' ? 'Pertanyaan' : 'Umum'
                                }
                              </span>
                            )}
                          </div>
                          
                          {!isReadOnly && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveSentence(index, 'up')}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                                title="Pindah ke Atas"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === sentences.length - 1}
                                onClick={() => moveSentence(index, 'down')}
                                className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                                title="Pindah ke Bawah"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditingSentence(index, sen)}
                                className="p-1 text-indigo-500 hover:text-indigo-700 border border-indigo-100 rounded bg-indigo-50/50 hover:bg-indigo-50"
                                title="Edit Baris"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSentence(index)}
                                className="p-1 text-red-500 hover:text-red-700 border border-red-100 rounded bg-red-50/50 hover:bg-red-50"
                                title="Hapus Baris"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Visual showing connected points for Agent Turn */}
                        {sen.speaker === 'agent' && (sen as AgentSentence).scenarioPointIds && (sen as AgentSentence).scenarioPointIds.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-1 w-full text-left">
                            <span className="text-[10px] text-gray-400 font-bold">Harus mengandung poin:</span>
                            {(sen as AgentSentence).scenarioPointIds.map(pid => {
                              const pt = allAvailablePoints.find(p => p.id === pid);
                              if (!pt) return null;
                              const colorClass = pt.type === 'mandatory' ? 'bg-red-50 text-red-700 border-red-100' :
                                                 pt.type === 'key_point' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                 'bg-teal-50 text-teal-700 border-teal-100';
                              return (
                                <span key={pid} className={`text-[9px] px-2 py-0.5 rounded border font-bold ${colorClass}`}>
                                  {pt.name}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <p className="text-gray-700 text-sm font-semibold leading-relaxed">"{sen.text}"</p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Addition interface */}
            {!isReadOnly && (
              <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-xxs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Tambah Baris Skrip Baru
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pengucap (Speaker)</label>
                    <select
                      value={newSpeaker}
                      onChange={(e) => {
                        setNewSpeaker(e.target.value as any);
                        setNewSelectedPointIds([]);
                      }}
                      className="w-full text-xs font-bold border border-gray-200 p-2.5 rounded-lg bg-gray-50 focus:bg-white"
                    >
                      <option value="customer">🙋‍♂️ Nasabah (Customer)</option>
                      <option value="agent">🎧 Agen (Agent)</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    {newSpeaker === 'agent' ? (
                      <>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Intensi/Tujuan Ucapan Agen</label>
                        <input
                          type="text"
                          value={newIntent}
                          onChange={(e) => setNewIntent(e.target.value)}
                          placeholder="misal: Verifikasi Alamat, Menjelaskan Promo"
                          className="w-full text-xs font-semibold border border-gray-200 p-2.5 rounded-lg bg-gray-50 focus:bg-white"
                        />
                      </>
                    ) : (
                      <>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Kategori Respons Nasabah</label>
                        <select
                          value={newResponseType}
                          onChange={(e) => setNewResponseType(e.target.value as CustomerResponseCategory)}
                          className="w-full text-xs font-semibold border border-gray-200 p-2.5 rounded-lg bg-gray-50 focus:bg-white"
                        >
                          <option value="general">Umum / Respons Tanya Jawab Biasa</option>
                          <option value="objection font-semibold text-rose-700">Keberatan / Keberatan Aturan (Objection)</option>
                          <option value="question">Pertanyaan Kritis / Ingin Tahu Lebih</option>
                        </select>
                      </>
                    )}
                  </div>

                  {/* Point connection checklists during Turn Creation */}
                  {newSpeaker === 'agent' && allAvailablePoints.length > 0 && (
                    <div className="md:col-span-3 bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 space-y-2 mt-1">
                      <span className="text-[10px] font-bold text-indigo-850 uppercase tracking-wider block">
                        Hubungkan Kalimat Dialog Ini Dengan Parameter Penilaian (Scenario Point)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto">
                        {allAvailablePoints.map((pt) => {
                          const isChecked = newSelectedPointIds.includes(pt.id);
                          const colorClass = pt.type === 'mandatory' ? 'border-red-200 focus:ring-red-500 text-red-650' :
                                             pt.type === 'key_point' ? 'border-rose-200 focus:ring-rose-500 text-rose-650' :
                                             'border-teal-200 focus:ring-teal-500 text-teal-650';
                          return (
                            <label key={pt.id} className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer text-xs font-semibold ${isChecked ? 'bg-white shadow-3xs border-indigo-200 text-indigo-950' : 'opacity-75 border-gray-200'}`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setNewSelectedPointIds(newSelectedPointIds.filter(id => id !== pt.id));
                                  } else {
                                    setNewSelectedPointIds([...newSelectedPointIds, pt.id]);
                                  }
                                }}
                                className={`rounded h-3.5 w-3.5 mt-0.5 shrink-0 ${colorClass}`}
                              />
                              <span className="leading-tight text-[11px]">{pt.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Teks Ucapan Skrip Percakapan</label>
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Ketik teks percakapan yang harus diucapkan di sini..."
                    rows={2}
                    className="w-full text-xs font-medium border border-gray-200 p-2.5 rounded-lg bg-gray-50 focus:bg-white outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={addSentence}
                    disabled={!newText.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambahkan ke Skrip</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Metric Evaluasi Checklists */}
          <div className="space-y-5 text-left">
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Check className="h-4 w-4 text-indigo-650 border border-indigo-200 bg-indigo-50 rounded-md box-content p-1" />
                <span>Kriteria Penilaian & Evaluasi Percakapan</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Tentukan metrik checklist kepatuhan yang harus dinilai secara otomatis oleh Svara AI Evaluator. Setelah ini dibuat, Anda bisa mengaitkannya dengan baris skrip Agen di atas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Mandatory Checklist */}
              <div className="bg-red-50/40 border border-red-100 p-4.5 rounded-2xl space-y-3.5">
                <div>
                  <span className="text-xs font-extrabold uppercase text-red-800 tracking-wider block">🗣️ Poin Kepatuhan Kritis (Mandatory)</span>
                  <span className="text-[10px] text-red-600 block mt-0.5 leading-normal">
                    Hal-hal yang WAJIB disebutkan Agen (misal: verifikasi nama, sapaan hangat, dsb.).
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {mandatoryPoints.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">Belum ada poin kritis.</p>
                  ) : (
                    mandatoryPoints.map((pt) => (
                      <div key={pt.pointId} className="flex items-center justify-between gap-1.5 bg-white border border-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-950">
                        <span>{pt.pointName}</span>
                        {!isReadOnly && (
                          <button onClick={() => removeMandatoryPoint(pt.pointId)} type="button" className="text-red-400 hover:text-red-600 cursor-pointer">
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputs.mandatory}
                      onChange={(e) => setInputs(prev => ({ ...prev, mandatory: e.target.value }))}
                      placeholder="misal: Sebutkan nama instansi perusahaan"
                      className="flex-1 text-xs font-medium border border-gray-200 p-2 rounded-lg bg-white outline-none focus:ring-1 focus:ring-red-300"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMandatoryPoint(); } }}
                    />
                    <button onClick={addMandatoryPoint} type="button" className="p-2 border border-red-200 bg-red-100/50 hover:bg-red-100 text-red-800 font-bold rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Selling / Key Points Checklist */}
              <div className="bg-rose-50/40 border border-rose-100 p-4.5 rounded-2xl space-y-3.5">
                <div>
                  <span className="text-xs font-extrabold uppercase text-rose-800 tracking-wider block">⭐ Poin Penyampaian Kunci (Key Points / USP)</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5 leading-normal">
                    Nilai promosi atau nilai jual utama produk yang sebaiknya dipromosikan.
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {sellingPoints.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">Belum ada poin kunci.</p>
                  ) : (
                    sellingPoints.map((pt) => (
                      <div key={pt.pointId} className="flex items-center justify-between gap-1.5 bg-white border border-rose-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-950">
                        <span>{pt.pointName}</span>
                        {!isReadOnly && (
                          <button onClick={() => removeSellingPoint(pt.pointId)} type="button" className="text-rose-400 hover:text-rose-600 cursor-pointer">
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputs.selling}
                      onChange={(e) => setInputs(prev => ({ ...prev, selling: e.target.value }))}
                      placeholder="misal: Promo cashback 10% di e-commerce"
                      className="flex-1 text-xs font-medium border border-gray-200 p-2 rounded-lg bg-white outline-none focus:ring-1 focus:ring-rose-300"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSellingPoint(); } }}
                    />
                    <button onClick={addSellingPoint} type="button" className="p-2 border border-rose-200 bg-rose-100/50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Qualification Checklist */}
              <div className="bg-teal-50/30 border border-teal-100 p-4.5 rounded-2xl space-y-3.5 md:col-span-2">
                <div>
                  <span className="text-xs font-extrabold uppercase text-teal-800 tracking-wider block">📋 Syarat Kualifikasi Calon Debitur / Nasabah</span>
                  <span className="text-[10px] text-teal-600 block mt-0.5 leading-normal">
                    Informasi kelayakan yang wajib dicocokan atau dikonfirmasi dengan nasabah.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[160px] overflow-y-auto">
                  {qualificationCriteria.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2 sm:col-span-2">Belum ada syarat kualifikasi.</p>
                  ) : (
                    qualificationCriteria.map((pt) => (
                      <div key={pt.pointId} className="flex items-center justify-between gap-1.5 bg-white border border-teal-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-950">
                        <span>{pt.pointName}</span>
                        {!isReadOnly && (
                          <button onClick={() => removeQualification(pt.pointId)} type="button" className="text-teal-400 hover:text-teal-600 cursor-pointer">
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputs.qualification}
                      onChange={(e) => setInputs(prev => ({ ...prev, qualification: e.target.value }))}
                      placeholder="misal: Penghasilan minimum Rp 5juta per bulan"
                      className="flex-1 text-xs font-medium border border-gray-200 p-2 rounded-lg bg-white outline-none focus:ring-1 focus:ring-teal-300"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addQualification(); } }}
                    />
                    <button onClick={addQualification} type="button" className="p-2.5 border border-teal-200 bg-teal-100/55 hover:bg-teal-100 text-teal-850 font-bold rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4.5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3.5">
          {isReadOnly ? (
            <>
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-250 hover:border-gray-350 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer font-semibold"
              >
                Kembali ke Katalog
              </button>
              
              {onEditScenario && (
                <button
                  type="button"
                  onClick={onEditScenario}
                  className="px-5 py-2.5 border border-amber-250 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Skenario</span>
                </button>
              )}

              {onStartRoleplay && (
                <button
                  type="button"
                  onClick={onStartRoleplay}
                  className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 font-bold hover:-translate-y-0.5"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Mulai Simulasi Roleplay</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={onClose}
                disabled={submitting}
                className="px-4.5 py-2.5 border border-gray-250 hover:border-gray-350 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xxs font-semibold"
              >
                Batal
              </button>
              <button 
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5.5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white disabled:opacity-50 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-500/10 font-bold"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                    <span>Menyimpan Skenario...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-white shrink-0" />
                    <span>Simpan Skenario</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
