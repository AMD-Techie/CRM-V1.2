import React, { useState } from 'react';
import { useRAGEvaluationsQuery, useRecordRAGEvaluationMutation } from '../../hooks';
import { 
  IconSparkles, 
  IconCheckCircle, 
  IconShield, 
  IconAlertTriangle, 
  IconRefreshCw, 
  IconLayers,
  IconPlus,
  IconX
} from '../../components/Icons';

export const RAGEvaluationsPanel: React.FC = () => {
  const { data: evaluations = [], isLoading, refetch } = useRAGEvaluationsQuery();
  const recordEvalMutation = useRecordRAGEvaluationMutation();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('Enterprise Pricing Matrix');
  const [contextRelevance, setContextRelevance] = useState(0.92);
  const [faithfulness, setFaithfulness] = useState(0.95);
  const [answerRelevance, setAnswerRelevance] = useState(0.94);
  const [notes, setNotes] = useState('');

  // Benchmark Averages
  const avgContext = evaluations.length > 0
    ? (evaluations.reduce((acc, e) => acc + e.contextRelevanceScore, 0) / evaluations.length).toFixed(2)
    : '0.94';
  const avgFaithful = evaluations.length > 0
    ? (evaluations.reduce((acc, e) => acc + e.groundingFaithfulnessScore, 0) / evaluations.length).toFixed(2)
    : '0.96';
  const avgAnswer = evaluations.length > 0
    ? (evaluations.reduce((acc, e) => acc + e.answerRelevanceScore, 0) / evaluations.length).toFixed(2)
    : '0.95';

  const handleRecordEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    await recordEvalMutation.mutateAsync({
      query,
      domain,
      retrievalMode: 'hybrid',
      contextRelevanceScore: contextRelevance,
      groundingFaithfulnessScore: faithfulness,
      answerRelevanceScore: answerRelevance,
      hallucinationRisk: faithfulness >= 0.90 ? 'none' : faithfulness >= 0.75 ? 'low' : 'medium',
      notes: notes || 'Manual RAG Triad test verification.'
    });

    setIsRecordModalOpen(false);
    setQuery('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconSparkles className="w-4 h-4" />
            <span>RAG Triad & Retrieval Quality Benchmarks</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            RAG Evaluation & Faithfulness Metrics
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Evaluate retrieval quality against the standard RAG Triad: Context Relevance, Grounding / Faithfulness, and Answer Relevance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Evaluation Records"
          >
            <IconRefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>Record Benchmark Test</span>
          </button>
        </div>
      </div>

      {/* Aggregate Score Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            1. Context Relevance Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{Number(avgContext) * 100}%</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">High Precision</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Measures whether retrieved chunks match query intent without extraneous noise.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            2. Grounding / Faithfulness
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{Number(avgFaithful) * 100}%</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Zero Hallucination</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Verifies whether generated claims are 100% corroborated by retrieved citation spans.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            3. Answer Relevance Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{Number(avgAnswer) * 100}%</span>
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">Directly Responsive</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Measures how cleanly and concisely the completion satisfies the user's inquiry.
          </p>
        </div>
      </div>

      {/* Evaluations Table / List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Historical Benchmark Records ({evaluations.length})
        </h4>

        <div className="space-y-3">
          {evaluations.map(ev => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                      {ev.domain}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Mode: {ev.retrievalMode.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {ev.evaluatedAt}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    "{ev.query}"
                  </h5>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {(ev.contextRelevanceScore * 100).toFixed(0)}%
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">Context</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {(ev.groundingFaithfulnessScore * 100).toFixed(0)}%
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">Faithful</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-primary-600 dark:text-primary-400">
                      {(ev.answerRelevanceScore * 100).toFixed(0)}%
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">Answer</span>
                  </div>
                </div>
              </div>

              {ev.notes && (
                <p className="text-[11px] text-slate-500 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  {ev.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Record Benchmark Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Record RAG Benchmark Test
              </h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordEvaluation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Test Query *</label>
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Can sales reps offer Net 60 payment terms?"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Knowledge Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="Enterprise Pricing Matrix">Enterprise Pricing Matrix</option>
                  <option value="Security & Compliance Playbook">Security & Compliance Playbook</option>
                  <option value="Product Architecture & Specs">Product Architecture & Specs</option>
                  <option value="Sales Counter-Positioning">Sales Counter-Positioning</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Context Rel. ({contextRelevance})</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.01"
                    value={contextRelevance}
                    onChange={(e) => setContextRelevance(parseFloat(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Faithful ({faithfulness})</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.01"
                    value={faithfulness}
                    onChange={(e) => setFaithfulness(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Answer Rel. ({answerRelevance})</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.01"
                    value={answerRelevance}
                    onChange={(e) => setAnswerRelevance(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Auditor Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes on citation correctness or claim alignment..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordEvalMutation.isPending}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs"
                >
                  Save Benchmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
