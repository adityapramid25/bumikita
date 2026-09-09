import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/src/lib/gemini';
import { Type, Schema } from '@google/genai';
import { WasteAnalysisResult } from '@/src/types';

// Structured Output Schema for Gemini 2.5 Flash
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    detectedObject: {
      type: Type.OBJECT,
      properties: {
        label: {
          type: Type.STRING,
          description: "Nama spesifik foreground objek/sampah yang terdeteksi di foto (contoh: 'Buku Novel Bekas', 'Kotak Kardus', 'Botol Plastik PET 600ml', 'Kaleng Minuman Aluminium')"
        },
        material: {
          type: Type.STRING,
          description: "Komposisi material objek (contoh: 'Kertas / Selulosa Berkualitas', 'Karton Gelombang', 'Plastik PET #1', 'Denim Katun')"
        },
        dimension: {
          type: Type.STRING,
          description: "Estimasi dimensi ukuran fisik objek berdasarkan konteks visual"
        },
        condition: {
          type: Type.STRING,
          description: "Kondisi fisik objek (contoh: 'Halaman utuh, sampul sedikit berlipat', 'Bersih dan kering')"
        },
        estimatedScrapValue: {
          type: Type.STRING,
          description: "Estimasi nilai rongsok mentah di pengepul lokal dalam Rupiah (contoh: 'Rp 1.500 - Rp 2.500 / kg')"
        },
        box2d: {
          type: Type.ARRAY,
          items: { type: Type.INTEGER },
          description: "[ymin, xmin, ymax, xmax] normalized to 0-1000 scale tightly wrapping ONLY the detected foreground object itself, strictly excluding any desk, table, or background"
        }
      },
      required: ["label", "material", "condition", "box2d"]
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          difficulty: {
            type: Type.STRING,
            description: "Tingkat kesulitan: 'Mudah', 'Sedang', atau 'Menantang'"
          },
          estimatedTime: { type: Type.STRING },
          benchmarkPrice: {
            type: Type.STRING,
            description: "Estimasi harga jual realistis di pasar kerajinan Indonesia (contoh: 'Rp 30.000 - Rp 50.000')"
          },
          summary: {
            type: Type.STRING,
            description: "Ringkasan alasan kenapa ide upcycle ini tepat dan bernilai guna tinggi"
          },
          materialsNeeded: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          auxiliaryCost: {
            type: Type.STRING,
            description: "Estimasi biaya alat & bahan tambahan (contoh: 'Rp 5.000 - Rp 10.000')"
          },
          finishingTips: {
            type: Type.STRING,
            description: "Tips finishing estetik bernilai jual tinggi di Green Market BumiKita"
          }
        },
        required: ["id", "title", "difficulty", "benchmarkPrice", "materialsNeeded", "steps"]
      }
    }
  },
  required: ["detectedObject", "recommendations"]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt = '', imageBase64 = '', mimeType = 'image/jpeg' } = body;

    // Validate clean base64 data
    const base64Clean = (imageBase64 || '').replace(/^data:image\/\w+;base64,/, '').trim();
    if (!base64Clean) {
      return NextResponse.json(
        { error: 'Gagal mendeteksi gambar: Data gambar tidak ditemukan atau payload base64 kosong.' },
        { status: 400 }
      );
    }

    const aiClient = getGeminiClient();
    if (!aiClient) {
      return NextResponse.json(
        {
          error:
            'Gagal mendeteksi gambar: API Key Gemini belum terkonfigurasi pada server. Pastikan GEMINI_API_KEY telah disetel pada Settings atau environment variables.',
        },
        { status: 500 }
      );
    }

    // Strict Grounding and Object Isolation System Instruction
    const systemInstruction = `You are an expert visual waste and object auditor. Analyze the actual image provided. Identify the single primary foreground object placed intentionally by the user (ignore the furniture, desk, background monitors, and walls). 
If the object is a book, paper, or cardboard, identify it strictly as paper/cellulose. 
Provide accurate normalized bounding box coordinates [ymin, xmin, ymax, xmax] (scaled 0-1000) tightly wrapping ONLY the detected item itself, not the table supporting it.

TASK SPECIFICATIONS:
1. OBJECT DETECTION & LOCALIZATION:
   - Identify the primary foreground object that the user placed in front of the camera or is holding/focusing on.
   - STRICTLY IGNORE background environment: do NOT box the desk, wooden table, tiles, floor, wall, keyboard, monitor, or person's body/hands.
   - [ymin, xmin, ymax, xmax] must tightly enclose ONLY the target object (e.g., if a book or novel is standing on a wooden desk, the box coordinates must wrap only the book itself, strictly excluding the desk).
2. MATERIAL & CONDITION AUDIT:
   - label: Specific name of the item in Indonesian (e.g. "Buku Novel Bekas", "Kotak Kardus Paket", "Botol Kaca", "Kaleng Aluminium").
   - material: Material/polymer composition (e.g. "Kertas / Selulosa Berkualitas", "Karton Gelombang", "Plastik PET #1", "Aluminium").
   - dimension: Realistic physical dimension based on visual context.
   - condition: Physical state (e.g. "Halaman lengkap, sampul sedikit usang", "Kering dan bersih").
   - estimatedScrapValue: Scrap value in Indonesian Rupiah (e.g. "Rp 1.500 - Rp 2.500 / kg" for books/paper).
3. THREE DISTINCT UPCYCLING RECOMMENDATIONS:
   - Provide exactly 3 creative, feasible upcycling blueprints relevant to this specific detected object and material.
   - If user provided a creative intent in their prompt, adapt the designs to align with it.
   - difficulty: 'Mudah' | 'Sedang' | 'Menantang'.
   - estimatedTime: Realistic crafting time (e.g. "25 Menit").
   - benchmarkPrice: Realistic Indonesian craft market selling price (e.g. "Rp 35.000 - Rp 60.000").
   - summary: Engaging explanation of the upcycling concept.
   - materialsNeeded: Clear list of required materials and household supplies.
   - steps: Numbered, detailed step-by-step instructions in natural Indonesian.
   - auxiliaryCost: Estimated extra expense for glue/paint/accents.
   - finishingTips: Aesthetic finishing techniques for market appeal.`;

    // Properly format inline image data part
    const validMimeType = mimeType && ['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)
      ? mimeType
      : 'image/jpeg';

    const imagePart = {
      inlineData: {
        data: base64Clean,
        mimeType: validMimeType,
      },
    };

    const userPromptText = `Inspect the provided image carefully and identify the primary foreground object that the user wants to upcycle.
User creative intent: "${prompt?.trim() || 'Rekomendasikan 3 ide kreasi upcycling paling estetik, fungsional, dan bernilai jual tinggi untuk barang ini'}"

Localize the foreground object with normalized bounding box coordinates [ymin, xmin, ymax, xmax] (0-1000) tightly wrapping ONLY the object itself (NOT the desk or background). Return the complete audit and 3 upcycle project blueprints.`;

    // Target verified production vision model gemini-2.5-flash
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        imagePart,
        {
          text: userPromptText,
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.1, // Low temperature for high bounding-box fidelity & structured precision
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    let responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Model Gemini memberikan respons kosong untuk gambar ini.');
    }

    // Strip markdown code fences if present
    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsedData: WasteAnalysisResult = JSON.parse(responseText);

    // Validate and clamp bounding box
    if (
      !parsedData.detectedObject?.box2d ||
      !Array.isArray(parsedData.detectedObject.box2d) ||
      parsedData.detectedObject.box2d.length !== 4
    ) {
      parsedData.detectedObject.box2d = [150, 150, 850, 850];
    } else {
      parsedData.detectedObject.box2d = parsedData.detectedObject.box2d.map((val) =>
        Math.max(0, Math.min(1000, Math.round(Number(val) || 0)))
      ) as [number, number, number, number];
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      isFallback: false,
      detectedItemName: parsedData.detectedObject.label,
      detectedMaterialType: parsedData.detectedObject.material,
      projectName: parsedData.recommendations[0]?.title,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/upcycle:', err);
    // Explicit error response - zero fake mock data
    return NextResponse.json(
      {
        error: `Gagal mendeteksi gambar: ${err?.message || 'Terjadi kesalahan saat memproses gambar dengan model Vision.'}`,
      },
      { status: 500 }
    );
  }
}
