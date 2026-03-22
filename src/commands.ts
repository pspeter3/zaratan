import type { ZaratanParams } from "./zaratan";

/**
 * Discriminant identifying the message sent to the Zaratan offscreen worker.
 */
export type CommandKind = "init" | "submit";

/**
 * Base shape shared by all Zaratan worker commands.
 *
 * @typeParam K - The specific command discriminant.
 */
export interface AbstractCommand<K extends CommandKind> {
  /** Command discriminant used for narrowing. */
  readonly kind: K;
}

/**
 * Message that transfers the destination canvas to the worker.
 */
export interface InitCommand extends AbstractCommand<"init"> {
  /** Offscreen canvas the worker should render into. */
  readonly canvas: OffscreenCanvas;
}

/**
 * Message that requests a render using a complete Zaratan parameter set.
 */
export interface SubmitCommand extends AbstractCommand<"submit"> {
  /** Rendering and generation settings applied to the next worker render. */
  readonly params: ZaratanParams;
}

/**
 * Any message accepted by the Zaratan offscreen worker.
 */
export type OffscreenWorkerCommand = InitCommand | SubmitCommand;
