'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewResumePage() {
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !rawText) {
      setError('Por favor completa el título y el contenido del CV');
      return;
    }

    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Debes iniciar sesión');
      setLoading(false);
      return;
    }

    let fileUrl = null;

    // Upload file if provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        fileUrl = publicUrl;
      }
    }

    // Parse basic resume content from text
    const parsedContent = parseResumeText(rawText);

    const { error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title,
        original_content: parsedContent,
        raw_text: rawText,
        file_url: fileUrl,
        is_active: true,
      });

    if (insertError) {
      setError('Error al guardar el CV');
      setLoading(false);
      return;
    }

    router.push('/dashboard/resumes');
    router.refresh();
  };

  const parseResumeText = (text: string) => {
    // Basic parser - in production would use AI for better parsing
    const lines = text.split('\n').filter(l => l.trim());
    
    return {
      personalInfo: {
        name: lines[0] || '',
        email: lines.find(l => l.includes('@')) || '',
        phone: lines.find(l => /[\d\-\(\)]{7,}/.test(l)) || '',
        location: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/resumes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nuevo CV</h2>
          <p className="text-gray-600">Sube o pega el contenido de tu CV</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Dale un nombre a tu CV para identificarlo fácilmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre del CV</label>
              <Input
                placeholder="Ej: CV Frontend Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Archivo (Opcional)
            </CardTitle>
            <CardDescription>
              Sube un PDF o Word de tu CV para referencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-violet-300 transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                {file ? (
                  <p className="text-sm text-gray-700">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Arrastra un archivo o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (máx. 5MB)</p>
                  </>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contenido del CV
            </CardTitle>
            <CardDescription>
              Pega el texto completo de tu CV aquí. Esto se usará para el análisis con IA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`Juan Pérez
juan@email.com
+56 9 1234 5678
Santiago, Chile

RESUMEN PROFESIONAL
Desarrollador Frontend con 5+ años de experiencia...

EXPERIENCIA LABORAL
Frontend Developer | Empresa XYZ | 2020-Presente
- Desarrollé aplicaciones React...
- Implementé sistemas de diseño...

EDUCACIÓN
Ingeniería en Informática | Universidad de Chile | 2015-2019

SKILLS
JavaScript, TypeScript, React, Node.js, CSS, HTML`}
              className="min-h-[400px] font-mono text-sm"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/dashboard/resumes" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar CV'}
          </Button>
        </div>
      </form>
    </div>
  );
}
