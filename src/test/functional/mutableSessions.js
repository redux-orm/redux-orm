import { createTestSessionWithData } from "../helpers";

describe("Mutating session", () => {
    let session;
    let orm;
    let state;

    beforeEach(() => {
        ({ session, orm, state } = createTestSessionWithData());
    });

    it("works", () => {
        const mutating = orm.mutableSession(state);
        const { Book, Cover } = mutating;

        const cover = Cover.create({ src: "somecover.png" });
        const coverId = cover.getId();

        const book = Book.first();
        const bookRef = book.ref;
        const bookId = book.getId();
        expect(state.Book.itemsById[bookId]).toBe(bookRef);
        const newName = "New Name";

        book.name = newName;

        expect(book.name).toBe(newName);

        const nextState = mutating.state;
        expect(nextState).toBe(state);
        expect(state.Book.itemsById[bookId]).toBe(bookRef);
        expect(bookRef.name).toBe(newName);
        expect(state.Cover.itemsById[coverId].src).toBe("somecover.png");
    });
});
