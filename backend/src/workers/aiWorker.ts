import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../services/db';
import { env } from '../config/env';
import { eventEmitter } from '../modules/realtime/emitter';
import { auditService } from '../modules/audit/audit.service';

// ─── AI Confidence Engine (Google Gemini) ─────────────────────
// Background worker that listens to incident.created events and
// uses Gemini to analyze descriptions for:
//   1. Confidence score (0-1): how likely is this a real incident?
//   2. Keywords: extracted relevant terms
//   3. Suggested category/severity
//
// PII is stripped before sending to the AI.
// Free tier: 15 RPM, 1M tokens/month.
// ──────────────────────────────────────────────────────────────

/**
 * Strip potential PII from text before sending to AI.
 * Removes phone numbers, email addresses, and names after common prefixes.
 */
function stripPII(text: string): string {
  return text
    .replace(/\b\d{10,}\b/g, '[PHONE]')                  // Phone numbers
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')         // Emails
    .replace(/\b(?:Mr|Mrs|Ms|Dr)\.?\s+\w+/gi, '[NAME]') // Name prefixes
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]'); // US phone format
}

interface AIAnalysis {
  confidence: number;
  keywords: string[];
  suggestedSeverity: string;
  reasoning: string;
}

async function analyzeIncident(
  description: string,
  type: string,
  locationName: string
): Promise<AIAnalysis | null> {
  if (!env.GEMINI_API_KEY) {
    console.warn('[AI] GEMINI_API_KEY not configured — skipping analysis');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const sanitizedDesc = stripPII(description);

    const prompt = `You are an emergency incident analyzer for a disaster response system.

Analyze the following incident report and respond with a JSON object containing:
1. "confidence": A score from 0 to 1 indicating how likely this is a genuine emergency (1 = very likely real)
2. "keywords": An array of 3-5 relevant keywords for search/categorization
3. "suggestedSeverity": One of "CRITICAL", "HIGH", "MEDIUM", or "LOW"
4. "reasoning": A brief 1-sentence explanation

Incident Type: ${type}
Location: ${locationName}
Description: ${sanitizedDesc}

Respond ONLY with valid JSON, no markdown or explanations.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse the JSON from response (handle potential markdown wrapping)
    const jsonStr = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr) as AIAnalysis;

    // Validate ranges
    return {
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
      suggestedSeverity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(parsed.suggestedSeverity)
        ? parsed.suggestedSeverity
        : 'MEDIUM',
      reasoning: parsed.reasoning || 'Analysis complete',
    };
  } catch (error) {
    console.error('[AI] Gemini analysis failed:', error);
    return null;
  }
}

/**
 * Initialize the AI worker.
 * Listens to incident.created events and processes them asynchronously.
 */
export function startAIWorker(): void {
  if (!env.GEMINI_API_KEY) {
    console.log('[AI] Gemini API key not configured — AI worker disabled');
    return;
  }

  console.log('[AI] AI confidence worker started (Gemini 1.5 Flash)');

  eventEmitter.on('incident.created', async (data: unknown) => {
    const incident = data as {
      id: string;
      description: string;
      type: string;
      locationName: string;
      reporterId: string;
    };

    try {
      const analysis = await analyzeIncident(
        incident.description,
        incident.type,
        incident.locationName
      );

      if (!analysis) return;

      // Update incident with AI results
      await prisma.incident.update({
        where: { id: incident.id },
        data: {
          aiConfidence: analysis.confidence,
          aiKeywords: analysis.keywords,
        },
      });

      // Emit event for real-time UI update
      eventEmitter.emit('ai.processed', {
        incidentId: incident.id,
        ...analysis,
      });

      // Audit log
      auditService.writeLog(
        incident.reporterId,
        'AI_ANALYSIS_COMPLETE',
        'Incident',
        incident.id,
        {
          confidence: analysis.confidence,
          keywords: analysis.keywords,
          suggestedSeverity: analysis.suggestedSeverity,
        }
      );

      console.log(
        `[AI] Incident ${incident.id}: confidence=${analysis.confidence}, severity=${analysis.suggestedSeverity}, keywords=[${analysis.keywords.join(', ')}]`
      );
    } catch (error) {
      console.error(`[AI] Failed to process incident ${incident.id}:`, error);
    }
  });
}
