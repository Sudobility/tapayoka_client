# tapayoka_client

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or similar **only when the user explicitly
> asks in that turn**. Approval for an earlier change does not carry forward, and finishing a
> task is not permission to commit it. Do not use feature branches — stay on the current branch.

React hooks + a typed HTTP client (`TapayokaClient`) wrapping the Tapayoka REST API.
Package `@sudobility/tapayoka_client`, ESM-only, published to GitHub Packages (restricted).

## Stack
- TypeScript (strict, `target ES2020`, `module ESNext`, `moduleResolution bundler`), React >=18.
- Bun as package manager/runner; Vitest for tests; ESLint (flat config) + Prettier.
- Build is `tsc` only — no bundler.

## Commands (verified)
```bash
bun install          # deps live on GitHub Packages; needs read:packages auth (.npmrc)
bun run build        # tsc -p tsconfig.build.json + node scripts/fix-esm-imports.mjs -> dist/
bun run typecheck    # tsc --noEmit
bun run test:unit    # vitest run    (NOTE: there is NO `bun run test` script)
bun run test:watch   # vitest watch
bun run lint         # eslint src
bun run format       # prettier --write src
```
Typecheck/lint/tests all pass clean on a fresh `bun install`.

## Architecture
- `src/network/TapayokaClient.ts` — one class, one async method per REST endpoint. Each method
  builds a URL via `utils/buildUrl`, attaches headers, calls the injected `NetworkClient`, and
  throws `TapayokaApiError` (via `handleApiError`) on `!ok`. Entity routes go through
  `entityUrl()` -> `/api/v1/entities/{slug}/...`; buyer routes are `/api/v1/buyer/...`.
- `src/hooks/*` — one hook per feature, each a thin `useState`/`useEffect`/`useCallback`
  wrapper that constructs a `TapayokaClient` and exposes `{ <data>, isLoading, error, refresh,
  ...mutations, clearError }`. List hooks auto-fetch on mount via `refresh` in `useEffect`.
- `src/utils/index.ts` — `buildUrl`, header builders, `TapayokaApiError`, `handleApiError`.
- `src/types.ts` — `FirebaseIdToken = string`, and the `QUERY_KEYS` constant.
- `src/index.ts` re-exports network + hooks + utils. Domain types come from the peer dep
  `@sudobility/tapayoka_types`; `NetworkClient`/`BaseResponse` from `@sudobility/types`.

## Conventions
- Hook arg order: `(networkClient, baseUrl, [entitySlug], token, [extraArgs], options?)`.
  Token is `FirebaseIdToken | null`. Vendor hooks take `entitySlug`; buyer/auth hooks do not.
  `options.enabled === false` suppresses the auto-fetch; `useAnalytics` adds `autoRefreshMs`.
- Dependency injection: the library never creates an HTTP client or reads a token itself —
  callers pass both in. Keeps it platform-agnostic (web + React Native).
- Hooks swallow errors into `error` state for reads; several mutations re-`throw` after setting
  `error` so callers can `await`/catch. Check the specific hook before assuming.

## Gotchas
- **No TanStack Query is actually used.** `@tanstack/react-query` is a declared peer dep and the
  package is described as "TanStack Query hooks", but nothing in `src/` imports it — hooks are
  plain React state. Don't assume query caching/invalidation exists.
- **ESM import fixup is mandatory.** `tsc` emits extensionless (`bundler`) specifiers that Node's
  native ESM loader rejects. `scripts/fix-esm-imports.mjs` rewrites them to `.js` after build;
  never ship `dist/` built without it.
- **Two ESLint configs exist.** `eslint.config.js` is the active flat config (ESLint resolves
  `.js` first). `eslint.config.mjs` is stale/unused — edit `eslint.config.js`.
- `.npmrc` points `@sudobility` at `npm.pkg.github.com`; `bun install` fails without a
  `read:packages` token.
