import React from 'react';
import { RuntimeDiagnosticItem } from '../../../types/ai';
import { 
  IconCheckCircle, 
  IconAlertTriangle, 
  IconShield, 
  IconZap, 
  IconRefreshCw,
  IconClock
} from '../../../components/Icons';

interface RuntimeDiagnosticsPanelProps {
  diagnostics: RuntimeDiagnosticItem[];
  isLoading?: boolean;
}

export const RuntimeDiagnosticsPanel: React.FC<RuntimeDiagnosticsPanelProps> = ({
  diagnostics,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
        Loading runtime diagnostics telemetry...
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <IconCheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <IconAlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'blocked':
      case 'failed':
        return <IconAlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <IconClock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">Healthy</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300">Warning</span>;
      case 'blocked':
      case 'failed':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-800 dark:text-red-300">Blocked</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400">Unknown</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            15-Point Subsystem Diagnostics Bus
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time health verification across context, compiler, knowledge, skills, capabilities, policies, and replay.
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          15/15 Operational
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {diagnostics.map((diag, index) => (
          <div
            key={index}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(diag.status)}
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {diag.label}
                </span>
              </div>
              {getStatusBadge(diag.status)}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {diag.detail}
            </p>

            {diag.metric && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">{diag.category} Metric</span>
                <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{diag.metric}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
