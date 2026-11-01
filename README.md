# ELAP

Football schedule, live scores, lineups and where-to-watch, for web, Android and iPhone.
Arabic (RTL) first; every kickoff time is shown in the viewer's own timezone.

```
apps/web      Next.js website + ELAP's backend API (/api/*)
apps/mobile   Expo (React Native) app for Android and iPhone
packages/core Shared types, API client, time/status helpers, Arabic + English text
```

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run web          # website + API on http://localhost:3000
```

With no API key the site serves **sample data** (a yellow banner says so). To show real matches:

1. Get a key at [api-football.com](https://www.api-football.com) (free plan: 100 requests/day for development).
2. Copy `apps/web/.env.example` to `apps/web/.env.local` and set `API_FOOTBALL_KEY`.
3. Restart `npm run web`.

### Mobile app

```bash
cp apps/mobile/.env.example apps/mobile/.env
# set EXPO_PUBLIC_API_URL to your computer's LAN address, e.g. http://192.168.1.20:3000
npm run mobile       # then scan the QR code with Expo Go on your phone
```

Store builds use EAS: `npx eas-cli@latest build -p android` / `-p ios`, then `eas submit`.

## How it works

- Only the backend calls API-Football. Responses are cached in memory (fixtures 10 min, today 1 min,
  live scores 30 s, lineups 5 min), so traffic doesn't increase API usage. See `apps/web/lib/server/service.ts`.
- All times are stored in UTC. The website stores the browser's timezone in a cookie; the app reads the phone's.
- The home screen shows the competitions listed in `apps/web/lib/server/leagues.ts`.
  Set `ELAP_SHOW_ALL_LEAGUES=1` to show everything API-Football returns.

### Localization: language, time and country

- **Language:** Arabic, English and French. Detected from the browser (`Accept-Language`) or the phone's settings;
  viewers can change it (header picker on the web, Settings in the app). Arabic pages read right-to-left.
- **Time:** every kickoff, date and "Last updated" stamp is shown in the viewer's own timezone.
- **Country first:** each viewer sees their own country's competitions first, then international ones, then the rest.
  The country comes from their choice, else the hosting geo header (`x-vercel-ip-country` / `cf-ipcountry`),
  else the browser/phone region. Countries and their competitions are listed in `packages/core/src/countries.ts`.
- **Names:** API-Football returns English names. `apps/web/data/names.json` translates league and team names;
  anything missing stays in English.

### Team pages

`/team/:id` (web) and the team screen (app) show the team's form (last 5), upcoming schedule, recent results and an
update story built from its matches (next match, live match, results). Open one from a match page by tapping a team.

### Channel, commentator and where to watch

Edit `apps/web/data/broadcasts.json` (re-read every minute, no restart needed):

```json
{
  "leagues": { "307": { "watch": [{ "country": "Saudi Arabia", "service": "Official broadcaster", "url": "https://..." }] } },
  "matches": { "1234567": { "channel": "Channel name", "commentator": "Commentator name" } }
}
```

`licensedStreamUrl` on a match shows a video player. Only use it for streams you hold the rights to;
the app stores reject apps that re-stream broadcasts without rights.

## Checks

```bash
npm run typecheck
npm run web:build
```
