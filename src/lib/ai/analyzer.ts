import { getAIClient, getProviderModel } from './provider';
import { buildAnalyzePrompt } from './prompts/analyze';
import { MatchScoreResult } from '@/types';

export async function analyzeCompatibility(
  resumeText: string,
  jobDescription: string,
  jobTitle?: string,
  companyName?: string,
  providerId: string = 'openai',
  customApiKey?: string
): Promise<MatchScoreResult> {
  const client = getAIClient(providerId, customApiKey);
  const model = getProviderModel(providerId, 'main');

  const prompt = buildAnalyzePrompt(resumeText, jobDescription, jobTitle, companyName);

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Eres un experto en reclutamiento. Responde SOLO con JSON válido, sin markdown ni texto adicional.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No se recibió respuesta del modelo de IA');
  }

  try {
    const result = JSON.parse(content) as MatchScoreResult;
    return {
      score: Math.max(0, Math.min(100, result.score)),
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      missingSkills: result.missingSkills || [],
      recommendations: result.recommendations || [],
      atsKeywords: result.atsKeywords || [],
    };
  } catch (error) {
    throw new Error('Error al parsear la respuesta de IA');
  }
}
