import React from 'react';
import { UserProfile, BusinessScenario, RecordingSession } from '../../types/index';
import { AgentView } from './views/AgentView';
import { TrainerView } from './views/TrainerView';
import { ManagerView } from './views/ManagerView';

interface DashboardRenderProps {
  userProfile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  
  // Data
  users: UserProfile[];
  scenarios: BusinessScenario[];
  recordings: RecordingSession[];
  
  // Computed & Filtered Data
  agentsOnly: UserProfile[];
  trainersOnly: UserProfile[];
  pendingProfiles: UserProfile[];
  assignedAgents: UserProfile[];
  availableScenarios: BusinessScenario[];
  myRecordings: RecordingSession[];
  
  // Maps
  userNamesMap: Record<string, string>;
  
  // Callbacks
  onTriggerScenarioBuilder: () => void;
  onSimulate: (scenario: BusinessScenario) => void;
  onEditScenario: (scenario: BusinessScenario) => void;
  onAssignScenario: (scenario: BusinessScenario) => void;
  onViewDetails: (recording: RecordingSession) => void;
  onApproveUser?: (userId: string, role: 'agent' | 'trainer') => void;
  onRejectUser?: (userId: string) => void;
  onAssignTrainerToAgent?: (agentId: string, trainerId: string) => void;
  onRefreshRecordings: () => void;
}

/**
 * Orchestrator Visual untuk merender susunan/layout yang benar berdasarkan Role
 */
export function DashboardRender(props: DashboardRenderProps) {
  const role = props.userProfile.role;

  if (role === 'agent') {
    return (
      <AgentView
        userProfile={props.userProfile}
        scenarios={props.availableScenarios}
        recordings={props.myRecordings}
        userNamesMap={props.userNamesMap}
        onSimulate={props.onSimulate}
        onViewDetails={props.onViewDetails}
        onRefreshRecordings={props.onRefreshRecordings}
      />
    );
  }

  if (role === 'trainer') {
    return (
      <TrainerView
        userProfile={props.userProfile}
        activeTab={props.activeTab}
        setActiveTab={props.setActiveTab}
        scenarios={props.availableScenarios}
        recordings={props.myRecordings}
        agents={props.assignedAgents}
        userNamesMap={props.userNamesMap}
        onTriggerScenarioBuilder={props.onTriggerScenarioBuilder}
        onSimulate={props.onSimulate}
        onEditScenario={props.onEditScenario}
        onAssignScenario={props.onAssignScenario}
        onViewDetails={props.onViewDetails}
        onRefreshRecordings={props.onRefreshRecordings}
      />
    );
  }

  // manager atau superadmin
  return (
    <ManagerView
      userProfile={props.userProfile}
      activeTab={props.activeTab}
      setActiveTab={props.setActiveTab}
      scenarios={props.availableScenarios}
      recordings={props.myRecordings}
      agents={props.agentsOnly}
      trainers={props.trainersOnly}
      pendingUsers={props.pendingProfiles}
      userNamesMap={props.userNamesMap}
      onTriggerScenarioBuilder={props.onTriggerScenarioBuilder}
      onSimulate={props.onSimulate}
      onEditScenario={props.onEditScenario}
      onAssignScenario={props.onAssignScenario}
      onViewDetails={props.onViewDetails}
      onApproveUser={props.onApproveUser!}
      onRejectUser={props.onRejectUser!}
      onAssignTrainerToAgent={props.onAssignTrainerToAgent!}
      onRefreshRecordings={props.onRefreshRecordings}
    />
  );
}
