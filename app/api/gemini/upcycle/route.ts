import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/src/lib/gemini';
import { Type, Schema } from '@google/genai';
import { WasteAnalysisResult } from '@/src/types';

// Structured Output Schema according to specification
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    detectedObject: {
      type: Type.OBJECT,
      properties: {
        label: { 
          type: Type.STRING,
          description: "Nama spesifik sampah yang terdeteksi di foto (contoh: 'Botol Plastik Air Mineral 600ml')"
        },
        material: { 
          type: Type.STRING,
          description: "Jenis material sampah (contoh: 'Plastik PET #1', 'Kardus Corrugated', 'Kain Denim Katun')"
        },
        dimension: { 
          type: Type.STRING,
          description: "Estimasi ukuran fisik objek (contoh: 'Botol 600ml (tinggi ~22cm)')"
        },
        condition: { 
          type: Type.STRING,
          description: "Kondisi fisik objek (contoh: 'Bersih, sedikit penyok, label masih menempel')"
        },
        estimatedScrapValue: { 
          type: Type.STRING,
          description: "Nilai rongsok mentah di pengepul sampah lokal (contoh: 'Rp 200 - Rp 500 / buah')"
        },
        box2d: {
          type: Type.ARRAY,
          items: { type: Type.INTEGER },
          description: "[ymin, xmin, ymax, xmax] normalized to 0-1000 scale representing the target waste item boundary"
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
            description: "Estimasi harga jual realistis di pasar kerajinan Indonesia (contoh: 'Rp 25.000 - Rp 35.000')"
          },
          summary: { 
            type: Type.STRING,
            description: "Ringkasan alasan kenapa ide ini sangat cocok dan menguntungkan"
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
            description: "Estimasi biaya alat & bahan tambahan di toko terdekat (contoh: 'Rp 5.000 - Rp 10.000')"
          },
          finishingTips: {
            type: Type.STRING,
            description: "Tips finishing estetik agar laku di Green Market BumiKita"
          }
        },
        required: ["id", "title", "difficulty", "benchmarkPrice", "materialsNeeded", "steps"]
      }
    }
  },
  required: ["detectedObject", "recommendations"]
};

// Fallback intelligence for testing or when GEMINI_API_KEY is not configured
function generateSmartFallbackAnalysis(userPrompt: string): WasteAnalysisResult {
  const p = (userPrompt || '').toLowerCase();

  // 1. Cardboard / Kardus
  if (p.includes('kardus') || p.includes('karton') || p.includes('box') || p.includes('sepatu')) {
    return {
      detectedObject: {
        label: 'Kotak Kardus Sepatu / Kemasan Karton',
        material: 'Karton Gelombang (Corrugated Cardboard)',
        dimension: 'Dimensi ~32 x 20 x 12 cm',
        condition: 'Struktur kokoh, sudut presisi, permukaan kering dan bersih',
        estimatedScrapValue: 'Rp 1.200 - Rp 2.500 / kg',
        box2d: [160, 180, 820, 820]
      },
      recommendations: [
        {
          id: 'rec-1',
          title: 'Aesthetic Multi-Tier Desk Organizer & Charging Station',
          difficulty: 'Mudah',
          estimatedTime: '25 Menit',
          benchmarkPrice: 'Rp 45.000 - Rp 65.000',
          summary: 'Mengubah kardus menjadi rak organizer meja minimalis 3 kompartemen dengan jalur rapi kabel charger smartphone.',
          materialsNeeded: [
            '1 buah kardus sepatu dari foto',
            'Sisa potongan kardus untuk sekat pembatas',
            'Kertas samson cokelat / koran vintage untuk pelapis luar',
            'Lem tembak / lem kayu PVAc'
          ],
          steps: [
            'Potong tutup kardus menjadi 2 bilah sekat sesuai lebar bagian dalam kotak.',
            'Buat potongan miring 45 derajat di sisi depan agar alat tulis mudah dijangkau.',
            'Lapisi seluruh permukaan dengan kertas samson cokelat untuk nuansa estetik Japandi.',
            'Buat lubang kecil di bagian belakang kompartemen ponsel untuk jalur kabel charger.',
            'Rekatkan sekat dengan lem tembak dan biarkan mengering sempurna selama 5 menit.'
          ],
          auxiliaryCost: 'Rp 8.000 (kertas samson & lem tembak)',
          finishingTips: 'Gunakan penggaris besi saat memotong dengan cutter agar garis lipatan tegak lurus rapi ala produk toko interior.'
        },
        {
          id: 'rec-2',
          title: 'Minimalist Book & Document File Sorter',
          difficulty: 'Mudah',
          estimatedTime: '20 Menit',
          benchmarkPrice: 'Rp 35.000 - Rp 50.000',
          summary: 'Tempat berkas kuliah, binder, dan buku catatan dengan desain vertikal hemat ruang meja belajar.',
          materialsNeeded: [
            'Kardus tebal',
            'Cat akrilik warna sage green atau putih',
            'Cutter & penggaris'
          ],
          steps: [
            'Posisikan kardus berdiri tegak secara vertikal.',
            'Potong diagonal bagian depan kardus membentuk pola file magazine holder.',
            'Haluskan tepi potongan dengan amplas halus atau selotip kertas.',
            'Cat permukaan kardus dengan warna pastel matte 2 lapis.'
          ],
          auxiliaryCost: 'Rp 10.000 (cat akrilik mini)',
          finishingTips: 'Beri label tag kayu mini atau stiker tipografi kaligrafi di bagian depan untuk kesan premium.'
        },
        {
          id: 'rec-3',
          title: 'Geometric Wall Shelf / Rak Dinding Hexagon',
          difficulty: 'Sedang',
          estimatedTime: '45 Menit',
          benchmarkPrice: 'Rp 60.000 - Rp 85.000',
          summary: 'Rak gantung dinding geometris untuk menaruh sukulen mini atau action figure dengan daya topang lapis ganda.',
          materialsNeeded: [
            '2 lembar kardus tebal lapis ganda',
            'Lem tembak ekstra kuat',
            'Tali rami goni untuk gantungan dinding'
          ],
          steps: [
            'Potong 6 bilah kardus dengan panjang 12 cm dan sudut 60 derajat.',
            'Rangkai bilah menjadi bentuk segi enam (hexagon) dan kuatkan dengan lem tembak.',
            'Lapisi kembali tiap sisi dengan bilah kedua agar struktur kokoh menopang beban.',
            'Warnai dengan pernis cokelat kayu atau cat hitam industrial.'
          ],
          auxiliaryCost: 'Rp 12.000 (lem tembak & tali rami)',
          finishingTips: 'Tumpuk 2-3 lapisan kardus bersamaan agar kekakuan rak menyamai papan kayu ringan.'
        }
      ]
    };
  }

  // 2. Denim / Fabric / Textile
  if (p.includes('jeans') || p.includes('celana') || p.includes('kain') || p.includes('baju') || p.includes('kaos') || p.includes('denim')) {
    return {
      detectedObject: {
        label: 'Celana Denim / Tekstil Katun Bekas',
        material: 'Serat Denim Katun Twill Tebal (12-14 oz)',
        dimension: 'Area kain efektif ~70 x 40 cm',
        condition: 'Serat kain kokoh, warna wash vintage, sobek minor di lutut',
        estimatedScrapValue: 'Rp 3.000 - Rp 5.000 / potong',
        box2d: [150, 200, 850, 800]
      },
      recommendations: [
        {
          id: 'rec-1',
          title: 'Urban Pocket Sling Bag / Tas Selempang Gadget',
          difficulty: 'Sedang',
          estimatedTime: '45 Menit',
          benchmarkPrice: 'Rp 75.000 - Rp 110.000',
          summary: 'Tas selempang Y2K trendy memanfaatkan saku belakang asli jeans sebagai slot smartphone instant-access.',
          materialsNeeded: [
            'Potongan kaki dan saku celana jeans dari foto',
            'Tali webbing katun 120 cm & ring gesper',
            'Resleting 20 cm',
            'Jarum jahit & benang jeans kuat'
          ],
          steps: [
            'Potong bagian saku belakang celana jeans dengan menyisakan batas jahitan 2 cm.',
            'Gunakan potongan kaki jeans sebagai badan tas berukuran 20 x 25 cm.',
            'Jahit saku belakang ke sisi depan tas untuk kompartemen kartu & HP.',
            'Pasang resleting di bagian bukaan atas.',
            'Pasang tali webbing dengan jahitan silang (box stitch) agar kuat menahan beban.'
          ],
          auxiliaryCost: 'Rp 15.000 (tali webbing & resleting)',
          finishingTips: 'Biarkan sedikit aksen rumbai (raw hem) pada tepian saku untuk nuansa streetwear kekinian.'
        },
        {
          id: 'rec-2',
          title: 'Anti-Scratch Laptop / Tablet Sleeve',
          difficulty: 'Sedang',
          estimatedTime: '35 Menit',
          benchmarkPrice: 'Rp 65.000 - Rp 90.000',
          summary: 'Sarung laptop empuk tahan banting memanfaatkan ketebalan katun denim lapis ganda.',
          materialsNeeded: [
            'Potongan paha jeans',
            'Busa angin 3mm / kain flanel bekas',
            'Kancing magnetik atau perekat velcro'
          ],
          steps: [
            'Ukur dimensi laptop ditambah toleransi 3 cm di tiap sisi.',
            'Potong kain denim dan selipkan busa angin di antara dua lapisan kain.',
            'Jahit sekeliling tiga sisi dengan teknik jahitan tindas yang rapat.',
            'Pasang velcro di flap penutup atas.'
          ],
          auxiliaryCost: 'Rp 10.000 (busa pelindung & velcro)',
          finishingTips: 'Kombinasikan potongan denim warna terang dan gelap untuk motif patchwork geometris.'
        },
        {
          id: 'rec-3',
          title: 'Minimalist Coffee Cup Sleeve & Coaster Set',
          difficulty: 'Mudah',
          estimatedTime: '15 Menit',
          benchmarkPrice: 'Rp 25.000 - Rp 35.000',
          summary: 'Pelindung panas gelas kopi takeaway dan tatakan cangkir meja belajar.',
          materialsNeeded: [
            'Bagian ban pinggang jeans atau saku koin',
            '1 kancing batok kelapa atau kayu',
            'Tali elastis 5 cm'
          ],
          steps: [
            'Potong ban pinggang jeans sepanjang lingkar cup kopi (~24 cm).',
            'Rapikan ujung potongan dan jahit tali elastis di satu sisi.',
            'Pasang kancing di sisi berlawanan agar bisa disesuaikan dengan berbagai ukuran gelas.',
            'Buat tatakan bulat dari sisa kain denim berlapis dua.'
          ],
          auxiliaryCost: 'Rp 3.000 (kancing kayu)',
          finishingTips: 'Bordir inisial nama kecil di sudut tatakan untuk sentuhan personalized craftsmanship.'
        }
      ]
    };
  }

  // 3. Default / Plastic Bottle (PET #1)
  return {
    detectedObject: {
      label: 'Botol Plastik Bekas Air Mineral',
      material: 'Plastik PET #1 (Polyethylene Terephthalate)',
      dimension: 'Volume 600ml (Tinggi ~21cm, Diameter ~6.5cm)',
      condition: 'Bersih, utuh tanpa sobek, sedikit berlekuk di badan botol',
      estimatedScrapValue: 'Rp 200 - Rp 500 / botol',
      box2d: [180, 260, 840, 740]
    },
    recommendations: [
      {
        id: 'rec-1',
        title: 'Self-Watering Minimalist Desk Planter',
        difficulty: 'Mudah',
        estimatedTime: '20 Menit',
        benchmarkPrice: 'Rp 25.000 - Rp 35.000',
        summary: 'Pot tanaman kapiler dua tingkat otomatis anti-layu, air tersuplai melalui sumbu kain selama 2-3 minggu tanpa perlu disiram harian.',
        materialsNeeded: [
          '1 botol plastik 600ml dari foto',
          'Sumbu katun / kain perca sepanjang 15 cm',
          'Media tanam (sekam bakar / tanah kompos)',
          'Bibit tanaman hias mini (sirih gading / sukulen)'
        ],
        steps: [
          'Bilas botol hingga bersih dari sisa label dan lem.',
          'Gunting atau potong botol melingkar tepat di 1/3 bagian atas (di bawah lekukan leher).',
          'Lubangi bagian tengah tutup botol diameter 4mm, lalu masukkan sumbu katun melintasi tutup.',
          'Balikkan bagian atas botol ke dalam potongan bawah (berfungsi sebagai wadah tanaman dan penampung air).',
          'Isi bagian bawah dengan 100ml air, lalu masukkan media tanam dan bibit ke corong atas.'
        ],
        auxiliaryCost: 'Rp 5.000 (tali sumbu & bibit tanaman)',
        finishingTips: 'Beri cat matte warna terakota atau pastel pada bagian corong atas agar tampak seperti keramik estetik.'
      },
      {
        id: 'rec-2',
        title: 'Aesthetic Stationery & Brush Holder',
        difficulty: 'Mudah',
        estimatedTime: '15 Menit',
        benchmarkPrice: 'Rp 20.000 - Rp 30.000',
        summary: 'Wadah alat tulis meja belajar dan kuas makeup dengan tepian halus tahan air.',
        materialsNeeded: [
          '1 botol plastik 600ml',
          'Cat akrilik pastel atau stiker vinyl tahan air',
          'Setrika hangat untuk menghaluskan bibir potongan botol'
        ],
        steps: [
          'Potong botol pada ketinggian 10 cm dari dasar botol.',
          'Tempelkan bibir potongan ke permukaan setrika hangat (suhu rendah) selama 4 detik untuk membulatkan tepian agar tidak tajam.',
          'Warnai dinding botol dengan cat akrilik atau balut dengan tali rami dari bawah ke atas.',
          'Beri pemberat batu kerikil kecil di dasar agar tidak mudah tumbang saat diisi banyak pulpen.'
        ],
        auxiliaryCost: 'Rp 4.000 (tali rami mini)',
        finishingTips: 'Lilitkan tali rami goni di 1/3 bagian bawah untuk aksen rustic Scandinavian.'
      },
      {
        id: 'rec-3',
        title: 'Zippered Travel Pouch & Cable Capsule',
        difficulty: 'Sedang',
        estimatedTime: '30 Menit',
        benchmarkPrice: 'Rp 30.000 - Rp 45.000',
        summary: 'Kapsul wadah kabel charger, flashdisk, dan koin dengan resleting sambung anti-tumpah.',
        materialsNeeded: [
          '2 dasar botol plastik ukuran sama',
          'Resleting pakaian ukuran 20 cm',
          'Lem tembak serbaguna'
        ],
        steps: [
          'Potong dasar dari 2 botol plastik dengan tinggi masing-masing 6 cm.',
          'Gunakan setrika hangat sebentar untuk meratakan bibir potongan.',
          'Rekatkan pita resleting di sekeliling bibir botol pertama menggunakan lem tembak perlahan.',
          'Rekatkan sisi resleting lainnya ke bibir botol kedua saat resleting dalam posisi terbuka.',
          'Tutup resleting untuk menguji kelancaran buka-tutup kapsul organizer.'
        ],
        auxiliaryCost: 'Rp 6.000 (resleting 20cm & lem tembak)',
        finishingTips: 'Pilih warna resleting kontras (misal kuning mustard atau forest green) agar tampil playful dan eye-catching.'
      }
    ]
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt = '', imageBase64 = '', mimeType = 'image/jpeg' } = body;

    const aiClient = getGeminiClient();

    // If Gemini client is not initialized (no key), immediately provide smart contextual fallback
    if (!aiClient) {
      const fallback = generateSmartFallbackAnalysis(prompt);
      return NextResponse.json({
        success: true,
        data: fallback,
        isFallback: true,
        detectedItemName: fallback.detectedObject.label,
        detectedMaterialType: fallback.detectedObject.material,
        projectName: fallback.recommendations[0]?.title,
      });
    }

    const systemInstruction = `You are "BumiKita AI Vision & Smart Upcycling Engine", an expert in zero-waste engineering, Indonesian craft economics, and multimodal computer vision.

YOUR GOALS:
1. OBJECT DETECTION & LOCALIZATION:
   - Identify the primary foreground discarded/waste item in the image.
   - Strictly ignore backgrounds (tables, tiles, hands, floors).
   - Return precise normalized bounding box [ymin, xmin, ymax, xmax] in 0-1000 scale.
2. DEEP MATERIAL AUDIT:
   - Label: Specific waste item name in Indonesian.
   - Material: Polymer/material composition (e.g. Plastik PET #1, Aluminium, Kardus Corrugated, Denim).
   - Dimension: Estimated realistic physical size.
   - Condition: Physical state (cleanliness, dents, intactness).
   - Estimated Scrap Value: Realistic scrap value in IDR at local Indonesian waste collectors (e.g. "Rp 200 - Rp 500 / botol").
3. DYNAMIC RECOMMENDATIONS (GENERATE AT LEAST 3 DISTINCT PRODUCTS):
   - Respect user prompt/intent if given (e.g., if user wants planter, prioritize planter styles; if blank, suggest 3 top practical items).
   - Difficulty: 'Mudah' | 'Sedang' | 'Menantang'.
   - Estimated Time: realistic crafting duration.
   - Benchmark Price: Realistic craft selling price in Indonesian marketplace (e.g. "Rp 25.000 - Rp 35.000"), NOT inflated prices.
   - Summary: Compelling 1-2 sentence reason why this item is great to make.
   - Materials Needed: Clear bullet points including the detected item and auxiliary supplies.
   - Steps: Numbered, clear instructions in natural Indonesian.
   - Auxiliary Cost: Estimated extra cost for glue, paint, or cords.
   - Finishing Tips: Concrete finishing advice to make it look premium on BumiKita Green Market.`;

    const contentsPayload: any[] = [];

    // Add image if provided
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contentsPayload.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const userPromptText = imageBase64
      ? `Detect and analyze the discarded waste item in this photo.
User creative intent / desired craft: "${prompt?.trim() || 'Rekomendasikan 3 ide kreasi upcycling paling estetik, fungsional, dan bernilai jual tinggi untuk barang ini'}"

Detect the foreground waste object with normalized box2d [ymin, xmin, ymax, xmax] (0-1000), provide a deep material audit, and generate at least 3 distinct, realistic upcycling product recommendations with complete step-by-step blueprints.`
      : `Generate smart waste upcycling blueprint based on: "${prompt || 'Botol Plastik Air Mineral PET 600ml'}"`;

    contentsPayload.push({
      text: userPromptText,
    });

    // Call latest gemini-3.8-flash model with structured JSON schema
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsPayload,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for high bounding-box fidelity & structured precision
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Empty response received from Gemini');
    }

    const parsedData: WasteAnalysisResult = JSON.parse(responseText);

    // Validate box2d values
    if (
      !parsedData.detectedObject?.box2d || 
      !Array.isArray(parsedData.detectedObject.box2d) || 
      parsedData.detectedObject.box2d.length !== 4
    ) {
      parsedData.detectedObject.box2d = [180, 240, 840, 760];
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      isFallback: false,
      // Backwards compatibility mappings
      detectedItemName: parsedData.detectedObject.label,
      detectedMaterialType: parsedData.detectedObject.material,
      projectName: parsedData.recommendations[0]?.title,
    });

  } catch (err: any) {
    console.error('Error in /api/gemini/upcycle:', err);
    // Provide graceful smart fallback on any error so user experience never fails
    const fallback = generateSmartFallbackAnalysis('');
    return NextResponse.json({
      success: true,
      data: fallback,
      isFallback: true,
      fallbackReason: err?.message || 'Server processed with default analysis',
      detectedItemName: fallback.detectedObject.label,
      detectedMaterialType: fallback.detectedObject.material,
      projectName: fallback.recommendations[0]?.title,
    });
  }
}
