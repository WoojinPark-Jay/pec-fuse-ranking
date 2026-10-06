# PEC-Fuse interactive tutorial

This directory contains the public, browser-only companion tutorial for the PEC-Fuse manuscript and artifact.

```bash
pnpm install
pnpm dev
```

The production build is static and deploys to GitHub Pages through `.github/workflows/pages.yml`.

```bash
pnpm build
```

All displayed user, query, candidate, feature, and score examples are synthetic. The tutorial does not load private operational rows, fitted private models, or credentials.
