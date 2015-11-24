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
     * @param  {EntityManager} manager - used to keep an internal reference
     *                                   to the EntityManager in use.
     * @param  {number[]} idArr - an array of the id's this QuerySet includes.
     * @param {Object} [opts] - additional options
     */
    constructor(manager, idArr, opts) {
        Object.assign(this, {
            manager,
            idArr,
        }, opts);

        // For convenience.
        this.schema = manager.schema;
    }

    _new(ids) {
        return new this.constructor(this.manager, ids);
    }

    /**
     * Returns an array of the plain entity objects represented by the QuerySet.
     * The `idAttribute` of the entities is included with each entity.
     * @return {Object[]}
     */
    getPlainEntities() {
        return this.idArr.map(id => {
            return this.manager.getPlainEntity(id, true);
        });
    }

    /**
     * Returns the number of entities represented by the QuerySet.
     * @return {number} length of the QuerySet
     */
    count() {
        return this.idArr.length;
    }

    /**
     * Checks if QuerySet has any entities.
     * @return {Boolean} `true` if QuerySet contains entities, else `false`.
     */
    exists() {
        return Boolean(this.count());
    }

    _getEntity(entity) {
        const EntityClass = this.constructor.entityClass;
        return new EntityClass(this.manager, entity);
    }

    /**
     * Returns the Entity instance at index `index` in the QuerySet.
     * @param  {number} index - index of the entity to get
     * @return {Entity} an Entity instance at index `index` in the QuerySet
     */
    at(index) {
        return this.manager.get({[this.schema.idAttribute]: this.idArr[index]});
    }

    /**
     * Returns the Entity instance at index 0 in the QuerySet.
     * @return {Entity}
     */
    first() {
        return this.at(0);
    }

    /**
     * Returns the Entity instance at index `QuerySet.count() - 1`
     * @return {Entity}
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
     * @param  {Object} lookupObj - the properties to match entities with.
     * @return {QuerySet} a new {@link QuerySet} with entities that passed the filter.
     */
    filter(lookupObj) {
        const plainEntities = this.getPlainEntities();
        let entities;

        if (typeof lookupObj === 'function') {
            entities = plainEntities.filter(lookupObj);
        } else {
            entities = plainEntities.filter(entity => match(lookupObj, entity));
        }
        const newIdArr = entities.map(entity => entity[this.schema.idAttribute]);
        return this._new(newIdArr);
    }

    /**
     * Returns a new {@link QuerySet} with entities that do not match properties in `lookupObj`.
     *
     * @param  {Object} lookupObj - the properties to unmatch entities with.
     * @return {QuerySet} a new {@link QuerySet} with entities that passed the filter.
     */
    exclude(lookupObj) {
        const entities = reject(this.getPlainEntities(), entity => match(lookupObj, entity));
        return this._new(entities.map(entity => entity[this.schema.idAttribute]));
    }

    /**
     * Returns a new {@link QuerySet} with entities ordered by `fieldNames` in ascending
     * order.
     * @param  {string[]} fieldNames - the property names to order by.
     * @return {QuerySet} a new {@link QuerySet} with entities ordered by `fieldNames`.
     */
    orderBy(...fieldNames) {
        const entities = sortByAll(this.getPlainEntities(), fieldNames);
        return this._new(entities.map(entity => entity[this.manager.getIdAttribute()]));
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
        this.manager.mutations.push({
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
        this.manager.mutations.push({
            type: DELETE,
            payload: this.idArr,
        });
    }
};

QuerySet.prototype.sharedMethods = [
    'getPlainEntities',
    'count',
    'exists',
    'at',
    'first',
    'last',
    'all',
    'filter',
    'exclude',
    'orderBy',
    'update',
    'delete',
];

export default QuerySet;
