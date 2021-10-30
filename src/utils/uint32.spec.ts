import { float53, rotateBits, uint32 } from "./uint32";

describe("uint32", () => {
    it("should convert numbers to unsigned integers", () => {
        expect(uint32(3.4)).toBe(3);
        expect(uint32(-1)).toBe(Math.pow(2, 32) - 1);
    });

    it("should convert to floats", () => {
        expect(float53(0)).toBe(0);
        expect(float53(Math.pow(2, 32) - 1)).not.toBe(1);
    });

    it("should rotate bits left", () => {
        expect(rotateBits(1, 1)).toBe(2);
    });
});
