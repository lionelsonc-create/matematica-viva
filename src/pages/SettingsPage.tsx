import { useMemo, useRef, useState } from 'react'
import {
  Accessibility,
  AlertTriangle,
  Archive,
  Check,
  Contrast,
  Database,
  Download,
  Eye,
  FileJson,
  Gauge,
  HardDrive,
  Info,
  MonitorSmartphone,
  RefreshCcw,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
  Upload,
  Volume2,
  Zap,
  Sun,
  Moon,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type { AppSettings, Stage } from '../lib/types'
import { STAGE_LABEL, YEAR_LABEL } from '../lib/types'
import { formatDate } from '../lib/utils'
import { Badge, Button, Card, Field, Modal, PageHeader, SectionTitle, Select } from '../components/ui'

const stageYears: Record<Stage, number[]> = { EF1: [1, 2, 3, 4, 5], EF2: [6, 7, 8, 9], EM: [0] }

function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-2.5 min-w-0">
        {icon && <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 grid place-items-center shrink-0">{icon}</div>}
        <div>
          <div className="text-[0.74rem] font-bold text-slate-700">{label}</div>
          <p className="text-[0.61rem] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`w-10 h-[1.4rem] rounded-full p-0.5 transition-colors shrink-0 ${checked ? 'bg-indigo-500' : 'bg-slate-300'}`}
      >
        <span className={`block w-[1.15rem] h-[1.15rem] rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-[1.1rem]' : ''}`} />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const {
    settings,
    updateSettings,
    resetSettings,
    materials,
    school,
    exportBackup,
    importBackup,
    clearMaterials,
    restoreDemo,
    toast,
  } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [clearOpen, setClearOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [importing, setImporting] = useState(false)

  const storage = useMemo(() => {
    try {
      const raw = localStorage.getItem('matematica-interativa.materials.v1') ?? ''
      return raw.length
    } catch {
      return 0
    }
  }, [materials])

  const lastUpdate = materials.length
    ? materials.reduce((latest, material) => (new Date(material.updatedAt) > new Date(latest) ? material.updatedAt : latest), materials[0].updatedAt)
    : null

  const setSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    updateSettings({ [key]: value } as Partial<AppSettings>)
  }

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const ok = importBackup(text)
      if (ok) setRestoreOpen(false)
    } catch {
      toast({ title: 'Não foi possível ler o arquivo', description: 'Selecione um backup JSON exportado pela plataforma.', tone: 'error' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Do seu jeito"
        title="Configurações"
        description="Ajuste acessibilidade, preferências de geração, backup dos dados e conheça as práticas de privacidade da plataforma."
        icon={<Settings size={21} />}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setResetOpen(true)} icon={<RotateCcw size={14} />}>Restaurar preferências</Button>
        }
      />

      <div className="grid xl:grid-cols-[1fr_400px] gap-5 items-start">
        <div className="space-y-5">
          <Card className="p-4 sm:p-5">
            <SectionTitle title="Acessibilidade e aparência" description="Deixe a plataforma confortável para você e para sua turma." />
            <div className="space-y-4">
              <div>
                <div className="field-label">Tema da Interface</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSetting('theme', 'light')}
                    className={`rounded-xl border p-3 flex items-center justify-center gap-2.5 transition-all ${
                      settings.theme !== 'dark'
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-700 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Sun size={17} className={settings.theme !== 'dark' ? 'text-indigo-600' : ''} />
                    <span className="text-xs">Tema Claro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetting('theme', 'dark')}
                    className={`rounded-xl border p-3 flex items-center justify-center gap-2.5 transition-all ${
                      settings.theme === 'dark'
                        ? 'border-indigo-500 bg-indigo-950/70 text-indigo-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Moon size={17} className={settings.theme === 'dark' ? 'text-indigo-400' : ''} />
                    <span className="text-xs">Tema Escuro</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="field-label">Tamanho da fonte</div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'normal', label: 'Normal', sample: 'Aa' },
                    { value: 'grande', label: 'Grande', sample: 'Aa' },
                    { value: 'maior', label: 'Maior', sample: 'Aa' },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSetting('fontSize', option.value)}
                      className={`rounded-xl border p-3 text-center transition-colors ${settings.fontSize === option.value ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div
                        className={`font-display font-bold ${option.value === 'normal' ? 'text-lg' : option.value === 'grande' ? 'text-xl' : 'text-2xl'} ${settings.fontSize === option.value ? 'text-indigo-600' : 'text-slate-500'}`}
                      >
                        {option.sample}
                      </div>
                      <div className="text-[0.63rem] font-bold text-slate-600 mt-1">{option.label}</div>
                      <div className="text-[0.52rem] text-slate-400">{option.value === 'normal' ? '16 px' : option.value === 'grande' ? '17 px' : '19 px'}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                <Toggle
                  checked={settings.highContrast}
                  onChange={(value) => setSetting('highContrast', value)}
                  label="Alto contraste"
                  description="Fortalece bordas e textos para leitura em telas com brilho intenso."
                  icon={<Contrast size={15} />}
                />
                <Toggle
                  checked={settings.reduceMotion}
                  onChange={(value) => setSetting('reduceMotion', value)}
                  label="Reduzir animações"
                  description="Desliga transições e movimentos decorativos da interface."
                  icon={<Zap size={15} />}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-wide text-slate-400 mb-2">
                  <Eye size={13} /> Prévia de leitura
                </div>
                <p className="text-[0.72rem] text-slate-600 leading-relaxed">
                  A Matemática está presente no cotidiano: nas compras, nas medidas, nos jogos e na organização do tempo. Resolver problemas desenvolve autonomia e raciocínio.
                </p>
                <div className="flex gap-1.5 mt-2">
                  <Badge tone="blue">BNCC</Badge>
                  <Badge tone="green">Acessível</Badge>
                  <Badge tone="violet">Português brasileiro</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionTitle title="Padrões de criação" description="Valores iniciais usados ao abrir os geradores." />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Etapa padrão">
                <Select
                  value={settings.defaultStage}
                  onChange={(event) => {
                    const next = event.target.value as Stage
                    updateSettings({ defaultStage: next, defaultYear: next === 'EM' ? 0 : next === 'EF1' ? 1 : 6 })
                  }}
                >
                  <option value="EF1">Ensino Fundamental I</option>
                  <option value="EF2">Ensino Fundamental II</option>
                  <option value="EM">Ensino Médio</option>
                </Select>
              </Field>
              <Field label="Ano padrão">
                <Select value={settings.defaultYear} onChange={(event) => setSetting('defaultYear', Number(event.target.value))}>
                  {stageYears[settings.defaultStage].map((year) => <option key={year} value={year}>{YEAR_LABEL[year]}</option>)}
                </Select>
              </Field>
            </div>
            <div className="mt-3 rounded-lg bg-indigo-50/50 border border-indigo-100 p-2.5 flex gap-2">
              <Info size={13} className="text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[0.61rem] text-indigo-900/70 leading-relaxed">
                Sempre é possível mudar a etapa e o ano dentro de cada ferramenta. O padrão serve apenas para economizar cliques.
              </p>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionTitle title="Preferências de conteúdo" description="Comportamentos aplicados aos geradores e jogos." />
            <div className="grid sm:grid-cols-2 gap-2.5">
              <Toggle
                checked={settings.includeAnswers}
                onChange={(value) => setSetting('includeAnswers', value)}
                label="Incluir gabarito por padrão"
                description="Provas, listas e apostilas já nascem com o gabarito do professor."
                icon={<Check size={15} />}
              />
              <Toggle
                checked={settings.sound}
                onChange={(value) => setSetting('sound', value)}
                label="Sons nos jogos"
                description="Efeitos sonoros de acerto, erro e vitória nas atividades gamificadas."
                icon={<Volume2 size={15} />}
              />
            </div>
            <div className="mt-3 grid sm:grid-cols-3 gap-2">
              {[
                { icon: Gauge, label: 'Dificuldade', value: 'Ajustável por material' },
                { icon: Sparkles, label: 'Variações', value: 'Números sempre diferentes' },
                { icon: Eye, label: 'Privacidade', value: 'Dados só no navegador' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                  <item.icon size={14} className="text-slate-400" />
                  <div className="text-[0.61rem] font-bold text-slate-600 mt-1">{item.label}</div>
                  <div className="text-[0.56rem] text-slate-400">{item.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionTitle title="Backup e dados" description="Seus materiais ficam no navegador. Faça backups para não perder nada." />
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-[0.62rem] font-extrabold uppercase tracking-wide text-slate-400">Materiais</div>
                <div className="text-xl font-bold mt-0.5">{materials.length}</div>
                <div className="text-[0.55rem] text-slate-400">salvos localmente</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-[0.62rem] font-extrabold uppercase tracking-wide text-slate-400">Armazenamento</div>
                <div className="text-xl font-bold mt-0.5">{(storage / 1024).toFixed(1)} KB</div>
                <div className="text-[0.55rem] text-slate-400">de dados da biblioteca</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-[0.62rem] font-extrabold uppercase tracking-wide text-slate-400">Última atualização</div>
                <div className="text-[0.78rem] font-bold mt-1">{lastUpdate ? formatDate(lastUpdate) : '—'}</div>
                <div className="text-[0.55rem] text-slate-400">no navegador atual</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5 mt-3">
              <button onClick={exportBackup} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-indigo-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center shrink-0"><Download size={15} /></div>
                <div>
                  <div className="text-[0.72rem] font-bold text-slate-700">Exportar backup</div>
                  <p className="text-[0.58rem] text-slate-400 mt-0.5">Baixe um JSON com materiais, identidade e preferências.</p>
                </div>
              </button>
              <button onClick={() => fileRef.current?.click()} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-indigo-300 transition-colors" disabled={importing}>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center shrink-0"><Upload size={15} /></div>
                <div>
                  <div className="text-[0.72rem] font-bold text-slate-700">{importing ? 'Importando…' : 'Importar backup'}</div>
                  <p className="text-[0.58rem] text-slate-400 mt-0.5">Restaure um arquivo JSON exportado pela plataforma.</p>
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  void handleImport(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setRestoreOpen(true)} icon={<RefreshCcw size={13} />}>Restaurar demonstração</Button>
              <Button variant="danger" size="sm" onClick={() => setClearOpen(true)} icon={<Trash2 size={13} />}>Limpar materiais</Button>
            </div>
            <p className="text-[0.57rem] text-slate-400 mt-2">
              A importação substitui os materiais atuais. Exporte um backup antes de importar outro arquivo.
            </p>
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-[80px]">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center"><ShieldCheck size={16} /></div>
              <div>
                <div className="text-[0.78rem] font-bold">Privacidade e LGPD</div>
                <div className="text-[0.58rem] text-slate-400">Transparência por padrão</div>
              </div>
            </div>
            <ul className="space-y-2">
              {[
                'Nenhum cadastro, login ou senha é necessário.',
                'Materiais e identidade ficam no armazenamento local do navegador.',
                'Não há envio de dados de alunos para servidores.',
                'Sem cookies de rastreamento, anúncios ou analytics de terceiros.',
                'Você pode exportar ou apagar todos os dados quando quiser.',
              ].map((item) => (
                <li key={item} className="flex gap-1.5 text-[0.62rem] text-slate-500 leading-relaxed">
                  <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-amber-50/70 border border-amber-100 p-2.5 flex gap-2">
              <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[0.57rem] text-amber-800/80 leading-relaxed">
                Como os dados ficam no navegador, limpar o histórico/cache ou trocar de dispositivo pode remover os materiais. Mantenha backups regulares.
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-[0.72rem] font-bold mb-2 flex items-center gap-1.5"><Accessibility size={14} className="text-indigo-500" /> Acessibilidade</div>
            <div className="space-y-1.5">
              {['Navegação por teclado', 'Contraste e foco visíveis', 'Fontes redimensionáveis', 'Textos alternativos nas figuras', 'Movimento reduzido opcional'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-[0.62rem] text-slate-500">
                  <Check size={11} className="text-emerald-500 shrink-0" /> {item}
                </div>
              ))}
            </div>
          </Card>

          <Card soft className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} className="text-orange-500" />
              <div className="text-[0.72rem] font-bold">Sobre a plataforma</div>
            </div>
            <div className="space-y-1.5 text-[0.6rem] text-slate-500">
              <div className="flex justify-between gap-2"><span>Produto</span><span className="font-bold text-slate-600">Matemática Interativa</span></div>
              <div className="flex justify-between gap-2"><span>Versão</span><span className="font-bold text-slate-600">1.0.0</span></div>
              <div className="flex justify-between gap-2"><span>Licença</span><span className="font-bold text-slate-600">MIT</span></div>
              <div className="flex justify-between gap-2"><span>Modelo</span><span className="font-bold text-slate-600">Gratuito e aberto</span></div>
              <div className="flex justify-between gap-2"><span>Dependência de nuvem</span><span className="font-bold text-slate-600">Nenhuma</span></div>
            </div>
            <div className="mt-2.5 rounded-lg bg-white border border-slate-100 p-2 text-[0.58rem] text-slate-500 leading-relaxed">
              “Matemática que ensina, interage e transforma!”<br />
              Feita para professores da Educação Básica brasileira.
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-[0.72rem] font-bold mb-2 flex items-center gap-1.5"><MonitorSmartphone size={14} className="text-sky-500" /> Dica de uso</div>
            <p className="text-[0.6rem] text-slate-500 leading-relaxed">
              Instale a plataforma como atalho na tela inicial do celular ou tablet para abrir em tela cheia. A interface se adapta a computadores, projetores e dispositivos móveis.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="blue"><Archive size={10} /> GitHub Pages</Badge>
              <Badge tone="green"><FileJson size={10} /> Backup JSON</Badge>
              <Badge tone="violet"><Database size={10} /> Local</Badge>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Limpar todos os materiais?"
        description="A biblioteca ficará vazia. A identidade da escola e as preferências serão mantidas."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setClearOpen(false)}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={() => { clearMaterials(); setClearOpen(false) }} icon={<Trash2 size={13} />}>Limpar materiais</Button>
          </>
        }
      >
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-[0.72rem] text-slate-600">
          Você tem <strong>{materials.length} material(is)</strong> salvo(s). Exporte um backup antes de continuar se quiser guardar uma cópia.
        </div>
        <Button className="mt-3" variant="secondary" size="sm" onClick={exportBackup} icon={<Download size={13} />}>Exportar backup agora</Button>
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Restaurar preferências?"
        description="Tamanho de fonte, contraste, padrões e sons voltarão à configuração inicial."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setResetOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={() => { resetSettings(); setResetOpen(false); toast({ title: 'Preferências restauradas', tone: 'success' }) }} icon={<RotateCcw size={13} />}>Restaurar</Button>
          </>
        }
      >
        <p className="text-[0.72rem] text-slate-600 leading-relaxed">Seus materiais e a identidade da escola não serão alterados.</p>
      </Modal>

      <Modal
        open={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        title="Restaurar materiais de demonstração?"
        description="Os exemplos serão adicionados à biblioteca atual."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRestoreOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={() => { restoreDemo(); setRestoreOpen(false) }} icon={<Sparkles size={13} />}>Restaurar demonstração</Button>
          </>
        }
      >
        <p className="text-[0.72rem] text-slate-600 leading-relaxed">
          São 4 materiais prontos: plano de frações, aula de geometria, lista de exercícios e atividade ilustrada. Eles ajudam a explorar a plataforma.
        </p>
      </Modal>
    </div>
  )
}
