import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily / safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Layer 4: Gemini LLM Reflection Endpoint
app.post("/api/gemini/reflect", async (req, res) => {
  try {
    const { agentId, agentRole, energy, belief, isSleeper, recentEvents, neighborsCount } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      // Graceful fallback response when API key is missing
      return res.json({
        success: true,
        fallback: true,
        thought: `[Offline Reflection for Agent #${agentId}]: My current energy is ${Math.round(energy)}% and my belief level is ${(belief * 100).toFixed(1)}%. I must adapt to nearby environmental changes and interact cautiously with ${neighborsCount} neighbors.`,
        strategy: isSleeper ? "Maintain cover and subtly spread doubt." : "Gather resources and align with stable neighbors.",
      });
    }

    const prompt = `You are the reflective consciousness ("soul") of Autonomous Agent #${agentId} in a 2D social simulation world.
Current State:
- Role/Type: ${isSleeper ? "Sleeper Agent (Spreading Strategic Misinformation)" : "Standard Social Agent"}
- Energy Level: ${Math.round(energy)}/100
- Belief Level: ${(belief * 100).toFixed(1)}% (0% = Absolute Safe Truth, 100% = Extreme Misinformation/Panic)
- Nearby Neighbors: ${neighborsCount}
- Recent Memory Log:
${recentEvents.map((e: string) => `- ${e}`).join("\n")}

Provide a brief, compelling 2-3 sentence internal reflection ("thought") and a 1-sentence next action strategy ("strategy") for this agent.
Format output strictly as JSON with keys "thought" and "strategy".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        thought: text,
        strategy: "Observe surroundings and regulate energy.",
      };
    }

    return res.json({
      success: true,
      fallback: false,
      thought: data.thought || "Observing environmental dynamics.",
      strategy: data.strategy || "Seek energy resources.",
    });
  } catch (error: any) {
    console.error("Gemini reflection error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate reflection",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Layered Society Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
