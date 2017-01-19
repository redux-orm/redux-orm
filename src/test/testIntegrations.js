import { expect } from 'chai';
import {
    Model,
    QuerySet,
    ORM,
    attr,
} from '../';
import {
    createTestSessionWithData,
} from './utils';
import deepFreeze from 'deep-freeze';

describe('Integration', () => {
    let session;
    let orm;
    let state;

    describe('Immutable session', () => {
        beforeEach(() => {
            // Deep freeze state. This will raise an error if we
            // mutate the state.

            ({
                session,
                orm,
                state,
            } = createTestSessionWithData());

            deepFreeze(state);
        });

        it('Initial data bootstrapping results in a correct state', () => {
            expect(state).to.have.all.keys(
                'Book', 'Cover', 'Genre', 'Author', 'BookGenres', 'Publisher');

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

            expect(state.Publisher.items).to.have.length(2);
            expect(Object.keys(state.Publisher.itemsById)).to.have.length(2);
        });

        it('Models correctly indicate if id exists', () => {
            const { Book } = session;
            expect(Book.hasId(0)).to.be.true;
            expect(Book.hasId(92384)).to.be.false;
            expect(Book.hasId()).to.be.false;
        });

        it('Models correctly create new instances', () => {
            const { Book } = session;
            const book = Book.create({
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                publisher: 0,
            });
            expect(session.Book.count()).to.equal(4);
            expect(session.Book.last().ref).to.equal(book.ref);
        });

        it('Model.getId works', () => {
            const { Book } = session;
            expect(Book.withId(0).getId()).to.equal(0);
            expect(Book.withId(1).getId()).to.equal(1);
        });

        it('Model.create throws if passing duplicate ids to many-to-many field', () => {
            const { Book } = session;

            const newProps = {
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                genres: [0, 0],
                publisher: 0,
            };

            expect(() => Book.create(newProps)).to.throw('Book.genres');
        });

        it('Models are correctly deleted', () => {
            const { Book } = session;
            expect(Book.count()).to.equal(3);
            Book.withId(0).delete();
            expect(session.Book.count()).to.equal(2);
            expect(session.Book.hasId(0)).to.be.false;
        });

        it('Models correctly update when setting properties', () => {
            const { Book } = session;
            const book = Book.first();
            const newName = 'New Name';
            book.name = newName;
            expect(session.Book.first().name).to.equal(newName);
        });

        it('Model.toString works', () => {
            const { Book } = session;
            const book = Book.first();
            expect(book.toString())
                .to.equal(
                    'Book: {id: 0, name: Tommi Kaikkonen - an Autobiography, ' +
                    'releaseYear: 2050, author: 0, cover: 0, genres: [0, 1], publisher: 1}'
                );
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

        it('many-to-many relationship descriptors work with a custom through model', () => {
            const {
                Author,
                Publisher,
            } = session;

            // Forward (from many-to-many field declaration)
            const author = Author.get({ name: 'Tommi Kaikkonen' });
            const relatedPublishers = author.publishers;
            expect(relatedPublishers).to.be.an.instanceOf(QuerySet);
            expect(relatedPublishers.modelClass).to.equal(Publisher);
            expect(relatedPublishers.count()).to.equal(1);

            // Backward
            const publisher = Publisher.get({ name: 'Technical Publishing' });
            const relatedAuthors = publisher.authors;
            expect(relatedAuthors).to.be.an.instanceOf(QuerySet);
            expect(relatedAuthors.modelClass).to.equal(Author);
            expect(relatedAuthors.count()).to.equal(2);
        });

        it('adding related many-to-many entities works', () => {
            const { Book, Genre } = session;
            const book = Book.withId(0);
            expect(book.genres.count()).to.equal(2);
            book.genres.add(Genre.withId(2));

            expect(session.Book.withId(0).genres.count()).to.equal(3);
        });

        it('trying to add existing related many-to-many entities throws', () => {
            const { Book } = session;
            const book = Book.withId(0);

            const existingId = 1;
            expect(() => book.genres.add(existingId)).to.throw(existingId.toString());
        });

        it('updating related many-to-many entities through ids works', () => {
            const { Genre, Author } = session;
            const tommi = Author.get({ name: 'Tommi Kaikkonen' });
            const book = tommi.books.first();
            expect(book.genres.toRefArray().map(row => row.id))
                .to.deep.equal([0, 1]);

            const deleteGenre = Genre.withId(0);

            book.update({ genres: [1, 2] });
            expect(book.genres.toRefArray().map(row => row.id))
                .to.deep.equal([1, 2]);

            expect(deleteGenre.books.filter({ id: book.id }).exists()).to.be.false;
        });

        it('updating related many-to-many with not existing entities works', () => {
            const { Book } = session;
            const book = Book.first();

            book.update({ genres: [0, 99] });

            expect(
              session.BookGenres
                .filter({ fromBookId: book.id })
                .toRefArray()
                .map(row => row.toGenreId)
            ).to.deep.equal([0, 99]);
            expect(book.genres.toRefArray().map(row => row.id))
              .to.deep.equal([0]);

            book.update({ genres: [1, 98] });

            expect(
              session.BookGenres
                .filter({ fromBookId: book.id })
                .toRefArray()
                .map(row => row.toGenreId)
            ).to.deep.equal([1, 98]);
            expect(book.genres.toRefArray().map(row => row.id))
              .to.deep.equal([1]);
        });

        it('updating non-existing many-to-many entities works', () => {
            const { Genre, Author } = session;
            const tommi = Author.get({ name: 'Tommi Kaikkonen' });
            const book = tommi.books.first();
            expect(book.genres.toRefArray().map(row => row.id))
                .to.deep.equal([0, 1]);

            const deleteGenre = Genre.withId(0);
            const keepGenre = Genre.withId(1);
            const addGenre = Genre.withId(2);

            book.update({ genres: [addGenre, keepGenre] });
            expect(book.genres.toRefArray().map(row => row.id))
                .to.deep.equal([1, 2]);

            expect(deleteGenre.books.filter({ id: book.id }).exists()).to.be.false;
        });

        it('removing related many-to-many entities works', () => {
            const { Book, Genre } = session;
            const book = Book.withId(0);
            expect(book.genres.count()).to.equal(2);
            book.genres.remove(Genre.withId(0));

            expect(session.Book.withId(0).genres.count()).to.equal(1);
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

            expect(session.Book.withId(0).genres.count()).to.equal(0);
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
            relatedBooks._evaluate();
            expect(relatedBooks.rows).to.include(book.ref);
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
            const book = session.Book.first();
            book.name = book.name;

            expect(session.state).to.equal(state);
        });

        it('Model works with default value', () => {
            let returnId = 1;

            class DefaultFieldModel extends Model {}
            DefaultFieldModel.fields = {
                id: attr({ getDefault: () => returnId }),
            };
            DefaultFieldModel.modelName = 'DefaultFieldModel';

            const _orm = new ORM();
            _orm.register(DefaultFieldModel);

            const sess = _orm.session(_orm.getEmptyState());
            sess.DefaultFieldModel.create({});

            expect(sess.DefaultFieldModel.hasId(1)).to.be.true;

            returnId = 999;
            sess.DefaultFieldModel.create({});
            expect(sess.DefaultFieldModel.hasId(999)).to.be.true;
        });
    });

    describe('Mutating session', () => {
        beforeEach(() => {
            ({
                session,
                orm,
                state,
            } = createTestSessionWithData());
        });

        it('works', () => {
            const mutating = orm.mutableSession(state);
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

            const nextState = mutating.state;
            expect(nextState).to.equal(state);
            expect(state.Book.itemsById[bookId]).to.equal(bookRef);
            expect(bookRef.name).to.equal(newName);
            expect(state.Cover.itemsById[coverId].src).to.equal('somecover.png');
        });
    });

    describe('Multiple concurrent sessions', () => {
        beforeEach(() => {
            ({
                session,
                orm,
                state,
            } = createTestSessionWithData());
        });

        it('works', () => {
            const firstSession = session;
            const secondSession = orm.session(state);

            expect(firstSession.Book.count()).to.equal(3);
            expect(secondSession.Book.count()).to.equal(3);

            const newBookProps = {
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                genres: [0, 1],
            };

            firstSession.Book.create(newBookProps);

            expect(firstSession.Book.count()).to.equal(4);
            expect(secondSession.Book.count()).to.equal(3);
        });
    });
});

describe('Big Data Test', () => {
    let Item;
    let orm;

    beforeEach(() => {
        Item = class extends Model {};
        Item.modelName = 'Item';
        Item.fields = {
            id: attr(),
            name: attr(),
        };
        orm = new ORM();
        orm.register(Item);
    });

    it('adds a big amount of items in acceptable time', function bigDataTest() {
        this.timeout(30000);

        const session = orm.session(orm.getEmptyState());
        const start = new Date().getTime();

        const amount = 10000;
        for (let i = 0; i < amount; i++) {
            session.Item.create({ id: i, name: 'TestItem' });
        }
        const end = new Date().getTime();
        const tookSeconds = (end - start) / 1000;
        console.log(`Creating ${amount} objects took ${tookSeconds}s`);
        expect(tookSeconds).to.be.at.most(3);
    });
});
