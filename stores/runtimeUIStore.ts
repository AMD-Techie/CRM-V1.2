import { create } from 'zustand';

export type RuntimeConsoleTab = 
  | 'overview' 
  | 'workflow' 
  | 'events' 
  | 'skills' 
  | 'capabilities' 
  | 'policy' 
  | 'checkpoints' 
  | 'diagnostics' 
  | 'replay';

export interface RuntimeUIState {
  selectedRunId: string | null;
  selectedEventId: string | null;
  selectedNodeId: string | null;
  selectedCheckpointId: string | null;
  activeTab: RuntimeConsoleTab;
  replayStep: number;
  isPlayingReplay: boolean;
  eventFilterType: string;
  timelineExpanded: boolean;
  statusFilter: string;
  agentFilter: string;
  workflowFilter: string;
  
  // Actions
  setSelectedRunId: (runId: string | null) => void;
  setSelectedEventId: (eventId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedCheckpointId: (checkpointId: string | null) => void;
  setActiveTab: (tab: RuntimeConsoleTab) => void;
  setReplayStep: (step: number) => void;
  setIsPlayingReplay: (isPlaying: boolean) => void;
  setEventFilterType: (filterType: string) => void;
  toggleTimelineExpanded: () => void;
  setStatusFilter: (status: string) => void;
  setAgentFilter: (agentId: string) => void;
  setWorkflowFilter: (workflowId: string) => void;
  resetFilters: () => void;
}

export const useRuntimeUIStore = create<RuntimeUIState>((set) => ({
  selectedRunId: null,
  selectedEventId: null,
  selectedNodeId: null,
  selectedCheckpointId: null,
  activeTab: 'overview',
  replayStep: 0,
  isPlayingReplay: false,
  eventFilterType: 'all',
  timelineExpanded: false,
  statusFilter: 'all',
  agentFilter: 'all',
  workflowFilter: 'all',

  setSelectedRunId: (runId) => set({ selectedRunId: runId, selectedEventId: null, selectedNodeId: null, replayStep: 0, isPlayingReplay: false }),
  setSelectedEventId: (eventId) => set({ selectedEventId: eventId }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  setSelectedCheckpointId: (checkpointId) => set({ selectedCheckpointId: checkpointId }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setReplayStep: (step) => set({ replayStep: step }),
  setIsPlayingReplay: (isPlaying) => set({ isPlayingReplay: isPlaying }),
  setEventFilterType: (filterType) => set({ eventFilterType: filterType }),
  toggleTimelineExpanded: () => set((state) => ({ timelineExpanded: !state.timelineExpanded })),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setAgentFilter: (agentId) => set({ agentFilter: agentId }),
  setWorkflowFilter: (workflowId) => set({ workflowFilter: workflowId }),
  resetFilters: () => set({ statusFilter: 'all', agentFilter: 'all', workflowFilter: 'all', eventFilterType: 'all' })
}));
