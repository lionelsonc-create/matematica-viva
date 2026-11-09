import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Layers3,
  ListChecks,
  Printer,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type { Difficulty, ExerciseConfig, Material, Question, QuestionKind, Stage } from '../lib/types'
import { DIFFICULTY_LABEL, YEAR_LABEL } from '../lib/types'
import { suggestSkills, getSkill, skillsFor } from '../data/bncc'
import { topicsFor, getTopic } from '../data/topics'
import { detectShapeFromText, generateQuestions, generateVariants } from '../lib/generators'
import { exportExercisePdf } from '../lib/pdf'
import { stageYearText, truncate } from '../lib/utils'
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Select, Textarea } from '../components/ui'
import { DocumentPaper } from '../components/Document'
import { QuestionGeometryVisual } from '../components/GeometryFigure'

const stageYears: Record<Stage, number[]> = { EF1: [1, 2, 3, 4, 5], EF2: [6, 7, 8, 9], EM: [0] }

const kinds: { value: QuestionKind; label: string; description: string }[] = [
  { value: 'multipla', label: 'Múltipla escolha', description: 'Quatro alternativas com uma correta.' },
  { value: 'aberta', label: 'Questão aberta', description: 'Resposta dissertativa com espaço para cálculo.' },
  { value: 'lacunas', label: 'Complete as lacunas', description: 'Frase com espaço para completar.' },
  { value: 'vf', label: 'Verdadeiro ou falso', description: 'Julgamento de igualdades e afirmações.' },
  { value: 'associacao', label: 'Relacione as colunas', description: 'Associação entre expressões e resultados.' },
]

function QuestionPreview({ question, index, showAnswer, includeVisual }: { question: Question; index: number; showAnswer: boolean; includeVisual: boolean }) {
  const figure = question.figure || detectShapeFromText(question.prompt, question.topic)

  return (
    <div className="py-3 border-b border-slate-100 last:border-0 print-avoid-break">
      <div className="flex gap-2">
        <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center text-[0.62rem] font-extrabold shrink-0">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.79rem] text-slate-700 leading-relaxed whitespace-pre-line">{question.prompt}</p>

          {includeVisual && figure && (
            <div className="mt-2.5 mb-2">
              <QuestionGeometryVisual figure={figure} />
            </div>
          )}

          {includeVisual && !figure && question.topic === 'fracoes' && (
            <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 flex items-center gap-3">
              <svg width="58" height="44" viewBox="0 0 58 44" className="shrink-0" aria-label="Apoio visual frações">
                <rect x="4" y="9" width="50" height="26" rx="3" fill="#eef1ff" stroke="#4666ff" />
                <line x1="20" y1="9" x2="20" y2="35" stroke="#4666ff" />
                <line x1="36" y1="9" x2="36" y2="35" stroke="#4666ff" />
              </svg>
              <div className="text-[0.6rem] text-slate-500 leading-snug">
                <div className="font-bold text-slate-600">Apoio visual</div>
                Use a barra de frações para representar as partes do inteiro.
              </div>
            </div>
          )}
          {question.options?.length ? (
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
              {question.options.map((option, optionIndex) => (
                <div key={`${option}-${optionIndex}`} className="flex items-start gap-1.5 text-[0.73rem] text-slate-600">
                  <span className="font-bold text-slate-400">{String.fromCharCode(65 + optionIndex)})</span>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="answer-line" />
              <div className="answer-line" />
            </div>
          )}
          {showAnswer && (
            <div className="mt-2 rounded-lg bg-emerald-50/70 border border-emerald-100 px-2.5 py-2">
              <span className="text-[0.65rem] font-extrabold text-emerald-700">Resposta: {question.answer}</span>
              <ol className="mt-1 space-y-0.5">
                {question.steps.map((step, stepIndex) => (
                  <li key={`${step}-${stepIndex}`} className="text-[0.63rem] text-slate-600">{stepIndex + 1}. {step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ExercisesPage() {
  const { school, addMaterial, updateMaterial, materials, toast, settings } = useApp()
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<Stage>(settings.defaultStage)
  const [year, setYear] = useState(settings.defaultYear)
  const [topicId, setTopicId] = useState(searchParams.get('topic') || 'fracoes')
  const [difficulty, setDifficulty] = useState<Difficulty>('medio')
  const [count, setCount] = useState(8)
  const [selectedKinds, setSelectedKinds] = useState<QuestionKind[]>(['multipla', 'aberta'])
  const [includeSolutions, setIncludeSolutions] = useState(true)
  const [includeImages, setIncludeImages] = useState(true)
  const [contextualized, setContextualized] = useState(true)
  const [variantsCount, setVariantsCount] = useState(2)
  const [skillCode, setSkillCode] = useState('')
  const [skillSearch, setSkillSearch] = useState('')
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 900000) + 1000)
  const [config, setConfig] = useState<ExerciseConfig | null>(null)
  const [variants, setVariants] = useState<{ label: string; questions: Question[] }[]>([])
  const [activeVariant, setActiveVariant] = useState(0)
  const [title, setTitle] = useState('Lista de exercícios de Matemática')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)

  const topicOptions = useMemo(() => topicsFor(stage, year), [stage, year])
  const topic = getTopic(topicId)
  const skills = useMemo(() => {
    const query = skillSearch.trim().toLowerCase()
    const base = skillsFor(stage, year)
    if (!query) return suggestSkills(stage, year, topicId, 8)
    return base.filter((skill) => skill.code.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query)).slice(0, 20)
  }, [stage, year, topicId, skillSearch])

  useEffect(() => {
    if (!topicOptions.some((item) => item.id === topicId)) setTopicId(topicOptions[0]?.id ?? 'fracoes')
  }, [topicOptions, topicId])

  useEffect(() => {
    const suggested = suggestSkills(stage, year, topicId, 1)[0]
    setSkillCode(suggested?.code ?? '')
  }, [stage, year, topicId])

  useEffect(() => {
    const id = searchParams.get('material')
    if (!id) return
    const material = materials.find((item) => item.id === id && item.type === 'exercicios')
    if (!material) return
    const content = material.content as { config: ExerciseConfig; questions: Question[]; variants?: { label: string; questions: Question[] }[] }
    if (!content?.config) return
    setConfig(content.config)
    setStage(content.config.stage)
    setYear(content.config.year)
    setTopicId(content.config.topic)
    setDifficulty(content.config.difficulty)
    setCount(content.config.count)
    setSelectedKinds(content.config.kinds)
    setContextualized(content.config.contextualized)
    setIncludeSolutions(content.config.includeSolutions)
    setIncludeImages(content.config.includeImages)
    setVariantsCount(content.config.variants)
    setSkillCode(content.config.skillCode)
    setSeed(content.config.seed)
    setTitle(material.title)
    setSavedId(material.id)
    setVariants(content.variants || [{ label: 'A', questions: content.questions }])
    setActiveVariant(0)
  }, [searchParams, materials])

  const currentQuestions = variants[activeVariant]?.questions ?? []

  const buildConfig = (overrideSeed = seed): ExerciseConfig => ({
    stage,
    year,
    topic: topicId,
    skillCode,
    count,
    difficulty,
    kinds: selectedKinds.length ? selectedKinds : ['multipla'],
    includeSolutions,
    includeImages,
    contextualized,
    variants: variantsCount,
    seed: overrideSeed,
  })

  const generate = (newSeed = false) => {
    const nextSeed = newSeed ? Math.floor(Math.random() * 900000) + 1000 : seed
    const nextConfig = buildConfig(nextSeed)
    const nextVariants = generateVariants(nextConfig)
    setSeed(nextSeed)
    setConfig(nextConfig)
    setVariants(nextVariants)
    setActiveVariant(0)
    setSavedId(null)
    setShowKey(false)
    setTitle(`Lista de ${topic.shortName.toLowerCase()} — ${YEAR_LABEL[year]}`)
    toast({ title: 'Atividade gerada', description: `${count} questões e ${nextVariants.length} versão(ões) prontas.`, tone: 'success' })
  }

  const toggleKind = (kind: QuestionKind) => {
    setSelectedKinds((current) =>
      current.includes(kind) ? (current.length > 1 ? current.filter((item) => item !== kind) : current) : [...current, kind],
    )
  }

  const save = () => {
    if (!config || !variants.length) return
    const payload = {
      type: 'exercicios' as const,
      title,
      description: `${stageYearText(stage, year)} · ${topic.name} · ${count} questões · ${variants.length} versão(ões)`,
      stage,
      year,
      topic: topicId,
      skillCodes: skillCode ? [skillCode] : [],
      content: { config, questions: variants[0].questions, variants },
    }
    if (savedId) {
      updateMaterial(savedId, payload)
      toast({ title: 'Lista atualizada', tone: 'success' })
    } else {
      const material = addMaterial(payload)
      setSavedId(material.id)
      toast({ title: 'Lista salva na biblioteca', description: 'Você pode reutilizar e gerar novas versões quando quiser.', tone: 'success' })
    }
  }

  const download = () => {
    if (!config || !currentQuestions.length) return
    exportExercisePdf(config, currentQuestions, school, {
      title: `${title}${variants.length > 1 ? ` — versão ${variants[activeVariant]?.label}` : ''}`,
      subtitle: `${stageYearText(stage, year)} · ${topic.name} · ${currentQuestions.length} questões`,
      includeKey: includeSolutions,
    })
    toast({ title: 'PDF gerado', description: includeSolutions ? 'A lista e o gabarito foram exportados.' : 'A lista foi exportada.', tone: 'success' })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Prática que personaliza"
        title="Gerador de exercícios"
        description="Crie listas matematicamente corretas, com gabarito, resolução passo a passo e versões diferentes para a mesma habilidade."
        icon={<Calculator size={21} />}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={() => generate(true)} disabled={!config}>Nova versão</Button>
            <Button variant="secondary" size="sm" icon={<Save size={14} />} onClick={save} disabled={!config}>Salvar</Button>
            <Button size="sm" icon={<Download size={14} />} onClick={download} disabled={!config}>Baixar PDF</Button>
          </>
        }
      />

      <div className="grid xl:grid-cols-[360px_1fr] gap-5 items-start">
        <Card className="p-4 sm:p-5 xl:sticky xl:top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 grid place-items-center"><Wand2 size={16} /></div>
            <div>
              <div className="text-[0.8rem] font-bold">Configurar exercícios</div>
              <div className="text-[0.62rem] text-slate-400">Escolha o foco e o formato</div>
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
            <Field label="Habilidade BNCC" hint="opcional">
              <Select value={skillCode} onChange={(event) => setSkillCode(event.target.value)}>
                <option value="">Sem vínculo específico</option>
                {skills.map((skill) => <option key={skill.code} value={skill.code}>{skill.code} — {truncate(skill.description, 60)}</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Nº de questões">
                <Input type="number" min={1} max={30} value={count} onChange={(event) => setCount(Math.min(30, Math.max(1, Number(event.target.value))))} />
              </Field>
              <Field label="Dificuldade">
                <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
                  {Object.entries(DIFFICULTY_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </Field>
            </div>

            <div>
              <div className="field-label">Tipos de questão</div>
              <div className="space-y-1.5">
                {kinds.map((kind) => {
                  const active = selectedKinds.includes(kind.value)
                  return (
                    <button key={kind.value} type="button" onClick={() => toggleKind(kind.value)} className={`check-card w-full text-left ${active ? 'selected' : ''}`}>
                      <span className={`w-4 h-4 rounded border grid place-items-center shrink-0 mt-0.5 ${active ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white'}`}>
                        {active && <Check size={11} />}
                      </span>
                      <span>
                        <span className="block text-[0.72rem] font-bold text-slate-700">{kind.label}</span>
                        <span className="block text-[0.6rem] text-slate-400 mt-0.5">{kind.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              {[
                { label: 'Incluir gabarito e resolução', value: includeSolutions, set: setIncludeSolutions },
                { label: 'Questões contextualizadas', value: contextualized, set: setContextualized },
                { label: 'Apoio visual nas questões', value: includeImages, set: setIncludeImages },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="text-[0.7rem] font-semibold text-slate-600">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => item.set(!item.value)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${item.value ? 'bg-indigo-500' : 'bg-slate-300'}`}
                    aria-label={item.label}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${item.value ? 'translate-x-4' : ''}`} />
                  </button>
                </label>
              ))}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[0.7rem] font-semibold text-slate-600">Versões da atividade</span>
                <Select className="!w-20 !py-1 !text-[0.7rem]" value={variantsCount} onChange={(event) => setVariantsCount(Number(event.target.value))}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </Select>
              </div>
            </div>

            <Button className="w-full" size="lg" icon={<Sparkles size={15} />} onClick={() => generate(false)}>Gerar exercícios</Button>
            <div className="flex items-center justify-between text-[0.58rem] text-slate-400">
              <span>Questões com respostas verificáveis</span>
              <button onClick={() => generate(true)} className="font-bold text-indigo-500 hover:underline">Trocar números</button>
            </div>
          </div>
        </Card>

        <div className="min-w-0">
          {config && currentQuestions.length ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 no-print">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="green"><Check size={11} /> Gerado</Badge>
                  <span className="text-[0.66rem] text-slate-500">{currentQuestions.length} questões</span>
                  {variants.length > 1 && (
                    <div className="segmented !p-0.5 !bg-slate-100">
                      {variants.map((variant, index) => (
                        <button key={variant.label} onClick={() => setActiveVariant(index)} className={activeVariant === index ? 'active' : ''}>
                          Versão {variant.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant={showKey ? 'primary' : 'secondary'} size="sm" icon={showKey ? <EyeOff size={13} /> : <Eye size={13} />} onClick={() => setShowKey((value) => !value)}>
                    {showKey ? 'Ocultar gabarito' : 'Ver gabarito'}
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Printer size={13} />} onClick={() => window.print()}>Imprimir</Button>
                  <Button size="sm" icon={<Download size={13} />} onClick={download}>PDF</Button>
                </div>
              </div>

              <DocumentPaper title={title} subtitle={`${stageYearText(stage, year)} · ${topic.name} · versão ${variants[activeVariant]?.label}`}>
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-indigo-500">Lista de exercícios</div>
                      <h1 className="text-[1.15rem] font-bold leading-tight mt-1">{title}</h1>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge tone="blue">{YEAR_LABEL[year]}</Badge>
                        <Badge tone="violet">{topic.shortName}</Badge>
                        <Badge>Versão {variants[activeVariant]?.label}</Badge>
                        {skillCode && <Badge tone="green">{skillCode}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 rounded-lg border border-slate-100 bg-slate-50/40 p-3">
                    {[
                      ['Aluno(a)', ''],
                      ['Turma', ''],
                      ['Data', '____ / ____ / ______'],
                      ['Nota', '________'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[0.52rem] font-extrabold uppercase tracking-wide text-slate-400">{label}</div>
                        <div className="h-5 border-b border-slate-300 text-[0.68rem] text-slate-600 pt-0.5">{value}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[0.64rem] text-slate-500 mt-2.5">Instruções: leia com atenção, registre o raciocínio e confira suas respostas antes de entregar.</p>
                </div>

                <div>
                  {currentQuestions.map((question, index) => (
                    <QuestionPreview key={question.id} question={question} index={index} showAnswer={showKey && includeSolutions} includeVisual={includeImages} />
                  ))}
                </div>

                {showKey && includeSolutions && (
                  <div className="print-break mt-6 pt-4 border-t-2 border-dashed border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center"><ListChecks size={15} /></div>
                      <div>
                        <h2 className="text-[0.92rem] font-bold">Gabarito do professor</h2>
                        <p className="text-[0.58rem] text-slate-400">Resoluções passo a passo · {topic.name}</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-5">
                      {currentQuestions.map((question, index) => (
                        <div key={`${question.id}-key`} className="rounded-lg bg-slate-50 p-2.5 mb-2 print-avoid-break">
                          <div className="text-[0.64rem] font-extrabold text-indigo-700">{index + 1}. {question.answer}</div>
                          <p className="text-[0.59rem] text-slate-500 mt-1 leading-relaxed">{question.steps.join(' ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[0.55rem] text-slate-400">
                  <span>{school.name || 'Sua escola'} · Matemática</span>
                  <span>Página 1</span>
                </div>
              </DocumentPaper>

              <div className="mt-4 grid sm:grid-cols-3 gap-3 no-print">
                <Card soft className="p-3">
                  <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><ListChecks size={14} className="text-emerald-500" /> {count} questões geradas</div>
                  <p className="text-[0.6rem] text-slate-400 mt-1">Todas com resposta verificável.</p>
                </Card>
                <Card soft className="p-3">
                  <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><Layers3 size={14} className="text-violet-500" /> {variants.length} versão(ões)</div>
                  <p className="text-[0.6rem] text-slate-400 mt-1">Mesma habilidade, números diferentes.</p>
                </Card>
                <Card soft className="p-3">
                  <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><BookOpen size={14} className="text-sky-500" /> BNCC alinhada</div>
                  <p className="text-[0.6rem] text-slate-400 mt-1">{skillCode || 'Sem código específico'} · {topic.unit}</p>
                </Card>
              </div>
            </>
          ) : (
            <Card className="min-h-[560px] grid place-items-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white grid place-items-center mx-auto shadow-lg shadow-sky-100">
                  <Calculator size={27} />
                </div>
                <h2 className="text-lg font-bold mt-4">Sua lista começa aqui</h2>
                <p className="text-sm text-slate-500 leading-relaxed mt-2">
                  Escolha o ano, o conteúdo e os tipos de questão. O gerador cria enunciados, alternativas, gabarito e resolução passo a passo.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-5 text-left">
                  {[
                    'Múltipla escolha',
                    'Questões abertas',
                    'Complete lacunas',
                    'Verdadeiro ou falso',
                  ].map((label) => (
                    <div key={label} className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-2 text-[0.65rem] font-semibold text-slate-500">
                      <Check size={12} className="text-emerald-500" /> {label}
                    </div>
                  ))}
                </div>
                <Button className="mt-5" icon={<Sparkles size={15} />} onClick={() => generate(false)}>Gerar lista de exemplo</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
