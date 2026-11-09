/* =========================================================
   BANCO DE CONTEÚDOS — 9º ano e Ensino Médio
   ========================================================= */
Object.assign(CONEUDOS, {

  /* ---------------- 9º ANO ---------------- */
  "9": {
    equacoes2: {
      titulo: 'Equações do segundo grau (introdução)',
      area: 'Álgebra',
      objetivo: 'Reconhecer uma equação do 2º grau e encontrar raízes por fatoração.',
      explicacao: [
        'Uma equação do segundo grau tem a forma $ax^2+bx+c=0$, com $a\\neq 0$.',
        'Uma forma de resolver é fatorar: procurar dois números cuja soma seja $b$ e cujo produto seja $c$.',
        'Se $\\Delta=b^2-4ac\\ge 0$, a equação possui duas raízes reais — que podem ser iguais quando $\\Delta=0$.'
      ],
      figura: 'parabola',
      exemplo: {
        titulo: 'Exemplo: x² − 5x + 6 = 0',
        passos: [
          'Procure dois números com soma 5 e produto 6: 2 e 3.',
          'Fatore: $(x-2)(x-3)=0$.',
          'Portanto $x=2$ ou $x=3$.'
        ],
        resultado: '$x_1=2$ e $x_2=3$'
      },
      exercicio: { tipo: 'equacao-2grau', dica: 'Fatore procurando dois números com soma e produto conhecidos.' }
    },

    estatistica: {
      titulo: 'Média, mediana e moda',
      area: 'Estatística',
      objetivo: 'Calcular média, mediana e moda de um conjunto de dados.',
      explicacao: [
        'A média é a soma de todos os valores dividida pela quantidade de dados: $\\bar{x}=\\frac{\\sum x_i}{n}$.',
        'A mediana é o valor central dos dados ordenados. Se a quantidade for par, é a média dos dois valores centrais.',
        'A moda é o valor que aparece com mais frequência. Um conjunto pode não ter moda ou ter mais de uma.'
      ],
      figura: 'barras',
      exemplo: {
        titulo: 'Exemplo: 3, 5, 5, 7, 10',
        passos: [
          'Média: $\\frac{3+5+5+7+10}{5}=\\frac{30}{5}=6$.',
          'Ordenados, o valor do meio é 5 → mediana 5.',
          'O 5 aparece duas vezes → moda 5.'
        ],
        resultado: 'Média 6 · Mediana 5 · Moda 5'
      },
      exercicio: { tipo: 'estatistica', dica: 'Organize os dados em ordem antes de calcular a mediana.' }
    },

    probabilidade: {
      titulo: 'Probabilidade simples',
      area: 'Probabilidade',
      objetivo: 'Calcular probabilidades de eventos simples em situações equiprováveis.',
      explicacao: [
        'Probabilidade é um número entre 0 e 1: $P(A)=\\frac{\\text{casos favoráveis}}{\\text{casos possíveis}}$.',
        'Para expressar em porcentagem, multiplique por 100. Um evento certo tem $P=1$ ($100\\%$) e um evento impossível tem $P=0$.',
        'A soma das probabilidades de todos os resultados possíveis de um experimento é sempre igual a 1.'
      ],
      figura: 'setores',
      exemplo: {
        titulo: 'Exemplo: 3 bolas vermelhas e 7 azuis',
        passos: [
          'Casos possíveis: $3+7=10$.',
          'Casos favoráveis (vermelha): 3.',
          '$P=\\frac{3}{10}=0{,}3=30\\%$.'
        ],
        resultado: 'P = 0,3 = 30%'
      },
      exercicio: { tipo: 'probabilidade', dica: 'Divida os casos favoráveis pelos casos possíveis.' }
    },

    pitagoras: {
      titulo: 'Aplicações do Teorema de Pitágoras',
      area: 'Geometria',
      objetivo: 'Resolver problemas do cotidiano modelando-os com o teorema de Pitágoras.',
      explicacao: [
        'Muitos problemas podem ser representados por um triângulo retângulo: distâncias, diagonais, comprimentos de escadas e rampas.',
        'Identifique os catetos e a hipotenusa, monte $c^2=a^2+b^2$ e resolva a equação resultante.',
        'Quando a hipotenusa é conhecida, use $a=\\sqrt{c^2-b^2}$ para encontrar a medida de um cateto.'
      ],
      figura: 'triangulo',
      exemplo: {
        titulo: 'Exemplo: escada apoiada a 3 m da parede',
        passos: [
          'A base mede 3 m e a altura até onde encosta na parede é 4 m.',
          '$c^2=3^2+4^2=9+16=25$.',
          '$c=\\sqrt{25}=5$ m.'
        ],
        resultado: 'A escada mede 5 m'
      },
      exercicio: { tipo: 'pitagoras', dica: 'Modele a situação como um triângulo retângulo.' }
    }
  },

  /* ---------------- 1º ANO DO ENSINO MÉDIO ---------------- */
  em1: {
    equacoes2: {
      titulo: 'Equações do 2º grau e fórmula de Bhaskara',
      area: 'Álgebra',
      objetivo: 'Resolver equações do segundo grau usando o discriminante e a fórmula de Bhaskara.',
      explicacao: [
        'Dada $ax^2+bx+c=0$, o discriminante é $\\Delta=b^2-4ac$.',
        'Se $\\Delta>0$ há duas raízes reais distintas; se $\\Delta=0$ há uma raiz dupla; se $\\Delta<0$ não há raízes reais.',
        'As raízes são dadas por $x=\\frac{-b\\pm\\sqrt{\\Delta}}{2a}$.'
      ],
      figura: 'parabola',
      exemplo: {
        titulo: 'Exemplo: x² − 5x + 6 = 0',
        passos: [
          'Identifique: $a=1$, $b=-5$, $c=6$.',
          '$\\Delta=(-5)^2-4\\cdot 1\\cdot 6=25-24=1$.',
          '$x=\\frac{5\\pm 1}{2}$ → $x_1=3$ e $x_2=2$.'
        ],
        resultado: '$x_1=3$ e $x_2=2$'
      },
      exercicio: { tipo: 'equacao-2grau', dica: 'Calcule Δ = b² − 4ac e aplique Bhaskara.' }
    },

    funcoes: {
      titulo: 'Função quadrática: vértice e concavidade',
      area: 'Funções',
      objetivo: 'Determinar vértice, concavidade e zeros de uma função do segundo grau.',
      explicacao: [
        'O gráfico de $f(x)=ax^2+bx+c$ é uma parábola. Se $a>0$ ela abre para cima; se $a<0$, abre para baixo.',
        'A coordenada $x$ do vértice é $x_V=-\\frac{b}{2a}$; substituindo esse valor na função encontra-se $y_V$.',
        'Os zeros da função são os valores de $x$ em que $f(x)=0$, obtidos pela fórmula de Bhaskara.'
      ],
      figura: 'parabola',
      exemplo: {
        titulo: 'Exemplo: f(x) = x² − 4x + 3',
        passos: [
          'Vértice: $x_V=\\frac{4}{2}=2$ e $f(2)=4-8+3=-1$ → $V(2,-1)$.',
          'Zeros: $x^2-4x+3=(x-1)(x-3)=0$ → $x=1$ e $x=3$.'
        ],
        resultado: 'V(2, −1); zeros em x = 1 e x = 3'
      },
      exercicio: { tipo: 'funcao-2grau', dica: 'O vértice tem x = −b / 2a; depois substitua na função.' }
    },

    conjuntos: {
      titulo: 'Conjuntos, intervalos e a reta real',
      area: 'Álgebra',
      objetivo: 'Representar conjuntos e intervalos de números reais.',
      explicacao: [
        'Intervalos descrevem conjuntos de reais: $[a,b]$ inclui as extremidades, $(a,b)$ não inclui, e notações mistas como $[a,b)$ incluem apenas a primeira.',
        'O símbolo $\\in$ significa “pertence a” e $\\notin$ significa “não pertence a”.',
        'A união $\\cup$ reúne dois conjuntos; a interseção $\\cap$ mantém apenas os elementos comuns aos dois.'
      ],
      figura: 'intervalo',
      exemplo: {
        titulo: 'Exemplo: interpretar [1 ; 4)',
        passos: [
          '1 pertence ao intervalo, pois há colchete (fechado).',
          '4 não pertence, pois há parêntese (aberto).',
          'Os inteiros do intervalo são 1, 2 e 3.'
        ],
        resultado: 'Inteiros: 1, 2 e 3'
      },
      exercicio: { tipo: 'intervalos', dica: 'Colchete inclui o valor; parêntese exclui.' }
    },

    trigonometria: {
      titulo: 'Razões trigonométricas no triângulo retângulo',
      area: 'Geometria',
      objetivo: 'Definir seno, cosseno e tangente de um ângulo agudo.',
      explicacao: [
        'Em um triângulo retângulo, para um ângulo agudo $\\theta$ vale: $\\sin\\theta=\\frac{\\text{oposto}}{\\text{hipotenusa}}$.',
        'O cosseno é $\\cos\\theta=\\frac{\\text{adjacente}}{\\text{hipotenusa}}$ e a tangente é $\\tan\\theta=\\frac{\\text{oposto}}{\\text{adjacente}}$.',
        'Relação fundamental: $\\sin^2\\theta+\\cos^2\\theta=1$.'
      ],
      figura: 'trig',
      exemplo: {
        titulo: 'Exemplo: hipotenusa 10 e cateto oposto 6',
        passos: [
          '$\\sin\\theta=\\frac{6}{10}=0{,}6$.',
          'Consultando a tabela: $\\theta\\approx 36{,}9^\\circ$.'
        ],
        resultado: 'sen θ = 0,6 (θ ≈ 36,9°)'
      },
      exercicio: { tipo: 'trigonometria', dica: 'seno = cateto oposto ÷ hipotenusa.' }
    }
  },

  /* ---------------- 2º ANO DO ENSINO MÉDIO ---------------- */
  em2: {
    funcaoQuadratica: {
      titulo: 'Função do 2º grau: zeros, vértice e gráfico',
      area: 'Funções',
      objetivo: 'Analisar completamente uma função quadrática a partir de sua expressão.',
      explicacao: [
        'De $f(x)=ax^2+bx+c$, leia os coeficientes $a$, $b$ e $c$ para obter concavidade, vértice e cortes com os eixos.',
        'O vértice está em $x_V=-\\frac{b}{2a}$ e $y_V=f(x_V)$; o corte no eixo $y$ é o ponto $(0,c)$.',
        'Os zeros vêm de Bhaskara: $x=\\frac{-b\\pm\\sqrt{\\Delta}}{2a}$.'
      ],
      figura: 'parabola',
      exemplo: {
        titulo: 'Exemplo: f(x) = x² − 6x + 8',
        passos: [
          '$\\Delta=(-6)^2-4\\cdot 8=36-32=4$.',
          '$x=\\frac{6\\pm 2}{2}$ → $x=2$ e $x=4$.',
          'Vértice: $x_V=3$ e $f(3)=9-18+8=-1$ → $V(3,-1)$.'
        ],
        resultado: 'Zeros 2 e 4; vértice V(3, −1)'
      },
      exercicio: { tipo: 'funcao-2grau', dica: 'Use x = −b/2a para o vértice e Bhaskara para os zeros.' }
    },

    exponencial: {
      titulo: 'Função exponencial e crescimento',
      area: 'Funções',
      objetivo: 'Reconhecer crescimento e decaimento exponenciais e calcular termos de uma progressão.',
      explicacao: [
        'A função exponencial tem a forma $f(x)=a\\cdot b^{x}$, com $b>0$ e $b\\neq 1$.',
        'Se $b>1$ há crescimento; se $0<b<1$ há decaimento. O valor $a=f(0)$ é o termo inicial.',
        'A cada unidade de tempo o valor é multiplicado por $b$ — é o chamado crescimento composto.'
      ],
      figura: 'exponencial',
      exemplo: {
        titulo: 'Exemplo: colônia que dobra a cada hora',
        passos: [
          'Modelo: $f(x)=500\\cdot 2^{x}$ com 500 bactérias iniciais.',
          'Após 4 horas: $f(4)=500\\cdot 2^{4}=500\\cdot 16=8000$.'
        ],
        resultado: '8000 bactérias'
      },
      exercicio: { tipo: 'exponencial', dica: 'Multiplique o inicial por 2 elevado ao número de períodos.' }
    },

    geometria: {
      titulo: 'Distância entre pontos no plano',
      area: 'Geometria',
      objetivo: 'Calcular a distância entre dois pontos usando o Teorema de Pitágoras.',
      explicacao: [
        'Dados $A(x_1,y_1)$ e $B(x_2,y_2)$, a distância é $d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$.',
        'A fórmula é uma aplicação direta de Pitágoras: as diferenças de coordenadas são os catetos de um triângulo retângulo.',
        'O ponto médio do segmento é $M=\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)$.'
      ],
      figura: 'plano',
      exemplo: {
        titulo: 'Exemplo: A(1, 2) e B(4, 6)',
        passos: [
          '$d=\\sqrt{(4-1)^2+(6-2)^2}=\\sqrt{3^2+4^2}$.',
          '$d=\\sqrt{9+16}=\\sqrt{25}=5$.'
        ],
        resultado: 'd = 5'
      },
      exercicio: { tipo: 'distancia', dica: 'Subtraia as coordenadas, eleve ao quadrado e some.' }
    },

    trigonometria: {
      titulo: 'Círculo trigonométrico',
      area: 'Geometria',
      objetivo: 'Relacionar ângulos, arcos e razões trigonométricas no círculo trigonométrico.',
      explicacao: [
        'O círculo trigonométrico tem raio 1 e centro na origem. Cada ângulo $\\theta$ corresponde a um ponto $P=(\\cos\\theta,\\sin\\theta)$.',
        'Ângulos positivos são medidos no sentido anti-horário; ângulos negativos, no sentido horário.',
        'Períodos: $\\sin$ e $\\cos$ repetem-se a cada $360^\\circ$ (ou $2\\pi$); a tangente, a cada $180^\\circ$.'
      ],
      figura: 'circulo',
      exemplo: {
        titulo: 'Exemplo: seno e cosseno de 30°',
        passos: [
          'No círculo, $30^\\circ$ corresponde ao ponto $P\\left(\\frac{\\sqrt{3}}{2},\\frac{1}{2}\\right)$.',
          '$\\sin 30^\\circ=\\frac{1}{2}$ e $\\cos 30^\\circ=\\frac{\\sqrt{3}}{2}$.'
        ],
        resultado: 'sen 30° = 1/2 · cos 30° = √3/2'
      },
      exercicio: { tipo: 'trigonometria', dica: 'No círculo de raio 1, seno é a coordenada y do ponto.' }
    }
  },

  /* ---------------- 3º ANO DO ENSINO MÉDIO ---------------- */
  em3: {
    estatistica: {
      titulo: 'Medidas de tendência central e dispersão',
      area: 'Estatística',
      objetivo: 'Calcular média, mediana, moda e amplitude de um conjunto de dados.',
      explicacao: [
        'As medidas de tendência central resumem o conjunto: média, mediana e moda.',
        'A dispersão mostra o quanto os dados se afastam: amplitude = maior valor − menor valor; o desvio padrão mede a variabilidade média.',
        'A mediana é menos sensível a valores extremos do que a média — por isso é preferida em distribuições assimétricas.'
      ],
      figura: 'barras',
      exemplo: {
        titulo: 'Exemplo: 2, 4, 4, 6, 14',
        passos: [
          'Média: $\\frac{2+4+4+6+14}{5}=\\frac{30}{5}=6$.',
          'Ordenados, o valor central é 4 → mediana 4.',
          'Amplitude: $14-2=12$.'
        ],
        resultado: 'Média 6 · Mediana 4 · Amplitude 12'
      },
      exercicio: { tipo: 'estatistica', dica: 'Some tudo e divida pela quantidade de dados.' }
    },

    probabilidade: {
      titulo: 'Probabilidade e princípios de contagem',
      area: 'Probabilidade',
      objetivo: 'Aplicar a contagem de resultados e o princípio multiplicativo em problemas.',
      explicacao: [
        'Em experimentos equiprováveis: $P(A)=\\frac{n(A)}{n(E)}$, onde $n(A)$ é o número de casos favoráveis.',
        'Princípio multiplicativo: se uma escolha oferece $m$ opções e outra $n$ opções, há $m\\cdot n$ combinações possíveis.',
        'Para eventos mutuamente exclusivos, $P(A\\cup B)=P(A)+P(B)$.'
      ],
      figura: 'setores',
      exemplo: {
        titulo: 'Exemplo: sair um número par em um dado',
        passos: [
          'Resultados possíveis: 1, 2, 3, 4, 5, 6 → 6 casos.',
          'Favoráveis (pares): 2, 4, 6 → 3 casos.',
          '$P=\\frac{3}{6}=\\frac{1}{2}=50\\%$.'
        ],
        resultado: 'P = 1/2 = 50%'
      },
      exercicio: { tipo: 'probabilidade', dica: 'Favoráveis divididos por possíveis, vezes 100.' }
    },

    funcoes: {
      titulo: 'Domínio, imagem e gráficos de funções',
      area: 'Funções',
      objetivo: 'Determinar domínio e imagem e interpretar o gráfico de uma função.',
      explicacao: [
        'O domínio é o conjunto dos valores de $x$ para os quais a função está definida; a imagem é o conjunto dos valores de $y$.',
        'Em $f(x)=\\frac{1}{x-2}$, o domínio exclui $x=2$, pois não se pode dividir por zero.',
        'A leitura do gráfico permite encontrar zeros, interceptos e os trechos em que a função é crescente ou decrescente.'
      ],
      figura: 'retaGrafico',
      exemplo: {
        titulo: 'Exemplo: f(x) = √(x − 3)',
        passos: [
          'A raiz exige $x-3\\ge 0$, ou seja, $x\\ge 3$.',
          'Domínio: $[3,+\\infty)$.',
          '$f(3)=0$ e a imagem também é $[0,+\\infty)$.'
        ],
        resultado: 'D = [3, ∞) · Im = [0, ∞)'
      },
      exercicio: { tipo: 'funcao-1grau', dica: 'Substitua o valor de x e resolva a expressão.' }
    },

    financeira: {
      titulo: 'Juros simples e juros compostos',
      area: 'Matemática Financeira',
      objetivo: 'Calcular juros simples e juros compostos em situações financeiras.',
      explicacao: [
        'Nos juros simples, os juros incidem apenas sobre o capital inicial: $J=C\\cdot i\\cdot t$.',
        'Nos juros compostos, os juros de cada período são acrescentados ao capital: $M=C(1+i)^{t}$.',
        'Por isso, em períodos longos o juros compostos supera o juros simples — é o chamado “juro sobre juro”.'
      ],
      figura: 'exponencial',
      exemplo: {
        titulo: 'Exemplo: C = 2.000, i = 5% ao mês, t = 4 (simples)',
        passos: [
          '$J=C\\cdot i\\cdot t=2000\\cdot 0{,}05\\cdot 4$.',
          '$J=100\\cdot 4=400$.'
        ],
        resultado: 'J = R$ 400,00 · Montante = R$ 2.400,00'
      },
      exercicio: { tipo: 'juros', dica: 'Juros simples: capital × taxa × tempo.' }
    }
  }
});
