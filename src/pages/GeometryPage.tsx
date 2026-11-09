import { useMemo, useRef, useState } from 'react'
import {
  Box,
  Check,
  ClipboardCopy,
  Download,
  Eye,
  FileImage,
  Grid3X3,
  Info,
  Layers3,
  Printer,
  Ruler,
  Shapes,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { Badge, Button, Card, Field, Input, PageHeader, Select } from '../components/ui'
import { DocumentPaper } from '../components/Document'
import {
  DEFAULT_DIMENSIONS,
  GeometryFigure,
  SHAPES,
  calculateMetrics,
  type ShapeDimensions,
  type ShapeId,
} from '../components/GeometryFigure'
import { exportGeometryPdf, exportSvgAsPng, exportSvgFile } from '../lib/pdf'
import { cn } from '../lib/utils'

type DimensionKey = keyof ShapeDimensions

const DIMENSION_FIELDS: Record<ShapeId, { key: DimensionKey; label: string; min: number; max: number; step?: number }[]> = {
  quadrado: [{ key: 'side', label: 'Lado (cm)', min: 0.5, max: 40, step: 0.5 }],
  retangulo: [
    { key: 'base', label: 'Base (cm)', min: 0.5, max: 60, step: 0.5 },
    { key: 'height', label: 'Altura (cm)', min: 0.5, max: 40, step: 0.5 },
  ],
  triangulo: [
    { key: 'base', label: 'Base (cm)', min: 0.5, max: 60, step: 0.5 },
    { key: 'height', label: 'Altura (cm)', min: 0.5, max: 40, step: 0.5 },
  ],
  losango: [
    { key: 'diagonalMajor', label: 'Diagonal maior (cm)', min: 0.5, max: 60, step: 0.5 },
    { key: 'diagonalMinor', label: 'Diagonal menor (cm)', min: 0.5, max: 40, step: 0.5 },
  ],
  trapezio: [
    { key: 'base', label: 'Base maior (cm)', min: 0.5, max: 60, step: 0.5 },
    { key: 'side', label: 'Base menor (cm)', min: 0.5, max: 50, step: 0.5 },
    { key: 'height', label: 'Altura (cm)', min: 0.5, max: 40, step: 0.5 },
  ],
  paralelogramo: [
    { key: 'base', label: 'Base (cm)', min: 0.5, max: 60, step: 0.5 },
    { key: 'height', label: 'Altura (cm)', min: 0.5, max: 40, step: 0.5 },
  ],
  circulo: [{ key: 'radius', label: 'Raio (cm)', min: 0.5, max: 30, step: 0.5 }],
  circunferencia: [{ key: 'radius', label: 'Raio (cm)', min: 0.5, max: 30, step: 0.5 }],
  poligono: [
    { key: 'sides', label: 'Número de lados', min: 3, max: 12, step: 1 },
    { key: 'radius', label: 'Raio da circunferência (cm)', min: 0.5, max: 30, step: 0.5 },
  ],
  cubo: [{ key: 'side', label: 'Aresta (cm)', min: 0.5, max: 30, step: 0.5 }],
  paralelepipedo: [
    { key: 'base', label: 'Comprimento (cm)', min: 0.5, max: 40, step: 0.5 },
    { key: 'height', label: 'Altura (cm)', min: 0.5, max: 30, step: 0.5 },
    { key: 'depth', label: 'Profundidade (cm)', min: 0.5, max: 30, step: 0.5 },
  ],
  piramide: [
    { key: 'base', label: 'Aresta da base (cm)', min: 0.5, max: 40, step: 0.5 },
    { key: 'height', label: 'Altura (cm)', min: 0.5, max: 40, step: 0.5 },
  ],
  cilindro: [
    { key: 'radius', label: 'Raio (cm)', min: 0.5, max: 25, step: 0.5 },
    { key: 'height', label: 'Altura (cm)', min: 0.5, max: 40, step: 0.5 },
  ],
  cone: [
    { key: 'radius', label: 'Raio (cm)', min: 0.5, max: 25, step: 0.5 },
    { key: 'height', label: 'Altura (cm)', min: 0.5, max: 40, step: 0.5 },
  ],
  esfera: [{ key: 'radius', label: 'Raio (cm)', min: 0.5, max: 25, step: 0.5 }],
}

function Toggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.67rem] font-bold transition-colors',
        active ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300',
      )}
    >
      {icon} {label}
    </button>
  )
}

export function GeometryPage() {
  const { school, toast } = useApp()
  const [shapeId, setShapeId] = useState<ShapeId>('retangulo')
  const [dims, setDims] = useState<ShapeDimensions>({ ...DEFAULT_DIMENSIONS })
  const [group, setGroup] = useState<'todas' | 'planas' | 'espaciais'>('todas')
  const [showLabels, setShowLabels] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [planification, setPlanification] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const shape = SHAPES.find((item) => item.id === shapeId) ?? SHAPES[0]
  const { metrics, properties } = useMemo(() => calculateMetrics(shapeId, dims), [shapeId, dims])
  const filteredShapes = group === 'todas' ? SHAPES : SHAPES.filter((item) => item.group === group)
  const fields = DIMENSION_FIELDS[shapeId]

  const updateDimension = (key: DimensionKey, raw: string) => {
    const parsed = Number(raw)
    const field = fields.find((item) => item.key === key)
    const value = Number.isFinite(parsed) ? parsed : field?.min ?? 1
    const clamped = Math.min(field?.max ?? 100, Math.max(field?.min ?? 0.1, value))
    setDims((current) => ({ ...current, [key]: key === 'sides' ? Math.round(clamped) : clamped }))
  }

  const chooseShape = (id: ShapeId) => {
    setShapeId(id)
    const next = SHAPES.find((item) => item.id === id)
    if (!next?.solid) setPlanification(false)
  }

  const exportSvg = () => {
    if (!svgRef.current) return
    exportSvgFile(new XMLSerializer().serializeToString(svgRef.current), `figura-${shapeId}`)
    toast({ title: 'SVG exportado', description: 'A figura vetorial pode ser ampliada sem perder qualidade.', tone: 'success' })
  }

  const exportPng = async () => {
    if (!svgRef.current) return
    try {
      await exportSvgAsPng(svgRef.current, `figura-${shapeId}`)
      toast({ title: 'PNG exportado', description: 'Imagem em alta resolução pronta para apresentações.', tone: 'success' })
    } catch {
      toast({ title: 'Não foi possível gerar o PNG', description: 'Use a exportação SVG ou tente novamente.', tone: 'error' })
    }
  }

  const exportPdf = () => {
    exportGeometryPdf(
      svgRef.current,
      `Laboratório de geometria — ${shape.name}`,
      school,
      `${shape.name} · medidas em centímetros · ${metrics.map((metric) => `${metric.label}: ${metric.value}`).join(' · ')}`,
    )
    toast({ title: 'PDF com a figura gerado', description: 'O documento inclui a identidade da escola.', tone: 'success' })
  }

  const copySvg = async () => {
    if (!svgRef.current) return
    const code = new XMLSerializer().serializeToString(svgRef.current)
    try {
      await navigator.clipboard.writeText(code)
      toast({ title: 'Código SVG copiado', description: 'Cole em slides, documentos ou editores vetoriais.', tone: 'success' })
    } catch {
      toast({ title: 'Não foi possível copiar', description: 'Seu navegador bloqueou o acesso à área de transferência.', tone: 'error' })
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Visualizar para compreender"
        title="Laboratório de geometria"
        description="Construa figuras planas e sólidos com medidas ajustáveis, fórmulas conferidas e exportação em SVG, PNG ou PDF."
        icon={<Shapes size={21} />}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<ClipboardCopy size={14} />} onClick={copySvg}>Copiar SVG</Button>
            <Button variant="secondary" size="sm" icon={<FileImage size={14} />} onClick={exportPng}>PNG</Button>
            <Button size="sm" icon={<Download size={14} />} onClick={exportPdf}>Baixar PDF</Button>
          </>
        }
      />

      <div className="grid xl:grid-cols-[355px_1fr] gap-5 items-start">
        <Card className="p-4 sm:p-5 xl:sticky xl:top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 grid place-items-center"><Ruler size={16} /></div>
            <div>
              <div className="text-[0.8rem] font-bold">Escolher figura</div>
              <div className="text-[0.62rem] text-slate-400">Medidas e propriedades em tempo real</div>
            </div>
          </div>

          <div className="segmented mb-3">
            {[
              { value: 'todas' as const, label: 'Todas' },
              { value: 'planas' as const, label: 'Planas' },
              { value: 'espaciais' as const, label: 'Espaciais' },
            ].map((item) => (
              <button key={item.value} className={group === item.value ? 'active' : ''} onClick={() => setGroup(item.value)}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-[18rem] overflow-y-auto pr-1">
            {filteredShapes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseShape(item.id)}
                className={cn(
                  'rounded-lg border p-2.5 text-left transition-colors',
                  shapeId === item.id ? 'border-indigo-300 bg-indigo-50/70' : 'border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-white',
                )}
              >
                <div className="flex items-center gap-1.5">
                  {item.solid ? <Box size={13} className={shapeId === item.id ? 'text-indigo-600' : 'text-slate-400'} /> : <Shapes size={13} className={shapeId === item.id ? 'text-indigo-600' : 'text-slate-400'} />}
                  <span className={cn('text-[0.67rem] font-bold leading-tight', shapeId === item.id ? 'text-indigo-700' : 'text-slate-600')}>{item.name}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-500 mb-2">
              <Ruler size={13} /> Medidas da figura
            </div>
            <div className="space-y-2.5">
              {fields.map((field) => (
                <Field key={field.key} label={field.label}>
                  <Input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 0.5}
                    value={dims[field.key]}
                    onChange={(event) => updateDimension(field.key, event.target.value)}
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Exibição</div>
            <div className="flex flex-wrap gap-1.5">
              <Toggle active={showLabels} onClick={() => setShowLabels((value) => !value)} icon={<Eye size={13} />} label="Medidas" />
              <Toggle active={showGrid} onClick={() => setShowGrid((value) => !value)} icon={<Grid3X3 size={13} />} label="Malha" />
              {shape.solid && (
                <Toggle active={planification} onClick={() => setPlanification((value) => !value)} icon={<Layers3 size={13} />} label="Planificação" />
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
            <div className="flex items-center gap-1.5 text-[0.67rem] font-bold text-teal-700">
              <Info size={13} /> Como usar
            </div>
            <p className="text-[0.62rem] text-slate-500 mt-1 leading-relaxed">
              Projete a figura, altere as medidas e peça aos estudantes que prevejam o que acontece com a área ou o volume.
            </p>
          </div>
        </Card>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 no-print">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="green"><Check size={11} /> Cálculos conferidos</Badge>
              <Badge tone="blue">{shape.group === 'espaciais' ? 'Sólido geométrico' : 'Figura plana'}</Badge>
              <span className="text-[0.66rem] text-slate-500">{shape.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" icon={<Printer size={13} />} onClick={() => window.print()}>Imprimir</Button>
              <Button variant="secondary" size="sm" icon={<FileImage size={13} />} onClick={exportSvg}>SVG</Button>
              <Button size="sm" icon={<Download size={13} />} onClick={exportPdf}>PDF</Button>
            </div>
          </div>

          <DocumentPaper title="Laboratório de geometria" subtitle={`${shape.name} · ${shape.group === 'espaciais' ? 'geometria espacial' : 'geometria plana'}`}>
            <div className="mb-4">
              <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-teal-600">Figura geométrica</div>
              <div className="flex flex-wrap items-end justify-between gap-2 mt-1">
                <h1 className="text-[1.2rem] font-bold leading-tight">{shape.name}</h1>
                <Badge tone="violet">{planification ? 'Planificação' : `${dims.base || dims.side || dims.radius} cm de referência`}</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
              <GeometryFigure
                shape={shapeId}
                dims={dims}
                showLabels={showLabels}
                showGrid={showGrid}
                planification={planification}
                svgRef={svgRef}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-2.5 mt-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 print-avoid-break">
                  <div className="text-[0.55rem] font-extrabold uppercase tracking-wide text-slate-400">{metric.label}</div>
                  <div className="text-[0.95rem] font-display font-bold text-indigo-700 mt-0.5">{metric.value}</div>
                  <div className="text-[0.57rem] text-slate-500 mt-1">{metric.formula}</div>
                </div>
              ))}
            </div>

            <div className="doc-section">
              <h3>Propriedades</h3>
              <ul>{properties.map((property) => <li key={property}>{property}</li>)}</ul>
            </div>

            <div className="doc-section">
              <h3>Fórmulas utilizadas</h3>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {metrics.map((metric) => (
                  <div key={`${metric.label}-formula`} className="rounded-lg border border-slate-100 bg-white px-2.5 py-2 text-[0.66rem] text-slate-600">
                    <span className="font-bold text-slate-700">{metric.label}:</span> {metric.formula}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-3">
              <div className="text-[0.62rem] font-extrabold uppercase tracking-wide text-slate-400">Sugestão de exploração</div>
              <p className="text-[0.69rem] text-slate-600 mt-1 leading-relaxed">
                {shape.solid
                  ? 'Peça aos estudantes que identifiquem faces, arestas e vértices. Depois, mostre a planificação e proponha o cálculo da área total.'
                  : 'Solicite uma estimativa antes de calcular. Compare figuras com a mesma área e perímetros diferentes para desenvolver o senso geométrico.'}
              </p>
            </div>
          </DocumentPaper>

          <div className="mt-4 grid sm:grid-cols-3 gap-3 no-print">
            <Card soft className="p-3">
              <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><Sparkles size={14} className="text-violet-500" /> Fórmulas conferidas</div>
              <p className="text-[0.6rem] text-slate-400 mt-1">Os valores são recalculados a cada ajuste.</p>
            </Card>
            <Card soft className="p-3">
              <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><Layers3 size={14} className="text-teal-500" /> Planificação</div>
              <p className="text-[0.6rem] text-slate-400 mt-1">Disponível para os principais sólidos.</p>
            </Card>
            <Card soft className="p-3">
              <div className="flex items-center gap-2 text-[0.66rem] font-bold text-slate-600"><Download size={14} className="text-sky-500" /> Exportação</div>
              <p className="text-[0.6rem] text-slate-400 mt-1">SVG vetorial, PNG e PDF com a escola.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
