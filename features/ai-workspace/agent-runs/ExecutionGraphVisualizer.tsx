import React from 'react';
import { ExecutionGraph, ExecutionNode, ExecutionNodeType, ExecutionNodeStatus } from '../../../types/ai';
import { 
  IconZap, 
  IconCheckCircle, 
  IconClock, 
  IconLock, 
  IconAlertTriangle, 
  IconArrowRight, 
  IconShield,
  IconSparkles,
  IconShare2,
  IconRefreshCw,
  IconBox,
  IconUsers
} from '../../../components/Icons';

interface ExecutionGraphVisualizerProps {
  graph?: ExecutionGraph | null;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const ExecutionGraphVisualizer: React.FC<ExecutionGraphVisualizerProps> = ({
  graph,
  selectedNodeId,
  onSelectNode
}) => {
  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
        No execution graph defined for this agent version or workflow.
      </div>
    );
  }

  const getNodeIcon = (type: ExecutionNodeType) => {
    switch (type) {
      case 'skill':
        return <IconSparkles className="w-3.5 h-3.5 text-primary-500" />;
      case 'action':
        return <IconZap className="w-3.5 h-3.5 text-blue-500" />;
      case 'approval':
        return <IconLock className="w-3.5 h-3.5 text-amber-500" />;
      case 'condition':
        return <IconShare2 className="w-3.5 h-3.5 text-purple-500" />;
      case 'parallel':
        return <IconBox className="w-3.5 h-3.5 text-indigo-500" />;
      case 'loop':
        return <IconRefreshCw className="w-3.5 h-3.5 text-cyan-500" />;
      case 'handoff':
        return <IconUsers className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <IconZap className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getNodeStatusBadge = (status?: ExecutionNodeStatus) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 flex items-center gap-1"><IconCheckCircle className="w-2.5 h-2.5" /> Completed</span>;
      case 'running':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary-500/15 text-primary-800 dark:text-primary-300 flex items-center gap-1 animate-pulse"><IconClock className="w-2.5 h-2.5" /> Running</span>;
      case 'waiting_for_approval':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center gap-1"><IconLock className="w-2.5 h-2.5" /> Waiting Approval</span>;
      case 'failed':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-800 dark:text-red-300 flex items-center gap-1"><IconAlertTriangle className="w-2.5 h-2.5" /> Failed</span>;
      case 'skipped':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">Skipped</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400">Pending</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Graph Header */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white">{graph.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {graph.version}
            </span>
          </div>
          {graph.description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{graph.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
          <span>{graph.nodes.length} Orchestration Nodes</span>
        </div>
      </div>

      {/* Nodes List / Flow Grid */}
      <div className="space-y-3">
        {graph.nodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={() => onSelectNode && onSelectNode(node.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-2 ring-primary-500/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getNodeIcon(node.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {node.name}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {node.type}
                      </span>
                    </div>

                    {node.description && (
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {node.description}
                      </p>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-2.5 mt-2 flex-wrap text-[10px]">
                      {node.skillName && (
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <IconSparkles className="w-3 h-3 text-primary-500" />
                          Skill: <strong>{node.skillName}</strong>
                        </span>
                      )}
                      {node.targetAgentName && (
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <IconUsers className="w-3 h-3 text-emerald-500" />
                          Handoff: <strong>{node.targetAgentName}</strong>
                        </span>
                      )}
                      {node.conditionExpression && (
                        <span className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                          branch: {node.conditionExpression}
                        </span>
                      )}
                      {node.parallelBranchNodeIds && (
                        <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                          Parallel: {node.parallelBranchNodeIds.length} sub-branches
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {getNodeStatusBadge(node.status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
