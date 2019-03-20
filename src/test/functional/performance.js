import {
    Model, ORM, attr, many
} from '../..';
import {
    createTestSessionWithData, measureMs, nTimes, avg, round
} from '../helpers';

const crypto = require('crypto');

const PRECISION = 2;
const logTime = (message, tookSeconds, maxSeconds, measurements) => {
    let out = `${message} took ${tookSeconds}s / ${maxSeconds}s`;
    if (measurements) {
        const measurementSeconds = measurements
            .map(m => round(m, PRECISION))
            .map(m => `${m}s`)
            .join(', ');
        out += ` on average (${measurementSeconds} each)`;
    }
    console.log(out);
};

const randomName = () => crypto.randomBytes(16).toString('hex');

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

        const maxSeconds = process.env.TRAVIS ? 10 : 2;
        const n = 5;
        const amount = 50000;
        const items = new Map(nTimes(amount * n).map((_value, index) => ([
            index,
            {
                id: index,
                name: randomName(),
            },
        ])));

        const measurements = nTimes(n).map((_value, index) => {
            const start = index * amount;
            const end = start + amount;
            return measureMs(() => {
                for (let i = start; i < end; ++i) {
                    Item.create(items.get(i));
                }
            });
        }).map(ms => ms / 1000);

        const tookSeconds = round(avg(measurements, n), PRECISION);
        logTime(`Creating ${amount} objects`, tookSeconds, maxSeconds, measurements);
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });

    it('looks up items by id in a large table in acceptable time', () => {
        const { Item } = session;

        const maxSeconds = process.env.TRAVIS ? 5 : 2;
        const n = 5;
        const lookupCount = 50000;
        const rowCount = n * lookupCount;

        for (let i = 0; i < rowCount; ++i) {
            Item.create({
                id: i,
                name: randomName(),
            });
        }

        const measurements = nTimes(n).map((_value, index) => {
            const start = index * lookupCount;
            const end = start + lookupCount;
            return measureMs(() => {
                for (let i = start; i < end; ++i) {
                    Item.withId(i);
                }
            });
        }).map(ms => ms / 1000);

        const tookSeconds = round(avg(measurements, n), PRECISION);
        logTime(`Looking up ${lookupCount} objects by id`, tookSeconds, maxSeconds, measurements);
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
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

    const createChildren = (start, end) => {
        for (let i = start; i < end; ++i) {
            session.Child.create({
                id: i,
                name: randomName(),
            });
        }
    };

    const assignChildren = (parent, start, end) => {
        for (let i = start; i < end; ++i) {
            parent.children.add(i);
        }
    };

    it('adds many-to-many relationships in acceptable time', () => {
        const { Child, Parent } = session;

        const maxSeconds = process.env.TRAVIS ? 13.5 : 1;
        let parent;
        const n = 5;
        const childAmount = 1000;
        createChildren(0, 8000);

        const measurements = nTimes(n).map((_value, index) => {
            parent = Parent.create({
                id: index,
            });
            return measureMs(() => {
                assignChildren(parent, 0, childAmount);
            });
        }).map(ms => ms / 1000);

        const tookSeconds = round(avg(measurements, n), PRECISION);
        logTime(`Adding ${childAmount} m2n relationships`, tookSeconds, maxSeconds, measurements);
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });

    it('queries many-to-many relationships in acceptable time', () => {
        const { Child, Parent } = session;

        const maxSeconds = process.env.TRAVIS ? 15 : 2;
        const n = 5;
        const queryCount = 500;
        const parent = Parent.create({ id: 1 });
        createChildren(0, 10000);
        assignChildren(parent, 0, 3000);

        const measurements = nTimes(n).map((_value, index) => (
            measureMs(() => {
                for (let i = 0; i < queryCount; ++i) {
                    parent.children.count();
                }
            })
        )).map(ms => ms / 1000);

        const tookSeconds = round(avg(measurements, n), PRECISION);
        logTime(`Performing ${queryCount} m2n relationship queries`, tookSeconds, maxSeconds, measurements);
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });

    it('removes many-to-many relationships in acceptable time', () => {
        const { Child, Parent } = session;

        const maxSeconds = process.env.TRAVIS ? 7.5 : 2;
        const n = 5;
        const removeCount = 500;

        const parent = Parent.create({ id: 1 });
        createChildren(0, removeCount * n);
        assignChildren(parent, 0, removeCount * n);

        const measurements = nTimes(n).map((_value, index) => {
            const start = removeCount * index;
            const end = removeCount + start;
            const ms = measureMs(() => {
                for (let i = start; i < end; ++i) {
                    parent.children.remove(i);
                }
            });
            /**
             * reassign children to parent (undo the above code)
             * otherwise the removal will speed up the removal of further children
             */
            assignChildren(parent, start, end);
            return ms;
        }).map(ms => ms / 1000);

        const tookSeconds = round(avg(measurements, n), PRECISION);
        logTime(`Removing ${removeCount} m2n relationships`, tookSeconds, maxSeconds, measurements);
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });
});
