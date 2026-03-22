export type CommandKind = "init" | "submit";

export interface AbstractCommand<K extends CommandKind> {
  readonly kind: K;
}

export interface InitCommand extends AbstractCommand<"init"> {
  readonly canvas: OffscreenCanvas;
}

export interface SubmitCommand extends AbstractCommand<"submit"> {
  readonly seed: number;
  readonly width: number;
  readonly height: number;
  readonly radius: number;
  readonly tries: number;
}

export type OffscreenWorkerCommand = InitCommand | SubmitCommand;
