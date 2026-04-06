# Minesweeper Fastify API

A Minesweeper game backend built with [Fastify](https://fastify.dev/) and TypeScript.

## Getting Started

```bash
pnpm install
pnpm run dev
```

Swagger UI: `http://localhost:8080/docs`

OpenAPI JSON: `http://localhost:8080/docs/json`

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start development server with hot reload |
| `pnpm run build` | Compile to CJS with type declarations |
| `pnpm run start` | Run compiled output |
| `pnpm run typecheck` | Type-check without emitting |
| `pnpm run test` | Run tests with Vitest |
| `pnpm run lint` | Lint with Biome |
| `pnpm run format` | Auto-format with Biome |

## TypeScript Configuration Note

`tsconfig.json` includes `"ignoreDeprecations": "6.0"` to silence the `TS5101` deprecation error raised by TypeScript 6.x during CI/DTS builds (e.g. `tsup --dts` on Railway). This suppresses warnings about options that are deprecated as of TypeScript 6 but are still needed for compatibility, without affecting type-checking behaviour.
