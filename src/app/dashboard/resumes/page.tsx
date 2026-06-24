'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Resume } from '@/types';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    };

    fetchResumes();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este CV?')) return;

    await supabase.from('resumes').delete().eq('id', id);
    setResumes(resumes.filter(r => r.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis CVs</h2>
          <p className="text-gray-600">Gestiona tus CVs maestros</p>
        </div>
        <Link href="/dashboard/resumes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo CV
          </Button>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes CVs aún
            </h3>
            <p className="text-gray-500 mb-4">
              Sube tu primer CV para empezar a optimizarlo con IA
            </p>
            <Link href="/dashboard/resumes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Subir Mi Primer CV
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  {resume.title}
                </CardTitle>
                <CardDescription>
                  {resume.original_content?.personalInfo?.name || 'Sin nombre'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {resume.original_content?.personalInfo?.email || 'No especificado'}
                  </p>
                  <p>
                    <span className="font-medium">Skills:</span>{' '}
                    {resume.original_content?.skills?.length || 0} habilidades
                  </p>
                  <p>
                    <span className="font-medium">Creado:</span>{' '}
                    {formatDate(resume.created_at)}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/dashboard/resumes/${resume.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Ver / Editar
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(resume.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
