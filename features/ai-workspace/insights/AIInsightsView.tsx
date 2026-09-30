import React, { useState } from 'react';
import { useInsightsQuery } from '../../../hooks';
import { AIInsight } from '../../../types/ai';
import { AIInsightBanner } from '../../../components/ai/AIInsightBanner';
import { 
  IconSparkles, 
  IconAlertTriangle, 
  IconTrendingUp, 
  IconZap, 
  IconShield, 
  IconFilter, 
  IconArrowRight 
} from '../../../components/Icons';

interface AIInsightsViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ onNavigate }) => {
  const { data: insights = [], isLoading } = useInsightsQuery();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredInsights = insights.filter(ins => {
    return filterType === 'all' || ins.type === filterType;
  });

  const counts = {
    all: insights.length,
    risk_warning: insights.filter(i => i.type === 'risk_warning').length,
    buying_signal: insights.filter(i => i.type === 'buying_signal').length,
    velocity_anomaly: insights.filter(i => i.type === 'velocity_anomaly').length,
    next_best_action: insights.filter(i => i.type === 'next_best_action').length,
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">
            <IconSparkles className="w-4 h-4" />
            <span>Operational Intelligence Radar</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Insights & Revenue Signals
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Real-time pipeline risk detection, high-intent buyer behavior anomalies, and predictive next-best-action recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onNavigate && (
            <button
              onClick={() => onNavigate('ai_command_center')}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all"
            >
              Command Center
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        {[
          { id: 'all', label: 'All Signals', count: counts.all, icon: IconSparkles },
          { id: 'risk_warning', label: 'Risk Warnings', count: counts.risk_warning, icon: IconAlertTriangle },
          { id: 'buying_signal', label: 'Buying Signals', count: counts.buying_signal, icon: IconZap },
          { id: 'velocity_anomaly', label: 'Velocity Trends', count: counts.velocity_anomaly, icon: IconTrendingUp },
          { id: 'next_best_action', label: 'Next Best Actions', count: counts.next_best_action, icon: IconShield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                filterType === tab.id
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterType === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Insights Stream */}
      <div className="space-y-3.5">
        {filteredInsights.map((insight) => (
          <AIInsightBanner
            key={insight.id}
            insight={insight}
            onActionClick={(actionType, targetId) => {
              if (onNavigate) {
                if (actionType === 'schedule_meeting' || actionType === 'view_deal') {
                  onNavigate('pipeline', targetId);
                } else if (actionType === 'send_email' || actionType === 'view_lead') {
                  onNavigate('leads', targetId);
                } else if (actionType === 'approve_action') {
                  onNavigate('ai_approvals');
                } else if (actionType === 'navigate_reporting') {
                  onNavigate('reporting');
                }
              }
            }}
          />
        ))}

        {filteredInsights.length === 0 && (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
            No insights found for this category filter.
          </div>
        )}
      </div>

    </div>
  );
};
