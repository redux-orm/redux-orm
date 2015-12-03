import find from 'lodash/collection/find';

import QuerySet from './QuerySet';
import {
    CREATE,
    ORDER,
} from './constants';
import {match, attachQuerySetMethods} from './utils.js';

/**
 * Manages the objects under a {@link Model} class.
 *
 * The manager shares the following methods with {@link QuerySet}:
 *
 * - [toPlain]{@link QuerySet#toPlain}
 * - [all]{@link QuerySet#all}
 * - [filter]{@link QuerySet#filter}
 * - [exclude]{@link QuerySet#exclude}
 * - [orderBy]{@link QuerySet#orderBy}
 * - [exists]{@link QuerySet#exists}
 * - [first]{@link QuerySet#first}
 * - [last]{@link QuerySet#last}
 * - [at]{@link QuerySet#at}
 * - [delete]{@link QuerySet#delete}
 * - [update]{@link QuerySet#update}
 *
 */
const Manager = class Manager {
    constructor(model) {
        this.model = model;
        Object.assign(this, {
            state: model.state,
            meta: model.getMetaInstance(),
        });
    }

    getIdArray() {
        return this.model.accessIds();
    }

    getPlain(id) {
        return this.model.accessId(id);
    }

    getId(id) {
        return this.model.accessId(id);
    }

    toPlain() {
        return this.model.accessList();
    }

    /**
     * Returns the id to be assigned to a new entity.
     * You may override this to suit your needs.
     * @return {*} the id value for a new entity.
     */
    nextId() {
        const idArr = this.getIdArray();
        if (idArr.length === 0) {
            return 0;
        }
        return Math.max(...idArr) + 1;
    }

    getQuerySet() {
        const QuerySetClass = this.querySetClass;
        return new QuerySetClass(this, this.getIdArray(), {modelClass: this.model});
    }

    getQuerySetFromIds(ids) {
        const QuerySetClass = this.querySetClass;
        return new QuerySetClass(this, ids, {modelClass: this.model});
    }

    /**
     * Returns a {@link QuerySet} containing all {@link Model} instances.
     * @return {QuerySet} a QuerySet containing all {@link Model} instances
     */
    all() {
        return this.getQuerySet();
    }

    /**
     * Records the addition of a new {@link Model} instance and returns it.
     *
     * @param  {props} props - the new {@link Model}'s properties.
     * @return {Model} a new {@link Model} instance.
     */
    create(props) {
        const idAttribute = this.model.idAttribute;

        if (!props.hasOwnProperty(idAttribute)) {
            props[idAttribute] = this.nextId();
        }

        this.model.addMutation({
            type: CREATE,
            payload: props,
        });
        const Model = this.model;
        return new Model(props);
    }

    getWithId(id) {
        const Model = this.model;
        return new Model(this.getPlain(id));
    }

    /**
     * Gets the {@link Model} instance that matches properties in `lookupObj`.
     * Throws an error if {@link Model} is not found.
     *
     * @param  {Object} lookupObj - the properties used to match a single entity.
     * @return {Model} a {@link Model} instance that matches `lookupObj` properties.
     */
    get(lookupObj) {
        if (!this.getIdArray().length) {
            throw new Error(`No entities found for model ${this.model.getName()}`);
        }
        const Model = this.model;

        const keys = Object.keys(lookupObj);
        if (keys.includes(this.model.idAttribute)) {
            // We treat `idAttribute` as unique, so if it's
            // in `lookupObj` we search with that attribute only.
            const props = this.getPlain(lookupObj[this.model.idAttribute]);
            const instance = new Model(props);
            return instance;
        }

        const iterator = this.model.iterator();

        let done = false;
        while (!done) {
            const curr = iterator.next();
            if (match(lookupObj, curr.value)) {
                return new Model(curr.value);
            }
            done = curr.done;
        }

        throw new Error('Model instance not found when calling get method');
    }

    /**
     * Records an ordering mutation for the objects.
     * Note that if you create or update any objects after
     * calling this, they won't be in order.
     *
     * See the shared {@link QuerySet} method [orderBy]{@link QuerySet#orderBy}
     * that returns an ordered {@link QuerySet}.
     *
     * @param {function|string|string[]} orderArg - A function, an attribute name or a list of attribute
     *                                              names to order the objects by. If you supply a function,
     *                                              it must return a value user to order the entities.
     * @return {undefined}
     */
    setOrder(orderArg) {
        this.model.addMutation({
            type: ORDER,
            payload: orderArg,
        });
    }
};

Manager.prototype.querySetClass = QuerySet;
attachQuerySetMethods(Manager, QuerySet);

export default Manager;
