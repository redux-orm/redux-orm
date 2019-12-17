const { Model, ORM, createSelector, fk } = require("../../../lib"); // eslint-disable-line import/no-unresolved

describe("ES5 library code", () => {
    describe("With ES6 client code", () => {
        let orm;
        let emptyState;
        let ormState;
        const stateSelector = () => ormState;
        let reducer;

        const CREATE_BOOK = "CREATE_BOOK";
        const CREATE_AUTHOR = "CREATE_AUTHOR";

        beforeEach(() => {
            class Book extends Model {}
            Book.fields = {
                authorId: fk({
                    to: "Author",
                    as: "author",
                    relatedName: "books",
                }),
            };
            Book.modelName = "Book";
            class Author extends Model {}
            Author.modelName = "Author";
            orm = new ORM({ stateSelector });
            orm.register(Book, Author);
            reducer = (state, action) => {
                const session = orm.session(state || orm.getEmptyState());
                switch (action.type) {
                    case CREATE_AUTHOR:
                        session.Author.create(action.payload);
                        break;
                    case CREATE_BOOK:
                        session.Book.create(action.payload);
                        break;
                    default:
                        break;
                }
                return session.state;
            };
            emptyState = orm.getEmptyState();
            ormState = emptyState;
        });

        it("Model CRUD works", () => {
            const session = orm.session();
            let book;
            expect(() => {
                book = session.Book.create({ id: 1, title: "title" });
            }).not.toThrow();
            expect(() => {
                book.update({ id: 1, title: "new title" });
            }).not.toThrow();
        });

        it("Selectors can be created from selector specs", () => {
            const bookAuthor = createSelector(orm.Book.author);
            expect(bookAuthor(ormState, 1)).toBe(null);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    title: "title",
                    authorId: 123,
                },
            });
            expect(bookAuthor(ormState, 1)).toBe(null);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 123,
                },
            });
            expect(bookAuthor(ormState, 1)).toEqual({ id: 123 });
        });
    });
});
