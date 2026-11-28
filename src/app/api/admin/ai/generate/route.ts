import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';
import { findOne } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GenerateRequestBody {
  type: 'category-description' | 'product-description' | 'product-features' | 'brand-description' | 'seo-meta' | 'custom';
  context: {
    name?: string;
    parentCategory?: string;
    brand?: string;
    category?: string;
    supplier?: string;
    warranty?: string;
    price?: number;
    keywords?: string;
    website?: string;
    existingContent?: string;
    prompt?: string;
  };
}

function generateSmartFallback(type: string, ctx: GenerateRequestBody['context']): string {
  const name = ctx.name?.trim() || 'Products';
  const brand = ctx.brand?.trim() || 'eMotionView Official';
  const parent = ctx.parentCategory?.trim();

  switch (type) {
    case 'category-description':
      return `Explore our curated selection of authentic ${name}${parent ? ` under ${parent}` : ''} at eMotionView. Designed for modern lifestyle enthusiasts, each product offers premium build quality, seamless performance, and verified official warranty. Whether you are upgrading your everyday tech or searching for top-rated devices at competitive prices, discover the latest innovations with fast delivery across Bangladesh.`;

    case 'product-description':
      return `<p>Experience next-level innovation with the <strong>${name}</strong> by <strong>${brand}</strong>. Engineered with precision and crafted for everyday dependability, it combines modern design with reliable performance to elevate your lifestyle.</p>
<h4>Key Highlights:</h4>
<ul>
  <li><strong>Premium Craftsmanship:</strong> Built with high-grade materials for enduring durability and comfort.</li>
  <li><strong>Effortless Connectivity:</strong> Seamless pairing with lightning-fast, ultra-stable response.</li>
  <li><strong>All-Day Battery Performance:</strong> Extended runtime designed to keep up with your busiest days.</li>
  <li><strong>Authentic Guarantee:</strong> 100% genuine product backed by official brand warranty.</li>
</ul>
<p>Order the ${name} today from eMotionView for competitive pricing, responsive customer support, and fast nationwide delivery.</p>`;

    case 'product-features':
      return `- High-precision engineering with premium build materials
- Advanced connectivity with ultra-low latency response
- Long-lasting battery life optimized for all-day daily use
- Ergonomic and lightweight design for maximum comfort
- 100% authentic product with official replacement warranty`;

    case 'brand-description':
      return `${name} is globally recognized for pioneering smart technology, premium audio, and lifestyle gear that seamlessly blends cutting-edge aesthetics with everyday practicality. Committed to high quality standards, reliable durability, and modern engineering, ${name} products empower tech enthusiasts with superior performance. Available with official warranty support at eMotionView.`;

    case 'seo-meta':
      return `Buy authentic ${name} at the best price in Bangladesh. Enjoy official brand warranty, genuine products, and fast home delivery from eMotionView.`;

    default:
      return `Discover authentic ${name} with official warranty and nationwide delivery at eMotionView.`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin privileges required.' },
        { status: 401 }
      );
    }

    const body: GenerateRequestBody = await req.json();
    const { type = 'category-description', context = {} } = body;

    const targetName = context.name?.trim() || context.brand?.trim() || '';
    if (!targetName && type !== 'custom') {
      return NextResponse.json(
        { success: false, message: 'Target name is required for AI generation.' },
        { status: 400 }
      );
    }

    // 1. Fetch AI Provider configuration from MongoDB
    let aiConfig = {
      aiEnabled: true,
      aiProviderName: 'OpenAI',
      aiBaseUrl: 'https://manifest.uddoktasoft.com/v1',
      aiApiKey: '',
      aiDefaultModel: 'auto',
    };

    try {
      const settingsDoc = await findOne('settings', { _id: 'general' } as any);
      if (settingsDoc) {
        const rawProviders = settingsDoc.aiProviders || {};
        const activeName = settingsDoc.aiProviderName || 'OpenAI';
        const providerData = rawProviders[activeName] || rawProviders['OpenAI'] || {};

        aiConfig = {
          aiEnabled: settingsDoc.aiEnabled ?? true,
          aiProviderName: settingsDoc.aiProviderName || providerData.name || 'OpenAI',
          aiBaseUrl: settingsDoc.aiBaseUrl || providerData.baseUrl || 'https://manifest.uddoktasoft.com/v1',
          aiApiKey: settingsDoc.aiApiKey || providerData.apiKey || '',
          aiDefaultModel: settingsDoc.aiDefaultModel || providerData.defaultModel || 'auto',
        };
      }
    } catch (dbErr) {
      console.warn('Could not read settings from MongoDB:', dbErr);
    }

    // 2. Build system prompt & user prompt
    let systemPrompt = 'You are an expert eCommerce copywriter and SEO specialist for eMotionView, the biggest smart gadget and smartphone collection store in Bangladesh. You write compelling, engaging, modern, and high-converting product and category descriptions.';
    let userPrompt = '';

    if (type === 'category-description') {
      userPrompt = `Write an engaging, persuasive, and SEO-friendly category description for: "${targetName}"${context.parentCategory ? ` (Parent collection: ${context.parentCategory})` : ''}.
Guidelines:
- 2 smooth, well-crafted paragraphs.
- Highlight lifestyle benefits, top device types, build quality, and customer confidence (genuine products, official warranty).
- Warm, enthusiastic, professional tone.
- Do NOT use markdown heading tags (# or ##). Return pure readable paragraphs.`;
    } else if (type === 'product-description') {
      userPrompt = `Write a comprehensive, professional eCommerce product description for: "${targetName}".
Brand: ${context.brand || 'Official Brand'}
Category: ${context.category || 'Smart Gadgets'}
${context.supplier ? `Supplier: ${context.supplier}` : ''}
${context.warranty ? `Warranty: ${context.warranty}` : ''}

Guidelines:
- Start with an enticing introductory hook paragraph.
- Provide a clean section with 4-5 bulleted key highlights (bold title followed by clear benefit).
- Conclude with a brief paragraph on reliability, official warranty, and satisfaction guarantee.
- Return clean HTML format with <p>, <h4>, <ul>, <li>, and <strong> tags for direct CMS formatting.`;
    } else if (type === 'product-features') {
      userPrompt = `Generate 5-6 standout bulleted features for: "${targetName}" (Brand: ${context.brand || 'Official'}).
Return only bullet points, each highlighting a technical or practical everyday benefit (e.g., display, battery life, connectivity, sensor accuracy, ergonomics).`;
    } else if (type === 'brand-description') {
      userPrompt = `Write a compelling brand background and quality commitment overview for: "${targetName}".
${context.website ? `Official Website: ${context.website}` : ''}
Highlight their innovation track record, design craftsmanship, and commitment to genuine warranty support for gadgets lovers in Bangladesh.`;
    } else if (type === 'seo-meta') {
      userPrompt = `Write a punchy, click-optimized SEO meta description for "${targetName}".
Strict length constraint: must be between 135 and 155 characters. No quotes. Include keywords like authentic, warranty, best price in Bangladesh, and eMotionView.`;
    } else {
      userPrompt = context.prompt || `Write an overview for ${targetName}`;
    }

    // 3. Call AI LLM if enabled and configured
    let generatedText = '';
    let usedProvider = aiConfig.aiProviderName;

    if (aiConfig.aiEnabled && aiConfig.aiBaseUrl) {
      try {
        const cleanBaseUrl = aiConfig.aiBaseUrl.trim().replace(/\/+$/, '');
        const endpoint = cleanBaseUrl.endsWith('/chat/completions')
          ? cleanBaseUrl
          : `${cleanBaseUrl}/chat/completions`;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (aiConfig.aiApiKey && aiConfig.aiApiKey.trim()) {
          headers['Authorization'] = `Bearer ${aiConfig.aiApiKey.trim()}`;
        }

        const model = aiConfig.aiDefaultModel || 'auto';

        const aiRes = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
          signal: AbortSignal.timeout(18000), // 18s timeout
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          let rawContent = aiData.choices?.[0]?.message?.content?.trim();
          if (rawContent) {
            // Remove markdown code fences if wrapped
            rawContent = rawContent.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```$/g, '').trim();
            generatedText = rawContent;
          }
        } else {
          console.warn(`AI Provider responded with status ${aiRes.status}`);
        }
      } catch (callErr: any) {
        console.warn('AI call exception:', callErr?.message || callErr);
      }
    }

    // 4. Fallback if AI wasn't able to respond
    if (!generatedText) {
      generatedText = generateSmartFallback(type, context);
      usedProvider = `${aiConfig.aiProviderName} (Smart Fallback)`;
    }

    return NextResponse.json({
      success: true,
      text: generatedText,
      provider: usedProvider,
      type,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/ai/generate:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to generate text.',
      },
      { status: 500 }
    );
  }
}
