import deepFreeze from 'deep-freeze';
import { Model, QuerySet, ORM, attr } from '../';
import { createTestSessionWithData } from './utils';

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
            expect(state).toEqual(
                expect.objectContaining({
                    Book: expect.anything(),
                    Cover: expect.anything(),
                    Genre: expect.anything(),
                    Author: expect.anything(),
                    BookGenres: expect.anything(),
                    Publisher: expect.anything()
                })
            );

            expect(state.Book.items).toHaveLength(3);
            expect(Object.keys(state.Book.itemsById)).toHaveLength(3);

            expect(state.Cover.items).toHaveLength(3);
            expect(Object.keys(state.Cover.itemsById)).toHaveLength(3);

            expect(state.Genre.items).toHaveLength(4);
            expect(Object.keys(state.Genre.itemsById)).toHaveLength(4);

            expect(state.BookGenres.items).toHaveLength(5);
            expect(Object.keys(state.BookGenres.itemsById)).toHaveLength(5);

            expect(state.Author.items).toHaveLength(3);
            expect(Object.keys(state.Author.itemsById)).toHaveLength(3);

            expect(state.Publisher.items).toHaveLength(2);
            expect(Object.keys(state.Publisher.itemsById)).toHaveLength(2);
        });

        it('Models correctly indicate if id exists', () => {
            const { Book } = session;
            expect(Book.hasId(0)).toBe(true);
            expect(Book.hasId(92384)).toBe(false);
            expect(Book.hasId()).toBe(false);
        });

        it('Models correctly create new instances', () => {
            const { Book } = session;
            const book = Book.create({
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                publisher: 0,
            });
            expect(session.Book.count()).toBe(4);
            expect(session.Book.last().ref).toBe(book.ref);
        });

        it('Model.getId works', () => {
            const { Book } = session;
            expect(Book.withId(0).getId()).toBe(0);
            expect(Book.withId(1).getId()).toBe(1);
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

            expect(() => Book.create(newProps)).toThrowError('Book.genres');
        });

        it('Models are correctly deleted', () => {
            const { Book } = session;
            expect(Book.count()).toBe(3);
            Book.withId(0).delete();
            expect(session.Book.count()).toBe(2);
            expect(session.Book.hasId(0)).toBe(false);
        });

        it('Models correctly update when setting properties', () => {
            const { Book } = session;
            const book = Book.first();
            const newName = 'New Name';
            book.name = newName;
            expect(session.Book.first().name).toBe(newName);
        });

        it('Model.toString works', () => {
            const { Book } = session;
            const book = Book.first();
            expect(book.toString()).toBe('Book: {id: 0, name: Tommi Kaikkonen - an Autobiography, ' +
            'releaseYear: 2050, author: 0, cover: 0, genres: [0, 1], publisher: 1}');
        });

        it('withId throws if model instance not found', () => {
            const { Book } = session;
            expect(() => Book.withId(10)).toThrowError(Error);
        });

        it('Models correctly create a new instance via upsert', () => {
            const { Book } = session;
            const book = Book.upsert({
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                publisher: 0,
            });
            expect(session.Book.count()).toBe(4);
            expect(session.Book.last().ref).toBe(book.ref);
            expect(book).toBeInstanceOf(Book);
        });

        it('Models correctly update existing instance via upsert', () => {
            const { Book } = session;
            const book = Book.upsert({
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                publisher: 0,
            });
            expect(session.Book.count()).toBe(4);
            expect(session.Book.last().ref).toBe(book.ref);
            expect(session.Book.last().releaseYear).toBe(2015);

            const nextBook = Book.upsert({
                [Book.idAttribute]: book.getId(),
                releaseYear: 2016,
            });

            expect(session.Book.count()).toBe(4);
            expect(session.Book.last().ref).toBe(book.ref);
            expect(session.Book.last().ref).toBe(nextBook.ref);
            expect(session.Book.last().releaseYear).toBe(2016);
            expect(book.ref).toBe(nextBook.ref);
            expect(nextBook).toBeInstanceOf(Book);
        });

        it('many-to-many relationship descriptors work', () => {
            const {
                Book,
                Genre,
            } = session;

            // Forward (from many-to-many field declaration)
            const book = Book.first();
            const relatedGenres = book.genres;
            expect(relatedGenres).toBeInstanceOf(QuerySet);
            expect(relatedGenres.modelClass).toBe(Genre);
            expect(relatedGenres.count()).toBe(2);

            // Backward
            const genre = Genre.first();
            const relatedBooks = genre.books;
            expect(relatedBooks).toBeInstanceOf(QuerySet);
            expect(relatedBooks.modelClass).toBe(Book);
        });

        it('many-to-many relationship descriptors work with a custom through model', () => {
            const {
                Author,
                Publisher,
            } = session;

            // Forward (from many-to-many field declaration)
            const author = Author.get({ name: 'Tommi Kaikkonen' });
            const relatedPublishers = author.publishers;
            expect(relatedPublishers).toBeInstanceOf(QuerySet);
            expect(relatedPublishers.modelClass).toBe(Publisher);
            expect(relatedPublishers.count()).toBe(1);

            // Backward
            const publisher = Publisher.get({ name: 'Technical Publishing' });
            const relatedAuthors = publisher.authors;
            expect(relatedAuthors).toBeInstanceOf(QuerySet);
            expect(relatedAuthors.modelClass).toBe(Author);
            expect(relatedAuthors.count()).toBe(2);
        });

        it('adding related many-to-many entities works', () => {
            const { Book, Genre } = session;
            const book = Book.withId(0);
            expect(book.genres.count()).toBe(2);
            book.genres.add(Genre.withId(2));

            expect(session.Book.withId(0).genres.count()).toBe(3);
        });

        it('trying to add existing related many-to-many entities throws', () => {
            const { Book } = session;
            const book = Book.withId(0);

            const existingId = 1;
            expect(() => book.genres.add(existingId)).toThrowError(existingId.toString());
        });

        it('updating related many-to-many entities through ids works', () => {
            const { Genre, Author } = session;
            const tommi = Author.get({ name: 'Tommi Kaikkonen' });
            const book = tommi.books.first();
            expect(book.genres.toRefArray().map(row => row.id)).toEqual([0, 1]);

            const deleteGenre = Genre.withId(0);

            book.update({ genres: [1, 2] });
            expect(book.genres.toRefArray().map(row => row.id)).toEqual([1, 2]);

            expect(deleteGenre.books.filter({ id: book.id }).exists()).toBe(false);
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
            ).toEqual([0, 99]);
            expect(book.genres.toRefArray().map(row => row.id)).toEqual([0]);

            book.update({ genres: [1, 98] });

            expect(
              session.BookGenres
                .filter({ fromBookId: book.id })
                .toRefArray()
                .map(row => row.toGenreId)
            ).toEqual([1, 98]);
            expect(book.genres.toRefArray().map(row => row.id)).toEqual([1]);
        });

        it('updating non-existing many-to-many entities works', () => {
            const { Genre, Author } = session;
            const tommi = Author.get({ name: 'Tommi Kaikkonen' });
            const book = tommi.books.first();
            expect(book.genres.toRefArray().map(row => row.id)).toEqual([0, 1]);

            const deleteGenre = Genre.withId(0);
            const keepGenre = Genre.withId(1);
            const addGenre = Genre.withId(2);

            book.update({ genres: [addGenre, keepGenre] });
            expect(book.genres.toRefArray().map(row => row.id)).toEqual([1, 2]);

            expect(deleteGenre.books.filter({ id: book.id }).exists()).toBe(false);
        });

        it('removing related many-to-many entities works', () => {
            const { Book, Genre } = session;
            const book = Book.withId(0);
            expect(book.genres.count()).toBe(2);
            book.genres.remove(Genre.withId(0));

            expect(session.Book.withId(0).genres.count()).toBe(1);
        });

        it('trying to remove unexisting related many-to-many entities throws', () => {
            const { Book } = session;
            const book = Book.withId(0);

            const unexistingId = 2012384;
            expect(() => book.genres.remove(0, unexistingId)).toThrowError(unexistingId.toString());
        });

        it('clearing related many-to-many entities works', () => {
            const { Book } = session;
            const book = Book.withId(0);
            expect(book.genres.count()).toBe(2);
            book.genres.clear();

            expect(session.Book.withId(0).genres.count()).toBe(0);
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
            expect(author).toBeInstanceOf(Author);
            expect(author.getId()).toBe(rawFk);

            // Backward
            const relatedBooks = author.books;
            expect(relatedBooks).toBeInstanceOf(QuerySet);
            relatedBooks._evaluate();
            expect(relatedBooks.rows).toContain(book.ref);
            expect(relatedBooks.modelClass).toBe(Book);
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
            expect(cover).toBeInstanceOf(Cover);
            expect(cover.getId()).toBe(rawFk);

            // Backward
            const relatedBook = cover.book;
            expect(relatedBook).toBeInstanceOf(Book);
            expect(relatedBook.getId()).toBe(book.getId());
        });

        it('applying no updates returns the same state reference', () => {
            const book = session.Book.first();
            book.name = book.name;

            expect(session.state).toBe(state);
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

            expect(sess.DefaultFieldModel.hasId(1)).toBe(true);

            returnId = 999;
            sess.DefaultFieldModel.create({});
            expect(sess.DefaultFieldModel.hasId(999)).toBe(true);
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
            expect(state.Book.itemsById[bookId]).toBe(bookRef);
            const newName = 'New Name';

            book.name = newName;

            expect(book.name).toBe(newName);

            const nextState = mutating.state;
            expect(nextState).toBe(state);
            expect(state.Book.itemsById[bookId]).toBe(bookRef);
            expect(bookRef.name).toBe(newName);
            expect(state.Cover.itemsById[coverId].src).toBe('somecover.png');
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

            expect(firstSession.Book.count()).toBe(3);
            expect(secondSession.Book.count()).toBe(3);

            const newBookProps = {
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                genres: [0, 1],
            };

            firstSession.Book.create(newBookProps);

            expect(firstSession.Book.count()).toBe(4);
            expect(secondSession.Book.count()).toBe(3);
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

    it('adds a big amount of items in acceptable time', () => {
        const session = orm.session(orm.getEmptyState());
        const start = new Date().getTime();

        const amount = 10000;
        for (let i = 0; i < amount; i++) {
            session.Item.create({ id: i, name: 'TestItem' });
        }
        const end = new Date().getTime();
        const tookSeconds = (end - start) / 1000;
        console.log(`Creating ${amount} objects took ${tookSeconds}s`);
        expect(tookSeconds).toBeLessThanOrEqual(3);
    });
});
