import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { BusinessScenario } from '../../types/index';
import { IScenarioService } from '../interfaces';
import { cleanFirestoreData } from './utils';

// Helper to fill in missing fields (e.g. allowedTrainers and allowedAgents) if undefined
export function enrichScenarioWithNewFields(data: any, id: string): BusinessScenario {
  if (!data) return null as any;
  return {
    scenarioId: id || data.scenarioId || '',
    category: data.category || 'sales',
    title: data.title || '',
    description: data.description || '',
    scenarioPoints: data.scenarioPoints || [],
    sentences: data.sentences || [],
    createdBy: data.createdBy || '',
    createdAt: data.createdAt || '',
    allowedTrainers: data.allowedTrainers || [],
    allowedAgents: data.allowedAgents || [],
  };
}

export class FirestoreScenarioService implements IScenarioService {
  async getScenarios(): Promise<BusinessScenario[]> {
    try {
      const snap = await getDocs(collection(db, 'svara/business-scenario/scenarios'));
      const list: BusinessScenario[] = [];
      snap.forEach((d) => {
        list.push(enrichScenarioWithNewFields(d.data(), d.id));
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'svara/business-scenario/scenarios');
      return [];
    }
  }

  async getScenario(id: string): Promise<BusinessScenario | null> {
    try {
      const snap = await getDoc(doc(db, 'svara/business-scenario/scenarios', id));
      if (snap.exists()) {
        return enrichScenarioWithNewFields(snap.data(), snap.id);
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `svara/business-scenario/scenarios/${id}`);
      return null;
    }
  }

  async createScenario(id: string, scenario: BusinessScenario): Promise<void> {
    try {
      const enriched = enrichScenarioWithNewFields(scenario, id);
      const sanitized = cleanFirestoreData(enriched);
      await setDoc(doc(db, 'svara/business-scenario/scenarios', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `svara/business-scenario/scenarios/${id}`);
    }
  }

  async updateScenario(id: string, updates: Partial<BusinessScenario>): Promise<void> {
    try {
      const sanitized = cleanFirestoreData(updates);
      await updateDoc(doc(db, 'svara/business-scenario/scenarios', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `svara/business-scenario/scenarios/${id}`);
    }
  }

  async deleteScenario(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'svara/business-scenario/scenarios', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `svara/business-scenario/scenarios/${id}`);
    }
  }

  subscribeScenarios(onUpdate: (scenarios: BusinessScenario[]) => void, onError?: (err: any) => void): () => void {
    const unsub = onSnapshot(collection(db, 'svara/business-scenario/scenarios'), (snapshot) => {
      const list: BusinessScenario[] = [];
      snapshot.forEach((d) => {
        list.push(enrichScenarioWithNewFields(d.data(), d.id));
      });
      onUpdate(list);
    }, (err) => {
      console.warn("Real-time scenarios snapshot failed:", err);
      if (onError) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'svara/business-scenario/scenarios');
        } catch (adaptedError) {
          onError(adaptedError);
        }
      }
    });
    return unsub;
  }
}
