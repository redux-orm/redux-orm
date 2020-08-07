import { Model, ORM, attr, fk, many } from "../..";
import {
    createTestSessionWithData,
    measureMs,
    nTimes,
    avg,
    round,
} from "../helpers";

const crypto = require("crypto");

const PRECISION = 2;
const logTime = (message, tookSeconds, maxSeconds, measurements) => {
    let out = `${message} took ${tookSeconds}s / ${maxSeconds}s`;
    if (measurements) {
        const measurementSeconds = measurements
            .map((m) => round(m, PRECISION))
            .map((m) => `${m}s`)
            .join(", ");
        out += ` on average (${measurementSeconds} each)`;
    }
    console.log(out);
};

const randomName = () => crypto.randomBytes(16).toString("hex");

describe("Big Data Test", () => {
    let orm;
    let session;

    beforeEach(() => {
        const Item = class extends Model {};
        Item.modelName = "Item";
        Item.fields = {
            id: attr(),
            name: attr(),
            groupId: fk("ItemGroup", "items"),
        };
        const ItemGroup = class extends Model {};
        ItemGroup.modelName = "ItemGroup";
        orm = new ORM();
        orm.register(Item, ItemGroup);
        session = orm.session(orm.getEmptyState());
    });

    it("adds a big amount of items in acceptable time", () => {
        const { Item } = session;

        const maxSeconds = process.env.TRAVIS ? 10 : 2;
        const n = 5;
        const amount = 50000;
        const items = new Map(
            nTimes(amount * n).map((_value, index) => [
                index,
                {
                    id: index,
                    name: randomName(),
                },
            ])
        );

        const measurements = nTimes(n)
            .map((_value, index) => {
                const start = index * amount;
                const end = start + amount;
                return measureMs(() => {
                    for (let i = start; i < end; ++i) {
                        Item.create(items.get(i));
                    }
                });
            })
            .map((ms) => ms / 1000);

        const tookSeconds = round(avg(measurements), PRECISION);
        logTime(
            `Creating ${amount} objects`,
            tookSeconds,
            maxSeconds,
            measurements
        );
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });

    it("looks up items by primary key in a large table in acceptable time", () => {
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

        const measurements = nTimes(n)
            .map((_value, index) => {
                const start = index * lookupCount;
                const end = start + lookupCount;
                return measureMs(() => {
                    for (let i = start; i < end; ++i) {
                        Item.withId(i);
                    }
                });
            })
            .map((ms) => ms / 1000);

        const tookSeconds = round(avg(measurements), PRECISION);
        logTime(
            `Looking up ${lookupCount} objects by id`,
            tookSeconds,
            maxSeconds,
            measurements
        );
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });

    it("looks up items by foreign key in a large table in acceptable time", () => {
        const { Item, ItemGroup } = session;

        const maxSeconds = process.env.TRAVIS ? 3 : 1.5;
        const n = 5;
        const withForeignKeyCount = 50000;
        const rowCount = 500000;

        const group = ItemGroup.create({
            id: 12345,
        });
        for (let i = 0; i < rowCount; ++i) {
            Item.create({
                id: i,
                name: randomName(),
                groupId: i < withForeignKeyCount ? group.id : null,
            });
        }

        const measurements = nTimes(n)
            .map((_value, index) =>
                measureMs(() => {
                    group.items
                        .toModelArray()
                        .forEach((item) => item.toString());
                })
            )
            .map((ms) => ms / 1000);

        const tookSeconds = round(avg(measurements), PRECISION);
        logTime(
            `Looking up ${withForeignKeyCount} objects by foreign key`,
            tookSeconds,
            maxSeconds,
            measurements
        );
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });
});

describe("Many-to-many relationship performance", () => {
    let orm;
    let session;

    beforeEach(() => {
        const Parent = class extends Model {};
        Parent.modelName = "Parent";
        Parent.fields = {
            id: attr(),
            name: attr(),
            children: many("Child", "parent"),
        };
        const Child = class extends Model {};
        Child.modelName = "Child";
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

    const unassignChildren = (parent, start, end) => {
        for (let i = start; i < end; ++i) {
            parent.children.remove(i);
        }
    };

    it("adds many-to-many relationships in acceptable time", () => {
        const { Child, Parent } = session;

        const maxSeconds = process.env.TRAVIS ? 13.5 : 1;
        let parent;
        const n = 5;
        const childAmount = 1000;
        createChildren(0, 8000);

        const measurements = nTimes(n)
            .map((_value, index) => {
                parent = Parent.create({
                    id: index,
                });
                const ms = measureMs(() => {
                    assignChildren(parent, 0, childAmount);
                });
                unassignChildren(parent, 0, childAmount);
                return ms;
            })
            .map((ms) => ms / 1000);

        const tookSeconds = round(avg(measurements), PRECISION);
        logTime(
            `Adding ${childAmount} m2n relationships`,
            tookSeconds,
            maxSeconds,
            measurements
        );
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });

    it("queries many-to-many relationships in acceptable time", () => {
        const { Child, Parent } = session;

        const maxSeconds = process.env.TRAVIS ? 15 : 2;
        const n = 5;
        const queryCount = 500;
        const parent = Parent.create({ id: 1 });
        createChildren(0, 10000);
        assignChildren(parent, 0, 3000);

        const measurements = nTimes(n)
            .map((_value, index) =>
                measureMs(() => {
                    for (let i = 0; i < queryCount; ++i) {
                        parent.children.toRefArray();
                    }
                })
            )
            .map((ms) => ms / 1000);

        const tookSeconds = round(avg(measurements), PRECISION);
        logTime(
            `Performing ${queryCount} m2n relationship queries`,
            tookSeconds,
            maxSeconds,
            measurements
        );
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });

    it("removes many-to-many relationships in acceptable time", () => {
        const { Child, Parent } = session;

        const maxSeconds = process.env.TRAVIS ? 7.5 : 2;
        const n = 5;
        const removeCount = 500;

        const parent = Parent.create({ id: 1 });
        createChildren(0, removeCount);

        const measurements = nTimes(n)
            .map((_value, index) => {
                assignChildren(parent, 0, removeCount);
                const ms = measureMs(() => {
                    unassignChildren(parent, 0, removeCount);
                });
                return ms;
            })
            .map((ms) => ms / 1000);

        const tookSeconds = round(avg(measurements), PRECISION);
        logTime(
            `Removing ${removeCount} m2n relationships`,
            tookSeconds,
            maxSeconds,
            measurements
        );
        expect(tookSeconds).toBeLessThanOrEqual(maxSeconds);
    });
});
