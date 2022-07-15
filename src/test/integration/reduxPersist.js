import { createStore } from "redux";

import { persistCombineReducers, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";

import {
    ORM,
    Session,
    Model as OrmModel,
    createReducer,
    createSelector,
} from "../..";

import { createTestModels } from "../helpers";

describe("Redux Persist integration", () => {
    let orm;
    let Book;
    let Cover;
    let Genre;
    let Tag;
    let Author;
    let Publisher;
    let Movie;
    const stateSelector = (state) => state.orm;
    let emptyState;

    const CREATE_MOVIE = "CREATE_MOVIE";
    const UPSERT_MOVIE = "UPSERT_MOVIE";
    const CREATE_PUBLISHER = "CREATE_PUBLISHER";

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

    const createPersistedReducer = () => {
        const reducer = createReducer(orm);
        const persistConfig = {
            key: "root",
            storage,
            whitelist: ["orm"],
            stateReconciler: hardSet,
        };
        return persistCombineReducers(persistConfig, {
            orm: reducer,
        });
    };

    beforeEach(() => {
        // eslint-disable-next-line no-undef
        localStorage.clear(); // prevents persistence between tests

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
        emptyState = orm.getEmptyState();
        createModelReducers();
    });

    it("creates correct empty state by default", async () => {
        await new Promise((resolve) => {
            const store = createStore(createPersistedReducer());
            persistStore(store, null, async () => {
                expect(store.getState().orm).toStrictEqual(emptyState);

                const store2 = createStore(createPersistedReducer());
                const persistor2 = persistStore(store2);
                persistor2.subscribe(() => {
                    expect(store2.getState().orm).toStrictEqual(emptyState);
                    resolve();
                });
            });
        });
    });

    it("keeps selector results consistent after persistence", async () => {
        await new Promise((resolve) => {
            const store = createStore(createPersistedReducer());
            const persistor = persistStore(store, null, async () => {
                store.dispatch({
                    type: CREATE_MOVIE,
                    payload: { id: 123 },
                });

                const movies = createSelector(orm.Movie);
                expect(movies(store.getState())[0].id).toStrictEqual(123);

                return persistor.flush().then(() => {
                    expect(movies(store.getState())[0].ref).toStrictEqual({
                        id: 123,
                    });

                    const store2 = createStore(createPersistedReducer());
                    const persistor2 = persistStore(store2);
                    persistor2.subscribe(() => {
                        expect(movies(store2.getState())[0].ref).toStrictEqual({
                            id: 123,
                        });

                        resolve();
                    });
                });
            });
        });
    });

    it("keeps state consistent after persistence", async () => {
        await new Promise((resolve) => {
            const store = createStore(createPersistedReducer());
            const persistor = persistStore(store, null, async () => {
                store.dispatch({
                    type: CREATE_MOVIE,
                    payload: { id: 123 },
                });
                return persistor.flush().then(() => {
                    const session = orm.session(store.getState().orm);
                    expect(session.Movie.all().toRefArray()).toStrictEqual([
                        { id: 123 },
                    ]);

                    const store2 = createStore(createPersistedReducer());
                    const persistor2 = persistStore(store2);
                    persistor2.subscribe(() => {
                        expect(store2.getState()).toStrictEqual(
                            store.getState()
                        );

                        const session2 = orm.session(store2.getState().orm);
                        expect(
                            session2.Movie.all().toRefArray()
                        ).toStrictEqual([{ id: 123 }]);
                        resolve();
                    });
                });
            });
        });
    });
});
