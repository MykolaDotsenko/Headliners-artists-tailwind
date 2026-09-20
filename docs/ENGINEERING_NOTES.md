# Engineering notes

## Architecture

Headliners is a static campaign experience, so the architecture stays intentionally small:

1. **HTML owns meaning and content.**
2. **`site.css` owns the visual system, responsive layout, and minimal reset.**
3. **`theme-init.js` resolves theme state before first paint.**
4. **`app.mjs` owns progressive interaction only.**
5. **Pure helpers are exported and unit-tested without a DOM dependency.**

A framework would add lifecycle, bundling, hydration, and dependency cost without solving a problem required by this scope. Tailwind was removed after the refactor because the final markup no longer used utility classes; retaining it only for historical reasons would increase complexity without value.

## Accessibility

Native elements come first: anchors for navigation, buttons for actions, `details/summary` for disclosure, `time` for schedule data, and a real form for the newsletter demo.

The interface additionally includes:

- skip link
- one descriptive `h1`
- explicit control labels
- `aria-expanded` / `aria-controls` for mobile navigation
- `aria-live` form feedback
- Escape-key menu recovery with focus restoration
- visible `:focus-visible` treatment
- reduced-motion behavior
- decorative image alt handling while artist names remain real text

axe runs in every Playwright browser project against WCAG 2.x A/AA and WCAG 2.2 AA tags. Automated coverage is not presented as a substitute for manual keyboard and screen-reader review.

## Theme behavior

The OS preference is used when no explicit visitor preference exists. The theme bootstrap runs before CSS is painted to avoid an avoidable light/dark flash.

Once the visitor toggles the theme, the choice is persisted in `localStorage`. Storage reads and writes are guarded so restrictive privacy modes do not break the interface. The browser `theme-color` metadata stays synchronized with the active theme.

## Responsive image pipeline

The original multi-megabyte JPEG assets were converted into compact committed WebP source masters.

`scripts/build-images.mjs` deterministically regenerates production variants:

- AVIF
- WebP
- JPEG fallback
- width-specific variants for hero and artist cards

The generator enforces a maximum file budget and aggregate responsive-media budget, then writes a machine-readable report under `artifacts/`.

Production markup uses `<picture>`, `srcset`, and `sizes`; offscreen artist imagery uses native lazy loading, while the hero LCP candidate is explicitly prioritized.

Generated production variants are committed as deployable static assets so GitHub Pages does not depend on ephemeral CI output.

## Browser testing

Playwright runs the same application through:

- Chromium
- Firefox
- WebKit
- mobile Chromium

Coverage verifies:

- page structure and media loading
- persisted theme behavior
- carousel movement
- privacy-safe newsletter validation
- mobile-navigation state and Escape recovery
- axe accessibility results

Portfolio screenshots are produced by the same browser tooling, making them reproducible evidence rather than manually curated images.

## Performance budgets

`scripts/lighthouse-audit.mjs` runs Lighthouse three times against a local static server and evaluates the representative performance run.

Current gates:

- Performance ≥ 95
- Accessibility = 100
- Best Practices = 100
- SEO = 100
- LCP ≤ 2.5 s
- CLS ≤ 0.10

Reports remain inside CI artifacts rather than being uploaded to a public third-party service.

## Repository quality

`scripts/quality.mjs` verifies structural invariants that are easy to regress in static products:

- metadata and language declaration
- exactly one `h1`
- skip-link target
- no inline event handlers or inline script blocks
- unique IDs
- valid internal anchors
- image alt text and explicit dimensions
- all local `src`, `href`, and `srcset` asset references
- no placeholder copy
- no tracked `node_modules` or `.DS_Store`
- pinned browser/a11y/performance tooling
- no accidental runtime dependency surface

GitHub Actions additionally performs a full `npm audit --audit-level=high`.

## Scope honesty

The event, artists, prices, ticketing, and newsletter are fictional. The product deliberately does not pretend to have a backend, checkout, database, subscription service, or analytics stack.

That boundary is intentional: the repository demonstrates finishing a small frontend to a high standard without manufacturing unnecessary architecture.
