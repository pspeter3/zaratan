import { Vector } from "./vector";

/**
 * Coordinates abstraction.
 */
export class Coords {
    protected static readonly N = 2;
    protected static xOffset(index: number): number {
        return Coords.N * index;
    }
    protected static yOffset(index: number): number {
        return Coords.xOffset(index) + 1;
    }

    /**
     * Raw Int16Array data.
     */
    readonly data: Int16Array;
    protected size: number;

    protected constructor(data: Int16Array, size: number) {
        this.data = data;
        this.size = size;
    }

    /**
     * The length of the coordinates data.
     */
    get length(): number {
        return this.size;
    }

    /**
     * The vector at an index.
     * @param index The index
     * @returns The vector
     */
    at(index: number): Vector {
        return new Vector(
            this.data[Coords.xOffset(index)],
            this.data[Coords.yOffset(index)],
        );
    }
}

/**
 * Coordinates builder helper class.
 */
export class CoordsBuilder extends Coords {
    /**
     * Creates a coordinates builder with capacity.
     * @param capacity The capacity
     */
    constructor(capacity: number) {
        super(new Int16Array(Coords.N * capacity), 0);
    }

    /**
     * Adds a vector to the coordinates builder.
     * @param vector The vector to add
     */
    push({ x, y }: Vector): void {
        this.data[Coords.xOffset(this.size)] = x;
        this.data[Coords.yOffset(this.size)] = y;
        this.size++;
    }

    /**
     * Finishes the coordinates building.
     * @returns The finished coordinates
     */
    finish(): Coords {
        return new Coords(this.data.slice(0, Coords.N * this.size), this.size);
    }
}
