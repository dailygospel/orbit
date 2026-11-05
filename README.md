# Orbit

A responsive, static landing page for Orbit. No dependencies or build step. Includes an interactive, illustrative feature preview, mobile layouts, keyboard controls, reduced-motion support, and configurable **Buy access** buttons.

## Launch on Netlify

1. Commit the contents of this folder to a Git repository.
2. In Netlify, choose **Add new project → Import an existing project** and select the repository.
3. Leave the build command empty. The publish directory is `.` (configured in `netlify.toml`).
4. Deploy.

Netlify reads the deployment settings from the root `netlify.toml` file when you connect this repository.

You can also drag this folder into Netlify's manual deploy area.

## Connect checkout

Edit `config.js`:

```js
window.ORBIT_CONFIG = {
  checkoutUrl: "https://your-checkout-provider.example/your-payment-link",
  checkoutNote:
    "$3 per 14 days or $20 lifetime. Review purchase terms at checkout.",
};
```

Checkout is intentionally unconfigured for now. The page displays the confirmed options: **$3 per 14 days** and **$20 lifetime**. No automatic renewal or cancellation terms are stated for the 14-day option.

When you are ready, replace the example URL with your real hosted checkout link. The header, hero, and purchase-section buttons will then all link to checkout. Until a checkout URL is added, the header and hero buttons lead to the pricing section, where **Buy access** opens a purchase-availability dialog. If prices change, update the pricing cards, FAQ, and dialog in `index.html` together with `checkoutNote` in `config.js`.

Your checkout provider must process payments and arrange delivery of access, such as a license key or an account invitation. This static site does not verify payments, issue licenses, or protect a software download. Keep payment secrets on your provider or server, never in `config.js`. Same-site checkout routes are supported if you later add a backend.

## Preview locally

Run `python3 -m http.server 8000` in this directory and visit `http://localhost:8000`. No installation is required.

## Customize

- `index.html`: copy, sections, illustrated map, and FAQ.
- `styles.css`: colors, typography, layout, and responsive behavior.
- `app.js`: preview toggles, adjustable radius, checkout links, and purchase dialog.
- `config.js`: checkout URL and purchase note.
- `assets/`: original vector favicon and social artwork.
- `netlify.toml`: static hosting and security headers.

The website preview is an illustration, not a screenshot or working game integration. The tracers update with the selected radius; the radar illustrates a lobby overview independently of tracer radius. Role reveal and in-game tags can be controlled separately. No software compatibility, pricing, platform support, safety, or anti-ban guarantees are invented. Supplied product features are showcased, but the site does not assert the unverified “0 risk” claim. Add verified release and compatibility details before launch. Orbit is presented as independent of Innersloth.

The site does not use analytics, cookies, remote fonts, or third-party scripts. Social artwork is SVG; replace it with an absolute PNG/JPG URL in `og:image` for the broadest social-platform support once you have a production domain.
