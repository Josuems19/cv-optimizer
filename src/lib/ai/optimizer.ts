import { getAIClient, getProviderModel } from './provider';
import { buildOptimizePrompt } from './prompts/optimize';
import { OptimizedResume } from '@/types';

export async function optimizeResume(
  resumeText: string,
  jobDescription: string,
  atsKeywords: string[],
  strengths: string[],
  providerId: string = 'openai',
  customApiKey?: string
): Promise<OptimizedResume> {
  const client = getAIClient(providerId, customApiKey);
  const model = getProviderModel(providerId, 'main');

  const prompt = buildOptimizePrompt(resumeText, jobDescription, atsKeywords, strengths);

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Eres un experto en optimización de CVs para ATS. Responde SOLO con JSON válido, sin markdown ni texto adicional.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No se recibió respuesta del modelo de IA');
  }

  try {
    const result = JSON.parse(content) as OptimizedResume;
    return {
      summary: result.summary || '',
      experience: result.experience || [],
      skills: result.skills || [],
      keywordsAdded: result.keywordsAdded || [],
    };
  } catch (error) {
    throw new Error('Error al parsear la respuesta de IA');
  }
}
