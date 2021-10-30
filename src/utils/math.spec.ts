import { snap } from "./math";

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
});
