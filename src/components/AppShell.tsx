import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Presentation,
  Gamepad2,
  Calculator,
  Shapes,
  Palette,
  FileCheck2,
  NotebookTabs,
  Library,
  School,
  Settings,
  Menu,
  X,
  Search,
  Sparkles,
  ChevronRight,
  Github,
  ShieldCheck,
  User,
  LogIn,
  Sun,
  Moon,
  Sigma,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useApp } from '../lib/store'
import { AuthModal } from './AuthModal'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  countKey?: 'library'
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    label: 'Visão geral',
    items: [
      { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
      { to: '/biblioteca', label: 'Biblioteca', icon: Library, countKey: 'library' },
    ],
  },
  {
    label: 'Planejar e ensinar',
    items: [
      { to: '/planos', label: 'Planos de aula', icon: ClipboardList },
      { to: '/aulas', label: 'Aulas interativas', icon: Presentation },
      { to: '/exercicios', label: 'Exercícios', icon: Calculator },
      { to: '/provas', label: 'Provas e avaliações', icon: FileCheck2 },
      { to: '/apostilas', label: 'Apostilas', icon: NotebookTabs },
    ],
  },
  {
    label: 'Criar e explorar',
    items: [
      { to: '/jogos', label: 'Jogos matemáticos', icon: Gamepad2 },
      { to: '/geometria', label: 'Laboratório de geometria', icon: Shapes },
      { to: '/latex', label: 'Figuras em LaTeX', icon: Sigma },
      { to: '/atividades', label: 'Atividades ilustradas', icon: Palette },
    ],
  },
  {
    label: 'Sua plataforma',
    items: [
      { to: '/escola', label: 'Identidade da escola', icon: School },
      { to: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="brand-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6d8cff" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" />
      <path d="M17 22h16M17 32h12M17 42h16" stroke="url(#brand-gradient)" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M43 18v25M33 31l20-2" stroke="#fb923c" strokeWidth="5.2" strokeLinecap="round" />
      <circle cx="44" cy="45" r="3.2" fill="#fff" />
    </svg>
  )
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 min-w-0">
      <BrandMark size={compact ? 34 : 38} />
      <div className="min-w-0">
        <div className="font-display font-bold text-[0.98rem] leading-tight text-white tracking-tight">
          Matemática <span className="text-indigo-300">Interativa</span>
        </div>
        <div className="text-[0.55rem] uppercase tracking-[0.16em] text-blue-100/50 font-extrabold mt-0.5">
          Laboratório do professor
        </div>
      </div>
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { materials } = useApp()
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-4">
        <BrandLockup />
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.055] p-2.5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-400/20 text-orange-300 grid place-items-center shrink-0">
            <Sparkles size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[0.66rem] font-extrabold text-white/90">100% gratuito e aberto</div>
            <div className="text-[0.56rem] text-blue-100/50">Sem assinatura. Sem cartão.</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pb-4 sidebar-scroll">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="sidebar-section-label">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const count = item.countKey === 'library' ? materials.length : undefined
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={'end' in item ? Boolean(item.end) : false}
                    onClick={onNavigate}
                    className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
                  >
                    <Icon size={16} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {count !== undefined && count > 0 && <span className="badge-dot">{count}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/8">
        <div className="rounded-xl bg-white/[0.055] border border-white/8 p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[0.65rem] font-bold text-white/85">Privacidade por padrão</span>
          </div>
          <p className="text-[0.57rem] leading-relaxed text-blue-100/45">
            Seus materiais ficam no seu navegador. Nenhum dado de aluno é enviado.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 inline-flex items-center gap-1 text-[0.6rem] font-bold text-blue-200/60 hover:text-white"
          >
            <Github size={12} /> Código aberto · MIT
          </a>
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { school, materials, currentUser, settings, updateSettings } = useApp()

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
  }
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!search.trim()) return
    navigate(`/biblioteca?q=${encodeURIComponent(search.trim())}`)
    setSearch('')
  }

  return (
    <div className="min-h-screen">
      <aside className="app-sidebar fixed inset-y-0 left-0 z-40 hidden lg:flex w-[258px] flex-col no-print">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="app-sidebar absolute inset-y-0 left-0 w-[86%] max-w-[310px] shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 w-8 h-8 rounded-lg bg-white/10 text-white grid place-items-center"
              aria-label="Fechar menu"
            >
              <X size={16} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-[258px] min-h-screen flex flex-col">
        <header className="topbar sticky top-0 z-30 no-print">
          <div className="h-[64px] px-3 sm:px-5 lg:px-7 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="icon-button lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            <form onSubmit={submitSearch} className="hidden md:flex relative max-w-[360px] flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input !pl-9 !py-2 !text-[0.78rem] bg-white/80"
                placeholder="Buscar materiais e habilidades…"
                aria-label="Buscar na biblioteca"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[0.58rem] font-bold text-slate-400">
                Enter
              </span>
            </form>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden xl:flex items-center gap-2 text-[0.7rem] text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Salvo automaticamente
              </div>

              {/* Botão de Tema Claro / Escuro */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid place-items-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                title={settings.theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
                aria-label="Alternar tema de cor"
              >
                {settings.theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
              </button>

              {/* Botão de Perfil / Login do Professor */}
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left"
                title={currentUser ? `Logado como ${currentUser.name}. Clique para trocar.` : 'Entrar / Cadastrar Professor'}
              >
                <div className="avatar shrink-0 bg-indigo-600 text-white font-bold text-xs">
                  {currentUser
                    ? currentUser.name.slice(0, 2).toUpperCase()
                    : <User size={15} />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[0.72rem] font-bold text-slate-700 max-w-[150px] truncate leading-tight">
                    {currentUser ? currentUser.name : 'Entrar como Professor'}
                  </div>
                  <div className="text-[0.6rem] text-slate-400 max-w-[150px] truncate">
                    {currentUser ? (school.name || 'Minha escola') : 'Clique para autenticar'}
                  </div>
                </div>
              </button>

              <Link
                to="/biblioteca"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[0.68rem] font-bold text-slate-600 hover:border-slate-300"
              >
                <Library size={14} /> {materials.length}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-3 sm:px-5 lg:px-7 py-5 sm:py-6 lg:py-7">
          <div className="mx-auto w-full max-w-[1380px]">
            {children}
          </div>
        </main>

        <footer className="px-3 sm:px-5 lg:px-7 py-5 text-[0.66rem] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
          <span className="flex items-center gap-1.5">
            <BrandMark size={18} /> Matemática Interativa · Matemática que ensina, interage e transforma
          </span>
          <div className="flex items-center gap-1">
            <Link to="/configuracoes" className="hover:text-slate-600 px-1.5 py-1">Privacidade</Link>
            <span>·</span>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 px-1.5 py-1">GitHub</a>
            <span>·</span>
            <span className="px-1.5 py-1">Licença MIT</span>
          </div>
        </footer>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
