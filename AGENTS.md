<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Páginas da oficina (um prompt = uma página)

Prompts que começam com o nome de uma pessoa seguido de uma estilização pedem uma página nova. Para cada um:

1. Gere um `slug` em kebab-case a partir do nome (sem acentos). Se já existir, sufixe `-2`, `-3`...
2. Crie `src/app/paginas/<slug>/page.tsx` com `metadata.title` = `"<Nome> · TechWeek 2026"`. Todo o estilo fica dentro da página (classes Tailwind, `style`, ou um `page.module.css` na mesma pasta); não altere `globals.css` nem o layout raiz, para não vazar estilo nas outras páginas.
3. Inclua um link "← Voltar" para `/`.
4. Registre a página no fim do array `pages` em `src/features/pages/registry.ts` (`slug`, `author`, `title`, `description` curta, `accent` com a cor principal da página).
5. Não mexa nas páginas de outras pessoas nem em `/mural`, `/telao`, `/admin`.
