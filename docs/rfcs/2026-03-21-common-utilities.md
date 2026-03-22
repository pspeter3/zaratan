# RFC: Common Utility Extractions

Status: Proposed
Date: 2026-03-21
Source branch: `heightmap`
Comparison baseline: `main`

## Summary

The `heightmap` branch introduces a new isolines feature and expands the offscreen rendering flow. Compared to `main`, the added code is still compact, but it already exposes a few low-level patterns that are likely to recur as more geometry and rendering features are added.

This RFC proposes a small set of common utilities to extract in a follow-up PR. The goal is to centralize the helpers that are already duplicated or are likely to be reused soon, while leaving feature-specific contour logic in place.

## Scope

This RFC is limited to utility extraction candidates discovered while comparing:

- `src/isolines.ts`
- `src/isolines.test.ts`
- `src/offscreen-worker.ts`

against `main`.

## Goals

- Reduce repeated low-level geometry math across implementation and tests.
- Make `PointBuffer` easier to consume from higher-level code.
- Avoid duplicating path-building and offscreen rendering glue as more visual stages are added.
- Keep feature-specific contour and spline algorithms local until another caller appears.

## Suggested Utilities

### 1. Expand `src/utils/geometry.ts`

Add basic geometry helpers that are already duplicated or implied by current code:

- `lerp(source, target, offset)`
- `distance2D(source, target)`
- `lerpPoint(source, target, offset)`
- `isWithinBounds(point, bounds, epsilon?)`

Rationale:

- `src/isolines.ts` defines local interpolation and distance helpers.
- `src/poisson.test.ts` defines local `distance(...)` and `isWithinBounds(...)`.
- These functions are generic and are not specific to contour generation.

Expected payoff:

- Shared math vocabulary across geometry-heavy modules.
- Less test-only duplication.
- Cleaner implementation code in future mesh, sampling, and rendering work.

### 2. Expand `src/utils/point-buffer.ts`

Add higher-level adapters for interleaved point buffers:

- `point(buffer, id): Point2D`
- `toPoints(buffer): Point2D[]`
- `mapPoints(buffer, iteratee)`
- `pointIdsWithinBounds(buffer, bounds)` or an equivalent filtered iterator

Rationale:

- Callers currently reconstruct `{ x, y }` objects manually.
- `src/offscreen-worker.ts` and `src/isolines.ts` both iterate raw ids and coordinates directly.
- `src/poisson.test.ts` includes its own `toPoints(...)` helper.

Expected payoff:

- Cleaner call sites for algorithms that operate on logical points instead of raw buffer slots.
- Lower friction for tests and visualization code.

### 3. Add `src/utils/path.ts`

Move shared path-related abstractions into a dedicated module:

- `PathBuilder`
- `addSegment(path, start, end)` for `Point2D`
- `addBufferedSegment(path, buffer, sourceId, targetId)` if buffer-backed drawing remains common
- `addPolyline(path, points, closed?)`

Rationale:

- `PathBuilder` currently lives inside `src/isolines.ts`, but it is a general rendering abstraction.
- `src/offscreen-worker.ts` has its own `addSegment(...)` helper.
- `src/isolines.test.ts` contains a reusable `RecordingPath` test double pattern.

Expected payoff:

- A single place for path-writing helpers used by both production code and tests.
- Easier reuse if additional workers or renderers are added.

### 4. Add a small offscreen rendering helper

Create a utility module for repeated offscreen canvas operations, for example:

- `resizeCanvas(canvas, width, height)`
- `resetCanvas(ctx, width, height, fillStyle)`
- `snapshotStage(name, canvas)`
- `renderStage(ctx, name, draw)` if stage orchestration continues to grow

Rationale:

- `src/offscreen-worker.ts` now has a repeated pattern of reset, draw, and snapshot across multiple stages.
- This logic is not specific to isolines and will likely grow as more visual outputs are added.

Expected payoff:

- Smaller worker files.
- More consistent rendering stages.
- Easier extension when adding new previews.

### 5. Add numeric helpers for ranges and extents

Extract generic helpers that separate data inspection from contour logic:

- `extent(values)` or `extentBy(...)`
- `evenlySpacedLevels(min, max, count)`

Rationale:

- `contourLevels(...)` currently combines bounds filtering, min/max scanning, and level generation.
- The level generation portion is generic enough to be reused by other heightmap or sampling features.

Expected payoff:

- Better separation between domain logic and numeric utilities.
- Reuse for future thresholding or binning tasks.

### 6. Add test support helpers if geometry work continues

Create a lightweight test utility module for reusable matchers and recorders:

- `RecordingPath`
- `closeToPoint(point, precision?)`
- Optional helpers for converting point buffers into comparable point arrays

Rationale:

- `src/isolines.test.ts` and `src/poisson.test.ts` already contain reusable geometry-oriented test helpers.
- These helpers are useful, but they do not belong in production modules.

Expected payoff:

- Shorter tests.
- Consistent precision handling and path assertions.

## Non-Goals

Do not extract the following yet:

- Contour assembly logic from `src/isolines.ts`
- Catmull-Rom sampling internals from `src/isolines.ts`
- Marching-triangle-specific edge keying and segment walking

Reason:

These pieces still look feature-specific. They should remain local until another independent caller needs them.

## Suggested Rollout

Use small follow-up PRs instead of one large utility sweep:

1. Geometry and point-buffer utilities
2. Path utilities and related test helpers
3. Offscreen rendering helpers
4. Numeric extent and level helpers, only if another feature needs them

## Recommendation

If only a subset is extracted now, prioritize:

1. `src/utils/geometry.ts`
2. `src/utils/point-buffer.ts`
3. `src/utils/path.ts`

These three provide the best balance of immediate reuse and low refactor risk.
