# EAS environment setup (Ciudadano)

## Tenant profiles

| Profile | API base | Tenant slug | Mobile API key source |
|---------|----------|-------------|------------------------|
| `production-geyser` | `https://geyser.ssi-api.xyz` | `geyser` | AWS Secrets Manager `ssi/tenant/geyser/runtime` → `apiKeyMobile` |
| `production-avaldao` | `https://avaldao.ssi-api.xyz` | `avaldao` | AWS SM `ssi/tenant/avaldao/runtime` → `apiKeyMobile` |
| `production-ssi-api` | `https://api.ssi-api.xyz` | (default) | shared / legacy mobile key |

## Critical: `production-geyser` must inject Geyser `apiKeyMobile`

The Expo **production** Environment on project `ssi-citizen-app` historically held the
legacy `api.ssi-api.xyz` mobile key. Profile `env` in `eas.json` overrides
`EXPO_PUBLIC_API_BASE_URL` / `EXPO_PUBLIC_TENANT_SLUG` for Geyser, but **does not**
commit `EXPO_PUBLIC_API_KEY` (never put secrets in git).

For future EAS builds with `--profile production-geyser`:

1. Prefer setting a **profile-scoped** or **environment-scoped** secret
   `EXPO_PUBLIC_API_KEY` to Geyser `apiKeyMobile` from Secrets Manager
   (`ssi/tenant/geyser/runtime`, region `us-east-1`).
2. Or pass `--env EXPO_PUBLIC_API_KEY=...` at build time from CI that reads SM.
3. Do **not** reuse the EAS production env key that was issued for `api.ssi-api.xyz`
   — that key returns **401** on `https://geyser.ssi-api.xyz/issuerAgent/did`.

Local release APKs bake keys from the developer `.env` (gitignored) via `app.config.js`
→ `extra.publicEnv`.

## Verification

```bash
curl -sS -o /dev/null -w "%{http_code}\n" -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $EXPO_PUBLIC_API_KEY" \
  -d '{}' \
  https://geyser.ssi-api.xyz/issuerAgent/did
# expect 201
```
