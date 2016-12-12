import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
chai.use(sinonChai);
const { expect } = chai;

import {
    Model,
    ORM,
    QuerySet,
} from '../';
import {
    createTestModels,
    createTestSessionWithData,
} from './utils';

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
        expect(bookQs.count()).to.equal(3);
        expect(genreQs.count()).to.equal(4);
    });

    it('exists works correctly', () => {
        expect(bookQs.exists()).to.be.true;

        const emptyQs = (new QuerySet(session.Book, [])).filter(() => false);

        expect(emptyQs.exists()).to.be.false;
    });

    it('at works correctly', () => {
        expect(bookQs.at(0)).to.be.an.instanceOf(Model);
        expect(bookQs.toRefArray()[0]).to.equal(session.Book.withId(0).ref);
    });

    it('first works correctly', () => {
        expect(bookQs.first()).to.deep.equal(bookQs.at(0));
    });

    it('last works correctly', () => {
        const lastIndex = bookQs.count() - 1;
        expect(bookQs.last()).to.deep.equal(bookQs.at(lastIndex));
    });

    it('all works correctly', () => {
        const all = bookQs.all();

        // Force evaluation of QuerySets
        bookQs.toRefArray();
        all.toRefArray();

        expect(all).not.to.equal(bookQs);
        expect(all.rows.length).to.equal(bookQs.rows.length);

        for (let i = 0; i < all.rows.length; i++) {
            expect(all.rows[i]).to.equal(bookQs.rows[i]);
        }
    });

    it('filter works correctly with object argument', () => {
        const filtered = bookQs.filter({ name: 'Clean Code' });
        expect(filtered.count()).to.equal(1);
        expect(filtered.first().ref).to.equal(session.Book.withId(1).ref);
    });

    it('filter works correctly with object argument, with model instance value', () => {
        const filtered = bookQs.filter({
            author: session.Author.withId(0),
        });
        expect(filtered.count()).to.equal(1);
        expect(filtered.first().ref).to.equal(session.Book.withId(0).ref);
    });

    it('orderBy works correctly with prop argument', () => {
        const ordered = bookQs.orderBy(['releaseYear']);
        const idArr = ordered.toRefArray().map(row => row.id);
        expect(idArr).to.deep.equal([1, 2, 0]);
    });

    it('orderBy works correctly with function argument', () => {
        const ordered = bookQs.orderBy([(book) => book.releaseYear]);
        const idArr = ordered.toRefArray().map(row => row.id);
        expect(idArr).to.deep.equal([1, 2, 0]);
    });

    it('exclude works correctly with object argument', () => {
        const excluded = bookQs.exclude({ name: 'Clean Code' });
        expect(excluded.count()).to.equal(2);

        const idArr = excluded.toRefArray().map(row => row.id);
        expect(idArr).to.deep.equal([0, 2]);
    });

    it('update records a update', () => {
        const mergeObj = { name: 'Updated Book Name' };
        bookQs.update(mergeObj);

        bookQs.toRefArray().forEach(row => expect(row.name).to.equal('Updated Book Name'));
    });

    it('delete records a update', () => {
        bookQs.delete();
        expect(bookQs.count()).to.equal(0);
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

        expect(customQs).to.be.an.instanceOf(CustomQuerySet);

        const unreleased = customQs.unreleased();
        expect(unreleased.count()).to.equal(1);

        expect(unreleased.first().ref).to.deep.equal({
            id: 0,
            name: 'Tommi Kaikkonen - an Autobiography',
            author: 0,
            cover: 0,
            releaseYear: 2050,
            publisher: 1,
        });
        expect(sess.Book.unreleased().count()).to.equal(1);
        expect(sess.Book.filter({ name: 'Clean Code' }).count()).to.equal(1);
    });
});
