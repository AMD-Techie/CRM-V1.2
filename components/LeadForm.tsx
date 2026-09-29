
import React, { useState, useEffect, useRef } from 'react';
import { Lead, LeadStatus, Account, Contact, Currency, User } from '../types';
import { 
  IconUserCircle, 
  IconUser, 
  IconBuilding, 
  IconMail, 
  IconPhone, 
  IconGlobe, 
  IconBriefcase,
  IconSettings,
  IconSearch,
  IconAlertTriangle
} from './Icons';
import { validateEmail, validatePhone, validateUrl, validateNumber, validateRequired, ValidationErrors } from '../lib/validation';

interface LeadFormProps {
  onCancel: () => void;
  onSave: (lead: Lead) => void;
  initialData?: Lead | null;
  accounts?: Account[];
  contacts?: Contact[];
  currentUser?: User;
}

const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];

const LeadForm: React.FC<LeadFormProps> = ({ onCancel, onSave, initialData, accounts = [], contacts = [], currentUser }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    mobile: '',
    fax: '',
    website: '',
    leadSource: '',
    status: 'New',
    industry: '',
    noOfEmployees: 0,
    annualRevenue: 0,
    rating: undefined,
    title: '',
    notes: '',
    creationDate: new Date().toISOString().split('T')[0]
  });

  // Autocomplete State
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);
  
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);

  const [errors, setErrors] = useState<ValidationErrors>({});

  const accountWrapperRef = useRef<HTMLDivElement>(null);
  const contactWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountWrapperRef.current && !accountWrapperRef.current.contains(event.target as Node)) {
        setShowAccountSuggestions(false);
      }
      if (contactWrapperRef.current && !contactWrapperRef.current.contains(event.target as Node)) {
        setShowContactSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountWrapperRef, contactWrapperRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'company') {
        if (value && accounts.length > 0) {
            const matches = accounts.filter(a => a.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredAccounts(matches);
            setShowAccountSuggestions(matches.length > 0);
        } else {
            setShowAccountSuggestions(false);
        }
    }

    // Auto-complete contact search on Name fields if a company is selected (or generically)
    if (name === 'firstName' && contacts.length > 0) {
        // If a company is selected, filter contacts by that company
        let relevantContacts = contacts;
        if (formData.company) {
            const companyContacts = contacts.filter(c => c.company.toLowerCase() === formData.company!.toLowerCase());
            if (companyContacts.length > 0) {
                relevantContacts = companyContacts;
            }
        }
        
        const matches = relevantContacts.filter(c => {
            const firstName = c.firstName || c.name.split(' ')[0];
            return firstName.toLowerCase().includes(value.toLowerCase());
        });

        if (value && matches.length > 0) {
            setFilteredContacts(matches);
            setShowContactSuggestions(true);
        } else {
            setShowContactSuggestions(false);
        }
    }
  };

  const selectAccount = (account: Account) => {
      setFormData(prev => ({
          ...prev,
          company: account.name,
          website: account.website || prev.website,
          phone: account.phone || prev.phone,
          industry: account.industry || prev.industry
      }));
      setShowAccountSuggestions(false);
  };

  const selectContact = (contact: Contact) => {
      const firstName = contact.firstName || contact.name.split(' ')[0];
      const lastName = contact.lastName || contact.name.split(' ').slice(1).join(' ');
      
      setFormData(prev => ({
          ...prev,
          firstName: firstName,
          lastName: lastName,
          email: contact.email || prev.email,
          phone: contact.phone || prev.phone,
          mobile: contact.mobile || prev.mobile,
          title: contact.title || prev.title,
          company: contact.company || prev.company // also set company if not set
      }));
      setShowContactSuggestions(false);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!validateRequired(formData.company)) newErrors.company = 'Company name is required';
    if (!validateRequired(formData.lastName)) newErrors.lastName = 'Last name is required';
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.mobile && !validatePhone(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }
    
    if (formData.website && !validateUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
    }
    
    if (formData.noOfEmployees !== undefined && !validateNumber(formData.noOfEmployees, 0)) {
      newErrors.noOfEmployees = 'Number of employees must be a positive number';
    }
    
    if (formData.annualRevenue !== undefined && !validateNumber(formData.annualRevenue, 0)) {
      newErrors.annualRevenue = 'Annual revenue must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData as Lead);
    }
  };
  
  const isEditMode = !!initialData;

  const inputClasses = (name: string) => `w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border ${errors[name] ? 'border-red-500 dark:border-red-500/50 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:outline-none focus:ring-2 ${errors[name] ? 'focus:ring-red-500/50' : 'focus:ring-primary-500/50'} focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder-slate-400`;
  const labelClasses = "block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5";
  const errorClasses = "text-xs text-red-500 mt-1.5 flex items-center gap-1 animate-fade-in";
  const iconWrapperClasses = "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none";

  const ErrorMessage = ({ name }: { name: string }) => errors[name] ? (
    <p className={errorClasses}>
      <IconAlertTriangle className="w-3 h-3" />
      {errors[name]}
    </p>
  ) : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl h-full flex flex-col overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {isEditMode ? 'Edit Lead' : 'Create Lead'}
          </h1>
          <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline font-medium transition-colors">
            Edit Page Layout
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">Cancel</button>
          {!isEditMode && (
            <button className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">Save and New</button>
          )}
          <button onClick={handleSave} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all">Save</button>
        </div>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-[#0b1120]">
        <div className="max-w-5xl mx-auto p-8 space-y-10">
          
          {/* Top Section: Image & Key Info */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Uploader Placeholder */}
              <div className="flex-shrink-0 group relative">
                <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-500/50">
                  <IconUserCircle className="w-20 h-20 text-slate-300 dark:text-slate-600 group-hover:text-primary-500/30 transition-colors" />
                </div>
                <button className="absolute bottom-1 right-1 p-2 bg-primary-600 rounded-full text-white shadow-lg hover:bg-primary-500 hover:scale-110 transition-all border-2 border-white dark:border-slate-900" title="Upload Photo">
                  <IconSettings className="w-4 h-4" />
                </button>
              </div>

              {/* Basic Fields */}
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="relative">
                    <label className={labelClasses}>Lead Owner</label>
                    <div className="relative">
                        <input value={formData.owner || currentUser?.name || "Unassigned"} readOnly className={`${inputClasses('owner')} bg-slate-100 dark:bg-slate-800/50 cursor-default font-medium text-slate-700 dark:text-slate-300`} />
                        <IconUser className={iconWrapperClasses} />
                    </div>
                 </div>
                 
                 {/* Company Field with Account Autocomplete */}
                 <div className="relative" ref={accountWrapperRef}>
                    <label className={labelClasses}>Company <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input 
                            name="company" 
                            value={formData.company || ''} 
                            onChange={handleInputChange} 
                            onFocus={() => { if(formData.company && accounts.length) setShowAccountSuggestions(true); }}
                            placeholder="Company Name" 
                            className={inputClasses('company')} 
                            autoComplete="off"
                        />
                        <IconBuilding className={iconWrapperClasses} />
                        {showAccountSuggestions && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredAccounts.map(account => (
                                    <div 
                                        key={account.id}
                                        onClick={() => selectAccount(account)}
                                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{account.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{account.industry} &bull; {account.website}</div>
                                        </div>
                                        {account.phone && <IconPhone className="w-3 h-3 text-slate-400" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <ErrorMessage name="company" />
                 </div>

                 {/* First Name Field with Contact Autocomplete */}
                 <div className="relative" ref={contactWrapperRef}>
                    <label className={labelClasses}>First Name</label>
                    <div className="relative">
                      <input 
                          name="firstName" 
                          value={formData.firstName || ''} 
                          onChange={handleInputChange} 
                          onFocus={() => { if(formData.firstName && contacts.length) setShowContactSuggestions(true); }}
                          placeholder="First Name" 
                          className={inputClasses('firstName')} 
                          autoComplete="off"
                      />
                      {showContactSuggestions && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                              {filteredContacts.map(contact => (
                                  <div 
                                      key={contact.id}
                                      onClick={() => selectContact(contact)}
                                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                                  >
                                      <div>
                                          <div className="text-sm font-medium text-slate-900 dark:text-white">{contact.name}</div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400">{contact.title} {contact.company ? `at ${contact.company}` : ''}</div>
                                      </div>
                                      <IconUser className="w-3 h-3 text-slate-400" />
                                  </div>
                              ))}
                          </div>
                      )}
                    </div>
                    <ErrorMessage name="firstName" />
                 </div>

                 <div className="relative">
                    <label className={labelClasses}>Last Name <span className="text-red-500">*</span></label>
                    <input name="lastName" value={formData.lastName || ''} onChange={handleInputChange} placeholder="Last Name" className={inputClasses('lastName')} />
                    <ErrorMessage name="lastName" />
                 </div>
                 <div className="relative">
                    <label className={labelClasses}>Title</label>
                    <div className="relative">
                        <input name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="Job Title" className={inputClasses('title')} />
                        <IconBriefcase className={iconWrapperClasses} />
                    </div>
                    <ErrorMessage name="title" />
                 </div>
                 <div className="relative">
                    <label className={labelClasses}>Email</label>
                    <div className="relative">
                        <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="email@example.com" className={inputClasses('email')} />
                        <IconMail className={iconWrapperClasses} />
                    </div>
                    <ErrorMessage name="email" />
                 </div>
              </div>
            </div>
          </div>

          {/* Detailed Info Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                     <span className="w-1 h-5 bg-primary-500 rounded-full mr-3"></span>
                     Contact Details
                  </h3>
                   <div className="space-y-5">
                    <div className="relative">
                        <label className={labelClasses}>Phone</label>
                        <div className="relative">
                            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="Work Phone" className={inputClasses('phone')} />
                            <IconPhone className={iconWrapperClasses} />
                        </div>
                        <ErrorMessage name="phone" />
                    </div>
                    <div className="relative">
                        <label className={labelClasses}>Mobile</label>
                        <input type="tel" name="mobile" value={formData.mobile || ''} onChange={handleInputChange} placeholder="Mobile Phone" className={inputClasses('mobile')} />
                        <ErrorMessage name="mobile" />
                    </div>
                    <div className="relative">
                        <label className={labelClasses}>Fax</label>
                        <input name="fax" value={formData.fax || ''} onChange={handleInputChange} placeholder="Fax Number" className={inputClasses('fax')} />
                        <ErrorMessage name="fax" />
                    </div>
                    <div className="relative">
                        <label className={labelClasses}>Website</label>
                        <div className="relative">
                            <input type="url" name="website" value={formData.website || ''} onChange={handleInputChange} placeholder="https://example.com" className={inputClasses('website')} />
                            <IconGlobe className={iconWrapperClasses} />
                        </div>
                        <ErrorMessage name="website" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                     <span className="w-1 h-5 bg-blue-500 rounded-full mr-3"></span>
                     Lead Details
                  </h3>
                   <div className="space-y-5">
                    <div className="relative">
                        <label className={labelClasses}>Lead Source</label>
                        <select name="leadSource" value={formData.leadSource || ''} onChange={handleInputChange} className={`${inputClasses('leadSource')} appearance-none cursor-pointer`}>
                            <option value="">-None-</option>
                            <option>Advertisement</option>
                            <option>Cold Call</option>
                            <option>Employee Referral</option>
                            <option>External Referral</option>
                            <option>Online Store</option>
                            <option>Partner</option>
                            <option>Trade Show</option>
                            <option>Web Download</option>
                            <option>Web Search</option>
                            <option>Chat</option>
                        </select>
                        <ErrorMessage name="leadSource" />
                    </div>
                    <div className="relative">
                        <label className={labelClasses}>Lead Status</label>
                        <select name="status" value={formData.status || ''} onChange={handleInputChange} className={`${inputClasses('status')} appearance-none cursor-pointer`}>
                            {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage name="status" />
                    </div>
                    <div className="relative">
                        <label className={labelClasses}>Creation Date</label>
                        <input 
                            type="date" 
                            name="creationDate" 
                            value={formData.creationDate ? (formData.creationDate.includes('T') ? formData.creationDate.split('T')[0] : formData.creationDate) : ''} 
                            onChange={handleInputChange} 
                            className={inputClasses('creationDate')} 
                        />
                        <ErrorMessage name="creationDate" />
                    </div>
                    <div className="relative">
                        <label className={labelClasses}>Industry</label>
                        <select name="industry" value={formData.industry || ''} onChange={handleInputChange} className={`${inputClasses('industry')} appearance-none cursor-pointer`}>
                            <option value="">-None-</option>
                            <option>Technology</option>
                            <option>Financial Services</option>
                            <option>Healthcare</option>
                            <option>Retail</option>
                            <option>Manufacturing</option>
                            <option>Education</option>
                            <option>Consulting</option>
                        </select>
                        <ErrorMessage name="industry" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative">
                            <label className={labelClasses}>No. of Employees</label>
                            <input type="number" name="noOfEmployees" value={formData.noOfEmployees || 0} onChange={handleInputChange} className={inputClasses('noOfEmployees')} />
                            <ErrorMessage name="noOfEmployees" />
                        </div>
                        <div className="relative">
                            <label className={labelClasses}>Annual Revenue</label>
                            <div className="flex gap-2">
                                <select
                                    name="currency"
                                    value={formData.currency || 'USD'}
                                    onChange={handleInputChange}
                                    className="w-24 px-2 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all text-sm"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="INR">INR (₹)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="JPY">JPY (¥)</option>
                                    <option value="CAD">CAD ($)</option>
                                    <option value="AUD">AUD ($)</option>
                                </select>
                                <div className="relative flex-1">
                                    <input type="number" name="annualRevenue" value={formData.annualRevenue || 0} onChange={handleInputChange} className={inputClasses('annualRevenue')} />
                                </div>
                            </div>
                            <ErrorMessage name="annualRevenue" />
                        </div>
                    </div>
                    <div className="relative">
                        <label className={labelClasses}>Rating</label>
                        <select name="rating" value={formData.rating || ''} onChange={handleInputChange} className={`${inputClasses('rating')} appearance-none cursor-pointer`}>
                            <option value="">-None-</option>
                            <option>Acquired</option>
                            <option>Active</option>
                            <option>Market Failed</option>
                            <option>Project Cancelled</option>
                            <option>Shutdown</option>
                        </select>
                        <ErrorMessage name="rating" />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Notes Section - New Addition */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <span className="w-1 h-5 bg-purple-500 rounded-full mr-3"></span>
                Description & Notes
             </h3>
             <div className="relative">
                 <label className={labelClasses}>Notes</label>
                 <textarea 
                    name="notes" 
                    value={formData.notes || ''} 
                    onChange={handleInputChange} 
                    rows={4} 
                    placeholder="Enter any additional notes about this lead..." 
                    className={`${inputClasses('notes')} resize-y min-h-[120px]`} 
                 />
                 <ErrorMessage name="notes" />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadForm;
