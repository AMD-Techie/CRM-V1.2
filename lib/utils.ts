import { Currency, Lead } from '../types';

export const formatCurrency = (amount: number | undefined | null, currencyCode: string = 'USD') => {
  if (amount === undefined || amount === null) return '';
  try {
    return new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }
};

export const cn = (...classes: (string | undefined | boolean | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface LeadPriorityResult {
  score: number;
  level: 'Critical' | 'High' | 'Medium' | 'Low';
  breakdown: {
    interaction: number;
    dealSize: number;
    engagement: number;
  };
}

export const calculateLeadPriority = (lead: Lead): LeadPriorityResult => {
  // 1. Recent Interactions Score (Max 30)
  let interactionScore = 0;
  const today = new Date();

  if (lead.lastContact) {
    const contactDate = new Date(lead.lastContact);
    const diffTime = Math.abs(today.getTime() - contactDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      interactionScore += 15;
    } else if (diffDays <= 7) {
      interactionScore += 10;
    } else if (diffDays <= 14) {
      interactionScore += 5;
    } else if (diffDays <= 30) {
      interactionScore += 2;
    }
  }

  // Activities count in last 30 days
  const activeActivitiesCount = (lead.activities || []).filter(act => {
    if (!act.timestamp) return false;
    const actDate = new Date(act.timestamp);
    const diffTime = Math.abs(today.getTime() - actDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  interactionScore += Math.min(activeActivitiesCount * 5, 15); // Capped at 15 points

  // 2. Deal Size Score (Max 35)
  // Scale based on lead.value (priority target) or lead.annualRevenue as backup
  let dealSizeScore = 0;
  const val = lead.value || 0;
  if (val >= 150000) {
    dealSizeScore = 35;
  } else if (val >= 75000) {
    dealSizeScore = 25;
  } else if (val >= 25000) {
    dealSizeScore = 15;
  } else if (val > 0) {
    dealSizeScore = 10;
  }

  // 3. Engagement Level Score (Max 35)
  // Scale engagement (0 - 100) to max 35 points
  const engagementVal = lead.scoreBreakdown?.engagement !== undefined ? lead.scoreBreakdown.engagement : 50;
  const engagementScore = Math.round((engagementVal / 100) * 35);

  const priorityScore = Math.min(Math.round(interactionScore + dealSizeScore + engagementScore), 100);

  // Determine Priority Level
  let priorityLevel: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (priorityScore >= 75) {
    priorityLevel = 'Critical';
  } else if (priorityScore >= 50) {
    priorityLevel = 'High';
  } else if (priorityScore >= 25) {
    priorityLevel = 'Medium';
  }

  return {
    score: priorityScore,
    level: priorityLevel,
    breakdown: {
      interaction: Math.round(interactionScore),
      dealSize: Math.round(dealSizeScore),
      engagement: Math.round(engagementScore),
    }
  };
};

export interface LeadScorePriorityInfo {
  level: 'High' | 'Medium' | 'Low';
  label: 'High' | 'Medium' | 'Low';
  badgeClass: string;
  dotClass: string;
  textClass: string;
}

/**
 * Maps lead score to Priority Level:
 * - High: 80+
 * - Medium: 50-79
 * - Low: <50
 */
export const getLeadPriorityFromScore = (score: number = 0): LeadScorePriorityInfo => {
  if (score >= 80) {
    return {
      level: 'High',
      label: 'High',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40',
      dotClass: 'bg-rose-500',
      textClass: 'text-rose-700 dark:text-rose-400'
    };
  } else if (score >= 50) {
    return {
      level: 'Medium',
      label: 'Medium',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-700 dark:text-amber-400'
    };
  } else {
    return {
      level: 'Low',
      label: 'Low',
      badgeClass: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/50',
      dotClass: 'bg-slate-400',
      textClass: 'text-slate-600 dark:text-slate-400'
    };
  }
};
