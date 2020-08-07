import {
    ORM,
    Session,
    Model as OrmModel,
    createReducer,
    createSelector,
} from "../..";
import { createTestModels } from "../helpers";

describe("Redux integration", () => {
    let orm;
    let Book;
    let Cover;
    let Genre;
    let Tag;
    let Author;
    let Publisher;
    let Movie;
    let emptyState;
    let ormState;
    const stateSelector = (state) => state;
    let reducer;

    let session;
    let sessionOrm;

    const CREATE_MOVIE = "CREATE_MOVIE";
    const UPSERT_MOVIE = "UPSERT_MOVIE";
    const CREATE_PUBLISHER = "CREATE_PUBLISHER";
    const CREATE_CUSTOM_MODEL = "CREATE_CUSTOM_MODEL";

    const createModelReducers = () => {
        Author.reducer = jest.fn();
        Book.reducer = jest.fn();
        Cover.reducer = jest.fn();
        Genre.reducer = jest.fn();
        Tag.reducer = jest.fn();
        Movie.reducer = jest.fn((action, Model, _session) => {
            switch (action.type) {
                case CREATE_MOVIE:
                    Model.create(action.payload);
                    break;
                case UPSERT_MOVIE:
                    Model.upsert(action.payload);
                    break;
                default:
                    break;
            }
        });
        Publisher.reducer = jest.fn((action, Model, _session) => {
            switch (action.type) {
                case CREATE_PUBLISHER:
                    Model.create(action.payload);
                    break;
                default:
                    break;
            }
        });
    };

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
        reducer = createReducer(orm);
        createModelReducers();
        emptyState = orm.getEmptyState();
        ormState = emptyState;

        sessionOrm = Object.create(orm);
        sessionOrm.stateSelector = (state) => session.state;
        session = sessionOrm.session();
    });

    it("runs reducers if explicitly specified", () => {
        const mockAction = {};
        ormState = reducer(emptyState, mockAction);

        expect(ormState).toBeDefined();

        expect(Author.reducer).toHaveBeenCalledTimes(1);
        expect(Book.reducer).toHaveBeenCalledTimes(1);
        expect(Cover.reducer).toHaveBeenCalledTimes(1);
        expect(Genre.reducer).toHaveBeenCalledTimes(1);
        expect(Tag.reducer).toHaveBeenCalledTimes(1);
        expect(Publisher.reducer).toHaveBeenCalledTimes(1);
        expect(Movie.reducer).toHaveBeenCalledTimes(1);
    });

    it("correctly returns a different state when calling a reducer", () => {
        ormState = reducer(emptyState, {
            type: CREATE_MOVIE,
            payload: {
                id: 0,
                name: "Let there be a movie",
            },
        });
        expect(ormState.Movie.itemsById).toEqual({
            0: {
                id: 0,
                name: "Let there be a movie",
            },
        });
    });

    it("calling reducer with undefined state doesn't throw", () => {
        reducer = createReducer(orm);
        expect(() => {
            reducer(undefined, { type: "______init" });
        }).not.toThrow();
    });

    describe("selectors memoize results as intended", () => {
        it("basic selector", () => {
            const selector = createSelector(orm, () => {});
            expect(typeof selector).toBe("function");

            selector(emptyState);
            expect(selector.recomputations()).toBe(1);
            selector(emptyState);
            expect(selector.recomputations()).toBe(1);

            // same empty state, but different reference
            selector(orm.getEmptyState());
            expect(selector.recomputations()).toBe(1);
        });

        it("arbitrary filters", () => {
            const selector = createSelector(orm, (selectorSession) =>
                selectorSession.Movie.filter(
                    (movie) => movie.name === "Getting started with filters"
                ).toRefArray()
            );

            selector(emptyState);
            expect(selector.recomputations()).toBe(1);
            selector(emptyState);
            expect(selector.recomputations()).toBe(1);

            ormState = reducer(emptyState, {
                type: CREATE_MOVIE,
                payload: {
                    name: "Getting started with filters",
                },
            });

            selector(ormState);
            expect(selector.recomputations()).toBe(2);
        });

        it("id lookups", () => {
            const selector = createSelector(orm, (selectorSession) =>
                selectorSession.Movie.withId(0)
            );
            expect(typeof selector).toBe("function");

            selector(emptyState);
            expect(selector.recomputations()).toBe(1);
            selector(emptyState);
            expect(selector.recomputations()).toBe(1);

            ormState = reducer(emptyState, {
                type: CREATE_MOVIE,
                payload: {
                    name: "Getting started with id lookups",
                },
            });

            selector(ormState);
            expect(selector.recomputations()).toBe(2);
        });

        it("id-based lookups with additional attributes", () => {
            const selector = createSelector(orm, (selectorSession) => {
                const movie = selectorSession.Movie.filter({
                    id: 123,
                    name: "Looking for this name",
                }).first();
                return movie ? movie.ref.name : null;
            });
            expect(typeof selector).toBe("function");

            expect(selector(emptyState)).toBe(null);
            expect(selector.recomputations()).toBe(1);
            expect(selector(emptyState)).toBe(null);
            expect(selector.recomputations()).toBe(1);

            ormState = reducer(emptyState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 123,
                    name: "Looking for this name",
                },
            });

            expect(selector(ormState)).toBe("Looking for this name");
            expect(selector.recomputations()).toBe(2);

            ormState = reducer(ormState, {
                type: UPSERT_MOVIE,
                payload: {
                    id: 123,
                    name: "Looking for this name",
                },
            });

            expect(selector(ormState)).toBe("Looking for this name");
            expect(selector.recomputations()).toBe(2);

            ormState = reducer(ormState, {
                type: UPSERT_MOVIE,
                payload: {
                    id: 123,
                    name: "Some other name",
                },
            });

            /* Different name should no longer satisfy filter condition. */
            expect(selector(ormState)).toBe(null);
            expect(selector.recomputations()).toBe(3);

            ormState = reducer(ormState, {
                type: UPSERT_MOVIE,
                payload: {
                    id: 123,
                    name: "Looking for this name",
                },
            });

            /* Initial name should again satisfy filter condition. */
            expect(selector(ormState)).toBe("Looking for this name");
            expect(selector.recomputations()).toBe(4);
        });

        it("empty QuerySets", () => {
            const selector = createSelector(orm, (selectorSession) =>
                selectorSession.Movie.all().toModelArray()
            );
            expect(typeof selector).toBe("function");

            selector(emptyState);
            expect(selector.recomputations()).toBe(1);
            selector(emptyState);
            expect(selector.recomputations()).toBe(1);

            ormState = reducer(emptyState, {
                type: CREATE_MOVIE,
                payload: {
                    name: "Getting started with empty query sets",
                },
            });

            selector(ormState);
            expect(selector.recomputations()).toBe(2);
        });

        it("Model updates", () => {
            const selector = createSelector(orm, (selectorSession) =>
                selectorSession.Movie.withId(0)
            );

            const movie = session.Movie.create({
                name: "Name after creation",
            });

            selector(session.state);
            expect(selector.recomputations()).toBe(1);
            selector(session.state);
            expect(selector.recomputations()).toBe(1);

            movie.name = "Updated name";

            selector(session.state);
            expect(selector.recomputations()).toBe(2);
        });

        it("Model deletions", () => {
            const selector = createSelector(orm, (selectorSession) =>
                selectorSession.Movie.withId(0)
            );

            const movie = session.Movie.create({
                name: "Name after creation",
            });

            selector(session.state);
            expect(selector.recomputations()).toBe(1);
            selector(session.state);
            expect(selector.recomputations()).toBe(1);

            movie.delete();

            selector(session.state);
            expect(selector.recomputations()).toBe(2);
        });

        it("foreign key forward descriptors", () => {
            const selector = createSelector(orm, (selectorSession) =>
                selectorSession.Movie.all()
                    .toModelArray()
                    .reduce(
                        (map, movie) => ({
                            ...map,
                            [movie.id]: movie.publisher
                                ? movie.publisher.ref
                                : null,
                        }),
                        {}
                    )
            );
            expect(typeof selector).toBe("function");

            expect(selector(emptyState)).toEqual({});
            expect(selector.recomputations()).toBe(1);

            ormState = reducer(emptyState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 532,
                    name: "Movie for forward FK",
                    publisherId: 123,
                },
            });

            expect(selector(ormState)).toEqual({
                532: null,
            });
            expect(selector.recomputations()).toBe(2);

            // random other publisher that should be of no interest
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 999,
                    name: "Publisher not referenced by movie",
                },
            });

            expect(selector(ormState)).toEqual({
                532: null,
            });
            expect(selector.recomputations()).toBe(2);

            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                    name: "Publisher referenced by movie FK",
                },
            });

            expect(selector(ormState)).toEqual({
                532: {
                    id: 123,
                    name: "Publisher referenced by movie FK",
                },
            });
            expect(selector.recomputations()).toBe(3);
        });

        it("foreign key backward descriptors", () => {
            const selector = createSelector(orm, (selectorSession) => {
                const publisher = selectorSession.Publisher.withId(123);
                if (!publisher) return [];
                return publisher.movies.toRefArray().map((movie) => movie.id);
            });
            expect(typeof selector).toBe("function");

            // publisher does not exist yet
            expect(selector(emptyState)).toEqual([]);
            expect(selector.recomputations()).toBe(1);

            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                    name: "Publisher for backward FK",
                },
            });

            expect(selector(ormState)).toEqual([]);
            expect(selector.recomputations()).toBe(2);

            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 532,
                    name: "Backward FK descriptors",
                    publisherId: 123,
                },
            });

            expect(selector(ormState)).toEqual([532]);
            expect(selector.recomputations()).toBe(3);

            // random other movie that should be of no interest
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 999,
                    name: "Some movie without a publisher",
                },
            });

            expect(selector(ormState)).toEqual([532]);
            expect(selector.recomputations()).toBe(3);

            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 1000,
                    publisherId: 123,
                    name: "Movie referencing the publisher by FK",
                },
            });

            expect(selector(ormState)).toEqual([532, 1000]);
            expect(selector.recomputations()).toBe(4);
        });

        it("ordered foreign key backward descriptors", () => {
            const selector = createSelector(orm, (selectorSession) => {
                const publisher = selectorSession.Publisher.withId(123);
                if (!publisher) return [];
                return publisher.movies
                    .orderBy("name", "asc")
                    .toRefArray()
                    .map((movie) => movie.id);
            });
            expect(typeof selector).toBe("function");

            // publisher does not exist yet
            expect(selector(emptyState)).toEqual([]);
            expect(selector.recomputations()).toBe(1);

            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                    name: "Publisher for backward FK",
                },
            });

            expect(selector(ormState)).toEqual([]);
            expect(selector.recomputations()).toBe(2);

            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 1,
                    name: "A - First in alphabet",
                    publisherId: 123,
                },
            });

            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 2,
                    name: "B - Second in alphabet",
                    publisherId: 123,
                },
            });

            expect(selector(ormState)).toEqual([1, 2]);
            expect(selector.recomputations()).toBe(3);

            /**
             * Change first letter of name from 'A' to 'Z'.
             * Selector should move this movie to the end now.
             */
            ormState = reducer(ormState, {
                type: UPSERT_MOVIE,
                payload: {
                    id: 1,
                    name: "Z - Last in alphabet",
                },
            });

            expect(selector(ormState)).toEqual([2, 1]);
            expect(selector.recomputations()).toBe(4);
        });

        it("custom Model table options", () => {
            class CustomModel extends OrmModel {}
            CustomModel.modelName = "CustomModel";
            CustomModel.options = {
                mapName: "custom map name",
            };
            CustomModel.reducer = jest.fn((action, Model, _session) => {
                switch (action.type) {
                    case CREATE_CUSTOM_MODEL:
                        Model.create(action.payload);
                        break;
                    default:
                        break;
                }
            });
            let _ormState;
            const _stateSelector = (state) => _ormState;
            const _orm = new ORM({ stateSelector: _stateSelector });
            _orm.register(CustomModel);

            const _reducer = createReducer(_orm);
            _ormState = _orm.getEmptyState();

            const selector = createSelector(_orm, (selectorSession) =>
                selectorSession.CustomModel.count()
            );

            selector(_ormState);
            expect(selector.recomputations()).toBe(1);
            _ormState = _reducer(_ormState, {
                type: CREATE_CUSTOM_MODEL,
                payload: {
                    id: 1,
                },
            });
            selector(_ormState);
            expect(selector.recomputations()).toBe(2);
        });

        it("input selectors", () => {
            const memoized = jest.fn((_session, selectedMovie) =>
                _session.Movie.idExists(selectedMovie)
            );

            let appState;
            const ormWithAppState = Object.create(orm);
            ormWithAppState.stateSelector = (state) => appState.orm;

            const _reducer = createReducer(ormWithAppState);
            const _ormState = ormWithAppState.getEmptyState();
            appState = {
                orm: _ormState,
                selectedMovie: 5,
            };

            const selector = createSelector(
                ormWithAppState,
                (state) => state.selectedMovie,
                memoized
            );

            expect(typeof selector).toBe("function");

            expect(selector(appState)).toBe(false);
            expect(selector.recomputations()).toBe(1);

            const lastCall =
                memoized.mock.calls[memoized.mock.calls.length - 1];
            expect(lastCall[0]).toBeInstanceOf(Session);
            expect(lastCall[1]).toBe(5);

            selector(appState);
            expect(selector.recomputations()).toBe(1);

            appState = {
                ...appState,
                selectedMovie: 0,
            };
            expect(selector(appState)).toBe(false);
            expect(selector.recomputations()).toBe(2);

            appState = {
                ...appState,
                orm: _reducer(_ormState, {
                    type: CREATE_MOVIE,
                    payload: {
                        id: 0,
                        name: "Let there be a movie",
                    },
                }),
            };

            expect(selector(appState)).toBe(true);
            expect(selector.recomputations()).toBe(3);
        });
    });
});
