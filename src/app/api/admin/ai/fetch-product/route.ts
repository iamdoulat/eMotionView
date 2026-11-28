import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ExtractedProduct {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categories: string[];
  brand: string;
  sku: string;
  stock: number;
  supplier: string;
  warranty: string;
  features: string[];
  specifications: Array<{ key: string; value: string }>;
  images: string[];
}

function resolveUrl(url: string, base: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

function extractMetaTags(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const metaRegex = /<meta\s+([^>]*?)>/gi;
  let match;

  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1];
    const nameMatch = attrs.match(/(?:name|property)\s*=\s*["']([^"']+)["']/i);
    const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);

    if (nameMatch && contentMatch) {
      meta[nameMatch[1].toLowerCase()] = contentMatch[1];
    }
  }

  return meta;
}

function extractJsonLd(html: string): any[] {
  const jsonLdBlocks: any[] = [];
  const scriptRegex = /<script\s+[^>]*?type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const content = match[1].trim();
      if (!content) continue;
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        jsonLdBlocks.push(...parsed);
      } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        jsonLdBlocks.push(...parsed['@graph']);
      } else {
        jsonLdBlocks.push(parsed);
      }
    } catch {}
  }

  return jsonLdBlocks;
}

function cleanHtmlToText(html: string): string {
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Collapse whitespace
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
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

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url.trim())) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid http:// or https:// URL.' },
        { status: 400 }
      );
    }

    const targetUrl = url.trim();

    // 1. Fetch external webpage
    let html = '';
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(15000), // 15-second timeout
      });

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            message: `External webpage returned status ${response.status} (${response.statusText}). The site might block scrapers or require login.`,
          },
          { status: 200 }
        );
      }

      html = await response.text();
    } catch (fetchErr: any) {
      console.error('Fetch error:', fetchErr);
      const isTimeout = fetchErr.name === 'TimeoutError' || fetchErr.message?.includes('timeout');
      return NextResponse.json(
        {
          success: false,
          message: isTimeout
            ? 'The external webpage took too long to respond (15s timeout).'
            : `Could not reach ${targetUrl}: ${fetchErr.message}`,
        },
        { status: 200 }
      );
    }

    // 2. Extract metadata and content
    const meta = extractMetaTags(html);
    const jsonLdBlocks = extractJsonLd(html);
    const productJsonLd = jsonLdBlocks.find(
      (item) =>
        item['@type'] === 'Product' ||
        (Array.isArray(item['@type']) && item['@type'].includes('Product'))
    );

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const htmlTitle = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';
    const ogTitle = meta['og:title'] || meta['twitter:title'] || htmlTitle;

    // Extract description
    const htmlDesc = meta['description'] || meta['og:description'] || meta['twitter:description'] || '';

    // Extract images
    const rawImages: string[] = [];
    if (meta['og:image']) rawImages.push(meta['og:image']);
    if (meta['twitter:image']) rawImages.push(meta['twitter:image']);

    if (productJsonLd?.image) {
      if (Array.isArray(productJsonLd.image)) {
        for (const img of productJsonLd.image) {
          if (typeof img === 'string') rawImages.push(img);
          else if (img?.url) rawImages.push(img.url);
        }
      } else if (typeof productJsonLd.image === 'string') {
        rawImages.push(productJsonLd.image);
      } else if (productJsonLd.image?.url) {
        rawImages.push(productJsonLd.image.url);
      }
    }

    // Also scan <img> tags for product gallery patterns
    const imgRegex = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const src = imgMatch[1];
      if (
        src &&
        !src.endsWith('.svg') &&
        !src.includes('logo') &&
        !src.includes('icon') &&
        !src.includes('pixel') &&
        !src.includes('badge') &&
        !src.includes('avatar')
      ) {
        rawImages.push(src);
      }
      if (rawImages.length >= 15) break;
    }

    // Resolve URLs against base and deduplicate
    const resolvedImages = Array.from(
      new Set(rawImages.map((img) => resolveUrl(img, targetUrl)))
    ).filter((img) => /^https?:\/\//i.test(img));

    // Extract clean body text
    const cleanText = cleanHtmlToText(html);

    // 3. Load Custom AI Configuration from Database
    let aiConfig: {
      aiEnabled?: boolean;
      aiProviderName?: string;
      aiBaseUrl?: string;
      aiApiKey?: string;
      aiDefaultModel?: string;
    } = {
      aiEnabled: true,
      aiProviderName: 'OpenAI',
      aiBaseUrl: 'https://api.openai.com/v1',
      aiApiKey: '',
      aiDefaultModel: 'gpt-4o-mini',
    };

    try {
      const { findOne } = await import('@/lib/mongodb');
      const settingsDoc = await findOne('settings', { _id: 'general' } as any);
      if (settingsDoc) {
        aiConfig = {
          aiEnabled: settingsDoc.aiEnabled ?? true,
          aiProviderName: settingsDoc.aiProviderName || 'OpenAI',
          aiBaseUrl: settingsDoc.aiBaseUrl || 'https://api.openai.com/v1',
          aiApiKey: settingsDoc.aiApiKey || '',
          aiDefaultModel: settingsDoc.aiDefaultModel || 'gpt-4o-mini',
        };
      }
    } catch (dbErr) {
      console.warn('Could not read settings/general from MongoDB, using defaults:', dbErr);
    }

    let extractedProduct: ExtractedProduct | null = null;
    let extractionSource: 'ai' | 'metadata' = 'metadata';

    // 4. If Custom AI is enabled, call the LLM
    if (aiConfig.aiEnabled && aiConfig.aiBaseUrl && aiConfig.aiDefaultModel) {
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

        const prompt = `You are an expert eCommerce catalog specialist. Extract product details from the webpage content and metadata below into strict, valid JSON matching this schema:
{
  "name": "Product Title / Name (clear and concise)",
  "description": "Comprehensive product overview and details formatted nicely",
  "price": 0.00,
  "originalPrice": 0.00,
  "categories": ["Category Name"],
  "brand": "Brand Name",
  "sku": "SKU or generate a clean one based on brand and model",
  "stock": 15,
  "supplier": "eMotionView Official",
  "warranty": "Official Warranty period (e.g. 1 Year Official Warranty, 6 Months Replacement)",
  "features": ["Bullet Feature 1", "Bullet Feature 2", "Bullet Feature 3"],
  "specifications": [
    {"key": "Display", "value": "1.43 inch AMOLED"},
    {"key": "Battery", "value": "450 mAh"},
    {"key": "Connectivity", "value": "Bluetooth 5.3"}
  ],
  "images": ["Image URL 1", "Image URL 2"]
}

Strict requirements:
- "price" and "originalPrice" must be pure numbers without currency symbols.
- If no discount is detected, set "originalPrice" to the same number as "price".
- "categories" should pick from: Wearables, Smartphones, Audio, Smart Home, Laptops, Accessories, or the actual category mentioned.
- "features" should be an array of key selling point strings.
- "specifications" must be an array of objects with "key" and "value" strings.
- "images" should contain up to 5 valid image URLs from the provided image list.
- Return ONLY the raw JSON object, without markdown formatting or surrounding text.`;

        const userContent = `Page URL: ${targetUrl}

Page Title: ${ogTitle}
Meta Description: ${htmlDesc}

Extracted JSON-LD Product Data:
${JSON.stringify(productJsonLd || {}, null, 2)}

Available Candidate Images:
${JSON.stringify(resolvedImages.slice(0, 8), null, 2)}

Extracted Main Webpage Text (first 5,000 characters):
${cleanText.slice(0, 5000)}`;

        let aiResponse = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: aiConfig.aiDefaultModel.trim(),
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: userContent },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
          }),
          signal: AbortSignal.timeout(30000), // 30-second timeout for AI
        });

        // Some providers reject response_format: { type: 'json_object' }
        if (!aiResponse.ok && aiResponse.status === 400) {
          aiResponse = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: aiConfig.aiDefaultModel.trim(),
              messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: userContent },
              ],
              temperature: 0.1,
            }),
            signal: AbortSignal.timeout(30000),
          });
        }

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const rawContent = aiData.choices?.[0]?.message?.content?.trim() || '';
          
          // Parse JSON from content (handling possible ```json ... ``` wrapper)
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            extractedProduct = {
              name: String(parsed.name || ogTitle || 'Imported Product').trim(),
              description: String(parsed.description || htmlDesc || '').trim(),
              price: Number(parsed.price) || 0,
              originalPrice: parsed.originalPrice ? Number(parsed.originalPrice) : undefined,
              categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : ['Smart Gadgets'],
              brand: String(parsed.brand || 'Generic').trim(),
              sku: String(parsed.sku || `EMV-${Date.now().toString().slice(-6)}`).trim(),
              stock: Number(parsed.stock) || 10,
              supplier: String(parsed.supplier || 'eMotionView Official').trim(),
              warranty: String(parsed.warranty || '1 Year Official Warranty').trim(),
              features: Array.isArray(parsed.features) ? parsed.features.map(String) : [],
              specifications: Array.isArray(parsed.specifications)
                ? parsed.specifications.map((s: any) => ({
                    key: String(s.key || '').trim(),
                    value: String(s.value || '').trim(),
                  })).filter((s: any) => s.key && s.value)
                : [],
              images: Array.isArray(parsed.images) && parsed.images.length > 0
                ? parsed.images.map((img: string) => resolveUrl(img, targetUrl))
                : resolvedImages.slice(0, 5),
            };
            extractionSource = 'ai';
          }
        } else {
          console.warn('AI call returned error:', aiResponse.status, await aiResponse.text());
        }
      } catch (aiErr) {
        console.warn('AI extraction failed, falling back to page metadata:', aiErr);
      }
    }

    // 5. Fallback if AI was unavailable or failed
    if (!extractedProduct) {
      let price = 0;
      let originalPrice: number | undefined = undefined;

      if (productJsonLd?.offers) {
        const offers = Array.isArray(productJsonLd.offers) ? productJsonLd.offers[0] : productJsonLd.offers;
        price = Number(offers?.price) || 0;
      }
      if (!price && meta['product:price:amount']) {
        price = Number(meta['product:price:amount']) || 0;
      }
      if (!price && meta['og:price:amount']) {
        price = Number(meta['og:price:amount']) || 0;
      }

      const brand =
        productJsonLd?.brand?.name ||
        (typeof productJsonLd?.brand === 'string' ? productJsonLd.brand : '') ||
        'eMotionView';

      extractedProduct = {
        name: productJsonLd?.name || ogTitle || htmlTitle || 'Imported Product',
        description: productJsonLd?.description || htmlDesc || cleanText.slice(0, 300) || '',
        price,
        originalPrice: originalPrice || price,
        categories: productJsonLd?.category ? [productJsonLd.category] : ['Smart Gadgets'],
        brand,
        sku: productJsonLd?.sku || `EMV-${Date.now().toString().slice(-6)}`,
        stock: 10,
        supplier: 'eMotionView Official',
        warranty: '1 Year Official Warranty',
        features: [
          'High Quality Original Product',
          'Fast Delivery Across Bangladesh',
          'Official Brand Warranty Included',
        ],
        specifications: [
          { key: 'Source', value: new URL(targetUrl).hostname },
          { key: 'Condition', value: 'Brand New Original' },
        ],
        images: resolvedImages.slice(0, 5),
      };
      extractionSource = 'metadata';
    }

    return NextResponse.json({
      success: true,
      source: extractionSource,
      provider: extractionSource === 'ai' ? aiConfig.aiProviderName : 'Page Metadata Extractor',
      product: extractedProduct,
    });
  } catch (err: any) {
    console.error('Fatal error in fetch-product route:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'An unexpected error occurred while fetching product data.',
      },
      { status: 500 }
    );
  }
}
