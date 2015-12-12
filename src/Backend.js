import find from 'lodash/collection/find';
import sortByOrder from 'lodash/collection/sortByOrder';
import omit from 'lodash/object/omit';
import {ListIterator} from './utils';

/**
 * Handles the underlying data structure for a {@link Model} class.
 * Implements the "database backend" functionality.
 */
const Backend = class Backend {
    /**
     * Creates a new {@link Backend} instance.
     * @param  {Object} userOpts - options to use. Must have a non-empty `name` property.
     */
    constructor(userOpts) {
        const defaultOpts = {
            branchName: null,
            idAttribute: 'id',
            indexById: true,
            ordered: true,
            arrName: 'items',
            mapName: 'itemsById',
        };

        if (typeof userOpts.branchName === 'undefined') {
            throw Error(`Backend got an undefined branchName - did you
                        declare modelName on your Model class?'`);
        }

        Object.assign(this, defaultOpts, userOpts);
    }

    /**
     * Returns a reference to the object at index `id`
     * in state `branch`.
     *
     * @param  {Object} branch - the state
     * @param  {Number} id - the id of the object to get
     * @return {Object} A reference to the raw object in the state.
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
     * Returns the data structure with objects in ascending order.
     * This function uses the `lodash `[sortByOrder](https://lodash.com/docs#sortByOrder)
     * internally, so you can supply it the same `iteratees` and `orders`
     * arguments. Please read there for the full docs.
     *
     * @param  {Object} branch - the state of the data structure
     * @param  {Function[]|Object[]|string[]} iteratees - the iteratees to sort by
     * @param  {string[]} orders - the sort orders of `iteratees`
     * @return {Object} the data structure ordered with the arguments.
     */
    order(branch, iteratees, orders) {
        const thisBackend = this;
        const {arrName, mapName} = this;

        if (this.indexById) {
            // TODO: we don't need to build a full list to sort,
            // but it's convenient for direct use of lodash.
            // By implementing our own sorting, this could be more performant.
            const fullList = this.accessList(branch);
            const orderedObjects = sortByOrder(fullList, iteratees, orders);
            return {
                [arrName]: orderedObjects.map(obj => obj[thisBackend.idAttribute]),
                [mapName]: branch[mapName],
            };
        }

        return {
            [arrName]: sortByOrder(branch[arrName], iteratees, orders),
        };
    }

    /**
     * Returns the data structure including a new object `entry`
     * @param  {Object} branch - the data structure state
     * @param  {Object} entry - the object to insert
     * @return {Object} the data structure including `entry`.
     */
    insert(branch, entry) {
        if (this.indexById) {
            const id = entry[this.idAttribute];
            return {
                [this.arrName]: branch[this.arrName].concat(id),
                [this.mapName]: Object.assign({}, branch[this.mapName], {[id]: entry}),
            };
        }

        return {
            [this.arrName]: branch[this.arrName].concat(entry),
        };
    }

    /**
     * Returns the data structure with objects where id in `idArr`
     * are:
     *
     * 1. merged with `patcher`, if `patcher` is an object.
     * 2. mapped with `patcher`, if `patcher` is a function.
     *
     * @param  {Object} branch - the data structure state
     * @param  {Array} idArr - the id's of the objects to update
     * @param  {Object|Function} patcher - If an object, the object to merge with objects
     *                                     where their id is in `idArr`. If a function,
     *                                     the mapping function for the objects in the
     *                                     data structure.
     * @return {Object} the data structure with objects with their id in `idArr` updated with `patcher`.
     */
    update(branch, idArr, patcher) {
        const {
            arrName,
            mapName,
            idAttribute,
        } = this;

        let mapFunction;
        if (typeof patcher === 'function') {
            mapFunction = patcher;
        } else {
            mapFunction = (entity) => Object.assign({}, entity, patcher);
        }

        if (this.indexById) {
            const updatedMap = {};
            idArr.reduce((map, id) => {
                map[id] = mapFunction(branch[mapName][id]);
                return map;
            }, updatedMap);

            return {
                [arrName]: branch[arrName],
                [mapName]: Object.assign({}, branch[mapName], updatedMap),
            };
        }

        const arrShallowCopy = branch[arrName].slice();

        return {
            [arrName]: arrShallowCopy.map(entity => {
                if (idArr.includes(entity[idAttribute])) {
                    return mapFunction(entity);
                }
                return entity;
            }),
        };
    }

    /**
     * Returns the data structure without objects with their id included in `idsToDelete`.
     * @param  {Object} branch - the data structure state
     * @param  {Array} idsToDelete - the ids to delete from the data structure
     * @return {Object} the data structure without ids in `idsToDelete`.
     */
    delete(branch, idsToDelete) {
        const {arrName, mapName, idAttribute} = this;
        if (this.indexById) {
            return {
                [arrName]: branch[arrName].filter(id => !idsToDelete.includes(id)),
                [mapName]: omit(branch[mapName], idsToDelete),
            };
        }

        return {
            [arrName]: branch[arrName].filter(entity => !idsToDelete.includes(entity[idAttribute])),
        };
    }
};

export {Backend};
export default Backend;
