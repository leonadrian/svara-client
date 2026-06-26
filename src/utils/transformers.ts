import { UserProfile, BusinessScenario } from '../types/index';

export interface MinimalAgentInfo {
  id?: string;
  userId?: string;
  name?: string;
  userName?: string;
}

/**
 * Builds the agent snapshot metadata for a recording session.
 * 
 * @param userProfile The current user's profile
 * @param isTrainerRole Whether the current user is a trainer
 * @param selectedAgent The agent being trained (if trainer is recording)
 */
export function buildAgentSnapshot(
  userProfile: UserProfile,
  isTrainerRole: boolean,
  selectedAgent: MinimalAgentInfo | null
) {
  const sAgentId = selectedAgent?.userId || selectedAgent?.id || '';
  const isUnregistered = sAgentId === 'unregistered' || sAgentId === '';

  const agentId = isTrainerRole && selectedAgent
    ? (isUnregistered ? null : sAgentId)
    : userProfile.userId;

  const agentName = isTrainerRole && selectedAgent
    ? (selectedAgent.userName || selectedAgent.name || 'Belum Buat Akun (Temporary)')
    : userProfile.userName;

  const assignedTrainerId = isTrainerRole
    ? userProfile.userId
    : (userProfile.role === 'agent' ? (userProfile as any).assignedTrainer || 'self' : 'self');

  const assignedTrainerName = isTrainerRole
    ? userProfile.userName
    : 'Self Review';

  return {
    agentId,
    agentName,
    assignedTrainerId,
    assignedTrainerName
  };
}

/**
 * Builds the scenario snapshot metadata for a recording session.
 * 
 * @param scenario The business scenario info
 */
export function buildScenarioSnapshot(scenario: Partial<BusinessScenario> | null) {
  return {
    scenarioId: scenario?.scenarioId || 'manual',
    scenarioTitle: scenario?.title || 'Latihan Mandiri / Bebas'
  };
}
