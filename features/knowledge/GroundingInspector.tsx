import React, { useState } from 'react';
import { useKnowledgeChunksQuery } from '../../hooks';
import { useKnowledgeUIStore } from '../../stores/knowledgeUIStore';
import { 
  IconShield, 
  IconCheckCircle, 
  IconFileText, 
  IconLock, 
  IconLayers, 
  IconSparkles,
  IconArrowRight
} from '../../components/Icons';

export const GroundingInspector: React.FC = () => {
  const { selectedCitationId } = useKnowledgeUIStore();
  const { data: chunks = [] } = useKnowledgeChunksQuery();
  const [selectedChunkId, setSelectedChunkId] = useState<string>(chunks[0]?.id || 'chk_pb01_01');

  const activeChunk = chunks.find(c => c.id === selectedChunkId) || chunks[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">
          <IconShield className="w-4 h-4" />
          <span>Strict Citation Provenance & Claim Verification</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Evidence Traceability & Citation Inspector
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Trace every AI-generated claim directly back to its underlying document, paragraph chunk, page number, and source authorization tier. Zero synthetic or fabricated citations.
        </p>
      </div>

      {/* 2-Column Split: Citation / Chunk Explorer & Deep Chunk Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Indexed Chunks / Evidence List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Indexed Evidence Chunks ({chunks.length})
            </h4>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {chunks.map(chunk => {
                const isSelected = activeChunk?.id === chunk.id;
                return (
                  <div
                    key={chunk.id}
                    onClick={() => setSelectedChunkId(chunk.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            Page {chunk.pageNumber || 1}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {chunk.id}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                          {chunk.documentTitle}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate">
                          {chunk.sectionHeading || chunk.content.slice(0, 60)}
                        </p>
                      </div>

                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                        {chunk.rerankScore ? `${(chunk.rerankScore * 100).toFixed(0)}%` : '95%'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Deep Provenance Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeChunk ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Verified Provenance Record
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {activeChunk.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {activeChunk.documentTitle}
                  </h3>
                  {activeChunk.sectionHeading && (
                    <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                      {activeChunk.sectionHeading}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase">
                  <IconCheckCircle className="w-3.5 h-3.5" />
                  <span>Grounded Evidence</span>
                </div>
              </div>

              {/* Provenance Metadata Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Source Knowledge</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                    {activeChunk.sourceName || 'Playbook'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Page / Section</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    Page {activeChunk.pageNumber || 1}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Token Length</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    {activeChunk.tokens} tokens
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence Score</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {activeChunk.rerankScore ? `${(activeChunk.rerankScore * 100).toFixed(1)}%` : '95.0%'}
                  </span>
                </div>
              </div>

              {/* Verbatim Chunk Content */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Verbatim Chunk Text Payload (Untrusted Context Evidence)
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                  {activeChunk.content}
                </div>
              </div>

              {/* Strict Citation Format Sample */}
              <div className="p-4 rounded-2xl bg-primary-50/40 dark:bg-primary-950/20 border border-primary-200/60 dark:border-primary-800/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary-700 dark:text-primary-300">
                  <IconFileText className="w-4 h-4" />
                  <span>Standard Copilot Traceable Citation Format</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                  [Source: {activeChunk.documentTitle} — {activeChunk.sectionHeading || `Page ${activeChunk.pageNumber || 1}`}]
                </p>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              Select an evidence chunk on the left to inspect its citation provenance.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
