import find from 'lodash/collection/find';
import sortBy from 'lodash/collection/sortBy';
import omit from 'lodash/object/omit';
import {ListIterator} from './utils';

/**
 * Handles metadata for a {@link Model}.
 * If you want to override the underlying
 * datastructure, subclass this.
 */
const Meta = class Meta {
    /**
     * Creates a new {@link Meta} instance.
     * @param  {Object} userOpts - options to use. Must have a non-empty `name` property.
     */
    constructor(userOpts) {
        const defaultOpts = {
            name: null,
            idAttribute: 'id',
            branchName: null,
            indexById: true,
            ordered: true,
            arrName: 'items',
            mapName: 'itemsById',
        };

        if (!userOpts.name) {
            throw new Error('You must give a name for the Model in getMeta.');
        }

        if (!userOpts.branchName) {
            userOpts.branchName = userOpts.name;
        }

        userOpts._name = userOpts.name;
        delete userOpts.name;

        Object.assign(this, defaultOpts, userOpts);
    }

    get name() {
        return this._name;
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

    getDefaultState() {
        if (this.indexById) {
            return {
                [this.arrName]: [],
                [this.mapName]: {

                },
            };
        }

        return {
            [this.arrName]: [],
        };
    }

    order(branch, comparator) {
        const thisMeta = this;
        const {arrName, mapName} = this;

        // Wrap comparator to access the full object if the model
        // is indexed.
        function wrappedComparator(id) {
            return comparator(thisMeta.accessId(branch, id));
        }

        if (this.indexById) {
            const orderedIds = sortBy(branch[arrName], wrappedComparator);
            return {
                [arrName]: orderedIds,
                [mapName]: branch[mapName],
            };
        }
        return {
            [arrName]: sortBy(branch[arrName], comparator),
        };
    }

    insert(branch, entry) {
        if (this.indexById) {
            const id = entry[this.idAttribute];
            return {
                [this.arrName]: [...branch[this.arrName], id],
                [this.mapName]: {
                    ...branch[this.mapName],
                    [id]: entry,
                },
            };
        }

        return {
            [this.arrName]: [...branch[this.arrName], entry],
        };
    }

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
                [mapName]: {
                    ...branch[mapName],
                    ...updatedMap,
                },
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

    delete(branch, idsToDelete) {
        const {arrName, mapName, idAttribute} = this;
        if (this.indexById) {
            return {
                [arrName]: branch[arrName].filter(id => !idsToDelete.includes(id)),
                [mapName]: omit(branch[mapName], ...idsToDelete),
            };
        }

        return {
            [arrName]: branch[arrName].filter(entity => !idsToDelete.includes(entity[idAttribute])),
        };
    }
};

export default Meta;
