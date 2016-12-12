import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {
    ORM,
    Session,
    createReducer,
    createSelector,
} from '../';

import {
    createTestModels,
} from './utils';

chai.use(sinonChai);
const { expect } = chai;

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
        Author.reducer = sinon.spy();
        Book.reducer = sinon.spy();
        Cover.reducer = sinon.spy();
        Genre.reducer = sinon.spy();
        Publisher.reducer = sinon.spy();

        const reducer = createReducer(orm);
        const mockAction = {};
        const nextState = reducer(defaultState, mockAction);

        expect(nextState).to.not.be.a('undefined');

        expect(Author.reducer).to.be.calledOnce;
        expect(Book.reducer).to.be.calledOnce;
        expect(Cover.reducer).to.be.calledOnce;
        expect(Genre.reducer).to.be.calledOnce;
        expect(Publisher.reducer).to.be.calledOnce;
    });

    it('correctly creates a selector', () => {
        let selectorTimesRun = 0;
        const selector = createSelector(orm, () => selectorTimesRun++);
        expect(selector).to.be.a('function');

        const state = orm.getEmptyState();

        selector(state);
        expect(selectorTimesRun).to.equal(1);
        selector(state);
        expect(selectorTimesRun).to.equal(1);
        selector(orm.getEmptyState());
        expect(selectorTimesRun).to.equal(1);
    });

    it('correctly creates a selector with input selectors', () => {
        const _selectorFunc = sinon.spy();

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

        expect(selector).to.be.a('function');

        selector(appState);
        expect(_selectorFunc.callCount).to.equal(1);

        expect(_selectorFunc.lastCall.args[0]).to.be.an.instanceOf(Session);
        expect(_selectorFunc.lastCall.args[0].state).to.equal(_state);

        expect(_selectorFunc.lastCall.args[1]).to.equal(5);

        selector(appState);
        expect(_selectorFunc.callCount).to.equal(1);

        const otherUserState = Object.assign({}, appState, { selectedUser: 0 });

        selector(otherUserState);
        expect(_selectorFunc.callCount).to.equal(2);
    });

    it('calling reducer with undefined state doesn\'t throw', () => {
        const reducer = createReducer(orm);
        reducer(undefined, { type: '______init' });
    });
});
