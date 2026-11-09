import { useState } from 'react'
import { LogIn, UserPlus, LogOut, Users, School, Check, User, Mail } from 'lucide-react'
import { useApp } from '../lib/store'
import { Button, Input, Field, Modal, Badge } from './ui'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { currentUser, teachers, loginTeacher, registerTeacher, logoutTeacher, setCurrentTeacher, school } = useApp()
  const [mode, setMode] = useState<'login' | 'register' | 'switch'>('login')
  
  // Form inputs
  const [emailOrName, setEmailOrName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [schoolName, setSchoolName] = useState(school.name || '')
  const [role, setRole] = useState('Professor(a) de Matemática')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailOrName.trim()) return
    loginTeacher(emailOrName.trim())
    setEmailOrName('')
    onClose()
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    registerTeacher({
      name: name.trim(),
      email: email.trim(),
      schoolName: schoolName.trim() || undefined,
      role: role.trim() || 'Professor(a)',
    })
    setName('')
    setEmail('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === 'register'
          ? 'Cadastrar Novo Professor'
          : mode === 'switch'
          ? 'Trocar de Professor'
          : 'Entrar como Professor'
      }
      description="Acesse seus planos de aula e compartilhe materiais com toda a escola"
    >
      <div className="space-y-4 pt-1">
        {currentUser && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold grid place-items-center text-sm shadow-sm">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{currentUser.email}</div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<LogOut size={14} />}
              onClick={() => {
                logoutTeacher()
                setMode('login')
              }}
            >
              Sair
            </Button>
          </div>
        )}

        <div className="flex border-b border-slate-200 gap-2 pb-2">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === 'login' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Entrar / Identificar
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === 'register' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Novo Cadastro
          </button>
          {teachers.length > 1 && (
            <button
              type="button"
              onClick={() => setMode('switch')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                mode === 'switch' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Professores ({teachers.length})
            </button>
          )}
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <Field label="Nome ou E-mail do Professor" hint="Digite seu nome ou e-mail cadastrado">
              <Input
                placeholder="Ex.: Prof. Carlos ou carlos@escola.gov.br"
                value={emailOrName}
                onChange={(e) => setEmailOrName(e.target.value)}
                autoFocus
                required
              />
            </Field>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" icon={<LogIn size={15} />}>
                Entrar
              </Button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <Field label="Nome Completo do(a) Professor(a)">
              <Input
                placeholder="Ex.: Prof. Marcos Oliveira"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field label="E-mail Institucional ou Pessoal">
              <Input
                type="email"
                placeholder="Ex.: marcos@escola.gov.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Escola / Instituição">
              <Input
                placeholder="Ex.: Colégio Municipal São Paulo"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </Field>

            <Field label="Cargo / Disciplina">
              <Input
                placeholder="Ex.: Professor de Matemática - EF2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </Field>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" icon={<UserPlus size={15} />}>
                Cadastrar e Entrar
              </Button>
            </div>
          </form>
        )}

        {mode === 'switch' && (
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            <p className="text-xs text-slate-500">Selecione o perfil de professor cadastrado:</p>
            {teachers.map((t) => {
              const isCurrent = currentUser?.id === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setCurrentTeacher(t)
                    onClose()
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold grid place-items-center text-xs">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{t.name}</div>
                      <div className="text-[0.65rem] text-slate-500">{t.email} {t.schoolName ? `· ${t.schoolName}` : ''}</div>
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge tone="blue">Ativo</Badge>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
