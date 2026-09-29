
import React, { useState } from 'react';
import { Employee, PayGroup, PayrollRun, SalaryComponent, BankDetails, Currency } from '../types';
import { 
  IconCreditCard, IconCalendar, IconUsers, IconSettings, IconPlus, IconSearch, 
  IconEdit, IconCheckCircle, IconBriefcase, IconBuilding, IconX
} from './Icons';
import { formatCurrency } from '../lib/utils';

interface PayrollProps {
  employees: Employee[];
  payGroups: PayGroup[];
  payrollRuns: PayrollRun[];
  onUpdateEmployee: (employee: Employee) => void;
  onAddPayrollRun: (run: PayrollRun) => void;
  defaultCurrency?: string;
  multiCurrency?: boolean;
}

const Payroll: React.FC<PayrollProps> = ({ employees, payGroups, payrollRuns, onUpdateEmployee, onAddPayrollRun, defaultCurrency = 'USD', multiCurrency = false }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'runs' | 'groups'>('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  
  // Salary Modal State
  const [editingSalary, setEditingSalary] = useState<SalaryComponent[]>([]);
  // Bank Modal State
  const [editingBank, setEditingBank] = useState<BankDetails>({ accountName: '', accountNumber: '', bankName: '', routingNumber: '' });

  const totalMonthlyPayroll = employees.reduce((sum, emp) => {
      const gross = emp.salaryStructure.filter(s => s.type === 'Earning').reduce((a, b) => a + b.amount, 0);
      return sum + gross;
  }, 0);

  const upcomingRuns = payGroups.map(pg => ({
      ...pg,
      date: new Date(pg.nextRun)
  })).sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleOpenSalary = (employee: Employee) => {
      setSelectedEmployee(employee);
      setEditingSalary([...employee.salaryStructure]);
      setIsSalaryModalOpen(true);
  };

  const handleSaveSalary = () => {
      if (selectedEmployee) {
          onUpdateEmployee({ ...selectedEmployee, salaryStructure: editingSalary });
          setIsSalaryModalOpen(false);
      }
  };

  const handleOpenBank = (employee: Employee) => {
      setSelectedEmployee(employee);
      setEditingBank({ ...employee.bankDetails });
      setIsBankModalOpen(true);
  };

  const handleSaveBank = () => {
      if (selectedEmployee) {
          onUpdateEmployee({ ...selectedEmployee, bankDetails: editingBank });
          setIsBankModalOpen(false);
      }
  };

  const updateSalaryComponent = (id: string, field: keyof SalaryComponent, value: any) => {
      setEditingSalary(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addSalaryComponent = () => {
      setEditingSalary(prev => [...prev, { id: Date.now().toString(), name: 'New Component', type: 'Earning', amount: 0 }]);
  };

  const removeSalaryComponent = (id: string) => {
      setEditingSalary(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center flex-shrink-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payroll Management</h1>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                {['Overview', 'Employees', 'Runs', 'Groups'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase() as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.toLowerCase() ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                        <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Est. Monthly Cost</p>
                        <h3 className="text-3xl font-bold">{formatCurrency(totalMonthlyPayroll, defaultCurrency)}</h3>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                        <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">Active Employees</p>
                        <h3 className="text-3xl font-bold">{employees.length}</h3>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Next Pay Date</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{upcomingRuns[0]?.nextRun || 'N/A'}</h3>
                        <p className="text-xs text-slate-400 mt-1">{upcomingRuns[0]?.name}</p>
                    </div>
                </div>

                {/* Calendar / Upcoming Runs */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                        <IconCalendar className="w-5 h-5 mr-2 text-primary-500" />
                        Payroll Calendar
                    </h3>
                    <div className="space-y-4">
                        {upcomingRuns.map(run => (
                            <div key={run.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-700 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-600 shadow-sm">
                                        <span className="text-xs font-bold text-red-500 uppercase">{new Date(run.nextRun).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{new Date(run.nextRun).getDate()}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{run.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">{run.frequency}</span>
                                            <span className="text-xs text-slate-500">{run.entity}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                                    Prepare Run
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Runs</h3>
                    <div className="space-y-4">
                        {payrollRuns.slice(0, 3).map(run => (
                            <div key={run.id} className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                <div className={`w-2 h-2 rounded-full ${run.status === 'Completed' ? 'bg-emerald-500' : run.status === 'Processing' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{run.payGroupName}</p>
                                        <span className="text-xs font-bold text-slate-500">{formatCurrency(run.totalCost, multiCurrency ? (run.currency || defaultCurrency) : defaultCurrency)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{run.periodStart} - {run.periodEnd}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'employees' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden animate-fade-in">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 font-medium">Employee</th>
                                <th className="px-6 py-4 font-medium">Role & Dept</th>
                                <th className="px-6 py-4 font-medium">Pay Group</th>
                                <th className="px-6 py-4 font-medium">Base Salary</th>
                                <th className="px-6 py-4 font-medium">Bank Info</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {employees.map(emp => {
                                const baseSalary = emp.salaryStructure.find(s => s.name === 'Basic Salary' || s.name === 'Hourly Rate')?.amount || 0;
                                return (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{emp.name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            <div className="font-medium">{emp.role}</div>
                                            <div className="text-xs text-slate-400">{emp.department}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {payGroups.find(pg => pg.id === emp.payGroupId)?.name}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(baseSalary, multiCurrency ? (emp.salaryStructure.find(s => s.name === 'Basic Salary' || s.name === 'Hourly Rate')?.currency || defaultCurrency) : defaultCurrency)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {emp.bankDetails.bankName} ••••{emp.bankDetails.accountNumber.slice(-4)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleOpenSalary(emp)}
                                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-xs mr-3"
                                            >
                                                Structure
                                            </button>
                                            <button 
                                                onClick={() => handleOpenBank(emp)}
                                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-xs"
                                            >
                                                Bank
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Salary Modal */}
        {isSalaryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Salary Structure</h2>
                            <p className="text-sm text-slate-500">{selectedEmployee?.name}</p>
                        </div>
                        <button onClick={() => setIsSalaryModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconX className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        <div className="space-y-3 mb-4">
                            {editingSalary.map((comp) => (
                                <div key={comp.id} className="flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        value={comp.name} 
                                        onChange={(e) => updateSalaryComponent(comp.id, 'name', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    />
                                    <select 
                                        value={comp.type}
                                        onChange={(e) => updateSalaryComponent(comp.id, 'type', e.target.value)}
                                        className="w-24 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    >
                                        <option value="Earning">Earning</option>
                                        <option value="Deduction">Deduction</option>
                                    </select>
                                    <select 
                                        value={comp.currency || 'USD'}
                                        onChange={(e) => updateSalaryComponent(comp.id, 'currency', e.target.value)}
                                        className="w-20 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="INR">INR</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                    <input 
                                        type="number" 
                                        value={comp.amount} 
                                        onChange={(e) => updateSalaryComponent(comp.id, 'amount', Number(e.target.value))}
                                        className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    />
                                    <button onClick={() => removeSalaryComponent(comp.id)} className="text-red-500 hover:text-red-700 p-1"><IconX className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addSalaryComponent} className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 mb-6">
                            <IconPlus className="w-4 h-4 mr-1" /> Add Component
                        </button>
                        
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Gross Earnings</span>
                                <span className="font-bold text-emerald-600">{formatCurrency(editingSalary.filter(s => s.type === 'Earning').reduce((a,b)=>a+b.amount,0), multiCurrency ? (editingSalary[0]?.currency || defaultCurrency) : defaultCurrency)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Deductions</span>
                                <span className="font-bold text-red-500">-{formatCurrency(editingSalary.filter(s => s.type === 'Deduction').reduce((a,b)=>a+b.amount,0), multiCurrency ? (editingSalary[0]?.currency || defaultCurrency) : defaultCurrency)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-base">
                                <span>Net Pay</span>
                                <span>{formatCurrency(editingSalary.filter(s => s.type === 'Earning').reduce((a,b)=>a+b.amount,0) - editingSalary.filter(s => s.type === 'Deduction').reduce((a,b)=>a+b.amount,0), multiCurrency ? (editingSalary[0]?.currency || defaultCurrency) : defaultCurrency)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        <button onClick={() => setIsSalaryModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">Cancel</button>
                        <button onClick={handleSaveSalary} className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500">Save Structure</button>
                    </div>
                </div>
            </div>
        )}

        {/* Bank Modal */}
        {isBankModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bank Details</h2>
                        <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><IconX className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                            <input 
                                type="text" 
                                value={editingBank.bankName} 
                                onChange={(e) => setEditingBank({...editingBank, bankName: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                            <input 
                                type="text" 
                                value={editingBank.accountNumber} 
                                onChange={(e) => setEditingBank({...editingBank, accountNumber: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Routing Number / Sort Code</label>
                            <input 
                                type="text" 
                                value={editingBank.routingNumber} 
                                onChange={(e) => setEditingBank({...editingBank, routingNumber: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Holder Name</label>
                            <input 
                                type="text" 
                                value={editingBank.accountName} 
                                onChange={(e) => setEditingBank({...editingBank, accountName: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        <button onClick={() => setIsBankModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">Cancel</button>
                        <button onClick={handleSaveBank} className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500">Save Details</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Payroll;
