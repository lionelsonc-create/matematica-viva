export type Stage = 'EF1' | 'EF2' | 'EM'
export type MaterialType =
  | 'plano'
  | 'aula'
  | 'exercicios'
  | 'prova'
  | 'apostila'
  | 'atividade'
  | 'jogo'

export type Difficulty = 'facil' | 'medio' | 'dificil'

export type QuestionKind = 'multipla' | 'aberta' | 'lacunas' | 'vf' | 'associacao'

export type GeometryShapeId =
  | 'quadrado'
  | 'retangulo'
  | 'triangulo'
  | 'losango'
  | 'trapezio'
  | 'paralelogramo'
  | 'circulo'
  | 'circunferencia'
  | 'poligono'
  | 'cubo'
  | 'paralelepipedo'
  | 'piramide'
  | 'cilindro'
  | 'cone'
  | 'esfera'

export interface QuestionFigureData {
  shape: GeometryShapeId
  label?: string
  dimensions?: {
    base?: number
    height?: number
    side?: number
    radius?: number
    depth?: number
    diagonalMajor?: number
    diagonalMinor?: number
    unit?: string
  }
}

export interface BnccSkill {
  code: string
  stage: Stage
  years: number[]
  year: number
  unit: string
  object: string
  description: string
  source: string
}

export interface Alternative {
  text: string
  correct: boolean
}

export interface Question {
  id: string
  kind: QuestionKind
  prompt: string
  options?: string[]
  correctIndex?: number
  answer: string
  steps: string[]
  topic: string
  skillCode?: string
  points: number
  context?: string
  figure?: QuestionFigureData
}

export interface ExerciseConfig {
  stage: Stage
  year: number
  topic: string
  skillCode: string
  count: number
  difficulty: Difficulty
  kinds: QuestionKind[]
  includeSolutions: boolean
  includeImages: boolean
  contextualized: boolean
  variants: number
  seed: number
}

export interface PlanConfig {
  stage: Stage
  year: number
  topic: string
  skillCodes: string[]
  duration: number
  difficulty: Difficulty
  students: number
  methodology: string
  objective: string
}

export interface PlanSection {
  title: string
  items: string[]
}

export interface PlanContent {
  theme: string
  justification: string
  generalObjective: string
  specificObjectives: string[]
  skills: BnccSkill[]
  knowledgeObjects: string[]
  competencies: string[]
  contents: string[]
  methodology: string
  development: { stage: string; duration: string; description: string }[]
  resources: string[]
  assessment: string[]
  practical: string[]
  fixation: string[]
  homework: string[]
  adaptations: string[]
  inclusive: string[]
  references: string[]
}

export interface LessonSlide {
  id: string
  kind: 'capa' | 'contexto' | 'conceito' | 'exemplo' | 'pratica' | 'desafio' | 'encerramento'
  eyebrow: string
  title: string
  body: string[]
  formula?: string
  question?: Question
  notes?: string
}

export interface LessonContent {
  title: string
  theme: string
  summary: string
  objectives: string[]
  skills: BnccSkill[]
  slides: LessonSlide[]
  materials: string[]
}

export interface ExamHeader {
  school: string
  teacher: string
  student: string
  className: string
  date: string
  subject: string
  value: string
}

export interface ExamContent {
  title: string
  instructions: string[]
  header: ExamHeader
  questions: Question[]
  showHeader: boolean
  showAnswers: boolean
  layout: 'retrato' | 'paisagem'
}

export interface WorkbookContent {
  title: string
  subtitle: string
  presentation: string
  topics: string[]
  questions: Question[]
  includeSummary: boolean
  includeAnswers: boolean
}

export interface IllustratedActivity {
  id: string
  kind: string
  title: string
  instruction: string
  items: { prompt: string; answer: string; visual?: 'shape' | 'dots' | 'coins' | 'sequence' }[]
  colorByNumber?: boolean
  data?: Record<string, unknown>
}

export interface ActivityContent {
  title: string
  subtitle: string
  instructions: string
  tone: 'colorido' | 'economico'
  activities: IllustratedActivity[]
}

export interface ExerciseContent {
  config: ExerciseConfig
  questions: Question[]
  variants?: { label: string; questions: Question[] }[]
}

export interface Material {
  id: string
  type: MaterialType
  title: string
  description: string
  createdAt: string
  updatedAt: string
  stage: Stage
  year: number
  topic: string
  skillCodes: string[]
  favorite?: boolean
  shared?: boolean
  authorName?: string
  authorEmail?: string
  schoolLogo?: string
  content: PlanContent | LessonContent | ExerciseContent | ExamContent | WorkbookContent | ActivityContent | GameMaterial | Record<string, unknown>
  meta?: Record<string, string | number | boolean>
}

export interface GameMaterial {
  gameId: string
  config: GameConfig
  questions: Question[]
}

export interface GameConfig {
  stage: Stage
  year: number
  topic: string
  difficulty: Difficulty
  timer: boolean
  sound: boolean
  teams: boolean
  rounds: number
  seed: number
}

export interface TeacherUser {
  id: string
  name: string
  email: string
  avatar?: string
  schoolName?: string
  role?: string
}

export interface SchoolIdentity {
  name: string
  teacher: string
  address: string
  logo: string
  primary: string
  accent: string
  headerNote: string
  footer: string
}

export interface AppSettings {
  theme: 'light' | 'dark'
  fontSize: 'normal' | 'grande' | 'maior'
  highContrast: boolean
  reduceMotion: boolean
  defaultStage: Stage
  defaultYear: number
  sound: boolean
  includeAnswers: boolean
}

export interface ToastMessage {
  id: string
  title: string
  description?: string
  tone?: 'success' | 'error' | 'info'
}

export const STAGE_LABEL: Record<Stage, string> = {
  EF1: 'Ensino Fundamental I',
  EF2: 'Ensino Fundamental II',
  EM: 'Ensino Médio',
}

export const YEAR_LABEL: Record<number, string> = {
  1: '1º ano',
  2: '2º ano',
  3: '3º ano',
  4: '4º ano',
  5: '5º ano',
  6: '6º ano',
  7: '7º ano',
  8: '8º ano',
  9: '9º ano',
  0: 'Ensino Médio',
}

export const MATERIAL_LABEL: Record<MaterialType, string> = {
  plano: 'Plano de aula',
  aula: 'Aula interativa',
  exercicios: 'Lista de exercícios',
  prova: 'Prova',
  apostila: 'Apostila',
  atividade: 'Atividade ilustrada',
  jogo: 'Jogo',
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: 'Essencial',
  medio: 'Intermediário',
  dificil: 'Desafiador',
}
