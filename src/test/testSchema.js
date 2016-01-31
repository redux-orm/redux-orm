import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import Schema from '../Schema';
import Session from '../Session';
import Model from '../Model';
import { oneToOne, fk, many } from '../fields';

import { createTestModels } from './utils';

chai.use(sinonChai);
const { expect } = chai;

describe('Schema', () => {
    it('constructor works', () => {
        const schema = new Schema();
        expect(schema.selectorCreator).to.be.a('function');
    });

    describe('throws on invalid model declarations', () => {
        it('with multiple one-to-one fields to the same model without related name', () => {
            class A extends Model {}
            A.modelName = 'A';

            class B extends Model {}
            B.modelName = 'B';
            B.fields = {
                field1: oneToOne('A'),
                field2: oneToOne('A'),
            };
            const schema = new Schema();
            schema.register(A, B);
            expect(() => schema.getModelClasses()).to.throw(/field/);
        });

        it('with multiple foreign keys to the same model without related name', () => {
            class A extends Model {}
            A.modelName = 'A';

            class B extends Model {}
            B.modelName = 'B';
            B.fields = {
                field1: fk('A'),
                field2: fk('A'),
            };
            const schema = new Schema();
            schema.register(A, B);
            expect(() => schema.getModelClasses()).to.throw(/field/);
        });

        it('with multiple many-to-manys to the same model without related name', () => {
            class A extends Model {}
            A.modelName = 'A';

            class B extends Model {}
            B.modelName = 'B';
            B.fields = {
                field1: many('A'),
                field2: many('A'),
            };
            const schema = new Schema();
            schema.register(A, B);
            expect(() => schema.getModelClasses()).to.throw(/field/);
        });
    });

    describe('simple schema', () => {
        let schema;
        let Book;
        let Author;
        let Cover;
        let Genre;
        beforeEach(() => {
            ({
                Book,
                Author,
                Cover,
                Genre,
            } = createTestModels());

            schema = new Schema();
        });

        it('correctly registers a single model at a time', () => {
            expect(schema.registry).to.have.length(0);
            schema.register(Book);
            expect(schema.registry).to.have.length(1);
            schema.register(Author);
            expect(schema.registry).to.have.length(2);
        });

        it('correctly registers multiple models', () => {
            expect(schema.registry).to.have.length(0);
            schema.register(Book, Author);
            expect(schema.registry).to.have.length(2);
        });

        it('correctly starts session', () => {
            const initialState = {};
            const session = schema.from(initialState);
            expect(session).to.be.instanceOf(Session);
        });


        it('correctly gets models from registry', () => {
            schema.register(Book);
            expect(schema.get('Book')).to.equal(Book);
        });

        it('correctly sets model prototypes', () => {
            schema.register(Book, Author, Cover, Genre);
            expect(Book.isSetUp).to.not.be.ok;

            let coverDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'cover'
            );
            expect(coverDescriptor).to.be.undefined;
            let authorDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'author'
            );
            expect(authorDescriptor).to.be.undefined;
            let genresDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'genres'
            );
            expect(genresDescriptor).to.be.undefined;

            schema._setupModelPrototypes();

            expect(Book.isSetUp).to.be.ok;

            coverDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'cover'
            );
            expect(coverDescriptor.get).to.be.a('function');
            expect(coverDescriptor.set).to.be.a('function');

            authorDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'author'
            );
            expect(authorDescriptor.get).to.be.a('function');
            expect(authorDescriptor.set).to.be.a('function');

            genresDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'genres'
            );
            expect(genresDescriptor.get).to.be.a('function');
            expect(genresDescriptor.set).to.be.a('function');
        });

        it('calling reducer with undefined state doesn\'t throw', () => {
            schema.register(Book, Author, Cover, Genre);
            schema.reducer()(undefined, { type: '______init' });
        });

        it('correctly gets the default state', () => {
            schema.register(Book, Author, Cover, Genre);
            const defaultState = schema.getDefaultState();

            expect(defaultState).to.deep.equal({
                Book: {
                    items: [],
                    itemsById: {},
                },
                BookGenres: {
                    items: [],
                    itemsById: {},
                },
                Author: {
                    items: [],
                    itemsById: {},
                },
                Cover: {
                    items: [],
                    itemsById: {},
                },
                Genre: {
                    items: [],
                    itemsById: {},
                },
            });
        });

        it('correctly creates a selector', () => {
            schema.register(Book, Author, Cover, Genre);
            let selectorTimesRun = 0;
            const selector = schema.createSelector(() => selectorTimesRun++);
            expect(selector).to.be.a('function');

            const state = schema.getDefaultState();
            selector(state);
            expect(selectorTimesRun).to.equal(1);
            selector(state);
            expect(selectorTimesRun).to.equal(1);
            selector(schema.getDefaultState());
            expect(selectorTimesRun).to.equal(1);
        });

        it('correctly creates a selector with input selectors', () => {
            schema.register(Book, Author, Cover, Genre);

            const _selectorFunc = sinon.spy();

            const selector = schema.createSelector(
                state => state.orm,
                state => state.selectedUser,
                _selectorFunc
            );

            const _state = schema.getDefaultState();

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

            const otherUserState = { ...appState, selectedUser: 0 };

            selector(otherUserState);
            expect(_selectorFunc.callCount).to.equal(2);
        });

        it('correctly starts a mutating session', () => {
            schema.register(Book, Author, Cover, Genre);
            const initialState = schema.getDefaultState();
            const session = schema.withMutations(initialState);
            expect(session).to.be.an.instanceOf(Session);
            expect(session.withMutations).to.be.true;
        });
    });
});
