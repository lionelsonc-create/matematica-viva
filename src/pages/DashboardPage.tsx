import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  ClipboardList,
  Clock3,
  FileCheck2,
  Gamepad2,
  GraduationCap,
  Library,
  NotebookTabs,
  Palette,
  PenLine,
  Presentation,
  Shapes,
  Sparkles,
  Star,
  TrendingUp,
  Wand2,
  Printer,
  ChevronRight,
  CircleHelp,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { MATERIAL_LABEL, type Material, type MaterialType } from '../lib/types'
import { formatDate, truncate, stageYearText } from '../lib/utils'
import { getTopic, TOPICS } from '../data/topics'
import { Button, Card, PageHeader, SectionTitle, Badge } from '../components/ui'
import { TopicIcon } from '../components/TopicIcon'

const tools = [
  {
    to: '/aulas',
    title: 'Criar aula interativa',
    description: 'Transforme conteúdo em slides com exemplos e desafios.',
    icon: Presentation,
    color: '#4666ff',
    soft: '#eef1ff',
    tag: 'Slides + projetor',
  },
  {
    to: '/planos',
    title: 'Gerar plano de aula',
    description: 'Planejamento completo com BNCC, metodologia e avaliação.',
    icon: ClipboardList,
    color: '#7c3aed',
    soft: '#f4efff',
    tag: 'Alinhado à BNCC',
  },
  {
    to: '/exercicios',
    title: 'Criar exercícios',
    description: 'Questões personalizadas, gabarito e diferentes versões.',
    icon: Calculator,
    color: '#0ea5e9',
    soft: '#e9f8ff',
    tag: 'Gabarito automático',
  },
  {
    to: '/jogos',
    title: 'Gerar jogos',
    description: 'Quiz, memória, bingo, roleta e desafios jogáveis.',
    icon: Gamepad2,
    color: '#f97316',
    soft: '#fff3e8',
    tag: '10 jogos',
  },
  {
    to: '/provas',
    title: 'Criar avaliação',
    description: 'Provas com cabeçalho, pontuação e versão do professor.',
    icon: FileCheck2,
    color: '#e11d48',
    soft: '#fff0f4',
    tag: 'Prova + gabarito',
  },
  {
    to: '/atividades',
    title: 'Atividades ilustradas',
    description: 'Colorir, contar, sequências, caça-números e mais.',
    icon: Palette,
    color: '#ec4899',
    soft: '#fff0f8',
    tag: 'Pronto para imprimir',
  },
  {
    to: '/geometria',
    title: 'Laboratório de geometria',
    description: 'Figuras vetoriais com medidas, áreas e planificações.',
    icon: Shapes,
    color: '#0d9488',
    soft: '#e8faf7',
    tag: 'SVG + medidas',
  },
  {
    to: '/apostilas',
    title: 'Montar apostila',
    description: 'Reúna conteúdos, resumos e exercícios em um material.',
    icon: NotebookTabs,
    color: '#6366f1',
    soft: '#eef0ff',
    tag: 'Material completo',
  },
  {
    to: '/biblioteca?imprimir=1',
    title: 'Central de impressão',
    description: 'Revise, exporte e imprima tudo o que já criou.',
    icon: Printer,
    color: '#0891b2',
    soft: '#e9f9fd',
    tag: 'PDF e A4',
  },
  {
    to: '/biblioteca',
    title: 'Minha biblioteca',
    description: 'Pesquise, duplique, edite e reutilize seus materiais.',
    icon: Library,
    color: '#8b5cf6',
    soft: '#f7efff',
    tag: 'Salvo localmente',
  },
]

const typeRoute: Record<MaterialType, string> = {
  plano: '/planos',
  aula: '/aulas',
  exercicios: '/exercicios',
  prova: '/provas',
  apostila: '/apostilas',
  atividade: '/atividades',
  jogo: '/jogos',
}

const typeTone: Record<MaterialType, 'blue' | 'violet' | 'orange' | 'green' | 'rose' | 'default'> = {
  plano: 'violet',
  aula: 'blue',
  exercicios: 'green',
  prova: 'rose',
  apostila: 'orange',
  atividade: 'rose',
  jogo: 'orange',
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function MaterialRow({ material }: { material: Material }) {
  const topic = getTopic(material.topic)
  return (
    <Link
      to={`/biblioteca?material=${material.id}`}
      className="flex items-center gap-3 py-2.5 group"
    >
      <div
        className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
        style={{ background: topic.soft, color: topic.color }}
      >
        <TopicIcon name={topic.icon} size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[0.78rem] font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
          {material.title}
        </div>
        <div className="text-[0.63rem] text-slate-400 flex items-center gap-1.5 mt-0.5">
          <span>{MATERIAL_LABEL[material.type]}</span>
          <span>·</span>
          <span>{stageYearText(material.stage, material.year)}</span>
        </div>
      </div>
      <ChevronRight size={15} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
    </Link>
  )
}

export function DashboardPage() {
  const { materials, school, settings } = useApp()
  const navigate = useNavigate()
  const recent = [...materials].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4)
  const plans = materials.filter((material) => material.type === 'plano').length
  const games = materials.filter((material) => material.type === 'jogo').length
  const favorites = materials.filter((material) => material.favorite)
  const currentDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date())
  const firstName = (school.teacher || 'Professor(a)').replace(/^Prof\.?[ªa]?\s*/i, '').split(' ')[0] || 'Professor(a)'

  const shortcutTopics = ['fracoes', 'porcentagem', 'equacoes', 'geometria-plana', 'estatistica', 'funcoes']
    .map((id) => TOPICS.find((topic) => topic.id === id))
    .filter(Boolean)

  return (
    <div className="space-y-7">
      <section className="hero-panel hero-grid p-5 sm:p-7 lg:p-8">
        <div className="relative z-10 grid lg:grid-cols-[1.5fr_1fr] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 text-[0.68rem] font-bold text-blue-100/70 mb-3">
              <Sparkles size={14} className="text-orange-300" />
              <span className="capitalize">{currentDate}</span>
              <span className="w-1 h-1 rounded-full bg-blue-200/40" />
              <span>{settings.defaultYear === 0 ? 'Ensino Médio' : `${settings.defaultYear}º ano`} como padrão</span>
            </div>
            <h1 className="text-[1.9rem] sm:text-[2.3rem] lg:text-[2.55rem] leading-[1.08] font-bold text-white max-w-[580px]">
              {greeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a9b8ff] to-[#e9c4ff]">{firstName}</span>.
              <br />
              Vamos planejar uma aula?
            </h1>
            <p className="text-[0.86rem] sm:text-[0.92rem] leading-relaxed text-blue-100/65 max-w-[530px] mt-3">
              Seu laboratório digital reúne planos, aulas, jogos, exercícios e materiais prontos para imprimir. Tudo gratuito, no mesmo lugar.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-5">
              <Button
                size="lg"
                variant="orange"
                icon={<Wand2 size={16} />}
                onClick={() => navigate('/planos')}
              >
                Criar plano de aula
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="!bg-white/10 !text-white !border-white/15 hover:!bg-white/15"
                icon={<Gamepad2 size={16} />}
                onClick={() => navigate('/jogos')}
              >
                Explorar jogos
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-5 text-[0.64rem] text-blue-100/45">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Sem cadastro obrigatório</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-300" /> Salvo no navegador</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-300" /> Código aberto</span>
            </div>
          </div>

          <div className="hidden md:block relative h-[230px]">
            <div className="absolute right-2 top-0 w-[210px] rotate-2 rounded-2xl border border-white/15 bg-white/[0.09] backdrop-blur p-4 math-float">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-400/20 text-orange-300 grid place-items-center"><ClipboardList size={16} /></div>
                <div>
                  <div className="text-[0.62rem] font-bold text-white">Plano de aula</div>
                  <div className="text-[0.5rem] text-blue-100/50">7º ano · Frações</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[82%] bg-gradient-to-r from-blue-400 to-violet-400" /></div>
              <div className="flex gap-1.5 mt-3">
                <div className="h-1.5 rounded-full bg-white/10 flex-1" />
                <div className="h-1.5 rounded-full bg-white/10 w-8" />
              </div>
              <div className="flex gap-1.5 mt-2">
                <div className="h-1.5 rounded-full bg-white/10 flex-1" />
                <div className="h-1.5 rounded-full bg-white/10 w-12" />
              </div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-emerald-400/15 text-emerald-300 px-2 py-1 text-[0.52rem] font-bold">
                <span className="w-1 h-1 rounded-full bg-emerald-400" /> BNCC conectada
              </div>
            </div>
            <div className="absolute left-0 bottom-0 w-[190px] -rotate-3 rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur p-3.5 math-float-slow">
              <div className="text-[0.54rem] text-blue-100/50 mb-1">Jogo de frações</div>
              <div className="text-[0.78rem] font-extrabold text-white">Qual é maior?</div>
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex-1 rounded-lg bg-white/10 p-2 text-center">
                  <div className="text-[0.92rem] font-black text-orange-300">3/4</div>
                  <div className="text-[0.48rem] text-blue-100/45">fração A</div>
                </div>
                <div className="text-[0.6rem] text-blue-100/40">ou</div>
                <div className="flex-1 rounded-lg bg-white/10 p-2 text-center">
                  <div className="text-[0.92rem] font-black text-blue-200">2/3</div>
                  <div className="text-[0.48rem] text-blue-100/45">fração B</div>
                </div>
              </div>
            </div>
            <div className="absolute left-[42%] top-[36%] text-[2.4rem] font-black text-white/[0.09] font-display select-none">π</div>
            <div className="absolute right-[4%] bottom-[30%] text-[1.8rem] font-black text-white/[0.08] font-display select-none">∑</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Materiais salvos', value: materials.length, icon: Library, color: '#4666ff', soft: '#eef1ff', detail: 'na sua biblioteca' },
          { label: 'Planos de aula', value: plans, icon: ClipboardList, color: '#7c3aed', soft: '#f4efff', detail: 'prontos para revisar' },
          { label: 'Jogos criados', value: games, icon: Gamepad2, color: '#f97316', soft: '#fff3e8', detail: 'atividades interativas' },
          { label: 'Favoritos', value: favorites.length, icon: Star, color: '#16a34a', soft: '#eafaf1', detail: 'acesso rápido' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card flex items-center gap-3">
              <div className="icon-tile" style={{ background: stat.soft, color: stat.color }}><Icon size={18} /></div>
              <div>
                <div className="text-[1.35rem] font-display font-bold text-slate-800 leading-none">{stat.value}</div>
                <div className="text-[0.67rem] font-bold text-slate-500 mt-1">{stat.label}</div>
                <div className="text-[0.57rem] text-slate-400 mt-0.5">{stat.detail}</div>
              </div>
            </div>
          )
        })}
      </section>

      <section>
        <SectionTitle
          title="O que vamos criar hoje?"
          description="Ferramentas pedagógicas completas, do planejamento à impressão."
          action={<Link to="/biblioteca" className="text-[0.72rem] font-bold text-indigo-600 flex items-center gap-1 hover:underline">Ver biblioteca <ArrowRight size={13} /></Link>}
        />
        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.title} to={tool.to} className="tool-card group" style={{ ['--accent-soft' as string]: `${tool.color}20` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="icon-tile" style={{ background: tool.soft, color: tool.color }}>
                    <Icon size={19} />
                  </div>
                  <ArrowRight size={15} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <h3 className="text-[0.82rem] font-bold leading-snug mt-3">{tool.title}</h3>
                <p className="text-[0.66rem] leading-relaxed text-slate-500 mt-1">{tool.description}</p>
                <div className="mt-2.5">
                  <span className="text-[0.56rem] font-bold uppercase tracking-wide" style={{ color: tool.color }}>{tool.tag}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.55fr_1fr] gap-5">
        <Card className="p-4 sm:p-5">
          <SectionTitle
            title="Continue de onde parou"
            description="Materiais atualizados recentemente"
            action={<Link to="/biblioteca" className="text-[0.68rem] font-bold text-indigo-600 hover:underline">Ver todos</Link>}
          />
          {recent.length ? (
            <div className="divide-y divide-slate-100">
              {recent.map((material) => <MaterialRow key={material.id} material={material} />)}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">Sua biblioteca está pronta para o primeiro material.</p>
              <Button className="mt-3" size="sm" onClick={() => navigate('/planos')}>Criar meu primeiro plano</Button>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100/70 p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-indigo-600 grid place-items-center shrink-0 shadow-sm"><TrendingUp size={16} /></div>
            <div className="flex-1">
              <div className="text-[0.72rem] font-bold text-slate-700">Fluxo sugerido para uma aula completa</div>
              <p className="text-[0.64rem] text-slate-500 mt-0.5 leading-relaxed">
                Plano → aula interativa → lista de exercícios → jogo → avaliação. Cada material usa a mesma habilidade da BNCC.
              </p>
            </div>
            <button onClick={() => navigate('/planos')} className="shrink-0 text-[0.63rem] font-bold text-indigo-600 hover:underline mt-0.5">Começar</button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-4 sm:p-5">
            <SectionTitle title="Atalhos de conteúdo" description="Comece por um tema" />
            <div className="grid grid-cols-2 gap-2">
              {shortcutTopics.map((topic) => {
                if (!topic) return null
                return (
                  <Link
                    key={topic.id}
                    to={`/exercicios?topic=${topic.id}`}
                    className="group rounded-xl border border-slate-100 bg-slate-50/40 p-2.5 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={{ background: topic.soft, color: topic.color }}>
                        <TopicIcon name={topic.icon} size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[0.67rem] font-bold text-slate-700 truncate group-hover:text-indigo-600">{topic.shortName}</div>
                        <div className="text-[0.54rem] text-slate-400">{topic.unit}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Link to="/exercicios" className="mt-3 flex items-center justify-center gap-1 text-[0.66rem] font-bold text-slate-500 hover:text-indigo-600 py-1">
              Ver todos os conteúdos <ChevronRight size={13} />
            </Link>
          </Card>

          <Card className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-indigo-950 !border-indigo-900 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-8 text-[6rem] font-black text-white/[0.04] font-display">?</div>
            <div className="relative">
              <div className="flex items-center gap-2 text-[0.6rem] font-extrabold uppercase tracking-widest text-orange-300 mb-2">
                <CircleHelp size={14} /> Dica pedagógica
              </div>
              <h3 className="text-[0.92rem] font-bold text-white leading-snug">Antes de calcular, peça uma estimativa.</h3>
              <p className="text-[0.67rem] text-blue-100/55 mt-1.5 leading-relaxed">
                Estimar antes de resolver ajuda o estudante a perceber erros de cálculo e desenvolve o senso numérico.
              </p>
              <Link to="/aulas" className="inline-flex items-center gap-1 mt-3 text-[0.66rem] font-bold text-blue-200 hover:text-white">
                Criar aula com estimativas <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <section className="surface p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="icon-tile bg-orange-50 text-orange-500"><GraduationCap size={19} /></div>
            <div>
              <h3 className="text-sm font-bold">Pronto para começar a semana?</h3>
              <p className="text-[0.7rem] text-slate-500 mt-0.5">Crie um kit completo: plano, apresentação e atividade em poucos minutos.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" icon={<Presentation size={14} />} onClick={() => navigate('/aulas')}>Aula interativa</Button>
            <Button variant="primary" size="sm" icon={<PenLine size={14} />} onClick={() => navigate('/planos')}>Começar agora</Button>
          </div>
        </div>
      </section>

      <div className="text-center text-[0.6rem] text-slate-400 pb-2 flex items-center justify-center gap-1.5">
        <BookOpenCheck size={12} /> Conteúdos alinhados à BNCC · Dados salvos localmente · Gratuito para sempre
      </div>
    </div>
  )
}
