import React from 'react';
import { UserProfile, BusinessScenario } from '../../../types/index';
import { StatCards } from '../StatCards';
import { ScenarioTable } from '../ScenarioTable';
import RecordingDashboardTab from '../../../components/RecordingDashboardTab';
import { UserManagementTable } from '../UserManagementTable';
import { DashboardHero } from '../DashboardHero';
import { Plus } from 'lucide-react';

interface TrainerViewProps {
  userProfile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  scenarios: BusinessScenario[];
  recordings: any[];
  agents: UserProfile[];
  userNamesMap: Record<string, string>;
  onTriggerScenarioBuilder: () => void;
  onSimulate: (scenario: BusinessScenario) => void;
  onEditScenario: (scenario: BusinessScenario) => void;
  onAssignScenario: (scenario: BusinessScenario) => void;
  onViewDetails: (recording: any) => void;
  onRefreshRecordings: () => void;
}

export function TrainerView({
  userProfile,
  activeTab,
  setActiveTab,
  scenarios,
  recordings,
  agents,
  userNamesMap,
  onTriggerScenarioBuilder,
  onSimulate,
  onEditScenario,
  onAssignScenario,
  onViewDetails,
  onRefreshRecordings
}: TrainerViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <DashboardHero userProfile={userProfile} />
      
      <StatCards 
        totalAgents={agents.length}  
        totalTrainers={0} // not used in trainer view
        totalRecordings={recordings.length} 
        totalScenarios={scenarios.length} 
        role="trainer" 
        onCardClick={setActiveTab}
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'agents' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Agen Bimbingan ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'scenarios' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Skenario
            </button>
            <button
              onClick={() => setActiveTab('recordings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'recordings' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Hasil Latihan
            </button>
          </div>

          {activeTab === 'scenarios' && (
            <button
              onClick={onTriggerScenarioBuilder}
              className="py-1.5 px-3.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Scenario Baru</span>
            </button>
          )}
        </div>

        <div className="p-6 bg-slate-50/30">
          {activeTab === 'agents' && (
            <UserManagementTable 
              users={agents} 
              role="trainer" 
              tabType="agents" 
            />
          )}
          {activeTab === 'scenarios' && (
            <ScenarioTable 
              scenarios={scenarios} 
              role="trainer" 
              currentUserId={userProfile.userId}
              userNamesMap={userNamesMap}
              onSimulate={onSimulate}
              onEdit={onEditScenario}
              onAssign={onAssignScenario}
            />
          )}
          {activeTab === 'recordings' && (
            <div className="overflow-hidden rounded-2xl shadow-sm border border-slate-200">
              <RecordingDashboardTab 
                userProfile={userProfile}
                scenarios={scenarios}
                recordings={recordings}
                userNamesMap={userNamesMap}
                onViewDetails={onViewDetails}
                onRefresh={onRefreshRecordings}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
