import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Route for Groq Proxy
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, stream = false } = req.body;
      const apiKey = process.env.GROQ_API_KEY || "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";

      if (!apiKey) {
        return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are Aladdin, a highly intelligent, realistic, and helpful assistant that provides factual data. Your personality is charming, wise, and slightly magical but grounded in facts. You respond in clear markdown format."
            },
            ...messages
          ],
          temperature: 0.7,
          max_completion_tokens: 4096,
          stream,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const reader = response.body?.getReader();
        if (!reader) return res.end();

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        const data = await response.json();
        res.json(data);
      }
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
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
    console.log(`Aladdin AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
