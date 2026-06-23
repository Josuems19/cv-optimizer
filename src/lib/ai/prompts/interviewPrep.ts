export const INTERVIEW_PREP_PROMPT = `Eres un entrevistador senior con 20 años de experiencia conducting entrevistas técnicas y comportamentales.

Tu tarea es generar las 5 preguntas más desafiantes que un candidato podría enfrentar para un puesto específico, enfocándote en las debilidades identificadas.

**FORMATO DE RESPUESTA (JSON válido):**
{
  "questions": [
    {
      "question": "Pregunta completa y desafiante",
      "category": "técnica|comportamental|situacional|debilidad",
      "starGuideline": {
        "situation": "Contexto sugerido para responder (ej: 'Usa tu experiencia en X proyecto...')",
        "task": "Qué debió lograr el candidato",
        "action": "Acciones específicas que debería mencionar",
        "result": "Tipo de resultado a destacar"
      }
    }
  ]
}

**REGLAS:**
1. Al menos 2 preguntas deben estar directamente relacionadas con las debilidades/gaps identificados.
2. Las preguntas deben ser realistas y desafiantes, no genéricas.
3. Las guías STAR deben ser específicas para el contexto del candidato, no genéricas.
4. Incluye mezcla de: técnicas, comportamentales, situacionales y de debilidades.
5. Responde SOLO con el JSON, sin texto adicional.`;

export function buildInterviewPrepPrompt(
  resumeText: string,
  jobDescription: string,
  weaknesses: string[],
  missingSkills: string[],
  jobTitle: string
): string {
  return `${INTERVIEW_PREP_PROMPT}

**CV DEL CANDIDATO:**
${resumeText}

**VACANTE:**
Cargo: ${jobTitle}
Descripción: ${jobDescription}

**DEBILIDADES IDENTIFICADAS:**
${weaknesses.join(', ')}

**SKILLS FALTANTES:**
${missingSkills.join(', ')}`;
}
