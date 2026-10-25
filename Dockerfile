FROM oven/bun AS css

WORKDIR /app

COPY package.json .
COPY bun.lockb .

# Full install so the lockfile-pinned tailwindcss (v3) devDependency is used,
# instead of bunx pulling the latest tailwindcss, which no longer ships a CLI
RUN bun install --frozen-lockfile

COPY src src
COPY public public
COPY tailwind.config.js .
RUN bun run tailwindcss -i src/input.css -o public/output.css --minify

FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production --frozen-lockfile

COPY src src
COPY public public
COPY tsconfig.json .
COPY --from=css /app/public/output.css public/output.css

ENV NODE_ENV=production
CMD ["bun", "src/index.tsx"]

EXPOSE 3000
