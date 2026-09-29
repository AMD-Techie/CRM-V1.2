import React, { useState } from 'react';
import { 
  IconLayout, IconDownload, IconSettings, IconPlus, IconFilter, 
  IconCalendar, IconTrendingUp, IconPieChart, IconActivity, 
  IconFileText, IconCheckCircle, IconClock, IconZap, IconBot 
} from './Icons';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const mockSalesData = [
  { name: 'Jan', actual: 4000, predicted: 4200, target: 3800 },
  { name: 'Feb', actual: 3000, predicted: 3100, target: 3200 },
  { name: 'Mar', actual: 2000, predicted: 2400, target: 2500 },
  { name: 'Apr', actual: 2780, predicted: 2900, target: 2800 },
  { name: 'May', actual: 1890, predicted: 2100, target: 2200 },
  { name: 'Jun', actual: 2390, predicted: 2500, target: 2600 },
  { name: 'Jul', actual: 3490, predicted: 3600, target: 3300 },
];

const mockConversionData = [
  { name: 'Awareness', value: 4000 },
  { name: 'Consideration', value: 3000 },
  { name: 'Intent', value: 2000 },
  { name: 'Conversion', value: 500 },
];

const COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#d946ef'];

type ReportTab = 'dashboards' | 'custom' | 'scheduled' | 'predictive';

export default function ReportingBI() {
  const [activeTab, setActiveTab] = useState<ReportTab>('dashboards');
  const [isExporting, setIsExporting] = useState(false);

  const simulateExport = (type: 'pdf' | 'excel') => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
              <IconLayout className="w-6 h-6 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Reporting & BI</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Enterprise analytics, scheduled reports, and predictive insights.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => simulateExport('excel')}
            disabled={isExporting}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <IconDownload className="w-4 h-4" /> {isExporting ? 'Exporting...' : 'Export Excel'}
          </button>
          <button 
            onClick={() => simulateExport('pdf')}
            disabled={isExporting}
            className="flex-1 md:flex-none px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <IconFileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </header>

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('dashboards')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'dashboards' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconPieChart className="w-4 h-4" />
          Executive Dashboards
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'custom' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconLayout className="w-4 h-4" />
          Custom Widgets
        </button>
        <button
          onClick={() => setActiveTab('predictive')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'predictive' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconBot className="w-4 h-4" />
          Predictive Analytics
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'scheduled' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconCalendar className="w-4 h-4" />
          Scheduled Reports
        </button>
      </div>

      <main className="pt-6">
        {activeTab === 'dashboards' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                       <IconTrendingUp className="w-5 h-5" />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                       +14.5%
                    </span>
                 </div>
                 <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Revenue (MRR)</h3>
                 <p className="text-2xl font-bold text-slate-900 dark:text-white">$84,250</p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                       <IconPieChart className="w-5 h-5" />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                       +5.2%
                    </span>
                 </div>
                 <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Win Rate</h3>
                 <p className="text-2xl font-bold text-slate-900 dark:text-white">32.8%</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                       <IconActivity className="w-5 h-5" />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-full">
                       -2.1%
                    </span>
                 </div>
                 <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Sales Cycle Length</h3>
                 <p className="text-2xl font-bold text-slate-900 dark:text-white">42 Days</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                       <IconZap className="w-5 h-5" />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                       +18.4%
                    </span>
                 </div>
                 <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pipeline Velocity</h3>
                 <p className="text-2xl font-bold text-slate-900 dark:text-white">$14.2k/mo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue vs Target</h3>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockSalesData}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="actual" name="Actual Revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                        <Area type="monotone" dataKey="target" name="Target" stroke="#cbd5e1" strokeDasharray="5 5" fill="none" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sales Funnel Conversion</h3>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockConversionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                        <RechartsTooltip 
                          cursor={{fill: 'transparent'}}
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar dataKey="value" name="Leads" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                           {mockConversionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictive' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                   <IconBot className="w-32 h-32" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-2">AI Predictive Forecasting</h2>
                    <p className="text-indigo-100 text-lg mb-6">Based on your historical win rates, seasonality, and current pipeline velocity, AI projects a strong Q3 finish.</p>
                    <div className="flex gap-4">
                       <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex-1">
                          <p className="text-indigo-200 text-sm font-medium mb-1">Projected Q3 Revenue</p>
                          <p className="text-3xl font-bold">$485,000</p>
                          <p className="text-sm text-emerald-300 mt-2 flex items-center gap-1"><IconTrendingUp className="w-4 h-4"/> +12% vs Target</p>
                       </div>
                       <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex-1">
                          <p className="text-indigo-200 text-sm font-medium mb-1">At-Risk Deals Detected</p>
                          <p className="text-3xl font-bold">4</p>
                          <p className="text-sm text-amber-300 mt-2 flex items-center gap-1">Valued at $42,500</p>
                       </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Forecasted vs Actual Growth</h3>
               <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockSalesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="actual" name="Actual" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                      <Line type="monotone" dataKey="predicted" name="AI Prediction" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
               <h3 className="font-bold text-slate-900 dark:text-white">Active Subscriptions</h3>
               <button className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1">
                 <IconPlus className="w-4 h-4" /> New Schedule
               </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
               {[
                 { title: 'Weekly Executive Summary', format: 'PDF', recipients: 'Board, C-Level', schedule: 'Every Monday at 08:00 AM', active: true },
                 { title: 'Daily SDR Performance', format: 'Excel (CSV)', recipients: 'Sales Managers', schedule: 'Daily at 05:00 PM', active: true },
                 { title: 'Monthly Churn Predictor', format: 'PDF', recipients: 'Customer Success', schedule: '1st of Month at 09:00 AM', active: false },
               ].map((report, idx) => (
                 <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex gap-4 items-start">
                       <div className={`p-2 rounded-lg mt-1 ${report.format === 'PDF' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                          <IconFileText className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                             {report.title}
                             <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{report.format}</span>
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-4">
                             <span className="flex items-center gap-1"><IconClock className="w-3.5 h-3.5"/> {report.schedule}</span>
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-xs">
                             To: {report.recipients}
                          </p>
                       </div>
                    </div>
                    <div>
                       <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${report.active ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                         <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${report.active ? 'translate-x-6' : 'translate-x-1'}`} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
             <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <IconLayout className="w-8 h-8 text-primary-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Build a Custom Dashboard</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">Create a personalized view by dragging and dropping KPI widgets, charts, and data tables onto a new canvas.</p>
             <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm">
               <IconPlus className="w-5 h-5" /> Let's Start Building
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
