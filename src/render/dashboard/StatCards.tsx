import React from 'react';
import { Users, Award, PlayCircle, BookOpen } from 'lucide-react';

interface StatCardsProps {
  totalAgents: number;
  totalTrainers: number;
  totalRecordings: number;
  totalScenarios: number;
  role: string;
  onCardClick?: (tab: string) => void;
}

export function StatCards({ totalAgents, totalTrainers, totalRecordings, totalScenarios, role, onCardClick }: StatCardsProps) {
  const cardClassName = "bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all";
  const interactiveClassName = onCardClick ? " cursor-pointer hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5" : "";
  const finalClassName = cardClassName + interactiveClassName;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      
      {(role === 'manager' || role === 'superadmin') && (
        <div 
          className={finalClassName}
          onClick={() => onCardClick && onCardClick('agents')}
        >
          <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Agen Aktif</span>
            <span className="text-2xl font-black text-slate-900 font-display">{totalAgents} Agen</span>
          </div>
        </div>
      )}

      {(role === 'manager' || role === 'superadmin') && (
        <div 
          className={finalClassName}
          onClick={() => onCardClick && onCardClick('trainers')}
        >
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Trainer Terdaftar</span>
            <span className="text-2xl font-black text-slate-900 font-display">{totalTrainers} Trainer</span>
          </div>
        </div>
      )}

      {(role === 'trainer') && (
        <div 
          className={finalClassName}
          onClick={() => onCardClick && onCardClick('agents')}
        >
          <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Agen Bimbingan</span>
            <span className="text-2xl font-black text-slate-900 font-display">{totalAgents} Agen</span>
          </div>
        </div>
      )}

      <div 
        className={finalClassName}
        onClick={() => onCardClick && onCardClick('recordings')}
      >
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
          <PlayCircle className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Latihan Tersimpan</span>
          <span className="text-2xl font-black text-slate-900 font-display">{totalRecordings} Sesi</span>
        </div>
      </div>

      <div 
        className={finalClassName}
        onClick={() => onCardClick && onCardClick('scenarios')}
      >
        <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Skenario Aktif</span>
          <span className="text-2xl font-black text-slate-900 font-display">{totalScenarios} Skenario</span>
        </div>
      </div>

    </div>
  );
}
