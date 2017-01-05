import chai from 'chai';
import sinonChai from 'sinon-chai';
import deepFreeze from 'deep-freeze';
chai.use(sinonChai);
const { expect } = chai;
import createDatabase from '../db';
import Table from '../db/Table';
import { getBatchToken } from '../utils';
import {
    FILTER,
    EXCLUDE,
    ORDER_BY,
    CREATE,
    UPDATE,
    DELETE,
    SUCCESS,
} from '../constants';

describe('createDatabase', () => {
    const schema = {
        tables: {
            Book: {
                idAttribute: 'id',
            },
            Author: {
                idAttribute: 'id',
            },
        },
    };

    const db = createDatabase(schema);
    const emptyState = deepFreeze(db.getEmptyState());

    it('getEmptyState', () => {
        expect(emptyState).to.deep.equal({
            Book: {
                items: [],
                itemsById: {},
                meta: {},
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
            },
        });
    });

    it('describe', () => {
        const table = db.describe('Book');
        expect(table).to.be.an.instanceof(Table);
    });

    it('query on empty database', () => {
        const querySpec = {
            table: 'Book',
            clauses: [],
        };
        const result = db.query(querySpec, emptyState);
        expect(result.rows).to.deep.equal([]);
    });

    it('insert row with id specified', () => {
        const props = { id: 0, name: 'Example Book' };
        const updateSpec = {
            action: CREATE,
            payload: props,
            table: 'Book',
        };
        const tx = { batchToken: getBatchToken(), withMutations: false };
        const { status, state, payload } = db.update(updateSpec, tx, emptyState);
        expect(status).to.equal(SUCCESS);
        expect(payload).to.equal(props);
        expect(state).to.not.equal(emptyState);
        expect(state).to.deep.equal({
            Book: {
                items: [0],
                itemsById: {
                    0: props,
                },
                meta: {
                    maxId: 0,
                },
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
            },
        });
    });

    it('insert row to empty database without id (autosequence)', () => {
        const props = { name: 'Example Book' };
        const updateSpec = {
            action: CREATE,
            payload: props,
            table: 'Book',
        };
        const tx = { batchToken: getBatchToken(), withMutations: false };
        const { status, state, payload } = db.update(updateSpec, tx, emptyState);
        expect(status).to.equal(SUCCESS);
        expect(payload).to.deep.equal({ id: 0, name: 'Example Book' });
        expect(state).to.not.equal(emptyState);
        expect(state).to.deep.equal({
            Book: {
                items: [0],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'Example Book',
                    },
                },
                meta: {
                    maxId: 0,
                },
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
            },
        });

        // Second insert.

        const props2 = { name: 'Example Book Two' };
        const updateSpec2 = {
            action: CREATE,
            payload: props2,
            table: 'Book',
        };
        const {
            status: status2,
            state: state2,
            payload: payload2,
        } = db.update(updateSpec2, tx, state);

        expect(status2).to.equal(SUCCESS);
        expect(payload2).to.deep.equal({ id: 1, name: 'Example Book Two' });
        expect(state2).to.equal(state);
        expect(state2).to.deep.equal({
            Book: {
                items: [0, 1],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'Example Book',
                    },
                    1: {
                        id: 1,
                        name: 'Example Book Two',
                    },
                },
                meta: {
                    maxId: 1,
                },
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
            },
        });
    });

    it('update row', () => {
        const startState = {
            Book: {
                items: [0],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'Example Book',
                    },
                },
                meta: {
                    maxId: 0,
                },
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
            },
        };

        const updateSpec = {
            action: UPDATE,
            payload: {
                name: 'Modified Example Book',
            },
            table: 'Book',
            query: {
                table: 'Book',
                clauses: [
                    { type: FILTER, payload: { id: 0 } },
                ],
            },
        };
        const tx = { batchToken: getBatchToken(), withMutations: false };
        const { status, state } = db.update(updateSpec, tx, startState);

        expect(status).to.equal(SUCCESS);
        expect(state).to.not.equal(startState);
        expect(state.Book.itemsById[0].name).to.equal('Modified Example Book');
    });

    it('delete row', () => {
        const startState = {
            Book: {
                items: [0],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'Example Book',
                    },
                },
                meta: {
                    maxId: 0,
                },
            },
            Author: {
                items: [],
                itemsById: {},
                meta: {},
            },
        };

        const updateSpec = {
            action: DELETE,
            table: 'Book',
            query: {
                table: 'Book',
                clauses: [
                    { type: FILTER, payload: { id: 0 } },
                ],
            },
        };
        const tx = { batchToken: getBatchToken(), withMutations: false };
        const { status, state } = db.update(updateSpec, tx, startState);

        expect(status).to.equal(SUCCESS);
        expect(state).to.not.equal(startState);
        expect(state.Book.items).to.deep.equal([]);
        expect(state.Book.itemsById).to.deep.equal({});
    });
});
