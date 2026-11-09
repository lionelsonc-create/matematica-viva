/* =========================================================
   Matemática Viva — laboratório, jogo e inicialização
   ========================================================= */

/* ---------- Laboratório interativo ---------- */
let abaAtual = 'operacoes';

function trocarAba(aba) {
  abaAtual = aba;
  document.querySelectorAll('.aba').forEach(function (b) { b.classList.toggle('ativa', b.dataset.aba === aba); });
  document.querySelectorAll('.conteudo-aba').forEach(function (c) { c.classList.remove('ativa'); });
  const alvo = document.getElementById('aba-' + aba);
  if (alvo) alvo.classList.add('ativa');
  if (aba === 'fracoes' && !document.getElementById('area-fracao').innerHTML) gerarFracao();
}

let operacaoAtual = null, respostaOperacao = null;

function novaOperacao(op) {
  operacaoAtual = op;
  let a, b, resp;
  if (op === '+') { a = al(1, 50); b = al(1, 50); resp = a + b; }
  if (op === '-') { a = al(11, 60); b = al(1, a - 1); resp = a - b; }
  if (op === '*') { a = al(1, 12); b = al(1, 12); resp = a * b; }
  if (op === '/') { b = al(2, 10); resp = al(2, 10); a = b * resp; }
  respostaOperacao = resp;
  const simbolo = op === '*' ? '×' : op === '/' ? '÷' : (op === '-' ? '−' : op);
  const area = document.getElementById('area-operacao');
  area.innerHTML = '<h4>Quanto é ' + a + ' ' + simbolo + ' ' + b + '?</h4>' +
    '<input type="number" class="entrada-num" id="resposta-operacao" placeholder="?" autocomplete="off">' +
    '<div style="margin-top:1rem;"><button class="btn btn-primario" onclick="verificarOperacao()">Verificar</button></div>';
  document.getElementById('feedback-operacao').textContent = '';
  const input = document.getElementById('resposta-operacao');
  if (input) input.focus();
}

function verificarOperacao() {
  const input = document.getElementById('resposta-operacao');
  const feedback = document.getElementById('feedback-operacao');
  if (!input || !feedback) return;
  if (Number(input.value) === respostaOperacao) {
    feedback.textContent = '✅ Correto! Muito bem.';
    feedback.style.background = '#ecfdf5'; feedback.style.color = '#047857';
    exerciciosResolvidos++; acertosJogo++;
    gravar(CHAVES.exercicios, exerciciosResolvidos);
    gravar(CHAVES.acertos, acertosJogo);
    atualizarPainelEstudante();
  } else {
    feedback.textContent = '❌ Quase! Revise a conta e tente de novo.';
    feedback.style.background = '#fef2f2'; feedback.style.color = '#b91c1c';
  }
}

let fracaoNumerador = null, fracaoDenominador = null;

function gerarFracao() {
  const n1 = al(1, 6), n2 = al(1, 6), d = al(2, 8);
  fracaoNumerador = n1 + n2; fracaoDenominador = d;
  const area = document.getElementById('area-fracao');
  area.innerHTML = '<h4>$\\frac{' + n1 + '}{' + d + '} + \\frac{' + n2 + '}{' + d + '} = ?$</h4>' +
    '<div style="display:flex; gap:.5rem; justify-content:center; align-items:center; margin:1.2rem 0;">' +
    '<input type="number" class="entrada-num" id="frac-num" placeholder="Numerador" autocomplete="off">' +
    '<span style="font-size:1.6rem;">/</span>' +
    '<input type="number" class="entrada-num" id="frac-den" value="' + d + '" readonly>' +
    '</div><button class="btn btn-primario" onclick="verificarFracao()">Verificar</button>' +
    '<div style="margin-top:.9rem;"><button class="btn btn-secundario btn-sm" onclick="gerarFracao()">Novo exercício</button></div>';
  document.getElementById('feedback-fracao').textContent = '';
  tipar(area);
}

function verificarFracao() {
  const num = document.getElementById('frac-num');
  const den = document.getElementById('frac-den');
  const feedback = document.getElementById('feedback-fracao');
  if (!num || !den || !feedback) return;
  if (Number(num.value) === fracaoNumerador && Number(den.value) === fracaoDenominador) {
    feedback.textContent = '✅ Correto! Você somou os numeradores e manteve o denominador.';
    feedback.style.background = '#ecfdf5'; feedback.style.color = '#047857';
    exerciciosResolvidos++; acertosJogo++;
    gravar(CHAVES.exercicios, exerciciosResolvidos);
    gravar(CHAVES.acertos, acertosJogo);
    atualizarPainelEstudante();
  } else {
    feedback.textContent = '❌ Ainda não. Lembre-se: some só os números de cima.';
    feedback.style.background = '#fef2f2'; feedback.style.color = '#b91c1c';
  }
}

/* ---------- Desafio matemático ---------- */
let tempoJogo = 60, intervaloJogo = null, perguntaAtual = null;

function iniciarJogo() {
  pontosJogo = 0; tempoJogo = 60;
  document.getElementById('pontuacao-jogo').textContent = '0';
  document.getElementById('tempo-jogo').textContent = '60';
  document.getElementById('nivel-jogo').textContent = 'Fácil';
  mostrarTelaJogo('tela-jogo-ativo');
  proximaPergunta();
  if (intervaloJogo) clearInterval(intervaloJogo);
  intervaloJogo = setInterval(function () {
    tempoJogo--;
    document.getElementById('tempo-jogo').textContent = tempoJogo;
    if (tempoJogo <= 0) finalizarJogo();
  }, 1000);
}

function mostrarTelaJogo(id) {
  ['tela-jogo-inicial', 'tela-jogo-ativo', 'tela-jogo-final'].forEach(function (t) {
    document.getElementById(t).classList.toggle('ativa', t === id);
  });
}

function proximaPergunta() {
  const nivel = document.getElementById('nivel-jogo').textContent;
  let a, b, op, resp;
  const simbolos = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  if (nivel === 'Fácil') {
    a = al(1, 20); b = al(1, 20); op = Math.random() < 0.5 ? '+' : '-';
    if (op === '-' && a < b) { const t = a; a = b; b = t; }
    resp = op === '+' ? a + b : a - b;
  } else if (nivel === 'Médio') {
    a = al(2, 12); b = al(2, 12); op = '*'; resp = a * b;
  } else {
    resp = al(2, 10); b = al(2, 10); a = b * resp; op = '/';
  }
  perguntaAtual = resp;
  document.getElementById('pergunta-jogo').textContent = 'Quanto é ' + a + ' ' + simbolos[op] + ' ' + b + '?';
  const input = document.getElementById('resposta-jogo');
  input.value = '';
  document.getElementById('feedback-jogo').textContent = '';
  input.focus();
}

function verificarRespostaJogo() {
  const input = document.getElementById('resposta-jogo');
  const feedback = document.getElementById('feedback-jogo');
  if (!input || !feedback) return;
  const valor = Number(input.value);
  if (input.value.trim() === '') return;

  if (valor === perguntaAtual) {
    feedback.textContent = '✅ Correto! +10 pontos';
    feedback.style.color = '#059669';
    pontosJogo += 10;
    document.getElementById('pontuacao-jogo').textContent = pontosJogo;
    exerciciosResolvidos++; acertosJogo++;
    gravar(CHAVES.pontos, pontosJogo);
    gravar(CHAVES.exercicios, exerciciosResolvidos);
    gravar(CHAVES.acertos, acertosJogo);
    atualizarPainelEstudante();
    if (pontosJogo >= 50 && pontosJogo < 100) document.getElementById('nivel-jogo').textContent = 'Médio';
    if (pontosJogo >= 100) document.getElementById('nivel-jogo').textContent = 'Difícil';
    setTimeout(proximaPergunta, 700);
  } else {
    feedback.textContent = '❌ Errou! Próxima pergunta.';
    feedback.style.color = '#dc2626';
    setTimeout(proximaPergunta, 700);
  }
}

function finalizarJogo() {
  if (intervaloJogo) clearInterval(intervaloJogo);
  intervaloJogo = null;
  document.getElementById('pontuacao-final').textContent = pontosJogo;
  mostrarTelaJogo('tela-jogo-final');
}
function reiniciarJogo() { iniciarJogo(); }

/* ---------- Inicialização ---------- */
(function iniciar() {
  montarBibliotecaFiguras();
  observarFiguras();
  atualizarConteudos();
  restaurarSessao();
  atualizarNav();
  atualizarPainelProfessor();
  atualizarPainelEstudante();

  const menu = document.getElementById('nav-mobile');
  if (menu) menu.addEventListener('click', function () {
    const links = document.getElementById('nav-links');
    links.classList.toggle('ativo');
    menu.setAttribute('aria-expanded', links.classList.contains('ativo') ? 'true' : 'false');
  });

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.getElementById('nav-links').classList.remove('ativo');
    });
  });

  const campoResposta = document.getElementById('resposta-jogo');
  if (campoResposta) campoResposta.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') verificarRespostaJogo();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const campo = document.getElementById('campo-resposta');
    if (campo && document.activeElement === campo) { e.preventDefault(); verificarResposta(); }
  });

  const login = document.getElementById('login-email');
  if (login && !valorDe('login-email')) login.focus();
})();
