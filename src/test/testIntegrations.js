import {expect} from 'chai';
import {
    createTestSessionWithData,
} from './utils';

describe('Integration', () => {
    let session;
    let schema;

    beforeEach(() => {
        ({
            session,
            schema,
        } = createTestSessionWithData());
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
});
