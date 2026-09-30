export type AIActionStatus = 
  | 'informational' 
  | 'recommended' 
  | 'prepared' 
  | 'approval_required' 
  | 'executed' 
  | 'rejected';

export type AgentCapability = 
  | 'search_leads'
  | 'read_customer'
  | 'analyze_opportunity'
  | 'create_task'
  | 'draft_email'
  | 'draft_whatsapp'
  | 'schedule_meeting'
  | 'enrich_company_data'
  | 'calculate_deal_risk'
  | 'generate_executive_brief';

export type AgentCategory = 
  | 'lead_qualification'
  | 'deal_acceleration'
  | 'risk_management'
  | 'account_expansion'
  | 'customer_support'
  | 'executive_advisory';

export type ApprovalPolicy = 'always_require' | 'require_on_external_comms' | 'autonomous';

export interface AgentPermissions {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  send: boolean;
  approve: boolean;
  execute: boolean;
  accessTier: 'info_only' | 'staged_actions' | 'direct_execution';
}

export interface AgentTriggerConfig {
  id: string;
  type: 'manual' | 'event' | 'schedule' | 'copilot';
  name: string;
  description: string;
  eventType?: 'lead_created' | 'deal_stage_changed' | 'task_overdue' | 'meeting_completed' | 'inactivity_threshold' | 'high_value_detected';
  scheduleCron?: string;
  enabled: boolean;
}

export interface AgentActionPolicy {
  actionType: string;
  label: string;
  policy: ApprovalPolicy;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface AIProvider {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  icon?: string;
  description?: string;
}

export interface AIModelDefinition {
  id: string;
  providerId: string;
  name: string;
  tagline?: string;
  capabilities: string[];
  contextWindow?: number;
  supportsTools?: boolean;
  supportsStreaming?: boolean;
  recommendedFor?: string;
  status: 'available' | 'unavailable';
}

export interface AgentVersion {
  version: string;
  status: 'published' | 'draft' | 'archived';
  instructions: string;
  purpose?: string;
  providerId?: string;
  modelId?: string;
  model: string;
  capabilities: AgentCapability[];
  guardrails: string[];
  knowledgeScope: string[];
  approvalPolicy: ApprovalPolicy;
  permissions?: AgentPermissions;
  triggers?: (string | AgentTriggerConfig)[];
  actionPolicies?: AgentActionPolicy[];
  createdAt: string;
  publishedAt?: string;
  changelog?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  tagline: string;
  description: string;
  purpose?: string;
  role: string;
  category?: AgentCategory | string;
  owner?: string;
  status: 'active' | 'paused' | 'draft';
  activeVersion: string;
  versions: AgentVersion[];
  capabilities: AgentCapability[];
  triggers: (string | AgentTriggerConfig)[];
  guardrails: string[];
  knowledgeScope: string[];
  approvalPolicy: ApprovalPolicy;
  permissions?: AgentPermissions;
  actionPolicies?: AgentActionPolicy[];
  totalExecutions: number;
  successRate: number;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   PHASE 5: RUNTIME EXECUTION LIFECYCLE CONTRACTS
   ========================================================================= */

export type AgentRunStatus = 
  | 'queued' 
  | 'initializing' 
  | 'context_resolving' 
  | 'knowledge_retrieving' 
  | 'planning' 
  | 'action_preparing' 
  | 'approval_required' 
  | 'executing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'
  | 'running' // for backward compatibility
  | 'paused'
  | 'waiting_for_approval'
  | 'retrying'
  | 'pending_approval'; // for backward compatibility

export type FailureCategory = 
  | 'policy_denied' 
  | 'approval_rejected' 
  | 'execution_failed' 
  | 'timeout' 
  | 'cancelled' 
  | 'context_resolution_failed' 
  | 'invalid_configuration'
  | 'runtime_guard_exceeded'
  | 'checkpoint_failure'
  | 'replay_unavailable'
  | 'handoff_failed';

export type ExecutionStepType = 
  | 'trigger' 
  | 'context_retrieval' 
  | 'knowledge_lookup' 
  | 'policy_evaluation'
  | 'planning'
  | 'analysis'
  | 'tool_call' 
  | 'recommendation' 
  | 'action_preparation' 
  | 'approval_request' 
  | 'approval_decision'
  | 'execution';

export interface AgentExecutionStep {
  stepNumber: number;
  timestamp: string;
  type: ExecutionStepType;
  label: string;
  summary: string;
  status: 'success' | 'running' | 'failed' | 'waiting_approval' | 'skipped';
  metadata?: Record<string, unknown>;
}

export type AgentRunTrigger = 'manual' | 'crm_event' | 'scheduled' | 'copilot' | 'parent_workflow' | 'handoff';

export interface AgentRuntimeContext {
  tenantId?: string;
  userId?: string;
  role?: string;
  userRole?: string;
  route?: string;
  viewName?: string;
  entityType?: 'lead' | 'contact' | 'account' | 'opportunity' | 'deal' | 'task' | 'meeting' | 'call' | 'general';
  targetEntityType?: 'lead' | 'deal' | 'contact' | 'account' | 'meeting' | 'task' | 'general';
  entityId?: string;
  targetEntityId?: string;
  entityName?: string;
  targetEntityName?: string;
  selectedEntityIds?: string[];
  selectedEntityNames?: string[];
  knowledgeScope?: string[];
  knowledgeSourceIds?: string[];
  skillIds?: string[];
  capabilityIds?: string[];
  executionConstraints?: Record<string, unknown>;
}

export type AgentExecutionContext = AgentRuntimeContext;

export interface AgentExecutionRequest {
  idempotencyKey?: string;
  agentId: string;
  agentVersion?: string;
  workflowId?: string;
  executionGraphId?: string;
  parentRunId?: string;
  trigger: AgentRunTrigger | string;
  triggerEvent?: string;
  context: AgentRuntimeContext;
  input?: Record<string, unknown> | string;
}

export interface AgentPolicyDecision {
  allowed: boolean;
  policy: ApprovalPolicy;
  riskLevel: 'high' | 'medium' | 'low';
  evaluationSummary: string;
  evaluatedBy: 'authoritative_policy_engine';
  timestamp: string;
}

export interface AgentRunResult {
  summary: string;
  actionIds?: string[];
  outputData?: Record<string, unknown>;
  confidenceScore?: number;
  executedAt?: string;
}

export interface AgentRunFailure {
  category: FailureCategory;
  message: string;
  nodeId?: string;
  stepNumber?: number;
  isRetryable: boolean;
  timestamp: string;
}

export interface AgentRun {
  id: string;
  idempotencyKey?: string;
  agentId: string;
  agentName: string;
  agentVersion?: string;
  agentVersionId?: string;
  workflowId?: string;
  workflowName?: string;
  executionGraphId?: string;
  parentRunId?: string;
  childRunIds?: string[];
  currentNodeId?: string;
  tenantId?: string;
  status: AgentRunStatus;
  trigger?: AgentRunTrigger | string;
  triggerEvent: string;
  targetEntityType: 'lead' | 'deal' | 'contact' | 'account' | 'meeting' | 'task' | 'general';
  targetEntityId?: string;
  targetEntityName?: string;
  selectedEntityIds?: string[];
  context?: AgentRuntimeContext;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  steps: AgentExecutionStep[];
  outputSummary?: string;
  error?: string;
  failureCategory?: FailureCategory;
  failure?: AgentRunFailure;
  result?: AgentRunResult;
  isRetryable?: boolean;
  retryCount?: number;
  actionId?: string;
  action?: AIAction;
  requiresApproval?: boolean;
  approvalId?: string;
  policyDecision?: AgentPolicyDecision;
  checkpointIds?: string[];
  input?: Record<string, unknown> | string;
}

/* =========================================================================
   PHASE 5: ORCHESTRATION & EXECUTION GRAPH CONTRACTS (PraisonAI reference)
   ========================================================================= */

export type ExecutionNodeType = 
  | 'agent' 
  | 'skill' 
  | 'action' 
  | 'approval' 
  | 'condition' 
  | 'parallel' 
  | 'loop' 
  | 'handoff';

export type ExecutionNodeStatus = 
  | 'pending' 
  | 'running' 
  | 'waiting_for_approval' 
  | 'completed' 
  | 'failed' 
  | 'skipped' 
  | 'cancelled';

export interface ExecutionNode {
  id: string;
  type: ExecutionNodeType;
  name: string;
  description?: string;
  status?: ExecutionNodeStatus;
  nextNodeIds?: string[];
  conditionExpression?: string;
  parallelBranchNodeIds?: string[];
  maxIterations?: number;
  currentIteration?: number;
  targetAgentId?: string;
  targetAgentName?: string;
  skillId?: string;
  skillName?: string;
  capabilityId?: string;
  actionType?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  executionDurationMs?: number;
  lastError?: string;
}

export interface ExecutionGraph {
  id: string;
  name: string;
  description?: string;
  agentVersionId?: string;
  workflowId?: string;
  version: string;
  entryNodeId: string;
  nodes: ExecutionNode[];
  createdAt: string;
  updatedAt: string;
}

export interface RuntimeGuardPolicy {
  maxIterations?: number;
  maxToolCalls?: number;
  maxDurationSeconds?: number;
  maxChildRuns?: number;
  maxActions?: number;
  maxCost?: number;
  duplicateActionDetection?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  executionGraphId: string;
  agentIds: string[];
  triggers: (string | AgentTriggerConfig)[];
  guardPolicy: RuntimeGuardPolicy;
  totalExecutions: number;
  successRate: number;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   PHASE 5: RUNTIME EVENT DISCRIMINATED UNION (DeepSeek Harness reference)
   ========================================================================= */

export interface RuntimeEventBase {
  id: string;
  runId: string;
  sequence: number;
  timestamp: string;
  nodeId?: string;
}

export interface AgentRunCreatedEvent extends RuntimeEventBase {
  type: 'AgentRunCreated';
  agentId: string;
  agentVersion: string;
  trigger: string;
}

export interface ContextResolvedEvent extends RuntimeEventBase {
  type: 'ContextResolved';
  entityType?: string;
  entityId?: string;
  entityName?: string;
  sourceCount: number;
}

export interface WorkflowCompiledEvent extends RuntimeEventBase {
  type: 'WorkflowCompiled';
  workflowId: string;
  graphId: string;
  nodeCount: number;
}

export interface NodeStartedEvent extends RuntimeEventBase {
  type: 'NodeStarted';
  nodeId: string;
  nodeName: string;
  nodeType: ExecutionNodeType;
}

export interface NodeCompletedEvent extends RuntimeEventBase {
  type: 'NodeCompleted';
  nodeId: string;
  nodeName: string;
  status: ExecutionNodeStatus;
  durationMs: number;
}

export interface SkillDiscoveredEvent extends RuntimeEventBase {
  type: 'SkillDiscovered';
  skillId: string;
  skillName: string;
}

export interface SkillSelectedEvent extends RuntimeEventBase {
  type: 'SkillSelected';
  skillId: string;
  skillName: string;
  reason: string;
}

export interface SkillLoadedEvent extends RuntimeEventBase {
  type: 'SkillLoaded';
  skillId: string;
  capabilityCount: number;
}

export interface CapabilityResolvedEvent extends RuntimeEventBase {
  type: 'CapabilityResolved';
  capabilityKey: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
}

export interface KnowledgeRetrievedEvent extends RuntimeEventBase {
  type: 'KnowledgeRetrieved';
  documentCount: number;
  sourceNames: string[];
}

export interface ModelSelectedEvent extends RuntimeEventBase {
  type: 'ModelSelected';
  modelId: string;
  providerId: string;
  temperature?: number;
}

export interface PolicyEvaluatedEvent extends RuntimeEventBase {
  type: 'PolicyEvaluated';
  decision: 'allow' | 'deny' | 'approval_required';
  policyCode: string;
  summary: string;
}

export interface ActionPreparedEvent extends RuntimeEventBase {
  type: 'ActionPrepared';
  actionId: string;
  actionType: string;
  headline: string;
}

export interface ApprovalRequestedEvent extends RuntimeEventBase {
  type: 'ApprovalRequested';
  approvalId: string;
  actionId: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface ApprovalResolvedEvent extends RuntimeEventBase {
  type: 'ApprovalResolved';
  approvalId: string;
  decision: 'approved' | 'rejected' | 'modified';
  reviewerName: string;
}

export interface ActionExecutionStartedEvent extends RuntimeEventBase {
  type: 'ActionExecutionStarted';
  actionId: string;
  actionType: string;
}

export interface ActionExecutionCompletedEvent extends RuntimeEventBase {
  type: 'ActionExecutionCompleted';
  actionId: string;
  status: 'executed';
}

export interface ActionExecutionFailedEvent extends RuntimeEventBase {
  type: 'ActionExecutionFailed';
  actionId: string;
  error: string;
}

export interface AgentHandoffStartedEvent extends RuntimeEventBase {
  type: 'AgentHandoffStarted';
  sourceAgentId: string;
  targetAgentId: string;
  targetAgentName: string;
  reason: string;
}

export interface AgentHandoffCompletedEvent extends RuntimeEventBase {
  type: 'AgentHandoffCompleted';
  targetRunId: string;
}

export interface CheckpointCreatedEvent extends RuntimeEventBase {
  type: 'CheckpointCreated';
  checkpointId: string;
  sequence: number;
}

export interface AgentRunPausedEvent extends RuntimeEventBase {
  type: 'AgentRunPaused';
  reason?: string;
}

export interface AgentRunResumedEvent extends RuntimeEventBase {
  type: 'AgentRunResumed';
}

export interface AgentRunRetryingEvent extends RuntimeEventBase {
  type: 'AgentRunRetrying';
  retryAttempt: number;
}

export interface AgentRunCompletedEvent extends RuntimeEventBase {
  type: 'AgentRunCompleted';
  durationMs: number;
  outputSummary: string;
}

export interface AgentRunFailedEvent extends RuntimeEventBase {
  type: 'AgentRunFailed';
  failureCategory: FailureCategory;
  error: string;
}

export interface AgentRunCancelledEvent extends RuntimeEventBase {
  type: 'AgentRunCancelled';
  reason?: string;
}

export type RuntimeEvent = 
  | AgentRunCreatedEvent
  | ContextResolvedEvent
  | WorkflowCompiledEvent
  | NodeStartedEvent
  | NodeCompletedEvent
  | SkillDiscoveredEvent
  | SkillSelectedEvent
  | SkillLoadedEvent
  | CapabilityResolvedEvent
  | KnowledgeRetrievedEvent
  | ModelSelectedEvent
  | PolicyEvaluatedEvent
  | ActionPreparedEvent
  | ApprovalRequestedEvent
  | ApprovalResolvedEvent
  | ActionExecutionStartedEvent
  | ActionExecutionCompletedEvent
  | ActionExecutionFailedEvent
  | AgentHandoffStartedEvent
  | AgentHandoffCompletedEvent
  | CheckpointCreatedEvent
  | AgentRunPausedEvent
  | AgentRunResumedEvent
  | AgentRunRetryingEvent
  | AgentRunCompletedEvent
  | AgentRunFailedEvent
  | AgentRunCancelledEvent;

/* =========================================================================
   PHASE 5: PROCEDURAL SKILLS CONTRACTS (Hermes reference)
   ========================================================================= */

export interface AgentSkill {
  id: string;
  key: string;
  name: string;
  version: string;
  description: string;
  instructions: string;
  status: 'draft' | 'published' | 'archived';
  category?: 'sales_playbook' | 'deal_governance' | 'relationship_ops' | 'risk_mitigation' | 'customer_success';
  capabilityIds: string[];
  knowledgeSourceIds?: string[];
  evaluationStatus?: 'not_evaluated' | 'evaluating' | 'passed' | 'failed';
  totalExecutions: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   PHASE 5: SKILL EVALUATION & CONTROLLED IMPROVEMENT (SkillOpt reference)
   ========================================================================= */

export interface SkillEvaluation {
  id: string;
  skillId: string;
  skillName: string;
  skillVersion: string;
  evaluationType: 'offline' | 'trajectory' | 'regression' | 'production';
  status: 'queued' | 'running' | 'passed' | 'failed';
  testCaseCount: number;
  passedCases: number;
  failedCases: number;
  score: number;
  metrics?: {
    accuracy: number;
    policyCompliance: number;
    latencyAvgMs: number;
    actionSafetyScore: number;
  };
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SkillImprovementCandidate {
  id: string;
  skillId: string;
  skillName: string;
  sourceVersion: string;
  proposedVersion: string;
  reason: string;
  evaluationId?: string;
  scoreImprovementDelta?: number;
  proposedChanges: string;
  status: 'proposed' | 'under_review' | 'approved' | 'rejected' | 'published';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

/* =========================================================================
   PHASE 5: CAPABILITIES & BOUNDARIES (DeepSeek Harness reference)
   ========================================================================= */

export interface AgentCapabilityDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'crm' | 'communication' | 'knowledge' | 'calendar' | 'analytics' | 'integration';
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
  enabled: boolean;
  inputContract: string;
  outputContract: string;
  totalInvocations: number;
}

export interface PolicyEvaluationRecord {
  id: string;
  runId: string;
  capabilityId?: string;
  actionId?: string;
  decision: 'allow' | 'deny' | 'approval_required';
  policyCode?: string;
  evaluatedAt: string;
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RuntimeCheckpoint {
  id: string;
  runId: string;
  sequence: number;
  nodeId?: string;
  nodeName?: string;
  createdAt: string;
  status: 'created' | 'validated' | 'restored';
  snapshotSummary?: string;
}

export interface AgentMemoryReference {
  id: string;
  type: 'user' | 'account' | 'agent' | 'workflow' | 'project';
  sourceId?: string;
  label: string;
  lastAccessedAt: string;
}

export interface RuntimeDiagnosticItem {
  category: 'Context' | 'Workflow' | 'Knowledge' | 'Skills' | 'Capabilities' | 'Policy' | 'Model' | 'Actions' | 'Approvals' | 'Execution' | 'Performance' | 'Cost' | 'Failures' | 'Checkpoints' | 'Replay';
  status: 'healthy' | 'warning' | 'blocked' | 'failed' | 'unavailable';
  label: string;
  detail: string;
  metric?: string;
}

/* =========================================================================
   EXISTING CORE MODELS (ACTIONS, APPROVALS, INSIGHTS, COPILOT)
   ========================================================================= */

export interface AIAction {
  id: string;
  agentId: string;
  agentName: string;
  entityType: 'lead' | 'deal' | 'contact' | 'account' | 'meeting' | 'task';
  entityId: string;
  entityTitle: string;
  status: AIActionStatus;
  headline: string;
  rationale: string;
  payload: {
    actionType: 'send_whatsapp' | 'send_email' | 'update_stage' | 'create_task' | 'schedule_meeting' | 'flag_risk';
    recipientName?: string;
    recipientContact?: string;
    content?: string;
    suggestedDate?: string;
    dataChanges?: Record<string, unknown>;
  };
  requiresApproval: boolean;
  createdAt: string;
  executedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface ApprovalItem {
  id: string;
  actionId: string;
  agentId: string;
  agentName: string;
  category: 'email_outreach' | 'whatsapp_dispatch' | 'stage_transition' | 'task_creation' | 'commercial_terms';
  title: string;
  description: string;
  targetEntity: {
    type: 'lead' | 'deal' | 'contact' | 'account';
    id: string;
    name: string;
    contextSummary?: string;
  };
  proposedPayload: {
    type: string;
    subject?: string;
    body?: string;
    diff?: { field: string; from: unknown; to: unknown }[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  urgency: 'high' | 'medium' | 'low';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AIInsight {
  id: string;
  entityType: 'lead' | 'deal' | 'contact' | 'account' | 'pipeline';
  entityId: string;
  type: 'risk_warning' | 'buying_signal' | 'velocity_anomaly' | 'next_best_action';
  title: string;
  content: string;
  confidenceScore: number;
  recommendedAction?: {
    label: string;
    actionType: string;
    targetId: string;
  };
  createdAt: string;
}

export type CopilotEntityType = 
  | 'lead' 
  | 'contact' 
  | 'account' 
  | 'deal' 
  | 'opportunity' 
  | 'task' 
  | 'meeting' 
  | 'call' 
  | 'pipeline' 
  | 'general';

export interface CopilotContext {
  route: string;
  viewName: string;
  entityType?: CopilotEntityType;
  entityId?: string;
  entityName?: string;
  entityStage?: string;
  entityScore?: number;
  entityOwner?: string;
  selectedEntityIds?: string[];
  selectedEntityNames?: string[];
  activeFilters?: Record<string, unknown>;
  userName?: string;
  userRole?: string;
  userContext?: {
    userId?: string;
    userName?: string;
    role?: string;
  };
}

export type CopilotResponseType = 
  | 'answer' 
  | 'insight' 
  | 'recommendation' 
  | 'prepared_action' 
  | 'approval_required' 
  | 'error';

export type CopilotMessageStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface CopilotSuggestedAction {
  id: string;
  label: string;
  actionType: string;
  prompt: string;
  iconType?: 'sparkles' | 'mail' | 'task' | 'calendar' | 'risk' | 'zap' | 'send';
  payload?: Record<string, unknown> | string | number | boolean;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  type?: CopilotResponseType;
  status?: CopilotMessageStatus;
  statusText?: string;
  contextSnapshot?: CopilotContext;
  insights?: AIInsight[];
  actions?: AIAction[];
  suggestedActions?: CopilotSuggestedAction[];
  relatedAgentRun?: AgentRun;
  requiresApproval?: boolean;
}

export interface CopilotResponse {
  id: string;
  type: CopilotResponseType;
  message: string;
  insights?: AIInsight[];
  actions?: AIAction[];
  suggestedActions?: CopilotSuggestedAction[];
  requiresApproval?: boolean;
}
