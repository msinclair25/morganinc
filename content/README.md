# Content vault (source of truth)

Markdown here is the **canonical content** for morganinc.cc.
Obsidian can open this folder (or the repo root) as a vault.

## Layout

```
content/
  about.md           # About page body + site meta
  contact.md         # Public contact channels
  projects/          # One note per project (Work grid)
  _templates/        # Obsidian templates
```

## Frontmatter conventions

### `about.md`
```yaml
---
title: About
headline: Infrastructure · AI · DevOps · Cloud Engineering
tagline: One-line positioning under the name
updated: 2026-07-12
---
```

### `contact.md`
```yaml
---
github: https://github.com/msinclair25
email: you@example.com          # optional until set
linkedin: https://linkedin.com/in/...
x: https://x.com/...
---
```

### `projects/*.md`
```yaml
---
title: Project name
status: shipped | wip | archived
featured: true
order: 1
stack: [Workers, TypeScript, ...]
links:
  live: https://...
  repo: https://github.com/...
  case:                          # optional deeper write-up path
summary: One or two sentences for the card.
---
```

Body (below frontmatter) is optional longer case-study text for later.

## Rendering (planned)

1. **v1 (now):** site reads a small generated JSON from these files, or we sync manually into static HTML.
2. **Next:** build step (`npm run content`) parses `content/**/*.md` → `public/data/site.json`.
3. **Later:** Worker can serve MD at request time if we want zero build step.

Prefer **structured frontmatter + one file per project** so Obsidian stays pleasant and the site stays deterministic.
