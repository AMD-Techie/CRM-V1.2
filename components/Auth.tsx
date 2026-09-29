
import React, { useState } from 'react';
import { IconSparkles, IconLock, IconMail, IconArrowRight, IconUser, IconCheckCircle } from './Icons';
import { MOCK_USERS } from '../constants';

interface AuthProps {
  onLogin: (email: string, password?: string) => Promise<boolean>;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('alex.chen@novacrm.io'); 
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (index: number) => {
      setSelectedUserIndex(index);
      setEmail(MOCK_USERS[index].email);
      // Optional: Clear password or set a dummy one if required
      setPassword(''); 
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10 animate-fade-in-down">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 shadow-lg shadow-primary-500/30 mb-6">
            <IconSparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-400">Sign in to access your NovaCRM dashboard</p>
        </div>

        {/* Persona Selector */}
        <div className="mb-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-4">Select Demo Role</p>
            <div className="flex justify-center gap-4">
                {MOCK_USERS.slice(0, 3).map((user, idx) => (
                    <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectPersona(idx)}
                        className={`relative group flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${selectedUserIndex === idx ? 'bg-white/10 ring-2 ring-primary-500 shadow-lg' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600 group-hover:border-slate-400 transition-colors">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {selectedUserIndex === idx && (
                                <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white rounded-full p-0.5 border-2 border-slate-900">
                                    <IconCheckCircle className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                        <span className={`text-xs font-medium mt-2 transition-colors ${selectedUserIndex === idx ? 'text-white' : 'text-slate-400'}`}>
                            {user.roleId === 'admin' ? 'Admin' : user.roleId === 'sales_rep' ? 'Sales Rep' : 'Manager'}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-slate-500 transition-all"
                placeholder="name@company.com"
                required
              />
              <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-slate-500 transition-all"
                placeholder="Any password for demo"
              />
              <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-primary-600/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In <IconArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col space-y-3">
            <button 
                type="button" 
                onClick={() => alert('SSO Configuration Required (Enterprise Feature)')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
                <IconUser className="w-4 h-4" /> Sign in with Enterprise SSO (SAML)
            </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account? <span className="text-primary-400 cursor-pointer hover:text-primary-300 hover:underline">Contact Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
