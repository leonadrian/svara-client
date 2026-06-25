import React from 'react';
import { UserProfile, BusinessScenario, RecordingSession } from '../../../types/index';
import { StatCards } from '../StatCards';

import { DashboardHero } from '../DashboardHero';
import { PlayCircle } from 'lucide-react';
import RecordingDashboardTab from '../../../components/RecordingDashboardTab';

interface AgentViewProps {
  userProfile: UserProfile;
  scenarios: BusinessScenario[];
  recordings: any[];
  userNamesMap: Record<string, string>;
  onSimulate: (scenario: BusinessScenario) => void;
  onViewDetails: (recording: any) => void;
  onRefreshRecordings: () => void;
}

export function AgentView({
  userProfile,
  scenarios,
  recordings,
  userNamesMap,
  onSimulate,
  onViewDetails,
  onRefreshRecordings
}: AgentViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <DashboardHero userProfile={userProfile} />
      
      <StatCards 
        totalAgents={0} 
        totalTrainers={0} 
        totalRecordings={recordings.length} 
        totalScenarios={scenarios.length} 
        role="agent" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Skenario */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Skenario Tersedia</h3>
          </div>
          
          <div className="space-y-3">
            {scenarios.map(sc => (
              <div key={sc.scenarioId} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-brand-300 transition-colors group">
                <div className="font-bold text-slate-800">{sc.title}</div>
                <div className="text-xs text-slate-500 mt-1 mb-4 flex gap-2">
                  <span className="capitalize">{sc.category}</span>
                </div>
                <button
                  onClick={() => onSimulate(sc)}
                  className="w-full py-2 bg-slate-50 text-brand-600 font-bold text-xs rounded-xl hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center justify-center gap-2 border border-slate-100 group-hover:border-brand-200"
                >
                  <PlayCircle className="h-4 w-4" /> Mulai Simulasi
                </button>
              </div>
            ))}
            
            {scenarios.length === 0 && (
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">Belum ada skenario yang ditugaskan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Rekaman */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Riwayat Latihan Terakhir</h3>
          </div>
          <RecordingDashboardTab 
            userProfile={userProfile}
            scenarios={scenarios}
            recordings={recordings}
            userNamesMap={userNamesMap}
            onViewDetails={onViewDetails}
            onRefresh={onRefreshRecordings}
          />
        </div>
      </div>
    </div>
  );
}
