import { Router } from "express";
import {
  askAwraAssistant,
  type AwraAiChatPayload,
} from "../services/aiRequest";

class ValidationError extends Error {}

const router = Router();

const DEFAULT_PROTOCOL: AwraAiChatPayload["context"]["protocol"] = {
  name: "AWRA",
  chain: "Creditcoin",
  lendingModel: "Overcollateralized lending",
  aprModel:
    "Credit-aware APR where borrower quality can influence borrowing rate around asset base APR and APR floor.",
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const firstNonEmptyString = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return null;
};

const asArray = <T>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

router.post("/chat", async (req, res) => {
  try {
    if (!isRecord(req.body)) {
      throw new ValidationError("Request body must be a JSON object.");
    }

    console.log("Received AI chat request:", JSON.stringify(req.body));

    const message = firstNonEmptyString(req.body.message, req.body.question);
    if (!message) {
      throw new ValidationError("message is required and must be a string.");
    }

    const walletRaw = isRecord(req.body.wallet) ? req.body.wallet : {};
    const contextRaw = isRecord(req.body.context) ? req.body.context : {};

    const payload: AwraAiChatPayload = {
      message,
      history: asArray<AwraAiChatPayload["history"][number]>(req.body.history),
      wallet: {
        isConnected: walletRaw.isConnected === true,
        address: firstNonEmptyString(walletRaw.address) ?? null,
      },
      context: {
        suppliedTokens: asArray<
          AwraAiChatPayload["context"]["suppliedTokens"][number]
        >(contextRaw.suppliedTokens),
        borrowedLoans: asArray<
          AwraAiChatPayload["context"]["borrowedLoans"][number]
        >(contextRaw.borrowedLoans),
        supportedTokens: asArray<
          AwraAiChatPayload["context"]["supportedTokens"][number]
        >(contextRaw.supportedTokens),
        protocol: DEFAULT_PROTOCOL,
      },
    };

    const aiResult = await askAwraAssistant(payload);

    console.log("AI chat response:", aiResult);

    return res.status(200).json({
      answer: aiResult.answer,
      model: aiResult.model,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    console.error("AI chat request failed:", error);
    return res.status(500).json({
      message: "Failed to generate AI response.",
    });
  }
});

export default router;
