/* =========================================================
   FIGURAS GEOMÉTRICAS EM CÓDIGO LaTeX / TikZ
   Cada entrada abaixo é compilada pelo TikZJax no carregamento
   da página e vira um SVG pronto para a ficha impressa.
   ========================================================= */
const FIGURAS = {

  reta: {
    legenda: 'A reta numérica organiza os números: os menores à esquerda e os maiores à direita.',
    tikz: String.raw`
\begin{tikzpicture}[scale=0.95]
  \draw[->, thick, blue!65!black] (-3.7,0) -- (3.7,0);
  \foreach \x in {-3,...,3} {
    \draw[thick] (\x,0.15) -- (\x,-0.15) node[below, font=\small] {$\x$};
  }
  \fill[red!75!black] (2,0) circle (3.2pt);
  \node[above, font=\small] at (2,0.32) {$2$};
\end{tikzpicture}`
  },

  fracao: {
    legenda: 'Dividir o inteiro em partes iguais ajuda a visualizar a fração: aqui, 2 de 6 partes estão destacadas.',
    tikz: String.raw`
\begin{tikzpicture}[scale=1.15]
  \foreach \a in {0,60,...,300} \draw[gray!55] (0,0) -- (\a:1.5);
  \draw[thick, fill=orange!45] (0,0) -- (0:1.5) arc (0:120:1.5) -- cycle;
  \draw[thick] (0,0) circle (1.5);
  \node[font=\small] at (75:0.9) {$\frac{2}{6}$};
\end{tikzpicture}`
  },

  retangulo: {
    legenda: 'O perímetro é a soma dos lados; a área é o produto da base pela altura.',
    tikz: String.raw`
\begin{tikzpicture}
  \draw[thick, fill=blue!8] (0,0) rectangle (4.6,2.7);
  \node[below, font=\small] at (2.3,0) {$a = 7$ cm};
  \node[left, font=\small] at (0,1.35) {$b = 4$ cm};
  \node[font=\small] at (2.3,1.35) {$A = a \cdot b$};
\end{tikzpicture}`
  },

  triangulo: {
    legenda: 'No triângulo retângulo, c é a hipotenusa (lado oposto ao ângulo reto) e a, b são os catetos.',
    tikz: String.raw`
\begin{tikzpicture}[scale=1.15]
  \draw[thick, fill=teal!10] (0,0) -- (4.4,0) -- (0,3.3) -- cycle;
  \draw (0.35,0) -- (0.35,0.35) -- (0,0.35);
  \node[below, font=\small] at (2.2,0) {$a$};
  \node[left, font=\small] at (0,1.65) {$b$};
  \node[above right, font=\small] at (1.9,1.55) {$c$};
  \fill (0,0) circle (2.4pt);
\end{tikzpicture}`
  },

  angulo: {
    legenda: 'Um ângulo agudo mede menos de 90 graus; aqui, 65°.',
    tikz: String.raw`
\begin{tikzpicture}[scale=1.1]
  \draw[thick] (0,0) -- (4.3,0);
  \draw[thick] (0,0) -- (65:4.3);
  \draw[red!75!black, thick] (1.6,0) arc (0:65:1.6);
  \node[below right, font=\small] at (1.9,0.3) {$65^\circ$};
  \fill (0,0) circle (2.6pt);
\end{tikzpicture}`
  },

  parabola: {
    legenda: 'Gráfico da parábola f(x) = x² − 4x + 3, com vértice em (2, −1) e zeros em 1 e 3.',
    tikz: String.raw`
\begin{tikzpicture}[scale=0.88]
  \draw[->, thick] (-1.3,0) -- (5.5,0) node[right] {$x$};
  \draw[->, thick] (0,-2.5) -- (0,4.6) node[above] {$y$};
  \draw[domain=-1.1:5.2, smooth, variable=\x, red!70!black, thick] plot (\x, {\x*\x-4*\x+3});
  \fill (2,-1) circle (3.2pt) node[below right, font=\small] {$V(2,-1)$};
  \fill (1,0) circle (3.2pt) node[below, font=\small] {$1$};
  \fill (3,0) circle (3.2pt) node[below, font=\small] {$3$};
  \node[above left, font=\small] at (0.6,4) {$f(x)=x^{2}-4x+3$};
\end{tikzpicture}`
  },

  retaGrafico: {
    legenda: 'Gráfico de uma função do 1º grau: a reta sobe quando o coeficiente angular é positivo.',
    tikz: String.raw`
\begin{tikzpicture}[scale=0.88]
  \draw[->, thick] (-1.5,0) -- (5.6,0) node[right] {$x$};
  \draw[->, thick] (0,-2.6) -- (0,4.6) node[above] {$y$};
  \draw[domain=-1.3:5.3, smooth, variable=\x, blue!65!black, thick] plot (\x, {1.2*\x-1});
  \fill (0,-1) circle (3.2pt) node[below left, font=\small] {$B(0,-1)$};
  \fill (0.83,0) circle (3.2pt) node[below, font=\small] {$A$};
  \node[above left, font=\small] at (4.7,4.3) {$y=1{,}2x-1$};
\end{tikzpicture}`
  },

  barras: {
    legenda: 'Diagrama de barras: a altura de cada barra representa a frequência de cada categoria.',
    tikz: String.raw`
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
\end{tikzpicture}`
  },

  plano: {
    legenda: 'Plano cartesiano: cada ponto é definido pelo par ordenado (x, y).',
    tikz: String.raw`
\begin{tikzpicture}[scale=0.62]
  \draw[step=1, gray!35, thin] (-4,-3) grid (4,3);
  \draw[->, thick] (-4.7,0) -- (4.7,0) node[right] {$x$};
  \draw[->, thick] (0,-3.7) -- (0,3.7) node[above] {$y$};
  \fill[red!75!black] (2,1.5) circle (4pt) node[above right, font=\small] {$P(2;1{,}5)$};
  \node[below right, font=\small] at (0.2,0.15) {$O$};
\end{tikzpicture}`
  },

  circulo: {
    legenda: 'O círculo é o conjunto dos pontos que distam r do centro O.',
    tikz: String.raw`
\begin{tikzpicture}[scale=1.15]
  \draw[thick, fill=blue!7] (0,0) circle (1.7);
  \fill (0,0) circle (3pt) node[below left, font=\small] {$O$};
  \draw[red!70!black, thick] (0,0) -- (45:1.7);
  \node[above right, font=\small] at (22:1) {$r$};
  \draw[thick] (0,0) -- (165:1.7);
  \node[above left, font=\small] at (165:1.15) {$r$};
\end{tikzpicture}`
  },

  porcentagem: {
    legenda: 'Cada quadrado da grade representa 1% do total: 70 pintados correspondem a 70%.',
    tikz: String.raw`
\begin{tikzpicture}[scale=0.44]
  \fill[blue!30] (0,0) rectangle (7,10);
  \draw[step=1, gray!55, thin] (0,0) grid (10,10);
  \draw[thick] (0,0) rectangle (10,10);
  \node[font=\small] at (5,-1.7) {$70\%$ pintados de $100$};
\end{tikzpicture}`
  },

  setores: {
    legenda: 'A probabilidade pode ser representada como a fatia favorável em relação ao inteiro.',
    tikz: String.raw`
\begin{tikzpicture}[scale=1.15]
  \draw[thick, fill=violet!15] (0,0) -- (0:1.6) arc (0:90:1.6) -- cycle;
  \draw[thick] (0,0) circle (1.6);
  \fill (0,0) circle (2.6pt);
  \node[font=\small] at (46:0.95) {$\frac{1}{4}$};
\end{tikzpicture}`
  },

  intervalo: {
    legenda: 'Intervalo [1 ; 4): o ponto chechado inclui o 1 e o ponto vazio exclui o 4.',
    tikz: String.raw`
\begin{tikzpicture}[scale=0.95]
  \draw[->, thick, blue!65!black] (-1.5,0) -- (6.2,0);
  \foreach \x in {0,...,5} \draw[thick] (\x,0.15) -- (\x,-0.15) node[below, font=\small] {$\x$};
  \draw[red!75!black, line width=2.8pt] (1,0) -- (4,0);
  \fill[red!75!black] (1,0) circle (4.6pt);
  \draw[fill=white, thick] (4,0) circle (4.6pt);
  \node[above, font=\small] at (2.5,0.28) {$[1\,;\,4)$};
\end{tikzpicture}`
  },

  exponencial: {
    legenda: 'Crescimento exponencial: a cada passo o valor é multiplicado pela mesma razão.',
    tikz: String.raw`
\begin{tikzpicture}[scale=0.88]
  \draw[->, thick] (-0.5,0) -- (6.5,0) node[right] {$x$};
  \draw[->, thick] (0,-1.3) -- (0,5.5) node[above] {$y$};
  \draw[domain=-0.4:4.6, smooth, variable=\x, teal!70!black, thick] plot (\x, {0.55*2^{\x}});
  \node[above right, font=\small] at (2.9,3.4) {$f(x)=a\cdot b^{x}$};
\end{tikzpicture}`
  },

  trig: {
    legenda: 'As razões trigonométricas relacionam os lados do triângulo retângulo com o ângulo.',
    tikz: String.raw`
\begin{tikzpicture}[scale=1.2]
  \draw[thick, fill=amber!15] (0,0) -- (4.6,0) -- (4.6,3.1) -- cycle;
  \draw (4.25,0) -- (4.25,0.35) -- (4.6,0.35);
  \draw[red!70!black, thick] (1.3,0) arc (0:34:1.3);
  \node[below right, font=\small] at (1.6,0.32) {$\theta$};
  \node[below, font=\small] at (2.3,0) {adjacente};
  \node[right, font=\small] at (4.6,1.55) {oposto};
  \node[above left, font=\small] at (2.2,1.5) {hipotenusa};
\end{tikzpicture}`
  },

  equacao: {
    legenda: 'Resolver uma equação é isolar a incógnita aplicando a operação inversa nos dois lados.',
    tikz: String.raw`
\begin{tikzpicture}[scale=1.05]
  \node[draw, thick, rounded corners, fill=blue!10, minimum size=1.15cm] at (0,0) {$x$};
  \node at (1.45,0) {$+$};
  \node[draw, thick, rounded corners, fill=blue!10, minimum size=1.15cm] at (2.7,0) {$5$};
  \node at (4.05,0) {$=$};
  \node[draw, thick, rounded corners, fill=green!15, minimum size=1.15cm] at (5.35,0) {$12$};
  \node[font=\small, red!70!black] at (2.7,1.3) {$-5$};
  \draw[->, thick, red!70!black] (2.7,1.1) -- (2.7,0.75);
\end{tikzpicture}`
  },

  escala: {
    legenda: 'Escala 1 : 3 — cada centímetro do desenho representa 3 centímetros reais.',
    tikz: String.raw`
\begin{tikzpicture}[scale=0.95]
  \draw[thick, fill=blue!8] (0,0) rectangle (2,1.2);
  \node[below, font=\small] at (1,0) {1 cm};
  \draw[thick, fill=blue!22] (3.6,0) rectangle (9.6,3.6);
  \node[below, font=\small] at (6.6,0) {3 cm};
  \draw[->, thick, gray!60!black] (2.5,1.9) -- (3.2,1.9);
  \node[above, font=\small] at (2.85,2.05) {$\times 3$};
\end{tikzpicture}`
  }
};
