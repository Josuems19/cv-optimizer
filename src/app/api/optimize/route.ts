import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { optimizeResume } from '@/lib/ai/optimizer';

export async function POST(request: Request) {
  try {
    const { resumeId, jobDescription, atsKeywords, strengths, providerId, customApiKey } = await request.json();

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

    // Optimize resume
    const result = await optimizeResume(
      resume.raw_text,
      jobDescription,
      atsKeywords || [],
      strengths || [],
      providerId,
      customApiKey
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al optimizar el CV' },
      { status: 500 }
    );
  }
}
