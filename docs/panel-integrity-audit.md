# Panel & Link Integrity Audit

**Date:** 2026-07-17  
**Scope:** Admin CMS, public Timeline, teacher dashboard, internal routes.

## Critical fix: Timeline not updating from Admin

| Cause | Effect | Fix |
|--------|--------|-----|
| Public `Timeline` defaulted to **2026-2027 static draft** | Admin `cms_timeline` writes never appeared | Default tab = **live/CMS** |
| CMS items filtered by title keywords (akademi, eğitim, …) | Many saved steps hidden | Filter removed; full CMS list used |
| `updateDoc` with `undefined` fields / raw `id` | Silent Firestore failures possible | `sanitizeFirestoreData` on CMS writes |
| No operator feedback on failure | “Nothing happens” feel | try/catch + toast in `useCmsStore` |

**Operator path now:** Admin → `#/admin?tab=CONTENT&cms=TIMELINE` → edit → Home → **Güncel Takvim**.

## Internal routes (HashRouter)

| From | To | Status |
|------|-----|--------|
| Navbar dashboard | `/admin` `/jury` `/dashboard` | OK |
| Award CTA | `#/award-participation/team/:id` | Fixed to `location.hash` |
| Admin simulate teacher | `/dashboard` | OK |
| CMS sub-tabs | `?tab=CONTENT&cms=TIMELINE` | Deep-link added |
| Footer / Home CTAs | about, academy, faq, finals, apply, sinema, city-guide | OK (React Router `Link`) |
| Templates | assets.reflectandshoot.com PDFs | External OK |

## Panel smoke matrix (manual / production)

| Panel | Action | Expected |
|--------|--------|----------|
| CMS Timeline | Add/edit/delete | Toast success; live tab on home updates after listener |
| CMS FAQ / Academy / Gallery | Same | Toast; public pages reflect |
| System settings | Save dates + video flag | Teacher deadline follows AND logic |
| Teacher dashboard tabs | `?tab=VIDEO` etc. | Deep-link works |
| Teacher create team | Gate + min 3 max 5 | Blocked when season locked |
| Admin teams → simulate | Opens teacher shell | Banner + return to admin |
| Award form | Winner modal → form | Hash route loads protected form |

## Remaining watch items (non-blocking)

- Home visual snapshots may change (timeline default season tab content).
- CMS still client-side auth only (rules allow admin write) — no separate server CMS API.
- Prize docs use `setDoc` with id; other collections use auto-id `addDoc`.
- `About` rules text: max students = 5 (aligned).

## Dashboard score (post polish)

Target **~92–95**: shell extracted, domain pure, CMS timeline wired, tab import cleanup, progress breakdown, season-aware cert copy, expanded unit tests.
