# Music Maestro

Music Maestro is an independent browser-based practice resource for Australian piano students working around AMEB Grades 1–3. It provides short theory, aural and general-knowledge activities that fit between lessons.

[Open Music Maestro](https://music.vensoai.com/landing?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-primary) · [Parent guide](https://music.vensoai.com/parents?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-parents) · [View the coverage and limits](https://music.vensoai.com/syllabus?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-coverage) · [Teacher resources](https://music.vensoai.com/teachers?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-teachers)

## Product scope

- Grade 1 interactive practice is free without an account.
- Grade 2–3 access is an optional AUD 14.99 one-time purchase, not a subscription.
- Thirteen practice activities cover note reading, scales, key signatures, note values, intervals, chords, rhythm, terms, aural work, form, daily review, lessons and mixed review.
- Explanations follow practice answers, and progress remains available on the learner's device.
- English, Chinese and Spanish interfaces are available.

Music Maestro is a supplementary practice tool. It is not an official examination paper, does not predict an exam result, and is not affiliated with or endorsed by AMEB. Students should confirm their current pathway and requirements with their teacher and the current official syllabus.

## Free resources

- [Grade 1 theory practice guide](https://music.vensoai.com/ameb-grade-1-theory-practice?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-grade1)
- [Grade 1 note-values and rhythm practice](https://music.vensoai.com/ameb-grade-1-note-values-practice?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-note-values)
- [Grade 2 dotted notes and 6/8 practice](https://music.vensoai.com/ameb-grade-2-dotted-notes-practice?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-grade2-dotted)
- [Grade 2 readiness diagnostic](https://music.vensoai.com/ameb-grade-2-piano-theory-practice?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-grade2)
- [Piano general-knowledge questions](https://music.vensoai.com/ameb-piano-general-knowledge-questions?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-general-knowledge)
- [Weekly practice checklist](https://music.vensoai.com/ameb-practice-checklist?utm_source=github&utm_medium=repository&utm_campaign=owned-repo&utm_content=readme-checklist)
- [Printable three-piece preparation sheet](https://music.vensoai.com/downloads/ameb-piano-general-knowledge-practice-sheet.pdf)

## Technology

The product uses plain HTML, CSS and JavaScript with Cloudflare Pages, Functions and D1. Stripe handles the one-time checkout. Musical notation and audio use abcjs, Tone.js and Salamander Grand Piano samples where appropriate.

The repository intentionally has no client-side framework or required build step.

## Local development

Serve the repository root with any static web server:

```bash
npx serve .
```

Cloudflare Functions and D1 routes require Wrangler for local integration testing:

```bash
npx wrangler pages dev .
```

Do not commit `.dev.vars`, account secrets, contact lists or operational outreach records.

## Primary audience

Music Maestro is designed for adult parents, piano teachers and music schools supporting Grade 1–3 students. Community participation and teacher outreach should be transparent, limited and useful without requiring a purchase.

## Licence and attribution

No AMEB authority or endorsement is expressed or implied. Consult the repository history and third-party library licences before redistributing source or bundled assets.
