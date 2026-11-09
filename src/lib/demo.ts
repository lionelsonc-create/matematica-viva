import type { ExerciseConfig, Material, SchoolIdentity } from './types'
import { generateQuestions } from './generators'
import { generateActivity } from './materials'
import { generateLesson, generatePlan } from './plans'
import { uid } from './utils'

const createdAt = new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
const updatedAt = new Date(Date.now() - 1000 * 60 * 90).toISOString()

export const DEFAULT_SCHOOL: SchoolIdentity = {
  name: 'Escola Municipal Saber Viver',
  teacher: 'Prof.ª Ana Martins',
  address: 'Rua das Descobertas, 123 — Brasil',
  logo: '',
  primary: '#101b3f',
  accent: '#f97316',
  headerNote: 'Laboratório de Matemática · aprender fazendo',
  footer: 'Matemática Interativa · Matemática que ensina, interage e transforma',
}

function exerciseConfig(overrides: Partial<ExerciseConfig> = {}): ExerciseConfig {
  return {
    stage: 'EF2',
    year: 7,
    topic: 'fracoes',
    skillCode: 'EF07MA05',
    count: 8,
    difficulty: 'medio',
    kinds: ['multipla', 'aberta'],
    includeSolutions: true,
    includeImages: false,
    contextualized: true,
    variants: 2,
    seed: 482193,
    ...overrides,
  }
}

export function createDemoMaterials(): Material[] {
  const planConfig = {
    stage: 'EF2' as const,
    year: 7,
    topic: 'fracoes',
    skillCodes: ['EF07MA05', 'EF07MA06'],
    duration: 50,
    difficulty: 'medio' as const,
    students: 32,
    methodology: 'sequencia-didatica',
    objective: '',
  }
  const fractions = generatePlan(planConfig)
  const lesson = generateLesson({
    stage: 'EF2',
    year: 6,
    topic: 'geometria-plana',
    skillCodes: ['EF06MA21'],
    difficulty: 'medio',
  })
  const exerciseCfg = exerciseConfig()
  const exerciseQuestions = generateQuestions(exerciseCfg)
  const counting = generateActivity({
    stage: 'EF1',
    year: 2,
    topic: 'adicao-subtracao',
    kind: 'contar',
    tone: 'colorido',
    count: 6,
    seed: 7312,
  })

  return [
    {
      id: uid('mat'),
      type: 'plano',
      title: 'Frações na prática: do todo às partes',
      description: 'Plano completo de 50 min para o 7º ano, com BNCC, metodologia, avaliação e adaptações inclusivas.',
      createdAt,
      updatedAt,
      stage: 'EF2',
      year: 7,
      topic: 'fracoes',
      skillCodes: ['EF07MA05', 'EF07MA06'],
      content: fractions,
    },
    {
      id: uid('mat'),
      type: 'aula',
      title: 'Geometria plana: formas que constroem o mundo',
      description: 'Aula interativa com 9 slides, exemplos resolvidos, prática guiada e desafio.',
      createdAt,
      updatedAt,
      stage: 'EF2',
      year: 6,
      topic: 'geometria-plana',
      skillCodes: ['EF06MA21'],
      content: lesson,
    },
    {
      id: uid('mat'),
      type: 'exercicios',
      title: 'Lista de frações — 7º ano',
      description: '8 questões contextualizadas com gabarito e duas versões para a turma.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      stage: 'EF2',
      year: 7,
      topic: 'fracoes',
      skillCodes: ['EF07MA05'],
      content: { config: exerciseCfg, questions: exerciseQuestions },
    },
    {
      id: uid('mat'),
      type: 'atividade',
      title: 'Conte e registre — 2º ano',
      description: 'Atividade ilustrada colorida para contar, registrar quantidades e escrever numerais.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      stage: 'EF1',
      year: 2,
      topic: 'adicao-subtracao',
      skillCodes: [],
      content: counting,
    },
  ]
}
