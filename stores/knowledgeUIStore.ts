import { create } from 'zustand';
import { RetrievalMode, RetrievalStrategy, RerankerProvider } from '../types/rag';

export type KnowledgeConsoleTab = 
  | 'sources' 
  | 'documents' 
  | 'playground' 
  | 'diagnostics' 
  | 'citations' 
  | 'evaluations';

export interface KnowledgeUIState {
  activeTab: KnowledgeConsoleTab;
  selectedSourceId: string | null;
  selectedDocumentId: string | null;
  selectedChunkId: string | null;
  selectedCitationId: string | null;
  
  // Playground state
  playgroundQuery: string;
  playgroundMode: RetrievalMode;
  playgroundStrategy: RetrievalStrategy;
  playgroundReranker: RerankerProvider;
  playgroundTopK: number;
  playgroundThreshold: number;
  playgroundSelectedSourceId: string | 'all';
  
  // Diagnostics filter
  diagnosticCategoryFilter: string;
  
  // Actions
  setActiveTab: (tab: KnowledgeConsoleTab) => void;
  setSelectedSourceId: (id: string | null) => void;
  setSelectedDocumentId: (id: string | null) => void;
  setSelectedChunkId: (id: string | null) => void;
  setSelectedCitationId: (id: string | null) => void;
  setPlaygroundQuery: (q: string) => void;
  setPlaygroundMode: (mode: RetrievalMode) => void;
  setPlaygroundStrategy: (strategy: RetrievalStrategy) => void;
  setPlaygroundReranker: (reranker: RerankerProvider) => void;
  setPlaygroundTopK: (topK: number) => void;
  setPlaygroundThreshold: (threshold: number) => void;
  setPlaygroundSelectedSourceId: (sourceId: string | 'all') => void;
  setDiagnosticCategoryFilter: (category: string) => void;
  resetPlayground: () => void;
}

export const useKnowledgeUIStore = create<KnowledgeUIState>((set) => ({
  activeTab: 'sources',
  selectedSourceId: null,
  selectedDocumentId: null,
  selectedChunkId: null,
  selectedCitationId: null,

  playgroundQuery: 'What is our standard multi-year discount policy and SOC2 data residency compliance?',
  playgroundMode: 'hybrid',
  playgroundStrategy: 'single_shot',
  playgroundReranker: 'cross_encoder',
  playgroundTopK: 4,
  playgroundThreshold: 0.60,
  playgroundSelectedSourceId: 'all',
  
  diagnosticCategoryFilter: 'all',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedSourceId: (id) => set({ selectedSourceId: id, selectedDocumentId: null, selectedChunkId: null }),
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id, selectedChunkId: null }),
  setSelectedChunkId: (id) => set({ selectedChunkId: id }),
  setSelectedCitationId: (id) => set({ selectedCitationId: id }),
  
  setPlaygroundQuery: (playgroundQuery) => set({ playgroundQuery }),
  setPlaygroundMode: (playgroundMode) => set({ playgroundMode }),
  setPlaygroundStrategy: (playgroundStrategy) => set({ playgroundStrategy }),
  setPlaygroundReranker: (playgroundReranker) => set({ playgroundReranker }),
  setPlaygroundTopK: (playgroundTopK) => set({ playgroundTopK }),
  setPlaygroundThreshold: (playgroundThreshold) => set({ playgroundThreshold }),
  setPlaygroundSelectedSourceId: (playgroundSelectedSourceId) => set({ playgroundSelectedSourceId }),
  setDiagnosticCategoryFilter: (diagnosticCategoryFilter) => set({ diagnosticCategoryFilter }),
  
  resetPlayground: () => set({
    playgroundQuery: '',
    playgroundMode: 'hybrid',
    playgroundStrategy: 'single_shot',
    playgroundReranker: 'cross_encoder',
    playgroundTopK: 4,
    playgroundThreshold: 0.60,
    playgroundSelectedSourceId: 'all'
  })
}));
