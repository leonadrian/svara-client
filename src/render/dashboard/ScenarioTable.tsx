import React from 'react';
import { BusinessScenario } from '../../types/index';
import { Play, Edit2, Link2, BookOpen } from 'lucide-react';

interface ScenarioTableProps {
  scenarios: BusinessScenario[];
  role: string;
  currentUserId: string;
  onSimulate: (scenario: BusinessScenario) => void;
  onEdit?: (scenario: BusinessScenario) => void;
  onAssign?: (scenario: BusinessScenario) => void;
  userNamesMap: Record<string, string>;
}

export function ScenarioTable({ scenarios, role, currentUserId, onSimulate, onEdit, onAssign, userNamesMap }: ScenarioTableProps) {
  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-700">Belum Ada Skenario</h3>
        <p className="text-xs text-slate-500 mt-1">Skenario latihan belum tersedia atau Anda belum memiliki akses.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Skenario Latihan</th>
              <th className="px-6 py-4">Tipe / Industri</th>
              <th className="px-6 py-4">Dibuat Oleh</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scenarios.map((scenario) => (
              <tr key={scenario.scenarioId} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 border border-brand-100/50">
                      <BookOpen className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm max-w-xs truncate" title={scenario.title}>
                        {scenario.title}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-medium border border-slate-200">
                          ID: {scenario.scenarioId.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-700 font-medium capitalize flex items-center gap-1.5 text-xs">
                      {scenario.category === 'inbound' as any ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      )}
                      {scenario.category}
                    </span>

                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {(userNamesMap[scenario.createdBy] || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {userNamesMap[scenario.createdBy] || "Unknown User"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSimulate(scenario)}
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Mulai Latihan"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    
                    {(role === 'manager' || role === 'superadmin' || role === 'trainer') && onAssign && (
                      <button
                        onClick={() => onAssign(scenario)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Atur Akses Agen"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                    )}

                    {(role === 'manager' || role === 'superadmin' || scenario.createdBy === currentUserId) && onEdit && (
                      <button
                        onClick={() => onEdit(scenario)}
                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Skenario"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
