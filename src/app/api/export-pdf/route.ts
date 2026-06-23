import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { resumeId, optimizedContent } = await request.json();

    if (!resumeId || !optimizedContent) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: 'CV no encontrado' },
        { status: 404 }
      );
    }

    // Generate ATS-friendly HTML
    const html = generateATSHtml(resume, optimizedContent);

    // In production, we would use Puppeteer or a PDF service here
    // For now, return the HTML that can be printed to PDF
    return NextResponse.json({
      html,
      message: 'PDF generado correctamente',
    });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al exportar el PDF' },
      { status: 500 }
    );
  }
}

function generateATSHtml(resume: any, optimized: any) {
  const personalInfo = resume.original_content?.personalInfo || {};
  const experience = optimized?.experience || resume.original_content?.experience || [];
  const skills = optimized?.skills || resume.original_content?.skills || [];
  const summary = optimized?.summary || resume.original_content?.summary || '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 16px; text-transform: uppercase; border-bottom: 2px solid #333; padding-bottom: 4px; margin: 20px 0 12px; }
    .contact { color: #666; font-size: 14px; margin-bottom: 20px; }
    .summary { font-size: 14px; margin-bottom: 20px; }
    .experience { margin-bottom: 20px; }
    .experience-item { margin-bottom: 16px; }
    .experience-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .experience-title { font-weight: bold; }
    .experience-date { color: #666; font-size: 14px; }
    .experience-company { color: #666; font-size: 14px; margin-bottom: 8px; }
    ul { padding-left: 20px; }
    li { font-size: 14px; margin-bottom: 4px; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill { background: #f3f4f6; padding: 4px 12px; border-radius: 4px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${personalInfo.name || 'Nombre'}</h1>
    <div class="contact">
      ${personalInfo.email ? `${personalInfo.email}` : ''}
      ${personalInfo.phone ? ` | ${personalInfo.phone}` : ''}
      ${personalInfo.location ? ` | ${personalInfo.location}` : ''}
    </div>
    
    ${summary ? `
    <h2>Resumen Profesional</h2>
    <div class="summary">${summary}</div>
    ` : ''}

    ${experience.length > 0 ? `
    <h2>Experiencia Profesional</h2>
    <div class="experience">
      ${experience.map((exp: any) => `
        <div class="experience-item">
          <div class="experience-header">
            <span class="experience-title">${exp.position || 'Cargo'}</span>
            <span class="experience-date">${exp.startDate || ''} - ${exp.endDate || 'Presente'}</span>
          </div>
          <div class="experience-company">${exp.company || 'Empresa'}</div>
          ${exp.description ? `<p style="font-size:14px; margin-bottom:8px;">${exp.description}</p>` : ''}
          ${exp.achievements && exp.achievements.length > 0 ? `
            <ul>
              ${exp.achievements.map((a: string) => `<li>${a}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${skills.length > 0 ? `
    <h2>Habilidades</h2>
    <div class="skills">
      ${skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `.trim();
}
