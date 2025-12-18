# Dead Pigeons 🐦 (3rd Semester Project)

- [Dead Pigeons](#dead-pigeons)
    - [Environment](#environment)
    - [Authorization](#authorization) 
        - [Anonymous](#anonymous)
        - [Authenticated user](#authenticated-user)
        - [Player only](#player-only)
        - [Admin only](#admin-only)
    - [Configuration](#configuration)
    - [Linting](#linting)
    - [Filtering / sorting / paging](#filtering--sorting--paging)
    - [Testing](#testing)
    - [Limitations](#limitations)

## Prerequisites
- .NET SDK **9.x**
- Node.js
- PostgreSQL
- Fly.io CLI (for deployment)
- Docker (for running PostgreSQL locally and for deployment)
- GitHub account (for CI/CD)
- Fly.io account (for hosting)

## Environment
Full-stack lottery web application with:
- api: ASP.NET Core (.NET 9), EF Core + PostgreSQL
- client: React + TypeScript + Tailwind CSS
- tests: xUnit + Testcontainers + XUnit.DependencyInjection
- CI/CD: GitHub Actions + Docker + Fly.io
- infrastructure: Fly.io + PostgreSQL
- querying: sieve (filter/sort/paging)
- authentication: JWT access tokens
- documentation: Swagger / OpenAPI

## Configuration
### API configuration
Configuration (connection string and Jwt secret) are read from `server/api/appsettings.json`
Swagger enabled in development mode, see Program.cs
Sieve is enabled for selected list endpoints, filter/sort/paging via query parameters

## Client configuration 
VITE_API_URL is stored in .env file.
Build mode (dev/prod) settings
Proxy settings for local development in vite.config.ts

### Testing
## How we test
xUnit tests for service methods:
Happy path + unhappy path
Testcontainers for isolated Postgres persistence
XUnit.DependencyInjection for test setup

### Linting
Client linting is handled with ESLint (TypeScript + React rules). eslint.config.js contains the configuration.
The client uses ESLint (v9 “flat config”) with TypeScript + React rules.

- Config: `client/eslint.config.js`
- Run lint:
    - `npm run lint`
- `dist/` is ignored
- Rules include:
    - `@eslint/js` 
    - `typescript-eslint` 
    - `eslint-plugin-react-hooks` 
    - `eslint-plugin-react-refresh` (Vite)

## Authorization
We use role-based authorization policies.

### Anonymous
(not logged in): no token required
- POST /api/auth/login

### Authenticated user 
(Admin + Player)
- Board: GET /api/board/user/{userId}
- Board price: GET /api/BoardPrice
- Transactions: GET /api/Transaction/user/{userId}
- User: GET /api/user + GET /api/user/me
- Game result: GET /api/games/draw/history

### Player only
- Transactions: POST /api/Transaction/deposit 
- Board: POST /api/board/user/purchase + PUT /api/board/{boardId}/auto-repeat + GET /api/board/purchase/status

### Admin only
- Transactions: PUT /api/Transaction/{id}/status + GET /api/Transaction/pending 
- User: POST /api/user + PATCH /api/user/{id}/activate + PATCH /api/user/{id}/deactivate
- Board: GET /api/board/admin/all

### Limitations
- **No rate limiting / brute-force protection.**
  Login endpoint does not implement throttling, lockout, or captcha, so it’s not hardened against repeated attempts.
- **No email verification / password reset.**
  User registration does not include email verification or password reset flows.
- **No internationalization (i18n).**
  The client does not support multiple languages.

- 

- ** with mobile optimization.**
  The client is specifically optimized for mobile devices.


### Run API
From repo root (adjust paths if yours differ):
```bash
cd server/api
dotnet run
```
### Run Client
```bash
cd client
npm install
npm run dev
```

### Run Tests
```bash
cd server/tests
dotnet test
```






