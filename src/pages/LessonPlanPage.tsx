import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BookOpenCheck,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  ImagePlus,
  Pencil,
  Printer,
  Save,
  Search,
  Share2,
  Sparkles,
  Users,
  Wand2,
} from 'lucide-react'
import { useApp } from '../lib/store'
import type { Difficulty, Material, PlanConfig, PlanContent, Stage } from '../lib/types'
import { DIFFICULTY_LABEL, STAGE_LABEL, YEAR_LABEL } from '../lib/types'
import { getSkill, skillsFor, suggestSkills } from '../data/bncc'
import { topicsFor, getTopic } from '../data/topics'
import { generatePlan } from '../lib/plans'
import { exportPlanPdf } from '../lib/pdf'
import { formatDate, readFileAsDataUrl, stageYearText, truncate } from '../lib/utils'
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Select, Textarea } from '../components/ui'
import { DocumentPaper, PrintActions, SchoolHeader } from '../components/Document'

const methodologyOptions = [
  { value: 'sequencia-didatica', label: 'Sequência didática com problemas' },
  { value: 'abp', label: 'Aprendizagem baseada em problemas (ABP)' },
  { value: 'sala-invertida', label: 'Sala de aula invertida' },
  { value: 'investigacao', label: 'Investigação matemática' },
  { value: 'gamificacao', label: 'Gamificação e desafios' },
  { value: 'peer-instruction', label: 'Instrução por pares' },
]

const stageYears: Record<Stage, number[]> = {
  EF1: [1, 2, 3, 4, 5],
  EF2: [6, 7, 8, 9],
  EM: [0],
}

function PlanPreview({ plan }: { plan: PlanContent }) {
  return (
    <>
      <div className="mb-4">
        <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-indigo-500">Plano de aula</div>
        <h1 className="text-[1.25rem] leading-tight font-bold mt-1">{plan.theme}</h1>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge tone="blue">BNCC conectada</Badge>
          <Badge tone="violet">{plan.skills.length} habilidade(s)</Badge>
          <Badge tone="green">Inclusão</Badge>
        </div>
      </div>

      <div className="doc-section">
        <h3>Justificativa pedagógica</h3>
        <p>{plan.justification}</p>
      </div>

      <div className="doc-section">
        <h3>Objetivo geral</h3>
        <p className="font-semibold">{plan.generalObjective}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-0">
        <div className="doc-section">
          <h3>Objetivos específicos</h3>
          <ul>{plan.specificObjectives.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="doc-section">
          <h3>Habilidades da BNCC</h3>
          {plan.skills.length ? (
            <div className="space-y-2">
              {plan.skills.map((skill) => (
                <div key={skill.code} className="text-[0.72rem] leading-relaxed">
                  <span className="font-bold text-indigo-700">{skill.code}</span>{' '}
                  <span className="text-slate-600">{skill.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>Habilidades definidas no currículo local.</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6">
        <div className="doc-section">
          <h3>Objetos de conhecimento</h3>
          <ul>{plan.knowledgeObjects.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="doc-section">
          <h3>Competências desenvolvidas</h3>
          <ul>{plan.competencies.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>

      <div className="doc-section">
        <h3>Conteúdos abordados</h3>
        <ul>{plan.contents.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>

      <div className="doc-section">
        <h3>Metodologia</h3>
        <p>{plan.methodology}</p>
      </div>

      <div className="doc-section">
        <h3>Desenvolvimento da aula</h3>
        <div className="space-y-2.5 mt-1">
          {plan.development.map((step) => (
            <div key={step.stage} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 print-avoid-break">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.73rem] font-bold text-slate-700">{step.stage}</span>
                <span className="chip !py-0.5 !px-1.5 !text-[0.56rem]">{step.duration}</span>
              </div>
              <p className="text-[0.72rem] text-slate-600 leading-relaxed mt-1">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6">
        <div className="doc-section">
          <h3>Recursos didáticos</h3>
          <ul>{plan.resources.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="doc-section">
          <h3>Avaliação</h3>
          <ul>{plan.assessment.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="doc-section">
          <h3>Atividades práticas</h3>
          <ul>{plan.practical.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="doc-section">
          <h3>Atividades de fixação</h3>
          <ul>{plan.fixation.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="doc-section">
          <h3>Tarefa de casa</h3>
          <ul>{plan.homework.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="doc-section">
          <h3>Adaptações e inclusão</h3>
          <ul>{[...plan.adaptations, ...plan.inclusive].map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>

      <div className="doc-section">
        <h3>Referências</h3>
        <ul>{plan.references.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </>
  )
}

const editableLists: { key: keyof PlanContent; label: string }[] = [
  { key: 'specificObjectives', label: 'Objetivos específicos (um por linha)' },
  { key: 'knowledgeObjects', label: 'Objetos de conhecimento (um por linha)' },
  { key: 'competencies', label: 'Competências (uma por linha)' },
  { key: 'contents', label: 'Conteúdos (um por linha)' },
  { key: 'resources', label: 'Recursos (um por linha)' },
  { key: 'assessment', label: 'Avaliação (uma por linha)' },
  { key: 'practical', label: 'Atividades práticas (uma por linha)' },
  { key: 'fixation', label: 'Atividades de fixação (uma por linha)' },
  { key: 'homework', label: 'Tarefa de casa (uma por linha)' },
  { key: 'adaptations', label: 'Adaptações (uma por linha)' },
  { key: 'inclusive', label: 'Inclusão (uma por linha)' },
  { key: 'references', label: 'Referências (uma por linha)' },
]

function PlanEditor({
  open,
  onClose,
  plan,
  title,
  onSave,
}: {
  open: boolean
  onClose: () => void
  plan: PlanContent
  title: string
  onSave: (plan: PlanContent, title: string) => void
}) {
  const [draft, setDraft] = useState<PlanContent>(plan)
  const [draftTitle, setDraftTitle] = useState(title)

  useEffect(() => {
    if (open) {
      setDraft(plan)
      setDraftTitle(title)
    }
  }, [open, plan, title])

  const arrayFields = editableLists.filter((field) => Array.isArray(draft[field.key]))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar plano de aula"
      description="Ajuste o texto para a realidade da sua turma. As alterações ficam salvas neste material."
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button icon={<Check size={15} />} onClick={() => { onSave(draft, draftTitle); onClose() }}>Aplicar alterações</Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <Field label="Título do material">
          <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
        </Field>
        <Field label="Tema da aula">
          <Input value={draft.theme} onChange={(event) => setDraft({ ...draft, theme: event.target.value })} />
        </Field>
        <Field label="Justificativa pedagógica">
          <Textarea value={draft.justification} onChange={(event) => setDraft({ ...draft, justification: event.target.value })} />
        </Field>
        <Field label="Objetivo geral">
          <Textarea value={draft.generalObjective} onChange={(event) => setDraft({ ...draft, generalObjective: event.target.value })} />
        </Field>
        <Field label="Metodologia">
          <Textarea value={draft.methodology} onChange={(event) => setDraft({ ...draft, methodology: event.target.value })} />
        </Field>
        {arrayFields.map((field) => (
          <Field key={field.key} label={field.label}>
            <Textarea
              value={(draft[field.key] as string[]).join('\n')}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  [field.key]: event.target.value.split('\n').filter((line) => line.trim()),
                })
              }
            />
          </Field>
        ))}
        <div>
          <div className="field-label">Desenvolvimento da aula</div>
          <div className="space-y-2">
            {draft.development.map((step, index) => (
              <div key={`${step.stage}-${index}`} className="rounded-lg border border-slate-200 p-2.5">
                <div className="text-[0.72rem] font-bold mb-1">{step.stage} · {step.duration}</div>
                <Textarea
                  className="!min-h-20 !text-[0.78rem]"
                  value={step.description}
                  onChange={(event) => {
                    const development = [...draft.development]
                    development[index] = { ...step, description: event.target.value }
                    setDraft({ ...draft, development })
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function LessonPlanPage() {
  const { school, updateSchoolLogo, addMaterial, updateMaterial, materials, toast, settings, currentUser } = useApp()
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<Stage>(settings.defaultStage)
  const [year, setYear] = useState(settings.defaultYear)
  const [topicId, setTopicId] = useState('fracoes')
  const [duration, setDuration] = useState(50)
  const [difficulty, setDifficulty] = useState<Difficulty>('medio')
  const [students, setStudents] = useState(32)
  const [methodology, setMethodology] = useState('sequencia-didatica')
  const [objective, setObjective] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['EF07MA05', 'EF07MA06'])
  const [skillSearch, setSkillSearch] = useState('')
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [plan, setPlan] = useState<PlanContent | null>(null)
  const [materialTitle, setMaterialTitle] = useState('Frações na prática: do plano à aula')
  const [editing, setEditing] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [shareWithAll, setShareWithAll] = useState(true)

  const topic = getTopic(topicId)
  const topicOptions = useMemo(() => topicsFor(stage, year), [stage, year])
  const skills = useMemo(() => skillsFor(stage, year), [stage, year])
  const suggestions = useMemo(() => suggestSkills(stage, year, topicId), [stage, year, topicId])
  const filteredSkills = useMemo(() => {
    const query = skillSearch.trim().toLowerCase()
    const list = query
      ? skills.filter((skill) => skill.code.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query) || skill.object.toLowerCase().includes(query))
      : skills
    return showAllSkills || query ? list : list.slice(0, 8)
  }, [skills, skillSearch, showAllSkills])

  useEffect(() => {
    if (!topicOptions.some((item) => item.id === topicId)) {
      setTopicId(topicOptions[0]?.id ?? 'fracoes')
    }
  }, [topicOptions, topicId])

  useEffect(() => {
    const suggested = suggestions.map((skill) => skill.code)
    if (suggested.length) setSelectedSkills(suggested.slice(0, 3))
  }, [stage, year, topicId])

  useEffect(() => {
    if (year === 0 && stage !== 'EM') setStage('EM')
    if (year > 0 && year <= 5 && stage !== 'EF1') setStage('EF1')
    if (year > 5 && stage !== 'EF2') setStage('EF2')
  }, [year, stage])

  useEffect(() => {
    const id = searchParams.get('material')
    if (!id) return
    const material = materials.find((item) => item.id === id && item.type === 'plano')
    if (!material) return
    setPlan(material.content as PlanContent)
    setMaterialTitle(material.title)
    setSavedId(material.id)
    setStage(material.stage)
    setYear(material.year)
    setTopicId(material.topic)
    setSelectedSkills(material.skillCodes)
    setGeneratedAt(material.updatedAt)
    if (material.shared !== undefined) setShareWithAll(material.shared)
  }, [searchParams, materials])

  const generate = () => {
    const config: PlanConfig = {
      stage,
      year,
      topic: topicId,
      skillCodes: selectedSkills,
      duration,
      difficulty,
      students,
      methodology,
      objective,
    }
    const next = generatePlan(config)
    setPlan(next)
    setMaterialTitle(next.theme)
    setGeneratedAt(new Date().toISOString())
    setSavedId(null)
    toast({ title: 'Plano gerado', description: 'Revise o conteúdo, edite se necessário e salve na biblioteca.', tone: 'success' })
  }

  const save = () => {
    if (!plan) return
    const payload = {
      type: 'plano' as const,
      title: materialTitle || plan.theme,
      description: `${stageYearText(stage, year)} · ${plan.skills.map((skill) => skill.code).join(', ') || 'Plano de aula'} · ${duration} min`,
      stage,
      year,
      topic: topicId,
      skillCodes: plan.skills.map((skill) => skill.code),
      shared: shareWithAll,
      authorName: currentUser?.name || school.teacher || 'Professor(a)',
      authorEmail: currentUser?.email,
      schoolLogo: school.logo,
      content: plan,
    }
    if (savedId) {
      updateMaterial(savedId, payload)
      toast({
        title: shareWithAll ? 'Plano salvo e compartilhado com todos!' : 'Plano atualizado',
        description: shareWithAll ? 'Disponível para todos os professores na Biblioteca da escola.' : 'As alterações foram salvas na biblioteca.',
        tone: 'success',
      })
    } else {
      const material = addMaterial(payload)
      setSavedId(material.id)
      toast({
        title: shareWithAll ? 'Plano salvo para todos os professores!' : 'Plano salvo com sucesso',
        description: shareWithAll ? 'O plano agora está visível e compartilhado para toda a equipe escolar.' : 'Você pode encontrá-lo na Biblioteca.',
        tone: 'success',
      })
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Formato inválido', description: 'Envie uma imagem PNG, JPG ou WEBP.', tone: 'error' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Imagem grande', description: 'Envie uma imagem até 2MB.', tone: 'error' })
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      updateSchoolLogo(dataUrl)
      toast({ title: 'Logo da escola atualizado!', description: 'Aplicado imediatamente no cabeçalho e nos documentos.', tone: 'success' })
    } catch {
      toast({ title: 'Erro ao carregar logo', tone: 'error' })
    }
  }

  const download = () => {
    if (!plan) return
    exportPlanPdf(plan, school, { title: materialTitle || plan.theme })
    toast({ title: 'PDF gerado', description: 'O plano de aula foi exportado com a identidade da escola.', tone: 'success' })
  }

  const toggleSkill = (code: string) => {
    setSelectedSkills((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Planejamento pedagógico"
        title="Gerador de planos de aula"
        description="Escolha a etapa, o conteúdo e as habilidades da BNCC. A plataforma monta um plano completo, editável e pronto para salvar ou imprimir."
        icon={<ClipboardList size={21} />}
        actions={
          plan ? (
            <>
              <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => setEditing(true)}>Editar</Button>
              <Button variant="secondary" size="sm" icon={<Save size={14} />} onClick={save}>Salvar</Button>
              <Button size="sm" icon={<Download size={14} />} onClick={download}>Baixar PDF</Button>
            </>
          ) : undefined
        }
      />

      <div className="grid xl:grid-cols-[370px_1fr] gap-5 items-start">
        <Card className="p-4 sm:p-5 xl:sticky xl:top-[80px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center"><Wand2 size={16} /></div>
            <div>
              <div className="text-[0.8rem] font-bold">Configurar plano</div>
              <div className="text-[0.62rem] text-slate-400">Conteúdo determinístico e alinhado à BNCC</div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Seção da Logo da Escola & Compartilhamento */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="text-[0.68rem] font-bold text-slate-700 flex items-center justify-between">
                <span>Personalização & Compartilhamento</span>
                {currentUser && <span className="text-[0.6rem] text-indigo-600 font-semibold">{currentUser.name}</span>}
              </div>

              {/* Upload da Logo */}
              <div className="flex items-center gap-3">
                {school.logo ? (
                  <img
                    src={school.logo}
                    alt="Logo da escola"
                    className="w-11 h-11 object-contain rounded-lg border border-slate-200 bg-white p-1 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <ImagePlus size={16} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-700 shadow-sm transition-colors">
                    <ImagePlus size={13} className="text-indigo-600" />
                    <span>{school.logo ? 'Trocar Logo' : 'Adicionar Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="text-[0.58rem] text-slate-400 mt-1 truncate">
                    Aparece no cabeçalho do plano e no PDF
                  </div>
                </div>
              </div>

              {/* Checkbox salvar para todos */}
              <label className="flex items-start gap-2 pt-1 border-t border-slate-200/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shareWithAll}
                  onChange={(e) => setShareWithAll(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="text-[0.68rem] text-slate-700 leading-tight">
                  <strong className="font-semibold block text-slate-800">Salvar plano para todos</strong>
                  Deixar este plano público e visível para todos os professores na Biblioteca.
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Etapa de ensino">
                <Select value={stage} onChange={(event) => {
                  const next = event.target.value as Stage
                  setStage(next)
                  setYear(stageYears[next][0])
                }}>
                  <option value="EF1">Fundamental I</option>
                  <option value="EF2">Fundamental II</option>
                  <option value="EM">Ensino Médio</option>
                </Select>
              </Field>
              <Field label="Ano escolar">
                <Select value={year} onChange={(event) => setYear(Number(event.target.value))}>
                  {stageYears[stage].map((value) => <option key={value} value={value}>{YEAR_LABEL[value]}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Conteúdo / unidade temática" hint={topic.unit}>
              <Select value={topicId} onChange={(event) => setTopicId(event.target.value)}>
                {topicOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Duração">
                <Select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                  <option value={45}>45 minutos</option>
                  <option value={50}>50 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                  <option value={100}>100 minutos</option>
                </Select>
              </Field>
              <Field label="Dificuldade">
                <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
                  {Object.entries(DIFFICULTY_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Qtd. de alunos">
                <Input type="number" min={1} max={60} value={students} onChange={(event) => setStudents(Number(event.target.value))} />
              </Field>
              <Field label="Metodologia">
                <Select value={methodology} onChange={(event) => setMethodology(event.target.value)}>
                  {methodologyOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Objetivo personalizado" hint="opcional">
              <Textarea
                className="!min-h-[4.5rem] !text-[0.78rem]"
                placeholder="Ex.: compreender frações equivalentes usando materiais manipuláveis…"
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
              />
            </Field>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50/70">
                <div>
                  <div className="text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-500">Habilidades BNCC</div>
                  <div className="text-[0.58rem] text-slate-400 mt-0.5">Sugestões para {topic.shortName}</div>
                </div>
                <Badge tone="blue">{selectedSkills.length} selecionada(s)</Badge>
              </div>
              <div className="p-2.5">
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="!pl-8 !py-1.5 !text-[0.72rem]" placeholder="Buscar por código ou texto…" value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} />
                </div>
                <div className="space-y-1.5 max-h-[15rem] overflow-y-auto pr-1">
                  {filteredSkills.map((skill) => {
                    const active = selectedSkills.includes(skill.code)
                    return (
                      <button
                        key={skill.code}
                        type="button"
                        onClick={() => toggleSkill(skill.code)}
                        className={`w-full text-left rounded-lg border p-2 transition-colors ${active ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`mt-0.5 w-4 h-4 rounded border grid place-items-center shrink-0 ${active ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white'}`}>
                            {active && <Check size={11} />}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[0.64rem] font-extrabold text-indigo-700">{skill.code}</div>
                            <div className="text-[0.61rem] leading-snug text-slate-500 mt-0.5">{truncate(skill.description, 130)}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {skills.length > 8 && !skillSearch && (
                  <button onClick={() => setShowAllSkills((value) => !value)} className="mt-2 w-full text-[0.62rem] font-bold text-indigo-600 flex items-center justify-center gap-1 py-1">
                    {showAllSkills ? 'Mostrar menos' : `Ver todas as ${skills.length} habilidades`} <ChevronDown size={12} className={showAllSkills ? 'rotate-180' : ''} />
                  </button>
                )}
                {suggestions.length > 0 && (
                  <button onClick={() => setSelectedSkills(suggestions.map((skill) => skill.code))} className="mt-1 w-full text-[0.6rem] text-slate-400 hover:text-indigo-600 py-1">
                    Usar sugestões da plataforma ({suggestions.length})
                  </button>
                )}
              </div>
            </div>

            <Button size="lg" className="w-full" icon={<Sparkles size={16} />} onClick={generate}>
              Gerar plano completo
            </Button>
            <p className="text-[0.57rem] text-slate-400 text-center leading-relaxed">
              Os códigos e textos da BNCC vêm de base oficial. Você pode revisar tudo antes de usar.
            </p>
          </div>
        </Card>

        <div className="min-w-0">
          {plan ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 no-print">
                <div className="flex items-center gap-2 text-[0.68rem] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {savedId ? 'Material salvo na biblioteca' : 'Prévia editável'}
                  {generatedAt && <span className="text-slate-300">·</span>}
                  {generatedAt && <span>{formatDate(generatedAt, true)}</span>}
                </div>
                <div className="flex gap-1.5">
                  <Button variant="secondary" size="sm" icon={<Printer size={13} />} onClick={() => window.print()}>Imprimir</Button>
                  <Button variant="secondary" size="sm" icon={<Save size={13} />} onClick={save}>Salvar na biblioteca</Button>
                  <Button size="sm" icon={<Download size={13} />} onClick={download}>PDF</Button>
                </div>
              </div>
              <DocumentPaper>
                <PlanPreview plan={plan} />
              </DocumentPaper>
            </>
          ) : (
            <Card className="min-h-[520px] grid place-items-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(#4666ff 1px, transparent 1px), linear-gradient(90deg, #4666ff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              <div className="relative text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center mx-auto shadow-lg shadow-indigo-200">
                  <FileText size={27} />
                </div>
                <h2 className="text-lg font-bold mt-4">Seu plano aparece aqui</h2>
                <p className="text-sm text-slate-500 leading-relaxed mt-2">
                  Configure a turma e o conteúdo ao lado. A plataforma organiza justificativa, objetivos, BNCC, desenvolvimento, avaliação e adaptações inclusivas.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-5 text-left">
                  {[
                    { icon: BookOpenCheck, label: 'BNCC oficial' },
                    { icon: Users, label: 'Inclusão' },
                    { icon: GraduationCap, label: 'Pronto para usar' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-2.5 text-center">
                        <Icon size={16} className="text-indigo-500 mx-auto" />
                        <div className="text-[0.6rem] font-bold text-slate-500 mt-1.5">{item.label}</div>
                      </div>
                    )
                  })}
                </div>
                <Button className="mt-5" icon={<Wand2 size={15} />} onClick={generate}>Gerar plano de exemplo</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {plan && (
        <PlanEditor
          open={editing}
          onClose={() => setEditing(false)}
          plan={plan}
          title={materialTitle}
          onSave={(next, nextTitle) => {
            setPlan(next)
            setMaterialTitle(nextTitle)
            toast({ title: 'Plano atualizado', description: 'As edições estão na prévia. Salve na biblioteca para guardar.', tone: 'success' })
          }}
        />
      )}
    </div>
  )
}
