import React from 'react';
import { 
  PlayCircle, Eye, Shield, Plus, Search, BookOpen, Clock, Calendar, User 
} from 'lucide-react';
import { BusinessScenario } from '../types/business-scenario';

interface ScenarioViewerRenderProps {
  filteredScenarios: BusinessScenario[];
  userRole: string;
  userNamesMap: Record<string, string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: 'all' | 'sales' | 'verification';
  setSelectedCategory: (category: 'all' | 'sales' | 'verification') => void;
  onTriggerSimulator: (scenario: BusinessScenario, preselectedAgentId?: string) => void;
  onTriggerScenarioDetail: (scenario: BusinessScenario) => void;
  onTriggerScenarioBuilder?: () => void;
  onManageAccess?: (scenario: BusinessScenario) => void;
  canCreate: boolean;
}

export function ScenarioViewerRender({
  filteredScenarios,
  userRole,
  userNamesMap,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onTriggerSimulator,
  onTriggerScenarioDetail,
  onTriggerScenarioBuilder,
  onManageAccess,
  canCreate,
}: ScenarioViewerRenderProps) {
  return (
    <div className="space-y-5 text-left font-sans">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 p-4 rounded-2xl border border-slate-200/80 shadow-3xs backdrop-blur-md">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari skenario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all font-medium"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50 self-start sm:self-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-[11px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-850 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedCategory('sales')}
              className={`text-[11px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'sales'
                  ? 'bg-white text-indigo-750 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              Telesales
            </button>
            <button
              onClick={() => setSelectedCategory('verification')}
              className={`text-[11px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'verification'
                  ? 'bg-white text-rose-750 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              Verifikasi
            </button>
          </div>
        </div>

        {/* Create Scenario Button (Manager/Trainer Only) */}
        {canCreate && onTriggerScenarioBuilder && (
          <button
            onClick={onTriggerScenarioBuilder}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-500/10 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Skenario</span>
          </button>
        )}
      </div>

      {/* Grid List */}
      {filteredScenarios.length === 0 ? (
        <div className="py-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">
            {searchQuery 
              ? `Tidak ada skenario yang cocok dengan kata kunci "${searchQuery}"`
              : "Tidak ada skenario latihan yang tersedia saat ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScenarios.map((sc) => (
            <div 
              key={sc.scenarioId} 
              className="bg-white border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all rounded-2xl p-5 flex flex-col justify-between shadow-xxs space-y-4 text-left"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-1.5">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    sc.category === 'sales' 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {sc.category === 'sales' ? 'Telesales Pro' : 'Verification Compliance'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{sc.sentences?.length || 0} Giliran</span>
                  </span>
                </div>
                <h4 className="font-extrabold font-display text-slate-900 leading-snug line-clamp-2 text-sm md:text-base">{sc.title}</h4>
                <p className="text-xs text-slate-450 line-clamp-3 leading-relaxed font-semibold">{sc.description}</p>
                
                {/* Meta details (Creator & DateTime) */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-400/90 pt-3.5 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-semibold">
                    <User className="h-3 w-3 text-slate-350" />
                    <span>{userNamesMap?.[sc.createdBy] || sc.createdBy || 'Diana Santoso'}</span>
                  </span>
                  <span className="text-slate-205">•</span>
                  <span className="flex items-center gap-1 font-mono font-semibold">
                    <Calendar className="h-3 w-3 text-slate-350" />
                    <span>{new Date(sc.createdAt || Date.now()).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                {/* manage access button for Trainer/Manager role */}
                {(userRole === 'trainer' || userRole === 'manager') && onManageAccess && (
                  <button
                    onClick={() => onManageAccess(sc)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-200 text-slate-650 hover:text-indigo-850 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer mr-auto"
                    title="Atur akses agen mandiri untuk skenario ini"
                  >
                    <Shield className="h-3.5 w-3.5 text-slate-400" />
                    <span>Akses Agen</span>
                  </button>
                )}

                <div className="flex gap-1.5">
                  <button
                    onClick={() => onTriggerScenarioDetail(sc)}
                    className="py-1.5 px-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xxs"
                    title="Detail Skenario"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Detil</span>
                  </button>
                  <button
                    onClick={() => onTriggerSimulator(sc)}
                    className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm shadow-indigo-600/10"
                    title="Mulai Simulasi"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>Mulai</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
