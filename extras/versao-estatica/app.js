/* =========================================================
   Matemática Viva — lógica da aplicação
   cadastro · geração de aulas · figuras em TikZ · impressão A4
   ========================================================= */

/* ---------- 1. Armazenamento local (sem servidor) ---------- */
const CHAVES = {
  usuarios: 'mv_usuarios', sessao: 'mv_sessao', escola: 'mv_escola',
  aulas: 'mv_aulas', exercicios: 'mv_exercicios', acertos: 'mv_acertos', pontos: 'mv_pontos'
};

function ler(chave, padrao) {
  try {
    const v = JSON.parse(localStorage.getItem(chave));
    return (v === null || v === undefined) ? padrao : v;
  } catch (e) { return padrao; }
}
function gravar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
  catch (e) { alert('Não foi possível salvar: o armazenamento do navegador está cheio. Tente uma imagem de logo menor.'); return false; }
}
function esc(txt) {
  return String(txt === null || txt === undefined ? '' : txt)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function valorDe(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function dataHoje() { const d = new Date(); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(); }

let usuarioLogado = null;
let painelAtual = 'home';
let aulasGeradas = ler(CHAVES.aulas, []);
let pontosJogo = ler(CHAVES.pontos, 0);
let exerciciosResolvidos = ler(CHAVES.exercicios, 0);
let acertosJogo = ler(CHAVES.acertos, 0);
let escola = ler(CHAVES.escola, {});
let aulaAtual = null;
let tipoExercicioAtual = null;
let exercicioAtual = null;
let papelCadastro = 'professor';

const PAGINAS_PROTEGIDAS = ['professor', 'gerador', 'config', 'estudante', 'laboratorio', 'jogo'];
const SERIES = [
  ['6', '6º ano — Fundamental II'], ['7', '7º ano — Fundamental II'],
  ['8', '8º ano — Fundamental II'], ['9', '9º ano — Fundamental II'],
  ['em1', '1º ano — Ensino Médio'], ['em2', '2º ano — Ensino Médio'],
  ['em3', '3º ano — Ensino Médio']
];

/* ---------- 2. Navegação ---------- */
function navegar(secao) {
  if (!document.getElementById(secao)) secao = 'home';
  if (PAGINAS_PROTEGIDAS.indexOf(secao) >= 0 && !usuarioLogado) secao = 'login';
  document.querySelectorAll('.pagina').forEach(function (p) { p.classList.remove('ativa'); });
  document.getElementById(secao).classList.add('ativa');
  const links = document.getElementById('nav-links');
  if (links) links.classList.remove('ativo');
  painelAtual = secao;
  window.scrollTo(0, 0);

  if (secao === 'professor') atualizarPainelProfessor();
  if (secao === 'estudante') atualizarPainelEstudante();
  if (secao === 'config') atualizarPreview();
  if (secao === 'gerador') atualizarConteudos();
}

function atualizarNav() {
  const logado = document.getElementById('nav-logado');
  const deslogado = document.getElementById('nav-deslogado');
  const link = document.getElementById('link-painel');
  const chip = document.getElementById('chip-usuario');
  if (usuarioLogado) {
    logado.hidden = false; deslogado.hidden = true;
    chip.textContent = (usuarioLogado.papel === 'professor' ? '👨‍🏫 ' : '🎓 ') + usuarioLogado.nome.split(' ')[0];
    link.textContent = usuarioLogado.papel === 'professor' ? 'Painel' : 'Meu painel';
    painelAtual = usuarioLogado.papel === 'professor' ? 'professor' : 'estudante';
  } else {
    logado.hidden = true; deslogado.hidden = false;
  }
}

/* ---------- 3. Contas: cadastro, login e sessão ---------- */
async function criptografar(senha) {
  try {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      const dados = new TextEncoder().encode('matematicaviva:' + senha);
      const buf = await crypto.subtle.digest('SHA-256', dados);
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
  } catch (e) { /* segue sem hash */ }
  return 'plain:' + senha;
}

function trocarPapel(papel) {
  papelCadastro = papel;
  document.querySelectorAll('.papel').forEach(function (b) { b.classList.toggle('ativo', b.dataset.papel === papel); });
  document.getElementById('campos-professor').hidden = (papel !== 'professor');
}

function mostrarErro(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.hidden = false;
}
function limparErro(id) { const el = document.getElementById(id); el.hidden = true; el.textContent = ''; }

async function fazerCadastro(ev) {
  ev.preventDefault();
  limparErro('erro-cadastro');
  const nome = valorDe('cad-nome');
  const email = valorDe('cad-email').toLowerCase();
  const senha = valorDe('cad-senha');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (nome.length < 3) return mostrarErro('erro-cadastro', 'Informe seu nome completo.');
  if (!emailOk) return mostrarErro('erro-cadastro', 'Informe um e-mail válido.');
  if (senha.length < 6) return mostrarErro('erro-cadastro', 'A senha precisa ter pelo menos 6 caracteres.');

  const usuarios = ler(CHAVES.usuarios, []);
  if (usuarios.some(function (u) { return u.email === email; })) {
    return mostrarErro('erro-cadastro', 'Já existe uma conta com esse e-mail. Faça login.');
  }

  const usuario = {
    id: 'u' + Date.now(),
    nome: nome, email: email,
    senha: await criptografar(senha),
    papel: papelCadastro,
    escola: papelCadastro === 'professor' ? valorDe('cad-escola') : '',
    disciplina: papelCadastro === 'professor' ? (valorDe('cad-disciplina') || 'Matemática') : '',
    criadoEm: Date.now()
  };
  usuarios.push(usuario);
  gravar(CHAVES.usuarios, usuarios);

  if (usuario.papel === 'professor' && usuario.escola) {
    const e = ler(CHAVES.escola, {});
    e.nome = e.nome || usuario.escola;
    e.disciplina = e.disciplina || usuario.disciplina;
    escola = e; gravar(CHAVES.escola, e);
  }

  document.getElementById('cad-nome').value = '';
  document.getElementById('cad-email').value = '';
  document.getElementById('cad-senha').value = '';
  entrarNaConta(usuario);
}

async function fazerLogin(ev) {
  ev.preventDefault();
  limparErro('erro-login');
  const email = valorDe('login-email').toLowerCase();
  const senha = valorDe('login-senha');
  const usuarios = ler(CHAVES.usuarios, []);
  const usuario = usuarios.find(function (u) { return u.email === email; });

  if (!usuario) return mostrarErro('erro-login', 'Não encontramos uma conta com esse e-mail.');
  const hash = await criptografar(senha);
  if (usuario.senha !== hash && usuario.senha !== 'plain:' + senha && usuario.senha !== senha) {
    return mostrarErro('erro-login', 'Senha incorreta. Tente novamente.');
  }
  document.getElementById('login-senha').value = '';
  entrarNaConta(usuario);
}

function entrarNaConta(usuario) {
  usuarioLogado = usuario;
  gravar(CHAVES.sessao, { id: usuario.id });
  atualizarNav();
  if (usuario.papel === 'professor') { navegar('professor'); atualizarPainelProfessor(); }
  else { navegar('estudante'); atualizarPainelEstudante(); }
}

function logout() {
  usuarioLogado = null;
  try { localStorage.removeItem(CHAVES.sessao); } catch (e) { }
  atualizarNav();
  navegar('home');
}

function restaurarSessao() {
  const sessao = ler(CHAVES.sessao, null);
  if (!sessao || !sessao.id) return;
  const usuario = ler(CHAVES.usuarios, []).find(function (u) { return u.id === sessao.id; });
  if (usuario) { usuarioLogado = usuario; atualizarNav(); }
}

/* ---------- 4. Escola, logo e cabeçalho ---------- */
function salvarEscola(ev) {
  ev.preventDefault();
  escola.nome = valorDe('esc-nome');
  escola.endereco = valorDe('esc-endereco');
  escola.disciplina = valorDe('esc-disciplina') || 'Matemática';
  escola.turma = valorDe('esc-turma');
  gravar(CHAVES.escola, escola);
  atualizarPreview();
  atualizarPainelProfessor();
  alert('Configurações salvas com sucesso!');
}

function carregarLogo(evento) {
  const arquivo = evento.target.files && evento.target.files[0];
  if (!arquivo) return;
  if (arquivo.size > 5 * 1024 * 1024) { alert('Escolha uma imagem com até 5 MB.'); return; }
  const leitor = new FileReader();
  leitor.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const max = 480;
      let l = img.width, a = img.height;
      if (l > max || a > max) {
        const escala = Math.min(max / l, max / a);
        l = Math.round(l * escala); a = Math.round(a * escala);
      }
      const cv = document.createElement('canvas');
      cv.width = l; cv.height = a;
      cv.getContext('2d').drawImage(img, 0, 0, l, a);
      escola.logo = cv.toDataURL(arquivo.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
      gravar(CHAVES.escola, escola);
      atualizarPreview();
    };
    img.onerror = function () { alert('Não foi possível ler a imagem.'); };
    img.src = e.target.result;
  };
  leitor.readAsDataURL(arquivo);
}

function removerLogo() {
  delete escola.logo;
  gravar(CHAVES.escola, escola);
  document.getElementById('esc-logo-arquivo').value = '';
  atualizarPreview();
}

const LOGO_PADRAO = '<svg class="fp-logo-svg" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
  '<rect x="1" y="1" width="30" height="30" rx="8" fill="#2563eb"/>' +
  '<path d="M7 23 16 7 25 23Z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>' +
  '<circle cx="16" cy="18" r="2.4" fill="#fff"/></svg>';

function cabecalhoFolha() {
  const logo = escola.logo
    ? '<img class="fp-logo" src="' + escola.logo + '" alt="Logo da escola">'
    : LOGO_PADRAO;
  return '<div class="fp-cabecalho">' + logo +
    '<div class="fp-escola"><strong>' + esc(escola.nome || 'Nome da escola') + '</strong>' +
    '<span>' + esc(escola.endereco || 'Informe a escola na página “Escola &amp; logo”') + '</span></div>' +
    '<div class="fp-doc"><strong>Ficha de aula</strong><span>Matemática Viva</span></div></div>';
}

function atualizarPreview() {
  const alvo = document.getElementById('previa-ficha');
  if (!alvo) return;
  const nome = document.getElementById('esc-nome');
  if (nome && !nome.value && escola.nome) nome.value = escola.nome;
  const end = document.getElementById('esc-endereco');
  if (end && !end.value && escola.endereco) end.value = escola.endereco;
  const dis = document.getElementById('esc-disciplina');
  if (dis && escola.disciplina) dis.value = escola.disciplina;
  const tur = document.getElementById('esc-turma');
  if (tur && escola.turma) tur.value = escola.turma;

  alvo.innerHTML = cabecalhoFolha() +
    '<table class="fp-meta"><tr>' +
    '<td><b>Professor(a):</b> ' + esc(usuarioLogado ? usuarioLogado.nome : '—') + '</td>' +
    '<td><b>Disciplina:</b> ' + esc(escola.disciplina || 'Matemática') + '</td></tr><tr>' +
    '<td><b>Série / Turma:</b> ' + esc(escola.turma || '—') + '</td>' +
    '<td><b>Data:</b> __/__/____</td></tr></table>' +
    '<div class="fp-titulo" style="font-size:15pt;">Título da aula aparece aqui</div>' +
    '<div class="fp-secao"><h2>Objetivo de aprendizagem</h2><p>Este é o exemplo de como o conteúdo será impresso na folha A4 do aluno.</p></div>';
  tipar(alvo);
}

/* ---------- 5. Figuras TikZ + MathJax ---------- */
function montarBibliotecaFiguras() {
  const lib = document.getElementById('biblioteca-figuras');
  if (!lib) return;
  Object.keys(FIGURAS).forEach(function (id) {
    const caixa = document.createElement('div');
    caixa.setAttribute('data-figura', id);
    caixa.hidden = true;
    const s = document.createElement('script');
    s.type = 'text/tikz';
    s.textContent = FIGURAS[id].tikz;
    caixa.appendChild(s);
    lib.appendChild(caixa);
  });
}

function renderizarFigura(id, alvo, silencioso) {
  if (!alvo || !id) return;
  alvo.setAttribute('data-figura-alvo', id);
  const caixa = document.querySelector('#biblioteca-figuras [data-figura="' + id + '"]');
  const svg = caixa ? caixa.querySelector('svg') : null;
  if (svg) {
    if (alvo.dataset.pronto === id && alvo.firstElementChild) return;
    alvo.innerHTML = '';
    const clone = svg.cloneNode(true);
    clone.removeAttribute('style');
    alvo.appendChild(clone);
    alvo.dataset.pronto = id;
  } else if (!silencioso) {
    alvo.innerHTML = '<div class="figura-espera">⏳ Gerando a figura com código LaTeX…</div>';
  }
}

function observarFiguras() {
  const lib = document.getElementById('biblioteca-figuras');
  if (!lib || !window.MutationObserver) return;
  const obs = new MutationObserver(function () {
    document.querySelectorAll('[data-figura-alvo]').forEach(function (alvo) {
      const id = alvo.getAttribute('data-figura-alvo');
      if (id) renderizarFigura(id, alvo, true);
    });
  });
  obs.observe(lib, { childList: true, subtree: true });

  setTimeout(function () {
    document.querySelectorAll('.figura-espera').forEach(function (el) {
      el.outerHTML = '<div class="figura-erro">⚠️ A figura não pôde ser carregada (verifique a conexão). Use o botão “ver código LaTeX” para copiar o código TikZ.</div>';
    });
  }, 25000);
}

function tipar(el) {
  if (!el) return Promise.resolve();
  if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
    return MathJax.typesetPromise([el]).catch(function () { });
  }
  return Promise.resolve();
}

/* ---------- 6. Gerador de aulas ---------- */
function etiquetaSerie(s) {
  if (s === 'em1') return '1º ano — EM';
  if (s === 'em2') return '2º ano — EM';
  if (s === 'em3') return '3º ano — EM';
  return s + 'º ano';
}

function atualizarConteudos() {
  const selSerie = document.getElementById('serie-aula');
  if (!selSerie) return;
  if (!selSerie.options.length) {
    SERIES.forEach(function (s) {
      const o = document.createElement('option');
      o.value = s[0]; o.textContent = s[1];
      selSerie.appendChild(o);
    });
  }
  const selConteudo = document.getElementById('conteudo-aula');
  const opcoes = CONTEUDOS[selSerie.value] || {};
  selConteudo.innerHTML = '';
  Object.keys(opcoes).forEach(function (chave) {
    const o = document.createElement('option');
    o.value = chave; o.textContent = opcoes[chave].titulo;
    selConteudo.appendChild(o);
  });
  if (!document.getElementById('campo-turma').value && escola.turma) {
    document.getElementById('campo-turma').value = escola.turma;
  }
}

function gerarAula() {
  const serie = document.getElementById('serie-aula').value;
  const conteudo = document.getElementById('conteudo-aula').value;
  if (!CONTEUDOS[serie] || !CONTEUDOS[serie][conteudo]) { alert('Selecione uma série e um conteúdo válidos.'); return; }
  const dado = CONTEUDOS[serie][conteudo];

  const aula = {
    id: 'a' + Date.now(),
    serie: serie, conteudo: conteudo, area: dado.area,
    titulo: dado.titulo, objetivo: dado.objetivo, explicacao: dado.explicacao.slice(),
    figura: dado.figura || null, exemplo: dado.exemplo,
    exercicio: { tipo: dado.exercicio.tipo, dica: dado.exercicio.dica },
    turma: valorDe('campo-turma'), data: valorDe('campo-data') || dataHoje(),
    criadoEm: Date.now()
  };
  aulasGeradas.push(aula);
  gravar(CHAVES.aulas, aulasGeradas);
  exibirAula(aula);
  atualizarPainelProfessor();
}

function exibirAula(aula) {
  aulaAtual = aula;
  document.getElementById('tag-serie').textContent = etiquetaSerie(aula.serie);
  document.getElementById('tag-area').textContent = aula.area;
  document.getElementById('tag-data').textContent = aula.data || dataHoje();
  document.getElementById('titulo-aula').textContent = aula.titulo;
  document.getElementById('objetivo-aula').textContent = aula.objetivo;
  document.getElementById('explicacao-aula').innerHTML = aula.explicacao.map(function (p) { return '<p>' + p + '</p>'; }).join('');

  const areaFigura = document.getElementById('figura-aula');
  const legenda = document.getElementById('figura-legenda');
  const codigo = document.getElementById('codigo-latex');
  if (aula.figura && FIGURAS[aula.figura]) {
    areaFigura.setAttribute('data-figura-alvo', aula.figura);
    delete areaFigura.dataset.pronto;
    renderizarFigura(aula.figura, areaFigura, false);
    legenda.textContent = FIGURAS[aula.figura].legenda;
    codigo.textContent = FIGURAS[aula.figura].tikz.trim();
  } else {
    areaFigura.removeAttribute('data-figura-alvo');
    areaFigura.innerHTML = '<div class="figura-erro">Esta aula não possui figura geométrica.</div>';
    legenda.textContent = ''; codigo.textContent = '';
  }

  document.getElementById('exemplo-titulo').textContent = aula.exemplo.titulo;
  document.getElementById('exemplo-passos').innerHTML = aula.exemplo.passos.map(function (p) { return '<li>' + p + '</li>'; }).join('');
  document.getElementById('exemplo-resultado').innerHTML = aula.exemplo.resultado;
  document.getElementById('dica-exercicio').textContent = aula.exercicio.dica;
  document.getElementById('codigo-latex').hidden = true;

  montarExercicio(aula.exercicio.tipo);
  const card = document.getElementById('resultado-aula');
  card.hidden = false;
  tipar(card);
}

function fecharAula() {
  document.getElementById('resultado-aula').hidden = true;
  aulaAtual = null;
}

function montarExercicio(tipo) {
  tipoExercicioAtual = tipo;
  const gerador = EXERCICIOS[tipo];
  exercicioAtual = gerador ? gerador() : { enunciado: 'Exercício em preparação.', resposta: '', gabarito: '' };
  const area = document.getElementById('area-exercicio');
  area.innerHTML =
    '<div class="enunciado">' + exercicioAtual.enunciado + '</div>' +
    '<input type="text" class="campo-resposta" id="campo-resposta" placeholder="Sua resposta" autocomplete="off">' +
    '<div class="feedback" id="mensagem-feedback"></div>' +
    '<div class="acoes-exercicio">' +
    '<button class="btn btn-primario btn-sm" onclick="verificarResposta()">Verificar</button>' +
    '<button class="btn btn-secundario btn-sm" onclick="novoExercicio()">Novo exercício</button>' +
    '</div>';
  tipar(area);
}

function verificarResposta() {
  const input = document.getElementById('campo-resposta');
  const feedback = document.getElementById('mensagem-feedback');
  if (!input || !feedback || !exercicioAtual) return;
  if (conferir(input.value, exercicioAtual.resposta)) {
    feedback.textContent = '✅ Correto! Parabéns.';
    feedback.className = 'feedback ok';
    exerciciosResolvidos++; acertosJogo++;
    gravar(CHAVES.exercicios, exerciciosResolvidos);
    gravar(CHAVES.acertos, acertosJogo);
    atualizarPainelEstudante();
  } else {
    feedback.textContent = '❌ Ainda não. Tente novamente.';
    feedback.className = 'feedback erro';
  }
}

function novoExercicio() { if (tipoExercicioAtual) montarExercicio(tipoExercicioAtual); }

function alternarCodigoLaTeX() {
  const pre = document.getElementById('codigo-latex');
  if (!pre || !pre.textContent) { alert('Esta aula não possui figura com código TikZ.'); return; }
  pre.hidden = !pre.hidden;
  if (!pre.hidden) pre.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copiarLaTeX() {
  if (!aulaAtual || !aulaAtual.figura || !FIGURAS[aulaAtual.figura]) {
    alert('Esta aula não possui figura geométrica com código LaTeX/TikZ.');
    return;
  }
  const codigo = FIGURAS[aulaAtual.figura].tikz.trim();
  const aoCopiar = function () { alert('Código LaTeX (TikZ) copiado para a área de transferência!'); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(codigo).then(aoCopiar).catch(function () { copiarAntigo(codigo, aoCopiar); });
  } else { copiarAntigo(codigo, aoCopiar); }
}

function copiarAntigo(texto, aoCopiar) {
  const ta = document.createElement('textarea');
  ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); aoCopiar(); } catch (e) { alert('Não foi possível copiar.'); }
  document.body.removeChild(ta);
}

/* ---------- 7. Impressão A4 ---------- */
function imprimirAulaSalva(id) {
  const aula = aulasGeradas.find(function (a) { return a.id === id; });
  if (!aula) return;
  aulaAtual = aula;
  imprimirAula();
}

function imprimirAula() {
  if (!aulaAtual) { alert('Gere ou abra uma aula antes de imprimir.'); return; }
  const folha = document.getElementById('folha-impressao');
  folha.innerHTML = montarFolha(aulaAtual);

  const alvo = folha.querySelector('[data-figura-alvo]');
  if (alvo && aulaAtual.figura) {
    const origem = document.getElementById('figura-aula');
    const svg = origem ? origem.querySelector('svg') : null;
    if (svg) { alvo.innerHTML = ''; alvo.appendChild(svg.cloneNode(true)); alvo.dataset.pronto = aulaAtual.figura; }
    else renderizarFigura(aulaAtual.figura, alvo, false);
  }
  tipar(folha).then(function () { setTimeout(function () { window.print(); }, 150); });
}

function montarFolha(aula) {
  const professor = usuarioLogado ? usuarioLogado.nome : '—';
  const disciplina = escola.disciplina || 'Matemática';
  const serie = etiquetaSerie(aula.serie);
  const turma = aula.turma || escola.turma || '';
  const data = aula.data || dataHoje();
  const fig = aula.figura ? FIGURAS[aula.figura] : null;

  const gerador = EXERCICIOS[aula.exercicio.tipo];
  const exercicios = [];
  for (let i = 0; i < 3; i++) exercicios.push(gerador ? gerador() : null);

  let h = cabecalhoFolha();
  h += '<table class="fp-meta">' +
    '<tr><td><b>Professor(a):</b> ' + esc(professor) + '</td><td><b>Disciplina:</b> ' + esc(disciplina) + '</td></tr>' +
    '<tr><td><b>Série / Turma:</b> ' + esc(serie) + (turma ? ' — ' + esc(turma) : '') + '</td>' +
    '<td><b>Data:</b> ' + esc(data) + '</td></tr>' +
    '<tr><td colspan="2"><b>Nome do aluno:</b> <span class="fp-linha">__________________________________________</span></td></tr>' +
    '</table>';

  h += '<h1 class="fp-titulo">' + esc(aula.titulo) + '</h1>';
  h += '<div class="fp-tags">' + esc(aula.area) + ' · ' + esc(serie) + ' · ' + esc(data) + '</div>';

  h += '<div class="fp-secao"><h2>Objetivo de aprendizagem</h2><p>' + esc(aula.objetivo) + '</p></div>';
  h += '<div class="fp-secao"><h2>Explicação</h2>' +
    aula.explicacao.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>';

  if (fig) {
    h += '<div class="fp-secao"><h2>Figura geométrica</h2>' +
      '<div class="fp-figura"><div data-figura-alvo="' + aula.figura + '"></div>' +
      '<div class="fp-legenda">' + esc(fig.legenda) + '</div></div></div>';
  }

  h += '<div class="fp-secao"><h2>Exemplo resolvido</h2><div class="fp-exemplo">' +
    '<strong class="tit">' + esc(aula.exemplo.titulo) + '</strong><ol>' +
    aula.exemplo.passos.map(function (p) { return '<li>' + p + '</li>'; }).join('') +
    '</ol><div class="fp-resultado">' + aula.exemplo.resultado + '</div></div></div>';

  h += '<div class="fp-secao fp-exercicios"><h2>Exercícios — responda no espaço indicado</h2>';
  exercicios.forEach(function (ex, i) {
    if (!ex) return;
    h += '<div class="fp-exercicio"><span class="num">' + (i + 1) + '.</span> ' + ex.enunciado +
      '<div class="fp-resposta"><span class="linha"></span><span class="linha"></span></div></div>';
  });
  h += '</div>';

  const gabaritos = exercicios.filter(Boolean);
  if (gabaritos.length) {
    h += '<div class="fp-gabarito"><h2>Gabarito (uso do professor)</h2><ol>' +
      gabaritos.map(function (ex) { return '<li>' + ex.gabarito + '</li>'; }).join('') + '</ol></div>';
  }

  h += '<div class="fp-rodape"><span>Matemática Viva — ferramenta gratuita para professores</span>' +
    '<span>' + esc(escola.nome || '') + (escola.nome ? ' · ' : '') + 'gerado em ' + dataHoje() + '</span></div>';
  return h;
}

/* ---------- 8. Painéis ---------- */
function atualizarPainelProfessor() {
  if (!usuarioLogado || usuarioLogado.papel !== 'professor') return;
  document.getElementById('nome-professor').textContent = usuarioLogado.nome;

  const chip = document.getElementById('chip-escola');
  if (escola.nome) { chip.hidden = false; document.getElementById('chip-escola-nome').textContent = escola.nome; }
  else chip.hidden = true;

  document.getElementById('stat-aulas').textContent = aulasGeradas.length;
  document.getElementById('stat-conteudos').textContent = aulasGeradas.reduce(function (acc, a) {
    const chave = a.serie + '|' + a.conteudo;
    if (acc.indexOf(chave) < 0) acc.push(chave);
    return acc;
  }, []).length;
  document.getElementById('stat-series').textContent = aulasGeradas.reduce(function (acc, a) {
    if (acc.indexOf(a.serie) < 0) acc.push(a.serie);
    return acc;
  }, []).length;
  document.getElementById('stat-escola').textContent = escola.nome ? '✓ Sim' : '— Não';

  document.getElementById('contador-aulas').textContent =
    aulasGeradas.length + (aulasGeradas.length === 1 ? ' aula' : ' aulas');

  const lista = document.getElementById('lista-aulas-professor');
  if (!aulasGeradas.length) {
    lista.innerHTML = '<div class="vazio"><span class="vazio-icone">📭</span>' +
      '<p>Nenhuma aula gerada ainda.</p><small>Clique em “Gerar nova aula” para criar conteúdo para seus alunos.</small></div>';
    return;
  }
  lista.innerHTML = aulasGeradas.slice().reverse().map(function (a) {
    const meta = etiquetaSerie(a.serie) + (a.turma ? ' · ' + esc(a.turma) : '') + ' · ' + (a.data || '');
    return '<div class="item-aula">' +
      '<div class="item-aula-info" onclick="abrirAulaSalva(\'' + a.id + '\')">' +
      '<div class="item-aula-area">' + esc(a.area) + '</div>' +
      '<div class="item-aula-titulo">' + esc(a.titulo) + '</div>' +
      '<div class="item-aula-meta">' + meta + '</div></div>' +
      '<div class="item-aula-acoes">' +
      '<button class="btn btn-secundario btn-sm" onclick="abrirAulaSalva(\'' + a.id + '\')">Abrir</button>' +
      '<button class="btn btn-primario btn-sm" onclick="imprimirAulaSalva(\'' + a.id + '\')">🖨️ Imprimir</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="excluirAula(\'' + a.id + '\')">Excluir</button>' +
      '</div></div>';
  }).join('');
}

function abrirAulaSalva(id) {
  const aula = aulasGeradas.find(function (a) { return a.id === id; });
  if (!aula) return;
  navegar('gerador');
  exibirAula(aula);
}

function excluirAula(id) {
  const aula = aulasGeradas.find(function (a) { return a.id === id; });
  if (!aula) return;
  if (!confirm('Excluir a aula “' + aula.titulo + '”?')) return;
  aulasGeradas = aulasGeradas.filter(function (a) { return a.id !== id; });
  gravar(CHAVES.aulas, aulasGeradas);
  if (aulaAtual && aulaAtual.id === id) fecharAula();
  atualizarPainelProfessor();
}

function atualizarPainelEstudante() {
  if (!usuarioLogado || usuarioLogado.papel !== 'estudante') return;
  document.getElementById('nome-estudante').textContent = usuarioLogado.nome.split(' ')[0];
  document.getElementById('stat-exercicios').textContent = exerciciosResolvidos;
  document.getElementById('stat-pontos').textContent = pontosJogo;
  const pct = exerciciosResolvidos === 0 ? 0 : Math.round((acertosJogo / exerciciosResolvidos) * 100);
  document.getElementById('stat-acertos').textContent = pct + '%';
}
