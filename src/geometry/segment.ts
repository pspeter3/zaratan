import { clamp } from "../utils/math";
import { Vector } from "./vector";

export class Segment {
    readonly a: Vector;
    readonly b: Vector;

    constructor(a: Vector, b: Vector) {
        this.a = a;
        this.b = b;
    }

    get length(): number {
        return this.a.distance(this.b);
    }

    get quad(): number {
        return this.a.quadrance(this.b);
    }

    mix(t: number): Vector {
        return this.a.mix(this.b, t);
    }

    project(vector: Vector): Vector {
        const quad = this.quad;
        if (quad === 0) {
            return this.a;
        }
        const u = vector.sub(this.a);
        const v = this.b.sub(this.a);
        const t = clamp(u.dot(v) / quad, 0, 1);
        return this.mix(t);
    }

    side(vector: Vector): number {
        const u = vector.sub(this.a);
        const v = this.b.sub(this.a).swap();
        return Math.sign(u.dot(v));
    }

    distance(vector: Vector): number {
        return Math.sqrt(this.quadrance(vector));
    }

    quadrance(vector: Vector): number {
        return this.project(vector).quadrance(vector);
    }
}
