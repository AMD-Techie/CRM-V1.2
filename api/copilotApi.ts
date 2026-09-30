import { CopilotContext, CopilotMessage, CopilotResponse, AIAction, AIInsight, CopilotSuggestedAction } from '../types/ai';
import { apiClient } from './client';

export const copilotApi = {
  async askCopilot(prompt: string, context: CopilotContext): Promise<CopilotResponse> {
    const p = prompt.toLowerCase();
    const isMultiSelect = (context.selectedEntityIds && context.selectedEntityIds.length > 1) || (context.selectedEntityNames && context.selectedEntityNames.length > 1);
    const count = context.selectedEntityIds?.length || context.selectedEntityNames?.length || 0;

    // 1. MULTI-SELECT CONTEXT
    if (isMultiSelect) {
      const selectedNames = context.selectedEntityNames?.join(', ') || `${count} records`;
      const entityLabel = context.entityType ? `${context.entityType}s` : 'records';

      const response: CopilotResponse = {
        id: `resp_${Date.now()}`,
        type: 'recommendation',
        message: `### Batch Intelligence Dossier (${count} Selected ${entityLabel})\n\nI have evaluated the **${count} selected records**: **${selectedNames}**.\n\n* **Pipeline Distribution**: 2 high-priority accounts, 1 medium-priority, and 1 dormant record (>14 days inactive).\n* **Primary Bottleneck**: Stagnant contact cadence following initial product discovery.\n* **Recommended Strategy**: Stage personalized multi-channel re-engagement check-ins tailored to each account's stated compliance and integration requirements.`,
        insights: [
          {
            id: `ins_multi_${Date.now()}`,
            entityType: 'pipeline',
            entityId: 'batch_selected',
            type: 'velocity_anomaly',
            title: `Batch Cadence Alert: ${count} Selected Records`,
            content: `Average days since last executive touchpoint across these ${count} records is 11.4 days (target is < 5 days).`,
            confidenceScore: 94,
            recommendedAction: {
              label: 'Stage Batch Re-engagement',
              actionType: 'batch_outreach',
              targetId: 'batch_selected'
            },
            createdAt: 'Just now'
          }
        ],
        actions: [
          {
            id: `act_batch_${Date.now()}`,
            agentId: 'agent_sales_followup',
            agentName: 'Sales Follow-up Agent',
            entityType: 'lead',
            entityId: context.selectedEntityIds?.[0] || 'multi',
            entityTitle: `Batch Action (${count} Records)`,
            status: 'prepared',
            headline: `Stage Batch Multi-Channel Follow-ups for ${count} Accounts`,
            rationale: `Automates individualized outreach drafts citing recent discussion points for ${selectedNames}.`,
            payload: {
              actionType: 'create_task',
              recipientName: 'Multiple Account Executives',
              content: `Dispatch verified follow-ups across ${count} selected records.`
            },
            requiresApproval: false,
            createdAt: 'Just now'
          }
        ],
        suggestedActions: [
          { id: 'sug_b1', label: 'Draft Batch WhatsApp Check-ins', actionType: 'batch_whatsapp', prompt: `Prepare individual WhatsApp recovery drafts for ${selectedNames}`, iconType: 'mail' },
          { id: 'sug_b2', label: 'Create Follow-up Tasks', actionType: 'create_tasks', prompt: `Generate follow-up reminder tasks for all ${count} selected records`, iconType: 'task' },
          { id: 'sug_b3', label: 'Enrich Firmographics', actionType: 'enrich_batch', prompt: `Pull latest employee counts and tech signals for ${selectedNames}`, iconType: 'zap' }
        ]
      };

      return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
    }

    // 2. LEAD CONTEXT
    if (context.entityType === 'lead' && context.entityName) {
      const leadName = context.entityName;
      const isStallQuery = p.includes('progress') || p.includes('why') || p.includes('stall') || p.includes('status') || p.includes('summarize');
      const isFollowupQuery = p.includes('follow') || p.includes('email') || p.includes('whatsapp') || p.includes('outreach');
      const isScoreQuery = p.includes('score') || p.includes('fit') || p.includes('qualif');

      if (isFollowupQuery) {
        const response: CopilotResponse = {
          id: `resp_lead_outreach_${Date.now()}`,
          type: 'approval_required',
          requiresApproval: true,
          message: `### Staged Executive Follow-up Draft for **${leadName}**\n\nBased on previous CRM discussion notes regarding enterprise compliance and infrastructure migration, I have prepared a personalized outreach message for your review.`,
          actions: [
            {
              id: `act_lead_wa_${Date.now()}`,
              agentId: 'agent_sales_followup',
              agentName: 'Sales Follow-up Agent',
              entityType: 'lead',
              entityId: context.entityId || '1',
              entityTitle: leadName,
              status: 'approval_required',
              headline: `Send Executive Security & Roadmap Brief to ${leadName}`,
              rationale: `Lead has expressed interest in SOC2 compliance certifications. High deal potential ($50,000+).`,
              payload: {
                actionType: 'send_whatsapp',
                recipientName: leadName,
                recipientContact: '+1 (555) 234-8901',
                content: `Hi ${leadName} team, hope your week is off to a great start! Following up on our AI architecture discussion, we have assembled our ISO/SOC2 security brief and custom deployment milestones for your review. Would you be open for a 15-minute sync this Thursday at 2 PM?`
              },
              requiresApproval: true,
              createdAt: 'Just now'
            }
          ],
          suggestedActions: [
            { id: 'sug_l1', label: 'Modify Draft Message', actionType: 'edit_draft', prompt: `Help me customize the tone of the follow-up draft for ${leadName}`, iconType: 'mail' },
            { id: 'sug_l2', label: 'Schedule Calendar Sync', actionType: 'schedule_meeting', prompt: `Prepare meeting calendar invites for ${leadName}`, iconType: 'calendar' },
            { id: 'sug_l3', label: 'View in Approval Center', actionType: 'navigate_approvals', prompt: `Take me to the AI Approval Center to authorize pending outreach`, iconType: 'zap' }
          ]
        };
        return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
      }

      if (isScoreQuery) {
        const response: CopilotResponse = {
          id: `resp_lead_score_${Date.now()}`,
          type: 'insight',
          message: `### Lead Qualification Analysis: **${leadName}**\n\n* **Overall Score**: **85/100 (Tier 1 High Priority)**\n* **Firmographic Fit (90/100)**: Enterprise account size (250+ employees) matches ideal customer profile.\n* **Engagement Velocity (82/100)**: Rapid initial inquiry response, 2 whitepaper downloads.\n* **Budget Authority (85/100)**: Decision maker identified (CTO/VP level), budget confirmed in discovery notes.`,
          insights: [
            {
              id: `ins_lead_score_${Date.now()}`,
              entityType: 'lead',
              entityId: context.entityId || '1',
              type: 'buying_signal',
              title: 'High Qualification Fit Detected',
              content: `${leadName} exhibits strong commercial alignment and tech modernization intent.`,
              confidenceScore: 92,
              createdAt: 'Just now'
            }
          ],
          suggestedActions: [
            { id: 'sug_ls1', label: 'Prepare Executive Outreach', actionType: 'prepare_outreach', prompt: `Draft personalized executive follow-up for ${leadName}`, iconType: 'mail' },
            { id: 'sug_ls2', label: 'Convert to Opportunity', actionType: 'convert_deal', prompt: `Create qualified Opportunity for ${leadName} with $60k estimated ARR`, iconType: 'zap' }
          ]
        };
        return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
      }

      // Default Lead Status / Stall Analysis
      const response: CopilotResponse = {
        id: `resp_lead_stall_${Date.now()}`,
        type: 'insight',
        message: `### Lead Diagnostic Dossier: **${leadName}**\n\nThis lead has been in **Qualified** status for **9 days without a recorded activity**.\n\n#### Key Diagnosis:\n1. **No Next Activity Scheduled**: Following initial qualification on Sep 20, no calendar demo or discovery follow-up was booked.\n2. **Decision Maker Engagement**: The CTO attended initial discovery but security compliance questions remain unanswered.\n3. **Recommended Immediate Action**: Send the tailored SOC2 security brief and propose a direct 15-minute alignment call.`,
        insights: [
          {
            id: `ins_lead_stall_${Date.now()}`,
            entityType: 'lead',
            entityId: context.entityId || '1',
            type: 'risk_warning',
            title: 'Lead Inactivity Alert (>7 Days)',
            content: `No client interactions recorded for ${leadName} since initial qualification. Fast intervention recommended to prevent drop-off.`,
            confidenceScore: 88,
            recommendedAction: {
              label: 'Draft Recovery Outreach',
              actionType: 'draft_followup',
              targetId: context.entityId || '1'
            },
            createdAt: 'Just now'
          }
        ],
        actions: [
          {
            id: `act_lead_task_${Date.now()}`,
            agentId: 'agent_sales_followup',
            agentName: 'Sales Follow-up Agent',
            entityType: 'lead',
            entityId: context.entityId || '1',
            entityTitle: leadName,
            status: 'prepared',
            headline: `Assign Follow-up Task: Security Review Follow-up for ${leadName}`,
            rationale: 'Ensures rep reaches out before week close.',
            payload: {
              actionType: 'create_task',
              recipientName: 'Account Owner',
              suggestedDate: 'Tomorrow at 10:00 AM',
              content: `Call ${leadName} regarding security compliance sign-off.`
            },
            requiresApproval: false,
            createdAt: 'Just now'
          }
        ],
        suggestedActions: [
          { id: 'sug_lf1', label: 'Prepare Follow-up Draft', actionType: 'prepare_followup', prompt: `Draft personalized follow-up outreach for ${leadName}`, iconType: 'mail' },
          { id: 'sug_lf2', label: 'Assign CRM Task', actionType: 'create_task', prompt: `Create priority task to call ${leadName} tomorrow`, iconType: 'task' },
          { id: 'sug_lf3', label: 'Break Down Qualification Score', actionType: 'score_lead', prompt: `Show qualification breakdown and criteria for ${leadName}`, iconType: 'sparkles' }
        ]
      };
      return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
    }

    // 3. OPPORTUNITY / DEAL CONTEXT
    if (context.entityType === 'deal' && context.entityName) {
      const dealName = context.entityName;
      const response: CopilotResponse = {
        id: `resp_deal_${Date.now()}`,
        type: 'insight',
        message: `### Opportunity Risk & Velocity Radar: **${dealName}**\n\n* **Stage Analysis**: Currently in **Value Proposition** stage (45 days in stage, vs benchmark of 21 days).\n* **Risk Index**: **High Risk (Stagnant Velocity)** due to unconfirmed security sign-off.\n* **Revenue at Stake**: Estimated **$200,000 ARR**.\n* **Recommended Next Step**: Schedule an Executive Sponsor alignment call to unblock procurement evaluation.`,
        insights: [
          {
            id: `ins_deal_${Date.now()}`,
            entityType: 'deal',
            entityId: context.entityId || 'd3',
            type: 'risk_warning',
            title: 'Stalled Opportunity Stage Alert',
            content: `Deal has exceeded typical stage duration by 214%. High probability of slippage without executive intervention.`,
            confidenceScore: 91,
            recommendedAction: {
              label: 'Schedule Executive Re-engagement',
              actionType: 'schedule_meeting',
              targetId: context.entityId || 'd3'
            },
            createdAt: 'Just now'
          }
        ],
        actions: [
          {
            id: `act_deal_stage_${Date.now()}`,
            agentId: 'agent_deal_risk',
            agentName: 'Opportunity Risk Radar',
            entityType: 'deal',
            entityId: context.entityId || 'd3',
            entityTitle: dealName,
            status: 'prepared',
            headline: `Recalibrate Deal Probability & Assign Escalation Task`,
            rationale: 'Adjusts pipeline weighting to reflect realistic current stage momentum.',
            payload: {
              actionType: 'update_stage',
              dataChanges: {
                probability: '25%',
                riskLevel: 'High Risk (Stagnant)'
              }
            },
            requiresApproval: false,
            createdAt: 'Just now'
          }
        ],
        suggestedActions: [
          { id: 'sug_d1', label: 'Explain Deal Stagnation', actionType: 'explain_deal', prompt: `Explain the root causes of velocity drop-off on ${dealName}`, iconType: 'risk' },
          { id: 'sug_d2', label: 'Prepare Executive Briefing', actionType: 'exec_brief', prompt: `Draft 1-page briefing for sponsor call on ${dealName}`, iconType: 'sparkles' },
          { id: 'sug_d3', label: 'Schedule Sponsor Sync', actionType: 'schedule_meeting', prompt: `Draft meeting invite and agenda for ${dealName}`, iconType: 'calendar' }
        ]
      };
      return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
    }

    // 4. ACCOUNT CONTEXT
    if (context.entityType === 'account' && context.entityName) {
      const accountName = context.entityName;
      const response: CopilotResponse = {
        id: `resp_acc_${Date.now()}`,
        type: 'answer',
        message: `### Client Account Intelligence Dossier: **${accountName}**\n\n* **Relationship Status**: Active Enterprise Tier Client (Contract renewal in 84 days).\n* **Recent Velocity**: 3 key contacts engaged across engineering and procurement.\n* **Cross-Sell Opportunity**: Identified expansion interest in Advanced Security and Multi-Region tenancy.\n* **Health Score**: **88/100 (Strong)** with zero open critical support tickets.`,
        insights: [
          {
            id: `ins_acc_${Date.now()}`,
            entityType: 'account',
            entityId: context.entityId || 'a1',
            type: 'buying_signal',
            title: 'Q4 Expansion Opportunity',
            content: `Account usage signals indicate 140% license utilization. High receptivity for volume tier upgrade.`,
            confidenceScore: 89,
            createdAt: 'Just now'
          }
        ],
        suggestedActions: [
          { id: 'sug_a1', label: 'Customer Dossier Memo', actionType: 'account_memo', prompt: `Generate comprehensive executive memo for ${accountName}`, iconType: 'sparkles' },
          { id: 'sug_a2', label: 'Check Open Tickets & Risks', actionType: 'account_risks', prompt: `Check recent support tickets and satisfaction scores for ${accountName}`, iconType: 'risk' },
          { id: 'sug_a3', label: 'Prepare Renewal Agenda', actionType: 'prepare_renewal', prompt: `Draft renewal discussion agenda for ${accountName}`, iconType: 'calendar' }
        ]
      };
      return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
    }

    // 5. CONTACT CONTEXT
    if (context.entityType === 'contact' && context.entityName) {
      const contactName = context.entityName;
      const response: CopilotResponse = {
        id: `resp_cnt_${Date.now()}`,
        type: 'answer',
        message: `### Contact Relationship Dossier: **${contactName}**\n\n* **Engagement History**: 4 total interactions over the past 30 days.\n* **Key Priorities**: Infrastructure reliability, SOC2 compliance, multi-region database replication.\n* **Next Recommended Touchpoint**: Schedule a 15-minute alignment check-in prior to end-of-quarter budget freeze.`,
        insights: [
          {
            id: `ins_cnt_${Date.now()}`,
            entityType: 'contact',
            entityId: context.entityId || 'cnt1',
            type: 'buying_signal',
            title: 'High Engagement Responsiveness',
            content: `${contactName} responds within 2.4 hours to technical follow-up notes.`,
            confidenceScore: 91,
            createdAt: 'Just now'
          }
        ],
        actions: [
          {
            id: `act_cnt_wa_${Date.now()}`,
            agentId: 'agent_sales_followup',
            agentName: 'Sales Follow-up Agent',
            entityType: 'contact',
            entityId: context.entityId || 'cnt1',
            entityTitle: contactName,
            status: 'prepared',
            headline: `Draft Personalized Check-in for ${contactName}`,
            rationale: 'Maintains positive contact cadence following initial technical review.',
            payload: {
              actionType: 'send_email',
              recipientName: contactName,
              content: `Hi ${contactName}, hope your week is going smoothly. Following up on our recent technical discussion, I wanted to see if your team had any questions on the architecture specs we shared. Let me know if a brief sync would be helpful!`
            },
            requiresApproval: false,
            createdAt: 'Just now'
          }
        ],
        suggestedActions: [
          { id: 'sug_c1', label: 'Draft Personalized Email', actionType: 'draft_email', prompt: `Draft check-in email for ${contactName}`, iconType: 'mail' },
          { id: 'sug_c2', label: 'Schedule Alignment Call', actionType: 'schedule_call', prompt: `Prepare meeting calendar invite for ${contactName}`, iconType: 'calendar' }
        ]
      };
      return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
    }

    // 6. TASK CONTEXT
    if (context.entityType === 'task' && context.entityName) {
      const taskName = context.entityName;
      const response: CopilotResponse = {
        id: `resp_tsk_${Date.now()}`,
        type: 'recommendation',
        message: `### Action Plan for Task: **${taskName}**\n\n* **Objective**: Complete scheduled outreach or administrative action efficiently.\n* **Recommended Strategy**:\n  1. Review previous customer communications and CRM activity logs.\n  2. Reference stated timeline and upcoming quarterly renewal milestones.\n  3. Document next follow-up date immediately following execution.`,
        suggestedActions: [
          { id: 'sug_t1', label: 'Draft Task Execution Note', actionType: 'draft_note', prompt: `Draft execution note and talking points for "${taskName}"`, iconType: 'task' },
          { id: 'sug_t2', label: 'Reschedule or Escalate', actionType: 'escalate_task', prompt: `Recommend optimal due date adjustments for "${taskName}"`, iconType: 'risk' }
        ]
      };
      return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
    }

    // 7. MEETING CONTEXT
    if (context.entityType === 'meeting' && context.entityName) {
      const meetingName = context.entityName;
      const response: CopilotResponse = {
        id: `resp_meet_${Date.now()}`,
        type: 'answer',
        message: `### Pre-Meeting Preparation Brief: **${meetingName}**\n\n* **Meeting Goal**: Validate enterprise architecture requirements and align on SLA terms.\n* **Key Attendees**: VP of Technology, Lead Architect, Account Executive.\n* **Talking Points**:\n  1. Review SOC2 ISO compliance roadmap.\n  2. Walk through zero-downtime migration timeline.\n  3. Confirm procurement timeline for Q4 budget sign-off.`,
        actions: [
          {
            id: `act_meet_${Date.now()}`,
            agentId: 'agent_sales_followup',
            agentName: 'Sales Follow-up Agent',
            entityType: 'meeting',
            entityId: context.entityId || 'm1',
            entityTitle: meetingName,
            status: 'prepared',
            headline: `Send Pre-Meeting Agenda to Attendees`,
            rationale: 'Distributes 3-point briefing to attendees 24 hours in advance.',
            payload: {
              actionType: 'send_email',
              content: 'Agenda: Enterprise Architecture Validation & SLA Review'
            },
            requiresApproval: false,
            createdAt: 'Just now'
          }
        ],
        suggestedActions: [
          { id: 'sug_m1', label: 'Generate Follow-up Template', actionType: 'post_meeting', prompt: `Prepare post-meeting action item template for ${meetingName}`, iconType: 'task' },
          { id: 'sug_m2', label: 'Review Past Notes', actionType: 'past_notes', prompt: `Summarize key decisions from the previous meeting with this client`, iconType: 'sparkles' }
        ]
      };
      return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
    }

    // 8. PIPELINE VIEW CONTEXT
    if (context.viewName === 'pipeline') {
      const response: CopilotResponse = {
        id: `resp_pipe_${Date.now()}`,
        type: 'insight',
        message: `### Pipeline Health & Forecast Diagnostic\n\n* **Total Active Pipeline**: **$4.82M across 18 open opportunities**.\n* **Conversion Velocity**: Value Proposition stage is averaging 38 days (benchmark is 24 days).\n* **Opportunity Risk Radar**: Flagged 2 high-value deals with overdue stage milestones.\n* **Recommended Action**: Focus sales coaching on deal slippage prevention in Discovery & Proposal stages.`,
        insights: [
          {
            id: `ins_pipe_vel_${Date.now()}`,
            entityType: 'pipeline',
            entityId: 'global_pipeline',
            type: 'risk_warning',
            title: 'Mid-Funnel Velocity Bottleneck',
            content: 'Deals in Value Proposition stage spend 58% longer than the quarterly target before progressing.',
            confidenceScore: 92,
            recommendedAction: {
              label: 'Review Stalled Opportunities',
              actionType: 'filter_stalled',
              targetId: 'pipeline'
            },
            createdAt: 'Just now'
          }
        ],
        suggestedActions: [
          { id: 'sug_p1', label: 'Scan Stalled Opportunities (>30D)', actionType: 'stalled_deals', prompt: 'Identify all deals stalled in stage for over 30 days and provide recovery actions', iconType: 'risk' },
          { id: 'sug_p2', label: 'Forecast vs Quota Analysis', actionType: 'forecast_pacing', prompt: 'Provide pipeline conversion breakdown and quarterly quota pacing summary', iconType: 'sparkles' },
          { id: 'sug_p3', label: 'Review Pending Approvals', actionType: 'navigate_approvals', prompt: 'Summarize pending Human-in-the-Loop approvals requiring decision', iconType: 'zap' }
        ]
      };
      return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
    }

    // 9. LEADS VIEW CONTEXT
    if (context.viewName === 'leads') {
      const response: CopilotResponse = {
        id: `resp_leads_view_${Date.now()}`,
        type: 'insight',
        message: `### Lead Intelligence Overview\n\n* **Active Leads**: 24 leads currently tracked in CRM.\n* **High Priority (80+ Score)**: 6 leads classified as Tier-1 High Priority.\n* **Inactivity Flag**: 3 leads in Qualified status have not received rep outreach in >7 days.\n* **Autonomous Action**: Prepared follow-up drafts for stagnant leads awaiting rep dispatch.`,
        insights: [
          {
            id: `ins_leads_dormant_${Date.now()}`,
            entityType: 'lead',
            entityId: 'leads_overview',
            type: 'risk_warning',
            title: '3 Inactive Qualified Leads Detected',
            content: 'Opportunities with initial qualification have stalled before demo booking. Immediate intervention recommended.',
            confidenceScore: 89,
            createdAt: 'Just now'
          }
        ],
        suggestedActions: [
          { id: 'sug_lv1', label: 'Scan Inactive Leads (>7D)', actionType: 'stale_leads', prompt: 'Identify all qualified leads without outreach in 7 days and recommend recovery steps', iconType: 'risk' },
          { id: 'sug_lv2', label: 'Prioritize Top 5 Hot Leads', actionType: 'top_leads', prompt: 'Analyze all open leads and rank the top 5 with highest win probability', iconType: 'sparkles' },
          { id: 'sug_lv3', label: 'Stage Batch Re-engagement', actionType: 'batch_reengage', prompt: 'Prepare batch follow-up strategy for stagnant tier-1 leads', iconType: 'mail' }
        ]
      };
      return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
    }

    // 10. DEFAULT / DASHBOARD / GENERAL CONTEXT
    const response: CopilotResponse = {
      id: `resp_dash_${Date.now()}`,
      type: 'answer',
      message: `### Nova CRM Executive Copilot Summary\n\nAll workspace pipelines are active and monitored by 4 autonomous agents.\n\n* **Pipeline Health**: **$4.82M total pipeline value** (+14.2% pacing vs quarterly quota).\n* **Pending Human Governance**: **3 approval items** currently awaiting rep review in the AI Approval Center.\n* **Autonomous Sentinel**: Opportunity Risk Radar flagged 1 stagnant deal ($200k) requiring intervention.`,
      insights: [
        {
          id: `ins_dash_pacing_${Date.now()}`,
          entityType: 'pipeline',
          entityId: 'global_pipeline',
          type: 'velocity_anomaly',
          title: 'Quarterly Quota Pacing on Track',
          content: 'Deal velocity in Enterprise segment is running 12% faster than previous quarter average.',
          confidenceScore: 94,
          createdAt: 'Just now'
        }
      ],
      suggestedActions: [
        { id: 'sug_d1', label: 'Scan Stale Pipeline (>7D)', actionType: 'check_stale', prompt: 'Identify all qualified leads without outreach in 7 days and recommend recovery steps', iconType: 'risk' },
        { id: 'sug_d2', label: 'Review Pending Approvals', actionType: 'navigate_approvals', prompt: 'Summarize the 3 pending Human-in-the-Loop approvals requiring my decision', iconType: 'zap' },
        { id: 'sug_d3', label: 'Summarize Team Performance', actionType: 'team_summary', prompt: 'Provide executive breakdown of top performing reps and revenue pace', iconType: 'sparkles' }
      ]
    };

    return apiClient.post<CopilotResponse>('/ai/copilot/chat', { prompt, context }, response);
  }
};
