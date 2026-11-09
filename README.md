# Matemática Viva

Plataforma **gratuita** e de código aberto para professores de Matemática da Educação Básica:
crie planos de aula alinhados à BNCC, aulas interativas, exercícios, provas, apostilas, jogos e
atividades ilustradas — e **imprima tudo com a logo da sua escola**.

> Ferramenta 100% gratuita, roda 100% no navegador e pode ser publicada no GitHub Pages sem custo nenhum.

## ✨ Recursos

- **Cadastro de professores** — login/cadastro local, com seus materiais salvos no navegador.
- **Identidade da escola** — envie a logo e o nome da escola; ela aparece nos materiais impressos.
- **Planos de aula, aulas interativas, exercícios, provas e apostilas** — gere e imprima em PDF.
- **Figuras em LaTeX (TikZ)** — galeria de desenhos geométricos e gráficos gerados com código
  LaTeX/TikZ (TikZJax) e fórmulas com MathJax. Copie o código para o Overleaf, Word ou Google Docs.
- **Laboratório de geometria, jogos matemáticos e atividades ilustradas**.
- **Tema claro/escuro**, responsivo e com impressão cuidada (quebra de página, cabeçalho com logo).

## 🚀 Rodando localmente

Requisitos: [Node.js](https://nodejs.org) 18 ou superior.

```bash
npm install     # instala as dependências
npm run dev     # servidor de desenvolvimento (http://localhost:5173)
npm test        # testes (Vitest)
npm run build   # gera a versão de produção em dist/
npm run preview # visualiza o build de produção
```

## 🌐 Publicando no GitHub Pages (grátis)

O projeto já vem com o workflow automático `.github/workflows/deploy.yml`, que roda os testes,
faz o build e publica o site a cada push na branch `main`.

1. **Crie o repositório no GitHub**
   - Acesse [github.com/new](https://github.com/new), dê um nome (ex.: `matematica-viva`) e deixe-o
     **Public** (ou ative o plano gratuito de Pages).
   - Não adicione README, .gitignore ou licença automáticos (o projeto já tem os seus).

2. **Envie os arquivos**
   - **Pela web (sem git instalado):** em *Add file → Upload files*, arraste a pasta do projeto
     (exceto `node_modules/` — o `.gitignore` já a exclui) e clique em *Commit changes*.
   - **Pelo GitHub Desktop:** *File → Add local repository*, escolha a pasta e depois
     *Push origin*.
   - **Pelo terminal (com git):**
     ```bash
     git init
     git add .
     git commit -m "Primeira versão da Matemática Viva"
     git branch -M main
     git remote add origin https://github.com/SEU-USUARIO/matematica-viva.git
     git push -u origin main
     ```

3. **Ative o GitHub Pages**
   - No repositório: *Settings → Pages → Build and deployment → Source*: **GitHub Actions**.

4. **Pronto** — a Actions publica o site e o endereço aparece em
   `https://SEU-USUARIO.github.io/matematica-viva/`.
   A cada novo push na branch `main`, o site é atualizado sozinho.

> Se a Actions falhar, confira em *Settings → Actions → Workflow permissions*: deve estar
> **Read and write permissions**.

## 📂 Estrutura do projeto

```
index.html            → entrada do Vite (TikZJax + MathJax)
src/
  App.tsx             → rotas da aplicação
  components/         → shell, navegação, modal de login e componentes de UI
  pages/              → páginas (planos, aulas, provas, geometria, LaTeX, escola…)
  lib/
    store.tsx         → estado global (professores, materiais, escola, toasts)
    tikz.tsx          → figuras LaTeX/TikZ + componentes <TikzFigure> e <Latex>
    pdf.ts            → impressão/PDF com cabeçalho e logo da escola
.github/workflows/    → deploy automático no GitHub Pages
```

## 🛠 Tecnologias

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · TikZJax (LaTeX/TikZ) · MathJax · Vitest

## 📄 Licença

MIT — livre para usar, adaptar e distribuir em sala de aula.
