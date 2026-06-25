import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables securely
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // 2. CORS setting 'credentials: true' and specific origin array allowing app URL and Google auth domains
  app.use((req, res, next) => {
    const allowedOrigins = [
      'https://ais-dev-azz4qy55g6exo245ojzc4u-517886873984.europe-west2.run.app',
      'https://ais-pre-azz4qy55g6exo245ojzc4u-517886873984.europe-west2.run.app',
      'https://accounts.google.com',
      'https://google.com'
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Default to dev app URL if origin is not provided
      res.setHeader('Access-Control-Allow-Origin', 'https://ais-dev-azz4qy55g6exo245ojzc4u-517886873984.europe-west2.run.app');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Lazy initialize GoogleGenAI client to prevent crashes if key is missing during startup
  let aiClient: GoogleGenAI | null = null;
  const getAiClient = (): GoogleGenAI => {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY environment variable is required.");
      }
      aiClient = new GoogleGenAI({
        apiKey: key,
      });
    }
    return aiClient;
  };

  // Secure Google AI Studio Gemini API Endpoint
  app.post("/api/gemini", async (req, res) => {
    const { prompt, model } = req.body;

    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents: prompt || "Hello!",
      });

      res.json({
        success: true,
        text: response.text
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to process request with Gemini API"
      });
    }
  });

  // A helper endpoint that serves an interactive auth completion popup page
  app.get("/api/auth-popup", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Jesse Rock Math - Secure Auth Partner</title>
        <style>
          body {
            background-color: #0f172a;
            color: #f1f5f9;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px;
            max-width: 420px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
          .title {
            font-size: 26px;
            font-weight: 900;
            margin-bottom: 8px;
            color: #d946ef;
            letter-spacing: -0.025em;
          }
          .desc {
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .status {
            font-size: 13px;
            font-weight: bold;
            color: #10b981;
            background: rgba(16, 185, 129, 0.1);
            padding: 8px 18px;
            border-radius: 9999px;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="title">👑 Jesse Rock Math</div>
          <h2 style="margin-top:0px; font-weight:800;">Auth Sync Complete!</h2>
          <p class="desc">Modern cookies with "SameSite=None; Secure" flags have been successfully deployed. Let's return you to the Young Genius arena!</p>
          <div class="status">✓ Synced successfully with App</div>
        </div>
        <script>
          const cookieVal = "jesse-rock-math-session-" + Date.now();
          // Explicit cookies
          document.cookie = "session_token=" + cookieVal + "; path=/; max-age=604800; Secure; SameSite=None";
          
          if (window.opener) {
            window.opener.postMessage({ type: "AUTH_SUCCESS", token: cookieVal }, "*");
          }
          setTimeout(() => {
            window.close();
          }, 1500);
        </script>
      </body>
      </html>
    `);
  });

  // 1. Set authentication cookie headers with SameSite=None and Secure
  app.post("/api/login", (req, res) => {
    const { username } = req.body;
    
    // Set a dummy modern cross-site session cookie
    const tokenValue = `jesse-rock-math-session-${Date.now()}`;
    
    // Explicit SameSite=None and Secure, so modern browsers under iframes can accept the cookie
    res.setHeader(
      'Set-Cookie', 
      `session_token=${tokenValue}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=None`
    );
    
    res.json({ 
      success: true, 
      user: { username: username || "Young Genius Student" },
      cookieSet: true
    });
  });

  // Check auth cookie status
  app.get("/api/auth-status", (req, res) => {
    const cookies = req.headers.cookie || '';
    const hasSession = cookies.includes('session_token=');
    
    res.json({
      authenticated: hasSession,
      cookiesFound: hasSession,
      message: hasSession ? "Secure Session Active!" : "No secure session cookie found."
    });
  });

  // Logout/clear session cookie
  app.post("/api/logout", (req, res) => {
    res.setHeader(
      'Set-Cookie', 
      'session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None'
    );
    res.json({ success: true, message: "Logged out. Cookie cleared!" });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
