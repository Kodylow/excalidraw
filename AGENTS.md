# Base44 Dev Environment

- Run with `docker compose -f docker-compose.base44.yml up -d` (port 3000).
- Uses `node:24` base image with source bind-mounted; Vite dev server with HMR.
- `BROWSER=echo` env var prevents Vite's `open: true` from crashing (no `xdg-open` in container).
- Yarn workspace monorepo — `yarn install` at root, then `vite` from `excalidraw-app/`.
- No external secrets required to boot; collaboration/AI/backend use public endpoints or optional services.
- Healthcheck: `node -e "fetch('http://localhost:3000')..."`.

# Guidelines

- For new DOM/browser API usage, use `app.ownerDocument` and `app.ownerWindow` instead of globals; without `app`, derive them from the mounted node's `ownerDocument` and its `defaultView`.
- When overriding properties of an existing type, prefer `Merge<Base, Overrides>` from `@excalidraw/common/utility-types` over `Omit<Base, keyof Overrides> & Overrides`.
