## What changed

Jira: ELAP-

## Security checklist

- [ ] No secrets, keys or tokens in code, config or logs (`API_FOOTBALL_KEY` stays in `.env.local` / hosting secrets)
- [ ] New dependencies are needed, maintained, and pass dependency review
- [ ] User input (query params, route params, JSON files) is validated
- [ ] No unlicensed streams or links to them
- [ ] CI, CodeQL and secret scan are green
