import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/src/lib/gemini';

function generateSmartEcoAnswer(question: string): string {
  const q = (question || '').toLowerCase();

  if (q.includes('botol') || q.includes('plastik') || q.includes('pet')) {
    return `♻️ **Tips Daur Ulang Botol & Plastik (PET/HDPE):**
- **Cek Kode Segitiga**: Botol air mineral (PET #1) & botol sampo/deterjen (HDPE #2) punya nilai daur ulang tertinggi!
- **3 Langkah Penting**:
  1. Habiskan & bilas residu cairan sampai bersih.
  2. Lepas label plastik (biasanya PVC/PP) dan tutup botol.
  3. Remas / pipihkan botol untuk menghemat volume tong sampah atau tas drop-off.
- **Tukar Poin**: Bawa minimal 10 botol ke Mitra Drop-Off BumiKita untuk klaim **+50 Daun Points**! 🌿`;
  }

  if (q.includes('baju') || q.includes('pakaian') || q.includes('denim') || q.includes('fashion') || q.includes('fast fashion')) {
    return `👗 **Solusi Zero-Waste Pakaian & Fast Fashion:**
- **Aturan 30-Wears**: Sebelum membeli baju baru, tanyakan apakah kamu akan memakainya minimal 30 kali.
- **Upcycling Hacks**:
  - Celana jeans robek bisa diubah jadi *tote bag* kampus atau *pouch* kabel gadget.
  - Kaos katun kusam cocok dijadikan lap kain mikrofiber reusable pengganti tisu.
- **Clothing Swap**: Gabung di menu **Komunitas BumiKita** untuk barter baju layak pakai dengan sesama mahasiswa! 👕✨`;
  }

  if (q.includes('kost') || q.includes('kampus') || q.includes('kamar') || q.includes('hemat') || q.includes('mahasiswa')) {
    return `🎓 **5 Kebiasaan Zero-Waste Simpel untuk Anak Kost & Kampus:**
1. **Bawa Tumbler & Cutlery Set**: Hemat hingga Rp15.000/hari dari jajan minuman kemasan dan kurangi sedotan plastik.
2. **Pakai Tas Belanja Lipat**: Selalu simpan 1 tote bag tipis di dalam tas ransel.
3. **Beralih ke Solid Soap**: Sabun batang & shampoo bar lebih awet, hemat tempat di kamar mandi kost, dan 100% bebas sampah botol plastik.
4. **Pilah Sampah Sejak dari Kamar**: Pisahkan kardus paket online & botol plastik dari sampah organik basah.
5. **Klaim Quest Harian**: Cek tab **Misi & Quest** di BumiKita untuk kumpulkan poin voucher belanja ramah lingkungan! 🚀`;
  }

  return `🌿 **Panduan Gaya Hidup Berkelanjutan BumiKita:**
- **Prinsip 5R**: *Refuse* (Tolak sekali pakai), *Reduce* (Kurangi konsumsi berlebih), *Reuse* (Gunakan berulang), *Repurpose* (Upcycle kreatif), dan *Recycle* (Daur ulang terpilah).
- **Langkah Kecil Berdampak Besar**: Membawa botol minum sendiri setiap hari selama 1 tahun mencegah ~365 botol plastik masuk ke laut Indonesia!
- **Coba Fitur Scanner**: Pindai sampah di sekitarmu dengan **Waste-to-Worth Scanner** untuk langsung mendapatkan panduan DIY kreatif dan poin reward. Ada topik lain yang ingin kamu tanyakan? 💬✨`;
}

export async function POST(req: NextRequest) {
  try {
    const { question, history = [] } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const aiClient = getGeminiClient();

    if (!aiClient) {
      return NextResponse.json({
        success: true,
        answer: generateSmartEcoAnswer(question),
        isFallback: true,
      });
    }

    const systemInstruction = `You are "DaunAI", the friendly, witty, and ultra-practical sustainability & zero-waste coach for BumiKita.
Target Audience: Indonesian & Global Gen Z (15-24 yo students, young professionals, dorm/kost dwellers).
Tone: Helpful, warm, eco-positive, concise, modern, free of preachy guilt.
Expertise:
- Zero-waste campus hacks & dorm life tips
- Waste sorting & material recycling rules (PET, HDPE, PVC, LDPE, PP, PS, Tetra Pak)
- DIY natural cleaners, composting without bad smells in small spaces
- Fast fashion alternatives & garment care hacks
- Circular economy and micro-actions with measurable impact

Always format responses with clear bullet points, practical actionable steps, and emojis. Limit replies to around 150-250 words for fast reading.`;

    const formattedHistory = history.map((h: any) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...formattedHistory,
          {
            role: 'user',
            parts: [{ text: question }],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return NextResponse.json({
        success: true,
        answer: response.text || generateSmartEcoAnswer(question),
      });
    } catch (aiError: any) {
      console.warn('Gemini API call failed, using smart eco answer:', aiError?.message);
      return NextResponse.json({
        success: true,
        answer: generateSmartEcoAnswer(question),
        isFallback: true,
      });
    }
  } catch (error: any) {
    console.error('Error in ask-eco:', error);
    return NextResponse.json({
      success: true,
      answer: generateSmartEcoAnswer(''),
      isFallback: true,
    });
  }
}

