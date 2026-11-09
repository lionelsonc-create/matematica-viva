import { describe, it, expect } from 'vitest'
import { calculateMetrics, DEFAULT_DIMENSIONS } from '../components/GeometryFigure'
import { getTopic, TOPICS } from '../data/topics'

describe('GeometryFigure', () => {
  it('calculates metrics for quadrado', () => {
    const { metrics, properties } = calculateMetrics('quadrado', { ...DEFAULT_DIMENSIONS, side: 5 })
    const area = metrics.find((m) => m.label === 'Área')
    const perimetro = metrics.find((m) => m.label === 'Perímetro')
    expect(area?.value).toBe('25 cm²')
    expect(perimetro?.value).toBe('20 cm')
    expect(properties.length).toBeGreaterThan(0)
  })

  it('calculates metrics for retangulo', () => {
    const { metrics } = calculateMetrics('retangulo', { ...DEFAULT_DIMENSIONS, base: 10, height: 4 })
    const area = metrics.find((m) => m.label === 'Área')
    const perimetro = metrics.find((m) => m.label === 'Perímetro')
    expect(area?.value).toBe('40 cm²')
    expect(perimetro?.value).toBe('28 cm')
  })

  it('calculates metrics for triangulo', () => {
    const { metrics } = calculateMetrics('triangulo', { ...DEFAULT_DIMENSIONS, base: 6, height: 8 })
    const area = metrics.find((m) => m.label === 'Área')
    expect(area?.value).toBe('24 cm²')
  })

  it('calculates metrics for circulo', () => {
    const { metrics } = calculateMetrics('circulo', { ...DEFAULT_DIMENSIONS, radius: 10 })
    const area = metrics.find((m) => m.label === 'Área')
    expect(area?.value).toContain('314')
  })

  it('calculates metrics for cubo', () => {
    const { metrics } = calculateMetrics('cubo', { ...DEFAULT_DIMENSIONS, side: 3 })
    const volume = metrics.find((m) => m.label === 'Volume')
    expect(volume?.value).toBe('27 cm³')
  })
})

describe('Topics', () => {
  it('loads all topics correctly', () => {
    expect(TOPICS.length).toBeGreaterThan(10)
    const topic = getTopic('geometria-plana')
    expect(topic.name).toBe('Geometria plana')
  })
})
