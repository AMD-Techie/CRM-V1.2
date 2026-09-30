import React, { useEffect, useRef } from 'react';
import { useCollaboration } from './CollaborationProvider';
import { IconLock } from './Icons';

interface RecordLockBadgeProps {
  entityId: string;
}

const RecordLockBadge: React.FC<RecordLockBadgeProps> = ({ entityId }) => {
  const { locks, socket, lockRecord, unlockRecord } = useCollaboration();
  
  const currentLock = locks[entityId];
  const isLockedByMe = currentLock?.userId === socket?.id;
  const isLockedByOther = currentLock && !isLockedByMe;

  const isLockedByMeRef = useRef(false);
  isLockedByMeRef.current = isLockedByMe;

  const entityIdRef = useRef(entityId);
  entityIdRef.current = entityId;

  const unlockRecordRef = useRef(unlockRecord);
  unlockRecordRef.current = unlockRecord;

  useEffect(() => {
    // Automatically try to acquire lock on mount/entity change
    lockRecord(entityId);
    
    return () => {
      if (isLockedByMeRef.current) {
        unlockRecordRef.current(entityIdRef.current);
      }
    };
  }, [entityId, lockRecord]);

  if (!isLockedByOther) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs font-medium animate-pulse shadow-sm">
      <IconLock className="w-3.5 h-3.5" />
      Locked by {currentLock.userName}
    </div>
  );
};

export default RecordLockBadge;
