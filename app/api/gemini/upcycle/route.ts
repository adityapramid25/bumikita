import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/src/lib/gemini';
import { Type } from '@google/genai';

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

    const systemInstruction = `You are "BumiKita AI Maker", the world's most creative and practical Upcycling & Waste-to-Worth expert designed for Gen Z (15-24 years old, high school and college students).
Your mission is to transform household waste, old clothing, scrap plastic, cardboard boxes, and discarded items into trendy, functional, aesthetic, high-value DIY creations that Gen Z loves (e.g. Y2K streetwear, aesthetic room decor, campus desk organizers, waterproof pouches, tech cases).

Always provide clear, realistic, and actionable instructions tailored to the user's chosen skill level (${skillLevel}).
Keep tone enthusiastic, eco-conscious, creative, modern, and practical (Indonesian / English bilingual friendly, using clear terms).
Quantify the positive ecological impact (CO2 saved, grams of landfill diverted) and estimated monetary value if sold on BumiKita market.`;

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

    const userTextPrompt = `Transform this discarded item/waste into an amazing upcycle project:
User Description/Context: "${prompt || 'Suggest the best creative upcycling project for this discarded item'}"
Target Skill Level: ${skillLevel}

Generate a detailed, step-by-step upcycling plan with materials, tools, aesthetic styling tips, safety advice, and eco-metrics.`;

    contentsPayload.push({
      text: userTextPrompt,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contentsPayload,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
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
  } catch (error: any) {
    console.error('Error generating upcycle plan:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate upcycling plan. Please try again.',
      },
      { status: 500 }
    );
  }
}
