import { IScenarioService } from '../interfaces';
import { BusinessScenario } from '../../types/index';
import { apiFetch } from './apiClient';

export class ScenarioApiService implements IScenarioService {
  async getScenarios(): Promise<BusinessScenario[]> {
    return await apiFetch<BusinessScenario[]>('/api/svara/scenario');
  }

  async getScenario(id: string): Promise<BusinessScenario | null> {
    try {
      return await apiFetch<BusinessScenario>(`/api/svara/scenario/${id}`);
    } catch (err: any) {
      if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
        return null;
      }
      throw err;
    }
  }

  async createScenario(id: string, scenario: BusinessScenario): Promise<void> {
    await apiFetch(`/api/svara/scenario/${id}`, {
      method: 'POST',
      body: JSON.stringify(scenario)
    });
  }

  async updateScenario(id: string, updates: Partial<BusinessScenario>): Promise<void> {
    await apiFetch(`/api/svara/scenario/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteScenario(id: string): Promise<void> {
    await apiFetch(`/api/svara/scenario/${id}`, {
      method: 'DELETE'
    });
  }

  subscribeScenarios(onUpdate: (scenarios: BusinessScenario[]) => void, onError?: (err: any) => void): () => void {
    let active = true;
    const poll = async () => {
      try {
        const scenarios = await this.getScenarios();
        if (active) onUpdate(scenarios);
      } catch (err) {
        if (active && onError) onError(err);
      }
    };

    poll();
    const interval = setInterval(poll, 15000); // Scenarios change rarely, poll every 15s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }
}
