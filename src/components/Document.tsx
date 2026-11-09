import { type ReactNode } from 'react'
import { Download, Printer } from 'lucide-react'
import { useApp } from '../lib/store'
import { Button } from './ui'

export function SchoolHeader({
  title,
  subtitle,
  compact = false,
}: {
  title?: string
  subtitle?: string
  compact?: boolean
}) {
  const { school } = useApp()
  return (
    <div className="docx-header" style={{ ['--school-primary' as string]: school.primary }}>
      {school.logo ? (
        <img src={school.logo} alt="Logo da escola" className={compact ? 'w-9 h-9 object-contain' : 'w-12 h-12 object-contain'} />
      ) : (
        <div
          className={compact ? 'w-9 h-9 rounded-lg grid place-items-center text-white text-xs font-extrabold' : 'w-12 h-12 rounded-xl grid place-items-center text-white text-sm font-extrabold'}
          style={{ background: school.primary }}
        >
          {(school.name || 'MI').slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className={compact ? 'text-[0.78rem] font-extrabold text-slate-800' : 'text-[0.92rem] font-extrabold text-slate-800'}>
          {school.name || 'Minha escola'}
        </div>
        <div className="text-[0.64rem] text-slate-500">
          {school.headerNote || 'Laboratório de Matemática'}
          {school.teacher ? ` · ${school.teacher}` : ''}
        </div>
      </div>
      {title && (
        <div className="text-right max-w-[38%]">
          <div className="text-[0.7rem] font-bold text-slate-700">{title}</div>
          {subtitle && <div className="text-[0.6rem] text-slate-500 mt-0.5">{subtitle}</div>}
        </div>
      )}
    </div>
  )
}

export function DocumentPaper({
  children,
  title,
  subtitle,
  actions,
  className = '',
}: {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}) {
  const { school } = useApp()
  return (
    <div className={`paper print-area ${className}`}>
      <div className="no-print flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-[0.68rem] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Prévia do documento
        </div>
        <div className="flex gap-1.5">{actions}</div>
      </div>
      <SchoolHeader title={title} subtitle={subtitle} compact />
      {children}
      <div className="mt-8 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-[0.55rem] text-slate-400">
        <span>{school.footer || 'Matemática Interativa · Matemática que ensina, interage e transforma'}</span>
        <span>Matemática Interativa</span>
      </div>
    </div>
  )
}

export function PrintActions({
  onPdf,
  disabled,
  pdfLabel = 'Baixar PDF',
}: {
  onPdf?: () => void
  disabled?: boolean
  pdfLabel?: string
}) {
  return (
    <>
      {onPdf && (
        <Button size="sm" variant="primary" icon={<Download size={13} />} onClick={onPdf} disabled={disabled}>
          {pdfLabel}
        </Button>
      )}
      <Button
        size="sm"
        variant="secondary"
        icon={<Printer size={13} />}
        onClick={() => window.print()}
        disabled={disabled}
      >
        Imprimir
      </Button>
    </>
  )
}
