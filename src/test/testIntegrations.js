import { expect } from 'chai';
import Model from '../Model';
import QuerySet from '../QuerySet';
import Schema from '../Schema';
import {
    createTestSessionWithData,
} from './utils';
import deepFreeze from 'deep-freeze';

describe('Integration', () => {
    let session;
    let schema;
    let state;

    beforeEach(() => {
        ({
            session,
            schema,
            state,
        } = createTestSessionWithData());
    });

    describe('Immutable session', () => {
        beforeEach(() => {
            // Deep freeze state. This will raise an error if we
            // mutate the state.
            deepFreeze(state);
        });

        it('Initial data bootstrapping results in a correct state', () => {
            expect(state).to.have.all.keys(
                'Book', 'Cover', 'Genre', 'Author', 'BookGenres');

            expect(state.Book.items).to.have.length(3);
            expect(Object.keys(state.Book.itemsById)).to.have.length(3);

            expect(state.Cover.items).to.have.length(3);
            expect(Object.keys(state.Cover.itemsById)).to.have.length(3);

            expect(state.Genre.items).to.have.length(4);
            expect(Object.keys(state.Genre.itemsById)).to.have.length(4);

            expect(state.BookGenres.items).to.have.length(5);
            expect(Object.keys(state.BookGenres.itemsById)).to.have.length(5);

            expect(state.Author.items).to.have.length(3);
            expect(Object.keys(state.Author.itemsById)).to.have.length(3);
        });

        it('Models correctly indicate if id exists', () => {
            const { Book } = session;
            expect(Book.hasId(0)).to.be.true;
            expect(Book.hasId(92384)).to.be.false;
            expect(Book.hasId()).to.be.false;
        });

        it('Models correctly create new instances', () => {
            const { Book } = session;
            expect(session.updates).to.have.length(0);
            const book = Book.create({
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
            });
            expect(session.updates).to.have.length(1);

            const nextState = session.reduce();
            const nextSession = schema.from(nextState);
            expect(nextSession.Book.count()).to.equal(4);
        });

        it('Model.create throws if passing duplicate ids to many-to-many field', () => {
            const { Book } = session;

            const newProps = {
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                genres: [0, 0],
            };

            expect(() => Book.create(newProps)).to.throw('Book.genres');
        });

        it('Models are correctly deleted', () => {
            const { Book } = session;
            expect(Book.count()).to.equal(3);
            Book.withId(0).delete();

            const nextState = session.reduce();
            const nextSession = schema.from(nextState);
            expect(nextSession.Book.count()).to.equal(2);
        });

        it('Models correctly update when setting properties', () => {
            const { Book } = session;
            const book = Book.first();
            const newName = 'New Name';
            expect(session.updates).to.have.length(0);
            book.name = newName;
            expect(session.updates).to.have.length(1);

            const nextState = session.reduce();
            const nextSession = schema.from(nextState);
            expect(nextSession.Book.first().name).to.equal(newName);
        });

        it('withId throws if model instance not found', () => {
            const { Book } = session;
            expect(() => Book.withId(10)).to.throw(Error);
        });

        it('many-to-many relationship descriptors work', () => {
            const {
                Book,
                Genre,
            } = session;

            // Forward (from many-to-many field declaration)
            const book = Book.first();
            const relatedGenres = book.genres;
            expect(relatedGenres).to.be.an.instanceOf(QuerySet);
            expect(relatedGenres.modelClass).to.equal(Genre);
            expect(relatedGenres.count()).to.equal(2);

            // Backward
            const genre = Genre.first();
            const relatedBooks = genre.books;
            expect(relatedBooks).to.be.an.instanceOf(QuerySet);
            expect(relatedBooks.modelClass).to.equal(Book);
        });

        it('adding related many-to-many entities works', () => {
            const { Book, Genre } = session;
            const book = Book.withId(0);
            expect(book.genres.count()).to.equal(2);
            book.genres.add(Genre.withId(2));

            const nextState = session.reduce();
            const nextSession = schema.from(nextState);

            expect(nextSession.Book.withId(0).genres.count()).to.equal(3);
        });

        it('trying to add existing related many-to-many entities throws', () => {
            const { Book } = session;
            const book = Book.withId(0);

            const existingId = 1;
            expect(() => book.genres.add(existingId)).to.throw(existingId.toString());
        });

        it('removing related many-to-many entities works', () => {
            const { Book, Genre } = session;
            const book = Book.withId(0);
            expect(book.genres.count()).to.equal(2);
            book.genres.remove(Genre.withId(0));

            const nextState = session.reduce();
            const nextSession = schema.from(nextState);

            expect(nextSession.Book.withId(0).genres.count()).to.equal(1);
        });

        it('trying to remove unexisting related many-to-many entities throws', () => {
            const { Book } = session;
            const book = Book.withId(0);

            const unexistingId = 2012384;
            expect(() => book.genres.remove(0, unexistingId)).to.throw(unexistingId.toString());
        });

        it('clearing related many-to-many entities works', () => {
            const { Book } = session;
            const book = Book.withId(0);
            expect(book.genres.count()).to.equal(2);
            book.genres.clear();

            const nextState = session.reduce();
            const nextSession = schema.from(nextState);

            expect(nextSession.Book.withId(0).genres.count()).to.equal(0);
        });

        it('foreign key relationship descriptors work', () => {
            const {
                Book,
                Author,
            } = session;

            // Forward
            const book = Book.first();
            const author = book.author;
            const rawFk = book.ref.author;
            expect(author).to.be.an.instanceOf(Author);
            expect(author.getId()).to.equal(rawFk);

            // Backward
            const relatedBooks = author.books;
            expect(relatedBooks).to.be.an.instanceOf(QuerySet);
            expect(relatedBooks.idArr).to.include(book.getId());
            expect(relatedBooks.modelClass).to.equal(Book);
        });

        it('one-to-one relationship descriptors work', () => {
            const {
                Book,
                Cover,
            } = session;

            // Forward
            const book = Book.first();
            const cover = book.cover;
            const rawFk = book.ref.cover;
            expect(cover).to.be.an.instanceOf(Cover);
            expect(cover.getId()).to.equal(rawFk);

            // Backward
            const relatedBook = cover.book;
            expect(relatedBook).to.be.an.instanceOf(Book);
            expect(relatedBook.getId()).to.equal(book.getId());
        });

        it('applying no updates returns the same state reference', () => {
            const nextState = session.reduce();
            expect(nextState).to.equal(state);
        });
    });

    describe('Mutating session', () => {
        it('works', () => {
            const mutating = schema.withMutations(state);
            const {
                Book,
                Cover,
            } = mutating;

            const cover = Cover.create({ src: 'somecover.png' });
            const coverId = cover.getId();

            const book = Book.first();
            const bookRef = book.ref;
            const bookId = book.getId();
            expect(state.Book.itemsById[bookId]).to.equal(bookRef);
            const newName = 'New Name';

            book.name = newName;

            expect(book.name).to.equal(newName);

            const nextState = mutating.reduce();
            expect(nextState).to.equal(state);
            expect(state.Book.itemsById[bookId]).to.equal(bookRef);
            expect(bookRef.name).to.equal(newName);
            expect(state.Cover.itemsById[coverId].src).to.equal('somecover.png');
        });
    });

    describe('Multiple concurrent sessions', () => {
        it('works', () => {
            const firstSession = session;
            const secondSession = schema.from(state);

            expect(firstSession.Book.count()).to.equal(3);
            expect(secondSession.Book.count()).to.equal(3);

            const newBookProps = {
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                genres: [0, 1],
            };

            firstSession.Book.create(newBookProps);

            const nextFirstSession = schema.from(firstSession.getNextState());
            const nextSecondSession = schema.from(secondSession.getNextState());

            expect(nextFirstSession.Book.count()).to.equal(4);
            expect(nextSecondSession.Book.count()).to.equal(3);
        });
    });
});

describe('Big Data Test', () => {
    let Item;
    let schema;

    beforeEach(() => {
        Item = class extends Model {};
        Item.modelName = 'Item';
        schema = new Schema();
        schema.register(Item);
    });

    it('adds a big amount of items in acceptable time', function () {
        this.timeout(30000);

        const session = schema.from(schema.getDefaultState());
        const start = new Date().getTime();

        const amount = 10000;
        for (let i = 0; i < amount; i++) {
            session.Item.create({ id: i, name: 'TestItem' });
        }
        const nextState = session.getNextState();
        const end = new Date().getTime();
        const tookSeconds = (end - start) / 1000;
        console.log(`Creating ${amount} objects took ${tookSeconds}s`);
        expect(tookSeconds).to.be.at.most(3);
    });
});
