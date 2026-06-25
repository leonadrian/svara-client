import React, { useState } from 'react';
import { ScenarioBuilderRenderProps, mergeLabels } from './types';
import { HeaderSection, FooterSection } from './HeaderFooterSection';
import { ErrorAlert, CoreInfoSection, TrainerAccessSection, EvaluationSection } from './Sections';
import { ScriptBuilderSection } from './ScriptBuilderSection';
import { Sparkles, X, PlusCircle, Copy, Search, ArrowLeft, BookOpen, Printer } from 'lucide-react';
import { openPrintDialog } from './ScenarioHtmlExporter';

export type { ScenarioBuilderRenderProps };


export function ScenarioBuilderRender(props: ScenarioBuilderRenderProps) {
  const { isReadOnly = false, labels: labelOverrides, error, handleSubmit, scenarios = [] } = props;
  const labels = mergeLabels(labelOverrides);

  // Local states to control new scenario creation flow
  const [creationMode, setCreationMode] = useState<'scratch' | 'template' | null>(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);

  const isEditing = !!props.editingScenario;
  const showSelection = !isEditing && !isReadOnly && creationMode === null;
  const showTemplatePicker = !isEditing && !isReadOnly && creationMode === 'template' && !templateLoaded;

  // Filter existing scenarios for selection
  const filteredTemplates = scenarios.filter(sc =>
    sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. SCREEN: Choice of creation mode (Buat dari Baru vs Gunakan Skenario Lain)
  if (showSelection) {
    return (
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto font-sans" id="builder-modal-overlay">
        <div className="bg-white w-full max-w-2xl rounded-2xl border border-gray-150 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse animate-spin-slow" />
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                Buat Skenario Baru
              </h3>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-lg border border-gray-250 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <p className="text-sm text-slate-500 text-center max-w-md mx-auto leading-relaxed">
              Silakan pilih metode untuk mulai membuat skenario pelatihan agent baru Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Card 1: Scratch */}
              <button
                type="button"
                onClick={() => setCreationMode('scratch')}
                className="flex flex-col items-center text-center p-6 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-2xl transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 transition-colors group-hover:bg-indigo-100">
                  <PlusCircle className="h-7 w-7" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Buat dari Baru
                </h4>
                <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">
                  Mulai dari awal. Tentukan informasi dasar, kategori, poin-poin evaluasi, dan rancang skrip dialog baru secara manual.
                </p>
              </button>

              {/* Card 2: Template */}
              <button
                type="button"
                onClick={() => setCreationMode('template')}
                className="flex flex-col items-center text-center p-6 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/10 rounded-2xl transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-100">
                  <Copy className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Gunakan Skenario Lain
                </h4>
                <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">
                  Salin skenario yang sudah ada sebagai dasar. Semua info, poin evaluasi akan disalin, Anda hanya perlu menyesuaikan dialog.
                </p>
              </button>
            </div>
          </div>

          <div className="px-6 py-4.5 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
            <button
              type="button"
              onClick={props.onClose}
              className="px-4.5 py-2.5 border border-gray-250 hover:border-gray-350 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xxs font-semibold"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SCREEN: Select scenario template list picker
  if (showTemplatePicker) {
    return (
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto font-sans" id="builder-modal-overlay">
        <div className="bg-white w-full max-w-2xl rounded-2xl border border-gray-150 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCreationMode(null)}
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-50 p-1.5 rounded-lg border border-gray-200 transition-all cursor-pointer flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                Pilih Skenario Dasar
              </h3>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-lg border border-gray-250 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari skenario berdasarkan judul atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {filteredTemplates.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed border-gray-200 rounded-2xl">
                  <BookOpen className="h-8 w-8 mx-auto text-slate-350 mb-2" />
                  <p className="text-xs font-bold">Tidak ada skenario yang cocok</p>
                </div>
              ) : (
                filteredTemplates.map(sc => (
                  <div key={sc.scenarioId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-150 bg-white hover:border-gray-250 hover:bg-gray-50/40 rounded-2xl transition-all gap-4">
                    <div className="text-left space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 tracking-tight">{sc.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          sc.category === 'sales' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-teal-50 text-teal-700 border border-teal-100'
                        }`}>
                          {sc.category === 'sales' ? 'Sales' : 'Verification'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{sc.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                        <span>💬 {sc.sentences?.length || 0} Dialog</span>
                        <span>🎯 {sc.scenarioPoints?.length || 0} Poin Evaluasi</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        props.loadTemplate(sc);
                        setTemplateLoaded(true);
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-sm transition-all cursor-pointer text-center whitespace-nowrap hover:scale-102"
                    >
                      Gunakan Sebagai Dasar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="px-6 py-4.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCreationMode(null)}
              className="px-4.5 py-2.5 border border-gray-200 hover:bg-gray-105 text-gray-600 bg-white text-xs font-bold rounded-xl transition-all cursor-pointer font-semibold shadow-xxs"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={props.onClose}
              className="px-4.5 py-2.5 border border-gray-250 hover:border-gray-350 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xxs font-semibold"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. SCREEN: Main form (Buat Baru, Edit, atau Lihat detail)
  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto font-sans" id="builder-modal-overlay">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-gray-150 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">

        <HeaderSection labels={labels.header} isReadOnly={isReadOnly} editingScenario={props.editingScenario} onClose={props.onClose} />

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <ErrorAlert error={error} />}

          {props.isTemplateActive && (
            <div className="text-xs font-semibold text-emerald-850 bg-emerald-50/50 border border-emerald-150 rounded-xl p-4.5 flex items-start gap-2.5 text-left">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-emerald-900 block mb-0.5">Skenario Berbasis Dasar Template Aktif!</span>
                Kategori skenario dan daftar poin evaluasi telah disalin dari skenario basis dan dikunci. Anda dapat menyesuaikan judul/deskripsi baru, lalu memodifikasi atau menambahkan dialog skrip di bawah.
              </div>
            </div>
          )}

          <CoreInfoSection
            labels={labels.coreInfo} isReadOnly={isReadOnly}
            isTemplateActive={props.isTemplateActive}
            title={props.title} setTitle={props.setTitle}
            category={props.category} setCategory={props.setCategory}
            description={props.description} setDescription={props.setDescription}
          />

          <TrainerAccessSection
            labels={labels.trainerAccess} userRole={props.userRole} isReadOnly={isReadOnly}
            trainers={props.trainers} loadingTrainers={props.loadingTrainers}
            allowedTrainers={props.allowedTrainers} setAllowedTrainers={props.setAllowedTrainers}
          />

          <hr className="border-gray-100" />

          <EvaluationSection
            labels={labels.evaluation} isReadOnly={isReadOnly}
            isTemplateActive={props.isTemplateActive}
            mandatoryPoints={props.mandatoryPoints} sellingPoints={props.sellingPoints} qualificationCriteria={props.qualificationCriteria}
            inputs={props.inputs} setInputs={props.setInputs}
            addMandatoryPoint={props.addMandatoryPoint} removeMandatoryPoint={props.removeMandatoryPoint}
            addSellingPoint={props.addSellingPoint} removeSellingPoint={props.removeSellingPoint}
            addQualification={props.addQualification} removeQualification={props.removeQualification}
          />

          <hr className="border-gray-100" />

          <ScriptBuilderSection
            labels={labels.scriptBuilder} isReadOnly={isReadOnly}
            sentences={props.sentences} allAvailablePoints={props.allAvailablePoints}
            newSpeaker={props.newSpeaker} setNewSpeaker={props.setNewSpeaker}
            newText={props.newText} setNewText={props.setNewText}
            newIntent={props.newIntent} setNewIntent={props.setNewIntent}
            newResponseType={props.newResponseType} setNewResponseType={props.setNewResponseType}
            newSelectedPointIds={props.newSelectedPointIds} setNewSelectedPointIds={props.setNewSelectedPointIds}
            newPreface={props.newPreface} setNewPreface={props.setNewPreface}
            newPostscript={props.newPostscript} setNewPostscript={props.setNewPostscript}
            editingIndex={props.editingIndex} setEditingIndex={props.setEditingIndex}
            editSpeaker={props.editSpeaker} setEditSpeaker={props.setEditSpeaker}
            editText={props.editText} setEditText={props.setEditText}
            editIntent={props.editIntent} setEditIntent={props.setEditIntent}
            editResponseType={props.editResponseType} setEditResponseType={props.setEditResponseType}
            editSelectedPointIds={props.editSelectedPointIds} setEditSelectedPointIds={props.setEditSelectedPointIds}
            editPreface={props.editPreface} setEditPreface={props.setEditPreface}
            editPostscript={props.editPostscript} setEditPostscript={props.setEditPostscript}
            addSentence={props.addSentence} removeSentence={props.removeSentence}
            moveSentence={props.moveSentence} startEditingSentence={props.startEditingSentence} saveEditSentence={props.saveEditSentence}
          />
        </form>

        <FooterSection
          labels={labels.footer} isReadOnly={isReadOnly} submitting={props.submitting}
          onClose={props.onClose} onEditScenario={props.onEditScenario}
          onStartRoleplay={props.onStartRoleplay} handleSubmit={handleSubmit}
          userRole={props.userRole} onViewJson={() => setShowJsonModal(true)}
          onPrint={() => {
            const tempScenario = {
              title: props.title,
              category: props.category,
              description: props.description,
              scenarioPoints: [
                ...props.mandatoryPoints.map(p => ({ pointId: p.pointId, pointName: p.pointName, pointType: 'mandatory' })),
                ...props.sellingPoints.map(p => ({ pointId: p.pointId, pointName: p.pointName, pointType: 'key_point' })),
                ...props.qualificationCriteria.map(p => ({ pointId: p.pointId, pointName: p.pointName, pointType: 'qualification' }))
              ],
              sentences: props.sentences
            } as any;
            openPrintDialog(tempScenario, (props.allAvailablePoints || []) as any);
          }}
        />

      </div>

      {showJsonModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">Dev Tools</span>
                Scenario JSON Payload
              </h3>
              <button onClick={() => setShowJsonModal(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-1 rounded-md transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-900 text-left">
              <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-words">
                {JSON.stringify({
                  title: props.title,
                  category: props.category,
                  description: props.description,
                  scenarioPoints: [
                    ...props.mandatoryPoints.map(p => ({ ...p, pointType: 'mandatory' })),
                    ...props.sellingPoints.map(p => ({ ...p, pointType: 'key_point' })),
                    ...props.qualificationCriteria.map(p => ({ ...p, pointType: 'qualification' }))
                  ],
                  sentences: props.sentences
                }, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button 
                type="button"
                onClick={() => setShowJsonModal(false)} 
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
              <button 
                type="button"
                onClick={() => {
                  const jsonStr = JSON.stringify({
                    title: props.title,
                    category: props.category,
                    description: props.description,
                    scenarioPoints: [
                      ...props.mandatoryPoints.map(p => ({ ...p, pointType: 'mandatory' })),
                      ...props.sellingPoints.map(p => ({ ...p, pointType: 'key_point' })),
                      ...props.qualificationCriteria.map(p => ({ ...p, pointType: 'qualification' }))
                    ],
                    sentences: props.sentences
                  }, null, 2);
                  navigator.clipboard.writeText(jsonStr);
                  alert('JSON tersalin ke clipboard!');
                }} 
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex gap-2 items-center cursor-pointer shadow-md shadow-purple-500/20"
              >
                <Copy className="h-3.5 w-3.5" /> Salin JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
