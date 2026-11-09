import { formatNumber } from '../lib/utils'

export type ShapeId =
  | 'quadrado'
  | 'retangulo'
  | 'triangulo'
  | 'losango'
  | 'trapezio'
  | 'paralelogramo'
  | 'circulo'
  | 'circunferencia'
  | 'poligono'
  | 'cubo'
  | 'paralelepipedo'
  | 'piramide'
  | 'cilindro'
  | 'cone'
  | 'esfera'

export interface ShapeDimensions {
  base: number
  height: number
  side: number
  radius: number
  depth: number
  sides: number
  diagonalMajor: number
  diagonalMinor: number
}

export interface ShapeMetric {
  label: string
  value: string
  formula: string
}

export const DEFAULT_DIMENSIONS: ShapeDimensions = {
  base: 8,
  height: 5,
  side: 6,
  radius: 4,
  depth: 3,
  sides: 6,
  diagonalMajor: 8,
  diagonalMinor: 5,
}

export const SHAPES: { id: ShapeId; name: string; group: 'planas' | 'espaciais'; solid: boolean }[] = [
  { id: 'quadrado', name: 'Quadrado', group: 'planas', solid: false },
  { id: 'retangulo', name: 'Retângulo', group: 'planas', solid: false },
  { id: 'triangulo', name: 'Triângulo', group: 'planas', solid: false },
  { id: 'losango', name: 'Losango', group: 'planas', solid: false },
  { id: 'trapezio', name: 'Trapézio', group: 'planas', solid: false },
  { id: 'paralelogramo', name: 'Paralelogramo', group: 'planas', solid: false },
  { id: 'circulo', name: 'Círculo', group: 'planas', solid: false },
  { id: 'circunferencia', name: 'Circunferência', group: 'planas', solid: false },
  { id: 'poligono', name: 'Polígono regular', group: 'planas', solid: false },
  { id: 'cubo', name: 'Cubo', group: 'espaciais', solid: true },
  { id: 'paralelepipedo', name: 'Paralelepípedo', group: 'espaciais', solid: true },
  { id: 'piramide', name: 'Pirâmide', group: 'espaciais', solid: true },
  { id: 'cilindro', name: 'Cilindro', group: 'espaciais', solid: true },
  { id: 'cone', name: 'Cone', group: 'espaciais', solid: true },
  { id: 'esfera', name: 'Esfera', group: 'espaciais', solid: true },
]

const PI = 3.14159

function f(value: number): string {
  return formatNumber(value, 2)
}

export function calculateMetrics(shape: ShapeId, dims: ShapeDimensions): { metrics: ShapeMetric[]; properties: string[] } {
  const { base: b, height: h, side: a, radius: r, depth: c, sides: n, diagonalMajor: D, diagonalMinor: d } = dims
  switch (shape) {
    case 'quadrado':
      return {
        metrics: [
          { label: 'Perímetro', value: `${f(4 * a)} cm`, formula: 'P = 4 × lado' },
          { label: 'Área', value: `${f(a * a)} cm²`, formula: 'A = lado²' },
          { label: 'Diagonal', value: `${f(a * Math.SQRT2)} cm`, formula: 'd = lado × √2' },
        ],
        properties: ['4 lados iguais', '4 ângulos de 90°', '4 eixos de simetria'],
      }
    case 'retangulo':
      return {
        metrics: [
          { label: 'Perímetro', value: `${f(2 * (b + h))} cm`, formula: 'P = 2 × (base + altura)' },
          { label: 'Área', value: `${f(b * h)} cm²`, formula: 'A = base × altura' },
          { label: 'Diagonal', value: `${f(Math.sqrt(b * b + h * h))} cm`, formula: 'd² = b² + h²' },
        ],
        properties: ['4 ângulos de 90°', 'Lados opostos iguais', '2 eixos de simetria'],
      }
    case 'triangulo': {
      const lateral = Math.sqrt((b / 2) ** 2 + h ** 2)
      return {
        metrics: [
          { label: 'Área', value: `${f((b * h) / 2)} cm²`, formula: 'A = (base × altura) ÷ 2' },
          { label: 'Perímetro*', value: `${f(b + 2 * lateral)} cm`, formula: 'P = base + 2 × lado' },
          { label: 'Lado inclinado', value: `${f(lateral)} cm`, formula: 'Teorema de Pitágoras' },
        ],
        properties: ['3 lados', '3 vértices', 'Soma dos ângulos = 180°'],
      }
    }
    case 'losango': {
      const side = Math.sqrt((D / 2) ** 2 + (d / 2) ** 2)
      return {
        metrics: [
          { label: 'Área', value: `${f((D * d) / 2)} cm²`, formula: 'A = (D × d) ÷ 2' },
          { label: 'Perímetro', value: `${f(4 * side)} cm`, formula: 'P = 4 × lado' },
          { label: 'Lado', value: `${f(side)} cm`, formula: 'lado² = (D/2)² + (d/2)²' },
        ],
        properties: ['4 lados iguais', 'Diagonais perpendiculares', 'Diagonais se cortam ao meio'],
      }
    }
    case 'trapezio': {
      const leg = Math.sqrt(((b - a) / 2) ** 2 + h ** 2)
      const base2 = Math.max(0.5, a)
      return {
        metrics: [
          { label: 'Área', value: `${f(((b + base2) * h) / 2)} cm²`, formula: 'A = (B + b) × h ÷ 2' },
          { label: 'Perímetro*', value: `${f(b + base2 + 2 * leg)} cm`, formula: 'P = B + b + 2 × lado' },
          { label: 'Altura', value: `${f(h)} cm`, formula: 'distância entre as bases' },
        ],
        properties: ['1 par de lados paralelos', 'Bases maior e menor', 'Trapézio isósceles nesta representação'],
      }
    }
    case 'paralelogramo': {
      const offset = b * 0.24
      const slant = Math.sqrt(offset ** 2 + h ** 2)
      return {
        metrics: [
          { label: 'Área', value: `${f(b * h)} cm²`, formula: 'A = base × altura' },
          { label: 'Perímetro*', value: `${f(2 * (b + slant))} cm`, formula: 'P = 2 × (base + lado)' },
          { label: 'Lado inclinado', value: `${f(slant)} cm`, formula: 'Pitágoras' },
        ],
        properties: ['Lados opostos paralelos', 'Ângulos opostos iguais', 'Não é retângulo necessariamente'],
      }
    }
    case 'circulo':
      return {
        metrics: [
          { label: 'Área', value: `${f(PI * r * r)} cm²`, formula: 'A = π × r²' },
          { label: 'Circunferência', value: `${f(2 * PI * r)} cm`, formula: 'C = 2 × π × r' },
          { label: 'Diâmetro', value: `${f(2 * r)} cm`, formula: 'd = 2 × r' },
        ],
        properties: ['Todos os pontos a mesma distância do centro', 'π ≈ 3,14159', 'Não possui lados ou vértices'],
      }
    case 'circunferencia':
      return {
        metrics: [
          { label: 'Comprimento', value: `${f(2 * PI * r)} cm`, formula: 'C = 2 × π × r' },
          { label: 'Diâmetro', value: `${f(2 * r)} cm`, formula: 'd = 2 × r' },
          { label: 'Raio', value: `${f(r)} cm`, formula: 'r = d ÷ 2' },
        ],
        properties: ['Apenas o contorno do círculo', 'Comprimento é a medida do contorno', 'Não confundir com a área'],
      }
    case 'poligono': {
      const angle = PI / n
      const side = 2 * r * Math.sin(angle)
      const apothem = r * Math.cos(angle)
      return {
        metrics: [
          { label: 'Perímetro', value: `${f(n * side)} cm`, formula: 'P = n × lado' },
          { label: 'Área', value: `${f((n * side * apothem) / 2)} cm²`, formula: 'A = (P × apótema) ÷ 2' },
          { label: 'Ângulo interno', value: `${f(((n - 2) * 180) / n)}°`, formula: 'ai = (n − 2) × 180° ÷ n' },
        ],
        properties: [`${n} lados iguais`, `${n} vértices`, 'Regular: lados e ângulos congruentes'],
      }
    }
    case 'cubo':
      return {
        metrics: [
          { label: 'Volume', value: `${f(a ** 3)} cm³`, formula: 'V = a³' },
          { label: 'Área total', value: `${f(6 * a * a)} cm²`, formula: 'A = 6 × a²' },
          { label: 'Diagonal', value: `${f(a * Math.sqrt(3))} cm`, formula: 'D = a × √3' },
        ],
        properties: ['6 faces quadradas', '12 arestas', '8 vértices'],
      }
    case 'paralelepipedo':
      return {
        metrics: [
          { label: 'Volume', value: `${f(b * h * c)} cm³`, formula: 'V = a × b × c' },
          { label: 'Área total', value: `${f(2 * (b * h + b * c + h * c))} cm²`, formula: 'A = 2(ab + ac + bc)' },
          { label: 'Diagonal', value: `${f(Math.sqrt(b * b + h * h + c * c))} cm`, formula: 'D² = a² + b² + c²' },
        ],
        properties: ['6 faces retangulares', '12 arestas', '8 vértices'],
      }
    case 'piramide': {
      const apothem = Math.sqrt(h * h + (b / 2) ** 2)
      const lateralArea = 2 * b * apothem
      return {
        metrics: [
          { label: 'Volume', value: `${f((b * b * h) / 3)} cm³`, formula: 'V = (Ab × h) ÷ 3' },
          { label: 'Área total', value: `${f(b * b + lateralArea)} cm²`, formula: 'A = Ab + Al' },
          { label: 'Apótema', value: `${f(apothem)} cm`, formula: 'ap² = h² + (a/2)²' },
        ],
        properties: ['5 faces', '8 arestas', '5 vértices'],
      }
    }
    case 'cilindro':
      return {
        metrics: [
          { label: 'Volume', value: `${f(PI * r * r * h)} cm³`, formula: 'V = π × r² × h' },
          { label: 'Área lateral', value: `${f(2 * PI * r * h)} cm²`, formula: 'Al = 2 × π × r × h' },
          { label: 'Área total', value: `${f(2 * PI * r * (r + h))} cm²`, formula: 'At = 2πr(r + h)' },
        ],
        properties: ['2 bases circulares', '1 superfície lateral curva', '2 arestas circulares'],
      }
    case 'cone': {
      const slant = Math.sqrt(r * r + h * h)
      return {
        metrics: [
          { label: 'Volume', value: `${f((PI * r * r * h) / 3)} cm³`, formula: 'V = (πr²h) ÷ 3' },
          { label: 'Área total', value: `${f(PI * r * (r + slant))} cm²`, formula: 'At = πr(r + g)' },
          { label: 'Geratriz', value: `${f(slant)} cm`, formula: 'g² = r² + h²' },
        ],
        properties: ['1 base circular', '1 vértice', '1 superfície lateral curva'],
      }
    }
    case 'esfera':
      return {
        metrics: [
          { label: 'Volume', value: `${f((4 / 3) * PI * r ** 3)} cm³`, formula: 'V = 4πr³ ÷ 3' },
          { label: 'Área da superfície', value: `${f(4 * PI * r * r)} cm²`, formula: 'A = 4 × π × r²' },
          { label: 'Diâmetro', value: `${f(2 * r)} cm`, formula: 'd = 2 × r' },
        ],
        properties: ['Todos os pontos equidistantes do centro', 'Não possui faces planas', 'Não possui planificação exata'],
      }
    default:
      return { metrics: [], properties: [] }
  }
}

const C = {
  ink: '#16204a',
  blue: '#4666ff',
  accent: '#f97316',
  line: '#9aa8d8',
  fill: '#eef1ff',
  soft: '#f8f9ff',
  teal: '#0d9488',
  violet: '#7c3aed',
}

function ArrowDefs() {
  return (
    <defs>
      <marker id="geo-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto-start-reverse">
        <path d="M0,0 L7,3.5 L0,7 z" fill={C.accent} />
      </marker>
      <pattern id="geo-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e6eaf7" strokeWidth="0.7" />
      </pattern>
    </defs>
  )
}

function HDim({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.accent} strokeWidth="1.4" markerStart="url(#geo-arrow)" markerEnd="url(#geo-arrow)" />
      <rect x={(x1 + x2) / 2 - 23} y={y - 10} width="46" height="17" rx="5" fill="white" />
      <text x={(x1 + x2) / 2} y={y + 2} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.accent}>{label}</text>
    </g>
  )
}

function VDim({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.accent} strokeWidth="1.4" markerStart="url(#geo-arrow)" markerEnd="url(#geo-arrow)" />
      <rect x={x - 37} y={(y1 + y2) / 2 - 9} width="52" height="17" rx="5" fill="white" />
      <text x={x - 11} y={(y1 + y2) / 2 + 3} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.accent}>{label}</text>
    </g>
  )
}

function RightAngle({ x, y, size = 10 }: { x: number; y: number; size?: number }) {
  return <path d={`M${x} ${y - size} L${x + size} ${y - size} L${x + size} ${y}`} fill="none" stroke={C.line} strokeWidth="1" />
}

export function GeometryFigure({
  shape,
  dims,
  showLabels = true,
  showGrid = true,
  planification = false,
  svgRef,
}: {
  shape: ShapeId
  dims: ShapeDimensions
  showLabels?: boolean
  showGrid?: boolean
  planification?: boolean
  svgRef?: React.Ref<SVGSVGElement>
}) {
  const { base: b, height: h, side: a, radius: r, depth: c, sides: n, diagonalMajor: D, diagonalMinor: d } = dims
  const solid = SHAPES.find((item) => item.id === shape)?.solid
  const width = 520
  const height = 380

  const shapeContent = () => {
    if (planification && solid) return <Planification shape={shape} dims={dims} />

    switch (shape) {
      case 'quadrado': {
        const size = Math.min(210, 260)
        const x = (width - size) / 2
        const y = (height - size) / 2 - 5
        return (
          <g>
            <rect x={x} y={y} width={size} height={size} fill={C.fill} stroke={C.blue} strokeWidth="2.5" rx="2" />
            {showLabels && <><HDim x1={x} x2={x + size} y={y + size + 28} label={`${f(a)} cm`} /><VDim x={x - 30} y1={y} y2={y + size} label={`${f(a)} cm`} /></>}
            <circle cx={x} cy={y} r="4" fill={C.blue} /><circle cx={x + size} cy={y} r="4" fill={C.blue} /><circle cx={x} cy={y + size} r="4" fill={C.blue} /><circle cx={x + size} cy={y + size} r="4" fill={C.blue} />
            <text x={width / 2} y={height - 24} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">QUADRADO</text>
          </g>
        )
      }
      case 'retangulo': {
        const w = 280
        const hPix = Math.min(150, Math.max(80, (h / Math.max(1, b)) * w))
        const x = (width - w) / 2
        const y = (height - hPix) / 2 - 5
        return (
          <g>
            <rect x={x} y={y} width={w} height={hPix} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            {showLabels && <><HDim x1={x} x2={x + w} y={y + hPix + 28} label={`${f(b)} cm`} /><VDim x={x - 30} y1={y} y2={y + hPix} label={`${f(h)} cm`} /></>}
            <path d={`M${x} ${y + 16} L${x + 16} ${y + 16} L${x + 16} ${y}`} fill="none" stroke={C.line} strokeWidth="1" />
            <text x={width / 2} y={height - 24} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">RETÂNGULO</text>
          </g>
        )
      }
      case 'triangulo': {
        const basePix = 290
        const heightPix = 190
        const x = (width - basePix) / 2
        const yBase = 300
        const apexX = x + basePix / 2
        const apexY = yBase - heightPix
        return (
          <g>
            <polygon points={`${x},${yBase} ${x + basePix},${yBase} ${apexX},${apexY}`} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <line x1={apexX} y1={apexY} x2={apexX} y2={yBase} stroke={C.line} strokeDasharray="5 4" strokeWidth="1.3" />
            <RightAngle x={apexX} y={yBase} />
            {showLabels && <><HDim x1={x} x2={x + basePix} y={yBase + 30} label={`${f(b)} cm`} /><VDim x={apexX + 35} y1={apexY} y2={yBase} label={`${f(h)} cm`} /></>}
            <text x={width / 2} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">TRIÂNGULO</text>
          </g>
        )
      }
      case 'losango': {
        const dW = 260
        const dH = 180
        const cx = width / 2
        const cy = height / 2 - 8
        return (
          <g>
            <polygon points={`${cx},${cy - dH / 2} ${cx + dW / 2},${cy} ${cx},${cy + dH / 2} ${cx - dW / 2},${cy}`} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <line x1={cx - dW / 2} y1={cy} x2={cx + dW / 2} y2={cy} stroke={C.line} strokeDasharray="4 4" />
            <line x1={cx} y1={cy - dH / 2} x2={cx} y2={cy + dH / 2} stroke={C.line} strokeDasharray="4 4" />
            {showLabels && <><HDim x1={cx - dW / 2} x2={cx + dW / 2} y={cy + 40} label={`D = ${f(D)} cm`} /><VDim x={cx - 32} y1={cy - dH / 2} y2={cy + dH / 2} label={`d = ${f(d)} cm`} /></>}
            <text x={width / 2} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">LOSANGO</text>
          </g>
        )
      }
      case 'trapezio': {
        const bigBase = 300
        const smallBase = 170
        const heightPix = 160
        const x = (width - bigBase) / 2
        const yBase = 300
        const topY = yBase - heightPix
        return (
          <g>
            <polygon points={`${x},${yBase} ${x + bigBase},${yBase} ${x + (bigBase + smallBase) / 2},${topY} ${x + (bigBase - smallBase) / 2},${topY}`} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <line x1={x + (bigBase - smallBase) / 2} y1={topY} x2={x + (bigBase - smallBase) / 2} y2={yBase} stroke={C.line} strokeDasharray="4 4" />
            {showLabels && <><HDim x1={x} x2={x + bigBase} y={yBase + 30} label={`B = ${f(b)} cm`} /><HDim x1={x + (bigBase - smallBase) / 2} x2={x + (bigBase + smallBase) / 2} y={topY - 18} label={`b = ${f(a)} cm`} /><VDim x={x - 32} y1={topY} y2={yBase} label={`${f(h)} cm`} /></>}
            <text x={width / 2} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">TRAPÉZIO</text>
          </g>
        )
      }
      case 'paralelogramo': {
        const basePix = 275
        const heightPix = 155
        const offset = 58
        const x = (width - basePix - offset) / 2
        const yBase = 295
        return (
          <g>
            <polygon points={`${x},${yBase} ${x + basePix},${yBase} ${x + basePix + offset},${yBase - heightPix} ${x + offset},${yBase - heightPix}`} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <line x1={x + offset} y1={yBase - heightPix} x2={x + offset} y2={yBase} stroke={C.line} strokeDasharray="4 4" />
            <RightAngle x={x + offset} y={yBase} />
            {showLabels && <><HDim x1={x} x2={x + basePix} y={yBase + 30} label={`${f(b)} cm`} /><VDim x={x - 30} y1={yBase - heightPix} y2={yBase} label={`${f(h)} cm`} /></>}
            <text x={width / 2} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">PARALELOGRAMO</text>
          </g>
        )
      }
      case 'circulo':
      case 'circunferencia': {
        const radiusPix = 118
        const cx = width / 2
        const cy = height / 2 - 8
        return (
          <g>
            <circle cx={cx} cy={cy} r={radiusPix} fill={shape === 'circulo' ? C.fill : 'none'} stroke={C.blue} strokeWidth={shape === 'circunferencia' ? 4 : 2.5} />
            <line x1={cx} y1={cy} x2={cx + radiusPix} y2={cy} stroke={C.accent} strokeWidth="1.5" markerEnd="url(#geo-arrow)" />
            <circle cx={cx} cy={cy} r="4" fill={C.blue} />
            {showLabels && <text x={cx + radiusPix / 2} y={cy - 10} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.accent}>r = {f(r)} cm</text>}
            {showLabels && <circle cx={cx} cy={cy} r="3" fill={C.accent} />}
            {shape === 'circunferencia' && showLabels && <text x={cx} y={cy + radiusPix + 25} textAnchor="middle" fontSize="11" fill={C.line}>comprimento C = {f(2 * PI * r)} cm</text>}
            <text x={cx} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">{shape === 'circulo' ? 'CÍRCULO' : 'CIRCUNFERÊNCIA'}</text>
          </g>
        )
      }
      case 'poligono': {
        const cx = width / 2
        const cy = height / 2 - 12
        const radius = 130
        const points = Array.from({ length: n }, (_, index) => {
          const angle = (Math.PI * 2 * index) / n - Math.PI / 2
          return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`
        }).join(' ')
        return (
          <g>
            <polygon points={points} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <line x1={cx} y1={cy} x2={cx + radius} y2={cy} stroke={C.line} strokeDasharray="4 4" />
            <circle cx={cx} cy={cy} r="3" fill={C.blue} />
            {showLabels && <text x={cx + radius / 2} y={cy - 8} textAnchor="middle" fontSize="11" fill={C.line}>raio {f(r)} cm</text>}
            <text x={cx} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">POLÍGONO REGULAR · {n} LADOS</text>
          </g>
        )
      }
      case 'cubo': {
        const size = 145
        const offset = 58
        const x = (width - size - offset) / 2
        const y = 95
        return (
          <g>
            <polygon points={`${x},${y + offset} ${x + size},${y + offset} ${x + size + offset},${y} ${x + offset},${y}`} fill="#dce4ff" stroke={C.blue} strokeWidth="2" />
            <polygon points={`${x},${y + offset} ${x + size},${y + offset} ${x + size},${y + size + offset} ${x},${y + size + offset}`} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <polygon points={`${x + size},${y + offset} ${x + size + offset},${y} ${x + size + offset},${y + size} ${x + size},${y + size + offset}`} fill="#e8edff" stroke={C.blue} strokeWidth="2" />
            {showLabels && <><HDim x1={x} x2={x + size} y={y + size + offset + 24} label={`${f(a)} cm`} /><VDim x={x - 30} y1={y + offset} y2={y + size + offset} label={`${f(a)} cm`} /></>}
            <text x={width / 2} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">CUBO</text>
          </g>
        )
      }
      case 'paralelepipedo': {
        const w = 190
        const hPix = 110
        const offset = 55
        const x = 130
        const y = 130
        return (
          <g>
            <polygon points={`${x},${y + offset} ${x + w},${y + offset} ${x + w + offset},${y} ${x + offset},${y}`} fill="#dce4ff" stroke={C.blue} strokeWidth="2" />
            <polygon points={`${x},${y + offset} ${x + w},${y + offset} ${x + w},${y + hPix + offset} ${x},${y + hPix + offset}`} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <polygon points={`${x + w},${y + offset} ${x + w + offset},${y} ${x + w + offset},${y + hPix} ${x + w},${y + hPix + offset}`} fill="#e8edff" stroke={C.blue} strokeWidth="2" />
            {showLabels && <><HDim x1={x} x2={x + w} y={y + hPix + offset + 26} label={`${f(b)} cm`} /><VDim x={x - 30} y1={y + offset} y2={y + hPix + offset} label={`${f(h)} cm`} /><text x={x + w + offset + 8} y={y + hPix + 8} fontSize="11" fontWeight="800" fill={C.accent}>{f(c)} cm</text></>}
            <text x={width / 2} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">PARALELEPÍPEDO</text>
          </g>
        )
      }
      case 'piramide': {
        const size = 230
        const heightPix = 170
        const x = (width - size) / 2
        const yBase = 300
        const apexX = width / 2
        const apexY = yBase - heightPix
        const offset = 42
        return (
          <g>
            <polygon points={`${x},${yBase} ${x + size},${yBase} ${x + size + offset / 2},${yBase - offset / 2} ${x + offset / 2},${yBase - offset / 2}`} fill="#dfe6ff" stroke={C.blue} strokeWidth="2" />
            <polygon points={`${x},${yBase} ${x + size},${yBase} ${apexX},${apexY}`} fill={C.fill} stroke={C.blue} strokeWidth="2.2" opacity=".85" />
            <polygon points={`${x + offset / 2},${yBase - offset / 2} ${x + size + offset / 2},${yBase - offset / 2} ${apexX},${apexY}`} fill="#eef1ff" stroke={C.blue} strokeWidth="1.4" opacity=".65" />
            <line x1={apexX} y1={apexY} x2={apexX} y2={yBase} stroke={C.line} strokeDasharray="4 4" />
            <RightAngle x={apexX} y={yBase} />
            {showLabels && <><HDim x1={x} x2={x + size} y={yBase + 28} label={`${f(b)} cm`} /><VDim x={apexX + 35} y1={apexY} y2={yBase} label={`${f(h)} cm`} /></>}
            <text x={width / 2} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">PIRÂMIDE</text>
          </g>
        )
      }
      case 'cilindro': {
        const cx = width / 2
        const topY = 100
        const bottomY = 285
        const rx = 108
        const ry = 28
        return (
          <g>
            <ellipse cx={cx} cy={bottomY} rx={rx} ry={ry} fill="#e3e9ff" stroke={C.blue} strokeWidth="2" />
            <path d={`M${cx - rx} ${topY} L${cx - rx} ${bottomY} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY} L${cx + rx} ${topY}`} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill="#e8edff" stroke={C.blue} strokeWidth="2.5" />
            <line x1={cx} y1={topY} x2={cx + rx} y2={topY} stroke={C.accent} strokeWidth="1.4" markerEnd="url(#geo-arrow)" />
            <line x1={cx + rx} y1={topY} x2={cx + rx} y2={bottomY} stroke={C.accent} strokeWidth="1.4" markerEnd="url(#geo-arrow)" />
            {showLabels && <><text x={cx + rx / 2} y={topY - 10} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.accent}>r = {f(r)}</text><text x={cx + rx + 18} y={(topY + bottomY) / 2} fontSize="11" fontWeight="800" fill={C.accent}>h = {f(h)}</text></>}
            <text x={cx} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">CILINDRO</text>
          </g>
        )
      }
      case 'cone': {
        const cx = width / 2
        const baseY = 295
        const apexY = 100
        const rx = 115
        const ry = 27
        return (
          <g>
            <ellipse cx={cx} cy={baseY} rx={rx} ry={ry} fill="#e3e9ff" stroke={C.blue} strokeWidth="2" />
            <path d={`M${cx - rx} ${baseY} L${cx} ${apexY} L${cx + rx} ${baseY} A${rx} ${ry} 0 0 0 ${cx - rx} ${baseY}`} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <line x1={cx} y1={apexY} x2={cx} y2={baseY} stroke={C.line} strokeDasharray="4 4" />
            <line x1={cx} y1={baseY} x2={cx + rx} y2={baseY} stroke={C.accent} strokeWidth="1.4" markerEnd="url(#geo-arrow)" />
            {showLabels && <><text x={cx + rx / 2} y={baseY + 20} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.accent}>r = {f(r)}</text><text x={cx + 12} y={(apexY + baseY) / 2} fontSize="11" fontWeight="800" fill={C.accent}>h = {f(h)}</text></>}
            <text x={cx} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">CONE</text>
          </g>
        )
      }
      case 'esfera': {
        const cx = width / 2
        const cy = height / 2 - 8
        const radius = 120
        return (
          <g>
            <circle cx={cx} cy={cy} r={radius} fill={C.fill} stroke={C.blue} strokeWidth="2.5" />
            <ellipse cx={cx} cy={cy} rx={radius} ry={radius * 0.35} fill="none" stroke={C.line} strokeDasharray="5 4" />
            <ellipse cx={cx} cy={cy} rx={radius * 0.35} ry={radius} fill="none" stroke={C.line} strokeDasharray="5 4" opacity=".7" />
            <line x1={cx} y1={cy} x2={cx + radius * 0.72} y2={cy - radius * 0.66} stroke={C.accent} strokeWidth="1.5" markerEnd="url(#geo-arrow)" />
            <circle cx={cx} cy={cy} r="4" fill={C.blue} />
            {showLabels && <text x={cx + radius * 0.35} y={cy - radius * 0.42} fontSize="11" fontWeight="800" fill={C.accent}>r = {f(r)} cm</text>}
            <text x={cx} y={height - 22} textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} opacity=".9">ESFERA</text>
          </g>
        )
      }
      default:
        return null
    }
  }

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto block"
      role="img"
      aria-label={`Figura geométrica: ${SHAPES.find((item) => item.id === shape)?.name}`}
    >
      <ArrowDefs />
      <rect width={width} height={height} fill="#fff" />
      {showGrid && <rect width={width} height={height} fill="url(#geo-grid)" opacity=".7" />}
      {shapeContent()}
    </svg>
  )
}

function Planification({ shape, dims }: { shape: ShapeId; dims: ShapeDimensions }) {
  const { base: b, height: h, side: a, radius: r } = dims
  if (shape === 'esfera') {
    return (
      <g>
        <circle cx="260" cy="160" r="100" fill="#eef1ff" stroke={C.blue} strokeWidth="2.5" />
        <text x="260" y="155" textAnchor="middle" fontSize="16" fontWeight="900" fill={C.ink}>ESFERA</text>
        <text x="260" y="298" textAnchor="middle" fontSize="12" fill={C.line}>A esfera não possui planificação exata.</text>
        <text x="260" y="318" textAnchor="middle" fontSize="11" fill={C.line}>Sua superfície é curva em todas as direções.</text>
      </g>
    )
  }
  if (shape === 'cubo') {
    const s = 76
    const ox = 210
    const oy = 55
    const cells = [
      [1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2],
    ]
    return (
      <g>
        {cells.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={ox + x * s} y={oy + y * s} width={s} height={s} fill={C.fill} stroke={C.blue} strokeWidth="2" />
            <text x={ox + x * s + s / 2} y={oy + y * s + s / 2 + 4} textAnchor="middle" fontSize="10" fill={C.line}>{f(a)}</text>
          </g>
        ))}
        <text x="260" y="330" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.ink}>Planificação do cubo · 6 quadrados</text>
      </g>
    )
  }
  if (shape === 'paralelepipedo') {
    const w = 84
    const hh = 62
    const ox = 180
    const oy = 60
    const cells = [
      [1, 0, w, hh], [0, 1, w, hh], [1, 1, w, hh], [2, 1, hh, hh], [1, 2, w, hh],
    ]
    return (
      <g>
        {cells.map(([x, y, cw, ch], index) => (
          <rect key={index} x={ox + x * w} y={oy + y * hh} width={cw} height={ch} fill={C.fill} stroke={C.blue} strokeWidth="2" />
        ))}
        <text x="260" y="330" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.ink}>Planificação do paralelepípedo · 6 faces</text>
      </g>
    )
  }
  if (shape === 'cilindro') {
    const rectW = 240
    const rectH = 130
    return (
      <g>
        <rect x="140" y="90" width={rectW} height={rectH} fill={C.fill} stroke={C.blue} strokeWidth="2" />
        <circle cx="100" cy="130" r="42" fill="#e8edff" stroke={C.blue} strokeWidth="2" />
        <circle cx="100" cy="225" r="42" fill="#e8edff" stroke={C.blue} strokeWidth="2" />
        <text x="260" y="255" textAnchor="middle" fontSize="11" fill={C.line}>retângulo lateral + 2 bases circulares</text>
        <text x="260" y="330" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.ink}>Planificação do cilindro</text>
      </g>
    )
  }
  if (shape === 'piramide') {
    const s = 100
    return (
      <g>
        <rect x="190" y="130" width={s} height={s} fill={C.fill} stroke={C.blue} strokeWidth="2" />
        <polygon points="190,130 290,130 240,40" fill="#f5f7ff" stroke={C.blue} strokeWidth="2" />
        <polygon points="190,230 290,230 240,320" fill="#f5f7ff" stroke={C.blue} strokeWidth="2" />
        <polygon points="190,130 190,230 100,180" fill="#f5f7ff" stroke={C.blue} strokeWidth="2" />
        <polygon points="290,130 290,230 380,180" fill="#f5f7ff" stroke={C.blue} strokeWidth="2" />
        <text x="260" y="350" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.ink}>Planificação da pirâmide · base + 4 faces triangulares</text>
      </g>
    )
  }
  if (shape === 'cone') {
    return (
      <g>
        <path d="M250 125 A125 125 0 0 1 385 210 L250 245 Z" fill={C.fill} stroke={C.blue} strokeWidth="2" />
        <circle cx="380" cy="250" r="52" fill="#e8edff" stroke={C.blue} strokeWidth="2" />
        <text x="260" y="330" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.ink}>Planificação do cone · setor circular + base</text>
      </g>
    )
  }
  return (
    <g>
      <rect x="120" y="80" width="280" height="170" rx="8" fill={C.soft} stroke={C.line} strokeDasharray="5 4" />
      <text x="260" y="165" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.ink}>Planificação não disponível</text>
      <text x="260" y="187" textAnchor="middle" fontSize="11" fill={C.line}>Selecione um sólido com faces planas ou corpos redondos planificáveis.</text>
    </g>
  )
}

export function QuestionGeometryVisual({
  figure,
  className = '',
}: {
  figure: {
    shape: ShapeId
    label?: string
    dimensions?: {
      base?: number
      height?: number
      side?: number
      radius?: number
      depth?: number
      diagonalMajor?: number
      diagonalMinor?: number
      unit?: string
    }
  }
  className?: string
}) {
  const { shape, dimensions = {} } = figure
  const {
    base = 10,
    height = 6,
    side = 6,
    radius = 4,
    depth = 4,
    diagonalMajor = 8,
    diagonalMinor = 5,
    unit = 'cm',
  } = dimensions

  const w = 180
  const h = 102

  const renderShape = () => {
    switch (shape) {
      case 'triangulo':
        return (
          <g>
            <polygon points="25,82 145,82 85,18" fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <line x1="85" y1="18" x2="85" y2="82" stroke={C.accent} strokeDasharray="3 3" strokeWidth="1.2" />
            <path d="M85 74 L93 74 L93 82" fill="none" stroke={C.line} strokeWidth="1" />
            <text x="85" y="96" textAnchor="middle" fontSize="10" fontWeight="bold" fill={C.ink}>b = {base} {unit}</text>
            <text x="96" y="52" fontSize="9" fontWeight="bold" fill={C.accent}>h = {height} {unit}</text>
          </g>
        )
      case 'retangulo':
        return (
          <g>
            <rect x="25" y="24" width="125" height="52" rx="1" fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <text x="87" y="91" textAnchor="middle" fontSize="10" fontWeight="bold" fill={C.ink}>b = {base} {unit}</text>
            <text x="156" y="54" fontSize="9" fontWeight="bold" fill={C.accent}>h = {height} {unit}</text>
          </g>
        )
      case 'quadrado': {
        const s = 60
        const x = (w - s) / 2
        return (
          <g>
            <rect x={x} y="18" width={s} height={s} rx="1" fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <text x={w / 2} y="94" textAnchor="middle" fontSize="10" fontWeight="bold" fill={C.ink}>lado = {side} {unit}</text>
          </g>
        )
      }
      case 'circulo':
      case 'circunferencia': {
        const cx = 85
        const cy = 48
        const r = 35
        return (
          <g>
            <circle cx={cx} cy={cy} r={r} fill={shape === 'circulo' ? C.fill : 'none'} stroke={C.blue} strokeWidth="1.8" />
            <circle cx={cx} cy={cy} r="2.5" fill={C.blue} />
            <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={C.accent} strokeWidth="1.4" />
            <text x={cx + r / 2} y={cy - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill={C.accent}>r = {radius} {unit}</text>
            <text x={w / 2} y="96" textAnchor="middle" fontSize="9" fontWeight="bold" fill={C.ink}>Círculo</text>
          </g>
        )
      }
      case 'losango': {
        const cx = 85
        const cy = 46
        const dw = 110
        const dh = 56
        return (
          <g>
            <polygon points={`${cx},${cy - dh / 2} ${cx + dw / 2},${cy} ${cx},${cy + dh / 2} ${cx - dw / 2},${cy}`} fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <line x1={cx - dw / 2} y1={cy} x2={cx + dw / 2} y2={cy} stroke={C.line} strokeDasharray="3 3" />
            <line x1={cx} y1={cy - dh / 2} x2={cx} y2={cy + dh / 2} stroke={C.line} strokeDasharray="3 3" />
            <text x={cx} y="94" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill={C.ink}>D = {diagonalMajor} {unit} · d = {diagonalMinor} {unit}</text>
          </g>
        )
      }
      case 'trapezio':
        return (
          <g>
            <polygon points="25,76 145,76 120,24 50,24" fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <line x1="50" y1="24" x2="50" y2="76" stroke={C.accent} strokeDasharray="3 3" strokeWidth="1.2" />
            <text x="85" y="17" textAnchor="middle" fontSize="9" fontWeight="bold" fill={C.ink}>b = {side} {unit}</text>
            <text x="85" y="92" textAnchor="middle" fontSize="10" fontWeight="bold" fill={C.ink}>B = {base} {unit}</text>
            <text x="54" y="52" fontSize="8.5" fontWeight="bold" fill={C.accent}>h = {height} {unit}</text>
          </g>
        )
      case 'cubo':
        return (
          <g>
            <polygon points="45,45 85,25 125,45 85,65" fill="#dce4ff" stroke={C.blue} strokeWidth="1.6" />
            <polygon points="45,45 85,65 85,92 45,72" fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <polygon points="85,65 125,45 125,72 85,92" fill="#e8edff" stroke={C.blue} strokeWidth="1.6" />
            <text x={w / 2} y="98" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill={C.ink}>aresta = {side} {unit}</text>
          </g>
        )
      case 'paralelepipedo':
        return (
          <g>
            <polygon points="25,40 65,22 135,22 95,40" fill="#dce4ff" stroke={C.blue} strokeWidth="1.6" />
            <polygon points="25,40 95,40 95,76 25,76" fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <polygon points="95,40 135,22 135,58 95,76" fill="#e8edff" stroke={C.blue} strokeWidth="1.6" />
            <text x="60" y="92" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill={C.ink}>{base} × {height} × {depth} {unit}</text>
          </g>
        )
      case 'cilindro':
        return (
          <g>
            <ellipse cx="85" cy="72" rx="40" ry="11" fill="#e3e9ff" stroke={C.blue} strokeWidth="1.6" />
            <path d="M45,26 L45,72 A40,11 0 0,0 125,72 L125,26" fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <ellipse cx="85" cy="26" rx="40" ry="11" fill="#e8edff" stroke={C.blue} strokeWidth="1.8" />
            <line x1="85" y1="26" x2="125" y2="26" stroke={C.accent} strokeWidth="1.2" />
            <text x="105" y="21" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={C.accent}>r = {radius} {unit}</text>
            <text x="133" y="52" fontSize="8.5" fontWeight="bold" fill={C.accent}>h = {height} {unit}</text>
          </g>
        )
      case 'cone':
        return (
          <g>
            <ellipse cx="85" cy="76" rx="40" ry="11" fill="#e3e9ff" stroke={C.blue} strokeWidth="1.6" />
            <path d="M45,76 L85,20 L125,76 A40,11 0 0,0 45,76" fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <line x1="85" y1="20" x2="85" y2="76" stroke={C.line} strokeDasharray="3 3" />
            <line x1="85" y1="76" x2="125" y2="76" stroke={C.accent} strokeWidth="1.2" />
            <text x="105" y="90" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={C.accent}>r = {radius} {unit}</text>
            <text x="89" y="50" fontSize="8.5" fontWeight="bold" fill={C.ink}>h = {height} {unit}</text>
          </g>
        )
      case 'piramide':
        return (
          <g>
            <polygon points="35,76 130,76 150,56 55,56" fill="#dfe6ff" stroke={C.blue} strokeWidth="1.4" />
            <polygon points="35,76 130,76 85,18" fill={C.fill} stroke={C.blue} strokeWidth="1.8" />
            <line x1="85" y1="18" x2="85" y2="76" stroke={C.line} strokeDasharray="3 3" />
            <text x="85" y="92" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill={C.ink}>base = {base} {unit}</text>
            <text x="90" y="48" fontSize="8.5" fontWeight="bold" fill={C.accent}>h = {height} {unit}</text>
          </g>
        )
      default:
        return (
          <g>
            <rect x="35" y="22" width="110" height="56" rx="4" fill={C.fill} stroke={C.blue} strokeWidth="1.6" />
            <text x="90" y="54" textAnchor="middle" fontSize="10" fontWeight="bold" fill={C.ink}>{String(shape).toUpperCase()}</text>
          </g>
        )
    }
  }

  return (
    <div className={`inline-block rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-2 shadow-xs print-avoid-break ${className}`}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-[145px] sm:w-[170px] h-auto block mx-auto"
        role="img"
        aria-label={`Figura geométrica: ${shape}`}
      >
        <rect width={w} height={h} fill="#ffffff" rx="6" />
        {renderShape()}
      </svg>
    </div>
  )
}
