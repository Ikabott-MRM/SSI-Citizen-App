# EAS environment variables (Citizen app)

API keys are **not** stored in `eas.json` or `app.config.js`. Set them in [Expo](https://expo.dev) for project **ssi-citizen-app** (`owner: ikabott`, project id in `app.json`).

```bash
eas login
cd SSI-Citizen-App
```

**Expo project:** [@ikabott/ssi-citizen-app](https://expo.dev/accounts/ikabott/projects/ssi-citizen-app)

## Required variables

| EAS environment | Variable | Value source |
|-----------------|----------|--------------|
| `production` | `EXPO_PUBLIC_API_KEY` | Secrets Manager `ssi/tenant/<slug>/runtime` → `apiKeyMobile` (or Bitwarden BotsManaged) |
| per-tenant envs | `EXPO_PUBLIC_API_KEY` | Same secret for that tenant |
| `production` / tenant | `EXPO_PUBLIC_API_BASE_URL` | Tenant API hostname (non-secret; may also stay in `eas.json` profile `env`) |

Never commit keys. After rotating Identity mobile keys, update **EAS Environment variables** (and Bitwarden) — not git.

### CLI

```bash
eas env:create --name EXPO_PUBLIC_API_KEY --value YOUR_MOBILE_KEY --environment production --visibility secret --type string
# or eas env:update if the variable already exists
```

Or use **Expo → Project → Environment variables** in the dashboard.

## Local development

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_KEY` locally (never commit `.env`).

## Related

- Verifier: [`SSI-Verifier-App/EAS_ENV_SETUP.md`](../SSI-Verifier-App/EAS_ENV_SETUP.md)
- Tenant onboarding: [`docs/tenant-stack-onboarding.md`](../docs/tenant-stack-onboarding.md)
