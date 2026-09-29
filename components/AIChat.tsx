
import React, { useState, useRef, useEffect } from 'react';
import { Message, Lead, Deal } from '../types';
import { chatWithCRM } from '../services/geminiService';
import { IconSparkles, IconSend, IconX, IconMessageSquare } from './Icons';

interface AIChatProps {
  leads: Lead[];
  deals: Deal[];
}

const AIChat: React.FC<AIChatProps> = ({ leads, deals }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hello! I am Nova. Ask me about your pipeline, high-value leads, or revenue forecast.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the updated message history to the service
      const responseText = await chatWithCRM(input, newMessages, { leads, deals });
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-full shadow-lg shadow-primary-600/50 transition-all duration-300 transform hover:scale-110 z-40 group animate-float"
        >
          <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse-glow"></div>
          <IconSparkles className="w-7 h-7" />
          <span className="absolute right-full mr-5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all translate-x-2 group-hover:translate-x-0 pointer-events-none shadow-xl">
            Ask Nova AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[400px] h-[650px] max-h-[85vh] max-w-[calc(100vw-32px)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-up transition-colors duration-300 ring-1 ring-black/5 dark:ring-white/10">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary-900/90 to-slate-900/90 backdrop-blur-md border-b border-white/10 flex justify-between items-center relative overflow-hidden">
             {/* Abstract background blobs */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center relative z-10">
              <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl mr-3 shadow-lg shadow-primary-900/30">
                <IconSparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Nova Assistant</h3>
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                   <p className="text-xs text-slate-300 font-medium">Online</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-10"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-base leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-br-none shadow-primary-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about leads or revenue..."
                className="w-full pl-5 pr-14 py-4 text-base bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-500 border border-transparent dark:border-slate-700 rounded-2xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/30"
              >
                <IconSend className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400">AI can make mistakes. Verify important info.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
