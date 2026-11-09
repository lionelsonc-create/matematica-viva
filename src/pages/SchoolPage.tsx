import { useMemo, useRef, useState } from 'react'
import {
  Building2,
  Check,
  Download,
  ImagePlus,
  Info,
  Palette,
  RotateCcw,
  Save,
  School,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type { SchoolIdentity } from '../lib/types'
import { DEFAULT_SCHOOL } from '../lib/demo'
import { readFileAsDataUrl } from '../lib/utils'
import { Badge, Button, Card, Field, Input, PageHeader, SectionTitle, Textarea } from '../components/ui'

const palettes = [
  { name: 'Azul e laranja', primary: '#101b3f', accent: '#f97316' },
  { name: 'Índigo e violeta', primary: '#312e81', accent: '#8b5cf6' },
  { name: 'Verde e dourado', primary: '#14532d', accent: '#eab308' },
  { name: 'Vinho e rosa', primary: '#7f1d1d', accent: '#f43f5e' },
  { name: 'Petróleo e ciano', primary: '#134e4a', accent: '#06b6d4' },
  { name: 'Grafite e âmbar', primary: '#1f2937', accent: '#f59e0b' },
]

function SchoolMark({ identity, size = 58 }: { identity: SchoolIdentity; size?: number }) {
  if (identity.logo) {
    return <img src={identity.logo} alt="Logo da escola" style={{ width: size, height: size }} className="object-contain rounded-lg bg-white p-1 border border-slate-100" />
  }
  const initials = (identity.name || 'MI')
    .split(' ')
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'MI'
  return (
    <div
      className="rounded-xl grid place-items-center text-white font-extrabold shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${identity.primary}, ${identity.accent})`, fontSize: size * 0.28 }}
    >
      {initials}
    </div>
  )
}

export function SchoolPage() {
  const { school, updateSchool, toast } = useApp()
  const [draft, setDraft] = useState<SchoolIdentity>(school)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const changed = useMemo(() => JSON.stringify(draft) !== JSON.stringify(school), [draft, school])

  const set = <K extends keyof SchoolIdentity>(key: K, value: SchoolIdentity[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const save = () => {
    updateSchool(draft)
    toast({ title: 'Identidade salva', description: 'Todos os documentos e PDFs passarão a usar estes dados.', tone: 'success' })
  }

  const reset = () => {
    setDraft(DEFAULT_SCHOOL)
    toast({ title: 'Modelo restaurado', description: 'Revise os dados e clique em salvar para aplicar.', tone: 'info' })
  }

  const uploadLogo = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Formato inválido', description: 'Envie uma imagem PNG, JPG ou WEBP.', tone: 'error' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande', description: 'Use uma imagem com até 2 MB para manter o PDF leve.', tone: 'error' })
      return
    }
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      set('logo', dataUrl)
      toast({ title: 'Logo carregado', description: 'A imagem será usada na prévia e nos PDFs.', tone: 'success' })
    } catch {
      toast({ title: 'Não foi possível carregar a imagem', tone: 'error' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="A cara da sua escola"
        title="Identidade da escola"
        description="Personalize o cabeçalho dos documentos com nome, professor, logotipo e cores institucionais. Tudo é aplicado automaticamente em planos, provas, apostilas e atividades."
        icon={<School size={21} />}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={reset} icon={<RotateCcw size={14} />}>Restaurar modelo</Button>
            <Button size="sm" onClick={save} icon={<Save size={14} />} disabled={!changed}>Salvar identidade</Button>
          </>
        }
      />

      <div className="grid xl:grid-cols-[1fr_430px] gap-5 items-start">
        <div className="space-y-5">
          <Card className="p-4 sm:p-5">
            <SectionTitle title="Dados institucionais" description="Aparecem no cabeçalho e no rodapé dos documentos." />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Nome da escola" className="sm:col-span-2">
                <Input value={draft.name} onChange={(event) => set('name', event.target.value)} placeholder="Escola Municipal..." />
              </Field>
              <Field label="Professor(a)">
                <Input value={draft.teacher} onChange={(event) => set('teacher', event.target.value)} placeholder="Seu nome" />
              </Field>
              <Field label="Endereço / cidade">
                <Input value={draft.address} onChange={(event) => set('address', event.target.value)} placeholder="Rua, número, cidade" />
              </Field>
              <Field label="Nota do cabeçalho" hint="linha de apoio" className="sm:col-span-2">
                <Input value={draft.headerNote} onChange={(event) => set('headerNote', event.target.value)} placeholder="Laboratório de Matemática · aprender fazendo" />
              </Field>
              <Field label="Rodapé dos documentos" className="sm:col-span-2">
                <Textarea
                  className="!min-h-[4rem] !text-[0.8rem]"
                  value={draft.footer}
                  onChange={(event) => set('footer', event.target.value)}
                  placeholder="Mensagem, endereço, contatos ou slogan"
                />
              </Field>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionTitle
              title="Logotipo"
              description="Imagem quadrada ou horizontal, com fundo transparente ou branco."
              action={draft.logo ? <Badge tone="green"><Check size={11} /> Logo ativo</Badge> : undefined}
            />
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-24 h-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50 grid place-items-center shrink-0 overflow-hidden">
                {draft.logo ? (
                  <img src={draft.logo} alt="Prévia do logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center">
                    <ImagePlus size={24} className="text-slate-300 mx-auto" />
                    <span className="text-[0.55rem] text-slate-400 block mt-1">Sem logo</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.72rem] text-slate-500 leading-relaxed">
                  O logo aparece na prévia dos documentos e nos PDFs exportados. Formatos aceitos: PNG, JPG e WEBP, até 2 MB.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} icon={<Upload size={13} />} disabled={uploading}>
                    {uploading ? 'Carregando…' : 'Escolher imagem'}
                  </Button>
                  {draft.logo && (
                    <Button size="sm" variant="ghost" onClick={() => set('logo', '')} icon={<Trash2 size={13} />}>Remover</Button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      void uploadLogo(event.target.files?.[0])
                      event.target.value = ''
                    }}
                  />
                </div>
                <div className="mt-3 rounded-lg bg-blue-50/60 border border-blue-100 p-2.5 flex gap-2">
                  <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[0.6rem] text-blue-800/80 leading-relaxed">
                    A imagem fica salva localmente no seu navegador. Nada é enviado para servidores externos.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionTitle title="Cores institucionais" description="Usadas no cabeçalho, nos destaques e nos arquivos PDF." />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Field label="Cor principal">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={draft.primary}
                      onChange={(event) => set('primary', event.target.value)}
                      className="w-11 h-10 rounded-lg border border-slate-200 bg-white p-1 cursor-pointer shrink-0"
                      aria-label="Cor principal"
                    />
                    <Input value={draft.primary} onChange={(event) => set('primary', event.target.value)} className="font-mono !text-[0.78rem]" />
                  </div>
                </Field>
              </div>
              <div>
                <Field label="Cor de destaque">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={draft.accent}
                      onChange={(event) => set('accent', event.target.value)}
                      className="w-11 h-10 rounded-lg border border-slate-200 bg-white p-1 cursor-pointer shrink-0"
                      aria-label="Cor de destaque"
                    />
                    <Input value={draft.accent} onChange={(event) => set('accent', event.target.value)} className="font-mono !text-[0.78rem]" />
                  </div>
                </Field>
              </div>
            </div>

            <div className="mt-4">
              <div className="field-label">Paletas prontas</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {palettes.map((palette) => {
                  const active = draft.primary.toLowerCase() === palette.primary.toLowerCase() && draft.accent.toLowerCase() === palette.accent.toLowerCase()
                  return (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => setDraft({ ...draft, primary: palette.primary, accent: palette.accent })}
                      className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-colors ${active ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <span className="flex rounded-md overflow-hidden shrink-0">
                        <span className="w-5 h-7" style={{ background: palette.primary }} />
                        <span className="w-5 h-7" style={{ background: palette.accent }} />
                      </span>
                      <span className="text-[0.66rem] font-bold text-slate-600">{palette.name}</span>
                      {active && <Check size={13} className="text-indigo-500 ml-auto" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-[80px] space-y-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[0.78rem] font-bold">Prévia do documento</div>
                <div className="text-[0.59rem] text-slate-400">Atualiza em tempo real</div>
              </div>
              {changed ? <Badge tone="orange">Não salvo</Badge> : <Badge tone="green"><Check size={10} /> Salvo</Badge>}
            </div>

            <div className="p-4 bg-slate-50/60">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-1.5" style={{ background: draft.accent }} />
                <div className="p-4">
                  <div className="flex items-center gap-3 pb-3" style={{ borderBottom: `2px solid ${draft.primary}` }}>
                    <SchoolMark identity={draft} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.8rem] font-extrabold text-slate-800 leading-tight truncate">{draft.name || 'Nome da escola'}</div>
                      <div className="text-[0.58rem] text-slate-500 truncate">{draft.headerNote || 'Nota do cabeçalho'}</div>
                      <div className="text-[0.55rem] text-slate-400 truncate">{draft.teacher || 'Professor(a)'} · Matemática</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-[0.48rem] font-extrabold uppercase tracking-[0.13em]" style={{ color: draft.accent }}>Avaliação de Matemática</div>
                    <div className="text-[0.86rem] font-bold text-slate-800 mt-0.5">Frações na prática</div>
                    <div className="text-[0.55rem] text-slate-500">7º ano · Ensino Fundamental II · 10,0 pontos</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[
                      ['Aluno(a)', '________________________'],
                      ['Turma', '________'],
                      ['Data', '____ / ____ / ______'],
                      ['Nota', '________'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[0.44rem] font-extrabold uppercase tracking-wide text-slate-400">{label}</div>
                        <div className="text-[0.55rem] text-slate-600 border-b border-slate-200 pb-1 truncate">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex gap-1.5">
                        <span className="w-4 h-4 rounded-full grid place-items-center text-[0.44rem] font-extrabold text-white shrink-0" style={{ background: draft.primary }}>{item}</span>
                        <div className="flex-1 space-y-1 pt-0.5">
                          <div className="h-1.5 rounded bg-slate-200" style={{ width: `${85 - item * 8}%` }} />
                          <div className="h-1.5 rounded bg-slate-100" style={{ width: `${62 - item * 4}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 text-[0.42rem] text-slate-400 truncate">
                    {draft.footer || 'Rodapé dos documentos'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100">
              <div className="text-[0.62rem] font-extrabold uppercase tracking-wide text-slate-400 mb-2">Onde a identidade aparece</div>
              <div className="grid grid-cols-2 gap-1.5">
                {['Planos de aula', 'Aulas e slides', 'Listas e provas', 'Apostilas', 'Atividades', 'Arquivos PDF'].map((label) => (
                  <div key={label} className="flex items-center gap-1.5 text-[0.62rem] text-slate-600">
                    <Check size={11} className="text-emerald-500 shrink-0" /> {label}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={15} className="text-emerald-500" />
              <div className="text-[0.72rem] font-bold">Privacidade por padrão</div>
            </div>
            <p className="text-[0.62rem] text-slate-500 leading-relaxed">
              Nome da escola, professor, logo e cores ficam armazenados apenas no seu navegador (localStorage). Nenhuma informação é enviada para a internet.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[0.58rem] text-slate-400">
              <Building2 size={12} /> Sem cadastro · sem servidor · sem rastreamento
            </div>
          </Card>

          <Button className="w-full" size="lg" onClick={save} disabled={!changed} icon={<Save size={16} />}>Salvar alterações</Button>
          <p className="text-[0.57rem] text-slate-400 text-center">A prévia usa exatamente as mesmas cores do PDF exportado.</p>
        </div>
      </div>
    </div>
  )
}
