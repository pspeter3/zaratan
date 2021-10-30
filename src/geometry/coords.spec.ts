import { readCoords, writeCoords } from "./coords";
import { Vector } from "./vector";

describe("coords", () => {
    describe("writeCoords", () => {
        it("should write the values", () => {
            const coords = new Int32Array(4);
            writeCoords(coords, 0, new Vector(3, 4));
            writeCoords(coords, 1, new Vector(6, 8));
            expect(coords[0]).toBe(3);
            expect(coords[1]).toBe(4);
            expect(coords[2]).toBe(6);
            expect(coords[3]).toBe(8);
        });
    });

    describe("readCoords", () => {
        it("should read the values", () => {
            const coords = Int32Array.from([3, 4, 6, 8]);
            expect(readCoords(coords, 1)).toEqual({ x: 6, y: 8 });
        });
    });
});
