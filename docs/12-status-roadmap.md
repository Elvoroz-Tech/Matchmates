# Status and roadmap

## Done
- Full poll lifecycle (create, vote, sealed results, delete, expiry, opt-out)
- Card engine with 4 designs, 3 animations, 3 card kinds, 2 sizes
- PNG / GIF / video export, native share, link share sheet
- Rate limiting, security headers, hashing, honeypot, origin checks
- Public pages, SEO files and generator, GA4 + Search Console wiring
- Docs and changelog

## Not verified yet (do before launch)
- A full `npm install && npm run build` and device testing (the project was authored in an offline sandbox)
- Real-device checks: iOS Safari video export, Instagram/Snapchat share sheets
- Legal review of Privacy/Terms

## Future scope
- QR code on cards; more designs (Diwali, Valentine's, Eid); sticker packs
- Poll closing time chosen by creator; "reveal at moonrise" scheduled results
- Reactions / anonymous comments; subject can see the verdict card
- Optional Turnstile CAPTCHA; admin dashboard for opt-outs
- i18n (Hindi, Hinglish toggle); PWA offline shell
- Cloudinary/Twilio only if uploads or OTP features are ever added
