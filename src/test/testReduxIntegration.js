import { ORM, Session, createReducer, createSelector } from '../';
import { createTestModels } from './utils';

describe('Redux integration', () => {
    let orm;
    let Book;
    let Cover;
    let Genre;
    let Author;
    let Publisher;
    let defaultState;
    beforeEach(() => {
        ({
            Book,
            Cover,
            Genre,
            Author,
            Publisher,
        } = createTestModels());
        orm = new ORM();
        orm.register(Book, Cover, Genre, Author, Publisher);
        defaultState = orm.getEmptyState();
    });

    it('runs reducers if explicitly specified', () => {
        Author.reducer = jest.fn();
        Book.reducer = jest.fn();
        Cover.reducer = jest.fn();
        Genre.reducer = jest.fn();
        Publisher.reducer = jest.fn();

        const reducer = createReducer(orm);
        const mockAction = {};
        const nextState = reducer(defaultState, mockAction);

        expect(nextState).not.toBeUndefined();

        expect(Author.reducer).toHaveBeenCalledTimes(1);
        expect(Book.reducer).toHaveBeenCalledTimes(1);
        expect(Cover.reducer).toHaveBeenCalledTimes(1);
        expect(Genre.reducer).toHaveBeenCalledTimes(1);
        expect(Publisher.reducer).toHaveBeenCalledTimes(1);
    });

    it('correctly creates a selector', () => {
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
        expect(_selectorFunc.mock.calls.length).toBe(1);

        const lastCall = _selectorFunc.mock.calls[_selectorFunc.mock.calls.length - 1];
        expect(lastCall[0]).toBeInstanceOf(Session);
        expect(lastCall[0].state).toBe(_state);
        expect(lastCall[1]).toBe(5);

        selector(appState);
        expect(_selectorFunc.mock.calls.length).toBe(1);

        const otherUserState = Object.assign({}, appState, { selectedUser: 0 });

        selector(otherUserState);
        expect(_selectorFunc.mock.calls.length).toBe(2);
    });

    it('calling reducer with undefined state doesn\'t throw', () => {
        const reducer = createReducer(orm);
        reducer(undefined, { type: '______init' });
    });
});
