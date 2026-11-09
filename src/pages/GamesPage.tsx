import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bomb,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Dices,
  DoorOpen,
  Flag,
  Gamepad2,
  Grid3X3,
  Heart,
  Lightbulb,
  Lock,
  Medal,
  MousePointerClick,
  Play,
  Puzzle,
  RefreshCw,
  RotateCw,
  Save,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type { Difficulty, GameConfig, Question, Stage } from '../lib/types'
import { YEAR_LABEL } from '../lib/types'
import { topicsFor, getTopic } from '../data/topics'
import { suggestSkills } from '../data/bncc'
import {
  createRng,
  generateBingoEntries,
  generateGameQuestions,
  generateMemoryPairs,
  generateNumberHunt,
  generateQuestion,
  shuffle,
} from '../lib/generators'
import { cn, formatNumber, stageYearText } from '../lib/utils'
import { Badge, Button, Card, Field, Modal, PageHeader, Select } from '../components/ui'

const stageYears: Record<Stage, number[]> = { EF1: [1, 2, 3, 4, 5], EF2: [6, 7, 8, 9], EM: [0] }

interface GameDefinition {
  id: string
  name: string
  description: string
  icon: typeof Gamepad2
  color: string
  soft: string
  tag: string
  skills: string
  component: 'quiz' | 'binary' | 'memory' | 'bingo' | 'wheel' | 'race' | 'times' | 'hunt' | 'escape' | 'equations'
}

const GAMES: GameDefinition[] = [
  {
    id: 'quiz',
    name: 'Quiz Matemático',
    description: 'Perguntas contextualizadas com alternativas, feedback imediato e modo equipes.',
    icon: Gamepad2,
    color: '#4666ff',
    soft: '#eef1ff',
    tag: 'Individual ou equipes',
    skills: 'Todos os conteúdos',
    component: 'quiz',
  },
  {
    id: 'tabuada',
    name: 'Batalha das Tabuadas',
    description: 'Fatos básicos contra o relógio. Digite o resultado e mantenha a sequência de acertos.',
    icon: Zap,
    color: '#f59e0b',
    soft: '#fff7e6',
    tag: 'Velocidade',
    skills: 'Multiplicação',
    component: 'times',
  },
  {
    id: 'memoria',
    name: 'Jogo da Memória Matemática',
    description: 'Encontre os pares entre operações e resultados. Trabalha memória e cálculo mental.',
    icon: Brain,
    color: '#ec4899',
    soft: '#fff0f8',
    tag: 'Concentração',
    skills: 'Operações e conceitos',
    component: 'memory',
  },
  {
    id: 'bingo',
    name: 'Bingo Matemático',
    description: 'Sorteio de operações, cartela de resultados e detecção automática de bingo.',
    icon: Grid3X3,
    color: '#0ea5e9',
    soft: '#e9f8ff',
    tag: 'Turma inteira',
    skills: 'Cálculo e atenção',
    component: 'bingo',
  },
  {
    id: 'roleta',
    name: 'Roleta dos Desafios',
    description: 'Gire a roleta e resolva o desafio sorteado. Feedback e pontuação automáticos.',
    icon: Dices,
    color: '#8b5cf6',
    soft: '#f7efff',
    tag: 'Sorte + estratégia',
    skills: 'Todos os conteúdos',
    component: 'wheel',
  },
  {
    id: 'corrida',
    name: 'Corrida Matemática',
    description: 'Acerte para avançar na pista e vença o computador em uma corrida de raciocínio.',
    icon: Flag,
    color: '#16a34a',
    soft: '#eafaf1',
    tag: 'Contra o computador',
    skills: 'Resolução de problemas',
    component: 'race',
  },
  {
    id: 'caca',
    name: 'Caça ao Resultado',
    description: 'Encontre o resultado correto no quadro antes do tempo acabar.',
    icon: Target,
    color: '#f97316',
    soft: '#fff3e8',
    tag: 'Agilidade visual',
    skills: 'Cálculo mental',
    component: 'hunt',
  },
  {
    id: 'equacoes',
    name: 'Desafio das Equações',
    description: 'Resolva equações e digite o valor da incógnita para abrir os cadeados.',
    icon: Puzzle,
    color: '#6366f1',
    soft: '#eef0ff',
    tag: 'Álgebra',
    skills: 'Equações',
    component: 'equations',
  },
  {
    id: 'escape',
    name: 'Escape Room Matemático',
    description: 'Três salas, três desafios. Resolva-os para escapar antes de o tempo terminar.',
    icon: DoorOpen,
    color: '#0d9488',
    soft: '#e8faf7',
    tag: 'Missão cronometrada',
    skills: 'Raciocínio e lógica',
    component: 'escape',
  },
  {
    id: 'vf',
    name: 'Verdadeiro ou Falso',
    description: 'Julgue igualdades e afirmações matemáticas com feedback imediato.',
    icon: CircleHelp,
    color: '#e11d48',
    soft: '#fff0f4',
    tag: 'Rápido e direto',
    skills: 'Verificação de resultados',
    component: 'binary',
  },
]

function playTone(enabled: boolean, correct: boolean): void {
  if (!enabled) return
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.type = correct ? 'sine' : 'triangle'
    oscillator.frequency.value = correct ? 660 : 180
    gain.gain.setValueAtTime(0.06, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.23)
    window.setTimeout(() => context.close(), 400)
  } catch {
    // Audio is an optional enhancement.
  }
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function GameTop({
  title,
  subtitle,
  score,
  right,
  onExit,
}: {
  title: string
  subtitle?: string
  score?: string | number
  right?: React.ReactNode
  onExit: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
      <button onClick={onExit} className="icon-button" aria-label="Sair do jogo"><X size={18} /></button>
      <div className="min-w-0">
        <div className="text-[0.8rem] font-extrabold truncate">{title}</div>
        {subtitle && <div className="text-[0.6rem] text-slate-400 truncate">{subtitle}</div>}
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {right}
        {score !== undefined && (
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 text-center">
            <div className="text-[0.5rem] font-extrabold uppercase tracking-wide text-indigo-400">Pontos</div>
            <div className="text-[0.84rem] font-extrabold text-indigo-700 leading-none">{score}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function Intro({
  game,
  config,
  onStart,
  description,
}: {
  game: GameDefinition
  config: GameConfig
  onStart: () => void
  description?: string
}) {
  const Icon = game.icon
  return (
    <div className="flex-1 grid place-items-center p-5 sm:p-8 bg-[radial-gradient(circle_at_20%_10%,rgba(70,102,255,0.08),transparent_30%),radial-gradient(circle_at_85%_90%,rgba(249,115,22,0.08),transparent_30%)]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl mx-auto grid place-items-center shadow-lg" style={{ background: game.soft, color: game.color }}>
          <Icon size={34} />
        </div>
        <h2 className="text-[1.5rem] font-bold mt-4">{game.name}</h2>
        <p className="text-[0.82rem] text-slate-500 leading-relaxed mt-2">{description || game.description}</p>
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          <Badge tone="blue">{YEAR_LABEL[config.year]}</Badge>
          <Badge tone="violet">{getTopic(config.topic).shortName}</Badge>
          <Badge tone={config.difficulty === 'dificil' ? 'rose' : config.difficulty === 'medio' ? 'orange' : 'green'}>
            {config.difficulty === 'facil' ? 'Essencial' : config.difficulty === 'medio' ? 'Intermediário' : 'Desafiador'}
          </Badge>
          <Badge>{config.timer ? 'Com cronômetro' : 'Sem cronômetro'}</Badge>
        </div>
        <Button size="lg" className="mt-6" icon={<Play size={17} />} onClick={onStart}>Começar a jogar</Button>
        <p className="text-[0.6rem] text-slate-400 mt-2">Use mouse, toque ou teclado. Pressione Esc para sair.</p>
      </div>
    </div>
  )
}

function Result({
  title,
  score,
  total,
  detail,
  onRestart,
  onExit,
}: {
  title: string
  score: number
  total: number
  detail?: string
  onRestart: () => void
  onExit: () => void
}) {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0
  return (
    <div className="flex-1 grid place-items-center p-5 sm:p-8 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.08),transparent_35%)]">
      <div className="text-center max-w-md">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 blur-xl opacity-25" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-items-center shadow-xl">
            {percent >= 70 ? <Trophy size={38} /> : <Medal size={38} />}
          </div>
        </div>
        <h2 className="text-[1.45rem] font-bold mt-4">{percent >= 70 ? 'Excelente trabalho!' : percent >= 40 ? 'Bom esforço!' : 'Continue praticando!'}</h2>
        <p className="text-[0.78rem] text-slate-500 mt-1">{title}</p>
        <div className="flex items-center justify-center gap-5 mt-5">
          <div>
            <div className="text-[1.8rem] font-display font-bold text-indigo-700 leading-none">{score}</div>
            <div className="text-[0.58rem] font-bold uppercase tracking-wide text-slate-400 mt-1">acertos</div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div>
            <div className="text-[1.8rem] font-display font-bold text-slate-700 leading-none">{percent}%</div>
            <div className="text-[0.58rem] font-bold uppercase tracking-wide text-slate-400 mt-1">aproveitamento</div>
          </div>
        </div>
        {detail && <p className="text-[0.7rem] text-slate-500 mt-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">{detail}</p>}
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="secondary" onClick={onExit}>Voltar aos jogos</Button>
          <Button icon={<RefreshCw size={14} />} onClick={onRestart}>Jogar novamente</Button>
        </div>
      </div>
    </div>
  )
}

function useQuestionTimer(active: boolean, resetKey: number, seconds: number): [number, () => void] {
  const [time, setTime] = useState(seconds)
  useEffect(() => {
    setTime(seconds)
  }, [resetKey, seconds])
  useEffect(() => {
    if (!active) return
    if (time <= 0) return
    const timer = window.setTimeout(() => setTime((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [active, time])
  return [time, () => setTime(seconds)]
}

// ---------------------------------------------------------------------------
// Quiz and true/false
// ---------------------------------------------------------------------------

function QuizGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const questions = useMemo(
    () => generateGameQuestions(config.topic, config.year, config.difficulty, config.seed, config.rounds, true),
    [config],
  )
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [teamScores, setTeamScores] = useState([0, 0])
  const [streak, setStreak] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [time, resetTime] = useQuestionTimer(phase === 'play' && config.timer && selected === null, index, 30)
  const question = questions[index]
  const currentTeam = index % 2

  const start = () => {
    setPhase('play')
    setIndex(0)
    setSelected(null)
    setScore(0)
    setTeamScores([0, 0])
    setStreak(0)
    setAnswered(0)
    resetTime()
  }

  const choose = useCallback(
    (choice: number | null) => {
      if (selected !== null || !question) return
      const effective = choice === null ? -1 : choice
      const correct = effective === question.correctIndex
      setSelected(effective)
      setAnswered((value) => value + 1)
      if (correct) {
        const points = 10 + streak * 2
        setScore((value) => value + points)
        setStreak((value) => value + 1)
        setTeamScores((scores) => {
          const next = [...scores]
          next[currentTeam] += points
          return next
        })
        playTone(config.sound, true)
      } else {
        setStreak(0)
        playTone(config.sound, false)
      }
    },
    [selected, question, streak, currentTeam, config.sound],
  )

  useEffect(() => {
    if (phase === 'play' && config.timer && time === 0 && selected === null) choose(null)
  }, [time, phase, config.timer, selected, choose])

  const next = () => {
    if (index + 1 >= questions.length) {
      setPhase('done')
    } else {
      setIndex((value) => value + 1)
      setSelected(null)
    }
  }

  if (phase === 'intro') {
    return <Intro game={game} config={config} onStart={start} description="Responda às perguntas o mais rápido que puder. Você recebe pontos extras por acertos consecutivos." />
  }
  if (phase === 'done') {
    return (
      <Result
        title={`${game.name} · ${answered} perguntas respondidas`}
        score={score}
        total={questions.length * 10}
        detail={config.teams ? `Equipe 1: ${teamScores[0]} pts · Equipe 2: ${teamScores[1]} pts` : streak > 1 ? `Melhor sequência: ${streak} acertos` : undefined}
        onRestart={start}
        onExit={onExit}
      />
    )
  }
  if (!question) return null

  return (
    <div className="flex flex-col flex-1">
      {config.teams && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border-b border-slate-100">
          {[0, 1].map((team) => (
            <div key={team} className={cn('rounded-lg border p-2 flex items-center justify-between', currentTeam === team ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100')}>
              <span className="text-[0.65rem] font-bold text-slate-600">Equipe {team + 1} {currentTeam === team && '· jogando'}</span>
              <span className="text-[0.72rem] font-extrabold text-indigo-700">{teamScores[team]} pts</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center max-w-3xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[0.68rem] font-extrabold text-indigo-600">Questão {index + 1}/{questions.length}</span>
            {streak > 1 && <Badge tone="orange">🔥 {streak} seguidas</Badge>}
          </div>
          {config.timer && (
            <div className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.72rem] font-extrabold', time <= 5 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-600')}>
              <Timer size={14} /> {time}s
            </div>
          )}
        </div>
        <div className="progress-track h-1.5 mb-5"><div className="progress-fill" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
        <h3 className="text-[1.08rem] sm:text-[1.25rem] font-bold leading-snug whitespace-pre-line">{question.prompt}</h3>
        <div className="grid sm:grid-cols-2 gap-2 mt-5">
          {question.options?.map((option, optionIndex) => {
            const isCorrect = optionIndex === question.correctIndex
            const isChosen = optionIndex === selected
            return (
              <button
                key={`${option}-${optionIndex}`}
                onClick={() => choose(optionIndex)}
                disabled={selected !== null}
                className={cn(
                  'text-left rounded-xl border-2 px-3.5 py-3 text-[0.8rem] font-semibold transition-all flex items-start gap-2.5',
                  selected === null && 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 hover:-translate-y-0.5',
                  selected !== null && isCorrect && 'border-emerald-400 bg-emerald-50 text-emerald-800',
                  selected !== null && isChosen && !isCorrect && 'border-rose-400 bg-rose-50 text-rose-800',
                  selected !== null && !isCorrect && !isChosen && 'border-slate-100 bg-slate-50/60 text-slate-400',
                )}
              >
                <span className={cn('w-6 h-6 rounded-lg grid place-items-center text-[0.65rem] font-extrabold shrink-0', selected !== null && isCorrect ? 'bg-emerald-500 text-white' : selected !== null && isChosen ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500')}>
                  {selected !== null && isCorrect ? <Check size={13} /> : selected !== null && isChosen ? <X size={13} /> : String.fromCharCode(65 + optionIndex)}
                </span>
                {option}
              </button>
            )
          })}
        </div>
        {selected !== null && (
          <div className={cn('mt-4 rounded-xl border p-3.5', selected === question.correctIndex ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200')}>
            <div className={cn('flex items-center gap-1.5 text-[0.75rem] font-extrabold', selected === question.correctIndex ? 'text-emerald-700' : 'text-amber-700')}>
              {selected === question.correctIndex ? <CheckCircle2 size={15} /> : <CircleHelp size={15} />}
              {selected === -1 ? 'Tempo esgotado!' : selected === question.correctIndex ? 'Resposta correta!' : 'Não foi dessa vez.'}
              <span className="font-semibold">Resposta: {question.answer}</span>
            </div>
            <ol className="mt-2 space-y-1">
              {question.steps.map((step, stepIndex) => (
                <li key={`${step}-${stepIndex}`} className="text-[0.7rem] text-slate-600 leading-relaxed">{stepIndex + 1}. {step}</li>
              ))}
            </ol>
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={next} icon={<ChevronRight size={14} />}>{index + 1 >= questions.length ? 'Ver resultado' : 'Próxima questão'}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BinaryGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const questions = useMemo(() => {
    const rng = createRng(config.seed)
    return Array.from({ length: config.rounds }, () => generateQuestion(config.topic, config.year, config.difficulty, rng, 'vf', true))
  }, [config])
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const question = questions[index]

  const start = () => { setPhase('play'); setIndex(0); setSelected(null); setScore(0) }
  const answer = (value: number) => {
    if (selected !== null) return
    setSelected(value)
    const correct = value === question.correctIndex
    if (correct) setScore((s) => s + 1)
    playTone(config.sound, correct)
  }
  const next = () => {
    if (index + 1 >= questions.length) setPhase('done')
    else { setIndex((i) => i + 1); setSelected(null) }
  }
  if (phase === 'intro') return <Intro game={game} config={config} onStart={start} description="Leia a afirmação e decida rapidamente: ela é verdadeira ou falsa?" />
  if (phase === 'done') return <Result title={`${game.name} · ${questions.length} afirmações`} score={score} total={questions.length} onRestart={start} onExit={onExit} />
  if (!question) return null

  return (
    <div className="flex-1 flex flex-col justify-center p-4 sm:p-8 max-w-3xl w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[0.7rem] font-extrabold text-indigo-600">{index + 1} de {questions.length}</span>
        <Badge tone="green">{score} acertos</Badge>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-sm">
        <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-slate-400 mb-3">A afirmação é…</div>
        <p className="text-[1.15rem] sm:text-[1.4rem] font-bold leading-snug">{question.prompt}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        {[0, 1].map((value) => {
          const label = value === 0 ? 'Verdadeiro' : 'Falso'
          const isCorrect = selected !== null && value === question.correctIndex
          const isWrong = selected === value && value !== question.correctIndex
          return (
            <button
              key={label}
              onClick={() => answer(value)}
              disabled={selected !== null}
              className={cn(
                'rounded-2xl border-2 py-5 font-extrabold transition-all flex flex-col items-center gap-2',
                value === 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
                selected !== null && isCorrect && 'ring-4 ring-emerald-300',
                selected !== null && isWrong && 'ring-4 ring-rose-300 opacity-80',
                selected !== null && !isCorrect && !isWrong && 'opacity-40',
              )}
            >
              {value === 0 ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
              <span className="text-[0.95rem]">{label}</span>
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <div className={cn('mt-4 rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center gap-2', selected === question.correctIndex ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200')}>
          <div className="flex-1">
            <div className={cn('text-[0.75rem] font-extrabold', selected === question.correctIndex ? 'text-emerald-700' : 'text-amber-700')}>
              {selected === question.correctIndex ? 'Você acertou!' : 'Resposta incorreta.'} O correto é {question.answer.toLowerCase()}.
            </div>
            <p className="text-[0.68rem] text-slate-600 mt-1">{question.steps.join(' ')}</p>
          </div>
          <Button size="sm" onClick={next}>{index + 1 >= questions.length ? 'Ver resultado' : 'Continuar'}</Button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------

interface MemoryCard {
  id: string
  pairId: string
  text: string
  kind: 'prompt' | 'answer'
}

function MemoryGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const buildCards = useCallback((): MemoryCard[] => {
    const pairs = generateMemoryPairs(config.topic, config.year, config.difficulty, config.seed, 6)
    const cards = pairs.flatMap((pair) => [
      { id: `${pair.id}-q`, pairId: pair.id, text: pair.prompt, kind: 'prompt' as const },
      { id: `${pair.id}-a`, pairId: pair.id, text: pair.answer, kind: 'answer' as const },
    ])
    return shuffle(createRng(config.seed + 77), cards)
  }, [config])
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [cards, setCards] = useState<MemoryCard[]>(buildCards)
  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (phase !== 'play') return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase === 'play' && matched.length === cards.length && cards.length > 0) setPhase('done')
  }, [matched, cards.length, phase])

  const start = () => {
    setCards(buildCards())
    setFlipped([])
    setMatched([])
    setMoves(0)
    setSeconds(0)
    setLocked(false)
    setPhase('play')
  }

  const flip = (card: MemoryCard) => {
    if (locked || flipped.includes(card.id) || matched.includes(card.pairId)) return
    if (flipped.length === 0) {
      setFlipped([card.id])
      playTone(config.sound, true)
      return
    }
    if (flipped.length === 1) {
      setFlipped([flipped[0], card.id])
      setMoves((value) => value + 1)
      const first = cards.find((item) => item.id === flipped[0])
      if (first && first.pairId === card.pairId) {
        setMatched((current) => [...current, card.pairId])
        setFlipped([])
        playTone(config.sound, true)
      } else {
        setLocked(true)
        playTone(config.sound, false)
        window.setTimeout(() => {
          setFlipped([])
          setLocked(false)
        }, 850)
      }
    }
  }

  if (phase === 'intro') return <Intro game={game} config={config} onStart={start} description="Encontre os pares entre operações e resultados. Quanto menos jogadas, melhor!" />
  if (phase === 'done') {
    return <Result title={`${game.name} · ${formatClock(seconds)} · ${moves} jogadas`} score={6} total={6} detail={`Você encontrou os 6 pares em ${moves} jogadas e ${formatClock(seconds)}.`} onRestart={start} onExit={onExit} />
  }

  return (
    <div className="flex-1 p-3 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex gap-2">
          <Badge tone="violet"><Clock3 size={11} /> {formatClock(seconds)}</Badge>
          <Badge tone="blue">{moves} jogadas</Badge>
        </div>
        <div className="text-[0.66rem] font-bold text-slate-500">{matched.length}/6 pares</div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-3xl mx-auto">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id)
          const isMatched = matched.includes(card.pairId)
          return (
            <button
              key={card.id}
              onClick={() => flip(card)}
              className={cn('memory-card', (isFlipped || isMatched) && 'flipped', isMatched && 'opacity-65')}
              disabled={isMatched}
              aria-label={isFlipped || isMatched ? card.text : 'Carta virada'}
            >
              <div className="memory-card-inner">
                <div className="memory-face memory-back">
                  <Sparkles size={17} className="text-orange-300" />
                </div>
                <div className={cn('memory-face memory-front', isMatched && '!bg-emerald-50 !border-emerald-200 !text-emerald-700')}>
                  {card.text}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <p className="text-center text-[0.62rem] text-slate-400 mt-3">Encontre os pares de operação e resultado.</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bingo
// ---------------------------------------------------------------------------

function BingoGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const entries = useMemo(() => generateBingoEntries(config.seed, config.difficulty, 25), [config])
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [board, setBoard] = useState(() => shuffle(createRng(config.seed + 3), entries).slice(0, 25))
  const [drawOrder, setDrawOrder] = useState(() => shuffle(createRng(config.seed + 9), entries))
  const [drawIndex, setDrawIndex] = useState(0)
  const [marked, setMarked] = useState<number[]>([])
  const [wrong, setWrong] = useState(0)
  const [bingo, setBingo] = useState(false)
  const [message, setMessage] = useState('Marque o resultado da operação sorteada.')
  const current = drawOrder[drawIndex]

  const start = () => {
    setBoard(shuffle(createRng(config.seed + 3), entries).slice(0, 25))
    setDrawOrder(shuffle(createRng(config.seed + 9), entries))
    setDrawIndex(0)
    setMarked([])
    setWrong(0)
    setBingo(false)
    setMessage('Marque o resultado da operação sorteada.')
    setPhase('play')
  }

  const checkLine = (cells: number[]) => {
    const lines = [
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
    ]
    return lines.some((line) => line.every((index) => cells.includes(index)))
  }

  const mark = (index: number) => {
    if (bingo || marked.includes(index) || !current) return
    if (board[index].result === current.result) {
      const nextMarked = [...marked, index]
      setMarked(nextMarked)
      setMessage('Boa! Resultado marcado.')
      playTone(config.sound, true)
      if (checkLine(nextMarked)) {
        setBingo(true)
        setPhase('done')
        return
      }
      window.setTimeout(() => {
        setDrawIndex((value) => Math.min(value + 1, drawOrder.length - 1))
        setMessage('Marque o resultado da operação sorteada.')
      }, 500)
    } else {
      setWrong((value) => value + 1)
      setMessage('Esse resultado não corresponde. Tente novamente!')
      playTone(config.sound, false)
    }
  }

  if (phase === 'intro') return <Intro game={game} config={config} onStart={start} description="Uma operação é sorteada. Encontre e marque o resultado na cartela. Complete uma linha para fazer bingo!" />
  if (phase === 'done') {
    return <Result title={`${game.name} · Bingo em ${drawIndex + 1} sorteios`} score={25 - wrong} total={25} detail={`Você completou uma linha com ${wrong} tentativa(s) incorreta(s).`} onRestart={start} onExit={onExit} />
  }

  return (
    <div className="flex-1 p-3 sm:p-5">
      <div className="grid lg:grid-cols-[300px_1fr] gap-4 max-w-4xl mx-auto items-start">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-4 shadow-lg">
          <div className="text-[0.6rem] font-extrabold uppercase tracking-widest text-blue-100/70">Operação sorteada</div>
          <div className="text-[2.1rem] font-display font-black text-center py-4">{current?.expression ?? '—'}</div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-2.5 text-[0.67rem] leading-relaxed text-blue-100/80">{message}</div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-lg bg-white/10 p-2 text-center">
              <div className="text-[0.52rem] uppercase tracking-wide text-blue-100/60">Sorteios</div>
              <div className="text-[0.9rem] font-extrabold">{drawIndex + 1}/25</div>
            </div>
            <div className="rounded-lg bg-white/10 p-2 text-center">
              <div className="text-[0.52rem] uppercase tracking-wide text-blue-100/60">Erros</div>
              <div className="text-[0.9rem] font-extrabold">{wrong}</div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-center text-[0.64rem] font-extrabold uppercase tracking-wide text-slate-400 mb-2">Cartela de resultados</div>
          <div className="grid grid-cols-5 gap-1.5">
            {board.map((entry, index) => {
              const isMarked = marked.includes(index)
              return (
                <button
                  key={`${entry.id}-${index}`}
                  onClick={() => mark(index)}
                  disabled={isMarked || bingo}
                  className={cn(
                    'aspect-square rounded-lg border-2 font-display font-extrabold text-[0.8rem] sm:text-[0.98rem] transition-all grid place-items-center',
                    isMarked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50',
                  )}
                >
                  {entry.result}
                </button>
              )
            })}
          </div>
          <p className="text-center text-[0.6rem] text-slate-400 mt-3">Complete uma linha, coluna ou diagonal para fazer bingo.</p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wheel
// ---------------------------------------------------------------------------

function polar(cx: number, cy: number, radius: number, angle: number): [number, number] {
  const radians = ((angle - 90) * Math.PI) / 180
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)]
}

function WheelGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const challenges = useMemo(
    () => generateGameQuestions(config.topic, config.year, config.difficulty, config.seed, 8, true),
    [config],
  )
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [current, setCurrent] = useState<number | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState<number[]>([])
  const [score, setScore] = useState(0)

  const start = () => {
    setPhase('play'); setRotation(0); setSpinning(false); setCurrent(null); setSelected(null); setAnswered([]); setScore(0)
  }
  const spin = () => {
    if (spinning || current !== null) return
    setSpinning(true)
    setSelected(null)
    const remaining = challenges.map((_, index) => index).filter((index) => !answered.includes(index))
    const pool = remaining.length ? remaining : challenges.map((_, index) => index)
    const picked = pool[Math.floor(Math.random() * pool.length)]
    const segment = 360 / challenges.length
    const target = 360 * 4 + (360 - picked * segment - segment / 2)
    setRotation((value) => value + target)
    window.setTimeout(() => {
      setCurrent(picked)
      setSpinning(false)
    }, 4100)
  }
  const choose = (index: number) => {
    if (current === null || selected !== null) return
    setSelected(index)
    const correct = index === challenges[current].correctIndex
    if (correct) {
      setScore((value) => value + 10)
      setAnswered((value) => [...value, current])
    }
    playTone(config.sound, correct)
  }
  const next = () => {
    if (answered.length >= Math.min(6, challenges.length)) {
      setPhase('done')
      return
    }
    setCurrent(null)
    setSelected(null)
    spin()
  }

  const colors = ['#4666ff', '#7c3aed', '#f97316', '#0ea5e9', '#ec4899', '#10b981', '#eab308', '#6366f1']
  const segment = 360 / challenges.length
  const wheelSvg = (size = 260) => (
    <svg width={size} height={size} viewBox="0 0 260 260" className="drop-shadow-md">
      <g className="wheel-spin" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '130px 130px' }}>
        {challenges.map((_, index) => {
          const startAngle = index * segment
          const endAngle = (index + 1) * segment
          const [x1, y1] = polar(130, 130, 118, startAngle)
          const [x2, y2] = polar(130, 130, 118, endAngle)
          const [tx, ty] = polar(130, 130, 82, startAngle + segment / 2)
          return (
            <g key={index}>
              <path d={`M130 130 L${x1} ${y1} A118 118 0 0 1 ${x2} ${y2} Z`} fill={colors[index % colors.length]} stroke="white" strokeWidth="2" />
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="800">?</text>
            </g>
          )
        })}
        <circle cx="130" cy="130" r="24" fill="white" stroke="#e2e8f0" strokeWidth="2" />
        <text x="130" y="130" textAnchor="middle" dominantBaseline="middle" fontSize="24" fill="#101b3f" fontWeight="900">π</text>
      </g>
      <polygon points="130,2 121,20 139,20" fill="#101b3f" />
    </svg>
  )

  if (phase === 'intro') return <Intro game={game} config={config} onStart={start} description="Gire a roleta e resolva o desafio sorteado. Cada acerto vale 10 pontos." />
  if (phase === 'done') return <Result title={`${game.name} · ${answered.length} desafios concluídos`} score={score} total={Math.min(6, challenges.length) * 10} onRestart={start} onExit={onExit} />

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto">
      <div className="grid md:grid-cols-[280px_1fr] gap-5 items-center">
        <div className="flex flex-col items-center">
          {wheelSvg()}
          <Button className="mt-3" size="sm" icon={<RotateCw size={14} />} onClick={current === null ? spin : next} disabled={spinning}>
            {spinning ? 'Girando…' : current === null ? 'Girar roleta' : 'Próximo desafio'}
          </Button>
          <span className="text-[0.6rem] text-slate-400 mt-2">{answered.length} de {Math.min(6, challenges.length)} desafios</span>
        </div>
        <div>
          {current === null ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <Dices size={30} className="text-violet-400 mx-auto" />
              <h3 className="text-[0.95rem] font-bold mt-2">Gire para sortear</h3>
              <p className="text-[0.7rem] text-slate-500 mt-1">Cada casa esconde um desafio diferente.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-violet-500">Desafio {answered.length + 1}</span>
                <Badge tone="violet">{score} pontos</Badge>
              </div>
              <p className="text-[0.86rem] font-semibold leading-relaxed whitespace-pre-line">{challenges[current].prompt}</p>
              <div className="grid sm:grid-cols-2 gap-2 mt-3">
                {challenges[current].options?.map((option, index) => {
                  const isCorrect = index === challenges[current].correctIndex
                  const chosen = selected === index
                  return (
                    <button
                      key={`${option}-${index}`}
                      onClick={() => choose(index)}
                      disabled={selected !== null}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 text-[0.75rem] font-semibold text-left transition-all',
                        selected !== null && isCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                        selected !== null && chosen && !isCorrect && 'border-rose-300 bg-rose-50 text-rose-800',
                        selected === null && 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/40',
                      )}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              {selected !== null && (
                <div className={cn('mt-3 rounded-lg p-3 text-[0.7rem]', selected === challenges[current].correctIndex ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                  <div className="font-extrabold">{selected === challenges[current].correctIndex ? 'Acertou!' : 'Quase!'} Resposta: {challenges[current].answer}</div>
                  <p className="mt-1 text-slate-600">{challenges[current].steps.join(' ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Race
// ---------------------------------------------------------------------------

function RaceGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const questions = useMemo(
    () => generateGameQuestions(config.topic, config.year, config.difficulty, config.seed + 13, 6, true),
    [config],
  )
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [index, setIndex] = useState(0)
  const [player, setPlayer] = useState(0)
  const [cpu, setCpu] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'none' | 'good' | 'bad'>('none')
  const question = questions[index]

  const start = () => { setPhase('play'); setIndex(0); setPlayer(0); setCpu(0); setSelected(null); setScore(0); setFlash('none') }
  const choose = (choice: number) => {
    if (selected !== null) return
    setSelected(choice)
    const correct = choice === question.correctIndex
    if (correct) {
      setPlayer((value) => Math.min(100, value + 17))
      setScore((value) => value + 1)
      setFlash('good')
      playTone(config.sound, true)
    } else {
      setCpu((value) => Math.min(100, value + 13))
      setFlash('bad')
      playTone(config.sound, false)
    }
  }
  const next = () => {
    const nextPlayer = player + (selected === question.correctIndex ? 0 : 0)
    if (player >= 100 || cpu >= 100 || index + 1 >= questions.length) {
      setPhase('done')
      return
    }
    setCpu((value) => Math.min(100, value + Math.floor(Math.random() * 8) + 3))
    setIndex((value) => value + 1)
    setSelected(null)
    setFlash('none')
    void nextPlayer
  }

  if (phase === 'intro') return <Intro game={game} config={config} onStart={start} description="Acerte as questões para acelerar. Cada erro ajuda o computador a avançar. Vença a corrida!" />
  if (phase === 'done') {
    const won = player >= cpu
    return <Result title={won ? 'Você venceu a corrida!' : 'O computador chegou primeiro…'} score={score} total={questions.length} detail={`Você avançou ${player}% e o computador ${cpu}%. Tente novamente!`} onRestart={start} onExit={onExit} />
  }
  if (!question) return null

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-3xl w-full mx-auto flex flex-col justify-center">
      <div className="race-track p-3 mb-4 space-y-3">
        <div className="relative h-12 rounded-lg bg-white/80 border border-slate-100 flex items-center">
          <div className="absolute inset-x-3 flex items-center justify-between text-[0.5rem] font-bold text-slate-300"><span>0%</span><span>50%</span><span>100%</span></div>
          <div className="absolute left-3 right-3 h-1 rounded-full bg-slate-200" />
          <div className="absolute left-3 h-1 rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `calc(${player}% - 12px)` }} />
          <div className="absolute transition-all duration-500 z-10 text-[1.3rem]" style={{ left: `calc(${Math.min(93, player)}% )` }}>🏎️</div>
        </div>
        <div className="relative h-12 rounded-lg bg-white/80 border border-slate-100 flex items-center">
          <div className="absolute left-3 right-3 h-1 rounded-full bg-slate-200" />
          <div className="absolute left-3 h-1 rounded-full bg-rose-300 transition-all duration-500" style={{ width: `calc(${cpu}% - 12px)` }} />
          <div className="absolute transition-all duration-500 z-10 text-[1.15rem]" style={{ left: `calc(${Math.min(94, cpu)}% )` }}>🤖</div>
          <div className="absolute right-3 top-1.5 text-[0.52rem] font-bold text-slate-400">Computador</div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.64rem] font-extrabold text-indigo-600">Volta {index + 1}/{questions.length}</span>
        <Badge tone="green">{score} acertos</Badge>
      </div>
      <div className={cn('rounded-2xl border-2 bg-white p-4 transition-colors', flash === 'good' ? 'border-emerald-200' : flash === 'bad' ? 'border-rose-200' : 'border-slate-200')}>
        <p className="text-[0.95rem] font-bold leading-relaxed whitespace-pre-line">{question.prompt}</p>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          {question.options?.map((option, optionIndex) => {
            const isCorrect = optionIndex === question.correctIndex
            const chosen = selected === optionIndex
            return (
              <button
                key={`${option}-${optionIndex}`}
                onClick={() => choose(optionIndex)}
                disabled={selected !== null}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-left text-[0.76rem] font-semibold transition-all',
                  selected !== null && isCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                  selected !== null && chosen && !isCorrect && 'border-rose-300 bg-rose-50 text-rose-800',
                  selected === null && 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30',
                )}
              >
                {option}
              </button>
            )
          })}
        </div>
        {selected !== null && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mt-3 rounded-lg bg-slate-50 p-2.5">
            <p className="text-[0.68rem] text-slate-600"><span className="font-extrabold">Resposta:</span> {question.answer}. {question.steps[question.steps.length - 1]}</p>
            <Button size="sm" onClick={next}>Continuar</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Times battle
// ---------------------------------------------------------------------------

function parseNumericAnswer(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, '')
  if (!normalized) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

function TimesGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const questions = useMemo(
    () => generateGameQuestions('tabuada', config.year, config.difficulty, config.seed + 5, 12, false),
    [config],
  )
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [time, setTime] = useState(60)
  const [feedback, setFeedback] = useState<'none' | 'good' | 'bad'>('none')
  const inputRef = useRef<HTMLInputElement>(null)

  const start = () => {
    setPhase('play'); setIndex(0); setInput(''); setScore(0); setStreak(0); setTime(60); setFeedback('none')
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }
  useEffect(() => {
    if (phase !== 'play') return
    const timer = window.setInterval(() => setTime((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [phase])
  useEffect(() => {
    if (phase === 'play' && time === 0) setPhase('done')
  }, [time, phase])

  const submit = () => {
    const value = parseNumericAnswer(input)
    if (value === null || index >= questions.length) return
    const expected = parseNumericAnswer(questions[index].answer)
    const correct = expected !== null && Math.abs(value - expected) < 0.001
    if (correct) {
      setScore((current) => current + 1)
      setStreak((current) => current + 1)
      setFeedback('good')
      playTone(config.sound, true)
      setInput('')
      if (index + 1 >= questions.length) {
        setPhase('done')
        return
      }
      setIndex((current) => current + 1)
      window.setTimeout(() => setFeedback('none'), 350)
    } else {
      setStreak(0)
      setFeedback('bad')
      playTone(config.sound, false)
      window.setTimeout(() => setFeedback('none'), 700)
    }
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }

  if (phase === 'intro') return <Intro game={game} config={config} onStart={start} description="Responda o maior número de multiplicações em 60 segundos. Digite o resultado e pressione Enter." />
  if (phase === 'done') return <Result title={`${game.name} · ${score} acertos em 60 segundos`} score={score} total={questions.length} detail={`Você completou o desafio com ${score} acertos.`} onRestart={start} onExit={onExit} />
  const question = questions[index]
  if (!question) return null

  return (
    <div className="flex-1 grid place-items-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="flex items-center justify-between mb-4">
          <Badge tone={time <= 10 ? 'rose' : 'blue'}><Timer size={12} /> {time}s</Badge>
          <div className="text-[0.7rem] font-bold text-slate-500">{index + 1}/{questions.length}</div>
          <Badge tone="orange"><Zap size={11} /> {streak} seguidas</Badge>
        </div>
        <div className={cn('rounded-2xl border-2 p-6 sm:p-8 bg-white transition-colors', feedback === 'good' ? 'border-emerald-300' : feedback === 'bad' ? 'border-rose-300' : 'border-slate-200')}>
          <div className="text-[0.62rem] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Quanto é?</div>
          <div className="font-display text-[2.3rem] sm:text-[3rem] font-black text-indigo-700">{question.prompt.replace(' = ?', '')}</div>
          <form onSubmit={(event) => { event.preventDefault(); submit() }} className="flex gap-2 max-w-xs mx-auto mt-4">
            <input
              ref={inputRef}
              inputMode="numeric"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="input text-center !text-[1.2rem] font-extrabold"
              placeholder="?"
              autoFocus
            />
            <Button type="submit" size="lg">Enviar</Button>
          </form>
          <div className="h-5 mt-2 text-[0.68rem] font-bold">
            {feedback === 'good' && <span className="text-emerald-600">Acertou! Próxima…</span>}
            {feedback === 'bad' && <span className="text-rose-600">Resposta: {question.answer}</span>}
          </div>
        </div>
        <div className="text-[0.6rem] text-slate-400 mt-3">Pressione Enter para enviar. O cálculo mental fica mais rápido com prática.</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Number hunt
// ---------------------------------------------------------------------------

function HuntGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const rounds = useMemo(
    () => Array.from({ length: 5 }, (_, index) => generateNumberHunt(config.topic, config.year, config.difficulty, config.seed + index * 37)),
    [config],
  )
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState<number[]>([])
  const [time, setTime] = useState(60)
  const [flash, setFlash] = useState<'none' | 'good' | 'bad'>('none')
  const data = rounds[round]

  const start = () => { setPhase('play'); setRound(0); setScore(0); setWrong([]); setTime(60); setFlash('none') }
  useEffect(() => {
    if (phase !== 'play') return
    const timer = window.setInterval(() => setTime((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [phase])
  useEffect(() => {
    if (phase === 'play' && time === 0) setPhase('done')
  }, [time, phase])

  const click = (value: number, correct: boolean) => {
    if (correct) {
      setScore((current) => current + 1)
      setFlash('good')
      playTone(config.sound, true)
      window.setTimeout(() => {
        if (round + 1 >= rounds.length) setPhase('done')
        else {
          setRound((current) => current + 1)
          setWrong([])
          setFlash('none')
        }
      }, 450)
    } else {
      setWrong((current) => current.includes(value) ? current : [...current, value])
      setFlash('bad')
      playTone(config.sound, false)
      window.setTimeout(() => setFlash('none'), 500)
    }
  }

  if (phase === 'intro') return <Intro game={game} config={config} onStart={start} description="Encontre o resultado correto no quadro de números. São 5 rodadas e 60 segundos." />
  if (phase === 'done') return <Result title={`${game.name} · ${score} de 5 resultados encontrados`} score={score} total={5} detail={time === 0 ? 'O tempo terminou. Tente novamente para melhorar seu recorde.' : undefined} onRestart={start} onExit={onExit} />

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-3xl w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Badge tone="blue">Rodada {round + 1}/5</Badge>
        <Badge tone={time <= 10 ? 'rose' : 'green'}><Timer size={12} /> {time}s</Badge>
        <Badge tone="violet">{score} acertos</Badge>
      </div>
      <div className={cn('rounded-2xl border-2 bg-white p-4 transition-colors', flash === 'good' ? 'border-emerald-300' : flash === 'bad' ? 'border-rose-200' : 'border-slate-200')}>
        <div className="text-[0.6rem] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Encontre o resultado de:</div>
        <p className="text-[0.98rem] font-bold leading-snug">{data.target.prompt}</p>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {data.grid.map((cell) => {
            const isWrong = wrong.includes(cell.value)
            return (
              <button
                key={cell.value}
                onClick={() => click(cell.value, cell.correct)}
                disabled={isWrong}
                className={cn(
                  'aspect-[1.4] rounded-xl border-2 font-display font-extrabold text-[1.05rem] transition-all',
                  isWrong ? 'border-rose-200 bg-rose-50 text-rose-300' : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-0.5',
                )}
              >
                {cell.value}
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-center text-[0.62rem] text-slate-400 mt-3">Cada erro deixa o número esmaecido. Você pode tentar novamente até acertar.</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Escape room
// ---------------------------------------------------------------------------

function EscapeGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const questions = useMemo(
    () => generateGameQuestions(config.topic, config.year, config.difficulty, config.seed + 91, 3, true),
    [config],
  )
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [room, setRoom] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(120)
  const [locked, setLocked] = useState(true)
  const question = questions[room]

  const start = () => { setPhase('play'); setRoom(0); setSelected(null); setScore(0); setTime(120); setLocked(true) }
  useEffect(() => {
    if (phase !== 'play') return
    const timer = window.setInterval(() => setTime((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [phase])
  useEffect(() => {
    if (phase === 'play' && time === 0) setPhase('done')
  }, [time, phase])

  const choose = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    const correct = index === question.correctIndex
    playTone(config.sound, correct)
    if (correct) {
      setScore((value) => value + 1)
      setLocked(false)
    }
  }
  const next = () => {
    if (room + 1 >= questions.length) setPhase('done')
    else {
      setRoom((value) => value + 1)
      setSelected(null)
      setLocked(true)
    }
  }

  if (phase === 'intro') return <Intro game={game} config={config} onStart={start} description="Você está em uma sala com três portas trancadas. Resolva cada desafio para abrir os cadeados e escapar em 2 minutos." />
  if (phase === 'done') return <Result title={score === 3 ? 'Você escapou!' : `${score} de 3 portas abertas`} score={score} total={3} detail={time === 0 ? 'O tempo acabou. Tente novamente!' : undefined} onRestart={start} onExit={onExit} />
  if (!question) return null

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-3xl w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          {questions.map((_, index) => (
            <div key={index} className={cn('w-7 h-7 rounded-lg grid place-items-center border', index < room ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : index === room ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-300')}>
              {index < room ? <Check size={13} /> : <Lock size={12} />}
            </div>
          ))}
          <span className="text-[0.63rem] font-bold text-slate-500 ml-1">Sala {room + 1} de 3</span>
        </div>
        <Badge tone={time <= 20 ? 'rose' : 'blue'}><Timer size={12} /> {formatClock(time)}</Badge>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-5 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 text-white/10"><DoorOpen size={64} /></div>
        <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.15em] text-orange-300">Cadeado {room + 1}</div>
        <h3 className="text-[1rem] sm:text-[1.15rem] font-bold text-white mt-1 whitespace-pre-line">{question.prompt}</h3>
        <div className="grid sm:grid-cols-2 gap-2 mt-4">
          {question.options?.map((option, index) => {
            const isCorrect = index === question.correctIndex
            const chosen = selected === index
            return (
              <button
                key={`${option}-${index}`}
                onClick={() => choose(index)}
                disabled={selected !== null}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-left text-[0.75rem] font-semibold transition-all',
                  selected !== null && isCorrect && 'border-emerald-300 bg-emerald-500/20 text-emerald-100',
                  selected !== null && chosen && !isCorrect && 'border-rose-300 bg-rose-500/20 text-rose-100',
                  selected === null && 'border-white/15 bg-white/10 text-blue-50 hover:bg-white/15',
                )}
              >
                {option}
              </button>
            )
          })}
        </div>
        {selected !== null && (
          <div className="mt-3 rounded-lg bg-white/10 border border-white/15 p-3 text-[0.7rem]">
            <div className="font-bold">{selected === question.correctIndex ? 'Cadeado aberto! 🎉' : 'Cadeado travado. Veja a pista:'}</div>
            <p className="text-blue-100/70 mt-1">{question.steps.join(' ')}</p>
            {locked && selected !== question.correctIndex && <button onClick={() => setSelected(null)} className="mt-2 text-[0.66rem] font-bold text-orange-300 underline">Tentar outra alternativa</button>}
            {selected === question.correctIndex && <Button size="sm" className="mt-2" onClick={next}>{room + 1 >= questions.length ? 'Escapar!' : 'Abrir próxima porta'}</Button>}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Equations
// ---------------------------------------------------------------------------

function EquationsGame({ config, game, onExit }: { config: GameConfig; game: GameDefinition; onExit: () => void }) {
  const questions = useMemo(
    () => generateGameQuestions('equacoes', config.year, config.difficulty, config.seed + 43, 8, true),
    [config],
  )
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<'none' | 'good' | 'bad'>('none')
  const [time, setTime] = useState(90)
  const inputRef = useRef<HTMLInputElement>(null)

  const start = () => { setPhase('play'); setIndex(0); setInput(''); setScore(0); setFeedback('none'); setTime(90); window.setTimeout(() => inputRef.current?.focus(), 50) }
  useEffect(() => {
    if (phase !== 'play') return
    const timer = window.setInterval(() => setTime((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [phase])
  useEffect(() => {
    if (phase === 'play' && time === 0) setPhase('done')
  }, [time, phase])

  const submit = () => {
    const value = parseNumericAnswer(input)
    if (value === null || index >= questions.length) return
    const expected = parseNumericAnswer(questions[index].answer)
    if (expected !== null && Math.abs(value - expected) < 0.001) {
      setScore((current) => current + 1)
      setFeedback('good')
      playTone(config.sound, true)
      setInput('')
      window.setTimeout(() => {
        if (index + 1 >= questions.length) setPhase('done')
        else { setIndex((current) => current + 1); setFeedback('none') }
        inputRef.current?.focus()
      }, 450)
    } else {
      setFeedback('bad')
      playTone(config.sound, false)
      window.setTimeout(() => setFeedback('none'), 900)
    }
  }

  if (phase === 'intro') return <Intro game={game} config={config} onStart={start} description="Resolva 8 equações e digite o valor da incógnita. Você tem 90 segundos." />
  if (phase === 'done') return <Result title={`${game.name} · ${score} equações resolvidas`} score={score} total={questions.length} detail={time === 0 ? 'O tempo terminou. Tente novamente!' : undefined} onRestart={start} onExit={onExit} />
  const question = questions[index]
  if (!question) return null

  return (
    <div className="flex-1 grid place-items-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <Badge tone="blue">Equação {index + 1}/8</Badge>
          <Badge tone={time <= 15 ? 'rose' : 'green'}><Timer size={12} /> {formatClock(time)}</Badge>
          <Badge tone="violet">{score} acertos</Badge>
        </div>
        <div className={cn('rounded-2xl border-2 bg-white p-5', feedback === 'good' ? 'border-emerald-300' : feedback === 'bad' ? 'border-rose-300' : 'border-slate-200')}>
          <div className="text-[0.6rem] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Descubra o valor de x</div>
          <p className="text-[0.95rem] font-bold leading-relaxed whitespace-pre-line">{question.prompt}</p>
          <form onSubmit={(event) => { event.preventDefault(); submit() }} className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.8rem] font-bold text-indigo-500">x =</span>
              <input
                ref={inputRef}
                inputMode="numeric"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="input !pl-11 !text-[1rem] font-bold"
                placeholder="valor de x"
                autoFocus
              />
            </div>
            <Button type="submit">Responder</Button>
          </form>
          <div className="mt-2 min-h-[1.3rem]">
            {feedback === 'good' && <div className="text-[0.7rem] font-bold text-emerald-600">Correto! Próxima equação…</div>}
            {feedback === 'bad' && <div className="text-[0.67rem] text-rose-600">Ainda não. Dica: {question.steps[0]}</div>}
          </div>
          {feedback === 'bad' && (
            <div className="rounded-lg bg-slate-50 p-2.5 mt-1">
              <button
                onClick={() => {
                  setInput(String(question.answer))
                  setFeedback('good')
                  playTone(config.sound, true)
                  window.setTimeout(() => {
                    if (index + 1 >= questions.length) setPhase('done')
                    else { setIndex((current) => current + 1); setFeedback('none'); setInput('') }
                  }, 400)
                }}
                className="text-[0.65rem] font-bold text-indigo-600 underline"
              >
                Ver resolução passo a passo
              </button>
              <p className="text-[0.62rem] text-slate-500 mt-1">{question.steps.join(' ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Launcher and page
// ---------------------------------------------------------------------------

function GameModal({
  game,
  config,
  onExit,
  onSave,
}: {
  game: GameDefinition
  config: GameConfig
  onExit: () => void
  onSave: () => void
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onExit()
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handler)
    }
  }, [onExit])

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/55 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center no-print">
      <div className="w-full max-w-5xl h-[min(88vh,760px)] bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <GameTop
          title={game.name}
          subtitle={`${stageYearText(config.stage, config.year)} · ${getTopic(config.topic).shortName}`}
          right={
            <button onClick={onSave} className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[0.65rem] font-bold text-slate-500 hover:border-slate-300" title="Salvar jogo na biblioteca">
              <Save size={13} /> Salvar
            </button>
          }
          onExit={onExit}
        />
        <div className="flex-1 overflow-y-auto bg-slate-50/30 flex flex-col">
          {game.component === 'quiz' && <QuizGame config={config} game={game} onExit={onExit} />}
          {game.component === 'binary' && <BinaryGame config={config} game={game} onExit={onExit} />}
          {game.component === 'memory' && <MemoryGame config={config} game={game} onExit={onExit} />}
          {game.component === 'bingo' && <BingoGame config={config} game={game} onExit={onExit} />}
          {game.component === 'wheel' && <WheelGame config={config} game={game} onExit={onExit} />}
          {game.component === 'race' && <RaceGame config={config} game={game} onExit={onExit} />}
          {game.component === 'times' && <TimesGame config={config} game={game} onExit={onExit} />}
          {game.component === 'hunt' && <HuntGame config={config} game={game} onExit={onExit} />}
          {game.component === 'escape' && <EscapeGame config={config} game={game} onExit={onExit} />}
          {game.component === 'equations' && <EquationsGame config={config} game={game} onExit={onExit} />}
        </div>
      </div>
    </div>
  )
}

export function GamesPage() {
  const { addMaterial, updateMaterial, materials, toast, settings } = useApp()
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<Stage>(settings.defaultStage)
  const [year, setYear] = useState(settings.defaultYear)
  const [topicId, setTopicId] = useState('tabuada')
  const [difficulty, setDifficulty] = useState<Difficulty>('medio')
  const [timer, setTimer] = useState(true)
  const [sound, setSound] = useState(settings.sound)
  const [teams, setTeams] = useState(false)
  const [rounds, setRounds] = useState(8)
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'todos' | 'rapidos' | 'equipes'>('todos')

  const topicOptions = useMemo(() => topicsFor(stage, year), [stage, year])
  const config: GameConfig = {
    stage,
    year,
    topic: topicId,
    difficulty,
    timer,
    sound,
    teams,
    rounds,
    seed: 48293 + year + topicId.length,
  }
  const filteredGames = filter === 'todos'
    ? GAMES
    : filter === 'equipes'
      ? GAMES.filter((game) => ['bingo', 'quiz', 'escape'].includes(game.id))
      : GAMES.filter((game) => ['times', 'hunt', 'binary', 'equations'].includes(game.id))

  useEffect(() => {
    if (!topicOptions.some((topic) => topic.id === topicId)) setTopicId(topicOptions[0]?.id ?? 'tabuada')
  }, [topicOptions, topicId])

  useEffect(() => {
    const id = searchParams.get('material')
    if (!id) return
    const material = materials.find((item) => item.id === id && item.type === 'jogo')
    if (!material) return
    const content = material.content as { gameId: string; config: GameConfig }
    if (!content?.gameId || !content.config) return
    const game = GAMES.find((item) => item.id === content.gameId)
    if (!game) return
    setStage(content.config.stage)
    setYear(content.config.year)
    setTopicId(content.config.topic)
    setDifficulty(content.config.difficulty)
    setTimer(content.config.timer)
    setSound(content.config.sound)
    setTeams(content.config.teams)
    setRounds(content.config.rounds)
    setSavedId(material.id)
    setActiveGame(game)
  }, [searchParams, materials])

  const saveGame = () => {
    if (!activeGame) return
    const questions = generateGameQuestions(topicId, year, difficulty, config.seed, rounds, true)
    const payload = {
      type: 'jogo' as const,
      title: activeGame.name,
      description: `${stageYearText(stage, year)} · ${getTopic(topicId).shortName} · ${activeGame.tag}`,
      stage,
      year,
      topic: topicId,
      skillCodes: suggestSkills(stage, year, topicId, 1).map((skill) => skill.code),
      favorite: true,
      content: { gameId: activeGame.id, config, questions },
    }
    if (savedId) {
      updateMaterial(savedId, payload)
      toast({ title: 'Jogo atualizado na biblioteca', tone: 'success' })
    } else {
      const material = addMaterial(payload)
      setSavedId(material.id)
      toast({ title: 'Jogo salvo nos favoritos', description: 'Abra pela Biblioteca quando quiser jogar novamente.', tone: 'success' })
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Aprender jogando"
        title="Laboratório de jogos matemáticos"
        description="Dez jogos funcionais com pontuação, feedback imediato, cronômetro opcional e conteúdo personalizado para a sua turma."
        icon={<Gamepad2 size={21} />}
        actions={<Badge tone="orange"><Star size={12} /> 10 jogos jogáveis</Badge>}
      />

      <Card className="p-4 mb-5 border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-violet-50/40">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <Field label="Etapa" className="lg:w-36">
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
          <Field label="Ano" className="lg:w-28">
            <Select value={year} onChange={(event) => setYear(Number(event.target.value))}>
              {stageYears[stage].map((value) => <option key={value} value={value}>{YEAR_LABEL[value]}</option>)}
            </Select>
          </Field>
          <Field label="Conteúdo" className="lg:flex-1">
            <Select value={topicId} onChange={(event) => setTopicId(event.target.value)}>
              {topicOptions.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
            </Select>
          </Field>
          <Field label="Dificuldade" className="lg:w-44">
            <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
              <option value="facil">Essencial</option>
              <option value="medio">Intermediário</option>
              <option value="dificil">Desafiador</option>
            </Select>
          </Field>
          <Field label="Rodadas" className="lg:w-24">
            <Select value={rounds} onChange={(event) => setRounds(Number(event.target.value))}>
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={12}>12</option>
            </Select>
          </Field>
          <div className="flex gap-1.5 pb-0.5">
            <button onClick={() => setTimer((value) => !value)} className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[0.67rem] font-bold', timer ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-white/60 border-slate-200 text-slate-400')}>
              <Timer size={13} /> {timer ? 'Timer on' : 'Timer off'}
            </button>
            <button onClick={() => setSound((value) => !value)} className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[0.67rem] font-bold', sound ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-white/60 border-slate-200 text-slate-400')}>
              {sound ? <Volume2 size={13} /> : <VolumeX size={13} />} Som
            </button>
            <button onClick={() => setTeams((value) => !value)} className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[0.67rem] font-bold', teams ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-white/60 border-slate-200 text-slate-400')}>
              <Users size={13} /> Equipes
            </button>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex gap-1.5">
          {[
            { value: 'todos' as const, label: 'Todos os jogos' },
            { value: 'rapidos' as const, label: 'Rápidos' },
            { value: 'equipes' as const, label: 'Para equipes' },
          ].map((item) => (
            <button key={item.value} onClick={() => setFilter(item.value)} className={cn('px-2.5 py-1.5 rounded-lg text-[0.68rem] font-bold', filter === item.value ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500')}>
              {item.label}
            </button>
          ))}
        </div>
        <span className="text-[0.65rem] text-slate-400 hidden sm:block">A mesma configuração vale para todos os jogos</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredGames.map((game) => {
          const Icon = game.icon
          return (
            <div key={game.id} className="game-card p-3.5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: game.soft, color: game.color }}><Icon size={20} /></div>
                <Badge tone="default" className="!text-[0.56rem]">{game.tag}</Badge>
              </div>
              <h3 className="text-[0.82rem] font-bold mt-3 leading-snug">{game.name}</h3>
              <p className="text-[0.64rem] text-slate-500 leading-relaxed mt-1 flex-1">{game.description}</p>
              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
                <span className="text-[0.56rem] text-slate-400 truncate">{game.skills}</span>
                <Button size="sm" icon={<Play size={12} />} onClick={() => { setSavedId(null); setActiveGame(game) }}>Jogar</Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid sm:grid-cols-3 gap-3">
        {[
          { icon: Trophy, title: 'Pontuação automática', text: 'Acertos, sequências e resultado final calculados em tempo real.' },
          { icon: Timer, title: 'Cronômetro opcional', text: 'Ative ou desative o tempo conforme o objetivo da aula.' },
          { icon: Users, title: 'Individual ou equipes', text: 'Quiz com dois times e placar separado para competições.' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} soft className="p-3.5 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 grid place-items-center shrink-0"><Icon size={16} /></div>
              <div>
                <div className="text-[0.72rem] font-bold">{item.title}</div>
                <div className="text-[0.62rem] text-slate-500 leading-relaxed mt-0.5">{item.text}</div>
              </div>
            </Card>
          )
        })}
      </div>

      {activeGame && (
        <GameModal
          game={activeGame}
          config={config}
          onExit={() => setActiveGame(null)}
          onSave={saveGame}
        />
      )}
    </div>
  )
}

