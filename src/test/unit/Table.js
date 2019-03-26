import deepFreeze from 'deep-freeze';
import Table from '../../db/Table';
import { getBatchToken } from '../../utils';
import { FILTER, EXCLUDE, ORDER_BY } from '../../constants';

describe('Table', () => {
    describe('prototype methods', () => {
        let state;
        let batchToken;
        let txInfo;
        let table;

        beforeEach(() => {
            state = deepFreeze({
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        data: 'cooldata',
                    },
                    1: {
                        id: 1,
                        data: 'verycooldata!',
                    },
                    2: {
                        id: 2,
                        data: 'awesomedata',
                    },
                },
                meta: {},
                indexes: {},
            });
            batchToken = getBatchToken();
            txInfo = { batchToken, withMutations: false };
            table = new Table();
        });

        it('correctly accesses an id', () => {
            expect(table.accessId(state, 1)).toBe(state.itemsById[1]);
        });

        it('correctly accesses id\'s', () => {
            expect(table.accessIdList(state)).toBe(state.items);
        });

        it('correctly returns a default state', () => {
            expect(table.getEmptyState()).toEqual({
                items: [],
                itemsById: {},
                meta: {},
                indexes: {},
            });
        });

        it('correctly inserts an entry', () => {
            const entry = { id: 3, data: 'newdata!' };
            const { state: newState, created } = table.insert(txInfo, state, entry);

            expect(created).toBe(entry);

            expect(newState).not.toBe(state);
            expect(newState.items).toEqual([0, 1, 2, 3]);
            expect(newState.itemsById).toEqual({
                0: {
                    id: 0,
                    data: 'cooldata',
                },
                1: {
                    id: 1,
                    data: 'verycooldata!',
                },
                2: {
                    id: 2,
                    data: 'awesomedata',
                },
                3: {
                    id: 3,
                    data: 'newdata!',
                },
            });
        });

        it('correctly updates entries with a merging object', () => {
            const toMergeObj = { data: 'modifiedData' };
            const rowsToUpdate = [state.itemsById[1], state.itemsById[2]];
            const newState = table.update(txInfo, state, rowsToUpdate, toMergeObj);

            expect(newState).not.toBe(state);
            expect(newState.items).toBe(state.items);
            expect(newState.itemsById).toEqual({
                0: {
                    id: 0,
                    data: 'cooldata',
                },
                1: {
                    id: 1,
                    data: 'modifiedData',
                },
                2: {
                    id: 2,
                    data: 'modifiedData',
                },
            });
        });

        it('correctly deletes entries', () => {
            const rowsToDelete = [state.itemsById[1], state.itemsById[2]];
            const newState = table.delete(txInfo, state, rowsToDelete);

            expect(newState).not.toBe(state);
            expect(newState.items).toEqual([0]);
            expect(newState.itemsById).toEqual({
                0: {
                    id: 0,
                    data: 'cooldata',
                },
            });
        });

        it('filter works correctly with object argument', () => {
            const clauses = [{ type: FILTER, payload: { data: 'verycooldata!' } }];
            const result = table.query(state, clauses);
            expect(result).toHaveLength(1);
            expect(result[0]).toBe(state.itemsById[1]);
        });

        it('filter works correctly with "idAttribute" is "name" and filter argument is a function', () => {
            state = deepFreeze({
                items: ['work', 'personal', 'urgent'],
                itemsById: {
                    work: {
                        name: 'work',
                    },
                    personal: {
                        name: 'personal',
                    },
                    urgent: {
                        name: 'urgent',
                    },
                },
                meta: {},
                indexes: {},
            });
            table = new Table({ idAttribute: 'name' });
            const clauses = [
                {
                    type: FILTER,
                    payload: (attrs) => ['work', 'urgent']
                        .indexOf(attrs[table.idAttribute]) > -1
                }
            ];
            const result = table.query(state, clauses);
            expect(result).toHaveLength(2);
            expect(result[0]).toBe(state.itemsById.work);
            expect(result[1]).toBe(state.itemsById.urgent);
        });

        it('orderBy works correctly with prop argument', () => {
            const clauses = [{ type: ORDER_BY, payload: [['data'], ['inc']] }];
            const result = table.query(state, clauses);
            expect(result.map(row => row.data)).toEqual(['awesomedata', 'cooldata', 'verycooldata!']);
        });

        it('orderBy works correctly with function argument', () => {
            const clauses = [{ type: ORDER_BY, payload: [row => row.data, undefined] }];
            const result = table.query(state, clauses);
            expect(result.map(row => row.data)).toEqual(['awesomedata', 'cooldata', 'verycooldata!']);
        });

        it('exclude works correctly with object argument', () => {
            const clauses = [{ type: EXCLUDE, payload: { data: 'verycooldata!' } }];
            const result = table.query(state, clauses);
            expect(result).toHaveLength(2);
            expect(result.map(row => row.id)).toEqual([0, 2]);
        });

        it('query works with multiple clauses', () => {
            const clauses = [
                { type: FILTER, payload: row => row.id > 0 },
                { type: ORDER_BY, payload: [['data'], ['inc']] },
            ];
            const result = table.query(state, clauses);
            expect(result.map(row => row.data)).toEqual(['awesomedata', 'verycooldata!']);
        });

        it('query works with clauses that are resolvable using multiple indexes', () => {
            state = deepFreeze({
                items: ['work', 'personal', 'urgent'],
                itemsById: {
                    work: {
                        name: 'work',
                        withIndex1: 1,
                        withIndex2: 2,
                    },
                    personal: {
                        name: 'personal',
                        withIndex1: 1,
                        withIndex2: 3,
                    },
                    urgent: {
                        name: 'urgent',
                        withIndex1: 1,
                        withIndex2: null,
                    },
                },
                meta: {},
                indexes: {
                    withIndex1: {
                        1: ['work', 'personal', 'urgent'],
                    },
                    withIndex2: {
                        2: ['work'],
                        3: ['personal'],
                    },
                },
            });
            const clauses = [
                { type: FILTER, payload: { withIndex1: 1, withIndex2: 2 } },
            ];
            const result = table.query(state, clauses);
            expect(result.map(row => row.name)).toEqual(['work']);
        });

        it('query works with an id filter for a row which is not in the current result set', () => {
            const clauses = [
                { type: FILTER, payload: row => row.id !== 1 },
                { type: FILTER, payload: { id: 1 } },
            ];
            const result = table.query(state, clauses);
            expect(result).toHaveLength(0);
        });

        it('query works with clauses of unknown type', () => {
            const clauses = [
                { type: 'Some unkown type' },
            ];
            const result = table.query(state, clauses);
            expect(result.map(row => row.data)).toEqual(['cooldata', 'verycooldata!', 'awesomedata']);
        });

        it('nextId returns successor', () => {
            expect(table.nextId(1)).toBe(2);
            expect(table.nextId(100000)).toBe(100001);
        });
    });

    describe('mutable indexes', () => {
        let emptyState;
        let batchToken;
        let txInfo;
        let table;

        beforeEach(() => {
            batchToken = getBatchToken();
            txInfo = { batchToken, withMutations: true };
            table = new Table({
                fields: {
                    // mock for a Field object
                    foreignKey: { index: true },
                }
            });
            emptyState = table.getEmptyState();
        });

        it('adds to index upon insertion', () => {
            const entry = { id: 3, foreignKey: 123 };
            let nextTable;
            nextTable = table.insert(txInfo, emptyState, entry);
            expect(nextTable.state.indexes).toEqual({
                foreignKey: {
                    123: [3],
                },
            });
            nextTable = table.insert(txInfo, nextTable.state, entry);
            expect(nextTable.state.indexes).toEqual({
                foreignKey: {
                    // TODO: Prevent insertion of duplicate PKs (entries just get overridden now).
                    123: [3, 3],
                },
            });
        });

        it('removes from index upon deletion', () => {
            const state = {
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: 123,
                    },
                    3: {
                        id: 3,
                        foreignKey: 123,
                    },
                    4: {
                        id: 4,
                        foreignKey: 123,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0, 2, 3, 4],
                        1000: [1],
                    },
                },
            };
            const rowsToDelete = [state.itemsById[0], state.itemsById[1], state.itemsById[2]];
            const nextState = table.delete(txInfo, state, rowsToDelete);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [3, 4],
                    1000: [],
                },
            });
        });

        it('removes from index upon update', () => {
            const state = {
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: 123,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0, 2],
                        1000: [1],
                    },
                },
            };
            const rowsToUpdate = [state.itemsById[1], state.itemsById[2]];
            const mergeObj = { foreignKey: null };
            const nextState = table.update(txInfo, state, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [0],
                    1000: [],
                },
            });
        });

        it('adds to index upon update', () => {
            const state = {
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: null,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0],
                        1000: [1],
                    },
                },
            };
            const rowsToUpdate = [state.itemsById[2]];
            const mergeObj = { foreignKey: 123 };
            const nextState = table.update(txInfo, state, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [0, 2],
                    1000: [1],
                },
            });
        });

        it('adds to and removes from index simultaneously upon update', () => {
            const state = {
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: null,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0],
                        1000: [1],
                    },
                },
            };
            const rowsToUpdate = [state.itemsById[0], state.itemsById[2]];
            const mergeObj = { foreignKey: 1000 };
            const nextState = table.update(txInfo, state, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [],
                    1000: [1, 0, 2],
                },
            });
        });

        it('update with same index values does not change anything', () => {
            let rowsToUpdate;
            let mergeObj;
            let nextState;
            const state = {
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: null,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0],
                        1000: [1],
                    },
                },
            };
            rowsToUpdate = [state.itemsById[0]];
            mergeObj = { foreignKey: 123 };
            nextState = table.update(txInfo, state, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [0],
                    1000: [1],
                },
            });
            rowsToUpdate = [state.itemsById[2]];
            mergeObj = { foreignKey: null };
            nextState = table.update(txInfo, nextState, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [0],
                    1000: [1],
                },
            });
        });
    });

    describe('immutable indexes', () => {
        let emptyState;
        let batchToken;
        let txInfo;
        let table;

        beforeEach(() => {
            batchToken = getBatchToken();
            txInfo = { batchToken, withMutations: false };
            table = new Table({
                fields: {
                    // mock for a Field object
                    foreignKey: { index: true },
                }
            });
            emptyState = deepFreeze(table.getEmptyState());
        });

        it('adds to index upon insertion', () => {
            const entry = { id: 3, foreignKey: 123 };
            let nextTable;
            nextTable = table.insert(txInfo, emptyState, entry);
            expect(nextTable.state.indexes).toEqual({
                foreignKey: {
                    123: [3],
                },
            });
            nextTable = table.insert(txInfo, nextTable.state, entry);
            expect(nextTable.state.indexes).toEqual({
                foreignKey: {
                    // TODO: Prevent insertion of duplicate PKs (entries just get overridden now).
                    123: [3, 3],
                },
            });
        });

        it('removes from index upon deletion', () => {
            const state = deepFreeze({
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: 123,
                    },
                    3: {
                        id: 3,
                        foreignKey: 123,
                    },
                    4: {
                        id: 4,
                        foreignKey: 123,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0, 2, 3, 4],
                        1000: [1],
                    },
                },
            });
            const rowsToDelete = [state.itemsById[0], state.itemsById[1], state.itemsById[2]];
            const nextState = table.delete(txInfo, state, rowsToDelete);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [3, 4],
                    1000: [],
                },
            });
        });

        it('removes from index upon update', () => {
            const state = deepFreeze({
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: 123,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0, 2],
                        1000: [1],
                    },
                },
            });
            const rowsToUpdate = [state.itemsById[1], state.itemsById[2]];
            const mergeObj = { foreignKey: null };
            const nextState = table.update(txInfo, state, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [0],
                    1000: [],
                },
            });
        });

        it('adds to index upon update', () => {
            const state = deepFreeze({
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: null,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0],
                        1000: [1],
                    },
                },
            });
            const rowsToUpdate = [state.itemsById[2]];
            const mergeObj = { foreignKey: 123 };
            const nextState = table.update(txInfo, state, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [0, 2],
                    1000: [1],
                },
            });
        });

        it('adds to and removes from index simultaneously upon update', () => {
            const state = deepFreeze({
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: null,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0],
                        1000: [1],
                    },
                },
            });
            const rowsToUpdate = [state.itemsById[0], state.itemsById[2]];
            const mergeObj = { foreignKey: 1000 };
            const nextState = table.update(txInfo, state, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [],
                    1000: [1, 0, 2],
                },
            });
        });

        it('update with same index values does not change anything', () => {
            let rowsToUpdate;
            let mergeObj;
            let nextState;
            const state = deepFreeze({
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        foreignKey: 123,
                    },
                    1: {
                        id: 1,
                        foreignKey: 1000,
                    },
                    2: {
                        id: 2,
                        foreignKey: null,
                    },
                },
                meta: {},
                indexes: {
                    foreignKey: {
                        123: [0],
                        1000: [1],
                    },
                },
            });
            rowsToUpdate = [state.itemsById[0]];
            mergeObj = { foreignKey: 123 };
            nextState = table.update(txInfo, state, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [0],
                    1000: [1],
                },
            });
            rowsToUpdate = [state.itemsById[2]];
            mergeObj = { foreignKey: null };
            nextState = table.update(txInfo, nextState, rowsToUpdate, mergeObj);
            expect(nextState.indexes).toEqual({
                foreignKey: {
                    123: [0],
                    1000: [1],
                },
            });
        });
    });
});
