import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import {
    ORM,
    Session,
    Model,
    oneToOne,
    fk,
    many,
} from '../';

import { createTestModels } from './utils';

chai.use(sinonChai);
const { expect } = chai;

describe('ORM', () => {
    it('constructor works', () => {
        new ORM(); // eslint-disable-line no-new
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
            const orm = new ORM();
            orm.register(A, B);
            expect(() => orm.getModelClasses()).to.throw(/field/);
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
            const orm = new ORM();
            orm.register(A, B);
            expect(() => orm.getModelClasses()).to.throw(/field/);
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
            const orm = new ORM();
            orm.register(A, B);
            expect(() => orm.getModelClasses()).to.throw(/field/);
        });
    });

    describe('simple orm', () => {
        let orm;
        let Book;
        let Author;
        let Cover;
        let Genre;
        let Publisher;
        beforeEach(() => {
            ({
                Book,
                Author,
                Cover,
                Genre,
                Publisher,
            } = createTestModels());

            orm = new ORM();
        });

        it('correctly registers a single model at a time', () => {
            expect(orm.registry).to.have.length(0);
            orm.register(Book);
            expect(orm.registry).to.have.length(1);
            orm.register(Author);
            expect(orm.registry).to.have.length(2);
        });

        it('correctly registers multiple models', () => {
            expect(orm.registry).to.have.length(0);
            orm.register(Book, Author);
            expect(orm.registry).to.have.length(2);
        });

        it('correctly starts session', () => {
            const initialState = {};
            const session = orm.from(initialState);
            expect(session).to.be.instanceOf(Session);
        });


        it('correctly gets models from registry', () => {
            orm.register(Book);
            expect(orm.get('Book')).to.equal(Book);
        });

        it('correctly sets model prototypes', () => {
            orm.register(Book, Author, Cover, Genre, Publisher);
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

            let publisherDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'publisher'
            );
            expect(publisherDescriptor).to.be.undefined;

            orm._setupModelPrototypes(orm.registry);
            orm._setupModelPrototypes(orm.implicitThroughModels);

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

            publisherDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'publisher'
            );
            expect(publisherDescriptor.get).to.be.a('function');
            expect(publisherDescriptor.set).to.be.a('function');
        });

        it('correctly gets the default state', () => {
            orm.register(Book, Author, Cover, Genre, Publisher);
            const defaultState = orm.getEmptyState();

            expect(defaultState).to.deep.equal({
                Book: {
                    items: [],
                    itemsById: {},
                    meta: {},
                },
                BookGenres: {
                    items: [],
                    itemsById: {},
                    meta: {},
                },
                Author: {
                    items: [],
                    itemsById: {},
                    meta: {},
                },
                Cover: {
                    items: [],
                    itemsById: {},
                    meta: {},
                },
                Genre: {
                    items: [],
                    itemsById: {},
                    meta: {},
                },
                Publisher: {
                    items: [],
                    itemsById: {},
                    meta: {},
                },
            });
        });

        it('correctly starts a mutating session', () => {
            orm.register(Book, Author, Cover, Genre, Publisher);
            const initialState = orm.getEmptyState();
            const session = orm.mutableSession(initialState);
            expect(session).to.be.an.instanceOf(Session);
            expect(session.withMutations).to.be.true;
        });
    });
});
