# Renaming the product

1. Edit `NEXT_PUBLIC_APP_NAME` (and optionally tagline) in `.env`.
2. Rebuild/redeploy.

The name flows through `src/lib/config.ts` into navbar, footer, metadata, manifest, OG images, legal pages, share text and the canvas cards. Storage keys use the fixed prefix `vq:` so renaming does not log anyone out. The package name and DB name are deliberately generic.
