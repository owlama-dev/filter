# Build context is the repo root (the worker reuses the pure scoring code in src/lib/alpha).
FROM node:22-slim
WORKDIR /app
COPY worker/package.json worker/package-lock.json* ./worker/
RUN cd worker && npm install --omit=dev
COPY worker ./worker
COPY src/lib/alpha ./src/lib/alpha
WORKDIR /app/worker
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://localhost:'+(process.env.PORT||8081)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--import", "tsx", "src/index.ts"]
