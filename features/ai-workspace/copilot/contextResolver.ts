import { CopilotContext, CopilotEntityType, CopilotSuggestedAction } from '../../../types/ai';
import { ContextPillItem } from '../../../components/ai/ContextPillGroup';
import { SuggestedChip } from '../../../components/ai/SuggestedActionChips';

export interface ContextResolverParams {
  route?: string;
  viewName: string;
  entityType?: CopilotEntityType;
  entityId?: string;
  entityName?: string;
  entityStage?: string;
  entityScore?: number;
  entityOwner?: string;
  selectedEntityIds?: string[];
  selectedEntityNames?: string[];
  activeFilters?: Record<string, unknown>;
  userName?: string;
  userRole?: string;
  userId?: string;
}

/**
 * Centralized Copilot Context Resolver
 * Builds canonical CopilotContext without copying complete database records into state.
 */
export function resolveCopilotContext(params: ContextResolverParams): CopilotContext {
  const route = params.route || `/${params.viewName || 'dashboard'}`;
  const viewName = params.viewName || 'dashboard';

  return {
    route,
    viewName,
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    entityStage: params.entityStage,
    entityScore: params.entityScore,
    entityOwner: params.entityOwner,
    selectedEntityIds: params.selectedEntityIds?.length ? params.selectedEntityIds : undefined,
    selectedEntityNames: params.selectedEntityNames?.length ? params.selectedEntityNames : undefined,
    activeFilters: params.activeFilters,
    userName: params.userName || 'Alex Chen',
    userRole: params.userRole || 'Sales Manager',
    userContext: {
      userId: params.userId || 'u1',
      userName: params.userName || 'Alex Chen',
      role: params.userRole || 'Sales Manager'
    }
  };
}

/**
 * Returns clean, observable Context Pills for the Copilot UI
 */
export function getContextPills(context: CopilotContext): ContextPillItem[] {
  const pills: ContextPillItem[] = [];

  // 1. View / Route pill
  if (context.viewName) {
    pills.push({
      id: 'view_pill',
      type: 'general',
      label: 'View',
      value: context.viewName.replace(/_/g, ' ').toUpperCase()
    });
  }

  // 2. Multi-Select pill
  if (context.selectedEntityIds && context.selectedEntityIds.length > 1) {
    const count = context.selectedEntityIds.length;
    const typeLabel = context.entityType ? `${context.entityType}s` : 'Records';
    pills.push({
      id: 'multi_select_pill',
      type: (context.entityType as any) || 'general',
      label: 'Selected',
      value: `${count} ${typeLabel}`
    });
    return pills;
  }

  // 3. Single Entity pill
  if (context.entityName && context.entityType) {
    pills.push({
      id: 'entity_pill',
      type: (context.entityType as any) || 'general',
      label: context.entityType.toUpperCase(),
      value: context.entityName
    });

    if (context.entityStage) {
      pills.push({
        id: 'stage_pill',
        type: 'deal',
        label: 'Stage',
        value: context.entityStage
      });
    }

    if (context.entityScore !== undefined) {
      pills.push({
        id: 'score_pill',
        type: 'lead',
        label: 'Score',
        value: `${context.entityScore}/100`
      });
    }

    if (context.entityOwner) {
      pills.push({
        id: 'owner_pill',
        type: 'general',
        label: 'Owner',
        value: context.entityOwner
      });
    }
  }

  return pills;
}

/**
 * Generates Context-Aware Suggested Action Chips
 */
export function getSuggestedActionsForContext(context: CopilotContext): SuggestedChip[] {
  const isMulti = context.selectedEntityIds && context.selectedEntityIds.length > 1;
  const count = context.selectedEntityIds?.length || 0;
  const entityName = context.entityName || 'this record';

  // 1. Multi-Select Context
  if (isMulti) {
    return [
      {
        id: 'multi_triage',
        label: `📊 Triage ${count} Selected Records`,
        prompt: `Analyze the ${count} selected records and summarize top risk factors and stalled deals`,
        iconType: 'risk',
        badge: `${count} Selected`
      },
      {
        id: 'multi_outreach',
        label: `✨ Stage Batch Outreach (${count})`,
        prompt: `Prepare individualized follow-up outreach drafts for the ${count} selected records`,
        iconType: 'mail'
      },
      {
        id: 'multi_tasks',
        label: `⚡ Create Follow-up Tasks`,
        prompt: `Assign priority follow-up tasks for all ${count} selected records for this week`,
        iconType: 'task'
      }
    ];
  }

  // 2. Lead Context
  if (context.entityType === 'lead') {
    return [
      {
        id: 'lead_diag',
        label: `🔍 Why hasn't ${entityName} progressed?`,
        prompt: `Analyze why ${entityName} hasn't progressed and recommend immediate next steps`,
        iconType: 'risk'
      },
      {
        id: 'lead_outreach',
        label: `✨ Prepare Follow-up Draft`,
        prompt: `Draft personalized executive follow-up outreach for ${entityName}`,
        iconType: 'mail'
      },
      {
        id: 'lead_score',
        label: `📊 Break Down Lead Score (${context.entityScore ?? 50}/100)`,
        prompt: `Explain qualification score breakdown and criteria for ${entityName}`,
        iconType: 'sparkles'
      },
      {
        id: 'lead_task',
        label: `⚡ Assign Next Action Task`,
        prompt: `Create priority follow-up task for ${entityName}`,
        iconType: 'task'
      }
    ];
  }

  // 3. Opportunity / Deal Context
  if (context.entityType === 'deal' || context.entityType === 'opportunity') {
    return [
      {
        id: 'deal_risk',
        label: `⚠️ Explain Deal Risk & Stagnation`,
        prompt: `Assess deal risk velocity and stage duration for ${entityName}`,
        iconType: 'risk'
      },
      {
        id: 'deal_sponsor',
        label: `📝 Executive Sponsor Briefing`,
        prompt: `Prepare 1-page executive sponsor briefing memo for ${entityName}`,
        iconType: 'sparkles'
      },
      {
        id: 'deal_meeting',
        label: `📅 Schedule Alignment Sync`,
        prompt: `Draft calendar invitation and agenda points for ${entityName}`,
        iconType: 'calendar'
      }
    ];
  }

  // 4. Account Context
  if (context.entityType === 'account') {
    return [
      {
        id: 'acc_dossier',
        label: `🏢 Customer Intelligence Briefing`,
        prompt: `Generate executive account dossier and expansion signals for ${entityName}`,
        iconType: 'sparkles'
      },
      {
        id: 'acc_risks',
        label: `⚠️ Identify Churn & Support Risks`,
        prompt: `Check recent ticket activity and satisfaction risks for ${entityName}`,
        iconType: 'risk'
      },
      {
        id: 'acc_renewal',
        label: `📅 Prepare Renewal Agenda`,
        prompt: `Draft renewal strategy and agenda points for ${entityName}`,
        iconType: 'calendar'
      }
    ];
  }

  // 5. Contact Context
  if (context.entityType === 'contact') {
    return [
      {
        id: 'cnt_summary',
        label: `👤 Summarize Contact Engagement`,
        prompt: `Summarize interaction history and key touchpoints for ${entityName}`,
        iconType: 'sparkles'
      },
      {
        id: 'cnt_followup',
        label: `✨ Draft Personalized Check-in`,
        prompt: `Draft a personalized check-in message for ${entityName}`,
        iconType: 'mail'
      }
    ];
  }

  // 6. Meeting Context
  if (context.entityType === 'meeting') {
    return [
      {
        id: 'meet_pre',
        label: `📅 Prepare Pre-Meeting Briefing`,
        prompt: `Compile pre-meeting brief and attendee talking points for ${entityName}`,
        iconType: 'calendar'
      },
      {
        id: 'meet_post',
        label: `📝 Generate Follow-up Agenda`,
        prompt: `Draft post-meeting follow-up template and action items for ${entityName}`,
        iconType: 'task'
      }
    ];
  }

  // 7. Task Context
  if (context.entityType === 'task') {
    return [
      {
        id: 'task_exec',
        label: `⚡ Recommend Execution Strategy`,
        prompt: `Provide actionable steps and talking points to complete task "${entityName}"`,
        iconType: 'task'
      }
    ];
  }

  // 8. General / Dashboard View Context
  if (context.viewName === 'pipeline') {
    return [
      {
        id: 'pipe_risk',
        label: `🚨 Scan Stalled Opportunities (>30D)`,
        prompt: `Identify all deals stalled in stage for over 30 days and provide recovery actions`,
        iconType: 'risk'
      },
      {
        id: 'pipe_pacing',
        label: `📊 Forecast vs Quota Analysis`,
        prompt: `Provide pipeline conversion breakdown and quarterly quota pacing summary`,
        iconType: 'sparkles'
      },
      {
        id: 'pipe_approvals',
        label: `⚡ Review Pending Approvals`,
        prompt: `Summarize pending Human-in-the-Loop approvals requiring decision`,
        iconType: 'zap'
      }
    ];
  }

  if (context.viewName === 'leads') {
    return [
      {
        id: 'leads_stale',
        label: `🚨 Scan Inactive Leads (>7D)`,
        prompt: `Identify all qualified leads without outreach in 7 days and recommend recovery steps`,
        iconType: 'risk'
      },
      {
        id: 'leads_top',
        label: `⭐ Prioritize Top 5 Hot Leads`,
        prompt: `Analyze all open leads and rank the top 5 with highest win probability`,
        iconType: 'sparkles'
      },
      {
        id: 'leads_batch',
        label: `✨ Stage Re-engagement Campaign`,
        prompt: `Prepare batch follow-up strategy for stagnant tier-1 leads`,
        iconType: 'mail'
      }
    ];
  }

  // Default Dashboard
  return [
    {
      id: 'dash_stale',
      label: `🚨 Scan Stale Pipeline (>7D)`,
      prompt: 'Identify all qualified leads without outreach in 7 days and recommend recovery steps',
      iconType: 'risk'
    },
    {
      id: 'dash_approvals',
      label: `⚡ Review Pending Approvals`,
      prompt: 'Summarize the pending Human-in-the-Loop approvals requiring my decision',
      iconType: 'zap'
    },
    {
      id: 'dash_pacing',
      label: `📊 Executive Revenue Pacing Briefing`,
      prompt: 'Provide a 3-bullet executive briefing on current quarter pacing and top at-risk deals',
      iconType: 'sparkles'
    }
  ];
}
