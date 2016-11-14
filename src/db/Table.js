import reject from 'lodash/reject';
import filter from 'lodash/filter';
import orderBy from 'lodash/orderBy';
import ops from 'immutable-ops';

import { FILTER, EXCLUDE, ORDER_BY } from '../constants';
import { ListIterator, includes } from '../utils';

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
     */
    constructor(userOpts) {
        const defaultOpts = {
            idAttribute: 'id',
            arrName: 'items',
            mapName: 'itemsById',
        };

        Object.assign(this, defaultOpts, userOpts);
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

    accessIdList(branch) {
        return branch[this.arrName];
    }

    /**
     * Returns a {@link ListIterator} instance for
     * the list of objects in `branch`.
     *
     * @param  {Object} branch - the model's state branch
     * @return {ListIterator} An iterator that loops through the objects in `branch`
     */
    iterator(branch) {
        return new ListIterator(
            branch[this.arrName],
            0,
            (list, idx) => branch[this.mapName][list[idx]]
        );
    }

    accessList(branch) {
        return branch[this.arrName].map(id => {
            const obj = this.accessId(branch, id);
            return Object.assign({ [this.idAttribute]: id }, obj);
        });
    }

    query(branch, predicates) {
        return predicates.reduce((idArr, { type, payload }) => {
            const entities = idArr.map(id => this.accessId(branch, id));
            switch (type) {
            case FILTER:
                return filter(entities, payload).map(obj => obj[this.idAttribute]);
            case EXCLUDE:
                return reject(entities, payload).map(obj => obj[this.idAttribute]);
            case ORDER_BY: {
                const [iteratees, orders] = payload;
                return orderBy(entities, iteratees, orders).map(obj => obj[this.idAttribute]);
            }
            default:
                return idArr;
            }
        }, this.accessIdList(branch));
    }

    /**
     * Returns the default state for the data structure.
     * @return {Object} The default state for this {@link Backend} instance's data structure
     */
    getDefaultState() {
        return {
            [this.arrName]: [],
            [this.mapName]: {},
            meta: {},
        };
    }

    setMeta(tx, branch, key, value) {
        const { batchToken, withMutations } = tx;
        if (withMutations) {
            return ops.mutable.setIn(['meta', key], value, branch);
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
     * @return {Object} the data structure including `entry`.
     */
    insert(tx, branch, entry) {
        const { batchToken, withMutations } = tx;
        const id = entry[this.idAttribute];

        if (withMutations) {
            ops.mutable.push(id, branch[this.arrName]);
            ops.mutable.set(id, entry, branch[this.mapName]);
            return branch;
        }


        return ops.batch.merge(batchToken, {
            [this.arrName]: ops.batch.push(batchToken, id, branch[this.arrName]),
            [this.mapName]: ops.batch.merge(batchToken, { [id]: entry }, branch[this.mapName]),
        }, branch);
    }

    /**
     * Returns the data structure with objects where id in `idArr`
     * are merged with `mergeObj`.
     *
     * @param  {Object} tx - transaction info
     * @param  {Object} branch - the data structure state
     * @param  {Array} idArr - the id's of the objects to update
     * @param  {Object} mergeObj - The object to merge with objects
     *                             where their id is in `idArr`.
     * @return {Object} the data structure with objects with their id in `idArr` updated with `mergeObj`.
     */
    update(tx, branch, idArr, mergeObj) {
        const { batchToken, withMutations } = tx;

        const {
            mapName,
        } = this;

        const mapFunction = entity => {
            const merge = withMutations ? ops.mutable.merge : ops.batch.merge(batchToken);
            return merge(mergeObj, entity);
        };

        const set = withMutations ? ops.mutable.set : ops.batch.set(batchToken);

        const newMap = idArr.reduce((map, id) => {
            const result = mapFunction(branch[mapName][id]);
            return set(id, result, map);
        }, branch[mapName]);
        return ops.batch.set(batchToken, mapName, newMap, branch);
    }

    /**
     * Returns the data structure without objects with their id included in `idsToDelete`.
     * @param  {Object} tx - transaction info
     * @param  {Object} branch - the data structure state
     * @param  {Array} idsToDelete - the ids to delete from the data structure
     * @return {Object} the data structure without ids in `idsToDelete`.
     */
    delete(tx, branch, idsToDelete) {
        const { batchToken, withMutations } = tx;

        const { arrName, mapName } = this;
        const arr = branch[arrName];

        if (withMutations) {
            idsToDelete.forEach(id => {
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
                id => !includes(idsToDelete, id),
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
