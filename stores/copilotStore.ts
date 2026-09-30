import { create } from 'zustand';
import { CopilotContext, CopilotMessage } from '../types/ai';

export interface CopilotState {
  isOpen: boolean;
  isDocked: boolean;
  activeContext: CopilotContext | null;
  messages: CopilotMessage[];
  isGenerating: boolean;
  generationStatusText: string;
  inputDraft: string;

  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  setIsDocked: (isDocked: boolean) => void;
  setActiveContext: (context: CopilotContext | null) => void;
  openWithContext: (context: CopilotContext, initialPrompt?: string) => void;
  addMessage: (msg: CopilotMessage) => void;
  updateMessage: (id: string, updates: Partial<CopilotMessage>) => void;
  clearMessages: () => void;
  setIsGenerating: (generating: boolean, statusText?: string) => void;
  setInputDraft: (draft: string) => void;
}

export const INITIAL_COPILOT_MESSAGE: CopilotMessage = {
  id: 'init_welcome',
  sender: 'assistant',
  content: `👋 **Hello! I'm your Nova CRM Universal AI Copilot.**\n\nI operate with real-time awareness of your active CRM view, selected records, pipeline health, and pending approvals. Ask me for account dossiers, deal risk explanations, pre-meeting agendas, or staged outreach drafts.`,
  timestamp: 'Just now',
  type: 'answer',
  status: 'completed',
  suggestedActions: [
    { id: 'sug_stale', label: 'Scan Stale Pipeline (>7D)', actionType: 'check_stale', prompt: 'Identify all qualified leads without outreach in 7 days and recommend recovery steps', iconType: 'risk' },
    { id: 'sug_appr', label: 'Review Pending Approvals', actionType: 'navigate_approvals', prompt: 'Summarize the pending Human-in-the-Loop approvals requiring my decision', iconType: 'zap' },
    { id: 'sug_brief', label: 'Generate Executive Briefing', actionType: 'executive_brief', prompt: 'Provide a 3-bullet executive briefing on current quarter pacing and top at-risk deals', iconType: 'sparkles' }
  ]
};

function areContextsEqual(a: CopilotContext | null, b: CopilotContext | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export const useCopilotStore = create<CopilotState>((set) => ({
  isOpen: false,
  isDocked: true,
  activeContext: null,
  isGenerating: false,
  generationStatusText: 'Analysing CRM context...',
  inputDraft: '',
  messages: [INITIAL_COPILOT_MESSAGE],

  setIsOpen: (isOpen) => set((state) => state.isOpen === isOpen ? state : { isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsDocked: (isDocked) => set((state) => state.isDocked === isDocked ? state : { isDocked }),
  setActiveContext: (context) => set((state) => {
    if (areContextsEqual(state.activeContext, context)) {
      return state;
    }
    return { activeContext: context };
  }),
  
  openWithContext: (context, initialPrompt) => set((state) => ({
    isOpen: true,
    activeContext: areContextsEqual(state.activeContext, context) ? state.activeContext : context,
    inputDraft: initialPrompt || ''
  })),

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  clearMessages: () => set({ messages: [INITIAL_COPILOT_MESSAGE] }),
  
  setIsGenerating: (generating, statusText = 'Analysing CRM context...') => set((state) => {
    if (state.isGenerating === generating && state.generationStatusText === statusText) return state;
    return {
      isGenerating: generating,
      generationStatusText: statusText
    };
  }),

  setInputDraft: (inputDraft) => set((state) => state.inputDraft === inputDraft ? state : { inputDraft })
}));

