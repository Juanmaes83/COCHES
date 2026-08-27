# V0.2–V0.4 Failure Analysis and V0.5 Corrections

## Context

The previous Motion Lab demos could render the static shell (background, Drag circle, controls) while showing no cars, no dynamic copy and no choreography. The browser screenshot supplied by Juanma is consistent with JavaScript-dependent content not being created/executed correctly.

## Failure 1 — JavaScript was responsible for creating all meaningful content

### Symptom
The page showed the static shell but no cars, dynamic copy, page marks or motion.

### Cause
V0.2–V0.4 created vehicles, copy blocks and pager elements inside JavaScript. A single JavaScript delivery/runtime failure therefore removed the entire visual experience.

### Correction in V0.5
All six vehicles, all six copy blocks and all six pager controls exist directly in HTML. JavaScript now controls only transforms, opacity, drag physics and state. The first vehicle is explicitly visible in CSS before JS runs.

## Failure 2 — Demo branch name contained a slash

### Symptom
Development URLs were difficult to reason about and introduced another variable into raw/CDN URL resolution and caching.

### Cause
The working branch was `feat/premium-motion-lab`. Although GitHub can resolve it, using a slash-containing ref in static CDN/raw URLs makes debugging and caching less deterministic than necessary.

### Correction in V0.5
A dedicated branch named `motion-lab-v05` has been created specifically for the demo.

## Failure 3 — Cross-origin asset dependency in V0.4

### Symptom
The HTML was served through RawGitHack while vehicle images were requested from `raw.githubusercontent.com`.

### Cause
This introduced an unnecessary second host and made asset delivery harder to diagnose.

### Correction in V0.5
The HTML uses relative same-origin URLs: `../public/assets/cars/car-XX.webp`. When served through RawGitHack, HTML, JS and images resolve through the same host/ref.

## Failure 4 — Inline monolithic JavaScript

### Symptom
When the script failed, there was no clear boundary between HTML delivery and interaction-engine delivery.

### Cause
The complete application lived inside one inline `<script>` block.

### Correction in V0.5
The engine is now isolated in `standalone/motion-v05.js` and loaded with `defer`. The file passes `node --check` syntax validation before upload.

## Failure 5 — No useful runtime health signal

### Symptom
The visible UI could not tell whether JavaScript was running or whether images had loaded.

### Correction in V0.5
The top-right status reports:
- `JS waiting` before the external engine executes.
- `JS OK · checking images` once the engine starts.
- `JS OK · IMG 6/6` when all six supplied vehicle assets have loaded.
- `IMG ERROR ...` if any image fails.

## Failure 6 — Delivery was declared before browser-level acceptance

### Process correction
A commit or successful GitHub write is not acceptance. The acceptance gate for future iterations is:
1. Correct version marker visible.
2. First supplied vehicle visible without relying on JS generation.
3. Runtime status reports JS OK.
4. Six images load.
5. Pointer drag changes progress continuously.
6. Release produces snap/inertia.
7. Two adjacent cars coexist during transition.

## V0.5 architecture

- `standalone/v05.html` — static-first visual layer and six real references.
- `standalone/motion-v05.js` — drag, inertia, snap and choreography only.
- `public/assets/cars/` — supplied vehicle assets.
- branch `motion-lab-v05` — slash-free demo ref.

This architecture is intentionally fail-visible: if JavaScript fails, the page must still show a real supplied car and its copy instead of an empty stage.
