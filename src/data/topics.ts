import type { Stage } from '../lib/types'

export interface Topic {
  id: string
  name: string
  shortName: string
  unit: string
  stages: Stage[]
  years: number[]
  summary: string
  concept: string[]
  formulas: { label: string; value: string }[]
  contexts: string[]
  keywords: string[]
  icon: string
  color: string
  soft: string
}

const ALL: Stage[] = ['EF1', 'EF2', 'EM']

export const TOPICS: Topic[] = [
  {
    id: 'numeros',
    name: 'Números e sistema de numeração',
    shortName: 'Números',
    unit: 'Números',
    stages: ALL,
    years: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    summary: 'Compreender a contagem, a ordem, o valor posicional e as diferentes funções dos números no cotidiano.',
    concept: [
      'Os números podem indicar quantidade, ordem ou código de identificação. O sistema de numeração decimal é posicional: o valor de um algarismo depende do lugar que ele ocupa.',
      'Cada dez unidades de uma ordem formam uma unidade da ordem seguinte. Por isso dizemos que nosso sistema é decimal e posicional.',
    ],
    formulas: [
      { label: 'Valor posicional', value: '2 345 = 2 000 + 300 + 40 + 5' },
      { label: 'Antecessor e sucessor', value: 'n − 1 ← n → n + 1' },
    ],
    contexts: ['Números de casas, placas e camisetas', 'Contagem de materiais da sala', 'Organização de filas e códigos'],
    keywords: ['números naturais', 'sistema de numeração', 'contagem', 'ordem', 'valor posicional'],
    icon: 'Hash',
    color: '#4666ff',
    soft: '#eef1ff',
  },
  {
    id: 'adicao-subtracao',
    name: 'Adição e subtração',
    shortName: 'Adição e subtração',
    unit: 'Números',
    stages: ALL,
    years: [1, 2, 3, 4, 5, 6],
    summary: 'Resolver problemas que envolvem juntar, acrescentar, separar, retirar e comparar quantidades.',
    concept: [
      'A adição está associada às ideias de juntar e acrescentar. A subtração pode significar retirar, comparar ou completar uma quantidade.',
      'Armamos as operações alinhando as ordens: unidades sob unidades, dezenas sob dezenas. Na subtração, quando necessário, fazemos reagrupamentos.',
    ],
    formulas: [
      { label: 'Adição', value: 'a + b = b + a' },
      { label: 'Relação fundamental', value: 'minuendo − subtraendo = diferença' },
    ],
    contexts: ['Compras e troco', 'Coleções de figurinhas', 'Placar de jogos'],
    keywords: ['adição', 'subtração', 'cálculo', 'problemas'],
    icon: 'Plus',
    color: '#0ea5e9',
    soft: '#eaf8ff',
  },
  {
    id: 'multiplicacao-divisao',
    name: 'Multiplicação e divisão',
    shortName: 'Multiplicação e divisão',
    unit: 'Números',
    stages: ALL,
    years: [2, 3, 4, 5, 6, 7],
    summary: 'Compreender a multiplicação como adição de parcelas iguais e a divisão como repartição ou medida.',
    concept: [
      'Multiplicar é calcular o total em grupos de mesma quantidade. Dividir é repartir em partes iguais ou descobrir quantos grupos cabem em uma quantidade.',
      'Multiplicação e divisão são operações inversas. Essa relação ajuda a conferir resultados e resolver equações.',
    ],
    formulas: [
      { label: 'Termos', value: 'fator × fator = produto' },
      { label: 'Divisão', value: 'dividendo = divisor × quociente + resto' },
    ],
    contexts: ['Organização de cadeiras em fileiras', 'Receitas', 'Divisão de materiais entre equipes'],
    keywords: ['multiplicação', 'divisão', 'problemas', 'cálculo'],
    icon: 'X',
    color: '#8b5cf6',
    soft: '#f3efff',
  },
  {
    id: 'tabuada',
    name: 'Tabuadas e cálculo mental',
    shortName: 'Tabuadas',
    unit: 'Números',
    stages: ['EF1', 'EF2'],
    years: [2, 3, 4, 5, 6],
    summary: 'Desenvolver fluência com fatos básicos da multiplicação e estratégias de cálculo mental.',
    concept: [
      'A tabuada reúne fatos básicos que, quando memorizados com compreensão, liberam a atenção para resolver problemas mais complexos.',
      'Usar propriedades ajuda: 6 × 8 = 6 × (4 + 4) = 24 + 24 = 48. A propriedade comutativa também permite usar o fato que já sabemos.',
    ],
    formulas: [
      { label: 'Comutativa', value: 'a × b = b × a' },
      { label: 'Distributiva', value: 'a × (b + c) = a × b + a × c' },
    ],
    contexts: ['Jogos de tabuada', 'Compras de várias unidades', 'Desafios de cálculo mental'],
    keywords: ['multiplicação', 'tabuada', 'cálculo mental'],
    icon: 'Grid3X3',
    color: '#f59e0b',
    soft: '#fff7e6',
  },
  {
    id: 'fracoes',
    name: 'Frações',
    shortName: 'Frações',
    unit: 'Números',
    stages: ALL,
    years: [2, 3, 4, 5, 6, 7],
    summary: 'Representar partes de um todo, comparar frações e operar com diferentes denominadores.',
    concept: [
      'Uma fração representa uma parte de um inteiro ou de uma coleção. O denominador indica em quantas partes iguais o todo foi dividido e o numerador indica quantas partes consideramos.',
      'Para somar ou subtrair frações, os denominadores precisam ser iguais. Podemos encontrar frações equivalentes por meio do mínimo múltiplo comum.',
    ],
    formulas: [
      { label: 'Soma com denominadores iguais', value: 'a/d + b/d = (a + b)/d' },
      { label: 'Fração de uma quantidade', value: 'a/b de N = (N ÷ b) × a' },
    ],
    contexts: ['Receitas e medidas', 'Divisão de pizza', 'Partes de uma coleção'],
    keywords: ['frações', 'fração', 'equivalentes', 'denominador', 'numerador'],
    icon: 'PieChart',
    color: '#ec4899',
    soft: '#fff0f8',
  },
  {
    id: 'decimais',
    name: 'Números decimais',
    shortName: 'Decimais',
    unit: 'Números',
    stages: ALL,
    years: [4, 5, 6, 7],
    summary: 'Ler, comparar e operar com números decimais em contextos de medida e dinheiro.',
    concept: [
      'Os números decimais ampliam o sistema posicional para a direita da vírgula: décimos, centésimos, milésimos. A vírgula separa a parte inteira da parte decimal.',
      'Ao operar, alinhamos as vírgulas. Em multiplicações e divisões, estimar o resultado ajuda a posicionar a vírgula corretamente.',
    ],
    formulas: [
      { label: 'Valor posicional', value: '3,47 = 3 + 0,4 + 0,07' },
      { label: 'Dinheiro', value: 'R$ 12,50 = 12 reais e 50 centavos' },
    ],
    contexts: ['Preços', 'Medidas de comprimento', 'Cronômetros e resultados esportivos'],
    keywords: ['números decimais', 'decimal', 'medidas', 'dinheiro'],
    icon: 'CircleDot',
    color: '#14b8a6',
    soft: '#e8fbf8',
  },
  {
    id: 'porcentagem',
    name: 'Porcentagem',
    shortName: 'Porcentagem',
    unit: 'Números',
    stages: ['EF2', 'EM'],
    years: [5, 6, 7, 8, 9],
    summary: 'Relacionar porcentagem, fração e decimal para resolver problemas de descontos, acréscimos e comparações.',
    concept: [
      'Porcentagem é uma razão com denominador 100. Assim, 25% corresponde a 25/100 = 0,25 e a um quarto de uma quantidade.',
      'Para calcular uma porcentagem de um valor, transformamos a taxa em decimal ou fração e multiplicamos. Descontos e acréscimos podem ser calculados por fatores multiplicativos.',
    ],
    formulas: [
      { label: 'Porcentagem de um valor', value: 'p% de N = (p/100) × N' },
      { label: 'Fator de desconto', value: 'valor final = N × (1 − p/100)' },
    ],
    contexts: ['Promoções e descontos', 'Resultados de pesquisas', 'Juros e economia'],
    keywords: ['porcentagem', 'percentual', 'desconto', 'acréscimo'],
    icon: 'Percent',
    color: '#f97316',
    soft: '#fff3e8',
  },
  {
    id: 'equacoes',
    name: 'Equações do 1º grau',
    shortName: 'Equações',
    unit: 'Álgebra',
    stages: ['EF2', 'EM'],
    years: [6, 7, 8, 9],
    summary: 'Compreender a igualdade como equilíbrio e resolver equações usando operações inversas.',
    concept: [
      'Uma equação é uma igualdade que contém uma incógnita. Resolver significa encontrar o valor que torna a igualdade verdadeira.',
      'A equação funciona como uma balança: toda operação feita em um lado deve ser feita também no outro. Aplicamos operações inversas para isolar a incógnita.',
    ],
    formulas: [
      { label: 'Forma geral', value: 'ax + b = c' },
      { label: 'Isolando x', value: 'x = (c − b) ÷ a' },
    ],
    contexts: ['Problemas de idade', 'Repartição de valores', 'Situações de equilíbrio'],
    keywords: ['equação', 'incógnita', 'álgebra', 'primeiro grau'],
    icon: 'Scale',
    color: '#6366f1',
    soft: '#eef0ff',
  },
  {
    id: 'expressoes',
    name: 'Expressões numéricas',
    shortName: 'Expressões',
    unit: 'Números',
    stages: ['EF2', 'EM'],
    years: [5, 6, 7, 8, 9],
    summary: 'Resolver expressões respeitando a hierarquia das operações e o significado dos símbolos.',
    concept: [
      'Em uma expressão numérica, resolvemos primeiro o que está entre parênteses, depois colchetes e chaves. Entre as operações, potenciação e radiciação vêm antes de multiplicação e divisão, que vêm antes de adição e subtração.',
      'Cada passagem deve manter a igualdade. Organizar o cálculo linha a linha reduz erros.',
    ],
    formulas: [
      { label: 'Ordem', value: '( ) → [ ] → { }' },
      { label: 'Hierarquia', value: 'potências/raízes → × e ÷ → + e −' },
    ],
    contexts: ['Desafios de cálculo', 'Programação e algoritmos', 'Jogos de lógica'],
    keywords: ['expressões numéricas', 'hierarquia', 'parênteses', 'cálculo'],
    icon: 'Braces',
    color: '#0891b2',
    soft: '#e9f9fd',
  },
  {
    id: 'potenciacao',
    name: 'Potenciação',
    shortName: 'Potenciação',
    unit: 'Números',
    stages: ['EF2', 'EM'],
    years: [6, 7, 8, 9],
    summary: 'Compreender a potenciação como multiplicação repetida e operar com propriedades das potências.',
    concept: [
      'Em uma potência aⁿ, a base é o fator que se repete e o expoente indica quantas vezes ele aparece na multiplicação.',
      'As propriedades das potências simplificam cálculos. Cuidado: a soma de potências não é uma potência da soma.',
    ],
    formulas: [
      { label: 'Definição', value: 'aⁿ = a × a × … × a (n fatores)' },
      { label: 'Produto de mesma base', value: 'aᵐ × aⁿ = aᵐ⁺ⁿ' },
      { label: 'Potência de potência', value: '(aᵐ)ⁿ = aᵐ·ⁿ' },
    ],
    contexts: ['Crescimento populacional', 'Áreas e volumes', 'Notação científica'],
    keywords: ['potenciação', 'potência', 'expoente', 'base'],
    icon: 'Superscript',
    color: '#a855f7',
    soft: '#f7efff',
  },
  {
    id: 'radiciacao',
    name: 'Radiciação',
    shortName: 'Radiciação',
    unit: 'Números',
    stages: ['EF2', 'EM'],
    years: [6, 7, 8, 9],
    summary: 'Relacionar raízes à potenciação e resolver problemas com quadrados e cubos perfeitos.',
    concept: [
      'A radiciação é a operação inversa da potenciação. A raiz quadrada de um número é o valor que, elevado ao quadrado, resulta no radicando.',
      'Nem toda raiz é exata. Nesses casos, podemos estimar entre dois quadrados perfeitos ou usar uma calculadora, conforme o objetivo.',
    ],
    formulas: [
      { label: 'Relação fundamental', value: '√a = b ⇔ b² = a (b ≥ 0)' },
      { label: 'Raiz cúbica', value: '∛a = b ⇔ b³ = a' },
    ],
    contexts: ['Medida do lado de um quadrado', 'Teorema de Pitágoras', 'Volumes'],
    keywords: ['radiciação', 'raiz quadrada', 'raiz cúbica'],
    icon: 'SquareRoot',
    color: '#7c3aed',
    soft: '#f2edff',
  },
  {
    id: 'geometria-plana',
    name: 'Geometria plana',
    shortName: 'Geometria plana',
    unit: 'Geometria',
    stages: ALL,
    years: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    summary: 'Reconhecer figuras planas, suas propriedades, perímetros e áreas.',
    concept: [
      'As figuras planas ocupam uma região do plano. Polígonos são formados por segmentos de reta que não se cruzam; a circunferência é o conjunto de pontos que equidistam de um centro.',
      'Perímetro é a medida do contorno. Área é a medida da superfície ocupada. Quadriláteros como retângulo, quadrado, paralelogramo e trapézio têm fórmulas próprias de área.',
    ],
    formulas: [
      { label: 'Retângulo', value: 'A = base × altura' },
      { label: 'Triângulo', value: 'A = (base × altura) ÷ 2' },
      { label: 'Círculo', value: 'A = π × r²' },
      { label: 'Circunferência', value: 'C = 2 × π × r' },
    ],
    contexts: ['Plantas de casas', 'Arte e mosaicos', 'Medidas de terrenos'],
    keywords: ['figuras planas', 'perímetro', 'área', 'geometria'],
    icon: 'Shapes',
    color: '#3b82f6',
    soft: '#edf5ff',
  },
  {
    id: 'geometria-espacial',
    name: 'Geometria espacial',
    shortName: 'Geometria espacial',
    unit: 'Geometria',
    stages: ['EF2', 'EM'],
    years: [4, 5, 6, 7, 8, 9],
    summary: 'Estudar sólidos geométricos, suas faces, arestas, vértices, planificações e volumes.',
    concept: [
      'Os sólidos geométricos ocupam lugar no espaço. Poliedros têm faces planas; corpos redondos têm superfícies curvas.',
      'Volume é a medida do espaço ocupado. Para prismas e cilindros, calculamos área da base × altura. A planificação ajuda a visualizar as faces de um sólido.',
    ],
    formulas: [
      { label: 'Cubo', value: 'V = a³ · A = 6a²' },
      { label: 'Paralelepípedo', value: 'V = a × b × c' },
      { label: 'Cilindro', value: 'V = πr² × h' },
    ],
    contexts: ['Embalagens', 'Construções', 'Planificações e maquetes'],
    keywords: ['sólidos geométricos', 'volume', 'poliedros', 'prismas'],
    icon: 'Box',
    color: '#0d9488',
    soft: '#e8faf7',
  },
  {
    id: 'grandezas-medidas',
    name: 'Grandezas e medidas',
    shortName: 'Medidas',
    unit: 'Grandezas e medidas',
    stages: ALL,
    years: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    summary: 'Medir comprimentos, massas, capacidades, tempos e temperaturas, convertendo unidades.',
    concept: [
      'Medir é comparar uma grandeza com uma unidade. O Sistema Internacional e o sistema métrico decimal organizam as unidades em potências de 10.',
      'Ao converter unidades, multiplicamos ou dividimos por 10, 100 ou 1 000, conforme a relação entre elas. Estimar antes de calcular ajuda a verificar a plausibilidade.',
    ],
    formulas: [
      { label: 'Comprimento', value: '1 m = 100 cm = 1 000 mm' },
      { label: 'Capacidade', value: '1 L = 1 000 mL' },
      { label: 'Massa', value: '1 kg = 1 000 g' },
    ],
    contexts: ['Receitas', 'Transporte e distâncias', 'Construção e medidas corporais'],
    keywords: ['grandezas', 'medidas', 'unidades', 'conversão'],
    icon: 'Ruler',
    color: '#10b981',
    soft: '#eafaf2',
  },
  {
    id: 'estatistica',
    name: 'Estatística',
    shortName: 'Estatística',
    unit: 'Probabilidade e estatística',
    stages: ALL,
    years: [3, 4, 5, 6, 7, 8, 9],
    summary: 'Coletar, organizar, representar e interpretar dados em tabelas e gráficos.',
    concept: [
      'A estatística ajuda a transformar dados em informação. Inicialmente organizamos os dados em tabelas e gráficos; depois calculamos medidas de tendência central.',
      'Média, mediana e moda resumem um conjunto de dados de maneiras diferentes. A escolha depende da pergunta e da distribuição dos valores.',
    ],
    formulas: [
      { label: 'Média', value: 'média = soma dos valores ÷ quantidade' },
      { label: 'Mediana', value: 'valor central dos dados ordenados' },
      { label: 'Moda', value: 'valor que mais se repete' },
    ],
    contexts: ['Pesquisas de turma', 'Gráficos de notícias', 'Dados esportivos'],
    keywords: ['estatística', 'gráficos', 'tabelas', 'média', 'mediana'],
    icon: 'ChartColumn',
    color: '#0ea5e9',
    soft: '#e9f8ff',
  },
  {
    id: 'probabilidade',
    name: 'Probabilidade',
    shortName: 'Probabilidade',
    unit: 'Probabilidade e estatística',
    stages: ALL,
    years: [4, 5, 6, 7, 8, 9],
    summary: 'Compreender o acaso, comparar chances e calcular probabilidades simples.',
    concept: [
      'Probabilidade mede a chance de um evento ocorrer. Em experimentos equiprováveis, calculamos a razão entre casos favoráveis e casos possíveis.',
      'Uma probabilidade pode ser expressa por fração, decimal ou porcentagem. O valor 0 indica evento impossível e 1 (ou 100%) indica evento certo.',
    ],
    formulas: [
      { label: 'Probabilidade', value: 'P(A) = casos favoráveis ÷ casos possíveis' },
      { label: 'Evento complementar', value: 'P(não A) = 1 − P(A)' },
    ],
    contexts: ['Jogos de dado e moeda', 'Sorteios', 'Previsão do tempo'],
    keywords: ['probabilidade', 'acaso', 'chance', 'eventos'],
    icon: 'Dices',
    color: '#f43f5e',
    soft: '#fff0f3',
  },
  {
    id: 'razao-proporcao',
    name: 'Razão, proporção e escalas',
    shortName: 'Razão e proporção',
    unit: 'Números',
    stages: ['EF2', 'EM'],
    years: [6, 7, 8, 9],
    summary: 'Comparar grandezas, resolver proporções e interpretar escalas e receitas.',
    concept: [
      'Razão é uma comparação entre duas grandezas por meio de uma divisão. Proporção é a igualdade entre duas razões.',
      'Em grandezas diretamente proporcionais, ao dobrar uma, a outra também dobra. A regra de três organiza a resolução de proporções.',
    ],
    formulas: [
      { label: 'Razão', value: 'a : b = a/b (b ≠ 0)' },
      { label: 'Proporção', value: 'a/b = c/d ⇔ a × d = b × c' },
    ],
    contexts: ['Receitas', 'Mapas e escalas', 'Velocidade média'],
    keywords: ['razão', 'proporção', 'escala', 'regra de três'],
    icon: 'EqualApproximately',
    color: '#d97706',
    soft: '#fff7e8',
  },
  {
    id: 'funcoes',
    name: 'Funções',
    shortName: 'Funções',
    unit: 'Álgebra',
    stages: ['EF2', 'EM'],
    years: [8, 9],
    summary: 'Relacionar grandezas por meio de funções e interpretar tabelas, gráficos e leis de formação.',
    concept: [
      'Uma função relaciona cada valor de entrada a um único valor de saída. A lei de formação descreve essa relação algebricamente.',
      'Na função afim f(x) = ax + b, a é a taxa de variação e b é o valor inicial. O gráfico é uma reta.',
    ],
    formulas: [
      { label: 'Função afim', value: 'f(x) = ax + b' },
      { label: 'Valor da função', value: 'substituir x na lei de formação' },
    ],
    contexts: ['Tarifas de aplicativos', 'Crescimento de plantas', 'Consumo de água'],
    keywords: ['funções', 'função afim', 'gráfico', 'variável'],
    icon: 'ChartLine',
    color: '#0284c7',
    soft: '#e8f6ff',
  },
  {
    id: 'matematica-financeira',
    name: 'Matemática financeira',
    shortName: 'Educação financeira',
    unit: 'Números',
    stages: ['EF2', 'EM'],
    years: [5, 6, 7, 8, 9],
    summary: 'Resolver problemas de compras, descontos, acréscimos, juros simples e planejamento financeiro.',
    concept: [
      'A matemática financeira conecta porcentagem, razão e proporção a decisões do cotidiano. Comparar preços e analisar descontos exige mais do que calcular: envolve escolha consciente.',
      'Juros simples incidem sempre sobre o valor inicial. O montante é o capital acrescido dos juros.',
    ],
    formulas: [
      { label: 'Juros simples', value: 'J = C × i × t' },
      { label: 'Montante', value: 'M = C + J' },
    ],
    contexts: ['Compras à vista e a prazo', 'Poupança', 'Orçamento familiar'],
    keywords: ['matemática financeira', 'juros', 'desconto', 'dinheiro'],
    icon: 'Wallet',
    color: '#16a34a',
    soft: '#ebfaef',
  },
]

export function getTopic(id: string): Topic {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[0]
}

export function topicsFor(stage: Stage, year: number): Topic[] {
  return TOPICS.filter((topic) => {
    if (!topic.stages.includes(stage)) return false
    if (stage === 'EM') return true
    return topic.years.includes(year)
  })
}

export function topicName(id: string): string {
  return getTopic(id).name
}
