
import { Lead, Deal, LeadStatus, EmailTemplate, Task, Meeting, Contact, Account, Call, Campaign, Document, Visit, Project, Ticket, User } from './types';

// Helper to generate dynamic dates
const getDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

const getIsoDate = (daysOffset: number) => getDate(daysOffset).toISOString();
const getDateString = (daysOffset: number) => getDate(daysOffset).toISOString().split('T')[0];

// Hash of "password123" for demo purposes
const DEMO_HASH = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Chen', email: 'alex.chen@novacrm.io', roleId: 'admin', status: 'Active', lastLogin: 'Just now', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', passwordHash: DEMO_HASH },
  { id: 'u2', name: 'Sarah Connor', email: 'sarah@novacrm.io', roleId: 'sales_rep', status: 'Active', lastLogin: '2 hours ago', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', passwordHash: DEMO_HASH },
  { id: 'u3', name: 'Miles Dyson', email: 'miles@novacrm.io', roleId: 'manager', status: 'Active', lastLogin: '1 day ago', passwordHash: DEMO_HASH },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    firstName: 'Sarah',
    lastName: 'Connor',
    company: 'SkyNet Systems',
    email: 'sarah@skynet.com',
    phone: '555-0123',
    status: 'New',
    score: 85,
    industry: 'Technology',
    scoreBreakdown: { fit: 90, engagement: 80, budget: 85 },
    notes: 'High potential lead interested in AI solutions.',
    value: 50000,
    owner: 'Alex Chen',
    leadSource: 'Web Search',
    lastContact: getDateString(-2),
    creationDate: getDateString(-2),
    statusUpdatedAt: getDateString(-2),
    activities: [
        { id: 'a1', type: 'created', description: 'Lead created from Web Form', timestamp: getIsoDate(-2) }
    ]
  },
  {
    id: '2',
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    company: 'Acme Corp',
    email: 'john@acme.com',
    phone: '555-0124',
    status: 'Contacted',
    score: 60,
    industry: 'Manufacturing',
    scoreBreakdown: { fit: 60, engagement: 50, budget: 70 },
    notes: 'Contacted via phone, needs follow up.',
    value: 20000,
    owner: 'Alex Chen',
    leadSource: 'Cold Call',
    lastContact: getDateString(-5),
    creationDate: getDateString(-110),
    statusUpdatedAt: getDateString(-110),
    activities: [
        { id: 'a2', type: 'call', description: 'Initial discovery call', timestamp: getIsoDate(-5) }
    ]
  },
  {
    id: '3',
    name: 'Emily Blunt',
    firstName: 'Emily',
    lastName: 'Blunt',
    company: 'Edge of Tomorrow Inc',
    email: 'emily@edge.com',
    phone: '555-0125',
    status: 'Qualified',
    score: 92,
    industry: 'Entertainment',
    scoreBreakdown: { fit: 95, engagement: 90, budget: 90 },
    notes: 'Ready for proposal.',
    value: 120000,
    owner: 'Alex Chen',
    leadSource: 'Referral',
    lastContact: getDateString(-10),
    creationDate: getDateString(-10),
    statusUpdatedAt: getDateString(-10),
    activities: [
        { id: 'a3', type: 'created', description: 'Referred by existing client', timestamp: getIsoDate(-10) }
    ]
  },
  {
    id: '4',
    name: 'James Bond',
    firstName: 'James',
    lastName: 'Bond',
    company: 'MI6 Solutions',
    email: '007@mi6.gov.uk',
    phone: '555-0007',
    status: 'New',
    score: 45,
    industry: 'Government',
    scoreBreakdown: { fit: 40, engagement: 30, budget: 90 },
    notes: 'Needs high security clearance features.',
    value: 500000,
    owner: 'Alex Chen',
    leadSource: 'Trade Show',
    lastContact: getDateString(-1),
    creationDate: getDateString(-1),
    statusUpdatedAt: getDateString(-1),
    activities: [
        { id: 'a4', type: 'created', description: 'Met at CyberSec Con', timestamp: getIsoDate(-1) }
    ]
  },
  {
    id: '5',
    name: 'Ellen Ripley',
    firstName: 'Ellen',
    lastName: 'Ripley',
    company: 'Weyland-Yutani',
    email: 'ripley@weyland.com',
    phone: '555-1979',
    status: 'Contacted',
    score: 78,
    industry: 'Logistics',
    scoreBreakdown: { fit: 80, engagement: 70, budget: 85 },
    notes: 'Interested in fleet tracking.',
    value: 85000,
    owner: 'Alex Chen',
    leadSource: 'Web Download',
    lastContact: getDateString(-3),
    creationDate: getDateString(-3),
    statusUpdatedAt: getDateString(-3),
    activities: [
        { id: 'a5', type: 'email_sent', description: 'Sent whitepaper', timestamp: getIsoDate(-3) }
    ]
  }
];

export const MOCK_DEALS: Deal[] = [
  {
    id: 'd1',
    title: 'Enterprise License Deal',
    company: 'Cyberdyne Systems',
    value: 150000,
    stage: 'Negotiation/Review',
    probability: 80,
    closeDate: getDateString(15), // Closing in 15 days
    email: 'miles@cyberdyne.com',
    phone: '555-0199',
    activities: [
        { id: 'da1', type: 'stage_change', description: 'Moved to Negotiation', timestamp: getIsoDate(-2) }
    ]
  },
  {
    id: 'd2',
    title: 'Q4 Marketing Audit',
    company: 'Globex Corp',
    value: 45000,
    stage: 'Proposal/Price Quote',
    probability: 60,
    closeDate: getDateString(7), // Closing in 7 days
    email: 'hank@globex.com',
    activities: [
        { id: 'da2', type: 'value_change', description: 'Increased value to 45k', timestamp: getIsoDate(-5) }
    ]
  },
  {
    id: 'd3',
    title: 'Cloud Migration',
    company: 'Soylent Corp',
    value: 200000,
    stage: 'Value Proposition',
    probability: 40,
    closeDate: getDateString(45), // Closing in 1.5 months
    email: 'green@soylent.com',
    activities: []
  },
  {
    id: 'd4',
    title: 'Security Infrastructure',
    company: 'Umbrella Corp',
    value: 350000,
    stage: 'Closed Won',
    probability: 100,
    closeDate: getDateString(-5), // Closed 5 days ago (Won)
    email: 'wesker@umbrella.com',
    activities: [
        { id: 'da3', type: 'stage_change', description: 'Closed Won', timestamp: getIsoDate(-5) }
    ]
  },
  {
    id: 'd5',
    title: 'Employee Training Program',
    company: 'Initech',
    value: 15000,
    stage: 'Closed Won',
    probability: 100,
    closeDate: getDateString(-12), // Closed 12 days ago (Won)
    email: 'lumbergh@initech.com',
    activities: [
        { id: 'da4', type: 'stage_change', description: 'Closed Won', timestamp: getIsoDate(-12) }
    ]
  }
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Call Sarah Connor', dueDate: getDateString(1), status: 'Not Started', priority: 'High', relatedTo: 'Sarah Connor' },
  { id: 't2', title: 'Prepare proposal for Globex', dueDate: getDateString(2), status: 'In Progress', priority: 'Normal', relatedTo: 'Globex Corp' },
  { id: 't3', title: 'Email campaign review', dueDate: getDateString(-1), status: 'Not Started', priority: 'Low', relatedTo: 'Marketing' },
  { id: 't4', title: 'Follow up with Umbrella Corp', dueDate: getDateString(0), status: 'Completed', priority: 'High', relatedTo: 'Umbrella Corp' }
];

export const MOCK_MEETINGS: Meeting[] = [
  { id: 'm1', title: 'Demo with Cyberdyne', date: getDateString(1), startTime: '10:00', endTime: '11:00', type: 'Online', relatedTo: 'Cyberdyne Systems' },
  { id: 'm2', title: 'Lunch with John', date: getDateString(2), startTime: '12:30', endTime: '13:30', type: 'Offline', relatedTo: 'John Smith' },
  { id: 'm3', title: 'Strategy Sync', date: getDateString(0), startTime: '15:00', endTime: '16:00', type: 'Online', relatedTo: 'Internal' }
];

export const MOCK_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Sarah Connor', firstName: 'Sarah', lastName: 'Connor', email: 'sarah@skynet.com', phone: '555-0123', company: 'SkyNet Systems', title: 'CTO', status: 'Active', owner: 'Alex Chen' },
  { id: 'c2', name: 'Miles Dyson', firstName: 'Miles', lastName: 'Dyson', email: 'miles@cyberdyne.com', phone: '555-0199', company: 'Cyberdyne Systems', title: 'Director', status: 'Active', owner: 'Alex Chen' },
  { id: 'c3', name: 'Ellen Ripley', firstName: 'Ellen', lastName: 'Ripley', email: 'ripley@weyland.com', phone: '555-1979', company: 'Weyland-Yutani', title: 'Operations Lead', status: 'New', owner: 'Alex Chen' }
];

export const MOCK_ACCOUNTS: Account[] = [
  { id: 'a1', name: 'SkyNet Systems', industry: 'Technology', website: 'www.skynet.com', phone: '555-1000', address: '123 Tech Blvd, San Francisco, CA', owner: 'Alex Chen', primaryContact: 'Sarah Connor', lastActivity: getDateString(-2) },
  { id: 'a2', name: 'Cyberdyne Systems', industry: 'Defense', website: 'www.cyberdyne.com', phone: '555-2000', address: '456 Defense Way, Arlington, VA', owner: 'Alex Chen', primaryContact: 'Miles Dyson', lastActivity: getDateString(-1) },
  { id: 'a3', name: 'Umbrella Corp', industry: 'Biotech', website: 'www.umbrella.com', phone: '555-3000', address: '789 Hive Ln, Raccoon City', owner: 'Sarah Connor', primaryContact: 'Albert Wesker', lastActivity: getDateString(-5) },
  { id: 'a4', name: 'Initech', industry: 'Software', website: 'www.initech.com', phone: '555-4000', address: '101 Office Park, Houston, TX', owner: 'Alex Chen', primaryContact: 'Peter Gibbons', lastActivity: getDateString(-12) }
];

export const MOCK_CALLS: Call[] = [
  { id: 'cl1', subject: 'Intro call', relatedTo: 'Sarah Connor', type: 'Outbound', outcome: 'Connected', date: getIsoDate(-5), notes: 'Discussed requirements.' },
  { id: 'cl2', subject: 'Negotiation', relatedTo: 'Miles Dyson', type: 'Inbound', outcome: 'Connected', date: getIsoDate(-2), notes: 'Price discussion.' }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'cmp1', name: 'Q4 Email Blast', type: 'Email', status: 'Active', startDate: getDateString(-20), endDate: getDateString(10), budget: 5000, actualCost: 2000, expectedRevenue: 50000, leadsGenerated: 150, owner: 'Alex Chen' },
  { id: 'cmp2', name: 'Tech Summit 2024', type: 'Conference', status: 'Planning', startDate: getDateString(30), endDate: getDateString(35), budget: 15000, actualCost: 0, expectedRevenue: 100000, leadsGenerated: 0, owner: 'Sarah Connor' }
];

export const MOCK_TEMPLATES: EmailTemplate[] = [
  { id: 'tpl1', name: 'Intro Email', subject: 'Introducing NovaCRM', body: 'Hi {{name}}, ...' }
];

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'doc1', name: 'Service Agreement v2.pdf', type: 'Contract', status: 'Draft', relatedTo: 'SkyNet Systems', size: '2.4 MB', uploadedBy: 'Alex Chen', uploadedAt: getDateString(-2), version: 1.2, virusScanStatus: 'Clean' },
  { id: 'doc2', name: 'Project Proposal - Q4.docx', type: 'Proposal', status: 'Final', relatedTo: 'Cyberdyne Systems', size: '540 KB', uploadedBy: 'Alex Chen', uploadedAt: getDateString(-5), version: 2.0, virusScanStatus: 'Scanning' },
  { id: 'doc3', name: 'Invoice #1023.pdf', type: 'Invoice', status: 'Pending Review', relatedTo: 'Acme Corp', size: '120 KB', uploadedBy: 'Sarah Connor', uploadedAt: getDateString(-10), version: 1.0, virusScanStatus: 'Clean' },
  { id: 'doc4', name: 'Server Hardware Quote.pdf', type: 'Quotation', status: 'Final', relatedTo: 'Globex Corp', size: '1.1 MB', uploadedBy: 'Alex Chen', uploadedAt: getDateString(-15), version: 1.1, virusScanStatus: 'Infected' },
];

export const MOCK_VISITS: Visit[] = [
    {
        id: 'v1',
        title: 'Site Inspection - HQ',
        relatedTo: 'SkyNet Systems',
        date: getDateString(2),
        startTime: '10:00',
        endTime: '12:00',
        location: '123 Tech Blvd, San Francisco, CA',
        type: 'Site Inspection',
        status: 'Scheduled',
        assignedTo: 'Alex Chen',
        notes: 'Check server room capacity and cooling systems.'
    },
    {
        id: 'v2',
        title: 'Product Demo - Onsite',
        relatedTo: 'Cyberdyne Systems',
        date: getDateString(0),
        startTime: '14:00',
        endTime: '15:30',
        location: '456 Defense Way, Arlington, VA',
        type: 'Demo',
        status: 'In Progress',
        assignedTo: 'Alex Chen',
        notes: 'Demonstrating the new neural net processor.'
    },
    {
        id: 'v3',
        title: 'Quarterly Review',
        relatedTo: 'Acme Corp',
        date: getDateString(-5),
        startTime: '09:00',
        endTime: '10:30',
        location: '789 Industrial Pkwy, Chicago, IL',
        type: 'Sales',
        status: 'Completed',
        assignedTo: 'Sarah Connor',
        notes: 'Discuss renewal terms.'
    }
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'p1',
        name: 'Website Redesign',
        status: 'In Progress',
        startDate: getDateString(-30),
        endDate: getDateString(30),
        budget: 25000,
        spent: 12000,
        progress: 45,
        owner: 'Alex Chen',
        client: 'SkyNet Systems',
        description: 'Complete overhaul of the corporate website with new branding.',
        nextMilestone: 'UI Mockups Approval',
        riskLevel: 'Low'
    },
    {
        id: 'p2',
        name: 'CRM Implementation',
        status: 'Planning',
        startDate: getDateString(15),
        endDate: getDateString(105),
        budget: 50000,
        spent: 0,
        progress: 0,
        owner: 'Alex Chen',
        client: 'Acme Corp',
        description: 'Migration from legacy systems to NovaCRM.',
        riskLevel: 'Medium'
    },
    {
        id: 'p3',
        name: 'Mobile App Launch',
        status: 'On Hold',
        startDate: getDateString(-60),
        endDate: getDateString(-5),
        budget: 75000,
        spent: 60000,
        progress: 75,
        owner: 'Sarah Connor',
        client: 'Globex Corp',
        description: 'Launch of the new customer loyalty app.',
        riskLevel: 'High',
        riskFactors: ['Budget overrun', 'Key developer unavailable']
    },
    {
        id: 'p4',
        name: 'AI Integration',
        status: 'Planning',
        startDate: getDateString(0),
        endDate: getDateString(90),
        budget: 100000,
        spent: 5000,
        progress: 5,
        owner: 'Miles Dyson',
        client: 'Internal',
        description: 'Integration of generative AI capabilities into the core CRM platform to automate workflows, enhance lead scoring, and provide predictive analytics for customer data.',
        nextMilestone: 'Model Selection & Benchmarking',
        riskLevel: 'Medium',
        riskFactors: ['Data privacy and compliance (GDPR/CCPA)', 'API latency affecting user experience', 'High inference costs']
    }
];

export const MOCK_TICKETS: Ticket[] = [
    {
        id: 'T-1001',
        subject: 'Login issues on mobile app',
        description: 'I cannot login to the mobile application since the last update. It keeps saying network error even though my wifi is fine.',
        status: 'Open',
        priority: 'High',
        type: 'Problem',
        customerName: 'Sarah Connor',
        assignedTo: 'Alex Chen',
        createdAt: getDateString(-1),
    },
    {
        id: 'T-1002',
        subject: 'Billing question for October',
        description: 'Hi, I noticed a discrepancy in the October invoice. Can you please explain the extra charge?',
        status: 'In Progress',
        priority: 'Medium',
        type: 'Billing',
        customerName: 'Acme Corp',
        assignedTo: 'Sarah Connor',
        createdAt: getDateString(-2),
    },
    {
        id: 'T-1003',
        subject: 'Feature Request: Dark Mode',
        description: 'Would love to see a dark mode option in the dashboard.',
        status: 'Closed',
        priority: 'Low',
        type: 'Feature Request',
        customerName: 'Miles Dyson',
        assignedTo: 'Alex Chen',
        createdAt: getDateString(-10),
    }
];
