import React from 'react';
import { useRAGDiagnosticsQuery, useClearRAGDiagnosticsMutation } from '../../hooks';
import { useKnowledgeUIStore } from '../../stores/knowledgeUIStore';
import { RAGDiagnosticCategory } from '../../types/rag';
import { 
  IconAlertTriangle, 
  IconCheckCircle, 
  IconZap, 
  IconRefreshCw, 
  IconSearch, 
  IconFilter, 
  IconClock, 
  IconShield,
  IconX
} from '../../components/Icons';

export const KnowledgeDiagnosticsPanel: React.FC = () => {
  const { data: diagnostics = [], isLoading, refetch } = useRAGDiagnosticsQuery();
  const clearMutation = useClearRAGDiagnosticsMutation();
  const { diagnosticCategoryFilter, setDiagnosticCategoryFilter } = useKnowledgeUIStore();

  const categories = [
    'all',
    'StaleIndex',
    'KeywordMiss',
    'RerankerDroppedEvidence',
    'MetadataFilterDrop',
    'LowSimilarity',
    'NoKnowledgeFound'
  ];

  const filtered = diagnostics.filter(d => {
    if (diagnosticCategoryFilter === 'all') return true;
    return d.category === diagnosticCategoryFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wider">
            <IconZap className="w-4 h-4" />
            <span>RAG Failure Diagnostics & Retrieval Quality Clinic</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Retrieval Diagnostics & Root-Cause Inspector
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Inspect retrieval cutoffs, lexical misses, filter drops, and corpus staleness. Understand exactly why an agent or Copilot execution received or missed specific evidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Diagnostic Logs"
          >
            <IconRefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending || diagnostics.length === 0}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            Clear Diagnostic History
          </button>
        </div>
      </div>

      {/* Filter Category Bar */}
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <IconFilter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setDiagnosticCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              diagnosticCategoryFilter === cat
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat === 'all' ? `All Records (${diagnostics.length})` : cat}
          </button>
        ))}
      </div>

      {/* Diagnostics Records List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No diagnostic records matching the selected category.
          </div>
        ) : (
          filtered.map(diag => (
            <div
              key={diag.id}
              className={`p-5 rounded-3xl border transition-all ${
                diag.severity === 'error'
                  ? 'border-red-500/30 bg-red-50/20 dark:bg-red-950/10'
                  : diag.severity === 'warning'
                  ? 'border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      diag.severity === 'error' ? 'bg-red-500/15 text-red-700 dark:text-red-300' :
                      diag.severity === 'warning' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' :
                      'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                    }`}>
                      {diag.category}
                    </span>
                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">
                      Domain: {diag.domainRoute}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Mode: {diag.retrievalMode.toUpperCase()}
                    </span>
                    {diag.runId && (
                      <span className="text-[10px] font-mono text-slate-400">
                        Run: {diag.runId}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Query: "{diag.query}"
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mt-1">
                    {diag.explanation}
                  </p>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">
                    {diag.timestamp}
                  </div>
                  {diag.topScore !== undefined && (
                    <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      Top Score: <strong className="text-emerald-600 dark:text-emerald-400">{diag.topScore}</strong> (Cutoff: {diag.scoreCutoff || 0.60})
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-slate-400">
                    Evidence Count: {diag.evidenceCount}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
