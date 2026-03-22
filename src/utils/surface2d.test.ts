import { describe, expect, test } from "vite-plus/test";

import { Surface2D, type SurfaceStyle, type SurfaceStrokeOptions } from "./surface2d";

interface MockContextState {
  fillStyle: SurfaceStyle;
  strokeStyle: SurfaceStyle;
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  miterLimit: number;
  lineDashOffset: number;
  lineDash: number[];
}

type DrawFailure = "fill" | "fillRect" | "stroke";

class MockContext2D {
  fillStyle: SurfaceStyle = "#000";
  strokeStyle: SurfaceStyle = "#000";
  lineWidth = 1;
  lineCap: CanvasLineCap = "butt";
  lineJoin: CanvasLineJoin = "miter";
  miterLimit = 10;
  lineDashOffset = 0;

  readonly calls: string[] = [];
  readonly fillCalls: Array<{ path: Path2D; fillStyle: SurfaceStyle }> = [];
  readonly fillRectCalls: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    fillStyle: SurfaceStyle;
  }> = [];
  readonly strokeCalls: Array<{ path: Path2D; state: MockContextState }> = [];

  #lineDash: number[] = [];
  #stateStack: MockContextState[] = [];
  #failure?: DrawFailure;

  constructor(failure?: DrawFailure) {
    this.#failure = failure;
  }

  getLineDash(): number[] {
    return [...this.#lineDash];
  }

  save(): void {
    this.calls.push("save");
    this.#stateStack.push(this.#snapshot());
  }

  restore(): void {
    this.calls.push("restore");
    const state = this.#stateStack.pop();
    if (state === undefined) {
      throw new Error("Tried to restore without a saved state.");
    }
    this.fillStyle = state.fillStyle;
    this.strokeStyle = state.strokeStyle;
    this.lineWidth = state.lineWidth;
    this.lineCap = state.lineCap;
    this.lineJoin = state.lineJoin;
    this.miterLimit = state.miterLimit;
    this.lineDashOffset = state.lineDashOffset;
    this.#lineDash = [...state.lineDash];
  }

  fill(path: Path2D): void {
    this.calls.push("fill");
    this.fillCalls.push({ path, fillStyle: this.fillStyle });
    if (this.#failure === "fill") {
      throw new Error("fill failed");
    }
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.calls.push("fillRect");
    this.fillRectCalls.push({ x, y, width, height, fillStyle: this.fillStyle });
    if (this.#failure === "fillRect") {
      throw new Error("fillRect failed");
    }
  }

  setLineDash(segments: Iterable<number>): void {
    this.calls.push("setLineDash");
    this.#lineDash = Array.from(segments);
  }

  stroke(path: Path2D): void {
    this.calls.push("stroke");
    this.strokeCalls.push({ path, state: this.#snapshot() });
    if (this.#failure === "stroke") {
      throw new Error("stroke failed");
    }
  }

  #snapshot(): MockContextState {
    return {
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      lineCap: this.lineCap,
      lineJoin: this.lineJoin,
      miterLimit: this.miterLimit,
      lineDashOffset: this.lineDashOffset,
      lineDash: [...this.#lineDash],
    };
  }
}

class MockCanvas {
  width = 0;
  height = 0;

  readonly #blob: Blob;
  readonly #ctx: MockContext2D | null;

  getContextCalls = 0;
  getContextType?: string;
  getContextOptions?: CanvasRenderingContext2DSettings;
  convertToBlobCalls = 0;

  constructor(ctx: MockContext2D | null, blob = new Blob(["snapshot"])) {
    this.#ctx = ctx;
    this.#blob = blob;
  }

  getContext(
    type: string,
    options?: CanvasRenderingContext2DSettings,
  ): OffscreenCanvasRenderingContext2D | null {
    this.getContextCalls++;
    this.getContextType = type;
    this.getContextOptions = options;
    return this.#ctx as OffscreenCanvasRenderingContext2D | null;
  }

  convertToBlob(): Promise<Blob> {
    this.convertToBlobCalls++;
    return Promise.resolve(this.#blob);
  }
}

function createSurface(ctx = new MockContext2D()): {
  canvas: MockCanvas;
  ctx: MockContext2D;
  surface: Surface2D;
} {
  const canvas = new MockCanvas(ctx);
  const surface = new Surface2D(canvas as unknown as OffscreenCanvas);
  return { canvas, ctx, surface };
}

describe("Surface2D", () => {
  test("requests a 2d context with alpha disabled", () => {
    const { canvas } = createSurface();

    expect(canvas.getContextCalls).toBe(1);
    expect(canvas.getContextType).toBe("2d");
    expect(canvas.getContextOptions).toEqual({ alpha: false });
  });

  test("throws when a 2d context cannot be created", () => {
    const canvas = new MockCanvas(null);

    expect(() => new Surface2D(canvas as unknown as OffscreenCanvas)).toThrowError(
      "Failed to create 2D context",
    );
  });

  test("resize updates the backing canvas dimensions", () => {
    const { canvas, surface } = createSurface();

    surface.resize(320, 240);

    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(240);
  });

  test("clear fills the full canvas and restores fill state", () => {
    const { ctx, surface } = createSurface();
    surface.resize(320, 240);
    ctx.fillStyle = "#123";

    surface.clear("#abc");

    expect(ctx.calls).toEqual(["save", "fillRect", "restore"]);
    expect(ctx.fillRectCalls).toEqual([{ x: 0, y: 0, width: 320, height: 240, fillStyle: "#abc" }]);
    expect(ctx.fillStyle).toBe("#123");
  });

  test("fill uses the provided style and restores fill state", () => {
    const { ctx, surface } = createSurface();
    const path = {} as Path2D;
    ctx.fillStyle = "#123";

    surface.fill(path, "#def");

    expect(ctx.calls).toEqual(["save", "fill", "restore"]);
    expect(ctx.fillCalls).toEqual([{ path, fillStyle: "#def" }]);
    expect(ctx.fillStyle).toBe("#123");
  });

  test("stroke applies line settings for the draw and restores prior state", () => {
    const { ctx, surface } = createSurface();
    const path = {} as Path2D;
    const options: SurfaceStrokeOptions = {
      style: "#fff",
      width: 3,
      cap: "round",
      join: "bevel",
      miterLimit: 8,
      dashOffset: 1.5,
      dash: new Set([2, 4]),
    };
    ctx.strokeStyle = "#123";
    ctx.lineWidth = 1;
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.lineDashOffset = 0.5;
    ctx.setLineDash([9]);
    ctx.calls.length = 0;

    surface.stroke(path, options);

    expect(ctx.calls).toEqual(["save", "setLineDash", "stroke", "restore"]);
    expect(ctx.strokeCalls).toEqual([
      {
        path,
        state: {
          fillStyle: "#000",
          strokeStyle: "#fff",
          lineWidth: 3,
          lineCap: "round",
          lineJoin: "bevel",
          miterLimit: 8,
          lineDashOffset: 1.5,
          lineDash: [2, 4],
        },
      },
    ]);
    expect(ctx.strokeStyle).toBe("#123");
    expect(ctx.lineWidth).toBe(1);
    expect(ctx.lineCap).toBe("square");
    expect(ctx.lineJoin).toBe("miter");
    expect(ctx.miterLimit).toBe(10);
    expect(ctx.lineDashOffset).toBe(0.5);
    expect(ctx.getLineDash()).toEqual([9]);
  });

  test("stroke leaves optional line settings unchanged when omitted", () => {
    const { ctx, surface } = createSurface();
    const path = {} as Path2D;

    surface.stroke(path, {
      style: "#fff",
      width: 3,
    });

    expect(ctx.calls).toEqual(["save", "stroke", "restore"]);
    expect(ctx.strokeCalls).toEqual([
      {
        path,
        state: {
          fillStyle: "#000",
          strokeStyle: "#fff",
          lineWidth: 3,
          lineCap: "butt",
          lineJoin: "miter",
          miterLimit: 10,
          lineDashOffset: 0,
          lineDash: [],
        },
      },
    ]);
    expect(ctx.getLineDash()).toEqual([]);
  });

  test("restores state when a drawing operation throws", () => {
    const ctx = new MockContext2D("stroke");
    const { surface } = createSurface(ctx);
    const path = {} as Path2D;
    const originalDash = [9];

    ctx.strokeStyle = "#123";
    ctx.lineWidth = 1;
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.lineDashOffset = 0.5;
    ctx.setLineDash(originalDash);
    ctx.calls.length = 0;

    expect(() =>
      surface.stroke(path, {
        style: "#fff",
        width: 3,
        cap: "round",
        join: "bevel",
        miterLimit: 8,
        dashOffset: 1.5,
        dash: [2, 4],
      }),
    ).toThrow("stroke failed");
    expect(ctx.calls).toEqual(["save", "setLineDash", "stroke", "restore"]);
    expect(ctx.strokeStyle).toBe("#123");
    expect(ctx.lineWidth).toBe(1);
    expect(ctx.lineCap).toBe("square");
    expect(ctx.lineJoin).toBe("miter");
    expect(ctx.miterLimit).toBe(10);
    expect(ctx.lineDashOffset).toBe(0.5);
    expect(ctx.getLineDash()).toEqual(originalDash);
  });

  test("snapshot delegates to the backing canvas", async () => {
    const blob = new Blob(["result"]);
    const canvas = new MockCanvas(new MockContext2D(), blob);
    const surface = new Surface2D(canvas as unknown as OffscreenCanvas);

    await expect(surface.snapshot()).resolves.toBe(blob);
    expect(canvas.convertToBlobCalls).toBe(1);
  });
});
