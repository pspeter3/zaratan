/**
 * Discriminant identifying the command sent to the offscreen worker.
 */
export type CommandKind = "init" | "submit";

/**
 * Base shape shared by all offscreen worker commands.
 *
 * @typeParam K - The specific command discriminant.
 */
export interface AbstractCommand<K extends CommandKind> {
  /** Command discriminant used for narrowing. */
  readonly kind: K;
}

/**
 * Command that transfers the rendering canvas to the worker.
 */
export interface InitCommand extends AbstractCommand<"init"> {
  /** Offscreen canvas the worker should render into. */
  readonly canvas: OffscreenCanvas;
}

/**
 * Command that requests a new render using the provided generation settings.
 */
export interface SubmitCommand extends AbstractCommand<"submit"> {
  /** Seed used to initialize the random number generator. */
  readonly seed: number;
  /** Width of the generated output in pixels. */
  readonly width: number;
  /** Height of the generated output in pixels. */
  readonly height: number;
  /** Minimum spacing between generated sample points. */
  readonly radius: number;
  /** Number of candidate attempts per active sample. */
  readonly tries: number;
}

/**
 * Any command accepted by the offscreen worker.
 */
export type OffscreenWorkerCommand = InitCommand | SubmitCommand;
