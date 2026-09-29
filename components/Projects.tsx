
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, Task, Currency } from '../types';
import { 
  IconBriefcase, IconPlus, IconSearch, IconFilter, IconCalendar, 
  IconUser, IconEdit, IconTrash, IconSparkles, IconCheckCircle, 
  IconAlertTriangle, IconList, IconKanban, IconArrowUp, IconArrowDown
} from './Icons';
import { generateProjectPlan, assessProjectRisks } from '../services/geminiService';
import ProjectDetail from './ProjectDetail';
import { validateNumber, validateRequired, ValidationErrors } from '../lib/validation';
import { formatCurrency } from '../lib/utils';

interface ProjectsProps {
  projects: Project[];
  tasks?: Task[]; // Added tasks prop
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onAddTask?: (task: Task) => void; // Added onAddTask prop
  defaultCurrency?: string;
  multiCurrency?: boolean;
}

const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'On Hold', 'Completed'];

const Projects: React.FC<ProjectsProps> = ({ projects, tasks = [], onAddProject, onUpdateProject, onDeleteProject, onAddTask = () => {}, defaultCurrency = 'USD', multiCurrency = false }) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailView, setIsDetailView] = useState(false); // New state for detail view
  
  // AI Loading States
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isAssessingRisks, setIsAssessingRisks] = useState(false);

  // List View Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'asc' | 'desc' } | null>(null);

  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    status: 'Planning',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: 0,
    spent: 0,
    progress: 0,
    owner: 'Alex Chen',
    client: '',
    description: '',
    riskLevel: 'Low',
    riskFactors: []
  });

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const sortedProjects = useMemo(() => {
      let items = [...filteredProjects];
      if (sortConfig) {
          items.sort((a, b) => {
              const aVal = a[sortConfig.key] || '';
              const bVal = b[sortConfig.key] || '';
              if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
              if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      return items;
  }, [filteredProjects, sortConfig]);

  const handleSort = (key: keyof Project) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
      setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Project) => {
      if (!sortConfig || sortConfig.key !== key) return <span className="w-3 h-3 opacity-0">↕</span>;
      return sortConfig.direction === 'asc' ? <IconArrowUp className="w-3 h-3" /> : <IconArrowDown className="w-3 h-3" />;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setSelectedProject(project);
      setFormData(project);
    } else {
      setSelectedProject(null);
      setFormData({
        name: '',
        status: 'Planning',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budget: 0,
        spent: 0,
        progress: 0,
        owner: 'Alex Chen',
        client: '',
        description: '',
        riskLevel: 'Low',
        riskFactors: []
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDetail = (project: Project) => {
      setSelectedProject(project);
      setIsDetailView(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: ValidationErrors = {};
    if (!validateRequired(formData.name)) newErrors.name = "Project name is required";
    
    if (formData.budget !== undefined && !validateNumber(formData.budget, 0)) {
      newErrors.budget = "Budget must be a positive number";
    }
    
    if (formData.spent !== undefined && !validateNumber(formData.spent, 0)) {
      newErrors.spent = "Spent amount must be a positive number";
    }
    
    if (formData.progress !== undefined && !validateNumber(formData.progress, 0, 100)) {
      newErrors.progress = "Progress must be between 0 and 100";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const projectData: Project = {
        id: selectedProject ? selectedProject.id : `PRJ-${Date.now()}`,
        name: formData.name || '',
        status: formData.status as ProjectStatus,
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        budget: Number(formData.budget) || 0,
        spent: Number(formData.spent) || 0,
        currency: formData.currency as Currency || 'USD',
        progress: Number(formData.progress) || 0,
        owner: formData.owner || '',
        client: formData.client || '',
        description: formData.description || '',
        riskLevel: formData.riskLevel as any,
        nextMilestone: formData.nextMilestone,
        riskFactors: formData.riskFactors
    };

    if (selectedProject) {
        onUpdateProject(projectData);
        if (isDetailView) setSelectedProject(projectData); // Update detail view data if open
    } else {
        onAddProject(projectData);
    }
    setIsModalOpen(false);
  };

  const handleGeneratePlan = async () => {
      if (!formData.name) {
          alert("Please enter a project name first.");
          return;
      }
      setIsGeneratingPlan(true);
      const plan = await generateProjectPlan(formData);
      setFormData(prev => ({
          ...prev,
          description: plan.description,
          nextMilestone: plan.nextMilestone,
          riskLevel: plan.riskLevel,
          riskFactors: plan.riskFactors || []
      }));
      setIsGeneratingPlan(false);
  };

  const handleRiskAssessment = async (project: Project) => {
      setIsAssessingRisks(true);
      const risks = await assessProjectRisks(project);
      onUpdateProject({ ...project, riskFactors: risks });
      setIsAssessingRisks(false);
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
      e.dataTransfer.setData('projectId', projectId);
  };

  const handleDrop = (e: React.DragEvent, status: ProjectStatus) => {
      const projectId = e.dataTransfer.getData('projectId');
      const project = projects.find(p => p.id === projectId);
      if (project && project.status !== status) {
          onUpdateProject({ ...project, status });
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const getRiskColor = (level?: string) => {
      switch(level) {
          case 'High': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
          case 'Medium': return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30';
          case 'Low': return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
          default: return 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800';
      }
  };

  const inputClasses = (name: string) => `w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors[name] ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:outline-none focus:ring-2 ${errors[name] ? 'focus:ring-red-500/50' : 'focus:ring-primary-500'} dark:text-white transition-all`;
  const errorClasses = "text-xs text-red-500 mt-1 flex items-center gap-1";

  const ErrorMessage = ({ name }: { name: string }) => errors[name] ? (
    <p className={errorClasses}>
      <IconAlertTriangle className="w-3 h-3" />
      {errors[name]}
    </p>
  ) : null;

  if (isDetailView && selectedProject) {
      return (
          <ProjectDetail 
              project={selectedProject}
              tasks={tasks}
              onBack={() => setIsDetailView(false)}
              onUpdate={onUpdateProject}
              onDelete={() => { onDeleteProject(selectedProject.id); setIsDetailView(false); }}
              onAddTask={onAddTask}
          />
      );
  }

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center flex-shrink-0 md:pr-20">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Management</h1>
            <div className="flex gap-3">
                <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`} title="Kanban View"><IconKanban className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`} title="List View"><IconList className="w-4 h-4" /></button>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all flex items-center"
                >
                    <IconPlus className="w-4 h-4 mr-2" /> New Project
                </button>
            </div>
        </div>

        {/* View Content */}
        {viewMode === 'kanban' ? (
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                <div className="h-full flex gap-6 min-w-full">
                    {PROJECT_STATUSES.map(status => (
                        <div 
                            key={status}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                            className="flex flex-col w-80 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex-shrink-0"
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/50 rounded-t-xl">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">{status}</h3>
                                <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {filteredProjects.filter(p => p.status === status).length}
                                </span>
                            </div>
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                                {filteredProjects.filter(p => p.status === status).map(project => (
                                    <div 
                                        key={project.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, project.id)}
                                        onClick={() => handleOpenDetail(project)}
                                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-pointer group transition-all relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block ${getRiskColor(project.riskLevel)}`}>
                                                    {project.riskLevel} Risk
                                                </span>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-primary-600 transition-colors">{project.name}</h4>
                                                {project.client && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{project.client}</p>}
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOpenModal(project); }} 
                                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <IconEdit className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="mt-3 mb-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-500">Progress</span>
                                                <span className="font-bold text-primary-600 dark:text-primary-400">{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                <IconCalendar className="w-3 h-3 mr-1.5" />
                                                {project.endDate ? `Due ${new Date(project.endDate).toLocaleDateString()}` : 'No due date'}
                                            </div>
                                            {project.nextMilestone && (
                                                <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                    <IconCheckCircle className="w-3 h-3 mr-1.5" />
                                                    {project.nextMilestone}
                                                </div>
                                            )}
                                        </div>

                                        {(!project.riskFactors || project.riskFactors.length === 0) && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleRiskAssessment(project); }}
                                                disabled={isAssessingRisks}
                                                className="mt-3 w-full py-1.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <IconSparkles className="w-3 h-3 mr-1.5" /> Assess Risks
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative max-w-md w-full">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('name')}><div className="flex items-center gap-1">Project Name {getSortIcon('name')}</div></th>
                                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('client')}><div className="flex items-center gap-1">Client {getSortIcon('client')}</div></th>
                                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('status')}><div className="flex items-center gap-1">Status {getSortIcon('status')}</div></th>
                                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('progress')}><div className="flex items-center gap-1">Progress {getSortIcon('progress')}</div></th>
                                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('budget')}><div className="flex items-center gap-1">Budget {getSortIcon('budget')}</div></th>
                                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary-600" onClick={() => handleSort('endDate')}><div className="flex items-center gap-1">Due Date {getSortIcon('endDate')}</div></th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {sortedProjects.map(project => (
                                <tr key={project.id} onClick={() => handleOpenDetail(project)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{project.name}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.client || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                            project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                            project.status === 'On Hold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="bg-primary-500 h-full rounded-full" style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs text-slate-500">{project.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatCurrency(project.budget, multiCurrency ? (project.currency || defaultCurrency) : defaultCurrency)}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.endDate || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} 
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                            <IconBriefcase className="w-5 h-5 mr-3 text-primary-500" />
                            {selectedProject ? 'Edit Project' : 'New Project'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconPlus className="w-6 h-6 rotate-45" /></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* AI Assistant Banner */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 flex items-center">
                                        <IconSparkles className="w-4 h-4 mr-2" /> AI Project Planner
                                    </h3>
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                                        Auto-generate description, milestones, and risk assessment based on name & budget.
                                    </p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleGeneratePlan}
                                    disabled={isGeneratingPlan || !formData.name}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
                                >
                                    {isGeneratingPlan ? 'Generating...' : 'Auto-Fill Details'}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('name')} 
                                    />
                                    <ErrorMessage name="name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Client</label>
                                    <input 
                                        type="text" 
                                        name="client"
                                        value={formData.client} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('client')} 
                                        placeholder="Optional"
                                    />
                                    <ErrorMessage name="client" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
                                    <input 
                                        type="date" 
                                        name="startDate"
                                        value={formData.startDate} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('startDate')} 
                                    />
                                    <ErrorMessage name="startDate" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Date</label>
                                    <input 
                                        type="date" 
                                        name="endDate"
                                        value={formData.endDate} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('endDate')} 
                                    />
                                    <ErrorMessage name="endDate" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                                    <select 
                                        name="currency"
                                        value={formData.currency || 'USD'} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('currency')}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="INR">INR (₹)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="JPY">JPY (¥)</option>
                                        <option value="CAD">CAD ($)</option>
                                        <option value="AUD">AUD ($)</option>
                                    </select>
                                    <ErrorMessage name="currency" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Budget</label>
                                    <input 
                                        type="number" 
                                        name="budget"
                                        value={formData.budget} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('budget')} 
                                    />
                                    <ErrorMessage name="budget" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                                    <select 
                                        name="status"
                                        value={formData.status} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('status')}
                                    >
                                        {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ErrorMessage name="status" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Progress (%)</label>
                                    <input 
                                        type="number" 
                                        name="progress"
                                        min="0" max="100"
                                        value={formData.progress} 
                                        onChange={handleInputChange} 
                                        className={inputClasses('progress')} 
                                    />
                                    <ErrorMessage name="progress" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description & Scope</label>
                                <textarea 
                                    rows={3}
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Overview of the project..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Next Milestone</label>
                                    <input 
                                        type="text" 
                                        value={formData.nextMilestone || ''} 
                                        onChange={(e) => setFormData({...formData, nextMilestone: e.target.value})} 
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Risk Level</label>
                                    <select 
                                        value={formData.riskLevel} 
                                        onChange={(e) => setFormData({...formData, riskLevel: e.target.value as any})} 
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            {formData.riskFactors && formData.riskFactors.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                    <h4 className="text-xs font-bold text-red-700 dark:text-red-300 uppercase mb-2">Identified Risk Factors</h4>
                                    <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 space-y-1">
                                        {formData.riskFactors.map((risk, idx) => (
                                            <li key={idx}>{risk}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                {selectedProject && (
                                    <button 
                                        type="button"
                                        onClick={() => { if(window.confirm('Delete project?')) onDeleteProject(selectedProject.id); setIsModalOpen(false); }}
                                        className="mr-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-md">Save Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Projects;
