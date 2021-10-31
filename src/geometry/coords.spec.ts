import { createCoords, readCoords, sliceCoords, writeCoords } from "./coords";
import { Vector } from "./vector";

describe("coords", () => {
    describe("createCoords", () => {
        it("should create coordinates", () => {
            expect(createCoords(2)).toHaveLength(4);
        });
    });

    describe("sliceCoords", () => {
        it("should slice coordinates", () => {
            expect(sliceCoords(createCoords(2), 1)).toHaveLength(2);
        });
    });

    describe("writeCoords", () => {
        it("should write the values", () => {
            const coords = new Int16Array(4);
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
            const coords = Int16Array.from([3, 4, 6, 8]);
            expect(readCoords(coords, 1)).toEqual({ x: 6, y: 8 });
        });
    });
});
