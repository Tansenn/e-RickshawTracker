# E-Rickshaw Tracker (ই-রিকশা ট্র্যাকার)

A demo rickshaw registration + tracking app — Bangladesh flag theme (white / green / red),
Bangla-first UI, login → new rickshaw registration / admin panel (traffic police + control room),
light/dark mode, QR identity, scan-to-fill paper registration.

**This is a demo / concept app — not an official government service.** All data lives in the
browser (`localStorage`). There is no real backend.

## Which file to use

- **`rickshaw-tracker-demo-standalone.html`** — one self-contained file (styles, QR/Smart-Scan
  libraries all inlined). Safe to send to anyone's phone or deploy as-is. **This is the one to
  share with your boss / deploy.**
- **`index.html` + `assets/`** — the editable source (loads Tailwind/QR/scan libraries from CDNs).
  Edit this one, then rebuild the standalone copy with:
  ```
  node .build/build-standalone.js
  ```
- `form-print.html` — a printable blank paper registration form (for the "scan paper form" demo).

## Deploy on GitHub Pages (so the link always works, on any phone)

1. Create a new GitHub repo (e.g. `e-rickshaw-tracker`) and push this folder.
2. Rename `rickshaw-tracker-demo-standalone.html` to `index.html` at the repo root.
3. In the repo: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save**.
4. Your site goes live at `https://<your-username>.github.io/<repo-name>/` in ~1 minute.

Deploying it (instead of sending the raw HTML file) matters for reliability: a real `https://`
link works smoothly on every phone's camera and browser, while a locally-opened file sometimes
hits extra restrictions on Android/iPhone browsers.

## Making sure "Smart Scan" (the paper-form scanner) never fails during the demo

There are two scanning engines, and the app always has a safe fallback — it will never show a
broken error on stage:

1. **Smart Scan (Gemini, best quality + handwriting + Bangla)** — a demo key is already baked
   into this build, so it works with zero setup. It needs internet at the moment of the scan
   (it calls Google's API over HTTPS).
2. **Free offline scanner (built in, no key, English/Bangla printed text)** — this is the
   automatic fallback if Smart Scan is off or the built-in key ever stops working. It needs a
   small one-time download (a few MB) from a public library the **first** time it's used in a
   browser — after that it's cached and instant.

**Before the real demo:** open the link on your boss's phone/laptop, on the venue's wifi, and
run one scan (the "Sample form" button, or a real printed form). That confirms the key still
works for your Google account/region and warms the offline-scanner cache as a backup — so even if
the venue's internet is briefly shaky, the fallback kicks in instantly instead of stalling.

If the built-in key ever stops working (keys can be rotated or rate-limited), open the app →
Registration → Paper + OCR Scan → "Smart Scan settings" → paste your own free key from
[aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free, under a minute) → Save.

## Demo login

Login/signup is a local demo (no server): sign up with any phone + password, or tap
"ডেমো হিসেবে প্রবেশ করুন" (continue as demo user) to skip straight in. Once logged in, reopening
the link goes straight to the home screen (Register / Admin Panel) — no need to log in again on
the same device.
