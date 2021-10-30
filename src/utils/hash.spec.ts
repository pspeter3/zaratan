import { hashList, hashText } from "./hash";

describe("hash", () => {
    describe("hashList", () => {
        it("should hash a list of numbers", () => {
            expect(hashList([0])).not.toBe(0);
        });

        it("should utilize the seed", () => {
            expect(hashList([0])).not.toBe(hashList([0], 1));
        });
    });

    describe("hashText", () => {
        it("should hash a string", () => {
            expect(hashText("zaratan")).toBe(1793408449);
        });
    });
});
