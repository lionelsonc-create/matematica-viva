import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AppSettings, Material, SchoolIdentity, TeacherUser, ToastMessage } from './types'
import { DEFAULT_SCHOOL, createDemoMaterials } from './demo'
import { downloadText, uid } from './utils'

const KEYS = {
  materials: 'matematica-interativa.materials.v1',
  school: 'matematica-interativa.school.v1',
  settings: 'matematica-interativa.settings.v1',
  currentUser: 'matematica-interativa.currentUser.v1',
  teachers: 'matematica-interativa.teachers.v1',
}

const DEFAULT_TEACHER: TeacherUser = {
  id: 'teacher-default',
  name: 'Prof.ª Ana Martins',
  email: 'ana.martins@escola.gov.br',
  schoolName: 'Escola Municipal Saber Viver',
  role: 'Professor(a) de Matemática',
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  fontSize: 'normal',
  highContrast: false,
  reduceMotion: false,
  defaultStage: 'EF2',
  defaultYear: 7,
  sound: true,
  includeAnswers: true,
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function loadMaterials(): Material[] {
  try {
    const raw = localStorage.getItem(KEYS.materials)
    if (!raw) return createDemoMaterials()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Material[]) : createDemoMaterials()
  } catch {
    return createDemoMaterials()
  }
}

interface AppContextValue {
  materials: Material[]
  school: SchoolIdentity
  settings: AppSettings
  toasts: ToastMessage[]
  currentUser: TeacherUser | null
  teachers: TeacherUser[]
  loginTeacher: (emailOrName: string, passwordOrPin?: string) => boolean
  registerTeacher: (user: Omit<TeacherUser, 'id'>) => TeacherUser
  logoutTeacher: () => void
  setCurrentTeacher: (user: TeacherUser | null) => void
  addMaterial: (input: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Material
  updateMaterial: (id: string, updates: Partial<Material>) => void
  deleteMaterial: (id: string) => void
  duplicateMaterial: (id: string) => Material | null
  toggleFavorite: (id: string) => void
  toggleShared: (id: string) => void
  updateSchool: (school: SchoolIdentity) => void
  updateSchoolLogo: (logoDataUrl: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void
  toast: (message: Omit<ToastMessage, 'id'>) => void
  dismissToast: (id: string) => void
  exportBackup: () => void
  importBackup: (raw: string) => boolean
  clearMaterials: () => void
  restoreDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(loadMaterials)
  const [school, setSchool] = useState<SchoolIdentity>(() => loadJson(KEYS.school, DEFAULT_SCHOOL))
  const [teachers, setTeachers] = useState<TeacherUser[]>(() => {
    const loaded = loadJson<TeacherUser[]>(KEYS.teachers, [])
    if (!loaded.length) return [DEFAULT_TEACHER]
    return loaded
  })
  const [currentUser, setCurrentUser] = useState<TeacherUser | null>(() => {
    return loadJson<TeacherUser | null>(KEYS.currentUser, DEFAULT_TEACHER)
  })
  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...loadJson<Partial<AppSettings>>(KEYS.settings, {}),
  }))
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timers = useRef<Record<string, number>>({})

  useEffect(() => {
    localStorage.setItem(KEYS.teachers, JSON.stringify(teachers))
  }, [teachers])

  useEffect(() => {
    localStorage.setItem(KEYS.currentUser, JSON.stringify(currentUser))
    if (currentUser) {
      setSchool((prev) => ({
        ...prev,
        teacher: currentUser.name,
        ...(currentUser.schoolName ? { name: currentUser.schoolName } : {}),
      }))
    }
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem(KEYS.materials, JSON.stringify(materials))
  }, [materials])

  useEffect(() => {
    localStorage.setItem(KEYS.school, JSON.stringify(school))
  }, [school])

  useEffect(() => {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings))
    const root = document.documentElement
    root.dataset.fontSize = settings.fontSize
    root.classList.toggle('dark', settings.theme === 'dark')
    root.classList.toggle('high-contrast', settings.highContrast)
    root.classList.toggle('reduce-motion', settings.reduceMotion)
  }, [settings])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const toast = useCallback(
    (message: Omit<ToastMessage, 'id'>) => {
      const id = uid('toast')
      setToasts((current) => [...current.slice(-3), { ...message, id }])
      timers.current[id] = window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id))
        delete timers.current[id]
      }, 4200)
    },
    [],
  )

  const addMaterial = useCallback<AppContextValue['addMaterial']>(
    (input) => {
      const now = new Date().toISOString()
      const material: Material = {
        ...input,
        id: input.id ?? uid('mat'),
        createdAt: now,
        updatedAt: now,
      }
      setMaterials((current) => [material, ...current])
      return material
    },
    [],
  )

  const updateMaterial = useCallback((id: string, updates: Partial<Material>) => {
    setMaterials((current) =>
      current.map((material) =>
        material.id === id ? { ...material, ...updates, updatedAt: new Date().toISOString() } : material,
      ),
    )
  }, [])

  const deleteMaterial = useCallback((id: string) => {
    setMaterials((current) => current.filter((material) => material.id !== id))
  }, [])

  const duplicateMaterial = useCallback(
    (id: string): Material | null => {
      const original = materials.find((material) => material.id === id)
      if (!original) return null
      const now = new Date().toISOString()
      const copy: Material = {
        ...original,
        id: uid('mat'),
        title: `${original.title} (cópia)`,
        createdAt: now,
        updatedAt: now,
      }
      setMaterials((current) => [copy, ...current])
      return copy
    },
    [materials],
  )

  const loginTeacher = useCallback(
    (emailOrName: string) => {
      const trimmed = emailOrName.trim().toLowerCase()
      const found = teachers.find(
        (t) => t.email.toLowerCase() === trimmed || t.name.toLowerCase() === trimmed,
      )
      if (found) {
        setCurrentUser(found)
        toast({ title: `Bem-vindo(a), ${found.name}!`, tone: 'success' })
        return true
      }
      // Se não encontrou, cria ou avisa
      const newUser: TeacherUser = {
        id: uid('prof'),
        name: emailOrName.includes('@') ? emailOrName.split('@')[0] : emailOrName,
        email: emailOrName.includes('@') ? emailOrName : `${emailOrName.toLowerCase().replace(/\s+/g, '.')}@escola.br`,
        schoolName: school.name || 'Minha Escola',
        role: 'Professor(a)',
      }
      setTeachers((prev) => [...prev, newUser])
      setCurrentUser(newUser)
      toast({ title: `Professor cadastrado e conectado!`, description: `Bem-vindo(a), ${newUser.name}.`, tone: 'success' })
      return true
    },
    [teachers, school.name, toast],
  )

  const registerTeacher = useCallback(
    (userData: Omit<TeacherUser, 'id'>) => {
      const newUser: TeacherUser = {
        ...userData,
        id: uid('prof'),
      }
      setTeachers((prev) => {
        const filtered = prev.filter((t) => t.email.toLowerCase() !== newUser.email.toLowerCase())
        return [...filtered, newUser]
      })
      setCurrentUser(newUser)
      toast({ title: 'Cadastro realizado com sucesso!', description: `Logado como ${newUser.name}`, tone: 'success' })
      return newUser
    },
    [toast],
  )

  const logoutTeacher = useCallback(() => {
    setCurrentUser(null)
    toast({ title: 'Sessão encerrada', tone: 'info' })
  }, [toast])

  const toggleFavorite = useCallback((id: string) => {
    setMaterials((current) =>
      current.map((material) =>
        material.id === id ? { ...material, favorite: !material.favorite } : material,
      ),
    )
  }, [])

  const toggleShared = useCallback((id: string) => {
    setMaterials((current) =>
      current.map((material) =>
        material.id === id ? { ...material, shared: !material.shared } : material,
      ),
    )
  }, [])

  const updateSchoolLogo = useCallback((logoDataUrl: string) => {
    setSchool((current) => ({ ...current, logo: logoDataUrl }))
  }, [])

  const updateSchool = useCallback((next: SchoolIdentity) => setSchool(next), [])
  const updateSettings = useCallback(
    (next: Partial<AppSettings>) => setSettings((current) => ({ ...current, ...next })),
    [],
  )
  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  const exportBackup = useCallback(() => {
    const payload = {
      app: 'Matemática Interativa',
      version: 1,
      exportedAt: new Date().toISOString(),
      materials,
      school,
      settings,
    }
    downloadText(JSON.stringify(payload, null, 2), `matematica-interativa-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
    toast({ title: 'Backup exportado', description: 'Seus materiais, identidade e preferências foram salvos em um arquivo.', tone: 'success' })
  }, [materials, school, settings, toast])

  const importBackup = useCallback(
    (raw: string): boolean => {
      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed.materials)) throw new Error('Formato inválido')
        setMaterials(parsed.materials as Material[])
        if (parsed.school) setSchool({ ...DEFAULT_SCHOOL, ...parsed.school })
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings })
        toast({ title: 'Backup importado', description: `${parsed.materials.length} materiais restaurados.`, tone: 'success' })
        return true
      } catch {
        toast({ title: 'Não foi possível importar', description: 'Verifique se o arquivo é um backup válido da plataforma.', tone: 'error' })
        return false
      }
    },
    [toast],
  )

  const clearMaterials = useCallback(() => {
    setMaterials([])
    toast({ title: 'Biblioteca limpa', description: 'Todos os materiais foram removidos deste navegador.', tone: 'info' })
  }, [toast])

  const restoreDemo = useCallback(() => {
    setMaterials(createDemoMaterials())
    toast({ title: 'Conteúdos de demonstração restaurados', tone: 'success' })
  }, [toast])

  const value = useMemo<AppContextValue>(
    () => ({
      materials,
      school,
      settings,
      toasts,
      currentUser,
      teachers,
      loginTeacher,
      registerTeacher,
      logoutTeacher,
      setCurrentTeacher: setCurrentUser,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      duplicateMaterial,
      toggleFavorite,
      toggleShared,
      updateSchool,
      updateSchoolLogo,
      updateSettings,
      resetSettings,
      toast,
      dismissToast,
      exportBackup,
      importBackup,
      clearMaterials,
      restoreDemo,
    }),
    [
      materials,
      school,
      settings,
      toasts,
      currentUser,
      teachers,
      loginTeacher,
      registerTeacher,
      logoutTeacher,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      duplicateMaterial,
      toggleFavorite,
      toggleShared,
      updateSchool,
      updateSchoolLogo,
      updateSettings,
      resetSettings,
      toast,
      dismissToast,
      exportBackup,
      importBackup,
      clearMaterials,
      restoreDemo,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider')
  return context
}
