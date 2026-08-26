# Test Log

## V0.1 — Initial Motion Lab

Status: implementation staged for visual validation.

### Implemented

- React + Vite + TypeScript base
- continuous progress model across three scenes
- pointer/touch drag
- release velocity sampling
- inertia toggle
- snap to nearest scene
- GSAP eased settle
- subtle scale/vertical/rotation parallax
- active copy and giant background mark
- pagination
- lab controls
- responsive baseline

### Pending validation

The repository implementation has not yet passed a browser/device visual QA session. Do not label the motion as reference-matched until the following are manually validated:

1. `npm install`
2. `npm run build`
3. `npm run dev`
4. desktop mouse drag
5. desktop trackpad behavior
6. touch drag on a real mobile device
7. aggressive fast throw left/right
8. slow partial drag and release
9. viewport resize
10. reduced-width mobile composition

### Known deliberate limitation

Vehicles are CSS placeholders. This is intentional: V0.1 validates the motion engine first. Real assets are a later gate.

### Success criterion

The lab advances only if drag, release and snap feel controlled and premium before visual production assets are introduced.
