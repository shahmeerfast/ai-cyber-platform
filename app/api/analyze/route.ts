/**
 * app/api/analyze/route.ts
 * Streaming AI analysis endpoint — Edge Runtime for Vercel low latency.
 * Accepts scenarioId + optional customPayload, streams SSE back to client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai, AI_MODEL } from '@/lib/openai';
import { SYSTEM_PROMPT, buildAnalysisPrompt, AttackScenarioId } from '@/lib/prompts';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenarioId, customPayload } = body as {
      scenarioId: AttackScenarioId;
      customPayload?: string;
    };

    if (!scenarioId) {
      return NextResponse.json({ error: 'scenarioId is required' }, { status: 400 });
    }

    const userMessage = buildAnalysisPrompt(scenarioId, customPayload);

    const stream = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 1200,
      temperature: 0.65,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userMessage   },
      ],
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`));
            }
            if (chunk.choices[0]?.finish_reason === 'stop') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              break;
            }
          }
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error: unknown) {
    console.error('[ANALYZE API ERROR]', error);
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({ error: 'Invalid OpenAI API key. Check your .env.local file.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
