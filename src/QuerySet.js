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
 * - records updates to objects with [update]{@link QuerySet#update} and [delete]{@link QuerySet#delete}
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
        if (opts && opts.hasOwnProperty('withRefs')) {
            this._withRefs = opts.withRefs;
        } else {
            this._withRefs = false;
        }
    }

    static addSharedMethod(methodName) {
        this.sharedMethods = this.sharedMethods.concat(methodName);
    }

    _new(ids, userOpts) {
        const opts = Object.assign({}, this._opts, userOpts);
        return new this.constructor(this.modelClass, ids, opts);
    }

    /**
     * Returns a new QuerySet representing the same entities
     * with the `withRefs` flag on.
     *
     * @return {QuerySet}
     */
    get withRefs() {
        if (!this._withRefs) {
            return this._new(this.idArr, {withRefs: true});
        }
        return this;
    }

    /**
     * Alias for withRefs
     * @return {QuerySet}
     */
    get ref() {
        return this.withRefs;
    }

    get withModels() {
        if (this._withRefs) {
            return this._new(this.idArr, {withRefs: false});
        }
        return this;
    }

    toString() {
        return 'QuerySet contents: \n    - ' + this.idArr.map(id => {
            return this.modelClass.withId(id).toString();
        }).join('\n    - ');
    }

    /**
     * Returns an array of the plain objects represented by the QuerySet.
     * The plain objects are direct references to the store.
     *
     * @return {Object[]} references to the plain JS objects represented by
     *                    the QuerySet
     */
    toRefArray() {
        return this.idArr.map(id => {
            return this.modelClass.accessId(id);
        });
    }

    /**
     * Returns an array of the Model instances represented by the QuerySet.
     * @return {Model[]} model instances represented by the QuerySet
     */
    toModelArray() {
        return this.idArr.map((_, idx) => {
            return this.at(idx);
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
     * Returns the {@link Model} instance at index `index` in the QuerySet if
     * `withRefs` flag is set to `false`, or a reference to the plain JavaScript
     * object in the model state if `true`.
     * @param  {number} index - index of the model instance to get
     * @return {Model|Object} a {@link Model} instance or a plain JavaScript
     *                        object at index `index` in the QuerySet
     */
    at(index) {
        if (this._withRefs) {
            return this.modelClass.accessId(this.idArr[index]);
        }
        return this.modelClass.withId(this.idArr[index]);
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
        const func = exclude ? reject : filter;
        let operationWithRefs = true;
        let entities;
        if (typeof lookupObj === 'function') {
            // For filtering with function,
            // use whatever object type
            // is flagged.
            if (this._withRefs) {
                entities = this.toRefArray();
            } else {
                entities = this.toModelArray();
                operationWithRefs = false;
            }
        } else {
            // Lodash filtering doesn't work with
            // Model instances.
            entities = this.toRefArray();
        }
        const filteredEntities = func(entities, lookupObj);
        const getIdFunc = operationWithRefs
            ? (obj) => obj[this.modelClass.idAttribute]
            : (obj) => obj.getId();

        const newIdArr = filteredEntities.map(getIdFunc);

        return this._new(newIdArr, {withRefs: false});
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
        const arr = this._withRefs
            ? this.toRefArray()
            : this.toModelArray();

        arr.forEach(func);
    }

    /**
     * Maps the {@link Model} instances in the {@link QuerySet}.
     * @param  {Function} func - the mapping function that takes one argument, a
     *                           {@link Model} instance or a reference to the plain
     *                           JavaScript object in the store, depending on the
     *                           QuerySet's `withRefs` flag.
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
    orderBy(iteratees, orders) {
        const entities = this.toRefArray();
        let iterateeArgs = iteratees;

        // Lodash only works on plain javascript objects.
        // If the argument is a function, and the `withRefs`
        // flag is false, the argument function is wrapped
        // to get the model instance and pass that as the argument
        // to the user-supplied function.
        if (!this._withRefs) {
            iterateeArgs = iteratees.map(arg => {
                if (typeof arg === 'function') {
                    return entity => {
                        const id = entity[this.modelClass.idAttribute];
                        const instance = this.modelClass.withId(id);
                        return arg(instance);
                    };
                }
                return arg;
            });
        }
        const sortedEntities = sortByOrder.call(null, entities, iterateeArgs, orders);
        return this._new(sortedEntities.map(entity => entity[this.modelClass.idAttribute]));
    }

    /**
     * Records a update specified with `updater` to all the objects in the {@link QuerySet}.
     * @param  {Object|function} updater - an object to merge with all the objects in this
     *                                     queryset, or a mapper function that takes the
     *                                     object as an argument and returns an updated
     *                                     object.
     * @return {undefined}
     */
    update(updater) {
        this.modelClass.addUpdate({
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
        this.modelClass.addUpdate({
            type: DELETE,
            payload: this.idArr,
        });

        this.withModels.forEach(model => model._onDelete());
    }
};

QuerySet.sharedMethods = [
    'count',
    'at',
    'all',
    'last',
    'first',
    'forEach',
    'exists',
    'filter',
    'map',
    'exclude',
    'orderBy',
    'update',
    'delete',
    'ref',
    'withRefs',
    'withModels',
];

export default QuerySet;
