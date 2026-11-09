import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Check,
  Download,
  Eye,
  EyeOff,
  FileText,
  Layers3,
  ListChecks,
  NotebookTabs,
  Printer,
  Save,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type { Difficulty, Question, Stage, WorkbookContent } from '../lib/types'
import { DIFFICULTY_LABEL, YEAR_LABEL } from '../lib/types'
import { getTopic, topicsFor } from '../data/topics'
import { generateWorkbookContent } from '../lib/materials'
import { exportWorkbookPdf } from '../lib/pdf'
import { detectShapeFromText } from '../lib/generators'
import { cn, formatDate, stageYearText } from '../lib/utils'
import { Badge, Button, Card, Field, Input, PageHeader, Select, Textarea } from '../components/ui'
import { DocumentPaper } from '../components/Document'
import { TopicIcon } from '../components/TopicIcon'
import { QuestionGeometryVisual } from '../components/GeometryFigure'

const stageYears: Record<Stage, number[]> = { EF1: [1, 2, 3, 4, 5], EF2: [6, 7, 8, 9], EM: [0] }

function WorkbookQuestion({ question, index, showAnswer }: { question: Question; index: number; showAnswer: boolean }) {
  const figure = question.figure || detectShapeFromText(question.prompt, question.topic)

  return (
    <div className="py-3 border-b border-slate-100 last:border-0 print-avoid-break">
      <div className="flex gap-2.5">
        <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center text-[0.62rem] font-extrabold">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.52rem] font-extrabold uppercase tracking-wide text-slate-400">{getTopic(question.topic).shortName}</span>
          </div>
          <p className="text-[0.79rem] text-slate-700 leading-relaxed whitespace-pre-line">{question.prompt}</p>

          {figure && (
            <div className="mt-2.5 mb-2">
              <QuestionGeometryVisual figure={figure} />
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
            <div className="mt-2 rounded-lg bg-emerald-50/70 border border-emerald-100 px-2.5 py-1.5">
              <span className="text-[0.63rem] font-extrabold text-emerald-700">Resposta: {question.answer}</span>
              {question.steps.length > 0 && <p className="text-[0.6rem] text-slate-600 mt-0.5">{question.steps.join(' ')}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function WorkbookPage() {
  const { school, addMaterial, updateMaterial, materials, toast, settings } = useApp()
  const [searchParams] = useSearchParams()

  const [stage, setStage] = useState<Stage>(settings.defaultStage)
  const [year, setYear] = useState(settings.defaultYear)
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['fracoes'])
  const [difficulty, setDifficulty] = useState<Difficulty>('medio')
  const [count, setCount] = useState(20)
  const [title, setTitle] = useState('Apostila de Matemática')
  const [subtitle, setSubtitle] = useState('')
  const [presentation, setPresentation] = useState(
    'Esta apostila reúne explicações curtas, exemplos e exercícios para apoiar o estudo da Matemática ao longo do período. Resolva cada questão com atenção, registre o raciocínio e confira o gabarito ao final.',
  )
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeAnswers, setIncludeAnswers] = useState(settings.includeAnswers)

  const [workbook, setWorkbook] = useState<WorkbookContent | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)

  const topicOptions = useMemo(() => topicsFor(stage, year), [stage, year])
  const selected = useMemo(() => selectedTopics.map((id) => getTopic(id)).filter(Boolean), [selectedTopics])

  useEffect(() => {
    setSelectedTopics((current) => {
      const valid = current.filter((id) => topicOptions.some((topic) => topic.id === id))
      return valid.length ? valid : topicOptions.slice(0, 1).map((topic) => topic.id)
    })
  }, [topicOptions])

  useEffect(() => {
    const id = searchParams.get('material')
    if (!id) return
    const material = materials.find((item) => item.id === id && item.type === 'apostila')
    if (!material) return
    const content = material.content as WorkbookContent
    if (!content?.questions) return
    setWorkbook(content)
    setTitle(material.title)
    setSubtitle(content.subtitle)
    setPresentation(content.presentation)
    setSelectedTopics(content.topics)
    setIncludeSummary(content.includeSummary)
    setIncludeAnswers(content.includeAnswers)
    setShowKey(content.includeAnswers)
    setStage(material.stage)
    setYear(material.year)
    setSavedId(material.id)
  }, [searchParams, materials])

  const toggleTopic = (id: string) => {
    setSelectedTopics((current) => {
      if (current.includes(id)) {
        return current.length > 1 ? current.filter((item) => item !== id) : current
      }
      return [...current, id]
    })
  }

  const generate = () => {
    if (!selectedTopics.length) {
      toast({ title: 'Selecione ao menos um conteúdo', tone: 'error' })
      return
    }
    const finalSubtitle = subtitle.trim() || `${stageYearText(stage, year)} · ${selected.length} conteúdo(s) · ${count} exercícios`
    const content = generateWorkbookContent({
      title,
      subtitle: finalSubtitle,
      presentation,
      topics: selectedTopics,
      stage,
      year,
      difficulty,
      count,
      includeSummary,
      includeAnswers,
      seed: Date.now(),
    })
    setWorkbook(content)
    setTitle(content.title)
    setSubtitle(content.subtitle)
    setSavedId(null)
    setShowKey(includeAnswers)
    toast({ title: 'Apostila montada', description: `${content.questions.length} exercícios e ${selectedTopics.length} conteúdo(s).`, tone: 'success' })
  }

  const save = () => {
    if (!workbook) return
    const payload = {
      type: 'apostila' as const,
      title,
      description: `${stageYearText(stage, year)} · ${selected.length} conteúdo(s) · ${workbook.questions.length} exercícios`,
      stage,
      year,
      topic: selectedTopics[0] ?? 'fracoes',
      skillCodes: [],
      content: { ...workbook, title, subtitle, includeAnswers },
      meta: { questions: workbook.questions.length, topics: selectedTopics.length },
    }
    if (savedId) {
      updateMaterial(savedId, payload)
      toast({ title: 'Apostila atualizada', tone: 'success' })
    } else {
      const material = addMaterial(payload)
      setSavedId(material.id)
      toast({ title: 'Apostila salva na biblioteca', tone: 'success' })
    }
  }

  const download = () => {
    if (!workbook) return
    exportWorkbookPdf({ ...workbook, title, subtitle, includeAnswers: showKey }, school)
    toast({ title: 'PDF da apostila gerado', description: showKey ? 'Apostila e gabarito exportados.' : 'Apostila exportada sem gabarito.', tone: 'success' })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Material completo para o aluno"
        title="Apostilas"
        description="Reúna conteúdos, resumos teóricos e exercícios em uma apostila organizada, com capa institucional e gabarito opcional."
        icon={<NotebookTabs size={21} />}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Save size={14} />} onClick={save} disabled={!workbook}>Salvar</Button>
            <Button size="sm" icon={<Download size={14} />} onClick={download} disabled={!workbook}>Baixar PDF</Button>
          </>
        }
      />

      <div className="grid xl:grid-cols-[370px_1fr] gap-5 items-start">
        <Card className="p-4 sm:p-5 xl:sticky xl:top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center"><Wand2 size={16} /></div>
            <div>
              <div className="text-[0.8rem] font-bold">Montar apostila</div>
              <div className="text-[0.62rem] text-slate-400">Selecione os conteúdos e a quantidade</div>
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
                  {stageYears[stage].map((item) => <option key={item} value={item}>{YEAR_LABEL[item]}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Título da apostila">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </Field>
            <Field label="Subtítulo" hint="opcional">
              <Input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="Gerado automaticamente se vazio" />
            </Field>
            <Field label="Apresentação" hint="texto de abertura">
              <Textarea className="!min-h-[5.2rem] !text-[0.78rem]" value={presentation} onChange={(event) => setPresentation(event.target.value)} />
            </Field>

            <div>
              <div className="field-label">
                <span>Conteúdos</span>
                <span className="normal-case tracking-normal font-medium text-[0.65rem] text-slate-400">{selectedTopics.length} selecionado(s)</span>
              </div>
              <div className="space-y-1.5 max-h-[15rem] overflow-y-auto pr-1">
                {topicOptions.map((topic) => {
                  const active = selectedTopics.includes(topic.id)
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className={cn('check-card w-full text-left', active && 'selected')}
                    >
                      <span
                        className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
                        style={{ background: topic.soft, color: topic.color }}
                      >
                        <TopicIcon name={topic.icon} size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.71rem] font-bold text-slate-700">{topic.name}</span>
                        <span className="block text-[0.59rem] text-slate-400 mt-0.5 truncate">{topic.unit}</span>
                      </span>
                      <span className={cn('w-4 h-4 rounded border grid place-items-center shrink-0 mt-1', active ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white')}>
                        {active && <Check size={11} />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Exercícios">
                <Input type="number" min={4} max={60} value={count} onChange={(event) => setCount(Math.min(60, Math.max(4, Number(event.target.value))))} />
              </Field>
              <Field label="Nível">
                <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
                  {Object.entries(DIFFICULTY_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </Select>
              </Field>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              {[
                { label: 'Incluir resumo dos conteúdos', value: includeSummary, set: setIncludeSummary },
                { label: 'Incluir gabarito ao final', value: includeAnswers, set: setIncludeAnswers },
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
            </div>

            <Button className="w-full" size="lg" icon={<Sparkles size={15} />} onClick={generate}>Montar apostila</Button>
            <p className="text-[0.57rem] text-slate-400 text-center">Os exercícios alternam entre os conteúdos selecionados.</p>
          </div>
        </Card>

        <div className="min-w-0">
          {workbook ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 no-print">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="green"><Check size={11} /> Apostila pronta</Badge>
                  <span className="text-[0.66rem] text-slate-500">{workbook.questions.length} exercícios · {selectedTopics.length} conteúdos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant={showKey ? 'primary' : 'secondary'} size="sm" icon={showKey ? <EyeOff size={13} /> : <Eye size={13} />} onClick={() => setShowKey((current) => !current)}>
                    {showKey ? 'Ocultar gabarito' : 'Ver gabarito'}
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Printer size={13} />} onClick={() => window.print()}>Imprimir</Button>
                  <Button size="sm" icon={<Download size={13} />} onClick={download}>PDF</Button>
                </div>
              </div>

              <DocumentPaper title={title} subtitle={subtitle || `${stageYearText(stage, year)} · ${workbook.questions.length} exercícios`}>
                <div className="mb-5">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#101b3f] text-white grid place-items-center shrink-0">
                        <BookOpen size={19} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-indigo-500">Apostila de Matemática</div>
                        <h1 className="text-[1.25rem] font-bold leading-tight mt-0.5">{title}</h1>
                        <p className="text-[0.68rem] text-slate-500 mt-1">{subtitle || `${stageYearText(stage, year)} · ${workbook.questions.length} exercícios`}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Badge tone="blue">{YEAR_LABEL[year]}</Badge>
                          <Badge tone="violet">{selectedTopics.length} conteúdos</Badge>
                          <Badge tone="orange">{workbook.questions.length} exercícios</Badge>
                          <Badge>{formatDate(new Date())}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-slate-400 mb-1.5">Apresentação</div>
                    <p className="text-[0.74rem] text-slate-600 leading-relaxed">{workbook.presentation}</p>
                  </div>

                  {includeSummary && (
                    <div className="mt-4">
                      <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-slate-400 mb-2">Resumo dos conteúdos</div>
                      <div className="space-y-2">
                        {selected.map((topic) => (
                          <div key={topic.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 print-avoid-break">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md grid place-items-center" style={{ background: topic.soft, color: topic.color }}>
                                <TopicIcon name={topic.icon} size={13} />
                              </span>
                              <div className="text-[0.72rem] font-bold text-slate-700">{topic.name}</div>
                            </div>
                            <p className="text-[0.63rem] text-slate-500 mt-1 leading-relaxed">{topic.summary}</p>
                            {topic.formulas.length > 0 && (
                              <div className="grid sm:grid-cols-2 gap-1 mt-1.5">
                                {topic.formulas.map((formula) => (
                                  <div key={formula.label} className="rounded bg-white border border-slate-100 px-2 py-1 text-[0.6rem] text-slate-600">
                                    <span className="font-bold text-slate-500">{formula.label}:</span> {formula.value}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center"><FileText size={14} /></div>
                    <h2 className="text-[0.9rem] font-bold">Exercícios</h2>
                  </div>
                  {workbook.questions.map((question, index) => (
                    <WorkbookQuestion key={question.id} question={question} index={index} showAnswer={showKey} />
                  ))}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[0.55rem] text-slate-400">
                  <span>{school.name || 'Sua escola'} · Matemática · {stageYearText(stage, year)}</span>
                  <span>Bons estudos!</span>
                </div>

                {showKey && (
                  <div className="print-break mt-6 pt-5 border-t-2 border-dashed border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center"><ListChecks size={16} /></div>
                      <div>
                        <h2 className="text-[0.95rem] font-bold">Gabarito da apostila</h2>
                        <p className="text-[0.58rem] text-slate-400">{workbook.questions.length} exercícios · confira o raciocínio antes da resposta</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-5">
                      {workbook.questions.map((question, index) => (
                        <div key={`${question.id}-key`} className="rounded-lg bg-slate-50 p-2.5 mb-2 print-avoid-break">
                          <div className="text-[0.64rem] font-extrabold text-indigo-700">{index + 1}. {question.answer}</div>
                          {question.steps.length > 0 && <p className="text-[0.59rem] text-slate-500 mt-1 leading-relaxed">{question.steps.join(' ')}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </DocumentPaper>

              <div className="mt-4 grid sm:grid-cols-3 gap-3 no-print">
                <Card soft className="p-3">
                  <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><Layers3 size={14} className="text-indigo-500" /> {selectedTopics.length} conteúdos integrados</div>
                  <p className="text-[0.6rem] text-slate-400 mt-1">Resumos e fórmulas essenciais de cada tema.</p>
                </Card>
                <Card soft className="p-3">
                  <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><FileText size={14} className="text-sky-500" /> {workbook.questions.length} exercícios</div>
                  <p className="text-[0.6rem] text-slate-400 mt-1">Questões objetivas e abertas com resolução.</p>
                </Card>
                <Card soft className="p-3">
                  <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><BookOpen size={14} className="text-emerald-500" /> Formato apostila</div>
                  <p className="text-[0.6rem] text-slate-400 mt-1">Capa, apresentação, conteúdo e gabarito.</p>
                </Card>
              </div>
            </>
          ) : (
            <Card className="min-h-[560px] grid place-items-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center mx-auto shadow-lg shadow-indigo-100">
                  <NotebookTabs size={27} />
                </div>
                <h2 className="text-lg font-bold mt-4">Monte uma apostila completa</h2>
                <p className="text-sm text-slate-500 leading-relaxed mt-2">
                  Selecione um ou mais conteúdos, defina a quantidade de exercícios e receba um material com capa, resumo, questões e gabarito.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-5 text-left">
                  {['Resumo com fórmulas', 'Exercícios variados', 'Capa institucional', 'Gabarito opcional'].map((label) => (
                    <div key={label} className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-2 text-[0.65rem] font-semibold text-slate-500">
                      <Check size={12} className="text-emerald-500" /> {label}
                    </div>
                  ))}
                </div>
                <Button className="mt-5" icon={<Sparkles size={15} />} onClick={generate}>Montar apostila de exemplo</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
