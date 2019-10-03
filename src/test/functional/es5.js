const { Model, ORM, createSelector, fk } = require("../../../lib"); // eslint-disable-line import/no-unresolved

describe("ES5 library code", () => {
    describe("With ES6 client code", () => {
        let orm;
        let session;
        const stateSelector = state => state;

        beforeEach(() => {
            class Book extends Model {
                static get fields() {
                    return {
                        authorId: fk({
                            to: "Author",
                            as: "author",
                            relatedName: "books",
                        }),
                    };
                }
            }
            Book.modelName = "Book";
            class Author extends Model {}
            Author.modelName = "Author";
            orm = new ORM({ stateSelector });
            orm.register(Book, Author);
            session = orm.session();
        });

        it("Model CRUD works", () => {
            let book;
            expect(() => {
                book = session.Book.create({ id: 1, title: "title" });
            }).not.toThrow();
            expect(() => {
                book.update({ id: 1, title: "new title" });
            }).not.toThrow();
        });

        /*
        it('Selectors can be created from selector specs', () => {
            const bookAuthor = createSelector(orm.Book.author);
            expect(bookAuthor(session.state, 1)).toBe(null);
            session.Book.create({ id: 1, title: 'title', authorId: 123 });
            expect(bookAuthor(session.state, 1)).toBe(null);
            session.Author.create({ id: 123 });
            expect(bookAuthor(session.state, 1)).toEqual({ id: 123 });
        });
        */
    });
});
