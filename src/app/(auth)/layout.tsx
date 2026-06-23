import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-bg items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 mx-auto">
            <span className="text-3xl font-bold">CV</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">CV Optimizer</h2>
          <p className="text-violet-100 text-lg">
            Optimiza tu CV, verifica empresas y consigue el trabajo de tus sueños con el poder de la IA.
          </p>
        </div>
      </div>
    </div>
  );
}
