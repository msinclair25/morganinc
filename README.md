# morganinc.cc

Portfolio website for **Morgan Sinclair**.

- **Domain:** [morganinc.cc](https://morganinc.cc) · [www.morganinc.cc](https://www.morganinc.cc)
- **Hosting:** Cloudflare Workers (static assets via Wrangler)
- **Content:** Obsidian vault in this repo (source of truth as the site grows)

## Develop

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Custom domains `morganinc.cc` and `www.morganinc.cc` are declared in `wrangler.jsonc` and provisioned on deploy.

## Content (Obsidian)

Canonical copy lives under `content/`:

| Path | Purpose |
|------|---------|
| `content/about.md` | Headline, tagline, About body |
| `content/contact.md` | Email, GitHub, LinkedIn, X |
| `content/projects/*.md` | Work cards (frontmatter + optional body) |
| `content/_templates/` | Obsidian project template |

```bash
npm run content   # → public/data/site.json
npm run dev       # content build + local preview
npm run deploy    # content build + Cloudflare deploy
```

## Structure

| Path | Purpose |
|------|---------|
| `content/` | Vault-friendly markdown (source of truth) |
| `public/` | Static site assets served by the Worker |
| `scripts/build-content.mjs` | MD → `public/data/site.json` |
| `wrangler.jsonc` | Worker name, assets, observability, custom domains |
