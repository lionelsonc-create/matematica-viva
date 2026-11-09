/* =========================================================
   GERADORES DE EXERCÍCIOS
   Cada função devolve { enunciado, resposta, gabarito }
   ========================================================= */
function al(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function escolher(lista) { return lista[al(0, lista.length - 1)]; }
function embaralhar(lista) {
  const c = lista.slice();
  for (let i = c.length - 1; i > 0; i--) { const j = al(0, i); const t = c[i]; c[i] = c[j]; c[j] = t; }
  return c;
}

const EXERCICIOS = {

  'soma-naturais': function () {
    const a = al(120, 899), b = al(120, 899), r = a + b;
    return {
      enunciado: 'Quanto é $' + a + ' + ' + b + '$?',
      resposta: String(r),
      gabarito: '$' + a + '+' + b + '=' + r + '$'
    };
  },

  'sub-naturais': function () {
    const a = al(400, 999), b = al(100, a - 100), r = a - b;
    return { enunciado: 'Quanto é $' + a + ' - ' + b + '$?', resposta: String(r), gabarito: '$' + a + '-' + b + '=' + r + '$' };
  },

  'soma-fracoes': function () {
    const n1 = al(1, 6), n2 = al(1, 6), d = al(2, 8), r = n1 + n2;
    return {
      enunciado: 'Some $\\frac{' + n1 + '}{' + d + '} + \\frac{' + n2 + '}{' + d + '}$ e informe o numerador do resultado.',
      resposta: String(r),
      gabarito: '$\\frac{' + n1 + '}{' + d + '}+\\frac{' + n2 + '}{' + d + '}=\\frac{' + r + '}{' + d + '}$'
    };
  },

  'retangulo': function () {
    const a = al(4, 18), b = al(3, 12);
    if (Math.random() < 0.5) {
      const r = 2 * (a + b);
      return {
        enunciado: 'Um retângulo tem base $' + a + '$ cm e altura $' + b + '$ cm. Qual é o seu <strong>perímetro</strong> (em cm)?',
        resposta: String(r),
        gabarito: '$P=2(' + a + '+' + b + ')=' + r + '$ cm'
      };
    }
    const r = a * b;
    return {
      enunciado: 'Um retângulo tem base $' + a + '$ cm e altura $' + b + '$ cm. Qual é a sua <strong>área</strong> (em cm²)?',
      resposta: String(r),
      gabarito: '$A=' + a + '\\cdot ' + b + '=' + r + '$ cm²'
    };
  },

  'equacao-simples': function () {
    const x = al(3, 25), b = al(2, 30), c = x + b;
    return {
      enunciado: 'Resolva a equação: $x + ' + b + ' = ' + c + '$',
      resposta: String(x),
      gabarito: '$x=' + c + '-' + b + '=' + x + '$'
    };
  },

  'racionais': function () {
    const opcoes = ['$\\frac{3}{4}$', '$0{,}25$', '$-5$', '$\\sqrt{2}$'];
    const ordem = embaralhar(opcoes), letras = ['a', 'b', 'c', 'd'];
    const idx = ordem.indexOf('$\\sqrt{2}$');
    const lista = ordem.map(function (o, i) { return letras[i] + ') ' + o; }).join('&nbsp;&nbsp;&nbsp;&nbsp;');
    return {
      enunciado: 'Qual opção <strong>NÃO</strong> representa um número racional?<br><br>' + lista,
      resposta: letras[idx],
      gabarito: letras[idx] + ') $\\sqrt{2}$ não pode ser escrito como fração de inteiros.'
    };
  },

  'proporcao': function () {
    const un = al(3, 15), q1 = al(3, 9), q2 = al(3, 12);
    const total = un * q1, r = un * q2;
    return {
      enunciado: q1 + ' itens custam R$ ' + total + '. Quanto custam <strong>' + q2 + '</strong> itens?',
      resposta: String(r),
      gabarito: '$\\frac{' + q1 + '}{' + total + '}=\\frac{' + q2 + '}{' + r + '}$ → R$ ' + r
    };
  },

  'angulos': function () {
    const a = al(25, 75);
    if (Math.random() < 0.5) {
      const r = 90 - a;
      return {
        enunciado: 'Dois ângulos são <strong>complementares</strong>. Um deles mede $' + a + '^\\circ$. Quanto meda o outro?',
        resposta: String(r),
        gabarito: '$90^\\circ-' + a + '^\\circ=' + r + '^\\circ$'
      };
    }
    const r = 180 - a;
    return {
      enunciado: 'Dois ângulos são <strong>suplementares</strong>. Um deles mede $' + a + '^\\circ$. Quanto meda o outro?',
      resposta: String(r),
      gabarito: '$180^\\circ-' + a + '^\\circ=' + r + '^\\circ$'
    };
  },

  'porcentagem': function () {
    const v = al(1, 20) * 4, total = al(2, 20) * 25, r = total * v / 100;
    return {
      enunciado: 'Calcule $' + v + '\\%$ de ' + total + '.',
      resposta: String(r),
      gabarito: '$\\frac{' + v + '}{100}\\cdot ' + total + '=' + r + '$'
    };
  },

  'equacao-1grau': function () {
    const a = al(2, 9), x = al(2, 15), b = al(1, 40), c = a * x + b;
    return {
      enunciado: 'Resolva: $' + a + 'x + ' + b + ' = ' + c + '$',
      resposta: String(x),
      gabarito: '$' + a + 'x=' + c + '-' + b + '=' + (a * x) + ' \\Rightarrow x=' + x + '$'
    };
  },

  'pitagoras': function () {
    const base = escolher([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]]);
    const k = al(1, 3), A = base[0] * k, B = base[1] * k, C = base[2] * k;
    return {
      enunciado: 'Um triângulo retângulo tem catetos $' + A + '$ e $' + B + '$. Qual é a medida da <strong>hipotenusa</strong>?',
      resposta: String(C),
      gabarito: '$c=\\sqrt{' + A + '^2+' + B + '^2}=\\sqrt{' + (A * A) + '+' + (B * B) + '}=' + C + '$'
    };
  },

  'funcao-1grau': function () {
    const m = al(2, 9) * (Math.random() < 0.5 ? -1 : 1);
    const n = al(1, 15) * (Math.random() < 0.5 ? -1 : 1);
    const k = al(-5, 10), r = m * k + n;
    const sinal = n > 0 ? '+' : '-';
    return {
      enunciado: 'Para $f(x)=' + m + 'x ' + sinal + ' ' + Math.abs(n) + '$, calcule $f(' + k + ')$.',
      resposta: String(r),
      gabarito: '$f(' + k + ')=' + m + '\\cdot ' + k + ' ' + sinal + ' ' + Math.abs(n) + '=' + r + '$'
    };
  },

  'equacao-2grau': function () {
    const r1 = al(1, 9), r2 = al(1, 9), s = r1 + r2, p = r1 * r2, menor = Math.min(r1, r2);
    return {
      enunciado: 'Resolva $x^2 - ' + s + 'x + ' + p + ' = 0$ e informe a <strong>menor raiz</strong>.',
      resposta: String(menor),
      gabarito: '$(x-' + r1 + ')(x-' + r2 + ')=0 \\Rightarrow x=' + r1 + ' \\text{ ou } x=' + r2 + '$'
    };
  },

  'funcao-2grau': function () {
    const b = al(1, 10) * 2, c = al(-12, 12), xv = -b / 2;
    return {
      enunciado: 'Para $f(x)=x^2 - ' + b + 'x + ' + c + '$, qual é a coordenada <strong>x do vértice</strong>?',
      resposta: String(xv),
      gabarito: '$x_V=-\\frac{' + b + '}{2}=' + xv + '$'
    };
  },

  'estatistica': function () {
    const m = al(6, 20);
    const v = [m - 4, m - 1, m, m + 2, m + 3];
    const soma = v.reduce(function (t, x) { return t + x; }, 0);
    return {
      enunciado: 'Calcule a <strong>média</strong> dos dados: $' + v.join(', ') + '$',
      resposta: String(m),
      gabarito: '$\\bar{x}=\\frac{' + soma + '}{5}=' + m + '$'
    };
  },

  'probabilidade': function () {
    const par = escolher([[10, 3], [10, 4], [20, 5], [20, 8], [25, 5], [25, 15], [50, 10], [50, 20]]);
    const total = par[0], fav = par[1], r = fav * 100 / total;
    return {
      enunciado: 'Em uma urna há <strong>' + fav + '</strong> bolas vermelhas e <strong>' + (total - fav) + '</strong> azuis. Qual a probabilidade (em %) de sair uma bola vermelha?',
      resposta: String(r),
      gabarito: '$P=\\frac{' + fav + '}{' + total + '}=' + r + '\\%$'
    };
  },

  'distancia': function () {
    const tri = escolher([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
    const x1 = al(-4, 4), y1 = al(-4, 4);
    const dx = Math.random() < 0.5 ? tri[0] : -tri[0];
    const dy = Math.random() < 0.5 ? tri[1] : -tri[1];
    const x2 = x1 + dx, y2 = y1 + dy;
    return {
      enunciado: 'Calcule a distância entre $A(' + x1 + ';' + y1 + ')$ e $B(' + x2 + ';' + y2 + ')$.',
      resposta: String(tri[2]),
      gabarito: '$d=\\sqrt{(' + x2 + '-' + x1 + ')^2+(' + y2 + '-' + y1 + ')^2}=' + tri[2] + '$'
    };
  },

  'trigonometria': function () {
    const tri = escolher([[3, 4, 5], [6, 8, 10], [9, 12, 15], [8, 6, 10], [12, 16, 20]]);
    const usarSeno = Math.random() < 0.5;
    const cateto = usarSeno ? tri[0] : tri[1];
    const r = cateto / tri[2];
    return {
      enunciado: 'Em um triângulo retângulo, o cateto ' + (usarSeno ? '<strong>oposto</strong>' : '<strong>adjacente</strong>') + ' ao ângulo $\\alpha$ mede $' + cateto + '$ e a hipotenusa mede $' + tri[2] + '$. Qual o valor de $' + (usarSeno ? '\\sin' : '\\cos') + '\\alpha$?',
      resposta: String(r),
      gabarito: '$' + (usarSeno ? '\\sin' : '\\cos') + '\\alpha=\\frac{' + cateto + '}{' + tri[2] + '}=' + r + '$'
    };
  },

  'exponencial': function () {
    const inicial = escolher([100, 200, 250, 400, 500, 800]);
    const h = al(2, 5), r = inicial * Math.pow(2, h);
    return {
      enunciado: 'Uma colônia de bactérias começa com <strong>' + inicial + '</strong> indivíduos e <strong>dobra</strong> a cada hora. Quantas haverá após <strong>' + h + '</strong> horas?',
      resposta: String(r),
      gabarito: '$' + inicial + '\\cdot 2^{' + h + '}=' + r + '$'
    };
  },

  'intervalos': function () {
    const a = al(1, 9), b = a + al(2, 8), r = b - a;
    const nums = [];
    for (let i = a; i < b; i++) nums.push(i);
    return {
      enunciado: 'Quantos números inteiros pertencem ao intervalo $[' + a + '\\,;\\,' + b + ')$?',
      resposta: String(r),
      gabarito: 'Pertencem ' + nums.join(', ') + ' → ' + r + ' inteiros.'
    };
  },

  'juros': function () {
    const C = al(5, 50) * 100, i = al(2, 10), t = al(2, 12), r = C * i * t / 100;
    return {
      enunciado: 'Um capital de <strong>R$ ' + C + '</strong> foi aplicado a <strong>' + i + '% ao mês</strong> durante <strong>' + t + ' meses</strong> (juros simples). Qual o valor dos juros?',
      resposta: String(r),
      gabarito: '$J=' + C + '\\cdot \\frac{' + i + '}{100}\\cdot ' + t + '=R\\$\\, ' + r + '$'
    };
  }
};

/* Compara a resposta do aluno com o gabarito aceito */
function conferir(valorUsuario, gabaritos) {
  const normalizar = function (v) {
    return String(v).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.').replace(/%$/, '');
  };
  const u = normalizar(valorUsuario);
  if (!u) return false;
  const lista = Array.isArray(gabaritos) ? gabaritos : [gabaritos];
  return lista.some(function (g) {
    const gu = normalizar(g);
    const nu = Number(u), ng = Number(gu);
    if (!isNaN(nu) && !isNaN(ng) && u !== '' && gu !== '') return Math.abs(nu - ng) < 1e-9;
    return u === gu;
  });
}
