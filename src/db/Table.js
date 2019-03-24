import reject from 'lodash/reject';
import filter from 'lodash/filter';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import ops from 'immutable-ops';

import {
    FILTER, EXCLUDE, ORDER_BY,
} from '../constants';
import { clauseFiltersByAttribute, clauseReducesResultSetSize } from '../utils';

import { ForeignKey } from '../fields';

const DEFAULT_TABLE_OPTIONS = {
    idAttribute: 'id',
    arrName: 'items',
    mapName: 'itemsById',
    fields: {},
};

// Input is the current max id and the new id passed to the create action.
// Both may be undefined. The current max id in the case that this is the first Model
// being created, and the new id if the id was not explicitly passed to the
// database.
//
// Return value is the new max id and the id to use to create the new row.
// If the id's are strings, the id must be passed explicitly every time.
// In this case, the current max id will remain `NaN` due to `Math.max`, but that's fine.
function idSequencer(_currMax, userPassedId) {
    let currMax = _currMax;
    let newMax;
    let newId;

    if (currMax === undefined) {
        currMax = -1;
    }

    if (userPassedId === undefined) {
        newMax = currMax + 1;
        newId = newMax;
    } else {
        newMax = Math.max(currMax + 1, userPassedId);
        newId = userPassedId;
    }

    return [
        newMax, // new max id
        newId, // id to use for row creation
    ];
}

/**
 * Handles the underlying data structure for a {@link Model} class.
 */
const Table = class Table {
    /**
     * Creates a new {@link Table} instance.
     * @param  {Object} userOpts - options to use.
     * @param  {string} [userOpts.idAttribute=id] - the id attribute of the entity.
     * @param  {string} [userOpts.arrName=items] - the state attribute where an array of
     *                                             entity id's are stored
     * @param  {string} [userOpts.mapName=itemsById] - the state attribute where the entity objects
     *                                                 are stored in a id to entity object
     *                                                 map.
     * @param  {string} [userOpts.fields={}] - mapping of field key to {@link Field} object
     */
    constructor(userOpts) {
        Object.assign(this, DEFAULT_TABLE_OPTIONS, userOpts);
    }

    /**
     * Returns a reference to the object at index `id`
     * in state `branch`.
     *
     * @param  {Object} branch - the state
     * @param  {Number} id - the id of the object to get
     * @return {Object|undefined} A reference to the raw object in the state or
     *                            `undefined` if not found.
     */
    accessId(branch, id) {
        return branch[this.mapName][id];
    }

    accessIds(branch, ids) {
        const map = branch[this.mapName];
        return ids.map(id => map[id]);
    }

    idExists(branch, id) {
        return branch[this.mapName].hasOwnProperty(id);
    }

    accessIdList(branch) {
        return branch[this.arrName];
    }

    accessList(branch) {
        return this.accessIds(branch, this.accessIdList(branch));
    }

    getMaxId(branch) {
        return this.getMeta(branch, 'maxId');
    }

    setMaxId(tx, branch, newMaxId) {
        return this.setMeta(tx, branch, 'maxId', newMaxId);
    }

    nextId(id) {
        return id + 1;
    }

    query(branch, clauses) {
        if (clauses.length === 0) {
            return this.accessList(branch);
        }

        const { idAttribute } = this;

        const optimallyOrderedClauses = sortBy(clauses, (clause) => {
            if (clauseFiltersByAttribute(clause, idAttribute)) {
                return 1;
            }

            if (clauseReducesResultSetSize(clause)) {
                return 2;
            }

            return 3;
        });

        const reducer = (rows, clause) => {
            const { type, payload } = clause;
            if (!rows) {
                /**
                 * First time this reducer is called during query.
                 * This is where we apply query optimizations.
                 */
                if (clauseFiltersByAttribute(clause, idAttribute)) {
                    /**
                     * Payload specified a primary key. Use PK index
                     * to look up the single row identified by the PK.
                     */
                    const id = payload[idAttribute];
                    return this.idExists(branch, id)
                        ? [this.accessId(branch, id)]
                        : [];
                }
                if (type === FILTER) {
                    const indexes = Object.entries(branch.indexes);
                    const accessedIndexes = [];
                    indexes.forEach(([fkAttr, index]) => {
                        if (clauseFiltersByAttribute(clause, fkAttr)) {
                            /**
                            * Payload specified a foreign key. Use FK index
                            * to potentially decrease amount of accessed rows.
                            */
                            accessedIndexes.push(index[payload[fkAttr]] || []);
                        }
                    });
                    /**
                     * Calculate set of unique PK values corresponding to each
                     * foreign key's attribute value. Then retrieve all those rows.
                     */
                    if (accessedIndexes.length) {
                        const lastIndex = accessedIndexes.pop();
                        const indexedIds = accessedIndexes.reduce(([result, index]) => {
                            const indexSet = new Set(index);
                            return result.filter(Set.prototype.has, indexSet);
                        }, lastIndex);
                        return reducer(this.accessIds(branch, indexedIds), clause);
                    }
                }

                // Give up optimization: Retrieve all rows (full table scan).
                return reducer(this.accessList(branch), clause);
            }

            switch (type) {
            case FILTER: {
                return filter(rows, payload);
            }
            case EXCLUDE: {
                return reject(rows, payload);
            }
            case ORDER_BY: {
                const [iteratees, orders] = payload;
                return orderBy(rows, iteratees, orders);
            }
            default:
                return rows;
            }
        };

        return optimallyOrderedClauses.reduce(reducer, undefined);
    }

    /**
     * Returns the default state for the data structure.
     * @return {Object} The default state for this {@link ORM} instance's data structure
     */
    getEmptyState() {
        const pkIndex = {
            [this.arrName]: [],
            [this.mapName]: {},
        };
        const fkIndexes = Object.keys(this.fields)
            .filter(attr => attr !== this.idAttribute)
            .filter(attr => this.fields[attr] instanceof ForeignKey)
            .reduce((indexes, fkAttr) => ({
                ...indexes,
                [fkAttr]: {},
            }), {});
        return {
            ...pkIndex,
            indexes: fkIndexes,
            meta: {},
        };
    }

    setMeta(tx, branch, key, value) {
        const { batchToken, withMutations } = tx;
        if (withMutations) {
            const res = ops.mutable.setIn(['meta', key], value, branch);
            return res;
        }

        return ops.batch.setIn(batchToken, ['meta', key], value, branch);
    }

    getMeta(branch, key) {
        return branch.meta[key];
    }

    /**
     * Returns the data structure including a new object `entry`
     * @param  {Object} tx - transaction info
     * @param  {Object} branch - the data structure state
     * @param  {Object} entry - the object to insert
     * @return {Object} an object with two keys: `state` and `created`.
     *                  `state` is the new table state and `created` is the
     *                  row that was created.
     */
    insert(tx, branch, entry) {
        const { batchToken, withMutations } = tx;

        const hasId = entry.hasOwnProperty(this.idAttribute);

        let workingState = branch;

        // This will not affect string id's.
        const [newMaxId, id] = idSequencer(this.getMaxId(branch), entry[this.idAttribute]);
        workingState = this.setMaxId(tx, branch, newMaxId);

        const finalEntry = hasId
            ? entry
            : ops.batch.set(batchToken, this.idAttribute, id, entry);

        const indexToPush = Object.keys(workingState.indexes).reduce((values, fkAttr) => {
            if (!entry.hasOwnProperty(fkAttr)) return values;
            values.push([fkAttr, entry[fkAttr]]);
            return values;
        }, []);


        if (withMutations) {
            ops.mutable.push(id, workingState[this.arrName]);
            ops.mutable.set(id, finalEntry, workingState[this.mapName]);
            indexToPush.forEach(([attr, value]) => {
                const attrIndex = workingState.indexes[attr];
                if (attrIndex.hasOwnProperty(value)) {
                    ops.mutable.push(id, attrIndex[value]);
                } else {
                    ops.mutable.set(value, [id], attrIndex);
                }
            });
            return {
                state: workingState,
                created: finalEntry,
            };
        }

        const nextIndexes = ops.batch.merge(
            batchToken,
            indexToPush.reduce((indexMap, [attr, value]) => {
                const attrIndex = workingState.indexes[attr];
                indexMap[attr] = {};
                if (attrIndex.hasOwnProperty(value)) {
                    indexMap[attr][value] = ops.batch.push(batchToken, id, attrIndex[value]);
                } else {
                    indexMap[attr] = ops.batch.merge(batchToken, {
                        [value]: [id],
                    }, attrIndex);
                }
                return indexMap;
            }, {}),
            workingState.indexes
        );

        const nextState = ops.batch.merge(batchToken, {
            [this.arrName]: ops.batch.push(batchToken, id, workingState[this.arrName]),
            [this.mapName]: ops.batch.merge(batchToken, {
                [id]: finalEntry,
            }, workingState[this.mapName]),
            indexes: nextIndexes,
        }, workingState);

        return {
            state: nextState,
            created: finalEntry,
        };
    }

    /**
     * Returns the data structure with objects where `rows`
     * are merged with `mergeObj`.
     *
     * @param  {Object} tx - transaction info
     * @param  {Object} branch - the data structure state
     * @param  {Object[]} rows - rows to update
     * @param  {Object} mergeObj - The object to merge with each row.
     * @return {Object}
     */
    update(tx, branch, rows, mergeObj) {
        const { batchToken, withMutations } = tx;

        const {
            mapName,
        } = this;

        const mapFunction = (row) => {
            const merge = withMutations ? ops.mutable.merge : ops.batch.merge(batchToken);
            return merge(mergeObj, row);
        };

        const set = withMutations ? ops.mutable.set : ops.batch.set(batchToken);

        const newMap = rows.reduce((map, row) => {
            const result = mapFunction(row);
            return set(result[this.idAttribute], result, map);
        }, branch[mapName]);
        return ops.batch.set(batchToken, mapName, newMap, branch);
    }

    /**
     * Returns the data structure without rows `rows`.
     * @param  {Object} tx - transaction info
     * @param  {Object} branch - the data structure state
     * @param  {Object[]} rows - rows to update
     * @return {Object} the data structure without ids in `idsToDelete`.
     */
    delete(tx, branch, rows) {
        const { batchToken, withMutations } = tx;

        const { arrName, mapName } = this;
        const arr = branch[arrName];

        const idsToDelete = rows.map(row => row[this.idAttribute]);
        if (withMutations) {
            idsToDelete.forEach((id) => {
                const idx = arr.indexOf(id);
                if (idx !== -1) {
                    ops.mutable.splice(idx, 1, [], arr);
                }

                ops.mutable.omit(id, branch[mapName]);
            });
            return branch;
        }

        return ops.batch.merge(batchToken, {
            [arrName]: ops.batch.filter(
                batchToken,
                id => !idsToDelete.includes(id),
                branch[arrName]
            ),
            [mapName]: ops.batch.omit(
                batchToken,
                idsToDelete,
                branch[mapName]
            ),
        }, branch);
    }
};

export default Table;
