
// Types for Offline Actions
export type OfflineActionType = 
  | 'ADD_LEAD' | 'UPDATE_LEAD' | 'DELETE_LEAD'
  | 'ADD_DEAL' | 'UPDATE_DEAL' 
  | 'ADD_TASK' | 'UPDATE_TASK' | 'DELETE_TASK'
  | 'ADD_CONTACT' | 'UPDATE_CONTACT'
  | 'ADD_ACCOUNT' | 'UPDATE_ACCOUNT';

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: any;
  timestamp: string;
}

const QUEUE_KEY = 'nova_offline_queue';

// --- State Persistence Helpers ---

export const saveStateToStorage = <T>(key: string, state: T) => {
  try {
    localStorage.setItem(`nova_state_${key}`, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state to local storage', e);
  }
};

export const loadStateFromStorage = <T>(key: string, defaultState: T): T => {
  try {
    const saved = localStorage.getItem(`nova_state_${key}`);
    const parsed = saved ? JSON.parse(saved) : null;
    // Self-healing recovery: If storage has been overwritten with an empty array (like [] during performance state splits),
    // and the default mock state is a populated dataset, gracefully heal by restoring the default seeded data.
    if (parsed === null || (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(defaultState) && defaultState.length > 0)) {
       return defaultState;
    }
    return parsed;
  } catch (e) {
    return defaultState;
  }
};

// --- Sync Queue Management ---

export const getSyncQueue = (): OfflineAction[] => {
  try {
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
};

export const addToSyncQueue = (type: OfflineActionType, payload: any) => {
  const queue = getSyncQueue();
  const action: OfflineAction = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    payload,
    timestamp: new Date().toISOString()
  };
  queue.push(action);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return queue.length;
};

export const clearSyncQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

// --- Sync Simulation ---

export const syncDataWithBackend = async (): Promise<number> => {
  const queue = getSyncQueue();
  if (queue.length === 0) return 0;

  console.log("Starting Sync Process...", queue);

  // Simulate network latency for syncing data to a real backend
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real app, you would iterate through `queue` and make API calls here.
  // Example:
  // for (const action of queue) {
  //    await api.post('/sync', action);
  // }

  const count = queue.length;
  clearSyncQueue();
  return count;
};
