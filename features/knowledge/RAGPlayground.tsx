import React, { useState } from 'react';
import { 
  useRAGSearchQuery, 
  useKnowledgeSourcesQuery, 
  useRAGContextPackQuery, 
  useEvaluateGroundingMutation 
} from '../../hooks';
import { useKnowledgeUIStore } from '../../stores/knowledgeUIStore';
import { RetrievalMode, RetrievalStrategy, RerankerProvider, KnowledgeCitation, GroundingEvaluation, RAGEvidence } from '../../types/rag';
import { 
  IconSearch, 
  IconSparkles, 
  IconZap, 
  IconShield, 
  IconLayers, 
  IconCheckCircle, 
  IconAlertTriangle, 
  IconClock, 
  IconArrowRight,
  IconLock,
  IconDatabase,
  IconFilter
} from '../../components/Icons';

export const RAGPlayground: React.FC = () => {
  const {
    playgroundQuery,
    setPlaygroundQuery,
    playgroundMode,
    setPlaygroundMode,
    playgroundStrategy,
    setPlaygroundStrategy,
    playgroundReranker,
    setPlaygroundReranker,
    playgroundTopK,
    setPlaygroundTopK,
    playgroundThreshold,
    setPlaygroundThreshold,
    playgroundSelectedSourceId,
    setPlaygroundSelectedSourceId,
    setSelectedCitationId
  } = useKnowledgeUIStore();

  const [submittedQuery, setSubmittedQuery] = useState(playgroundQuery);
  const [testAnswer, setTestAnswer] = useState('Nova CRM complies with SOC2 Type II in Frankfurt and US-East, maintaining AES-256 encryption at rest with Zero Data Retention on Gemini LLM calls. Multi-year commitments receive up to 18% discount at VP approval.');
  const [groundingResult, setGroundingResult] = useState<GroundingEvaluation | null>(null);

  const { data: sources = [] } = useKnowledgeSourcesQuery();

  const searchOptions = {
    mode: playgroundMode,
    strategy: playgroundStrategy,
    topK: playgroundTopK,
    minScoreThreshold: playgroundThreshold,
    reranker: playgroundReranker,
    sourceIds: playgroundSelectedSourceId !== 'all' ? [playgroundSelectedSourceId] : undefined
  };

  const { data: searchResult, isLoading: isSearching, refetch } = useRAGSearchQuery(submittedQuery, searchOptions);
  const { data: contextPack } = useRAGContextPackQuery(submittedQuery, undefined, searchOptions);
  const evaluateGroundingMutation = useEvaluateGroundingMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundQuery.trim()) return;
    setSubmittedQuery(playgroundQuery);
    setGroundingResult(null);
  };

  const handleRunGroundingEval = async () => {
    if (!contextPack || !testAnswer.trim()) return;
    const res = await evaluateGroundingMutation.mutateAsync({
      contextPack,
      answerText: testAnswer
    });
    setGroundingResult(res);
  };

  return (
    <div className="space-y-6">
      
      {/* Playground Query & Strategy Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSearch className="w-5 h-5 text-primary-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Hybrid RAG Retrieval Playground & Test Bench
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
            PraisonAI ContextPack & RRF Architecture
          </span>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={playgroundQuery}
              onChange={(e) => setPlaygroundQuery(e.target.value)}
              placeholder="Enter customer question, technical query, or pricing check..."
              className="w-full pl-4 pr-28 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <IconSparkles className="w-3.5 h-3.5" />
              <span>{isSearching ? 'Retrieving...' : 'Retrieve'}</span>
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
            {[
              { label: 'SOC2 & Data Residency', q: 'What is our standard SOC2 compliance and European data residency policy?' },
              { label: '3-Year Tier 1 Discount', q: 'Can a sales rep give a 25% discount on a 3-year contract?' },
              { label: 'Salesforce Displacement', q: 'How does Nova CRM compare against Salesforce for multi-agent workflows?' },
              { label: 'SAP ERP Webhooks', q: 'What are the bidirectional sync latency benchmarks for SAP ERP integration?' }
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPlaygroundQuery(p.q);
                  setSubmittedQuery(p.q);
                }}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </form>

        {/* Config Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Retrieval Mode</label>
            <select
              value={playgroundMode}
              onChange={(e) => setPlaygroundMode(e.target.value as RetrievalMode)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="hybrid">Hybrid (Dense + BM25 RRF)</option>
              <option value="vector">Vector Only (Dense Cosine)</option>
              <option value="keyword">Keyword Only (BM25 Okapi)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Execution Strategy</label>
            <select
              value={playgroundStrategy}
              onChange={(e) => setPlaygroundStrategy(e.target.value as RetrievalStrategy)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="single_shot">Single-Shot (Standard)</option>
              <option value="corrective">Corrective RAG (CRAG Gate)</option>
              <option value="agentic">Agentic Multi-Hop</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Two-Stage Reranker</label>
            <select
              value={playgroundReranker}
              onChange={(e) => setPlaygroundReranker(e.target.value as RerankerProvider)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="cross_encoder">Cross-Encoder (BGE-Large)</option>
              <option value="cohere">Cohere Rerank v3</option>
              <option value="heuristic">Heuristic Quality Scorer</option>
              <option value="none">Disabled (Raw RRF Rank)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Knowledge Source</label>
            <select
              value={playgroundSelectedSourceId}
              onChange={(e) => setPlaygroundSelectedSourceId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Sources ({sources.length})</option>
              {sources.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Min Score: {playgroundThreshold}</label>
            <input
              type="range"
              min="0.40"
              max="0.95"
              step="0.05"
              value={playgroundThreshold}
              onChange={(e) => setPlaygroundThreshold(parseFloat(e.target.value))}
              className="w-full accent-primary-600 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Retrieval Telemetry & Pipeline Breakdown */}
      {searchResult && (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Routed Domain</span>
            <div className="text-xs font-black text-primary-600 dark:text-primary-400 mt-1 truncate" title={searchResult.routedDomain}>
              {searchResult.routedDomain}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Strategy</span>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-1 uppercase">
              {searchResult.retrievalStrategy.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vector Pool</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{searchResult.vectorCandidates} Chunks</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BM25 Lexical Pool</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{searchResult.keywordCandidates} Chunks</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RAGEvidence Set</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{searchResult.evidence.length} Selected</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latency</span>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{searchResult.executionTimeMs} ms</div>
          </div>
        </div>
      )}

      {/* 2-Column Split: Retrieved Evidence Chunks & Live ContextPack Grounding Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Ranked Evidence Set (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <IconLayers className="w-4 h-4 text-primary-500" />
                <span>Ranked RAGEvidence ({searchResult?.evidence.length || 0} Chunks)</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Mode: {playgroundMode.toUpperCase()} · Strategy: {playgroundStrategy.toUpperCase()}
              </span>
            </div>

            {!searchResult || searchResult.evidence.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                No matching evidence chunks above threshold {playgroundThreshold}. Try lowering the threshold or switching to Hybrid mode.
              </div>
            ) : (
              <div className="space-y-3">
                {searchResult.evidence.map((evidenceItem: RAGEvidence) => (
                  <div
                    key={evidenceItem.id}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 transition-all hover:border-primary-400"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                            Rank #{evidenceItem.rank}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {evidenceItem.documentTitle}
                          </span>
                          {evidenceItem.pageNumber && (
                            <span className="text-[10px] font-mono text-slate-400">
                              Page {evidenceItem.pageNumber}
                            </span>
                          )}
                        </div>
                        {evidenceItem.sectionHeading && (
                          <div className="text-[11px] font-bold text-primary-600 dark:text-primary-400 mt-1">
                            {evidenceItem.sectionHeading}
                          </div>
                        )}
                      </div>

                      {/* Score Metrics Badge */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {(evidenceItem.finalScore * 100).toFixed(1)}%
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">RRF / Rerank</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      {evidenceItem.content}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                      <span>Evidence ID: {evidenceItem.id} (Chunk: {evidenceItem.chunkId})</span>
                      <span>{evidenceItem.tokens} tokens</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: ContextPack & Grounding Evaluator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <IconShield className="w-4 h-4 text-emerald-500" />
                <span>ContextPack & Grounding Gate</span>
              </h4>
              {contextPack && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                  {contextPack.totalTokens} Tokens
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Simulated AI Model Answer (To Audit for Hallucinations)
              </label>
              <textarea
                rows={4}
                value={testAnswer}
                onChange={(e) => setTestAnswer(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleRunGroundingEval}
                disabled={evaluateGroundingMutation.isPending || !contextPack}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <IconCheckCircle className="w-3.5 h-3.5" />
                <span>{evaluateGroundingMutation.isPending ? 'Auditing Claims...' : 'Evaluate Grounding & Citations'}</span>
              </button>
            </div>

            {/* Grounding Result Box */}
            {groundingResult && (
              <div className={`p-4 rounded-2xl border space-y-2.5 animate-fade-in ${
                groundingResult.status === 'grounded'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500/30 text-amber-900 dark:text-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconCheckCircle className="w-4 h-4 text-emerald-500" />
                    <strong className="text-xs font-extrabold uppercase">
                      Status: {groundingResult.status.replace(/_/g, ' ')}
                    </strong>
                  </div>
                  <span className="text-xs font-black">
                    Score: {groundingResult.score ? `${(groundingResult.score * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  {groundingResult.summary}
                </p>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                  <span>Supported Claims: {groundingResult.supportedClaimCount}</span>
                  <span>Unsupported Claims: {groundingResult.unsupportedClaimCount}</span>
                </div>
              </div>
            )}

            {/* Citations List */}
            {searchResult && searchResult.citations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Generated Citations ({searchResult.citations.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {searchResult.citations.map((cit, cIdx) => (
                    <div
                      key={cit.id}
                      onClick={() => setSelectedCitationId(cit.id)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1 cursor-pointer hover:border-primary-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[11px] text-slate-900 dark:text-white">
                          [{cIdx + 1}] {cit.documentTitle}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                          {cit.confidenceScore ? `${(cit.confidenceScore * 100).toFixed(0)}% Conf.` : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic truncate">
                        "{cit.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
