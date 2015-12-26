import {expect} from 'chai';
import Schema from '../Schema';
import Session from '../Session';
import {createTestModels} from './utils';

describe('Schema', () => {
    it('constructor works', () => {
        const schema = new Schema();
        expect(schema.selectorCreator).to.be.a('function');
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
    });
});
