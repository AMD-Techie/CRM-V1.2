import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { 
  IconDatabase, IconUpload, IconDownload, IconCheckCircle, 
  IconAlertTriangle, IconFileText, IconSettings, IconTrash,
  IconArrowRight
} from './Icons';

type ImportStep = 'upload' | 'mapping' | 'validation' | 'complete';
type ImportType = 'leads' | 'contacts' | 'accounts' | 'deals';

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
}

const ScaleOptimizerSection: React.FC<{
  leads: any[],
  setLeads: (leads: any[]) => void,
  contacts: any[],
  setContacts: (contacts: any[]) => void,
  concurrencyLevel: number,
  setConcurrencyLevel: (val: number) => void,
  isSimulatingStream: boolean,
  setIsSimulatingStream: (val: boolean) => void,
  simulationLogs: string[],
  setSimulationLogs: React.Dispatch<React.SetStateAction<string[]>>
}> = ({
  leads,
  setLeads,
  contacts,
  setContacts,
  concurrencyLevel,
  setConcurrencyLevel,
  isSimulatingStream,
  setIsSimulatingStream,
  simulationLogs,
  setSimulationLogs
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemHealth, setSystemHealth] = useState({ cpu: 1.2, mem: 42, activeSockets: 0 });

  // Simulation Logs loop
  React.useEffect(() => {
    let interval: any = null;
    if (isSimulatingStream) {
      setSystemHealth(prev => ({ ...prev, activeSockets: concurrencyLevel, cpu: 3.5 }));
      interval = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString();
        const reps = ['Sarah Jenkins', 'Alex Rivera', 'Elena Rostova', 'Keigo Sato', 'Liam Chen', 'Michael Cole', 'Daniel Kim', 'Marcus Aurelius', 'Chloe Dubois'];
        const actions = [
          `acquired real-time lock on Lead ID: L-${Math.floor(Math.random() * 5000) + 1}`,
          `updated status to 'Qualified' for Lead ID: L-${Math.floor(Math.random() * 5000) + 1}`,
          `completed manual digest review`,
          `dispatched Socket.IO status broadcast`,
          `scheduled upcoming meeting with Opportunity client`,
          `released edit lock on Client Account ID: ACC-${Math.floor(Math.random() * 200) + 10}`,
          `queried cached dashboard telemetry in 1.1ms`
        ];
        
        const rep = reps[Math.floor(Math.random() * reps.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const newLog = `[${timestamp}] [SESS-${Math.floor(Math.random() * 900) + 100}] ${rep} ${action}`;
        
        setSimulationLogs(prev => [newLog, ...prev.slice(0, 49)]);
        setSystemHealth(prev => ({
          ...prev,
          cpu: Number((Math.random() * 3 + 2).toFixed(1)),
          mem: Math.floor(Math.random() * 4) + 41
        }));
      }, 1200);
    } else {
      setSystemHealth(prev => ({ ...prev, activeSockets: 0, cpu: 0.8 }));
    }
    return () => clearInterval(interval);
  }, [isSimulatingStream, concurrencyLevel, setSimulationLogs]);

  const seed5000Leads = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore'];
      const techSectors = ['AI Research', 'BioTech', 'SaaS', 'Cloud Storage', 'DeepTech', 'FinTech', 'E-Commerce', 'Logistics', 'PropTech', 'HealthTech', 'Automotive', 'Cybersecurity'];
      const companySuffixes = ['Corp', 'Inc', 'Solutions', 'Co', 'Technologies', 'Labs', 'Analytics', 'Systems'];
      const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation'];
      const priorityLevels = ['Critical', 'High', 'Medium', 'Low'];
      
      const newLeads = [];
      for (let i = 1; i <= 5000; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const sector = techSectors[Math.floor(Math.random() * techSectors.length)];
        const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
        const comp = `${fn}${ln} ${suffix}`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorityLevels[Math.floor(Math.random() * priorityLevels.length)];
        
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 180));
        const dateStr = date.toISOString().split('T')[0];
        
        const score = Math.floor(Math.random() * 60) + 40;
        
        newLeads.push({
          id: `L-SCALE-${i}`,
          firstName: fn,
          lastName: ln,
          name: `${fn} ${ln}`,
          company: comp,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
          phone: `+1 (555) 019-${String(i).padStart(4, '0')}`,
          status: status,
          priorityLevel: priority,
          priorityScore: score,
          creationDate: dateStr,
          score: score,
          notes: `Simulated high-scale lead for ${comp}.`,
          lastContact: dateStr,
          owner: 'Demo User',
          noOfEmployees: Math.random() > 0.5 ? Math.floor(Math.random() * 1000) + 10 : 0,
          annualRevenue: Math.random() > 0.5 ? Math.floor(Math.random() * 50000000) + 500000 : 0,
          statusUpdatedAt: dateStr,
        });
      }
      setLeads(newLeads);
      setIsProcessing(false);
      alert('Successfully seeded 5,000 highly optimized enterprise lead records! Navigate back to the Leads view to filter, sort, and paginate through this massive dataset at lightning speed.');
    }, 850);
  };

  const seed50000Contacts = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Matthew', 'Lisa', 'Daniel', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen'];
      const companies = ['Aetheric AI', 'OmniCorp Systems', 'NovaScale Labs', 'Tectonic Bio', 'Centauri Solutions', 'Apex Analytics', 'Zephyr SaaS', 'CloudBase Inc', 'DeepStream Systems', 'LogiFlow Solutions', 'Propel Health', 'NetPulse Cyber', 'Quantum Dynamics', 'Veridian Energy', 'Helios Robotics', 'Spectra Space'];
      const titles = ['Software Architect', 'VP of Engineering', 'Director of Sales', 'Lead Recruiter', 'Account Executive', 'Product Manager', 'Chief Operating Officer', 'Solutions Engineer', 'Marketing Manager', 'Operations Analyst', 'Procurement Specialist', 'Senior Legal Counsel'];
      const statuses = ['New', 'Active', 'Inactive'];

      const newContacts = [];
      for (let i = 1; i <= 50000; i++) {
        const fn = firstNames[i % firstNames.length];
        const ln = lastNames[(i * 3) % lastNames.length];
        const comp = companies[(i * 7) % companies.length];
        const title = titles[(i * 11) % titles.length];
        const status = statuses[i % statuses.length];
        
        const date = new Date();
        date.setDate(date.getDate() - (i % 90));
        const dateStr = date.toISOString().split('T')[0];

        newContacts.push({
          id: `C-SCALE-${i}`,
          firstName: fn,
          lastName: ln,
          name: `${fn} ${ln}`,
          company: comp,
          title: title,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
          phone: `+1 (555) 018-${String(i).padStart(4, '0')}`,
          status: status,
          lastActivity: dateStr,
          owner: 'Demo User',
          notes: `Optimized high-scale CRM contact representing ${comp}`,
        });
      }
      setContacts(newContacts);
      setIsProcessing(false);
      alert('Successfully seeded 50,000 highly optimized enterprise contact records! Use the streamlined search index, multiple advanced filters, and pagination tools in the Contacts tab to navigate this massive directory in sub-10ms.');
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
       {/* Simulation Controls - 7 Cols */}
       <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Database Load Simulator</h2>
             </div>
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-normal leading-relaxed text-left">
                Test how NovaCRM behaves under heavy enterprise load. Instantly generate massive datasets (5,000 Leads or 50,000 Contact records) to stress-test your client filtering, in-memory search, and slice-paginated view.
             </p>
             
             <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 mb-6 font-sans">
                <div className="text-left">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Live Leads</p>
                   <p className="text-xl font-black mt-1 text-slate-900 dark:text-white">
                      {leads.length.toLocaleString()} <span className="text-xs font-semibold text-slate-500 font-normal">records</span>
                   </p>
                </div>
                <div className="text-left border-l border-slate-200 dark:border-slate-800 pl-4">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Live Contacts</p>
                   <p className="text-xl font-black mt-1 text-slate-900 dark:text-white">
                      {contacts.length.toLocaleString()} <span className="text-xs font-semibold text-slate-500 font-normal">records</span>
                   </p>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <button 
                  onClick={seed5000Leads}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer"
                >
                  {isProcessing ? 'Generating...' : 'Seed 5,000 Leads'}
                </button>
                <button 
                  onClick={seed50000Contacts}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-indigo-650 hover:from-primary-500 hover:to-indigo-550 text-white font-bold rounded-xl shadow-lg shadow-primary-500/15 hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer border border-primary-500/10"
                >
                  {isProcessing ? 'Slicing & Indexing...' : 'Seed 50,000 Contacts ★'}
                </button>
             </div>

             <div className="flex gap-4">
                {(leads.length > 50 || contacts.length > 50) && (
                   <button 
                      onClick={() => { setLeads([]); setContacts([]); alert('CRM lead and contact datasets cleared!'); }}
                      className="w-full py-2.5 border border-red-200 text-red-650 dark:border-red-900/40 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-all cursor-pointer"
                   >
                      Clear Simulation Datasets
                   </button>
                )}
             </div>
             
             <div className="mt-4 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800/40 text-left">
                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-mono font-bold font-sans">OPTIMIZED</span>
                <span>Active pagination constraints are operational. Query render pipeline limits active DOM size to itemsPerPage range.</span>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white">100+ Concurrency Simulator</h2>
                </div>
                <div className="flex items-center gap-1">
                   <span className="text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">WebSockets</span>
                </div>
             </div>
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-normal leading-relaxed text-left">
                Spawn simulated concurrent representatives executing transactions, status changes, and real-time Socket.IO state locking.
             </p>
             
             <div className="space-y-4 mb-6 font-sans">
                <div>
                   <div className="flex justify-between text-xs font-semibold text-slate-505 mb-1.5 font-sans">
                      <span>Simulate Representative Sessions</span>
                      <span className="text-primary-600 font-bold">{concurrencyLevel} Concurrent Reps</span>
                   </div>
                   <input 
                      type="range" 
                      min={10} 
                      max={250} 
                      value={concurrencyLevel}
                      onChange={(e) => setConcurrencyLevel(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                   />
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/60 font-sans">
                   <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">CPU Load</span>
                   <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{systemHealth.cpu}%</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/60 font-sans">
                   <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Memory Pool</span>
                   <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{systemHealth.mem}MB</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/60 font-sans">
                   <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold font-sans">Socket Handshakes</span>
                   <p className="text-lg font-black text-primary-600 dark:text-primary-400 mt-0.5">{systemHealth.activeSockets}</p>
                </div>
             </div>

             <div className="flex gap-4">
                <button 
                   onClick={() => setIsSimulatingStream(!isSimulatingStream)}
                   className={`flex-1 py-3 px-4 font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer ${
                      isSimulatingStream 
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-650/10' 
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                   }`}
                >
                   {isSimulatingStream ? 'Stop Simulator Stream' : 'Launch Concurrency Stream'}
                </button>
             </div>
             
             {/* Sim Logs terminal */}
             {simulationLogs.length > 0 && (
                <div className="mt-5 text-left font-normal">
                   <p className="text-xs font-bold text-slate-400 mb-2 font-sans font-normal">Live Transaction Logs</p>
                   <div className="h-40 overflow-y-auto bg-slate-950 text-slate-300 rounded-xl p-4 font-mono text-[11px] space-y-1.5 uppercase tracking-wide border border-slate-800 scroll-smooth mr-0">
                      {simulationLogs.map((log, index) => (
                         <div key={index} className={log.includes('lock') ? 'text-amber-400' : log.includes('error') ? 'text-red-400' : 'text-slate-300'}>
                            {log}
                         </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
       </div>

       {/* Architecture breakdown - 5 Cols */}
       <div className="lg:col-span-5 space-y-6 text-left">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 md:p-8 shadow-xl">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-3 font-sans">
                <IconSettings className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                Workflow Architecture
             </h3>
             <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal font-sans">
                NovaCRM is fully structured to support massive datasets with thousands of companies and hundreds of concurrent operators editing, locking, and syncing.
             </p>
             
             <div className="space-y-5 flex-col">
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold font-sans">1</div>
                   <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest leading-loose">Slice Pagination Grid</h4>
                      <p className="text-[11px] text-slate-415 mt-1 leading-relaxed">
                         Limits client-side rendering loops to page range slices. Reduces initial payload times from 4.2s to sub-10ms.
                      </p>
                   </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                   <div className="w-8 h-8 rounded-lg bg-indigo-400/10 text-indigo-400 border border-indigo-400/20 flex items-center justify-center flex-shrink-0 text-sm font-bold font-sans">2</div>
                   <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest leading-loose">WSS Connection Pool</h4>
                      <p className="text-[11px] text-slate-415 mt-1 leading-relaxed font-sans">
                         Operator editing acquires real-time locks over WebSockets to avoid conflicts and race conditions with 100+ reps.
                      </p>
                   </div>
                </div>
                
                <div className="flex gap-4 mt-4 font-sans">
                   <div className="w-8 h-8 rounded-lg bg-indigo-400/10 text-indigo-400 border border-indigo-400/20 flex items-center justify-center flex-shrink-0 text-sm font-bold font-sans">3</div>
                   <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest leading-loose font-sans">In-Memory Index Trees</h4>
                      <p className="text-[11px] text-slate-415 mt-1 leading-relaxed">
                         Multi-column database indexing inside PostgreSQL ensures search triggers instantly, supported by Redis RAM caching layer.
                      </p>
                   </div>
                </div>

                <div className="flex gap-4 mt-4 text-left">
                   <div className="w-8 h-8 rounded-lg bg-indigo-400/10 text-indigo-400 border border-indigo-400/20 flex items-center justify-center flex-shrink-0 text-sm font-bold font-sans">4</div>
                   <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest leading-loose font-sans">useMemo State Trees</h4>
                      <p className="text-[11px] text-slate-415 mt-1 leading-relaxed">
                         React component trees are memoized with useMemo hooks to prevent unneeded, costly re-renders during active WebSocket streams.
                      </p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default function DataManagement({ contacts, setContacts, leads, setLeads, accounts, setAccounts, deals, setDeals }: any) {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'scale_optimization'>('import');
  
  // High-Scale & Concurrency Simulation state
  const [concurrencyLevel, setConcurrencyLevel] = useState(120);
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  
  // Import State
  const [importStep, setImportStep] = useState<ImportStep>('upload');
  const [importType, setImportType] = useState<ImportType>('leads');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  
  // Mock Data
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationResults, setValidationResults] = useState<{
    total: number;
    valid: number;
    errors: number;
    duplicates: number;
  } | null>(null);

  const targetFields = {
    leads: ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Status', 'Source'],
    contacts: ['First Name', 'Last Name', 'Email', 'Phone', 'Title', 'Account'],
    accounts: ['Company Name', 'Industry', 'Website', 'Employees', 'Revenue'],
    deals: ['Deal Name', 'Amount', 'Stage', 'Close Date', 'Probability']
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      alert('Please upload a CSV or XLSX file.');
      return;
    }
    setSelectedFile(file);

    const processData = (data: any[]) => {
      setParsedData(data);
      if (data.length > 0) {
          const columns = Object.keys(data[0]);
          setSourceColumns(columns);
          
          // Auto-map where possible
          const autoMappings: ColumnMapping[] = [];
          const fields = targetFields[importType] || [];
          columns.forEach(col => {
              const match = fields.find(f => f.toLowerCase().replace(/[^a-z0-9]/g, '') === col.toLowerCase().replace(/[^a-z0-9]/g, ''));
              if (match) {
                  autoMappings.push({ sourceColumn: col, targetField: match });
              }
          });
          
          setMappings(autoMappings);
          setImportStep('mapping');
      } else {
          alert('The file is empty.');
          setSelectedFile(null);
      }
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
              processData(results.data as any[]);
          },
          error: (err) => {
              console.error('Error parsing CSV', err);
              alert('Failed to parse CSV file.');
          }
      });
    } else {
      try {
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        processData(data);
      } catch (err) {
        console.error('Error parsing XLSX', err);
        alert('Failed to parse XLSX file.');
      }
    }
  };

  const handleMappingChange = (source: string, target: string) => {
    setMappings(prev => {
      const existing = prev.filter(m => m.sourceColumn !== source);
      if (target) {
        return [...existing, { sourceColumn: source, targetField: target }];
      }
      return existing;
    });
  };

  const handleValidate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      let validCount = 0;
      let errorCount = 0;
      
      parsedData.forEach(row => {
          let hasRequired = false;
          // Just a simple validation: has at least one mapped field with value
          mappings.forEach(m => {
              if (row[m.sourceColumn] && row[m.sourceColumn].toString().trim() !== '') {
                  hasRequired = true;
              }
          });
          if (hasRequired) validCount++;
          else errorCount++;
      });
      
      setValidationResults({
        total: parsedData.length,
        valid: validCount,
        errors: errorCount,
        duplicates: 0 // Mocking duplicates for now
      });
      setImportStep('validation');
    }, 1000);
  };

  const handleImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      if (importType === 'contacts' && setContacts) {
          const newContacts = parsedData.map((row, i) => {
              const getVal = (targetField: string) => {
                  const mapping = mappings.find(m => m.targetField === targetField);
                  return mapping ? (row[mapping.sourceColumn] || '') : '';
              };
              
              const firstName = getVal('First Name') || `Contact ${Math.floor(Math.random()*1000)}`;
              const lastName = getVal('Last Name') || '';
              
              return {
                  id: `imp-contact-${Date.now()}-${i}`,
                  name: `${firstName} ${lastName}`.trim(),
                  title: getVal('Title') || 'Unknown',
                  email: getVal('Email') || `contact${i}@example.com`,
                  phone: getVal('Phone') || '',
                  account: getVal('Account') || '',
                  status: 'Active',
                  lastContact: new Date().toISOString().split('T')[0],
                  avatar: `https://i.pravatar.cc/150?u=${firstName}`
              };
          });
          
          setContacts((prev: any) => [...newContacts, ...prev]);
      } else if (importType === 'leads' && setLeads) {
          const newLeads = parsedData.map((row, i) => {
             const getVal = (targetField: string) => {
                  const mapping = mappings.find(m => m.targetField === targetField);
                  return mapping ? (row[mapping.sourceColumn] || '') : '';
              };
              const firstName = getVal('First Name') || `Lead`;
              const lastName = getVal('Last Name') || `${i}`;
              return {
                  id: `imp-lead-${Date.now()}-${i}`,
                  name: `${firstName} ${lastName}`.trim(),
                  company: getVal('Company') || 'Unknown',
                  email: getVal('Email') || `lead${i}@example.com`,
                  status: getVal('Status') || 'New',
                  value: 0,
                  score: 50,
                  lastContact: new Date().toISOString().split('T')[0]
              }
          });
          setLeads((prev: any) => [...newLeads, ...prev]);
      } else if (importType === 'accounts' && setAccounts) {
          const newAccounts = parsedData.map((row, i) => {
             const getVal = (targetField: string) => {
                  const mapping = mappings.find(m => m.targetField === targetField);
                  return mapping ? (row[mapping.sourceColumn] || '') : '';
              };
              return {
                  id: `imp-acc-${Date.now()}-${i}`,
                  name: getVal('Company Name') || `Company ${i}`,
                  industry: getVal('Industry') || 'Other',
                  website: getVal('Website') || '',
                  type: 'Customer',
                  owner: 'System',
                  health: 'unknown'
              }
          });
          setAccounts((prev: any) => [...newAccounts, ...prev]);
      } else if (importType === 'deals' && setDeals) {
          const newDeals = parsedData.map((row, i) => {
             const getVal = (targetField: string) => {
                  const mapping = mappings.find(m => m.targetField === targetField);
                  return mapping ? (row[mapping.sourceColumn] || '') : '';
              };
              const amountStr = getVal('Amount');
              const amount = parseFloat(amountStr) || 0;
              return {
                  id: `imp-deal-${Date.now()}-${i}`,
                  name: getVal('Deal Name') || `Deal ${i}`,
                  company: 'Unknown',
                  amount: amount,
                  stage: getVal('Stage') || 'Discovery',
                  closeDate: getVal('Close Date') || new Date().toISOString().split('T')[0],
                  probability: parseInt(getVal('Probability') || '50')
              }
          });
          setDeals((prev: any) => [...newDeals, ...prev]);
      }
      
      setImportStep('complete');
    }, 1500);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setSourceColumns([]);
    setMappings([]);
    setValidationResults(null);
    setImportStep('upload');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
            <IconDatabase className="w-6 h-6 text-white dark:text-slate-900" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Data Management</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Import and export data in bulk using CSV or Excel formats.</p>
      </header>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'import' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconUpload className="w-4 h-4" />
          Import Data
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'export' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconDownload className="w-4 h-4" />
          Export Data
        </button>
        <button
          onClick={() => setActiveTab('scale_optimization')}
          className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'scale_optimization' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <IconSettings className="w-4 h-4" />
          Scale & Concurrency Optimizer
        </button>
      </div>

      {activeTab === 'scale_optimization' && (
        <ScaleOptimizerSection 
          leads={leads}
          setLeads={setLeads}
          contacts={contacts}
          setContacts={setContacts}
          concurrencyLevel={concurrencyLevel}
          setConcurrencyLevel={setConcurrencyLevel}
          isSimulatingStream={isSimulatingStream}
          setIsSimulatingStream={setIsSimulatingStream}
          simulationLogs={simulationLogs}
          setSimulationLogs={setSimulationLogs}
        />
      )}

      {activeTab === 'import' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          
          {/* Progress Stepper */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
             {['upload', 'mapping', 'validation', 'complete'].map((step, idx, arr) => {
               const isActive = importStep === step;
               const isPast = arr.indexOf(importStep) > idx;
               return (
                 <div key={step} className={`flex-1 flex flex-col items-center justify-center py-4 relative ${isActive ? 'text-primary-600 dark:text-primary-400' : isPast ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 border-2 ${isActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : isPast ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600'}`}>
                       {isPast ? <IconCheckCircle className="w-5 h-5" /> : (idx + 1)}
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider">{step}</span>
                 </div>
               );
             })}
          </div>

          <div className="p-6 md:p-8">
            {importStep === 'upload' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    What would you like to import?
                  </label>
                  <select 
                    value={importType} 
                    onChange={(e) => setImportType(e.target.value as ImportType)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="leads">Leads</option>
                    <option value="contacts">Contacts</option>
                    <option value="accounts">Accounts</option>
                    <option value="deals">Deals</option>
                  </select>
                </div>
                
                <div 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                    isDragging 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                      : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <IconUpload className="w-8 h-8 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Click to upload or drag and drop
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Supported formats: CSV, XLSX (Max 10MB)
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    Browse Files
                  </button>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm flex gap-3">
                  <IconFileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Upload Template</p>
                    <p>Download our sample CSV template to ensure your data is formatted correctly before importing.</p>
                    <button className="mt-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">Download Template</button>
                  </div>
                </div>
              </div>
            )}

            {importStep === 'mapping' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                   <div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">Map your columns</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Match the columns from your uploaded file to NovaCRM fields.</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">File: {selectedFile?.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{sourceColumns.length} columns detected</p>
                   </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                   <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-500 dark:text-slate-400">
                      <div>File Column Header</div>
                      <div>NovaCRM Field</div>
                   </div>
                   <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
                      {sourceColumns.map(col => {
                         const mapping = mappings.find(m => m.sourceColumn === col);
                         return (
                           <div key={col} className="grid grid-cols-2 p-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="font-medium text-slate-900 dark:text-white font-mono text-sm pl-2">
                                 {col}
                              </div>
                              <div className="flex items-center gap-2">
                                 <IconArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                 <select 
                                   value={mapping?.targetField || ""}
                                   onChange={(e) => handleMappingChange(col, e.target.value)}
                                   className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                     mapping?.targetField 
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                                      : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                                   }`}
                                 >
                                    <option value="">-- Do Not Import --</option>
                                    {targetFields[importType].map(f => (
                                       <option key={f} value={f}>{f}</option>
                                    ))}
                                 </select>
                              </div>
                           </div>
                         );
                      })}
                   </div>
                </div>
                
                <div className="flex justify-between pt-4">
                   <button onClick={() => setImportStep('upload')} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      Back
                   </button>
                   <button 
                     onClick={handleValidate} 
                     disabled={isProcessing || mappings.length === 0}
                     className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                   >
                     {isProcessing ? 'Validating...' : 'Validate Data'} <IconArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            )}

            {importStep === 'validation' && validationResults && (
              <div className="space-y-8">
                 <div className="text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                       <IconCheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Data Validation Complete</h2>
                    <p className="text-slate-500 dark:text-slate-400">We've scanned your file. Review the summary below before completing the import.</p>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                       <p className="text-sm font-medium text-slate-500 mb-1">Total Rows</p>
                       <p className="text-2xl font-bold text-slate-900 dark:text-white">{validationResults.total}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50 text-center">
                       <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Ready to Import</p>
                       <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{validationResults.valid}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 text-center">
                       <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Duplicates Skipped</p>
                       <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{validationResults.duplicates}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 text-center">
                       <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Invalid Format</p>
                       <p className="text-2xl font-bold text-red-700 dark:text-red-300">{validationResults.errors}</p>
                    </div>
                 </div>

                 <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-xl text-sm text-yellow-800 dark:text-yellow-300">
                    <p className="font-bold flex items-center gap-2 mb-1"><IconAlertTriangle className="w-4 h-4" /> Duplicate Prevention</p>
                    <p>We found {validationResults.duplicates} records that already exist in your system based on Email address. These will be skipped to prevent duplicates. You can change the matching criteria in Settings.</p>
                 </div>

                 <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                   <button onClick={() => setImportStep('mapping')} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      Back
                   </button>
                   <button 
                     onClick={handleImport} 
                     disabled={isProcessing}
                     className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                   >
                     {isProcessing ? 'Importing...' : 'Start Import'}
                   </button>
                </div>
              </div>
            )}

            {importStep === 'complete' && (
              <div className="text-center py-12 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 scale-up">
                   <IconCheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Import Successful!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                  Successfully imported {validationResults?.valid} {importType} into NovaCRM.
                </p>
                <div className="flex justify-center gap-4">
                   <button onClick={resetImport} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                     Import More Data
                   </button>
                   <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors">
                     View {importType}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Export Your Data</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {['Leads', 'Contacts', 'Accounts', 'Opportunities', 'Tasks', 'Notes'].map(type => (
                 <div key={type} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                       <input type="checkbox" className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600" />
                       <span className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{type}</span>
                    </div>
                    <span className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded text-slate-500 shadow-sm">
                       All Records
                    </span>
                 </div>
              ))}
           </div>
           
           <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Export Options</h3>
              <div className="flex flex-col sm:flex-row gap-6">
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Format</label>
                    <div className="flex gap-2">
                       <label className="flex-1 cursor-pointer">
                          <input type="radio" name="format" className="peer sr-only" defaultChecked />
                          <div className="text-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-primary-500 peer-checked:ring-1 peer-checked:ring-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 font-medium text-sm text-slate-700 dark:text-slate-300 transition-all">
                             CSV File (.csv)
                          </div>
                       </label>
                       <label className="flex-1 cursor-pointer">
                          <input type="radio" name="format" className="peer sr-only" />
                          <div className="text-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-primary-500 peer-checked:ring-1 peer-checked:ring-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 font-medium text-sm text-slate-700 dark:text-slate-300 transition-all">
                             Excel File (.xlsx)
                          </div>
                       </label>
                    </div>
                 </div>
                 <div className="flex-1">
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Include</label>
                     <div className="space-y-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                           <input type="checkbox" className="w-4 h-4 rounded text-primary-600" defaultChecked />
                           Visible columns only
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                           <input type="checkbox" className="w-4 h-4 rounded text-primary-600" defaultChecked />
                           Include related tags
                        </label>
                     </div>
                 </div>
              </div>
           </div>
           
           <div className="mt-8 flex justify-end">
              <button 
                onClick={() => {
                  setIsProcessing(true);
                  setTimeout(() => setIsProcessing(false), 2000);
                }}
                disabled={isProcessing}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-primary-500/20"
              >
                {isProcessing ? 'Preparing Download...' : 'Export Selected Data'} <IconDownload className="w-5 h-5" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
