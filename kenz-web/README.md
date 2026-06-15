# KenZ Web

Next.js frontend for KenZ — Dubai insider scrapbook with an editorial layout inspired by premium real-estate landing pages, keeping the scrapbook theme in orange, white, and black.

## Run locally

```bash
cd kenz-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/` — App Router pages and global styles
- `src/components/` — Nav, Hero, Flipbook, Chapters grid, CTA, Footer
- `src/data/chapters.ts` — Scrapbook chapter content
- `public/scrapbook/` — Flipbook page images (extracted from `mvp.html`)

## Design

- **Hero** — Large Playfair headline, organic blob-framed scrapbook cover
- **Chapters** — Pigma-style 4-column checkerboard grid (stat cards + visual cards)
- **Flipbook** — Interactive page viewer with fullscreen mode
- **Colors** — Orange `#FF6A00`, white, black `#141210`, paper `#FBF3E4`
