import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCoverLetter } from '@/lib/ai/generator';

export async function POST(request: Request) {
  try {
    const { 
      resumeId, 
      jobDescription, 
      companyName, 
      jobTitle, 
      candidateName,
      providerId, 
      customApiKey 
    } = await request.json();

    if (!resumeId || !jobDescription || !companyName || !jobTitle) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('raw_text')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: 'CV no encontrado' },
        { status: 404 }
      );
    }

    // Generate cover letter
    const result = await generateCoverLetter(
      resume.raw_text,
      jobDescription,
      companyName,
      jobTitle,
      candidateName || 'Candidato',
      providerId,
      customApiKey
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Cover letter error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar la carta de presentación' },
      { status: 500 }
    );
  }
}
