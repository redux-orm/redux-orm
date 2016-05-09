import find from 'lodash/find';
import omit from 'lodash/omit';
import {ListIterator, objectDiff} from './utils';
import getImmutableOps from 'immutable-ops';

/**
 * Handles the underlying data structure for a {@link Model} class.
 */
const Backend = class Backend {
    /**
     * Creates a new {@link Backend} instance.
     * @param  {Object} userOpts - options to use.
     * @param  {string} [userOpts.idAttribute=id] - the id attribute of the entity.
     * @param  {Boolean} [userOpts.indexById=true] - a boolean indicating if the entities
     *                                               should be indexed by `idAttribute`.
     * @param  {string} [userOpts.arrName=items] - the state attribute where an array of
     *                                             either entity id's (if `indexById === true`)
     *                                             or the entity objects are stored.
     * @param  {string} [userOpts.mapName=itemsById] - if `indexById === true`, the state
     *                                                 attribute where the entity objects
     *                                                 are stored in a id to entity object
     *                                                 map.
     * @param  {Boolean} [userOpts.withMutations=false] - a boolean indicating if the backend
     *                                                    operations should be executed
     *                                                    with or without mutations.
     */
    constructor(userOpts) {
        const defaultOpts = {
            idAttribute: 'id',
            indexById: true,
            arrName: 'items',
            mapName: 'itemsById',
            withMutations: false,
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
        if (this.indexById) {
            return branch[this.mapName][id];
        }
        return find(branch[this.arrName], {[this.idAttribute]: id});
    }

    accessIdList(branch) {
        return branch[this.arrName];
    }

    getOps(tx) {
        if (!tx) {
            return getImmutableOps();
        }
        if (!tx.meta.hasOwnProperty('ops')) {
            tx.meta.ops = getImmutableOps();
            tx.meta.ops.open();
            tx.onClose(_tx => {
                _tx.meta.ops.close();
            });
        }
        return tx.meta.ops;
    }

    /**
     * Returns a {@link ListIterator} instance for
     * the list of objects in `branch`.
     *
     * @param  {Object} branch - the model's state branch
     * @return {ListIterator} An iterator that loops through the objects in `branch`
     */
    iterator(branch) {
        if (this.indexById) {
            return new ListIterator(branch[this.arrName], 0, (list, idx) => branch[this.mapName][list[idx]]);
        }

        return new ListIterator(branch[this.arrName], 0);
    }

    accessList(branch) {
        return branch[this.arrName].map(id => {
            const obj = this.accessId(branch, id);
            return Object.assign({[this.idAttribute]: id}, obj);
        });
    }

    /**
     * Returns the default state for the data structure.
     * @return {Object} The default state for this {@link Backend} instance's data structure
     */
    getDefaultState() {
        if (this.indexById) {
            return {
                [this.arrName]: [],
                [this.mapName]: {},
            };
        }

        return {
            [this.arrName]: [],
        };
    }

    /**
     * Returns the data structure including a new object `entry`
     * @param  {Object} session - the current Session instance
     * @param  {Object} branch - the data structure state
     * @param  {Object} entry - the object to insert
     * @return {Object} the data structure including `entry`.
     */
    insert(tx, branch, entry) {
        const ops = this.getOps(tx);
        if (this.indexById) {
            const id = entry[this.idAttribute];

            if (this.withMutations) {
                branch[this.arrName].push(id);
                branch[this.mapName][id] = entry;
                return branch;
            }

            return {
                [this.arrName]: ops.push(id, branch[this.arrName]),
                [this.mapName]: ops.merge({[id]: entry}, branch[this.mapName]),
            };
        }

        if (this.withMutations) {
            branch[this.arrName].push(entry);
            return branch;
        }

        return {
            [this.arrName]: ops.push(entry, branch[this.arrName]),
        };
    }

    /**
     * Returns the data structure with objects where id in `idArr`
     * are merged with `mergeObj`.
     *
     * @param  {Object} session - the current Session instance
     * @param  {Object} branch - the data structure state
     * @param  {Array} idArr - the id's of the objects to update
     * @param  {Object} mergeObj - The object to merge with objects
     *                             where their id is in `idArr`.
     * @return {Object} the data structure with objects with their id in `idArr` updated with `mergeObj`.
     */
    update(tx, branch, idArr, mergeObj) {
        const ops = this.getOps(tx);
        const returnBranch = this.withMutations ? branch : {};

        const {
            arrName,
            mapName,
            idAttribute,
        } = this;

        const mapFunction = entity => {
            const assignTo = this.withMutations ? entity : {};
            const merge = this.withMutations ? ops.mutable.merge : ops.merge;
            return merge([entity, mergeObj], assignTo);
        };

        if (this.indexById) {
            if (!this.withMutations) {
                returnBranch[mapName] = Object.assign({}, branch[mapName]);
                returnBranch[arrName] = branch[arrName];
            }

            const updatedMap = idArr.reduce((map, id) => {
                const result = mapFunction(branch[mapName][id]);
                if (result !== branch[mapName][id]) map[id] = result;
                return map;
            }, {});

            returnBranch[mapName] = ops.merge(updatedMap, returnBranch[mapName]);
            return returnBranch;
        }

        let updated = false;
        returnBranch[arrName] = branch[arrName].map(entity => {
            if (idArr.includes(entity[idAttribute])) {
                const result = mapFunction(entity);
                if (entity !== result) {
                    updated = true;
                }
                return mapFunction(entity);
            }
            return entity;
        });
        return updated ? returnBranch : branch;
    }

    /**
     * Returns the data structure without objects with their id included in `idsToDelete`.
     * @param  {Object} session - the current Session instance
     * @param  {Object} branch - the data structure state
     * @param  {Array} idsToDelete - the ids to delete from the data structure
     * @return {Object} the data structure without ids in `idsToDelete`.
     */
    delete(tx, branch, idsToDelete) {
        const ops = this.getOps(tx);

        const { arrName, mapName, idAttribute } = this;
        const arr = branch[arrName];

        if (this.indexById) {
            if (this.withMutations) {
                idsToDelete.forEach(id => {
                    const idx = arr.indexOf(id);
                    if (idx !== -1) {
                        ops.mutable.splice(idx, 1, [], arr);
                    }
                    ops.mutable.omit(id, branch[mapName]);
                });
                return branch;
            }
            return {
                [arrName]: ops.filter(id => !idsToDelete.includes(id), branch[arrName]),
                [mapName]: ops.omit(idsToDelete, branch[mapName]),
            };
        }

        if (this.withMutations) {
            idsToDelete.forEach(id => {
                const idx = arr.indexOf(id);
                if (idx === -1) {
                    ops.mutable.splice(idx, 1, [], arr);
                }
            });
            return branch;
        }

        return {
            [arrName]: ops.filter(entity => !idsToDelete.includes(entity[idAttribute]), arr),
        };
    }
};

export default Backend;
