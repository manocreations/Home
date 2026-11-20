# ManO CreationS — Original designs, separated source files

This package preserves the original visual designs and page content provided in the conversation, **not** the redesigned unified-site version.

## Run
Open `index.html` in a browser. The `assets/css/` and `assets/js/` folders must remain alongside the HTML files. For development, serve locally with `python -m http.server 8000` and navigate to `http://localhost:8000`.

## Folder structure
- 13 original/reference pages as HTML files in the project root.
- `assets/css/<page>.css` — the original page's CSS extracted from its `<style>` tag.
- `assets/js/<page>.js` — the original page's JavaScript extracted from its inline `<script>` tags.
- `assets/img/` — available for replacing remote images with local copies later.
- `services.html` and `love-permit-card.html` — **supplemental pages from the previous package**, not part of the originally submitted 13-page set. They continue using the legacy `main.css`/`main.js` design.

## Source fidelity
Seven uploaded pages were copied directly from their uploaded source HTML, with inline styles and scripts extracted without rewriting them. Six chat-pasted pages were faithfully reassembled using the provided markup, text, styles and JS behaviors, then separated into CSS and JS files. No global redesign was applied to those 13 pages.

## Important deployment notes
- Original links that point to manocreations.com, Google Forms, WhatsApp, etc. remain as originally supplied, including those that navigate to the live website rather than the local files.
- Remote image URLs, icons, and Google Fonts still need an internet connection. Images have not been embedded in the ZIP.
- The original UPI payment page only requests manual verification and does NOT verify transactions; do not treat a return from an app as proof of payment.
- Pricing is inconsistent across the supplied Love Permit Card pages (₹249 vs ₹499). Resolve before publication.
- The original portfolio contains corporate logos; verify the relationship before displaying those brands as clients.
- This is a static front-end, not a live backend or payment service.

## Homepage navigation update
The homepage now includes a responsive top navigation bar and six quick-access main-page cards. Links to About, Portfolio, Pricing, Logo Style, Love Permit Card, and Contact point to local HTML files. Founder, Timeline, Kiruthika Industries, Terms and Privacy are also accessible. The existing homepage theme and sections are preserved.

## Usability and AI-discovery enhancements
- Homepage uses a concise six-link navigation and six clearly labelled user journeys, plus a separate section for Love Permit Card and Kiruthika Industries.
- All inner pages have a small floating 'ManO Home' link (implemented through `site-navigation.css/js`).
- Homepage includes semantic navigation, skip-to-content, a mobile menu, and accessible button labels.
- `robots.txt`, `sitemap.xml`, `llms.txt`, `site-info.json`, and homepage Organization structured data help automated systems discover and understand the content. They do not guarantee crawlers or AI assistants will access, index, or recommend it.
- `robots.txt` excludes the payment page from crawling; for stronger protection, configure `noindex` at the server and avoid publishing sensitive details in static files.
- Canonical URLs assume that all the HTML files will be published at the root of `https://www.manocreations.com/`. Adjust them if the hosting platform uses different paths. Existing current-site URLs may differ.
- This ZIP is a static frontend: external image and font URLs require internet access, and automated payment verification is not included.

## Integrated LovePermit application (2026-11)
- The `lovepermit/` directory contains the supplied sign-in, account, application, orders, profile and admin frontend, with its visual design preserved.
- Use `love-permit-card.html` → **Apply Now** → consent checkbox → **APPLY NOW!** to reach `lovepermit/index.html` instead of the old Google Form. A separate **Sign In / My Permit** link also opens the app.
- **Deployment:** publish the whole folder together under one HTTPS domain; use a local HTTP server for local preview (`python -m http.server 8000`). Do not open the application via `file://`.
- **Required external setup:** Google OAuth needs the deployed site origin registered as an authorized JavaScript origin for the existing Google client ID; the live Cloudflare Worker API must exist, authorize the deployed site's CORS origin, and implement the routes expected in `lovepermit/auth.js` and `lovepermit/admin.js`; Cloudinary must accept unsigned uploads for the configured preset. These external systems are NOT included in either ZIP, so live sign-in, saving, and admin operations cannot be guaranteed by a static test.
- **Security:** Access control must be enforced by the backend. The client-side admin email condition is a UI convenience, not authorization. Verify server-side token checks and authorization for each admin endpoint.
- **Application fixes:** removed local debug exfiltration requests; improved upload error handling; corrected local DOB date maximum; corrected rejected application retry handling; ensured hidden panels stay hidden; replaced fictitious sample order number; added ManO return links and fixed privacy/terms links.
- **Important:** old static payment page remains informational/manual. No automatic payment verification is provided. Determine whether to keep it linked publicly and reconcile published pricing before launch.
