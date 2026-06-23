import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInterviewPrep } from '@/lib/ai/generator';

export async function POST(request: Request) {
  try {
    const { 
      resumeId, 
      jobDescription, 
      weaknesses,
      missingSkills,
      jobTitle,
      providerId, 
      customApiKey 
    } = await request.json();

    if (!resumeId || !jobDescription || !jobTitle) {
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

    // Generate interview prep
    const result = await generateInterviewPrep(
      resume.raw_text,
      jobDescription,
      weaknesses || [],
      missingSkills || [],
      jobTitle,
      providerId,
      customApiKey
    );

    return NextResponse.json({ questions: result });
  } catch (error: any) {
    console.error('Interview prep error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al preparar la entrevista' },
      { status: 500 }
    );
  }
}
