import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

export interface CollaborationUser {
  id: string;
  name: string;
  email?: string;
  view: string;
  targetId: string | null;
  color: string;
}

export interface Lock {
  userId: string;
  userName: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  mentions: string[];
}

interface CollaborationContextType {
  socket: Socket | null;
  activeUsers: CollaborationUser[];
  locks: Record<string, Lock>;
  getEntityComments: (entityId: string) => Comment[];
  addComment: (entityId: string, text: string, mentions?: string[]) => void;
  lockRecord: (entityId: string) => void;
  unlockRecord: (entityId: string) => void;
  navigate: (view: string, targetId?: string) => void;
  getUsersInView: (view: string, targetId?: string) => CollaborationUser[];
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: ReactNode, currentUser: { name: string, email?: string } }> = ({ children, currentUser }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [locks, setLocks] = useState<Record<string, Lock>>({});
  const [commentsStore, setCommentsStore] = useState<Record<string, Comment[]>>({});

  const socketRef = useRef<Socket | null>(null);
  const commentsStoreRef = useRef<Record<string, Comment[]>>({});
  commentsStoreRef.current = commentsStore;

  const currentUserName = currentUser?.name || 'Demo User';
  const currentUserEmail = currentUser?.email || 'user@example.com';

  useEffect(() => {
    const newSocket = io();
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      newSocket.emit('join', { name: currentUserName, email: currentUserEmail });
      newSocket.emit('get_initial_state');
    });

    newSocket.on('presence_update', (users: CollaborationUser[]) => {
      setActiveUsers(users);
    });

    newSocket.on('locks_update', (newLocks: Record<string, Lock>) => {
      setLocks(newLocks);
    });

    newSocket.on('comments_update', (data: { entityId: string, comments: Comment[] }) => {
      setCommentsStore(prev => ({
        ...prev,
        [data.entityId]: data.comments
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserName, currentUserEmail]);

  const addComment = useCallback((entityId: string, text: string, mentions: string[] = []) => {
    if (socketRef.current) {
      socketRef.current.emit('add_comment', { entityId, text, mentions });
    }
  }, []);

  const getEntityComments = useCallback((entityId: string) => {
    if (socketRef.current && !commentsStoreRef.current[entityId]) {
      socketRef.current.emit('get_comments', { entityId });
      return [];
    }
    return commentsStoreRef.current[entityId] || [];
  }, []);

  const lockRecord = useCallback((entityId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('lock_record', { entityId });
    }
  }, []);

  const unlockRecord = useCallback((entityId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('unlock_record', { entityId });
    }
  }, []);

  const navigate = useCallback((view: string, targetId?: string) => {
    if (socketRef.current) {
      socketRef.current.emit('navigate', { view, targetId });
    }
  }, []);

  const getUsersInView = useCallback((view: string, targetId?: string) => {
    const currentSocketId = socketRef.current?.id;
    return activeUsers.filter(u => u.view === view && u.targetId === (targetId || null) && u.id !== currentSocketId);
  }, [activeUsers]);

  const value = useMemo(() => ({
    socket,
    activeUsers,
    locks,
    getEntityComments,
    addComment,
    lockRecord,
    unlockRecord,
    navigate,
    getUsersInView
  }), [socket, activeUsers, locks, getEntityComments, addComment, lockRecord, unlockRecord, navigate, getUsersInView]);

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};
