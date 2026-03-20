declare module "fast-2d-poisson-disk-sampling" {
  export type FastPoissonDiskSamplingPoint = [number, number];

  export type FastPoissonDiskSamplingOptions =
    | {
        readonly shape: readonly [number, number];
        readonly radius: number;
        readonly minDistance?: number;
        readonly tries?: number;
      }
    | {
        readonly shape: readonly [number, number];
        readonly radius?: number;
        readonly minDistance: number;
        readonly tries?: number;
      };

  export default class FastPoissonDiskSampling {
    constructor(options: FastPoissonDiskSamplingOptions, rng?: () => number);

    readonly width: number;
    readonly height: number;
    readonly radius: number;
    readonly maxTries: number;

    addRandomPoint(): FastPoissonDiskSamplingPoint;
    addPoint(point: readonly [number, number]): FastPoissonDiskSamplingPoint | null;
    next(): FastPoissonDiskSamplingPoint | null;
    fill(): FastPoissonDiskSamplingPoint[];
    getAllPoints(): FastPoissonDiskSamplingPoint[];
    reset(): void;
  }
}
