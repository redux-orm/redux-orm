import {
    ORM, Model as BaseModel, QuerySet, attr
} from '../..';

describe('Model', () => {
    describe('static method', () => {
        let Model;
        let sessionMock;
        beforeEach(() => {
            // Get a fresh copy
            // of Model, so our manipulations
            // won't survive longer than each test.
            Model = class UnitTestModel extends BaseModel {};
            Model.modelName = 'UnitTestModel';

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
                }).toThrow('A model can only be connected to instances of Session.')
            ));
        });

        it('toString works correctly', () => {
            expect(Model.toString()).toBe('ModelClass: UnitTestModel');
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
                UnitTestModel: {
                    1: true,
                    3: true,
                }
            });
        });

        it('markFullTableScanned correctly proxies to Session', () => {
            Model.connect(sessionMock);
            Model.markFullTableScanned();
            expect(sessionMock.fullTableScannedModels).toEqual(['UnitTestModel']);
        });

        it('should throw a custom error when user try to interact with database without a session', () => {
            const attributes = {
                id: 0,
                name: 'Tommi',
                number: 123,
                boolean: false,
            };
            expect(() => Model.create(attributes)).toThrow(
                'Tried to create a UnitTestModel model instance without a session. Create a session using `session = orm.session()` and call `session["UnitTestModel"].create` instead.'
            );
            expect(() => Model.upsert(attributes)).toThrow(
                'Tried to upsert a UnitTestModel model instance without a session. Create a session using `session = orm.session()` and call `session["UnitTestModel"].upsert` instead.'
            );
            expect(() => Model.exists(attributes)).toThrow(
                'Tried to check if a UnitTestModel model instance exists without a session. Create a session using `session = orm.session()` and call `session["UnitTestModel"].exists` instead.'
            );
            expect(() => Model.withId(0)).toThrow(
                'Tried to get the UnitTestModel model\'s id attribute without a session. Create a session using `session = orm.session()` and access `session["UnitTestModel"].idAttribute` instead.'
            );
            expect(() => (new Model()).update(attributes)).toThrow(
                'Tried to update a UnitTestModel model instance without a session. You cannot call `.update` on an instance that you did not receive from the database.'
            );
            expect(() => (new Model()).delete()).toThrow(
                'Tried to delete a UnitTestModel model instance without a session. You cannot call `.delete` on an instance that you did not receive from the database.'
            );
        });
    });

    describe('Instance methods', () => {
        let Model;
        let session;

        beforeEach(() => {
            Model = class UnitTestModel extends BaseModel {};
            Model.modelName = 'UnitTestModel';
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
