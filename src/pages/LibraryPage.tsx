import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Calculator,
  Check,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Gamepad2,
  Heart,
  Layers3,
  Library,
  ListChecks,
  NotebookTabs,
  Palette,
  Pencil,
  Presentation,
  Printer,
  Search,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type {
  ActivityContent,
  ExamContent,
  ExerciseConfig,
  ExerciseContent,
  GameMaterial,
  LessonContent,
  Material,
  MaterialType,
  PlanContent,
  WorkbookContent,
} from '../lib/types'
import { MATERIAL_LABEL, YEAR_LABEL } from '../lib/types'
import { getTopic } from '../data/topics'
import { getSkill } from '../data/bncc'
import { exportMaterialPdf } from '../lib/pdf'
import { cn, formatDate, stageYearText, truncate } from '../lib/utils'
import { Badge, Button, Card, EmptyState, Input, Modal, PageHeader, Select } from '../components/ui'
import { DocumentPaper } from '../components/Document'
import { TopicIcon } from '../components/TopicIcon'

const typeIcons: Record<MaterialType, typeof ClipboardList> = {
  plano: ClipboardList,
  aula: Presentation,
  exercicios: Calculator,
  prova: FileCheck2,
  apostila: NotebookTabs,
  atividade: Palette,
  jogo: Gamepad2,
}

const typeColors: Record<MaterialType, { color: string; soft: string }> = {
  plano: { color: '#7c3aed', soft: '#f4efff' },
  aula: { color: '#4666ff', soft: '#eef1ff' },
  exercicios: { color: '#0ea5e9', soft: '#e9f8ff' },
  prova: { color: '#e11d48', soft: '#fff0f4' },
  apostila: { color: '#6366f1', soft: '#eef0ff' },
  atividade: { color: '#ec4899', soft: '#fff0f8' },
  jogo: { color: '#f97316', soft: '#fff3e8' },
}

const editRoutes: Record<MaterialType, string> = {
  plano: '/planos',
  aula: '/aulas',
  exercicios: '/exercicios',
  prova: '/provas',
  apostila: '/apostilas',
  atividade: '/atividades',
  jogo: '/jogos',
}

const typeOrder: MaterialType[] = ['plano', 'aula', 'exercicios', 'prova', 'apostila', 'atividade', 'jogo']

function TypeBadge({ type }: { type: MaterialType }) {
  const meta = typeColors[type]
  const Icon = typeIcons[type]
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-extrabold" style={{ background: meta.soft, color: meta.color }}>
      <Icon size={10} /> {MATERIAL_LABEL[type]}
    </span>
  )
}

function QuestionList({ questions, showAnswers = true }: { questions: ExamContent['questions']; showAnswers?: boolean }) {
  if (!questions?.length) return <p className="text-[0.72rem] text-slate-400">Nenhuma questão registrada.</p>
  return (
    <div className="space-y-2.5">
      {questions.map((question, index) => (
        <div key={question.id ?? index} className="rounded-lg border border-slate-100 bg-white p-2.5 print-avoid-break">
          <div className="flex gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center text-[0.56rem] font-extrabold">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.71rem] text-slate-700 leading-relaxed whitespace-pre-line">{question.prompt}</p>
              {question.options?.length ? (
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-0.5 mt-1.5">
                  {question.options.map((option, optionIndex) => (
                    <div key={`${option}-${optionIndex}`} className="text-[0.64rem] text-slate-500">
                      <span className="font-bold text-slate-400">{String.fromCharCode(65 + optionIndex)})</span> {option}
                    </div>
                  ))}
                </div>
              ) : null}
              {showAnswers && (
                <div className="mt-1.5 text-[0.62rem] text-emerald-700 font-bold">
                  Resposta: {question.answer}
                  {question.steps?.length > 0 && <span className="block text-[0.59rem] font-normal text-slate-500 mt-0.5">{question.steps.join(' ')}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MaterialPreview({ material, onEdit }: { material: Material; onEdit: () => void }) {
  const content = material.content as Record<string, unknown>
  const topic = getTopic(material.topic)
  const skills = material.skillCodes.map((code) => getSkill(code)).filter(Boolean)

  const body = (() => {
    if (material.type === 'plano') {
      const plan = content as unknown as PlanContent
      return (
        <>
          <p className="text-[0.76rem] text-slate-600 leading-relaxed">{plan.justification}</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <div className="text-[0.55rem] font-extrabold uppercase tracking-wide text-slate-400">Objetivo geral</div>
              <p className="text-[0.68rem] text-slate-600 mt-1 leading-relaxed">{plan.generalObjective}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <div className="text-[0.55rem] font-extrabold uppercase tracking-wide text-slate-400">Metodologia</div>
              <p className="text-[0.68rem] text-slate-600 mt-1 leading-relaxed">{plan.methodology}</p>
            </div>
          </div>
          <PreviewList title="Objetivos específicos" items={plan.specificObjectives} />
          <PreviewList title="Desenvolvimento" items={plan.development.map((step) => `${step.stage} (${step.duration}): ${step.description}`)} />
          <PreviewList title="Avaliação" items={plan.assessment} />
          <PreviewList title="Recursos" items={plan.resources} />
        </>
      )
    }
    if (material.type === 'aula') {
      const lesson = content as unknown as LessonContent
      return (
        <>
          <p className="text-[0.76rem] text-slate-600 leading-relaxed">{lesson.summary}</p>
          <PreviewList title="Objetivos" items={lesson.objectives} />
          <div className="mt-3 space-y-1.5">
            {lesson.slides.map((slide, index) => (
              <div key={slide.id ?? index} className="rounded-lg border border-slate-100 bg-white p-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 grid place-items-center text-[0.54rem] font-extrabold">{index + 1}</span>
                  <div className="text-[0.65rem] font-extrabold uppercase tracking-wide text-indigo-500">{slide.eyebrow}</div>
                </div>
                <div className="text-[0.72rem] font-bold text-slate-700 mt-1">{slide.title}</div>
                <p className="text-[0.63rem] text-slate-500 mt-0.5 leading-relaxed">{truncate(slide.body.join(' '), 240)}</p>
                {slide.question && <div className="mt-1 text-[0.6rem] text-emerald-700 font-bold">Desafio: {slide.question.answer}</div>}
              </div>
            ))}
          </div>
        </>
      )
    }
    if (material.type === 'exercicios') {
      const exercise = content as unknown as ExerciseContent
      return (
        <>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge tone="blue">{exercise.config?.difficulty ?? 'medio'}</Badge>
            <Badge tone="violet">{exercise.questions?.length ?? 0} questões</Badge>
            {exercise.variants && <Badge tone="orange">{exercise.variants.length} versões</Badge>}
          </div>
          <QuestionList questions={exercise.questions ?? []} />
        </>
      )
    }
    if (material.type === 'prova') {
      const exam = content as unknown as ExamContent
      return (
        <>
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 mb-3">
            <div className="grid grid-cols-2 gap-2 text-[0.62rem]">
              <div><span className="font-extrabold text-slate-400">Escola:</span> {exam.header?.school || '—'}</div>
              <div><span className="font-extrabold text-slate-400">Professor:</span> {exam.header?.teacher || '—'}</div>
              <div><span className="font-extrabold text-slate-400">Valor:</span> {exam.header?.value || '—'}</div>
              <div><span className="font-extrabold text-slate-400">Formato:</span> {exam.layout === 'paisagem' ? 'A4 paisagem' : 'A4 retrato'}</div>
            </div>
          </div>
          <QuestionList questions={exam.questions ?? []} showAnswers={exam.showAnswers} />
        </>
      )
    }
    if (material.type === 'apostila') {
      const workbook = content as unknown as WorkbookContent
      return (
        <>
          <p className="text-[0.74rem] text-slate-600 leading-relaxed">{workbook.presentation}</p>
          <PreviewList title="Conteúdos" items={workbook.topics?.map((id) => getTopic(id).name) ?? []} />
          <QuestionList questions={workbook.questions ?? []} showAnswers={workbook.includeAnswers} />
        </>
      )
    }
    if (material.type === 'atividade') {
      const activity = content as unknown as ActivityContent
      return (
        <>
          <p className="text-[0.74rem] text-slate-600 leading-relaxed">{activity.instructions}</p>
          <div className="mt-3 space-y-2">
            {activity.activities?.map((block, index) => (
              <div key={block.id ?? index} className="rounded-lg border border-slate-100 bg-white p-2.5">
                <div className="text-[0.68rem] font-bold text-slate-700">{index + 1}. {block.title}</div>
                <p className="text-[0.61rem] text-slate-500 mt-0.5">{block.instruction}</p>
                <div className="mt-1.5 grid sm:grid-cols-2 gap-1">
                  {block.items.slice(0, 6).map((item, itemIndex) => (
                    <div key={itemIndex} className="rounded bg-slate-50 px-2 py-1 text-[0.6rem] text-slate-600">
                      {item.prompt} <span className="text-emerald-600 font-bold">({item.answer})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )
    }
    const game = content as unknown as GameMaterial
    return (
      <>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge tone="orange">{game.gameId || 'Jogo'}</Badge>
          <Badge>{game.config?.difficulty ?? 'medio'}</Badge>
          <Badge tone="violet">{game.questions?.length ?? 0} rodadas</Badge>
        </div>
        <QuestionList questions={game.questions ?? []} />
      </>
    )
  })()

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <TypeBadge type={material.type} />
        <Badge tone="blue">{YEAR_LABEL[material.year]}</Badge>
        <Badge tone="violet">{topic.shortName}</Badge>
        {skills.map((skill) => skill && <Badge key={skill.code} tone="green">{skill.code}</Badge>)}
        <span className="text-[0.6rem] text-slate-400 ml-auto">Atualizado em {formatDate(material.updatedAt)}</span>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
        {body}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={onEdit} icon={<Pencil size={13} />}>Abrir no editor</Button>
        <span className="text-[0.6rem] text-slate-400 self-center">Use “Baixar PDF” no rodapé para exportar com a identidade da escola.</span>
      </div>
    </div>
  )
}

function PreviewList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null
  return (
    <div className="mt-3">
      <div className="text-[0.56rem] font-extrabold uppercase tracking-wide text-slate-400 mb-1">{title}</div>
      <ul className="space-y-0.5">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="text-[0.65rem] text-slate-600 leading-relaxed flex gap-1.5">
            <span className="text-indigo-400 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MaterialCard({
  material,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onPdf,
}: {
  material: Material
  onPreview: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  onPdf: () => void
}) {
  const meta = typeColors[material.type]
  const Icon = typeIcons[material.type]
  const topic = getTopic(material.topic)

  return (
    <div className="surface surface-hover overflow-hidden flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: meta.soft, color: meta.color }}>
            <Icon size={19} />
          </div>
          <div className="flex items-center gap-1">
            {material.shared && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.58rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Público
              </span>
            )}
            <button
              onClick={onToggleFavorite}
              className={cn('w-8 h-8 rounded-lg grid place-items-center transition-colors', material.favorite ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50')}
              aria-label={material.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star size={16} fill={material.favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <TypeBadge type={material.type} />
            {material.authorName && (
              <span className="text-[0.58rem] text-slate-500 font-medium">
                por {material.authorName}
              </span>
            )}
          </div>
          <h3 className="text-[0.9rem] font-bold leading-snug mt-1.5 line-clamp-2">{material.title}</h3>
          <p className="text-[0.66rem] text-slate-500 mt-1 leading-relaxed line-clamp-2">{material.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="text-[0.58rem] font-bold text-slate-400">{YEAR_LABEL[material.year]}</span>
          <span className="text-slate-200">·</span>
          <span className="text-[0.58rem] font-semibold" style={{ color: topic.color }}>{topic.shortName}</span>
          {material.favorite && <Heart size={10} className="text-rose-400 ml-auto" fill="currentColor" />}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/40 p-2 flex items-center gap-1">
        <button onClick={onPreview} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-[0.64rem] font-bold text-slate-600 hover:bg-white hover:text-indigo-600">
          <Eye size={12} /> Ver
        </button>
        <button onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-[0.64rem] font-bold text-slate-600 hover:bg-white hover:text-indigo-600">
          <Pencil size={12} /> Editar
        </button>
        <button onClick={onPdf} className="w-7 h-7 rounded-lg grid place-items-center text-slate-400 hover:bg-white hover:text-indigo-600" aria-label="Baixar PDF">
          <Download size={13} />
        </button>
        <button onClick={onDuplicate} className="w-7 h-7 rounded-lg grid place-items-center text-slate-400 hover:bg-white hover:text-indigo-600" aria-label="Duplicar material">
          <Copy size={13} />
        </button>
        <button onClick={onDelete} className="w-7 h-7 rounded-lg grid place-items-center text-slate-400 hover:bg-rose-50 hover:text-rose-500" aria-label="Excluir material">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export function LibraryPage() {
  const { materials, school, toggleFavorite, duplicateMaterial, deleteMaterial, toast, restoreDemo, clearMaterials } = useApp()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [type, setType] = useState<'todos' | MaterialType>('todos')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sort, setSort] = useState<'recentes' | 'antigos' | 'titulo'>('recentes')
  const [preview, setPreview] = useState<Material | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null)
  const [clearOpen, setClearOpen] = useState(false)
  const printMode = searchParams.get('imprimir') === '1'

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    const id = searchParams.get('material')
    if (!id) return
    const material = materials.find((item) => item.id === id)
    if (material) setPreview(material)
  }, [searchParams, materials])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = materials.filter((material) => {
      if (type !== 'todos' && material.type !== type) return false
      if (favoritesOnly && !material.favorite) return false
      if (!q) return true
      const topic = getTopic(material.topic)
      const haystack = `${material.title} ${material.description} ${topic.name} ${material.skillCodes.join(' ')} ${MATERIAL_LABEL[material.type]}`.toLowerCase()
      return haystack.includes(q)
    })
    return list.sort((a, b) => {
      if (sort === 'titulo') return a.title.localeCompare(b.title, 'pt-BR')
      const diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      return sort === 'recentes' ? -diff : diff
    })
  }, [materials, query, type, favoritesOnly, sort])

  const counts = useMemo(() => {
    const result: Record<string, number> = { todos: materials.length }
    typeOrder.forEach((item) => { result[item] = materials.filter((material) => material.type === item).length })
    return result
  }, [materials])

  const favorites = materials.filter((material) => material.favorite).length

  const updateQuery = (value: string) => {
    setQuery(value)
    const next = new URLSearchParams(searchParams)
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    next.delete('material')
    next.delete('imprimir')
    setSearchParams(next, { replace: true })
  }

  const openEditor = (material: Material) => {
    navigate(`${editRoutes[material.type]}?material=${material.id}`)
  }

  const openPreview = (material: Material) => {
    setPreview(material)
    const next = new URLSearchParams(searchParams)
    next.set('material', material.id)
    setSearchParams(next, { replace: true })
  }

  const closePreview = () => {
    setPreview(null)
    const next = new URLSearchParams(searchParams)
    next.delete('material')
    setSearchParams(next, { replace: true })
  }

  const handleDuplicate = (material: Material) => {
    const copy = duplicateMaterial(material.id)
    if (copy) toast({ title: 'Material duplicado', description: 'A cópia foi adicionada no início da biblioteca.', tone: 'success' })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMaterial(deleteTarget.id)
    if (preview?.id === deleteTarget.id) setPreview(null)
    setDeleteTarget(null)
    toast({ title: 'Material excluído', description: 'A ação não pode ser desfeita.', tone: 'info' })
  }

  const handlePdf = (material: Material) => {
    try {
      exportMaterialPdf(material, school)
      toast({ title: 'PDF gerado', description: `${material.title} foi exportado com a identidade da escola.`, tone: 'success' })
    } catch {
      toast({ title: 'Não foi possível gerar o PDF', description: 'Abra o material no editor e tente novamente.', tone: 'error' })
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={printMode ? 'Central de impressão' : 'Tudo o que você criou'}
        title={printMode ? 'Central de impressão' : 'Minha biblioteca'}
        description={printMode
          ? 'Revise seus materiais, confira os dados de cada documento e imprima ou exporte em PDF com um clique.'
          : 'Pesquise, visualize, duplique e organize planos, aulas, provas, apostilas, atividades e jogos.'}
        icon={<Library size={21} />}
        actions={
          <>
            {printMode ? (
              <Link to="/biblioteca" className="btn btn-secondary btn-sm"><Library size={14} /> Ver biblioteca</Link>
            ) : (
              <Link to="/biblioteca?imprimir=1" className="btn btn-secondary btn-sm"><Printer size={14} /> Central de impressão</Link>
            )}
            <Button size="sm" icon={<Sparkles size={14} />} onClick={() => navigate('/planos')}>Criar material</Button>
          </>
        }
      />

      {printMode ? (
        <>
          <div className="grid sm:grid-cols-3 gap-3 mb-5 no-print">
            {[
              { label: 'Materiais disponíveis', value: materials.length, icon: Layers3, color: 'text-indigo-500' },
              { label: 'Favoritos', value: favorites, icon: Star, color: 'text-amber-500' },
              { label: 'Última atualização', value: materials[0] ? formatDate(materials[0].updatedAt) : '—', icon: Clock3, color: 'text-emerald-500' },
            ].map((stat) => (
              <Card key={stat.label} soft className="p-3 flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-lg bg-slate-50 grid place-items-center', stat.color)}><stat.icon size={17} /></div>
                <div>
                  <div className="text-[1rem] font-bold leading-tight">{stat.value}</div>
                  <div className="text-[0.6rem] text-slate-400">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>

          <DocumentPaper title="Catálogo de materiais" subtitle={`${filtered.length} material(is) · gerado em ${formatDate(new Date())}`}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-indigo-500">Inventário pedagógico</div>
                <h1 className="text-[1.15rem] font-bold mt-1">Central de impressão</h1>
                <p className="text-[0.68rem] text-slate-500 mt-1">
                  Documentos prontos para revisar, imprimir em A4 ou exportar em PDF. O cabeçalho utiliza a identidade da escola.
                </p>
              </div>
              <Badge tone="blue">{filtered.length} materiais</Badge>
            </div>

            {filtered.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 pr-2 text-[0.55rem] font-extrabold uppercase tracking-wide text-slate-400">Material</th>
                      <th className="py-2 px-2 text-[0.55rem] font-extrabold uppercase tracking-wide text-slate-400">Tipo</th>
                      <th className="py-2 px-2 text-[0.55rem] font-extrabold uppercase tracking-wide text-slate-400">Ano</th>
                      <th className="py-2 px-2 text-[0.55rem] font-extrabold uppercase tracking-wide text-slate-400">Atualizado</th>
                      <th className="py-2 pl-2 text-[0.55rem] font-extrabold uppercase tracking-wide text-slate-400 text-right no-print">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((material) => {
                      const meta = typeColors[material.type]
                      return (
                        <tr key={material.id} className="border-b border-slate-100">
                          <td className="py-2 pr-2">
                            <div className="text-[0.68rem] font-bold text-slate-700">{material.title}</div>
                            <div className="text-[0.56rem] text-slate-400">{getTopic(material.topic).name} · {material.skillCodes.join(', ') || 'Sem código BNCC'}</div>
                          </td>
                          <td className="py-2 px-2"><span className="text-[0.58rem] font-bold" style={{ color: meta.color }}>{MATERIAL_LABEL[material.type]}</span></td>
                          <td className="py-2 px-2 text-[0.62rem] text-slate-600">{YEAR_LABEL[material.year]}</td>
                          <td className="py-2 px-2 text-[0.58rem] text-slate-500">{formatDate(material.updatedAt)}</td>
                          <td className="py-2 pl-2 no-print">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="secondary" onClick={() => openPreview(material)} icon={<Eye size={11} />}>Ver</Button>
                              <Button size="sm" onClick={() => handlePdf(material)} icon={<Download size={11} />}>PDF</Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm text-slate-500">Nenhum material encontrado com os filtros atuais.</p>
              </div>
            )}

            <div className="mt-5 rounded-lg bg-slate-50 p-3 text-[0.6rem] text-slate-500 leading-relaxed">
              <strong className="text-slate-600">Como imprimir:</strong> clique em “Ver” para abrir a prévia completa e use “Imprimir” ou “Baixar PDF”. As páginas seguem o formato A4 com margens de segurança e gabarito em página separada quando disponível.
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 text-[0.55rem] text-slate-400">
              <span>{school.name || 'Sua escola'} · Matemática Interativa</span>
              <span>{formatDate(new Date())}</span>
            </div>
          </DocumentPaper>

          <div className="mt-4 flex justify-center gap-2 no-print">
            <Button variant="secondary" onClick={() => window.print()} icon={<Printer size={14} />}>Imprimir catálogo</Button>
          </div>
        </>
      ) : materials.length === 0 ? (
        <EmptyState
          icon={<Library size={22} />}
          title="Sua biblioteca está vazia"
          description="Crie um plano, uma aula ou uma atividade. Tudo fica salvo automaticamente neste navegador e disponível para reutilizar."
          action={
            <div className="flex gap-2">
              <Button onClick={() => navigate('/planos')} icon={<Sparkles size={14} />}>Criar primeiro material</Button>
              <Button variant="secondary" onClick={restoreDemo}>Restaurar demonstração</Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Materiais na biblioteca', value: String(materials.length), detail: `${typeOrder.filter((item) => (counts[item] ?? 0) > 0).length} formatos diferentes`, icon: Layers3, color: 'text-indigo-500', soft: 'bg-indigo-50' },
              { label: 'Favoritos', value: String(favorites), detail: favorites ? 'Seus materiais prioritários' : 'Marque com estrela', icon: Star, color: 'text-amber-500', soft: 'bg-amber-50' },
              { label: 'Habilidades BNCC', value: String(new Set(materials.flatMap((material) => material.skillCodes)).size), detail: 'Códigos vinculados aos materiais', icon: ListChecks, color: 'text-emerald-500', soft: 'bg-emerald-50' },
              { label: 'Última atualização', value: materials[0] ? formatDate(materials[0].updatedAt) : '—', detail: 'Salvo automaticamente neste navegador', icon: Clock3, color: 'text-sky-500', soft: 'bg-sky-50' },
            ].map((stat) => (
              <Card key={stat.label} className="p-3.5">
                <div className="flex items-center gap-2.5">
                  <div className={cn('w-9 h-9 rounded-lg grid place-items-center shrink-0', stat.soft, stat.color)}><stat.icon size={17} /></div>
                  <div className="min-w-0">
                    <div className="text-[1.02rem] font-bold leading-tight truncate">{stat.value}</div>
                    <div className="text-[0.6rem] font-semibold text-slate-500">{stat.label}</div>
                  </div>
                </div>
                <p className="text-[0.55rem] text-slate-400 mt-2 truncate">{stat.detail}</p>
              </Card>
            ))}
          </div>

          <Card className="p-3 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="!pl-9" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Buscar por título, conteúdo, tipo ou habilidade…" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFavoritesOnly((value) => !value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[0.68rem] font-bold transition-colors',
                    favoritesOnly ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                  )}
                >
                  <Star size={13} fill={favoritesOnly ? 'currentColor' : 'none'} /> Favoritos
                </button>
                <Select className="!w-[9.5rem] !py-2 !text-[0.7rem]" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
                  <option value="recentes">Mais recentes</option>
                  <option value="antigos">Mais antigos</option>
                  <option value="titulo">Título A–Z</option>
                </Select>
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto mt-3 pb-0.5">
              <button
                onClick={() => setType('todos')}
                className={cn('px-2.5 py-1.5 rounded-lg text-[0.68rem] font-bold whitespace-nowrap border', type === 'todos' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200')}
              >
                Todos ({counts.todos})
              </button>
              {typeOrder.map((item) => {
                const Icon = typeIcons[item]
                return (
                  <button
                    key={item}
                    onClick={() => setType(item)}
                    className={cn('inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.68rem] font-bold whitespace-nowrap border', type === item ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200')}
                  >
                    <Icon size={12} /> {MATERIAL_LABEL[item]} ({counts[item] ?? 0})
                  </button>
                )
              })}
            </div>
          </Card>

          {filtered.length ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[0.68rem] text-slate-500">
                  {filtered.length} material(is){query ? ` para “${query}”` : ''}
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={restoreDemo} icon={<Sparkles size={13} />}>Restaurar demo</Button>
                  <Button variant="ghost" size="sm" onClick={() => setClearOpen(true)} icon={<Trash2 size={13} />}>Limpar biblioteca</Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {filtered.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onPreview={() => openPreview(material)}
                    onEdit={() => openEditor(material)}
                    onDuplicate={() => handleDuplicate(material)}
                    onDelete={() => setDeleteTarget(material)}
                    onToggleFavorite={() => toggleFavorite(material.id)}
                    onPdf={() => handlePdf(material)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Search size={22} />}
              title="Nenhum material encontrado"
              description="Tente outro termo de busca ou remova os filtros. A busca considera título, descrição, conteúdo, tipo e códigos BNCC."
              action={<Button variant="secondary" onClick={() => { updateQuery(''); setType('todos'); setFavoritesOnly(false) }}>Limpar filtros</Button>}
            />
          )}
        </>
      )}

      <Modal
        open={Boolean(preview)}
        onClose={closePreview}
        title={preview?.title ?? 'Material'}
        description={preview ? `${MATERIAL_LABEL[preview.type]} · ${stageYearText(preview.stage, preview.year)} · ${formatDate(preview.updatedAt)}` : undefined}
        wide
        footer={
          preview ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => { const target = preview; closePreview(); setDeleteTarget(target) }} icon={<Trash2 size={13} />}>Excluir</Button>
              <Button variant="secondary" size="sm" onClick={() => handlePdf(preview)} icon={<Download size={13} />}>Baixar PDF</Button>
              <Button size="sm" onClick={() => openEditor(preview)} icon={<Pencil size={13} />}>Abrir no editor</Button>
            </>
          ) : undefined
        }
      >
        {preview && <MaterialPreview material={preview} onEdit={() => openEditor(preview)} />}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Excluir material?"
        description="Esta ação remove o material apenas deste navegador e não pode ser desfeita."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} icon={<Trash2 size={13} />}>Excluir definitivamente</Button>
          </>
        }
      >
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
          <div className="text-[0.78rem] font-bold text-slate-700">{deleteTarget?.title}</div>
          <p className="text-[0.66rem] text-slate-500 mt-1">{deleteTarget?.description}</p>
        </div>
        <p className="text-[0.68rem] text-slate-500 mt-3">Dica: exporte um backup antes de excluir materiais importantes.</p>
      </Modal>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Limpar toda a biblioteca?"
        description="Todos os materiais salvos neste navegador serão removidos."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setClearOpen(false)}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={() => { clearMaterials(); setClearOpen(false) }} icon={<Trash2 size={13} />}>Limpar biblioteca</Button>
          </>
        }
      >
        <p className="text-[0.72rem] text-slate-600 leading-relaxed">
          A identidade da escola e as preferências serão mantidas. Você pode restaurar os exemplos de demonstração a qualquer momento.
        </p>
      </Modal>
    </div>
  )
}
