import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillsApi } from '../api/skillsApi';
import { AgentSkill } from '../types/ai';

export const SKILLS_QUERY_KEY = ['skills'] as const;

export function useSkillsQuery() {
  return useQuery<AgentSkill[]>({
    queryKey: SKILLS_QUERY_KEY,
    queryFn: () => skillsApi.getSkills(),
    staleTime: 1000 * 60 * 5
  });
}

export function useSkillDetailQuery(id: string | null) {
  return useQuery<AgentSkill | null>({
    queryKey: [...SKILLS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const skill = await skillsApi.getSkillById(id);
      return skill || null;
    },
    enabled: Boolean(id)
  });
}

export function useCreateSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skill: Omit<AgentSkill, 'id' | 'totalExecutions' | 'successRate' | 'createdAt' | 'updatedAt'>) => 
      skillsApi.createSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
    }
  });
}

export function useUpdateSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skill: AgentSkill) => skillsApi.updateSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
    }
  });
}
