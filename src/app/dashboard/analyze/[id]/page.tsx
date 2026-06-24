'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Application, CompatibilityAnalysis } from '@/types';

export default function AnalyzeResultPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [analysis, setAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: app } = await supabase
        .from('applications')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!app) {
        // Try fetching as a job posting
        const { data: job } = await supabase
          .from('job_postings')
          .select('*')
          .eq('id', params.id)
          .single();

        if (job) {
          setApplication({
            id: '',
            user_id: '',
            job_posting_id: job.id,
            analysis_id: null,
            company_name: job.company_name || 'Por determinar',
            job_title: job.job_title || 'Vacante analizada',
            status: 'to_apply',
            applied_at: null,
            notes: null,
            tailored_resume_url: null,
            cover_letter_url: null,
            order_index: 0,
            created_at: job.created_at,
            updated_at: job.created_at,
          } as Application);

          const { data: anal } = await supabase
            .from('compatibility_analyses')
            .select('*')
            .eq('job_posting_id', job.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (anal) setAnalysis(anal);
        }
        setLoading(false);
        return;
      }

      setApplication(app);

      if (app.analysis_id) {
        const { data: anal } = await supabase
          .from('compatibility_analyses')
          .select('*')
          .eq('id', app.analysis_id)
          .single();
        if (anal) setAnalysis(anal);
      }

      setLoading(false);
    };

    fetchData();
  }, [params.id, supabase]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-8 w-8 text-emerald-600" />;
    if (score >= 60) return <AlertTriangle className="h-8 w-8 text-amber-600" />;
    return <XCircle className="h-8 w-8 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/analyze">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resultado del Análisis</h2>
          <p className="text-gray-600">{application?.job_title} - {application?.company_name}</p>
        </div>
      </div>

      {!analysis ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis no encontrado</h3>
            <p className="text-gray-500">No se encontró un análisis de compatibilidad para esta vacante.</p>
            <Link href="/dashboard/analyze" className="mt-4 inline-block">
              <Button>Analizar Ahora</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${getScoreColor(analysis.match_score)}`}>
                  <span className="text-3xl font-bold">{analysis.match_score}%</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Score de Compatibilidad</h3>
                  <p className="text-gray-600">
                    {analysis.match_score >= 70
                      ? '¡Buen perfil! Tu CV es compatible con esta vacante.'
                      : 'Tu CV necesita mejoras para esta vacante.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="h-5 w-5" />
                  Fortalezas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(analysis.strengths as string[]).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {analysis.weaknesses && analysis.weaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                  Áreas de Mejora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(analysis.weaknesses as string[]).map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-amber-500 mt-0.5">⚠</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Missing Skills */}
          {analysis.missing_skills && analysis.missing_skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  Skills Faltantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(analysis.missing_skills as string[]).map((skill, i) => (
                    <Badge key={i} variant="destructive">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ATS Keywords */}
          {analysis.ats_keywords && analysis.ats_keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Keywords ATS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(analysis.ats_keywords as any[]).map((kw, i) => (
                    <Badge key={i} variant={kw.importance === 'critical' ? 'default' : 'secondary'}>
                      {kw.keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(analysis.recommendations as string[]).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-violet-500 mt-0.5">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
