
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Visit, VisitStatus, VisitType, Account } from '../types';
import { 
    IconMapPin, IconCalendar, IconClock, IconPlus, IconSearch, 
    IconFilter, IconCheckCircle, IconX, IconUser, IconBuilding,
    IconArrowUp, IconArrowDown, IconEdit, IconTrash, IconChevronRight,
    IconSparkles, IconGlobe
} from './Icons';
import { findPlace } from '../services/geminiService';

interface VisitsProps {
    visits: Visit[];
    accounts?: Account[];
    onAddVisit: (visit: Visit) => void;
    onUpdateVisit: (visit: Visit) => void;
    onDeleteVisit: (id: string) => void;
}

const VISIT_TYPES: VisitType[] = ['Sales', 'Site Inspection', 'Service', 'Delivery', 'Demo'];
const VISIT_STATUSES: VisitStatus[] = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
const DATE_FILTERS = ['All Time', 'This Week', 'This Month', 'This Quarter', 'This Year'];

const Visits: React.FC<VisitsProps> = ({ visits, accounts = [], onAddVisit, onUpdateVisit, onDeleteVisit }) => {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [dateFilter, setDateFilter] = useState<string>('All Time');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [formData, setFormData] = useState<Partial<Visit>>({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        status: 'Scheduled',
        type: 'Sales',
        assignedTo: 'Alex Chen',
        location: '',
        mapLink: ''
    });
    
    const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);
    const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
    const accountWrapperRef = useRef<HTMLDivElement>(null);
    const [isLookingUpMap, setIsLookingUpMap] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (accountWrapperRef.current && !accountWrapperRef.current.contains(event.target as Node)) {
                setShowAccountSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [accountWrapperRef]);

    const today = new Date().toISOString().split('T')[0];
    const todayVisits = visits.filter(v => v.date === today);
    const completedCount = todayVisits.filter(v => v.status === 'Completed').length;
    const pendingCount = todayVisits.filter(v => v.status === 'Scheduled' || v.status === 'In Progress').length;

    const filteredVisits = useMemo(() => {
        return visits.filter(visit => {
            const matchesSearch = 
                visit.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                visit.relatedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                visit.location.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || visit.status === statusFilter;
            
            let matchesDate = true;
            if (dateFilter !== 'All Time') {
                const visitDate = new Date(visit.date);
                const now = new Date();
                
                // Reset time part for accurate date comparison
                now.setHours(0,0,0,0); 
                const visitDateMidnight = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());

                if (dateFilter === 'This Week') {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay()); 
                    startOfWeek.setHours(0, 0, 0, 0);
                    matchesDate = visitDateMidnight >= startOfWeek;
                } else if (dateFilter === 'This Month') {
                    matchesDate = visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
                } else if (dateFilter === 'This Quarter') {
                    const currentQuarter = Math.floor(now.getMonth() / 3);
                    const visitQuarter = Math.floor(visitDate.getMonth() / 3);
                    matchesDate = currentQuarter === visitQuarter && visitDate.getFullYear() === now.getFullYear();
                } else if (dateFilter === 'This Year') {
                    matchesDate = visitDate.getFullYear() === now.getFullYear();
                }
            }
            
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [visits, searchQuery, statusFilter, dateFilter]);

    const handleOpenModal = (visit?: Visit) => {
        if (visit) {
            setSelectedVisit(visit);
            setFormData(visit);
        } else {
            setSelectedVisit(null);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                endTime: '10:00',
                status: 'Scheduled',
                type: 'Sales',
                assignedTo: 'Alex Chen',
                title: '',
                relatedTo: '',
                location: '',
                mapLink: ''
            });
        }
        setFilteredAccounts([]);
        setIsModalOpen(true);
    };

    const handleRelatedToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, relatedTo: value });
        
        if (value && accounts.length > 0) {
            const matches = accounts.filter(a => a.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredAccounts(matches);
            setShowAccountSuggestions(matches.length > 0);
        } else {
            setShowAccountSuggestions(false);
        }
    };

    const selectAccount = (account: Account) => {
        setFormData(prev => ({
            ...prev,
            relatedTo: account.name,
            location: account.address || prev.location,
            mapLink: account.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(account.address)}` : prev.mapLink
        }));
        setShowAccountSuggestions(false);
    };

    const handleVerifyLocation = async () => {
        if (!formData.location) {
            alert("Please enter a location name or address first.");
            return;
        }
        setIsLookingUpMap(true);
        const result = await findPlace(formData.location);
        if (result) {
            setFormData(prev => ({ 
                ...prev, 
                location: result.address, 
                mapLink: result.mapLink 
            }));
        }
        setIsLookingUpMap(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.relatedTo || !formData.date) {
            alert('Please fill in all required fields.');
            return;
        }

        const visitData = {
            id: selectedVisit ? selectedVisit.id : `V-${Date.now()}`,
            ...formData
        } as Visit;

        if (selectedVisit) {
            onUpdateVisit(visitData);
        } else {
            onAddVisit(visitData);
        }
        setIsModalOpen(false);
    };

    const handleCheckIn = (visit: Visit, e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdateVisit({ ...visit, status: 'In Progress' });
    };

    const handleComplete = (visit: Visit, e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdateVisit({ ...visit, status: 'Completed', outcome: 'Visit completed successfully.' });
    };

    const getStatusColor = (status: VisitStatus) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'In Progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Cancelled': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col animate-fade-in">
            {/* Header and Stats Cards */}
            <div className="flex justify-between items-center flex-shrink-0 md:pr-24">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Field Visits</h1>
                <button 
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all flex items-center"
                >
                    <IconPlus className="w-4 h-4 mr-2" /> Schedule Visit
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Visits</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{todayVisits.length}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <IconMapPin className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{pendingCount}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                            <IconClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{completedCount}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <IconCheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative flex-1 max-w-md">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search visits..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                             <IconCalendar className="w-4 h-4 text-slate-400" />
                             <select 
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                                {DATE_FILTERS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <IconFilter className="w-4 h-4 text-slate-400" />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                                <option value="All">All Status</option>
                                {VISIT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-auto flex-1 custom-scrollbar p-4">
                    <div className="space-y-3">
                        {filteredVisits.map(visit => (
                            <div key={visit.id} onClick={() => handleOpenModal(visit)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{visit.title}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(visit.status)}`}>{visit.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                        <IconBuilding className="w-3.5 h-3.5 text-slate-400" /> {visit.relatedTo}
                                        <span className="text-slate-300 dark:text-slate-600">|</span>
                                        <IconMapPin className="w-3.5 h-3.5 text-slate-400" /> {visit.location || 'No location'}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 text-sm text-slate-500 dark:text-slate-400 min-w-[140px]">
                                    <div className="flex items-center gap-2">
                                        <IconCalendar className="w-4 h-4" /> {visit.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <IconClock className="w-4 h-4" /> {visit.startTime} - {visit.endTime}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    {visit.status === 'Scheduled' && (
                                        <button onClick={(e) => handleCheckIn(visit, e)} className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                                            Check In
                                        </button>
                                    )}
                                    {visit.status === 'In Progress' && (
                                        <button onClick={(e) => handleComplete(visit, e)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                                            Complete
                                        </button>
                                    )}
                                    <button onClick={() => { if(window.confirm('Delete visit?')) onDeleteVisit(visit.id); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredVisits.length === 0 && (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                <IconMapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No visits found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                <IconMapPin className="w-5 h-5 mr-3 text-primary-500" />
                                {selectedVisit ? 'Edit Visit' : 'Schedule Visit'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><IconX className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Visit Title <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.title || ''} 
                                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                        placeholder="e.g. Quarterly Site Inspection"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                                        required 
                                    />
                                </div>

                                <div className="relative" ref={accountWrapperRef}>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Related To <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.relatedTo || ''} 
                                        onChange={handleRelatedToChange} 
                                        onFocus={() => { if(formData.relatedTo && accounts.length) setShowAccountSuggestions(true); }}
                                        placeholder="Search Accounts..."
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                                        required 
                                        autoComplete="off"
                                    />
                                    {showAccountSuggestions && (
                                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                                            {filteredAccounts.map(account => (
                                                <div 
                                                    key={account.id}
                                                    onClick={() => selectAccount(account)}
                                                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                                                >
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{account.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{account.address}</div>
                                                    </div>
                                                    <IconChevronRight className="w-3 h-3 text-slate-400" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={formData.location || ''} 
                                            onChange={(e) => setFormData({...formData, location: e.target.value})} 
                                            placeholder="Enter address..."
                                            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleVerifyLocation}
                                            disabled={isLookingUpMap}
                                            className="px-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50"
                                            title="Find on Map"
                                        >
                                            {isLookingUpMap ? <span className="animate-spin">⟳</span> : <IconGlobe className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {formData.mapLink && (
                                        <a href={formData.mapLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                                            View on Google Maps
                                        </a>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                                        <select 
                                            value={formData.type} 
                                            onChange={(e) => setFormData({...formData, type: e.target.value as VisitType})}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white cursor-pointer"
                                        >
                                            {VISIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                                        <input 
                                            type="date" 
                                            value={formData.date} 
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Time</label>
                                        <input 
                                            type="time" 
                                            value={formData.startTime} 
                                            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Time</label>
                                        <input 
                                            type="time" 
                                            value={formData.endTime} 
                                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                                            required 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
                                    <textarea 
                                        rows={3}
                                        value={formData.notes || ''} 
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        placeholder="Visit instructions or details..."
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white resize-none"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/25 transition-colors"
                                    >
                                        {selectedVisit ? 'Save Changes' : 'Schedule Visit'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Visits;
