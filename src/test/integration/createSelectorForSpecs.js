import { ORM, Model } from "../..";
import { createSelector, createSelectorFor } from "../../redux";
import { createTestModels } from "../helpers";

describe("createSelectorFor shorthand selector specifications", () => {
    let orm;
    let reducer;
    let emptyState;
    let ormState;
    const stateSelector = () => ormState;
    let Book;
    let Cover;
    let Genre;
    let Tag;
    let Author;
    let Publisher;
    let Movie;
    const zeroAndTwo = [0, 2];

    const CREATE_MOVIE = "CREATE_MOVIE";
    const CREATE_PUBLISHER = "CREATE_PUBLISHER";
    const UPSERT_PUBLISHER = "UPSERT_PUBLISHER";
    const CREATE_BOOK = "CREATE_BOOK";
    const CREATE_COVER = "CREATE_COVER";
    const CREATE_AUTHOR = "CREATE_AUTHOR";
    const CREATE_TAG = "CREATE_TAG";

    const consoleWarn = jest
        .spyOn(global.console, "warn")
        .mockImplementation((msg) => msg);

    beforeEach(() => {
        ({
            Book,
            Cover,
            Genre,
            Tag,
            Author,
            Movie,
            Publisher,
        } = createTestModels());
        orm = new ORM({ stateSelector });
        orm.register(Book, Cover, Genre, Tag, Author, Movie, Publisher);
        reducer = (state, action) => {
            const session = orm.session(state || orm.getEmptyState());
            switch (action.type) {
                case CREATE_MOVIE:
                    session.Movie.create(action.payload);
                    break;
                case CREATE_PUBLISHER:
                    session.Publisher.create(action.payload);
                    break;
                case UPSERT_PUBLISHER:
                    session.Publisher.upsert(action.payload);
                    break;
                case CREATE_BOOK:
                    session.Book.create(action.payload);
                    break;
                case CREATE_COVER:
                    session.Cover.create(action.payload);
                    break;
                case CREATE_AUTHOR:
                    session.Author.create(action.payload);
                    break;
                case CREATE_TAG:
                    session.Tag.create(action.payload);
                    break;
                default:
                    break;
            }
            return session.state;
        };
        emptyState = orm.getEmptyState();
        ormState = emptyState;
    });

    it("throws for invalid arguments", () => {
        const EMPTY_MSG =
            "`createSelectorFor()` takes one argument of the form `orm.Model`, e.g. `orm.Book`.";
        const INVALID_MSG =
            "The argument you passed to `createSelectorFor(orm.Model)` must be a model selector specification, e.g. `orm.Book`.";
        expect(() => {
            createSelectorFor();
        }).toThrow(EMPTY_MSG);
        expect(() => {
            createSelectorFor(undefined);
        }).toThrow(EMPTY_MSG);
        expect(() => {
            createSelectorFor(null);
        }).toThrow(EMPTY_MSG);
        expect(() => {
            createSelectorFor({});
        }).toThrow(INVALID_MSG);
        expect(() => {
            createSelectorFor([]);
        }).toThrow(INVALID_MSG);
        expect(() => {
            createSelectorFor(1);
        }).toThrow(INVALID_MSG);
        expect(() => {
            createSelectorFor("a");
        }).toThrow(INVALID_MSG);
    });

    it("handles ORM instances and selector specs correctly", () => {
        expect(() => {
            createSelectorFor(orm.Book)(orm);
        }).toThrow(
            "ORM instances cannot be the result function of selectors. You can access your models in the last function that you pass to `createSelectorFor()`."
        );
        expect(() => {
            createSelectorFor(orm.Book)(() => {}, orm);
        }).toThrow(
            "ORM instances cannot be the result function of selectors. You can access your models in the last function that you pass to `createSelectorFor()`."
        );
        const ormWithoutStateSelector = new ORM();
        class ExampleModel1 extends Model {}
        ExampleModel1.modelName = "ExampleModel1";
        ormWithoutStateSelector.register(ExampleModel1);
        expect(() => {
            createSelectorFor(
                ormWithoutStateSelector.ExampleModel1
            )(ormWithoutStateSelector, () => {});
        }).toThrow(
            "Failed to resolve the current ORM database state. Please pass an object to the ORM constructor that specifies a `stateSelector` function."
        );
        const ormWithInvalidStateSelector = new ORM({
            stateSelector: "I should be a function",
        });
        class ExampleModel2 extends Model {}
        ExampleModel2.modelName = "ExampleModel2";
        ormWithInvalidStateSelector.register(ExampleModel2);
        expect(() => {
            createSelectorFor(
                ormWithInvalidStateSelector.ExampleModel2
            )(ormWithInvalidStateSelector, () => {});
        }).toThrow(
            'Failed to resolve the current ORM database state. Please pass a function when specifying the ORM\'s `stateSelector`. Received: "I should be a function" of type string'
        );
    });

    it("warns when ignoring selectors", () => {
        expect(consoleWarn).toHaveBeenCalledTimes(0);
        createSelectorFor(orm.Publisher)(() => {}, orm.Publisher);
        expect(consoleWarn).toHaveBeenCalledTimes(1);
        expect(consoleWarn.mock.results[0].value).toEqual(
            "Your input selectors will be ignored: the passed result function does not require any input."
        );
    });

    describe("model selector specs", () => {
        let publishers;

        beforeEach(() => {
            publishers = createSelectorFor(orm.Publisher)(orm.Publisher);
        });

        it("equals createSelector with just a model-based spec", () => {
            expect(publishers).toBe(createSelector(orm.Publisher));
        });

        it("return correct values for empty state", () => {
            expect(publishers(emptyState, 1)).toEqual(null);
            expect(publishers(emptyState, 1)).toEqual(null);

            expect(publishers(emptyState, zeroAndTwo)).toEqual([null, null]);
            expect(publishers(emptyState, zeroAndTwo)).toEqual([null, null]);

            expect(publishers(emptyState, [])).toEqual([]);
            expect(publishers(emptyState, [])).toEqual([]);

            expect(publishers(emptyState)).toEqual([]);
            expect(publishers(emptyState)).toEqual([]);
        });

        it("will recompute single instances", () => {
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                    name: "First publisher",
                },
            });
            const ref = publishers(ormState, 1);
            expect(ref).toEqual({
                id: 1,
                name: "First publisher",
            });
            expect(publishers(ormState, 1)).toBe(ref);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 2,
                    name: "Second publisher",
                },
            });
            expect(publishers(ormState, 1)).toBe(ref);
            expect(publishers(ormState, 2)).toEqual({
                id: 2,
                name: "Second publisher",
            });
            expect(publishers(ormState, 1)).toBe(ref);
            ormState = reducer(ormState, {
                type: UPSERT_PUBLISHER,
                payload: {
                    id: 1,
                    name: "New name",
                },
            });
            expect(publishers(ormState, 1)).not.toBe(ref);
            expect(publishers(ormState, 1)).toEqual({
                id: 1,
                name: "New name",
            });
        });

        it("will recompute some model instances by ID array", () => {
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                },
            });
            expect(publishers(ormState, zeroAndTwo)).toEqual([null, null]);
            /**
             * Note that the above only recomputes because we need to
             * perform a full-table scan there, even if we knew before
             * exactly which IDs we wanted to access. This should
             * be fixable by allowing arrays as filter arguments.
             */
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 2,
                },
            });
            expect(publishers(ormState, zeroAndTwo)).toEqual([null, { id: 2 }]);
            expect(publishers(ormState, zeroAndTwo)).toEqual([null, { id: 2 }]);
        });

        it("will recompute all model instances", () => {
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                    name: "First publisher",
                },
            });
            expect(publishers(ormState)).toEqual([
                { id: 1, name: "First publisher" },
            ]);
            expect(publishers(ormState)).toEqual([
                { id: 1, name: "First publisher" },
            ]);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 2,
                    name: "Second publisher",
                },
            });
            expect(publishers(ormState)).toEqual([
                { id: 1, name: "First publisher" },
                { id: 2, name: "Second publisher" },
            ]);
            ormState = reducer(ormState, {
                type: UPSERT_PUBLISHER,
                payload: {
                    id: 2,
                },
            });
            // Update should not have happened!
            expect(publishers(ormState)).toEqual([
                { id: 1, name: "First publisher" },
                { id: 2, name: "Second publisher" },
            ]);
        });
    });

    describe("custom selectors", () => {
        let authorKind;
        let authorRef;
        let authorBookTitles;
        let authorLatestBookYear;
        const oneAndThree = [1, 3];

        beforeEach(() => {
            authorKind = createSelectorFor(orm.Author)(
                orm.Author.books,
                (books) => (books.length > 10 ? "famous" : "unknown")
            );
            authorRef = createSelectorFor(orm.Author)(
                orm.Author,
                (author) => author
            );
            authorBookTitles = createSelectorFor(orm.Author)(
                orm.Author.books,
                (books) => books.map((book) => book.title)
            );
            const bookReleaseYear = createSelectorFor(orm.Book)(
                orm.Book.releaseYear
            );
            authorLatestBookYear = createSelectorFor(
                orm.Author
            )(orm.Author.books.map(bookReleaseYear), (years) =>
                years.length ? Math.max(years) : -1
            );
        });

        it("return correct values for empty state", () => {
            expect(authorKind(emptyState, 1)).toEqual(null);
            expect(authorKind(emptyState, 1)).toEqual(null);

            expect(authorKind(emptyState, oneAndThree)).toEqual([null, null]);
            expect(authorKind(emptyState, oneAndThree)).toEqual([null, null]);

            expect(authorKind(emptyState, [])).toEqual([]);
            expect(authorKind(emptyState, [])).toEqual([]);

            expect(authorKind(emptyState)).toEqual([]);
            expect(authorKind(emptyState)).toEqual([]);

            expect(authorRef(emptyState, 1)).toEqual(null);
            expect(authorRef(emptyState, 1)).toEqual(null);

            expect(authorRef(emptyState, oneAndThree)).toEqual([null, null]);
            expect(authorRef(emptyState, oneAndThree)).toEqual([null, null]);

            expect(authorRef(emptyState, [])).toEqual([]);
            expect(authorRef(emptyState, [])).toEqual([]);

            expect(authorRef(emptyState)).toEqual([]);
            expect(authorRef(emptyState)).toEqual([]);

            expect(authorBookTitles(emptyState, 1)).toEqual(null);
            expect(authorBookTitles(emptyState, 1)).toEqual(null);

            expect(authorBookTitles(emptyState, oneAndThree)).toEqual([
                null,
                null,
            ]);
            expect(authorBookTitles(emptyState, oneAndThree)).toEqual([
                null,
                null,
            ]);

            expect(authorBookTitles(emptyState, [])).toEqual([]);
            expect(authorBookTitles(emptyState, [])).toEqual([]);

            expect(authorBookTitles(emptyState)).toEqual([]);
            expect(authorBookTitles(emptyState)).toEqual([]);

            expect(authorLatestBookYear(emptyState, 1)).toEqual(null);
            expect(authorLatestBookYear(emptyState, 1)).toEqual(null);

            expect(authorLatestBookYear(emptyState, oneAndThree)).toEqual([
                null,
                null,
            ]);
            expect(authorLatestBookYear(emptyState, oneAndThree)).toEqual([
                null,
                null,
            ]);

            expect(authorLatestBookYear(emptyState, [])).toEqual([]);
            expect(authorLatestBookYear(emptyState, [])).toEqual([]);

            expect(authorLatestBookYear(emptyState)).toEqual([]);
            expect(authorLatestBookYear(emptyState)).toEqual([]);
        });

        it("transforms the result depending on the ID argument", () => {
            ormState = reducer(emptyState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    name: "First author",
                },
            });

            expect(authorRef(ormState, 1)).toEqual({
                id: 1,
                name: "First author",
            });
            expect(authorRef(ormState, oneAndThree)).toEqual([
                {
                    id: 1,
                    name: "First author",
                },
                null,
            ]);
            expect(authorRef(ormState, [])).toEqual([]);
            expect(authorRef(ormState)).toEqual([
                { id: 1, name: "First author" },
            ]);
            expect(authorRef(ormState)).toEqual([
                { id: 1, name: "First author" },
            ]);
        });

        it("caches results by the ID argument", () => {
            ormState = reducer(emptyState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    name: "First author",
                },
            });

            const oneArr = [1];
            authorRef(ormState, 1);
            expect(authorRef.recomputations()).toBe(1);
            authorRef(ormState, oneAndThree);
            expect(authorRef.recomputations()).toBe(2);
            authorRef(ormState, oneAndThree);
            expect(authorRef.recomputations()).toBe(2);
            authorRef(ormState, []);
            expect(authorRef.recomputations()).toBe(3);
            authorRef(ormState);
            expect(authorRef.recomputations()).toBe(4);
            authorRef(ormState);
            expect(authorRef.recomputations()).toBe(4);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 2,
                    name: "Second author",
                },
            });
        });

        it("will recompute for changing single instances", () => {
            expect(authorKind(emptyState, 1)).toEqual(null);
            expect(authorKind(emptyState, 2)).toEqual(null);
            ormState = reducer(emptyState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    name: "First author",
                },
            });
            expect(authorKind(ormState, 1)).toEqual("unknown");
        });

        it("transforms the result for FK field selectors depending on the ID argument", () => {
            ormState = reducer(emptyState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    name: "First author",
                },
            });

            expect(authorBookTitles(ormState, 1)).toEqual([]);
            expect(authorBookTitles(ormState, oneAndThree)).toEqual([[], null]);
            expect(authorBookTitles(ormState, [])).toEqual([]);
            expect(authorBookTitles(ormState)).toEqual([[]]);
            expect(authorBookTitles(ormState)).toEqual([[]]);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    title: "A book",
                    author: 1,
                    releaseYear: 2021,
                },
            });
            expect(authorBookTitles(ormState)).toEqual([["A book"]]);
            expect(authorBookTitles(ormState, 1)).toEqual(["A book"]);
        });

        it("transforms the result for mapped selectors depending on the ID argument", () => {
            ormState = reducer(emptyState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    name: "First author",
                },
            });

            expect(authorLatestBookYear(ormState, 1)).toBe(-1);
            expect(authorLatestBookYear(ormState, oneAndThree)).toEqual([
                -1,
                null,
            ]);
            expect(authorLatestBookYear(ormState, [])).toEqual([]);
            expect(authorLatestBookYear(ormState)).toEqual([-1]);
            expect(authorLatestBookYear(ormState)).toEqual([-1]);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    title: "A book",
                    author: 1,
                    releaseYear: 2021,
                },
            });
            expect(authorLatestBookYear(ormState)).toEqual([2021]);
            expect(authorLatestBookYear(ormState, 1)).toEqual(2021);
        });

        it("detects keyed selectors as dependencies for model", () => {
            const authorDescription = createSelectorFor(orm.Author)(
                orm.Author,
                authorLatestBookYear,
                (author, year) =>
                    `${author.name}, ${
                        year === -1
                            ? "never published"
                            : `last published in ${year}`
                    }`
            );
            ormState = reducer(emptyState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    name: "Jane Doe",
                },
            });
            expect(authorDescription(ormState, 1)).toBe(
                "Jane Doe, never published"
            );
            expect(authorDescription(ormState, [1])).toStrictEqual([
                "Jane Doe, never published",
            ]);
            expect(authorDescription(ormState, oneAndThree)).toStrictEqual([
                "Jane Doe, never published",
                null,
            ]);
            expect(authorDescription(ormState)).toStrictEqual([
                "Jane Doe, never published",
            ]);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    title: "A book",
                    author: 1,
                    releaseYear: 2021,
                },
            });
            expect(authorDescription(ormState, 1)).toBe(
                "Jane Doe, last published in 2021"
            );
            expect(authorDescription(ormState, [1])).toStrictEqual([
                "Jane Doe, last published in 2021",
            ]);
            expect(authorDescription(ormState, oneAndThree)).toStrictEqual([
                "Jane Doe, last published in 2021",
                null,
            ]);
            expect(authorDescription(ormState)).toStrictEqual([
                "Jane Doe, last published in 2021",
            ]);
        });
    });

    describe("chained relational field specs", () => {
        it("will exist for back-and-forth fields", () => {
            const bookItself = createSelectorFor(orm.Book)(
                orm.Book.cover.book.cover.book
            );
            expect(bookItself).not.toBeUndefined();
            expect(bookItself(emptyState, 1)).toEqual(null);
            ormState = reducer(emptyState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    cover: 123,
                },
            });
            expect(bookItself(ormState, 1)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 123,
                },
            });
            expect(bookItself(ormState, 1)).toEqual(ormState.Book.itemsById[1]);
        });
    });
});
