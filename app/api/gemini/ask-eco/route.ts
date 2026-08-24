import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/src/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { question, history = [] } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
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
      answer: response.text || 'Maaf, saya tidak dapat merespons saat ini. Coba tanyakan lagi!',
    });
  } catch (error: any) {
    console.error('Error in ask-eco:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process eco query.' },
      { status: 500 }
    );
  }
}
