import { jsPDF } from 'jspdf'
import type {
  ActivityContent,
  ExamContent,
  ExerciseConfig,
  ExerciseContent,
  LessonContent,
  Material,
  PlanContent,
  Question,
  QuestionFigureData,
  SchoolIdentity,
  WorkbookContent,
} from './types'
import { MATERIAL_LABEL, YEAR_LABEL } from './types'
import { getTopic } from '../data/topics'
import { getSkill } from '../data/bncc'
import { formatDate, formatNumber, slugify } from './utils'
import { detectShapeFromText } from './generators'
import {
  calculateMetrics,
  DEFAULT_DIMENSIONS,
  SHAPES,
  type ShapeDimensions,
  type ShapeId,
} from '../components/GeometryFigure'

type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return [70, 102, 255]
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

function ensureImage(logo: string): string | null {
  if (!logo) return null
  if (logo.startsWith('data:image/png') || logo.startsWith('data:image/jpeg') || logo.startsWith('data:image/webp')) {
    return logo
  }
  return null
}

export interface PdfOptions {
  identity: SchoolIdentity
  title: string
  subtitle?: string
  documentLabel?: string
  orientation?: 'portrait' | 'landscape'
  showHeader?: boolean
}

export class PdfBuilder {
  doc: jsPDF
  identity: SchoolIdentity
  primary: RGB
  accent: RGB
  margin = 14
  pageWidth: number
  pageHeight: number
  y: number
  showHeader: boolean
  title: string
  subtitle?: string
  documentLabel?: string
  pageNumber = 1
  headerHeight = 0

  constructor(options: PdfOptions) {
    this.doc = new jsPDF({
      orientation: options.orientation ?? 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })
    this.identity = options.identity
    this.primary = hexToRgb(options.identity.primary || '#101b3f')
    this.accent = hexToRgb(options.identity.accent || '#f97316')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.showHeader = options.showHeader !== false
    this.title = options.title
    this.subtitle = options.subtitle
    this.documentLabel = options.documentLabel
    this.y = this.margin
    if (this.showHeader) this.addHeader()
    this.y = this.headerHeight + 8
  }

  addHeader(): void {
    const { doc } = this
    doc.setFillColor(...this.primary)
    doc.rect(0, 0, this.pageWidth, 30, 'F')
    doc.setFillColor(...this.accent)
    doc.rect(0, 30, this.pageWidth, 1.4, 'F')
    const logo = ensureImage(this.identity.logo)
    let textX = this.margin
    if (logo) {
      try {
        doc.addImage(logo, logo.includes('png') ? 'PNG' : 'JPEG', this.margin, 7, 17, 17)
        textX += 22
      } catch {
        // The logo is decorative. Continue without it if the image cannot be embedded.
      }
    }
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(this.identity.name || 'Matemática Interativa', textX, 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const note = this.documentLabel || this.identity.headerNote || 'Matemática Interativa · laboratório digital de Matemática'
    doc.text(note.slice(0, 95), textX, 18)
    if (this.identity.teacher) {
      doc.text(`Professor(a): ${this.identity.teacher}`.slice(0, 100), textX, 23)
    }
    if (this.identity.address) {
      doc.setFontSize(7)
      doc.text(this.identity.address.slice(0, 105), this.margin, 27)
    }
    doc.setTextColor(20, 30, 65)
    this.headerHeight = 34
  }

  checkPage(needed: number): void {
    const footerSpace = 16
    if (this.y + needed > this.pageHeight - this.margin - footerSpace) {
      this.doc.addPage()
      this.pageNumber += 1
      this.y = this.margin
      if (this.showHeader) {
        this.doc.setFillColor(...this.primary)
        this.doc.rect(0, 0, this.pageWidth, 8, 'F')
        this.doc.setTextColor(255, 255, 255)
        this.doc.setFontSize(7)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(`${this.identity.name || 'Matemática Interativa'} · ${this.title}`.slice(0, 120), this.margin, 5.4)
        this.y = 14
      }
    }
  }

  titleBlock(title: string, subtitle?: string): void {
    this.checkPage(22)
    this.doc.setTextColor(20, 30, 65)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(17)
    const titleLines = this.doc.splitTextToSize(title, this.pageWidth - this.margin * 2)
    this.doc.text(titleLines, this.margin, this.y + 2)
    this.y += titleLines.length * 7
    if (subtitle) {
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9.5)
      this.doc.setTextColor(91, 102, 128)
      const lines = this.doc.splitTextToSize(subtitle, this.pageWidth - this.margin * 2)
      this.doc.text(lines, this.margin, this.y + 2)
      this.y += lines.length * 4.5
    }
    this.y += 4
  }

  sectionTitle(text: string): void {
    this.checkPage(12)
    this.doc.setFillColor(242, 245, 252)
    this.doc.roundedRect(this.margin, this.y, this.pageWidth - this.margin * 2, 8.5, 1.5, 1.5, 'F')
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(10.5)
    this.doc.setTextColor(...this.primary)
    this.doc.text(text.toUpperCase(), this.margin + 3, this.y + 5.8)
    this.y += 12
  }

  paragraph(text: string, options: { size?: number; bold?: boolean; color?: RGB; indent?: number } = {}): void {
    const { size = 9.5, bold = false, color = [40, 48, 72], indent = 0 } = options
    const width = this.pageWidth - this.margin * 2 - indent
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal')
    this.doc.setFontSize(size)
    this.doc.setTextColor(...color)
    const lines = this.doc.splitTextToSize(text, width) as string[]
    const lineHeight = size * 0.48
    lines.forEach((line) => {
      this.checkPage(lineHeight + 2)
      this.doc.text(line, this.margin + indent, this.y)
      this.y += lineHeight
    })
    this.y += 2
  }

  bullets(items: string[], options: { numbered?: boolean; size?: number; indent?: number } = {}): void {
    const { numbered = false, size = 9.5, indent = 0 } = options
    items.forEach((item, index) => {
      const marker = numbered ? `${index + 1}.` : '•'
      const text = `${marker} ${item}`
      const width = this.pageWidth - this.margin * 2 - indent - 5
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(size)
      this.doc.setTextColor(40, 48, 72)
      const lines = this.doc.splitTextToSize(text, width) as string[]
      const lineHeight = size * 0.48
      lines.forEach((line, lineIndex) => {
        this.checkPage(lineHeight + 2)
        this.doc.text(line, this.margin + indent + (lineIndex === 0 ? 0 : 4), this.y)
        this.y += lineHeight
      })
      this.y += 1.4
    })
    this.y += 2
  }

  labelValue(label: string, value: string): void {
    this.paragraph(`${label}: ${value}`, { size: 9, color: [60, 70, 95] })
  }

  infoGrid(items: { label: string; value: string }[], columns = 2): void {
    const width = (this.pageWidth - this.margin * 2) / columns
    const rowHeight = 8
    let column = 0
    let startY = this.y
    items.forEach((item) => {
      if (column === 0) this.checkPage(rowHeight + 2)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(7.5)
      this.doc.setTextColor(110, 120, 145)
      this.doc.text(item.label.toUpperCase(), this.margin + column * width, startY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      this.doc.setTextColor(30, 38, 60)
      this.doc.text(item.value || '—', this.margin + column * width, startY + 4.2)
      column += 1
      if (column >= columns) {
        column = 0
        startY += rowHeight + 1
      }
    })
    if (column !== 0) startY += rowHeight + 1
    this.y = startY + 2
  }

  divider(): void {
    this.checkPage(6)
    this.doc.setDrawColor(225, 230, 242)
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y)
    this.y += 4
  }

  drawQuestionShape(figure: QuestionFigureData): void {
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

    const boxW = 58
    const boxH = 26
    this.checkPage(boxH + 6)
    const boxX = this.margin + 7
    const boxY = this.y

    const doc = this.doc
    // Background card
    doc.setFillColor(248, 250, 255)
    doc.setDrawColor(218, 226, 246)
    doc.setLineWidth(0.3)
    doc.roundedRect(boxX, boxY, boxW, boxH, 1.5, 1.5, 'FD')

    // Style for shapes
    doc.setFillColor(236, 242, 255)
    doc.setDrawColor(70, 102, 255)
    doc.setLineWidth(0.4)

    const cx = boxX + boxW / 2
    const cy = boxY + boxH / 2

    switch (shape) {
      case 'triangulo': {
        const x1 = cx - 18
        const x2 = cx + 18
        const yBase = boxY + boxH - 6
        const apexX = cx
        const apexY = boxY + 4
        doc.triangle(x1, yBase, x2, yBase, apexX, apexY, 'FD')
        doc.setLineDashPattern([0.8, 0.8], 0)
        doc.setDrawColor(249, 115, 22)
        doc.line(apexX, apexY, apexX, yBase)
        doc.setLineDashPattern([], 0)
        doc.setFontSize(7)
        doc.setTextColor(20, 30, 65)
        doc.text(`b = ${base} ${unit}`, cx, yBase + 3.5, { align: 'center' })
        doc.setTextColor(249, 115, 22)
        doc.text(`h = ${height} ${unit}`, apexX + 2, (apexY + yBase) / 2)
        break
      }
      case 'retangulo': {
        const rw = 32
        const rh = 14
        const rx = cx - rw / 2
        const ry = cy - rh / 2 - 1
        doc.rect(rx, ry, rw, rh, 'FD')
        doc.setFontSize(7)
        doc.setTextColor(20, 30, 65)
        doc.text(`b = ${base} ${unit}`, cx, ry + rh + 3.5, { align: 'center' })
        doc.setTextColor(249, 115, 22)
        doc.text(`h = ${height} ${unit}`, rx + rw + 1.5, ry + rh / 2 + 1)
        break
      }
      case 'quadrado': {
        const sq = 15
        const sx = cx - sq / 2
        const sy = cy - sq / 2 - 1
        doc.rect(sx, sy, sq, sq, 'FD')
        doc.setFontSize(7)
        doc.setTextColor(20, 30, 65)
        doc.text(`lado = ${side} ${unit}`, cx, sy + sq + 3.5, { align: 'center' })
        break
      }
      case 'circulo':
      case 'circunferencia': {
        const r = 8.5
        const ccx = cx - 4
        doc.circle(ccx, cy - 1, r, shape === 'circulo' ? 'FD' : 'S')
        doc.setFillColor(70, 102, 255)
        doc.circle(ccx, cy - 1, 0.5, 'F')
        doc.setDrawColor(249, 115, 22)
        doc.line(ccx, cy - 1, ccx + r, cy - 1)
        doc.setFontSize(7)
        doc.setTextColor(249, 115, 22)
        doc.text(`r = ${radius} ${unit}`, ccx + r / 2, cy - 2, { align: 'center' })
        doc.setTextColor(20, 30, 65)
        doc.text('Círculo', cx + 14, cy, { align: 'center' })
        break
      }
      case 'trapezio': {
        const yTop = boxY + 4
        const yBottom = boxY + boxH - 6
        const x1 = cx - 18
        const x2 = cx + 18
        const xt1 = cx - 9
        const xt2 = cx + 9
        doc.lines([
          [x2 - x1, 0],
          [xt2 - x2, yTop - yBottom],
          [xt1 - xt2, 0],
          [x1 - xt1, yBottom - yTop],
        ], x1, yBottom, [1, 1], 'FD', true)
        doc.setLineDashPattern([0.8, 0.8], 0)
        doc.setDrawColor(249, 115, 22)
        doc.line(xt1, yTop, xt1, yBottom)
        doc.setLineDashPattern([], 0)
        doc.setFontSize(6.5)
        doc.setTextColor(20, 30, 65)
        doc.text(`b = ${side} ${unit}`, cx, yTop - 1, { align: 'center' })
        doc.text(`B = ${base} ${unit}`, cx, yBottom + 3.5, { align: 'center' })
        doc.setTextColor(249, 115, 22)
        doc.text(`h = ${height} ${unit}`, xt1 + 1.5, (yTop + yBottom) / 2)
        break
      }
      case 'losango': {
        const dw = 28
        const dh = 15
        const lcx = cx - 3
        const lcy = cy - 1
        doc.lines([
          [dw / 2, dh / 2],
          [-dw / 2, dh / 2],
          [-dw / 2, -dh / 2],
          [dw / 2, -dh / 2],
        ], lcx, lcy - dh / 2, [1, 1], 'FD', true)
        doc.setLineDashPattern([0.8, 0.8], 0)
        doc.setDrawColor(180, 195, 225)
        doc.line(lcx - dw / 2, lcy, lcx + dw / 2, lcy)
        doc.line(lcx, lcy - dh / 2, lcx, lcy + dh / 2)
        doc.setLineDashPattern([], 0)
        doc.setFontSize(6.5)
        doc.setTextColor(20, 30, 65)
        doc.text(`D = ${diagonalMajor} ${unit} · d = ${diagonalMinor} ${unit}`, cx, boxY + boxH - 1.5, { align: 'center' })
        break
      }
      case 'cubo': {
        const s = 11
        const ox = 5
        const px = cx - 10
        const py = cy - 4
        doc.setFillColor(220, 228, 255)
        doc.lines([[s, 0], [ox, -ox], [-s, 0], [-ox, ox]], px, py, [1, 1], 'FD', true)
        doc.setFillColor(236, 242, 255)
        doc.rect(px, py, s, s, 'FD')
        doc.setFillColor(232, 237, 255)
        doc.lines([[ox, -ox], [0, s], [-ox, ox], [0, -s]], px + s, py, [1, 1], 'FD', true)
        doc.setFontSize(7)
        doc.setTextColor(20, 30, 65)
        doc.text(`a = ${side} ${unit}`, cx, boxY + boxH - 2, { align: 'center' })
        break
      }
      case 'cilindro': {
        const crx = 10
        const cry = 3
        const ch = 12
        const ccx = cx - 4
        const ccy = cy - 2
        doc.setFillColor(227, 233, 255)
        doc.ellipse(ccx, ccy + ch / 2, crx, cry, 'FD')
        doc.setFillColor(236, 242, 255)
        doc.rect(ccx - crx, ccy - ch / 2, crx * 2, ch, 'FD')
        doc.ellipse(ccx, ccy - ch / 2, crx, cry, 'FD')
        doc.setDrawColor(249, 115, 22)
        doc.line(ccx, ccy - ch / 2, ccx + crx, ccy - ch / 2)
        doc.setFontSize(6.5)
        doc.setTextColor(249, 115, 22)
        doc.text(`r = ${radius} ${unit}`, ccx + crx / 2, ccy - ch / 2 - 1, { align: 'center' })
        doc.text(`h = ${height} ${unit}`, ccx + crx + 1.5, ccy)
        break
      }
      case 'paralelepipedo': {
        const pw = 20
        const ph = 9
        const pd = 5
        const px = cx - pw / 2 - 2
        const py = cy - ph / 2 + 1
        doc.setFillColor(220, 228, 255)
        doc.lines([[pw, 0], [pd, -pd], [-pw, 0], [-pd, pd]], px, py, [1, 1], 'FD', true)
        doc.setFillColor(236, 242, 255)
        doc.rect(px, py, pw, ph, 'FD')
        doc.setFillColor(232, 237, 255)
        doc.lines([[pd, -pd], [0, ph], [-pd, pd], [0, -ph]], px + pw, py, [1, 1], 'FD', true)
        doc.setFontSize(6.5)
        doc.setTextColor(20, 30, 65)
        doc.text(`${base} × ${height} × ${depth} ${unit}`, cx, boxY + boxH - 1.5, { align: 'center' })
        break
      }
      default: {
        doc.setFontSize(8)
        doc.setTextColor(70, 102, 255)
        doc.text(`Figura: ${String(shape).toUpperCase()}`, cx, cy, { align: 'center' })
        break
      }
    }

    this.y = boxY + boxH + 2.5
  }

  question(question: Question, index: number, showAnswer = false): void {
    this.checkPage(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(9.5)
    this.doc.setTextColor(20, 30, 65)
    const heading = `${index + 1}.`
    this.doc.text(heading, this.margin, this.y)
    const promptLines = this.doc.splitTextToSize(question.prompt, this.pageWidth - this.margin * 2 - 8) as string[]
    this.doc.setFont('helvetica', 'normal')
    promptLines.forEach((line) => {
      this.checkPage(5)
      this.doc.text(line, this.margin + 7, this.y)
      this.y += 4.6
    })
    this.y += 1.2

    // Draw geometric figure if present or detected
    const figure = question.figure || detectShapeFromText(question.prompt, question.topic)
    if (figure) {
      this.drawQuestionShape(figure)
    }
    if (question.options?.length) {
      const letters = ['A', 'B', 'C', 'D', 'E']
      question.options.forEach((option, optionIndex) => {
        this.checkPage(6)
        this.doc.setFont('helvetica', 'normal')
        this.doc.setFontSize(9)
        this.doc.setTextColor(55, 64, 88)
        const lines = this.doc.splitTextToSize(`${letters[optionIndex]}) ${option}`, this.pageWidth - this.margin * 2 - 15) as string[]
        lines.forEach((line, lineIndex) => {
          this.checkPage(5)
          this.doc.text(line, this.margin + 10, this.y + (lineIndex === 0 ? 0 : 4.2))
          this.y += lineIndex === 0 ? 0 : 4.2
        })
        this.y += 4.6
      })
    } else {
      this.doc.setDrawColor(210, 216, 232)
      this.doc.line(this.margin + 7, this.y + 2, this.pageWidth - this.margin - 2, this.y + 2)
      this.y += 8
    }
    if (showAnswer) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(8.5)
      this.doc.setTextColor(...this.accent)
      this.doc.text(`Resposta: ${question.answer}`, this.margin + 7, this.y)
      this.y += 5
      question.steps.forEach((step) => {
        this.checkPage(5)
        this.doc.setFont('helvetica', 'normal')
        this.doc.setFontSize(8)
        this.doc.setTextColor(80, 88, 108)
        const lines = this.doc.splitTextToSize(`• ${step}`, this.pageWidth - this.margin * 2 - 12) as string[]
        lines.forEach((line) => {
          this.checkPage(4.5)
          this.doc.text(line, this.margin + 10, this.y)
          this.y += 4
        })
        this.y += 0.8
      })
    }
    this.y += 3
  }

  answerKey(questions: Question[]): void {
    this.doc.addPage()
    this.pageNumber += 1
    this.y = this.margin
    this.doc.setFillColor(...this.primary)
    this.doc.rect(0, 0, this.pageWidth, 18, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(14)
    this.doc.text('GABARITO E RESOLUÇÕES', this.margin, 11)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(8)
    this.doc.text(`${this.title} · ${this.identity.teacher || 'Professor(a)'}`, this.margin, 16)
    this.y = 27
    questions.forEach((question, index) => {
      this.checkPage(20)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.primary)
      this.doc.text(`${index + 1}. ${question.answer}`, this.margin, this.y)
      this.y += 5.5
      const steps = question.steps.length ? question.steps : ['Confira o registro do estudante e a coerência do raciocínio.']
      steps.forEach((step) => {
        this.doc.setFont('helvetica', 'normal')
        this.doc.setFontSize(8.5)
        this.doc.setTextColor(75, 84, 106)
        const lines = this.doc.splitTextToSize(step, this.pageWidth - this.margin * 2 - 4) as string[]
        lines.forEach((line) => {
          this.checkPage(4.5)
          this.doc.text(line, this.margin + 2, this.y)
          this.y += 4
        })
      })
      this.y += 3
    })
  }

  activity(content: ActivityContent): void {
    this.titleBlock(content.title, content.subtitle)
    this.paragraph(content.instructions, { size: 9, color: [90, 100, 125] })
    content.activities.forEach((activity, index) => {
      this.sectionTitle(`${index + 1}. ${activity.title}`)
      this.paragraph(activity.instruction, { size: 9 })
      if (activity.kind === 'figuras') {
        const shapes = (activity.data?.shapes as { name: string; sides: number; kind: string }[] | undefined) ?? [
          { name: 'Quadrado', sides: 4, kind: 'square' },
          { name: 'Triângulo', sides: 3, kind: 'triangle' },
          { name: 'Círculo', sides: 0, kind: 'circle' },
          { name: 'Retângulo', sides: 4, kind: 'rectangle' },
          { name: 'Losango', sides: 4, kind: 'diamond' },
          { name: 'Pentágono', sides: 5, kind: 'pentagon' },
        ]
        const cols = 3
        const cardW = (this.pageWidth - this.margin * 2 - 8) / cols
        const cardH = 32
        shapes.forEach((item, sIndex) => {
          const col = sIndex % cols
          if (col === 0) this.checkPage(cardH + 4)
          const cardX = this.margin + col * (cardW + 4)
          const cardY = this.y
          this.doc.setFillColor(248, 250, 255)
          this.doc.setDrawColor(215, 225, 245)
          this.doc.roundedRect(cardX, cardY, cardW, cardH, 1.5, 1.5, 'FD')

          // Draw shape inside card
          const shX = cardX + cardW / 2
          const shY = cardY + 11
          this.doc.setFillColor(235, 242, 255)
          this.doc.setDrawColor(70, 102, 255)
          this.doc.setLineWidth(0.4)
          if (item.kind === 'square') {
            this.doc.rect(shX - 7, shY - 7, 14, 14, 'FD')
          } else if (item.kind === 'triangle') {
            this.doc.triangle(shX - 8, shY + 7, shX + 8, shY + 7, shX, shY - 8, 'FD')
          } else if (item.kind === 'circle') {
            this.doc.circle(shX, shY, 7.5, 'FD')
          } else if (item.kind === 'rectangle') {
            this.doc.rect(shX - 11, shY - 6, 22, 12, 'FD')
          } else if (item.kind === 'diamond') {
            this.doc.lines([[8, 6], [-8, 6], [-8, -6], [8, -6]], shX, shY - 6, [1, 1], 'FD', true)
          } else {
            // pentagon
            this.doc.lines([[7, 5], [-3, 8], [-8, 0], [-3, -8], [7, -5]], shX, shY - 7, [1, 1], 'FD', true)
          }

          // Student response lines
          this.doc.setFontSize(6.5)
          this.doc.setTextColor(100, 110, 130)
          this.doc.text('Nome:', cardX + 3, cardY + 23)
          this.doc.setDrawColor(200, 210, 230)
          this.doc.line(cardX + 11, cardY + 23, cardX + cardW - 3, cardY + 23)

          this.doc.text('Lados:', cardX + 3, cardY + 28.5)
          this.doc.line(cardX + 11, cardY + 28.5, cardX + cardW - 3, cardY + 28.5)

          if (col === cols - 1 || sIndex === shapes.length - 1) {
            this.y = cardY + cardH + 4
          }
        })
      } else {
        activity.items.slice(0, 6).forEach((item, itemIndex) => {
          this.checkPage(13)
          this.doc.setFont('helvetica', 'normal')
          this.doc.setFontSize(9.5)
          this.doc.setTextColor(35, 43, 65)
          this.doc.text(`${itemIndex + 1}) ${item.prompt}`, this.margin, this.y)
          this.doc.setDrawColor(200, 208, 225)
          this.doc.line(this.margin + 8, this.y + 5, this.pageWidth - this.margin, this.y + 5)
          this.y += 11
        })
      }
      this.y += 2
    })
  }

  footer(): void {
    const total = this.doc.getNumberOfPages()
    for (let page = 1; page <= total; page += 1) {
      this.doc.setPage(page)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(7)
      this.doc.setTextColor(125, 135, 158)
      const footer = this.identity.footer || 'Matemática Interativa · Matemática que ensina, interage e transforma'
      this.doc.text(footer.slice(0, 115), this.margin, this.pageHeight - 7)
      this.doc.text(`${page}/${total}`, this.pageWidth - this.margin - 8, this.pageHeight - 7)
    }
  }

  save(filename: string): void {
    this.footer()
    this.doc.save(`${slugify(filename) || 'documento'}.pdf`)
  }
}

export function exportPlanPdf(plan: PlanContent, identity: SchoolIdentity, meta: { title: string }): void {
  const pdf = new PdfBuilder({
    identity,
    title: meta.title,
    documentLabel: 'Plano de aula',
    subtitle: 'Planejamento pedagógico gerado na plataforma Matemática Interativa',
  })
  pdf.titleBlock(meta.title, plan.theme)
  pdf.infoGrid([
    { label: 'Tema', value: plan.theme },
    { label: 'Professor(a)', value: identity.teacher },
    { label: 'Instituição', value: identity.name },
    { label: 'Data', value: formatDate(new Date()) },
  ])
  pdf.sectionTitle('Justificativa pedagógica')
  pdf.paragraph(plan.justification)
  pdf.sectionTitle('Objetivo geral')
  pdf.paragraph(plan.generalObjective, { bold: true })
  pdf.sectionTitle('Objetivos específicos')
  pdf.bullets(plan.specificObjectives)
  pdf.sectionTitle('Habilidades da BNCC')
  if (plan.skills.length) {
    plan.skills.forEach((skill) => {
      pdf.paragraph(`${skill.code} — ${skill.description}`, { size: 9 })
    })
  } else {
    pdf.paragraph('Habilidades definidas no currículo local.', { size: 9 })
  }
  pdf.sectionTitle('Objetos de conhecimento')
  pdf.bullets(plan.knowledgeObjects)
  pdf.sectionTitle('Competências desenvolvidas')
  pdf.bullets(plan.competencies)
  pdf.sectionTitle('Conteúdos abordados')
  pdf.bullets(plan.contents)
  pdf.sectionTitle('Metodologia')
  pdf.paragraph(plan.methodology)
  pdf.sectionTitle('Desenvolvimento da aula')
  plan.development.forEach((step) => {
    pdf.paragraph(`${step.stage} (${step.duration})`, { bold: true, size: 9.5 })
    pdf.paragraph(step.description, { size: 9 })
  })
  pdf.sectionTitle('Recursos didáticos')
  pdf.bullets(plan.resources)
  pdf.sectionTitle('Avaliação')
  pdf.bullets(plan.assessment)
  pdf.sectionTitle('Atividades práticas')
  pdf.bullets(plan.practical)
  pdf.sectionTitle('Atividades de fixação')
  pdf.bullets(plan.fixation)
  pdf.sectionTitle('Tarefa de casa')
  pdf.bullets(plan.homework)
  pdf.sectionTitle('Adaptações e inclusão')
  pdf.bullets([...plan.adaptations, ...plan.inclusive])
  pdf.sectionTitle('Referências')
  pdf.bullets(plan.references)
  pdf.save(`plano-${meta.title}`)
}

export function exportExercisePdf(
  config: ExerciseConfig,
  questions: Question[],
  identity: SchoolIdentity,
  options: { title?: string; subtitle?: string; includeKey?: boolean; answerLines?: boolean; header?: ExamContent['header'] } = {},
): void {
  const topic = getTopic(config.topic)
  const title = options.title || `${topic.name} — lista de exercícios`
  const pdf = new PdfBuilder({
    identity,
    title,
    documentLabel: 'Lista de exercícios',
    subtitle: options.subtitle || `${YEAR_LABEL[config.year]} · ${topic.name} · ${questions.length} questões`,
  })
  pdf.titleBlock(title, options.subtitle)
  if (options.header) {
    pdf.infoGrid([
      { label: 'Escola', value: options.header.school },
      { label: 'Professor(a)', value: options.header.teacher },
      { label: 'Aluno(a)', value: options.header.student },
      { label: 'Turma', value: options.header.className },
      { label: 'Data', value: options.header.date },
      { label: 'Valor', value: options.header.value },
    ])
  } else {
    pdf.infoGrid([
      { label: 'Ano / etapa', value: YEAR_LABEL[config.year] },
      { label: 'Professor(a)', value: identity.teacher || '—' },
      { label: 'Data', value: formatDate(new Date()) },
      { label: 'Questões', value: String(questions.length) },
    ])
  }
  pdf.paragraph('Instruções: leia com atenção, registre o raciocínio e confira suas respostas antes de entregar.', {
    size: 8.5,
    color: [100, 110, 132],
  })
  questions.forEach((question, index) => pdf.question(question, index, false))
  if (options.includeKey !== false) pdf.answerKey(questions)
  pdf.save(`${title}-${config.year}`)
}

export function exportExamPdf(
  exam: ExamContent,
  config: ExerciseConfig,
  identity: SchoolIdentity,
): void {
  const topic = getTopic(config.topic)
  const pdf = new PdfBuilder({
    identity,
    title: exam.title,
    documentLabel: 'Avaliação de Matemática',
    orientation: exam.layout === 'paisagem' ? 'landscape' : 'portrait',
    subtitle: exam.instructions[0],
  })
  if (exam.showHeader) {
    pdf.infoGrid([
      { label: 'Escola', value: exam.header.school },
      { label: 'Professor(a)', value: exam.header.teacher },
      { label: 'Aluno(a)', value: exam.header.student },
      { label: 'Turma', value: exam.header.className },
      { label: 'Data', value: exam.header.date },
      { label: 'Valor', value: exam.header.value },
    ])
  }
  pdf.titleBlock(exam.title, `${topic.name} · ${YEAR_LABEL[config.year]}`)
  pdf.sectionTitle('Instruções')
  pdf.bullets(exam.instructions)
  exam.questions.forEach((question, index) => pdf.question(question, index, false))
  if (exam.showAnswers) pdf.answerKey(exam.questions)
  pdf.save(exam.title)
}

export function exportLessonPdf(
  lesson: LessonContent,
  identity: SchoolIdentity,
): void {
  const pdf = new PdfBuilder({
    identity,
    title: lesson.title,
    documentLabel: 'Aula interativa · modo professor',
    subtitle: lesson.summary,
  })
  pdf.titleBlock(lesson.title, lesson.theme)
  pdf.sectionTitle('Objetivos')
  pdf.bullets(lesson.objectives)
  pdf.sectionTitle('Habilidades da BNCC')
  lesson.skills.forEach((skill) => pdf.paragraph(`${skill.code} — ${skill.description}`, { size: 9 }))
  lesson.slides.forEach((slide) => {
    pdf.sectionTitle(slide.eyebrow)
    pdf.paragraph(slide.title, { bold: true, size: 12 })
    pdf.bullets(slide.body)
    if (slide.question) {
      pdf.question(slide.question, 0, true)
    }
    if (slide.notes) {
      pdf.paragraph(`Nota para o professor: ${slide.notes}`, { size: 8.5, color: [100, 110, 132] })
    }
  })
  pdf.save(lesson.title)
}

export function exportWorkbookPdf(
  workbook: WorkbookContent,
  identity: SchoolIdentity,
): void {
  const pdf = new PdfBuilder({
    identity,
    title: workbook.title,
    documentLabel: 'Apostila de Matemática',
    subtitle: workbook.subtitle,
  })
  pdf.titleBlock(workbook.title, workbook.subtitle)
  pdf.sectionTitle('Apresentação')
  pdf.paragraph(workbook.presentation)
  if (workbook.includeSummary && workbook.topics.length) {
    pdf.sectionTitle('Conteúdos desta apostila')
    workbook.topics.forEach((topicId) => {
      const topic = getTopic(topicId)
      pdf.paragraph(topic.name, { bold: true })
      pdf.paragraph(topic.summary, { size: 9 })
      pdf.bullets(topic.formulas.map((formula) => `${formula.label}: ${formula.value}`), { size: 8.5 })
    })
  }
  pdf.sectionTitle('Exercícios')
  workbook.questions.forEach((question, index) => pdf.question(question, index, false))
  if (workbook.includeAnswers) pdf.answerKey(workbook.questions)
  pdf.save(workbook.title)
}

export function exportActivityPdf(
  content: ActivityContent,
  identity: SchoolIdentity,
): void {
  const pdf = new PdfBuilder({
    identity,
    title: content.title,
    documentLabel: 'Atividade ilustrada',
    subtitle: content.subtitle,
  })
  pdf.activity(content)
  pdf.save(content.title)
}

export function exportMaterialPdf(material: Material, identity: SchoolIdentity): void {
  if (material.type === 'plano') {
    exportPlanPdf(material.content as PlanContent, identity, { title: material.title })
  } else if (material.type === 'aula') {
    exportLessonPdf(material.content as LessonContent, identity)
  } else if (material.type === 'apostila') {
    exportWorkbookPdf(material.content as WorkbookContent, identity)
  } else if (material.type === 'atividade') {
    exportActivityPdf(material.content as ActivityContent, identity)
  } else if (material.type === 'exercicios' || material.type === 'prova') {
    if (material.type === 'prova') {
      const exam = material.content as ExamContent
      if (exam.questions) {
        exportExamPdf(exam, {
          stage: material.stage,
          year: material.year,
          topic: material.topic,
          skillCode: material.skillCodes[0] ?? '',
          count: exam.questions.length,
          difficulty: 'medio',
          kinds: ['multipla'],
          includeSolutions: true,
          includeImages: false,
          contextualized: true,
          variants: 1,
          seed: 1,
        }, identity)
        return
      }
    }
    const content = material.content as ExerciseContent
    if (content.config && content.questions) {
      exportExercisePdf(content.config, content.questions, identity, { title: material.title })
    } else {
      const config = material.content as unknown as ExerciseConfig
      exportExercisePdf(config, [], identity, { title: material.title })
    }
  } else {
    const pdf = new PdfBuilder({ identity, title: material.title, documentLabel: MATERIAL_LABEL[material.type] })
    pdf.titleBlock(material.title, material.description)
    pdf.paragraph('Este material faz parte da biblioteca da plataforma Matemática Interativa.', { size: 9 })
    pdf.save(material.title)
  }
}

export function exportGeometryPdf(
  svgElement: SVGSVGElement | null,
  title: string,
  identity: SchoolIdentity,
  description: string,
): void {
  const pdf = new PdfBuilder({
    identity,
    title,
    documentLabel: 'Laboratório de geometria',
    subtitle: description,
  })
  pdf.titleBlock(title, description)
  if (svgElement) {
    const clone = svgElement.cloneNode(true) as SVGSVGElement
    clone.setAttribute('width', '800')
    clone.setAttribute('height', '600')
    const xml = new XMLSerializer().serializeToString(clone)
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1600
      canvas.height = 1200
      const context = canvas.getContext('2d')
      if (context) {
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        try {
          const png = canvas.toDataURL('image/png')
          const width = pdf.pageWidth - pdf.margin * 2
          const height = width * 0.72
          pdf.doc.addImage(png, 'PNG', pdf.margin, pdf.y, width, height)
          pdf.y += height + 6
        } catch {
          pdf.paragraph('A figura não pôde ser incorporada ao PDF. Utilize a exportação SVG ou PNG.', { size: 9 })
        }
      }
      URL.revokeObjectURL(url)
      pdf.save(title)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      pdf.paragraph('A figura não pôde ser incorporada ao PDF. Utilize a exportação SVG ou PNG.', { size: 9 })
      pdf.save(title)
    }
    image.src = url
  } else {
    pdf.paragraph('Figura indisponível.', { size: 9 })
    pdf.save(title)
  }
}

export function exportSvgFile(svg: string, filename: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${slugify(filename)}.svg`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportSvgAsPng(svgElement: SVGSVGElement, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const clone = svgElement.cloneNode(true) as SVGSVGElement
    clone.setAttribute('width', '1200')
    clone.setAttribute('height', '900')
    const xml = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1600
      canvas.height = 1200
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas indisponível'))
        return
      }
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          URL.revokeObjectURL(url)
          reject(new Error('Não foi possível gerar a imagem'))
          return
        }
        const anchor = document.createElement('a')
        const pngUrl = URL.createObjectURL(pngBlob)
        anchor.href = pngUrl
        anchor.download = `${slugify(filename)}.png`
        anchor.click()
        URL.revokeObjectURL(pngUrl)
        URL.revokeObjectURL(url)
        resolve()
      }, 'image/png')
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Falha ao carregar a figura'))
    }
    image.src = url
  })
}

export function skillLabel(code: string): string {
  const skill = getSkill(code)
  return skill ? `${skill.code} — ${skill.description}` : code
}

export function formatPoints(value: number): string {
  return `${formatNumber(value, 1)} pt`
}
