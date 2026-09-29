
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Deal, NurtureEmail, LeadStatus, Account, Document, Message, Project, Ticket, Campaign, TicketType, TicketPriority } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to get the currently selected model ID from storage, defaulting to flash
const getModel = () => {
    return localStorage.getItem('nova_ai_model') || "gemini-3-flash-preview";
};

/**
 * Chat with the CRM Assistant.
 * Injects current context (Leads/Deals) and conversation history.
 */
export const chatWithCRM = async (
  currentMessage: string,
  history: Message[], 
  contextData: { leads: Lead[], deals: Deal[] }
): Promise<string> => {
  try {
    const modelId = getModel();
    
    // Construct system instruction with current data context
    const contextString = JSON.stringify({
      leads: contextData.leads.map(l => ({ name: l.name, company: l.company, score: l.score, status: l.status, value: l.value, notes: l.notes })),
      deals: contextData.deals.map(d => ({ title: d.title, company: d.company, value: d.value, stage: d.stage, probability: d.probability })),
      currentTime: new Date().toISOString()
    });

    const systemInstruction = `You are Nova, the AI Assistant for NovaCRM. 
    You are helpful, professional, and concise. 
    You have access to the current CRM data provided below.
    Use this data to answer user questions about revenue, lead status, or prioritization.
    If the user asks for analysis, provide insights based on the scores and values.
    
    Current CRM Data: ${contextString}`;

    // Filter out the initial static greeting to ensure valid API conversation flow (User starts)
    const validHistory = history.filter(m => m.id !== '1' && m.role !== 'model'); 

    // Construct contents array with history
    const contents = validHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: currentMessage }]
    });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I apologize, but I'm having trouble connecting to the AI service right now. Please check your API key.";
  }
};

/**
 * Analyzes a specific lead to provide a score justification and next steps.
 */
export const analyzeLeadWithAI = async (lead: Lead): Promise<string> => {
  try {
    const prompt = `Analyze this sales lead and provide a brief strategic summary.
    Lead Name: ${lead.name}
    Company: ${lead.company}
    Current Score: ${lead.score}
    Potential Value: $${lead.value}
    Notes: ${lead.notes}
    
    Please provide:
    1. A brief assessment of why the score is ${lead.score}.
    2. Recommended next action to close the deal.
    3. Potential risks.
    
    Keep it under 150 words. Format with simple markdown.`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
    });

    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Unable to analyze lead at this moment.";
  }
};

/**
 * Generates the specific Next Best Action for a deal.
 */
export const generateDealNextAction = async (deal: Deal): Promise<string> => {
  try {
    const lastActivity = deal.activities && deal.activities.length > 0 
      ? deal.activities[deal.activities.length - 1].description 
      : 'No recent activity';

    const prompt = `You are an AI Sales Coach. Analyze the following deal and suggest the single most important "Next Best Action" to move it forward.
    
    **Deal Details:**
    - Title: ${deal.title}
    - Company: ${deal.company}
    - Value: $${deal.value}
    - Stage: ${deal.stage}
    - Win Probability: ${deal.probability}%
    - Last Activity: ${lastActivity}
    - Close Date: ${deal.closeDate}

    **Requirements:**
    - Suggest ONE concrete, actionable step (e.g., "Schedule a demo with the CTO", "Send the pricing one-pager").
    - Be specific to the current stage and probability.
    - Keep it under 12 words.
    - Do not use markdown. Just plain text.
    `;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
    });

    return response.text?.trim() || "Review deal details.";
  } catch (error) {
    console.error("Gemini Next Action Error:", error);
    return "Unable to generate action.";
  }
};

/**
 * Generates a sales playbook for a specific deal.
 */
export const generateSalesPlaybook = async (deal: Deal, industry?: string): Promise<{ actions: string[], resources: { title: string, type: string }[] }> => {
  try {
    const prompt = `You are a Sales Enablement Expert. Create a mini-playbook for this specific deal context.

    **Deal Context:**
    - Title: ${deal.title}
    - Stage: ${deal.stage}
    - Value: $${deal.value}
    - Industry: ${industry || 'General Business'}
    
    **Instructions:**
    1. Suggest 3 specific, high-impact **Sales Actions** relevant to the current stage and industry.
    2. Recommend 2 **Resources** (internal or external types) that would help close this deal (e.g., "ROI Calculator", "Case Study on [Topic]").

    **Return JSON:**
    {
      "actions": ["Action 1", "Action 2", "Action 3"],
      "resources": [
        { "title": "Resource Name", "type": "Template" | "PDF" | "Article" }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            resources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ['title', 'type']
              }
            }
          },
          required: ['actions', 'resources']
        }
      }
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty response");
    const jsonStr = text.startsWith("```json") ? text.replace(/```json\n|```/g, "") : text;
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Gemini Playbook Error:", error);
    return {
      actions: ["Review account history", "Schedule stakeholder meeting", "Prepare pricing options"],
      resources: [{ title: "Standard Proposal Template", type: "Template" }]
    };
  }
};

/**
 * Generates an AI-powered email draft for a bulk send.
 */
export const generateAIBulkEmail = async (
  selectedLeads: Lead[],
  tone: 'formal' | 'casual' | 'persuasive',
  templateBody?: string
): Promise<string> => {
  try {
    // Use the first lead as a representative example for the prompt
    const representativeLead = selectedLeads[0];
    const prompt = `You are an expert sales assistant. Your task is to draft a compelling, ${tone} bulk email to be sent to a list of ${selectedLeads.length} sales leads.

**Context:**
Here is a representative lead from the list to give you an idea of the audience:
- Name: ${representativeLead.name}
- Company: ${representativeLead.company}
- Current Status: ${representativeLead.status}
- Notes: ${representativeLead.notes}

**Instructions:**
1.  ${templateBody ? `Use the following template as a starting point, but enhance it with your expertise to make it more effective:\n"""\n${templateBody}\n"""` : 'Write a new email from scratch.'}
2.  The email must be engaging and have a clear call to action that encourages a reply.
3.  **Crucially**, use merge tags \`{{name}}\` for the lead's name and \`{{company}}\` for their company name. This is for a mail merge system. Do not use generic placeholders like "[Lead Name]".
4.  Generate **only the email body**. Do not include a subject line.`;


    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
    });

    return response.text || "AI draft generation failed.";
  } catch (error) {
    console.error("Gemini Bulk Email Error:", error);
    return "Unable to generate AI email draft at this moment.";
  }
};


/**
 * Parses natural language input into filter criteria.
 */
export const generateSmartFilterCriteria = async (query: string): Promise<{filters: any[]}> => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    
    const prompt = `You are an expert at parsing natural language queries into structured JSON filters for a CRM system. Convert the user's query into a JSON filter object.

      Query: "${query}"
      
      **Available Fields & Descriptions:**
      - 'name' (string): Lead's full name.
      - 'company' (string): Company name.
      - 'city' (string): City of the lead.
      - 'industry' (string): Industry sector (e.g., 'Fashion', 'Technology', 'Retail').
      - 'leadSource' (string): How the lead was acquired (e.g., 'Cold Call', 'Advertisement', 'Web Download').
      - 'status' (string): Current stage in the sales funnel. Possible values: 'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'.
      - 'rating' (string): A quality rating. Possible values: 'Acquired', 'Active', 'Market Failed', 'Project Cancelled', 'Shutdown'.
      - 'score' (number): AI-generated score from 0 to 100.
      - 'value' (number): Potential deal value in USD.
      - 'annualRevenue' (number): Company's annual revenue in USD.
      - 'noOfEmployees' (number): Number of employees in the company.
      - 'createdTime' (date string): Date the lead was created, format YYYY-MM-DD.
      
      **Supported Operators:**
      - For text fields: '$eq' (equals, for exact matches), '$contains' (for partial matches).
      - For numeric/date fields: '$gt' (greater than), '$lt' (less than), '$eq' (equals).

      **Important Rules:**
      - Be intelligent in mapping terms. "hot leads" could mean score > 80. "Big companies" could mean annualRevenue > 10000000 or noOfEmployees > 500. Use reasonable defaults.
      - Handle date-related queries like "today", "yesterday", "this week", "last month". Assume today is ${new Date().toISOString().split('T')[0]}.
      - The output MUST be a single, valid JSON object with a key "filters" containing an array of filter objects.
      - Each filter object must have "field", "operator", and "value". The "value" for numeric fields must be a number, not a string.

      **Example Query:** "Show me hot tech leads from New York that we got this week"
      **Example JSON Output:** 
      {
        "filters": [
          {"field": "score", "operator": "$gt", "value": 80},
          {"field": "industry", "operator": "$eq", "value": "Technology"},
          {"field": "city", "operator": "$eq", "value": "New York"},
          {"field": "createdTime", "operator": "$gt", "value": "${startOfWeekStr}"}
        ]
      }
      `;

    // Always use Pro model for complex reasoning like filter parsing
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            filters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING },
                  operator: { type: Type.STRING },
                  value: { 
                    type: Type.STRING, 
                    description: "The value to filter by. Can be a string, number, or date string." 
                  },
                },
                required: ['field', 'operator', 'value']
              }
            }
          },
          required: ['filters']
        }
      }
    });
    
    const text = response.text?.trim();
    if (!text) return { filters: [] };
    const jsonStr = text.startsWith("```json") ? text.replace(/```json\n|```/g, "") : text;
    if (!jsonStr) return { filters: [] };

    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Smart Filter Error:", error);
    return { filters: [] };
  }
};

/**
 * Batch analysis for multiple leads.
 */
export const batchAnalyzeLeads = async (leads: Lead[]): Promise<string> => {
  try {
    const leadsInfo = leads.map(l => `${l.name} (${l.company}) - Score: ${l.score}`).join('\n');
    const prompt = `Analyze this group of leads and suggest a prioritization strategy.
    
    Leads:
    ${leadsInfo}
    
    Provide a bulleted list of high-priority actions.`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
    });

    return response.text || "Batch analysis failed.";
  } catch (error) {
    return "Unable to process batch analysis.";
  }
};

/**
 * Generates a 5-step nurture sequence for a lead.
 */
export const generateNurtureSequence = async (lead: Lead): Promise<NurtureEmail[]> => {
  try {
    const prompt = `Generate a 5-step email nurture sequence for the following sales lead.
    Lead Name: ${lead.name}
    Company: ${lead.company}
    Industry: ${lead.industry}
    AI Score: ${lead.score}
    Status: ${lead.status}
    Notes: ${lead.notes}

    Instructions:
    - The tone should be professional and helpful.
    - The goal is to re-engage the lead and move them to the next stage.
    - Use merge tags {{name}} and {{company}}.
    - The sequence must strictly follow these suggested delays: 
      Step 1: Day 1
      Step 2: Day 3
      Step 3: Day 7
      Step 4: Day 30
      Step 5: Day 90
    `;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              delay: { type: Type.STRING, description: "When to send the email, e.g., 'Day 1'" },
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
            },
            required: ['delay', 'subject', 'body']
          },
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Received empty response from AI for nurture sequence.");
    }
    const jsonStr = text.startsWith("```json") ? text.replace(/```json\n|```/g, "") : text;
    if (!jsonStr) {
      return [];
    }
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Gemini Nurture Sequence Error:", error);
    return [{
        delay: 'Error',
        subject: 'Failed to Generate Sequence',
        body: 'There was an error connecting to the AI service. Please try again later.'
    }];
  }
};

/**
 * Generates follow-up suggestions for a lead.
 */
export const generateFollowUpSuggestions = async (lead: Lead): Promise<string[]> => {
  try {
    const prompt = `Based on the following lead, generate 3 distinct, short, and actionable follow-up email messages.
    
    **Lead Context:**
    - Lead Name: ${lead.name}
    - Company: ${lead.company}
    - Industry: ${lead.industry}
    - **Current Stage**: ${lead.status}
    - **Win Probability**: ${lead.score}/100
    - Notes: ${lead.notes}

    **Instructions:**
    1. Understand the current stage ("${lead.status}") and probability. 
       - If New/Contacted: Focus on value proposition and setting a meeting.
       - If Qualified/Proposal: Focus on addressing objections or closing.
       - If High Score (>70): Be direct and assume interest.
       - If Low Score (<40): Be nurturing and educational.
    2. Generate 3 different options (e.g., one casual check-in, one value-add, one direct question).
    3. Use merge tags {{name}} and {{company}} in the response text.
    4. Keep them under 3 sentences.
    `;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['suggestions']
        }
      }
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Received empty response from AI for suggestions.");
    }
    const jsonStr = text.startsWith("```json") ? text.replace(/```json\n|```/g, "") : text;
    if (!jsonStr) {
      return [];
    }
    const result = JSON.parse(jsonStr);
    return result.suggestions || [];

  } catch (error) {
    console.error("Gemini Follow-up Suggestions Error:", error);
    return ["Could not generate suggestions at this time. Please check the connection."];
  }
};

/**
 * Summarizes call notes using AI.
 */
export const summarizeCallNotes = async (notes: string): Promise<string> => {
  try {
    if (!notes.trim()) {
      return "No notes provided.";
    }
    const prompt = `Summarize the following call notes into a concise, professional paragraph for a CRM log.
    Focus on key outcomes, action items, and customer sentiment.
    
    Notes:
    """
    ${notes}
    """
    
    Summary:`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
    });

    return response.text || "Could not generate a summary.";
  } catch (error) {
    console.error("Gemini Call Summary Error:", error);
    return "AI summary generation failed. Please check your connection or API key.";
  }
};

/**
 * Generates strategic insights for an account.
 */
export const generateAccountInsights = async (account: Account): Promise<string> => {
  try {
    const prompt = `Analyze this key account and provide strategic insights.
    Account Name: ${account.name}
    Industry: ${account.industry}
    Website: ${account.website}
    
    Please provide:
    1. A brief overview of potential challenges in the ${account.industry} industry.
    2. A suggested growth strategy to expand our footprint within this account.
    3. Key talking points for the next quarterly business review.
    
    Keep it professional and concise (under 200 words). Format with markdown.`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
    });

    return response.text || "Insight generation failed.";
  } catch (error) {
    console.error("Gemini Account Insights Error:", error);
    return "Unable to generate account insights at this moment.";
  }
};

/**
 * Finds account location and suggests nearby competitors using Google Maps Grounding.
 */
export const findAccountLocationAndNearby = async (companyName: string, website: string, industry: string): Promise<{ address: string, competitors: string }> => {
  try {
    const prompt = `Locate the headquarters of ${companyName} (${website}) using Google Maps. 
    1. Provide the full street address.
    2. Using Google Maps, find 3-4 nearby companies that are in the "${industry}" sector/industry segment.
    
    Format the output exactly as follows:
    Address: [Full Address]
    
    Nearby Opportunities:
    - [Company Name]: [Distance/Brief details]
    - [Company Name]: [Distance/Brief details]
    `;

    // Note: googleMaps tool is typically available on specific model versions (e.g. gemini-2.5-flash or pro)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || "";
    
    // Simple parsing to extract address and list
    const addressMatch = text.match(/Address:\s*(.*?)(\n|$)/i);
    const address = addressMatch ? addressMatch[1].trim() : "";
    
    // Extract everything after "Nearby Opportunities:"
    const competitorsMatch = text.match(/Nearby Opportunities:([\s\S]*)/i);
    const competitors = competitorsMatch ? competitorsMatch[1].trim() : "";

    return { 
      address: address || "Location not found.", 
      competitors: competitors
    };
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return { address: "", competitors: "Unable to load location data." };
  }
};

/**
 * Generates structured content for a proposal document based on Lead data.
 */
export const generateProposalContent = async (lead: Lead): Promise<any> => {
  try {
    const prompt = `Generate a structured project proposal for a potential client.
    
    **Client Details:**
    - Company: ${lead.company}
    - Industry: ${lead.industry}
    - Contact: ${lead.name}
    - Notes: ${lead.notes || 'Interested in our services.'}
    
    **Return JSON format matching this interface:**
    {
      executiveSummary: string,
      scopeOfWork: string[],
      investmentItems: { description: string, cost: number }[],
      paymentTerms: string
    }`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim();
    if (!text) return {};
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
};

/**
 * Generates structured content for account documents.
 */
export const generateAccountDocumentContent = async (account: Account, type: string): Promise<any> => {
  try {
    const prompt = `Generate structured content for a ${type} document for a client account.
    
    **Client Details:**
    - Company: ${account.name}
    - Industry: ${account.industry}
    
    **Return JSON format matching this interface:**
    {
      executiveSummary: string,
      scopeOfWork: string[], // Optional, include if relevant
      investmentItems: { description: string, cost: number }[], // Optional, include for Quotes/Invoices
      paymentTerms: string
    }`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim();
    if (!text) return {};
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
};

/**
 * Generates marketing content for campaigns.
 */
export const generateCampaignContent = async (name: string, type: string, budget: number, goal: string): Promise<string> => {
  try {
    const prompt = `Generate a creative strategy or email content for a marketing campaign.
    - Name: ${name}
    - Type: ${type}
    - Budget: $${budget}
    - Goal: ${goal}
    
    If type is 'Email', write the email subject and body.
    If type is 'Ad', write the ad copy and headline.
    Otherwise, write a brief strategy outline.`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt
    });

    return response.text || "Content generation failed.";
  } catch (error) {
    return "Error generating content.";
  }
};

/**
 * Generates predictive segments for campaigns.
 */
export const generatePredictiveTargeting = async (name: string, type: string, budget: number): Promise<any[]> => {
  try {
    const prompt = `Generate 3 predictive audience segments for this campaign.
    - Campaign: ${name} (${type})
    - Budget: $${budget}
    
    Return JSON:
    [
      { name: "Segment Name", conversionProbability: "High/Medium", demographics: "Details", behavior: "Details" }
    ]`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim();
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    return [];
  }
};

/**
 * Generates A/B test recommendations.
 */
export const generateABTestRecommendations = async (name: string, type: string, goal: string, currentContent: string): Promise<any[]> => {
  try {
    const prompt = `Suggest 2 A/B tests for this campaign to improve performance.
    - Campaign: ${name} (${type})
    - Goal: ${goal}
    - Current Content Summary: ${currentContent.substring(0, 100)}...
    
    Return JSON:
    [
      { element: "Subject Line/CTA", split: "50/50", variationA: "Current", variationB: "New Idea", hypothesis: "Why B might win" }
    ]`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim();
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    return [];
  }
};

/**
 * Generates campaign performance report.
 */
export const generateCampaignPerformanceReport = async (name: string, type: string, metrics: { leads: number, revenue: number }): Promise<any> => {
  try {
    // Simulated data generation for chart visualization + AI insights
    const prompt = `Analyze the performance of campaign "${name}" (${type}).
    - Leads: ${metrics.leads}
    - Revenue: $${metrics.revenue}
    
    Return JSON with:
    {
      summary: "Executive summary string...",
      recommendations: ["Rec 1", "Rec 2"],
      sentiment: { positive: 65, neutral: 25, negative: 10 },
      dailyEngagement: [ { date: "YYYY-MM-DD", opens: number, clicks: number } ] // Generate 7 days of mock data
    }`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
};

/**
 * Generates a project plan.
 */
export const generateProjectPlan = async (project: Partial<Project>): Promise<any> => {
  try {
    const prompt = `Create a strategic project plan for "${project.name}".
    - Budget: ${project.budget}
    - Status: ${project.status}
    ${project.client ? `- Client: ${project.client}` : ''}
    
    Provide a professional description, identify the immediate next milestone, assess the risk level, and list 3 potential risk factors.`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            nextMilestone: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            riskFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["description", "nextMilestone", "riskLevel", "riskFactors"]
        }
      }
    });

    const text = response.text?.trim();
    if (!text) return {};
    return JSON.parse(text);
  } catch (error) {
    console.error("Project Plan Gen Error:", error);
    return {};
  }
};

/**
 * Assesses project risks.
 */
export const assessProjectRisks = async (project: Project): Promise<string[]> => {
  try {
    const prompt = `Assess risks for project "${project.name}" (Progress: ${project.progress}%, Budget: $${project.budget}).
    Return a JSON array of 3 short risk factor strings.`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text?.trim();
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    return [];
  }
};

/**
 * Generates a weekly status report for a project.
 */
export const generateProjectStatusReport = async (project: Project, completedTasks: number, totalTasks: number): Promise<string> => {
  try {
    const prompt = `Generate a professional weekly status report for the project "${project.name}".
    
    **Project Details:**
    - Status: ${project.status}
    - Progress: ${project.progress}%
    - Budget: $${project.spent} spent of $${project.budget}
    - Risks: ${project.riskFactors?.join(', ') || 'None'}
    - Tasks: ${completedTasks}/${totalTasks} completed
    
    **Format:**
    - Executive Summary
    - Key Achievements
    - Risks & Blockers
    - Next Steps
    
    Keep it concise and format with markdown.`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt
    });

    return response.text || "Report generation failed.";
  } catch (error) {
    return "Error generating report.";
  }
};

/**
 * Analyzes ticket sentiment.
 */
export const analyzeTicketSentiment = async (description: string): Promise<{ score: number, mood: string }> => {
  try {
    const prompt = `Analyze sentiment of this support ticket: "${description}".
    Return JSON: { score: number (0-100, higher is better), mood: string (e.g. Frustrated, Happy) }`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim();
    if (!text) return { score: 50, mood: 'Neutral' };
    return JSON.parse(text);
  } catch (error) {
    return { score: 50, mood: 'Neutral' };
  }
};

/**
 * Generates support response.
 */
export const generateSupportResponse = async (ticket: Ticket): Promise<string> => {
  try {
    const prompt = `Draft a polite, helpful support response for ticket: "${ticket.subject}".
    Context: ${ticket.description}
    Customer: ${ticket.customerName}
    
    Keep it concise and empathetic.`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt
    });

    return response.text || "Draft generation failed.";
  } catch (error) {
    return "Error generating response.";
  }
};

/**
 * Classifies support ticket.
 */
export const classifySupportTicket = async (subject: string, description: string): Promise<{ type: TicketType, priority: TicketPriority, reasoning: string }> => {
  try {
    const prompt = `Classify this ticket.
    Subject: ${subject}
    Body: ${description}
    
    Return JSON:
    {
      type: "Problem" | "Question" | "Feature Request" | "Billing",
      priority: "Low" | "Medium" | "High" | "Urgent",
      reasoning: "Short explanation"
    }`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty");
    return JSON.parse(text);
  } catch (error) {
    return { type: 'Question', priority: 'Medium', reasoning: 'Default classification due to error.' };
  }
};

/**
 * Finds a place (Google Maps).
 */
export const findPlace = async (query: string): Promise<{ address: string, mapLink: string } | null> => {
  try {
    const prompt = `Find the address for "${query}".
    Return JSON: { address: "Full Address", mapLink: "https://maps.google.com/..." }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { 
        tools: [{ googleMaps: {} }],
        responseMimeType: "application/json" 
      }
    });

    const text = response.text?.trim();
    if (!text) return null;
    
    // Sometimes grounding returns text, we try to parse or extract.
    // If strict JSON mode worked:
    try {
        return JSON.parse(text);
    } catch {
        // Fallback extraction
        return null;
    }
  } catch (error) {
    return null;
  }
};
