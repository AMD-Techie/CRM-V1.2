import React from 'react';
import { IconMail, IconPhone, IconCalendar, IconFileText, IconEdit, IconZap, IconSparkles } from './Icons';

export interface TimelineActivity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'field_change' | 'workflow' | 'ai';
  title: string;
  description?: string;
  user?: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getIcon = (type: TimelineActivity['type']) => {
    switch (type) {
      case 'email': return <IconMail className="w-4 h-4 text-blue-500" />;
      case 'call': return <IconPhone className="w-4 h-4 text-emerald-500" />;
      case 'meeting': return <IconCalendar className="w-4 h-4 text-purple-500" />;
      case 'note': return <IconFileText className="w-4 h-4 text-amber-500" />;
      case 'field_change': return <IconEdit className="w-4 h-4 text-slate-500 text-gray-500 dark:text-gray-400" />;
      case 'workflow': return <IconZap className="w-4 h-4 text-orange-500" />;
      case 'ai': return <IconSparkles className="w-4 h-4 text-primary-500" />;
    }
  };

  const getBg = (type: TimelineActivity['type']) => {
    switch (type) {
      case 'email': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
      case 'call': return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
      case 'meeting': return 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800';
      case 'note': return 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
      case 'field_change': return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
      case 'workflow': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
      case 'ai': return 'bg-primary-100 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800';
    }
  };

  if (!activities || activities.length === 0) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">No recent activity.</div>;
  }

  const sortedActivities = [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:left-[11px] before:-z-10 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {sortedActivities.map(activity => (
        <div key={activity.id} className="relative group">
           <div className={`absolute -left-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm ${getBg(activity.type)}`}>
             {getIcon(activity.type)}
           </div>
           <div>
             <div className="flex items-center gap-2 mb-1">
               <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</h4>
               <span className="text-xs text-slate-500 dark:text-slate-400">
                 {new Date(activity.timestamp).toLocaleString(undefined, {
                   month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                 })}
               </span>
               {activity.user && (
                 <>
                  <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">by {activity.user}</span>
                 </>
               )}
             </div>
             {activity.description && (
               <p className="text-sm text-slate-600 dark:text-slate-300">{activity.description}</p>
             )}
             {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400">
                   {Object.entries(activity.metadata).map(([key, val]) => (
                     <div key={key}><span className="font-semibold text-slate-500">{key}:</span> {val}</div>
                   ))}
                </div>
             )}
           </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
