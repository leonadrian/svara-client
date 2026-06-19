export type ScenarioCategory = 'sales' | 'verification'
export type CustomerResponseCategory = 'general' | 'objection' | 'question'
export type ScenarioPointType = "qualification" | "mandatory" | "key_point";


export interface BaseSentence {
  sentenceId: string;
  scenarioId: string; // foreign key ke BusinessScenario
  sequence: number;
  text: string;
  description?: string;
}

export type ScenarioSentence =
|AgentSentence
|CustomerSentence;

// agent sentence
export interface AgentSentence extends BaseSentence {
  speaker: 'agent';
  intentIds: string[];
  scenarioPointIds: string[];
}

export interface Intent {
  intentId: string;
  intentName: string;
  intentDescription: string;
}


// customer response
export interface CustomerSentence extends BaseSentence {
  speaker: 'customer';
  responseType: CustomerResponseCategory;
}

export interface ScenarioPoint {
  pointId: string;
  scenarioId: string; // foreign key ke BusinessScenario
  pointType: ScenarioPointType;
  pointName: string;
  description?: string;
}

export interface BusinessScenario {
  scenarioId: string;
  category: ScenarioCategory;
  title: string;
  description: string;

  scenarioPoints: ScenarioPoint[];
  sentences: ScenarioSentence[];
  
  // metadata
  createdBy: string;
  createdAt: string;

  // user management
  allowedTrainers?: string[]; // Access control for trainers (when created by manager)
  allowedAgents?: string[]; // Access control for agents (when assigned by trainer)
}
