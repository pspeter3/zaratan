import { TAU } from "../utils/constants";
import { mix } from "../utils/math";
import { HashNoise } from "../utils/noise";
import { Bounds } from "./bounds";
import { createCoords, readCoords, sliceCoords, writeCoords } from "./coords";
import { Vector } from "./vector";

export interface PoissonConfig {
    readonly radius: number;
    readonly bounds: Bounds;
    readonly noise: HashNoise;
    readonly limit?: number;
    readonly edges?: boolean;
}

export class Poisson {
    private static readonly LIMIT = 4;

    /**
     * Performs a Poisson disk sampling.
     * @param config The sample configuration
     * @returns The sampled coordinates
     */
    static sample({
        radius,
        bounds,
        noise,
        limit,
        edges,
    }: PoissonConfig): Int16Array {
        const poisson = new Poisson(
            radius,
            bounds,
            noise,
            limit ?? Poisson.LIMIT,
        );
        if (edges) {
            poisson.sampleCorners();
            poisson.sampleEdges();
        } else {
            const center = bounds.center();
            poisson.sample(
                new Vector(
                    mix(
                        bounds.xMin,
                        bounds.xMax,
                        poisson.random(center.x, center.y),
                    ),
                    mix(
                        bounds.yMin,
                        bounds.yMax,
                        poisson.random(center.y, center.x),
                    ),
                ).round(),
            );
        }
        poisson.fill();
        return poisson.coords();
    }

    private readonly radius: number;
    private readonly bounds: Bounds;
    private readonly noise: HashNoise;
    private readonly limit: number;
    private readonly keys: ReadonlyArray<number>;
    private readonly cell: number;
    private readonly factor: number;
    private readonly rquad: number;
    private readonly grid: Bounds;
    private readonly data: Int16Array;
    private count: number;
    private cells: Map<number, number>;
    private queue: number[];

    private constructor(
        radius: number,
        bounds: Bounds,
        noise: HashNoise,
        limit: number,
    ) {
        this.radius = radius;
        this.bounds = bounds;
        this.noise = noise;
        this.limit = limit;
        this.keys = [
            this.radius,
            this.bounds.xMin,
            this.bounds.yMin,
            this.bounds.xMax,
            this.bounds.yMax,
        ];
        this.cell = this.radius * Math.SQRT1_2;
        this.factor = 1 / this.cell;
        this.rquad = this.radius * this.radius;
        this.grid = Bounds.fromSize(
            this.bounds.size.scale(this.factor).ceil().add(new Vector(1, 1)),
        );
        this.data = createCoords(this.grid.width * this.grid.height);
        this.count = 0;
        this.cells = new Map();
        this.queue = [];
    }

    private coords(): Int16Array {
        return sliceCoords(this.data, this.count);
    }

    private fill(): void {
        while (this.queue.length > 0) {
            const index = Math.floor(
                this.queue.length * this.random(this.count, this.queue.length),
            );
            const vector = readCoords(this.data, index);
            const candidate = this.pick(vector);
            if (candidate !== null) {
                this.sample(candidate);
            } else {
                const i = this.queue.pop();
                if (index < this.queue.length && i !== undefined) {
                    this.queue[index] = i;
                }
            }
        }
    }

    private gridCell(vector: Vector): Vector {
        return vector.scale(this.factor).floor();
    }

    private id(vector: Vector): number {
        return vector.y * this.grid.width + vector.x;
    }

    private isValid(vector: Vector): boolean {
        if (!this.bounds.contains(vector)) {
            return false;
        }
        const location = this.gridCell(vector);
        const xMin = Math.max(location.x - 2, 0);
        const xMax = Math.min(location.x + 3, this.grid.width);
        const yMin = Math.max(location.y - 2, 0);
        const yMax = Math.min(location.y + 3, this.grid.height);
        for (let y = yMin; y < yMax; y++) {
            const offset = y * this.grid.width;
            for (let x = xMin; x < xMax; x++) {
                const id = offset + x;
                const index = this.cells.get(id);
                if (
                    index !== undefined &&
                    vector.quadrance(readCoords(this.data, index)) < this.rquad
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    private pick(vector: Vector): Vector | null {
        const seed = this.random(this.count, vector.x, vector.y);
        for (let i = 0; i < this.limit; i++) {
            const angle = TAU * (seed + i / this.limit);
            const delta = Vector.fromPolar(this.radius, angle).snap();
            const candidate = vector.add(delta);
            if (this.isValid(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private random(...values: ReadonlyArray<number>) {
        return this.noise(this.keys.concat(values));
    }

    private sample(vector: Vector): void {
        const id = this.id(this.gridCell(vector));
        writeCoords(this.data, this.count, vector);
        this.cells.set(id, this.count);
        this.queue.push(this.count);
        this.count++;
    }

    private sampleCorners(): void {
        for (const x of this.bounds.xRange()) {
            for (const y of this.bounds.yRange()) {
                this.sample(new Vector(x, y));
            }
        }
    }

    private sampleEdges(): void {
        for (
            let x = this.bounds.xMin + this.radius;
            x <= this.bounds.xMax - this.radius;
            x += this.radius
        ) {
            this.sample(new Vector(x, this.bounds.yMin));
            this.sample(new Vector(x, this.bounds.yMax));
        }
        for (
            let y = this.bounds.yMin + this.radius;
            y <= this.bounds.yMax - this.radius;
            y += this.radius
        ) {
            this.sample(new Vector(this.bounds.xMin, y));
            this.sample(new Vector(this.bounds.xMax, y));
        }
    }
}
