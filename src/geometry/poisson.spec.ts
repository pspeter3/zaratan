import { createHashNoise } from "../utils/noise";
import { Bounds } from "./bounds";
import { Poisson } from "./poisson";
import { Vector } from "./vector";

describe("Poisson", () => {
    const noise = createHashNoise(0);

    it("should fill corners", () => {
        const radius = 24;
        const coords = Poisson.sample({
            radius,
            bounds: Bounds.fromSize(new Vector(radius, radius)),
            noise,
            edges: true,
        });
        expect(coords).toHaveLength(4);
    });

    it("should fill edges", () => {
        const radius = 24;
        const coords = Poisson.sample({
            radius,
            bounds: Bounds.fromSize(new Vector(radius, radius).scale(2)),
            noise,
            edges: true,
        });
        expect(coords).toHaveLength(8);
    });

    it("should fill the disk with edges", () => {
        const radius = 24;
        const coords = Poisson.sample({
            radius,
            bounds: Bounds.fromSize(new Vector(radius, radius).scale(4)),
            noise,
            edges: true,
        });
        expect(coords.length).toBeGreaterThan(8);
    });

    it("should fill the disk without edges", () => {
        const radius = 24;
        const coords = Poisson.sample({
            radius,
            bounds: Bounds.fromSize(new Vector(radius, radius).scale(4)),
            noise,
        });
        expect(coords.length).toBeGreaterThan(2);
    });
});
