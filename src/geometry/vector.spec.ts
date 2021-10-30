import { Vector } from "./vector";

describe("Vector", () => {
    describe("fromPolar", () => {
        it("should create a vector from polar coordinates", () => {
            expect(Vector.fromPolar(5, 0.93).round()).toEqual({ x: 3, y: 4 });
        });
    });

    describe("fromTuple", () => {
        it("should create a vector from an array", () => {
            expect(Vector.fromTuple([1, 1])).toEqual({ x: 1, y: 1 });
        });

        it("should create a vector from a typed array", () => {
            expect(Vector.fromTuple(Uint16Array.from([1, 1]))).toEqual({
                x: 1,
                y: 1,
            });
        });
    });

    describe("constructor", () => {
        it("should create a vector from values", () => {
            expect(new Vector(1, 1)).toEqual({ x: 1, y: 1 });
        });
    });

    describe("magnitude", () => {
        it("should calculate the length", () => {
            expect(new Vector(3, 4)).toHaveLength(5);
        });

        it("should calculate the length squared", () => {
            expect(new Vector(1, 1).quad).toBe(2);
        });
    });

    describe("arithmetic", () => {
        it("should support addition", () => {
            expect(new Vector(1, 1).add(new Vector(1, 1))).toEqual({
                x: 2,
                y: 2,
            });
        });

        it("should support subtraction", () => {
            expect(new Vector(1, 1).sub(new Vector(1, 1))).toEqual({
                x: 0,
                y: 0,
            });
        });

        it("should support multiplication", () => {
            expect(new Vector(1, 1).scale(2)).toEqual({ x: 2, y: 2 });
        });
    });

    describe("floats", () => {
        it("should round", () => {
            expect(new Vector(3.1, 3.9).round()).toEqual({ x: 3, y: 4 });
        });

        it("should floor", () => {
            expect(new Vector(3.1, 3.9).floor()).toEqual({ x: 3, y: 3 });
        });

        it("should ceil", () => {
            expect(new Vector(3.1, 3.9).ceil()).toEqual({ x: 4, y: 4 });
        });

        it("should trucate", () => {
            expect(new Vector(-3.1, -3.9).trunc()).toEqual({ x: -3, y: -3 });
        });

        it("should snap", () => {
            expect(new Vector(-3.1, -3.9).snap()).toEqual({ x: -4, y: -4 });
        });
    });

    describe("distance", () => {
        it("should support distance", () => {
            expect(new Vector(1, 1).distance(new Vector(4, 5))).toBe(5);
        });

        it("should support quadrance", () => {
            expect(new Vector(1, 1).quadrance(new Vector(2, 2))).toBe(2);
        });
    });

    describe("swap", () => {
        it("should swap the components", () => {
            expect(new Vector(3, 4).swap()).toEqual({ x: 4, y: 3 });
        });
    });

    describe("tuple", () => {
        it("should create a tuple of the components", () => {
            expect(new Vector(3, 4).tuple()).toEqual([3, 4]);
        });
    });
});
