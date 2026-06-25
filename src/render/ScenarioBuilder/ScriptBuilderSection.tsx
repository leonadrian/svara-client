import React, { useState } from 'react';
import {
  Plus, Trash, Check, MessageSquare, ArrowUp, ArrowDown, Edit2
} from 'lucide-react';
import {
  ScenarioSentence,
  AgentSentence,
  CustomerResponseCategory,
} from '../../types/index';
import { ScriptBuilderLabels } from './types';
import { renderHighlightedText } from '../../utils';

// ============================================================
// Script Builder Section
// ============================================================

export interface ScriptBuilderSectionProps {
  labels: ScriptBuilderLabels;
  isReadOnly: boolean;
  sentences: ScenarioSentence[];
  allAvailablePoints: { id: string; name: string; type: string }[];
  // New sentence state
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
  // Edit sentence state
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
  newPreface: string;
  setNewPreface: (value: string) => void;
  newPostscript: string;
  setNewPostscript: (value: string) => void;
  editPreface: string;
  setEditPreface: (value: string) => void;
  editPostscript: string;
  setEditPostscript: (value: string) => void;
  // Actions
  addSentence: () => void;
  removeSentence: (index: number) => void;
  moveSentence: (index: number, direction: 'up' | 'down') => void;
  startEditingSentence: (index: number, sen: ScenarioSentence) => void;
  saveEditSentence: () => void;
}

export function ScriptBuilderSection({
  labels, isReadOnly, sentences, allAvailablePoints,
  newSpeaker, setNewSpeaker, newText, setNewText,
  newIntent, setNewIntent, newResponseType, setNewResponseType,
  newSelectedPointIds, setNewSelectedPointIds,
  editingIndex, setEditingIndex,
  editSpeaker, setEditSpeaker, editText, setEditText,
  editIntent, setEditIntent, editResponseType, setEditResponseType,
  editSelectedPointIds, setEditSelectedPointIds,
  newPreface, setNewPreface, newPostscript, setNewPostscript,
  editPreface, setEditPreface, editPostscript, setEditPostscript,
  addSentence, removeSentence, moveSentence, startEditingSentence, saveEditSentence,
}: ScriptBuilderSectionProps) {
  const [showNewPreface, setShowNewPreface] = useState(false);
  const [showNewPostscript, setShowNewPostscript] = useState(false);
  const [showEditPreface, setShowEditPreface] = useState(false);
  const [showEditPostscript, setShowEditPostscript] = useState(false);

// ---- Custom Point Multi-Select Dropdown Component ----
function PointMultiSelect({
  selectedIds,
  onToggle,
  allAvailablePoints,
  title,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  allAvailablePoints: { id: string; name: string; type: string }[];
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (allAvailablePoints.length === 0) return null;

  const selectedPoints = allAvailablePoints.filter(p => selectedIds.includes(p.id));

  return (
    <div className="relative text-left">
      <div className="flex flex-col gap-2">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
          {title}
        </label>
        
        <div className="flex flex-wrap items-center gap-2">
          {selectedPoints.map(pt => {
            const pillColor = pt.type === 'mandatory' ? 'bg-red-50 text-red-700 border-red-200' :
                              pt.type === 'key_point' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-teal-50 text-teal-700 border-teal-200';
            return (
              <span key={pt.id} className={`text-[10px] px-2 py-1 rounded-md border font-bold flex items-center gap-1 ${pillColor}`}>
                {pt.name}
                <button 
                  type="button" 
                  onClick={() => onToggle(pt.id)}
                  className="hover:opacity-70 ml-1"
                >
                  &times;
                </button>
              </span>
            );
          })}
          
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3 w-3" /> Pilih Poin Konteks
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-full sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg p-3">
            <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800">Daftar Poin Skenario</span>
              <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1">
              {allAvailablePoints.map((pt) => {
                const isChecked = selectedIds.includes(pt.id);
                const colorClass = pt.type === 'mandatory' ? 'border-red-200 focus:ring-red-500 text-red-600' :
                                   pt.type === 'key_point' ? 'border-rose-200 focus:ring-rose-500 text-rose-600' :
                                   'border-teal-200 focus:ring-teal-500 text-teal-600';
                return (
                  <label key={pt.id} className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer text-xs font-semibold ${isChecked ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950' : 'bg-white hover:bg-slate-50 border-gray-100'}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggle(pt.id)}
                      className={`rounded h-3.5 w-3.5 mt-0.5 shrink-0 ${colorClass}`}
                    />
                    <span className="leading-tight text-[11px]">{pt.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

  // ---- Sub-render: Point selection wrapper ----
  const renderPointCheckboxes = (
    selectedIds: string[],
    onToggle: (id: string) => void,
    title: string,
  ) => {
    return (
      <PointMultiSelect
        selectedIds={selectedIds}
        onToggle={onToggle}
        title={title}
        allAvailablePoints={allAvailablePoints}
      />
    );
  };

  // ---- Sub-render: Edit mode for a sentence ----
  const renderEditMode = () => (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={editSpeaker}
          onChange={(e) => setEditSpeaker(e.target.value as 'agent' | 'customer')}
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
            placeholder={labels.intentPlaceholder}
            className="text-xs font-semibold border border-gray-200 rounded-lg p-1.5 flex-1 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500"
          />
        ) : (
          <select
            value={editResponseType}
            onChange={(e) => setEditResponseType(e.target.value as CustomerResponseCategory)}
            className="text-xs font-semibold border border-gray-200 rounded-lg p-1.5 flex-1 bg-gray-50 focus:bg-white focus:outline-none"
          >
            <option value="general">{labels.responseOptions.general}</option>
            <option value="objection font-semibold text-rose-700">{labels.responseOptions.objection}</option>
            <option value="question">{labels.responseOptions.question}</option>
          </select>
        )}
      </div>

      {editSpeaker === 'agent' && renderPointCheckboxes(
        editSelectedPointIds,
        (id) => {
          if (editSelectedPointIds.includes(id)) {
            setEditSelectedPointIds(editSelectedPointIds.filter(i => i !== id));
          } else {
            setEditSelectedPointIds([...editSelectedPointIds, id]);
          }
        },
        labels.pointSelectionTitleEdit,
      )}

      <div className="space-y-3.5">
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider flex-1">
            Teks Dialog Percakapan Utama
          </label>
          {!showEditPreface && (
            <button
              type="button"
              onClick={() => setShowEditPreface(true)}
              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Preface
            </button>
          )}
          {!showEditPostscript && (
            <button
              type="button"
              onClick={() => setShowEditPostscript(true)}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Postscript
            </button>
          )}
        </div>

        {showEditPreface && (
          <div className="relative">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-amber-700">
              Preface (Panduan Sebelum Kalimat)
            </label>
            <textarea
              value={editPreface}
              onChange={(e) => setEditPreface(e.target.value)}
              placeholder="Tulis panduan taktis atau strategi komunikasi sebelum kalimat dibaca..."
              className="w-full text-xs font-medium border border-amber-200 rounded-lg p-2.5 resize-none bg-amber-50/50 focus:bg-white outline-none font-sans"
              rows={1.5}
            />
            <button 
              type="button" 
              onClick={() => { setShowEditPreface(false); setEditPreface(''); }}
              className="absolute top-0 right-0 text-gray-400 hover:text-red-500 p-1 bg-white rounded-bl-lg"
              title="Hapus Preface"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 resize-none bg-gray-50 focus:bg-white outline-none font-sans"
            rows={4}
          />
        </div>

        {showEditPostscript && (
          <div className="relative">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-emerald-700">
              Postscript (Catatan/Insight Setelah Kalimat)
            </label>
            <textarea
              value={editPostscript}
              onChange={(e) => setEditPostscript(e.target.value)}
              placeholder="Tulis catatan taktis, wawasan, atau dampak komunikasi setelah kalimat dibaca..."
              className="w-full text-xs font-medium border border-emerald-200 rounded-lg p-2.5 resize-none bg-emerald-50/50 focus:bg-white outline-none font-sans"
              rows={1.5}
            />
            <button 
              type="button" 
              onClick={() => { setShowEditPostscript(false); setEditPostscript(''); }}
              className="absolute top-0 right-0 text-gray-400 hover:text-red-500 p-1 bg-white rounded-bl-lg"
              title="Hapus Postscript"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => setEditingIndex(null)}
          className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-all font-semibold cursor-pointer"
        >
          {labels.cancelEditText}
        </button>
        <button
          type="button"
          onClick={saveEditSentence}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-bold flex items-center gap-1 shadow-sm cursor-pointer"
        >
          <Check className="h-3.5 w-3.5" />
          <span>{labels.saveEditText}</span>
        </button>
      </div>
    </div>
  );

  const renderViewMode = (sen: ScenarioSentence, index: number) => (
    <>
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${
        sen.speaker === 'customer' ? 'bg-amber-400' : 'bg-indigo-500'
      }`} />

      {sen.preface && (
        <div className="bg-amber-50/50 border border-amber-150 rounded-xl p-3.5 text-xs text-amber-800 font-semibold mb-2 leading-relaxed text-left flex items-start gap-2 shadow-xxs">
          <span className="text-base select-none mt-[-2px]">💡</span>
          <div className="flex-1">
            "{sen.preface}"
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
            sen.speaker === 'customer' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
          }`}>
            {sen.speaker === 'customer' ? labels.speakerBadgeCustomer : labels.speakerBadgeAgent}
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
              onClick={() => {
                setShowEditPreface(!!sen.preface);
                setShowEditPostscript(!!sen.postscript);
                startEditingSentence(index, sen);
              }}
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

      {/* Connected points for Agent Turn */}
      {sen.speaker === 'agent' && (sen as AgentSentence).scenarioPointIds && (sen as AgentSentence).scenarioPointIds.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-1 w-full text-left">
          <span className="text-[10px] text-gray-400 font-bold">{labels.pointHintText}</span>
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

      <p className="text-gray-700 text-sm font-semibold leading-relaxed">"{renderHighlightedText(sen.text)}"</p>

      {sen.postscript && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-500 font-semibold mt-2 leading-relaxed text-left flex items-start gap-2 shadow-xxs">
          <span className="text-base select-none mt-[-2px]">📝</span>
          <div className="flex-1">
            "{sen.postscript}"
          </div>
        </div>
      )}
    </>
  );

  // ---- Sub-render: Add new sentence form ----
  const renderAddForm = () => {
    if (isReadOnly) return null;
    return (
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-xxs space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
          {labels.addSectionTitle}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{labels.speakerLabel}</label>
            <select
              value={newSpeaker}
              onChange={(e) => {
                setNewSpeaker(e.target.value as 'customer' | 'agent');
                setNewSelectedPointIds([]);
              }}
              className="w-full text-xs font-bold border border-gray-200 p-2.5 rounded-lg bg-gray-50 focus:bg-white"
            >
              <option value="customer">{labels.customerOption}</option>
              <option value="agent">{labels.agentOption}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            {newSpeaker === 'agent' ? (
              <>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{labels.intentLabel}</label>
                <input
                  type="text"
                  value={newIntent}
                  onChange={(e) => setNewIntent(e.target.value)}
                  placeholder={labels.intentPlaceholder}
                  className="w-full text-xs font-semibold border border-gray-200 p-2.5 rounded-lg bg-gray-50 focus:bg-white"
                />
              </>
            ) : (
              <>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{labels.responseLabel}</label>
                <select
                  value={newResponseType}
                  onChange={(e) => setNewResponseType(e.target.value as CustomerResponseCategory)}
                  className="w-full text-xs font-semibold border border-gray-200 p-2.5 rounded-lg bg-gray-50 focus:bg-white"
                >
                  <option value="general">{labels.responseOptions.general}</option>
                  <option value="objection font-semibold text-rose-700">{labels.responseOptions.objection}</option>
                  <option value="question">{labels.responseOptions.question}</option>
                </select>
              </>
            )}
          </div>

          {newSpeaker === 'agent' && renderPointCheckboxes(
            newSelectedPointIds,
            (id) => {
              if (newSelectedPointIds.includes(id)) {
                setNewSelectedPointIds(newSelectedPointIds.filter(i => i !== id));
              } else {
                setNewSelectedPointIds([...newSelectedPointIds, id]);
              }
            },
            labels.pointSelectionTitle,
          )}
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider flex-1">
              {labels.scriptTextLabel}
            </label>
            {!showNewPreface && (
              <button
                type="button"
                onClick={() => setShowNewPreface(true)}
                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Preface
              </button>
            )}
            {!showNewPostscript && (
              <button
                type="button"
                onClick={() => setShowNewPostscript(true)}
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Postscript
              </button>
            )}
          </div>

          {showNewPreface && (
            <div className="relative">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-amber-700">
                Preface (Panduan Sebelum Kalimat)
              </label>
              <textarea
                value={newPreface}
                onChange={(e) => setNewPreface(e.target.value)}
                placeholder="Tulis panduan taktis atau strategi komunikasi sebelum kalimat dibaca..."
                rows={1.5}
                className="w-full text-xs font-medium border border-amber-200 p-2.5 rounded-lg bg-amber-50/50 focus:bg-white outline-none resize-none font-sans"
              />
              <button 
                type="button" 
                onClick={() => { setShowNewPreface(false); setNewPreface(''); }}
                className="absolute top-0 right-0 text-gray-400 hover:text-red-500 p-1 bg-white rounded-bl-lg"
                title="Hapus Preface"
              >
                <Trash className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={labels.scriptTextPlaceholder}
              rows={4}
              className="w-full text-xs font-semibold border border-gray-200 p-2.5 rounded-lg bg-gray-50 focus:bg-white outline-none resize-none font-sans"
            />
          </div>

          {showNewPostscript && (
            <div className="relative">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-emerald-700">
                Postscript (Catatan/Insight Setelah Kalimat)
              </label>
              <textarea
                value={newPostscript}
                onChange={(e) => setNewPostscript(e.target.value)}
                placeholder="Tulis catatan taktis, wawasan, atau dampak komunikasi setelah kalimat dibaca..."
                rows={1.5}
                className="w-full text-xs font-medium border border-emerald-200 p-2.5 rounded-lg bg-emerald-50/50 focus:bg-white outline-none resize-none font-sans"
              />
              <button 
                type="button" 
                onClick={() => { setShowNewPostscript(false); setNewPostscript(''); }}
                className="absolute top-0 right-0 text-gray-400 hover:text-red-500 p-1 bg-white rounded-bl-lg"
                title="Hapus Postscript"
              >
                <Trash className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => {
              addSentence();
              setShowNewPreface(false);
              setShowNewPostscript(false);
            }}
            disabled={!newText.trim()}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{labels.addButtonText}</span>
          </button>
        </div>
      </div>
    );
  };

  // ---- Main render ----
  return (
    <div className="bg-slate-50/60 border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-6 text-left">
      <div>
        <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          {labels.icon}
          <span>{labels.sectionTitle}</span>
        </h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-normal">
          {isReadOnly ? labels.sectionDescriptionReadOnly : labels.sectionDescription}
        </p>
      </div>

      {/* Sentence list */}
      <div className="space-y-3">
        {sentences.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400">
            <MessageSquare className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium">{labels.emptyStateText}</p>
          </div>
        ) : (
          sentences.map((sen, index) => (
            <div key={sen.sentenceId} className="bg-white text-gray-800 rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all text-left space-y-3 relative overflow-hidden">
              {editingIndex === index ? renderEditMode() : renderViewMode(sen, index)}
            </div>
          ))
        )}
      </div>

      {renderAddForm()}
    </div>
  );
}
