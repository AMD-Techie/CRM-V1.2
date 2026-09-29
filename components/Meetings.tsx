
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Meeting, Contact, Account } from '../types';
import { 
  IconCalendar, IconFilter, IconClock, IconMapPin, IconGlobe, 
  IconPlus, IconSearch, IconX, IconEdit, IconTrash, 
  IconArrowUp, IconArrowDown, IconList, IconChevronLeft, IconChevronRight 
} from './Icons';

interface MeetingsProps {
  meetings: Meeting[];
  contacts?: Contact[];
  accounts?: Account[];
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
}

type SortKey = keyof Meeting;
type SortDirection = 'asc' | 'desc';

const Meetings: React.FC<MeetingsProps> = ({ meetings, contacts = [], accounts = [], onAddMeeting, onUpdateMeeting, onDeleteMeeting }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'day'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'date', direction: 'asc' });
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Searchable "Related To" Dropdown State
  const [relatedToSearch, setRelatedToSearch] = useState('');
  const [isRelatedToDropdownOpen, setIsRelatedToDropdownOpen] = useState(false);
  const relatedToDropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Meeting, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'Online',
    relatedTo: ''
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (relatedToDropdownRef.current && !relatedToDropdownRef.current.contains(event.target as Node)) {
        setIsRelatedToDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            meeting.relatedTo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || meeting.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [meetings, searchQuery, typeFilter]);

  const sortedMeetings = useMemo(() => {
    let sortableItems = [...filteredMeetings];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredMeetings, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity">↕️</span>;
    if (sortConfig.direction === 'asc') return <IconArrowUp className="w-3 h-3 text-primary-500" />;
    return <IconArrowDown className="w-3 h-3 text-primary-500" />;
  };

  const handleOpenModal = (meeting?: Meeting, dateOverride?: string) => {
    if (meeting) {
      setSelectedMeeting(meeting);
      setFormData({
        title: meeting.title,
        date: meeting.date,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        type: meeting.type,
        relatedTo: meeting.relatedTo
      });
      setRelatedToSearch(meeting.relatedTo);
    } else {
      setSelectedMeeting(null);
      setFormData({
        title: '',
        date: dateOverride || new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        type: 'Online',
        relatedTo: ''
      });
      setRelatedToSearch('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeeting(null);
    setRelatedToSearch('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    if (selectedMeeting) {
      onUpdateMeeting({ ...formData, id: selectedMeeting.id });
    } else {
      onAddMeeting({ ...formData, id: `M-${Date.now()}` });
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    if (selectedMeeting && window.confirm("Are you sure you want to delete this meeting?")) {
      onDeleteMeeting(selectedMeeting.id);
      handleCloseModal();
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };
  
  const changeDay = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    return dateString === today.toISOString().split('T')[0];
  };

  const relatedToOptions = useMemo(() => {
    const accountOptions = accounts.map(a => ({ id: a.id, name: a.name, type: 'Account', label: `${a.name} (Account)` }));
    const contactOptions = contacts.map(c => ({ id: c.id, name: c.name, type: 'Contact', label: `${c.name} (Contact)` }));
    return [...accountOptions, ...contactOptions];
  }, [accounts, contacts]);

  const filteredRelatedOptions = useMemo(() => {
    if (!relatedToSearch) return relatedToOptions;
    return relatedToOptions.filter(opt => opt.label.toLowerCase().includes(relatedToSearch.toLowerCase()));
  }, [relatedToOptions, relatedToSearch]);

  const handleSelectRelatedTo = (option: { id: string, name: string, type: string, label: string }) => {
      setFormData(prev => ({ ...prev, relatedTo: option.name })); // Store name directly for simplicity in this mock
      setRelatedToSearch(option.label);
      setIsRelatedToDropdownOpen(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Empty cells for padding
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-slate-50/30 dark:bg-slate-900/30 border-r border-b border-slate-100 dark:border-slate-800" />);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayMeetings = meetings.filter(m => m.date === dateStr);
        
        days.push(
            <div 
                key={d} 
                onClick={() => handleOpenModal(undefined, dateStr)}
                className="min-h-[100px] bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col"
            >
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday(dateStr) ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' : 'text-slate-700 dark:text-slate-300'}`}>
                        {d}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-500 transition-opacity">
                        <IconPlus className="w-3 h-3" />
                    </button>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {dayMeetings.map(m => (
                        <div 
                            key={m.id} 
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(m); }} 
                            className={`px-2 py-1 text-xs rounded border border-l-2 truncate transition-all hover:shadow-sm ${
                                m.type === 'Online' 
                                ? 'bg-blue-50 text-blue-700 border-blue-100 border-l-blue-500 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' 
                                : 'bg-orange-50 text-orange-700 border-orange-100 border-l-orange-500 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
                            }`}
                            title={`${m.startTime} - ${m.title}`}
                        >
                            <span className="font-bold mr-1">{m.startTime}</span>
                            {m.title}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400">
                        <IconChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white min-w-[140px] text-center">{monthYear}</h2>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400">
                        <IconChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                    Today
                </button>
            </div>
            
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-7 auto-rows-fr min-h-full">
                    {days}
                </div>
            </div>
        </div>
    );
  };

  const renderDayView = () => {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayMeetings = meetings.filter(m => m.date === dateStr);
      const hours = Array.from({ length: 24 }, (_, i) => i);
      const dayLabel = currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={() => changeDay(-1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400">
                        <IconChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white min-w-[200px] text-center">{dayLabel}</h2>
                    <button onClick={() => changeDay(1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400">
                        <IconChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                    Today
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {hours.map(hour => {
                    const hourStr = String(hour).padStart(2, '0') + ':00';
                    // Find meetings that start in this hour (simplified matching)
                    const slotMeetings = dayMeetings.filter(m => {
                        const startHour = parseInt(m.startTime.split(':')[0]);
                        // Convert PM to 24h for comparison if needed, assuming input is something like 09:00 or 14:00. 
                        // If standard input is HH:MM, fine. If "09:00 AM", needs parsing.
                        // Assuming 24h or flexible matching for now based on simple string startsWith or parsing.
                        // Let's assume standard ISO or consistent time format for simplicity in this mock.
                        // Actually the mock data uses "09:00 AM". Let's handle simple 12h parsing or string match.
                        
                        let mHour = parseInt(m.startTime.split(':')[0]);
                        if (m.startTime.includes('PM') && mHour !== 12) mHour += 12;
                        if (m.startTime.includes('AM') && mHour === 12) mHour = 0;
                        
                        return mHour === hour;
                    });

                    return (
                        <div key={hour} className="flex border-b border-slate-100 dark:border-slate-800 min-h-[60px] group">
                            <div className="w-16 py-2 px-2 text-xs text-slate-400 text-right border-r border-slate-100 dark:border-slate-800">
                                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                            </div>
                            <div 
                                className="flex-1 relative p-1 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                onClick={() => handleOpenModal(undefined, dateStr)}
                            >
                                {slotMeetings.map(m => (
                                    <div 
                                        key={m.id}
                                        onClick={(e) => { e.stopPropagation(); handleOpenModal(m); }}
                                        className={`absolute left-1 right-1 top-1 bottom-1 p-2 rounded-lg border-l-4 text-xs shadow-sm cursor-pointer overflow-hidden ${
                                            m.type === 'Online' 
                                            ? 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' 
                                            : 'bg-orange-50 border-orange-500 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
                                        }`}
                                    >
                                        <div className="font-bold">{m.startTime} - {m.endTime}</div>
                                        <div className="font-semibold truncate">{m.title}</div>
                                        <div className="opacity-80 truncate">{m.relatedTo}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {/* Current time indicator line could go here */}
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center flex-shrink-0 md:pr-24">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meetings</h1>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>List</button>
                <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>Month</button>
                <button onClick={() => setViewMode('day')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'day' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>Day</button>
            </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all flex items-center"
        >
          <IconPlus className="w-4 h-4 mr-2" /> New Meeting
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden flex flex-col flex-1">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-4">
                <div className="relative group">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                    type="text" 
                    placeholder="Search meetings..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64 transition-all"
                    />
                </div>
                
                <div className="flex items-center space-x-2">
                <IconFilter className="w-4 h-4 text-slate-400" />
                <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                    <option value="All">All Types</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                </select>
                </div>
            </div>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/90 backdrop-blur-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-4 font-medium"><button onClick={() => requestSort('title')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Title {getSortIcon('title')}</button></th>
                    <th className="px-6 py-4 font-medium"><button onClick={() => requestSort('date')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Date & Time {getSortIcon('date')}</button></th>
                    <th className="px-6 py-4 font-medium"><button onClick={() => requestSort('type')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Type {getSortIcon('type')}</button></th>
                    <th className="px-6 py-4 font-medium"><button onClick={() => requestSort('relatedTo')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">Related To {getSortIcon('relatedTo')}</button></th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sortedMeetings.map((meeting) => (
                    <tr 
                    key={meeting.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => handleOpenModal(meeting)}
                    >
                    <td className="px-6 py-4">
                        <div className="flex items-center text-base font-medium text-slate-900 dark:text-white">
                        <div className={`p-2 rounded-lg mr-3 ${meeting.type === 'Online' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'}`}>
                            {meeting.type === 'Online' ? <IconGlobe className="w-4 h-4" /> : <IconMapPin className="w-4 h-4" />}
                        </div>
                        {meeting.title}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                        <div className="flex items-center text-sm text-slate-900 dark:text-white font-medium">
                            <IconCalendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            {meeting.date}
                        </div>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                            <IconClock className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            {meeting.startTime} - {meeting.endTime}
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                        meeting.type === 'Online' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                            : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                        }`}>
                        {meeting.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {meeting.relatedTo ? (
                            <div className="flex items-center">
                                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold mr-2 text-slate-600 dark:text-slate-300">
                                    {meeting.relatedTo.charAt(0)}
                                </span>
                                {meeting.relatedTo}
                            </div>
                        ) : (
                            <span className="text-slate-400 italic">None</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(meeting); }}
                        className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                        <IconEdit className="w-4 h-4" />
                        </button>
                    </td>
                    </tr>
                ))}
                {sortedMeetings.length === 0 && (
                    <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                        <IconCalendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                        <p className="text-lg font-medium">No meetings found</p>
                        <p className="text-sm">Try adjusting your filters or create a new meeting.</p>
                        </div>
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
      ) : viewMode === 'calendar' ? (
        renderCalendar()
      ) : (
        renderDayView()
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                 <IconCalendar className="w-5 h-5 mr-3 text-primary-500" />
                 {selectedMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Meeting Title <span className="text-red-500">*</span></label>
                    <input 
                       type="text" 
                       name="title" 
                       value={formData.title} 
                       onChange={handleInputChange} 
                       required
                       placeholder="e.g. Weekly Sync"
                       className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date <span className="text-red-500">*</span></label>
                        <input 
                            type="date" 
                            name="date" 
                            value={formData.date} 
                            onChange={handleInputChange} 
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="Online">Online</option>
                            <option value="Offline">Offline</option>
                        </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Time <span className="text-red-500">*</span></label>
                        <input 
                            type="time" 
                            name="startTime" 
                            value={formData.startTime} 
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Time <span className="text-red-500">*</span></label>
                        <input 
                            type="time" 
                            name="endTime" 
                            value={formData.endTime} 
                            onChange={handleInputChange} 
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                        />
                    </div>
                 </div>

                 {/* Related To Dropdown */}
                 <div ref={relatedToDropdownRef} className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Related To</label>
                    <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                           type="text" 
                           value={relatedToSearch} 
                           onChange={(e) => {
                               setRelatedToSearch(e.target.value);
                               setIsRelatedToDropdownOpen(true);
                           }}
                           onFocus={() => setIsRelatedToDropdownOpen(true)}
                           placeholder="Search Contacts or Accounts..."
                           className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                        />
                    </div>
                    {isRelatedToDropdownOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {filteredRelatedOptions.length > 0 ? (
                                filteredRelatedOptions.map(opt => (
                                    <button
                                        key={`${opt.type}-${opt.id}`}
                                        type="button"
                                        onClick={() => handleSelectRelatedTo(opt)}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                                    >
                                        <span className="font-medium">{opt.name}</span>
                                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({opt.type})</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">No results found.</div>
                            )}
                        </div>
                    )}
                 </div>

                 <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                    {selectedMeeting && (
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
                        {selectedMeeting ? 'Save Changes' : 'Schedule Meeting'}
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

export default Meetings;
