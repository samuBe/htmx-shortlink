FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY src src
COPY public public
COPY tsconfig.json .
COPY tailwind.config.js .
# COPY public public
RUN bun install tailwindcss
RUN bunx tailwindcss -i src/input.css -o public/output.css --minify
RUN cat public/output.css

ENV NODE_ENV production
CMD ["bun", "src/index.tsx"]

EXPOSE 3000