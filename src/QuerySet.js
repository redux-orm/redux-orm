import reject from 'lodash/collection/reject';
import filter from 'lodash/collection/filter';
import sortByOrder from 'lodash/collection/sortByOrder';

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
        });

        this._opts = opts;

        // A flag that tells if the user wants
        // the result in plain javascript objects
        // or {@link Model} instances.
        // Results are plain objects by default.
        if (opts && opts.hasOwnProperty('plain')) {
            this._plain = opts.plain;
        } else {
            this._plain = false;
        }
    }

    static addSharedMethod(methodName) {
        this.sharedMethods = this.sharedMethods.concat(methodName);
    }

    _new(ids) {
        const plain = this._plain;
        const opts = Object.assign({}, this._opts, {plain});
        return new this.constructor(this.modelClass, ids, opts);
    }

    get plain() {
        this._plain = true;
        return this;
    }

    get models() {
        this._plain = false;
        return this;
    }

    toString() {
        return 'QuerySet contents: \n    - ' + this.idArr.map(id => {
            return this.modelClass.withId(id).toString();
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
        if (this._plain) {
            return this.modelClass.accessId(this.idArr[index]);
        }
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
     * Returns all objects in this QuerySet. If the plain flag
     * is on (default), this will be a list of ordinary JavaScript objects.
     * If it is off, these will be Model instances.
     *
     * @return {Array} An array of either JavaScript objects or Model instances.
     */
    objects() {
        return this.idArr.map((_, idx) => this.at(idx));
    }

    /**
     * Returns a new {@link QuerySet} with objects that match properties in `lookupObj`.
     *
     * @param  {Object} lookupObj - the properties to match objects with.
     * @return {QuerySet} a new {@link QuerySet} with objects that passed the filter.
     */
    filter(lookupObj) {
        return this._filterOrExclude(lookupObj, false);
    }

    /**
     * Returns a new {@link QuerySet} with objects that do not match properties in `lookupObj`.
     *
     * @param  {Object} lookupObj - the properties to unmatch objects with.
     * @return {QuerySet} a new {@link QuerySet} with objects that passed the filter.
     */
    exclude(lookupObj) {
        return this._filterOrExclude(lookupObj, true);
    }

    _filterOrExclude(lookupObj, exclude) {
        const startPlainFlag = this._plain;
        const func = exclude ? reject : filter;
        let entities;
        if (typeof lookupObj === 'function') {
            // For filtering with function,
            // use whatever object type
            // is flagged.
            entities = this.objects();
        } else {
            // Lodash filtering doesn't work with
            // Model instances.
            entities = this.plain.objects();

            // Return flag to original value.
            this._plain = startPlainFlag;
        }
        const filteredEntities = func(entities, lookupObj);

        const getIdFunc = this._plain
            ? (obj) => obj[this.modelClass.idAttribute]
            : (obj) => obj.getId();

        const newIdArr = filteredEntities.map(getIdFunc);
        return this._new(newIdArr);
    }

    /**
     * Calls `func` for each object in the QuerySet.
     * The object is either a reference to the plain
     * object in the database or a Model instance, depending
     * on the flag.
     *
     * @param  {Function} func - the function to call with each object
     * @return {undefined}
     */
    forEach(func) {
        this.objects().forEach(func);
    }

    /**
     * Maps the {@link Model} instances in the {@link QuerySet}.
     * @param  {Function} func - the mapping function that takes one argument, a
     *                           {@link Model} instance.
     * @return {Array}  the mapped array
     */
    map(func) {
        return this.idArr.map((_, idx) => {
            return func(this.at(idx));
        });
    }

    /**
     * Returns a new {@link QuerySet} with objects ordered by `fieldNames` in ascending
     * order.
     * @param  {string[]} fieldNames - the property names to order by.
     * @return {QuerySet} a new {@link QuerySet} with objects ordered by `fieldNames`.
     */
    orderBy(args) {
        const entities = sortByOrder.apply([this.objects()].concat(args));
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
