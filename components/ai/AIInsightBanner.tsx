import React from 'react';
import { IconSparkles, IconAlertTriangle, IconTrendingUp, IconArrowRight, IconZap } from '../Icons';

interface AIInsightBannerProps {
  type?: 'risk_warning' | 'buying_signal' | 'velocity_anomaly' | 'next_best_action';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  confidenceScore?: number;
  className?: string;
}

export const AIInsightBanner: React.FC<AIInsightBannerProps> = ({
  type = 'next_best_action',
  title,
  description,
  actionLabel,
  onAction,
  confidenceScore,
  className = ''
}) => {
  const getStyle = () => {
    switch (type) {
      case 'risk_warning':
        return {
          container: 'bg-rose-50/60 dark:bg-rose-950/25 border-rose-200/80 dark:border-rose-900/40 text-rose-900 dark:text-rose-200',
          icon: <IconAlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
          button: 'bg-rose-600 hover:bg-rose-500 text-white'
        };
      case 'buying_signal':
        return {
          container: 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200',
          icon: <IconTrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />,
          button: 'bg-emerald-600 hover:bg-emerald-500 text-white'
        };
      case 'velocity_anomaly':
        return {
          container: 'bg-amber-50/60 dark:bg-amber-950/25 border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200',
          icon: <IconZap className="w-4 h-4 text-amber-500 shrink-0" />,
          button: 'bg-amber-600 hover:bg-amber-500 text-white'
        };
      case 'next_best_action':
      default:
        return {
          container: 'bg-indigo-50/60 dark:bg-indigo-950/25 border-indigo-200/80 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200',
          icon: <IconSparkles className="w-4 h-4 text-indigo-500 shrink-0" />,
          button: 'bg-indigo-600 hover:bg-indigo-500 text-white'
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${style.container} ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 shadow-2xs shrink-0">
          {style.icon}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h5 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              {title}
            </h5>
            {confidenceScore && (
              <span className="text-[10px] font-mono font-bold opacity-75">
                {confidenceScore}% confidence
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs shrink-0 transition-all flex items-center gap-1.5 justify-center ${style.button}`}
        >
          <span>{actionLabel}</span>
          <IconArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
