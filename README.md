# Simple shortlink generator using HTMX, Bun and Elysia

## Getting Started

## Development

### Server

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

### Tailwindcss

Continuously build the tailwind config using the cli:

```bash
bunx tailwindcss -i ./src/input.css ./public/output.css --watch
```

## Deploying on Railway

You can deploy this on Railway. A docker container is the easiest way to deploy this code. Check out the dockerfile.
