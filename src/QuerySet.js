import reject from 'lodash/collection/reject';
import sortByAll from 'lodash/collection/sortByAll';
import {match} from './utils.js';
import {
    UPDATE,
    DELETE,
} from './constants.js';

/**
 * A chainable class that keeps track of a list of entities and
 *
 * - returns a subset clone of itself with [filter]{@link QuerySet#filter} and [exclude]{@link QuerySet#exclude}
 * - records mutations to entities with [update]{@link QuerySet#update} and [delete]{@link QuerySet#delete}
 *
 */
const QuerySet = class QuerySet {
    /**
     * Creates a QuerySet.
     * @param  {Manager} manager - used to keep an internal reference
     *                             to the Manager in use.
     * @param  {number[]} idArr - an array of the id's this QuerySet includes.
     * @param {Object} [opts] - additional options
     */
    constructor(manager, idArr, opts) {
        Object.assign(this, {
            manager,
            idArr,
        }, opts);
    }

    _new(ids) {
        return new this.constructor(this.manager, ids);
    }

    toString() {
        return 'QuerySet contents: \n    - ' + this.idArr.map(id => {
            return this.manager.getWithId(id).toString();
        }).join('\n    - ');
    }

    /**
     * Returns an array of the plain objects represented by the QuerySet.
     * @return {Object[]}
     */
    toPlain() {
        return this.idArr.map(id => {
            return this.manager.getPlain(id);
        });
    }

    /**
     * Returns the number of model instances represented by the QuerySet.
     * @return {number} length of the QuerySet
     */
    count() {
        return this.idArr.length;
    }

    /**
     * Checks if QuerySet has any objects.
     * @return {Boolean} `true` if QuerySet contains entities, else `false`.
     */
    exists() {
        return Boolean(this.count());
    }

    /**
     * Returns the {@link Model} instance at index `index` in the QuerySet.
     * @param  {number} index - index of the model instance to get
     * @return {Model} an {@link Model} instance at index `index` in the QuerySet
     */
    at(index) {
        return this.manager.get({[this.manager.model.idAttribute]: this.idArr[index]});
    }

    /**
     * Returns the {@link Model} instance at index 0 in the QuerySet.
     * @return {Model}
     */
    first() {
        return this.at(0);
    }

    /**
     * Returns the {@link Model} instance at index `QuerySet.count() - 1`
     * @return {Model}
     */
    last() {
        return this.at(this.idArr.length - 1);
    }

    /**
     * Returns a new QuerySet with the same entities.
     * @return {QuerySet} a new QuerySet with the same entities.
     */
    all() {
        return this._new(this.idArr);
    }

    /**
     * Returns a new {@link QuerySet} with entities that match properties in `lookupObj`.
     *
     * @param  {Object} lookupObj - the properties to match objects with.
     * @return {QuerySet} a new {@link QuerySet} with entities that passed the filter.
     */
    filter(lookupObj) {
        const plainEntities = this.toPlain();
        let entities;

        if (typeof lookupObj === 'function') {
            entities = plainEntities.filter(lookupObj);
        } else {
            entities = plainEntities.filter(entity => match(lookupObj, entity));
        }
        const newIdArr = entities.map(entity => entity[this.manager.model.idAttribute]);
        return this._new(newIdArr);
    }

    /**
     * Returns a new {@link QuerySet} with entities that do not match properties in `lookupObj`.
     *
     * @param  {Object} lookupObj - the properties to unmatch entities with.
     * @return {QuerySet} a new {@link QuerySet} with entities that passed the filter.
     */
    exclude(lookupObj) {
        const entities = reject(this.toPlain(), entity => match(lookupObj, entity));
        return this._new(entities.map(entity => entity[this.manager.model.idAttribute]));
    }

    /**
     * Returns a new {@link QuerySet} with entities ordered by `fieldNames` in ascending
     * order.
     * @param  {string[]} fieldNames - the property names to order by.
     * @return {QuerySet} a new {@link QuerySet} with entities ordered by `fieldNames`.
     */
    orderBy(...fieldNames) {
        const entities = sortByAll(this.toPlain(), fieldNames);
        return this._new(entities.map(entity => entity[this.manager.model.idAttribute]));
    }

    /**
     * Records a mutation specified with `updater` to all the entities in the {@link QuerySet}.
     * @param  {Object|function} updater - an object to merge with all the entities in this
     *                                     queryset, or a mapper function that takes the
     *                                     entity as an argument and returns an updated
     *                                     entity.
     * @return {undefined}
     */
    update(updater) {
        this.manager.model.addMutation({
            type: UPDATE,
            payload: {
                idArr: this.idArr,
                updater,
            },
        });
    }

    /**
     * Records a deletion of all the entities in this {@link QuerySet}.
     * @return {undefined}
     */
    delete() {
        this.manager.model.addMutation({
            type: DELETE,
            payload: this.idArr,
        });
    }
};

// Override if needed.
QuerySet.prototype.defaultSharedMethodNames = [
    'toPlain',
    'count',
    'exists',
    'at',
    'first',
    'last',
    'filter',
    'exclude',
    'orderBy',
    'update',
    'delete',
];

// You can set additional shared methods with this.
// They will be callable from the manager.
QuerySet.prototype.sharedMethodNames = [];

export default QuerySet;
