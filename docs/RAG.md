# RAG — Local Docs Index

Scrape latest SDK docs into `docs/vectors/` for hallucination-free generation.

```bash
mkdir -p docs/vectors
# Framer Motion
curl -s https://www.framer.com/motion/ | html2text > docs/vectors/framer-motion.md
# Next.js App Router
npx mintlify scrape https://nextjs.org/docs --out docs/vectors/nextjs
# Composio
npx composio docs pull --out docs/vectors/composio
# Shadcn registry
npx shadcn@latest docs pull --out docs/vectors/shadcn
```

Agent rule: when building with third-party SDK, `read docs/vectors/<sdk>.md` first, pass exact API snippet into prompt. Never rely on weight memory.

Indexed: graphify-out/graph.json provides local vector via community detection (286 communities). Query via `graphify query "<question>"`.
