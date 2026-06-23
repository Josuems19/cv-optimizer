import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CV</span>
              </div>
              <span className="text-xl font-bold gradient-text">CV Optimizer</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/signup">
                <Button>Comenzar Gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
            Potenciado por Inteligencia Artificial
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Optimiza tu CV. <br />
            <span className="gradient-text">Consigue el trabajo.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Analiza tu CV contra cualquier vacante, optimízalo para sistemas ATS, 
            genera cartas de presentación y verifica empresas — todo con IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Empezar Ahora — Es Gratis
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Funcionalidades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Todo lo que necesitas para tu búsqueda de empleo
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="Análisis deCompatibilidad"
              description="Compara tu CV contra cualquier vacante y obtén un score de compatibilidad detallado."
            />
            <FeatureCard
              icon="⚡"
              title="Optimización ATS"
              description="Reescribe tu CV para pasar filtros automáticos de reclutamiento sin perder tu voz."
            />
            <FeatureCard
              icon="📋"
              title="Seguimiento de Postulaciones"
              description="Tablero Kanban para organizar y dar seguimiento a cada una de tus applications."
            />
            <FeatureCard
              icon="🔍"
              title="Verificación de Empresas"
              description="Investiga empresas con OSINT para evitar fraudes y estafas en ofertas de empleo."
            />
            <FeatureCard
              icon="✍️"
              title="Cartas de Presentación"
              description="Genera cartas personalizadas que conectan tu experiencia con la empresa específica."
            />
            <FeatureCard
              icon="🎓"
              title="Preparación de Entrevistas"
              description="Practica las preguntas más difíciles con guías estratégicas STAR."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 gradient-bg">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para destacar?
          </h2>
          <p className="text-xl text-violet-100 mb-8">
            Únete a miles de profesionales que ya están optimizando sus CVs con IA.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 text-lg px-8">
              Crear Mi Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center text-sm">
        <p>© 2026 CV Optimizer. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-gray-200 card-hover bg-white">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
