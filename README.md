# Orbit

Orbit’s landing page uses a deep navy and neon blue visual system, a locally hosted Space Grotesk font, and an interactive feature sandbox. It is a static site with no dependencies to install and no build step.

## Deploy to Netlify

1. Connect this GitHub repository in Netlify.
2. Leave the build command empty and use `.` as the publish directory.
3. Deploy. The root `netlify.toml` supplies these settings and the security headers.

There is no `dist/` folder. The public site files live at the repository root. You can also upload the site folder using Netlify’s manual deploy flow.

## Checkout and pricing

The confirmed prices are **$3 per 14 days** and **$20 lifetime**. Checkout remains intentionally unconfigured. No automatic renewal, cancellation policy, or unsupported release details are stated.

When a hosted checkout is ready, edit `config.js`:

```js
window.ORBIT_CONFIG = {
  checkoutUrl: "https://your-provider.example/your-checkout",
  checkoutNote:
    "$3 per 14 days or $20 lifetime. Review purchase terms at checkout.",
};
```

The header, hero, closing call to action, and both plan buttons will then link to that shared checkout. The hosted checkout must let buyers choose the appropriate plan. Until then, plan buttons open a dialog showing the selected price and checkout availability. If prices change, update the pricing cards, hero, closing section, FAQ, purchase dialog text in `app.js`, metadata, social artwork, and `checkoutNote` together.

Your payment provider must handle payment processing and access delivery. The static page does not issue licenses, verify payments, or protect a download. Do not put provider secrets in `config.js`.

## Feature sandbox

All six controls change the illustration:

- **Role reveal:** hides or reveals roles in the map labels and the roster.
- **Role tags:** controls labels independently; revealed roles stay available in the roster.
- **Player tracers:** uses the current distance between each moving player and the local player. The radius slider changes which lines appear.
- **Radar:** shows the same five simulated positions as the map; dots update continuously.
- **NoClip:** switches the local player between a direct wall-crossing route and a route through the doorway. The dashed path makes both routes visible.
- **Lights-out vision:** automatically turns the ship lights off for comparison. Disabling vision applies a darkness mask with a local spotlight; enabling it restores the full view. The separate lights button can turn the ship lights on or off.

Pause and reset controls are included. The simulation starts paused when reduced motion is requested. Animation stops advancing while the browser tab is hidden or the sandbox is outside the viewport. On narrow screens the map scrolls horizontally so its labels remain readable; the roster and radar retain a full-lobby overview. The simulation is illustrative and does not connect to Among Us or reproduce Orbit’s actual software interface.

## Local preview and editing

Run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`.

- `index.html`: layout, copy, original map illustration, feature cards, pricing, and FAQ.
- `styles.css`: responsive layout, deep blue theme, typography, and visual effects.
- `app.js`: simulation, feature controls, motion preferences, checkout, and modal behavior.
- `config.js`: checkout URL and purchase note.
- `assets/`: original SVG artwork and the bundled Space Grotesk font with its OFL license.
- `netlify.toml`: deployment configuration and security headers.

No analytics, cookies, external scripts, or externally loaded fonts are used. Orbit is presented as an independent project with no affiliation to Innersloth. Social artwork is SVG; once you have a production domain, use an absolute PNG/JPG `og:image` URL for wider social-platform compatibility.
