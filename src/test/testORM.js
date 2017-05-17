import { ORM, Session, Model, oneToOne, fk, many } from '../';
import { createTestModels } from './utils';

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
            expect(() => orm.getModelClasses()).toThrowError(/field/);
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
            expect(() => orm.getModelClasses()).toThrowError(/field/);
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
            expect(() => orm.getModelClasses()).toThrowError(/field/);
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
            expect(orm.registry).toHaveLength(0);
            orm.register(Book);
            expect(orm.registry).toHaveLength(1);
            orm.register(Author);
            expect(orm.registry).toHaveLength(2);
        });

        it('correctly registers multiple models', () => {
            expect(orm.registry).toHaveLength(0);
            orm.register(Book, Author);
            expect(orm.registry).toHaveLength(2);
        });

        it('correctly starts session', () => {
            const initialState = {};
            const session = orm.session(initialState);
            expect(session).toBeInstanceOf(Session);
        });


        it('correctly gets models from registry', () => {
            orm.register(Book);
            expect(orm.get('Book')).toBe(Book);
        });

        it('correctly sets model prototypes', () => {
            orm.register(Book, Author, Cover, Genre, Publisher);
            expect(Book.isSetUp).toBeFalsy();

            let coverDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'cover'
            );
            expect(coverDescriptor).toBeUndefined();
            let authorDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'author'
            );
            expect(authorDescriptor).toBeUndefined();
            let genresDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'genres'
            );
            expect(genresDescriptor).toBeUndefined();

            let publisherDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'publisher'
            );
            expect(publisherDescriptor).toBeUndefined();

            orm._setupModelPrototypes(orm.registry);
            orm._setupModelPrototypes(orm.implicitThroughModels);

            expect(Book.isSetUp).toBeTruthy();

            coverDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'cover'
            );
            expect(typeof coverDescriptor.get).toBe('function');
            expect(typeof coverDescriptor.set).toBe('function');

            authorDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'author'
            );
            expect(typeof authorDescriptor.get).toBe('function');
            expect(typeof authorDescriptor.set).toBe('function');

            genresDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'genres'
            );
            expect(typeof genresDescriptor.get).toBe('function');
            expect(typeof genresDescriptor.set).toBe('function');

            publisherDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                'publisher'
            );
            expect(typeof publisherDescriptor.get).toBe('function');
            expect(typeof publisherDescriptor.set).toBe('function');
        });

        it('correctly gets the default state', () => {
            orm.register(Book, Author, Cover, Genre, Publisher);
            const defaultState = orm.getEmptyState();

            expect(defaultState).toEqual({
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
            expect(session).toBeInstanceOf(Session);
            expect(session.withMutations).toBe(true);
        });
    });
});
