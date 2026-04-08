# borjamoskv-site

Personal site and publishing system for Borja Moskv: essays, interactive experiments, portfolio surfaces, and edge-backed utilities in one deployable artifact.

![borjamoskv-site screenshot](docs/screenshots/homepage.png)

## Objective

This repository is the public operating surface for `borjamoskv.com`.

It is not a generic portfolio template. The goal is to ship a site that can hold:

- editorial writing
- interactive front-end systems
- audiovisual experiments
- lightweight edge endpoints for newsletter, telemetry, and chat flows

## Case Study

### Problem

Most portfolio sites flatten everything into the same visual and technical grammar. That breaks down when one site needs to carry essays, generative interactions, embedded experiments, and a strong visual identity without feeling like a template.

### Approach

The project uses a static-first architecture with direct HTML, CSS, and JavaScript entry points, then adds Cloudflare Pages Functions only where edge logic is actually useful.

Key decisions:

- keep the shell static so publishing stays fast and deploys remain cheap
- split the experience into dedicated pages and engines instead of forcing a monolithic SPA
- use custom motion, overlays, and audiovisual scripts to preserve an authored feel
- keep edge functions narrow and optional so the core site still works as a static build

### Result

The result is a portfolio that behaves more like a small publishing platform plus interaction lab than a single landing page.

## Stack

- Static HTML, CSS, and JavaScript
- Cloudflare Pages / Wrangler
- Pages Functions under [`functions/api`](functions/api)
- Optional local preview with a plain static server

## Local Setup

### Static preview

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

### Cloudflare-style preview

```bash
wrangler pages dev .
```

Use this mode when you need the edge functions in [`functions/api`](functions/api).

## Repository Notes

- [`index.html`](index.html) is the main entry point for the public site.
- [`blog.html`](blog.html) and the article pages hold the editorial layer.
- [`js`](js) and top-level `*.js` files contain the interaction engines and visual systems.
- [`output/playwright`](output/playwright) stores QA artifacts used during iteration.

## Status

Active flagship repository.

Public for inspection, collaboration, and reference. See [`LICENSE`](LICENSE) for reuse limits around brand and media assets.
