import { clamp, mix, snap, unit, weigh } from "./math";

describe("math", () => {
    describe("snap", () => {
        it("should snap negative numbers", () => {
            expect(snap(-0.618)).toBe(-1);
        });

        it("should snap positive numbers", () => {
            expect(snap(0.618)).toBe(1);
        });

        it("should handle zero", () => {
            expect(snap(0)).toBe(0);
        });
    });

    describe("mix", () => {
        it("should return a when t is 0", () => {
            expect(mix(1.1, 2.1, 0)).toBe(1.1);
        });

        it("should return b when t is 0", () => {
            expect(mix(1.1, 2.1, 1)).toBe(2.1);
        });

        it("should return the midpoint when t is 0.5", () => {
            expect(mix(1.1, 2.1, 0.5)).toBe(1.6);
        });
    });

    describe("clamp", () => {
        it("should return min when value is less than min", () => {
            expect(clamp(-1, 0, 1)).toBe(0);
        });

        it("should return max when value is greater than max", () => {
            expect(clamp(2, 0, 1)).toBe(1);
        });

        it("should return value when in bounds", () => {
            expect(clamp(0.5, 0, 1)).toBe(0.5);
        });
    });

    describe("weigh", () => {
        it("should calculate the weight", () => {
            expect(weigh(2, 0, 4)).toBe(0.5);
        });
    });

    describe("unit", () => {
        it("should calculate the weight", () => {
            expect(unit(2, 0, 4)).toBe(0.5);
        });

        it("should return 0 when value is less than min", () => {
            expect(unit(-1, 0, 4)).toBe(0);
        });

        it("should return 1 when value is greater than max", () => {
            expect(unit(5, 0, 4)).toBe(1);
        });
    });
});
