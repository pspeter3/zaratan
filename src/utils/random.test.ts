import { expect, test } from "vite-plus/test";

import type { Random } from "./random";
import { createRandom } from "./random";

const SEQUENCE_42 = [0.9999993701129287, 0.8758418435769486, 0.03919820288731701];

const SEQUENCE_43 = [0.999999353341843, 0.9383227926796266, 0.36353322186692416];

function take(random: Random, count: number): number[] {
  return Array.from({ length: count }, () => random());
}

test("createRandom returns a Math.random-compatible function", () => {
  const random: Math["random"] = createRandom(42);

  expect(random).toBeTypeOf("function");
  expect(random()).toBeGreaterThanOrEqual(0);
  expect(random()).toBeLessThan(1);
});

test("same seed yields the same sequence", () => {
  const first = createRandom(42);
  const second = createRandom(42);

  expect(take(first, 3)).toEqual(SEQUENCE_42);
  expect(take(second, 3)).toEqual(SEQUENCE_42);
});

test("one generator advances across successive calls", () => {
  const random = createRandom(42);
  const values = take(random, 3);

  expect(values).toEqual(SEQUENCE_42);
  expect(values[1]).not.toBe(values[0]);
});

test("generated values stay within Math.random's range", () => {
  const random = createRandom(42);

  for (const value of take(random, 128)) {
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  }
});

test("different seeds yield different sequences", () => {
  const first = createRandom(42);
  const second = createRandom(43);

  expect(take(first, 3)).toEqual(SEQUENCE_42);
  expect(take(second, 3)).toEqual(SEQUENCE_43);
  expect(SEQUENCE_42).not.toEqual(SEQUENCE_43);
});
