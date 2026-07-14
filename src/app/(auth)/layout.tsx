import * as React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side: visual / branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-primary-container to-[#1a4ba8] p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 0%, transparent 50%), radial-gradient(circle at 75% 75%, white 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 6a6 6 0 1 0 6 6" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <span className="text-headline-md font-heading">Psiorganizer</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-display-lg font-heading leading-tight">
            Serenidade, ordem e confiabilidade para sua prática clínica.
          </h1>
          <p className="mt-6 text-body-lg text-white/80">
            Pacientes, prontuários, agenda e documentos — tudo em um só lugar,
            desenhado para reduzir a carga cognitiva do psicólogo.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div>
              <p className="text-display-lg font-heading">+10k</p>
              <p className="text-body-sm text-white/70">sessões registradas</p>
            </div>
            <div>
              <p className="text-display-lg font-heading">100%</p>
              <p className="text-body-sm text-white/70">isolado por usuário</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-body-sm text-white/60">
          © {new Date().getFullYear()} Psiorganizer · Plataforma para psicólogos
        </div>
      </div>

      {/* Right side: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-paper">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
