# Features

| Feature | Where |
|---|---|
| Landing page with live animated card hero, countdown, marquee, bento, privacy shield | `app/page.tsx`, `HeroCard`, `Countdown`, `PrivacyShield` |
| 3-step create wizard (vibe, friend, contenders, own vote, 18+ confirmation) | `CreateWizard.tsx` |
| Sealed voting with confirm sheet and unsealing animation | `QuizClient.tsx` |
| Results with animated bars, count-up, crown, squad verdict, who-voted-whom | `QuizClient.tsx`, `lib/verdict.ts` |
| Card Studio: 3 card types (Invite, Results, My pick), 4 designs, 3 animations, 2 sizes | `CardStudio.tsx`, `lib/card/*` |
| Exports: PNG, animated GIF, video (MP4/WebM) | `lib/card/export.ts` |
| Native file share to Stories/chats, link share sheet (WhatsApp, Telegram, X, Facebook, Reddit, SMS, Email, Copy) | `CardStudio`, `ShareSheet` |
| Dynamic link preview image per poll (no votes revealed) | `app/q/[id]/opengraph-image.tsx` |
| Delete poll (creator), opt-out requests | `QuizClient`, `OptOutForm`, `/api/optout` |
| Local "Your polls" list | `MyPolls.tsx` |
| Consent-gated Google Analytics, Search Console verification | `Analytics.tsx`, `layout.tsx` |
| Public pages: How it works, Rules, Privacy, Terms, Opt out, Contact | `app/*/page.tsx` |
| Toasts, reduced-motion support, skip link, focus styles | `Toast.tsx`, `globals.css` |
