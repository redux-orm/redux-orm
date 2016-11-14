import mapValues from 'lodash/mapValues';
import ops from 'immutable-ops';

import { CREATE, UPDATE, DELETE } from '../constants';

import Table from './Table';


class Database {
    constructor(schemaSpec) {
        // Map of table name to table spec.
        this.schemaSpec = schemaSpec;

        this.tables = mapValues(schemaSpec, tableSpec => new Table(tableSpec));
    }

    getDefaultState() {
        return mapValues(this.tables, table => table.getDefaultState());
    }

    getTableState(state, tableName) {
        return state[tableName];
    }

    query(state, tableName, queryInfo) {
        return this.tables[tableName].query(
            this.getTableState(state, tableName),
            queryInfo
        );
    }

    replaceTableState(tx, state, tableName, newTableState) {
        const { batchToken, withMutations } = tx;

        if (withMutations) {
            state[tableName] = newTableState;
            return state;
        }

        return ops.batch.set(batchToken, tableName, newTableState, state);
    }

    insertRow(tx, state, tableName, payload) {
        const table = this.tables[tableName];
        const currTableState = state[tableName];
        const nextTableState = table.insert(tx, currTableState, payload);
        return this.replaceTableState(tx, state, tableName, nextTableState);
    }

    updateRows(tx, state, tableName, idArr, mergeObj) {
        const table = this.tables[tableName];
        const currTableState = state[tableName];
        const nextTableState = table.update(tx, currTableState, idArr, mergeObj);
        return this.replaceTableState(tx, state, tableName, nextTableState);
    }

    deleteRows(tx, state, tableName, idsToDelete) {
        const table = this.tables[tableName];
        const currTableState = state[tableName];
        const nextTableState = table.delete(tx, currTableState, idsToDelete);
        return this.replaceTableState(tx, state, tableName, nextTableState);
    }

    update(tx, state, tableName, action) {
        const { type, payload } = action;
        switch (type) {
        case CREATE:
            return this.insertRow(tx, state, tableName, payload);
        case UPDATE:
            return this.updateRows(tx, state, tableName, payload.idArr, payload.mergeObj);
        case DELETE:
            return this.deleteRows(tx, state, tableName, payload);
        default:
            throw new Error(`Database received unknown update type: ${type}`);
        }
    }
}

export default Database;
