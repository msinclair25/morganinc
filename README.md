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

## Structure

| Path | Purpose |
|------|---------|
| `public/` | Static site assets served by the Worker |
| `wrangler.jsonc` | Worker name, assets, observability, custom domains |
| `.obsidian/` | Local Obsidian vault config (not all files committed) |
