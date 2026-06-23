import { NextResponse } from 'next/server';
import { getAIClient, getProviderModel } from '@/lib/ai/provider';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Imagen es requerida' },
        { status: 400 }
      );
    }

    // Convert to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = imageFile.type || 'image/png';

    // Use OpenAI Vision for OCR
    const client = getAIClient('openai');
    const model = getProviderModel('openai', 'vision');

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extrae TODO el texto visible de esta imagen. Es una captura de pantalla de una vacante de empleo. Devuelve SOLO el texto extraído, sin comentarios ni formato adicional.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const extractedText = completion.choices[0]?.message?.content || '';

    if (!extractedText) {
      return NextResponse.json(
        { error: 'No se pudo extraer texto de la imagen' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: extractedText,
      confidence: 'high',
    });
  } catch (error: any) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la imagen' },
      { status: 500 }
    );
  }
}
