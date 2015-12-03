import reject from 'lodash/collection/reject';
import sortByAll from 'lodash/collection/sortByAll';
import {match} from './utils.js';
import {
    UPDATE,
    DELETE,
} from './constants.js';

/**
 * A chainable class that keeps track of a list of objects and
 *
 * - returns a subset clone of itself with [filter]{@link QuerySet#filter} and [exclude]{@link QuerySet#exclude}
 * - records mutations to objects with [update]{@link QuerySet#update} and [delete]{@link QuerySet#delete}
 *
 */
const QuerySet = class QuerySet {
    /**
     * Creates a QuerySet.
     * @param  {Model} modelClass - the model class of objects in this QuerySet.
     * @param  {number[]} idArr - an array of the id's this QuerySet includes.
     * @param {Object} [opts] - additional options
     */
    constructor(modelClass, idArr, opts) {
        Object.assign(this, {
            modelClass,
            idArr,
        }, opts);
    }

    _new(ids) {
        return new this.constructor(this.modelClass, ids);
    }

    toString() {
        return 'QuerySet contents: \n    - ' + this.idArr.map(id => {
            return this.modelClass.getWithId(id).toString();
        }).join('\n    - ');
    }

    /**
     * Returns an array of the plain objects represented by the QuerySet.
     * @return {Object[]}
     */
    toPlain() {
        return this.idArr.map(id => {
            return this.modelClass.accessId(id);
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
        return this.modelClass.get({[this.modelClass.idAttribute]: this.idArr[index]});
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
     * Returns a new QuerySet with the same objects.
     * @return {QuerySet} a new QuerySet with the same objects.
     */
    all() {
        return this._new(this.idArr);
    }

    /**
     * Returns a new {@link QuerySet} with objects that match properties in `lookupObj`.
     *
     * @param  {Object} lookupObj - the properties to match objects with.
     * @return {QuerySet} a new {@link QuerySet} with objects that passed the filter.
     */
    filter(lookupObj) {
        const plainEntities = this.toPlain();
        let entities;

        if (typeof lookupObj === 'function') {
            entities = plainEntities.filter(lookupObj);
        } else {
            entities = plainEntities.filter(entity => match(lookupObj, entity));
        }
        const newIdArr = entities.map(entity => entity[this.modelClass.idAttribute]);
        return this._new(newIdArr);
    }

    /**
     * Maps the {@link Model} instances in the {@link QuerySet}.
     * @param  {Function} func - the mapping function that takes one argument, a
     *                           {@link Model} instance.
     * @return {Array}  the mapped array
     */
    map(func) {
        return this.idArr.map(id => {
            return func(this.modelClass.getWithId(id));
        });
    }

    /**
     * Returns a new {@link QuerySet} with objects that do not match properties in `lookupObj`.
     *
     * @param  {Object} lookupObj - the properties to unmatch objects with.
     * @return {QuerySet} a new {@link QuerySet} with objects that passed the filter.
     */
    exclude(lookupObj) {
        const entities = reject(this.toPlain(), entity => match(lookupObj, entity));
        return this._new(entities.map(entity => entity[this.modelClass.idAttribute]));
    }

    /**
     * Returns a new {@link QuerySet} with objects ordered by `fieldNames` in ascending
     * order.
     * @param  {string[]} fieldNames - the property names to order by.
     * @return {QuerySet} a new {@link QuerySet} with objects ordered by `fieldNames`.
     */
    orderBy(...fieldNames) {
        const entities = sortByAll(this.toPlain(), fieldNames);
        return this._new(entities.map(entity => entity[this.modelClass.idAttribute]));
    }

    /**
     * Records a mutation specified with `updater` to all the objects in the {@link QuerySet}.
     * @param  {Object|function} updater - an object to merge with all the objects in this
     *                                     queryset, or a mapper function that takes the
     *                                     object as an argument and returns an updated
     *                                     object.
     * @return {undefined}
     */
    update(updater) {
        this.modelClass.addMutation({
            type: UPDATE,
            payload: {
                idArr: this.idArr,
                updater,
            },
        });
    }

    /**
     * Records a deletion of all the objects in this {@link QuerySet}.
     * @return {undefined}
     */
    delete() {
        this.modelClass.addMutation({
            type: DELETE,
            payload: this.idArr,
        });
    }
};

QuerySet.sharedMethods = [
    'toPlain',
    'count',
    'at',
    'all',
    'last',
    'first',
    'exists',
    'filter',
    'map',
    'exclude',
    'orderBy',
    'update',
    'delete',
];

export default QuerySet;
