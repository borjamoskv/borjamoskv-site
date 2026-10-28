# borjamoskv-site

Portfolio, essays, music, and interactive web projects for Borja Moskv. The site uses Astro with React and MDX, and is configured for server rendering with the Cloudflare adapter.

## Getting started

Use Node.js 22.12 or later and npm 9.6.5 or later, as required by the installed Astro version. The root package manifest currently lists Node.js 20 or later. Clone the repository, install the locked dependencies, and start the development server:

```bash
git clone https://github.com/borjamoskv/borjamoskv-site.git
cd borjamoskv-site
npm ci
npm run dev
```

Open the local address printed by Astro. Some API routes depend on Cloudflare bindings or external services and may need additional configuration to work locally. The bindings are defined in `wrangler.json`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Astro development server. |
| `npm run check` | Run Astro's type and content diagnostics. |
| `npm run build` | Build the site into `dist/`. |
| `npm run preview` | Preview the built site locally. |

## Project layout

- `src/pages/`: pages and API endpoints.
- `src/components/`, `src/layouts/`, and `src/styles/`: presentation components, layouts, and styles.
- `src/lib/` and `src/data/`: supporting code and data.
- `public/`: static assets.
- `astro.config.mjs` and `wrangler.json`: Astro and Cloudflare configuration.

See [SECURITY.md](SECURITY.md) for security reporting and [LICENSE](LICENSE) for licensing terms.
