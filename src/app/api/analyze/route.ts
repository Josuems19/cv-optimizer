import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeCompatibility } from '@/lib/ai/analyzer';

export async function POST(request: Request) {
  try {
    const { resumeId, jobDescription, providerId, customApiKey } = await request.json();

    if (!resumeId || !jobDescription) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: resumeId, jobDescription' },
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

    // Analyze compatibility
    const result = await analyzeCompatibility(
      resume.raw_text,
      jobDescription,
      undefined,
      undefined,
      providerId,
      customApiKey
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al analizar la compatibilidad' },
      { status: 500 }
    );
  }
}
