# KenZ

Insider scrapbook for Dubai — built with Next.js.

## Local development

```bash
cd kenz-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to GitHub Pages (gokenz.com)

This repo is configured for **static export** and automated deployment via GitHub Actions.

### One-time GitHub setup

1. Go to **github.com/mavika2003/kenz** → **Settings** → **Pages**
2. Set **Source** to **GitHub Actions**
3. Under **Custom domain**, enter `gokenz.com` and save
4. After DNS propagates, enable **Enforce HTTPS**

### DNS (at your domain registrar)

**A records** for `@`:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**CNAME record**:

- Host: `www`
- Target: `mavika2003.github.io`

### Deploy

Push to `main` — GitHub Actions builds `kenz-web/` and publishes the `out/` folder:

```bash
git add .
git commit -m "Your message"
git push origin main
```

Watch progress under the **Actions** tab.

## Project structure

```
kenz-web/          Next.js app (source)
  src/             Components and pages
  public/          Static assets + CNAME
  out/             Generated static site (gitignored)
.github/workflows/ GitHub Pages deploy workflow
```
