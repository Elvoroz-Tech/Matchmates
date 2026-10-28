# SEO and analytics

## Files (in `public/`)
`robots.txt` and `sitemap.xml` are committed with the placeholder `https://YOUR-DOMAIN.com`. `npm run build` (prebuild) rewrites both from `NEXT_PUBLIC_SITE_URL`, so setting that variable is all you need. You can also run `npm run seo`.

Other SEO: per-page metadata + canonical, Open Graph and Twitter images (`opengraph-image.tsx`), `manifest.webmanifest`, `icon.svg`, `apple-icon`, noindex on poll pages.

## Search Console
Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the `content` value of the verification meta tag. Then submit `https://yourdomain.com/sitemap.xml`.

## Google Analytics 4
Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`. A consent banner appears; GA loads only after "Accept". Poll content is never sent. The CSP already allows Google's domains.
