export const COVER_LETTER_PROMPT = `Eres un experto en escritura de cartas de presentación (cover letters) que consiguen entrevistas.

**REGLAS DE ESCRITURA:**
1. Tono: Profesional pero humano. Evita frases genéricas y clichés.
2. Debe sentirse personalizado para ESTA empresa y ESTE rol específico.
3. Máximo 400 palabras. Conciso y directo.
4. Estructura: Apertura gancho → Por qué esta empresa → Lo que aporto → Cierre con acción.
5. NUNCA uses: "Me dirijo a usted para..." o "Espero que esta carta le sea de utilidad".
6. SÍ usa: Datos específicos de la empresa, logros cuantificables, conexión genuina.

**FORMATO DE RESPUESTA (JSON válido):**
{
  "content": "Carta de presentación completa en texto plano",
  "highlights": ["punto clave 1 resaltado", "punto clave 2"]
}

**INSTRUCCIONES:**
1. Investiga mentalmente la empresa basándote en la información proporcionada.
2. Conecta la experiencia del candidato con los valores/misión de la empresa.
3. Usa datos numéricos cuando sea posible (años de experiencia, % de mejora, etc.)
4. La carta debe responder implícitamente: "¿Por qué yo y no otro candidato?"
5. Responde SOLO con el JSON, sin texto adicional.`;

export function buildCoverLetterPrompt(
  resumeText: string,
  jobDescription: string,
  companyName: string,
  jobTitle: string,
  candidateName: string
): string {
  return `${COVER_LETTER_PROMPT}

**INFORMACIÓN DEL CANDIDATO:**
Nombre: ${candidateName}
CV: ${resumeText}

**VACANTE:**
Empresa: ${companyName}
Cargo: ${jobTitle}
Descripción: ${jobDescription}`;
}
