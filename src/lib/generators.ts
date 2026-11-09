import type { Difficulty, ExerciseConfig, Question, QuestionFigureData, QuestionKind } from './types'
import { formatNumber, uid } from './utils'
import { getTopic } from '../data/topics'

export type Rng = () => number

export function createRng(seed: number): Rng {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function int(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function pick<T>(rng: Rng, items: T[]): T {
  return items[Math.floor(rng() * items.length)]
}

export function shuffle<T>(rng: Rng, items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

interface Draft {
  prompt: string
  answer: string
  steps: string[]
  options?: string[]
  correctIndex?: number
  context?: string
  contextual?: boolean
  figure?: QuestionFigureData
}

function optionsFor(correct: string, distractors: string[], rng: Rng): Pick<Draft, 'options' | 'correctIndex'> {
  const unique = [...new Set([correct, ...distractors.filter((item) => item && item !== correct)])].slice(0, 4)
  let guard = 0
  while (unique.length < 4 && guard < 50) {
    guard += 1
    const candidate = String(Number(correct.replace(',', '.')) + int(rng, 2, 9) || int(rng, 1, 9))
    if (!unique.includes(candidate)) unique.push(candidate)
  }
  while (unique.length < 4) unique.push(`Alternativa ${unique.length + 1}`)
  const options = shuffle(rng, unique)
  return { options, correctIndex: options.indexOf(correct) }
}

function distractorsAround(answer: number, rng: Rng, decimals = 0): string[] {
  const spread = Math.max(1, Math.round(Math.abs(answer) * 0.12))
  const values = new Set<number>()
  let guard = 0
  while (values.size < 8 && guard < 120) {
    guard += 1
    const delta = int(rng, 1, Math.max(2, spread + 4)) * (rng() > 0.5 ? 1 : -1)
    const value = answer + delta
    if (value !== answer && value >= 0) values.add(Number(value.toFixed(decimals)))
  }
  // Small or zero answers cannot always produce eight distinct neighbours above.
  // Complete the list with safe sequential values instead of looping forever.
  for (let offset = 1; values.size < 8 && offset <= 32; offset += 1) {
    values.add(Number((answer + offset).toFixed(decimals)))
  }
  return [...values].map((value) => formatNumber(value, decimals))
}

function draftNumeric(
  prompt: string,
  answer: number,
  steps: string[],
  rng: Rng,
  opts: { unit?: string; decimals?: number; contextual?: boolean; figure?: QuestionFigureData } = {},
): Draft {
  const value = `${formatNumber(answer, opts.decimals ?? 0)}${opts.unit ?? ''}`
  return {
    prompt,
    answer: value,
    steps,
    ...optionsFor(value, distractorsAround(answer, rng, opts.decimals ?? 0).map((n) => `${n}${opts.unit ?? ''}`), rng),
    contextual: opts.contextual,
    figure: opts.figure,
  }
}

function contextualSelect(rng: Rng, values: string[]): string {
  return pick(rng, values)
}

function ranges(year: number, difficulty: Difficulty) {
  const level = difficulty === 'facil' ? 0 : difficulty === 'medio' ? 1 : 2
  if (year <= 2) {
    return {
      add: [5, 20 + level * 25],
      mul: [level === 2 ? 5 : 2, level === 2 ? 6 : 5],
      big: [10, 50 + level * 50],
    }
  }
  if (year <= 5) {
    return {
      add: [20, 100 + level * 250],
      mul: [2, 6 + level * 4],
      big: [100, 1_000 + level * 2_000],
    }
  }
  return {
    add: [100, 1_000 + level * 3_000],
    mul: [3, 8 + level * 6],
    big: [1_000, 10_000 + level * 20_000],
  }
}

// ---------------------------------------------------------------------------
// Individual topic generators
// ---------------------------------------------------------------------------

function genNumbers(year: number, difficulty: Difficulty, rng: Rng, contextual: boolean): Draft {
  const { big } = ranges(year, difficulty)
  const number = int(rng, big[0], big[1])
  const digits = String(number).split('')
  const index = int(rng, 0, digits.length - 2)
  const place = 10 ** (digits.length - index - 1)
  const digit = Number(digits[index])
  const correct = digit * place
  const value = formatNumber(correct)
  const story = contextual
    ? `Em uma campanha, a escola arrecadou ${formatNumber(number)} livros. `
    : ''
  const prompt = `${story}No número ${formatNumber(number)}, qual é o valor posicional do algarismo ${digit}?`
  return {
    prompt,
    answer: value,
    steps: [
      `O número ${formatNumber(number)} tem ${digits.length} ordens.`,
      `O algarismo ${digit} ocupa a ordem de ${place === 1 ? 'unidade' : place === 10 ? 'dezena' : place === 100 ? 'centena' : place === 1000 ? 'unidade de milhar' : `${formatNumber(place)}`}.`,
      `${digit} × ${formatNumber(place)} = ${value}.`,
    ],
    ...optionsFor(value, distractorsAround(correct, rng).map((item) => item), rng),
  }
}

function genAddSub(year: number, difficulty: Difficulty, rng: Rng, contextual: boolean): Draft {
  const { add } = ranges(year, difficulty)
  const a = int(rng, add[0], add[1])
  const b = int(rng, add[0], add[1])
  const isSubtraction = rng() > 0.55
  if (!isSubtraction) {
    const total = a + b
    const story = contextual
      ? contextualSelect(rng, [
          `A biblioteca tinha ${a} livros e recebeu mais ${b}.`,
          `Uma turma juntou ${a} tampinhas na segunda-feira e ${b} na terça-feira.`,
          `Um mercado vendeu ${a} pães pela manhã e ${b} à tarde.`,
        ])
      : ''
    const prompt = contextual ? `${story} Quantos foram ao todo?` : `Calcule: ${a} + ${b}`
    return draftNumeric(prompt, total, [`Armamos ${a} + ${b}.`, `Somando unidade a unidade e reagrupando quando necessário, obtemos ${formatNumber(total)}.`], rng, { contextual })
  }
  const larger = Math.max(a, b)
  const smaller = Math.min(a, b)
  const difference = larger - smaller
  const story = contextual
    ? contextualSelect(rng, [
        `Havia ${larger} cadeiras no pátio e ${smaller} foram guardadas.`,
        `Uma loja tinha ${larger} camisetas e vendeu ${smaller}.`,
        `Pedro tinha ${larger} figurinhas e perdeu ${smaller} durante o recreio.`,
      ])
    : ''
  const prompt = contextual ? `${story} Quantas restaram?` : `Calcule: ${larger} − ${smaller}`
  return draftNumeric(prompt, difference, [`Armamos ${larger} − ${smaller}.`, `Subtraindo as ordens e reagrupando quando necessário, obtemos ${formatNumber(difference)}.`], rng, { contextual })
}

function genMulDiv(year: number, difficulty: Difficulty, rng: Rng, contextual: boolean): Draft {
  const { mul } = ranges(year, difficulty)
  const a = int(rng, mul[0], mul[1])
  const b = int(rng, Math.max(2, mul[0] - 1), mul[1] + 2)
  if (rng() > 0.5) {
    const product = a * b
    const story = contextual
      ? contextualSelect(rng, [
          `Uma sala organizou ${a} fileiras com ${b} cadeiras em cada fileira.`,
          `Um pacote tem ${a} figurinhas. A professora comprou ${b} pacotes.`,
          `Cada caixa contém ${a} lápis. Foram compradas ${b} caixas.`,
        ])
      : ''
    return draftNumeric(
      contextual ? `${story} Quantas unidades há no total?` : `Calcule: ${a} × ${b}`,
      product,
      [`Multiplicar ${a} por ${b} equivale a somar ${a} em ${b} grupos iguais.`, `${a} × ${b} = ${product}.`],
      rng,
      { contextual },
    )
  }
  const quotient = int(rng, 2, mul[1] + 4)
  const dividend = quotient * b
  const story = contextual
    ? contextualSelect(rng, [
        `A professora tem ${dividend} lápis para distribuir igualmente entre ${b} grupos.`,
        `Uma confeiteira fez ${dividend} doces e vai colocá-los em caixas com ${b} unidades.`,
        `Foram arrecadados ${dividend} reais por ${b} equipes, em partes iguais.`,
      ])
    : ''
  return draftNumeric(
    contextual ? `${story} Quanto terá cada grupo (ou quantas caixas serão formadas)?` : `Calcule: ${dividend} ÷ ${b}`,
    quotient,
    [`Procuramos o número que, multiplicado por ${b}, resulta em ${dividend}.`, `${b} × ${quotient} = ${dividend}, então ${dividend} ÷ ${b} = ${quotient}.`],
    rng,
    { contextual },
  )
}

function genTabuada(rng: Rng, contextual: boolean): Draft {
  const a = int(rng, 2, 10)
  const b = int(rng, 2, 10)
  const product = a * b
  const prompt = contextual
    ? `Em um jogo, cada rodada vale ${a} pontos. Uma equipe completou ${b} rodadas sem errar. Quantos pontos fez?`
    : `${a} × ${b} = ?`
  return draftNumeric(prompt, product, [`${a} × ${b} significa somar ${a} em ${b} grupos.`, `${a} × ${b} = ${product}.`], rng, { contextual })
}

function simplifiedFraction(numerator: number, denominator: number): string {
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y))
  const d = gcd(numerator, denominator)
  return `${numerator / d}/${denominator / d}`
}

function genFractions(rng: Rng, year: number, contextual: boolean): Draft {
  const mode = year <= 4 ? int(rng, 0, 2) : int(rng, 0, 3)
  if (mode === 0) {
    const denominator = pick(rng, [2, 4, 5, 10])
    const numerator = int(rng, 1, denominator - 1)
    const groups = int(rng, 2, 8)
    const total = denominator * groups
    const answer = numerator * groups
    const prompt = contextual
      ? `Uma coleção tem ${total} figurinhas. Ganhei ${numerator}/${denominator} da coleção. Quantas figurinhas ganhei?`
      : `Calcule ${numerator}/${denominator} de ${total}.`
    return draftNumeric(prompt, answer, [`Dividimos ${total} por ${denominator}: ${total} ÷ ${denominator} = ${groups}.`, `Multiplicamos por ${numerator}: ${groups} × ${numerator} = ${answer}.`], rng, { contextual })
  }
  if (mode === 1) {
    const denominator = pick(rng, [5, 6, 8, 10, 12])
    const a = int(rng, 1, denominator - 2)
    const b = int(rng, 1, denominator - a)
    const numerator = a + b
    const answer = simplifiedFraction(numerator, denominator)
    const options = [answer, simplifiedFraction(Math.max(1, numerator - 1), denominator), `${numerator}/${denominator + 1}`, simplifiedFraction(numerator + 1, denominator)]
    return {
      prompt: contextual
        ? `Em uma receita, foram usados ${a}/${denominator} de um pacote de farinha e depois mais ${b}/${denominator}. Que fração do pacote foi usada?`
        : `Calcule ${a}/${denominator} + ${b}/${denominator}.`,
      answer,
      steps: [`Os denominadores são iguais: conservamos ${denominator}.`, `Somamos os numeradores: ${a} + ${b} = ${numerator}.`, `Resultado: ${numerator}/${denominator}${answer !== `${numerator}/${denominator}` ? ` = ${answer}` : ''}.`],
      ...optionsFor(answer, options, rng),
    }
  }
  if (mode === 2) {
    const denominator = pick(rng, [2, 4, 5, 10, 20])
    const numerator = 1
    const percent = (100 / denominator) * numerator
    const answer = `${formatNumber(percent, 1)}%`
    const options = ['25%', '50%', '20%', '75%', '10%', '5%'].filter((item) => item !== answer)
    return {
      prompt: contextual
        ? `Em uma turma, ${numerator}/${denominator} dos estudantes prefere jogos de lógica. Que porcentagem da turma isso representa?`
        : `Transforme ${numerator}/${denominator} em porcentagem.`,
      answer,
      steps: [`${numerator}/${denominator} equivale a ${numerator} ÷ ${denominator} = ${formatNumber(numerator / denominator, 2)}.`, `Multiplicando por 100, obtemos ${answer}.`],
      ...optionsFor(answer, options, rng),
    }
  }
  const fractions = shuffle(rng, [
    { n: 1, d: 2 },
    { n: 2, d: 3 },
    { n: 3, d: 4 },
    { n: 2, d: 5 },
    { n: 5, d: 8 },
  ]).slice(0, 2)
  const values = fractions.map((f) => f.n / f.d)
  const larger = values[0] > values[1] ? fractions[0] : fractions[1]
  const answer = `${larger.n}/${larger.d}`
  return {
    prompt: `Qual das frações é maior: ${fractions[0].n}/${fractions[0].d} ou ${fractions[1].n}/${fractions[1].d}?`,
    answer,
    steps: [
      `Calculamos ${fractions[0].n} ÷ ${fractions[0].d} = ${formatNumber(values[0], 2)}.`,
      `Calculamos ${fractions[1].n} ÷ ${fractions[1].d} = ${formatNumber(values[1], 2)}.`,
      `A maior fração é ${answer}.`,
    ],
    options: [...new Set([`${fractions[0].n}/${fractions[0].d}`, `${fractions[1].n}/${fractions[1].d}`, 'São iguais', 'Não é possível comparar'])].slice(0, 4),
    correctIndex: [`${fractions[0].n}/${fractions[0].d}`, `${fractions[1].n}/${fractions[1].d}`].indexOf(answer),
  }
}

function genDecimals(rng: Rng, difficulty: Difficulty, contextual: boolean): Draft {
  const scale = difficulty === 'facil' ? 10 : difficulty === 'medio' ? 100 : 1000
  const a = int(rng, 3, 30 * scale) / scale
  const b = int(rng, 2, 20 * scale) / scale
  if (rng() > 0.5) {
    const total = Number((a + b).toFixed(2))
    const prompt = contextual
      ? `Uma compra custou R$ ${formatNumber(a, 2)} e outra custou R$ ${formatNumber(b, 2)}. Qual foi o valor total?`
      : `Calcule: ${formatNumber(a, 2)} + ${formatNumber(b, 2)}`
    return draftNumeric(prompt, total, [`Alinhamos as vírgulas: ${formatNumber(a, 2)} + ${formatNumber(b, 2)}.`, `O resultado é ${formatNumber(total, 2)}.`], rng, { unit: contextual ? ' reais' : '', decimals: 2, contextual })
  }
  const larger = Math.max(a, b)
  const smaller = Math.min(a, b)
  const difference = Number((larger - smaller).toFixed(2))
  const prompt = contextual
    ? `Uma garrafa tinha ${formatNumber(larger, 2)} L de suco e foram consumidos ${formatNumber(smaller, 2)} L. Quanto restou?`
    : `Calcule: ${formatNumber(larger, 2)} − ${formatNumber(smaller, 2)}`
  return draftNumeric(prompt, difference, [`Alinhamos as vírgulas: ${formatNumber(larger, 2)} − ${formatNumber(smaller, 2)}.`, `O resultado é ${formatNumber(difference, 2)}.`], rng, { unit: contextual ? ' L' : '', decimals: 2, contextual })
}

function genPercentage(rng: Rng, contextual: boolean): Draft {
  const percent = pick(rng, [10, 20, 25, 50, 75, 30, 40])
  const base = pick(rng, [40, 60, 80, 100, 120, 200, 240, 400])
  const answer = (base * percent) / 100
  const prompt = contextual
    ? contextualSelect(rng, [
        `Uma bicicleta custa R$ ${base} e está com ${percent}% de desconto. Qual é o valor do desconto?`,
        `Em uma pesquisa com ${base} estudantes, ${percent}% preferem Matemática. Quantos estudantes escolheram essa opção?`,
        `Uma camisa de R$ ${base} teve um acréscimo de ${percent}%. Qual foi o valor do acréscimo?`,
      ])
    : `Calcule ${percent}% de ${base}.`
  return draftNumeric(
    prompt,
    answer,
    [`Transformamos ${percent}% em ${formatNumber(percent / 100, 2)}.`, `${formatNumber(percent / 100, 2)} × ${base} = ${formatNumber(answer, 2)}.`],
    rng,
    { decimals: Number.isInteger(answer) ? 0 : 2, contextual },
  )
}

function genEquations(rng: Rng, difficulty: Difficulty, contextual: boolean): Draft {
  const a = int(rng, 2, difficulty === 'facil' ? 4 : 9)
  const x = int(rng, 1, difficulty === 'dificil' ? 20 : 10)
  const b = int(rng, 1, 30)
  const c = a * x + b
  const prompt = contextual
    ? `Pensei em um número, multipliquei-o por ${a} e acrescentei ${b}. Obtive ${c}. Em que número pensei?`
    : `Resolva a equação: ${a}x + ${b} = ${c}`
  return draftNumeric(prompt, x, [`Subtraímos ${b} dos dois lados: ${a}x = ${c - b}.`, `Dividimos os dois lados por ${a}: x = ${x}.`, `Conferindo: ${a} × ${x} + ${b} = ${c}.`], rng, { contextual })
}

function genExpressions(rng: Rng, difficulty: Difficulty, contextual: boolean): Draft {
  const a = int(rng, 2, difficulty === 'facil' ? 8 : 15)
  const b = int(rng, 2, 9)
  const c = int(rng, 2, difficulty === 'facil' ? 5 : 9)
  const mode = int(rng, 0, 2)
  if (mode === 0) {
    const answer = a + b * c
    return draftNumeric(contextual ? `Um jogo dá ${a} pontos de bônus e ${b} rodadas de ${c} pontos. Quantos pontos são?` : `Calcule: ${a} + ${b} × ${c}`, answer, [`Primeiro resolvemos a multiplicação: ${b} × ${c} = ${b * c}.`, `Depois somamos: ${a} + ${b * c} = ${answer}.`], rng, { contextual })
  }
  if (mode === 1) {
    const answer = (a + b) * c
    return draftNumeric(contextual ? `Cada caixa tem ${a + b} lápis. Foram compradas ${c} caixas. Quantos lápis há?` : `Calcule: (${a} + ${b}) × ${c}`, answer, [`Resolvemos o parêntese: ${a} + ${b} = ${a + b}.`, `Multiplicamos: ${a + b} × ${c} = ${answer}.`], rng, { contextual })
  }
  const d = Math.max(2, b)
  const answer = a * b - d
  return draftNumeric(contextual ? `Uma loja tinha ${a} caixas com ${b} produtos e vendeu ${d}. Quantos produtos restaram?` : `Calcule: ${a} × ${b} − ${d}`, answer, [`Primeiro a multiplicação: ${a} × ${b} = ${a * b}.`, `Depois a subtração: ${a * b} − ${d} = ${answer}.`], rng, { contextual })
}

function genPowers(rng: Rng, difficulty: Difficulty, contextual: boolean): Draft {
  const base = difficulty === 'facil' ? int(rng, 2, 5) : int(rng, 2, 10)
  const exponent = difficulty === 'dificil' ? int(rng, 3, 5) : int(rng, 2, 4)
  const answer = base ** exponent
  const prompt = contextual ? `Uma rede de computadores dobra a cada etapa. Começando com 1, quantos pontos existem após ${exponent} etapas? (Considere 2^${exponent}.)` : `Calcule: ${base}^${exponent}`
  return draftNumeric(prompt, answer, [`A potência ${base}^${exponent} indica ${exponent} fatores iguais a ${base}.`, `${Array.from({ length: exponent }, () => base).join(' × ')} = ${formatNumber(answer)}.`], rng, { contextual })
}

function genRoots(rng: Rng, difficulty: Difficulty, contextual: boolean): Draft {
  const base = difficulty === 'facil' ? int(rng, 2, 9) : int(rng, 4, 16)
  const cube = difficulty === 'dificil' && rng() > 0.5
  const value = cube ? base ** 3 : base ** 2
  const answer = base
  return draftNumeric(
    contextual ? `Qual é a medida do lado de um ${cube ? 'cubo' : 'quadrado'} cujo ${cube ? 'volume' : 'área'} é ${formatNumber(value)} ${cube ? 'cm³' : 'cm²'}?` : `${cube ? '∛' : '√'}${formatNumber(value)} = ?`,
    answer,
    [`Procuramos um número que elevado ao ${cube ? 'cubo' : 'quadrado'} resulte em ${formatNumber(value)}.`, `${base}${cube ? '³' : '²'} = ${formatNumber(value)}, então a resposta é ${answer}.`],
    rng,
    { contextual, unit: contextual ? ' cm' : '' },
  )
}

function genPlane(rng: Rng, difficulty: Difficulty, contextual: boolean): Draft {
  const shapes = difficulty === 'dificil'
    ? ['retangulo', 'triangulo', 'circulo', 'trapezio', 'losango']
    : ['retangulo', 'triangulo', 'quadrado', 'circulo']
  const type = pick(rng, shapes)

  if (type === 'circulo') {
    const radius = int(rng, 2, 10)
    const answer = Number((3.14 * radius ** 2).toFixed(2))
    return draftNumeric(
      contextual ? `Um jardim circular tem raio de ${radius} m. Qual é a sua área? (Use π = 3,14.)` : `Calcule a área de um círculo de raio ${radius} cm. Use π = 3,14.`,
      answer,
      [`A = π × r².`, `A = 3,14 × ${radius}² = 3,14 × ${radius ** 2}.`, `A = ${formatNumber(answer, 2)}.`],
      rng,
      { unit: contextual ? ' m²' : ' cm²', decimals: 2, contextual, figure: { shape: 'circulo', dimensions: { radius, unit: contextual ? 'm' : 'cm' } } },
    )
  }

  if (type === 'triangulo') {
    const base = int(rng, 3, 14) * 2
    const height = int(rng, 3, 12)
    const answer = (base * height) / 2
    return draftNumeric(
      contextual ? `Uma placa triangular tem base ${base} cm e altura ${height} cm. Qual é sua área?` : `Calcule a área de um triângulo de base ${base} cm e altura ${height} cm.`,
      answer,
      [`A = (base × altura) ÷ 2.`, `A = (${base} × ${height}) ÷ 2 = ${formatNumber(answer)}.`],
      rng,
      { unit: ' cm²', contextual, figure: { shape: 'triangulo', dimensions: { base, height, unit: 'cm' } } },
    )
  }

  if (type === 'quadrado') {
    const side = int(rng, 3, 15)
    const isPerimeter = rng() > 0.5
    const answer = isPerimeter ? 4 * side : side * side
    return draftNumeric(
      contextual
        ? `Um piso quadrado tem lado medindo ${side} m. Qual é ${isPerimeter ? 'o seu perímetro' : 'a sua área'}?`
        : `Calcule ${isPerimeter ? 'o perímetro' : 'a área'} de um quadrado de lado ${side} cm.`,
      answer,
      [
        isPerimeter ? `P = 4 × lado.` : `A = lado².`,
        isPerimeter ? `P = 4 × ${side} = ${formatNumber(answer)}.` : `A = ${side}² = ${formatNumber(answer)}.`,
      ],
      rng,
      {
        unit: isPerimeter ? (contextual ? ' m' : ' cm') : (contextual ? ' m²' : ' cm²'),
        contextual,
        figure: { shape: 'quadrado', dimensions: { side, unit: contextual ? 'm' : 'cm' } },
      },
    )
  }

  if (type === 'trapezio') {
    const bMayor = int(rng, 7, 18)
    const bMinor = Math.max(3, bMayor - int(rng, 2, 6))
    const height = int(rng, 3, 10)
    const answer = ((bMayor + bMinor) * height) / 2
    return draftNumeric(
      contextual
        ? `Um terreno em formato de trapézio tem base maior ${bMayor} m, base menor ${bMinor} m e altura ${height} m. Qual é a sua área?`
        : `Calcule a área de um trapézio de base maior ${bMayor} cm, base menor ${bMinor} cm e altura ${height} cm.`,
      answer,
      [`A = ((B + b) × h) ÷ 2.`, `A = ((${bMayor} + ${bMinor}) × ${height}) ÷ 2 = ${formatNumber(answer)}.`],
      rng,
      { unit: contextual ? ' m²' : ' cm²', contextual, figure: { shape: 'trapezio', dimensions: { base: bMayor, side: bMinor, height, unit: contextual ? 'm' : 'cm' } } },
    )
  }

  if (type === 'losango') {
    const dMayor = int(rng, 4, 12) * 2
    const dMinor = int(rng, 2, 7) * 2
    const answer = (dMayor * dMinor) / 2
    return draftNumeric(
      contextual
        ? `Uma pipa em formato de losango possui diagonal maior de ${dMayor} cm e diagonal menor de ${dMinor} cm. Qual é sua área?`
        : `Calcule a área de um losango cujas diagonais medem ${dMayor} cm e ${dMinor} cm.`,
      answer,
      [`A = (D × d) ÷ 2.`, `A = (${dMayor} × ${dMinor}) ÷ 2 = ${formatNumber(answer)}.`],
      rng,
      { unit: ' cm²', contextual, figure: { shape: 'losango', dimensions: { diagonalMajor: dMayor, diagonalMinor: dMinor, unit: 'cm' } } },
    )
  }

  // retangulo
  const base = int(rng, 4, 18)
  const height = int(rng, 3, 12)
  const isPerimeter = rng() > 0.6
  const answer = isPerimeter ? 2 * (base + height) : base * height
  return draftNumeric(
    contextual
      ? `Uma sala retangular tem ${base} metros de comprimento e ${height} metros de largura. Qual é ${isPerimeter ? 'o seu perímetro' : 'a sua área'}?`
      : `Calcule ${isPerimeter ? 'o perímetro' : 'a área'} de um retângulo de base ${base} cm e altura ${height} cm.`,
    answer,
    [
      isPerimeter ? `P = 2 × (base + altura).` : `A = base × altura.`,
      isPerimeter ? `P = 2 × (${base} + ${height}) = ${formatNumber(answer)}.` : `A = ${base} × ${height} = ${formatNumber(answer)}.`,
    ],
    rng,
    {
      unit: isPerimeter ? (contextual ? ' m' : ' cm') : (contextual ? ' m²' : ' cm²'),
      contextual,
      figure: { shape: 'retangulo', dimensions: { base, height, unit: contextual ? 'm' : 'cm' } },
    },
  )
}

function genSpatial(rng: Rng, difficulty: Difficulty, contextual: boolean): Draft {
  const types = difficulty === 'dificil'
    ? ['cilindro', 'paralelepipedo', 'cubo', 'cone', 'piramide']
    : ['cubo', 'paralelepipedo', 'cilindro']
  const type = pick(rng, types)

  if (type === 'cilindro') {
    const radius = int(rng, 2, 8)
    const height = int(rng, 3, 12)
    const answer = Number((3.14 * radius ** 2 * height).toFixed(2))
    return draftNumeric(
      contextual ? `Uma lata cilíndrica tem raio ${radius} cm e altura ${height} cm. Qual é seu volume? (Use π = 3,14.)` : `Calcule o volume de um cilindro com raio ${radius} cm e altura ${height} cm. Use π = 3,14.`,
      answer,
      [`V = π × r² × h.`, `V = 3,14 × ${radius}² × ${height} = ${formatNumber(answer, 2)}.`],
      rng,
      { unit: ' cm³', decimals: 2, contextual, figure: { shape: 'cilindro', dimensions: { radius, height, unit: 'cm' } } },
    )
  }

  if (type === 'cubo') {
    const a = int(rng, 2, 8)
    const answer = a ** 3
    return draftNumeric(
      contextual ? `Uma caixa d'água cúbica tem aresta medindo ${a} m. Qual é o seu volume?` : `Calcule o volume de um cubo de aresta ${a} cm.`,
      answer,
      [`V = a³.`, `V = ${a}³ = ${formatNumber(answer)}.`],
      rng,
      { unit: contextual ? ' m³' : ' cm³', contextual, figure: { shape: 'cubo', dimensions: { side: a, unit: contextual ? 'm' : 'cm' } } },
    )
  }

  if (type === 'piramide') {
    const base = int(rng, 3, 9)
    const height = int(rng, 3, 10)
    const answer = Number(((base * base * height) / 3).toFixed(2))
    return draftNumeric(
      contextual ? `Um monumento em forma de pirâmide de base quadrada tem lado da base ${base} m e altura ${height} m. Qual é seu volume?` : `Calcule o volume de uma pirâmide regular de base quadrada com lado ${base} cm e altura ${height} cm.`,
      answer,
      [`V = (Área da base × altura) ÷ 3.`, `V = (${base}² × ${height}) ÷ 3 = ${formatNumber(answer, 2)}.`],
      rng,
      { unit: contextual ? ' m³' : ' cm³', decimals: 2, contextual, figure: { shape: 'piramide', dimensions: { base, height, unit: contextual ? 'm' : 'cm' } } },
    )
  }

  if (type === 'cone') {
    const radius = int(rng, 2, 6)
    const height = int(rng, 3, 9)
    const answer = Number(((3.14 * radius ** 2 * height) / 3).toFixed(2))
    return draftNumeric(
      contextual ? `Um funil cônico possui raio da base ${radius} cm e altura ${height} cm. Qual é a sua capacidade volumétrica? (Use π = 3,14.)` : `Calcule o volume de um cone com raio ${radius} cm e altura ${height} cm. Use π = 3,14.`,
      answer,
      [`V = (π × r² × h) ÷ 3.`, `V = (3,14 × ${radius}² × ${height}) ÷ 3 = ${formatNumber(answer, 2)}.`],
      rng,
      { unit: ' cm³', decimals: 2, contextual, figure: { shape: 'cone', dimensions: { radius, height, unit: 'cm' } } },
    )
  }

  // paralelepipedo
  const a = int(rng, 3, 10)
  const b = int(rng, 2, 8)
  const c = int(rng, 2, 6)
  const answer = a * b * c
  return draftNumeric(
    contextual ? `Uma caixa tem ${a} cm de comprimento, ${b} cm de largura e ${c} cm de altura. Qual é seu volume?` : `Calcule o volume de um paralelepípedo ${a} × ${b} × ${c} cm.`,
    answer,
    [`V = comprimento × largura × altura.`, `V = ${a} × ${b} × ${c} = ${formatNumber(answer)}.`],
    rng,
    { unit: ' cm³', contextual, figure: { shape: 'paralelepipedo', dimensions: { base: a, height: b, depth: c, unit: 'cm' } } },
  )
}

function genMeasures(rng: Rng, contextual: boolean): Draft {
  const mode = int(rng, 0, 3)
  if (mode === 0) {
    const meters = int(rng, 2, 30) / 2
    const answer = meters * 100
    return draftNumeric(contextual ? `Uma fita tem ${formatNumber(meters, 1)} m. Quantos centímetros ela tem?` : `Converta ${formatNumber(meters, 1)} m em centímetros.`, answer, [`1 m = 100 cm.`, `${formatNumber(meters, 1)} × 100 = ${formatNumber(answer)} cm.`], rng, { unit: ' cm', contextual })
  }
  if (mode === 1) {
    const kg = int(rng, 1, 12) / 2
    const answer = kg * 1000
    return draftNumeric(contextual ? `Um pacote de arroz tem ${formatNumber(kg, 1)} kg. Quantos gramas ele tem?` : `Converta ${formatNumber(kg, 1)} kg em gramas.`, answer, [`1 kg = 1 000 g.`, `${formatNumber(kg, 1)} × 1 000 = ${formatNumber(answer)} g.`], rng, { unit: ' g', contextual })
  }
  if (mode === 2) {
    const ml = int(rng, 1, 8) * 250
    const answer = ml / 1000
    return draftNumeric(contextual ? `Uma garrafa contém ${formatNumber(ml)} mL. Quantos litros isso representa?` : `Converta ${formatNumber(ml)} mL em litros.`, answer, [`1 L = 1 000 mL.`, `${formatNumber(ml)} ÷ 1 000 = ${formatNumber(answer, 2)} L.`], rng, { unit: ' L', decimals: 2, contextual })
  }
  const minutes = int(rng, 1, 3) * 60 + int(rng, 5, 55)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const answer = `${hours} h ${rest} min`
  return {
    prompt: contextual ? `Uma aula durou ${minutes} minutos. Quantas horas e minutos isso representa?` : `Converta ${minutes} minutos em horas e minutos.`,
    answer,
    steps: [`1 hora tem 60 minutos.`, `${minutes} ÷ 60 = ${hours} com resto ${rest}.`, `Portanto, ${hours} h ${rest} min.`],
    options: [answer, `${hours} h ${rest + 5} min`, `${hours + 1} h ${rest} min`, `${hours} h ${Math.max(0, rest - 5)} min`],
    correctIndex: 0,
  }
}

function genStats(rng: Rng, difficulty: Difficulty, contextual: boolean): Draft {
  const count = difficulty === 'facil' ? 5 : 6
  const values = shuffle(rng, [4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20]).slice(0, count)
  const mode = int(rng, 0, 2)
  if (mode === 0) {
    const sum = values.reduce((acc, value) => acc + value, 0)
    const answer = Number((sum / count).toFixed(2))
    return draftNumeric(contextual ? `As notas de uma equipe foram ${values.join(', ')}. Qual é a média?` : `Calcule a média dos valores: ${values.join(', ')}.`, answer, [`Somamos: ${values.join(' + ')} = ${sum}.`, `Dividimos pela quantidade: ${sum} ÷ ${count} = ${formatNumber(answer, 2)}.`], rng, { decimals: 2, contextual })
  }
  if (mode === 1) {
    const sorted = [...values].sort((a, b) => a - b)
    const answer = sorted[Math.floor(count / 2)]
    return draftNumeric(contextual ? `Os tempos registrados foram ${values.join(', ')} s. Qual é a mediana?` : `Determine a mediana de: ${values.join(', ')}.`, answer, [`Ordenamos: ${sorted.join(', ')}.`, `Com ${count} valores, o valor central é ${answer}.`], rng, { contextual })
  }
  const repeated = pick(rng, values)
  const data = [...values, repeated].sort((a, b) => a - b)
  return draftNumeric(contextual ? `As faltas registradas em uma semana foram ${data.join(', ')}. Qual é a moda?` : `Determine a moda de: ${data.join(', ')}.`, repeated, [`A moda é o valor que mais aparece.`, `O valor ${repeated} aparece duas vezes; os demais, uma vez.`, `A moda é ${repeated}.`], rng, { contextual })
}

function genProbability(rng: Rng, contextual: boolean): Draft {
  const red = int(rng, 2, 6)
  const blue = int(rng, 2, 6)
  const green = int(rng, 1, 4)
  const total = red + blue + green
  const numerator = red
  const answer = simplifiedFraction(numerator, total)
  const distractors = [simplifiedFraction(blue, total), simplifiedFraction(green, total), simplifiedFraction(total - numerator, total)]
  return {
    prompt: contextual
      ? `Uma urna tem ${red} bolas vermelhas, ${blue} azuis e ${green} verdes. Retirando uma bola ao acaso, qual é a probabilidade de ser vermelha?`
      : `Em uma urna há ${red} bolas vermelhas, ${blue} azuis e ${green} verdes. Qual é a probabilidade de retirar uma vermelha?`,
    answer,
    steps: [`Casos favoráveis: ${red} bolas vermelhas.`, `Casos possíveis: ${total} bolas.`, `P = ${red}/${total} = ${answer}.`],
    ...optionsFor(answer, distractors, rng),
  }
}

function genRatio(rng: Rng, contextual: boolean): Draft {
  const people = int(rng, 2, 6)
  const cups = people * int(rng, 1, 3)
  const newPeople = people * int(rng, 2, 4)
  const answer = (cups / people) * newPeople
  return draftNumeric(
    contextual ? `Uma receita usa ${cups} xícaras de farinha para ${people} porções. Mantendo a proporção, quantas xícaras serão necessárias para ${newPeople} porções?` : `Se ${cups} xícaras servem ${people} porções, quantas servem ${newPeople}?`,
    answer,
    [`A razão é ${cups}/${people} = ${formatNumber(cups / people, 2)} xícara por porção.`, `Multiplicamos por ${newPeople}: ${formatNumber(cups / people, 2)} × ${newPeople} = ${answer}.`],
    rng,
    { unit: ' xícaras', contextual },
  )
}

function genFunctions(rng: Rng, contextual: boolean): Draft {
  const a = int(rng, 2, 6)
  const b = int(rng, -8, 12)
  const x = int(rng, 1, 8)
  const answer = a * x + b
  const expression = `f(x) = ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}`
  return draftNumeric(
    contextual ? `O valor de uma corrida é dado por ${expression}, em que x é a distância em km. Qual é o valor para x = ${x}?` : `Dada ${expression}, calcule f(${x}).`,
    answer,
    [`Substituímos x por ${x}: f(${x}) = ${a} × ${x} ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}.`, `f(${x}) = ${a * x} ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} = ${answer}.`],
    rng,
    { unit: contextual ? ' reais' : '', contextual },
  )
}

function genFinance(rng: Rng, contextual: boolean): Draft {
  if (rng() > 0.5) {
    const price = pick(rng, [80, 120, 150, 200, 240, 300])
    const discount = pick(rng, [10, 15, 20, 25, 30])
    const answer = (price * discount) / 100
    return draftNumeric(contextual ? `Um tênis custa R$ ${price} e está com ${discount}% de desconto. Qual é o valor do desconto?` : `Calcule ${discount}% de R$ ${price}.`, answer, [`${discount}% = ${discount}/100.`, `${discount}/100 × ${price} = ${formatNumber(answer, 2)}.`], rng, { unit: ' reais', decimals: 2, contextual })
  }
  const capital = pick(rng, [500, 800, 1000, 1200, 2000])
  const rate = pick(rng, [1, 2, 3, 5])
  const time = int(rng, 2, 8)
  const answer = (capital * rate * time) / 100
  return draftNumeric(contextual ? `Um investimento de R$ ${capital} rende juros simples de ${rate}% ao mês por ${time} meses. Qual é o total de juros?` : `Calcule os juros simples de R$ ${capital} a ${rate}% ao mês por ${time} meses.`, answer, [`J = C × i × t, com i = ${rate}/100.`, `J = ${capital} × ${formatNumber(rate / 100, 2)} × ${time}.`, `J = ${formatNumber(answer, 2)}.`], rng, { unit: ' reais', decimals: 2, contextual })
}

// ---------------------------------------------------------------------------
// Conversion and composition
// ---------------------------------------------------------------------------

function makeTrueFalse(rng: Rng, year: number, difficulty: Difficulty, contextual: boolean): Draft {
  const a = int(rng, 5, difficulty === 'facil' ? 20 : 60)
  const b = int(rng, 2, difficulty === 'facil' ? 10 : 40)
  const actual = a + b
  const shown = rng() > 0.5 ? actual : actual + int(rng, 1, 3)
  const isTrue = shown === actual
  return {
    prompt: `A igualdade ${a} + ${b} = ${shown} é verdadeira ou falsa?`,
    answer: isTrue ? 'Verdadeira' : 'Falsa',
    steps: [`Calculamos ${a} + ${b} = ${actual}.`, `Como ${actual} ${isTrue ? 'é igual a' : 'é diferente de'} ${shown}, a igualdade é ${isTrue ? 'verdadeira' : 'falsa'}.`],
    options: ['Verdadeira', 'Falsa', 'Não é possível saber', 'Depende do valor de x'],
    correctIndex: isTrue ? 0 : 1,
  }
}

function makeAssociation(rng: Rng, year: number): Draft {
  const base = year <= 5 ? 10 : 20
  const pairs = Array.from({ length: 4 }, (_, index) => {
    const a = int(rng, 2, base)
    const b = int(rng, 2, base)
    return { expression: `${a} + ${b}`, value: a + b, label: String.fromCharCode(73 + index) }
  })
  const shuffledAnswers = shuffle(rng, pairs.map((pair) => pair.value))
  const correct = pairs.map((pair) => `${pair.label} – ${shuffledAnswers.indexOf(pair.value) + 1}`).join('; ')
  return {
    prompt: `Relacione cada expressão ao seu resultado:\n${pairs.map((pair) => `(${pair.label}) ${pair.expression}`).join('\n')}\n\nResultados:\n${shuffledAnswers.map((value, index) => `(${index + 1}) ${value}`).join('\n')}`,
    answer: correct,
    steps: pairs.map((pair) => `${pair.expression} = ${pair.value}.`),
  }
}

function applyKind(
  draft: Draft,
  kind: QuestionKind,
  rng: Rng,
  year: number,
  difficulty: Difficulty,
  contextual: boolean,
  topicId: string,
): Draft {
  if (kind === 'multipla') {
    if (draft.options && draft.correctIndex !== undefined) return draft
    const numeric = Number(draft.answer.replace(/[^\d,.-]/g, '').replace(',', '.'))
    if (Number.isFinite(numeric)) {
      return { ...draft, ...optionsFor(draft.answer, distractorsAround(numeric, rng, draft.answer.includes(',') ? 2 : 0), rng) }
    }
    return { ...draft, options: [draft.answer, 'Não é possível calcular', 'Nenhuma das alternativas', 'Todas as anteriores'], correctIndex: 0 }
  }
  if (kind === 'vf') return makeTrueFalse(rng, year, difficulty, contextual)
  if (kind === 'associacao') return makeAssociation(rng, year)
  if (kind === 'lacunas') {
    return {
      ...draft,
      prompt: `${draft.prompt}\n\nComplete: ____________________`,
      options: undefined,
      correctIndex: undefined,
    }
  }
  return { ...draft, options: undefined, correctIndex: undefined }
}

export function generateDraft(
  topicId: string,
  year: number,
  difficulty: Difficulty,
  rng: Rng,
  contextual = false,
): Draft {
  switch (topicId) {
    case 'numeros':
      return genNumbers(year, difficulty, rng, contextual)
    case 'adicao-subtracao':
      return genAddSub(year, difficulty, rng, contextual)
    case 'multiplicacao-divisao':
      return genMulDiv(year, difficulty, rng, contextual)
    case 'tabuada':
      return genTabuada(rng, contextual)
    case 'fracoes':
      return genFractions(rng, year, contextual)
    case 'decimais':
      return genDecimals(rng, difficulty, contextual)
    case 'porcentagem':
      return genPercentage(rng, contextual)
    case 'equacoes':
      return genEquations(rng, difficulty, contextual)
    case 'expressoes':
      return genExpressions(rng, difficulty, contextual)
    case 'potenciacao':
      return genPowers(rng, difficulty, contextual)
    case 'radiciacao':
      return genRoots(rng, difficulty, contextual)
    case 'geometria-plana':
      return genPlane(rng, difficulty, contextual)
    case 'geometria-espacial':
      return genSpatial(rng, difficulty, contextual)
    case 'grandezas-medidas':
      return genMeasures(rng, contextual)
    case 'estatistica':
      return genStats(rng, difficulty, contextual)
    case 'probabilidade':
      return genProbability(rng, contextual)
    case 'razao-proporcao':
      return genRatio(rng, contextual)
    case 'funcoes':
      return genFunctions(rng, contextual)
    case 'matematica-financeira':
      return genFinance(rng, contextual)
    default:
      return genAddSub(year, difficulty, rng, contextual)
  }
}

export function detectShapeFromText(text: string, topic?: string): QuestionFigureData | undefined {
  if (!text) return undefined
  const t = text.toLowerCase()
  const isGeometry =
    topic === 'geometria-plana' ||
    topic === 'geometria-espacial' ||
    t.includes('área') ||
    t.includes('area') ||
    t.includes('perímetro') ||
    t.includes('perimetro') ||
    t.includes('volume') ||
    t.includes('figura') ||
    t.includes('triângulo') ||
    t.includes('retângulo') ||
    t.includes('quadrado') ||
    t.includes('círculo') ||
    t.includes('losango') ||
    t.includes('trapézio') ||
    t.includes('cubo') ||
    t.includes('cilindro')

  if (!isGeometry) return undefined

  const extractNum = (pattern: RegExp) => {
    const match = text.match(pattern)
    if (!match) return undefined
    const clean = match[1]?.replace(',', '.')
    const val = parseFloat(clean ?? '')
    return Number.isFinite(val) ? val : undefined
  }

  const isMeter = text.includes(' m ') || text.includes(' m.') || text.includes(' m,') || text.includes(' metros')
  const unit = isMeter ? 'm' : 'cm'

  // Triângulo
  if (t.includes('triângulo') || t.includes('triangulo') || t.includes('triangular')) {
    const base = extractNum(/base\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 8
    const height = extractNum(/altura\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 6
    return { shape: 'triangulo', dimensions: { base, height, unit } }
  }

  // Trapézio
  if (t.includes('trapézio') || t.includes('trapezio')) {
    const bMayor = extractNum(/base\s*maior\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 10
    const bMinor = extractNum(/base\s*menor\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 6
    const height = extractNum(/altura\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 5
    return { shape: 'trapezio', dimensions: { base: bMayor, side: bMinor, height, unit } }
  }

  // Losango
  if (t.includes('losango')) {
    const dMayor = extractNum(/diagonal\s*maior\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 8
    const dMinor = extractNum(/diagonal\s*menor\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 5
    return { shape: 'losango', dimensions: { diagonalMajor: dMayor, diagonalMinor: dMinor, unit } }
  }

  // Quadrado
  if (t.includes('quadrado') || t.includes('quadrada')) {
    const side = extractNum(/(?:lado|aresta)\s*(?:de\s*|medindo\s*)?(\d+(?:[.,]\d+)?)/i) || 6
    return { shape: 'quadrado', dimensions: { side, unit } }
  }

  // Retângulo
  if (t.includes('retângulo') || t.includes('retangulo') || t.includes('retangular')) {
    const base = extractNum(/(?:base|comprimento)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 10
    const height = extractNum(/(?:altura|largura)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 5
    return { shape: 'retangulo', dimensions: { base, height, unit } }
  }

  // Círculo
  if (t.includes('círculo') || t.includes('circulo') || t.includes('circular') || t.includes('circunferência') || t.includes('circunferencia')) {
    const radius = extractNum(/raio\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 4
    return { shape: 'circulo', dimensions: { radius, unit } }
  }

  // Cubo
  if (t.includes('cubo') || t.includes('cúbica') || t.includes('cubica')) {
    const side = extractNum(/(?:aresta|lado)\s*(?:de\s*|medindo\s*)?(\d+(?:[.,]\d+)?)/i) || 5
    return { shape: 'cubo', dimensions: { side, unit } }
  }

  // Paralelepípedo
  if (t.includes('paralelepípedo') || t.includes('paralelepipedo')) {
    const numbers = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:cm|m)/gi)].map((m) => parseFloat(m[1].replace(',', '.')))
    return {
      shape: 'paralelepipedo',
      dimensions: {
        base: numbers[0] || 8,
        height: numbers[1] || 5,
        depth: numbers[2] || 4,
        unit,
      },
    }
  }

  // Cilindro
  if (t.includes('cilindro') || t.includes('cilíndrico') || t.includes('cilindrico') || t.includes('cilíndrica') || t.includes('cilindrica')) {
    const radius = extractNum(/raio\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 3
    const height = extractNum(/altura\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 8
    return { shape: 'cilindro', dimensions: { radius, height, unit } }
  }

  // Cone
  if (t.includes('cone') || t.includes('cônico') || t.includes('conico')) {
    const radius = extractNum(/raio\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 3
    const height = extractNum(/altura\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 7
    return { shape: 'cone', dimensions: { radius, height, unit } }
  }

  // Pirâmide
  if (t.includes('pirâmide') || t.includes('piramide')) {
    const base = extractNum(/(?:base|lado)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 6
    const height = extractNum(/altura\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/i) || 8
    return { shape: 'piramide', dimensions: { base, height, unit } }
  }

  return undefined
}

export function makeQuestion(
  draft: Draft,
  topicId: string,
  kind: QuestionKind,
  skillCode?: string,
  points = 1,
): Question {
  const figure = draft.figure || detectShapeFromText(draft.prompt, topicId)
  return {
    id: uid('q'),
    kind,
    prompt: draft.prompt,
    options: draft.options,
    correctIndex: draft.correctIndex,
    answer: draft.answer,
    steps: draft.steps,
    topic: topicId,
    skillCode,
    points,
    context: draft.context,
    figure,
  }
}

export function generateQuestion(
  topicId: string,
  year: number,
  difficulty: Difficulty,
  rng: Rng,
  kind: QuestionKind = 'multipla',
  contextual = false,
  skillCode?: string,
  points = 1,
): Question {
  const draft = generateDraft(topicId, year, difficulty, rng, contextual)
  const adjusted = applyKind(draft, kind, rng, year, difficulty, contextual, topicId)
  return makeQuestion(adjusted, topicId, kind, skillCode, points)
}

export function generateQuestions(config: ExerciseConfig): Question[] {
  const rng = createRng(config.seed)
  const kinds = config.kinds.length ? config.kinds : (['multipla'] as QuestionKind[])
  return Array.from({ length: config.count }, (_, index) => {
    const kind = kinds[index % kinds.length]
    return generateQuestion(
      config.topic,
      config.year,
      config.difficulty,
      rng,
      kind,
      config.contextualized,
      config.skillCode || undefined,
    )
  })
}

export function generateVariants(config: ExerciseConfig): { label: string; questions: Question[] }[] {
  return Array.from({ length: Math.max(1, config.variants) }, (_, index) => ({
    label: String.fromCharCode(65 + index),
    questions: generateQuestions({ ...config, seed: config.seed + index * 997 }),
  }))
}

export function generateGameQuestions(
  topicId: string,
  year: number,
  difficulty: Difficulty,
  seed: number,
  count = 10,
  contextual = true,
): Question[] {
  const rng = createRng(seed)
  return Array.from({ length: count }, () =>
    generateQuestion(topicId, year, difficulty, rng, 'multipla', contextual),
  )
}

export interface MemoryPair {
  id: string
  prompt: string
  answer: string
}

export function generateMemoryPairs(
  topicId: string,
  year: number,
  difficulty: Difficulty,
  seed: number,
  count = 8,
): MemoryPair[] {
  const rng = createRng(seed)
  const used = new Set<string>()
  const pairs: MemoryPair[] = []
  let attempts = 0
  while (pairs.length < count && attempts < count * 20) {
    attempts += 1
    const draft = generateDraft(topicId, year, difficulty, rng, false)
    const key = `${draft.prompt}__${draft.answer}`
    if (used.has(key)) continue
    used.add(key)
    pairs.push({ id: uid('pair'), prompt: draft.prompt, answer: draft.answer })
  }
  return pairs
}

export interface BingoEntry {
  id: string
  expression: string
  result: number
}

export function generateBingoEntries(seed: number, difficulty: Difficulty, count = 30): BingoEntry[] {
  const rng = createRng(seed)
  const results = new Set<number>()
  const entries: BingoEntry[] = []
  const max = difficulty === 'facil' ? 20 : difficulty === 'medio' ? 50 : 100
  let guard = 0
  while (entries.length < count && guard < 1000) {
    guard += 1
    const a = int(rng, 2, Math.max(5, Math.floor(max / 2)))
    const b = int(rng, 1, Math.max(3, Math.floor(max / 3)))
    const result = a + b
    if (result > max || results.has(result)) continue
    results.add(result)
    entries.push({ id: uid('bingo'), expression: `${a} + ${b}`, result })
  }
  return entries
}

export function generateNumberHunt(
  topicId: string,
  year: number,
  difficulty: Difficulty,
  seed: number,
): { target: Question; grid: { value: number; correct: boolean }[] } {
  const rng = createRng(seed)
  const question = generateQuestion(topicId, year, difficulty, rng, 'multipla', false)
  const answerNumber = Number(question.answer.replace(/[^\d,.-]/g, '').replace(',', '.'))
  const grid: { value: number; correct: boolean }[] = []
  const used = new Set<number>()
  if (Number.isFinite(answerNumber)) {
    grid.push({ value: answerNumber, correct: true })
    used.add(answerNumber)
  }
  while (grid.length < 16) {
    const value = Math.max(0, Math.round(answerNumber || 10) + int(rng, -30, 30))
    if (used.has(value)) continue
    used.add(value)
    grid.push({ value, correct: false })
  }
  return { target: question, grid: shuffle(rng, grid) }
}

export function generateFractionPizza(
  seed: number,
): { numerator: number; denominator: number; options: string[]; answer: string }[] {
  const rng = createRng(seed)
  return Array.from({ length: 6 }, () => {
    const denominator = pick(rng, [2, 3, 4, 5, 6, 8])
    const numerator = int(rng, 1, denominator - 1)
    const answer = `${numerator}/${denominator}`
    const options = shuffle(rng, [
      answer,
      `${Math.min(denominator, numerator + 1)}/${denominator}`,
      `${numerator}/${Math.min(8, denominator + 1)}`,
      `${Math.max(1, numerator - 1)}/${denominator}`,
    ])
    return { numerator, denominator, options, answer }
  })
}

export function topicLabelForGame(topicId: string): string {
  return getTopic(topicId).shortName
}
