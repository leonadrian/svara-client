import React from 'react';
import { Sparkles, X, Edit2, PlayCircle, Save } from 'lucide-react';
import { BusinessScenario } from '../../types/index';
import { HeaderLabels, FooterLabels } from './types';

// ============================================================
// Header Section
// ============================================================

export interface HeaderSectionProps {
  labels: HeaderLabels;
  isReadOnly: boolean;
  editingScenario?: BusinessScenario | null;
  onClose: () => void;
}

export function HeaderSection({ labels, isReadOnly, editingScenario, onClose }: HeaderSectionProps) {
  const title = isReadOnly
    ? labels.titleReadOnly
    : editingScenario
      ? labels.titleEdit
      : labels.titleNew;

  return (
    <div className="px-6 py-4.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {labels.icon}
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          {title}
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
  );
}

// ============================================================
// Footer Section
// ============================================================

export interface FooterSectionProps {
  labels: FooterLabels;
  isReadOnly: boolean;
  submitting: boolean;
  onClose: () => void;
  onEditScenario?: () => void;
  onStartRoleplay?: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function FooterSection({
  labels, isReadOnly, submitting, onClose, onEditScenario, onStartRoleplay, handleSubmit
}: FooterSectionProps) {
  return (
    <div className="px-6 py-4.5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3.5">
      {isReadOnly ? (
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-250 hover:border-gray-350 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer font-semibold"
          >
            {labels.backToCatalogText}
          </button>

          {onEditScenario && (
            <button
              type="button"
              onClick={onEditScenario}
              className="px-5 py-2.5 border border-amber-250 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              {labels.editIcon}
              <span>{labels.editScenarioText}</span>
            </button>
          )}

          {onStartRoleplay && (
            <button
              type="button"
              onClick={onStartRoleplay}
              className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 font-bold hover:-translate-y-0.5"
            >
              {labels.roleplayIcon}
              <span>{labels.startRoleplayText}</span>
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
            {labels.cancelText}
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
                <span>{labels.savingText}</span>
              </>
            ) : (
              <>
                {labels.saveIcon}
                <span>{labels.saveText}</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
