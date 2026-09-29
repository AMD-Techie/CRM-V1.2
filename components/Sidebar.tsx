
import React, { useState } from 'react';
import { 
  IconHome, 
  IconUsers, 
  IconKanban, 
  IconSparkles, 
  IconSun, 
  IconMoon,
  IconBuilding, 
  IconCheckSquare,
  IconCalendar,
  IconPhone,
  IconMegaphone,
  IconFileText,
  IconMapPin,
  IconBriefcase,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconLayout,
  IconLifeBuoy,
  IconLogOut,
  IconLock,
  IconMessageSquare,
  IconDatabase,
  IconServer,
  IconShield
} from './Icons';
import { RoleDefinition, Permission } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  isOpen: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  userRole?: RoleDefinition;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, isDark, toggleTheme, userRole, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasPermission = (permission: Permission) => {
    if (!userRole) return true; // Default allow if no role passed (dev mode)
    return userRole.permissions.includes(permission);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: IconHome, requiredPerm: 'view_dashboard' },
    { id: 'leads', label: 'Leads', icon: IconUsers, requiredPerm: 'view_leads' },
    { id: 'contacts', label: 'Contacts', icon: IconUsers, requiredPerm: 'view_leads' },
    { id: 'accounts', label: 'Accounts', icon: IconBuilding, requiredPerm: 'view_leads' },
    { id: 'pipeline', label: 'Opportunities', icon: IconKanban, requiredPerm: 'manage_pipeline' },
    { id: 'tasks', label: 'Tasks', icon: IconCheckSquare, requiredPerm: 'view_leads' },
    { id: 'meetings', label: 'Meetings', icon: IconCalendar, requiredPerm: 'view_leads' },
    { id: 'calls', label: 'Calls', icon: IconPhone, requiredPerm: 'view_leads' },
    { id: 'campaigns', label: 'Campaigns', icon: IconMegaphone, requiredPerm: 'manage_pipeline' },
    { id: 'documents', label: 'Documents', icon: IconFileText, requiredPerm: 'view_leads' },
    { id: 'templates', label: 'Templates', icon: IconLayout, requiredPerm: 'manage_settings' }, // Restricted to admins/managers typically
    { id: 'visits', label: 'Visits', icon: IconMapPin, requiredPerm: 'view_leads' },
    { id: 'projects', label: 'Projects', icon: IconBriefcase, requiredPerm: 'view_leads' },
    { id: 'support', label: 'Support', icon: IconLifeBuoy, requiredPerm: 'view_leads' },
  ];

  const enterpriseMenuItems = [
    { id: 'reporting', label: 'Reporting & BI', icon: IconLayout, requiredPerm: 'view_dashboard' },
    { id: 'data_management', label: 'Data Import/Export', icon: IconDatabase, requiredPerm: 'manage_settings' },
    { id: 'ai_governance', label: 'AI Governance & Security', icon: IconShield, requiredPerm: 'manage_settings' },
    { id: 'iam', label: 'Identity & Access (IAM)', icon: IconLock, requiredPerm: 'manage_settings' },
    { id: 'workflows', label: 'Workflows', icon: IconCheckSquare, requiredPerm: 'manage_settings' },
    { id: 'communications', label: 'Communication Hub', icon: IconMessageSquare, requiredPerm: 'manage_settings' },
    { id: 'audit_logs', label: 'Audit & Compliance', icon: IconFileText, requiredPerm: 'manage_settings' },
    { id: 'tenancy', label: 'Tenancy Management', icon: IconBuilding, requiredPerm: 'manage_settings' },
    { id: 'api_management', label: 'API Gateway & Hub', icon: IconSettings, requiredPerm: 'manage_settings' },
    { id: 'observability', label: 'Observability', icon: IconSparkles, requiredPerm: 'manage_settings' },
  ];

  const visibleMenuItems = menuItems.filter(item => hasPermission(item.requiredPerm as Permission));
  const visibleEnterpriseItems = enterpriseMenuItems.filter(item => hasPermission(item.requiredPerm as Permission));

  // Common transition class for text hiding/showing
  // Using max-width instead of width:auto allows for smooth CSS transitions
  const textTransitionClass = `overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
    isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'
  }`;

  return (
    <div className={`fixed inset-y-0 left-0 z-40 ${isCollapsed ? 'md:w-20' : 'md:w-72'} w-72 bg-[#0b1120] border-r border-slate-800 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none`}>
      
      {/* Collapse Toggle Button (Desktop Only) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 hidden md:flex items-center justify-center w-6 h-6 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg z-50"
      >
        {isCollapsed ? <IconChevronRight className="w-3 h-3" /> : <IconChevronLeft className="w-3 h-3" />}
      </button>

      {/* Brand Header */}
      <div className={`flex items-center h-24 ${isCollapsed ? 'justify-center px-0' : 'px-8'} bg-[#0b1120]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-10 transition-all duration-300 flex-shrink-0`}>
        <div className="relative group flex items-center justify-center">
            <div className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>
                <IconSparkles className="w-5 h-5 text-white drop-shadow-md relative z-10" />
            </div>
            <div className={textTransitionClass}>
                <span className="text-xl font-bold tracking-tight text-white leading-none block">
                  Nova<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">CRM</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1 block h-[12px] leading-tight">Intelligence</span>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'px-3' : 'px-4'} py-4 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden`}>
        <div className={`mb-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 px-4'}`}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Main Menu</p>
        </div>
        
        {visibleMenuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`relative group flex items-center w-full py-3 ml-2 pr-4 text-sm font-medium rounded-l-xl transition-all duration-200 ${
                isCollapsed ? 'justify-center mx-2 pl-2 pr-2 rounded-xl' : 'pl-3'
              } ${
                isActive 
                ? 'text-white bg-slate-800/80 shadow-[inset_2px_0_0_0_rgba(99,102,241,1)]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              {isActive && !isCollapsed && (
                 <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#0b1120] to-transparent pointer-events-none" />
              )}
              
              <div className="flex items-center min-w-[24px]">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${isActive ? 'text-indigo-400 scale-110 drop-shadow-sm' : 'text-slate-500 group-hover:text-slate-300'}`} />
              </div>
              <span className={textTransitionClass}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Enterprise Separator */}
        {visibleEnterpriseItems.length > 0 && (
            <>
                <div className={`my-6 border-t border-slate-800/60 mx-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}></div>

                <div className={`mb-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 px-4'}`}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Enterprise</p>
                </div>
                
                {visibleEnterpriseItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`relative group flex items-center w-full py-3 ml-2 pr-4 text-sm font-medium rounded-l-xl transition-all duration-200 ${
                        isCollapsed ? 'justify-center mx-2 pl-2 pr-2 rounded-xl' : 'pl-3'
                      } ${
                        isActive 
                        ? 'text-white bg-slate-800/80 shadow-[inset_2px_0_0_0_rgba(99,102,241,1)]' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                      }`}
                      title={isCollapsed ? item.label : ''}
                    >
                      {isActive && !isCollapsed && (
                         <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#0b1120] to-transparent pointer-events-none" />
                      )}
                      
                      <div className="flex items-center min-w-[24px]">
                          <item.icon className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${isActive ? 'text-indigo-400 scale-110 drop-shadow-sm' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      </div>
                      <span className={textTransitionClass}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
            </>
        )}
        
        {/* Separator */}
        <div className={`my-6 border-t border-slate-800/60 mx-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}></div>

        <div className={`mb-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 px-4'}`}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">System</p>
        </div>

        {/* Settings Link - Check permissions for settings */}
        {hasPermission('manage_settings') && (
            <button
                onClick={() => setView('settings')}
                className={`relative group flex items-center w-full py-3 ml-2 pr-4 text-sm font-medium rounded-l-xl transition-all duration-200 ${
                  isCollapsed ? 'justify-center mx-2 pl-2 pr-2 rounded-xl' : 'pl-3'
                } ${
                  currentView === 'settings' 
                  ? 'text-white bg-slate-800/80 shadow-[inset_2px_0_0_0_rgba(99,102,241,1)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
                title={isCollapsed ? 'Settings' : ''}
            >
                {currentView === 'settings' && !isCollapsed && (
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#0b1120] to-transparent pointer-events-none" />
                )}
                <div className="flex items-center min-w-[24px]">
                    <IconSettings className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${currentView === 'settings' ? 'text-indigo-400 scale-110 drop-shadow-sm' : 'text-slate-500 group-hover:text-slate-300'}`} />
                </div>
                <span className={textTransitionClass}>
                    Settings
                </span>
            </button>
        )}

      </nav>
      
      {/* Footer Profile */}
      <div className={`p-4 bg-[#0b1120] border-t border-slate-800 transition-all duration-300 flex-shrink-0`}>
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl flex items-center group hover:border-slate-700 hover:bg-slate-800/80 transition-all cursor-pointer shadow-lg overflow-hidden relative ${isCollapsed ? 'justify-center p-2' : 'p-3'}`}>
          
          <div className="flex items-center min-w-0">
            <div className="relative flex-shrink-0">
                <img src={userRole?.id === 'admin' ? "https://i.pravatar.cc/150?u=a042581f4e29026704d" : "https://i.pravatar.cc/150?u=a04258114e29026702d"} alt="User" className="w-9 h-9 rounded-full ring-2 ring-slate-800 group-hover:ring-primary-500/30 transition-all object-cover" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full ring-1 ring-emerald-500/20"></div>
            </div>
            
            <div className={textTransitionClass}>
              <p className="text-sm font-bold text-white truncate">Alex Chen</p>
              <p className="text-xs text-slate-500 truncate group-hover:text-primary-400 transition-colors">{userRole?.name || 'User'}</p>
            </div>
          </div>

          {/* Action Buttons: Quick Theme Toggle & Logout */}
          <div className={`flex items-center gap-1 shrink-0 ${isCollapsed ? 'hidden' : 'ml-auto'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
              className="text-slate-500 hover:text-white transition-all p-1.5 hover:bg-slate-800 rounded-lg"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <IconSun className="w-4 h-4 text-amber-400" /> : <IconMoon className="w-4 h-4 text-slate-400" />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onLogout(); }}
              className="text-slate-500 hover:text-red-400 transition-all p-1.5 hover:bg-slate-800 rounded-lg"
              title="Sign Out"
            >
              <IconLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
