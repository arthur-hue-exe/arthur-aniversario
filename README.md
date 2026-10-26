# Convite digital — Aniversário de Arthur Alves

Convite digital premium com contagem regressiva, confirmação de presença real e lista pública sincronizada entre dispositivos.

- **Evento:** sábado, 07 de novembro de 2026, a partir das 17h (horário de Brasília)
- **Local:** Rua 1, Jardim Imperial, Quadra 09, Lote 41 — Aparecida de Goiânia/GO — CEP 74914-662
- **Página pública:** `/`
- **Painel do anfitrião:** `/admin/login` (sem link público)

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilo | Tailwind CSS 4 |
| Animação | Motion 14 (`motion/react`), reveals via CSS + IntersectionObserver |
| Banco | PostgreSQL 17 |
| Persistência | Prisma 6 (schema, migrations e seed) |
| Validação | Zod 4 no cliente e no servidor |
| Testes | Vitest (unitários e integração) + smoke test de API |

## Funcionalidades

- Hero cinematográfico com imagem ambiente, tipografia editorial e animações que respeitam `prefers-reduced-motion`.
- Contagem regressiva em tempo real para 07/11/2026 17:00 (America/Sao_Paulo), com estados de festa em andamento e evento encerrado — sem números negativos e sem reinício automático no ano seguinte.
- Cards de data, horário e local (endereço completo e referência SOS Micros), link de busca no Google Maps e lista do que trazer.
- Confirmação de presença sem login: nome obrigatório, acompanhante opcional, validação no cliente e no servidor, proteção contra duplicatas e feedback de sucesso/erro.
- Lista pública atualizada automaticamente a cada 15 segundos (pausada com a aba oculta), com contagem de confirmados, acompanhantes e pendentes, além do horário da última atualização.
- Painel administrativo protegido no servidor: busca, filtros, inclusão, edição, confirmação de acompanhantes, alteração de status, observações internas e remoção com confirmação.
- SEO com metadados Open Graph/Twitter, imagem de compartilhamento 1200×630 gerada dinamicamente, favicon e `lang="pt-BR"`.
- Segurança: cookie de sessão HttpOnly assinado com HMAC, comparação de senha em tempo constante, verificação same-origin nas rotas administrativas, rate limiting e nenhuma credencial no frontend.
- Estados de carregamento, erro, lista vazia e foco acessível; navegação por teclado e skip link.

## Requisitos

- Node.js 20.9+ (recomendado 22 ou 24)
- npm
- Docker (para o PostgreSQL local) **ou** uma conexão PostgreSQL gerenciada

## 1. Instalação

```bash
npm install
```

O `postinstall` executa `prisma generate`.

## 2. Variáveis de ambiente

Copie o modelo e preencha os valores:

```bash
cp .env.example .env
```

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (metadados, Open Graph e cookies `Secure` em HTTPS). Em produção use `https://seudominio.com`. |
| `DATABASE_URL` | String de conexão PostgreSQL usada pelo app em runtime (client do Prisma). |
| `DIRECT_URL` | Conexão usada pelo Prisma CLI em migrations/seed. No Docker local, igual à `DATABASE_URL`. Em produção, use a conexão direta ou o Session Pooler do Supabase. |
| `ADMIN_PASSWORD` | Senha do painel do anfitrião. **Defina uma senha longa e exclusiva.** |
| `ADMIN_SESSION_SECRET` | Segredo de assinatura da sessão, com **32+ caracteres aleatórios**. |

Gere um segredo forte:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

O arquivo `.env` é ignorado pelo Git. Nunca versione credenciais.

Para os testes de integração, crie também um `.env.test` (também ignorado) apontando para um banco separado:

```dotenv
DATABASE_URL="postgresql://arthur:arthur_local_dev@localhost:55432/arthur_party_test?schema=public"
DIRECT_URL="postgresql://arthur:arthur_local_dev@localhost:55432/arthur_party_test?schema=public"
ADMIN_PASSWORD="senha-usada-apenas-nos-testes"
ADMIN_SESSION_SECRET="segredo-de-teste-com-32-caracteres-ou-mais"
```

## 3. Banco local

```bash
npm run db:up
```

O comando sobe o PostgreSQL 17 em `localhost:55432` (container `arthur-aniversario-db`). Aguarde o status `healthy`:

```bash
docker ps --filter name=arthur-aniversario-db
```

Crie o banco de testes (necessário apenas uma vez):

```bash
docker compose exec db createdb -U arthur arthur_party_test
```

Aplique as migrations e carregue a lista inicial:

```bash
npm run db:migrate
npm run db:seed
```

> O seed é idempotente: usa IDs fixos e `skipDuplicates`, portanto pode ser executado novamente sem duplicar registros. Ele cadastra os 10 nomes fornecidos pelo organizador, mantendo a grafia original. `Zakk` entra como **pendente** ("Possível convidada") e não é contado como presença confirmada. Os acompanhantes informados (Gasparzinha, prima e esposa) entram como **a confirmar**.

## 4. Executar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## 5. Painel do anfitrião

- URL: `http://localhost:3000/admin/login`
- Senha: o valor de `ADMIN_PASSWORD` no seu `.env`.

O painel não é linkado na página pública. Todas as rotas administrativas validam a sessão **no servidor**; esconder botões no frontend não é usado como proteção.

A sessão dura 8 horas. Para revogar todas as sessões existentes, troque o `ADMIN_SESSION_SECRET` (a troca da senha, sozinha, não invalida tokens já emitidos).

Recursos do painel:

- Métricas de confirmados, convidados, acompanhantes, pendentes e cancelados.
- Busca por nome e filtros por status.
- Inclusão manual de convidados.
- Edição de nome, acompanhante, status, observação pública e observações internas.
- Marcar acompanhante como confirmado.
- Remoção com confirmação explícita.

## 6. Testes e verificações

Prepare o banco de testes e rode a suíte:

```bash
npm run test:setup
npm test
```

Cobertura atual:

- **Unitários:** fuso/data-alvo da contagem, fases (antes/ao vivo/encerrado), clamp em zero, normalização de nomes, iniciais, validações Zod, tokens de sessão, same-origin e rate limit.
- **Integração (PostgreSQL real):** criação pública, bloqueio de duplicatas normalizadas, estatísticas, ordenação, exclusão de cancelados, proteção de campos internos, CRUD administrativo, conflitos de nome e registros inexistentes.

Smoke test da API contra um servidor em execução:

```bash
# em outro terminal, com o site rodando (npm run dev ou npm start)
npm run test:smoke
```

O smoke cria um registro temporário, valida criação/duplicata/validações, testa acessos administrativos sem sessão, login, same-origin, confirmação de acompanhante, status pendente, remoção e logout. O registro é apagado ao final. Ele só roda por padrão contra `localhost`; para outro ambiente, defina `SMOKE_BASE_URL` e `SMOKE_ALLOW_REMOTE=1` com cautela.

Lint e build:

```bash
npm run lint
npm run build
```

> Os limites de requisição são em memória: reiniciar o servidor zera os contadores. Execuções repetidas do smoke em sequência podem atingir o limite de login/RSVP.

## 7. Produção local

```bash
npm run build
npm start
```

A aplicação sobe em `http://localhost:3000`. A página inicial e o painel são renderizados dinamicamente e consultam o PostgreSQL em tempo de execução.

## 8. Publicação (Vercel + Supabase PostgreSQL)

O Supabase entra apenas como **PostgreSQL gerenciado**. O app continua com Prisma e login administrativo próprio — **não** é necessário instalar `@supabase/supabase-js`/`@supabase/ssr`, criar clients ou middleware. A publishable key do Supabase não é uma string de conexão Postgres e não é usada neste projeto; a chave `service_role` nunca deve ir para o frontend ou para o repositório. O desenvolvimento local segue no Docker.

### 8.1 Escolher a conexão

No Supabase Dashboard → **Connect** (ou *Project Settings → Database*) → **ORM/Prisma**, copie a connection string e substitua `[YOUR-PASSWORD]` pela senha do banco.

| Uso | Recomendação |
| --- | --- |
| Runtime na Vercel | Session Pooler (porta 5432) ou Transaction Pooler (6543, com `?pgbouncer=true&connection_limit=1`) |
| Migrations/seed | Conexão direta (`db.<ref>.supabase.co:5432`) ou Session Pooler |

A conexão direta padrão do Supabase é IPv6-only no plano gratuito, e a Vercel não oferece saída IPv6 — por isso use o pooler em runtime. Inclua `sslmode=require` nas URLs.

Exemplo com Transaction Pooler no runtime e Session Pooler nas migrations:

```dotenv
DATABASE_URL="postgresql://postgres.<project-ref>:<SENHA>@aws-0-<regiao>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres.<project-ref>:<SENHA>@aws-0-<regiao>.pooler.supabase.com:5432/postgres?sslmode=require"
```

Se preferir simplicidade, use o Session Pooler (porta 5432) nas duas variáveis — ele também suporta migrations.

### 8.2 Migrations e seed (uma vez)

Crie um `.env.remote` (ignorado pelo Git) apenas com as duas URLs do Supabase:

```dotenv
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

Confirme que apontam para o projeto correto. Estes comandos **alteram o banco externo**:

```bash
npm run db:remote:migrate
npm run db:remote:seed
```

O seed é idempotente. Para aplicar apenas o schema, rode somente `db:remote:migrate`. Apague o `.env.remote` depois de usar, se não quiser manter a senha em disco.

### 8.3 Vercel

Importe o repositório e configure em *Settings → Environment Variables* (Production e Preview):

- `DATABASE_URL`
- `DIRECT_URL`
- `ADMIN_PASSWORD` (senha forte, diferente da local)
- `ADMIN_SESSION_SECRET` (48 bytes aleatórios)
- `NEXT_PUBLIC_SITE_URL` (ex.: `https://aniversario-arthur.vercel.app`)

O build padrão (`npm run build`) executa `prisma generate && next build`; o `DIRECT_URL` também precisa existir no ambiente de build porque o schema o referencia.

### 8.4 Pós-deploy

- `/` carrega com a contagem correta.
- Confirme uma presença em dois navegadores/dispositivos e veja a lista atualizar.
- `/admin/login` autentica e o painel permite CRUD.
- Cole a URL no WhatsApp e confira o cartão Open Graph.
- `npm run test:smoke` com `SMOKE_BASE_URL` apontando para o deploy (opcional, cria e remove um registro).
- Em HTTPS, o cookie de sessão é emitido com `Secure` automaticamente.
- Ao usar domínio próprio, atualize `NEXT_PUBLIC_SITE_URL` e faça um novo deploy para corrigir os metadados Open Graph.

### Rate limiting em serverless

`src/lib/rate-limit.ts` mantém os contadores em memória do processo. Isso funciona bem em uma instância, mas em ambientes serverless com múltiplas instâncias o limite é por instância. Para proteção mais rígida, substitua a implementação por Redis/Upstash mantendo a mesma interface `consumeRateLimit`.

## 9. Alterar a data do evento

Toda a data, horário, textos e links vêm de **[`src/config/event.ts`](src/config/event.ts)**. Para mudar o evento:

1. Atualize `startsAtISO` e `endsAtISO` mantendo o fuso `-03:00` (America/Sao_Paulo).
2. Ajuste os rótulos derivados: `dateLabel`, `dateShort`, `dateHeroLine`, `dateCard`, `year`, `timeLabel`, `timeHeroLine`.
3. Atualize o dia da semana exibido nos componentes (`Sábado`) e no painel.
4. Rode `npm test` — os testes de contagem em `src/lib/countdown.test.ts` verificam o horário alvo e devem ser atualizados junto.

Comportamento da contagem:

- Antes do início: dias/horas/minutos/segundos em tempo real.
- A partir das 17h de 07/11/2026: mensagem **“A festa começou.”**
- Após o fim definido em `endsAtISO`: mensagem **“A festa já aconteceu.”**
- Nunca exibe valores negativos nem reinicia para o próximo ano.

## 10. Estrutura

```text
prisma/
  schema.prisma              # modelo Guest
  migrations/                # migration SQL versionada
  seed.ts                    # lista inicial idempotente
scripts/
  smoke.mjs                  # smoke test real da API
src/
  app/
    page.tsx                 # página pública (dinâmica)
    admin/                   # login e painel do anfitrião
    api/rsvp/                # GET lista pública + POST confirmação
    api/admin/               # login, logout e CRUD protegido
    opengraph-image.tsx      # cartão 1200×630 para WhatsApp
    icon.svg                 # favicon
  components/site/           # hero, sobre, RSVP/lista, marquee, footer
  components/                # reveal, section-intro, ícones
  config/event.ts            # fonte única da verdade do evento
  lib/                       # auth, prisma, validação, serviços, rate limit
tests/
  guest-service.test.ts      # integração com PostgreSQL real
vitest.config.ts             # carrega .env.test e alias @
docker-compose.yml           # PostgreSQL local
```

### Modelo de dados

`Guest` (`guests`):

- `id`, `name`, `normalizedName` (único), `companionName`, `companionConfirmed`
- `status` (`CONFIRMED` | `PENDING` | `CANCELLED`), `origin` (`SEED` | `RSVP` | `MANUAL`)
- `publicNote`, `internalNotes`, `createdAt`, `updatedAt`, `confirmedAt`

O nome normalizado (sem acentos, minúsculo, pontuação como separador) é a chave de prevenção de duplicatas. A lista pública nunca expõe `internalNotes`, `normalizedName` ou identificadores internos de origem.

## 11. Segurança e privacidade

- Nenhuma senha, chave ou token administrativo é enviado ao frontend.
- A sessão é um token assinado com HMAC-SHA256 em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em HTTPS.
- Senha comparada com `timingSafeEqual` sobre hashes SHA-256.
- Rotas administrativas exigem sessão válida no servidor e verificam a origem da requisição.
- A lista pública mostra apenas nome, acompanhante, status e observação pública.
- Entradas são validadas com Zod nos dois lados; conteúdo HTML é rejeitado pelo padrão de nome.
- Rate limiting no login (5/15 min), RSVP (6/10 min) e leitura pública (120/min), por IP.
- O endereço foi usado apenas em um link de busca do Google Maps; **não há coordenadas inventadas nem afirmação de endereço validado**.

## 12. Limitações conhecidas

- Não há envio de e-mail/WhatsApp automático; a confirmação é refletida na lista pública.
- O limite de requisições é em memória (veja a seção de rate limiting).
- A sessão é stateless; o logout limpa o cookie no navegador, mas não revoga tokens já copiados. Rotacione `ADMIN_SESSION_SECRET` se necessário.
- O endereço não foi geocodificado; o botão abre uma busca no Google Maps com o endereço completo.
