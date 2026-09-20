# Engineering notes

## Architecture

Headliners is a static campaign experience. The architecture therefore stays deliberately small:

1. **HTML owns meaning and content.**
2. **Tailwind owns the general utility layer and reset.**
3. **`site.css` owns product-specific visual rules and design tokens.**
4. **`app.mjs` owns progressive interaction only.**
5. **Pure interaction helpers are exported and unit-tested without a DOM dependency.**

A framework would add lifecycle, bundling, and dependency cost without solving a problem the current scope has.

## Accessibility

The UI uses native elements first: anchors for navigation, buttons for actions, `details/summary` for disclosure, `time` for schedule data, and a real form for the newsletter demo.

Additional behavior includes:

- skip link
- one descriptive `h1`
- explicit control labels
- `aria-expanded` on mobile navigation
- `aria-live` feedback for the form
- Escape-key menu recovery
- visible `:focus-visible` treatment
- reduced-motion support
- decorative artist imagery with empty alt text while artist names remain real text

Automated checks are useful but cannot prove complete accessibility; manual keyboard and screen-reader review remains part of a real release process.

## Theme behavior

The site uses the OS theme when no explicit preference exists. Once the visitor toggles the theme, the preference is stored in `localStorage`. Storage access is wrapped in `try/catch` so privacy modes or blocked storage do not break the interface.

## Performance decisions

- no runtime package dependencies
- no icon font or icon JavaScript
- system font stack instead of a render-blocking remote font
- explicit image dimensions to reduce cumulative layout shift
- artist images use native lazy loading and async decoding
- JavaScript is loaded as an ES module
- large media files are never imported into JavaScript

The legacy source photographs are intentionally preserved for the portfolio visual. In a commercial release, the next asset step would be an automated responsive AVIF/WebP pipeline with measured LCP budgets.

## Testing strategy

`node:test` covers deterministic helpers such as theme resolution and email validation. The repository quality script checks structural invariants that commonly regress in static projects: metadata, heading count, anchor targets, image attributes, local file references, duplicate IDs, placeholder content, tracked `node_modules`, and OS artifacts.

CI additionally proves that Tailwind can compile the current source from a locked install.

## Scope honesty

The event, artists, tickets, and newsletter are fictional. The site deliberately does not pretend to have a backend, checkout, database, or subscription service. That keeps the demo honest and makes the code proportionate to the actual product surface.
