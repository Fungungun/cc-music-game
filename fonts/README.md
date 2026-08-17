# Self-hosted fonts

Added Phase 1.3 (2026-08-17). `.ops/design-system.md` mandates Lora for display headings and
DM Sans for interface/body copy, but no font was actually loaded anywhere in the app before
this — `style.css` silently fell back to system fonts, and `privacy.html` disclosed a Google
Fonts / Nunito dependency that didn't exist (corrected in the Phase 1.2 commit).

| File | Family | Source | Licence |
|---|---|---|---|
| `dm-sans-latin.woff2` | DM Sans (variable, weights 400–800) | fonts.google.com/specimen/DM+Sans | SIL Open Font License 1.1 |
| `lora-latin.woff2` | Lora (variable, weights 500–700) | fonts.google.com/specimen/Lora | SIL Open Font License 1.1 |

Both are Google Fonts, both OFL-licensed (free to self-host, modify, and redistribute — no
attribution required by the licence, though Google's own branding guidance asks that a font not
be renamed if redistributed unmodified, which these aren't). Latin subset only: neither family
ships CJK glyphs, so Chinese content (`mm-lang=zh`) already falls back to the system CJK font
regardless of what Latin webfont is loaded — a CJK-inclusive font file would add real weight for
zero visual benefit. The Latin subset covers Spanish diacritics (á é í ó ú ñ ü — all in the
`U+0000–00FF` range) so `mm-lang=es` is fully covered.

Each file is a single variable font (one file spans the whole weight range Google's CSS API
would otherwise have split across several static per-weight files) — downloaded directly from
`fonts.gstatic.com`, the same files `fonts.googleapis.com`'s CSS would have pointed a browser at,
just served same-origin instead.

## Updating / adding a weight or family

1. `curl -A "<a recent desktop Chrome UA>" "https://fonts.googleapis.com/css2?family=<Family>:wght@<weights>&display=swap" -o /tmp/fonts.css`
2. Take only the `/* latin */` blocks (skip `/* latin-ext */`, `/* cyrillic */`, etc.).
3. `curl -sf "<gstatic woff2 url>" -o fonts/<name>.woff2`
4. Add/update the `@font-face` rule in `style.css` and this table.
