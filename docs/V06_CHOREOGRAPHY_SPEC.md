# V0.6 — CHOREOGRAPHY ENGINE SPEC

## Objective
Replace the functional slider motion from V0.5 with a continuous multi-actor choreography inspired by the Polestar reference.

## Core rule
This is not a one-car-at-a-time slider. At any stable state, the composition should preserve a hero vehicle plus visible neighboring vehicles. During a transition, up to four choreography roles may exist simultaneously:

1. previous
2. active / departing hero
3. next / incoming hero
4. future

## Stable roles
- Previous: x -57vw, scale .79, opacity .58
- Active: x 0, scale 1, opacity 1
- Next: x +57vw, scale .80, opacity .64
- Far-left: x -94vw, scale .70, opacity 0
- Far-right: x +94vw, scale .70, opacity .10

## Segment choreography
For a transition from state N to N+1:

- previous -> far-left
- active -> previous
- next -> active
- future -> next

The active car retains visual authority during the first half. The incoming car becomes top layer after approximately 52% of segment progress.

## Motion characteristics
- no generic track translateX
- no identical easing for all vehicles
- outgoing and incoming cars use different curves
- incoming movement begins slightly after the drag begins
- future vehicle begins moving before the new hero fully settles
- no artificial 3D rotation in V0.6
- subtle Y parallax only
- snap occurs after pointer release using projected pointer velocity

## Copy choreography
- departing copy remains visible through early transition
- incoming copy begins after roughly 38% progress
- crossfade is linked to segment progress, never a timer independent from drag

## Acceptance gate
Do not call V0.6 validated until a browser check confirms:

1. V0.6 marker visible.
2. Supplied images load.
3. At least hero + next vehicle are visible in a stable state.
4. During drag, outgoing and incoming cars coexist visibly.
5. A future vehicle becomes visible before the incoming hero fully settles where viewport permits.
6. Continuous progress responds directly to pointer movement.
7. Release produces inertia + snap.
8. Adjacent vehicles adopt stable neighbor positions after snap.
9. No regression to an empty shell if JavaScript fails.

## Current status
Implemented in `standalone/motion-v06.js` and `standalone/v06.html` on branch `motion-lab-v05`. Pending human browser validation against the source video.
