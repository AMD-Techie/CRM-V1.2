import React, { useState } from 'react';
import { IconLock, IconShield, IconUser, IconSettings, IconFileText, IconCheckSquare } from './Icons';

interface IAMProps {}

const IAM: React.FC<IAMProps> = () => {
    const [activeTab, setActiveTab] = useState<'sso' | 'mfa' | 'sessions' | 'audit' | 'scim'>('sso');

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Identity & Access Management</h1>
                <p className="text-slate-500 dark:text-slate-400">Configure enterprise Single Sign-On, MFA, and access policies.</p>
            </header>

            <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
                <button
                    onClick={() => setActiveTab('sso')}
                    className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'sso' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <IconLock className="w-4 h-4" />
                    SSO & Federations
                </button>
                <button
                    onClick={() => setActiveTab('mfa')}
                    className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'mfa' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <IconShield className="w-4 h-4" />
                    Multi-Factor Auth
                </button>
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'sessions' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <IconSettings className="w-4 h-4" />
                    Session & Device Policies
                </button>
                <button
                    onClick={() => setActiveTab('scim')}
                    className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'scim' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <IconUser className="w-4 h-4" />
                    SCIM Provisioning
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'audit' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <IconFileText className="w-4 h-4" />
                    Login Audit Trail
                </button>
            </div>

            <main className="pt-6">
                {activeTab === 'sso' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: 'Azure Active Directory', status: 'Not Configured', type: 'OIDC / SAML 2.0', icon: IconLock },
                                { name: 'Okta', status: 'Not Configured', type: 'SAML 2.0', icon: IconCheckSquare },
                                { name: 'Google Workspace', status: 'Not Configured', type: 'OAuth2 / OIDC', icon: IconUser },
                                { name: 'Custom SAML 2.0', status: 'Not Configured', type: 'SAML 2.0', icon: IconSettings },
                            ].map(provider => (
                                <div key={provider.name} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-start gap-4 hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300">
                                        <provider.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{provider.name}</h3>
                                        <p className="text-sm text-slate-500">{provider.type}</p>
                                    </div>
                                    <div className="mt-auto pt-4 flex w-full justify-between items-center border-t border-slate-100 dark:border-slate-700/50">
                                        <span className="text-xs font-medium text-slate-400">{provider.status}</span>
                                        <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Configure</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'mfa' && (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Multi-Factor Authentication (MFA)</h2>
                            <p className="text-sm text-slate-500">Enforce secondary authentication methods for all enterprise users.</p>
                        </div>
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Require MFA for all admins</p>
                                    <p className="text-xs text-slate-500 mt-1">Users with manager or admin roles must use MFA.</p>
                                </div>
                                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer relative overflow-hidden transition-colors">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Allowed MFA Methods</p>
                                    <p className="text-xs text-slate-500 mt-1">Authenticator Apps (TOTP), SMS, Hardware Security Keys (FIDO2)</p>
                                </div>
                                <button className="text-sm text-primary-600 font-medium hover:underline">Edit Options</button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'sessions' && (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                         <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Session limits & Device Governance</h2>
                            <p className="text-sm text-slate-500">Manage how long users stay logged in and from which devices.</p>
                        </div>
                        <div className="space-y-4 max-w-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Idle Session Timeout</label>
                                    <select className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                                        <option>15 Minutes</option>
                                        <option>30 Minutes</option>
                                        <option>1 Hour</option>
                                        <option>4 Hours</option>
                                    </select>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Maximum Concurrent Sessions</label>
                                    <select className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                                        <option>1 Session</option>
                                        <option>3 Sessions</option>
                                        <option>5 Sessions</option>
                                        <option>Unlimited</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                 <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Password Policy</h3>
                                 <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <p>• Minimum length: 12 characters</p>
                                    <p>• Require complexity (Uppercase, numbers, symbols)</p>
                                    <p>• Expiration: 90 days</p>
                                    <button className="mt-2 text-primary-600 hover:underline">Edit Policy</button>
                                 </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'scim' && (
                     <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Directory Sync (SCIM 2.0)</h2>
                                <p className="text-sm text-slate-500">Automate user provisioning and de-provisioning directly from your identity provider.</p>
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-500/20">Inactive</span>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 max-w-3xl space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-600 dark:text-slate-400 break-all">
                                <p className="mb-1 text-xs font-bold text-slate-500 font-sans uppercase">SCIM Base URL</p>
                                https://api.novacrm.com/scim/v2/
                            </div>
                             <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <p className="mb-1 text-xs font-bold text-slate-500 font-sans uppercase">Bearer Token</p>
                                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300">****************************************</p>
                                </div>
                                <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Generate New Token</button>
                            </div>
                        </div>
                     </div>
                )}
                {activeTab === 'audit' && (
                     <div className="bg-white dark:bg-slate-800 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Login Audit Trail</h2>
                            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Export CSV</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/[0.3] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-medium">Timestamp</th>
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Event</th>
                                        <th className="p-4 font-medium">IP Address</th>
                                        <th className="p-4 font-medium">Location</th>
                                        <th className="p-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {[
                                        { time: '2023-10-27 14:32:01', user: 'sarah.c@company.com', event: 'SAML SSO Login', ip: '192.168.1.104', loc: 'New York, US', status: 'Success' },
                                        { time: '2023-10-27 10:15:22', user: 'david.w@company.com', event: 'Password Login', ip: '198.51.100.22', loc: 'London, UK', status: 'Failed (MFA)' },
                                        { time: '2023-10-26 09:00:11', user: 'admin@company.com', event: 'SCIM User Sync', ip: '203.0.113.45', loc: 'Azure Datacenter', status: 'Success' },
                                    ].map((log, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{log.time}</td>
                                            <td className="p-4 font-medium text-slate-900 dark:text-slate-200">{log.user}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">{log.event}</td>
                                            <td className="p-4 font-mono text-xs text-slate-500">{log.ip}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">{log.loc}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${log.status.includes('Success') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                )}
            </main>
        </div>
    );
};

export default IAM;
