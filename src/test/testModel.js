import { ORM, Model as BaseModel, ManyToMany, attr } from '../';

describe('Model', () => {
    describe('static method', () => {
        let Model;
        let sessionMock;
        beforeEach(() => {
            // Get a fresh copy
            // of Model, so our manipulations
            // won't survive longer than each test.
            Model = class TestModel extends BaseModel { };
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

        it('connect works correctly', () => {
            expect(Model.session).toBeUndefined();
            Model.connect(sessionMock);
            expect(Model.session).toBe(sessionMock);
        });
    });

    describe('Instance methods', () => {
        let Model;
        let instance;

        beforeEach(() => {
            Model = class TestModel extends BaseModel { };
            Model.modelName = 'Model';
            Model.fields = {
                id: attr(),
                name: attr(),
                tags: new ManyToMany('_'),
            };

            instance = new Model({ id: 0, name: 'Tommi' });
        });


        it('equals works correctly', () => {
            const anotherInstance = new Model({ id: 0, name: 'Tommi' });
            expect(instance.equals(anotherInstance)).toBeTruthy();
        });

        it('getClass works correctly', () => {
            expect(instance.getClass()).toBe(Model);
        });
    });

    describe("Model options's idAttribute is 'name'", () => {
        let Todo;
        let Tag;
        let sessionMock;

        beforeEach(() => {
            Todo = class Todo extends BaseModel { };
            Todo.modelName = 'Todo';
            Todo.fields = {
                id: attr(),
                name: attr(),
                tags: new ManyToMany({
                    to: 'Tag',
                    relatedName: 'todos'
                }),
            };

            Tag = class Tag extends BaseModel { };
            Tag.modelName = 'Tag';
            Tag.options = {
                idAttribute: 'name',
            };
            Tag.fields = {
                name: attr(),
            }

            const orm = new ORM();
            orm.register(Todo, Tag);
            const state = orm.getEmptyState();
            sessionMock = orm.mutableSession(state);
        });


        it('idAttribute is name works correctly', () => {

            const { Todo, Tag } = sessionMock;

            const work = Tag.create({ name: 'work' });
            const personal = Tag.create({ name: 'personal' });
            const urgent = Tag.create({ name: 'urgent' });

            const groceries = Todo.create({
                id: 0,
                text: 'Buy groceries',
                tags: [work]
            });
            const meeting = Todo.create({
                id: 1,
                text: 'Attend meeting',
                tags: [work, personal, urgent]
            });
            expect(groceries.tags.toRefArray().length).toEqual(1);
            expect(groceries.tags.toRefArray().map(tag => tag.name)).toEqual(['work']);
            expect(meeting.tags.toRefArray().length).toEqual(3);
            expect(meeting.tags.toRefArray().map(tag => tag.name)).toEqual(['work', 'personal', 'urgent']);
        });
    });
});
