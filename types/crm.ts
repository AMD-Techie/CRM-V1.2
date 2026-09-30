export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Activity {
  id: string;
  type: 'created' | 'stage_change' | 'value_change' | 'probability_change' | 'email_sent' | 'meeting_scheduled' | 'follow_up' | 'update' | 'call' | 'note' | 'task';
  description: string;
  timestamp: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD' | 'SAR';

export interface Lead {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  company: string;
  email: string;
  phone: string;
  mobile?: string;
  website?: string;
  leadSource?: string;
  status: LeadStatus;
  industry: string;
  noOfEmployees?: number;
  annualRevenue?: number;
  currency?: Currency;
  rating?: string;
  score: number;
  scoreBreakdown: { fit: number; engagement: number; budget: number };
  value?: number;
  notes?: string;
  title?: string;
  city?: string;
  fax?: string;
  owner?: string;
  lastContact?: string;
  activities?: Activity[];
  creationDate?: string;
  statusUpdatedAt?: string;
}

export interface PlaybookResource {
  title: string;
  type: 'PDF' | 'Video' | 'Article' | 'Template';
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  currency?: Currency;
  stage: string;
  probability: number;
  closeDate: string;
  email?: string;
  phone?: string;
  contactName?: string;
  activities: Activity[];
  aiNextStep?: string;
  aiPlaybook?: {
    actions: string[];
    resources: PlaybookResource[];
  };
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Deferred';
  priority: 'High' | 'Normal' | 'Low';
  relatedTo?: string;
  description?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'Online' | 'Offline';
  relatedTo: string;
}

export type ContactStatus = 'New' | 'Active' | 'Inactive';

export interface Contact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  mobile?: string;
  company: string;
  title: string;
  status?: ContactStatus;
  lastActivity?: string;
  owner?: string;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  owner: string;
  primaryContact?: string;
  lastActivity?: string;
}

export interface Call {
  id: string;
  subject: string;
  relatedTo: string;
  relatedToId?: string;
  type: 'Inbound' | 'Outbound';
  outcome: 'Connected' | 'Left Voicemail' | 'No Answer' | 'Scheduled Follow-up';
  date: string;
  notes: string;
  summary?: string;
}

export type CampaignType = 'Email' | 'Webinar' | 'Conference' | 'Advertisement' | 'Banner Ads' | 'Telemarketing' | 'Public Relations' | 'Partner' | 'Other';
export type CampaignStatus = 'Planning' | 'Active' | 'Completed' | 'Aborted';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  actualCost: number;
  expectedRevenue: number;
  currency?: Currency;
  leadsGenerated: number;
  description?: string;
  targetAudience?: string;
  owner?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export type DocumentType = 'Contract' | 'Proposal' | 'Invoice' | 'Quotation' | 'Brief' | 'Report' | 'Other' | string;
export type DocumentStatus = 'Draft' | 'Final' | 'Pending Review' | 'Archived' | 'Signed' | string;

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  relatedTo?: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  version?: number;
  virusScanStatus?: 'Clean' | 'Infected' | 'Scanning';
  content?: any;
  archived?: boolean;
}

export type VisitType = 'Site Inspection' | 'Demo' | 'Sales' | 'Audit' | 'Follow-up' | 'Service' | 'Delivery' | string;
export type VisitStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | string;

export interface Visit {
  id: string;
  title: string;
  relatedTo: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: VisitType;
  status: VisitStatus;
  assignedTo: string;
  notes?: string;
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  owner: string;
  client: string;
  description?: string;
  nextMilestone?: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskFactors?: string[];
  currency?: Currency;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Waiting on Customer' | 'Resolved' | 'Closed' | string;
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketType = 'Question' | 'Problem' | 'Incident' | 'Feature Request' | 'Billing';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  customerName: string;
  assignedTo: string;
  createdAt: string;
}

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_settings'
  | 'view_leads'
  | 'edit_leads'
  | 'delete_records'
  | 'export_data'
  | 'view_revenue'
  | 'manage_pipeline'
  | 'use_ai_features'
  | 'manage_agents'
  | 'approve_ai_actions'
  | 'manage_knowledge';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  avatar?: string;
  passwordHash?: string;
  tempPassword?: string;
}

export interface Message {
  id: string;
  sender?: string;
  text: string;
  timestamp: string | Date;
  isAI?: boolean;
  role?: 'user' | 'model' | 'assistant';
}

export interface NurtureEmail {
  subject: string;
  body: string;
  delayDays?: number;
  delay?: string | number;
}

export interface AuthResponse {
  user: User;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  baseSalary: number;
  currency: Currency;
  status: string;
  salaryStructure?: SalaryComponent[];
  bankDetails?: BankDetails;
}

export interface PayGroup {
  id: string;
  name: string;
  payFrequency: string;
  currency: Currency;
}

export interface PayrollRun {
  id: string;
  payPeriod: string;
  totalGross: number;
  totalNet: number;
  status: string;
  date: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  amount: number;
  isPercentage: boolean;
  currency?: Currency;
}

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  routingNumber?: string;
  swiftCode?: string;
}
