export function mix(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}
