import React, { useState } from 'react';
import { 
  useSkillEvaluationsQuery, 
  useSkillImprovementCandidatesQuery, 
  useSkillsQuery, 
  useRunSkillEvaluationMutation, 
  useReviewImprovementCandidateMutation,
  usePublishCandidateVersionMutation
} from '../../../hooks';
import { SkillEvaluation, SkillImprovementCandidate } from '../../../types/ai';
import { 
  IconSparkles, 
  IconPlay, 
  IconCheckCircle, 
  IconAlertTriangle, 
  IconClock, 
  IconShield, 
  IconZap, 
  IconX,
  IconArrowRight,
  IconCheck,
  IconRefreshCw
} from '../../../components/Icons';

interface SkillEvaluationsViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const SkillEvaluationsView: React.FC<SkillEvaluationsViewProps> = ({ onNavigate }) => {
  const { data: evaluations = [], refetch: refetchEvals } = useSkillEvaluationsQuery();
  const { data: candidates = [], refetch: refetchCandidates } = useSkillImprovementCandidatesQuery();
  const { data: skills = [] } = useSkillsQuery();

  const runEvaluationMutation = useRunSkillEvaluationMutation();
  const reviewCandidateMutation = useReviewImprovementCandidateMutation();
  const publishCandidateMutation = usePublishCandidateVersionMutation();

  const [selectedEvalSkillId, setSelectedEvalSkillId] = useState<string>('');
  const [evalType, setEvalType] = useState<'offline' | 'trajectory' | 'regression'>('regression');
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRunEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    const skill = skills.find(s => s.id === selectedEvalSkillId) || skills[0];
    if (!skill) return;

    await runEvaluationMutation.mutateAsync({
      skillId: skill.id,
      evaluationType: evalType
    });

    setIsRunModalOpen(false);
    setToastMessage(`Evaluation suite (${evalType}) completed for ${skill.name}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReviewCandidate = async (candidateId: string, decision: 'approved' | 'rejected') => {
    await reviewCandidateMutation.mutateAsync({ candidateId, decision });
    setToastMessage(`Candidate ${decision === 'approved' ? 'Approved for Publication' : 'Rejected'}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePublishCandidate = async (candidateId: string) => {
    await publishCandidateMutation.mutateAsync(candidateId);
    setToastMessage(`New skill version published successfully via SkillOpt validation gate!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-white flex items-center justify-between shadow-xl animate-fade-in fixed bottom-6 right-6 z-50 max-w-md">
          <div className="flex items-center gap-3">
            <IconCheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconSparkles className="w-4 h-4" />
            <span>Skill Quality & Validation Architecture</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Skill Evaluations & Controlled Optimization
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Microsoft SkillOpt validation-gated optimization: offline regression suites, trajectory accuracy scoring, and human-authorized version promotion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { refetchEvals(); refetchCandidates(); }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Evaluations"
          >
            <IconRefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (skills.length > 0) setSelectedEvalSkillId(skills[0].id);
              setIsRunModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlay className="w-3.5 h-3.5" />
            <span>Run Benchmark Suite</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split: Evaluations Benchmark Runs & Controlled Improvement Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Benchmark Evaluations (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Benchmark Evaluation Runs ({evaluations.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Offline & Trajectory Suites</span>
            </div>

            <div className="space-y-3">
              {evaluations.map(ev => (
                <div key={ev.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{ev.skillName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{ev.skillVersion}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                        Suite: {ev.evaluationType}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {ev.score}%
                      </span>
                      <div className="text-[9px] text-slate-400">Score Rating</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {ev.notes}
                  </p>

                  {ev.metrics && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                      <div>
                        <span className="text-slate-400">Accuracy:</span>
                        <strong className="ml-1 text-slate-800 dark:text-slate-200">{ev.metrics.accuracy}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Policy Check:</span>
                        <strong className="ml-1 text-slate-800 dark:text-slate-200">{ev.metrics.policyCompliance}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Avg Latency:</span>
                        <strong className="ml-1 text-slate-800 dark:text-slate-200">{ev.metrics.latencyAvgMs}ms</strong>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Controlled Improvement Candidates (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  Skill Improvement Candidates ({candidates.length})
                </h3>
                <span className="text-[10px] text-slate-400">Human Approval Gate Required</span>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-amber-500/15 text-amber-800 dark:text-amber-300">
                Validation Gate
              </span>
            </div>

            <div className="space-y-3">
              {candidates.map(cand => (
                <div key={cand.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{cand.skillName}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {cand.sourceVersion} → <strong className="text-primary-600 dark:text-primary-400">{cand.proposedVersion}</strong>
                        </span>
                      </div>
                      {cand.scoreImprovementDelta && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Estimated Delta: +{cand.scoreImprovementDelta}% benchmark improvement
                        </span>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      cand.status === 'published' ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' :
                      cand.status === 'approved' ? 'bg-blue-500/15 text-blue-800 dark:text-blue-300' :
                      'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                    }`}>
                      {cand.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    Reason: {cand.reason}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                    {cand.proposedChanges}
                  </div>

                  {/* Review / Publish Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {cand.status === 'proposed' || cand.status === 'under_review' ? (
                      <>
                        <button
                          onClick={() => handleReviewCandidate(cand.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleReviewCandidate(cand.id, 'approved')}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs flex items-center gap-1"
                        >
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>Approve Changes</span>
                        </button>
                      </>
                    ) : cand.status === 'approved' ? (
                      <button
                        onClick={() => handlePublishCandidate(cand.id)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5"
                      >
                        <IconCheckCircle className="w-3.5 h-3.5" />
                        <span>Publish New Version ({cand.proposedVersion})</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        Published to Production by {cand.reviewedBy || 'Alex Chen'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Run Benchmark Evaluation Modal */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <IconSparkles className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Run Skill Evaluation Suite
                  </h3>
                  <p className="text-xs text-slate-500">Benchmark skill performance and compliance</p>
                </div>
              </div>
              <button onClick={() => setIsRunModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRunEvaluation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Procedural Skill *</label>
                <select
                  value={selectedEvalSkillId}
                  onChange={(e) => setSelectedEvalSkillId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                >
                  {skills.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.version})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Evaluation Strategy</label>
                <select
                  value={evalType}
                  onChange={(e) => setEvalType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="regression">Regression Suite (Historical CRM dataset)</option>
                  <option value="trajectory">Trajectory Evaluation (Multi-step action safety)</option>
                  <option value="offline">Offline Synthetic Scenarios</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRunModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={runEvaluationMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <IconPlay className="w-3.5 h-3.5" />
                  <span>{runEvaluationMutation.isPending ? 'Executing Evaluation...' : 'Run Evaluation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
