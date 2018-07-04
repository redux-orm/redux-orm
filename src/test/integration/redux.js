import { ORM, Session, createReducer, createSelector } from '../../';
import { createTestModels } from '../helpers';

describe('Redux integration', () => {
    let orm;
    let Book;
    let Cover;
    let Genre;
    let Tag;
    let Author;
    let Publisher;
    let emptyState;
    beforeEach(() => {
        ({
            Book,
            Cover,
            Genre,
            Tag,
            Author,
            Publisher,
        } = createTestModels());
        orm = new ORM();
        orm.register(Book, Cover, Genre, Tag, Author, Publisher);
        emptyState = orm.getEmptyState();
    });

    it('runs reducers if explicitly specified', () => {
        Author.reducer = jest.fn();
        Book.reducer = jest.fn();
        Cover.reducer = jest.fn();
        Genre.reducer = jest.fn();
        Tag.reducer = jest.fn();
        Publisher.reducer = jest.fn();

        const reducer = createReducer(orm);
        const mockAction = {};
        const nextState = reducer(emptyState, mockAction);

        expect(nextState).not.toBeUndefined();

        expect(Author.reducer).toHaveBeenCalledTimes(1);
        expect(Book.reducer).toHaveBeenCalledTimes(1);
        expect(Cover.reducer).toHaveBeenCalledTimes(1);
        expect(Genre.reducer).toHaveBeenCalledTimes(1);
        expect(Tag.reducer).toHaveBeenCalledTimes(1);
        expect(Publisher.reducer).toHaveBeenCalledTimes(1);
    });

    it('correctly creates a basic selector', () => {
        let selectorTimesRun = 0;
        const selector = createSelector(orm, () => selectorTimesRun++);
        expect(typeof selector).toBe('function');

        const state = orm.getEmptyState();

        selector(state);
        expect(selectorTimesRun).toBe(1);
        selector(state);
        expect(selectorTimesRun).toBe(1);
        selector(orm.getEmptyState());
        expect(selectorTimesRun).toBe(1);
    });

    it('correctly creates a selector that works with arbitrary filters', () => {
        const session = orm.session(emptyState);
        let selectorTimesRun = 0;
        const selector = createSelector(orm, (memoizeSession) => {
            selectorTimesRun++;
            return memoizeSession.Book.all()
                .filter({ name: 'Getting started with filters' })
                .toRefArray();
        });
        expect(typeof selector).toBe('function');

        selector(session.state);
        expect(selectorTimesRun).toBe(1);
        selector(session.state);
        expect(selectorTimesRun).toBe(1);
        session.Book.create({
            name: 'Getting started with filters',
        });
        selector(session.state);
        expect(selectorTimesRun).toBe(2);
    });

    it('correctly creates a selector that works with id lookups', () => {
        const session = orm.session(emptyState);
        let selectorTimesRun = 0;
        const selector = createSelector(orm, (memoizeSession) => {
            selectorTimesRun++;
            return memoizeSession.Book.withId(0);
        });
        expect(typeof selector).toBe('function');

        selector(session.state);
        expect(selectorTimesRun).toBe(1);
        selector(session.state);
        expect(selectorTimesRun).toBe(1);
        session.Book.create({
            name: 'Getting started with id lookups',
        });
        selector(session.state);
        expect(selectorTimesRun).toBe(2);
    });

    it('correctly creates a selector that works with empty QuerySets', () => {
        const session = orm.session(emptyState);
        let selectorTimesRun = 0;
        const selector = createSelector(orm, (memoizeSession) => {
            selectorTimesRun++;
            return memoizeSession.Book.all().toModelArray();
        });
        expect(typeof selector).toBe('function');

        selector(session.state);
        expect(selectorTimesRun).toBe(1);
        selector(session.state);
        expect(selectorTimesRun).toBe(1);
        session.Book.create({
            name: 'Getting started with empty query sets',
        });
        selector(session.state);
        expect(selectorTimesRun).toBe(2);
    });

    it('correctly creates a selector that works with other sessions\' insertions', () => {
        const session = orm.session(emptyState);

        let selectorTimesRun = 0;
        const selector = createSelector(orm, (memoizeSession) => {
            selectorTimesRun++;
            return memoizeSession.Book.withId(0);
        });
        expect(typeof selector).toBe('function');

        selector(session.state);
        expect(selectorTimesRun).toBe(1);
        selector(session.state);
        expect(selectorTimesRun).toBe(1);

        const book = session.Book.create({
            name: 'Name after creation',
        });

        selector(session.state);
        expect(selectorTimesRun).toBe(2);
    });

    it('correctly creates a selector that works with other sessions\' updates', () => {
        const session = orm.session(emptyState);

        let selectorTimesRun = 0;
        const selector = createSelector(orm, (memoizeSession) => {
            selectorTimesRun++;
            return memoizeSession.Book.withId(0);
        });
        expect(typeof selector).toBe('function');

        const book = session.Book.create({
            name: 'Name after creation',
        });

        selector(session.state);
        expect(selectorTimesRun).toBe(1);
        selector(session.state);
        expect(selectorTimesRun).toBe(1);

        book.name = 'Updated name';
        selector(session.state);
        expect(selectorTimesRun).toBe(2);
    });

    it('correctly creates a selector that works with other sessions\' deletions', () => {
        const session = orm.session(emptyState);

        let selectorTimesRun = 0;
        const selector = createSelector(orm, (memoizeSession) => {
            selectorTimesRun++;
            return memoizeSession.Book.withId(0);
        });
        expect(typeof selector).toBe('function');

        const book = session.Book.create({
            name: 'Name after creation',
        });

        selector(session.state);
        expect(selectorTimesRun).toBe(1);
        selector(session.state);
        expect(selectorTimesRun).toBe(1);

        book.delete();

        selector(session.state);
        expect(selectorTimesRun).toBe(2);
    });

    it('correctly creates a selector with input selectors', () => {
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

    it('calling reducer with undefined state doesn\'t throw', () => {
        const reducer = createReducer(orm);
        reducer(undefined, { type: '______init' });
    });
});
