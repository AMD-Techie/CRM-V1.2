import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  useEffect(() => {
    // Only connect if we don't have a socket yet
    const newSocket = io(); // Connects to same host since we serve from same express server

    newSocket.on('connect', () => {
      newSocket.emit('join', { name: currentUser.name, email: currentUser.email });
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
    };
  }, [currentUser.name, currentUser.email]);

  const addComment = (entityId: string, text: string, mentions: string[] = []) => {
    if (socket) {
      socket.emit('add_comment', { entityId, text, mentions });
    }
  };

  const getEntityComments = (entityId: string) => {
      if(socket && !commentsStore[entityId]) {
         socket.emit('get_comments', { entityId });
         return [];
      }
      return commentsStore[entityId] || [];
  };

  const lockRecord = (entityId: string) => {
    if (socket) {
      socket.emit('lock_record', { entityId });
    }
  };

  const unlockRecord = (entityId: string) => {
    if (socket) {
      socket.emit('unlock_record', { entityId });
    }
  };

  const navigate = (view: string, targetId?: string) => {
    if (socket) {
      socket.emit('navigate', { view, targetId });
    }
  };

  const getUsersInView = (view: string, targetId?: string) => {
    return activeUsers.filter(u => u.view === view && u.targetId === (targetId || null) && u.id !== socket?.id);
  };

  return (
    <CollaborationContext.Provider value={{
      socket, activeUsers, locks, getEntityComments, addComment, lockRecord, unlockRecord, navigate, getUsersInView
    }}>
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
