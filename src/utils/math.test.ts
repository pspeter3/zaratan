import { describe, expect, test } from "vite-plus/test";

import { mix } from "./math";

describe("mix", () => {
  test("returns a for t=0", () => {
    expect(mix(1.5, 2.5, 0)).toEqual(1.5);
  });

  test("returns b for t=1", () => {
    expect(mix(1.5, 2.5, 1)).toEqual(2.5);
  });

  test("returns mid point for t=0.5", () => {
    expect(mix(1.5, 2.5, 0.5)).toEqual(2);
  });
});
