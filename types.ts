
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Activity {
  id: string;
  type: 'created' | 'stage_change' | 'value_change' | 'probability_change' | 'email_sent' | 'meeting_scheduled' | 'follow_up' | 'update' | 'call' | 'note' | 'task';
  description: string;
  timestamp: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD';

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
  stage: string; // Changed from union type to string to allow dynamic pipelines
  probability: number;
  closeDate: string;
  email?: string;
  phone?: string;
  contactName?: string;
  activities: Activity[];
  aiNextStep?: string; // AI-generated next best action
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

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface NurtureEmail {
  delay: string;
  subject: string;
  body: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: 'Earning' | 'Deduction';
  amount: number;
  currency?: Currency;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  routingNumber: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  payGroupId: string;
  salaryStructure: SalaryComponent[];
  bankDetails: BankDetails;
}

export interface PayGroup {
  id: string;
  name: string;
  nextRun: string;
  frequency: string;
  entity: string;
}

export interface PayrollRun {
  id: string;
  payGroupName: string;
  status: 'Draft' | 'Processing' | 'Completed';
  totalCost: number;
  currency?: Currency;
  periodStart: string;
  periodEnd: string;
}

export type DocumentType = 'Contract' | 'Proposal' | 'Invoice' | 'Quotation' | 'Brief' | 'Report' | 'Other';
export type DocumentStatus = 'Draft' | 'Final' | 'Signed' | 'Pending Review';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  relatedTo: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  archived?: boolean;
  content?: any; // Stores AI-generated JSON structure for templates
  virusScanStatus?: 'Scanning' | 'Clean' | 'Infected';
  version?: number;
  isShared?: boolean;
  cdnUrl?: string;
}

export type VisitStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
export type VisitType = 'Sales' | 'Site Inspection' | 'Service' | 'Delivery' | 'Demo';

export interface Visit {
  id: string;
  title: string;
  relatedTo: string; // Account or Contact Name
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  mapLink?: string; // Google Maps URL
  type: VisitType;
  status: VisitStatus;
  notes?: string;
  outcome?: string;
  assignedTo: string;
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
export type ProjectRisk = 'Low' | 'Medium' | 'High';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  currency?: Currency;
  progress: number; // 0-100
  owner: string;
  description?: string;
  riskLevel?: ProjectRisk;
  riskFactors?: string[];
  nextMilestone?: string;
  client?: string;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Customer' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketType = 'Problem' | 'Question' | 'Feature Request' | 'Billing';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  customerName: string; // Contact or Account Name
  accountId?: string; // Link to Account
  assignedTo: string;
  createdAt: string;
  sentimentScore?: number; // 0-100
  sentimentMood?: string; // e.g. "Frustrated", "Neutral", "Happy"
  aiDraftResponse?: string;
}

// RBAC Types
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
  | 'use_ai_features';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean; // Cannot be deleted
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatar?: string;
  lastLogin?: string;
  status: 'Active' | 'Inactive';
  tempPassword?: string; // For admin generated passwords
  passwordHash?: string; // Stored hash for security
}

// Auth Types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number; // seconds
}
