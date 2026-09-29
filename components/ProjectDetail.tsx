
import React, { useState } from 'react';
import { Project, Task, ProjectStatus } from '../types';
import { 
  IconArrowLeft, IconEdit, IconTrash, IconCalendar, IconCheckCircle, 
  IconUser, IconSparkles, IconAlertTriangle, IconClock, IconTrendingUp,
  IconBriefcase, IconPlus, IconCheckSquare, IconWallet, IconFileText,
  IconUsers
} from './Icons';
import { generateProjectStatusReport } from '../services/geminiService';

interface ProjectDetailProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onUpdate: (project: Project) => void;
  onDelete: () => void;
  onAddTask: (task: Task) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, tasks, onBack, onUpdate, onDelete, onAddTask }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'financials'>('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const projectTasks = tasks.filter(t => t.relatedTo === project.name);
  const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
  const taskProgress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const report = await generateProjectStatusReport(project, completedTasks, projectTasks.length);
    setAiReport(report);
    setIsGeneratingReport(false);
  };

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
        id: `T-${Date.now()}`,
        title: newTaskTitle,
        status: 'Not Started',
        priority: 'Normal',
        dueDate: new Date().toISOString().split('T')[0],
        relatedTo: project.name
    });
    setNewTaskTitle('');
  };

  const getStatusColor = (status: ProjectStatus) => {
      switch(status) {
          case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
          case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
          case 'On Hold': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
          default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-t-xl flex-shrink-0">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <IconArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        {project.name}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-4">
                        {project.client && <span className="flex items-center gap-1"><IconBriefcase className="w-3.5 h-3.5" /> {project.client}</span>}
                        <span className="flex items-center gap-1"><IconCalendar className="w-3.5 h-3.5" /> {project.startDate} - {project.endDate || 'Ongoing'}</span>
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <IconTrash className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Progress & Quick Stats */}
        <div className="flex items-center gap-8 mt-6">
            <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project Progress</span>
                    <span className="text-primary-600 dark:text-primary-400">{project.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                </div>
            </div>
            <div className="flex gap-6 border-l border-slate-200 dark:border-slate-800 pl-6">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Budget</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">${project.budget.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Risk Level</p>
                    <p className={`text-lg font-bold ${project.riskLevel === 'High' ? 'text-red-600' : project.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {project.riskLevel}
                    </p>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-8 border-b border-slate-200 dark:border-slate-800">
            {['Overview', 'Tasks', 'Team', 'Financials'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase() as any)}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.toLowerCase() 
                        ? 'border-primary-600 text-primary-600 dark:text-primary-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Description</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {project.description || "No description provided."}
                        </p>
                    </div>

                    {/* AI Status Report */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-xl border border-indigo-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center">
                                <IconSparkles className="w-5 h-5 mr-2" /> Weekly Status Report
                            </h3>
                            <button 
                                onClick={handleGenerateReport}
                                disabled={isGeneratingReport}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isGeneratingReport ? <span className="animate-spin">⟳</span> : <IconSparkles className="w-3 h-3" />}
                                Generate Report
                            </button>
                        </div>
                        {aiReport ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br />') }} />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-indigo-400 dark:text-slate-500 italic text-sm">
                                Generate an AI summary of project progress, risks, and next steps.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Next Milestone</h3>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <IconCheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{project.nextMilestone || 'None set'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target: {project.endDate}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/30">
                        <h3 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-widest mb-4 flex items-center">
                            <IconAlertTriangle className="w-4 h-4 mr-2" /> Key Risks
                        </h3>
                        <ul className="space-y-2">
                            {(project.riskFactors && project.riskFactors.length > 0) ? project.riskFactors.map((risk, idx) => (
                                <li key={idx} className="text-sm text-red-800 dark:text-red-200 flex items-start">
                                    <span className="mr-2">•</span> {risk}
                                </li>
                            )) : (
                                <li className="text-sm text-red-800/60 dark:text-red-300 italic">No risks identified.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'tasks' && (
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <form onSubmit={handleQuickAddTask} className="flex-1 flex gap-3">
                        <input 
                            type="text" 
                            value={newTaskTitle} 
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Add a new task..." 
                            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-lg transition-colors">
                            Add Task
                        </button>
                    </form>
                </div>

                <div className="space-y-3">
                    {projectTasks.length > 0 ? projectTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {task.status === 'Completed' && <IconCheckSquare className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{task.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Due: {task.dueDate}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                {task.priority}
                            </span>
                        </div>
                    )) : (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <IconCheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No tasks found for this project.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'financials' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                        <IconWallet className="w-5 h-5 mr-2 text-emerald-500" /> Budget Utilization
                    </h3>
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">${project.spent.toLocaleString()}</span>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">of ${project.budget.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${project.spent > project.budget ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium uppercase tracking-wide">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Remaining</span>
                            <span className="text-xl font-bold text-slate-700 dark:text-slate-200">${(project.budget - project.spent).toLocaleString()}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Burn Rate</span>
                            <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{(project.spent / project.budget * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'team' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                    <IconUsers className="w-5 h-5 mr-2 text-blue-500" /> Project Team
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border border-primary-200 dark:border-primary-800">
                                {project.owner.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{project.owner}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Project Manager</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">Owner</span>
                    </div>
                    {/* Mock Members */}
                    {['Sarah Connor', 'Miles Dyson'].map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                    {member.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{member}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Contributor</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ProjectDetail;
