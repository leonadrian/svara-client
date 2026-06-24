import { UserProfile, BusinessScenario, RecordingSession } from '../types/index';

export interface IUserService {
  getUser(id: string): Promise<UserProfile | null>;
  getUsers(): Promise<UserProfile[]>;
  createUser(id: string, user: UserProfile): Promise<void>;
  updateUser(id: string, updates: Partial<UserProfile>): Promise<void>;
  deleteUser(id: string): Promise<void>;
  subscribeUsers(onUpdate: (usersMap: Record<string, string>) => void, onError?: (err: any) => void): () => void;
  subscribeUserProfile(id: string, onUpdate: (profile: UserProfile | null) => void, onError?: (err: any) => void): () => void;
  subscribeUserList(onUpdate: (users: UserProfile[]) => void, onError?: (err: any) => void): () => void;
  getTrainerAgents(trainerId: string, isSuperadmin: boolean): Promise<UserProfile[]>;
  checkSuperadminExists(): Promise<boolean>;
  registerPendingUser(userId: string, userName: string, email: string): Promise<UserProfile>;
}

export interface IScenarioService {
  getScenarios(): Promise<BusinessScenario[]>;
  getScenario(id: string): Promise<BusinessScenario | null>;
  createScenario(id: string, scenario: BusinessScenario): Promise<void>;
  updateScenario(id: string, updates: Partial<BusinessScenario>): Promise<void>;
  deleteScenario(id: string): Promise<void>;
  subscribeScenarios(onUpdate: (scenarios: BusinessScenario[]) => void, onError?: (err: any) => void): () => void;
}

export interface IRecordingService {
  getRecordings(userProfile: UserProfile): Promise<RecordingSession[]>;
  getRecording(id: string): Promise<RecordingSession | null>;
  createRecording(id: string, recording: RecordingSession): Promise<void>;
  updateRecording(id: string, updates: Partial<RecordingSession>): Promise<void>;
  deleteRecording(id: string): Promise<void>;
  subscribeRecordings(userProfile: UserProfile, onUpdate: (recordings: RecordingSession[]) => void, onError?: (err: any) => void): () => void;
}

export interface IStorageService {
  uploadFile(path: string, file: Blob, mimeType?: string): Promise<string>;
  getDownloadUrl(path: string): Promise<string>;
}

export interface IServiceRegistry {
  userService: IUserService;
  scenarioService: IScenarioService;
  recordingService: IRecordingService;
  storageService: IStorageService;
}

