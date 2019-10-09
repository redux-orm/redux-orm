import deepFreeze from "deep-freeze";
import { createDatabase, Table } from "../../db";
import { getBatchToken } from "../../utils";
import {
    FILTER,
    CREATE,
    UPDATE,
    DELETE,
    SUCCESS,
    STATE_FLAG,
} from "../../constants";

describe("createDatabase", () => {
    const schema = {
        tables: {
            Book: {
                idAttribute: "id",
            },
            Author: {
                idAttribute: "id",
            },
        },
    };

    const db = createDatabase(schema);
    const emptyState = deepFreeze(db.getEmptyState());

    it("getEmptyState", () => {
        expect(emptyState).toEqual({
            [STATE_FLAG]: true,
            Book: {
                indexes: {},
                items: [],
                itemsById: {},
                meta: {},
            },
            Author: {
                indexes: {},
                items: [],
                itemsById: {},
                meta: {},
            },
        });
    });

    it("describe", () => {
        const table = db.describe("Book");
        expect(table).toBeInstanceOf(Table);
    });

    it("query on empty database", () => {
        const querySpec = {
            table: "Book",
            clauses: [],
        };
        const result = db.query(querySpec, emptyState);
        expect(result.rows).toEqual([]);
    });

    it("insert row with id specified", () => {
        const props = { id: 0, name: "Example Book" };
        const updateSpec = {
            action: CREATE,
            payload: props,
            table: "Book",
        };
        const tx = { batchToken: getBatchToken(), withMutations: false };
        const { status, state, payload } = db.update(
            updateSpec,
            tx,
            emptyState
        );
        expect(status).toBe(SUCCESS);
        expect(payload).toBe(props);
        expect(state).not.toBe(emptyState);
        expect(state).toEqual({
            [STATE_FLAG]: true,
            Book: {
                items: [0],
                itemsById: {
                    0: props,
                },
                meta: {
                    maxId: 0,
                },
                indexes: {},
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
                indexes: {},
            },
        });
    });

    it("insert row to empty database without id (autosequence)", () => {
        const props = { name: "Example Book" };
        const updateSpec = {
            action: CREATE,
            payload: props,
            table: "Book",
        };
        const tx = { batchToken: getBatchToken(), withMutations: false };
        const { status, state, payload } = db.update(
            updateSpec,
            tx,
            emptyState
        );
        expect(status).toBe(SUCCESS);
        expect(payload).toEqual({ id: 0, name: "Example Book" });
        expect(state).not.toBe(emptyState);
        expect(state).toEqual({
            [STATE_FLAG]: true,
            Book: {
                items: [0],
                itemsById: {
                    0: {
                        id: 0,
                        name: "Example Book",
                    },
                },
                meta: {
                    maxId: 0,
                },
                indexes: {},
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
                indexes: {},
            },
        });

        // Second insert.

        const props2 = { name: "Example Book Two" };
        const updateSpec2 = {
            action: CREATE,
            payload: props2,
            table: "Book",
        };
        const { status: status2, state: state2, payload: payload2 } = db.update(
            updateSpec2,
            tx,
            state
        );

        expect(status2).toBe(SUCCESS);
        expect(payload2).toEqual({ id: 1, name: "Example Book Two" });
        expect(state2).toBe(state);
        expect(state2).toEqual({
            [STATE_FLAG]: true,
            Book: {
                items: [0, 1],
                itemsById: {
                    0: {
                        id: 0,
                        name: "Example Book",
                    },
                    1: {
                        id: 1,
                        name: "Example Book Two",
                    },
                },
                meta: {
                    maxId: 1,
                },
                indexes: {},
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
                indexes: {},
            },
        });
    });

    it("update row", () => {
        const startState = {
            Book: {
                items: [0],
                itemsById: {
                    0: {
                        id: 0,
                        name: "Example Book",
                    },
                },
                meta: {
                    maxId: 0,
                },
                indexes: {},
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
                indexes: {},
            },
        };

        const updateSpec = {
            action: UPDATE,
            payload: {
                name: "Modified Example Book",
            },
            table: "Book",
            query: {
                table: "Book",
                clauses: [{ type: FILTER, payload: { id: 0 } }],
            },
        };
        const tx = { batchToken: getBatchToken(), withMutations: false };
        const { status, state } = db.update(updateSpec, tx, startState);

        expect(status).toBe(SUCCESS);
        expect(state).not.toBe(startState);
        expect(state.Book.itemsById[0].name).toBe("Modified Example Book");
    });

    it("delete row", () => {
        const startState = {
            Book: {
                items: [0],
                itemsById: {
                    0: {
                        id: 0,
                        name: "Example Book",
                    },
                },
                meta: {
                    maxId: 0,
                },
                indexes: {},
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
                indexes: {},
            },
        };

        const updateSpec = {
            action: DELETE,
            table: "Book",
            query: {
                table: "Book",
                clauses: [{ type: FILTER, payload: { id: 0 } }],
            },
        };
        const tx = { batchToken: getBatchToken(), withMutations: false };
        const { status, state } = db.update(updateSpec, tx, startState);

        expect(status).toBe(SUCCESS);
        expect(state).not.toBe(startState);
        expect(state.Book.items).toEqual([]);
        expect(state.Book.itemsById).toEqual({});
    });

    it("throws upon unknown update type", () => {
        const state = {
            Book: {
                items: [],
                itemsById: {},
                meta: {},
                indexes: {},
            },
        };
        const updateSpec = {
            action: "Wash the dishes",
            query: {
                table: "Book",
                clauses: [],
            },
        };
        const tx = { batchToken: getBatchToken(), withMutations: false };
        expect(() => {
            db.update(updateSpec, tx, state);
        }).toThrow("Database received unknown update type: Wash the dishes");
    });
});
