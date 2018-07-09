import { ORM, Model as BaseModel, QuerySet, attr } from '../../';

describe('Model', () => {
    describe('static method', () => {
        let Model;
        let sessionMock;
        beforeEach(() => {
            // Get a fresh copy
            // of Model, so our manipulations
            // won't survive longer than each test.
            Model = class TestModel extends BaseModel {};
            Model.modelName = 'Model';

            const orm = new ORM();
            orm.register(Model);
            sessionMock = orm.session();
        });

        it('make sure instance methods are enumerable', () => {
            // See #29.

            const enumerableProps = {};
            for (const propName in Model) { // eslint-disable-line
                enumerableProps[propName] = true;
            }

            expect(enumerableProps.create).toBe(true);
        });

        it('session getter works correctly', () => {
            expect(Model.session).toBeUndefined();
            Model._session = sessionMock;
            expect(Model.session).toBe(sessionMock);
        });

        it('connect defines session statically on Model', () => {
            expect(Model.session).toBeUndefined();
            Model.connect(sessionMock);
            expect(Model.session).toBe(sessionMock);
        });

        it('connect throws if not passing a session', () => {
            expect(Model.session).toBeUndefined();
            [1, '', [], {}].forEach((value) => (
                expect(() => {
                    Model.connect(value);
                }).toThrowError('A model can only connect to instances of Session.')
            ));
        });

        it('toString works correctly', () => {
            expect(Model.toString()).toBe('ModelClass: Model');
        });

        it('query returns QuerySet', () => {
            expect(Model.query).toBeInstanceOf(QuerySet);
        });

        it('getQuerySet returns QuerySet', () => {
            expect(Model.getQuerySet()).toBeInstanceOf(QuerySet);
        });

        it('all returns QuerySet', () => {
            expect(Model.all()).toBeInstanceOf(QuerySet);
        });

        it('markAccessed correctly proxies to Session', () => {
            Model.connect(sessionMock);
            Model.markAccessed([1, 3]);
            expect(sessionMock.accessedModelInstances).toEqual({
                Model: {
                    1: true,
                    3: true,
                }
            });
        });

        it('markFullTableScanned correctly proxies to Session', () => {
            Model.connect(sessionMock);
            Model.markFullTableScanned();
            expect(sessionMock.fullTableScannedModels).toEqual(['Model']);
        });
    });

    describe('Instance methods', () => {
        let Model;
        let session;

        beforeEach(() => {
            Model = class TestModel extends BaseModel {};
            Model.modelName = 'Model';
            Model.fields = {
                id: attr(),
                name: attr(),
                number: attr(),
                boolean: attr(),
                array: attr(),
                object: attr(),
            };

            const orm = new ORM();
            orm.register(Model);
            session = orm.session();
        });

        it('getClass works correctly', () => {
            const instance = new Model({
                id: 0,
                name: 'Tommi',
                array: [],
                object: {},
                number: 123,
                boolean: false,
            });
            expect(instance.getClass()).toBe(Model);
        });

        it('equals compares primitive types correctly', () => {
            const instance1 = new Model({
                id: 0,
                name: 'Tommi',
                number: 123,
                boolean: true,
            });
            const instance2 = new Model({
                id: 0,
                name: 'Tommi',
                number: 123,
                boolean: true,
            });
            expect(instance1.equals(instance2)).toBeTruthy();
            const instance3 = new Model({
                id: 0,
                name: 'Tommi',
                number: 123,
                boolean: false,
            });
            expect(instance1.equals(instance3)).toBeFalsy();
        });

        it('equals does not deeply compare array fields', () => {
            const instance1 = new Model({ id: 0, array: [] });
            const instance2 = new Model({ id: 0, array: [] });
            expect(instance1.equals(instance2)).toBeFalsy();
        });

        it('equals does not deeply compare object fields', () => {
            const instance1 = new Model({ id: 0, object: {} });
            const instance2 = new Model({ id: 0, object: {} });
            expect(instance1.equals(instance2)).toBeFalsy();
        });

        it('constructing with random attributes assigns these attributes', () => {
            const randomNumber = Math.random();
            const model = new Model({
                randomNumber,
                someString: 'some string',
            });
            expect(model.randomNumber).toBe(randomNumber);
            expect(model.someString).toBe('some string');
        });
    });
});
