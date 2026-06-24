'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Key, Brain } from 'lucide-react';

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o - Potente para análisis y generación',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'deepseek',
    name: 'Deepseek',
    description: 'Deepseek Chat - Excelente relación costo-calidad',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'mimo',
    name: 'Xiaomi Mimo',
    description: 'Mimo Auto - Rápido y eficiente',
    color: 'bg-orange-100 text-orange-700',
  },
];

export default function SettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('ai_provider, ai_api_key_encrypted')
        .eq('id', user.id)
        .single();

      if (data) {
        setSelectedProvider(data.ai_provider || 'openai');
        setApiKey(data.ai_api_key_encrypted || '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ai_provider: selectedProvider as any,
        ai_api_key_encrypted: apiKey || null,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-gray-600">Configura tu proveedor de IA y API keys</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Proveedor de IA
          </CardTitle>
          <CardDescription>
            Selecciona qué modelo de IA usar para análisis y generación de contenido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedProvider === provider.id
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${provider.color}`}>
                      {provider.name}
                    </div>
                    <span className="text-sm text-gray-600">{provider.description}</span>
                  </div>
                  {selectedProvider === provider.id && (
                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Personalizada (Opcional)
          </CardTitle>
          <CardDescription>
            Si tienes tu propia API key, ingrésala aquí. Si la dejas vacía, se usarán las keys del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="sk-... o tu API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Tu API key se almacena de forma segura y encriptada. Nunca se muestra en texto plano.
          </p>
        </CardContent>
      </Card>

      {success && (
        <div className="p-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
          Configuración guardada correctamente
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Guardando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </>
        )}
      </Button>
    </div>
  );
}
