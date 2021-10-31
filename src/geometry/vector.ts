import { mix, snap } from "../utils/math";

/**
 * 2D Vector.
 */
export class Vector {
    /**
     * Creates a vector from polar coordinates.
     * @param radius The radius of the vector
     * @param angle The angle of the vector
     * @returns The new vector
     */
    static fromPolar(radius: number, angle: number) {
        return new Vector(radius * Math.cos(angle), radius * Math.sin(angle));
    }

    /**
     * The x component of the vector.
     */
    readonly x: number;
    /**
     * The y component of the vector.
     */
    readonly y: number;

    /**
     * Constructs a new Vector.
     * @param x The x component
     * @param y The y component
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * The length of the vector.
     */
    get length(): number {
        return Math.sqrt(this.quad);
    }

    /**
     * The length of the vector squared.
     */
    get quad(): number {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Adds a vector.
     * @param vector The vector to add
     * @returns The added vector
     */
    add({ x, y }: Vector): Vector {
        return new Vector(this.x + x, this.y + y);
    }

    /**
     * Subtracts a vector.
     * @param vector The vector to subtract
     * @returns The subtracted vector
     */
    sub({ x, y }: Vector): Vector {
        return new Vector(this.x - x, this.y - y);
    }

    /**
     * Interpolate between another a vector.
     * @param vector The vector to interpolate
     * @param t The weight
     * @returns The interpolated vector
     */
    mix({ x, y }: Vector, t: number): Vector {
        return new Vector(mix(this.x, x, t), mix(this.y, y, t));
    }

    /**
     * Scales the vector.
     * @param factor The factor to scale by
     * @returns The scaled vector
     */
    scale(factor: number): Vector {
        return new Vector(factor * this.x, factor * this.y);
    }

    /**
     * Rounds the vector.
     * @returns The rounded vector
     */
    round(): Vector {
        return new Vector(Math.round(this.x), Math.round(this.y));
    }

    /**
     * Floors the vector.
     * @returns The floor vector
     */
    floor(): Vector {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }

    /**
     * Ceilings the vector.
     * @returns The ceiling vector
     */
    ceil(): Vector {
        return new Vector(Math.ceil(this.x), Math.ceil(this.y));
    }

    /**
     * Truncates the vector.
     * @returns The truncated vector.
     */
    trunc(): Vector {
        return new Vector(Math.trunc(this.x), Math.trunc(this.y));
    }

    /**
     * Snaps the vector.
     * @returns The snapped vector
     */
    snap(): Vector {
        return new Vector(snap(this.x), snap(this.y));
    }

    /**
     * Swaps the vector components.
     * @returns The swapped vector
     */
    swap(): Vector {
        return new Vector(this.y, this.x);
    }

    /**
     * Converts the vector to a tuple.
     * @returns The tuple vector
     */
    tuple(): readonly [x: number, y: number] {
        return [this.x, this.y];
    }

    /**
     * Calculates the dot product
     * @param vector The other vector
     * @returns The dot product
     */
    dot({ x, y }: Vector): number {
        return this.x * x + this.y * y;
    }

    /**
     * Calculates the distance between two vectors.
     * @param vector The other vector
     * @returns The distance
     */
    distance(vector: Vector): number {
        return this.sub(vector).length;
    }

    /**
     * Calculates the distance squared between two vectors.
     * @param vector The other vector
     * @returns The distance squared
     */
    quadrance(vector: Vector): number {
        return this.sub(vector).quad;
    }
}
