import { createTestORM } from "../helpers";

let orm;

beforeEach(() => {
    orm = createTestORM();
});

it("can serialize and deserialized the state", () => {
    const initialState = orm.getEmptyState();
    const serializedState = JSON.stringify(initialState);
    const deserializedState = JSON.parse(serializedState);

    expect(initialState).toEqual(deserializedState);
});
