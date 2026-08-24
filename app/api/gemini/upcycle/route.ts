import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/src/lib/gemini';
import { Type } from '@google/genai';

function generateSmartFallbackBlueprint(promptText: string, skillLevel: string) {
  const p = (promptText || '').toLowerCase();
  
  if (p.includes('jeans') || p.includes('celana') || p.includes('denim') || p.includes('kain') || p.includes('baju') || p.includes('kaos') || p.includes('tas') || p.includes('pouch') || p.includes('fashion') || p.includes('selempang')) {
    return {
      detectedItemName: 'Pakaian & Tekstil Bekas (Jeans / Kain Perca)',
      detectedMaterialType: 'Denim / Katun Tekstil Daur Ulang',
      projectName: 'Upcycled Patchwork Denim Tech Sling & Pouch',
      tagline: 'Mengubah sisa kain/denim usang menjadi tas selempang streetwear Y2K fungsional untuk gadget kampus.',
      vibe: 'Y2K Gorpcore & Campus Streetwear',
      difficulty: skillLevel === 'Beginner' ? 'Super Easy (Tanpa Jahit / Lem Kain)' : 'Moderate (Crafty Stitching)',
      timeEstimate: skillLevel === 'Beginner' ? '15-20 Menit' : '25-35 Menit',
      estimatedValueIdr: 85000,
      co2SavedKg: 4.8,
      landfillDivertedGrams: 420,
      pointsRewarded: 85,
      requiredMaterials: [
        'Kain jeans/pakaian bekas dari foto',
        'Tali webbing / sabuk bekas untuk strap tas',
        '1 buah kancing cadangan / magnet penutup',
        'Furing dalaman dari payung rusak / kain tipis',
      ],
      toolsNeeded: ['Gunting kain tajam', 'Penggaris & kapur penanda', skillLevel === 'Beginner' ? 'Lem kain / Fabric glue' : 'Jarum jahit & benang jeans'],
      steps: [
        {
          stepNumber: 1,
          title: 'Pemotongan Pola Kantong & Badan Tas',
          instruction: 'Gunting bagian kain jeans/pakaian beserta 2 cm sisa kampuh di sekelilingnya untuk dijadikan kompartemen utama kartu dan HP.',
          tip: 'Pertahankan jahitan asli saku untuk memberikan estetika deconstructed vintage.',
          timeMinutes: 5,
        },
        {
          stepNumber: 2,
          title: 'Pemasangan Tali Selempang (Strap)',
          instruction: 'Gunting bagian pinggang jeans memanjang atau gunakan tali serut hoodie lama sebagai strap selempang.',
          tip: 'Gunakan simpul silang ganda agar strap kuat menopang beban HP dan dompet.',
          timeMinutes: 8,
        },
        {
          stepNumber: 3,
          title: 'Finishing & Detail Kancing Magnet',
          instruction: 'Tempelkan penutup flap di bagian atas dan pasang kancing penutup. Tambahkan rumbai raw-hem di sisi bawah untuk aksen edgy.',
          tip: 'Semprotkan sedikit cairan lilin lebah (beeswax) jika ingin efek semi waterproof.',
          timeMinutes: 7,
        },
      ],
      stylingTips: 'Padukan dengan oversized graphic tee atau hoodie vintage. Pasang carabiner keychain metalik di loop sabuknya untuk nuansa utilitarian gorpcore.',
      safetyNote: 'Hati-hati saat menggunting sambungan jahitan jeans yang tebal.',
    };
  }

  if (p.includes('botol') || p.includes('plastik') || p.includes('pet') || p.includes('cup') || p.includes('boba') || p.includes('gelas') || p.includes('pot') || p.includes('tanaman')) {
    return {
      detectedItemName: 'Wadah Plastik Bekas Minuman (Botol PET / Cup Boba)',
      detectedMaterialType: 'Plastik Polimer PET / PP Transparan',
      projectName: 'Self-Watering Minimalist Desk Planter & Stationery Pot',
      tagline: 'Pot tanaman estetik otomatis siram dan tempat alat tulis dari wadah plastik bekas.',
      vibe: 'Clean Minimalist & Botanical Campus',
      difficulty: 'Super Easy (5 min)',
      timeEstimate: '10-15 Menit',
      estimatedValueIdr: 45000,
      co2SavedKg: 2.3,
      landfillDivertedGrams: 180,
      pointsRewarded: 60,
      requiredMaterials: [
        'Botol plastik / cup kemasan bekas dari foto',
        'Sumbu kompor / tali kain katun / benang wol tebal',
        'Tanaman hias kecil (sukulen / sirih gading)',
        'Media tanam (tanah / sekam bakar)',
      ],
      toolsNeeded: ['Cutter / gunting serbaguna', 'Paku kecil / solder (opsional untuk lubang sumbu)', 'Cat akrilik / stiker waterproof'],
      steps: [
        {
          stepNumber: 1,
          title: 'Potong Botol Menjadi Dua Bagian',
          instruction: 'Bersihkan botol dan potong melingkar di tengah (sekitar 1/3 bagian atas untuk wadah tanaman, 2/3 bawah untuk penampung air).',
          tip: 'Gunakan selotip kertas sebagai pemandu agar garis potongan lurus sempurna.',
          timeMinutes: 4,
        },
        {
          stepNumber: 2,
          title: 'Pasang Sumbu Kapiler',
          instruction: 'Buat lubang kecil pada tutup botol, masukkan tali katun/wol sepanjang 15 cm melintasi tutup botol sebagai sumbu penyerap air.',
          tip: 'Pastikan ujung bawah tali menyentuh dasar air di botol bagian bawah.',
          timeMinutes: 4,
        },
        {
          stepNumber: 3,
          title: 'Isi Media & Hias Estetik',
          instruction: 'Balikkan corong botol ke dalam wadah bawah, masukkan media tanam dan tanaman sirih gading. Hias bagian luar dengan stiker minimalis.',
          tip: 'Kamu hanya perlu mengisi air sebulan sekali karena sistem kapiler menyiram otomatis!',
          timeMinutes: 5,
        },
      ],
      stylingTips: 'Letakkan di sudut meja belajar dekat lampu baca atau jendela kamar kost untuk memberikan sentuhan biophilic workspace yang menyegarkan mata.',
      safetyNote: 'Ratakan tepi potongan plastik dengan amplas halus atau selotip agar tidak tajam di jari.',
    };
  }

  if (p.includes('kardus') || p.includes('kotak') || p.includes('karton') || p.includes('box') || p.includes('sepatu') || p.includes('organizer') || p.includes('meja')) {
    return {
      detectedItemName: 'Kardus Karton / Kotak Kemasan Bekas',
      detectedMaterialType: 'Corrugated Cardboard & Kraft Paper',
      projectName: 'Modular Aesthetic Desk Organizer & Tech Charging Dock',
      tagline: 'Organizer meja belajar modular bertingkat dengan slot manajemen kabel HP dan laptop.',
      vibe: 'Aesthetic Scandinavian Workspace',
      difficulty: 'Moderate (Crafty)',
      timeEstimate: '20-25 Menit',
      estimatedValueIdr: 65000,
      co2SavedKg: 3.6,
      landfillDivertedGrams: 380,
      pointsRewarded: 75,
      requiredMaterials: [
        'Kardus bekas kemasan paket online / kotak sepatu dari foto',
        'Kertas kado kraft cokelat / kalender bekas',
        'Lem kertas / double tape busa',
      ],
      toolsNeeded: ['Cutter tajam', 'Penggaris besi', 'Pensil'],
      steps: [
        {
          stepNumber: 1,
          title: 'Desain & Potong Kompartemen Sekat',
          instruction: 'Bagi kotak menjadi 3 zona: slot buku catatan tegak, baki alat tulis horizontal, dan dock dudukan HP.',
          tip: 'Potong sudut miring 45 derajat pada sisi depan agar pulpen dan sticky notes mudah diambil.',
          timeMinutes: 8,
        },
        {
          stepNumber: 2,
          title: 'Buat Jalur Kabel (Cable Pass-Through)',
          instruction: 'Buat lubang oval 1x2 cm di bagian belakang zona dudukan HP untuk jalur colokan kabel charger.',
          tip: 'Meja kost akan bebas dari kabel kusut berantakan!',
          timeMinutes: 5,
        },
        {
          stepNumber: 3,
          title: 'Finishing Lapisan Kraft Estetik',
          instruction: 'Lapisi seluruh permukaan kardus dengan kertas kraft cokelat atau kalender bekas bernuansa monokrom.',
          tip: 'Gunakan lem tipis merata agar tidak bergelembung.',
          timeMinutes: 7,
        },
      ],
      stylingTips: 'Tambahkan label kecil bertuliskan font typewriter untuk memisahkan kategori notes, kalkulator, dan stationeries.',
      safetyNote: 'Selalu gunakan alas potong (cutting mat/kayu) saat menggunakan cutter.',
    };
  }

  // Universal smart creative fallback
  return {
    detectedItemName: 'Sampah Daur Ulang Rumah Tangga',
    detectedMaterialType: 'Material Sekunder & Kemasan Bekas',
    projectName: 'Multi-Utility Eco-Chic Everyday Carry',
    tagline: 'Karya upcycling fungsional dan trendi dari barang bekas rumah tangga harian.',
    vibe: 'Modern Eco-Minimalist',
    difficulty: skillLevel === 'Beginner' ? 'Super Easy (5 min)' : 'Moderate (Crafty)',
    timeEstimate: '15-25 Menit',
    estimatedValueIdr: 55000,
    co2SavedKg: 2.8,
    landfillDivertedGrams: 260,
    pointsRewarded: 70,
    requiredMaterials: [
      'Barang bekas utama dari foto / wadah kemasan',
      'Tali / perekat / bahan pengikat bekas',
      'Aksen dekoratif (stiker, cat, atau kain perca)',
    ],
    toolsNeeded: ['Gunting serbaguna', 'Penggaris', 'Lem serbaguna / perekat kuat'],
    steps: [
      {
        stepNumber: 1,
        title: 'Pembersihan & Dekonstruksi Material',
        instruction: 'Bersihkan material dari debu atau residu. Pisahkan bagian yang akan dijadikan struktur utama.',
        tip: 'Material yang bersih akan membuat daya rekat lem dan tampilan akhir jauh lebih premium.',
        timeMinutes: 5,
      },
      {
        stepNumber: 2,
        title: 'Pembentukan Struktur & Perakitan Fungsional',
        instruction: 'Bentuk material sesuai ergonomi penggunaan sehari-hari, lalu rekatkan sambungan dengan kuat.',
        tip: 'Pastikan titik tumpu utama diberi penguat ganda.',
        timeMinutes: 10,
      },
      {
        stepNumber: 3,
        title: 'Detailing Estetika & Sentuhan Akhir',
        instruction: 'Rapikan sudut-sudut tajam dan tambahkan elemen personalisasi sesuai gaya kesukaanmu.',
        tip: 'Karya siap dipamerkan di feed komunitas BumiKita!',
        timeMinutes: 5,
      },
    ],
    stylingTips: 'Tonjolkan tekstur asli material daur ulang untuk menunjukkan authenticity zero-waste craftsmanship.',
    safetyNote: 'Gunakan sarung tangan jika memegang material dengan tepi tajam.',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, imageBase64, mimeType, skillLevel = 'Beginner' } = body;

    if (!prompt && !imageBase64) {
      return NextResponse.json(
        { error: 'Prompt or image is required' },
        { status: 400 }
      );
    }

    const aiClient = getGeminiClient();

    // If Gemini API Key is not configured, return smart contextual blueprint directly
    if (!aiClient) {
      const fallbackData = generateSmartFallbackBlueprint(prompt, skillLevel);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        isFallback: true,
      });
    }

    const systemInstruction = `You are "BumiKita AI Vision & Maker", the world's premier Upcycling & Waste-to-Worth expert designed for Gen Z (15-24 years old, students and young creators).

CRITICAL VISION & RECOGNITION MANDATE:
1. When an image is provided, YOU MUST VISUALLY INSPECT the photo to autonomously identify what discarded item/waste material is shown (e.g. old denim jeans, plastic bottles, boba cups, shoe boxes, cardboard, snack packaging, fabric scraps, electronics, tin cans, glass jars, etc.), noting its shape, color, and condition.
2. The user only needs to describe WHAT THEY WANT TO MAKE (e.g. "Ingin dijadikan tas selempang", "Jadikan pot tanaman estetik", "Bikin organizer meja kost", or even leave it completely empty / blank). THE USER DOES NOT NEED TO DESCRIBE THE WASTE MATERIAL—you must understand it directly from the image!
3. Formulate the most practical, trendy, high-value step-by-step DIY upcycling blueprint that transforms the visually detected waste item into the user's desired item (or your best recommended creative Gen-Z creation if the prompt is empty).
4. Accurately set 'detectedItemName' (e.g. "Celana Jeans Denim Bekas") and 'detectedMaterialType' (e.g. "Denim & Katun Tekstil").
5. Provide clear, realistic instructions tailored to the chosen skill level (${skillLevel}).
6. Keep the language in friendly, modern Indonesian (Gen-Z friendly, free of preachy jargon).
7. Quantify the positive ecological impact (CO2 saved, grams of landfill diverted) and estimated monetary resale value in IDR.`;

    const contentsPayload: any = [];

    // If image provided
    if (imageBase64) {
      contentsPayload.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
    }

    const userTextPrompt = imageBase64
      ? `[MULTIMODAL AI VISION TASK]
1. Visually identify the discarded waste item and material shown in this photo.
2. What the user wants to make: "${prompt?.trim() || 'Rekomendasikan kreasi upcycling paling estetik, fungsional, dan bernilai tinggi dari barang bekas di foto ini'}"
3. Maker Skill Level: ${skillLevel}

Generate a complete, structured upcycling DIY blueprint transforming the visual waste item from the photo into the requested creation.`
      : `Transform this discarded item/waste into an amazing upcycle project:
User Goal / Description: "${prompt || 'Suggest the best creative upcycling project for this item'}"
Target Skill Level: ${skillLevel}

Generate a detailed, step-by-step upcycling plan with materials, tools, aesthetic styling tips, safety advice, and eco-metrics.`;

    contentsPayload.push({
      text: userTextPrompt,
    });

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsPayload,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedItemName: {
                type: Type.STRING,
                description: 'Identified waste item from photo (e.g. "Celana Jeans Denim Bekas", "Botol Plastik PET 600ml", "Kardus Sepatu Bekas")',
              },
              detectedMaterialType: {
                type: Type.STRING,
                description: 'Detected material category (e.g. "Denim / Tekstil Katun", "Plastik PET Polimer", "Corrugated Cardboard")',
              },
              projectName: {
                type: Type.STRING,
                description: 'Catchy, creative name for the upcycled product (e.g., "Upcycled Denim Crossbody Tech Pouch")',
              },
              tagline: {
                type: Type.STRING,
                description: 'Punchy 1-sentence value proposition or vibe',
              },
              vibe: {
                type: Type.STRING,
                description: 'Aesthetic style: e.g., "Y2K Gorpcore", "Clean Minimalist", "Cozy Cottagecore", "Aesthetic Desk Minimal"',
              },
              difficulty: {
                type: Type.STRING,
                description: 'Difficulty level: "Super Easy (5 min)" | "Moderate (Crafty)" | "Pro Maker"',
              },
              timeEstimate: {
                type: Type.STRING,
                description: 'Estimated total crafting time, e.g., "25-30 Menit"',
              },
              estimatedValueIdr: {
                type: Type.NUMBER,
                description: 'Estimated market resale value in Indonesian Rupiah, e.g., 75000',
              },
              co2SavedKg: {
                type: Type.NUMBER,
                description: 'Estimated kg of CO2 equivalent emissions saved by upcycling',
              },
              landfillDivertedGrams: {
                type: Type.NUMBER,
                description: 'Weight of waste prevented from entering landfill in grams, e.g., 350',
              },
              pointsRewarded: {
                type: Type.NUMBER,
                description: 'Daun Points rewarded to user upon completing this DIY (between 30 and 120)',
              },
              requiredMaterials: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of recyclable waste materials and secondary materials needed',
              },
              toolsNeeded: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of household tools needed (e.g. Scissors, hot glue, needle & thread, ruler)',
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    instruction: { type: Type.STRING },
                    tip: { type: Type.STRING },
                    timeMinutes: { type: Type.NUMBER },
                  },
                  required: ['stepNumber', 'title', 'instruction', 'timeMinutes'],
                },
              },
              stylingTips: {
                type: Type.STRING,
                description: 'Gen-Z styling and aesthetic presentation advice',
              },
              safetyNote: {
                type: Type.STRING,
                description: 'Safety precautions (e.g. handling blades, hot glue, iron)',
              },
            },
            required: [
              'detectedItemName',
              'detectedMaterialType',
              'projectName',
              'tagline',
              'vibe',
              'difficulty',
              'timeEstimate',
              'estimatedValueIdr',
              'co2SavedKg',
              'landfillDivertedGrams',
              'pointsRewarded',
              'requiredMaterials',
              'toolsNeeded',
              'steps',
              'stylingTips',
            ],
          },
        },
      });

      const jsonText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(jsonText);

      return NextResponse.json({
        success: true,
        data: parsedData,
      });
    } catch (aiError: any) {
      console.warn('Gemini API call failed, using intelligent fallback:', aiError?.message);
      // Seamlessly fallback to smart contextual recipe
      const fallbackData = generateSmartFallbackBlueprint(prompt, skillLevel);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        isFallback: true,
      });
    }
  } catch (error: any) {
    console.error('Error in upcycle route handler:', error);
    const fallbackData = generateSmartFallbackBlueprint('', 'Beginner');
    return NextResponse.json({
      success: true,
      data: fallbackData,
      isFallback: true,
    });
  }
}

