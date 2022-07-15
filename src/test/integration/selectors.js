import { ORM, Session, Model, fk, oneToOne, createSelector } from "../..";
import { createTestModels, avg } from "../helpers";

describe("Shorthand selector specifications", () => {
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
        expect(() => {
            createSelector();
        }).toThrow("Cannot create a selector without arguments.");
        expect(() => {
            createSelector(undefined);
        }).toThrow(
            "Failed to interpret selector argument: undefined of type undefined"
        );
        expect(() => {
            createSelector(null);
        }).toThrow(
            "Failed to interpret selector argument: null of type object"
        );
        expect(() => {
            createSelector({});
        }).toThrow("Failed to interpret selector argument: {} of type object");
        expect(() => {
            createSelector([]);
        }).toThrow("Failed to interpret selector argument: [] of type object");
        expect(() => {
            createSelector(1);
        }).toThrow("Failed to interpret selector argument: 1 of type number");
        expect(() => {
            createSelector("a");
        }).toThrow('Failed to interpret selector argument: "a" of type string');
    });

    it("handles ORM instances and selector specs correctly", () => {
        expect(() => {
            createSelector(orm);
        }).toThrow(
            "ORM instances cannot be the result function of selectors. You can access your models in the last function that you pass to `createSelector()`."
        );
        expect(() => {
            createSelector(() => {}, orm);
        }).toThrow(
            "ORM instances cannot be the result function of selectors. You can access your models in the last function that you pass to `createSelector()`."
        );
        expect(() => {
            createSelector(() => {});
        }).toThrow(
            "Failed to resolve the current ORM database state. Please pass an ORM instance or an ORM selector as an argument to `createSelector()`."
        );
        const ormWithoutStateSelector = new ORM();
        expect(() => {
            createSelector(ormWithoutStateSelector, () => {});
        }).toThrow(
            "Failed to resolve the current ORM database state. Please pass an object to the ORM constructor that specifies a `stateSelector` function."
        );
        const ormWithInvalidStateSelector = new ORM({
            stateSelector: "I should be a function",
        });
        expect(() => {
            createSelector(ormWithInvalidStateSelector, () => {});
        }).toThrow(
            'Failed to resolve the current ORM database state. Please pass a function when specifying the ORM\'s `stateSelector`. Received: "I should be a function" of type string'
        );
    });

    it("warns when ignoring selectors", () => {
        expect(consoleWarn).toHaveBeenCalledTimes(0);
        createSelector(() => {}, orm.Publisher);
        expect(consoleWarn).toHaveBeenCalledTimes(1);
        expect(consoleWarn.mock.results[0].value).toEqual(
            "Your input selectors will be ignored: the passed result function does not require any input."
        );
    });

    it("caches spec-based selectors by ORM", () => {
        const authors = createSelector(orm.Author);
        const _authors = createSelector(orm.Author);
        expect(authors).toBe(_authors);

        /**
         * FIXME: Two concurrent ORMs are impossible to create.
         * They throw when trying to redefine field properties.
         *
         * Maybe this is fixable by defining isSetup on model classes directly.
         */
        /**
        const orm2 = new ORM({ stateSelector });
        orm2.register(Book, Cover, Genre, Tag, Author, Movie, Publisher);
        const authors2 = createSelector(orm2.Author);
        const _authors2 = createSelector(orm2.Author);
        expect(authors2).toBe(_authors2);

        expect(authors).not.toBe(authors2);
        */
    });

    describe("model selector specs", () => {
        let publishers;

        beforeEach(() => {
            publishers = createSelector(orm.Publisher);
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
            expect(publishers(ormState, 1).id).toEqual(1);
            expect(publishers(ormState, 1).name).toEqual("First publisher");

            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 2,
                    name: "Second publisher",
                },
            });
            expect(publishers(ormState, 1).id).toEqual(1);
            expect(publishers(ormState, 1).name).toEqual("First publisher");
            expect(publishers(ormState, 2).id).toEqual(2);
            expect(publishers(ormState, 2).name).toEqual("Second publisher");
            ormState = reducer(ormState, {
                type: UPSERT_PUBLISHER,
                payload: {
                    id: 1,
                    name: "New name",
                },
            });
            expect(publishers(ormState, 1).name).toEqual("New name");
        });

        it("returns the method instanced", () => {
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                    name: "First publisher",
                },
            });
            expect(publishers(ormState, 1).aModelMethod).toBeDefined();
            expect(publishers(ormState, 1).aModelMethod()).toBe(
                "Name: First publisher"
            );
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
            expect(publishers(ormState, zeroAndTwo)[0]).toEqual(null);
            expect(publishers(ormState, zeroAndTwo)[1].id).toEqual(2);
        });

        it("will recompute all model instances", () => {
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                    name: "First publisher",
                },
            });
            const p = publishers(ormState);
            expect(p[0].id).toEqual(1);
            expect(p[0].name).toEqual("First publisher");
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 2,
                    name: "Second publisher",
                },
            });
            const pp = publishers(ormState);
            expect(pp[0].ref).toEqual({ id: 1, name: "First publisher" });
            expect(pp[1].ref).toEqual({ id: 2, name: "Second publisher" });
            ormState = reducer(ormState, {
                type: UPSERT_PUBLISHER,
                payload: {
                    id: 2,
                },
            });
            // Update should not have happened!
            expect(publishers(ormState)[0].ref).toEqual({
                id: 1,
                name: "First publisher",
            });
            expect(publishers(ormState)[1].ref).toEqual({
                id: 2,
                name: "Second publisher",
            });
        });
    });

    describe("attr field selector specs", () => {
        let publisherNames;

        beforeEach(() => {
            publisherNames = createSelector(orm.Publisher.name);
        });

        it("return correct values for empty state", () => {
            expect(publisherNames(emptyState, 1)).toEqual(null);
            expect(publisherNames(emptyState, 1)).toEqual(null);
            expect(publisherNames(emptyState)).toEqual([]);
            expect(publisherNames(emptyState)).toEqual([]);
            expect(publisherNames(emptyState, zeroAndTwo)).toEqual([
                null,
                null,
            ]);
            expect(publisherNames(emptyState, zeroAndTwo)).toEqual([
                null,
                null,
            ]);
            expect(publisherNames(emptyState, [])).toEqual([]);
            expect(publisherNames(emptyState, [])).toEqual([]);
        });

        it("will compute attr fields", () => {
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                    name: "Publisher name!",
                },
            });
            expect(publisherNames(ormState, 1)).toEqual("Publisher name!");
            expect(publisherNames(ormState, zeroAndTwo)).toEqual([null, null]);
            expect(publisherNames(ormState)).toEqual(["Publisher name!"]);
        });
    });

    describe("foreign key field selector specs", () => {
        let moviePublisher;
        let publisherMovies;

        beforeEach(() => {
            moviePublisher = createSelector(orm.Movie.publisher);
            publisherMovies = createSelector(orm.Publisher.movies);
        });

        it("return correct values for empty state", () => {
            expect(moviePublisher(ormState, 1)).toEqual(null);
            expect(moviePublisher(ormState, [1])).toEqual([null]);
            expect(moviePublisher(ormState)).toEqual([]);

            expect(publisherMovies(ormState, 123)).toEqual(null);
            expect(publisherMovies(ormState, [123])).toEqual([null]);
            expect(publisherMovies(ormState)).toEqual([]);
        });

        it("will compute forward FK models", () => {
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 1,
                    publisherId: 123,
                },
            });
            expect(moviePublisher(ormState, 1)).toEqual({ id: 123 });
            expect(moviePublisher(ormState, [1])).toEqual([{ id: 123 }]);
            expect(moviePublisher(ormState)).toEqual([{ id: 123 }]);
            expect(moviePublisher(ormState, 1)).toEqual({ id: 123 });
        });

        it("will compute backward FK models", () => {
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherMovies(ormState, 123)).toEqual([]);
            expect(publisherMovies(ormState, [123])).toEqual([[]]);
            expect(publisherMovies(ormState)).toEqual([[]]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 1,
                    publisherId: 123,
                },
            });
            expect(publisherMovies(ormState, 123)).toEqual([
                { id: 1, publisherId: 123 },
            ]);
            expect(publisherMovies(ormState, [123])).toEqual([
                [{ id: 1, publisherId: 123 }],
            ]);
            expect(publisherMovies(ormState)).toEqual([
                [{ id: 1, publisherId: 123 }],
            ]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 2,
                    publisherId: 123,
                },
            });
            expect(publisherMovies(ormState, 123)).toEqual([
                { id: 1, publisherId: 123 },
                { id: 2, publisherId: 123 },
            ]);
            expect(publisherMovies(ormState, [123])).toEqual([
                [
                    { id: 1, publisherId: 123 },
                    { id: 2, publisherId: 123 },
                ],
            ]);
            expect(publisherMovies(ormState)).toEqual([
                [
                    { id: 1, publisherId: 123 },
                    { id: 2, publisherId: 123 },
                ],
            ]);
        });
    });

    describe("one to one field selector specs", () => {
        let bookCover;
        let coverBook;

        beforeEach(() => {
            bookCover = createSelector(orm.Book.cover);
            coverBook = createSelector(orm.Cover.book);
        });

        it("will compute forward oneToOne models", () => {
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 123,
                },
            });
            expect(bookCover(ormState, 1)).toEqual(null);
            expect(bookCover(ormState, [1])).toEqual([null]);
            expect(bookCover(ormState)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    cover: 123,
                },
            });
            expect(bookCover(ormState, 1)).toEqual({ id: 123 });
            expect(bookCover(ormState, [1])).toEqual([{ id: 123 }]);
            expect(bookCover(ormState)).toEqual([{ id: 123 }]);
            expect(bookCover(ormState, 1)).toEqual({ id: 123 });
        });

        it("will compute backward oneToOne models", () => {
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    cover: 123,
                },
            });
            expect(coverBook(ormState, 123)).toEqual(null);
            expect(coverBook(ormState, [123])).toEqual([null]);
            expect(coverBook(ormState)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 123,
                },
            });
            expect(coverBook(ormState, 123)).toEqual({
                id: 1,
                cover: 123,
            });
            expect(coverBook(ormState, [123])).toEqual([
                {
                    id: 1,
                    cover: 123,
                },
            ]);
            expect(coverBook(ormState)).toEqual([
                {
                    id: 1,
                    cover: 123,
                },
            ]);
            expect(coverBook(ormState, 123)).toEqual({
                id: 1,
                cover: 123,
            });
        });
    });

    describe("many to many field selector specs", () => {
        let authorPublishers;
        let publisherAuthors;

        beforeEach(() => {
            authorPublishers = createSelector(orm.Author.publishers);
            publisherAuthors = createSelector(orm.Publisher.authors);
        });

        it("will compute forward manyToMany models", () => {
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(authorPublishers(ormState, 1)).toEqual(null);
            expect(authorPublishers(ormState, [1])).toEqual([null]);
            expect(authorPublishers(ormState)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    publishers: [123],
                },
            });
            expect(authorPublishers(ormState, 1)).toEqual([{ id: 123 }]);
            expect(authorPublishers(ormState, [1])).toEqual([[{ id: 123 }]]);
            expect(authorPublishers(ormState)).toEqual([[{ id: 123 }]]);
            expect(authorPublishers(ormState, 1)).toEqual([{ id: 123 }]);
        });

        it("will compute backward manyToMany models", () => {
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    publishers: [123],
                },
            });
            expect(publisherAuthors(ormState, 123)).toEqual(null);
            expect(publisherAuthors(ormState, [123])).toEqual([null]);
            expect(publisherAuthors(ormState)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherAuthors(ormState, 123)).toEqual([{ id: 1 }]);
            expect(publisherAuthors(ormState, [123])).toEqual([[{ id: 1 }]]);
            expect(publisherAuthors(ormState)).toEqual([[{ id: 1 }]]);
            expect(publisherAuthors(ormState, 123)).toEqual([{ id: 1 }]);
        });
    });

    describe("chained relational field specs", () => {
        it("will not exist for collection fields", () => {
            expect(() => orm.Author.books.tags).toThrow(
                "Cannot create a selector for `books.tags` because `books` is a collection field."
            );
            expect(() => orm.Author.books.publisher).toThrow(
                "Cannot create a selector for `books.publisher` because `books` is a collection field."
            );
            expect(() => orm.Author.publishers.books).toThrow(
                "Cannot create a selector for `publishers.books` because `publishers` is a collection field."
            );
            expect(() => orm.Book.tags.subTags).toThrow(
                "Cannot create a selector for `tags.subTags` because `tags` is a collection field."
            );
        });

        it("will exist for back-and-forth fields", () => {
            const bookItself = createSelector(orm.Book.cover.book.cover.book);
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

        it("will not exist for self-referencing collections", () => {
            const _orm = new ORM({ stateSelector });
            class TreeNode extends Model {}
            TreeNode.modelName = "TreeNode";
            TreeNode.fields = {
                parent: fk("this", "subtrees"),
            };
            _orm.register(TreeNode);
            expect(() => _orm.TreeNode.subtrees.parent).toThrow(
                "Cannot create a selector for `subtrees.parent` because `subtrees` is a collection field."
            );
            expect(_orm.TreeNode.parent.parent).not.toBeUndefined();
            expect(
                _orm.TreeNode.parent.parent.parent.parent
            ).not.toBeUndefined();
        });

        it("will compute for single model instances", () => {
            const coverAuthors = createSelector(
                orm.Cover.book.publisher.authors
            );
            expect(coverAuthors(emptyState, 1)).toEqual(null);
            expect(coverAuthors(emptyState, 1)).toEqual(null);
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 4,
                },
            });
            expect(coverAuthors(ormState, 1)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 3,
                    publishers: [4],
                },
            });
            expect(coverAuthors(ormState, 1)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 2,
                    author: 3,
                    cover: 1,
                    publisher: 4,
                },
            });
            expect(coverAuthors(ormState, 1)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 1,
                },
            });
            expect(coverAuthors(ormState, 1)).toEqual([{ id: 3 }]);
            expect(coverAuthors(ormState, 1)).toEqual([{ id: 3 }]);
        });

        it("returns correct values for missing intermediate fields", () => {
            const coverAuthors = createSelector(
                orm.Cover.book.publisher.authors
            );
            expect(coverAuthors(emptyState, 1)).toEqual(null);
            expect(coverAuthors(emptyState, 1)).toEqual(null);
            ormState = reducer(emptyState, {
                type: CREATE_COVER,
                payload: {
                    id: 1,
                },
            });
            expect(coverAuthors(ormState, 1)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 2,
                    author: 3,
                    cover: 1,
                    publisher: 4,
                },
            });
            expect(coverAuthors(ormState, 1)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 4,
                },
            });
            expect(coverAuthors(ormState, 1)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 3,
                    publishers: [4],
                },
            });
            expect(coverAuthors(ormState, 1)).toEqual([{ id: 3 }]);
            expect(coverAuthors(ormState, 1)).toEqual([{ id: 3 }]);
        });

        it("can handle self-referencing many-to-many chains", () => {
            const tagSubTags = createSelector(orm.Tag.subTags);
            expect(tagSubTags(emptyState, "Technology")).toEqual(null);
            expect(tagSubTags(emptyState, "Technology")).toEqual(null);
            ormState = reducer(emptyState, {
                type: CREATE_TAG,
                payload: {
                    name: "Technology",
                    subTags: ["Redux"],
                },
            });
            expect(tagSubTags(ormState, "Technology")).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_TAG,
                payload: {
                    name: "Redux",
                },
            });
            expect(tagSubTags(ormState, "Technology")).toEqual([
                { name: "Redux" },
            ]);
        });

        it("can handle self-referencing one-to-one chains", () => {
            let _ormState;
            const _stateSelector = () => _ormState;
            const _orm = new ORM({ stateSelector: _stateSelector });
            class Yin extends Model {}
            Yin.modelName = "Yin";
            Yin.fields = {
                yang: oneToOne("this", "yin"),
            };
            _orm.register(Yin);
            const _reducer = (state, payload) => {
                const session = _orm.session(state || _orm.getEmptyState());
                session.Yin.create(payload);
                return session.state;
            };
            _ormState = _orm.getEmptyState();

            const yinItself = createSelector(_orm.Yin.yang.yin.yang.yin);
            expect(yinItself).not.toBeUndefined();
            const yinYang = createSelector(_orm.Yin.yang.yin.yang);
            expect(yinYang).not.toBeUndefined();
            const yangYin = createSelector(_orm.Yin.yin.yang.yin);
            expect(yangYin).not.toBeUndefined();

            expect(yinItself(_ormState, 1)).toBe(null);
            expect(yinYang(_ormState, 1)).toBe(null);
            expect(yangYin(_ormState, 2)).toBe(null);

            _ormState = _reducer(_ormState, { id: 1, yang: 2 });
            expect(yinItself(_ormState, 1)).toBe(null);
            expect(yinYang(_ormState, 1)).toBe(null);
            expect(yangYin(_ormState, 2)).toBe(null);

            _ormState = _reducer(_ormState, { id: 2 });
            expect(yinItself(_ormState, 1)).toBe(_ormState.Yin.itemsById[1]);
            expect(yinYang(_ormState, 1)).toBe(_ormState.Yin.itemsById[2]);
            expect(yangYin(_ormState, 2)).toBe(_ormState.Yin.itemsById[1]);
        });
    });

    describe("mapping selector specs", () => {
        it("will throw for non foreign key fields", () => {
            expect(() => orm.Publisher.movies.map(null)).toThrow(
                "`map()` requires a selector as an input. Received: null of type object"
            );
            expect(() => orm.Publisher.movies.map(() => null)).toThrow(
                "`map()` requires a selector as an input. Received: undefined of type function"
            );
            expect(() =>
                orm.Author.name.map(createSelector(orm, () => {}))
            ).toThrow("Cannot map selectors for non-collection fields");
            expect(() =>
                orm.Book.cover.map(createSelector(orm, () => {}))
            ).toThrow("Cannot map selectors for non-collection fields");
        });

        it("will throw for non-matching specs", () => {
            expect(() => orm.Book.author.books.map(orm.Book)).toThrow(
                "Cannot select models in a `map()` call. If you just want the `books` as a ref array then you can simply drop the `map()`. Otherwise make sure you're passing a field selector of the form `Book.<field>` or a custom selector instead."
            );
            expect(() => orm.Book.author.books.map(orm.Movie)).toThrow(
                "Cannot select `Movie` models in this `map()` call. Make sure you're passing a field selector of the form `Book.<field>` or a custom selector instead."
            );
            expect(() => orm.Book.author.books.map(orm.Movie.name)).toThrow(
                "Cannot select fields of the `Movie` model in this `map()` call. Make sure you're passing a field selector of the form `Book.<field>` or a custom selector instead."
            );
        });

        it("will create selectors from passed specs", () => {
            const publisherMovieNames = createSelector(
                orm.Publisher.movies.map(orm.Movie.name)
            );
            expect(publisherMovieNames(emptyState, 123)).toEqual(null); // publisher doesn't exist yet
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherMovieNames(ormState, 123)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    name: "A movie",
                    publisherId: 123,
                },
            });
            expect(publisherMovieNames(ormState, 123)).toEqual(["A movie"]);
        });

        it("will map selector outputs for forward foreign key selectors and single instances", () => {
            const movieRating = createSelector(orm.Movie.rating);
            const publisherMovieRatings = createSelector(
                orm.Publisher.movies.map(movieRating)
            );
            expect(publisherMovieRatings(emptyState, 123)).toEqual(null); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherMovieRatings(ormState, 123)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 6,
                    publisherId: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 7,
                    publisherId: 123,
                },
            });
            expect(publisherMovieRatings(ormState, 123)).toEqual([6, 7]);
        });

        it("will map selector outputs for forward foreign key selectors and some instances", () => {
            const publisherMovieRatings = createSelector(
                orm.Publisher.movies.map(orm.Movie.rating)
            );
            expect(publisherMovieRatings(emptyState, [123])).toEqual([null]); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherMovieRatings(ormState, [123])).toEqual([[]]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 6,
                    publisherId: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 7,
                    publisherId: 123,
                },
            });
            expect(publisherMovieRatings(ormState, [123])).toEqual([[6, 7]]);
        });

        it("will map selector outputs for forward foreign key selectors and all instances", () => {
            const publisherMovieRatings = createSelector(
                orm.Publisher.movies.map(orm.Movie.rating)
            );
            expect(publisherMovieRatings(emptyState)).toEqual([]); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherMovieRatings(ormState)).toEqual([[]]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 6,
                    publisherId: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 7,
                    publisherId: 123,
                },
            });
            expect(publisherMovieRatings(ormState)).toEqual([[6, 7]]);
        });

        it("can be combined when used as input selectors ", () => {
            const publisherAverageRating = createSelector(
                orm.Publisher.movies.map(orm.Movie.rating),
                (ratings) =>
                    ratings && (ratings.length ? avg(ratings) : "no movies")
            );
            expect(publisherAverageRating(emptyState, 123)).toEqual(null); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherAverageRating(ormState, 123)).toEqual("no movies");
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 6,
                    publisherId: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 7,
                    publisherId: 123,
                },
            });
            expect(publisherAverageRating(ormState, 123)).toEqual(6.5);
        });

        it("will return correct result of mapped selectors", () => {
            const authorBookTags = createSelector(
                orm.Author.books.map(orm.Book.tags)
            );
            ormState = reducer(emptyState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 123,
                    author: 1,
                    tags: ["Redux-ORM"],
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_TAG,
                payload: {
                    name: "Redux-ORM",
                },
            });
            // unrelated book
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 456,
                    author: null,
                    tags: ["Other tag"],
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_TAG,
                payload: {
                    name: "Other tag",
                },
            });
            // unrelated book and tag
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 456,
                    author: null,
                    tags: ["Other tag"],
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_TAG,
                payload: {
                    name: "Other tag",
                },
            });
            expect(authorBookTags(ormState, 1)).toEqual([
                [{ name: "Redux-ORM" }],
            ]);
        });

        it("will refresh cached result of mapped selectors", () => {
            const authorBookTags = createSelector(
                orm.Author.books.map(orm.Book.tags)
            );
            expect(authorBookTags(emptyState, 1)).toBe(null);
            ormState = reducer(emptyState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                },
            });
            expect(authorBookTags(ormState, 1)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 123,
                    author: 1,
                    tags: ["Redux-ORM"],
                },
            });
            expect(authorBookTags(ormState, 1)).toEqual([[]]);
            ormState = reducer(ormState, {
                type: CREATE_TAG,
                payload: {
                    name: "Redux-ORM",
                },
            });
            expect(authorBookTags(ormState, 1)).toEqual([
                [{ name: "Redux-ORM" }],
            ]);
        });

        it("will map using mapped selectors", () => {
            const authorBookTagNames = createSelector(
                orm.Author.books.map(orm.Book.tags.map(orm.Tag.name))
            );
            expect(authorBookTagNames(emptyState, 1)).toBe(null);
            ormState = reducer(emptyState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                },
            });
            expect(authorBookTagNames(ormState, 1)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 123,
                    author: 1,
                    tags: ["Redux-ORM"],
                },
            });
            expect(authorBookTagNames(ormState, 1)).toEqual([[]]);
            ormState = reducer(ormState, {
                type: CREATE_TAG,
                payload: {
                    name: "Redux-ORM",
                },
            });
            expect(authorBookTagNames(ormState, 1)).toEqual([["Redux-ORM"]]);
        });

        it("caches different mapped selectors correctly", () => {
            /**
             * Here, `authorBookTags` and `authorBookAuthor`
             * share the base cache path "orm.Author.books".
             * They should be stored under different keys.
             */
            const authorBookTags = createSelector(
                orm.Author.books.map(orm.Book.tags)
            );
            // should be stored in cache
            expect(authorBookTags).toBe(
                createSelector(orm.Author.books.map(orm.Book.tags))
            );
            // should be a new value in cache
            const authorBookAuthor = createSelector(
                orm.Author.books.map(orm.Book.author)
            );
            expect(authorBookTags).not.toBe(authorBookAuthor);
        });
    });
});
