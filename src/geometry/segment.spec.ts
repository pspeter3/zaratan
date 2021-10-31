import { ORIGIN } from "../utils/constants";
import { Segment } from "./segment";
import { Vector } from "./vector";

describe("Segment", () => {
    describe("length", () => {
        it("should support length", () => {
            expect(new Segment(ORIGIN, new Vector(3, 4))).toHaveLength(5);
        });

        it("should support quad length", () => {
            expect(new Segment(ORIGIN, new Vector(1, 1)).quad).toBe(2);
        });
    });

    describe("mix", () => {
        it("should interpolate between the points", () => {
            expect(
                new Segment(new Vector(1, 1), new Vector(3, 3)).mix(0.5),
            ).toEqual({ x: 2, y: 2 });
        });
    });

    describe("project", () => {
        it("should project above the line", () => {
            expect(
                new Segment(ORIGIN, new Vector(0, 2)).project(
                    new Vector(1, -1),
                ),
            ).toEqual({ x: 0, y: 0 });
        });

        it("should project below the line", () => {
            expect(
                new Segment(ORIGIN, new Vector(0, 2)).project(new Vector(1, 3)),
            ).toEqual({ x: 0, y: 2 });
        });

        it("should project on the line", () => {
            expect(
                new Segment(ORIGIN, new Vector(0, 2)).project(new Vector(1, 1)),
            ).toEqual({ x: 0, y: 1 });
        });

        it("should handle zero length lines", () => {
            expect(
                new Segment(ORIGIN, ORIGIN).project(new Vector(1, 1)),
            ).toEqual({ x: 0, y: 0 });
        });
    });

    describe("side", () => {
        it("should return 0 on the line", () => {
            const segment = new Segment(ORIGIN, new Vector(0, 2));
            expect(segment.side(new Vector(0, -1))).toBe(0);
            expect(segment.side(new Vector(0, 1))).toBe(0);
            expect(segment.side(new Vector(0, 3))).toBe(0);
        });

        it("should return 1 right of the line", () => {
            const segment = new Segment(ORIGIN, new Vector(0, 2));
            expect(segment.side(new Vector(1, -1))).toBe(1);
            expect(segment.side(new Vector(1, 1))).toBe(1);
            expect(segment.side(new Vector(1, 3))).toBe(1);
        });

        it("should return -1 left of the line", () => {
            const segment = new Segment(ORIGIN, new Vector(0, 2));
            expect(segment.side(new Vector(-1, -1))).toBe(-1);
            expect(segment.side(new Vector(-1, 1))).toBe(-1);
            expect(segment.side(new Vector(-1, 3))).toBe(-1);
        });
    });

    describe("distance", () => {
        it("should calculate distance correctly", () => {
            expect(
                new Segment(ORIGIN, new Vector(0, 5)).distance(
                    new Vector(3, 4),
                ),
            ).toBe(3);
        });

        it("should calculate quadrance correctly", () => {
            expect(
                new Segment(ORIGIN, new Vector(0, 5)).quadrance(
                    new Vector(3, 4),
                ),
            ).toBe(9);
        });
    });
});
