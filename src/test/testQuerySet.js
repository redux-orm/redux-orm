import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
chai.use(sinonChai);
const {expect} = chai;

import Model from '../Model';
import Schema from '../Schema';
import QuerySet from '../QuerySet';
import {
    UPDATE,
    DELETE,
} from '../constants';
import {
    createTestModels,
    createTestSchema,
    createTestSessionWithData,
} from './utils';

describe('QuerySet tests', () => {
    let session;
    let bookQs;
    let genreQs;
    beforeEach(() => {
        ({session} = createTestSessionWithData());
        bookQs = session.Book.getQuerySet();
        genreQs = session.Genre.getQuerySet();
    });

    it('count works correctly', () => {
        expect(bookQs.count()).to.equal(3);
        expect(genreQs.count()).to.equal(4);
    });

    it('exists works correctly', () => {
        expect(bookQs.exists()).to.be.true;

        const emptyQs = new QuerySet(session.Book, []);
        expect(emptyQs.exists()).to.be.false;
    });

    it('at works correctly', () => {
        expect(bookQs.at(0)).to.be.an.instanceOf(Model);
        expect(bookQs.ref.at(0)).to.equal(session.Book.state.itemsById[0]);
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

        expect(all).not.to.equal(bookQs);
        expect(all.idArr).to.deep.equal(bookQs.idArr);
    });

    it('filter works correctly with object argument', () => {
        const filtered = bookQs.withRefs.filter({name: 'Clean Code'});
        expect(filtered.count()).to.equal(1);
        expect(filtered.ref.first()).to.equal(session.Book.state.itemsById[1]);
    });

    it('orderBy works correctly with prop argument', () => {
        const ordered = bookQs.orderBy(['releaseYear']);
        expect(ordered.idArr).to.deep.equal([1, 2, 0]);
    });

    it('orderBy works correctly with function argument', () => {
        const ordered = bookQs.orderBy([(book) => book.releaseYear]);
        expect(ordered.idArr).to.deep.equal([1, 2, 0]);
    });

    it('exclude works correctly with object argument', () => {
        const excluded = bookQs.exclude({name: 'Clean Code'});
        expect(excluded.count()).to.equal(2);
        expect(excluded.idArr).to.deep.equal([0, 2]);
    });

    it('update records a update', () => {
        const mergeObj = {name: 'Updated Book Name'};
        expect(session.updates).to.have.length(0);
        bookQs.update(mergeObj);
        expect(session.updates).to.have.length(1);

        expect(session.updates[0]).to.deep.equal({
            type: UPDATE,
            payload: {
                idArr: bookQs.idArr,
                mergeObj,
            },
            meta: {
                name: 'Book',
            },
        });
    });

    it('delete records a update', () => {
        expect(session.updates).to.have.length(0);
        bookQs.delete();
        expect(session.updates).to.have.length.of.at.least(1);

        expect(session.updates[0]).to.deep.equal({
            type: DELETE,
            payload: bookQs.idArr,
            meta: {
                name: 'Book',
            },
        });
    });

    it('custom methods works', () => {
        const {
            Book,
            Genre,
            Cover,
            Author,
        } = createTestModels();

        const currentYear = 2015;
        class CustomQuerySet extends QuerySet {
            unreleased() {
                return this.withRefs.filter(book => book.releaseYear > currentYear);
            }
        }
        CustomQuerySet.addSharedMethod('unreleased');

        Book.querySetClass = CustomQuerySet;

        const schema = new Schema();
        schema.register(Book, Genre, Cover, Author);
        const {session: sess} = createTestSessionWithData(schema);

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
        });
        expect(sess.Book.unreleased().count()).to.equal(1);
        expect(sess.Book.withRefs.filter({name: 'Clean Code'}).count()).to.equal(1);
    });
});
