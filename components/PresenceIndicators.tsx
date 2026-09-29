import React from 'react';
import { useCollaboration } from './CollaborationProvider';

interface PresenceIndicatorsProps {
  view: string;
  targetId?: string;
  className?: string;
}

const PresenceIndicators: React.FC<PresenceIndicatorsProps> = ({ view, targetId, className = "" }) => {
  const { getUsersInView } = useCollaboration();
  const users = getUsersInView(view, targetId);

  if (users.length === 0) return null;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2 mr-2">
        {users.map((u, i) => (
          <div 
            key={u.id} 
            className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-sm ${u.color}`}
            title={`${u.name} is viewing this`}
            style={{ zIndex: users.length - i }}
          >
            {u.name.substring(0, 2).toUpperCase()}
          </div>
        ))}
      </div>
      <span className="text-xs text-slate-500 font-medium">
        {users.length} {users.length === 1 ? 'person' : 'people'} also viewing
      </span>
    </div>
  );
};

export default PresenceIndicators;
