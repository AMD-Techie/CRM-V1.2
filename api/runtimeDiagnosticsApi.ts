import { RuntimeDiagnosticItem } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_DIAGNOSTICS: RuntimeDiagnosticItem[] = [
  {
    category: 'Context',
    status: 'healthy',
    label: 'Context Resolution Subsystem',
    detail: 'Normalized CRM context and route attributes resolved with zero schema drift.',
    metric: '100% Attributed'
  },
  {
    category: 'Workflow',
    status: 'healthy',
    label: 'Workflow Graph Compiler',
    detail: 'Execution graph compiled with valid DAG topology, zero cyclic deadlocks.',
    metric: '2 Graphs Active'
  },
  {
    category: 'Knowledge',
    status: 'healthy',
    label: 'Knowledge Plane Index',
    detail: 'Semantic search responding in <12ms across all 4 indexed collections.',
    metric: '4 Sources Ready'
  },
  {
    category: 'Skills',
    status: 'healthy',
    label: 'Hermes Procedural Skills',
    detail: 'All 4 published business skills validated with active capability bindings.',
    metric: '4/4 Published'
  },
  {
    category: 'Capabilities',
    status: 'healthy',
    label: 'Capability Boundary Isolation',
    detail: '12 business capabilities registered with strict input/output contracts.',
    metric: '12 Active'
  },
  {
    category: 'Policy',
    status: 'healthy',
    label: 'Authoritative Backend Policy Engine',
    detail: 'Enforcing tenant isolation and Human-in-the-Loop gates on high-risk outbound operations.',
    metric: '0 Breaches'
  },
  {
    category: 'Model',
    status: 'healthy',
    label: 'AI Model Registry & Providers',
    detail: 'Primary Google Vertex and backup provider latency within normal 1800ms SLA.',
    metric: '1800ms Avg'
  },
  {
    category: 'Actions',
    status: 'healthy',
    label: 'Action Staging Engine',
    detail: 'Structured AIAction generation aligned with schema validation standards.',
    metric: '100% Typed'
  },
  {
    category: 'Approvals',
    status: 'healthy',
    label: 'Approval Center Synchronizer',
    detail: 'Bidirectional sync active between execution pauses and human review queue.',
    metric: '3 Pending'
  },
  {
    category: 'Execution',
    status: 'healthy',
    label: 'Runtime Orchestrator Engine',
    detail: 'State machine progressing from queued through completion with idempotency safeguards.',
    metric: '97.4% Success'
  },
  {
    category: 'Performance',
    status: 'healthy',
    label: 'Latency & Throughput',
    detail: 'Average execution run duration is 4.8s across all automated pipelines.',
    metric: '4.8s Mean'
  },
  {
    category: 'Cost',
    status: 'healthy',
    label: 'Token & Cost Tracking',
    detail: 'Usage within allocated tenant tier quota ($18.40 of $500.00 monthly allowance).',
    metric: '$18.40'
  },
  {
    category: 'Failures',
    status: 'healthy',
    label: 'Error Classification Engine',
    detail: 'Zero unclassified exceptions; all failures categorized by typed failure enum.',
    metric: '0 Unknown'
  },
  {
    category: 'Checkpoints',
    status: 'healthy',
    label: 'Runtime State Checkpoints',
    detail: 'Durable sequence snapshots created at major workflow transitions for state recovery.',
    metric: 'Validated'
  },
  {
    category: 'Replay',
    status: 'healthy',
    label: 'Observable State Replay Bus',
    detail: 'Append-only event logs fully reconstruct execution progression without private CoT.',
    metric: 'Replay Ready'
  }
];

export const runtimeDiagnosticsApi = {
  async getDiagnostics(): Promise<RuntimeDiagnosticItem[]> {
    return apiClient.get<RuntimeDiagnosticItem[]>('/ai/runtime/diagnostics', INITIAL_DIAGNOSTICS);
  }
};
