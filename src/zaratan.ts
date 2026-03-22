/**
 * Parameters that control a single Zaratan render.
 */
export interface ZaratanParams {
  /** Seed used to initialize the render's random number generator. */
  readonly seed: number;
  /** Width of the output surface in pixels. */
  readonly width: number;
  /** Height of the output surface in pixels. */
  readonly height: number;
  /** Minimum spacing between neighboring Poisson sample points. */
  readonly radius: number;
}
