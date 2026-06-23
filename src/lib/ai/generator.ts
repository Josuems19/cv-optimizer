import { getAIClient, getProviderModel } from './provider';
import { buildCoverLetterPrompt } from './prompts/coverLetter';
import { buildInterviewPrepPrompt } from './prompts/interviewPrep';
import { InterviewQuestion } from '@/types';

export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  companyName: string,
  jobTitle: string,
  candidateName: string,
  providerId: string = 'openai',
  customApiKey?: string
): Promise<{ content: string; highlights: string[] }> {
  const client = getAIClient(providerId, customApiKey);
  const model = getProviderModel(providerId, 'main');

  const prompt = buildCoverLetterPrompt(
    resumeText,
    jobDescription,
    companyName,
    jobTitle,
    candidateName
  );

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Eres un experto en escritura de cartas de presentación. Responde SOLO con JSON válido, sin markdown ni texto adicional.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No se recibió respuesta del modelo de IA');
  }

  try {
    const result = JSON.parse(content);
    return {
      content: result.content || '',
      highlights: result.highlights || [],
    };
  } catch (error) {
    throw new Error('Error al parsear la respuesta de IA');
  }
}

export async function generateInterviewPrep(
  resumeText: string,
  jobDescription: string,
  weaknesses: string[],
  missingSkills: string[],
  jobTitle: string,
  providerId: string = 'openai',
  customApiKey?: string
): Promise<InterviewQuestion[]> {
  const client = getAIClient(providerId, customApiKey);
  const model = getProviderModel(providerId, 'main');

  const prompt = buildInterviewPrepPrompt(
    resumeText,
    jobDescription,
    weaknesses,
    missingSkills,
    jobTitle
  );

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Eres un entrevistador senior. Responde SOLO con JSON válido, sin markdown ni texto adicional.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const responseContent = completion.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error('No se recibió respuesta del modelo de IA');
  }

  try {
    const result = JSON.parse(responseContent);
    return result.questions || [];
  } catch (error) {
    throw new Error('Error al parsear la respuesta de IA');
  }
}
