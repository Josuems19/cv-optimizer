'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { Resume } from '@/types';

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [rawText, setRawText] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchResume = async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !data) {
        router.push('/dashboard/resumes');
        return;
      }

      setResume(data);
      setTitle(data.title);
      setRawText(data.raw_text || '');
      setLoading(false);
    };

    fetchResume();
  }, [params.id, supabase, router]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('resumes')
      .update({ title, raw_text: rawText, updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (!error) {
      router.push('/dashboard/resumes');
    }
    setSaving(false);
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
        <Link href="/dashboard/resumes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Editar CV</h2>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Título del CV</CardTitle>
        </CardHeader>
        <CardContent>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contenido del CV</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[500px] font-mono text-sm"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
