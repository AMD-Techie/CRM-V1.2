import { useEffect, useMemo } from 'react';
import { useCopilotStore } from '../stores/copilotStore';
import { CopilotContext } from '../types/ai';
import { resolveCopilotContext } from '../features/ai-workspace/copilot/contextResolver';

export function useCopilotContext(context: Partial<CopilotContext>) {
  const setActiveContext = useCopilotStore(state => state.setActiveContext);

  const selectedIdsKey = context.selectedEntityIds?.join(',') || '';
  const selectedNamesKey = context.selectedEntityNames?.join(',') || '';
  const filtersKey = context.activeFilters ? JSON.stringify(context.activeFilters) : '';

  const resolved = useMemo(() => resolveCopilotContext({
    route: context.route,
    viewName: context.viewName || 'dashboard',
    entityType: context.entityType,
    entityId: context.entityId,
    entityName: context.entityName,
    entityStage: context.entityStage,
    entityScore: context.entityScore,
    entityOwner: context.entityOwner,
    selectedEntityIds: context.selectedEntityIds,
    selectedEntityNames: context.selectedEntityNames,
    activeFilters: context.activeFilters,
    userName: context.userName,
    userRole: context.userRole,
    userId: context.userContext?.userId
  }), [
    context.route,
    context.viewName,
    context.entityType,
    context.entityId,
    context.entityName,
    context.entityStage,
    context.entityScore,
    context.entityOwner,
    selectedIdsKey,
    selectedNamesKey,
    filtersKey,
    context.userName,
    context.userRole,
    context.userContext?.userId
  ]);

  useEffect(() => {
    setActiveContext(resolved);
  }, [resolved, setActiveContext]);
}

