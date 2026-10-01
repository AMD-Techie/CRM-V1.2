import React, { useState } from 'react';
import { 
  useKnowledgeSourcesQuery, 
  useKnowledgeDocumentsQuery, 
  useReindexKnowledgeSourceMutation,
  useCreateKnowledgeSourceMutation,
  useCreateKnowledgeDocumentMutation,
  useUpdateKnowledgeSourceConfigMutation
} from '../../hooks';
import { useKnowledgeUIStore, KnowledgeConsoleTab } from '../../stores/knowledgeUIStore';
import { KnowledgeSource, KnowledgeDocument, ChunkingStrategy } from '../../types/knowledge';
import { RAGPlayground } from './RAGPlayground';
import { KnowledgeDiagnosticsPanel } from './KnowledgeDiagnosticsPanel';
import { GroundingInspector } from './GroundingInspector';
import { RAGEvaluationsPanel } from './RAGEvaluationsPanel';
import { 
  IconFileText, 
  IconDatabase, 
  IconRefreshCw, 
  IconCheckCircle, 
  IconLock, 
  IconSparkles, 
  IconPlus, 
  IconSearch, 
  IconChevronRight, 
  IconUsers,
  IconArrowRight,
  IconLayers,
  IconShield,
  IconZap,
  IconClock,
  IconX,
  IconSettings
} from '../../components/Icons';

interface KnowledgeBaseViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ onNavigate }) => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedSourceId, 
    setSelectedSourceId,
    selectedDocumentId,
    setSelectedDocumentId
  } = useKnowledgeUIStore();

  const { data: sources = [], isLoading: sourcesLoading, refetch: refetchSources } = useKnowledgeSourcesQuery();
  const { data: docs = [], isLoading: docsLoading } = useKnowledgeDocumentsQuery(selectedSourceId || undefined);
  const reindexMutation = useReindexKnowledgeSourceMutation();
  const createSourceMutation = useCreateKnowledgeSourceMutation();
  const createDocMutation = useCreateKnowledgeDocumentMutation();
  const updateConfigMutation = useUpdateKnowledgeSourceConfigMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [isNewSourceModalOpen, setIsNewSourceModalOpen] = useState(false);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configSource, setConfigSource] = useState<KnowledgeSource | null>(null);

  // Form states for new source
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<KnowledgeSource['type']>('sales_playbook');
  const [newSourceDesc, setNewSourceDesc] = useState('');
  const [newChunkStrategy, setNewChunkStrategy] = useState<ChunkingStrategy>('markdown_header');

  // Form states for new doc
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocSourceId, setNewDocSourceId] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<KnowledgeSource['type']>('sales_playbook');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocAuthor, setNewDocAuthor] = useState('Current User');

  const activeSource = sources.find(s => s.id === selectedSourceId);
  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    await createSourceMutation.mutateAsync({
      name: newSourceName,
      type: newSourceType,
      description: newSourceDesc,
      indexStatus: 'indexed',
      authorizedRoles: ['admin', 'manager', 'sales_rep'],
      config: {
        chunking: {
          strategy: newChunkStrategy,
          chunkSize: 512,
          chunkOverlap: 64,
          preserveHeaders: true
        },
        embeddingModel: 'text-embedding-004',
        retrievalK: 6,
        minScoreThreshold: 0.60,
        rerankerEnabled: true,
        rerankerModel: 'cross-encoder-bge-large',
        hybridWeightVector: 0.60,
        hybridWeightKeyword: 0.40
      }
    });
    setIsNewSourceModalOpen(false);
    setNewSourceName('');
    setNewSourceDesc('');
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocSourceId) return;
    await createDocMutation.mutateAsync({
      sourceId: newDocSourceId,
      title: newDocTitle,
      category: newDocCategory,
      version: 'v1.0',
      author: newDocAuthor,
      description: newDocDesc,
      usedByAgentIds: ['agent_lead_qual', 'agent_sales_followup']
    });
    setIsNewDocModalOpen(false);
    setNewDocTitle('');
    setNewDocDesc('');
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configSource) return;
    await updateConfigMutation.mutateAsync({
      sourceId: configSource.id,
      config: configSource.config
    });
    setIsConfigModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconDatabase className="w-4 h-4" />
            <span>Agentic RAG & Multi-Tenant Knowledge Plane</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Knowledge Base & RAG Engine
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
            Multi-tenant enterprise knowledge ingestion, BM25 + Dense vector hybrid search, reciprocal rank fusion, two-stage reranking, and claim-level grounding verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => refetchSources()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Knowledge Sources"
          >
            <IconRefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsNewSourceModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>New Knowledge Source</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'sources', label: `Sources & Chunking (${sources.length})`, icon: IconDatabase },
          { id: 'documents', label: `Documents (${docs.length})`, icon: IconFileText },
          { id: 'playground', label: 'RAG Retrieval Playground', icon: IconSearch },
          { id: 'citations', label: 'Citations & Provenance', icon: IconShield },
          { id: 'diagnostics', label: 'Failure Diagnostics', icon: IconZap },
          { id: 'evaluations', label: 'RAG Triad Evaluations', icon: IconSparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as KnowledgeConsoleTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: KNOWLEDGE SOURCES & CHUNKING CONFIG */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map(src => (
              <div
                key={src.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {src.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {src.id}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {src.name}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    src.indexStatus === 'indexed' ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' :
                    src.indexStatus === 'indexing' ? 'bg-primary-500/15 text-primary-800 dark:text-primary-300 animate-pulse' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {src.indexStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {src.description}
                </p>

                {/* Chunking & Retrieval Parameters Strip */}
                {src.config && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Chunking & Reranking</span>
                      <span className="text-[10px] font-mono text-primary-600 dark:text-primary-400">
                        {src.config.embeddingModel}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-400 block">Strategy</span>
                        <strong className="text-slate-900 dark:text-white capitalize">{src.config.chunking.strategy.replace(/_/g, ' ')}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-400 block">Size / Overlap</span>
                        <strong className="text-slate-900 dark:text-white">{src.config.chunking.chunkSize} / {src.config.chunking.chunkOverlap}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-400 block">Reranker</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{src.config.rerankerEnabled ? 'Active' : 'Off'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <span>{src.totalDocuments} docs</span>
                    <span>·</span>
                    <span>{(src.totalTokens / 1000).toFixed(0)}k tokens</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setConfigSource(src);
                        setIsConfigModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Edit Retrieval & Chunking Config"
                    >
                      <IconSettings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => reindexMutation.mutate(src.id)}
                      disabled={reindexMutation.isPending}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5"
                    >
                      <IconRefreshCw className={`w-3 h-3 ${reindexMutation.isPending ? 'animate-spin' : ''}`} />
                      <span>Reindex</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter documents by title, compliance standard..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <select
                value={selectedSourceId || ''}
                onChange={(e) => setSelectedSourceId(e.target.value || null)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="">All Sources ({docs.length} docs)</option>
                {sources.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (sources.length > 0) setNewDocSourceId(sources[0].id);
                  setIsNewDocModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>
          </div>

          {/* Document Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {doc.version}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {doc.id}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {doc.title}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                    {doc.indexStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {doc.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span>{doc.chunkCount} chunks</span>
                    <span>·</span>
                    <span>{doc.tokenCount.toLocaleString()} tokens</span>
                  </div>
                  <span>Author: {doc.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RETRIEVAL PLAYGROUND */}
      {activeTab === 'playground' && (
        <RAGPlayground />
      )}

      {/* TAB 4: CITATIONS & PROVENANCE */}
      {activeTab === 'citations' && (
        <GroundingInspector />
      )}

      {/* TAB 5: FAILURE DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <KnowledgeDiagnosticsPanel />
      )}

      {/* TAB 6: RAG TRIAD EVALUATIONS */}
      {activeTab === 'evaluations' && (
        <RAGEvaluationsPanel />
      )}

      {/* Modal: New Knowledge Source */}
      {isNewSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Create Knowledge Source
              </h3>
              <button onClick={() => setIsNewSourceModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Source Name *</label>
                <input
                  type="text"
                  required
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. Partner Agreement Playbook"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Source Type</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="sales_playbook">Sales Playbook</option>
                    <option value="product_catalog">Product Catalog</option>
                    <option value="pricing_matrix">Pricing Matrix</option>
                    <option value="faq_database">FAQ Database</option>
                    <option value="compliance_policy">Compliance Policy</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chunking Strategy</label>
                  <select
                    value={newChunkStrategy}
                    onChange={(e) => setNewChunkStrategy(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="markdown_header">Markdown Headers</option>
                    <option value="fixed">Fixed Window (512 tokens)</option>
                    <option value="sentence">Sentence Boundary</option>
                    <option value="semantic_window">Semantic Window</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={newSourceDesc}
                  onChange={(e) => setNewSourceDesc(e.target.value)}
                  placeholder="Outline purpose, target agent usage, and indexing scope..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewSourceModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSourceMutation.isPending}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs"
                >
                  Create & Index Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Document */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Upload & Ingest Document
              </h3>
              <button onClick={() => setIsNewDocModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Title *</label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Q4 Competitor Win-Loss Summary"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Source</label>
                  <select
                    value={newDocSourceId}
                    onChange={(e) => setNewDocSourceId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  >
                    {sources.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Author</label>
                  <input
                    type="text"
                    value={newDocAuthor}
                    onChange={(e) => setNewDocAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Summary</label>
                <textarea
                  rows={3}
                  value={newDocDesc}
                  onChange={(e) => setNewDocDesc(e.target.value)}
                  placeholder="Brief summary of document facts, policies, and key terms..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDocMutation.isPending}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs"
                >
                  Parse, Chunk & Vectorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Source Config */}
      {isConfigModalOpen && configSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Configure Retrieval & Chunking
                </h3>
                <p className="text-xs text-slate-500">{configSource.name}</p>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chunking Strategy</label>
                  <select
                    value={configSource.config?.chunking.strategy || 'markdown_header'}
                    onChange={(e) => setConfigSource({
                      ...configSource,
                      config: {
                        ...configSource.config!,
                        chunking: { ...configSource.config!.chunking, strategy: e.target.value as any }
                      }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="markdown_header">Markdown Headers</option>
                    <option value="fixed">Fixed Size</option>
                    <option value="sentence">Sentence Boundary</option>
                    <option value="semantic_window">Semantic Window</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Retrieval Top-K</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={configSource.config?.retrievalK || 6}
                    onChange={(e) => setConfigSource({
                      ...configSource,
                      config: {
                        ...configSource.config!,
                        retrievalK: parseInt(e.target.value) || 6
                      }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chunk Size (Tokens)</label>
                  <input
                    type="number"
                    min="128"
                    max="2048"
                    step="64"
                    value={configSource.config?.chunking.chunkSize || 512}
                    onChange={(e) => setConfigSource({
                      ...configSource,
                      config: {
                        ...configSource.config!,
                        chunking: { ...configSource.config!.chunking, chunkSize: parseInt(e.target.value) || 512 }
                      }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Overlap (Tokens)</label>
                  <input
                    type="number"
                    min="0"
                    max="256"
                    step="16"
                    value={configSource.config?.chunking.chunkOverlap || 64}
                    onChange={(e) => setConfigSource({
                      ...configSource,
                      config: {
                        ...configSource.config!,
                        chunking: { ...configSource.config!.chunking, chunkOverlap: parseInt(e.target.value) || 64 }
                      }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateConfigMutation.isPending}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
