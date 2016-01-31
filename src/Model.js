import forOwn from 'lodash/object/forOwn';
import isArray from 'lodash/lang/isArray';
import uniq from 'lodash/array/uniq';

import Session from './Session';
import Backend from './Backend';
import QuerySet from './QuerySet';
import {
    ManyToMany,
    ForeignKey,
    OneToOne,
} from './fields';
import { CREATE, UPDATE, DELETE } from './constants';
import {
    match,
    normalizeEntity,
    arrayDiffActions,
    objectShallowEquals,
} from './utils';

/**
 * The heart of an ORM, the data model.
 * The static class methods manages the updates
 * passed to this. The class itself is connected to a session,
 * and because of this you can only have a single session at a time
 * for a {@link Model} class.
 *
 * An instance of {@link Model} represents an object in the database.
 *
 * To create data models in your schema, subclass {@link Model}. To define
 * information about the data model, override static class methods. Define instance
 * logic by defining prototype methods (without `static` keyword).
 */
const Model = class Model {
    /**
     * Creates a Model instance.
     * @param  {Object} props - the properties to instantiate with
     */
    constructor(props) {
        this._initFields(props);
    }

    _initFields(props) {
        const ModelClass = this.getClass();

        this._fieldNames = [];
        this._fields = Object.assign({}, props);

        forOwn(props, (fieldValue, fieldName) => {
            this._fields[fieldName] = fieldValue;
            this._fieldNames.push(fieldName);
            // If the field has not already been defined on the
            // prototype for a relation.
            if (!ModelClass.definedProperties[fieldName]) {
                Object.defineProperty(this, fieldName, {
                    get: () => fieldValue,
                    set: (value) => this.set(fieldName, value),
                    configurable: true,
                });
            }
        });
    }

    /**
     * Returns the raw state for this {@link Model} in the current {@link Session}.
     * @return {Object} The state for this {@link Model} in the current {@link Session}.
     */
    static get state() {
        return this.session.getState(this.modelName);
    }

    static toString() {
        return `ModelClass: ${this.modelName}`;
    }

    /**
     * Returns the options object passed to the {@link Backend} class constructor.
     *
     * @return {Object} the options object used to instantiate a {@link Backend} class.
     */
    static backend() {
        return {
            branchName: this.modelName,
        };
    }

    static _getBackendOpts() {
        if (typeof this.backend === 'function') {
            return this.backend();
        }
        if (typeof this.backend === 'undefined') {
            throw new Error(`You must declare either a 'backend' class method or
                            a 'backend' class variable in your Model Class`);
        }
        return this.backend;
    }

    /**
     * Returns the {@link Backend} class used to instantiate
     * the {@link Backend} instance for this {@link Model}.
     *
     * Override this if you want to use a custom {@link Backend} class.
     * @return {Backend} The {@link Backend} class or subclass to use for this {@link Model}.
     */
    static getBackendClass() {
        return Backend;
    }

    static get _sessionData() {
        if (!this.session) return {};
        return this.session.getDataForModel(this.modelName);
    }

    /**
     * Gets the {@link Backend} instance linked to this {@link Model}.
     * @return {Backend} The {@link Backend} instance linked to this {@link Model}.
     */
    static getBackend() {
        if (!this._sessionData.backend) {
            const BackendClass = this.getBackendClass();
            const opts = this._getBackendOpts();

            if (this.session && this.session.withMutations) {
                opts.withMutations = true;
            }

            const backend = new BackendClass(opts);

            if (!this.session) {
                return backend;
            }
            this._sessionData.backend = backend;
        }
        return this._sessionData.backend;
    }

    /**
     * Gets the Model's next state by applying the recorded
     * updates.
     * @return {Object} The next state.
     */
    static getNextState() {
        let state;
        if (this._sessionData.hasOwnProperty('nextState')) {
            state = this._sessionData.nextState;
        } else {
            state = this.state;
        }

        const updates = this.session.getUpdatesFor(this);

        if (updates.length > 0) {
            const nextState = updates.reduce(this.updateReducer.bind(this), state);
            this._sessionData.nextState = nextState;
            return nextState;
        }

        return state;
    }

    /**
     * A reducer that takes the Model's state and an internal redux-orm
     * action object and applies the update specified by the `action` object
     * by delegating to this model's Backend instance.
     *
     * @param  {Object} state - the Model's state
     * @param  {Object} action - the internal redux-orm update action to apply
     * @return {Object} the state after applying the action
     */
    static updateReducer(state, action) {
        const backend = this.getBackend();

        switch (action.type) {
        case CREATE:
            return backend.insert(state, action.payload);
        case UPDATE:
            return backend.update(state, action.payload.idArr, action.payload.mergeObj);
        case DELETE:
            return backend.delete(state, action.payload);
        default:
            return state;
        }
    }

    /**
     * The default reducer implementation.
     * If the user doesn't define a reducer, this is used.
     *
     * @param {Object} state - the current state
     * @param {Object} action - the dispatched action
     * @param {Model} model - the concrete model class being used
     * @param {Session} session - the current {@link Session} instance
     * @return {Object} the next state for the Model
     */
    static reducer(state, action, model, session) { // eslint-disable-line
        return model.getNextState();
    }

    /**
     * Gets the default, empty state of the branch.
     * Delegates to a {@link Backend} instance.
     * @return {Object} The default state.
     */
    static getDefaultState() {
        return this.getBackend().getDefaultState();
    }

    static markAccessed() {
        this.session.markAccessed(this);
    }

    /**
     * Returns the id attribute of this {@link Model}.
     * Delegates to the related {@link Backend} instance.
     *
     * @return {string} The id attribute of this {@link Model}.
     */
    static get idAttribute() {
        return this.getBackend().idAttribute;
    }

    /**
     * A convenience method to call {@link Backend#accessId} from
     * the {@link Model} class.
     *
     * @param  {Number} id - the object id to access
     * @return {Object} a reference to the object in the database.
     */
    static accessId(id) {
        this.markAccessed();
        return this.getBackend().accessId(this.state, id);
    }

    /**
     * A convenience method to call {@link Backend#accessIdList} from
     * the {@link Model} class with the current state.
     */
    static accessIds() {
        this.markAccessed();
        return this.getBackend().accessIdList(this.state);
    }

    static accessList() {
        this.markAccessed();
        return this.getBackend().accessList(this.state);
    }

    static iterator() {
        this.markAccessed();
        return this.getBackend().iterator(this.state);
    }

    /**
     * Connect the model class to a {@link Session}.
     *
     * @param  {Session} session - The session to connect to.
     */
    static connect(session) {
        if (!session instanceof Session) {
            throw Error('A model can only connect to a Session instance.');
        }
        this._session = session;
    }

    /**
     * Get the current {@link Session} instance.
     *
     * @return {Session} The current {@link Session} instance.
     */
    static get session() {
        return this._session;
    }

    /**
     * A convenience method that delegates to the current {@link Session} instane.
     * Adds the required backenddata about this {@link Model} to the update object.
     * @param {Object} update - the update to add.
     */
    static addUpdate(update) {
        update.meta = {name: this.modelName};
        this.session.addUpdate(update);
    }

    /**
     * Returns the id to be assigned to a new entity.
     * You may override this to suit your needs.
     * @return {*} the id value for a new entity.
     */
    static nextId() {
        if (typeof this._sessionData.nextId === 'undefined') {
            const idArr = this.accessIds();
            if (idArr.length === 0) {
                this._sessionData.nextId = 0;
            } else {
                this._sessionData.nextId = Math.max(...idArr) + 1;
            }
        }
        return this._sessionData.nextId;
    }

    static getQuerySet() {
        return this.getQuerySetFromIds(this.accessIds());
    }

    static getQuerySetFromIds(ids) {
        const QuerySetClass = this.querySetClass;
        return new QuerySetClass(this, ids);
    }

    static invalidateClassCache() {
        this.isSetUp = undefined;
        this.definedProperties = {};
        this.virtualFields = {};
    }

    static get query() {
        if (!this._sessionData.queryset) {
            this._sessionData.queryset = this.getQuerySet();
        }
        return this._sessionData.queryset;
    }

    /**
     * Returns a {@link QuerySet} containing all {@link Model} instances.
     * @return {QuerySet} a QuerySet containing all {@link Model} instances
     */
    static all() {
        return this.getQuerySet();
    }

    /**
     * Records the addition of a new {@link Model} instance and returns it.
     *
     * @param  {props} props - the new {@link Model}'s properties.
     * @return {Model} a new {@link Model} instance.
     */
    static create(userProps) {
        const idAttribute = this.idAttribute;
        const props = Object.assign({}, userProps);

        if (!props.hasOwnProperty(idAttribute)) {
            const nextId = this.nextId();
            props[idAttribute] = nextId;
            this._sessionData.nextId++;
        } else {
            const id = props[idAttribute];
            if (id > this.nextId()) {
                this._sessionData.nextId = id + 1;
            }
        }

        const m2mVals = {};

        forOwn(userProps, (value, key) => {
            props[key] = normalizeEntity(value);

            // If a value is supplied for a ManyToMany field,
            // discard them from props and save for later processing.
            if (isArray(value)) {
                if (this.fields.hasOwnProperty(key) && this.fields[key] instanceof ManyToMany) {
                    m2mVals[key] = value;
                    delete props[key];
                }
            }
        });

        this.addUpdate({
            type: CREATE,
            payload: props,
        });
        const ModelClass = this;
        const instance = new ModelClass(props);

        forOwn(m2mVals, (value, key) => {
            const ids = value.map(normalizeEntity);
            const uniqueIds = uniq(ids);

            if (ids.length !== uniqueIds.length) {
                const idsString = ids;
                throw new Error(`Found duplicate id(s) when passing "${idsString}" to ${this.modelName}.${key} value on create`);
            }

            instance[key].add(...ids);
        });

        return instance;
    }

    /**
     * Returns a {@link Model} instance for the object with id `id`.
     *
     * @param  {*} id - the `id` of the object to get
     * @throws If object with id `id` doesn't exist
     * @return {Model} {@link Model} instance with id `id`
     */
    static withId(id) {
        const ModelClass = this;

        if (!this.hasId(id)) {
            throw new Error(`${this.modelName} instance with id ${id} not found`);
        }

        const ref = this.accessId(id);

        return new ModelClass(ref);
    }

    /**
     * Returns a boolean indicating if an entity with the id `id` exists
     * in the state.
     *
     * @param  {*}  id - a value corresponding to the id attribute of the {@link Model} class.
     * @return {Boolean} a boolean indicating if entity with `id` exists in the state
     */
    static hasId(id) {
        const ref = this.accessId(id);

        if (typeof ref === 'undefined') return false;

        return true;
    }

    /**
     * Gets the {@link Model} instance that matches properties in `lookupObj`.
     * Throws an error if {@link Model} is not found.
     *
     * @param  {Object} lookupObj - the properties used to match a single entity.
     * @return {Model} a {@link Model} instance that matches `lookupObj` properties.
     */
    static get(lookupObj) {
        if (!this.accessIds().length) {
            throw new Error(`No entities found for model ${this.modelName}`);
        }
        const ModelClass = this;

        // We treat `idAttribute` as unique, so if it's
        // in `lookupObj` we search with that attribute only.
        if (lookupObj.hasOwnProperty(this.idAttribute)) {
            const props = this.accessId(lookupObj[this.idAttribute]);
            if (typeof props !== 'undefined') {
                return new ModelClass(props);
            }

            throw new Error('Model instance not found when calling get method');
        }

        const iterator = this.iterator();

        let done = false;
        while (!done) {
            const curr = iterator.next();
            if (match(lookupObj, curr.value)) {
                return new ModelClass(curr.value);
            }
            done = curr.done;
        }

        throw new Error('Model instance not found when calling get method');
    }

    /**
     * Gets the {@link Model} class or subclass constructor (the class that
     * instantiated this instance).
     *
     * @return {Model} The {@link Model} class or subclass constructor used to instantiate
     *                 this instance.
     */
    getClass() {
        return this.constructor;
    }

    /**
     * Gets the id value of the current instance.
     * @return {*} The id value of the current instance.
     */
    getId() {
        return this._fields[this.getClass().idAttribute];
    }

    /**
     * Returns a reference to the plain JS object in the store.
     * Make sure to not mutate this.
     *
     * @return {Object} a reference to the plain JS object in the store
     */
    get ref() {
        return this.getClass().accessId(this.getId());
    }

    /**
     * Returns a string representation of the {@link Model} instance.
     * @return {string} A string representation of this {@link Model} instance.
     */
    toString() {
        const className = this.getClass().modelName;
        const fields = this._fieldNames.map(fieldName => {
            const val = this._fields[fieldName];
            return `${fieldName}: ${val}`;
        }).join(', ');
        return `${className}: {${fields}}`;
    }

    /**
     * Returns a boolean indicating if `otherModel` equals this {@link Model} instance.
     * Equality is determined by shallow comparing their attributes.
     *
     * @param  {Model} otherModel - a {@link Model} instance to compare
     * @return {Boolean} a boolean indicating if the {@link Model} instance's are equal.
     */
    equals(otherModel) {
        return objectShallowEquals(this._fields, otherModel._fields);
    }

    /**
     * Records a update to the {@link Model} instance for a single
     * field value assignment.
     * @param {string} propertyName - name of the property to set
     * @param {*} value - value assigned to the property
     * @return {undefined}
     */
    set(propertyName, value) {
        this.update({[propertyName]: value});
    }

    /**
     * Records an update to the {@link Model} instance for multiple field value assignments.
     * If the session is with mutations, updates the instance to reflect the new values.
     * @param  {Object} userMergeObj - an object that will be merged with this instance.
     * @return {undefined}
     */
    update(userMergeObj) {
        const relFields = this.getClass().fields;
        const mergeObj = Object.assign({}, userMergeObj);

        // If an array of entities or id's is supplied for a
        // many-to-many related field, clear the old relations
        // and add the new ones.
        for (const mergeKey in mergeObj) {
            if (relFields.hasOwnProperty(mergeKey)) {
                const field = relFields[mergeKey];
                if (field instanceof ManyToMany) {
                    const currentIds = this[mergeKey].idArr;

                    // TODO: It could be better to check this stuff in Backend.
                    const normalizedNewIds = mergeObj[mergeKey].map(normalizeEntity);
                    const diffActions = arrayDiffActions(currentIds, normalizedNewIds);
                    if (diffActions) {
                        const idsToDelete = diffActions.delete;
                        const idsToAdd = diffActions.add;

                        if (idsToDelete.length > 0) {
                            this[mergeKey].remove(...idsToDelete);
                        }
                        if (idsToAdd.length > 0) {
                            this[mergeKey].add(...idsToAdd);
                        }
                    }
                    delete mergeObj[mergeKey];
                } else if (field instanceof ForeignKey || field instanceof OneToOne) {
                    mergeObj[mergeKey] = normalizeEntity(mergeObj[mergeKey]);
                }
            }
        }

        const session = this.getClass().session;
        if (session && session.withMutations) {
            this._initFields(Object.assign({}, this._fields, mergeObj));
        }

        this.getClass().addUpdate({
            type: UPDATE,
            payload: {
                idArr: [this.getId()],
                mergeObj,
            },
        });
    }

    /**
     * Records the {@link Model} to be deleted.
     * @return {undefined}
     */
    delete() {
        this.getClass().addUpdate({
            type: DELETE,
            payload: [this.getId()],
        });
        this._onDelete();
    }

    _onDelete() {
        const virtualFields = this.getClass().virtualFields;
        for (const key in virtualFields) { // eslint-disable-line
            const field = virtualFields[key];
            if (field instanceof ManyToMany) {
                // Delete any many-to-many rows the entity is included in.
                this[key].clear();
            } else if (field instanceof ForeignKey) {
                const relatedQs = this[key];
                if (relatedQs.exists()) {
                    relatedQs.update({[field.relatedName]: null});
                }
            } else if (field instanceof OneToOne) {
                // Set null to any foreign keys or one to ones pointed to
                // this instance.
                if (this[key] !== null) {
                    this[key][field.relatedName] = null;
                }
            }
        }
    }
};

Model.fields = {};
Model.definedProperties = {};
Model.virtualFields = {};
Model.querySetClass = QuerySet;

export default Model;
