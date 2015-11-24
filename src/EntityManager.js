import omit from 'lodash/object/omit';
import find from 'lodash/collection/find';
import sortByAll from 'lodash/collection/sortByAll';

import QuerySet from './QuerySet';
import Entity from './Entity';
import {
    CREATE,
    UPDATE,
    DELETE,
    ORDER,
} from './constants';
import {match} from './utils.js';

/**
 * A class that manages an entity tree branch.
 *
 * The manager shares the following methods with {@link QuerySet}:
 *
 * - [getPlainEntities]{@link QuerySet#getPlainEntities}
 * - [all]{@link QuerySet#all}
 * - [filter]{@link QuerySet#filter}
 * - [exclude]{@link QuerySet#exclude}
 * - [exists]{@link QuerySet#exists}
 * - [first]{@link QuerySet#first}
 * - [last]{@link QuerySet#last}
 * - [at]{@link QuerySet#at}
 * - [delete]{@link QuerySet#delete}
 * - [update]{@link QuerySet#update}
 *
 */
const EntityManager = class EntityManager {
    /**
     * Create an EntityManager.
     * @param  {object} tree - the tree branch to manage
     * @param  {Schema} - the Schema that defines the branch structure
     */
    constructor(tree) {
        Object.assign(this, {
            tree,
            mutations: [],
        });
    }

    getDefaultState() {
        return this.schema.getDefaultState();
    }

    getEntityMap() {
        return this.schema.accessMap(this.tree);
    }

    getIdArray() {
        return this.schema.accessIdArray(this.tree);
    }

    getPlainEntity(id, includeIdAttribute) {
        let entity = this.schema.accessId(this.tree, id);

        if (!!includeIdAttribute) {
            entity = Object.assign({[this.schema.idAttribute]: id}, entity);
        }

        return entity;
    }

    getPlainEntityWithId(id) {
        return this.getPlainEntity(id, true);
    }

    nextId() {
        return Math.max(...this.getIdArray()) + 1;
    }

    getQuerySet() {
        const QuerySetClass = this.querySetClass;
        return new QuerySetClass(this, this.getIdArray(), {entityClass: this.entityClass});
    }

    /**
     * Returns a QuerySet containing all entities.
     * @return {QuerySet} a QuerySet containing all entities
     */
    all() {
        return this.getQuerySet();
    }

    /**
     * Records the addition of a new entity and returns a
     * new Entity instance.
     * @param  {props} props - the new Entity's properties.
     * @return {Entity} a new Entity instance.
     */
    create(props) {
        this.mutations.push({
            type: CREATE,
            payload: props,
        });
        return new Entity(this, props);
    }

    /**
     * Gets the Entity instance that matches properties in `lookupObj`.
     * Throws an error if Entity is not found.
     *
     * @param  {Object} lookupObj - the properties used to match a single entity.
     * @return {Entity} an Entity instance that matches `lookupObj` properties.
     */
    get(lookupObj) {
        if (!this.getIdArray().length) {
            throw new Error('Tried getting from empty QuerySet');
        }

        const keys = Object.keys(lookupObj);
        if (keys.includes(this.idAttribute)) {
            // We treat `idAttribute` as unique, so if it's
            // in `lookupObj` we search with that attribute only.
            return new Entity(this, this.getPlainEntity(lookupObj[this.idAttribute]), true);
        }
        const found = find(this.getPlainEntities(), entity => match(lookupObj, entity));

        if (!found) {
            throw new Error('Entity not found when calling get method');
        }

        return new Entity(this, found);
    }

    setOrder(arg) {
        this.mutations.push({
            type: ORDER,
            payload: arg,
        });
    }

    /**
     * Applies recorded mutations and returns a new state tree.
     * @return {Object} the reduced state tree
     */
    reduce() {
        return this.mutations.reduce((state, action) => {
            const next = {
                [this.schema.arrName]: this.reduceIdArray(state[this.schema.arrName], action),
                [this.schema.mapName]: this.reduceEntityMap(state[this.schema.mapName], action),
            };
            return next;
        }, this.tree);
    }

    reduceIdArray(idArr, action) {
        switch (action.type) {
        case CREATE:
            return [...idArr, this.nextId()];
        case DELETE:
            const idsToDelete = action.payload.idArr;
            return idArr.filter(id => !idsToDelete.includes(id));
        case ORDER:
            const entities = sortByAll(this.getFullEntities(), action.payload);
            return entities.map(entity => entity[this.idAttribute]);
        default:
            return idArr;
        }
    }

    reduceEntityMap(entityMap, action) {
        switch (action.type) {
        case CREATE:
            const id = this.nextId();
            return {
                ...entityMap,
                [id]: Object.assign({}, action.payload),
            };
        case UPDATE:
            let mapper;
            if (typeof action.payload.updater === 'function') {
                mapper = action.payload.updater;
            } else {
                mapper = entity => Object.assign({}, entity, action.payload.updater);
            }
            const updatedMap = {};
            action.payload.idArr.forEach(_id => {
                updatedMap[_id] = mapper(entityMap[_id]);
            });

            return {
                ...entityMap,
                ...updatedMap,
            };
        case DELETE:
            const idsToDelete = action.payload.idArr;
            return omit(entityMap, idsToDelete);
        default:
            return entityMap;
        }
    }
};

EntityManager.prototype.querySetClass = QuerySet;
EntityManager.prototype.entityClass = Entity;

export default EntityManager;
