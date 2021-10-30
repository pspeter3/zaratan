import { ORIGIN } from "../utils/constants";
import { Bounds } from "./bounds";
import { Vector } from "./vector";

describe("Bounds", () => {
    describe("fromSize", () => {
        it("should create a bounds at the origin", () => {
            expect(Bounds.fromSize(new Vector(1, 1)).origin).toBe(ORIGIN);
        });
    });

    describe("aliases", () => {
        const origin = new Vector(1, 1);
        const size = new Vector(1, 1);

        it("should have x", () => {
            expect(new Bounds(origin, size).x).toBe(origin.x);
        });

        it("should have y", () => {
            expect(new Bounds(origin, size).y).toBe(origin.y);
        });

        it("should have width", () => {
            expect(new Bounds(origin, size).width).toBe(size.x);
        });

        it("should have height", () => {
            expect(new Bounds(origin, size).height).toBe(size.y);
        });
    });

    describe("ranges", () => {
        const origin = new Vector(1, 1);
        const size = new Vector(1, 1);

        it("should have xMin", () => {
            expect(new Bounds(origin, size).xMin).toBe(origin.x);
        });

        it("should have xMax", () => {
            expect(new Bounds(origin, size).xMax).toBe(origin.x + size.x);
        });

        it("should have yMin", () => {
            expect(new Bounds(origin, size).yMin).toBe(origin.y);
        });

        it("should have yMax", () => {
            expect(new Bounds(origin, size).yMax).toBe(origin.y + size.y);
        });
    });

    describe("inBounds", () => {
        it("should support edges", () => {
            const size = new Vector(256, 256);
            const bounds = Bounds.fromSize(size);
            expect(bounds.contains(ORIGIN)).toBe(true);
            expect(bounds.contains(size)).toBe(true);
        });

        it("should support inside", () => {
            expect(
                Bounds.fromSize(new Vector(2, 2)).contains(new Vector(1, 1)),
            ).toBe(true);
        });

        it("should support outside", () => {
            const bounds = Bounds.fromSize(new Vector(2, 2));
            expect(bounds.contains(new Vector(1, -1))).toBe(false);
            expect(bounds.contains(new Vector(3, 1))).toBe(false);
            expect(bounds.contains(new Vector(1, 3))).toBe(false);
            expect(bounds.contains(new Vector(-1, 1))).toBe(false);
        });
    });
});
