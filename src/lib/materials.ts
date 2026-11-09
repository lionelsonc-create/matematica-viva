import type {
  ActivityContent,
  BnccSkill,
  Difficulty,
  ExamContent,
  ExerciseConfig,
  IllustratedActivity,
  Question,
  Stage,
  WorkbookContent,
} from './types'
import { getTopic } from '../data/topics'
import { getSkill } from '../data/bncc'
import { createRng, generateQuestion } from './generators'
import { formatNumber, todayLong, uid } from './utils'

export type ActivityKind =
  | 'colorir'
  | 'contar'
  | 'sequencias'
  | 'resultado'
  | 'figuras'
  | 'cacanumeros'
  | 'dinheiro'
  | 'problemas'
  | 'ligue-pontos'
  | 'labirinto'

export const ACTIVITY_KINDS: { id: ActivityKind; name: string; description: string; icon: string }[] = [
  { id: 'colorir', name: 'Matemática para colorir', description: 'Resolva e pinte conforme a legenda de cores.', icon: 'Palette' },
  { id: 'contar', name: 'Conte e registre', description: 'Conte os elementos e registre a quantidade.', icon: 'Cuboid' },
  { id: 'sequencias', name: 'Complete as sequências', description: 'Descubra a regularidade e complete os termos.', icon: 'ListOrdered' },
  { id: 'resultado', name: 'Descubra o resultado', description: 'Operações escondidas para descobrir o valor.', icon: 'Sparkles' },
  { id: 'figuras', name: 'Identifique as figuras', description: 'Reconheça e nomeie figuras geométricas.', icon: 'Shapes' },
  { id: 'cacanumeros', name: 'Caça-números', description: 'Encontre os resultados no quadro de números.', icon: 'Search' },
  { id: 'dinheiro', name: 'Atividades com dinheiro', description: 'Some valores e resolva situações de compra.', icon: 'Banknote' },
  { id: 'problemas', name: 'Problemas ilustrados', description: 'Situações-problema com apoio visual.', icon: 'Lightbulb' },
  { id: 'ligue-pontos', name: 'Ligue os pontos', description: 'Conecte os pontos na ordem numérica.', icon: 'Waypoints' },
  { id: 'labirinto', name: 'Labirinto matemático', description: 'Percorra o caminho resolvendo operações.', icon: 'Route' },
]

export function generateActivity(input: {
  stage: Stage
  year: number
  topic: string
  kind: ActivityKind
  tone: 'colorido' | 'economico'
  count?: number
  seed?: number
}): ActivityContent {
  const topic = getTopic(input.topic)
  const rng = createRng(input.seed ?? Date.now())
  const count = input.count ?? 6
  const add = (a: number, b: number) => a + b
  const activities: IllustratedActivity[] = []

  const makeArithmetic = () => {
    const a = Math.floor(rng() * 8) + 2
    const b = Math.floor(rng() * 7) + 1
    return { prompt: `${a} + ${b}`, answer: String(add(a, b)), a, b }
  }

  if (input.kind === 'colorir' || input.kind === 'resultado') {
    const items = Array.from({ length: count }, () => {
      const item = makeArithmetic()
      return { prompt: `${item.prompt} =`, answer: item.answer, visual: 'shape' as const }
    })
    activities.push({
      id: uid('act'),
      kind: input.kind,
      title: input.kind === 'colorir' ? 'Resolva e pinte conforme a legenda' : 'Descubra o resultado',
      instruction:
        input.kind === 'colorir'
          ? 'Resolva cada operação. Depois, pinte a figura com a cor indicada pelo resultado.'
          : 'Resolva as operações e escreva o resultado dentro da figura.',
      items,
      colorByNumber: input.kind === 'colorir',
      data: { palette: ['#4666ff', '#f97316', '#22c55e', '#eab308', '#ec4899'] },
    })
  }

  if (input.kind === 'contar') {
    const items = Array.from({ length: count }, (_, index) => {
      const quantity = 3 + Math.floor(rng() * 9)
      return {
        prompt: `Conte os objetos do grupo ${index + 1} e registre a quantidade.`,
        answer: String(quantity),
        visual: 'dots' as const,
      }
    })
    activities.push({
      id: uid('act'),
      kind: 'contar',
      title: 'Conte e registre',
      instruction: 'Conte os objetos de cada grupo, registre o numeral e escreva como se lê.',
      items,
      data: { quantities: items.map((item) => Number(item.answer)) },
    })
  }

  if (input.kind === 'sequencias') {
    const step = 2 + Math.floor(rng() * 5)
    const start = 1 + Math.floor(rng() * 6)
    const sequences = Array.from({ length: 4 }, (_, seqIndex) => {
      const s = start + seqIndex
      const values = Array.from({ length: 7 }, (_, index) => s + index * step)
      const hidden = Math.floor(rng() * 3) + 3
      return {
        values,
        hidden,
        answer: values[hidden],
        step,
      }
    })
    activities.push({
      id: uid('act'),
      kind: 'sequencias',
      title: 'Complete as sequências',
      instruction: 'Observe a regularidade de cada sequência e complete os espaços em branco.',
      items: sequences.map((sequence, index) => ({
        prompt: sequence.values.map((value, valueIndex) => (valueIndex === sequence.hidden ? '____' : String(value))).join(' , '),
        answer: String(sequence.answer),
        visual: 'sequence' as const,
      })),
      data: { sequences, step },
    })
  }

  if (input.kind === 'figuras') {
    const shapes = [
      { name: 'Quadrado', sides: 4, kind: 'square' },
      { name: 'Triângulo', sides: 3, kind: 'triangle' },
      { name: 'Círculo', sides: 0, kind: 'circle' },
      { name: 'Retângulo', sides: 4, kind: 'rectangle' },
      { name: 'Losango', sides: 4, kind: 'diamond' },
      { name: 'Pentágono', sides: 5, kind: 'pentagon' },
    ]
    activities.push({
      id: uid('act'),
      kind: 'figuras',
      title: 'Identifique as figuras geométricas',
      instruction: 'Observe as figuras, escreva o nome de cada uma e o número de lados.',
      items: shapes.map((shape) => ({
        prompt: shape.name,
        answer: `${shape.name} — ${shape.sides} lados`,
        visual: 'shape' as const,
      })),
      data: { shapes },
    })
  }

  if (input.kind === 'cacanumeros') {
    const targets = Array.from({ length: 5 }, () => makeArithmetic())
    const numbers = new Set<number>()
    targets.forEach((target) => numbers.add(Number(target.answer)))
    while (numbers.size < 30) numbers.add(1 + Math.floor(rng() * 40))
    activities.push({
      id: uid('act'),
      kind: 'cacanumeros',
      title: 'Caça-números',
      instruction: 'Resolva as operações e circule os resultados no quadro de números.',
      items: targets.map((target) => ({ prompt: `${target.prompt} =`, answer: target.answer, visual: 'shape' as const })),
      data: { grid: [...numbers].sort(() => rng() - 0.5), targets: targets.map((target) => target.answer) },
    })
  }

  if (input.kind === 'dinheiro') {
    const items = Array.from({ length: count }, (_, index) => {
      const price = (5 + Math.floor(rng() * 40)) + 0.5
      const paid = Math.ceil(price / 10) * 10
      return {
        prompt: `Um produto custa R$ ${formatNumber(price, 2)} e foi pago com R$ ${paid},00. Qual é o troco?`,
        answer: `R$ ${formatNumber(paid - price, 2)}`,
        visual: 'coins' as const,
      }
    })
    activities.push({
      id: uid('act'),
      kind: 'dinheiro',
      title: 'Matemática com dinheiro',
      instruction: 'Resolva as situações de compra, desenhe as cédulas e moedas e registre o troco.',
      items,
    })
  }

  if (input.kind === 'problemas') {
    const config: ExerciseConfig = {
      stage: input.stage,
      year: input.year,
      topic: input.topic,
      skillCode: '',
      count,
      difficulty: 'facil',
      kinds: ['aberta'],
      includeSolutions: true,
      includeImages: true,
      contextualized: true,
      variants: 1,
      seed: input.seed ?? Date.now(),
    }
    const questions = Array.from({ length: count }, (_, i) =>
      generateQuestion(input.topic, input.year, 'facil', rng, 'aberta', true, undefined, 1),
    )
    void config
    activities.push({
      id: uid('act'),
      kind: 'problemas',
      title: 'Problemas ilustrados',
      instruction: 'Leia cada situação, desenhe ou registre o raciocínio e responda com uma frase completa.',
      items: questions.map((question, index) => ({
        prompt: question.prompt,
        answer: question.answer,
        visual: index % 2 === 0 ? 'dots' : 'shape',
      })),
    })
  }

  if (input.kind === 'ligue-pontos') {
    const total = 18
    const points = Array.from({ length: total }, (_, index) => {
      const angle = (Math.PI * 2 * index) / total - Math.PI / 2
      const radius = 120 + Math.sin(index * 1.7) * 35
      return {
        n: index + 1,
        x: 220 + Math.cos(angle) * radius,
        y: 180 + Math.sin(angle) * radius,
      }
    })
    activities.push({
      id: uid('act'),
      kind: 'ligue-pontos',
      title: 'Ligue os pontos',
      instruction: 'Ligue os pontos em ordem crescente. Depois, descubra e escreva o nome da figura formada.',
      items: [{ prompt: 'Figura formada:', answer: 'Estrela', visual: 'dots' as const }],
      data: { points, secret: 'Estrela' },
    })
  }

  if (input.kind === 'labirinto') {
    const size = 10
    const grid: number[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => 1))
    const path: { x: number; y: number }[] = []
    let x = 0
    let y = 0
    grid[0][0] = 0
    path.push({ x, y })
    while (x < size - 1 || y < size - 1) {
      const canRight = x < size - 1
      const canDown = y < size - 1
      if (canRight && (!canDown || rng() > 0.45)) {
        x += 1
      } else {
        y += 1
      }
      grid[y][x] = 0
      path.push({ x, y })
    }
    const obstacles = Array.from({ length: 24 }, () => {
      const ox = Math.floor(rng() * size)
      const oy = Math.floor(rng() * size)
      const isPath = path.some((point) => point.x === ox && point.y === oy)
      return { x: ox, y: oy, isPath }
    })
    activities.push({
      id: uid('act'),
      kind: 'labirinto',
      title: 'Labirinto matemático',
      instruction: 'Encontre o caminho da entrada até a saída e resolva as operações dos quadros coloridos.',
      items: [
        { prompt: 'Operação da entrada', answer: '5 + 4 = 9', visual: 'shape' as const },
        { prompt: 'Operação da saída', answer: '12 − 3 = 9', visual: 'shape' as const },
      ],
      data: { grid, obstacles, path },
    })
  }

  return {
    title: `${topic.shortName} — atividade ilustrada`,
    subtitle: `${input.year === 0 ? 'Ensino Médio' : `${input.year}º ano`} · ${topic.name} · versão ${input.tone === 'economico' ? 'econômica' : 'colorida'}`,
    instructions:
      'Leia as instruções com atenção, resolva cada atividade e confira suas respostas. Use lápis para registrar o raciocínio.',
    tone: input.tone,
    activities,
  }
}

export function generateExamContent(input: {
  stage: Stage
  year: number
  topic: string
  skillCode: string
  count: number
  difficulty: Difficulty
  title: string
  value: string
  header: ExamContent['header']
  showHeader: boolean
  layout: 'retrato' | 'paisagem'
  includeAnswers: boolean
}): { exam: ExamContent; config: ExerciseConfig } {
  const seed = Date.now()
  const rng = createRng(seed)
  const pointsTotal = Number(input.value.replace(',', '.')) || 10
  const questions = Array.from({ length: input.count }, (_, index) => {
    const kind = index % 4 === 3 ? 'aberta' : 'multipla'
    const question = generateQuestion(input.topic, input.year, input.difficulty, rng, kind, index % 2 === 0, input.skillCode || undefined)
    question.points = Number((pointsTotal / input.count).toFixed(1))
    return question
  })
  const exam: ExamContent = {
    title: input.title,
    instructions: [
      'Leia atentamente cada questão antes de responder.',
      'Registre o raciocínio nas questões abertas; respostas sem justificativa podem perder pontos.',
      'Use lápis para resolver e caneta para registrar a resposta final.',
      `Esta avaliação vale ${input.value} pontos.`,
    ],
    header: input.header,
    questions,
    showHeader: input.showHeader,
    showAnswers: input.includeAnswers,
    layout: input.layout,
  }
  const config: ExerciseConfig = {
    stage: input.stage,
    year: input.year,
    topic: input.topic,
    skillCode: input.skillCode,
    count: input.count,
    difficulty: input.difficulty,
    kinds: ['multipla', 'aberta'],
    includeSolutions: input.includeAnswers,
    includeImages: false,
    contextualized: true,
    variants: 1,
    seed,
  }
  return { exam, config }
}

export function generateWorkbookContent(input: {
  title: string
  subtitle: string
  presentation: string
  topics: string[]
  stage: Stage
  year: number
  difficulty: Difficulty
  count: number
  includeSummary: boolean
  includeAnswers: boolean
  seed?: number
}): WorkbookContent {
  const seed = input.seed ?? Date.now()
  const rng = createRng(seed)
  const questions: Question[] = Array.from({ length: input.count }, (_, index) => {
    const topicId = input.topics[index % input.topics.length] ?? 'adicao-subtracao'
    return generateQuestion(topicId, input.year, input.difficulty, rng, index % 3 === 0 ? 'aberta' : 'multipla', true)
  })
  return {
    title: input.title,
    subtitle: input.subtitle,
    presentation: input.presentation,
    topics: input.topics,
    questions,
    includeSummary: input.includeSummary,
    includeAnswers: input.includeAnswers,
  }
}

export function activityKindLabel(kind: string): string {
  return ACTIVITY_KINDS.find((item) => item.id === kind)?.name ?? kind
}

export function examInstructions(skillCodes: string[]): { skills: BnccSkill[]; label: string } {
  const skills = skillCodes.map(getSkill).filter((item): item is BnccSkill => Boolean(item))
  return { skills, label: skills.map((skill) => skill.code).join(', ') }
}

export function dateHeader(): string {
  return todayLong()
}
