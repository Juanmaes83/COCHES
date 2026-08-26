# Motion Specification — Premium Product Carousel

## Reference behavior

The reference is treated as a motion and interaction benchmark, not as a source to copy literally.

Core behavior to reproduce:

1. Full-viewport product stage.
2. Multiple products may coexist during transition.
3. Pointer/touch displacement maps continuously to scene progress.
4. Release velocity influences the destination before snap.
5. Snap settles with a premium ease instead of stopping abruptly.
6. Product, giant background mark, copy and pagination share one progress model.
7. Parallax must remain subtle enough to preserve a precise editorial feel.
8. Camera is conceptually fixed; products and graphic layers move.

## V0.1 implementation

The first lab deliberately uses CSS-built placeholder vehicles. They exist only to validate motion before real production assets are introduced.

### Current controls

- Previous
- Next
- Inertia ON/OFF
- Parallax ON/OFF
- Reset
- Live continuous progress readout

### Input

- Pointer Events support mouse, pen and touch.
- Drag movement is normalized against viewport width.
- Velocity is measured from recent pointer movement.
- On release, a velocity-derived throw is added before rounding to the nearest scene.

## Validation gates

### Gate A — Physics

Pass when dragging feels directly connected, release has believable momentum and snap never feels abrupt.

### Gate B — Composition

Pass when incoming/outgoing products coexist naturally and no layer appears to jump between states.

### Gate C — Premium feel

Pass when parallax, scale and easing are noticeable only subconsciously.

### Gate D — Assets

Only after A–C pass, replace placeholders with real transparent product renders using matched camera, scale, light and contact shadow.

## Non-goals for V0.1

- exact Polestar visual reproduction
- 3D/WebGL
- autoplay
- production analytics
- final accessibility audit
- final mobile tuning

## Next iteration

1. Track cursor position instead of keeping the Drag cursor fixed.
2. Tune velocity filtering and friction.
3. Crossfade copy based on continuous progress rather than active-index remount.
4. Add per-product composition parameters.
5. Replace CSS placeholders with approved matched vehicle assets.
6. Validate on desktop and a real touch device.
