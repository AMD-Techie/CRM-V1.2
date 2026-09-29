import React, { useState } from 'react';
import { useCollaboration } from './CollaborationProvider';
import { IconMessageSquare, IconSend } from './Icons';

interface SharedCommentsProps {
  entityId: string;
  entityType?: string;
}

const SharedComments: React.FC<SharedCommentsProps> = ({ entityId, entityType = "Record" }) => {
  const { getEntityComments, addComment } = useCollaboration();
  const comments = getEntityComments(entityId);
  const [newComment, setNewComment] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // Very basic mention extraction:
    const mentions = newComment.match(/@\w+/g)?.map(m => m.substring(1)) || [];
    
    addComment(entityId, newComment, mentions);
    setNewComment('');
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 mt-6 overflow-hidden flex flex-col max-h-[500px]">
       <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          <h3 className="font-semibold flex items-center text-slate-900 dark:text-white text-sm">
            <IconMessageSquare className="w-4 h-4 mr-2 text-slate-500" /> 
            Team Comments
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
             {comments.length}
          </span>
       </div>
       <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {comments.length === 0 ? (
             <div className="text-center text-slate-500 text-sm py-4 italic">
                No comments on this {entityType.toLowerCase()} yet.
             </div>
          ) : (
             comments.map(c => (
                <div key={c.id} className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {c.userName.substring(0, 2).toUpperCase()}
                   </div>
                   <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                         <span className="font-medium text-slate-900 dark:text-white text-xs">{c.userName}</span>
                         <span className="text-[10px] text-slate-400">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm break-words whitespace-pre-wrap">
                         {c.text.split(/(@\w+)/g).map((part, i) => 
                            part.startsWith('@') ? <span key={i} className="text-primary-500 font-medium">{part}</span> : part
                         )}
                      </p>
                   </div>
                </div>
             ))
          )}
       </div>
       <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 relative group">
          <input 
             type="text" 
             value={newComment}
             onChange={e => setNewComment(e.target.value)}
             placeholder="Type a comment or mention @someone..."
             className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <button 
             type="submit" 
             disabled={!newComment.trim()}
             className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
             <IconSend className="w-4 h-4" />
          </button>
       </form>
    </div>
  );
};

export default SharedComments;
