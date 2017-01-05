import mapValues from 'lodash/mapValues';
import ops from 'immutable-ops';

import { CREATE, UPDATE, DELETE, SUCCESS } from '../constants';

import Table from './Table';


function replaceTableState(tableName, newTableState, tx, state) {
    const { batchToken, withMutations } = tx;

    if (withMutations) {
        state[tableName] = newTableState;
        return state;
    }

    return ops.batch.set(batchToken, tableName, newTableState, state);
}

function query(tables, querySpec, state) {
    const { table: tableName, clauses } = querySpec;
    const table = tables[tableName];
    const rows = table.query(state[tableName], clauses);
    return {
        rows,
    };
}

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
        } else if (action === DELETE) {
            nextTableState = table.delete(tx, currTableState, rows);
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


export function createDatabase(schemaSpec) {
    const { tables: tablesSpec } = schemaSpec;
    const tables = mapValues(tablesSpec, tableSpec => new Table(tableSpec));

    const getEmptyState = () => mapValues(tables, table => table.getEmptyState());
    return {
        getEmptyState,
        query: query.bind(null, tables),
        update: update.bind(null, tables),
        // Used to inspect the schema.
        describe: tableName => tables[tableName],
    };
}

export default createDatabase;
