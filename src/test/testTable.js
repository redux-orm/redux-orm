import chai from 'chai';
import sinonChai from 'sinon-chai';
import deepFreeze from 'deep-freeze';
chai.use(sinonChai);
const { expect } = chai;
import Table from '../db/Table';
import { getBatchToken } from '../utils';
import { FILTER, EXCLUDE, ORDER_BY } from '../constants';

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
            });
            batchToken = getBatchToken();
            txInfo = { batchToken, withMutations: false };
            table = new Table();
        });

        it('correctly accesses an id', () => {
            expect(table.accessId(state, 1)).to.equal(state.itemsById[1]);
        });

        it('correctly accesses id\'s', () => {
            expect(table.accessIdList(state)).to.equal(state.items);
        });

        it('correctly returns a default state', () => {
            expect(table.getEmptyState()).to.deep.equal({
                items: [],
                itemsById: {},
                meta: {},
            });
        });

        it('correctly inserts an entry', () => {
            const entry = { id: 3, data: 'newdata!' };
            const { state: newState, created } = table.insert(txInfo, state, entry);

            expect(created).to.equal(entry);

            expect(newState).to.not.equal(state);
            expect(newState.items).to.deep.equal([0, 1, 2, 3]);
            expect(newState.itemsById).to.deep.equal({
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

            expect(newState).to.not.equal(state);
            expect(newState.items).to.equal(state.items);
            expect(newState.itemsById).to.deep.equal({
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

            expect(newState).to.not.equal(state);
            expect(newState.items).to.deep.equal([0]);
            expect(newState.itemsById).to.deep.equal({
                0: {
                    id: 0,
                    data: 'cooldata',
                },
            });
        });

        it('filter works correctly with object argument', () => {
            const clauses = [{ type: FILTER, payload: { data: 'verycooldata!' } }];
            const result = table.query(state, clauses);
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal(state.itemsById[1]);
        });

        it('orderBy works correctly with prop argument', () => {
            const clauses = [{ type: ORDER_BY, payload: [['data'], ['inc']] }];
            const result = table.query(state, clauses);
            expect(result.map(row => row.data)).to.deep.equal(
                ['awesomedata', 'cooldata', 'verycooldata!']
            );
        });

        it('orderBy works correctly with function argument', () => {
            const clauses = [{ type: ORDER_BY, payload: [row => row.data, undefined] }];
            const result = table.query(state, clauses);
            expect(result.map(row => row.data)).to.deep.equal(
                ['awesomedata', 'cooldata', 'verycooldata!']
            );
        });

        it('exclude works correctly with object argument', () => {
            const clauses = [{ type: EXCLUDE, payload: { data: 'verycooldata!' } }];
            const result = table.query(state, clauses);
            expect(result.length).to.equal(2);
            expect(result.map(row => row.id)).to.deep.equal([0, 2]);
        });

        it('query works with multiple clauses', () => {
            const clauses = [
                { type: FILTER, payload: row => row.id > 0 },
                { type: ORDER_BY, payload: [['data'], ['inc']] },
            ];
            const result = table.query(state, clauses);
            expect(result.map(row => row.data)).to.deep.equal(
                ['awesomedata', 'verycooldata!']
            );
        });
    });
});
