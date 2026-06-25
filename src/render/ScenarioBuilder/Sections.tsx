import React from 'react';
import { Plus, Trash, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types/index';
import {
  CoreInfoLabels,
  TrainerAccessLabels,
  EvaluationLabels,
  ChecklistLabels,
} from './types';

// ============================================================
// Error Alert (inline banner)
// ============================================================

export function ErrorAlert({ error }: { error: string }) {
  return (
    <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-105 rounded-xl p-3.5 flex items-center gap-2" id="scenario-builder-error">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

// ============================================================
// Core Info Section (Judul + Kategori + Deskripsi)
// ============================================================

export interface CoreInfoSectionProps {
  labels: CoreInfoLabels;
  isReadOnly: boolean;
  isTemplateActive?: boolean;
  title: string;
  setTitle: (value: string) => void;
  category: 'sales' | 'verification';
  setCategory: (value: 'sales' | 'verification') => void;
  description: string;
  setDescription: (value: string) => void;
}

export function CoreInfoSection({
  labels, isReadOnly, isTemplateActive = false,
  title, setTitle,
  category, setCategory,
  description, setDescription,
}: CoreInfoSectionProps) {
  return (
    <>
      {/* Title + Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{labels.title.label}</label>
          {isReadOnly ? (
            <div className="text-sm font-extrabold text-slate-900 px-4 py-3 bg-slate-50 border border-slate-205 rounded-xl leading-relaxed text-left">
              {title}
            </div>
          ) : (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={labels.title.placeholder}
              className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-medium transition-all"
            />
          )}
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{labels.category.label}</label>
          {isReadOnly || isTemplateActive ? (
            <div className="text-sm font-bold text-indigo-900 px-4 py-3 bg-indigo-50/40 border border-indigo-150 rounded-xl text-left">
              {category === 'sales' ? labels.category.salesOption : labels.category.verificationOption}
            </div>
          ) : (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'sales' | 'verification')}
              className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-semibold transition-all font-sans"
            >
              <option value="sales">{labels.category.salesOption}</option>
              <option value="verification">{labels.category.verificationOption}</option>
            </select>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{labels.description.label}</label>
        {isReadOnly ? (
          <div className="text-xs font-semibold text-slate-600 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed whitespace-pre-wrap">
            {description || labels.description.emptyText}
          </div>
        ) : (
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={labels.description.placeholder}
            className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-medium transition-all resize-none"
          />
        )}
      </div>
    </>
  );
}

// ============================================================
// Trainer Access Section (Manager only — checkbox grid)
// ============================================================

export interface TrainerAccessSectionProps {
  labels: TrainerAccessLabels;
  userRole?: string;
  isReadOnly: boolean;
  trainers: UserProfile[];
  loadingTrainers: boolean;
  allowedTrainers: string[];
  setAllowedTrainers: (value: string[]) => void;
}

export function TrainerAccessSection({
  labels, userRole, isReadOnly,
  trainers, loadingTrainers,
  allowedTrainers, setAllowedTrainers,
}: TrainerAccessSectionProps) {
  if (userRole !== 'manager' || isReadOnly) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl text-left space-y-3">
      <div className="flex items-center gap-2">
        {labels.icon}
        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
          {labels.sectionTitle}
        </h4>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        {labels.sectionDescription}
      </p>

      {loadingTrainers ? (
        <p className="text-xs text-gray-400 font-mono">{labels.loadingText}</p>
      ) : trainers.length === 0 ? (
        <p className="text-xs text-amber-600 font-medium">{labels.emptyText}</p>
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
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
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
  );
}

// ============================================================
// Checklist Section (Reusable — called 3x by EvaluationSection)
// ============================================================

interface ChecklistSectionProps {
  labels: ChecklistLabels;
  points: { pointId: string; pointName: string }[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (pointId: string) => void;
  isReadOnly: boolean;
  className?: string;
}

/** Color class map for checklist color schemes */
const CHECKLIST_COLORS: Record<ChecklistLabels['colorScheme'], {
  card: string; itemBorder: string; itemText: string;
  deleteBtn: string; inputRing: string;
  addBtnBorder: string; addBtnBg: string; addBtnText: string;
}> = {
  red: {
    card: 'bg-red-50/40 border-red-100',
    itemBorder: 'border-red-100', itemText: 'text-red-950',
    deleteBtn: 'text-red-400 hover:text-red-600',
    inputRing: 'focus:ring-1 focus:ring-red-300',
    addBtnBorder: 'border-red-200', addBtnBg: 'bg-red-100/50 hover:bg-red-100', addBtnText: 'text-red-800',
  },
  rose: {
    card: 'bg-rose-50/40 border-rose-100',
    itemBorder: 'border-rose-100', itemText: 'text-rose-950',
    deleteBtn: 'text-rose-400 hover:text-rose-600',
    inputRing: 'focus:ring-1 focus:ring-rose-300',
    addBtnBorder: 'border-rose-200', addBtnBg: 'bg-rose-100/50 hover:bg-rose-100', addBtnText: 'text-rose-800',
  },
  amber: {
    card: 'bg-amber-50/40 border-amber-100',
    itemBorder: 'border-amber-100', itemText: 'text-amber-950',
    deleteBtn: 'text-amber-400 hover:text-amber-600',
    inputRing: 'focus:ring-1 focus:ring-amber-300',
    addBtnBorder: 'border-amber-200', addBtnBg: 'bg-amber-100/50 hover:bg-amber-100', addBtnText: 'text-amber-800',
  },
  teal: {
    card: 'bg-teal-50/30 border-teal-100',
    itemBorder: 'border-teal-100', itemText: 'text-teal-950',
    deleteBtn: 'text-teal-400 hover:text-teal-600',
    inputRing: 'focus:ring-1 focus:ring-teal-300',
    addBtnBorder: 'border-teal-200', addBtnBg: 'bg-teal-100/55 hover:bg-teal-100', addBtnText: 'text-teal-850',
  },
};

function ChecklistSection({
  labels, points, inputValue, onInputChange, onAdd, onRemove, isReadOnly, className = '',
}: ChecklistSectionProps) {
  const colors = CHECKLIST_COLORS[labels.colorScheme];
  const titleColor = labels.colorScheme === 'red' ? 'text-red-800'
    : labels.colorScheme === 'rose' ? 'text-rose-800'
    : labels.colorScheme === 'amber' ? 'text-amber-800'
    : 'text-teal-800';
  const descColor = labels.colorScheme === 'red' ? 'text-red-600'
    : labels.colorScheme === 'rose' ? 'text-rose-600'
    : labels.colorScheme === 'amber' ? 'text-amber-600'
    : 'text-teal-600';

  return (
    <div className={`${colors.card} border p-4.5 rounded-2xl space-y-3.5 ${className}`}>
      <div>
        <span className={`text-xs font-extrabold uppercase ${titleColor} tracking-wider block`}>{labels.title}</span>
        <span className={`text-[10px] ${descColor} block mt-0.5 leading-normal`}>
          {labels.description}
        </span>
      </div>

      <div className={`space-y-1.5 max-h-[160px] overflow-y-auto ${labels.colorScheme === 'teal' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : ''}`}>
        {points.length === 0 ? (
          <p className={`text-[11px] text-slate-400 text-center py-2 ${labels.colorScheme === 'teal' ? 'sm:col-span-2' : ''}`}>{labels.emptyText}</p>
        ) : (
          points.map((pt) => (
            <div key={pt.pointId} className={`flex items-center justify-between gap-1.5 bg-white border ${colors.itemBorder} px-3 py-1.5 rounded-lg text-xs font-semibold ${colors.itemText}`}>
              <span>{pt.pointName}</span>
              {!isReadOnly && (
                <button onClick={() => onRemove(pt.pointId)} type="button" className={`${colors.deleteBtn} cursor-pointer`}>
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
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={labels.placeholder}
            className={`flex-1 text-xs font-medium border border-gray-200 p-2 rounded-lg bg-white outline-none ${colors.inputRing}`}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          />
          <button onClick={onAdd} type="button" className={`p-2 border ${colors.addBtnBorder} ${colors.addBtnBg} ${colors.addBtnText} font-bold rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer`}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Evaluation Section (Section header + 3x ChecklistSection)
// ============================================================

export interface EvaluationSectionProps {
  labels: EvaluationLabels;
  isReadOnly: boolean;
  isTemplateActive?: boolean;
  mandatoryPoints: { pointId: string; pointName: string }[];
  sellingPoints: { pointId: string; pointName: string }[];
  qualificationCriteria: { pointId: string; pointName: string }[];
  inputs: { mandatory: string; selling: string; qualification: string };
  setInputs: React.Dispatch<React.SetStateAction<{ mandatory: string; selling: string; qualification: string }>>;
  addMandatoryPoint: () => void;
  removeMandatoryPoint: (pointId: string) => void;
  addSellingPoint: () => void;
  removeSellingPoint: (pointId: string) => void;
  addQualification: () => void;
  removeQualification: (pointId: string) => void;
}

export function EvaluationSection({
  labels, isReadOnly, isTemplateActive = false,
  mandatoryPoints, sellingPoints, qualificationCriteria,
  inputs, setInputs,
  addMandatoryPoint, removeMandatoryPoint,
  addSellingPoint, removeSellingPoint,
  addQualification, removeQualification,
}: EvaluationSectionProps) {
  const readOnlyOrTemplate = isReadOnly || isTemplateActive;

  return (
    <div className="space-y-5 text-left">
      <div>
        <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          {labels.icon}
          <span>{labels.sectionTitle}</span>
        </h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-normal">
          {labels.sectionDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChecklistSection
          labels={labels.mandatory}
          points={mandatoryPoints}
          inputValue={inputs.mandatory}
          onInputChange={(v) => setInputs(prev => ({ ...prev, mandatory: v }))}
          onAdd={addMandatoryPoint}
          onRemove={removeMandatoryPoint}
          isReadOnly={readOnlyOrTemplate}
        />
        <ChecklistSection
          labels={labels.keyPoints}
          points={sellingPoints}
          inputValue={inputs.selling}
          onInputChange={(v) => setInputs(prev => ({ ...prev, selling: v }))}
          onAdd={addSellingPoint}
          onRemove={removeSellingPoint}
          isReadOnly={readOnlyOrTemplate}
        />
        <ChecklistSection
          labels={labels.qualification}
          points={qualificationCriteria}
          inputValue={inputs.qualification}
          onInputChange={(v) => setInputs(prev => ({ ...prev, qualification: v }))}
          onAdd={addQualification}
          onRemove={removeQualification}
          isReadOnly={readOnlyOrTemplate}
          className="md:col-span-2"
        />
      </div>
    </div>
  );
}
