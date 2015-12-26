import {expect} from 'chai';
import Schema from '../Schema';
import {createTestModels} from './utils';

describe('Session', () => {
    let schema;
    let Book;
    let Cover;
    let Genre;
    let Author;
    let defaultState;
    beforeEach(() => {
        ({
            Book,
            Cover,
            Genre,
            Author,
        } = createTestModels());
        schema = new Schema();
        schema.register(Book, Cover, Genre, Author);
        defaultState = schema.getDefaultState();
    });

    it('connects models', () => {
        expect(Book.session).to.be.undefined;
        expect(Cover.session).to.be.undefined;
        expect(Genre.session).to.be.undefined;
        expect(Cover.session).to.be.undefined;

        const session = schema.from(defaultState);

        expect(Book.session).to.equal(session);
        expect(Cover.session).to.equal(session);
        expect(Genre.session).to.equal(session);
        expect(Cover.session).to.equal(session);
    });

    it('exposes models as getter properties', () => {
        const session = schema.from(defaultState);
        expect(session.Book).to.equal(Book);
        expect(session.Author).to.equal(Author);
        expect(session.Cover).to.equal(Cover);
        expect(session.Genre).to.equal(Genre);
    });

    it('marks accessed models', () => {
        const session = schema.from(defaultState);
        expect(session.accessedModels).to.have.length(0);

        session.markAccessed(Book);

        expect(session.accessedModels).to.have.length(1);
        expect(session.accessedModels[0]).to.equal('Book');

        session.markAccessed(Book);

        expect(session.accessedModels[0]).to.equal('Book');
    });

    it('adds updates', () => {
        const session = schema.from(defaultState);
        expect(session.updates).to.have.length(0);
        const updateObj = {};
        session.addUpdate(updateObj);
        expect(session.updates).to.have.length(1);
        expect(session.updates[0]).to.equal(updateObj);
    });
});
