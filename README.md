# Agro Brain

API para gestão de produtores rurais, propriedades, safras e culturas.

## Infra

- **NestJS** — framework HTTP/DI
- **Prisma** — ORM e migrations (PostgreSQL)
- **PostgreSQL** — banco relacional
- **Redis** — cache
- **Pino** — logger estruturado
- **Docker / Docker Compose** — empacotamento e orquestração local/prod
- **PM2** — process manager em produção (via `pm2-runtime` no container)
- **Swagger (OpenAPI)** — documentação da API
- **JWT + Passport** — autenticação (Local + Bearer)
- **class-validator / class-transformer** — validação e transformação de payloads
- **@nestjs/throttler** — rate limiting global

## Arquitetura

A organização segue uma abordagem inspirada em **hexagonal / ports & adapters**, isolando as regras de domínio dos adaptadores de infraestrutura:

```
src/
  main.ts                       # Bootstrap, ValidationPipe, Helmet, Swagger
  app.module.ts                 # Composição: Config, JWT, Throttler, módulos globais
  controllers/                  # Camada HTTP (entrada): controllers + DTOs + services de orquestração
    auth/
    farm/                       # owner / property / harvest / crops

libs/
  auth/                         # Estratégias Passport (Local/JWT) e Guards — adaptador de autenticação
  cache/                        # Adaptador de cache (Redis)
  database/                     # Adaptador de persistência (Prisma) + repositórios por entidade
    prisma/                     # schema.prisma + cliente gerado
  farm/                         # Domínio: regras de negócio por entidade (owner/property/harvest/crops)
  logger/                       # Adaptador de logging (Pino)
  user/                         # Serviços de usuário (login/credenciais)

decorators/                     # Decorators custom (@User, @ValidateDoc, @ValidateAreaSum)
configurations/
  envs/                         # Arquivos .env por ambiente (.env.example, .env.dev, .env.prod)
  scripts/                      # config loader e seed do Prisma
utils/                          # Constantes (TTLs, ThrottleLimits)
```

**Fluxo de uma requisição:**

1. `controllers/*` recebem o HTTP, validam input via DTO + `class-validator` e delegam ao _controller-service_ daquele recurso.
2. O _controller-service_ orquestra a chamada às regras de negócio em `libs/farm/*` (camada de domínio).
3. O domínio fala com a persistência via repositórios em `libs/database/repositories/*`, que encapsulam o cliente Prisma.
4. Os adaptadores (`libs/cache`, `libs/auth`, `libs/logger`) são consumidos por injeção de dependência, permitindo trocar a implementação sem tocar no domínio.

Esse desenho mantém os controllers finos, o domínio livre de detalhes de infraestrutura e os adaptadores intercambiáveis.

## Arquivos de configuração

Os arquivos de ambiente ficam em [`configurations/envs/`](configurations/envs/).

Copie o template [`.env.example`](configurations/envs/.env.example) para o arquivo do ambiente alvo:

- Desenvolvimento → `configurations/envs/.env.dev`
- Produção → `configurations/envs/.env.prod`

Variáveis esperadas:

| Variável                | Descrição                                     |
| ----------------------- | --------------------------------------------- |
| `POSTGRES_DATABASE_URL` | DSN do PostgreSQL usado pelo Prisma           |
| `POSTGRES_USER`         | Usuário do banco (usado no `docker-compose`)  |
| `POSTGRES_PASSWORD`     | Senha do banco (usado no `docker-compose`)    |
| `POSTGRES_DB`           | Nome do banco (usado no `docker-compose`)     |
| `REDIS_HOST`            | Host do Redis                                 |
| `REDIS_PORT`            | Porta do Redis                                |
| `REDIS_PASS`            | Senha do Redis                                |
| `JWT_SECRET`            | Segredo usado para assinar/validar tokens JWT |

## Usuário default

Por padrão o projeto está com o usuário e senha (ambos) definidos como **admin**

## Inicialização em dev

### 1º passo — Instalar dependências

A partir da raiz do projeto:

```bash
npm i
```

### 2º passo — Banco de dados e migrations

Provisione um Postgres efêmero gerenciado pela Prisma com:

```bash
npx create-db
```

A saída será semelhante a:

```
◆  Claim your database →
│
│    Want to keep your database? Claim for free:
│
│    https://create-db.prisma.io?projectID=proj_...
│
│    Your database will be deleted on 7/24/2025, 2:25:41 AM if not claimed.
```

Use a URL gerada como `POSTGRES_DATABASE_URL` no `configurations/envs/.env.dev`. Mais detalhes em [Prisma — Postgres Create DB](https://www.prisma.io/docs/postgres/npx-create-db).

> Como alternativa, você pode subir um Postgres local (ex.: via Docker) e apontar `POSTGRES_DATABASE_URL` para ele.

Com o banco disponível, execute as migrations e o seed:

```bash
npm run migration:deploy:dev
```

Esse script roda em sequência:

- `migration:deploy:dev:migrate` — aplica as migrations Prisma
- `migration:deploy:dev:seed` — popula o banco com o seed
- `migration:deploy:dev:generate` — regenera o Prisma Client

### 3º passo — Iniciar a aplicação

```bash
npm run start:dev
```

- API: <http://localhost:3000>
- Documentação Swagger: <http://localhost:3000/docs>

A documentação Swagger lista todos os endpoints, schemas de input/output e os esquemas de autenticação (`bearer` para os endpoints protegidos).

## Inicialização em produção

Em produção tudo roda em containers via `docker` + `docker-compose`. Após preparar o `configurations/envs/.env.prod`, execute na raiz do projeto:

```bash
docker compose --env-file configurations/envs/.env.prod up --build -d
```

O `docker-compose.yml` orquestra os seguintes serviços, na ordem correta:

1. **postgres** — banco com healthcheck
2. **redis** — cache configurado com persistência (RDB + AOF)
3. **migration** — roda `npm run migration:deploy:prod` e finaliza
4. **seed** — depende de `migration` e roda `npm run migration:seed:prod`
5. **app** — sobe a API com `pm2-runtime` (porta `3000`)

Ao final:

- API: <http://localhost:3000>
- Documentação Swagger: <http://localhost:3000/docs>

## Documentação da API

A documentação OpenAPI é gerada a partir dos DTOs e dos retornos dos controllers e exposta em `/docs`.

Recursos disponíveis:

- `POST /auth` — autenticação e emissão do JWT
- `POST /auth/regsiter` — criaçãoo de usuário a partir de um usuário existente (Bearer)
- `PUT /auth/password` — atualização de senha (Bearer)
- `POST/GET/PUT/DELETE /farm/owner` — gestão de produtores (Bearer)
- `POST/GET/PUT/DELETE /farm/property` — gestão de propriedades (Bearer)
- `POST/GET/PUT/DELETE /farm/harvest` — gestão de safras (Bearer)
- `POST/GET/PUT/DELETE /farm/crops` — gestão de culturas (Bearer)

Os endpoints `GET /farm/{owner|property|harvest}/:id/relations` retornam contagens agregadas das entidades relacionadas.

## TODO / Roadmap

- [ ] Paginação nos endpoints de busca
- [ ] Buscas dinâmicas por parâmetros (`city`, `state`, `area`, etc.)
- [ ] Testes unitários
- [ ] Observabilidade externa via Prometheus/Grafana
