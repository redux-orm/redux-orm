import { createTestSessionWithData } from '../helpers';

describe('Multiple concurrent sessions', () => {
    let session;
    let orm;
    let state;

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
