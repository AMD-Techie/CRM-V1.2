import { PolicyEvaluationRecord } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_POLICY_EVALUATIONS: PolicyEvaluationRecord[] = [
  {
    id: 'pol_eval_01',
    runId: 'run_lq_9082',
    capabilityId: 'cap_crm_update_lead',
    actionId: 'act_lead_wa_01',
    decision: 'allow',
    policyCode: 'POL_AUTONOMOUS_ENRICHMENT',
    summary: 'Internal stage update and score calculation permitted under autonomous policy tier',
    riskLevel: 'low',
    evaluatedAt: '2026-09-30T10:30:03Z'
  },
  {
    id: 'pol_eval_02',
    runId: 'run_fu_9083',
    capabilityId: 'cap_email_send',
    actionId: 'act_lead_wa_02',
    decision: 'approval_required',
    policyCode: 'POL_HUMAN_IN_THE_LOOP_COMMS',
    summary: 'Outbound customer communications strictly require human authorization before external dispatch',
    riskLevel: 'high',
    evaluatedAt: '2026-09-30T10:45:03Z'
  },
  {
    id: 'pol_eval_03',
    runId: 'run_rr_9084',
    capabilityId: 'cap_crm_update_deal',
    decision: 'deny',
    policyCode: 'POL_THRESHOLD_RESTRICTION',
    summary: 'Policy restriction: Commercial terms above $100,000 require VP Sales credential level',
    riskLevel: 'high',
    evaluatedAt: '2026-09-30T07:00:04Z'
  }
];

export const policiesApi = {
  async getPolicyEvaluations(): Promise<PolicyEvaluationRecord[]> {
    const saved = localStorage.getItem('nova_policy_evaluations');
    const local = saved ? JSON.parse(saved) : INITIAL_POLICY_EVALUATIONS;
    return apiClient.get<PolicyEvaluationRecord[]>('/ai/runtime/policies/evaluations', local);
  }
};
