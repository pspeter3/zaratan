import { inversestep, linear, smootherstep, smoothstep } from "./easings";

describe("easings", () => {
    function createEasingSuite(
        name: string,
        easing: (t: number) => number,
    ): void {
        // eslint-disable-next-line jest/valid-title
        describe(name, () => {
            it("should be 0 for 0", () => {
                expect(easing(0)).toBeCloseTo(0);
            });

            it("should be 1 for 1", () => {
                expect(easing(1)).toBe(1);
            });

            it("should be 0.5 for 0.5", () => {
                expect(easing(0.5)).toBe(0.5);
            });
        });
    }
    createEasingSuite("linear", linear);
    createEasingSuite("smoothstep", smoothstep);
    createEasingSuite("smootherstep", smootherstep);
    createEasingSuite("inversestep", inversestep);
});
