import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Schema from '../Schema';
import {
    createTestModels,
} from './utils';

chai.use(sinonChai);
const { expect } = chai;

describe('Redux integration', () => {
    let schema;
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
        schema = new Schema();
        schema.register(Book, Cover, Genre, Author, Publisher);
        defaultState = schema.getDefaultState();
    });

    // it('runs reducers if explicitly specified', () => {
    //     const session = schema.from(defaultState);

    //     const authorReducerSpy = sinon.spy(Author, 'reducer');
    //     const bookReducerSpy = sinon.spy(Book, 'reducer');
    //     const coverReducerSpy = sinon.spy(Cover, 'reducer');
    //     const genreReducerSpy = sinon.spy(Genre, 'reducer');
    //     const publisherReducerSpy = sinon.spy(Publisher, 'reducer');

    //     session.getNextState({ runReducers: true });

    //     expect(authorReducerSpy).to.be.calledOnce;
    //     expect(bookReducerSpy).to.be.calledOnce;
    //     expect(coverReducerSpy).to.be.calledOnce;
    //     expect(genreReducerSpy).to.be.calledOnce;
    //     expect(publisherReducerSpy).to.be.calledOnce;
    // });

    // it('doesn\'t run reducers if explicitly specified', () => {
    //     const session = schema.from(defaultState);

    //     const authorReducerSpy = sinon.spy(Author, 'reducer');
    //     const bookReducerSpy = sinon.spy(Book, 'reducer');
    //     const coverReducerSpy = sinon.spy(Cover, 'reducer');
    //     const genreReducerSpy = sinon.spy(Genre, 'reducer');
    //     const publisherReducerSpy = sinon.spy(Publisher, 'reducer');

    //     session.getNextState({ runReducers: false });

    //     expect(authorReducerSpy).not.to.be.called;
    //     expect(bookReducerSpy).not.to.be.called;
    //     expect(coverReducerSpy).not.to.be.called;
    //     expect(genreReducerSpy).not.to.be.called;
    //     expect(publisherReducerSpy).not.to.be.called;
    // });

    // it('correctly creates a selector', () => {
    //     schema.register(Book, Author, Cover, Genre, Publisher);
    //     let selectorTimesRun = 0;
    //     const selector = schema.createSelector(() => selectorTimesRun++);
    //     expect(selector).to.be.a('function');

    //     const state = schema.getDefaultState();
    //     selector(state);
    //     expect(selectorTimesRun).to.equal(1);
    //     selector(state);
    //     expect(selectorTimesRun).to.equal(1);
    //     selector(schema.getDefaultState());
    //     expect(selectorTimesRun).to.equal(1);
    // });

    // it('correctly creates a selector with input selectors', () => {
    //     schema.register(Book, Author, Cover, Genre, Publisher);

    //     const _selectorFunc = sinon.spy();

    //     const selector = schema.createSelector(
    //         state => state.orm,
    //         state => state.selectedUser,
    //         _selectorFunc
    //     );

    //     const _state = schema.getDefaultState();

    //     const appState = {
    //         orm: _state,
    //         selectedUser: 5,
    //     };

    //     expect(selector).to.be.a('function');

    //     selector(appState);
    //     expect(_selectorFunc.callCount).to.equal(1);

    //     expect(_selectorFunc.lastCall.args[0]).to.be.an.instanceOf(Session);
    //     expect(_selectorFunc.lastCall.args[0].state).to.equal(_state);

    //     expect(_selectorFunc.lastCall.args[1]).to.equal(5);

    //     selector(appState);
    //     expect(_selectorFunc.callCount).to.equal(1);

    //     const otherUserState = Object.assign({}, appState, { selectedUser: 0 });

    //     selector(otherUserState);
    //     expect(_selectorFunc.callCount).to.equal(2);
    // });

    // it('calling reducer with undefined state doesn\'t throw', () => {
    //     schema.register(Book, Author, Cover, Genre, Publisher);
    //     schema.reducer()(undefined, { type: '______init' });
    // });
});
