import { useMemo, useState } from 'react';
import { Check, Copy, Sigma, Shapes } from 'lucide-react';
import { Badge, Button, Card, PageHeader, SectionTitle, Tabs } from '../components/ui';
import { useApp } from '../lib/store';
import { FórmulasPopulares, Latex, TIKZ_FIGURES, TikzFigure, copiarTexto } from '../lib/tikz';

type Grupo = 'todos' | 'Fundamentos' | 'Geometria' | 'Gráficos';

const GRUPOS: { value: Grupo; label: string }[] = [
  { value: 'todos', label: 'Todas' },
  { value: 'Fundamentos', label: 'Fundamentos' },
  { value: 'Geometria', label: 'Geometria' },
  { value: 'Gráficos', label: 'Gráficos' },
];

const FORMULAS = FórmulasPopulares();

export function LatexPage() {
  const { toast } = useApp();
  const [grupo, setGrupo] = useState<Grupo>('todos');
  const [copiado, setCopiado] = useState<string | null>(null);

  const figuras = useMemo(
    () => (grupo === 'todos' ? TIKZ_FIGURES : TIKZ_FIGURES.filter((f) => f.group === grupo)),
    [grupo]
  );

  async function copiar(id: string, codigo: string) {
    const ok = await copiarTexto(codigo);
    if (ok) {
      setCopiado(id);
      toast({ title: 'Código copiado!', tone: 'success' });
      window.setTimeout(() => setCopiado((c) => (c === id ? null : c)), 2500);
    } else {
      toast({
        title: 'Não foi possível copiar',
        description: 'Selecione o código manualmente e use Ctrl+C.',
        tone: 'error',
      });
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Código que vira desenho"
        title="Figuras em LaTeX"
        description="Desenhos geométricos e gráficos gerados com código LaTeX/TikZ. Copie o código para o seu material ou use as fórmulas em qualquer editor."
        icon={<Sigma size={21} />}
        actions={
          <>
            <Badge tone="green">100% gratuito</Badge>
            <Button
              variant="secondary"
              size="sm"
              icon={<Copy size={14} />}
              onClick={() => copiar('formulas', FORMULAS.map((f) => f.latex).join('\n'))}
            >
              Copiar todas as fórmulas
            </Button>
          </>
        }
      />

      <SectionTitle
        title="Galeria de figuras"
        description="Cada figura vem com o código TikZ pronto para copiar."
        action={<Badge tone="blue">{figuras.length} figuras</Badge>}
      />

      <Tabs items={GRUPOS} value={grupo} onChange={setGrupo} className="mb-4" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {figuras.map((fig) => (
          <Card key={fig.id} className="overflow-hidden">
            <div className="tikz-preview">
              <TikzFigure id={fig.id} minHeight={168} />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <strong className="text-sm">{fig.name}</strong>
                <Badge tone="violet">{fig.group}</Badge>
              </div>
              <p className="text-[0.76rem] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                {fig.legend}
              </p>
              <pre className="codigo-tikz">
                <code>{fig.code.trim()}</code>
              </pre>
              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={copiado === fig.id ? <Check size={14} /> : <Copy size={14} />}
                  onClick={() => copiar(fig.id, fig.code.trim())}
                >
                  {copiado === fig.id ? 'Copiado!' : 'Copiar código'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle
        title="Fórmulas populares"
        description="Copie o código LaTeX e cole no Word, Google Docs ou Overleaf."
        className="mt-8"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {FORMULAS.map((f) => (
          <Card key={f.titulo}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <strong className="text-sm">{f.titulo}</strong>
              <Button
                variant="ghost"
                size="sm"
                icon={copiado === f.titulo ? <Check size={14} /> : <Copy size={14} />}
                onClick={() => copiar(f.titulo, f.latex)}
              >
                {copiado === f.titulo ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <p className="text-[0.72rem] text-slate-400 mb-1">{f.nota}</p>
            <div className="py-3 text-center text-lg overflow-x-auto">
              <Latex>{f.latex}</Latex>
            </div>
            <div className="text-[0.68rem] text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-2.5 py-1.5 font-mono break-all">
              {f.latex}
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle title="Como usar no seu material" className="mt-8" />
      <Card>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <strong>Copie o código</strong> da figura ou fórmula desejada.
          </li>
          <li>
            No Overleaf, cole em um documento que já tenha{' '}
            <code className="codigo-inline">{'\\usepackage{tikz}'}</code> — a figura aparece na hora.
          </li>
          <li>
            Para fórmulas no Word: <em>Inserir → Equação → LaTeX</em> e cole o código.
          </li>
          <li>
            Todo o conteúdo deste site pode ser usado e adaptado livremente em sala de aula.
          </li>
        </ol>
      </Card>

      <div className="mt-4 flex items-center gap-2 text-[0.76rem] text-slate-400">
        <Shapes size={14} />
        Figuras renderizadas com TikZJax (LaTeX) e fórmulas com MathJax — direto no navegador, sem instalar nada.
      </div>
    </div>
  );
}
