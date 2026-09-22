# AtlasHirePro

Catálogo de profissionais de reforma e manutenção residencial, feito para o
desafio técnico de front-end da Atlas Technologies ([`docs/challenge.md`](docs/challenge.md)).

**Demo:** https://atlas-frontend-challenge-8bce3lon6-ggcgabriels-projects.vercel.app/

Nuxt 4 (SSR), Vue 3, TypeScript, Vuetify 4, Pinia, Drizzle + PostgreSQL 17, Vitest.

## O que é

São 520 profissionais em 15 profissões e 5 categorias. Os dados vêm de um
PostgreSQL, não de um JSON local, então busca, filtro, ordenação e paginação
acontecem em SQL.

A listagem tem busca por nome ou profissão, filtros combináveis (preço, cidade,
raio de atendimento, experiência, selos), cinco critérios de ordenação e
carregamento sob demanda. O perfil é uma página dedicada, com bio, serviços com
preço e duração, avaliações, nota por critério e selos.

O estado da busca fica na URL. Filtrou, ordenou, copiou o link: quem abrir cai na
mesma busca. Escrevo com `replace` em vez de `push`, pra o botão Voltar não
caminhar checkbox por checkbox.

O que fiz de performance:

- A primeira página é renderizada no servidor. Da segunda em diante o
  carregamento é no cliente.
- Os avatares são 520 WebP locais com um placeholder inline guardado no banco, em
  vez de hotlink pra um host que eu não controlo.
- Desliguei os utilitários do Vuetify depois de medir quantos o projeto usava:
  14 de 3011. O CSS que bloqueia a renderização caiu de 26 KB para 3,2 KB
  gzipado.
- O scroll infinito carrega 4 páginas e devolve o controle pro botão, pra o DOM
  não crescer sem teto e o rodapé continuar alcançável.

## Como rodar

Precisa de Node 20+, pnpm 10+ e Docker.

```bash
cp .env.example .env     # os valores padrão já casam com o docker-compose
pnpm install

pnpm db:up               # sobe o Postgres 17 e espera ficar healthy
pnpm db:migrate          # aplica as 4 migrações
pnpm db:seed             # popula 520 profissionais, 1841 serviços, 3772 avaliações

pnpm dev                 # http://localhost:3000
```

O container publica na porta 5433, não na 5432, pra não colidir com um Postgres
que já esteja rodando na máquina. Pra recomeçar do zero, `pnpm db:reset`.

Build de produção:

```bash
pnpm build
set -a && . ./.env && set +a && node .output/server/index.mjs
```

O `set -a` carrega o `.env` no ambiente. Sem ele o servidor buildado sobe e falha
na primeira query.

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` / `pnpm preview` | Build de produção / pré-visualização |
| `pnpm test` / `pnpm test:watch` | Vitest |
| `pnpm typecheck` | `vue-tsc` em modo strict |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm db:up` / `db:down` / `db:migrate` / `db:seed` / `db:reset` / `db:studio` | Ciclo de vida do banco |
| `pnpm images:fetch` / `images:build` | Pipeline de retratos, já versionado, só pra regerar |

O deploy é na Vercel, sem configuração: o Nitro detecta o preset sozinho. Em
produção o banco é um Postgres gerenciado, e a única variável necessária é
`NUXT_DATABASE_URL`.

## Estrutura

```
app/                              # camada Vue (srcDir do Nuxt 4)
  assets/styles/tokens.css        # design tokens
  components/                     # 20 componentes, apresentacionais
  composables/                    # useCatalogQuery, useProfessionalCatalog, useCatalogFilters
  layouts/ pages/ plugins/
  stores/                         # catalog (rascunho dos filtros), ui, favorites
  utils/                          # format, avatar, category
shared/types/professional.ts      # o contrato da API
server/
  api/                            # um handler por rota
  database/                       # schema, migrações, seed, dados do catálogo
  utils/                          # cliente do banco, schemas zod
public/images/professionals/      # 520 avatares WebP 400x400
```

Como as camadas se dividem:

- [`shared/types/professional.ts`](shared/types/professional.ts) é o contrato. O
  Nuxt auto-importa `shared/` no servidor e no Vue, então o endpoint e o
  componente que consome ele não divergem sem quebrar o type check.
- No servidor cada handler segue o mesmo caminho: zod valida a query, Drizzle
  monta o SQL. Nenhum filtro roda em JavaScript.
- Os composables são a única porta de dados das páginas. Os componentes recebem
  props tipadas e não buscam nada.
- O Pinia guarda só o que a URL não guarda: o rascunho do painel de filtros, o
  drawer aberto e os favoritos em localStorage.

Código, nomes de símbolo e commits estão em inglês. A interface e este README, em
português.

## Testes

```bash
pnpm test
```

5 arquivos, 63 casos. Cobrem a leitura da URL contra entrada inválida, o
acumulado de páginas e o limite do scroll infinito, e a formatação em pt-BR.
Escolhi esses alvos por risco: a URL é a superfície que recebe entrada
arbitrária, e o scroll tem três modos de falha sutis.

Não cobrem render de componente, handlers de servidor nem e2e.

## Uso de IA

Usei o Claude Code do começo ao fim do projeto, pra implementação, refatoração,
testes e documentação.

Na prática a divisão foi essa: eu decidia arquitetura, escopo e prioridade, e ele
acelerava a escrita e a revisão. As escolhas que definem o projeto (banco em vez
de JSON, o estado na URL, limitar o scroll infinito, cortar o que não ia dar
tempo de fazer bem) foram minhas, e tenho como defender cada uma.

Onde dado gerado tinha consequência, revisei na mão. Os retratos são gerados por
IA, pra não colar o rosto de uma pessoa real num perfil fictício, e revisei os
616 um a um: rejeitei 90, a maioria por serem de menores de idade. O pipeline lê
de uma allowlist ([`scripts/portrait-review.json`](scripts/portrait-review.json))
justamente pra essa revisão não poder ser pulada.

## O que ficou de fora

- Não rodei o Lighthouse. Não tenho Chrome no ambiente onde desenvolvi, e os
  números de performance acima são de build, reproduzíveis com `pnpm build`.
- Sem instrumentação ou métricas. É um diferencial listado no desafio que escolhi
  não atacar, pra não entregar só a fiação.
- A galeria de portfólio está modelada e tipada, mas não populada. As fontes de
  foto que testei devolviam imagem sem relação com o ofício, e uma delas tinha
  marca d'água.
- O índice de trigrama que criei pra busca não é usado pelo planner com 520
  linhas, porque nesse volume o scan sequencial sai mais barato. Ele passa a valer
  quando a tabela cresce.
- `minRating` funciona na API e por URL, mas não tem controle no painel.
