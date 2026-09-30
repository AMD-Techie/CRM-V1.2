import { useState, useCallback, useMemo } from 'react';
import { useCopilotStore } from '../stores/copilotStore';
import { copilotApi } from '../api/copilotApi';
import { CopilotContext, CopilotMessage, AIAction } from '../types/ai';
import { useActionsQuery, useExecuteActionMutation } from './useActionsQuery';

export function useCopilotChat(contextOverride?: Partial<CopilotContext>) {
  const isOpen = useCopilotStore(state => state.isOpen);
  const isDocked = useCopilotStore(state => state.isDocked);
  const activeContext = useCopilotStore(state => state.activeContext);
  const messages = useCopilotStore(state => state.messages);
  const isGenerating = useCopilotStore(state => state.isGenerating);
  const generationStatusText = useCopilotStore(state => state.generationStatusText);
  const inputDraft = useCopilotStore(state => state.inputDraft);
  const setIsOpen = useCopilotStore(state => state.setIsOpen);
  const toggleOpen = useCopilotStore(state => state.toggleOpen);
  const setIsDocked = useCopilotStore(state => state.setIsDocked);
  const setActiveContext = useCopilotStore(state => state.setActiveContext);
  const openWithContext = useCopilotStore(state => state.openWithContext);
  const addMessage = useCopilotStore(state => state.addMessage);
  const updateMessage = useCopilotStore(state => state.updateMessage);
  const clearMessages = useCopilotStore(state => state.clearMessages);
  const setIsGenerating = useCopilotStore(state => state.setIsGenerating);
  const setInputDraft = useCopilotStore(state => state.setInputDraft);

  const executeActionMutation = useExecuteActionMutation();

  const selectedIdsKey = contextOverride?.selectedEntityIds?.join(',') || '';
  const selectedNamesKey = contextOverride?.selectedEntityNames?.join(',') || '';
  const filtersKey = contextOverride?.activeFilters ? JSON.stringify(contextOverride.activeFilters) : '';

  const currentEffectiveContext: CopilotContext = useMemo(() => ({
    route: contextOverride?.route || activeContext?.route || window.location.pathname,
    viewName: contextOverride?.viewName || activeContext?.viewName || 'Workspace',
    entityType: contextOverride?.entityType || activeContext?.entityType,
    entityId: contextOverride?.entityId || activeContext?.entityId,
    entityName: contextOverride?.entityName || activeContext?.entityName,
    entityStage: contextOverride?.entityStage || activeContext?.entityStage,
    entityScore: contextOverride?.entityScore || activeContext?.entityScore,
    entityOwner: contextOverride?.entityOwner || activeContext?.entityOwner,
    selectedEntityIds: contextOverride?.selectedEntityIds || activeContext?.selectedEntityIds,
    selectedEntityNames: contextOverride?.selectedEntityNames || activeContext?.selectedEntityNames,
    activeFilters: contextOverride?.activeFilters || activeContext?.activeFilters,
    userName: contextOverride?.userName || activeContext?.userName || 'Alex Chen',
    userRole: contextOverride?.userRole || activeContext?.userRole || 'Sales Manager'
  }), [
    contextOverride?.route,
    contextOverride?.viewName,
    contextOverride?.entityType,
    contextOverride?.entityId,
    contextOverride?.entityName,
    contextOverride?.entityStage,
    contextOverride?.entityScore,
    contextOverride?.entityOwner,
    selectedIdsKey,
    selectedNamesKey,
    filtersKey,
    contextOverride?.userName,
    contextOverride?.userRole,
    activeContext
  ]);

  const sendMessage = useCallback(async (promptText?: string) => {
    const textToSend = (promptText || inputDraft).trim();
    if (!textToSend || isGenerating) return;

    const userMessageId = `usr_${Date.now()}`;
    const assistantMessageId = `asst_${Date.now()}`;

    // 1. Add user message
    const userMsg: CopilotMessage = {
      id: userMessageId,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contextSnapshot: currentEffectiveContext
    };
    addMessage(userMsg);
    setInputDraft('');

    // 2. Set streaming-ready processing state
    setIsGenerating(true, 'Analysing CRM context...');

    // 3. Add initial assistant placeholder
    const pendingMsg: CopilotMessage = {
      id: assistantMessageId,
      sender: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'processing',
      statusText: 'Analysing CRM context and active record state...'
    };
    addMessage(pendingMsg);

    try {
      // Simulate status transition for streaming-readiness
      setTimeout(() => {
        setIsGenerating(true, 'Synthesizing recommendations & action payloads...');
        updateMessage(assistantMessageId, {
          statusText: 'Synthesizing recommendations & preparing staged actions...'
        });
      }, 350);

      const response = await copilotApi.askCopilot(textToSend, currentEffectiveContext);

      // 4. Update placeholder with completed response
      updateMessage(assistantMessageId, {
        content: response.message,
        type: response.type,
        status: 'completed',
        statusText: undefined,
        insights: response.insights,
        actions: response.actions,
        suggestedActions: response.suggestedActions,
        requiresApproval: response.requiresApproval
      });
    } catch (err) {
      updateMessage(assistantMessageId, {
        content: '⚠️ Unable to complete autonomous execution. Please verify your connection or backend adapter.',
        type: 'error',
        status: 'failed',
        statusText: 'Execution failed.'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    inputDraft,
    isGenerating,
    currentEffectiveContext,
    addMessage,
    updateMessage,
    setIsGenerating,
    setInputDraft
  ]);


  const executeAction = useCallback(async (actionId: string) => {
    await executeActionMutation.mutateAsync(actionId);
  }, [executeActionMutation]);

  return {
    isOpen,
    isDocked,
    activeContext: currentEffectiveContext,
    messages,
    isGenerating,
    generationStatusText,
    inputDraft,
    setIsOpen,
    toggleOpen,
    setIsDocked,
    setActiveContext,
    openWithContext,
    sendMessage,
    clearMessages,
    setInputDraft,
    executeAction
  };
}
