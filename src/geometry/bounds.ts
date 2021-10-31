import { ORIGIN } from "../utils/constants";
import { Vector } from "./vector";

/**
 * Bounds for a 2D space.
 */
export class Bounds {
    /**
     * Creates a Bounds from a size.
     * @param size The size of the bounds
     * @returns The new bounds
     */
    static fromSize(size: Vector): Bounds {
        return new Bounds(ORIGIN, size);
    }

    /**
     * The origin of the bounds.
     */
    readonly origin: Vector;
    /**
     * The size of the bounds.
     */
    readonly size: Vector;

    /**
     * Constructs a new Bounds
     * @param origin The origin
     * @param size The size
     */
    constructor(origin: Vector, size: Vector) {
        this.origin = origin;
        this.size = size;
    }

    /**
     * The x component of the origin.
     */
    get x(): number {
        return this.origin.x;
    }

    /**
     * The y component of the origin.
     */
    get y(): number {
        return this.origin.y;
    }

    /**
     * The x component of the size.
     */
    get width(): number {
        return this.size.x;
    }

    /**
     * The y component of the size.
     */
    get height(): number {
        return this.size.y;
    }

    /**
     * The minimum x component.
     */
    get xMin(): number {
        return this.x;
    }

    /**
     * The maximum x component.
     */
    get xMax(): number {
        return this.x + this.width;
    }

    /**
     * The minimum y component.
     */
    get yMin(): number {
        return this.y;
    }

    /**
     * The maximum y component.
     */
    get yMax(): number {
        return this.y + this.height;
    }

    /**
     * Checks if the vector is in bound inclusive.
     * @param vector The vector
     * @returns Whether the vector is in bounds
     */
    contains(vector: Vector): boolean {
        return (
            vector.x >= this.xMin &&
            vector.x <= this.xMax &&
            vector.y >= this.yMin &&
            vector.y <= this.yMax
        );
    }

    /**
     * Computes the center of the bounds.
     * @returns The center
     */
    center(): Vector {
        return this.origin.add(this.size.scale(0.5));
    }

    xRange(): readonly [xMin: number, xMax: number] {
        return [this.xMin, this.xMax];
    }

    yRange(): readonly [yMin: number, yMax: number] {
        return [this.yMin, this.yMax];
    }
}
