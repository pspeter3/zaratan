/**
 * Fill or stroke style accepted by a 2D canvas context.
 */
export type SurfaceStyle = CanvasFillStrokeStyles["fillStyle"];

/**
 * Line styling applied when stroking a path on a {@link Surface2D}.
 */
export interface SurfaceStrokeOptions {
  /** Stroke paint applied to the path outline. */
  style: SurfaceStyle;
  /** Width of the stroked path in canvas units. */
  width: CanvasPathDrawingStyles["lineWidth"];
  /** Shape used at the start and end of open subpaths. */
  cap?: CanvasPathDrawingStyles["lineCap"];
  /** Shape used where two path segments meet. */
  join?: CanvasPathDrawingStyles["lineJoin"];
  /** Maximum miter length before joins bevel. */
  miterLimit?: CanvasPathDrawingStyles["miterLimit"];
  /** Offset into the dash pattern. */
  dashOffset?: CanvasPathDrawingStyles["lineDashOffset"];
  /** Dash pattern applied to the stroke. */
  dash?: Iterable<number>;
}

/**
 * Minimal drawing surface API used by offscreen rendering code.
 */
export interface Surface2DLike {
  /**
   * Resizes the underlying drawing buffer.
   *
   * @param width - The target width in pixels.
   * @param height - The target height in pixels.
   */
  resize(width: number, height: number): void;

  /**
   * Clears the full surface with a solid fill.
   *
   * @param fillStyle - The fill style used to clear the surface.
   */
  clear(fillStyle: SurfaceStyle): void;

  /**
   * Fills a path using the provided style.
   *
   * @param path - The path to fill.
   * @param fillStyle - The fill style applied to the path.
   */
  fill(path: Path2D, fillStyle: SurfaceStyle): void;

  /**
   * Strokes a path using the provided line options.
   *
   * @param path - The path to stroke.
   * @param options - The stroke configuration.
   */
  stroke(path: Path2D, options: SurfaceStrokeOptions): void;
}

/**
 * Offscreen canvas-backed implementation of {@link Surface2DLike}.
 */
export class Surface2D implements Surface2DLike {
  readonly #canvas: OffscreenCanvas;
  readonly #ctx: OffscreenCanvasRenderingContext2D;

  /**
   * Creates a drawing surface from an offscreen canvas.
   *
   * @param canvas - The canvas backing this surface.
   */
  constructor(canvas: OffscreenCanvas) {
    this.#canvas = canvas;
    const ctx = this.#canvas.getContext("2d", { alpha: false });
    if (ctx === null) {
      throw new Error("Failed to create 2D context");
    }
    this.#ctx = ctx;
  }

  /**
   * @inheritdoc
   */
  resize(width: number, height: number): void {
    this.#canvas.width = width;
    this.#canvas.height = height;
  }

  /**
   * @inheritdoc
   */
  clear(fillStyle: SurfaceStyle): void {
    this.#draw((ctx) => {
      ctx.fillStyle = fillStyle;
      ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
    });
  }

  /**
   * @inheritdoc
   */
  fill(path: Path2D, fillStyle: SurfaceStyle): void {
    this.#draw((ctx) => {
      ctx.fillStyle = fillStyle;
      ctx.fill(path);
    });
  }

  /**
   * @inheritdoc
   */
  stroke(path: Path2D, options: SurfaceStrokeOptions): void {
    this.#draw((ctx) => {
      ctx.strokeStyle = options.style;
      ctx.lineWidth = options.width;
      if (options.cap !== undefined) {
        ctx.lineCap = options.cap;
      }
      if (options.join !== undefined) {
        ctx.lineJoin = options.join;
      }
      if (options.miterLimit !== undefined) {
        ctx.miterLimit = options.miterLimit;
      }
      if (options.dashOffset !== undefined) {
        ctx.lineDashOffset = options.dashOffset;
      }
      if (options.dash !== undefined) {
        ctx.setLineDash(options.dash);
      }
      ctx.stroke(path);
    });
  }

  /**
   * Runs a drawing operation with canvas state isolated from the caller.
   *
   * @param callback - The drawing operation that mutates context state.
   */
  #draw(callback: (ctx: OffscreenCanvasRenderingContext2D) => void): void {
    this.#ctx.save();
    try {
      callback(this.#ctx);
    } finally {
      this.#ctx.restore();
    }
  }
}
