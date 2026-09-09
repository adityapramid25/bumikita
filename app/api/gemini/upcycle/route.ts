import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WasteAnalysisResult } from '@/src/types';

// Candidate vision models evaluated sequentially in resilient fallback loop
const VISION_MODELS = [
  'qwen/qwen-2.5-vl-72b-instruct:free',
  'openrouter/free'
];

// Lazy initialization of OpenRouter client
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.CUSTOM_AI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.APP_URL || 'https://bumikita.app',
      'X-Title': 'BumiKita AI Scanner',
    },
  });
}

const SYSTEM_PROMPT = `You are an expert waste auditor and circular upcycling designer for BumiKita.
Analyze the submitted image:
1. Foreground Isolation: Strictly analyze the primary foreground object intended as waste. Ignore furniture, desks, walls, or ambient objects.
2. Validation Check: If the photo is too dark, blurry, or contains no distinct identifiable waste item, set "isDetected" to false and explain why politely in Indonesian inside "userFriendlyMessage".
3. Material Audit: If clear, set "isDetected" to true. Accurately identify the object name, specific material (e.g., Kertas HVS/Karton, Plastik PET #1, Kain Denim), physical condition, dimension, and approximate scrap value (harga rongsok kiloan/satuan di Indonesia dalam Rupiah).
4. Creative Recommendations: Generate at least 3 realistic upcycling product ideas based on the material and any user creative idea provided. Each must have realistic market selling prices for student/artisan crafts in Indonesia, auxiliary materials needed, and numbered step-by-step instructions.
5. Bounding Box: Provide normalized coordinates [ymin, xmin, ymax, xmax] (scaled 0 to 1000) tightly wrapping the detected target object.

RETURN STRICTLY RAW VALID JSON ONLY. Do NOT wrap with markdown code blocks (no \`\`\`json or \`\`\`).
Schema:
{
  "isDetected": boolean,
  "userFriendlyMessage": string,
  "detectedObject": {
    "label": string,
    "material": string,
    "dimension": string,
    "condition": string,
    "estimatedScrapValue": string,
    "box2d": [number, number, number, number]
  },
  "recommendations": [
    {
      "id": string,
      "title": string,
      "difficulty": "Mudah" | "Sedang" | "Menantang",
      "estimatedTime": string,
      "benchmarkPrice": string,
      "summary": string,
      "materialsNeeded": string[],
      "steps": string[]
    }
  ]
}`;

// Helper: robust JSON extraction with markdown stripping
function extractJsonFromText(rawText: string): any {
  let cleaned = (rawText || '').trim();

  // Strip standard markdown code blocks
  cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonCandidate);
    }
    throw initialErr;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt = '', imageBase64 = '', image = '' } = body;

    const rawImage = (imageBase64 || image || '').trim();
    if (!rawImage) {
      return NextResponse.json(
        { error: 'Foto tidak ditemukan. Silakan ambil atau unggah foto objek sampah terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Ensure image payload is properly formatted as a Base64 data URI
    const formattedImageUrl = rawImage.startsWith('data:')
      ? rawImage
      : `data:image/jpeg;base64,${rawImage}`;

    const openRouterClient = getOpenRouterClient();
    if (!openRouterClient) {
      return NextResponse.json(
        {
          error:
            'OPENROUTER_API_KEY belum terkonfigurasi pada server. Silakan masukkan OPENROUTER_API_KEY pada Settings / Secrets agar AI Vision dapat memproses gambar.',
        },
        { status: 500 }
      );
    }

    const userTextPrompt = prompt?.trim()
      ? `User creative intent: "${prompt.trim()}". Analyze the primary foreground waste item in this image and return the JSON audit strictly according to instructions.`
      : 'Analyze the primary foreground waste item in this image and return the JSON audit strictly according to instructions.';

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userTextPrompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: formattedImageUrl,
            },
          },
        ],
      },
    ];

    let completionResponse: OpenAI.Chat.Completions.ChatCompletion | null = null;
    let activeModelUsed = '';
    let lastError: any = null;

    // Resilient Fallback Loop over candidate vision models
    for (const candidateModel of VISION_MODELS) {
      try {
        console.log(`[OpenRouter Vision] Attempting model: ${candidateModel}`);
        const response = await openRouterClient.chat.completions.create({
          model: candidateModel,
          messages,
          temperature: 0.1,
          max_tokens: 2200,
        });

        if (
          response &&
          response.choices &&
          response.choices.length > 0 &&
          response.choices[0]?.message?.content
        ) {
          completionResponse = response;
          activeModelUsed = candidateModel;
          console.log(`[OpenRouter Vision] Success using model: ${candidateModel}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        const statusCode =
          err?.status || err?.statusCode || (err?.response ? err.response.status : undefined);
        console.warn(
          `[OpenRouter Vision] Model ${candidateModel} failed with status ${statusCode || 'unknown'}: ${
            err?.message || err
          }. Attempting fallback candidate...`
        );
        // Continue to the next candidate model in VISION_MODELS
      }
    }

    // If ALL candidate models fail, return sanitized Indonesian error message
    if (!completionResponse || !completionResponse.choices || completionResponse.choices.length === 0) {
      console.error('[OpenRouter Vision] All candidate models failed. Last error:', lastError);
      return NextResponse.json(
        {
          error: 'Layanan AI Vision sedang sibuk. Silakan coba klik tombol analisis sekali lagi.',
        },
        { status: 503 }
      );
    }

    const rawReply = completionResponse.choices[0]?.message?.content || '';
    if (!rawReply.trim()) {
      return NextResponse.json(
        {
          error: 'Layanan AI Vision sedang sibuk. Silakan coba klik tombol analisis sekali lagi.',
        },
        { status: 503 }
      );
    }

    let parsedJson: any;
    try {
      parsedJson = extractJsonFromText(rawReply);
    } catch (parseErr) {
      console.error('[OpenRouter Vision] Failed to parse model output as JSON:', rawReply, parseErr);
      return NextResponse.json(
        {
          error: 'Layanan AI Vision sedang sibuk. Silakan coba klik tombol analisis sekali lagi.',
        },
        { status: 500 }
      );
    }

    // If validation check failed (too dark / blurry / no waste found)
    if (parsedJson.isDetected === false) {
      const friendlyMsg =
        parsedJson.userFriendlyMessage ||
        'Foto kurang jelas atau objek sampah tidak terdeteksi dengan baik. Silakan posisikan objek di tengah dengan pencahayaan yang cukup.';
      return NextResponse.json({
        success: true,
        isDetected: false,
        userFriendlyMessage: friendlyMsg,
        data: {
          isDetected: false,
          userFriendlyMessage: friendlyMsg,
          detectedObject: {
            label: 'Objek Tidak Terdeteksi',
            material: 'Tidak Teridentifikasi',
            condition: 'Foto Kurang Jelas',
            box2d: [150, 150, 850, 850],
          },
          recommendations: [],
        },
      });
    }

    // Sanitize and ensure full structure
    const detectedObject = {
      label: parsedJson.detectedObject?.label || 'Objek Sampah Daur Ulang',
      material: parsedJson.detectedObject?.material || 'Material Campuran',
      dimension: parsedJson.detectedObject?.dimension || 'Ukuran standar',
      condition: parsedJson.detectedObject?.condition || 'Layak untuk upcycling',
      estimatedScrapValue: parsedJson.detectedObject?.estimatedScrapValue || 'Rp 2.000 - Rp 5.000 / kg',
      box2d: [150, 150, 850, 850] as [number, number, number, number],
    };

    if (
      Array.isArray(parsedJson.detectedObject?.box2d) &&
      parsedJson.detectedObject.box2d.length === 4
    ) {
      detectedObject.box2d = parsedJson.detectedObject.box2d.map((val: any) =>
        Math.max(0, Math.min(1000, Math.round(Number(val) || 0)))
      ) as [number, number, number, number];
    }

    const recommendations = (Array.isArray(parsedJson.recommendations) ? parsedJson.recommendations : []).map(
      (rec: any, idx: number) => ({
        id: rec.id || `upcycle-rec-${Date.now()}-${idx + 1}`,
        title: rec.title || `Kreasi Upcycling #${idx + 1}`,
        difficulty: (['Mudah', 'Sedang', 'Menantang'].includes(rec.difficulty) ? rec.difficulty : 'Mudah') as 'Mudah' | 'Sedang' | 'Menantang',
        estimatedTime: rec.estimatedTime || '30 Menit',
        benchmarkPrice: rec.benchmarkPrice || 'Rp 35.000 - Rp 65.000',
        summary: rec.summary || 'Proyek upcycling bernilai jual tinggi untuk kerajinan tangan lokal.',
        materialsNeeded: Array.isArray(rec.materialsNeeded) && rec.materialsNeeded.length > 0
          ? rec.materialsNeeded
          : ['Objek sampah utama', 'Lem serbaguna', 'Gunting / cutter'],
        steps: Array.isArray(rec.steps) && rec.steps.length > 0
          ? rec.steps
          : [
              'Bersihkan objek dari kotoran atau residu.',
              'Bentuk atau potong sesuai desain yang direncanakan.',
              'Rangkai dan beri sentuhan finishing estetik.',
            ],
        auxiliaryCost: rec.auxiliaryCost || 'Rp 5.000 - Rp 15.000',
        finishingTips: rec.finishingTips || 'Beri lapisan pelindung anti air untuk ketahanan jangka panjang dan daya tarik estetik.',
      })
    );

    // Assemble final verified result
    const finalResult: WasteAnalysisResult = {
      isDetected: true,
      userFriendlyMessage: parsedJson.userFriendlyMessage || 'Objek sampah berhasil dianalisis.',
      detectedObject,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      isDetected: true,
      data: {
        ...finalResult,
        // Convenience aliases for hero/minimal widgets
        detectedItemName: detectedObject.label,
        detectedMaterialType: detectedObject.material,
        projectName: recommendations[0]?.title || 'Kreasi Upcycling',
        difficulty: recommendations[0]?.difficulty || 'Mudah',
        timeEstimate: recommendations[0]?.estimatedTime || '30 Menit',
        estimatedValueIdr: 45000,
        productDescription: recommendations[0]?.summary,
        requiredMaterials: recommendations[0]?.materialsNeeded,
        toolsNeeded: ['Gunting', 'Lem serbaguna', 'Penggaris'],
        steps: (recommendations[0]?.steps || []).map((st: string, i: number) => ({
          stepNumber: i + 1,
          title: `Langkah ${i + 1}`,
          instruction: st,
        })),
        co2SavedKg: 2.8,
        landfillDivertedGrams: 320,
      },
      modelUsed: activeModelUsed,
      detectedItemName: detectedObject.label,
      detectedMaterialType: detectedObject.material,
      projectName: recommendations[0]?.title,
    });
  } catch (err: any) {
    console.error('Error in upcycle vision API route handler:', err);
    // Sanitize user-facing error message in Indonesian
    return NextResponse.json(
      {
        error: 'Layanan AI Vision sedang sibuk. Silakan coba klik tombol analisis sekali lagi.',
      },
      { status: 500 }
    );
  }
}
