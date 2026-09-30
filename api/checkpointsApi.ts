import { RuntimeCheckpoint } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_CHECKPOINTS: Record<string, RuntimeCheckpoint[]> = {
  'run_lq_9082': [
    {
      id: 'chk_9082_1',
      runId: 'run_lq_9082',
      sequence: 14,
      nodeId: 'node_context_fetch',
      nodeName: 'Resolve Lead Dossier',
      createdAt: '10:30:04',
      status: 'validated',
      snapshotSummary: 'Lead dossier loaded, score computed (85/100), policy approved.'
    },
    {
      id: 'chk_9082_2',
      runId: 'run_lq_9082',
      sequence: 17,
      nodeId: 'node_action_stage_update',
      nodeName: 'Advance Stage to Qualified',
      createdAt: '10:30:06',
      status: 'validated',
      snapshotSummary: 'Stage transition committed; rep task scheduled.'
    }
  ],
  'run_fu_9083': [
    {
      id: 'chk_9083_approval_gate',
      runId: 'run_fu_9083',
      sequence: 10,
      nodeId: 'node_human_approval_gate',
      nodeName: 'Human-in-the-Loop Signoff Gate',
      createdAt: '10:45:04',
      status: 'validated',
      snapshotSummary: 'Outreach email payload drafted; awaiting human authorization in Approval Center.'
    }
  ]
};

export const checkpointsApi = {
  async getCheckpointsByRunId(runId: string): Promise<RuntimeCheckpoint[]> {
    const saved = localStorage.getItem(`nova_checkpoints_${runId}`);
    if (saved) {
      return apiClient.get<RuntimeCheckpoint[]>(`/ai/runtime/runs/${runId}/checkpoints`, JSON.parse(saved));
    }
    const defaultList = INITIAL_CHECKPOINTS[runId] || [];
    return apiClient.get<RuntimeCheckpoint[]>(`/ai/runtime/runs/${runId}/checkpoints`, defaultList);
  },

  async createCheckpoint(runId: string, nodeId: string, nodeName: string, summary: string): Promise<RuntimeCheckpoint> {
    const existing = await checkpointsApi.getCheckpointsByRunId(runId);
    const newCheckpoint: RuntimeCheckpoint = {
      id: `chk_${Date.now()}`,
      runId,
      sequence: (existing.length + 1) * 5,
      nodeId,
      nodeName,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'created',
      snapshotSummary: summary
    };

    const updated = [...existing, newCheckpoint];
    localStorage.setItem(`nova_checkpoints_${runId}`, JSON.stringify(updated));
    return apiClient.post<RuntimeCheckpoint>(`/ai/runtime/runs/${runId}/checkpoints`, newCheckpoint, newCheckpoint);
  }
};
