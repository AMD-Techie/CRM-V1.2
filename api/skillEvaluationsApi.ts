import { SkillEvaluation, SkillImprovementCandidate } from '../types/ai';
import { apiClient } from './client';
import { skillsApi } from './skillsApi';

export const INITIAL_EVALUATIONS: SkillEvaluation[] = [
  {
    id: 'eval_lq_01',
    skillId: 'skill_lead_qualification',
    skillName: 'Lead Qualification & Scoring Playbook',
    skillVersion: 'v2.1',
    evaluationType: 'regression',
    status: 'passed',
    testCaseCount: 50,
    passedCases: 49,
    failedCases: 1,
    score: 98.0,
    metrics: {
      accuracy: 98.0,
      policyCompliance: 100.0,
      latencyAvgMs: 1420,
      actionSafetyScore: 99.5
    },
    notes: 'Validated against historical Q3 inbound leads dataset. High accuracy on B2B SaaS ARR categorization.',
    createdAt: '2026-09-28T14:00:00Z',
    completedAt: '2026-09-28T14:05:00Z'
  },
  {
    id: 'eval_fu_02',
    skillId: 'skill_executive_followup',
    skillName: 'Enterprise Follow-Up Cadence & Outreach',
    skillVersion: 'v1.4',
    evaluationType: 'trajectory',
    status: 'passed',
    testCaseCount: 30,
    passedCases: 29,
    failedCases: 1,
    score: 96.6,
    metrics: {
      accuracy: 96.6,
      policyCompliance: 100.0,
      latencyAvgMs: 2100,
      actionSafetyScore: 100.0
    },
    notes: 'Tested multi-touch compliance draft synthesis. Zero unauthorized outbound dispatches detected.',
    createdAt: '2026-09-29T09:00:00Z',
    completedAt: '2026-09-29T09:04:00Z'
  }
];

export const INITIAL_IMPROVEMENT_CANDIDATES: SkillImprovementCandidate[] = [
  {
    id: 'cand_lq_v22',
    skillId: 'skill_lead_qualification',
    skillName: 'Lead Qualification & Scoring Playbook',
    sourceVersion: 'v2.1',
    proposedVersion: 'v2.2',
    reason: 'Incorporate AI security compliance intent signals from whitepaper downloads into tier 1 scoring threshold',
    evaluationId: 'eval_lq_01',
    scoreImprovementDelta: 3.5,
    proposedChanges: `Add Step 2b: Check if prospect domain has downloaded ISO/SOC2 security whitepapers in past 48 hours. If true, boost score +15 points and flag as High Strategic Value.`,
    status: 'under_review',
    createdAt: '2026-09-29T16:00:00Z'
  },
  {
    id: 'cand_fu_v15',
    skillId: 'skill_executive_followup',
    skillName: 'Enterprise Follow-Up Cadence & Outreach',
    sourceVersion: 'v1.4',
    proposedVersion: 'v1.5',
    reason: 'Enhance WhatsApp message template to include calendar booking link when recipient preference indicates mobile-first',
    evaluationId: 'eval_fu_02',
    scoreImprovementDelta: 4.2,
    proposedChanges: `When contact preference is 'Mobile/WhatsApp', append 1-click calendar meeting URL to message payload.`,
    status: 'proposed',
    createdAt: '2026-09-30T08:00:00Z'
  }
];

export const skillEvaluationsApi = {
  async getSkillEvaluations(): Promise<SkillEvaluation[]> {
    const saved = localStorage.getItem('nova_skill_evaluations');
    const local = saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
    return apiClient.get<SkillEvaluation[]>('/ai/runtime/skill-evaluations', local);
  },

  async getImprovementCandidates(): Promise<SkillImprovementCandidate[]> {
    const saved = localStorage.getItem('nova_skill_improvement_candidates');
    const local = saved ? JSON.parse(saved) : INITIAL_IMPROVEMENT_CANDIDATES;
    return apiClient.get<SkillImprovementCandidate[]>('/ai/runtime/skill-candidates', local);
  },

  async runSkillEvaluation(skillId: string, evaluationType: 'offline' | 'trajectory' | 'regression'): Promise<SkillEvaluation> {
    const skills = await skillsApi.getSkills();
    const targetSkill = skills.find(s => s.id === skillId) || skills[0];
    const evals = await skillEvaluationsApi.getSkillEvaluations();

    const newEval: SkillEvaluation = {
      id: `eval_${Date.now()}`,
      skillId: targetSkill.id,
      skillName: targetSkill.name,
      skillVersion: targetSkill.version,
      evaluationType,
      status: 'passed',
      testCaseCount: 40,
      passedCases: 39,
      failedCases: 1,
      score: 97.5,
      metrics: {
        accuracy: 97.5,
        policyCompliance: 100.0,
        latencyAvgMs: 1650,
        actionSafetyScore: 99.0
      },
      notes: `Evaluation completed successfully against benchmark suite (${evaluationType}).`,
      createdAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + 2000).toISOString()
    };

    const updated = [newEval, ...evals];
    localStorage.setItem('nova_skill_evaluations', JSON.stringify(updated));
    return apiClient.post<SkillEvaluation>('/ai/runtime/skill-evaluations', newEval, newEval);
  },

  async reviewImprovementCandidate(candidateId: string, decision: 'approved' | 'rejected', reviewerName: string = 'Alex Chen'): Promise<SkillImprovementCandidate> {
    const candidates = await skillEvaluationsApi.getImprovementCandidates();
    const updated = candidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          status: decision as any,
          reviewedBy: reviewerName,
          reviewedAt: new Date().toISOString()
        };
      }
      return c;
    });

    localStorage.setItem('nova_skill_improvement_candidates', JSON.stringify(updated));
    const target = updated.find(c => c.id === candidateId)!;
    return apiClient.put<SkillImprovementCandidate>(`/ai/runtime/skill-candidates/${candidateId}`, target, target);
  },

  async publishCandidateVersion(candidateId: string): Promise<{ candidate: SkillImprovementCandidate; updatedSkill: any }> {
    const candidates = await skillEvaluationsApi.getImprovementCandidates();
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) throw new Error('Candidate not found');

    const skill = await skillsApi.getSkillById(candidate.skillId);
    if (!skill) throw new Error('Skill not found');

    // Update skill version and instructions safely
    const updatedSkill = {
      ...skill,
      version: candidate.proposedVersion,
      instructions: `${skill.instructions}\n\n[Version ${candidate.proposedVersion} Update]:\n${candidate.proposedChanges}`,
      updatedAt: new Date().toISOString()
    };

    await skillsApi.updateSkill(updatedSkill);

    // Mark candidate as published
    const updatedCandidate: SkillImprovementCandidate = {
      ...candidate,
      status: 'published',
      reviewedBy: candidate.reviewedBy || 'Alex Chen',
      reviewedAt: candidate.reviewedAt || new Date().toISOString()
    };

    const updatedCandidates = candidates.map(c => c.id === candidateId ? updatedCandidate : c);
    localStorage.setItem('nova_skill_improvement_candidates', JSON.stringify(updatedCandidates));

    return { candidate: updatedCandidate, updatedSkill };
  }
};
