import { describe, expect, test } from "vite-plus/test";

import { clamp, mix, unmix } from "./math";

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

describe("clamp", () => {
  test("returns min when value less than min", () => {
    expect(clamp(-0.5, 0, 1)).toEqual(0);
  });

  test("returns max when value greater than max", () => {
    expect(clamp(1.5, 0, 1)).toEqual(1);
  });

  test("returns value when in range", () => {
    expect(clamp(0.5, 0, 1)).toEqual(0.5);
  });
});

describe("unmix", () => {
  test("returns 0 when value is a", () => {
    expect(unmix(1.5, 2.5, 1.5)).toEqual(0);
  });

  test("returns 1 when value is b", () => {
    expect(unmix(1.5, 2.5, 2.5)).toEqual(1);
  });

  test("returns the inverse interpolation factor", () => {
    expect(unmix(1.5, 2.5, 2)).toEqual(0.5);
  });

  test("supports descending ranges", () => {
    expect(unmix(10, 0, 7.5)).toEqual(0.25);
  });
});
