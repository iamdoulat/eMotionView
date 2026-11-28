import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin privileges required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { providerName = 'Custom AI', baseUrl, apiKey, defaultModel } = body;

    if (!baseUrl || typeof baseUrl !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Base URL is required' },
        { status: 400 }
      );
    }

    if (!defaultModel || typeof defaultModel !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Default model name is required' },
        { status: 400 }
      );
    }

    // Normalize base URL
    const cleanBaseUrl = baseUrl.trim().replace(/\/+$/, '');
    const endpoint = cleanBaseUrl.endsWith('/chat/completions')
      ? cleanBaseUrl
      : `${cleanBaseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey && typeof apiKey === 'string' && apiKey.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }

    const startTime = performance.now();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: defaultModel.trim(),
        messages: [
          {
            role: 'system',
            content: 'You are a test probe for an eCommerce platform.',
          },
          {
            role: 'user',
            content: 'Ping test. Reply with single word: Connected',
          },
        ],
        max_tokens: 15,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(12000), // 12-second timeout
    });

    const latency = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.error?.message || errorJson.message || errorText;
      } catch {}

      return NextResponse.json(
        {
          success: false,
          latency,
          message: `API returned status ${response.status}: ${errorDetail.slice(0, 200)}`,
        },
        { status: 200 } // Return 200 with success: false for clean client handling
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Connected';

    return NextResponse.json({
      success: true,
      latency,
      model: defaultModel,
      provider: providerName,
      message: `Successfully connected to ${providerName} (${defaultModel}) in ${latency}ms. Response: "${reply}"`,
    });
  } catch (error: any) {
    console.error('Error testing AI provider:', error);
    const isTimeout = error.name === 'TimeoutError' || error.message?.includes('timeout');
    return NextResponse.json(
      {
        success: false,
        message: isTimeout
          ? 'Connection timed out after 12 seconds. Check if Base URL is reachable.'
          : error.message || 'Failed to connect to AI provider.',
      },
      { status: 200 }
    );
  }
}
