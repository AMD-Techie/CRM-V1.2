import React, { useState } from 'react';
import { useKnowledgeSourcesQuery, useKnowledgeDocsQuery, useReindexSourceMutation } from '../../hooks';
import { KnowledgeSource, KnowledgeDocument } from '../../types/knowledge';
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
  IconArrowRight
} from '../../components/Icons';

interface KnowledgeBaseViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ onNavigate }) => {
  const { data: sources = [], isLoading: sourcesLoading } = useKnowledgeSourcesQuery();
  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>(undefined);
  const { data: docs = [], isLoading: docsLoading } = useKnowledgeDocsQuery(selectedSourceId);
  const reindexMutation = useReindexSourceMutation();

  const [searchTerm, setSearchTerm] = useState('');

  const activeSource = sources.find(s => s.id === selectedSourceId);
  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconDatabase className="w-4 h-4" />
            <span>Agent Retrieval-Augmented Knowledge Plane</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            CRM Knowledge Base & Playbooks
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Centralized repository of playbooks, pricing policies, and compliance documents vectorized for autonomous agent retrieval and context grounding.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onNavigate && (
            <button
              onClick={() => onNavigate('ai_agents')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-500 text-white shadow-xs transition-all flex items-center gap-2"
            >
              <IconSparkles className="w-3.5 h-3.5" />
              <span>Bound Agents</span>
            </button>
          )}
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map((source) => {
          const isSelected = selectedSourceId === source.id;
          return (
            <div
              key={source.id}
              onClick={() => setSelectedSourceId(selectedSourceId === source.id ? undefined : source.id)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 shadow-sm ring-1 ring-primary-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    <IconDatabase className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Indexed
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                  {source.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {source.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{source.totalDocuments} Docs · {(source.totalTokens / 1000).toFixed(0)}k Tokens</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">{source.boundAgentsCount} Agents</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Documents Table Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Table Header & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {activeSource ? `Documents in "${activeSource.name}"` : 'All Indexed Knowledge Documents'} ({filteredDocs.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Vector chunks and token usage accessible for RAG grounding.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-slate-200/60 dark:border-slate-700 shrink-0 mt-0.5">
                  <IconFileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {doc.title}
                    </h4>
                    <span className="px-2 py-0.2 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/60 dark:border-slate-700">
                      {doc.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-1">
                    {doc.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 self-end md:self-auto">
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{doc.chunkCount} Chunks</span>
                  <span className="block text-[10px] text-slate-400">{(doc.tokenCount / 1000).toFixed(1)}k tokens · {doc.fileSize}</span>
                </div>

                <button
                  onClick={() => reindexMutation.mutate(doc.sourceId)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
                  title="Re-index vector chunks"
                >
                  <IconRefreshCw className={`w-3.5 h-3.5 ${reindexMutation.isPending ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-400">
              No documents found matching the criteria.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
