# 🎹 CC's Music Game

A web-based music theory learning game built for CC (Xi), a piano student working towards AMEB Grade 2–3.

## Modules

| Module | What it teaches |
|---|---|
| 🎵 Note Namer | Identify notes on treble and bass clef staves |
| 🎼 Scale Builder | Build major and harmonic minor scales on a piano keyboard |
| 🎶 Interval Quiz | Name musical intervals (Major 3rd, Perfect 5th, etc.) |
| 🎸 Chord Game | Identify triads (root/1st inversion) and cadence types |
| 🥁 Rhythm Tapper | Tap along to rhythm patterns; graded on timing accuracy |
| 📚 Terms Flashcards | All AMEB Grade 1–3 Italian/French music terms with spaced repetition |
| 🔍 Form Detective | Identify Binary/Ternary form, cadence types, and time signatures |

## How to play

Just open `index.html` in a browser. No install or build step needed.

For the best experience on an iPad, use Safari in landscape mode.

## Live site

Deployed at: **https://cc-music-game.pages.dev**

## Deployment

Hosted on Cloudflare Pages. Every push to `main` triggers an automatic deploy.

**One-time setup (already done):**
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Create a project → Connect to Git → select `cc-music-game`
3. Framework preset: None | Build command: _(blank)_ | Output dir: `/`

## Tech stack

- Pure HTML, CSS, and vanilla JavaScript — no build tools, no npm
- [Tone.js](https://tonejs.github.io/) for piano audio (Salamander Grand Piano samples)
- [Tonal.js](https://github.com/tonaljs/tonal) for music theory helpers
- [abcjs](https://www.abcjs.net/) for rendering sheet music notation

## Updating

```bash
git add .
git commit -m "describe your change"
git push
```

Cloudflare Pages will automatically deploy within ~60 seconds.
