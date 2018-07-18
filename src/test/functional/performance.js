import { Model, ORM, attr, many } from '../../';
import { createTestSessionWithData, measureMs } from '../helpers';

describe('Big Data Test', () => {
    let orm;
    let session;

    beforeEach(() => {
        const Item = class extends Model {};
        Item.modelName = 'Item';
        Item.fields = {
            id: attr(),
            name: attr(),
        };
        orm = new ORM();
        orm.register(Item);
        session = orm.session(orm.getEmptyState());
    });

    it('adds a big amount of items in acceptable time', () => {
        const { Item } = session;
        const start = measureMs();

        const amount = 10000;
        for (let i = 0; i < amount; ++i) {
            Item.create({ id: i, name: 'TestItem' });
        }
        const tookSeconds = measureMs(start) / 1000;
        console.log(`Creating ${amount} objects took ${tookSeconds}s`);
        expect(tookSeconds).toBeLessThanOrEqual(process.env.TRAVIS ? 2.5 : 0.85);
    });

    it('looks up items by id in a large table in acceptable time', () => {
        const { Item } = session;

        const rowCount = 20000;
        for (let i = 0; i < rowCount; ++i) {
            Item.create({ id: i, name: 'TestItem' });
        }

        const lookupCount = 10000;
        const maxId = rowCount - 1;
        const start = measureMs();
        for (let j = maxId, n = maxId - lookupCount; j > n; --j) {
            Item.withId(j);
        }
        const tookSeconds = measureMs(start) / 1000;
        console.log(`Looking up ${lookupCount} objects by id took ${tookSeconds}s`);
        expect(tookSeconds).toBeLessThanOrEqual(process.env.TRAVIS ? 1 : 0.75);
    });
});

describe('Many-to-many relationship performance', () => {
    let orm;
    let session;

    beforeEach(() => {
        const Parent = class extends Model {};
        Parent.modelName = 'Parent';
        Parent.fields = {
            id: attr(),
            name: attr(),
            children: many('Child', 'parent'),
        };
        const Child = class extends Model {};
        Child.modelName = 'Child';
        orm = new ORM();
        orm.register(Parent, Child);
        session = orm.session(orm.getEmptyState());
    });

    const createChildren = (amount) => {
        for (let i = 0; i < amount; ++i) {
            session.Child.create({
                id: i,
                name: 'TestChild',
            });
        }
    };

    const assignChildren = (parent, amount) => {
        for (let i = 0; i < amount; ++i) {
            parent.children.add(i);
        }
    };

    it('adds many-to-many relationships in acceptable time', () => {
        const { Child, Parent } = session;

        createChildren(8000);
        const parent = Parent.create({});
        const start = measureMs();
        const childAmount = 2500;
        assignChildren(parent, childAmount);

        const tookSeconds = measureMs(start) / 1000;
        console.log(`Adding ${childAmount} relations took ${tookSeconds}s`);
        expect(tookSeconds).toBeLessThanOrEqual(process.env.TRAVIS ? 13.5 : 4);
    });

    it('queries many-to-many relationships in acceptable time', () => {
        const { Child, Parent } = session;

        createChildren(10000);
        const parent = Parent.create({});
        assignChildren(parent, 3000);

        const start = measureMs();
        const queryCount = 500;
        for (let j = 0; j < queryCount; ++j) {
            parent.children.count();
        }

        const tookSeconds = measureMs(start) / 1000;
        console.log(`Performing ${queryCount} queries took ${tookSeconds}s`);
        expect(tookSeconds).toBeLessThanOrEqual(process.env.TRAVIS ? 15 : 4);
    });

    it('removes many-to-many relationships in acceptable time', () => {
        const { Child, Parent } = session;

        createChildren(10000);
        const parent = Parent.create({});
        assignChildren(parent, 2000);

        const removeCount = 1000;
        const start = measureMs();
        for (let j = 0; j < removeCount; ++j) {
            parent.children.remove(j);
        }

        const tookSeconds = measureMs(start) / 1000;
        console.log(`Removing ${removeCount} relations took ${tookSeconds}s`);
        expect(tookSeconds).toBeLessThanOrEqual(process.env.TRAVIS ? 15 : 4);
    });
});
