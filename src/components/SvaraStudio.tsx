import React from 'react';
import { BusinessScenario, RecordingSession, UserProfile } from '../types/index';
import { useSvaraStudioSimulation } from '../hooks/useSvaraStudioSimulation';
import { SvaraStudioRender } from '../render/SvaraStudioRender';

export { Info, AlignLeft } from 'lucide-react';

interface SvaraStudioProps {
  userProfile: UserProfile;
  scenario: BusinessScenario;
  assignedAgents: UserProfile[]; // If trainer, list of agents
  onClose: () => void;
  onSuccess: (recording: RecordingSession) => void;
  preselectedAgentId?: string;
  allScenarios?: BusinessScenario[];
}

export default function SvaraStudio(props: SvaraStudioProps) {
  const { 
    userProfile, 
    scenario: initialScenario, 
    assignedAgents, 
    onClose, 
    onSuccess,
    preselectedAgentId
  } = props;

  const simulation = useSvaraStudioSimulation({
    userProfile,
    initialScenario,
    assignedAgents,
    onClose,
    onSuccess,
    preselectedAgentId
  });

  const { scenario, onSuccess: _onSuccess, preselectedAgentId: _preselectedAgentId, ...renderPropsFromProps } = props;

  return (
    <SvaraStudioRender
      {...renderPropsFromProps}
      {...simulation}
      {...simulation.recorder}
    />
  );
}
