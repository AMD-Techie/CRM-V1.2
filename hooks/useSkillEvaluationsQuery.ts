import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillEvaluationsApi } from '../api/skillEvaluationsApi';
import { SkillEvaluation, SkillImprovementCandidate } from '../types/ai';

export const SKILL_EVALUATIONS_QUERY_KEY = ['skill-evaluations'] as const;
export const SKILL_CANDIDATES_QUERY_KEY = ['skill-improvement-candidates'] as const;

export function useSkillEvaluationsQuery() {
  return useQuery<SkillEvaluation[]>({
    queryKey: SKILL_EVALUATIONS_QUERY_KEY,
    queryFn: () => skillEvaluationsApi.getSkillEvaluations()
  });
}

export function useSkillImprovementCandidatesQuery() {
  return useQuery<SkillImprovementCandidate[]>({
    queryKey: SKILL_CANDIDATES_QUERY_KEY,
    queryFn: () => skillEvaluationsApi.getImprovementCandidates()
  });
}

export function useRunSkillEvaluationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, evaluationType }: { skillId: string; evaluationType: 'offline' | 'trajectory' | 'regression' }) =>
      skillEvaluationsApi.runSkillEvaluation(skillId, evaluationType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_EVALUATIONS_QUERY_KEY });
    }
  });
}

export function useReviewImprovementCandidateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId, decision }: { candidateId: string; decision: 'approved' | 'rejected' }) =>
      skillEvaluationsApi.reviewImprovementCandidate(candidateId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_CANDIDATES_QUERY_KEY });
    }
  });
}

export function usePublishCandidateVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) => skillEvaluationsApi.publishCandidateVersion(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_CANDIDATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    }
  });
}
