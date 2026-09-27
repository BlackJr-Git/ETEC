# Agent Notes — Entre Terre et Ciel

## Project Context

Site for ETEC asbl, a necropolis / funeral services organization in Kinshasa and Lubumbashi, Democratic Republic of Congo. The public site collects requests (demandes), contact messages, and reservations. The admin area manages these records.

## Stack

- Next.js via Vinext (Vite-based React Server Components)
- Cloudflare Workers + D1 (SQLite) runtime
- Tailwind CSS v4
- shadcn/ui React components
- Drizzle ORM + drizzle-kit
- Better Auth for admin authentication

## Commands

```bash
# install dependencies
npx pnpm install

# typecheck
npx pnpm exec tsc --noEmit

# lint
npx pnpm lint

# build
npx pnpm build

# dev server
npx pnpm dev

# generate migrations after schema changes
npx pnpm db:generate
```

## D1 Migrations

Migrations live in `drizzle/`. To apply locally (for testing):

```bash
npx pnpm build
mkdir -p dist/server/migrations
cp drizzle/*.sql dist/server/migrations/
npx pnpm exec wrangler d1 migrations apply DB --config dist/server/wrangler.json --local --persist-to .wrangler/state
```

## Admin Authentication

Better Auth is configured in `lib/auth.ts` using the D1 Drizzle adapter. Admin routes are under `/admin` and protected by session in `app/admin/layout.tsx`. The first admin account can be created from `/login` by switching to "Créer un compte administrateur". In production, set `BETTER_AUTH_SECRET` in Cloudflare environment variables.

## Design Context

- **Users**: administrative staff working at a desk, mostly desktop.
- **Tone**: efficient, professional, calm, discreet.
- **Aesthetic**: continuity with the public site — cream (`--cream`), deep green (`--ink`), muted gold (`--gold`), Georgia for headings, sans-serif for body.
- Avoid generic dashboard clichés: no neon gradients, no glassmorphism, no heavy shadows, no big-number metric cards. Prefer crisp spacing, clear hierarchy, and refined restraint.
