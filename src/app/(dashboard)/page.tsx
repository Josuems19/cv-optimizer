'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Target, TrendingUp, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalApplications: 0,
    interviews: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [resumes, applications] = await Promise.all([
        supabase
          .from('resumes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const allApps = applications.data || [];
      setStats({
        totalResumes: resumes.count || 0,
        totalApplications: allApps.length,
        interviews: allApps.filter(a => a.status === 'interviewing').length,
      });
      setRecentApplications(allApps);
      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="gradient-bg rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
        <p className="text-violet-100">
          Optimiza tus CVs y lleva tu búsqueda de empleo al siguiente nivel.
        </p>
        <Link href="/dashboard/analyze">
          <Button className="mt-4 bg-white text-violet-600 hover:bg-gray-100">
            Analizar Nuevo CV
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mis CVs</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalResumes}</div>
            <p className="text-xs text-gray-500 mt-1">CVs optimizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Postulaciones</CardTitle>
            <Target className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-gray-500 mt-1">En seguimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Entrevistas</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.interviews}</div>
            <p className="text-xs text-gray-500 mt-1">En proceso</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-violet-600" />
              </div>
              Subir CV
            </CardTitle>
            <CardDescription>
              Sube tu CV maestro para empezar a optimizarlo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/resumes/new">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Subir Nuevo CV
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-indigo-600" />
              </div>
              Analizar Vacante
            </CardTitle>
            <CardDescription>
              Compara tu CV contra una oferta de empleo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/analyze">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Analizar Ahora
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Postulaciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{app.job_title}</p>
                    <p className="text-sm text-gray-500">{app.company_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    app.status === 'interviewing'
                      ? 'bg-purple-100 text-purple-800'
                      : app.status === 'applied'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {app.status === 'to_apply' && 'Por Aplicar'}
                    {app.status === 'applied' && 'Aplicado'}
                    {app.status === 'interviewing' && 'En Entrevista'}
                    {app.status === 'offered' && 'Ofrecido'}
                    {app.status === 'rejected' && 'Rechazado'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
