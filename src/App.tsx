import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { LessonPlanPage } from './pages/LessonPlanPage'
import { InteractiveLessonPage } from './pages/InteractiveLessonPage'
import { ExercisesPage } from './pages/ExercisesPage'
import { GamesPage } from './pages/GamesPage'
import { GeometryPage } from './pages/GeometryPage'
import { LatexPage } from './pages/LatexPage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { ExamsPage } from './pages/ExamsPage'
import { WorkbookPage } from './pages/WorkbookPage'
import { LibraryPage } from './pages/LibraryPage'
import { SchoolPage } from './pages/SchoolPage'
import { SettingsPage } from './pages/SettingsPage'
import { BrandMark } from './components/AppShell'
import { Button } from './components/ui'

function NotFound() {
  return (
    <div className="min-h-[65vh] grid place-items-center">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#101b3f] grid place-items-center shadow-xl shadow-indigo-100">
            <BrandMark size={38} />
          </div>
        </div>
        <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-indigo-500">Erro 404</div>
        <h1 className="text-2xl font-bold mt-1">Esta página não existe</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          O endereço pode ter mudado ou o material foi removido. Volte ao início para continuar planejando suas aulas.
        </p>
        <Link to="/" className="inline-block mt-5">
          <Button icon={<BrandMark size={16} />}>Voltar ao início</Button>
        </Link>
      </div>
    </div>
  )
}

export function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/planos" element={<LessonPlanPage />} />
          <Route path="/aulas" element={<InteractiveLessonPage />} />
          <Route path="/exercicios" element={<ExercisesPage />} />
          <Route path="/provas" element={<ExamsPage />} />
          <Route path="/apostilas" element={<WorkbookPage />} />
          <Route path="/jogos" element={<GamesPage />} />
          <Route path="/geometria" element={<GeometryPage />} />
          <Route path="/latex" element={<LatexPage />} />
          <Route path="/atividades" element={<ActivitiesPage />} />
          <Route path="/biblioteca" element={<LibraryPage />} />
          <Route path="/escola" element={<SchoolPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}
