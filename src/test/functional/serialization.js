import { createTestORM } from "../helpers";

let orm;
let emptyState;

beforeEach(() => {
    orm = createTestORM();
    emptyState = orm.getEmptyState();
});

it("can serialize and deserialize the state", () => {
    const serializedState = JSON.stringify(emptyState);
    const deserializedState = JSON.parse(serializedState);

    expect(emptyState).toStrictEqual(deserializedState);
});
