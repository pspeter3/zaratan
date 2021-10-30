import { lerp, snap } from "./math";

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

    describe("lerp", () => {
        it("should return a when t is 0", () => {
            expect(lerp(1.1, 2.1, 0)).toBe(1.1);
        });

        it("should return b when t is 0", () => {
            expect(lerp(1.1, 2.1, 1)).toBe(2.1);
        });

        it("should return the midpoint when t is 0.5", () => {
            expect(lerp(1.1, 2.1, 0.5)).toBe(1.6);
        });
    });
});
