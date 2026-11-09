import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Check,
  Download,
  Eye,
  EyeOff,
  Palette,
  Printer,
  Save,
  Shapes,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type { ActivityContent, IllustratedActivity, Stage } from '../lib/types'
import { YEAR_LABEL } from '../lib/types'
import { getTopic, topicsFor } from '../data/topics'
import { suggestSkills } from '../data/bncc'
import { ACTIVITY_KINDS, activityKindLabel, generateActivity, type ActivityKind } from '../lib/materials'
import { exportActivityPdf } from '../lib/pdf'
import { cn, stageYearText } from '../lib/utils'
import { Badge, Button, Card, Field, PageHeader, Select } from '../components/ui'
import { DocumentPaper } from '../components/Document'

const stageYears: Record<Stage, number[]> = { EF1: [1, 2, 3, 4, 5], EF2: [6, 7, 8, 9], EM: [0] }

function MiniShape({ kind }: { kind: string }) {
  const common = { fill: '#eef1ff', stroke: '#4666ff', strokeWidth: 2 }
  if (kind === 'circle') return <circle cx="28" cy="24" r="18" {...common} />
  if (kind === 'triangle') return <polygon points="28,6 48,40 8,40" {...common} />
  if (kind === 'rectangle') return <rect x="6" y="10" width="44" height="28" {...common} />
  if (kind === 'diamond') return <polygon points="28,4 50,24 28,44 6,24" {...common} />
  if (kind === 'pentagon') return <polygon points="28,4 50,19 42,44 14,44 6,19" {...common} />
  return <rect x="9" y="5" width="38" height="38" {...common} />
}

function DotsRow({ quantity, color }: { quantity: number; color: string }) {
  const total = Math.max(0, Math.min(30, quantity))
  return (
    <div className="flex flex-wrap gap-1.5 max-w-[15rem]">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className="w-4 h-4 rounded-full border"
          style={{ background: `${color}22`, borderColor: color }}
        />
      ))}
    </div>
  )
}

function Maze({ grid }: { grid: number[][] }) {
  const size = 20
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  return (
    <svg viewBox={`0 0 ${cols * size} ${rows * size}`} className="w-full max-w-[320px] rounded-lg border border-slate-200 bg-slate-50">
      {grid.map((row, y) => row.map((cell, x) => (
        <rect
          key={`${x}-${y}`}
          x={x * size}
          y={y * size}
          width={size}
          height={size}
          fill={cell === 0 ? '#ffffff' : '#dbe3f5'}
          stroke="#eef1f8"
          strokeWidth="1"
        />
      )))}
      <rect x={1} y={1} width={size - 2} height={size - 2} fill="#22c55e" opacity=".7" />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">E</text>
      <rect x={(cols - 1) * size + 1} y={(rows - 1) * size + 1} width={size - 2} height={size - 2} fill="#f97316" opacity=".8" />
      <text x={(cols - 0.5) * size} y={(rows - 0.5) * size + 4} textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">S</text>
    </svg>
  )
}

function ConnectPoints({ points }: { points: { n: number; x: number; y: number }[] }) {
  return (
    <svg viewBox="0 0 440 360" className="w-full max-w-[340px] rounded-lg border border-slate-200 bg-slate-50/70">
      <circle cx="220" cy="180" r="145" fill="none" stroke="#e2e8f4" strokeDasharray="4 5" />
      {points.map((point) => (
        <g key={point.n}>
          <circle cx={point.x} cy={point.y} r="10" fill="#eef1ff" stroke="#4666ff" strokeWidth="1.6" />
          <text x={point.x} y={point.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="800" fill="#334155">{point.n}</text>
        </g>
      ))}
    </svg>
  )
}

function ActivityVisual({ activity }: { activity: IllustratedActivity }) {
  if (activity.kind === 'figuras') {
    const shapes = (activity.data?.shapes as { name: string; sides: number; kind: string }[] | undefined) ?? []
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {shapes.map((shape) => (
          <div key={shape.name} className="rounded-xl border border-slate-100 bg-slate-50/50 p-2 text-center print-avoid-break">
            <svg viewBox="0 0 56 48" className="w-14 h-12 mx-auto" aria-label={shape.name}>
              <MiniShape kind={shape.kind} />
            </svg>
            <div className="mt-1 border-b border-slate-300 h-4" />
            <div className="text-[0.5rem] text-slate-400 mt-0.5">nome e nº de lados</div>
          </div>
        ))}
      </div>
    )
  }

  if (activity.kind === 'cacanumeros') {
    const grid = (activity.data?.grid as number[] | undefined) ?? []
    return (
      <div className="grid sm:grid-cols-[1fr_220px] gap-3">
        <div>
          <div className="text-[0.62rem] font-bold text-slate-500 mb-1.5">Operações para resolver e circular:</div>
          <div className="space-y-1">
            {activity.items.map((item, index) => (
              <div key={`${item.prompt}-${index}`} className="flex items-center gap-2 text-[0.76rem] text-slate-700">
                <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center text-[0.52rem] font-bold">{index + 1}</span>
                <span className="font-semibold">{item.prompt}</span>
                <span className="border-b border-slate-300 w-12 h-4" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {grid.map((value, index) => (
            <div key={`${value}-${index}`} className="aspect-square grid place-items-center rounded-md border border-slate-200 bg-white font-display text-[0.62rem] font-bold text-slate-600">
              {value}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activity.kind === 'ligue-pontos') {
    const points = (activity.data?.points as { n: number; x: number; y: number }[] | undefined) ?? []
    return (
      <div className="grid sm:grid-cols-[1fr_150px] gap-3 items-center">
        <ConnectPoints points={points} />
        <div>
          <div className="text-[0.65rem] font-bold text-slate-500">Ligue de 1 até {points.length}.</div>
          <div className="mt-2 rounded-lg border border-dashed border-slate-200 p-2">
            <div className="text-[0.55rem] uppercase tracking-wide text-slate-400">Figura formada</div>
            <div className="border-b border-slate-300 h-6 mt-1" />
          </div>
        </div>
      </div>
    )
  }

  if (activity.kind === 'labirinto') {
    const grid = (activity.data?.grid as number[][] | undefined) ?? []
    return (
      <div className="grid sm:grid-cols-[1fr_1fr] gap-3 items-start">
        <Maze grid={grid} />
        <div>
          <div className="text-[0.64rem] text-slate-500 leading-relaxed">Encontre o caminho da entrada (E) até a saída (S). Pinte apenas os quadros do caminho correto.</div>
          <div className="mt-2 space-y-2">
            {activity.items.map((item, index) => (
              <div key={`${item.prompt}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50/60 p-2">
                <div className="text-[0.64rem] font-bold text-slate-600">{item.prompt}</div>
                <div className="border-b border-slate-300 h-5 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (activity.kind === 'contar') {
    const quantities = (activity.data?.quantities as number[] | undefined) ?? activity.items.map((item) => Number(item.answer))
    return (
      <div className="grid sm:grid-cols-2 gap-2">
        {activity.items.map((item, index) => (
          <div key={`${item.prompt}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50/40 p-2.5 print-avoid-break">
            <div className="text-[0.62rem] font-bold text-slate-600">Grupo {index + 1}</div>
            <div className="mt-1.5 min-h-12">
              <DotsRow quantity={quantities[index] ?? Number(item.answer)} color={['#4666ff', '#f97316', '#16a34a', '#ec4899', '#0ea5e9', '#8b5cf6'][index % 6]} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-[0.6rem] text-slate-500">
              Quantidade: <span className="border-b border-slate-300 w-10 h-4" />
              Como se lê: <span className="border-b border-slate-300 flex-1 h-4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activity.kind === 'dinheiro') {
    return (
      <div className="space-y-2">
        {activity.items.map((item, index) => (
          <div key={`${item.prompt}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 print-avoid-break">
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center text-[0.55rem] font-bold shrink-0">{index + 1}</span>
              <p className="text-[0.72rem] text-slate-700 leading-relaxed">{item.prompt}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[0.58rem] text-slate-400">
              <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-emerald-700 font-bold">R$</span>
              <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-amber-700 font-bold">R$</span>
              <span className="ml-1">Troco: </span>
              <span className="flex-1 border-b border-slate-300 h-4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activity.kind === 'sequencias') {
    return (
      <div className="space-y-2">
        {activity.items.map((item, index) => (
          <div key={`${item.prompt}-${index}`} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/40 px-2.5 py-2 print-avoid-break">
            <span className="text-[0.56rem] font-bold text-slate-400 w-5 shrink-0">{index + 1})</span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {item.prompt.split(' , ').map((value, valueIndex) => (
                <span
                  key={`${value}-${valueIndex}`}
                  className={cn('min-w-8 h-7 rounded-md border grid place-items-center text-[0.7rem] font-bold px-1', value.includes('_') ? 'border-dashed border-indigo-300 bg-indigo-50/60 text-indigo-400' : 'border-slate-200 bg-white text-slate-600')}
                >
                  {value.includes('_') ? '?' : value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activity.kind === 'colorir' || activity.kind === 'resultado') {
    return (
      <div>
        {activity.kind === 'colorir' && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[0.58rem]">
            <span className="font-bold text-slate-500">Legenda:</span>
            {((activity.data?.palette as string[] | undefined) ?? []).map((color, index) => (
              <span key={color} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-0.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} /> {index + 1}
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {activity.items.map((item, index) => (
            <div key={`${item.prompt}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50/40 p-2 text-center print-avoid-break">
              <div className="text-[0.78rem] font-extrabold text-slate-700">{item.prompt}</div>
              <svg viewBox="0 0 60 56" className="w-14 h-13 mx-auto mt-1" aria-hidden="true">
                <MiniShape kind={index % 3 === 0 ? 'square' : index % 3 === 1 ? 'triangle' : 'circle'} />
              </svg>
              <div className="mx-auto mt-1 w-10 h-6 rounded border border-slate-300 bg-white" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activity.items.map((item, index) => (
        <div key={`${item.prompt}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 print-avoid-break">
          <div className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center text-[0.55rem] font-bold shrink-0">{index + 1}</span>
            <p className="text-[0.73rem] text-slate-700 leading-relaxed">{item.prompt}</p>
          </div>
          <div className="mt-2 space-y-2">
            <div className="answer-line !h-5" />
            <div className="answer-line !h-5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivitiesPage() {
  const { school, addMaterial, updateMaterial, materials, toast, settings } = useApp()
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<Stage>(settings.defaultStage)
  const [year, setYear] = useState(settings.defaultYear)
  const [topicId, setTopicId] = useState('adicao-subtracao')
  const [kind, setKind] = useState<ActivityKind>('colorir')
  const [tone, setTone] = useState<'colorido' | 'economico'>('colorido')
  const [count, setCount] = useState(6)
  const [seed, setSeed] = useState(7312)
  const [content, setContent] = useState<ActivityContent | null>(null)
  const [title, setTitle] = useState('Atividade ilustrada de Matemática')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)

  const topicOptions = useMemo(() => topicsFor(stage, year), [stage, year])
  const topic = getTopic(topicId)
  const kindMeta = ACTIVITY_KINDS.find((item) => item.id === kind)

  useEffect(() => {
    if (!topicOptions.some((item) => item.id === topicId)) setTopicId(topicOptions[0]?.id ?? 'adicao-subtracao')
  }, [topicOptions, topicId])

  useEffect(() => {
    const id = searchParams.get('material')
    if (!id) return
    const material = materials.find((item) => item.id === id && item.type === 'atividade')
    if (!material) return
    const next = material.content as ActivityContent
    if (!next?.activities) return
    setContent(next)
    setTitle(material.title)
    setStage(material.stage)
    setYear(material.year)
    setTopicId(material.topic)
    setTone(next.tone)
    const firstKind = next.activities[0]?.kind as ActivityKind | undefined
    if (firstKind && ACTIVITY_KINDS.some((item) => item.id === firstKind)) setKind(firstKind)
    setSavedId(material.id)
  }, [searchParams, materials])

  const generate = (newSeed = false) => {
    const nextSeed = newSeed ? Math.floor(Math.random() * 900000) + 1000 : seed
    const next = generateActivity({ stage, year, topic: topicId, kind, tone, count, seed: nextSeed })
    const nextTitle = `${kindMeta?.name ?? 'Atividade'} — ${topic.shortName}`
    setSeed(nextSeed)
    setContent(next)
    setTitle(nextTitle)
    setSavedId(null)
    setShowKey(false)
    toast({ title: 'Atividade gerada', description: `${next.activities.length} bloco(s) de atividade prontos para imprimir.`, tone: 'success' })
  }

  const save = () => {
    if (!content) return
    const payload = {
      type: 'atividade' as const,
      title,
      description: `${stageYearText(stage, year)} · ${topic.name} · ${activityKindLabel(kind)} · ${content.activities.reduce((total, item) => total + item.items.length, 0)} itens`,
      stage,
      year,
      topic: topicId,
      skillCodes: suggestSkills(stage, year, topicId, 1).map((skill) => skill.code),
      content,
    }
    if (savedId) {
      updateMaterial(savedId, payload)
      toast({ title: 'Atividade atualizada', tone: 'success' })
    } else {
      const material = addMaterial(payload)
      setSavedId(material.id)
      toast({ title: 'Atividade salva', description: 'Encontre o material na Biblioteca.', tone: 'success' })
    }
  }

  const download = () => {
    if (!content) return
    exportActivityPdf(content, school)
    toast({ title: 'PDF da atividade gerado', description: 'O material inclui a identidade da escola.', tone: 'success' })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Imprimir, recortar, colorir"
        title="Atividades ilustradas"
        description="Dez modelos de atividades visuais para contar, colorir, completar sequências, caçar números e resolver problemas."
        icon={<Palette size={21} />}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Save size={14} />} onClick={save} disabled={!content}>Salvar</Button>
            <Button size="sm" icon={<Download size={14} />} onClick={download} disabled={!content}>Baixar PDF</Button>
          </>
        }
      />

      <div className="grid xl:grid-cols-[350px_1fr] gap-5 items-start">
        <Card className="p-4 sm:p-5 xl:sticky xl:top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 grid place-items-center"><Wand2 size={16} /></div>
            <div>
              <div className="text-[0.8rem] font-bold">Montar atividade</div>
              <div className="text-[0.62rem] text-slate-400">Visual, pronta para imprimir</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Etapa">
                <Select value={stage} onChange={(event) => {
                  const next = event.target.value as Stage
                  setStage(next)
                  setYear(next === 'EM' ? 0 : next === 'EF1' ? 1 : 6)
                }}>
                  <option value="EF1">Fundamental I</option>
                  <option value="EF2">Fundamental II</option>
                  <option value="EM">Ensino Médio</option>
                </Select>
              </Field>
              <Field label="Ano">
                <Select value={year} onChange={(event) => setYear(Number(event.target.value))}>
                  {stageYears[stage].map((value) => <option key={value} value={value}>{YEAR_LABEL[value]}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Conteúdo" hint={topic.unit}>
              <Select value={topicId} onChange={(event) => setTopicId(event.target.value)}>
                {topicOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>

            <Field label="Modelo de atividade">
              <Select value={kind} onChange={(event) => setKind(event.target.value as ActivityKind)}>
                {ACTIVITY_KINDS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <div className="rounded-lg border border-pink-100 bg-pink-50/50 p-2.5 text-[0.62rem] text-slate-500 leading-relaxed -mt-1">
              {kindMeta?.description}
            </div>

            <div>
              <div className="field-label">Estilo de impressão</div>
              <div className="segmented">
                <button className={tone === 'colorido' ? 'active' : ''} onClick={() => setTone('colorido')}>Colorido</button>
                <button className={tone === 'economico' ? 'active' : ''} onClick={() => setTone('economico')}>Econômico</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Qtd. de itens">
                <Select value={count} onChange={(event) => setCount(Number(event.target.value))}>
                  {[4, 5, 6, 8, 10].map((value) => <option key={value} value={value}>{value}</option>)}
                </Select>
              </Field>
              <Field label="Recursos visuais" hint="automático">
                <div className="input !py-2 flex items-center gap-1.5 text-[0.7rem] text-slate-500">
                  <Shapes size={13} className="text-pink-500" /> Ilustrações SVG
                </div>
              </Field>
            </div>

            <Button className="w-full" size="lg" icon={<Sparkles size={15} />} onClick={() => generate(false)}>Gerar atividade</Button>
            <button onClick={() => generate(true)} className="w-full text-[0.62rem] font-bold text-slate-400 hover:text-pink-600 py-1">
              Trocar os números e as figuras
            </button>
          </div>
        </Card>

        <div className="min-w-0">
          {content ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 no-print">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="green"><Check size={11} /> Gerada</Badge>
                  <span className="text-[0.66rem] text-slate-500">{content.activities[0]?.items.length ?? 0} itens · {tone === 'colorido' ? 'colorida' : 'econômica'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant={showKey ? 'primary' : 'secondary'} size="sm" icon={showKey ? <EyeOff size={13} /> : <Eye size={13} />} onClick={() => setShowKey((value) => !value)}>
                    {showKey ? 'Ocultar respostas' : 'Ver respostas'}
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Printer size={13} />} onClick={() => window.print()}>Imprimir</Button>
                  <Button size="sm" icon={<Download size={13} />} onClick={download}>PDF</Button>
                </div>
              </div>

              <DocumentPaper title="Atividade ilustrada" subtitle={`${stageYearText(stage, year)} · ${topic.name}`}>
                <div className="mb-4">
                  <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-pink-500">Atividade ilustrada</div>
                  <h1 className="text-[1.18rem] font-bold leading-tight mt-1">{title}</h1>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge tone="blue">{YEAR_LABEL[year]}</Badge>
                    <Badge tone="violet">{topic.shortName}</Badge>
                    <Badge tone="orange">{kindMeta?.name}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 rounded-lg border border-slate-100 bg-slate-50/40 p-2.5">
                    {[['Nome', ''], ['Turma', ''], ['Data', '____/____/______'], ['Nota', '________']].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[0.5rem] font-extrabold uppercase tracking-wide text-slate-400">{label}</div>
                        <div className="h-5 border-b border-slate-300 text-[0.62rem] text-slate-500 pt-0.5">{value}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[0.63rem] text-slate-500 mt-2 leading-relaxed">{content.instructions}</p>
                </div>

                <div className="space-y-5">
                  {content.activities.map((activity, index) => (
                    <div key={activity.id} className="print-avoid-break">
                      {content.activities.length > 1 && (
                        <div className="text-[0.74rem] font-bold text-slate-700 mb-1">{index + 1}. {activity.title}</div>
                      )}
                      <p className="text-[0.64rem] text-slate-500 mb-2">{activity.instruction}</p>
                      <ActivityVisual activity={activity} />
                    </div>
                  ))}
                </div>

                {showKey && (
                  <div className="print-break mt-6 pt-4 border-t-2 border-dashed border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center"><Check size={15} /></div>
                      <div>
                        <h2 className="text-[0.92rem] font-bold">Respostas do professor</h2>
                        <p className="text-[0.58rem] text-slate-400">Confira o gabarito antes de imprimir para os estudantes.</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {content.activities.flatMap((activity) => activity.items.map((item, index) => (
                        <div key={`${activity.id}-${index}`} className="rounded-lg bg-slate-50 p-2.5 text-[0.64rem]">
                          <span className="font-bold text-indigo-700">{index + 1}. </span>
                          <span className="text-slate-600">{item.answer}</span>
                        </div>
                      )))}
                    </div>
                  </div>
                )}
              </DocumentPaper>
            </>
          ) : (
            <Card className="min-h-[560px] grid place-items-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 text-white grid place-items-center mx-auto shadow-lg shadow-pink-100">
                  <Palette size={27} />
                </div>
                <h2 className="text-lg font-bold mt-4">Atividades que encantam</h2>
                <p className="text-sm text-slate-500 leading-relaxed mt-2">
                  Escolha o modelo, o conteúdo e o estilo. A plataforma desenha os elementos visuais e organiza tudo em uma folha pronta para imprimir.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-5 text-left">
                  {ACTIVITY_KINDS.slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-2 text-[0.63rem] font-semibold text-slate-500">
                      {item.name}
                    </div>
                  ))}
                </div>
                <Button className="mt-5" icon={<Sparkles size={15} />} onClick={() => generate(false)}>Gerar atividade de exemplo</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
