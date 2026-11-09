import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useEffect,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { useApp } from '../lib/store'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'orange' | 'danger'

export function Button({
  variant = 'primary',
  size,
  icon,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: 'sm' | 'lg'
  icon?: ReactNode
}) {
  return (
    <button
      className={cn('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', size === 'lg' && 'btn-lg', className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  children,
  className,
  id,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <div className={cn('w-full', className)}>
      <label className="field-label" htmlFor={id}>
        <span>{label}</span>
        {hint && <span className="normal-case tracking-normal font-medium text-[0.65rem] text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('input', className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('select', className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('textarea', className)} {...props} />
}

export function Card({
  children,
  className,
  soft,
}: {
  children: ReactNode
  className?: string
  soft?: boolean
}) {
  return <div className={cn(soft ? 'surface-soft' : 'surface', className)}>{children}</div>
}

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'blue' | 'violet' | 'orange' | 'green' | 'rose'
  className?: string
}) {
  return <span className={cn('chip', tone !== 'default' && `chip-${tone}`, className)}>{children}</span>
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
      <div className="flex items-start gap-3.5">
        {icon && <div className="icon-tile bg-indigo-50 text-indigo-600 mt-0.5">{icon}</div>}
        <div>
          {eyebrow && (
            <div className="text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-indigo-500 mb-1">
              {eyebrow}
            </div>
          )}
          <h1 className="text-[1.65rem] sm:text-[1.9rem] leading-tight font-bold">{title}</h1>
          {description && <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

export function SectionTitle({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-end justify-between gap-4 mb-3', className)}>
      <div>
        <h2 className="text-base font-bold">{title}</h2>
        {description && <p className="text-[0.76rem] text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T
  onChange: (value: T) => void
  items: { value: T; label: string; count?: number }[]
  className?: string
}) {
  return (
    <div className={cn('flex gap-1.5 overflow-x-auto pb-1', className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.74rem] font-bold whitespace-nowrap border transition-colors',
            value === item.value
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span
              className={cn(
                'min-w-[1.2rem] h-[1.2rem] px-1 rounded-full grid place-items-center text-[0.6rem]',
                value === item.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
              )}
            >
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="surface p-8 text-center max-w-xl mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 grid place-items-center mx-auto mb-3">
        {icon}
      </div>
      <h3 className="font-bold text-base">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <div className={cn('modal-panel', wide ? 'max-w-4xl' : 'max-w-2xl')}>
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-[1.2rem]">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-2 rounded-b-[1.2rem]">{footer}</div>}
      </div>
    </div>
  )
}

export function ToastViewport() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 no-print" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? AlertCircle : Info
        const color = toast.tone === 'success' ? 'text-emerald-500' : toast.tone === 'error' ? 'text-rose-500' : 'text-indigo-500'
        return (
          <div key={toast.id} className="toast">
            <Icon size={19} className={cn('mt-0.5 shrink-0', color)} />
            <div className="min-w-0 flex-1">
              <div className="text-[0.8rem] font-bold text-slate-800">{toast.title}</div>
              {toast.description && <div className="text-[0.72rem] text-slate-500 mt-0.5 leading-relaxed">{toast.description}</div>}
            </div>
            <button onClick={() => dismissToast(toast.id)} className="text-slate-400 hover:text-slate-600" aria-label="Fechar aviso">
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px bg-slate-100', className)} />
}
