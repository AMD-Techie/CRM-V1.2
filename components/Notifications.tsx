
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, Lead } from '../types';
import { IconBell, IconCheckCircle } from './Icons';

interface NotificationsProps {
  tasks: Task[];
  leads?: Lead[];
  onNavigateToTasks: () => void;
  onNavigateToLeads?: (leadId: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ tasks, leads = [], onNavigateToTasks, onNavigateToLeads }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { overdueTasks, upcomingTasks } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const overdue: Task[] = [];
    const upcoming: Task[] = [];

    tasks.forEach(task => {
      if (task.status === 'Completed') return;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0); // Normalize due date

      if (dueDate < today) {
        overdue.push(task);
      } else if (dueDate.getTime() === today.getTime() || dueDate.getTime() === tomorrow.getTime()) {
        upcoming.push(task);
      }
    });

    return { overdueTasks: overdue, upcomingTasks: upcoming };
  }, [tasks]);

  const stagnantLeads = useMemo(() => {
    const today = new Date();
    const stagnant: Lead[] = [];

    leads.forEach(lead => {
      const dateStr = lead.statusUpdatedAt || lead.creationDate;
      if (!dateStr) return;
      const lastUpdate = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Over 90 days (approx 3 months) is stagnant
      if (diffDays > 90) {
        stagnant.push(lead);
      }
    });

    return stagnant;
  }, [leads]);

  // Handle clicks outside the popover to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);


  const totalNotifications = overdueTasks.length + upcomingTasks.length + stagnantLeads.length;

  const handleTaskClick = (task: Task) => {
    setIsOpen(false);
    onNavigateToTasks();
    // In a real app, you might want to pass the task ID to focus on it
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all"
        aria-label={`Notifications (${totalNotifications} new)`}
      >
        <IconBell className="w-5 h-5" />
        {totalNotifications > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm">
            {totalNotifications}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 max-h-[80vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in-down ring-1 ring-black/5">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {totalNotifications === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                 <IconCheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                 <p className="font-medium">All caught up!</p>
                 <p className="text-sm">You have no new notifications.</p>
              </div>
            ) : (
              <div>
                {stagnantLeads.length > 0 && (
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-amber-500/5">
                    <h4 className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Stagnant Leads (3m+)</span>
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                    </h4>
                    <ul className="space-y-2">
                      {stagnantLeads.map(lead => (
                        <li 
                          key={lead.id} 
                          onClick={() => {
                            setIsOpen(false);
                            if (onNavigateToLeads) onNavigateToLeads(lead.id);
                          }} 
                          className="p-2 rounded-lg hover:bg-amber-500/10 dark:hover:bg-amber-500/10 cursor-pointer transition-all border border-amber-200/20 hover:border-amber-500/30 text-amber-900 dark:text-amber-300"
                        >
                          <p className="font-semibold text-sm">{lead.name}</p>
                          <p className="text-xs opacity-80 mt-0.5">
                            Stuck in <span className="font-medium">{lead.status}</span> since {lead.statusUpdatedAt || lead.creationDate || "creation"}.
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {overdueTasks.length > 0 && (
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2">Overdue</h4>
                    <ul className="space-y-2">
                      {overdueTasks.map(task => (
                        <li key={task.id} onClick={() => handleTaskClick(task)} className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                          <p className="font-medium text-base text-slate-800 dark:text-slate-200">{task.title}</p>
                          <p className="text-sm text-red-600 dark:text-red-500">Due: {task.dueDate}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {upcomingTasks.length > 0 && (
                   <div className="p-4">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Upcoming</h4>
                    <ul className="space-y-2">
                      {upcomingTasks.map(task => (
                        <li key={task.id} onClick={() => handleTaskClick(task)} className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                          <p className="font-medium text-base text-slate-800 dark:text-slate-200">{task.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Due: {task.dueDate}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
