import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { decodeAndAnalyzeTx, RawTxInput } from "./src/lib/decoder.ts";
import { DeterministicFacts, AuraExplanation } from "./src/types/index.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Fallback generator if AI service is unreachable (PRD §78 graceful degradation)
function generateFallbackExplanation(facts: DeterministicFacts): AuraExplanation {
  if (facts.isUnlimitedApproval) {
    return {
      summary: `You are granting ${facts.contractName} unlimited permission to spend your ${facts.tokenSymbol || 'tokens'}.`,
      what_is_happening: `The application is requesting an infinite allowance on your ${facts.tokenSymbol || 'token'} balance. Once signed, the smart contract can transfer your funds at any time without further confirmation prompts.`,
      what_user_is_giving: `Full, unlimited authorization over your ${facts.walletAssetBalanceFormatted || 'entire token balance'} (worth ~$${facts.potentialExposureUsd.toLocaleString()}).`,
      potential_impact: `If the contract contains vulnerabilities or turns malicious, up to $${facts.potentialExposureUsd.toLocaleString()} (${facts.walletExposurePercent}% of your active portfolio) could be drained.`,
      risk_explanation: facts.riskSignals.map((s) => `${s.title}: ${s.description}`),
      recommendation: 'LIMIT_APPROVAL',
      recommendation_detail: `Do not approve unlimited access. AURA strongly recommends limiting the approval to the exact amount needed for this interaction (e.g. $500 ${facts.tokenSymbol}).`,
      recommended_limit_amount: '500',
      confidence: 0.96,
      uncertainty: facts.contractVerified ? [] : ['Contract bytecode is unverified on the explorer; internal logic cannot be audited.'],
    };
  }

  if (facts.txType === 'NATIVE_TRANSFER' || facts.txType === 'TOKEN_TRANSFER') {
    return {
      summary: `You are sending ${facts.requestedAmountFormatted} to ${facts.contractName}.`,
      what_is_happening: `A direct asset transfer of ${facts.requestedAmountFormatted} will be transferred from your wallet to recipient ${facts.targetAddress}.`,
      what_user_is_giving: `Irreversible transfer of ${facts.requestedAmountFormatted}.`,
      potential_impact: `Your wallet balance will decrease by ${facts.requestedAmountFormatted}. No ongoing permissions are granted.`,
      risk_explanation: facts.riskSignals.map((s) => `${s.title}: ${s.description}`),
      recommendation: facts.riskLevel === 'LOW' ? 'SAFE_TO_PROCEED' : 'PROCEED_WITH_CAUTION',
      recommendation_detail: `Standard transfer. Ensure the recipient address (${facts.targetAddress.slice(0, 8)}...${facts.targetAddress.slice(-6)}) matches your intended destination.`,
      confidence: 0.98,
      uncertainty: [],
    };
  }

  return {
    summary: `Interacting with ${facts.contractName} on ${facts.network}.`,
    what_is_happening: `Executing a smart contract function call to ${facts.targetAddress}.`,
    what_user_is_giving: `Transaction gas fees and execution permissions as defined by the calldata.`,
    potential_impact: `Contract state change with potential exposure of $${facts.potentialExposureUsd.toLocaleString()}.`,
    risk_explanation: facts.riskSignals.map((s) => `${s.title}: ${s.description}`),
    recommendation: facts.riskLevel === 'CRITICAL' ? 'REJECT_TRANSACTION' : facts.riskLevel === 'HIGH' ? 'LIMIT_APPROVAL' : 'SAFE_TO_PROCEED',
    recommendation_detail: `Review the verified risk signals before proceeding with the transaction.`,
    confidence: 0.90,
    uncertainty: ['Complex multi-step contract interaction.'],
  };
}

// API Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "AURA Transaction Intelligence Engine", network: "X Layer / EVM" });
});

// API: Analyze Transaction with Deterministic Engine + Gemini Explanation (PRD §66, §67)
app.post("/api/analyze-transaction", async (req: Request, res: Response) => {
  try {
    const rawInput: RawTxInput = req.body;
    const facts = decodeAndAnalyzeTx(rawInput);

    let explanation: AuraExplanation;

    try {
      if (process.env.GEMINI_API_KEY) {
        const prompt = `You are AURA, an AI transaction intelligence and protection layer for Web3.
Your job is to translate complex blockchain actions into plain, calm, objective, and protective human language.

Here are the authoritative, verified deterministic facts about the transaction:
${JSON.stringify(facts, null, 2)}

CRITICAL SYSTEM INSTRUCTIONS (PRD RULES):
1. Rely STRICTLY on the supplied deterministic facts. NEVER hallucinate or invent token balances, contract owners, or risks.
2. If facts indicate an UNLIMITED approval on a new or unverified contract, clearly advise the user to LIMIT or REJECT the approval.
3. Distinguish FACT, INFERENCE, and UNCERTAINTY.
4. Keep the tone calm, serious, and protective. No crypto hype or alarmist panic.
5. Provide actionable recommendations (e.g. recommend exact safer amount like $500 if unlimited).

Return the response in the specified JSON schema.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are AURA. You turn technical blockchain transactions into plain English explanations and safety recommendations for ordinary users based exclusively on verified facts.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING, description: "One-line clear summary of what the user is about to do" },
                what_is_happening: { type: Type.STRING, description: "Plain English explanation of what this transaction does under the hood" },
                what_user_is_giving: { type: Type.STRING, description: "Exact permissions, allowances, or assets being surrendered" },
                potential_impact: { type: Type.STRING, description: "Worst-case exposure or outcome if contract is compromised" },
                risk_explanation: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of clear bullet points explaining why this is risky or safe based on verified signals",
                },
                recommendation: {
                  type: Type.STRING,
                  enum: ["SAFE_TO_PROCEED", "LIMIT_APPROVAL", "PROCEED_WITH_CAUTION", "REJECT_TRANSACTION"],
                  description: "Primary recommendation category",
                },
                recommendation_detail: { type: Type.STRING, description: "Specific actionable advice (e.g. limit to $500)" },
                recommended_limit_amount: { type: Type.STRING, description: "Suggested limited amount (e.g. 500)" },
                confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" },
                uncertainty: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Any facts AURA cannot verify with 100% certainty (e.g. unverified bytecode)",
                },
              },
              required: ["summary", "what_is_happening", "what_user_is_giving", "potential_impact", "risk_explanation", "recommendation", "recommendation_detail", "confidence", "uncertainty"],
            },
          },
        });

        if (response.text) {
          explanation = JSON.parse(response.text);
        } else {
          explanation = generateFallbackExplanation(facts);
        }
      } else {
        explanation = generateFallbackExplanation(facts);
      }
    } catch (aiErr) {
      console.warn("Gemini API call fallback invoked:", aiErr);
      explanation = generateFallbackExplanation(facts);
    }

    res.json({
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      facts,
      explanation,
    });
  } catch (error: any) {
    console.error("Error analyzing transaction:", error);
    res.status(500).json({ error: error.message || "Failed to analyze transaction" });
  }
});

// API: Ask AURA (PRD §20 "AURA Questions" - interactive grounded Q&A)
app.post("/api/ask-aura", async (req: Request, res: Response) => {
  try {
    const { question, facts } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    let answer = "";

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are AURA, answering an ordinary Web3 user's question about a transaction they are about to sign.
User Question: "${question}"

Authoritative Transaction Facts:
${JSON.stringify(facts || {}, null, 2)}

RULES:
- Answer directly, simply, and truthfully based ONLY on the provided facts.
- Never invent contract details or assets.
- If asked "Can they take my OKB?", check if OKB is the token approved or if only USDT is approved.
- If asked "Why is this risky?", highlight unlimited permissions, new contract age, or unverified source.
- Keep the response to 2-3 short, clear sentences.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are AURA. You answer Web3 security questions clearly and honestly using verified transaction facts.",
          },
        });

        answer = response.text || "AURA verified that this transaction grants specific contract permissions. Please review the recommended limits before signing.";
      } catch (err) {
        console.warn("AI Q&A fallback:", err);
      }
    }

    if (!answer) {
      if (question.toLowerCase().includes("risk") || question.toLowerCase().includes("why")) {
        answer = facts?.isUnlimitedApproval
          ? `This action is risky because it grants unlimited spending permission on your ${facts.tokenSymbol || 'tokens'} to a contract deployed only ${facts.contractAgeDays || 2} day(s) ago with unverified code.`
          : `This transaction has a risk score of ${facts?.riskScore || 10}/100. Always verify the recipient address before signing.`;
      } else if (question.toLowerCase().includes("take") || question.toLowerCase().includes("lose")) {
        answer = facts?.isUnlimitedApproval
          ? `The contract could potentially withdraw up to $${(facts?.potentialExposureUsd || 8420).toLocaleString()} of your ${facts?.tokenSymbol || 'USDT'}. It cannot take other tokens unless you specifically approve them.`
          : `You are only sending ${facts?.requestedAmountFormatted || 'the specified amount'}. No other funds can be touched.`;
      } else {
        answer = `AURA recommends limiting your transaction to the exact required amount rather than approving unlimited access.`;
      }
    }

    res.json({ question, answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to answer question" });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`AURA Intelligence Server running on http://localhost:${PORT}`);
  });
}

startServer();
