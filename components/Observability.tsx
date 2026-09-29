import React, { useState } from 'react';
import { 
    IconActivity, IconClock, IconAlertCircle, IconCheckCircle, 
    IconServer, IconDatabase, IconCloud, IconZap
} from './Icons';

export const Observability = () => {
    const [timeRange, setTimeRange] = useState('1h');
    const [activeTab, setActiveTab] = useState<'metrics' | 'traces' | 'alerts'>('metrics');

    return (
        <div className="space-y-6 h-full flex flex-col animate-fade-in max-w-7xl mx-auto w-full">
            <header className="flex-shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-light tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-[16px] shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white ring-1 ring-white/10">
                                <IconActivity className="w-6 h-6 drop-shadow-sm" />
                            </div>
                            Observability & APM
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium tracking-wide text-sm ml-[60px]">
                            Real-time metrics, distributed tracing, and system health monitoring.
                        </p>
                    </div>
                    <div className="flex bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/10 rounded-xl p-1 shadow-sm">
                        {['1h', '6h', '24h', '7d'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${timeRange === range ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex border-b border-slate-200 dark:border-white/10">
                    {[
                        { id: 'metrics', label: 'Dashboard Metrics' },
                        { id: 'traces', label: 'Distributed Traces' },
                        { id: 'alerts', label: 'Active Alerts' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-4 flex items-center gap-2 border-b-[3px] font-bold text-sm tracking-wide transition-colors ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                {activeTab === 'metrics' && (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricCard title="System Uptime" value="99.99%" trend="+0.01%" status="good" icon={IconCheckCircle} />
                            <MetricCard title="API Latency (P95)" value="124ms" trend="-12ms" status="good" icon={IconClock} />
                            <MetricCard title="Error Rate" value="0.12%" trend="+0.05%" status="warning" icon={IconAlertCircle} />
                            <MetricCard title="Active Requests" value="1,432" trend="+124" status="normal" icon={IconZap} />
                        </div>

                        {/* Service Health */}
                        <div className="bg-white dark:bg-[#0b1120]/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-[24px] p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500 mb-6 px-2">Service Health</h3>
                            <div className="space-y-4">
                                <ServiceStatus name="API Gateway" type="Edge Node" cpu="45%" mem="2.1GB" status="healthy" icon={IconCloud} />
                                <ServiceStatus name="Auth Service" type="Microservice" cpu="12%" mem="800MB" status="healthy" icon={IconServer} />
                                <ServiceStatus name="Primary Database" type="PostgreSQL" cpu="78%" mem="14.5GB" status="warning" icon={IconDatabase} />
                                <ServiceStatus name="Redis Cache" type="In-Memory" cpu="24%" mem="4.2GB" status="healthy" icon={IconDatabase} />
                                <ServiceStatus name="Search Engine" type="ElasticSearch" cpu="65%" mem="8.1GB" status="healthy" icon={IconServer} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'traces' && (
                    <div className="bg-white dark:bg-[#0b1120]/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-[24px] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-light text-slate-900 dark:text-white">Recent Traces</h3>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Trace ID or tag..." className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                                <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-lg">Filter</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Trace ID</th>
                                        <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Endpoint</th>
                                        <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Duration</th>
                                        <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Status</th>
                                        <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Spans</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <TraceRow id="tr_8f9a2b1c" endpoint="POST /api/v1/opportunities" duration="342ms" status="201" spans={12} />
                                    <TraceRow id="tr_4d5e6f7a" endpoint="GET /api/v1/contacts?limit=50" duration="118ms" status="200" spans={5} />
                                    <TraceRow id="tr_1b2c3d4e" endpoint="PUT /api/v1/leads/8892" duration="890ms" status="500" spans={18} error />
                                    <TraceRow id="tr_5a6b7c8d" endpoint="GET /api/v1/dashboard/metrics" duration="245ms" status="200" spans={8} />
                                    <TraceRow id="tr_9e0f1a2b" endpoint="POST /api/v1/auth/refresh" duration="45ms" status="200" spans={3} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="space-y-4">
                        <AlertItem 
                            severity="high" 
                            title="Database CPU Usage > 80%" 
                            time="10 minutes ago" 
                            description="Primary PostgreSQL instance pg-01 is experiencing sustained high CPU utilization."
                        />
                        <AlertItem 
                            severity="medium" 
                            title="Elevated 5xx Errors on Leads API" 
                            time="45 minutes ago" 
                            description="Error rate exceeded 0.5% threshold for the last 5 minutes on /api/v1/leads."
                        />
                        <AlertItem 
                            severity="low" 
                            title="Cache Hit Ratio Dropped" 
                            time="2 hours ago" 
                            description="Redis cache hit ratio dropped below 85%."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, trend, status, icon: Icon }: any) => {
    return (
        <div className="bg-white dark:bg-[#0b1120]/60 border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-slate-500 tracking-wide">{title}</span>
                <div className={`p-2 rounded-lg ${
                    status === 'good' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    status === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                    'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                }`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="text-2xl font-light text-slate-900 dark:text-white mb-2">{value}</div>
            <div className="flex items-center text-xs font-bold">
                <span className={`${trend.startsWith('+') ? (status === 'warning' ? 'text-rose-500' : 'text-emerald-500') : 'text-emerald-500'}`}>
                    {trend}
                </span>
                <span className="text-slate-400 ml-2">vs last period</span>
            </div>
        </div>
    );
};

const ServiceStatus = ({ name, type, cpu, mem, status, icon: Icon }: any) => {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{name}</h4>
                    <span className="text-xs text-slate-500">{type}</span>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-500">CPU</div>
                    <div className="text-sm font-mono text-slate-700 dark:text-slate-300">{cpu}</div>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-500">Memory</div>
                    <div className="text-sm font-mono text-slate-700 dark:text-slate-300">{mem}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    status === 'healthy' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    {status === 'healthy' ? 'Healthy' : 'Warning'}
                </div>
            </div>
        </div>
    );
};

const TraceRow = ({ id, endpoint, duration, status, spans, error }: any) => {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400">{id}</td>
            <td className="p-4 font-mono text-slate-700 dark:text-slate-300">{endpoint}</td>
            <td className="p-4">{duration}</td>
            <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${error ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                    {status}
                </span>
            </td>
            <td className="p-4 text-slate-500">{spans}</td>
        </tr>
    );
};

const AlertItem = ({ severity, title, time, description }: any) => {
    return (
        <div className={`border-l-4 rounded-r-2xl p-6 bg-white dark:bg-[#0b1120]/60 backdrop-blur-sm border-t border-b border-r shadow-sm ${
            severity === 'high' ? 'border-l-rose-500 border-t-rose-100 border-b-rose-100 border-r-rose-100 dark:border-t-rose-500/10 dark:border-b-rose-500/10 dark:border-r-rose-500/10' :
            severity === 'medium' ? 'border-l-amber-500 border-y-amber-100 border-r-amber-100 dark:border-y-amber-500/10 dark:border-r-amber-500/10' :
            'border-l-blue-500 border-y-blue-100 border-r-blue-100 dark:border-y-blue-500/10 dark:border-r-blue-500/10'
        }`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                    <IconAlertCircle className={`w-5 h-5 ${
                        severity === 'high' ? 'text-rose-500' :
                        severity === 'medium' ? 'text-amber-500' :
                        'text-blue-500'
                    }`} />
                    {title}
                </h4>
                <span className="text-xs font-bold text-slate-400">{time}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 ml-7">{description}</p>
            <div className="ml-7 mt-4 flex gap-3">
                <button className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Acknowledge</button>
                <button className="px-4 py-1.5 bg-white border border-slate-200 dark:bg-transparent dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">View Details</button>
            </div>
        </div>
    );
};
