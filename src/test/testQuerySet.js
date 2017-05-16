import { Model, ORM, QuerySet } from '../';
import { createTestModels, createTestSessionWithData } from './utils';

describe('QuerySet tests', () => {
    let session;
    let bookQs;
    let genreQs;
    beforeEach(() => {
        ({ session } = createTestSessionWithData());
        bookQs = session.Book.getQuerySet();
        genreQs = session.Genre.getQuerySet();
    });

    it('count works correctly', () => {
        expect(bookQs.count()).toBe(3);
        expect(genreQs.count()).toBe(4);
    });

    it('exists works correctly', () => {
        expect(bookQs.exists()).toBe(true);

        const emptyQs = (new QuerySet(session.Book, [])).filter(() => false);

        expect(emptyQs.exists()).toBe(false);
    });

    it('at works correctly', () => {
        expect(bookQs.at(0)).toBeInstanceOf(Model);
        expect(bookQs.toRefArray()[0]).toBe(session.Book.withId(0).ref);
    });

    it('at doesn\'t return a Model instance if index is out of bounds', () => {
        expect(bookQs.at(-1)).toBeUndefined();
        const len = bookQs.count();
        expect(bookQs.at(len)).toBeUndefined();
    });

    it('first works correctly', () => {
        expect(bookQs.first()).toEqual(bookQs.at(0));
    });

    it('last works correctly', () => {
        const lastIndex = bookQs.count() - 1;
        expect(bookQs.last()).toEqual(bookQs.at(lastIndex));
    });

    it('all works correctly', () => {
        const all = bookQs.all();

        // Force evaluation of QuerySets
        bookQs.toRefArray();
        all.toRefArray();

        expect(all).not.toBe(bookQs);
        expect(all.rows.length).toBe(bookQs.rows.length);

        for (let i = 0; i < all.rows.length; i++) {
            expect(all.rows[i]).toBe(bookQs.rows[i]);
        }
    });

    it('filter works correctly with object argument', () => {
        const filtered = bookQs.filter({ name: 'Clean Code' });
        expect(filtered.count()).toBe(1);
        expect(filtered.first().ref).toBe(session.Book.withId(1).ref);
    });

    it('filter works correctly with object argument, with model instance value', () => {
        const filtered = bookQs.filter({
            author: session.Author.withId(0),
        });
        expect(filtered.count()).toBe(1);
        expect(filtered.first().ref).toBe(session.Book.withId(0).ref);
    });

    it('orderBy works correctly with prop argument', () => {
        const ordered = bookQs.orderBy(['releaseYear']);
        const idArr = ordered.toRefArray().map(row => row.id);
        expect(idArr).toEqual([1, 2, 0]);
    });

    it('orderBy works correctly with function argument', () => {
        const ordered = bookQs.orderBy([(book) => book.releaseYear]);
        const idArr = ordered.toRefArray().map(row => row.id);
        expect(idArr).toEqual([1, 2, 0]);
    });

    it('exclude works correctly with object argument', () => {
        const excluded = bookQs.exclude({ name: 'Clean Code' });
        expect(excluded.count()).toBe(2);

        const idArr = excluded.toRefArray().map(row => row.id);
        expect(idArr).toEqual([0, 2]);
    });

    it('update records a update', () => {
        const mergeObj = { name: 'Updated Book Name' };
        bookQs.update(mergeObj);

        bookQs.toRefArray().forEach(row => expect(row.name).toBe('Updated Book Name'));
    });

    it('delete records a update', () => {
        bookQs.delete();
        expect(bookQs.count()).toBe(0);
    });

    it('custom methods works', () => {
        const {
            Book,
            Genre,
            Cover,
            Author,
            Publisher,
        } = createTestModels();

        const currentYear = 2015;
        class CustomQuerySet extends QuerySet {
            unreleased() {
                return this.filter(book => book.releaseYear > currentYear);
            }
        }
        CustomQuerySet.addSharedMethod('unreleased');

        Book.querySetClass = CustomQuerySet;

        const orm = new ORM();
        orm.register(Book, Genre, Cover, Author, Publisher);
        const { session: sess } = createTestSessionWithData(orm);

        const customQs = sess.Book.getQuerySet();

        expect(customQs).toBeInstanceOf(CustomQuerySet);

        const unreleased = customQs.unreleased();
        expect(unreleased.count()).toBe(1);

        expect(unreleased.first().ref).toEqual({
            id: 0,
            name: 'Tommi Kaikkonen - an Autobiography',
            author: 0,
            cover: 0,
            releaseYear: 2050,
            publisher: 1,
        });
        expect(sess.Book.unreleased().count()).toBe(1);
        expect(sess.Book.filter({ name: 'Clean Code' }).count()).toBe(1);
    });
});
