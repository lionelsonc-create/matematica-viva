/* =========================================================
   BANCO DE CONTEÚDOS — séries 6, 7 e 8 (Fundamental II)
   ========================================================= */
const CONTEUDOS = {

  /* ---------------- 6º ANO ---------------- */
  "6": {
    naturais: {
      titulo: 'Soma e subtração de números naturais',
      area: 'Números',
      objetivo: 'Somar e subtrair números naturais até o milhar, aplicando a propriedade associativa e a regra do agrupamento.',
      explicacao: [
        'Para somar ou subtrair vários números, alinhe os algarismos pelas casas: unidades, dezenas, centenas e milhares. Assim cada coluna é trabalhada separadamente, sempre da direita para a esquerda.',
        'A propriedade associativa permite agrupar os números da forma mais conveniente: $(a+b)+c=a+(b+c)$. Isso facilita fazer contas de cabeça e conferir resultados.',
        'Quando uma coluna soma mais que 9, escrevemos apenas o dígito das unidades e levamos a dezena para a coluna seguinte. Esse procedimento é o <strong>agrupamento</strong> — o famoso “vai um”.'
      ],
      figura: 'reta',
      exemplo: {
        titulo: 'Exemplo: 348 + 157 − 62',
        passos: [
          'Some as unidades: $8+7=15$. Escreva 5 e leve 1 para a coluna das dezenas.',
          'Dezenas: $4+5+1=10$. Escreva 0 e leve 1. Centenas: $3+1+1=5$. Logo, $348+157=505$.',
          'Agora subtraia 62: nas unidades $5-2=3$; nas dezenas empreste uma centena e faça $10-6=4$; sobra 4 nas centenas.'
        ],
        resultado: '348 + 157 − 62 = 443'
      },
      exercicio: { tipo: 'soma-naturais', dica: 'Alinhe as casas e processe coluna a coluna, começando pelas unidades.' }
    },

    fracoes: {
      titulo: 'Frações: leitura e soma com mesmo denominador',
      area: 'Números',
      objetivo: 'Ler, representar e somar frações com o mesmo denominador, compreendendo o significado do numerador e do denominador.',
      explicacao: [
        'Uma fração $\\frac{a}{b}$ divide um inteiro em $b$ partes iguais e toma $a$ delas. O denominador $b$ diz em quantas partes o inteiro foi dividido; o numerador $a$ indica quantas partes tomamos.',
        'Quando as frações têm o mesmo denominador, elas se referem a partes do mesmo tamanho. Basta somar os numeradores e manter o denominador: $\\frac{a}{b}+\\frac{c}{b}=\\frac{a+c}{b}$.',
        'Depois de somar, verifique se a fração pode ser simplificada, dividindo numerador e denominador pelo mesmo número.'
      ],
      figura: 'fracao',
      exemplo: {
        titulo: 'Exemplo: 2/7 + 3/7',
        passos: [
          'Os denominadores são iguais ($7$), então as partes têm o mesmo tamanho.',
          'Some os numeradores: $2+3=5$.',
          'Mantenha o denominador: $7$.'
        ],
        resultado: '$\\frac{2}{7}+\\frac{3}{7}=\\frac{5}{7}$'
      },
      exercicio: { tipo: 'soma-fracoes', dica: 'Some os números de cima e mantenha o número de baixo.' }
    },

    geometria: {
      titulo: 'Perímetro e área do retângulo',
      area: 'Geometria',
      objetivo: 'Calcular perímetro e área de retângulos, usando as fórmulas e as unidades corretas.',
      explicacao: [
        'O perímetro é a soma de todos os lados de uma figura. No retângulo, como os lados opostos são iguais, temos $P=2a+2b=2(a+b)$.',
        'A área é a superfície ocupada pela figura e se obtém multiplicando base pela altura: $A=a\\cdot b$. O perímetro é medido em unidades de comprimento (cm, m) e a área em unidades quadradas (cm², m²).',
        'Atenção às unidades: se os lados estão em metros, o perímetro sai em metros e a área em metros quadrados.'
      ],
      figura: 'retangulo',
      exemplo: {
        titulo: 'Exemplo: retângulo de 7 cm por 4 cm',
        passos: [
          'Perímetro: $P=2(7+4)=2\\cdot 11=22$ cm.',
          'Área: $A=7\\cdot 4=28$ cm².'
        ],
        resultado: 'P = 22 cm e A = 28 cm²'
      },
      exercicio: { tipo: 'retangulo', dica: 'Perímetro soma os lados; área multiplica base por altura.' }
    },

    equacoes: {
      titulo: 'Equações simples do primeiro grau',
      area: 'Álgebra',
      objetivo: 'Resolver equações simples do tipo x + b = c isolando a incógnita com a operação inversa.',
      explicacao: [
        'Uma equação é uma igualdade que contém uma incógnita, geralmente representada por $x$. Resolver a equação significa encontrar o valor que torna a igualdade verdadeira.',
        'Para isolar $x$, aplique a operação inversa nos dois lados da igualdade. Em $x+b=c$, subtraímos $b$ em ambos os lados: $x=c-b$.',
        'Sempre confira a resposta substituindo o valor encontrado na equação original — se os dois lados ficarem iguais, está certo.'
      ],
      figura: 'equacao',
      exemplo: {
        titulo: 'Exemplo: x + 7 = 15',
        passos: [
          'Subtraia 7 dos dois lados: $x+7-7=15-7$.',
          'Simplifique: $x=8$.',
          'Conferindo: $8+7=15$ ✓'
        ],
        resultado: '$x=8$'
      },
      exercicio: { tipo: 'equacao-simples', dica: 'Faça a operação inversa para deixar o x sozinho.' }
    }
  },

  /* ---------------- 7º ANO ---------------- */
  "7": {
    racionais: {
      titulo: 'Números racionais na reta numérica',
      area: 'Números',
      objetivo: 'Reconhecer números racionais e localizá-los na reta numérica, incluindo negativos e frações.',
      explicacao: [
        'Um número é racional quando pode ser escrito como $\\frac{p}{q}$, com $p$ e $q$ inteiros e $q\\neq 0$. Assim, $3=\\frac{3}{1}$, $0{,}5=\\frac{1}{2}$ e $-\\frac{2}{5}$ são racionais.',
        'Na reta numérica, os negativos ficam à esquerda do zero e os positivos à direita. Quanto mais à direita, maior o número.',
        'Para comparar frações com denominadores diferentes, iguale os denominadores ou converta-as para decimal.'
      ],
      figura: 'reta',
      exemplo: {
        titulo: 'Exemplo: comparar −1/2 e 0,4',
        passos: [
          'Converta a fração para decimal: $-\\frac{1}{2}=-0{,}5$.',
          'Como $-0{,}5<0{,}4$, concluímos que $-\\frac{1}{2}<0{,}4$.'
        ],
        resultado: '$-\\frac{1}{2}<0{,}4$'
      },
      exercicio: { tipo: 'racionais', dica: 'Todo número que pode virar fração de inteiros é racional.' }
    },

    proporcao: {
      titulo: 'Razão, proporção e escala',
      area: 'Números',
      objetivo: 'Resolver situações de proporção e escala usando razões e regra de três.',
      explicacao: [
        'Razão é a comparação entre duas grandezas, escrita como $3:4$ ou $\\frac{3}{4}$. Ela indica quantas vezes uma grandeza contém a outra.',
        'Proporção é uma igualdade entre duas razões: $\\frac{a}{b}=\\frac{c}{d}$. Para resolver, use a regra de três: $a\\cdot d=b\\cdot c$.',
        'Escala é a proporção entre o tamanho no desenho e o tamanho real. Na escala $1:50$, cada 1 cm do desenho representa 50 cm na realidade.'
      ],
      figura: 'escala',
      exemplo: {
        titulo: 'Exemplo: escala 1 : 50 e 4 cm no desenho',
        passos: [
          'Monte a proporção: $\\frac{1}{50}=\\frac{4}{x}$.',
          'Cruze os termos: $x=4\\cdot 50=200$.',
          'Convertendo: 200 cm = 2 m.'
        ],
        resultado: 'x = 200 cm = 2 m'
      },
      exercicio: { tipo: 'proporcao', dica: 'Monte a proporção e resolva multiplicando em cruz.' }
    },

    angulos: {
      titulo: 'Ângulos e suas classificações',
      area: 'Geometria',
      objetivo: 'Medir, classificar e calcular ângulos complementares e suplementares.',
      explicacao: [
        'Ângulo é a abertura entre duas semi-retas com a mesma origem, medida em graus ($^\\circ$).',
        'Classificação: agudo (menor que $90^\\circ$), reto ($=90^\\circ$), obtuso (entre $90^\\circ$ e $180^\\circ$) e raso ($=180^\\circ$).',
        'Ângulos complementares somam $90^\\circ$ e ângulos suplementares somam $180^\\circ$.'
      ],
      figura: 'angulo',
      exemplo: {
        titulo: 'Exemplo: ângulo complementar de 38°',
        passos: [
          'Complementares somam $90^\\circ$.',
          'Calcule: $90^\\circ-38^\\circ=52^\\circ$.'
        ],
        resultado: '52°'
      },
      exercicio: { tipo: 'angulos', dica: 'Complementares somam 90°; suplementares somam 180°.' }
    },

    porcentagem: {
      titulo: 'Porcentagem: cálculo e interpretação',
      area: 'Números',
      objetivo: 'Calcular e interpretar porcentagens em contextos do dia a dia.',
      explicacao: [
        'Porcentagem significa “por cada cem”. Calcular $70\\%$ de 200 é o mesmo que calcular $\\frac{70}{100}\\cdot 200$.',
        'A fórmula rápida é $\\text{parte}=\\frac{\\text{taxa}}{100}\\cdot\\text{total}$.',
        'Para descobrir que porcentagem um número é de outro, use $\\frac{\\text{parte}}{\\text{total}}\\cdot 100$.'
      ],
      figura: 'porcentagem',
      exemplo: {
        titulo: 'Exemplo: 35% de 400',
        passos: [
          'Escreva como fração: $\\frac{35}{100}\\cdot 400$.',
          'Multiplique: $0{,}35\\cdot 400=140$.'
        ],
        resultado: '35% de 400 = 140'
      },
      exercicio: { tipo: 'porcentagem', dica: 'Divida a taxa por 100 e multiplique pelo total.' }
    }
  },

  /* ---------------- 8º ANO ---------------- */
  "8": {
    equacoes: {
      titulo: 'Equações do primeiro grau com coeficiente',
      area: 'Álgebra',
      objetivo: 'Resolver equações com coeficiente e termos constantes, verificando a solução encontrada.',
      explicacao: [
        'Uma equação do primeiro grau tem a forma $ax+b=c$, com $a\\neq 0$. O objetivo é deixar a incógnita sozinha de um lado.',
        'Isole o termo com $x$ subtraindo $b$ dos dois lados e depois divida por $a$: $x=\\frac{c-b}{a}$.',
        'Multiplicar ou dividir os dois lados da igualdade por um mesmo número (diferente de zero) não altera a solução.'
      ],
      figura: 'equacao',
      exemplo: {
        titulo: 'Exemplo: 3x + 6 = 15',
        passos: [
          'Subtraia 6 dos dois lados: $3x=15-6=9$.',
          'Divida ambos os lados por 3: $x=\\frac{9}{3}=3$.',
          'Conferindo: $3\\cdot 3+6=15$ ✓'
        ],
        resultado: '$x=3$'
      },
      exercicio: { tipo: 'equacao-1grau', dica: 'Isole o termo com x e depois divida pelo coeficiente.' }
    },

    pitagoras: {
      titulo: 'Teorema de Pitágoras',
      area: 'Geometria',
      objetivo: 'Relacionar os lados de um triângulo retângulo e calcular a hipotenusa.',
      explicacao: [
        'Em todo triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos: $c^2=a^2+b^2$.',
        'A hipotenusa é sempre o lado mais longo e fica oposta ao ângulo reto; os catetos são os lados que formam o ângulo reto.',
        'Para encontrar um cateto, isole-o: $a=\\sqrt{c^2-b^2}$.'
      ],
      figura: 'triangulo',
      exemplo: {
        titulo: 'Exemplo: catetos 3 e 4',
        passos: [
          'Monte a fórmula: $c^2=3^2+4^2=9+16=25$.',
          'Tire a raiz: $c=\\sqrt{25}=5$.'
        ],
        resultado: 'c = 5'
      },
      exercicio: { tipo: 'pitagoras', dica: 'Some os quadrados dos catetos e tire a raiz quadrada.' }
    },

    funcoes: {
      titulo: 'Função do primeiro grau e seu gráfico',
      area: 'Funções',
      objetivo: 'Identificar coeficiente angular e linear e traçar o gráfico de uma função do 1º grau.',
      explicacao: [
        'Uma função do primeiro grau tem a forma $f(x)=ax+b$ e seu gráfico é uma reta.',
        'O coeficiente $a$ é a inclinação da reta: se $a>0$ a reta sobe da esquerda para a direita; se $a<0$, ela desce. O valor $b$ é o ponto em que a reta corta o eixo $y$.',
        'Para traçar a reta, basta calcular dois pontos, por exemplo $f(0)=b$ e $f(1)=a+b$.'
      ],
      figura: 'retaGrafico',
      exemplo: {
        titulo: 'Exemplo: f(x) = 1,2x − 1, calcular f(2)',
        passos: [
          'Substitua $x$ por 2: $f(2)=1{,}2\\cdot 2-1$.',
          'Multiplique: $f(2)=2{,}4-1=1{,}4$.'
        ],
        resultado: '$f(2)=1{,}4$'
      },
      exercicio: { tipo: 'funcao-1grau', dica: 'Substitua o valor de x na expressão e resolva a conta.' }
    }
  }
};
