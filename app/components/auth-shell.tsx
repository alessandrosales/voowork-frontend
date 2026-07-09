import * as React from "react"

interface AuthShellProps {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  const [year, setYear] = React.useState(2026)

  React.useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      {/* Left panel — brand & decoration */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 size-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 size-72 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 8.5 7 7" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">Farmácia Manager</span>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-medium leading-snug tracking-tight text-white/90">
            "Gestão inteligente para sua farmácia. Controle total de estoque, vendas e fornecedores em um só lugar."
          </blockquote>
          <div className="flex items-center gap-3 text-sm font-medium text-white/70">
            <div className="h-px flex-1 bg-white/20" />
            <span>Sistema completo de administração</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>
        </div>

        <div className="relative z-10 text-sm text-white/60">
          © {year} Farmácia Manager. Todos os direitos reservados.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-col items-center justify-center bg-muted/30 p-6 md:p-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 size-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
