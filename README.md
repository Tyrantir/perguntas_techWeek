# Mural de perguntas

Mural de perguntas ao vivo para oficinas. Participantes escaneiam um QR code, mandam perguntas e votam nas dos outros; um telão mostra o ranking em tempo real e o moderador destaca a pergunta que está respondendo.

| Rota | Quem usa | O que faz |
|---|---|---|
| `/` | todos | home: link para o mural e lista das páginas criadas na oficina |
| `/mural` | participantes (celular) | envia perguntas, vota, abas "Mais votadas" e "Recentes" |
| `/paginas/<slug>` | todos | páginas criadas por prompt, uma por pessoa (veja `AGENTS.md`) |
| `/telao` | projetor 16:9 | QR code, contadores, "Respondendo agora" e top 7 |
| `/admin` | moderador | destacar, marcar como respondida, reabrir, ocultar, zerar mural |

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind CSS v4 · Zod · Upstash Redis · `qrcode.react` · Geist.

## Rodando local

Requer Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

Pronto: sem variáveis de ambiente o app usa um **store em memória** e o PIN do admin é **`1234`**. Abra:

- http://localhost:3000 (home)
- http://localhost:3000/mural (participante)
- http://localhost:3000/telao
- http://localhost:3000/admin

Para testar pelo celular na mesma rede, abra o telão pelo IP da máquina (ex.: `http://192.168.0.10:3000/telao`): o QR code usa a origem em que o telão foi aberto.

O store em memória zera quando o servidor reinicia. Para persistir também em dev, copie `.env.example` para `.env.local` e preencha as credenciais do Upstash.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm start` | build e servidor de produção |
| `npm run typecheck` | gera os tipos de rota (`next typegen`) e roda `tsc --noEmit` |
| `npm run test:api` | testes de fumaça da API com curl contra `localhost:3000` (**zera o mural**) |

O `test:api` precisa de bash e curl (no Windows, Git Bash). Para outro endereço ou PIN: `ADMIN_PIN=xxxx bash scripts/api-test.sh http://host:porta`.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ADMIN_PIN` | em produção | PIN do `/admin`. Em dev o padrão é `1234`; em produção, sem ele o admin responde 503. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | em produção* | injetadas pela integração Upstash da Vercel |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | em produção* | alternativa, para banco criado direto na Upstash |
| `MURAL_PREFIX` | não | prefixo das chaves no Redis (padrão `mural`); permite várias oficinas no mesmo banco |
| `NEXT_PUBLIC_APP_URL` | não | URL base do QR code do telão (padrão: origem atual); o QR aponta para `<base>/mural`. Embutida no build. |

\* Um dos dois pares. Sem Redis em produção o app ainda sobe, mas com store em memória por instância, o que quebra na Vercel (cada request pode cair em outra instância). O log avisa.

## Deploy na Vercel

1. **Importe o repositório** em [vercel.com/new](https://vercel.com/new). O framework (Next.js) é detectado sozinho; não precisa mudar nada de build. Pode fazer o primeiro deploy.
2. **Crie o Redis:** no projeto, aba **Storage → Create Database → Upstash for Redis** (Marketplace). Escolha a região do banco igual (ou a mais próxima) à das functions, que por padrão rodam em Washington (`iad1`; veja em **Settings → Functions**), e **conecte ao projeto** em todos os ambientes. A integração cria `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
3. **Defina o PIN:** **Settings → Environment Variables → `ADMIN_PIN`** com um valor que só o moderador saiba.
4. **Redeploy:** **Deployments → ⋯ no último deploy → Redeploy**. Variáveis novas só valem para deploys feitos depois delas.
5. **Confira:** abra `/admin`, entre com o PIN, abra o telão e mande uma pergunta pelo celular.

Opcional: `NEXT_PUBLIC_APP_URL` com o domínio final (se o telão for aberto por outro endereço) e `MURAL_PREFIX` para separar oficinas. Ambos também pedem redeploy.

Para zerar entre uma turma e outra, use **Zerar mural** no `/admin`: apaga só as chaves do prefixo.

## Arquitetura

```
src/
├── app/                 # só roteamento: pages e route handlers finos
│   ├── page.tsx, telao/, admin/
│   └── api/             # questions, questions/[id], questions/[id]/vote, me, admin/{board,spotlight,reset}
├── core/                # infra transversal, sem conhecimento de domínio
│   ├── config/env.ts    # env validado com Zod
│   ├── store/           # interface KvStore + impl Redis (Upstash) + impl em memória
│   ├── http/            # AppError, route() que converte AppError/ZodError em { error, code }
│   └── identity/        # cookie anônimo do votante, validação do PIN
├── features/
│   ├── questions/
│   │   ├── domain/      # tipos, schemas Zod, limites, ordenação (roda no cliente e no servidor)
│   │   ├── server/      # repository (chaves Redis) e service (regras de negócio)
│   │   ├── client/      # chamadas à API e hooks (polling, voto otimista)
│   │   └── components/  # UI do participante
│   ├── display/         # telão: QR, destaque, ranking
│   └── admin/           # PIN gate e painel de moderação
└── shared/              # ui (Button, Card), lib (cn, fetchJson, timeAgo), hooks (usePolling)
```

**Regras de dependência:** `app → features → core/shared`. `display` e `admin` consomem `questions`; `core` e `shared` nunca importam de `features`. Arquivos de servidor importam `server-only`, então o build falha se algum deles vazar para o bundle do cliente. Não há barrel files (`index.ts` reexportando tudo) em `features/`, justamente para não misturar código de servidor e de cliente num mesmo import.

### Por que polling e não WebSocket

Functions da Vercel são efêmeras e não seguram conexão aberta. O cliente busca o board a cada 2s (pausando com a aba oculta) e o `GET /api/questions` responde com `Cache-Control: public, max-age=0, s-maxage=1, stale-while-revalidate=2`: com 200 celulares abertos, a CDN atende quase tudo e a function roda em torno de uma vez por segundo por região da CDN.

Como o board pode chegar até ~3s atrasado, o cliente sobrepõe localmente o voto e a pergunta recém-enviados por alguns segundos, para o número não "voltar" depois do clique. `/api/me` e as rotas de admin são `no-store`.

### Modelo no Redis

Todas as chaves começam com `{MURAL_PREFIX}:`.

| Chave | Tipo | Conteúdo |
|---|---|---|
| `q:{id}` | hash | `id`, `text`, `author`, `createdAt`, `status` |
| `rank` | sorted set | id da pergunta → número de votos |
| `votes:{id}` | set | votantes da pergunta (impede voto duplo) |
| `voter:{voterId}` | set | perguntas votadas por aquele navegador |
| `spotlight` | string | id da pergunta em destaque |
| `cooldown:{voterId}` | string | `SET NX EX 15`: limita 1 pergunta a cada 15s |

O voto é um toggle: só a requisição cujo `SADD`/`SREM` de fato alterou `votes:{id}` mexe no placar, então cliques simultâneos não contam em dobro. O reset usa `SCAN` no prefixo e apaga em lotes.

### API

Erros sempre no formato `{ "error": "mensagem", "code": "VALIDATION" | "UNAUTHORIZED" | "NOT_FOUND" | "CONFLICT" | "RATE_LIMITED" | ... }`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/questions` | board público (sem ocultas), cacheável |
| POST | `/api/questions` | `{ text, author? }` → 201; 400 validação, 429 cooldown, 409 limite de 500 |
| POST | `/api/questions/[id]/vote` | alterna o voto → `{ voted, votes }`; 409 se respondida |
| GET | `/api/me` | `{ votedIds }` do navegador atual |
| PATCH | `/api/questions/[id]` | admin: `{ status: "open" \| "answered" \| "hidden" }` |
| GET | `/api/admin/board` | admin: board incluindo ocultas |
| PUT | `/api/admin/spotlight` | admin: `{ id: string \| null }` |
| POST | `/api/admin/reset` | admin: apaga todas as chaves do prefixo |

Rotas de admin exigem o header `x-admin-pin`. O votante é identificado pelo cookie httpOnly `mural_voter` (UUID, 30 dias), criado ao perguntar ou votar.

### Regras

- Pergunta: 5 a 280 caracteres (após trim); nome opcional até 40.
- 1 pergunta a cada 15s por navegador; no máximo 500 perguntas no mural.
- Ordenação: abertas primeiro (mais votos, depois mais antigas), respondidas no fim; ocultas só aparecem no admin.
- Marcar como respondida ou ocultar remove o destaque daquela pergunta.

> Por ser anônimo, o limite de voto é por navegador: uma aba anônima conta como outra pessoa. Para uma oficina isso é aceitável; para algo com mais em jogo, seria preciso login.
