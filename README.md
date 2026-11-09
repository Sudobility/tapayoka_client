# @sudobility/tapayoka_client

React hooks and a typed HTTP client for the Tapayoka API.

The library wraps every Tapayoka REST endpoint in `TapayokaClient` and exposes
one React hook per feature. The hooks are plain `useState`/`useEffect` state
containers (no TanStack Query or other store) that call the client, track
`isLoading`/`error`, and expose `refresh` plus any mutations. You inject your
own HTTP transport (`NetworkClient` from `@sudobility/types`) and a Firebase ID
token, so the library stays framework- and platform-agnostic (works in web and
React Native).

- Package: `@sudobility/tapayoka_client` (ESM only, published to GitHub Packages)
- License: BUSL-1.1

## Installation

This is a restricted package on the GitHub Packages registry, not npmjs.com.
Scope the `@sudobility` registry and authenticate with a GitHub token that has
`read:packages`:

```
# .npmrc
@sudobility:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_PACKAGES_READ_TOKEN}
```

```bash
bun add @sudobility/tapayoka_client
```

Peer dependencies you must also install:
`@sudobility/tapayoka_types`, `@sudobility/types`,
`@tanstack/react-query` (>=5), and `react` (>=18).

## Usage

Every hook takes `networkClient` and `baseUrl` first, then a `token`
(`FirebaseIdToken`, i.e. a `string | null`), and most take an optional
`{ enabled }` flag that gates the initial fetch. Vendor hooks also take an
`entitySlug`. Return shapes follow `{ <data>, isLoading, error, refresh,
...mutations, clearError }`.

```typescript
import { useVendorDevices, useBuyerOrders } from '@sudobility/tapayoka_client';

// Vendor: devices for one service (entity-scoped, needs a serviceId)
const { devices, isLoading, error, createDevice, refresh, clearError } =
  useVendorDevices(networkClient, baseUrl, entitySlug, token, serviceId);

// Buyer: the signed-in user's orders
const { orders } = useBuyerOrders(networkClient, baseUrl, token);
```

You can also use the client directly without React:

```typescript
import { TapayokaClient } from '@sudobility/tapayoka_client';

const client = new TapayokaClient({ networkClient, baseUrl });
const { data } = await client.getMe(token);
```

## Hooks

Signatures are `(networkClient, baseUrl, [entitySlug], token, [extraArgs], options?)`.

| Hook | Purpose | Scope | Extra args |
|------|---------|-------|------------|
| `useMe` | Current user profile | Auth | — (no entitySlug) |
| `useTos` | Fetch Terms of Service text | Public | — (no token) |
| `useEntities` | Accept TOS / create entity | Auth | — (no entitySlug) |
| `useDeviceSetup` | Signed server-wallet setup payload | Auth | — (no entitySlug) |
| `useBuyerDevices` | Verify a device | Buyer | — (no entitySlug) |
| `useBuyerOrders` | List / create / pay / cancel orders | Buyer | — (no entitySlug) |
| `useBuyerPaymentMethods` | List / add / delete / set-default cards | Buyer | — (no entitySlug) |
| `useAuthorizations` | Create / get payment authorizations | Buyer | — |
| `useOrders` | Entity order list (detailed) | Vendor | — |
| `useAnalytics` | Dashboard stats | Vendor | `{ autoRefreshMs }` option |
| `useQr` | QR code generation | Vendor | — |
| `useVendorLocations` | Location CRUD | Vendor | — |
| `useVendorModels` | Model CRUD | Vendor | — |
| `useVendorOfferings` | Offering CRUD | Vendor | `parentId`, `parentType` |
| `useVendorDevices` | Device CRUD for one service | Vendor | `serviceId` |
| `useVendorAllDevices` | Org-wide device list | Vendor | — |
| `useVendorDeviceSlots` | Device-slot CRUD | Vendor | `deviceWalletAddress` |

Also exported: `TapayokaClient`, `TapayokaApiError`, the `QUERY_KEYS`
constant, the `FirebaseIdToken` type, and helpers `buildUrl`,
`getErrorMessage`, `createAuthHeaders`, `createHeaders`, `handleApiError`.

## Development

```bash
bun install          # install deps (needs GitHub Packages auth, see above)
bun run build        # tsc (tsconfig.build.json) + scripts/fix-esm-imports.mjs -> dist/
bun run build:watch  # incremental tsc
bun run typecheck    # tsc --noEmit
bun run test:unit    # vitest run (one-shot)
bun run test:watch   # vitest watch mode
bun run lint         # eslint src
bun run lint:fix     # eslint src --fix
bun run format       # prettier --write src
bun run clean        # rm -rf dist
```

Note: the build emits bundler-style extensionless ESM imports, so
`scripts/fix-esm-imports.mjs` rewrites them to fully-qualified `.js`
specifiers for Node's native ESM loader. It runs automatically after `build`.

## Related packages

- `@sudobility/tapayoka_types` -- API request/response types (peer dependency)
- `@sudobility/types` -- shared `NetworkClient`/`BaseResponse` types (peer dependency)
- `tapayoka_vendor_app` / `tapayoka_buyer_app_rn` -- consumer apps
