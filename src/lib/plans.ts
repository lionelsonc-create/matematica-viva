import type {
  BnccSkill,
  Difficulty,
  LessonContent,
  LessonSlide,
  PlanConfig,
  PlanContent,
  Question,
} from './types'
import { getSkill } from '../data/bncc'
import { getTopic } from '../data/topics'
import { createRng, generateQuestion } from './generators'
import { formatDate, todayLong } from './utils'

const METHODOLOGIES: Record<string, string> = {
  'sala-invertida': 'Sala de aula invertida com exploração prévia e sistematização coletiva',
  abp: 'Aprendizagem baseada em problemas (ABP)',
  'sequencia-didatica': 'Sequência didática com situações-problema e prática guiada',
  investigacao: 'Investigação matemática e resolução colaborativa de problemas',
  'gamificacao': 'Gamificação e aprendizagem por desafios',
  'peer-instruction': 'Instrução por pares e discussão de estratégias',
}

const COMPETENCIES = [
  'Competência geral 2 — Pensamento científico, crítico e criativo: exercitar a curiosidade intelectual e investigar causas e soluções.',
  'Competência geral 3 — Repertório cultural: compreender e valorizar manifestações matemáticas presentes em diferentes contextos.',
  'Competência geral 9 — Empatia e cooperação: trabalhar em equipe, respeitar estratégias diferentes e argumentar com respeito.',
  'Competência geral 10 — Responsabilidade e cidadania: tomar decisões com base em dados e cálculos confiáveis.',
]

function minutes(total: number, percentages: number[]): string[] {
  const result = percentages.map((p) => Math.max(1, Math.round(total * p)))
  const diff = total - result.reduce((a, b) => a + b, 0)
  result[result.length - 1] += diff
  return result.map((value) => `${value} min`)
}

function methodologyLabel(key: string): string {
  return METHODOLOGIES[key] ?? METHODOLOGIES['sequencia-didatica']
}

export function generatePlan(config: PlanConfig): PlanContent {
  const topic = getTopic(config.topic)
  const skills = config.skillCodes.map(getSkill).filter((item): item is BnccSkill => Boolean(item))
  const times = minutes(config.duration, [0.1, 0.15, 0.25, 0.25, 0.15, 0.1])
  const skillSummary = skills.length
    ? skills.map((skill) => `${skill.code}: ${skill.description}`).join(' ')
    : 'Habilidade definida pelo professor a partir do currículo local.'

  const specificObjectives = [
    `Reconhecer e aplicar os conceitos centrais de ${topic.shortName.toLowerCase()} em situações do cotidiano.`,
    `Resolver problemas envolvendo ${topic.shortName.toLowerCase()} com estratégias variadas e registro organizado.`,
    'Justificar procedimentos matemáticos, comparar soluções e identificar erros comuns.',
    'Trabalhar colaborativamente, comunicando raciocínios e respeitando diferentes formas de resolver.',
  ]

  const development = [
    {
      stage: '1. Acolhida e contextualização',
      duration: times[0],
      description: `Retomar conhecimentos prévios com uma pergunta disparadora sobre ${topic.contexts[0].toLowerCase()}. Registrar as hipóteses da turma no quadro e apresentar o objetivo da aula.`,
    },
    {
      stage: '2. Problematização',
      duration: times[1],
      description: `Apresentar uma situação-problema que envolva ${topic.shortName.toLowerCase()}. Em duplas, os estudantes discutem possíveis estratégias antes de calcular. Socializar duas ou três abordagens.`,
    },
    {
      stage: '3. Exploração conceitual',
      duration: times[2],
      description: `Sistematizar ${topic.concept[0]} Utilizar representações visuais, exemplos e contraexemplos para construir o conceito com a turma.`,
    },
    {
      stage: '4. Prática guiada e autônoma',
      duration: times[3],
      description: `Resolver coletivamente um exemplo e propor uma sequência de exercícios com complexidade crescente. Circular pela sala, observar estratégias e oferecer apoio aos estudantes que apresentarem dificuldades.`,
    },
    {
      stage: '5. Desafio e aplicação',
      duration: times[4],
      description: `Propor um desafio em equipes sobre ${topic.shortName.toLowerCase()}. Cada equipe deve registrar a solução, explicar o raciocínio e comparar com outra equipe.`,
    },
    {
      stage: '6. Encerramento e avaliação',
      duration: times[5],
      description: 'Retomar os objetivos, solicitar uma síntese individual em uma frase e aplicar uma questão de saída (bilhete de saída) para verificar a aprendizagem.',
    },
  ]

  return {
    theme: `${topic.name} na prática: compreender, resolver e aplicar`,
    justification: `O trabalho com ${topic.shortName.toLowerCase()} no ${config.year === 0 ? 'Ensino Médio' : `${config.year}º ano do Ensino Fundamental`} é essencial para o desenvolvimento do raciocínio lógico e da capacidade de resolver problemas. A proposta parte de situações significativas, valoriza os conhecimentos prévios dos ${config.students} estudantes e articula compreensão conceitual, procedimentos e argumentação. ${skillSummary}`,
    generalObjective: config.objective?.trim() || `Desenvolver a compreensão de ${topic.shortName.toLowerCase()}, ampliando a capacidade de resolver problemas, comunicar ideias matemáticas e aplicar esses conhecimentos em contextos reais.`,
    specificObjectives,
    skills,
    knowledgeObjects: [
      topic.unit,
      topic.shortName,
      ...skills.map((skill) => skill.object).filter(Boolean),
    ].filter((value, index, array) => value && array.indexOf(value) === index),
    competencies: COMPETENCIES.slice(0, 3),
    contents: [
      `Conceitos fundamentais de ${topic.shortName.toLowerCase()}`,
      ...topic.formulas.map((formula) => `${formula.label}: ${formula.value}`),
      'Resolução de problemas e verificação de resultados',
      'Registro, argumentação e comunicação matemática',
    ],
    methodology: methodologyLabel(config.methodology),
    development,
    resources: [
      'Quadro, pincel e material de registro',
      'Projetor ou TV, quando disponível',
      'Material impresso da atividade e figuras geométricas',
      'Calculadora apenas para exploração de padrões ou conferência',
      'Jogo ou desafio matemático produzido na plataforma',
    ],
    assessment: [
      'Observação da participação e das estratégias utilizadas durante a prática.',
      'Bilhete de saída com uma questão aplicada à realidade.',
      'Correção coletiva dos exercícios, com análise dos erros como oportunidade de aprendizagem.',
      'Autoavaliação: o que já consigo explicar? O que ainda preciso revisar?',
    ],
    practical: [
      `Explorar uma situação real de ${topic.contexts[0].toLowerCase()} e registrar os dados em uma tabela.`,
      `Em duplas, criar um problema sobre ${topic.shortName.toLowerCase()} para outra dupla resolver.`,
      'Conferir os resultados por uma segunda estratégia ou por estimativa.',
    ],
    fixation: [
      `Resolver três exercícios com níveis diferentes de dificuldade sobre ${topic.shortName.toLowerCase()}.`,
      'Completar uma tabela de exemplos, procedimentos e verificações.',
      'Explicar com palavras próprias como reconhecer qual estratégia usar.',
      'Corrigir uma solução que contenha um erro e justificar a correção.',
    ],
    homework: [
      `Registrar dois exemplos de ${topic.shortName.toLowerCase()} encontrados em casa, no comércio ou em notícias.`,
      'Resolver uma situação-problema curta e trazer a solução explicada passo a passo.',
      'Conversar com um familiar sobre como esse conteúdo aparece no dia a dia.',
    ],
    adaptations: [
      'Disponibilizar a explicação em etapas curtas, com apoio visual e exemplo resolvido.',
      'Permitir uso de material manipulável, desenhos, esquemas e calculadora conforme o objetivo.',
      'Reduzir a quantidade de exercícios mantendo a mesma habilidade e oferecer tempo adicional.',
      'Formar duplas com papéis definidos e oferecer pistas graduais em vez de entregar a resposta.',
    ],
    inclusive: [
      'Apresentar instruções em formato verbal e escrito, com destaque para palavras-chave.',
      'Valorizar diferentes estratégias de resolução e evitar comparações públicas de desempenho.',
      'Planejar momentos de movimento e pausas quando necessário.',
      'Oferecer a versão ampliada dos materiais e garantir contraste adequado.',
    ],
    references: [
      'BRASIL. Ministério da Educação. Base Nacional Comum Curricular. Brasília, 2018.',
      `Materiais de referência sobre ${topic.shortName.toLowerCase()} e educação matemática.`,
      `Plano gerado em ${formatDate(new Date())} com a plataforma Matemática Interativa.`,
    ],
  }
}

function quizQuestion(
  topic: string,
  year: number,
  difficulty: Difficulty,
  seed: number,
): Question {
  return generateQuestion(topic, year, difficulty, createRng(seed), 'multipla', true)
}

export function generateLesson(input: {
  stage: 'EF1' | 'EF2' | 'EM'
  year: number
  topic: string
  skillCodes: string[]
  difficulty: Difficulty
  duration?: number
}): LessonContent {
  const topic = getTopic(input.topic)
  const skills = input.skillCodes.map(getSkill).filter((item): item is BnccSkill => Boolean(item))
  const seedBase = Number(`${input.year}${topic.id.length}${input.difficulty.length}`)
  const example = generateQuestion(topic.id, input.year, input.difficulty, createRng(seedBase), 'aberta', true)
  const practice = Array.from({ length: 3 }, (_, index) =>
    quizQuestion(topic.id, input.year, input.difficulty, seedBase + 31 * (index + 1)),
  )
  const challenge = quizQuestion(topic.id, input.year, 'dificil', seedBase + 199)
  const exit = quizQuestion(topic.id, input.year, input.difficulty, seedBase + 271)

  const slides: LessonSlide[] = [
    {
      id: 'slide-1',
      kind: 'capa',
      eyebrow: `${input.year === 0 ? 'Ensino Médio' : `${input.year}º ano`} · Matemática`,
      title: topic.name,
      body: [topic.summary],
      notes: 'Acolha a turma, apresente o objetivo e pergunte onde esse conteúdo aparece no cotidiano.',
    },
    {
      id: 'slide-2',
      kind: 'contexto',
      eyebrow: 'Para começar',
      title: 'Onde a Matemática aparece?',
      body: [
        topic.contexts[0] + '.',
        topic.contexts[1] + '.',
        'Pense em uma situação que você já viveu e que envolva esse conteúdo. Socialize com a turma.',
      ],
      notes: 'Registre as respostas dos estudantes no quadro sem corrigir prematuramente.',
    },
    {
      id: 'slide-3',
      kind: 'conceito',
      eyebrow: 'Ideia central',
      title: 'Construindo o conceito',
      body: topic.concept,
      formula: topic.formulas[0]?.value,
      notes: 'Use exemplos e contraexemplos. Peça que os estudantes expliquem o conceito com suas palavras.',
    },
    {
      id: 'slide-4',
      kind: 'conceito',
      eyebrow: 'Fórmulas e relações',
      title: 'Organizando as ideias',
      body: topic.formulas.map((item) => `${item.label}: ${item.value}`),
      formula: topic.formulas[1]?.value,
      notes: 'Não apresente as fórmulas isoladas: relacione cada uma a uma situação concreta.',
    },
    {
      id: 'slide-5',
      kind: 'exemplo',
      eyebrow: 'Exemplo resolvido',
      title: 'Vamos resolver juntos',
      body: [example.prompt, ...example.steps, `Resposta: ${example.answer}`],
      question: example,
      notes: 'Resolva passo a passo, verbalizando cada decisão. Depois, apague a resposta e peça que a turma refaça.',
    },
    {
      id: 'slide-6',
      kind: 'pratica',
      eyebrow: 'Sua vez',
      title: 'Prática guiada',
      body: ['Resolva as questões abaixo. Registre o raciocínio antes de marcar a alternativa.'],
      question: practice[0],
      notes: 'Circule pela sala e observe as estratégias. Socialize diferentes formas de resolver.',
    },
    {
      id: 'slide-7',
      kind: 'pratica',
      eyebrow: 'Continue praticando',
      title: 'Dois desafios rápidos',
      body: ['Compare sua estratégia com a de um colega. Vocês chegaram ao mesmo resultado por caminhos diferentes?'],
      question: practice[1],
      notes: 'Incentive a argumentação. Pergunte: como você sabe que a resposta está correta?',
    },
    {
      id: 'slide-8',
      kind: 'desafio',
      eyebrow: 'Desafio',
      title: 'Pense um pouco mais',
      body: ['Este desafio exige combinar mais de uma ideia. Tente resolver antes de ver a explicação.'],
      question: challenge,
      notes: 'Ofereça pistas graduais. Valorize o processo, não apenas a resposta final.',
    },
    {
      id: 'slide-9',
      kind: 'encerramento',
      eyebrow: 'Fechamento',
      title: 'O que levamos desta aula?',
      body: [
        'Em uma frase, explique o que você aprendeu hoje.',
        'Que estratégia você quer usar mais vezes?',
        'O que ainda parece confuso?',
      ],
      question: exit,
      notes: 'Recolha o bilhete de saída. Use as respostas para planejar a próxima aula.',
    },
  ]

  return {
    title: `${topic.name} — aula interativa`,
    theme: topic.name,
    summary: topic.summary,
    objectives: [
      `Compreender os conceitos fundamentais de ${topic.shortName.toLowerCase()}.`,
      'Aplicar estratégias de resolução de problemas e verificar resultados.',
      'Comunicar o raciocínio matemático com clareza e colaborar com os colegas.',
    ],
    skills,
    slides,
    materials: ['Projetor ou TV', 'Quadro e pincel', 'Caderno', 'Material impresso complementar'],
  }
}

export function buildExamHeader(input: {
  school: string
  teacher: string
  student?: string
  className?: string
  value?: string
}) {
  return {
    school: input.school,
    teacher: input.teacher,
    student: input.student ?? '',
    className: input.className ?? '',
    date: todayLong(),
    subject: 'Matemática',
    value: input.value ?? '10,0',
  }
}

export function lessonSummary(content: LessonContent): string {
  return `${content.slides.length} slides · ${content.objectives.length} objetivos · ${content.skills.length} habilidades BNCC`
}
