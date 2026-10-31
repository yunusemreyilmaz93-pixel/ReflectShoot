# CLAUDE.md — Reflect & Shoot

Read this file first, then the docs it points to. This is a live product used by real teachers, students (minors) and jury members. Make small, safe, incremental changes. Do not rewrite or redesign unless the owner asks.

## What this is

Short-film competition platform. React 18 + TypeScript + Vite (SPA, hash routing), Firebase Auth + Firestore, Cloudflare R2 (documents, logos), Vercel serverless API in `api/`. Language of the product: Turkish.

Layout: `pages/`, `components/`, `context/` (state), `lib/` (+ `lib/domain/` pure rules), `api/` (Vercel functions), `server/` (shared server code), `firestore.rules`, `tests/`, `docs/`, `scripts/ops-oneoffs/` (manual ops).

## Current season rules (2026-27) — enforced in code and rules

- Season id `2027`, label `2026-27`. The 2025-26 season is stored as `2026` and is archived. Untagged legacy applications count as `2026`.
- Only the **Yapay Zeka Animasyon** category and the single theme **Asr ve Beled Sureleri** (one film combining both surahs). Live-action, hadith and sahabe options are retired (enum values stay so archived data renders).
- Teams have **2 to 4** students (`lib/domain/teamValidation.ts` and `firestore.rules` must agree).
- The gala shows only archived 2025-26 AI films. Ceremony, prizes and dates are "to be announced"; the award participation form is closed (`CEREMONY_FORM_OPEN` in `pages/award-form/constants.ts`).
- Films are in English with Turkish subtitles (About page rule; do not change).

## Commands

```bash
npm run lint          # tsc --noEmit + eslint
npm run test:unit     # vitest (tests/unit)
npm run test:rules    # Firestore rules in the emulator (needs Java)
npm run build         # production build (must work with NO secrets set)
npm run test:e2e      # Playwright smoke
npm run test:visual   # Playwright screenshots (reference images are Windows: *-win32.png)
```

Run lint, unit tests, rules tests and build before every push. Rules tests are mandatory for any `firestore.rules` change.

## Hard rules

1. **Never run destructive operations from build, install or deploy hooks.** `npm run build` must succeed without secrets. One-off ops live in `scripts/ops-oneoffs/`, are dry-run by default and need an explicit `--execute`.
2. **No secrets in the repo.** No tokens, passwords or service-account keys, ever. Server secrets come from environment variables (see `.env.example`).
3. **The browser is not trusted.** Anything that grants roles, scores, deletes data, writes audit logs or touches R2 happens in `api/` (server), never directly from the client. Firestore rules deny the rest by default. Applications and users can only be deleted by `api/admin-delete`.
4. **Vercel Hobby plan: at most 12 files in `api/`.** Each file is a serverless function. Extend an existing handler (switch on method or body) instead of adding a file. A test guards this.
5. **Personal data of minors (KVKK).** Do not log, print or paste student names, phones or documents. Public API projections strip personal data (`server/publicShowcase.js`); jury members get a blind view (`server/juryView.js`). Do not widen these.
6. **Keep `firestore.rules` and `lib/domain/*` in sync** (team size, categories, statuses). Update the rules test in the same change.
7. **Do not invent religious text.** Surah text in `data/verses.ts` must come from a verified source (Diyanet). Ask the owner when unsure.
8. **Do not touch the visual identity** (see below) unless the owner asks for a design change.

## Deploy order

1. Merge to `main` (Vercel deploys automatically). Wait until the deployment is Ready.
2. `npx firebase deploy --only firestore:rules,firestore:indexes --project reflectandshoot` (or the `deploy-firestore` GitHub workflow if the secret is set). Rules first would break the old frontend.
3. Season/admin changes (new season, clearing dates) are done from the Admin panel afterwards.

Environment notes: the lockfile is written by npm 11 (`npx npm@11 install ...`); npm 10 cannot `npm ci` it. The owner uses Windows PowerShell: do not give `&&` one-liners, give each command in its own code block.

## Frontend rules (read before touching UI)

The site has a protected identity: `docs/visual-identity-guardrails.md`. Security, bug-fix and accessibility work must be visually invisible. Visual regression references are in `tests/visual/*-win32.png`; if a screenshot changes unexpectedly, fix the code, do not refresh the references.

When a UI change **is** requested, avoid the usual AI-generated-UI mistakes (this list is adapted from Anthropic's `frontend-design` guidance). The current code already overuses many of these, so do not add more:

- No all-caps labels with wide letter-spacing; use sentence case. Do not add small caption labels above headings.
- Do not accent a single word of a headline with a gradient, colour or italic.
- No gradient washes or blurred glow blobs as decoration; no pulsing/bouncing/spinning icons (spinners for real loading are fine).
- Do not chop everything into identical rounded cards with the same radius and shadow; use borders, numbering and dividers only when they carry meaning (numbers only for real sequences).
- Motion only in response to a user action or one deliberate entrance; no fade-and-slide on every section, no hover transition on every card. Respect `prefers-reduced-motion`.
- Do not append arrows to every link or button. CTAs are specific verbs ("Başvuruyu gönder"), the same action keeps the same name everywhere.
- Body text at least 12px (prefer 14px+), line length under about 80 characters, visible keyboard focus, `alt` on every image, sufficient contrast, responsive down to mobile.
- Copy: only words that help people use the page; explain errors and the fix; empty states invite an action.
- Keep class lists readable: extract repeated markup into a small component instead of 300-character class strings.

## Dependency decisions (do not "fix" these blindly)

- **Firebase client stays on 10.x.** Versions 11-13 grow the browser bundle from ~333 KB to ~570 KB (gzip 102 -> 170 KB) and the advisories left in `npm audit` for it are Node-only code that the browser bundle never runs. Re-check the size before upgrading.
- **firebase-admin stays on 13.x** (API backbone, no live integration tests); 14.x only removes a few moderate advisories.
- **Vite 7** (Rollup-based). Vite 8 switches to Rolldown and changes `manualChunks`; Tailwind 4 and React 19 are rewrites that change the look and are design decisions, not maintenance.
- `npm audit` also counts dev-only tooling (ESLint, Playwright, firebase-tools); judge findings by whether the code ships to users or to the API.

## Testing notes

- New API behaviour gets a handler test under `tests/unit` (mock `server/auth.js` and `server/firebaseAdmin.js`; see `tests/unit/admin-delete-api.test.ts`).
- Rules changes get both an allow and a deny case in `tests/firestore.rules.test.ts`.
- Do not skip or delete a failing test to get green.

## Where to look

- `docs/architecture.md`, `docs/security-deployment.md`, `docs/runbook.md`, `docs/smoke-checklist.md`
- `docs/season-2026-27-plan.md` (season plan and open decisions), `docs/code-audit-2026-10.md` (what was fixed and why)
- `scripts/ops-oneoffs/README.md` (manual operations: KVKK clean-up, season clean-up, legacy purge)
