import React from 'react';
import { useScenarioBuilder } from '../hooks/useScenario';
import { BusinessScenario } from '../types/index';
import { ScenarioBuilderRender } from '../render/ScenarioBuilderRender';

interface ScenarioBuilderProps {
  userId: string;
  onClose: () => void;
  onSaveSuccess: (scenario: BusinessScenario) => void;
  editingScenario?: BusinessScenario | null;
  userRole?: string;
  isReadOnly?: boolean;
  onStartRoleplay?: () => void;
  onEditScenario?: () => void;
}

export default function ScenarioBuilder({ 
  userId, 
  onClose, 
  onSaveSuccess, 
  editingScenario, 
  userRole,
  isReadOnly = false,
  onStartRoleplay,
  onEditScenario
}: ScenarioBuilderProps) {
  const builderState = useScenarioBuilder({
    userId,
    editingScenario,
    userRole,
    onSaveSuccess,
    onClose
  });

  return (
    <ScenarioBuilderRender
      userId={userId}
      onClose={onClose}
      editingScenario={editingScenario}
      userRole={userRole}
      isReadOnly={isReadOnly}
      onStartRoleplay={onStartRoleplay}
      onEditScenario={onEditScenario}
      {...builderState}
    />
  );
}
