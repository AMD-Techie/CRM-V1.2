
import React from 'react';
import { IconZap, IconCheckCircle, IconAlertTriangle, IconRefresh } from './Icons';

interface OfflineIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline, isSyncing, pendingChanges }) => {
  if (isOnline && !isSyncing && pendingChanges === 0) return null;

  return (
    <div className={`fixed bottom-6 left-6 z-50 rounded-lg shadow-lg border p-4 flex items-center gap-3 transition-all duration-300 animate-slide-up ${
      !isOnline 
        ? 'bg-slate-900 border-slate-700 text-white' 
        : isSyncing 
          ? 'bg-blue-600 border-blue-500 text-white'
          : 'bg-emerald-600 border-emerald-500 text-white'
    }`}>
      {!isOnline ? (
        <>
          <div className="p-2 bg-slate-800 rounded-full">
            <IconAlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold">You are Offline</p>
            <p className="text-xs text-slate-400">Changes saved to local memory.</p>
          </div>
        </>
      ) : isSyncing ? (
        <>
          <div className="p-2 bg-blue-700 rounded-full animate-spin">
            <IconRefresh className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Connection Restored</p>
            <p className="text-xs text-blue-200">Syncing data to cloud...</p>
          </div>
        </>
      ) : (
        <>
           <div className="p-2 bg-emerald-700 rounded-full">
            <IconCheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Sync Complete</p>
            <p className="text-xs text-emerald-200">All systems operational.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
