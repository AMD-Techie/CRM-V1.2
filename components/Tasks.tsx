
import React, { useState, useMemo, useEffect } from 'react';
import { Task } from '../types';
import { IconCheckSquare, IconFilter, IconArrowUp, IconArrowDown, IconX, IconCalendar, IconEdit, IconTrash } from './Icons';

interface TasksProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

type SortKey = 'title' | 'dueDate' | 'priority';
type SortDirection = 'asc' | 'desc';

const initialFormState: Omit<Task, 'id'> = {
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Not Started',
    priority: 'Normal',
    relatedTo: ''
};

const Tasks: React.FC<TasksProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = [...tasks]; // Create a mutable copy
    if (priorityFilter !== 'All') {
      filteredTasks = tasks.filter(task => task.priority === priorityFilter);
    }

    if (sortConfig !== null) {
      filteredTasks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredTasks;
  }, [tasks, priorityFilter, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
        setSortConfig(null);
        return;
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <span className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity">⇅</span>;
    }
    if (sortConfig.direction === 'asc') {
        return <IconArrowUp className="w-4 h-4 text-primary-500" />;
    }
    return <IconArrowDown className="w-4 h-4 text-primary-500" />;
  };

  const handleOpenNewTask = () => {
      setSelectedTask(null);
      setFormData(initialFormState);
      setIsModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
      setSelectedTask(task);
      setFormData({
          title: task.title,
          dueDate: task.dueDate,
          status: task.status,
          priority: task.priority,
          relatedTo: task.relatedTo || ''
      });
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedTask(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title) {
          alert("Task Title is required");
          return;
      }

      if (selectedTask) {
          onUpdateTask({ ...selectedTask, ...formData });
      } else {
          onAddTask({
              id: `T-${Date.now()}`,
              ...formData
          } as Task);
      }
      handleCloseModal();
  };

  const handleDelete = () => {
      if (selectedTask && window.confirm("Are you sure you want to delete this task?")) {
          onDeleteTask(selectedTask.id);
          handleCloseModal();
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center md:pr-20">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
        <button 
            onClick={handleOpenNewTask}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all"
        >
          + New Task
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center space-x-2">
             <IconFilter className="w-4 h-4 text-slate-400" />
             <select 
               value={priorityFilter}
               onChange={(e) => setPriorityFilter(e.target.value)}
               className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
             >
               <option value="All">All Priorities</option>
               <option value="High">High</option>
               <option value="Normal">Normal</option>
               <option value="Low">Low</option>
             </select>
           </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-sm font-medium">
                 <button onClick={() => requestSort('title')} className="flex items-center gap-2 group">
                    Subject {getSortIcon('title')}
                 </button>
              </th>
              <th className="px-6 py-4 text-sm font-medium">
                 <button onClick={() => requestSort('dueDate')} className="flex items-center gap-2 group">
                   Due Date {getSortIcon('dueDate')}
                 </button>
              </th>
              <th className="px-6 py-4 text-sm font-medium">Status</th>
              <th className="px-6 py-4 text-sm font-medium">
                 <button onClick={() => requestSort('priority')} className="flex items-center gap-2 group">
                   Priority {getSortIcon('priority')}
                 </button>
              </th>
              <th className="px-6 py-4 text-sm font-medium">Related To</th>
              <th className="px-6 py-4 text-sm font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredAndSortedTasks.map((task) => (
              <tr 
                key={task.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                onClick={() => handleOpenEditTask(task)}
              >
                <td className="px-6 py-4 text-base font-medium text-slate-900 dark:text-white flex items-center">
                  <IconCheckSquare className="w-4 h-4 mr-2 text-slate-400" />
                  {task.title}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{task.dueDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                    task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                    task.status === 'Deferred' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                    task.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' :
                    task.priority === 'Low' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                   }`}>
                     {task.priority}
                   </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{task.relatedTo}</td>
                <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconEdit className="w-4 h-4" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                 <IconCheckSquare className="w-5 h-5 mr-3 text-primary-500" />
                 {selectedTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button 
                onClick={handleCloseModal} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject <span className="text-red-500">*</span></label>
                    <input 
                       type="text" 
                       name="title" 
                       value={formData.title} 
                       onChange={handleInputChange} 
                       required
                       placeholder="e.g. Follow up with client"
                       className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                name="dueDate" 
                                value={formData.dueDate} 
                                onChange={handleInputChange} 
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                            />
                            {/* <IconCalendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" /> */}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                        <select 
                            name="priority" 
                            value={formData.priority} 
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="High">High</option>
                            <option value="Normal">Normal</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                        <select 
                            name="status" 
                            value={formData.status} 
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Deferred">Deferred</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Related To</label>
                        <input 
                           type="text" 
                           name="relatedTo" 
                           value={formData.relatedTo} 
                           onChange={handleInputChange} 
                           placeholder="Optional (e.g. Marketing)"
                           className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                        />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                    {selectedTask && (
                        <button 
                            type="button"
                            onClick={handleDelete}
                            className="mr-auto px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center"
                        >
                            <IconTrash className="w-4 h-4 mr-2" /> Delete
                        </button>
                    )}
                    <button 
                        type="button"
                        onClick={handleCloseModal}
                        className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/25 transition-colors"
                    >
                        {selectedTask ? 'Save Changes' : 'Create Task'}
                    </button>
                 </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
