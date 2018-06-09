import { ORM } from '../';
import { createTestModels, isSubclass } from './utils';
import { CREATE } from '../constants';

describe('Session', () => {
    let orm;
    let Book;
    let Cover;
    let Genre;
    let Tag;
    let Author;
    let Publisher;
    let emptyState;
    beforeEach(() => {
        ({
            Book,
            Cover,
            Genre,
            Tag,
            Author,
            Publisher,
        } = createTestModels());
        orm = new ORM();
        orm.register(Book, Cover, Genre, Tag, Author, Publisher);
        emptyState = orm.getEmptyState();
    });

    it('connects models', () => {
        expect(Book.session).toBeUndefined();
        expect(Cover.session).toBeUndefined();
        expect(Genre.session).toBeUndefined();
        expect(Tag.session).toBeUndefined();
        expect(Cover.session).toBeUndefined();
        expect(Publisher.session).toBeUndefined();

        const session = orm.session(emptyState);

        expect(session.Book.session).toBe(session);
        expect(session.Cover.session).toBe(session);
        expect(session.Genre.session).toBe(session);
        expect(session.Tag.session).toBe(session);
        expect(session.Cover.session).toBe(session);
        expect(session.Publisher.session).toBe(session);
    });

    it('exposes models as getter properties', () => {
        const session = orm.session(emptyState);
        expect(isSubclass(session.Book, Book)).toBe(true);
        expect(isSubclass(session.Author, Author)).toBe(true);
        expect(isSubclass(session.Cover, Cover)).toBe(true);
        expect(isSubclass(session.Genre, Genre)).toBe(true);
        expect(isSubclass(session.Tag, Tag)).toBe(true);
        expect(isSubclass(session.Publisher, Publisher)).toBe(true);
    });

    it('marks models when full table scan has been performed', () => {
        const session = orm.session(emptyState);
        expect(session.fullTableScannedModels).toHaveLength(0);

        session.markFullTableScanned(Book.modelName);
        expect(session.fullTableScannedModels).toHaveLength(1);
        expect(session.fullTableScannedModels[0]).toBe('Book');

        session.markFullTableScanned(Book.modelName);

        expect(session.fullTableScannedModels[0]).toBe('Book');
    });

    it('marks accessed model instances', () => {
        const session = orm.session(emptyState);
        expect(session.accessedModelInstances).toEqual({});

        session.markAccessed(Book.modelName, [0]);

        expect(session.accessedModelInstances).toEqual({
            Book: {
                0: true
            }
        });

        session.markAccessed(Book.modelName, [1]);
        expect(session.accessedModelInstances).toEqual({
            Book: {
                0: true,
                1: true
            }
        });
    });

    describe('gets the next state', () => {
        it('without any updates, the same state is returned', () => {
            const session = orm.session(emptyState);
            expect(session.state).toBe(emptyState);
        });

        it('with updates, a new state is returned', () => {
            const session = orm.session(emptyState);

            session.applyUpdate({
                table: Author.modelName,
                action: CREATE,
                payload: {
                    id: 0,
                    name: 'Caesar',
                },
            });

            const nextState = session.state;

            expect(nextState).not.toBe(emptyState);

            expect(nextState[Author.modelName]).not.toBe(emptyState[Author.modelName]);

            // All other model states should stay equal.
            expect(nextState[Book.modelName]).toBe(emptyState[Book.modelName]);
            expect(nextState[Cover.modelName]).toBe(emptyState[Cover.modelName]);
            expect(nextState[Genre.modelName]).toBe(emptyState[Genre.modelName]);
            expect(nextState[Tag.modelName]).toBe(emptyState[Tag.modelName]);
            expect(nextState[Publisher.modelName]).toBe(emptyState[Publisher.modelName]);
        });
    });

    it('two concurrent sessions', () => {
        const otherState = orm.getEmptyState();

        const firstSession = orm.session(emptyState);
        const secondSession = orm.session(otherState);

        expect(firstSession.sessionBoundModels).toHaveLength(8);

        expect(firstSession.Book).not.toBe(secondSession.Book);
        expect(firstSession.Author).not.toBe(secondSession.Author);
        expect(firstSession.Genre).not.toBe(secondSession.Genre);
        expect(firstSession.Tag).not.toBe(secondSession.Tag);
        expect(firstSession.Cover).not.toBe(secondSession.Cover);
        expect(firstSession.Publisher).not.toBe(secondSession.Publisher);
    });
});
