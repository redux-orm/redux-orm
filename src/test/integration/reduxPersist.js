import { createStore } from 'redux';

import { persistCombineReducers, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import {
    ORM, Session, Model as OrmModel, createReducer, createSelector
} from '../..';

import { createTestModels } from '../helpers';
import { STATE_FLAG } from '../../constants';

describe('Redux Persist integration', () => {
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

    let reducer;
    let rootReducer;
    const stateSelector = state => state.orm;

    let store;

    const CREATE_MOVIE = 'CREATE_MOVIE';
    const UPSERT_MOVIE = 'UPSERT_MOVIE';
    const CREATE_PUBLISHER = 'CREATE_PUBLISHER';
    const CREATE_CUSTOM_MODEL = 'CREATE_CUSTOM_MODEL';

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
            default: break;
            }
        });
        Publisher.reducer = jest.fn((action, Model, _session) => {
            switch (action.type) {
            case CREATE_PUBLISHER:
                Model.create(action.payload);
                break;
            default: break;
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
        createModelReducers();
        emptyState = orm.getEmptyState();
        ormState = emptyState;
        reducer = createReducer(orm);
        const persistConfig = {
            key: 'root',
            storage,
            whitelist: ['orm'],
        };
        rootReducer = persistCombineReducers(persistConfig, {
            orm: reducer,
        });
        store = createStore(rootReducer);
    });

    it('creates empty state correctly', () => {
        expect(store.getState().orm).not.toBe(null);
        expect(store.getState().orm[STATE_FLAG]).toBe(STATE_FLAG);
        expect(store.getState().orm).toEqual(emptyState);
    });

    it('saves and restores state correctly', () => {
        const persistor = persistStore(store, null, () => {
            store.dispatch({
                type: CREATE_MOVIE,
                payload: { id: 123 },
            });
            return persistor
                .flush()
                .then(() => {
                    const session = orm.session(store.getState().orm);
                    expect(session.Movie.all().toRefArray()).toStrictEqual([
                        { id: 123 },
                    ]);

                    const store2 = createStore(rootReducer);
                    const persistor2 = persistStore(store2);
                    persistor2.subscribe(() => {
                        const session2 = orm.session(store2.getState().orm);
                        expect(store2.getState().orm[STATE_FLAG]).toBe(STATE_FLAG);
                        expect(session2.Movie.all().toRefArray()).toStrictEqual([
                            { id: 123 },
                        ]);
                    });
                });
        });
    });
});
