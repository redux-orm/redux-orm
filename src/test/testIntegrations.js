import {expect} from 'chai';
import QuerySet from '../QuerySet';
import {
    createTestSessionWithData,
} from './utils';

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

    it('Models correctly create new instances', () => {
        const {Book} = session;
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

    it('Models correctly update when setting properties', () => {
        const {Book} = session;
        const book = Book.first();
        const newName = 'New Name';
        expect(session.updates).to.have.length(0);
        book.name = newName;
        expect(session.updates).to.have.length(1);

        const nextState = session.reduce();
        const nextSession = schema.from(nextState);
        expect(nextSession.Book.first().name).to.equal(newName);
    });

    it('Mutating session works', () => {
        const mutating = schema.withMutations(state);
        const {
            Book,
            Cover,
        } = mutating;

        const cover = Cover.create({src: 'somecover.png'});
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
});
