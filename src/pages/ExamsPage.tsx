import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  LayoutTemplate,
  ListChecks,
  Printer,
  Save,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type { Difficulty, ExamContent, ExerciseConfig, Question, Stage } from '../lib/types'
import { DIFFICULTY_LABEL, YEAR_LABEL } from '../lib/types'
import { getSkill, skillsFor, suggestSkills } from '../data/bncc'
import { getTopic, topicsFor } from '../data/topics'
import { generateExamContent } from '../lib/materials'
import { exportExamPdf } from '../lib/pdf'
import { detectShapeFromText } from '../lib/generators'
import { stageYearText, todayLong, truncate } from '../lib/utils'
import { Badge, Button, Card, Field, Input, PageHeader, Select, Textarea } from '../components/ui'
import { DocumentPaper } from '../components/Document'
import { QuestionGeometryVisual } from '../components/GeometryFigure'

const stageYears: Record<Stage, number[]> = { EF1: [1, 2, 3, 4, 5], EF2: [6, 7, 8, 9], EM: [0] }

function ExamQuestion({
  question,
  index,
  showAnswer,
}: {
  question: Question
  index: number
  showAnswer: boolean
}) {
  const figure = question.figure || detectShapeFromText(question.prompt, question.topic)

  return (
    <div className="py-3.5 border-b border-slate-100 last:border-0 print-avoid-break">
      <div className="flex gap-2.5">
        <div className="shrink-0 text-right w-9">
          <span className="inline-grid place-items-center w-6 h-6 rounded-full bg-rose-50 text-rose-600 text-[0.62rem] font-extrabold">{index + 1}</span>
          <div className="text-[0.5rem] text-slate-400 mt-0.5">{question.points.toFixed(1)} pt</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.8rem] text-slate-700 leading-relaxed whitespace-pre-line">{question.prompt}</p>

          {figure && (
            <div className="mt-2.5 mb-2">
              <QuestionGeometryVisual figure={figure} />
            </div>
          )}
          {question.options?.length ? (
            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-1.5 mt-2.5">
              {question.options.map((option, optionIndex) => (
                <div key={`${option}-${optionIndex}`} className="flex items-start gap-1.5 text-[0.74rem] text-slate-600">
                  <span className="w-4 h-4 rounded border border-slate-300 shrink-0 mt-0.5 grid place-items-center text-[0.54rem] font-bold text-slate-400">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="answer-line" />
              <div className="answer-line" />
              <div className="answer-line" />
            </div>
          )}
          {showAnswer && (
            <div className="mt-2 rounded-lg bg-emerald-50/70 border border-emerald-100 px-2.5 py-2">
              <span className="text-[0.65rem] font-extrabold text-emerald-700">Resposta: {question.answer}</span>
              {question.steps.length > 0 && (
                <ol className="mt-1 space-y-0.5">
                  {question.steps.map((step, stepIndex) => (
                    <li key={`${step}-${stepIndex}`} className="text-[0.63rem] text-slate-600">{stepIndex + 1}. {step}</li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ExamsPage() {
  const { school, addMaterial, updateMaterial, materials, toast, settings } = useApp()
  const [searchParams] = useSearchParams()

  const [stage, setStage] = useState<Stage>(settings.defaultStage)
  const [year, setYear] = useState(settings.defaultYear)
  const [topicId, setTopicId] = useState('fracoes')
  const [difficulty, setDifficulty] = useState<Difficulty>('medio')
  const [count, setCount] = useState(10)
  const [skillCode, setSkillCode] = useState('')
  const [skillSearch, setSkillSearch] = useState('')
  const [skillTouched, setSkillTouched] = useState(false)

  const [title, setTitle] = useState('Avaliação de Matemática')
  const [value, setValue] = useState('10,0')
  const [layout, setLayout] = useState<'retrato' | 'paisagem'>('retrato')
  const [showHeader, setShowHeader] = useState(true)
  const [includeAnswers, setIncludeAnswers] = useState(settings.includeAnswers)
  const [header, setHeader] = useState<ExamContent['header']>(() => ({
    school: school.name,
    teacher: school.teacher,
    student: '',
    className: '',
    date: todayLong(),
    subject: 'Matemática',
    value: '10,0',
  }))

  const [exam, setExam] = useState<ExamContent | null>(null)
  const [config, setConfig] = useState<ExerciseConfig | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)

  const topicOptions = useMemo(() => topicsFor(stage, year), [stage, year])
  const topic = getTopic(topicId)
  const skills = useMemo(() => {
    const query = skillSearch.trim().toLowerCase()
    const base = query
      ? skillsFor(stage, year).filter((skill) => skill.code.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query))
      : suggestSkills(stage, year, topicId, 10)
    return base.slice(0, 24)
  }, [stage, year, topicId, skillSearch])

  useEffect(() => {
    if (!topicOptions.some((item) => item.id === topicId)) {
      setTopicId(topicOptions[0]?.id ?? 'fracoes')
    }
  }, [topicOptions, topicId])

  useEffect(() => {
    if (skillTouched) return
    const suggested = suggestSkills(stage, year, topicId, 1)[0]
    setSkillCode(suggested?.code ?? '')
  }, [stage, year, topicId, skillTouched])

  useEffect(() => {
    const id = searchParams.get('material')
    if (!id) return
    const material = materials.find((item) => item.id === id && item.type === 'prova')
    if (!material) return
    const content = material.content as ExamContent
    if (!content?.questions) return
    setExam(content)
    setTitle(material.title)
    setStage(material.stage)
    setYear(material.year)
    setTopicId(material.topic)
    setSkillCode(material.skillCodes[0] ?? '')
    setSkillTouched(true)
    setLayout(content.layout)
    setShowHeader(content.showHeader)
    setIncludeAnswers(content.showAnswers)
    setShowKey(content.showAnswers)
    setHeader(content.header)
    setValue(content.header.value)
    const nextConfig: ExerciseConfig = {
      stage: material.stage,
      year: material.year,
      topic: material.topic,
      skillCode: material.skillCodes[0] ?? '',
      count: content.questions.length,
      difficulty: 'medio',
      kinds: ['multipla', 'aberta'],
      includeSolutions: content.showAnswers,
      includeImages: false,
      contextualized: true,
      variants: 1,
      seed: 1,
    }
    setConfig(nextConfig)
    setSavedId(material.id)
  }, [searchParams, materials])

  const selectStage = (next: Stage) => {
    setStage(next)
    setYear(next === 'EM' ? 0 : next === 'EF1' ? 1 : 6)
    setSkillTouched(false)
  }

  const selectTopic = (next: string) => {
    setTopicId(next)
    setSkillTouched(false)
  }

  const buildHeader = (): ExamContent['header'] => ({
    ...header,
    school: header.school || school.name,
    teacher: header.teacher || school.teacher,
    subject: 'Matemática',
    date: header.date || todayLong(),
    value,
  })

  const generate = () => {
    if (!topicOptions.length) return
    const next = generateExamContent({
      stage,
      year,
      topic: topicId,
      skillCode,
      count,
      difficulty,
      title,
      value,
      header: buildHeader(),
      showHeader,
      layout,
      includeAnswers,
    })
    setExam(next.exam)
    setConfig(next.config)
    setSavedId(null)
    setShowKey(includeAnswers)
    toast({ title: 'Prova gerada', description: `${next.exam.questions.length} questões · ${value} pontos · ${layout === 'retrato' ? 'retrato' : 'paisagem'}.`, tone: 'success' })
  }

  const save = () => {
    if (!exam) return
    const payload = {
      type: 'prova' as const,
      title,
      description: `${stageYearText(stage, year)} · ${topic.name} · ${exam.questions.length} questões · ${value} pontos`,
      stage,
      year,
      topic: topicId,
      skillCodes: skillCode ? [skillCode] : [],
      content: { ...exam, title, header: buildHeader() },
      meta: { questions: exam.questions.length, points: value },
    }
    if (savedId) {
      updateMaterial(savedId, payload)
      toast({ title: 'Prova atualizada', tone: 'success' })
    } else {
      const material = addMaterial(payload)
      setSavedId(material.id)
      toast({ title: 'Prova salva na biblioteca', description: 'O gabarito e o cabeçalho ficaram registrados.', tone: 'success' })
    }
  }

  const download = () => {
    if (!exam || !config) return
    exportExamPdf({ ...exam, title, header: buildHeader(), showAnswers: showKey }, config, school)
    toast({ title: 'PDF da prova gerado', description: showKey ? 'A prova e o gabarito foram exportados.' : 'A prova foi exportada sem o gabarito.', tone: 'success' })
  }

  const skill = skillCode ? getSkill(skillCode) : undefined
  const totalPoints = exam?.questions.reduce((sum, question) => sum + question.points, 0) ?? 0

  return (
    <div>
      <PageHeader
        eyebrow="Avaliar para ensinar melhor"
        title="Provas e avaliações"
        description="Monte avaliações completas com cabeçalho institucional, pontuação distribuída, instruções e gabarito comentado."
        icon={<FileCheck2 size={21} />}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Save size={14} />} onClick={save} disabled={!exam}>Salvar</Button>
            <Button size="sm" icon={<Download size={14} />} onClick={download} disabled={!exam}>Baixar PDF</Button>
          </>
        }
      />

      <div className="grid xl:grid-cols-[370px_1fr] gap-5 items-start">
        <Card className="p-4 sm:p-5 xl:sticky xl:top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 grid place-items-center"><Wand2 size={16} /></div>
            <div>
              <div className="text-[0.8rem] font-bold">Configurar avaliação</div>
              <div className="text-[0.62rem] text-slate-400">Conteúdo, formato e cabeçalho</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Etapa">
                <Select value={stage} onChange={(event) => selectStage(event.target.value as Stage)}>
                  <option value="EF1">Fundamental I</option>
                  <option value="EF2">Fundamental II</option>
                  <option value="EM">Ensino Médio</option>
                </Select>
              </Field>
              <Field label="Ano">
                <Select value={year} onChange={(event) => { setYear(Number(event.target.value)); setSkillTouched(false) }}>
                  {stageYears[stage].map((item) => <option key={item} value={item}>{YEAR_LABEL[item]}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Conteúdo" hint={topic.unit}>
              <Select value={topicId} onChange={(event) => selectTopic(event.target.value)}>
                {topicOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>

            <Field label="Título da prova">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Avaliação bimestral de Matemática" />
            </Field>

            <div className="grid grid-cols-3 gap-2.5">
              <Field label="Questões">
                <Input type="number" min={1} max={30} value={count} onChange={(event) => setCount(Math.min(30, Math.max(1, Number(event.target.value))))} />
              </Field>
              <Field label="Valor">
                <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="10,0" />
              </Field>
              <Field label="Nível">
                <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
                  {Object.entries(DIFFICULTY_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Habilidade BNCC" hint="opcional">
              <Select value={skillCode} onChange={(event) => { setSkillCode(event.target.value); setSkillTouched(true) }}>
                <option value="">Sem vínculo específico</option>
                {skills.map((item) => <option key={item.code} value={item.code}>{item.code} — {truncate(item.description, 64)}</option>)}
              </Select>
            </Field>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="!pl-9" value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} placeholder="Buscar habilidade por código ou texto…" />
            </div>
            {skill && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-2.5">
                <div className="text-[0.62rem] font-extrabold text-emerald-700">{skill.code}</div>
                <p className="text-[0.61rem] text-emerald-800/80 mt-0.5 leading-relaxed">{skill.description}</p>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2.5">
              <div className="text-[0.62rem] font-extrabold uppercase tracking-wide text-slate-400">Cabeçalho do aluno</div>
              <Input value={header.school} onChange={(event) => setHeader({ ...header, school: event.target.value })} placeholder="Escola" aria-label="Escola no cabeçalho" />
              <Input value={header.teacher} onChange={(event) => setHeader({ ...header, teacher: event.target.value })} placeholder="Professor(a)" aria-label="Professor no cabeçalho" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={header.className} onChange={(event) => setHeader({ ...header, className: event.target.value })} placeholder="Turma" aria-label="Turma" />
                <Input value={header.date} onChange={(event) => setHeader({ ...header, date: event.target.value })} placeholder="Data" aria-label="Data" />
              </div>
              <button
                type="button"
                onClick={() => setHeader({ ...header, school: school.name, teacher: school.teacher })}
                className="text-[0.6rem] font-bold text-indigo-600 hover:underline"
              >
                Usar identidade da escola
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              {[
                { label: 'Exibir cabeçalho institucional', value: showHeader, set: setShowHeader },
                { label: 'Incluir gabarito comentado', value: includeAnswers, set: setIncludeAnswers },
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
              <div className="pt-1">
                <div className="text-[0.62rem] font-extrabold uppercase tracking-wide text-slate-400 mb-1.5">Orientação do PDF</div>
                <div className="segmented">
                  <button type="button" className={layout === 'retrato' ? 'active' : ''} onClick={() => setLayout('retrato')}>Retrato</button>
                  <button type="button" className={layout === 'paisagem' ? 'active' : ''} onClick={() => setLayout('paisagem')}>Paisagem</button>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" icon={<Sparkles size={15} />} onClick={generate}>Gerar prova</Button>
            <p className="text-[0.57rem] text-slate-400 text-center">Questões objetivas e abertas com pontuação calculada automaticamente.</p>
          </div>
        </Card>

        <div className="min-w-0">
          {exam && config ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 no-print">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="green"><Check size={11} /> Prova pronta</Badge>
                  <span className="text-[0.66rem] text-slate-500">{exam.questions.length} questões · {totalPoints.toFixed(1)} pts</span>
                  <Badge tone="rose"><LayoutTemplate size={10} /> {layout === 'retrato' ? 'Retrato' : 'Paisagem'}</Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant={showKey ? 'primary' : 'secondary'} size="sm" icon={showKey ? <EyeOff size={13} /> : <Eye size={13} />} onClick={() => setShowKey((current) => !current)}>
                    {showKey ? 'Ocultar gabarito' : 'Ver gabarito'}
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Printer size={13} />} onClick={() => window.print()}>Imprimir</Button>
                  <Button size="sm" icon={<Download size={13} />} onClick={download}>PDF</Button>
                </div>
              </div>

              <DocumentPaper title={exam.title} subtitle={`${topic.shortName} · ${YEAR_LABEL[year]} · ${value} pontos`}>
                <div className="mb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-rose-500">Avaliação de Matemática</div>
                      <h1 className="text-[1.2rem] font-bold leading-tight mt-1">{title}</h1>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge tone="blue">{YEAR_LABEL[year]}</Badge>
                        <Badge tone="violet">{topic.shortName}</Badge>
                        <Badge tone="orange">{value} pontos</Badge>
                        {skillCode && <Badge tone="green">{skillCode}</Badge>}
                      </div>
                    </div>
                    <div className="text-right text-[0.6rem] text-slate-400 shrink-0">
                      <div className="font-bold text-slate-500">Nota</div>
                      <div className="mt-1 w-16 h-9 rounded border border-slate-300 grid place-items-center text-slate-300 text-lg">—</div>
                    </div>
                  </div>

                  {showHeader && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 rounded-lg border border-slate-100 bg-slate-50/40 p-3.5">
                      {[
                        ['Escola', header.school],
                        ['Professor(a)', header.teacher],
                        ['Turma', header.className || '________________'],
                        ['Aluno(a)', header.student || '________________________________'],
                        ['Data', header.date],
                        ['Valor', `${value} pontos`],
                      ].map(([label, itemValue]) => (
                        <div key={label} className={label === 'Aluno(a)' ? 'col-span-2 sm:col-span-1' : ''}>
                          <div className="text-[0.52rem] font-extrabold uppercase tracking-wide text-slate-400">{label}</div>
                          <div className="min-h-6 border-b border-slate-300 text-[0.67rem] text-slate-700 pt-1 truncate">{itemValue}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 rounded-lg bg-rose-50/50 border border-rose-100 px-3 py-2.5">
                    <div className="text-[0.58rem] font-extrabold uppercase tracking-wide text-rose-500 mb-1">Instruções</div>
                    <ul className="space-y-0.5">
                      {exam.instructions.map((instruction, index) => (
                        <li key={instruction} className="text-[0.64rem] text-slate-600 leading-relaxed">{index + 1}. {instruction}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  {exam.questions.map((question, index) => (
                    <ExamQuestion key={question.id} question={question} index={index} showAnswer={showKey} />
                  ))}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[0.55rem] text-slate-400">
                  <span>{school.name || 'Sua escola'} · Matemática · {todayLong()}</span>
                  <span>Boa prova!</span>
                </div>

                {showKey && (
                  <div className="print-break mt-6 pt-5 border-t-2 border-dashed border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center"><ListChecks size={16} /></div>
                      <div>
                        <h2 className="text-[0.95rem] font-bold">Gabarito e critérios de correção</h2>
                        <p className="text-[0.58rem] text-slate-400">{title} · {exam.questions.length} questões · {totalPoints.toFixed(1)} pontos</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-5">
                      {exam.questions.map((question, index) => (
                        <div key={`${question.id}-key`} className="rounded-lg bg-slate-50 p-2.5 mb-2 print-avoid-break">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[0.65rem] font-extrabold text-indigo-700">{index + 1}. {question.answer}</div>
                            <span className="text-[0.52rem] text-slate-400 shrink-0">{question.points.toFixed(1)} pt</span>
                          </div>
                          {question.steps.length > 0 && (
                            <p className="text-[0.59rem] text-slate-500 mt-1 leading-relaxed">{question.steps.join(' ')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </DocumentPaper>

              <div className="mt-4 grid sm:grid-cols-3 gap-3 no-print">
                <Card soft className="p-3">
                  <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><FileText size={14} className="text-rose-500" /> Cabeçalho completo</div>
                  <p className="text-[0.6rem] text-slate-400 mt-1">Escola, professor, turma, aluno, data e nota.</p>
                </Card>
                <Card soft className="p-3">
                  <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><ListChecks size={14} className="text-emerald-500" /> Gabarito comentado</div>
                  <p className="text-[0.6rem] text-slate-400 mt-1">Resoluções passo a passo para corrigir com clareza.</p>
                </Card>
                <Card soft className="p-3">
                  <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><LayoutTemplate size={14} className="text-violet-500" /> {layout === 'retrato' ? 'A4 retrato' : 'A4 paisagem'}</div>
                  <p className="text-[0.6rem] text-slate-400 mt-1">Pronto para imprimir ou exportar em PDF.</p>
                </Card>
              </div>
            </>
          ) : (
            <Card className="min-h-[560px] grid place-items-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white grid place-items-center mx-auto shadow-lg shadow-rose-100">
                  <FileCheck2 size={27} />
                </div>
                <h2 className="text-lg font-bold mt-4">Sua avaliação começa aqui</h2>
                <p className="text-sm text-slate-500 leading-relaxed mt-2">
                  Escolha ano, conteúdo e quantidade de questões. A prova já sai com cabeçalho, instruções, pontuação e gabarito.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-5 text-left">
                  {[
                    'Cabeçalho do aluno',
                    'Pontuação automática',
                    'Questões abertas',
                    'Gabarito comentado',
                  ].map((label) => (
                    <div key={label} className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-2 text-[0.65rem] font-semibold text-slate-500">
                      <Check size={12} className="text-emerald-500" /> {label}
                    </div>
                  ))}
                </div>
                <Button className="mt-5" icon={<Sparkles size={15} />} onClick={generate}>Gerar prova de exemplo</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
