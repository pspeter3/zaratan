import { CoordsBuilder } from "./coords";
import { Vector } from "./vector";

describe("Coords", () => {
    it("should be able to build coordinates", () => {
        const builder = new CoordsBuilder(2);
        builder.push(new Vector(4, 4));
        const coords = builder.finish();
        expect(coords).toHaveLength(1);
        expect(coords.at(0)).toEqual({ x: 4, y: 4 });
    });
});
