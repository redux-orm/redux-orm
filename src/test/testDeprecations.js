import { Model, QuerySet, ORM, Backend } from '../';
import { createTestSessionWithData, measureMs } from './utils';

describe('Deprecations', () => {
    let session;
    let orm;
    let state;

    describe('With session', () => {
        beforeEach(() => {
            ({
                session,
                orm,
                state,
            } = createTestSessionWithData());
        });
    });

    describe('Without session', () => {
        it('Backend is deprecated', () => {
            expect(() => new Backend()).toThrowError(
                'Having a custom Backend instance is now unsupported. Documentation for database customization is upcoming, for now please look at the db folder in the source.'
            );
        });
    });
});
