import {
    ORM, Session, Model as OrmModel, createReducer, createSelector
} from '../..';
import { createTestModels } from '../helpers';

describe('Redux integration', () => {
    let orm;
    let Book;
    let Cover;
    let Genre;
    let Tag;
    let Author;
    let Publisher;
    let Movie;
    let emptyState;
    let nextState;
    let ormReducer;

    const CREATE_MOVIE = 'CREATE_MOVIE';
    const CREATE_PUBLISHER = 'CREATE_PUBLISHER';

    const createModelReducers = () => {
        Author.reducer = jest.fn();
        Book.reducer = jest.fn();
        Cover.reducer = jest.fn();
        Genre.reducer = jest.fn();
        Tag.reducer = jest.fn();
        Movie.reducer = jest.fn((action, Model, session) => {
            switch (action.type) {
            case CREATE_MOVIE:
                Model.create(action.payload);
                break;
            default: break;
            }
        });
        Publisher.reducer = jest.fn((action, Model, session) => {
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
        orm = new ORM();
        orm.register(Book, Cover, Genre, Tag, Author, Movie, Publisher);
        ormReducer = createReducer(orm);
        createModelReducers();
    });

    it('runs reducers if explicitly specified', () => {
        emptyState = orm.getEmptyState();
        const mockAction = {};
        nextState = ormReducer(emptyState, mockAction);

        expect(nextState).toBeDefined();

        expect(Author.reducer).toHaveBeenCalledTimes(1);
        expect(Book.reducer).toHaveBeenCalledTimes(1);
        expect(Cover.reducer).toHaveBeenCalledTimes(1);
        expect(Genre.reducer).toHaveBeenCalledTimes(1);
        expect(Tag.reducer).toHaveBeenCalledTimes(1);
        expect(Publisher.reducer).toHaveBeenCalledTimes(1);
        expect(Movie.reducer).toHaveBeenCalledTimes(1);
    });

    it('correctly returns a different state when calling a reducer', () => {
        nextState = ormReducer(emptyState, {
            type: CREATE_MOVIE,
            payload: {
                id: 0,
                name: 'Let there be a movie',
            },
        });
        expect(nextState.Movie.itemsById).toEqual({
            0: {
                id: 0,
                name: 'Let there be a movie',
            }
        });
    });

    it('calling reducer with undefined state doesn\'t throw', () => {
        ormReducer = createReducer(orm);
        ormReducer(undefined, { type: '______init' });
    });

    describe('selectors memoize results as intended', () => {
        it('basic selector', () => {
            const memoized = jest.fn();
            const selector = createSelector(orm, memoized);
            expect(typeof selector).toBe('function');

            selector(emptyState);
            expect(memoized).toHaveBeenCalledTimes(1);
            selector(emptyState);
            expect(memoized).toHaveBeenCalledTimes(1);

            // same empty state, but different reference
            selector(orm.getEmptyState());
            expect(memoized).toHaveBeenCalledTimes(1);
        });

        it('arbitrary filters', () => {
            const memoized = jest.fn(selectorSession => (
                selectorSession.Movie
                    .filter(movie => movie.name === 'Getting started with filters')
                    .toRefArray()
            ));
            const selector = createSelector(orm, memoized);

            selector(emptyState);
            expect(memoized).toHaveBeenCalledTimes(1);
            selector(emptyState);
            expect(memoized).toHaveBeenCalledTimes(1);

            nextState = ormReducer(emptyState, {
                type: CREATE_MOVIE,
                payload: {
                    name: 'Getting started with filters',
                },
            });

            selector(nextState);
            expect(memoized).toHaveBeenCalledTimes(2);
        });

        it('id lookups', () => {
            const memoized = jest.fn(selectorSession => (
                selectorSession.Movie
                    .withId(0)
            ));
            const selector = createSelector(orm, memoized);
            expect(typeof selector).toBe('function');

            selector(emptyState);
            expect(memoized).toHaveBeenCalledTimes(1);
            selector(emptyState);
            expect(memoized).toHaveBeenCalledTimes(1);

            nextState = ormReducer(emptyState, {
                type: CREATE_MOVIE,
                payload: {
                    name: 'Getting started with id lookups',
                },
            });

            selector(nextState);
            expect(memoized).toHaveBeenCalledTimes(2);
        });

        it('empty QuerySets', () => {
            const memoized = jest.fn(selectorSession => (
                selectorSession.Movie
                    .all()
                    .toModelArray()
            ));
            const selector = createSelector(orm, memoized);
            expect(typeof selector).toBe('function');

            selector(emptyState);
            expect(memoized).toHaveBeenCalledTimes(1);
            selector(emptyState);
            expect(memoized).toHaveBeenCalledTimes(1);

            nextState = ormReducer(emptyState, {
                type: CREATE_MOVIE,
                payload: {
                    name: 'Getting started with empty query sets',
                },
            });

            selector(nextState);
            expect(memoized).toHaveBeenCalledTimes(2);
        });

        it('Model updates', () => {
            const session = orm.session();
            const memoized = jest.fn(selectorSession => (
                selectorSession.Movie
                    .withId(0)
            ));
            const selector = createSelector(orm, memoized);

            const movie = session.Movie.create({
                name: 'Name after creation',
            });

            selector(session.state);
            expect(memoized).toHaveBeenCalledTimes(1);
            selector(session.state);
            expect(memoized).toHaveBeenCalledTimes(1);

            movie.name = 'Updated name';

            selector(session.state);
            expect(memoized).toHaveBeenCalledTimes(2);
        });

        it('Model deletions', () => {
            const session = orm.session();
            const memoized = jest.fn(selectorSession => (
                selectorSession.Movie
                    .withId(0)
            ));
            const selector = createSelector(orm, memoized);

            const movie = session.Movie.create({
                name: 'Name after creation',
            });

            selector(session.state);
            expect(memoized).toHaveBeenCalledTimes(1);
            selector(session.state);
            expect(memoized).toHaveBeenCalledTimes(1);

            movie.delete();

            selector(session.state);
            expect(memoized).toHaveBeenCalledTimes(2);
        });

        it('foreign key descriptors', () => {
            const memoized = jest.fn(selectorSession => (
                selectorSession.Movie
                    .all()
                    .toModelArray()
                    .reduce((map, movie) => ({
                        ...map,
                        [movie.id]: movie.publisher ? movie.publisher.ref : null,
                    }), {})
            ));
            const selector = createSelector(orm, memoized);
            expect(typeof selector).toBe('function');

            expect(
                selector(emptyState)
            ).toEqual({});
            expect(memoized).toHaveBeenCalledTimes(1);

            nextState = ormReducer(emptyState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 532,
                    name: 'Getting started with FK descriptors',
                    publisherId: 123,
                },
            });

            expect(
                selector(nextState)
            ).toEqual({
                532: null,
            });
            expect(memoized).toHaveBeenCalledTimes(2);

            // random other publisher that should be of no interest
            nextState = ormReducer(nextState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 999,
                    name: 'random uninteresting publisher',
                },
            });

            expect(
                selector(nextState)
            ).toEqual({
                532: null,
            });
            expect(memoized).toHaveBeenCalledTimes(2);

            nextState = ormReducer(nextState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                    name: 'publisher referenced by movie FK',
                },
            });

            expect(
                selector(nextState)
            ).toEqual({
                532: {
                    id: 123,
                    name: 'publisher referenced by movie FK',
                },
            });
            expect(memoized).toHaveBeenCalledTimes(3);

            const session = orm.session(nextState);
            expect(session.Publisher.withId(123).movies.count()).toBe(1);
        });

        it('custom Model table options', () => {
            class CustomizedModel extends OrmModel {}
            CustomizedModel.modelName = 'CustomizedModel';
            CustomizedModel.options = {
                mapName: 'custom map name',
            };
            const _orm = new ORM();
            _orm.register(CustomizedModel);
            const session = _orm.session();

            const memoized = jest.fn(selectorSession => (
                selectorSession.CustomizedModel.count()
            ));
            const selector = createSelector(_orm, memoized);

            selector(session.state);
            expect(memoized).toHaveBeenCalledTimes(1);
            const movie = session.CustomizedModel.create({
                name: 'Name after creation',
            });
            selector(session.state);
            expect(memoized).toHaveBeenCalledTimes(2);
        });

        it('input selectors', () => {
            const _selectorFunc = jest.fn();

            const selector = createSelector(
                orm,
                state => state.orm,
                state => state.selectedUser,
                _selectorFunc
            );

            const _state = orm.getEmptyState();

            const appState = {
                orm: _state,
                selectedUser: 5,
            };

            expect(typeof selector).toBe('function');

            selector(appState);
            expect(_selectorFunc.mock.calls).toHaveLength(1);

            const lastCall = _selectorFunc.mock.calls[_selectorFunc.mock.calls.length - 1];
            expect(lastCall[0]).toBeInstanceOf(Session);
            expect(lastCall[0].state).toBe(_state);
            expect(lastCall[1]).toBe(5);

            selector(appState);
            expect(_selectorFunc.mock.calls).toHaveLength(1);

            const otherUserState = Object.assign({}, appState, { selectedUser: 0 });

            selector(otherUserState);
            expect(_selectorFunc.mock.calls).toHaveLength(2);
        });
    });
});
