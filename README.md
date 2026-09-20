# 🎵 Headliners

An accessible, responsive **festival campaign experience** built with semantic HTML, Tailwind CSS, and progressive vanilla JavaScript.

**Live demo:** https://mykoladotsenko.github.io/Headliners-artists-tailwind/src/

> Headliners is a fictional festival concept and an engineering case study. It does not sell tickets, process payments, or collect newsletter data.

## Why this project exists

The original repository started as a Tailwind learning exercise. The current version treats the same idea as a small production-minded frontend: clear conversion paths, semantic navigation, robust interaction states, keyboard support, reduced-motion handling, repository hygiene, and automated quality gates.

## Product experience

- responsive festival hero and navigation
- horizontally scrollable artist discovery with explicit controls
- concise schedule cards optimized for scanning
- transparent ticket comparison without fake checkout
- native `<details>` FAQ interaction
- privacy-safe newsletter demo that sends and stores nothing
- persistent light/dark preference with system-theme fallback
- mobile navigation with Escape-key recovery and accurate ARIA state

## Engineering highlights

- semantic HTML landmarks and heading hierarchy
- no framework and no runtime dependency surface
- progressive vanilla JavaScript split from markup
- deterministic pure functions covered with Node's built-in test runner
- lazy-loaded artist media with explicit dimensions to reduce layout shift
- visible focus treatment and keyboard-accessible controls
- `prefers-reduced-motion` support
- no inline event handlers or placeholder UI
- CI with locked installs, unit tests, source audit, Tailwind build verification, and npm audit
- repository hygiene: generated dependencies, OS files, and vendored icon libraries are excluded

## Stack

- HTML5
- Tailwind CSS 3.4
- authored CSS for product-specific components and design tokens
- JavaScript ES modules
- Node.js 20+ for tooling and tests
- GitHub Actions

## Local development

```bash
npm ci
npm run check
npm run dev:css
```

Open `src/index.html` with a static file server while the Tailwind watcher is running.

## Quality commands

| Command | Purpose |
| --- | --- |
| `npm test` | Runs deterministic unit tests with `node:test`. |
| `npm run quality` | Checks semantic/document invariants and Git hygiene. |
| `npm run build:verify` | Confirms Tailwind can compile the current source. |
| `npm run check` | Runs the complete local quality gate. |
| `npm run build:css` | Rebuilds the committed Tailwind stylesheet. |

## Structure

```text
.
├── .github/workflows/quality.yml
├── docs/ENGINEERING_NOTES.md
├── scripts/quality.mjs
├── src/
│   ├── app.mjs
│   ├── assets/
│   ├── index.html
│   ├── input.css
│   ├── output.css
│   └── site.css
├── tests/app.test.mjs
├── package.json
└── tailwind.config.js
```

## Design constraints

This remains intentionally small. There is no SPA router, state library, backend, analytics SDK, form service, or payment integration because none is required by the product scope. The goal is to demonstrate proportionate engineering: the simplest architecture that still handles accessibility, interaction state, failure-resistant preferences, responsive behavior, and maintainability well.

More detail: [Engineering notes](./docs/ENGINEERING_NOTES.md).
