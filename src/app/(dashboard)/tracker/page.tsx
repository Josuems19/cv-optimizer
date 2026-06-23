'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, ExternalLink } from 'lucide-react';
import { Application, ApplicationStatus } from '@/types';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';

const columns: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: 'to_apply', title: 'Por Aplicar', color: 'bg-gray-100' },
  { id: 'applied', title: 'Aplicado', color: 'bg-blue-50' },
  { id: 'interviewing', title: 'En Entrevista', color: 'bg-purple-50' },
  { id: 'offered', title: 'Ofrecido', color: 'bg-emerald-50' },
  { id: 'rejected', title: 'Rechazado', color: 'bg-red-50' },
];

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchApplications();
  }, [supabase]);

  const fetchApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    setApplications(data || []);
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    const app = applications.find(a => a.id === draggedItem);
    if (!app || app.status === targetStatus) {
      setDraggedItem(null);
      return;
    }

    // Update local state
    setApplications(applications.map(a => 
      a.id === draggedItem 
        ? { ...a, status: targetStatus, applied_at: targetStatus === 'applied' ? new Date().toISOString() : a.applied_at }
        : a
    ));

    // Update in database
    await supabase
      .from('applications')
      .update({ 
        status: targetStatus,
        applied_at: targetStatus === 'applied' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', draggedItem);

    setDraggedItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta postulación?')) return;
    
    await supabase.from('applications').delete().eq('id', id);
    setApplications(applications.filter(a => a.id !== id));
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
          <h2 className="text-2xl font-bold text-gray-900">Tracker de Postulaciones</h2>
          <p className="text-gray-600">Arrastra las tarjetas entre columnas para actualizar el estado</p>
        </div>
        <Link href="/dashboard/analyze">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Postulación
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnApps = applications.filter(a => a.status === column.id);
          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-72 rounded-xl ${column.color} p-4`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">{column.title}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                  {columnApps.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    className="bg-white rounded-lg p-4 shadow-sm cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-300" />
                        <h4 className="font-medium text-gray-900">{app.job_title}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{app.company_name}</p>
                    {app.applied_at && (
                      <p className="text-xs text-gray-400">
                        Aplicado: {formatDate(app.applied_at)}
                      </p>
                    )}
                    {app.notes && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{app.notes}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(app.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}

                {columnApps.length === 0 && (
                  <div className="bg-white/50 rounded-lg p-4 text-center text-sm text-gray-400">
                    Arrastra una tarjeta aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
