import React, { useEffect, useState } from 'react';
import { useCollaboration } from './CollaborationProvider';
import { IconLock } from './Icons';

interface RecordLockBadgeProps {
  entityId: string;
}

const RecordLockBadge: React.FC<RecordLockBadgeProps> = ({ entityId }) => {
  const { locks, socket, lockRecord, unlockRecord } = useCollaboration();
  const [hasAttemptedLock, setHasAttemptedLock] = useState(false);
  
  const currentLock = locks[entityId];
  const isLockedByMe = currentLock?.userId === socket?.id;
  const isLockedByOther = currentLock && !isLockedByMe;

  useEffect(() => {
    // Automatically try to acquire lock when mounting (unless locked by someone else)
    if (!currentLock && !hasAttemptedLock) {
       lockRecord(entityId);
       setHasAttemptedLock(true);
    }
    
    return () => {
       if (isLockedByMe) {
          unlockRecord(entityId);
       }
    };
  }, [entityId, currentLock, hasAttemptedLock, lockRecord, unlockRecord, isLockedByMe]);

  if (!isLockedByOther) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs font-medium animate-pulse shadow-sm">
      <IconLock className="w-3.5 h-3.5" />
      Locked by {currentLock.userName}
    </div>
  );
};

export default RecordLockBadge;
