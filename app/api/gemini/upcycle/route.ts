import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/src/lib/gemini';
import { Type } from '@google/genai';

function generateSmartFallbackBlueprint(promptText: string, skillLevel: string) {
  const p = (promptText || '').toLowerCase();
  
  if (p.includes('jeans') || p.includes('celana') || p.includes('denim') || p.includes('kain') || p.includes('baju') || p.includes('kaos') || p.includes('tas') || p.includes('pouch') || p.includes('fashion') || p.includes('selempang')) {
    return {
      detectedItemName: 'Celana Jeans Denim Bekas & Kain Perca',
      detectedMaterialType: 'Heavy Denim Cotton 100% Recyclable',
      detectedCondition: 'Serat kain kuat & tebal, cocok untuk jahitan struktur tas tanpa perlu furing tebal tambahan.',
      projectName: 'Upcycled Patchwork Denim Tech Sling & Campus Pouch',
      tagline: 'Tas selempang streetwear utilitarian beraksen saku vintage untuk menyimpan HP, dompet, dan TWS.',
      vibe: 'Y2K Gorpcore & Urban Streetwear',
      productDescription: 'Tas selempang multifungsi berukuran 22 x 16 cm dengan 2 kompartemen utama. Menggunakan saku asli jeans sebagai slot kartu cepat, strap adjustable dari waistband, serta penutup magnetik/kancing untuk melindungi gadget saat bepergian ke kampus.',
      difficulty: skillLevel === 'Beginner' ? 'Super Easy (Tanpa Jahit / Lem Kain)' : 'Moderate (Crafty Stitching)',
      timeEstimate: skillLevel === 'Beginner' ? '15-20 Menit' : '25-35 Menit',
      estimatedValueIdr: 85000,
      co2SavedKg: 4.8,
      landfillDivertedGrams: 420,
      pointsRewarded: 85,
      benefits: {
        economic: 'Menghemat pengeluaran belanja tas selempang baru senilai Rp 85.000 - Rp 150.000 di toko ritel.',
        environmental: 'Mencegah 420 gram serat tekstil sintetis/katun menumpuk puluhan tahun di TPA dan menghemat ~2.000 liter air dari konsumsi pakaian baru.',
        practical: 'Menghasilkan tas gadget tangguh tahan gesek dengan saku akses instan untuk kartu e-money dan earphone.',
      },
      requiredMaterials: [
        '1 potong bagian kaki atau saku celana jeans bekas dari foto',
        'Waistband (ban pinggang) celana atau tali hoodie bekas untuk strap selempang',
        '1 buah kancing cadangan / magnet penutup atau perekat velcro',
        'Kain perca tipis (opsional untuk lapisan dalam/furing)',
      ],
      toolsNeeded: ['Gunting kain tajam', 'Penggaris & kapur penanda', skillLevel === 'Beginner' ? 'Lem kain tahan cuci (fabric glue)' : 'Jarum jahit & benang jeans no. 30'],
      steps: [
        {
          stepNumber: 1,
          title: 'Pemotongan & Pemetaan Pola Kantong',
          instruction: 'Potong bagian saku belakang celana jeans dengan menyisakan 2 cm keliling kain di sekitarnya untuk kampuh jahitan/rekat. Potong persegi panjang 24 x 18 cm dari potongan kaki celana untuk badan tas.',
          tip: 'Pertahankan jahitan asli saku untuk memberikan estetika deconstructed vintage yang bernilai jual tinggi.',
          timeMinutes: 5,
        },
        {
          stepNumber: 2,
          title: 'Pemasangan Tali Selempang (Strap)',
          instruction: 'Gunting ban pinggang jeans (waistband) memanjang. Pasang kedua ujungnya di sisi dalam kanan dan kiri badan tas menggunakan jahitan silang kotak ganda atau lem kain kuat.',
          tip: 'Gunakan simpul silang ganda agar strap kuat menopang beban HP berat dan dompet.',
          timeMinutes: 8,
        },
        {
          stepNumber: 3,
          title: 'Finishing & Detail Kancing Magnet',
          instruction: 'Lipat bagian penutup atas (flap) sebesar 5 cm ke arah depan. Pasangkan kancing atau magnet di bagian dalam flap dan badan tas. Tambahkan raw-hem (rumbai benang) pada tepian bawah untuk sentuhan edgy.',
          tip: 'Semprotkan sedikit lilin lebah (beeswax) tipis pada permukaan luar jika ingin efek water-repellent.',
          timeMinutes: 7,
        },
      ],
      stylingTips: 'Padukan dengan oversized graphic t-shirt dan sneakers. Pasangkan gantungan carabiner metalik pada loop sabuk tas untuk menonjolkan estetika gorpcore modern.',
      safetyNote: 'Hati-hati saat menggunting sambungan jahitan denim yang tebal agar gunting tidak meleset.',
    };
  }

  if (p.includes('botol') || p.includes('plastik') || p.includes('pet') || p.includes('cup') || p.includes('boba') || p.includes('gelas') || p.includes('pot') || p.includes('tanaman')) {
    return {
      detectedItemName: 'Botol Plastik PET 600ml / Cup Minuman Plastik',
      detectedMaterialType: 'Polyethylene Terephthalate (PET #1) Food Grade',
      detectedCondition: 'Wadah plastik transparan utuh, kedap air, sangat ideal untuk media hidroponik kapiler.',
      projectName: 'Self-Watering Minimalist Desk Planter & Stationery Pot',
      tagline: 'Pot tanaman estetik dengan sistem irigasi kapiler otomatis anti-layu untuk meja belajar & kamar kost.',
      vibe: 'Clean Minimalist & Biophilic Workspace',
      productDescription: 'Pot tanaman modern dua tingkat (dual-chamber) yang memanfaatkan gaya kapilaritas sumbu katun untuk menyuplai air secara konstan ke akar tanaman. Pengguna hanya perlu mengisi air reservoir sebulan sekali tanpa takut tanaman mati kekeringan saat ditinggal libur semester.',
      difficulty: 'Super Easy (5 min)',
      timeEstimate: '10-15 Menit',
      estimatedValueIdr: 45000,
      co2SavedKg: 2.3,
      landfillDivertedGrams: 180,
      pointsRewarded: 60,
      benefits: {
        economic: 'Menghemat biaya pot dekorasi meja seharga Rp 35.000 - Rp 60.000 di toko dekorasi interior.',
        environmental: 'Mencegah plastik PET mencemari laut dan membutuhkan 450+ tahun untuk terurai di alam bebas.',
        practical: 'Perawatan tanaman zero-effort tanpa perlu menyiram harian karena air tersuplai otomatis sesuai kebutuhan akar.',
      },
      requiredMaterials: [
        '1-2 botol plastik bekas transparan (ukuran 600ml atau 1.5L) dari foto',
        'Sumbu katun / tali kain kaos bekas sepanjang 15 cm',
        'Tanaman hias mini (sirih gading, sukulen, atau mint)',
        'Media tanam ringan (sekam bakar / batu hidroton / tanah subur)',
      ],
      toolsNeeded: ['Cutter / gunting serbaguna', 'Paku kecil / solder untuk melubangi tutup', 'Cat akrilik / selotip kertas / stiker vinyl'],
      steps: [
        {
          stepNumber: 1,
          title: 'Potong & Bagi Botol Menjadi Dua Bagian',
          instruction: 'Bilas botol hingga bebas dari residu gula/minuman. Potong melingkar tepat di 1/3 bagian atas botol. Bagian atas (corong) akan menjadi wadah tanaman, sedangkan bagian bawah menjadi tangki air.',
          tip: 'Pasang selotip kertas melingkar sebagai garis panduan agar potongan cutter rapi dan lurus presisi.',
          timeMinutes: 4,
        },
        {
          stepNumber: 2,
          title: 'Pasang Sumbu Kapiler pada Tutup Botol',
          instruction: 'Lubangi bagian tengah tutup botol (diameter ~5 mm). Masukkan tali sumbu katun melintasi tutup botol hingga menyisakan 7 cm di sisi bawah dan 5 cm di dalam corong atas.',
          tip: 'Basahi tali katun terlebih dahulu dengan air sebelum dipasang agar daya serap kapiler langsung aktif.',
          timeMinutes: 4,
        },
        {
          stepNumber: 3,
          title: 'Pemasangan Media & Finishing Estetik',
          instruction: 'Letakkan corong botol terbalik ke dalam dasar wadah. Masukkan media tanam dan tanam bibit sirih gading. Isi tangki bawah dengan 100ml air hingga ujung tali terendam sempurna. Hias dinding luar botol dengan cat pastel atau stiker.',
          tip: 'Letakkan di dekat jendela yang terkena sinar matahari tidak langsung untuk fotosintesis optimal.',
          timeMinutes: 5,
        },
      ],
      stylingTips: 'Tempatkan di samping monitor laptop atau rak buku. Warna hijau tanaman berpadu dengan aksen transparan botol memberi nuansa calm & biophilic.',
      safetyNote: 'Ratakan tepian plastik hasil potongan dengan amplas halus atau lapisi selotip transparan agar tidak melukai kulit.',
    };
  }

  if (p.includes('kardus') || p.includes('kotak') || p.includes('karton') || p.includes('box') || p.includes('sepatu') || p.includes('organizer') || p.includes('meja')) {
    return {
      detectedItemName: 'Kotak Kardus Sepatu / Kemasan Paket Karton Corrugated',
      detectedMaterialType: 'Corrugated Kraft Cardboard High Rigidity',
      detectedCondition: 'Karton tebal bergelombang dengan sudut presisi, berdaya topang kokoh untuk perkakas meja.',
      projectName: 'Modular Aesthetic Desk Organizer & Tech Charging Dock',
      tagline: 'Organizer meja belajar modular bertingkat dengan slot manajemen kabel HP dan kompartemen stationery rapi.',
      vibe: 'Aesthetic Scandinavian & Japandi Workspace',
      productDescription: 'Rak organizer meja minimalis 3 zona yang mengintegrasikan slot penyimpanan buku/kalkulator vertikal, laci baki horizontal untuk alat tulis, serta dudukan smartphone dengan lubang kabel charger tersembunyi agar meja belajar selalu bersih dan estetik.',
      difficulty: 'Moderate (Crafty)',
      timeEstimate: '20-25 Menit',
      estimatedValueIdr: 65000,
      co2SavedKg: 3.6,
      landfillDivertedGrams: 380,
      pointsRewarded: 75,
      benefits: {
        economic: 'Menghemat biaya pembelian desk organizer kayu/akrilik seharga Rp 60.000 - Rp 120.000.',
        environmental: 'Mendaur ulang 380g limbah karton kemasan e-commerce yang menyumbang volume sampah perkotaan.',
        practical: 'Merapikan 15+ jenis alat tulis, kabel charger, dan gadget ke dalam satu tempat yang teratur dan rapi.',
      },
      requiredMaterials: [
        '1 buah kotak kardus sepatu / kardus paket dari foto',
        'Kardus tambahan untuk papan sekat pemisah',
        'Kertas kado kraft cokelat / kertas koran bekas bermotif vintage',
        'Lem kertas PVAc / double tape busa kuat',
      ],
      toolsNeeded: ['Cutter tajam', 'Penggaris besi panjang', 'Pensil & alas potong (cutting mat)'],
      steps: [
        {
          stepNumber: 1,
          title: 'Desain Pola & Pemotongan Sekat Bertingkat',
          instruction: 'Gunting tutup kardus menjadi 2 bilah sekat berukuran pas dengan lebar kotak. Buat kemiringan 45 derajat pada sisi depan kardus utama agar pulpen dan sticky notes mudah dijangkau.',
          tip: 'Gunakan penggaris besi saat memotong dengan cutter agar garis potongan tegak lurus sempurna tanpa serat robek.',
          timeMinutes: 8,
        },
        {
          stepNumber: 2,
          title: 'Pembuatan Slot Dudukan HP & Jalur Kabel Charger',
          instruction: 'Buat lubang oval berukuran 1.5 x 3 cm di bagian bawah dinding belakang kotak untuk akses kepala kabel charger smartphone.',
          tip: 'Dengan lubang ini, handphone dapat diisi daya dalam posisi berdiri tanpa ada kabel menjuntai berantakan.',
          timeMinutes: 5,
        },
        {
          stepNumber: 3,
          title: 'Pelapisan Estetik Kertas Kraft & Perakitan Sekat',
          instruction: 'Lapisi seluruh permukaan luar dan dalam kardus dengan kertas kraft cokelat menggunakan lem tipis merata. Rekatkan bilah sekat ke dasar kotak dengan lem atau double tape kuat.',
          tip: 'Tekan permukaan kertas dengan kain kering agar tidak ada gelembung udara yang terperangkap.',
          timeMinutes: 7,
        },
      ],
      stylingTips: 'Tempelkan label teks tipografi minimalis pada setiap sekat untuk memisahkan kategori notes, kalkulator, dan pensil.',
      safetyNote: 'Selalu gunakan alas pemotong kayu/kardus tebal dan jangan menempatkan jari terlalu dekat dengan mata cutter.',
    };
  }

  // Universal smart creative fallback
  return {
    detectedItemName: 'Limbah Padat Rumah Tangga & Kemasan Produk',
    detectedMaterialType: 'Secondary Composite & Rigid Recyclables',
    detectedCondition: 'Material masih kokoh dan memiliki potensi struktur kuat untuk diolah kembali.',
    projectName: 'Multi-Utility Eco-Chic Everyday Carry & Workspace Organizer',
    tagline: 'Karya upcycling fungsional berdaya guna tinggi dari limbah kemasan rumah tangga harian.',
    vibe: 'Modern Eco-Minimalist',
    productDescription: 'Wadah serbaguna fungsional berdaya tahan tinggi yang dirancang untuk merapikan perkakas harian, aksesori gadget, maupun dekorasi ruangan dengan sentuhan estetika kontemporer yang ramah lingkungan.',
    difficulty: skillLevel === 'Beginner' ? 'Super Easy (5 min)' : 'Moderate (Crafty)',
    timeEstimate: '15-25 Menit',
    estimatedValueIdr: 55000,
    co2SavedKg: 2.8,
    landfillDivertedGrams: 260,
    pointsRewarded: 70,
    benefits: {
      economic: 'Menghemat pengeluaran belanja produk wadah & organizer baru sebesar Rp 40.000 - Rp 70.000.',
      environmental: 'Mengurangi volume sampah ke TPA dan mengurangi jejak karbon produksi barang baru.',
      practical: 'Menghadirkan wadah penyimpanan praktis yang pas untuk kebutuhan spesifik meja atau tas kamu.',
    },
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
        instruction: 'Bentuk bagian utama sesuai pola fungsional yang diinginkan dan rekatkan sambungan dengan kuat.',
        tip: 'Berikan waktu perekat kering sempurna selama 3-5 menit sebelum diisi beban.',
        timeMinutes: 8,
      },
      {
        stepNumber: 3,
        title: 'Finishing & Personalisasi Estetik',
        instruction: 'Hias bagian luar dengan elemen dekoratif sederhana untuk meningkatkan nilai visual dan estetikanya.',
        tip: 'Karya buatan tangan yang rapi memiliki nilai seni dan nilai jual tinggi di market komunitas.',
        timeMinutes: 6,
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

    const systemInstruction = `You are "BumiKita AI Vision & Maker", an institutional-grade Upcycling Engineering & Zero-Waste Design Specialist.

CRITICAL VISION, RECOGNITION & CRAFTSMANSHIP MANDATES:
1. AUTONOMOUS VISUAL INSPECTION:
   When an image is provided, carefully inspect the photo to identify:
   - The exact discarded object/waste (e.g., 'Celana Jeans Denim Robek', 'Botol Plastik PET 600ml', 'Kotak Kardus Sepatu Bekas', 'Kemasan Kopi/Snack Sachet Metalized').
   - Material composition (e.g., 'Heavy Denim Cotton', 'Polietilena Tereftalat (PET #1)', 'Corrugated Cardboard', 'Aluminium Foil Composite').
   - Physical condition (e.g., 'Kain tebal tanpa noda jamur', 'Plastik transparan elastis', 'Karton berstruktur kaku').

2. PRECISE TARGET PRODUCT TRANSLATION:
   - The user only describes WHAT PRODUCT THEY WANT TO MAKE (e.g., "Ingin jadi tas selempang", "Jadikan pot tanaman estetik", "Bikin organizer meja kost"), OR leaves it blank.
   - You MUST adapt the visually detected waste materials to build EXACTLY what they requested (or the most practical, trendy, high-value creation if left blank).
   - Provide a comprehensive, accurate 'productDescription' explaining what is being built, its exact physical dimensions/form, primary functions, and why it is practical.

3. DETAILED ACTIONABLE STEPS:
   - Every single step must be clear, sequential, and realistic with exact measurements (in cm/mm) and execution guidance.
   - Include specific tools and secondary materials needed (e.g., jenis lem yang tepat, ukuran gunting/cutter, jarum & benang).

4. MULTI-DIMENSIONAL BENEFITS:
   - 'benefits.economic': Concrete calculation of money saved versus buying a new retail item.
   - 'benefits.environmental': Tangible waste diversion and reduction of carbon/water footprint.
   - 'benefits.practical': Everyday convenience and functional utility for the user.

5. TONE & ACCURACY:
   - Deliver instructions in clear, modern, encouraging Indonesian tailored for students, makers, and young creators.
   - Provide realistic estimates for resale value (in IDR), CO2 saved (kg), and diverted landfill weight (grams).`;

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
1. Visually identify the discarded waste item, its material type, and its physical condition from this photo.
2. What the user wants to make: "${prompt?.trim() || 'Rekomendasikan kreasi upcycling paling estetik, fungsional, dan bernilai tinggi dari barang bekas di foto ini'}"
3. Maker Skill Level: ${skillLevel}

Generate a complete, highly accurate, step-by-step DIY upcycling blueprint with detailed product breakdown, required tools, comprehensive steps with tips, styling guidance, and 3-pillar benefits (economic, environmental, practical).`
      : `Transform this discarded item/waste into an amazing upcycle project:
User Goal / What to build: "${prompt || 'Suggest the best creative upcycling project for this item'}"
Target Skill Level: ${skillLevel}

Generate a highly accurate, detailed, step-by-step upcycling plan with materials, tools, aesthetic styling tips, safety advice, benefits analysis, and eco-metrics.`;

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
              detectedCondition: {
                type: Type.STRING,
                description: 'Physical condition of the waste item (e.g. "Kain tebal kokoh, saku utuh", "Plastik bersih kedap air")',
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
              productDescription: {
                type: Type.STRING,
                description: 'Detailed explanation of what the product is, its dimensions, utility, and functions',
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
              benefits: {
                type: Type.OBJECT,
                properties: {
                  economic: { type: Type.STRING, description: 'Economic savings and financial benefits' },
                  environmental: { type: Type.STRING, description: 'Environmental and ecological conservation benefits' },
                  practical: { type: Type.STRING, description: 'Everyday practicality and lifestyle convenience benefits' },
                },
                required: ['economic', 'environmental', 'practical'],
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
              'productDescription',
              'difficulty',
              'timeEstimate',
              'estimatedValueIdr',
              'co2SavedKg',
              'landfillDivertedGrams',
              'pointsRewarded',
              'benefits',
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

