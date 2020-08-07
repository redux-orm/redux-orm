import ops from "immutable-ops";

import { CREATE, UPDATE, DELETE, SUCCESS, STATE_FLAG } from "../constants";

import Table from "./Table";

const BASE_EMPTY_STATE = {};
Object.defineProperty(BASE_EMPTY_STATE, STATE_FLAG, {
    enumerable: true,
    value: true,
});

/** @private */
function replaceTableState(tableName, newTableState, tx, state) {
    const { batchToken, withMutations } = tx;

    if (withMutations) {
        state[tableName] = newTableState;
        return state;
    }

    return ops.batch.set(batchToken, tableName, newTableState, state);
}

/** @private */
function query(tables, querySpec, state) {
    const { table: tableName, clauses } = querySpec;
    const table = tables[tableName];
    const rows = table.query(state[tableName], clauses);
    return {
        rows,
    };
}

/** @private */
function update(tables, updateSpec, tx, state) {
    const { action, payload } = updateSpec;

    let tableName;
    let nextTableState;
    let resultPayload;

    if (action === CREATE) {
        ({ table: tableName } = updateSpec);
        const table = tables[tableName];
        const currTableState = state[tableName];
        const result = table.insert(tx, currTableState, payload);
        nextTableState = result.state;
        resultPayload = result.created;
    } else {
        const { query: querySpec } = updateSpec;
        ({ table: tableName } = querySpec);
        const { rows } = query(tables, querySpec, state);

        const table = tables[tableName];
        const currTableState = state[tableName];

        if (action === UPDATE) {
            nextTableState = table.update(tx, currTableState, rows, payload);
            // return updated rows
            resultPayload = query(tables, querySpec, state).rows;
        } else if (action === DELETE) {
            nextTableState = table.delete(tx, currTableState, rows);
            // return original rows that we just deleted
            resultPayload = rows;
        } else {
            throw new Error(`Database received unknown update type: ${action}`);
        }
    }

    const nextDBState = replaceTableState(tableName, nextTableState, tx, state);
    return {
        status: SUCCESS,
        state: nextDBState,
        payload: resultPayload,
    };
}

/**
 * @memberof db
 * @param {Object} schemaSpec
 * @return Object database
 */
export function createDatabase(schemaSpec) {
    const { tables: tableSpecs } = schemaSpec;
    const tables = Object.entries(tableSpecs).reduce(
        (map, [tableName, tableSpec]) => ({
            ...map,
            [tableName]: new Table(tableSpec),
        }),
        {}
    );

    const getEmptyState = () =>
        Object.entries(tables).reduce(
            (map, [tableName, table]) => ({
                ...map,
                [tableName]: table.getEmptyState(),
            }),
            BASE_EMPTY_STATE
        );

    return {
        getEmptyState,
        query: query.bind(null, tables),
        update: update.bind(null, tables),
        // Used to inspect the schema.
        describe: (tableName) => tables[tableName],
    };
}

export default createDatabase;
