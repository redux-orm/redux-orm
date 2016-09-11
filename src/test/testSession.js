import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Schema from '../Schema';
import {
    createTestModels,
    isSubclass,
} from './utils';
import { CREATE } from '../constants';

chai.use(sinonChai);
const { expect } = chai;

describe('Session', () => {
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

    it('connects models', () => {
        expect(Book.session).to.be.undefined;
        expect(Cover.session).to.be.undefined;
        expect(Genre.session).to.be.undefined;
        expect(Cover.session).to.be.undefined;
        expect(Publisher.session).to.be.undefined;

        const session = schema.from(defaultState);

        expect(session.Book.session).to.equal(session);
        expect(session.Cover.session).to.equal(session);
        expect(session.Genre.session).to.equal(session);
        expect(session.Cover.session).to.equal(session);
        expect(session.Publisher.session).to.equal(session);
    });

    it('exposes models as getter properties', () => {
        const session = schema.from(defaultState);
        expect(isSubclass(session.Book, Book)).to.be.true;
        expect(isSubclass(session.Author, Author)).to.be.true;
        expect(isSubclass(session.Cover, Cover)).to.be.true;
        expect(isSubclass(session.Genre, Genre)).to.be.true;
        expect(isSubclass(session.Publisher, Publisher)).to.be.true;
    });

    it('marks accessed models', () => {
        const session = schema.from(defaultState);
        expect(session.accessedModels).to.have.length(0);

        session.markAccessed(Book);

        expect(session.accessedModels).to.have.length(1);
        expect(session.accessedModels[0]).to.equal('Book');

        session.markAccessed(Book);

        expect(session.accessedModels[0]).to.equal('Book');
    });

    it('adds updates', () => {
        const session = schema.from(defaultState);
        expect(session.updates).to.have.length(0);
        const updateObj = { meta: { name: 'MockModel' } };
        session.addUpdate(updateObj);
        expect(session.updates).to.have.length(1);
    });

    describe('gets the next state', () => {
        it('without any updates, the same state is returned', () => {
            const session = schema.from(defaultState);

            const nextState = session.getNextState();
            expect(nextState).to.equal(defaultState);
        });

        it('with updates, a new state is returned', () => {
            const session = schema.from(defaultState);

            session.addUpdate({
                type: CREATE,
                meta: {
                    name: Author.modelName,
                },
                payload: {
                    id: 0,
                    name: 'Caesar',
                },
            });

            const nextState = session.getNextState();

            expect(nextState).to.not.equal(defaultState);

            expect(nextState[Author.modelName]).to.not.equal(defaultState[Author.modelName]);

            // All other model states should stay equal.
            expect(nextState[Book.modelName]).to.equal(defaultState[Book.modelName]);
            expect(nextState[Cover.modelName]).to.equal(defaultState[Cover.modelName]);
            expect(nextState[Genre.modelName]).to.equal(defaultState[Genre.modelName]);
            expect(nextState[Publisher.modelName]).to.equal(defaultState[Publisher.modelName]);
        });

        it('runs reducers if explicitly specified', () => {
            const session = schema.from(defaultState);

            const authorReducerSpy = sinon.spy(Author, 'reducer');
            const bookReducerSpy = sinon.spy(Book, 'reducer');
            const coverReducerSpy = sinon.spy(Cover, 'reducer');
            const genreReducerSpy = sinon.spy(Genre, 'reducer');
            const publisherReducerSpy = sinon.spy(Publisher, 'reducer');

            session.getNextState({ runReducers: true });

            expect(authorReducerSpy).to.be.calledOnce;
            expect(bookReducerSpy).to.be.calledOnce;
            expect(coverReducerSpy).to.be.calledOnce;
            expect(genreReducerSpy).to.be.calledOnce;
            expect(publisherReducerSpy).to.be.calledOnce;
        });

        it('doesn\'t run reducers if explicitly specified', () => {
            const session = schema.from(defaultState);

            const authorReducerSpy = sinon.spy(Author, 'reducer');
            const bookReducerSpy = sinon.spy(Book, 'reducer');
            const coverReducerSpy = sinon.spy(Cover, 'reducer');
            const genreReducerSpy = sinon.spy(Genre, 'reducer');
            const publisherReducerSpy = sinon.spy(Publisher, 'reducer');

            session.getNextState({ runReducers: false });

            expect(authorReducerSpy).not.to.be.called;
            expect(bookReducerSpy).not.to.be.called;
            expect(coverReducerSpy).not.to.be.called;
            expect(genreReducerSpy).not.to.be.called;
            expect(publisherReducerSpy).not.to.be.called;
        });
    });

    it('reduce calls getNextState with correct arguments', () => {
        const session = schema.from(defaultState);
        const getNextStateSpy = sinon.spy(session, 'getNextState');

        session.reduce();

        expect(getNextStateSpy).to.be.calledOnce;
        expect(getNextStateSpy).to.be.calledWithMatch({ runReducers: true });
    });

    it('two concurrent sessions', () => {
        const otherState = schema.getDefaultState();

        const firstSession = schema.from(defaultState);
        const secondSession = schema.from(otherState);

        expect(firstSession.sessionBoundModels).to.have.lengthOf(6);

        expect(firstSession.Book).not.to.equal(secondSession.Book);
        expect(firstSession.Author).not.to.equal(secondSession.Author);
        expect(firstSession.Genre).not.to.equal(secondSession.Genre);
        expect(firstSession.Cover).not.to.equal(secondSession.Cover);
        expect(firstSession.Publisher).not.to.equal(secondSession.Publisher);
    });
});
