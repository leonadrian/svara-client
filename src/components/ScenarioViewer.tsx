import React from 'react';
import { BusinessScenario } from '../types/index';
import { useScenarioViewer } from '../hooks/useScenario';
import { ScenarioViewerRender } from '../render/ScenarioViewerRender';

interface ScenarioViewerProps {
  scenarios: BusinessScenario[];
  userRole?: string;
  userNamesMap?: Record<string, string>;
  onTriggerSimulator: (scenario: BusinessScenario, preselectedAgentId?: string) => void;
  onTriggerScenarioDetail: (scenario: BusinessScenario) => void;
  onTriggerScenarioBuilder?: () => void;
  onManageAccess?: (scenario: BusinessScenario) => void;
}

export default function ScenarioViewer(props: ScenarioViewerProps) {
  const {
    scenarios,
    userRole = 'agent',
    userNamesMap = {},
  } = props;

  const viewerState = useScenarioViewer({ scenarios });
  const canCreate = userRole === 'manager' || userRole === 'trainer';

  return (
    <ScenarioViewerRender
      {...props}
      {...viewerState}
      userRole={userRole}
      userNamesMap={userNamesMap}
      canCreate={canCreate}
    />
  );
}

