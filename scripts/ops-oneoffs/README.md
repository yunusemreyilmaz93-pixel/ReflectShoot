# Ops one-offs (manual only)

ARCHIVED production fixes that must **never** auto-run on Admin mount or appear as dashboard banners.

## Rules

- Do **not** import these from the app UI.
- Run only manually in an emergency with admin credentials.
- Prefer Firestore console / one-shot scripts over permanent UI patches.

## Public legacy certificate purge

`purge-public-legacy-certificates.mjs` removes the retired `certificates/` prefix from the **public** R2 bucket after the application has moved to authenticated/private certificate generation.

Dry-run (default):

```bash
node scripts/ops-oneoffs/purge-public-legacy-certificates.mjs
```

Execute only after reviewing the listed keys:

```bash
CONFIRM_PUBLIC_CERTIFICATE_PURGE=YES node scripts/ops-oneoffs/purge-public-legacy-certificates.mjs --execute
```

The script requires the normal server-side R2 environment variables and refuses destructive execution unless both `--execute` and the explicit confirmation environment variable are present.

## Historical removals from Admin UI

| Id | Notes |
|----|--------|
| `fixed_clear_vision_juries` | Former mount patch |
| `fixed_aaal_team_verse_v2` | Former mount patch |
| `fixed_all_averages_v1` | Former mount patch |
| `mevecho_theme_verse` | Was a dashboard banner (“Mevecho → Asr 1-3”). Removed from `AdminOverview`; fix data via console/script if needed |

```ts
// Historical reference only — not executable from this file
export const ONEOFFS_REMOVED_FROM_ADMIN = [
  'fixed_clear_vision_juries',
  'fixed_aaal_team_verse_v2',
  'fixed_all_averages_v1',
  'mevecho_theme_verse',
] as const;
```

See also: `markWinners.ts` for conscious winner-tagging ops.
