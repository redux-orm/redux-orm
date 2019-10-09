import ManyToMany from "../../fields/ManyToMany";

describe("Fields", () => {
    describe("ManyToMany", () => {
        describe("getDefault", () => {
            it("returns empty array", () => {
                const m2m = new ManyToMany();
                expect(m2m.getDefault()).toEqual([]);
            });
        });
    });
});
