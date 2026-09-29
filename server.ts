import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized successfully on server.");
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI client:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());
  
  // In-memory data store for collaboration state
  const activeUsers = new Map(); // socketId -> { id, name, view, targetId, color }
  const locks = new Map(); // entityId -> { userId, userName }
  const comments = new Map(); // entityId -> Array<{ id, userId, userName, text, timestamp, mentions }>
  
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];

  // Throttlers/Debouncers for real-time messages to support massive user scale (500+ concurrent active socket clients)
  let presenceThrottleTimeout: NodeJS.Timeout | null = null;
  let locksThrottleTimeout: NodeJS.Timeout | null = null;

  const queuePresenceBroadcast = () => {
    if (presenceThrottleTimeout) return;
    presenceThrottleTimeout = setTimeout(() => {
      io.emit("presence_update", Array.from(activeUsers.values()));
      presenceThrottleTimeout = null;
    }, 1200); // Batch multiple rapid updates onto a steady 1.2s schedule
  };

  const queueLocksBroadcast = () => {
    if (locksThrottleTimeout) return;
    locksThrottleTimeout = setTimeout(() => {
      io.emit("locks_update", Object.fromEntries(locks));
      locksThrottleTimeout = null;
    }, 750); // Batch lock/unlock operations
  };

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Initial random generic user if they don't auth properly, but client will send identity
    activeUsers.set(socket.id, {
      id: socket.id,
      name: `User ${Math.floor(Math.random() * 1000)}`,
      view: 'home',
      targetId: null,
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    socket.on("join", (data) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        user.name = data.name || user.name;
        user.email = data.email || null;
      }
      queuePresenceBroadcast();
    });

    socket.on("navigate", (data) => {
      // data: { view: string, targetId?: string }
      const user = activeUsers.get(socket.id);
      if (user) {
        user.view = data.view;
        user.targetId = data.targetId || null;
        queuePresenceBroadcast();
      }
    });

    socket.on("lock_record", (data) => {
      // data: { entityId: string }
      const user = activeUsers.get(socket.id);
      if (user && !locks.has(data.entityId)) {
        locks.set(data.entityId, { userId: user.id, userName: user.name });
        queueLocksBroadcast();
      }
    });

    socket.on("unlock_record", (data) => {
      const user = activeUsers.get(socket.id);
      if (user && locks.get(data.entityId)?.userId === user.id) {
        locks.delete(data.entityId);
        queueLocksBroadcast();
      }
    });

    socket.on("add_comment", (data) => {
      // data: { entityId, text, mentions }
      const user = activeUsers.get(socket.id);
      if (user) {
        const entityComments = comments.get(data.entityId) || [];
        const newComment = {
          id: Math.random().toString(36).substring(7),
          userId: user.id,
          userName: user.name,
          text: data.text,
          mentions: data.mentions || [],
          timestamp: new Date().toISOString()
        };
        entityComments.push(newComment);
        comments.set(data.entityId, entityComments);
        io.emit("comments_update", { entityId: data.entityId, comments: entityComments });
      }
    });
    
    socket.on("get_comments", (data) => {
       const entityComments = comments.get(data.entityId) || [];
       socket.emit("comments_update", { entityId: data.entityId, comments: entityComments });
     });

    socket.on("get_initial_state", () => {
      socket.emit("presence_update", Array.from(activeUsers.values()));
      socket.emit("locks_update", Object.fromEntries(locks));
    });

    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      activeUsers.delete(socket.id);
      
      // Release any locks held by this user
      if (user) {
        let changed = false;
        for (const [entityId, lock] of locks.entries()) {
          if (lock.userId === user.id) {
            locks.delete(entityId);
            changed = true;
          }
        }
        if (changed) {
          queueLocksBroadcast();
        }
      }
      
      queuePresenceBroadcast();
      console.log("Client disconnected:", socket.id);
    });
  });

  // Automated AI Daily Digest summary API endpoint
  app.post("/api/generate-digest", async (req, res) => {
    try {
      const { user, tasks = [], meetings = [], leads = [], config = {} } = req.body;
      
      const {
        summarizeTasks = true,
        summarizeMeetings = true,
        summarizeLeads = true,
        hotLeadThreshold = 80
      } = config;

      // Filter relevant data
      const pendingTasks = tasks.filter((t: any) => t.status !== 'Completed');
      const upcomingMeetings = meetings;
      const hotLeads = leads.filter((l: any) => l.score >= hotLeadThreshold);

      if (!ai) {
        // High-fidelity fallback when Gemini Key is absent
        const subject = `🌅 NovaCRM Daily briefing digest for ${user?.name || 'Partner'} - ${new Date().toLocaleDateString()}`;
        const executiveSummary = `Here is your offline-mode daily synthesized update. You have ${pendingTasks.length} pending tasks, ${upcomingMeetings.length} upcoming meetings, and ${hotLeads.length} hot leads above target threshold. Take immediate action to accelerate your sales pipelines.`;
        
        const tasksSummaryHtml = pendingTasks.map((t: any) => `
          <div style="margin-bottom: 8px; padding: 10px; border-left: 4px solid #ef4444; background-color: #f8fafc; border-radius: 4px;">
            <strong style="color: #0f172a; font-size: 14px;">${t.title}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">Priority: <b>${t.priority}</b> | Due: ${t.dueDate}</span>
          </div>
        `).join('') || '<div style="color: #64748b; font-size: 13px;">No outstanding pending tasks today. Nice job!</div>';

        const meetingsSummaryHtml = upcomingMeetings.map((m: any) => `
          <div style="margin-bottom: 8px; padding: 10px; border-left: 4px solid #3b82f6; background-color: #f8fafc; border-radius: 4px;">
            <strong style="color: #0f172a; font-size: 14px;">${m.title}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">With: ${m.relatedTo} | At: ${m.startTime} - ${m.endTime} (${m.date})</span>
          </div>
        `).join('') || '<div style="color: #64748b; font-size: 13px;">No meetings scheduled for today. Focus on lead generation!</div>';

        const leadsSummaryHtml = hotLeads.map((l: any) => `
          <div style="margin-bottom: 8px; padding: 10px; border-left: 4px solid #10b981; background-color: #f8fafc; border-radius: 4px;">
            <strong style="color: #0f172a; font-size: 14px;">${l.name}</strong> (${l.company})<br/>
            <span style="font-size: 12px; color: #64748b;">Score: <span style="color:#10b981; font-weight:bold;">${l.score}</span> | Value: $${(l.value || l.annualRevenue || 0).toLocaleString()} | Industry: ${l.industry}</span>
          </div>
        `).join('') || '<div style="color: #64748b; font-size: 13px;">No hot leads currently matching threshold of ' + hotLeadThreshold + '.</div>';

        const emailHtml = `
          <div style="font-family: 'Inter', system-ui, Helvetica, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; justify-between; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">🌅 NOVACRM DAILY BRIEF</h2>
            </div>
            
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
              Hello <b>${user?.name || 'Team member'}</b>, here is your synthesized briefing of key opportunities, meetings, and pending items.
            </p>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; tracking: 0.05em; margin-bottom: 12px;">📋 Pending Tasks (${pendingTasks.length})</h3>
              ${tasksSummaryHtml}
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; tracking: 0.05em; margin-bottom: 12px;">📅 Meetings Schedule (${upcomingMeetings.length})</h3>
              ${meetingsSummaryHtml}
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; tracking: 0.05em; margin-bottom: 12px;">🔥 High-Scoring Hot Leads (${hotLeads.length})</h3>
              ${leadsSummaryHtml}
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 100%); border-radius: 12px; border: 1px solid #c7d2fe;">
              <h4 style="color: #312e81; margin: 0 0 6px 0; font-size: 13px; font-weight:700; text-transform:uppercase;">💡 Tactical AI Insight</h4>
              <p style="color: #3730a3; margin: 0; font-size: 13px; line-height: 1.5;">
                Prioritize reaching out to hot leads immediately while preparing status summaries for your upcoming meetings. Keep your high priority tasks clear before the end of working hours.
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px; color: #94a3b8; font-size: 11px;">
              Sent by NovaCRM Automated Digest Service. Configure preferences in System Settings.
            </div>
          </div>
        `;

        return res.json({
          subject,
          executiveSummary,
          tasksSummary: `${pendingTasks.length} pending tasks`,
          meetingsSummary: `${upcomingMeetings.length} meetings`,
          leadsSummary: `${hotLeads.length} hot leads`,
          aiInsights: "Focus on task delivery and reach out to the hot leads above score threshold.",
          html: emailHtml,
          markdown: `### NovaCRM Daily Briefing for ${user?.name || 'Partner'}\n\n${executiveSummary}`,
          generatedAt: new Date().toISOString()
        });
      }

      // Compact representation to save token usages
      const compactTasks = pendingTasks.map((t: any) => ({
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate,
        description: t.description || ""
      })).slice(0, 10);

      const compactMeetings = upcomingMeetings.map((m: any) => ({
        title: m.title,
        date: m.date,
        startTime: m.startTime,
        endTime: m.endTime,
        relatedTo: m.relatedTo
      })).slice(0, 10);

      const compactLeads = hotLeads.map((l: any) => ({
        name: l.name,
        company: l.company,
        score: l.score,
        value: l.value || l.annualRevenue || 0,
        industry: l.industry || "",
        status: l.status
      })).slice(0, 10);

      const systemPrompt = `You are a professional executive pipeline compiler at NovaCRM. 
Your goal is to organize relevant CRM tasking, scheduling, and lead data for user "${user?.name || 'Agent'}" (email: ${user?.email || 'N/A'}) into a highly polished, single-screen responsive daily newsletter-style digest.
The digest should contain:
- Catchy, professional subject line including delivery hour.
- Executive summary of the entire workspace today.
- Summary text for tasks, meetings, and leads respectively.
- Intelligent Sales Team Next Best Action compiled dynamically.
- A fully responsive body HTML representation matching high-end email newsletters. Use premium sans-serif typography, rounded cards with borders, structured colored badge indicators for priority, and neat spacing. Styling must be written inline (e.g. style="..."). Keep it styled elegantly so it renders beautiful previews inside a browser container!`;

      const prompt = `Please build the NovaCRM daily dashboard summary based on this active workspace data:
- Representative: ${JSON.stringify(user)}
- Pending tasks lists: ${JSON.stringify(compactTasks)}
- Active schedule/meetings: ${JSON.stringify(compactMeetings)}
- Target Hot Leads: ${JSON.stringify(compactLeads)}

Format the output strictly as a JSON object with keys:
- subject: Catchy subject title (with emojis).
- executiveSummary: Beautiful text block outlining the outlook for the user today.
- tasksSummary: Concise high-level summary of remaining tasks.
- meetingsSummary: Concise actionable briefing on the day's meetings.
- leadsSummary: Concise high-level advice on Hot Leads to approach first.
- aiInsights: Deeply actionable AI-driven execution instructions.
- emailHtml: Complete styled responsive HTML newsletter body. Make it look beautiful! Use gorgeous indigo accents (#4f46e5), emerald accents (#10b981) for lead scores, and nice light background panels. Ensure clean contrast. Use inline style rules only.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              tasksSummary: { type: Type.STRING },
              meetingsSummary: { type: Type.STRING },
              leadsSummary: { type: Type.STRING },
              aiInsights: { type: Type.STRING },
              emailHtml: { type: Type.STRING }
            },
            required: ["subject", "executiveSummary", "tasksSummary", "meetingsSummary", "leadsSummary", "aiInsights", "emailHtml"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");

      res.json({
        subject: parsed.subject,
        executiveSummary: parsed.executiveSummary,
        tasksSummary: parsed.tasksSummary,
        meetingsSummary: parsed.meetingsSummary,
        leadsSummary: parsed.leadsSummary,
        aiInsights: parsed.aiInsights,
        html: parsed.emailHtml,
        markdown: `### ${parsed.subject}\n\n${parsed.executiveSummary}\n\n**AI Recommendation:** ${parsed.aiInsights}`,
        generatedAt: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("Failed compiling daily digest with Gemini:", error);
      res.status(500).json({ error: "Gemini server failed", message: error.message });
    }
  });

  // API route to get active users suitable for mentions
  app.get("/api/users", (req, res) => {
    res.json(Array.from(activeUsers.values()));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
