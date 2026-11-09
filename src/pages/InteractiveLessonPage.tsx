import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  Expand,
  Eye,
  EyeOff,
  Lightbulb,
  Maximize2,
  Minimize2,
  MousePointer2,
  Presentation,
  Save,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type { Difficulty, LessonContent, LessonSlide, Question, Stage } from '../lib/types'
import { YEAR_LABEL } from '../lib/types'
import { skillsFor, suggestSkills, getSkill } from '../data/bncc'
import { topicsFor, getTopic } from '../data/topics'
import { generateLesson } from '../lib/plans'
import { exportLessonPdf } from '../lib/pdf'
import { cn, stageYearText, truncate } from '../lib/utils'
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Select } from '../components/ui'
import { SchoolHeader } from '../components/Document'
import { useNavigate } from 'react-router-dom'

const stageYears: Record<Stage, number[]> = { EF1: [1, 2, 3, 4, 5], EF2: [6, 7, 8, 9], EM: [0] }

function InteractiveQuestion({ question, compact = false }: { question: Question; compact?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  const choose = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    setRevealed(true)
  }

  const correctIndex = question.correctIndex ?? 0
  const isCorrect = selected === correctIndex

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-4', compact && 'p-3')}>
      <p className="text-[0.83rem] font-semibold text-slate-700 leading-relaxed whitespace-pre-line">{question.prompt}</p>
      {question.options?.length ? (
        <div className={cn('grid gap-2 mt-3', compact ? 'sm:grid-cols-1' : 'sm:grid-cols-2')}>
          {question.options.map((option, index) => {
            const chosen = selected === index
            const correct = revealed && index === correctIndex
            const wrong = chosen && selected !== correctIndex
            return (
              <button
                key={`${option}-${index}`}
                onClick={() => choose(index)}
                disabled={selected !== null}
                className={cn(
                  'text-left rounded-lg border px-3 py-2.5 text-[0.76rem] font-semibold transition-all flex items-start gap-2',
                  correct && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                  wrong && 'border-rose-300 bg-rose-50 text-rose-800',
                  !revealed && 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40',
                  revealed && !correct && !wrong && 'border-slate-200 bg-slate-50 text-slate-400',
                )}
              >
                <span className={cn(
                  'w-5 h-5 rounded-md grid place-items-center text-[0.6rem] font-extrabold shrink-0 mt-0.5',
                  correct ? 'bg-emerald-500 text-white' : wrong ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500',
                )}>
                  {correct ? <CheckCircle2 size={12} /> : wrong ? <XCircle size={12} /> : String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <button
          onClick={() => { setRevealed(true); setShowSteps(true) }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-[0.72rem] font-bold text-indigo-700 hover:bg-indigo-100"
        >
          <Eye size={13} /> Mostrar resposta
        </button>
      )}
      {revealed && (
        <div className={cn('mt-3 rounded-lg p-3', isCorrect || question.options?.length === undefined ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100')}>
          <div className={cn('text-[0.7rem] font-extrabold flex items-center gap-1.5', isCorrect || question.options?.length === undefined ? 'text-emerald-700' : 'text-amber-700')}>
            {isCorrect || question.options?.length === undefined ? <CheckCircle2 size={14} /> : <CircleHelp size={14} />}
            {question.options?.length === undefined ? 'Resposta' : isCorrect ? 'Muito bem!' : 'Quase! Veja a resolução.'} Resposta: {question.answer}
          </div>
          {showSteps ? (
            <ol className="mt-2 space-y-1">
              {question.steps.map((step, index) => (
                <li key={`${step}-${index}`} className="text-[0.72rem] text-slate-600 flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-white/80 grid place-items-center text-[0.55rem] font-bold shrink-0">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <button onClick={() => setShowSteps(true)} className="text-[0.66rem] font-bold text-slate-500 underline mt-1">
              Ver resolução passo a passo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SlideView({ slide, index, total, professorMode, onNext, onPrev, onExit, fullscreen }: {
  slide: LessonSlide
  index: number
  total: number
  professorMode: boolean
  onNext: () => void
  onPrev: () => void
  onExit?: () => void
  fullscreen?: boolean
}) {
  const isCover = slide.kind === 'capa'
  return (
    <div className={cn('relative flex flex-col h-full min-h-[540px]', fullscreen ? '' : 'rounded-2xl overflow-hidden border border-slate-200 bg-white')}>
      <div className={cn('flex-1 flex flex-col p-5 sm:p-7 lg:p-9', isCover && 'text-white justify-center bg-[radial-gradient(circle_at_85%_10%,rgba(249,115,22,0.3),transparent_24%),radial-gradient(circle_at_15%_90%,rgba(124,58,237,0.4),transparent_30%),linear-gradient(120deg,#111d44,#263a7d)]')}>
        {isCover ? (
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[0.62rem] font-bold text-blue-100/80 mb-5">
              <Presentation size={13} className="text-orange-300" /> {slide.eyebrow}
            </div>
            <h2 className="text-[1.7rem] sm:text-[2.2rem] lg:text-[2.7rem] font-bold leading-[1.1] text-white max-w-[670px]">{slide.title}</h2>
            {slide.body.map((paragraph) => <p key={paragraph} className="text-[0.9rem] leading-relaxed text-blue-100/65 mt-4 max-w-[580px]">{paragraph}</p>)}
            <div className="flex items-center gap-2 mt-6 text-[0.64rem] text-blue-100/50">
              <span className="w-6 h-6 rounded-full bg-white/10 grid place-items-center"><MousePointer2 size={12} /></span>
              Use as setas do teclado para navegar
            </div>
          </div>
        ) : (
          <div className="max-w-3xl w-full mx-auto">
            <div className="text-[0.64rem] font-extrabold uppercase tracking-[0.14em] text-indigo-500 mb-2">{slide.eyebrow}</div>
            <h2 className="text-[1.3rem] sm:text-[1.65rem] leading-tight font-bold">{slide.title}</h2>
            <div className="mt-4 space-y-2.5">
              {slide.body.map((paragraph, bodyIndex) => (
                <div key={`${paragraph}-${bodyIndex}`} className={cn('flex gap-2.5', slide.kind === 'exemplo' && bodyIndex > 0 && 'items-start')}>
                  {slide.kind === 'exemplo' && bodyIndex > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center text-[0.58rem] font-extrabold shrink-0 mt-0.5">{bodyIndex}</span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-2 shrink-0" />
                  )}
                  <p className="text-[0.82rem] sm:text-[0.88rem] leading-relaxed text-slate-600">{paragraph}</p>
                </div>
              ))}
            </div>
            {slide.formula && (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-center">
                <span className="font-display text-[1.05rem] font-bold text-indigo-700">{slide.formula}</span>
              </div>
            )}
            {slide.question && (
              <div className="mt-4">
                <InteractiveQuestion question={slide.question} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className={cn('px-4 sm:px-6 py-3 border-t flex items-center justify-between gap-3', isCover ? 'bg-[#111d44] border-white/10 text-white' : 'bg-slate-50 border-slate-100')}>
        <div className={cn('text-[0.62rem] font-bold', isCover ? 'text-blue-100/50' : 'text-slate-400')}>
          Slide {index + 1} de {total}
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant={isCover ? 'secondary' : 'ghost'} className={isCover ? '!bg-white/10 !text-white !border-white/10' : ''} onClick={onPrev} disabled={index === 0} icon={<ChevronLeft size={14} />}>
            Anterior
          </Button>
          <Button size="sm" variant="primary" onClick={onNext} disabled={index === total - 1}>
            Próximo <ChevronRight size={14} />
          </Button>
          {onExit && (
            <button onClick={onExit} className={cn('icon-button !w-8 !h-8', isCover ? '!text-white/60 hover:!bg-white/10' : '')} aria-label="Sair da apresentação">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {professorMode && slide.notes && (
        <div className="border-t border-amber-100 bg-amber-50/70 px-4 sm:px-6 py-2.5 flex gap-2 items-start">
          <Lightbulb size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[0.67rem] text-amber-800 leading-relaxed"><span className="font-extrabold">Modo professor:</span> {slide.notes}</p>
        </div>
      )}
    </div>
  )
}

export function InteractiveLessonPage() {
  const { school, addMaterial, updateMaterial, materials, toast, settings } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<Stage>('EF2')
  const [year, setYear] = useState(6)
  const [topicId, setTopicId] = useState('geometria-plana')
  const [difficulty, setDifficulty] = useState<Difficulty>('medio')
  const [skillCode, setSkillCode] = useState('EF06MA21')
  const [skillSearch, setSkillSearch] = useState('')
  const [current, setCurrent] = useState(0)
  const [lesson, setLesson] = useState<LessonContent>(() => generateLesson({
    stage: 'EF2',
    year: 6,
    topic: 'geometria-plana',
    skillCodes: ['EF06MA21'],
    difficulty: 'medio',
  }))
  const [professorMode, setProfessorMode] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [title, setTitle] = useState(lesson.title)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)

  const topicOptions = useMemo(() => topicsFor(stage, year), [stage, year])
  const skills = useMemo(() => {
    const suggestions = suggestSkills(stage, year, topicId, 10)
    const query = skillSearch.trim().toLowerCase()
    if (!query) return suggestions
    return skillsFor(stage, year).filter((skill) => skill.code.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query)).slice(0, 20)
  }, [stage, year, topicId, skillSearch])
  const topic = getTopic(topicId)

  useEffect(() => {
    if (!topicOptions.some((item) => item.id === topicId)) setTopicId(topicOptions[0]?.id ?? 'fracoes')
  }, [topicOptions, topicId])

  useEffect(() => {
    const suggested = suggestSkills(stage, year, topicId, 1)
    if (suggested[0]) setSkillCode(suggested[0].code)
  }, [stage, year, topicId])

  useEffect(() => {
    const id = searchParams.get('material')
    if (!id) return
    const material = materials.find((item) => item.id === id && item.type === 'aula')
    if (!material) return
    setLesson(material.content as LessonContent)
    setTitle(material.title)
    setSavedId(material.id)
    setStage(material.stage)
    setYear(material.year)
    setTopicId(material.topic)
    setSkillCode(material.skillCodes[0] ?? '')
    setCurrent(0)
  }, [searchParams, materials])

  useEffect(() => {
    if (!fullscreen) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        setCurrent((index) => Math.min(index + 1, lesson.slides.length - 1))
      }
      if (event.key === 'ArrowLeft') setCurrent((index) => Math.max(index - 1, 0))
      if (event.key === 'Escape') setFullscreen(false)
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [fullscreen, lesson.slides.length])

  const regenerate = () => {
    const next = generateLesson({ stage, year, topic: topicId, skillCodes: skillCode ? [skillCode] : [], difficulty })
    setLesson(next)
    setTitle(next.title)
    setSavedId(null)
    setCurrent(0)
    toast({ title: 'Aula atualizada', description: `${next.slides.length} slides gerados com exemplos e desafios.`, tone: 'success' })
  }

  const save = () => {
    if (savedId) {
      updateMaterial(savedId, {
        title,
        description: `${stageYearText(stage, year)} · ${lesson.slides.length} slides · ${lesson.skills.map((skill) => skill.code).join(', ')}`,
        stage,
        year,
        topic: topicId,
        skillCodes: lesson.skills.map((skill) => skill.code),
        content: lesson,
      })
      toast({ title: 'Aula atualizada', tone: 'success' })
    } else {
      const material = addMaterial({
        type: 'aula',
        title,
        description: `${stageYearText(stage, year)} · ${lesson.slides.length} slides · ${lesson.summary}`,
        stage,
        year,
        topic: topicId,
        skillCodes: lesson.skills.map((skill) => skill.code),
        content: lesson,
      })
      setSavedId(material.id)
      toast({ title: 'Aula salva na biblioteca', description: 'A apresentação está pronta para projetar.', tone: 'success' })
    }
  }

  const download = () => {
    exportLessonPdf(lesson, school)
    toast({ title: 'PDF da aula gerado', description: 'Inclui todos os slides e as notas do modo professor.', tone: 'success' })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Aulas que envolvem"
        title="Aulas interativas"
        description="Transforme qualquer conteúdo em uma apresentação com contextualização, exemplos resolvidos, perguntas e desafios."
        icon={<Presentation size={21} />}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Save size={14} />} onClick={save}>Salvar</Button>
            <Button size="sm" icon={<Download size={14} />} onClick={download}>PDF do professor</Button>
          </>
        }
      />

      <div className="grid xl:grid-cols-[330px_1fr] gap-5 items-start">
        <Card className="p-4 sm:p-5 xl:sticky xl:top-[80px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center"><Sparkles size={16} /></div>
            <div>
              <div className="text-[0.8rem] font-bold">Montar apresentação</div>
              <div className="text-[0.62rem] text-slate-400">Conteúdo + prática + desafio</div>
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
            <Field label="Nível de dificuldade">
              <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
                <option value="facil">Essencial</option>
                <option value="medio">Intermediário</option>
                <option value="dificil">Desafiador</option>
              </Select>
            </Field>
            <Field label="Habilidade BNCC">
              <Input className="!py-2 !text-[0.75rem]" placeholder="Buscar habilidade…" value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} />
              <Select className="mt-1.5" value={skillCode} onChange={(event) => setSkillCode(event.target.value)}>
                {skills.map((skill) => <option key={skill.code} value={skill.code}>{skill.code} — {truncate(skill.description, 52)}</option>)}
              </Select>
            </Field>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="text-[0.6rem] font-extrabold uppercase tracking-wide text-slate-400">Habilidade selecionada</div>
              {skillCode && getSkill(skillCode) ? (
                <p className="text-[0.69rem] text-slate-600 leading-relaxed mt-1.5">{getSkill(skillCode)?.description}</p>
              ) : (
                <p className="text-[0.68rem] text-slate-400 mt-1">Escolha uma habilidade para alinhar a aula.</p>
              )}
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
              <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-indigo-700"><BookOpen size={13} /> O que será gerado</div>
              <ul className="mt-1.5 space-y-1 text-[0.63rem] text-slate-500">
                <li>• Capa e contextualização</li>
                <li>• Conceitos e fórmulas essenciais</li>
                <li>• Exemplo resolvido passo a passo</li>
                <li>• Prática interativa e desafio</li>
                <li>• Encerramento com bilhete de saída</li>
              </ul>
            </div>
            <Button className="w-full" size="lg" icon={<Sparkles size={15} />} onClick={regenerate}>Gerar nova aula</Button>
            <button onClick={() => setFullscreen(true)} className="w-full flex items-center justify-center gap-1.5 text-[0.68rem] font-bold text-slate-500 hover:text-indigo-600 py-1">
              <Maximize2 size={13} /> Apresentar agora
            </button>
          </div>
        </Card>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 no-print">
            <div className="flex items-center gap-2 text-[0.7rem] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> {savedId ? 'Aula salva' : 'Prévia interativa'}
              <span className="text-slate-300">·</span>
              <span>{lesson.slides.length} slides</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setProfessorMode((value) => !value)}
                className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.67rem] font-bold transition-colors', professorMode ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-500')}
              >
                {professorMode ? <Eye size={13} /> : <EyeOff size={13} />} Modo professor
              </button>
              <Button variant="secondary" size="sm" icon={<Expand size={13} />} onClick={() => setFullscreen(true)}>Tela cheia</Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[210px_1fr] gap-3 items-start">
            <Card className="p-2.5 hidden lg:block max-h-[620px] overflow-y-auto">
              <div className="text-[0.58rem] font-extrabold uppercase tracking-wide text-slate-400 px-1.5 pb-2">Roteiro da aula</div>
              <div className="space-y-1">
                {lesson.slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrent(index)}
                    className={cn(
                      'w-full text-left rounded-lg p-2 transition-colors flex gap-2',
                      current === index ? 'bg-indigo-50 border border-indigo-100' : 'border border-transparent hover:bg-slate-50',
                    )}
                  >
                    <span className={cn('w-5 h-5 rounded-md grid place-items-center text-[0.55rem] font-extrabold shrink-0 mt-0.5', current === index ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500')}>{index + 1}</span>
                    <div className="min-w-0">
                      <div className={cn('text-[0.64rem] font-bold leading-snug truncate', current === index ? 'text-indigo-700' : 'text-slate-600')}>{slide.title}</div>
                      <div className="text-[0.54rem] text-slate-400 truncate">{slide.eyebrow}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="min-w-0">
              <SlideView
                slide={lesson.slides[current]}
                index={current}
                total={lesson.slides.length}
                professorMode={professorMode}
                onNext={() => setCurrent((index) => Math.min(index + 1, lesson.slides.length - 1))}
                onPrev={() => setCurrent((index) => Math.max(index - 1, 0))}
              />
              <div className="mt-3 flex items-center gap-2">
                <div className="progress-track h-1.5 flex-1">
                  <div className="progress-fill" style={{ width: `${((current + 1) / lesson.slides.length) * 100}%` }} />
                </div>
                <span className="text-[0.6rem] font-bold text-slate-400">{current + 1}/{lesson.slides.length}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-[0.65rem] text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-500" /> {lesson.skills.length} habilidade(s) BNCC</span>
                <span className="flex items-center gap-1"><Lightbulb size={13} className="text-amber-500" /> notas do professor</span>
                <span className="flex items-center gap-1"><MousePointer2 size={13} className="text-indigo-500" /> perguntas interativas</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setDraftTitle(title); setEditing(true) }}>Editar título</Button>
                <Button variant="secondary" size="sm" onClick={() => navigate('/exercicios')}>Criar exercícios desta aula</Button>
                <Button variant="secondary" size="sm" onClick={() => navigate('/jogos')}>Gerar jogo</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {fullscreen && (
        <div className="lesson-fullscreen flex flex-col">
          <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-white/10 no-print">
            <div className="flex items-center gap-2 text-[0.7rem] text-white/60">
              <SchoolHeader compact />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.65rem] text-white/40 hidden sm:inline">{title}</span>
              <button onClick={() => setFullscreen(false)} className="icon-button !text-white/70 hover:!bg-white/10" aria-label="Fechar tela cheia"><Minimize2 size={18} /></button>
            </div>
          </div>
          <div className="flex-1 max-w-[1100px] w-full mx-auto p-2 sm:p-5">
            <SlideView
              slide={lesson.slides[current]}
              index={current}
              total={lesson.slides.length}
              professorMode={professorMode}
              onNext={() => setCurrent((index) => Math.min(index + 1, lesson.slides.length - 1))}
              onPrev={() => setCurrent((index) => Math.max(index - 1, 0))}
              onExit={() => setFullscreen(false)}
              fullscreen
            />
          </div>
        </div>
      )}

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Título da aula"
        footer={<><Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button><Button onClick={() => { setTitle(draftTitle || lesson.title); setEditing(false) }}>Aplicar</Button></>}
      >
        <Field label="Como esta aula aparecerá na biblioteca">
          <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
        </Field>
      </Modal>
    </div>
  )
}
