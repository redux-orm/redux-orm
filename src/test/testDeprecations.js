import { Model, QuerySet, ORM, Backend, Schema, createSelector, createReducer } from '../';
import { createTestSessionWithData, createTestORM } from './utils';

describe('Deprecations', () => {
    let session;
    let orm;
    let state;
    const consoleWarn = {
        timesRun: 0,
        lastMessage: null,
    };

    describe('With session', () => {
        beforeEach(() => {
            ({
                session,
                orm,
                state,
            } = createTestSessionWithData());
            consoleWarn.timesRun = 0;
            consoleWarn.lastMessage = null;
            console.warn = (msg) => {
                consoleWarn.timesRun++;
                consoleWarn.lastMessage = msg;
            };
        });

        it('ORM#withMutations is deprecated', () => {
            expect(consoleWarn.timesRun).toBe(0);

            expect(orm.withMutations(state).state)
                .toEqual(orm.mutableSession(state).state);

            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe('ORM.prototype.withMutations is deprecated. Use ORM.prototype.mutableSession instead.');
        });

        it('ORM#from is deprecated', () => {
            expect(consoleWarn.timesRun).toBe(0);

            expect(orm.from(state).state)
                .toEqual(orm.session(state).state);

            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe('ORM.prototype.from function is deprecated. Use ORM.prototype.session instead.');
        });

        it('ORM#reducer is deprecated', () => {
            const { Book } = session;
            Book.reducer = (action, modelClass, _session) => {
                if (action.type !== 'CREATE_BOOK') return;
                modelClass.create(action.payload);
            };
            expect(consoleWarn.timesRun).toBe(0);
            const action = {
                type: 'CREATE_BOOK',
                payload: { name: 'New Book' },
            };

            expect(orm.reducer()(session.state, action))
                .toEqual(createReducer(orm)(session.state, action));

            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe('ORM.prototype.reducer is deprecated. Access the Session.prototype.state property instead.');
        });

        it('ORM#createSelector is deprecated', () => {
            let selector1TimesRun = 0;
            let selector2TimesRun = 0;
            const { Book } = session;
            const selector1 = createSelector(orm, (memoizeSession) => {
                selector1TimesRun++;
                return memoizeSession.Book.withId(0);
            });

            expect(consoleWarn.timesRun).toBe(0);
            const selector2 = orm.createSelector((memoizeSession) => {
                selector2TimesRun++;
                return memoizeSession.Book.withId(0);
            });
            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe('ORM.prototype.createSelector is deprecated. Import `createSelector` from Redux-ORM instead.');

            expect(selector1(session.state))
                .toEqual(selector2(session.state));
            expect(selector1TimesRun).toEqual(selector2TimesRun);

            Book.withId(0).update({ name: 'Deprecated selector test' });

            expect(selector1(session.state))
                .toEqual(selector2(session.state));
            expect(selector1TimesRun).toEqual(selector2TimesRun);
        });

        it('ORM#getDefaultState is deprecated', () => {
            expect(consoleWarn.timesRun).toBe(0);

            expect(orm.getDefaultState())
                .toEqual(orm.getEmptyState());

            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe('ORM.prototype.getDefaultState is deprecated. Use the ORM.prototype.getEmptyState instead.');
        });

        it('ORM#define is deprecated', () => {
            expect(() => orm.define()).toThrowError(
                'ORM.prototype.define is removed. Please define a Model class.'
            );
        });
    });

    describe('Without session', () => {
        beforeEach(() => {
            session = createTestORM();
            consoleWarn.timesRun = 0;
            consoleWarn.lastMessage = null;
            console.warn = (msg) => {
                consoleWarn.timesRun++;
                consoleWarn.lastMessage = msg;
            };
        });

        it('Backend is deprecated', () => {
            expect(() => new Backend()).toThrowError(
                'Having a custom Backend instance is now unsupported. Documentation for database customization is upcoming, for now please look at the db folder in the source.'
            );
        });

        it('Schema is deprecated', () => {
            expect(() => new Schema()).toThrowError(
                'Schema has been renamed to ORM. Please import ORM instead of Schema from Redux-ORM.'
            );
        });

        it('QuerySet#withModels is deprecated', () => {
            const bookQs = orm.get('Book').getQuerySet();
            expect(() => bookQs.withModels).toThrowError(
                'QuerySet.prototype.withModels is removed. Use .toModelArray() or predicate functions that instantiate Models from refs, e.g. new Model(ref).'
            );
        });

        it('QuerySet#withRefs is deprecated', () => {
            expect(consoleWarn.timesRun).toBe(0);
            const bookQs = orm.get('Book').getQuerySet();

            expect(bookQs.withRefs).toBe(undefined);

            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe('QuerySet.prototype.withRefs is deprecated. ' +
            'Query building operates on refs only now.');
        });

        it('QuerySet#map is deprecated', () => {
            const bookQs = orm.get('Book').getQuerySet();
            expect(() => bookQs.map()).toThrowError(
                'QuerySet.prototype.map is removed. Call .toModelArray() or .toRefArray() first to map.'
            );
        });

        it('QuerySet#forEach is deprecated', () => {
            const bookQs = orm.get('Book').getQuerySet();
            expect(() => bookQs.forEach()).toThrowError(
                'QuerySet.prototype.forEach is removed. Call .toModelArray() or .toRefArray() first to iterate.'
            );
        });
    });
});
