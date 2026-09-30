import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCopilotChat } from '../../../hooks/useCopilotChat';
import { ContextPillGroup } from '../../../components/ai/ContextPillGroup';
import { SuggestedActionChips, SuggestedChip } from '../../../components/ai/SuggestedActionChips';
import { AIInsightBanner } from '../../../components/ai/AIInsightBanner';
import { AIActionCard } from '../../../components/ai/AIActionCard';
import { CopilotContext } from '../../../types/ai';
import { 
  resolveCopilotContext, 
  getContextPills, 
  getSuggestedActionsForContext 
} from './contextResolver';
import { 
  IconSparkles, 
  IconSend, 
  IconX, 
  IconZap, 
  IconClock, 
  IconCheckCircle, 
  IconAlertTriangle, 
  IconRefreshCw,
  IconArrowRight,
  IconMinimize,
  IconMaximize
} from '../../../components/Icons';

interface AICopilotDockProps {
  onNavigate?: (view: string, id?: string) => void;
  currentView?: string;
  selectedEntity?: { 
    type: 'lead' | 'deal' | 'contact' | 'account' | 'meeting' | 'task'; 
    id: string; 
    name: string;
    stage?: string;
    score?: number;
    owner?: string;
  };
  selectedEntityIds?: string[];
  selectedEntityNames?: string[];
  userName?: string;
  userRole?: string;
}

export const AICopilotDock: React.FC<AICopilotDockProps> = ({
  onNavigate,
  currentView = 'dashboard',
  selectedEntity,
  selectedEntityIds,
  selectedEntityNames,
  userName = 'Alex Chen',
  userRole = 'Sales Manager'
}) => {
  const selectedIdsKey = selectedEntityIds?.join(',') || '';
  const selectedNamesKey = selectedEntityNames?.join(',') || '';

  const contextOverride: CopilotContext = useMemo(() => resolveCopilotContext({
    route: `/${currentView}`,
    viewName: currentView,
    entityType: selectedEntity?.type,
    entityId: selectedEntity?.id,
    entityName: selectedEntity?.name,
    entityStage: selectedEntity?.stage,
    entityScore: selectedEntity?.score,
    entityOwner: selectedEntity?.owner,
    selectedEntityIds,
    selectedEntityNames,
    userName,
    userRole
  }), [
    currentView,
    selectedEntity?.type,
    selectedEntity?.id,
    selectedEntity?.name,
    selectedEntity?.stage,
    selectedEntity?.score,
    selectedEntity?.owner,
    selectedIdsKey,
    selectedNamesKey,
    userName,
    userRole
  ]);

  const {
    isOpen,
    isDocked,
    activeContext,
    messages,
    isGenerating,
    generationStatusText,
    inputDraft,
    toggleOpen,
    setIsDocked,
    sendMessage,
    clearMessages,
    setInputDraft,
    executeAction
  } = useCopilotChat(contextOverride);

  const [localInput, setLocalInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedDraftRef = useRef<string | null>(null);

  // Auto-execute if inputDraft was pre-populated by openWithContext
  useEffect(() => {
    if (isOpen && inputDraft && inputDraft !== lastProcessedDraftRef.current && !isGenerating) {
      lastProcessedDraftRef.current = inputDraft;
      const draft = inputDraft;
      setInputDraft('');
      sendMessage(draft);
    }
  }, [isOpen, inputDraft, isGenerating, sendMessage, setInputDraft]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Derive Context Pills via centralized resolver
  const contextPills = getContextPills(activeContext);

  // Derive Contextual Suggested Action Chips via centralized resolver
  const contextualChips = getSuggestedActionsForContext(activeContext);

  const handleChipSelect = (chip: SuggestedChip) => {
    sendMessage(chip.prompt);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isGenerating) return;
    sendMessage(localInput);
    setLocalInput('');
  };

  const hasOnlyInitialWelcome = messages.length === 1 && messages[0].id === 'init_welcome';

  return (
    <>
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 hover:from-primary-500 hover:to-indigo-600 text-white shadow-xl shadow-primary-500/30 flex items-center gap-2.5 transition-all transform hover:scale-105 group border border-white/20 cursor-pointer"
          title="Open Nova AI Copilot"
        >
          <div className="relative flex items-center justify-center">
            <IconSparkles className="w-5 h-5 text-white animate-spin-slow group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-primary-700"></span>
          </div>
          <span className="text-xs font-bold tracking-tight pr-1 hidden sm:inline">AI Copilot</span>
        </button>
      )}

      {/* Docked / Slide-out Panel */}
      {isOpen && (
        <div className={`fixed inset-y-0 right-0 z-50 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-left overflow-hidden transition-all ${
          isDocked ? 'w-full sm:w-[460px] md:w-[500px]' : 'w-full sm:w-[580px] md:w-[640px]'
        }`}>
          
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <IconSparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                    Nova AI Copilot
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Universal Operational Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDocked(!isDocked)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs cursor-pointer"
                title={isDocked ? 'Expand Panel Width' : 'Collapse Panel Width'}
              >
                {isDocked ? <IconMaximize className="w-3.5 h-3.5" /> : <IconMinimize className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={clearMessages}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs cursor-pointer"
                title="Reset Conversation"
              >
                <IconRefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleOpen}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close Copilot"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-950/40">
            <ContextPillGroup items={contextPills} />
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {/* Empty State when clean */}
            {hasOnlyInitialWelcome && (
              <div className="p-3 mb-2 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/50 dark:border-primary-900/30 text-xs text-primary-900 dark:text-primary-200 flex items-center gap-2">
                <IconSparkles className="w-4 h-4 text-primary-500 shrink-0" />
                <span>
                  {selectedEntity 
                    ? `Active context: ${selectedEntity.type.toUpperCase()} "${selectedEntity.name}". Click a suggested prompt below or ask any question.`
                    : selectedEntityIds && selectedEntityIds.length > 1
                      ? `Active context: ${selectedEntityIds.length} selected records. Ready for batch analysis or outreach staging.`
                      : 'I can help with CRM tasks. Select a record or ask a general question.'}
                </span>
              </div>
            )}

            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} animate-fade-in`}
                >
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[94%] shadow-2xs ${
                    isAssistant
                      ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                      : 'bg-primary-600 text-white rounded-tr-none font-medium'
                  }`}>
                    {/* Status Placeholder when streaming/processing */}
                    {msg.status === 'processing' && (
                      <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 py-1 font-medium">
                        <IconSparkles className="w-4 h-4 text-primary-500 animate-spin" />
                        <span>{msg.statusText || generationStatusText || 'Analysing CRM context...'}</span>
                      </div>
                    )}

                    {/* Main Content */}
                    {msg.content && (
                      <div className="space-y-2 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    )}

                    {/* Failed / Error state with retry */}
                    {msg.status === 'failed' && (
                      <div className="mt-2.5 pt-2 border-t border-rose-200 dark:border-rose-900 flex items-center justify-between">
                        <span className="text-[11px] text-rose-500 font-semibold">Execution error</span>
                        <button
                          onClick={() => sendMessage('Retry previous request')}
                          className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-200 transition-colors text-[11px]"
                        >
                          Retry Request
                        </button>
                      </div>
                    )}

                    {/* Inline AI Insights */}
                    {isAssistant && msg.insights && msg.insights.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.insights.map((ins) => (
                          <AIInsightBanner
                            key={ins.id}
                            type={ins.type}
                            title={ins.title}
                            description={ins.content}
                            confidenceScore={ins.confidenceScore}
                            actionLabel={ins.recommendedAction?.label}
                            onAction={() => {
                              if (ins.recommendedAction) {
                                sendMessage(`Execute ${ins.recommendedAction.label}`);
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Inline Prepared Actions */}
                    {isAssistant && msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 space-y-2.5">
                        {msg.actions.map((act) => (
                          <AIActionCard
                            key={act.id}
                            action={act}
                            onExecute={async (id) => {
                              await executeAction(id);
                              sendMessage(`Action confirmed: ${act.headline}`);
                            }}
                            onApprove={() => {
                              if (onNavigate) onNavigate('ai_approvals');
                            }}
                            onReject={() => {
                              sendMessage(`Dismissed action: ${act.headline}`);
                            }}
                            onViewEntity={(type, id) => {
                              if (onNavigate) {
                                if (type === 'lead') onNavigate('leads', id);
                                else if (type === 'deal') onNavigate('pipeline', id);
                                else if (type === 'contact') onNavigate('contacts', id);
                                else if (type === 'account') onNavigate('accounts', id);
                                else onNavigate('tasks', id);
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Suggested Actions inside message */}
                    {isAssistant && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (action.actionType === 'navigate_approvals' && onNavigate) {
                                onNavigate('ai_approvals');
                              } else {
                                sendMessage(action.prompt || action.label);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-300 border border-slate-200 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <span>{action.label}</span>
                            <IconArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Contextual Prompts Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">
              Suggested Contextual Actions
            </div>
            <SuggestedActionChips chips={contextualChips} onSelect={handleChipSelect} maxDisplay={3} />
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                selectedEntity 
                  ? `Ask Copilot about ${selectedEntity.name}...`
                  : selectedEntityIds && selectedEntityIds.length > 1
                    ? `Ask Copilot about ${selectedEntityIds.length} selected records...`
                    : 'Ask Nova AI anything about your CRM...'
              }
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={!localInput.trim() || isGenerating}
              className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white shadow-xs transition-all flex items-center justify-center shrink-0 cursor-pointer"
              title="Send Command"
            >
              <IconSend className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
