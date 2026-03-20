import { expect, test } from "vite-plus/test";

import { poisson } from "./poisson";
import type { Bounds2D } from "./utils/geometry";
import { pointCount, pointX, pointY, type PointId } from "./utils/point-buffer";

test("poisson", () => {
  const bounds: Bounds2D = {
    min: { x: 0, y: 0 },
    max: { x: 1, y: 1 },
  };
  const radius = 0.125;
  const buffer = poisson({ bounds, radius });
  const count = pointCount(buffer);
  for (let i = 0 as PointId; i < count; i++) {
    const x = pointX(buffer, i);
    const y = pointY(buffer, i);
    expect(x).toBeGreaterThanOrEqual(bounds.min.x);
    expect(x).toBeLessThan(bounds.max.x);
    expect(y).toBeGreaterThanOrEqual(bounds.min.y);
    expect(y).toBeLessThan(bounds.max.y);
    for (let j = (i + 1) as PointId; j < count; j++) {
      const dx = x - pointX(buffer, j);
      const dy = y - pointY(buffer, j);
      expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(radius);
    }
  }
});
