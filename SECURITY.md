# Security policy

## Reporting a vulnerability

Please report security issues privately through GitHub: **Security → Report a vulnerability** on this repository.
Do not open a public issue. We aim to reply within 3 working days and to fix confirmed high-severity issues within 14 days.

## How ELAP is protected

| Stage | Control | Where |
| --- | --- | --- |
| Plan | Security checklist on every pull request; security work tracked in Jira | `.github/pull_request_template.md` |
| Code | TypeScript strict mode; input validation on every API route; API key only on the server | `apps/web/app/api/*`, `apps/web/lib/server/*` |
| Build | Typecheck, build and production dependency audit fail the pipeline on high/critical issues | `.github/workflows/ci.yml` |
| Test | CodeQL static analysis (security-extended queries) on every push, PR and weekly | `.github/workflows/codeql.yml` |
| Secrets | gitleaks scans full history on every push and PR | `.github/workflows/security.yml` |
| Dependencies | Dependency review blocks new high-severity packages in PRs; Dependabot opens weekly update PRs | `.github/workflows/security.yml`, `.github/dependabot.yml` |
| Deploy | Security headers (CSP, HSTS, frame, referrer, permissions) on every response | `apps/web/next.config.ts` |
| Operate | Read-only public API, cached upstream calls, stale-on-error | `apps/web/lib/server/cache.ts` |

## Repository settings to turn on (GitHub → Settings)

- Branch protection on `main`: require pull requests and passing checks (CI, CodeQL, Security scans).
- Code security: Dependabot alerts, Dependabot security updates, secret scanning and push protection.
- Actions: allow only GitHub-verified and selected actions; default workflow permissions read-only.
