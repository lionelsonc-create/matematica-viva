import { useEffect, useRef, useState, type ReactNode } from 'react'

/* =========================================================
   Figuras geométricas desenhadas com código LaTeX (TikZ)
   ---------------------------------------------------------
   O TikZJax compila, no próprio navegador, os <script type="text/tikz">
   que existirem no DOM quando a página termina de carregar (window.load).
   Por isso a biblioteca é montada de forma síncrona na importação deste
   módulo — antes do evento load — e os SVGs prontos são apenas
   clonados para onde a interface precisa.
   ========================================================= */

export interface TikzDef {
  id: string
  name: string
  group: 'Fundamentos' | 'Geometria' | 'Gráficos'
  legend: string
  code: string
}

export const TIKZ_FIGURES: TikzDef[] = [
  {
    id: 'reta',
    name: 'Reta numérica',
    group: 'Fundamentos',
    legend: 'A reta numérica organiza os números: os menores à esquerda e os maiores à direita.',
    code: String.raw`
\begin{tikzpicture}[scale=0.95]
  \draw[->, thick, blue!65!black] (-3.7,0) -- (3.7,0);
  \foreach \x in {-3,...,3} {
    \draw[thick] (\x,0.15) -- (\x,-0.15) node[below, font=\small] {$\x$};
  }
  \fill[red!75!black] (2,0) circle (3.2pt);
  \node[above, font=\small] at (2,0.32) {$2$};
\end{tikzpicture}`,
  },
  {
    id: 'fracao',
    name: 'Fração visual',
    group: 'Fundamentos',
    legend: 'Dividir o inteiro em partes iguais ajuda a visualizar a fração: aqui, 2 de 6 partes estão destacadas.',
    code: String.raw`
\begin{tikzpicture}[scale=1.15]
  \foreach \a in {0,60,...,300} \draw[gray!55] (0,0) -- (\a:1.5);
  \draw[thick, fill=orange!45] (0,0) -- (0:1.5) arc (0:120:1.5) -- cycle;
  \draw[thick] (0,0) circle (1.5);
  \node[font=\small] at (75:0.9) {$\frac{2}{6}$};
\end{tikzpicture}`,
  },
  {
    id: 'porcentagem',
    name: 'Grade de porcentagem',
    group: 'Fundamentos',
    legend: 'Cada quadrado da grade representa 1% do total: 70 pintados correspondem a 70%.',
    code: String.raw`
\begin{tikzpicture}[scale=0.44]
  \fill[blue!30] (0,0) rectangle (7,10);
  \draw[step=1, gray!55, thin] (0,0) grid (10,10);
  \draw[thick] (0,0) rectangle (10,10);
  \node[font=\small] at (5,-1.7) {$70\%$ pintados de $100$};
\end{tikzpicture}`,
  },
  {
    id: 'setores',
    name: 'Setores e probabilidade',
    group: 'Fundamentos',
    legend: 'A probabilidade pode ser lida como a fatia favorável em relação ao inteiro.',
    code: String.raw`
\begin{tikzpicture}[scale=1.15]
  \draw[thick, fill=violet!15] (0,0) -- (0:1.6) arc (0:90:1.6) -- cycle;
  \draw[thick] (0,0) circle (1.6);
  \fill (0,0) circle (2.6pt);
  \node[font=\small] at (46:0.95) {$\frac{1}{4}$};
\end{tikzpicture}`,
  },
  {
    id: 'intervalo',
    name: 'Intervalo na reta real',
    group: 'Fundamentos',
    legend: 'Intervalo [1 ; 4): o ponto chechado inclui o 1 e o ponto vazio exclui o 4.',
    code: String.raw`
\begin{tikzpicture}[scale=0.95]
  \draw[->, thick, blue!65!black] (-1.5,0) -- (6.2,0);
  \foreach \x in {0,...,5} \draw[thick] (\x,0.15) -- (\x,-0.15) node[below, font=\small] {$\x$};
  \draw[red!75!black, line width=2.8pt] (1,0) -- (4,0);
  \fill[red!75!black] (1,0) circle (4.6pt);
  \draw[fill=white, thick] (4,0) circle (4.6pt);
  \node[above, font=\small] at (2.5,0.28) {$[1\,;\,4)$};
\end{tikzpicture}`,
  },
  {
    id: 'equacao',
    name: 'Equação do 1º grau',
    group: 'Fundamentos',
    legend: 'Resolver uma equação é isolar a incógnita aplicando a operação inversa nos dois lados.',
    code: String.raw`
\begin{tikzpicture}[scale=1.05]
  \node[draw, thick, rounded corners, fill=blue!10, minimum size=1.15cm] at (0,0) {$x$};
  \node at (1.45,0) {$+$};
  \node[draw, thick, rounded corners, fill=blue!10, minimum size=1.15cm] at (2.7,0) {$5$};
  \node at (4.05,0) {$=$};
  \node[draw, thick, rounded corners, fill=green!15, minimum size=1.15cm] at (5.35,0) {$12$};
  \node[font=\small, red!70!black] at (2.7,1.3) {$-5$};
  \draw[->, thick, red!70!black] (2.7,1.1) -- (2.7,0.75);
\end{tikzpicture}`,
  },
  {
    id: 'retangulo',
    name: 'Retângulo: área e perímetro',
    group: 'Geometria',
    legend: 'O perímetro é a soma dos lados; a área é o produto da base pela altura.',
    code: String.raw`
\begin{tikzpicture}
  \draw[thick, fill=blue!8] (0,0) rectangle (4.6,2.7);
  \node[below, font=\small] at (2.3,0) {$a = 7$ cm};
  \node[left, font=\small] at (0,1.35) {$b = 4$ cm};
  \node[font=\small] at (2.3,1.35) {$A = a \cdot b$};
\end{tikzpicture}`,
  },
  {
    id: 'triangulo',
    name: 'Triângulo retângulo',
    group: 'Geometria',
    legend: 'No triângulo retângulo, c é a hipotenusa (lado oposto ao ângulo reto) e a, b são os catetos.',
    code: String.raw`
\begin{tikzpicture}[scale=1.15]
  \draw[thick, fill=teal!10] (0,0) -- (4.4,0) -- (0,3.3) -- cycle;
  \draw (0.35,0) -- (0.35,0.35) -- (0,0.35);
  \node[below, font=\small] at (2.2,0) {$a$};
  \node[left, font=\small] at (0,1.65) {$b$};
  \node[above right, font=\small] at (1.9,1.55) {$c$};
  \fill (0,0) circle (2.4pt);
\end{tikzpicture}`,
  },
  {
    id: 'angulo',
    name: 'Ângulo e sua medida',
    group: 'Geometria',
    legend: 'Um ângulo agudo mede menos de 90 graus; aqui, 65°.',
    code: String.raw`
\begin{tikzpicture}[scale=1.1]
  \draw[thick] (0,0) -- (4.3,0);
  \draw[thick] (0,0) -- (65:4.3);
  \draw[red!75!black, thick] (1.6,0) arc (0:65:1.6);
  \node[below right, font=\small] at (1.9,0.3) {$65^\circ$};
  \fill (0,0) circle (2.6pt);
\end{tikzpicture}`,
  },
  {
    id: 'circulo',
    name: 'Círculo e raio',
    group: 'Geometria',
    legend: 'O círculo é o conjunto dos pontos que distam r do centro O.',
    code: String.raw`
\begin{tikzpicture}[scale=1.15]
  \draw[thick, fill=blue!7] (0,0) circle (1.7);
  \fill (0,0) circle (3pt) node[below left, font=\small] {$O$};
  \draw[red!70!black, thick] (0,0) -- (45:1.7);
  \node[above right, font=\small] at (22:1) {$r$};
  \draw[thick] (0,0) -- (165:1.7);
  \node[above left, font=\small] at (165:1.15) {$r$};
\end{tikzpicture}`,
  },
  {
    id: 'escala',
    name: 'Escala de desenho',
    group: 'Geometria',
    legend: 'Escala 1 : 3 — cada centímetro do desenho representa 3 centímetros reais.',
    code: String.raw`
\begin{tikzpicture}[scale=0.95]
  \draw[thick, fill=blue!8] (0,0) rectangle (2,1.2);
  \node[below, font=\small] at (1,0) {1 cm};
  \draw[thick, fill=blue!22] (3.6,0) rectangle (9.6,3.6);
  \node[below, font=\small] at (6.6,0) {3 cm};
  \draw[->, thick, gray!60!black] (2.5,1.9) -- (3.2,1.9);
  \node[above, font=\small] at (2.85,2.05) {$\times 3$};
\end{tikzpicture}`,
  },
  {
    id: 'trig',
    name: 'Razões trigonométricas',
    group: 'Geometria',
    legend: 'As razões trigonométricas relacionam os lados do triângulo retângulo com o ângulo.',
    code: String.raw`
\begin{tikzpicture}[scale=1.2]
  \draw[thick, fill=amber!15] (0,0) -- (4.6,0) -- (4.6,3.1) -- cycle;
  \draw (4.25,0) -- (4.25,0.35) -- (4.6,0.35);
  \draw[red!70!black, thick] (1.3,0) arc (0:34:1.3);
  \node[below right, font=\small] at (1.6,0.32) {$\theta$};
  \node[below, font=\small] at (2.3,0) {adjacente};
  \node[right, font=\small] at (4.6,1.55) {oposto};
  \node[above left, font=\small] at (2.2,1.5) {hipotenusa};
\end{tikzpicture}`,
  },
  {
    id: 'plano',
    name: 'Plano cartesiano',
    group: 'Gráficos',
    legend: 'Plano cartesiano: cada ponto é definido pelo par ordenado (x, y).',
    code: String.raw`
\begin{tikzpicture}[scale=0.62]
  \draw[step=1, gray!35, thin] (-4,-3) grid (4,3);
  \draw[->, thick] (-4.7,0) -- (4.7,0) node[right] {$x$};
  \draw[->, thick] (0,-3.7) -- (0,3.7) node[above] {$y$};
  \fill[red!75!black] (2,1.5) circle (4pt) node[above right, font=\small] {$P(2;1{,}5)$};
  \node[below right, font=\small] at (0.2,0.15) {$O$};
\end{tikzpicture}`,
  },
  {
    id: 'parabola',
    name: 'Parábola (função do 2º grau)',
    group: 'Gráficos',
    legend: 'Gráfico da parábola f(x) = x² − 4x + 3, com vértice em (2, −1) e zeros em 1 e 3.',
    code: String.raw`
\begin{tikzpicture}[scale=0.88]
  \draw[->, thick] (-1.3,0) -- (5.5,0) node[right] {$x$};
  \draw[->, thick] (0,-2.5) -- (0,4.6) node[above] {$y$};
  \draw[domain=-1.1:5.2, smooth, variable=\x, red!70!black, thick] plot (\x, {\x*\x-4*\x+3});
  \fill (2,-1) circle (3.2pt) node[below right, font=\small] {$V(2,-1)$};
  \fill (1,0) circle (3.2pt) node[below, font=\small] {$1$};
  \fill (3,0) circle (3.2pt) node[below, font=\small] {$3$};
  \node[above left, font=\small] at (0.6,4) {$f(x)=x^{2}-4x+3$};
\end{tikzpicture}`,
  },
  {
    id: 'retaGrafico',
    name: 'Reta (função do 1º grau)',
    group: 'Gráficos',
    legend: 'Gráfico de uma função do 1º grau: a reta sobe quando o coeficiente angular é positivo.',
    code: String.raw`
\begin{tikzpicture}[scale=0.88]
  \draw[->, thick] (-1.5,0) -- (5.6,0) node[right] {$x$};
  \draw[->, thick] (0,-2.6) -- (0,4.6) node[above] {$y$};
  \draw[domain=-1.3:5.3, smooth, variable=\x, blue!65!black, thick] plot (\x, {1.2*\x-1});
  \fill (0,-1) circle (3.2pt) node[below left, font=\small] {$B(0,-1)$};
  \fill (0.83,0) circle (3.2pt) node[below, font=\small] {$A$};
  \node[above left, font=\small] at (4.7,4.3) {$y=1{,}2x-1$};
\end{tikzpicture}`,
  },
  {
    id: 'exponencial',
    name: 'Crescimento exponencial',
    group: 'Gráficos',
    legend: 'Crescimento exponencial: a cada passo o valor é multiplicado pela mesma razão.',
    code: String.raw`
\begin{tikzpicture}[scale=0.88]
  \draw[->, thick] (-0.5,0) -- (6.5,0) node[right] {$x$};
  \draw[->, thick] (0,-1.3) -- (0,5.5) node[above] {$y$};
  \draw[domain=-0.4:4.6, smooth, variable=\x, teal!70!black, thick] plot (\x, {0.55*2^{\x}});
  \node[above right, font=\small] at (2.9,3.4) {$f(x)=a\cdot b^{x}$};
\end{tikzpicture}`,
  },
  {
    id: 'barras',
    name: 'Gráfico de barras',
    group: 'Gráficos',
    legend: 'Diagrama de barras: a altura de cada barra representa a frequência de cada categoria.',
    code: String.raw`
\begin{tikzpicture}[scale=0.92]
  \draw[->, thick] (0,0) -- (7.8,0);
  \draw[->, thick] (0,0) -- (0,5.5);
  \fill[blue!45] (0.6,0) rectangle (1.7,3);
  \fill[blue!45] (2.5,0) rectangle (3.6,4.6);
  \fill[blue!45] (4.4,0) rectangle (5.5,2);
  \fill[blue!45] (6.3,0) rectangle (7.4,3.6);
  \node[below, font=\small] at (1.15,0) {$A$};
  \node[below, font=\small] at (3.05,0) {$B$};
  \node[below, font=\small] at (4.95,0) {$C$};
  \node[below, font=\small] at (6.85,0) {$D$};
  \node[rotate=90, font=\small] at (-0.65,2.7) {frequencia};
\end{tikzpicture}`,
  },
]

/* ---------------- Biblioteca compilada no carregamento ---------------- */

const LIB_ID = 'tikz-figure-library'
const listeners = new Set<() => void>()
let iniciado = false

function avisar() {
  listeners.forEach((fn) => fn())
}

export function bootstrapTikz(): void {
  if (iniciado || typeof document === 'undefined') return
  iniciado = true

  let lib = document.getElementById(LIB_ID)
  if (!lib) {
    lib = document.createElement('div')
    lib.id = LIB_ID
    lib.setAttribute('aria-hidden', 'true')
    lib.style.display = 'none'
    document.body.appendChild(lib)
  }

  TIKZ_FIGURES.forEach((fig) => {
    const box = document.createElement('div')
    box.setAttribute('data-fig', fig.id)
    const script = document.createElement('script')
    script.type = 'text/tikz'
    script.textContent = fig.code
    box.appendChild(script)
    lib.appendChild(box)
  })

  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(() => avisar()).observe(lib, { childList: true, subtree: true })
  }
  // Rede de segurança: se o TikZJax não carregar, avisamos os componentes.
  window.setTimeout(() => avisar(), 25000)
}

export function subscribeTikz(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function getTikzSvg(id: string): SVGSVGElement | null {
  const lib = document.getElementById(LIB_ID)
  if (!lib) return null
  const box = lib.querySelector('[data-fig="' + id + '"]')
  return box ? box.querySelector('svg') : null
}

// Monta a biblioteca assim que o módulo é importado (antes do window.load)
bootstrapTikz()

/* ---------------- Componentes ---------------- */

export function TikzFigure({
  id,
  className,
  minHeight = 170,
}: {
  id: string
  className?: string
  minHeight?: number
}) {
  const host = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'gerando' | 'pronto' | 'erro'>('gerando')

  useEffect(() => {
    let cancelado = false

    const tentar = (): boolean => {
      const svg = getTikzSvg(id)
      if (!svg || !host.current || cancelado) return Boolean(svg)
      host.current.innerHTML = ''
      const clone = svg.cloneNode(true) as SVGSVGElement
      host.current.appendChild(clone)
      setStatus('pronto')
      return true
    }

    if (tentar()) return () => { cancelado = true }

    setStatus('gerando')
    const unsubscribe = subscribeTikz(() => {
      if (tentar()) unsubscribe()
    })
    const timer = window.setTimeout(() => {
      if (!cancelado) setStatus((atual) => (atual === 'pronto' ? atual : 'erro'))
    }, 30000)

    return () => {
      cancelado = true
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [id])

  return (
    <div className={className}>
      <div
        ref={host}
        className="tikz-host"
        data-status={status}
        style={{ display: status === 'pronto' ? 'block' : 'none', minHeight }}
      />
      {status !== 'pronto' && (
        <div className="tikz-placeholder" style={{ minHeight }}>
          {status === 'gerando'
            ? '⏳ Gerando a figura com código LaTeX…'
            : '⚠️ Figura indisponível no momento (verifique a conexão). O código TikZ está ao lado.'}
        </div>
      )}
    </div>
  )
}

interface MathJaxApi {
  typesetPromise?: (elements: Element[]) => Promise<void>
  typesetClear?: (elements: Element[]) => void
}

async function esperarMathJax(timeout = 10000): Promise<MathJaxApi | null> {
  const inicio = Date.now()
  while (Date.now() - inicio < timeout) {
    const mj = (window as unknown as { MathJax?: MathJaxApi }).MathJax
    if (mj && typeof mj.typesetPromise === 'function') return mj
    await new Promise((resolve) => window.setTimeout(resolve, 120))
  }
  return null
}

/** Renderiza uma fórmula escrita em LaTeX (ex.: \frac{a}{b} ou x = \frac{-b \pm \sqrt{\Delta}}{2a}). */
export function Latex({
  children,
  display = false,
  className,
}: {
  children: string
  display?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelado = false
    void (async () => {
      const alvo = ref.current
      if (!alvo) return
      alvo.textContent = display ? '$$' + children + '$$' : '$' + children + '$'
      const mj = await esperarMathJax()
      if (cancelado || !mj || !ref.current) return
      try {
        mj.typesetClear?.([ref.current])
        await mj.typesetPromise?.([ref.current])
      } catch {
        /* mantém o texto original caso o MathJax falhe */
      }
    })()
    return () => {
      cancelado = true
    }
  }, [children, display])

  return <div ref={ref} className={className} />
}

/** Copia um texto para a área de transferência (com plano B antigo). */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto)
      return true
    }
  } catch {
    /* cai no plano B */
  }
  try {
    const area = document.createElement('textarea')
    area.value = texto
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

export function FórmulasPopulares(): { titulo: string; latex: string; nota: string }[] {
  return [
    { titulo: 'Teorema de Pitágoras', latex: 'c^{2} = a^{2} + b^{2}', nota: 'Relaciona hipotenusa e catetos' },
    { titulo: 'Fórmula de Bhaskara', latex: 'x = \\frac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}', nota: 'Raízes do 2º grau' },
    { titulo: 'Área do círculo', latex: 'A = \\pi r^{2}', nota: 'Com raio r' },
    { titulo: 'Soma de frações', latex: '\\frac{a}{b} + \\frac{c}{b} = \\frac{a+c}{b}', nota: 'Mesmo denominador' },
    { titulo: 'Função do 1º grau', latex: 'f(x) = ax + b', nota: 'Reta com inclinação a' },
    { titulo: 'Porcentagem', latex: 'p\\% \\text{ de } N = \\frac{p}{100} \\cdot N', nota: 'Cálculo rápido' },
  ]
}

export type { ReactNode }
