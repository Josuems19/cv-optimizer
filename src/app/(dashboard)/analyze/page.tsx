'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Link as LinkIcon, Image, Loader2 } from 'lucide-react';
import { Resume } from '@/types';

export default function AnalyzePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [inputMethod, setInputMethod] = useState<'text' | 'url' | 'image'>('text');
  const [jobText, setJobText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobImage, setJobImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchResumes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setResumes(data || []);
      if (data && data.length > 0) {
        setSelectedResume(data[0].id);
      }
    };

    fetchResumes();
  }, [supabase]);

  const handleAnalyze = async () => {
    if (!selectedResume) {
      setError('Selecciona un CV para analizar');
      return;
    }

    if (inputMethod === 'text' && !jobText) {
      setError('Ingresa la descripción del puesto');
      return;
    }

    if (inputMethod === 'url' && !jobUrl) {
      setError('Ingresa la URL de la vacante');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user for API key
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión');

      // Get user profile for AI provider
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_provider, ai_api_key_encrypted')
        .eq('id', user.id)
        .single();

      let description = jobText;

      // If URL, scrape it first
      if (inputMethod === 'url') {
        const scrapeResponse = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: jobUrl }),
        });

        if (!scrapeResponse.ok) {
          throw new Error('Error al obtener la descripción de la URL');
        }

        const scrapeData = await scrapeResponse.json();
        description = scrapeData.description;
      }

      // If image, OCR it first
      if (inputMethod === 'image' && jobImage) {
        const formData = new FormData();
        formData.append('image', jobImage);

        const ocrResponse = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        if (!ocrResponse.ok) {
          throw new Error('Error al procesar la imagen');
        }

        const ocrData = await ocrResponse.json();
        description = ocrData.text;
      }

      // Analyze compatibility
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResume,
          jobDescription: description,
          providerId: profile?.ai_provider || 'openai',
          customApiKey: profile?.ai_api_key_encrypted,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al analizar la compatibilidad');
      }

      const result = await response.json();

      // Create job posting and application
      const { data: jobPosting } = await supabase
        .from('job_postings')
        .insert({
          user_id: user.id,
          description,
          source_url: inputMethod === 'url' ? jobUrl : null,
          source_image_url: inputMethod === 'image' ? URL.createObjectURL(jobImage!) : null,
          input_method: inputMethod,
        })
        .select()
        .single();

      if (jobPosting) {
        // Create analysis
        const { data: analysis } = await supabase
          .from('compatibility_analyses')
          .insert({
            job_posting_id: jobPosting.id,
            resume_id: selectedResume,
            match_score: result.score,
            strengths: result.strengths,
            weaknesses: result.weaknesses,
            missing_skills: result.missingSkills,
            recommendations: result.recommendations,
            ats_keywords: result.atsKeywords,
          })
          .select()
          .single();

        // Create application
        const { data: application } = await supabase
          .from('applications')
          .insert({
            user_id: user.id,
            job_posting_id: jobPosting.id,
            analysis_id: analysis?.id,
            company_name: 'Por determinar',
            job_title: 'Vacante analizada',
            status: 'to_apply',
          })
          .select()
          .single();

        // Navigate to results
        router.push(`/dashboard/analyze/${application?.id || jobPosting.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error al analizar');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analizar Vacante</h2>
        <p className="text-gray-600">Selecciona tu CV y pega la descripción del puesto</p>
      </div>

      {/* Resume Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecciona tu CV</CardTitle>
          <CardDescription>Elige el CV que quieres comparar contra esta vacante</CardDescription>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No tienes CVs guardados</p>
              <Button onClick={() => router.push('/dashboard/resumes/new')}>
                Crear CV
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => setSelectedResume(resume.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedResume === resume.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedResume === resume.id
                        ? 'bg-violet-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{resume.title}</p>
                      <p className="text-sm text-gray-500">
                        {resume.original_content?.skills?.length || 0} skills
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Input */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción de la Vacante</CardTitle>
          <CardDescription>Cómo quieres ingresar la información del puesto</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" onValueChange={(v) => setInputMethod(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Texto
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Imagen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <Textarea
                placeholder={`Pega aquí la descripción completa del puesto...

Ejemplo:
Buscamos Frontend Developer con experiencia en React, TypeScript y CSS...

Requisitos:
- 3+ años de experiencia con React
- Conocimiento de TypeScript
- Experiencia con APIs REST

Ofrecemos:
- Salario competitivo
- Trabajo remoto
- Beneficios de salud`}
                className="min-h-[300px]"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <div className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/123456789"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Pegamos la URL de LinkedIn, Indeed, Glassdoor u otro portal de empleo
                </p>
              </div>
            </TabsContent>

            <TabsContent value="image" className="mt-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-violet-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setJobImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Image className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    {jobImage ? (
                      <p className="text-sm text-gray-700">{jobImage.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          Sube una captura de pantalla de la vacante
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Usaremos OCR para extraer el texto
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <Button 
        onClick={handleAnalyze} 
        disabled={loading || !selectedResume}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Analizando...
          </>
        ) : (
          'Analizar Compatibilidad'
        )}
      </Button>
    </div>
  );
}
