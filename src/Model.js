import forOwn from 'lodash/object/forOwn';

import {ManyToMany, ForeignKey} from './fields';
import Session from './Session';
import Backend from './Backend';
import QuerySet from './QuerySet';
import {CREATE, UPDATE, DELETE, ORDER} from './constants';
import {match, m2mName, m2mToFieldName, m2mFromFieldName} from './utils';

/**
 * The heart of an ORM, the data model.
 * The static class methods manages the mutations
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
        this._fields = props;
        const idAttribute = ModelClass.idAttribute;

        forOwn(props, (fieldValue, fieldName) => {
            this._fields[fieldName] = fieldValue;
            this._fieldNames.push(fieldName);

            // If the field has not already been defined on the
            // prototype for a relation.
            if (!ModelClass.definedProperties[fieldName]) {
                Object.defineProperty(this, fieldName, {
                    get: () => fieldValue,
                    set: (value) => {
                        ModelClass.addMutation({
                            type: UPDATE,
                            payload: {
                                [idAttribute]: this.getId(),
                                [fieldName]: value,
                            },
                        });
                    },
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
     * Returns the {@link Model} class used to instantiate a possible Through model.
     * @return {Model} The Through model class used to handle many-to-many relations declared
     *                 in this model.
     */
    static getThroughModelClass() {
        return Model;
    }

    static getManyToManyModels() {
        const fields = this.fields;
        const thisModelName = this.modelName;

        const models = [];
        forOwn(fields, (fieldInstance, fieldName) => {
            if (fieldInstance instanceof ManyToMany) {
                let toModelName;
                if (fieldInstance.toModelName === 'this') {
                    toModelName = thisModelName;
                } else {
                    toModelName = fieldInstance.toModelName;
                }

                const fromFieldName = m2mFromFieldName(thisModelName);
                const toFieldName = m2mToFieldName(toModelName);

                const Through = class ThroughModel extends this.getThroughModelClass() {};

                Through.modelName = m2mName(thisModelName, fieldName);

                Through.fields = {
                    [fromFieldName]: new ForeignKey(thisModelName),
                    [toFieldName]: new ForeignKey(toModelName),
                };


                models.push(Through);
            }
        });

        return models;
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

    /**
     * Gets the {@link Backend} instance linked to this {@link Model}.
     * @return {Backend} The {@link Backend} instance linked to this {@link Model}.
     */
    static getBackend() {
        if (!this._backend) {
            const BackendClass = this.getBackendClass();
            this._backend = new BackendClass(this._getBackendOpts());
        }
        return this._backend;
    }

    /**
     * Gets the Model's next state by applying the recorded
     * mutations.
     * @return {Object} The next state.
     */
    static getNextState() {
        if (typeof this.state === 'undefined') {
            return this.getDefaultState();
        }

        const backend = this.getBackend();

        const mutations = this.session.getMutationsFor(this);

        return mutations.reduce((state, action) => {
            switch (action.type) {
            case CREATE:
                return backend.insert(state, action.payload);
            case UPDATE:
                return backend.update(state, action.payload.idArr, action.payload.updater);
            case DELETE:
                return backend.delete(state, action.payload);
            default:
                return state;
            }
        }, this.state);
    }

    /**
     * The default reducer implementation.
     * If the user doesn't define a reducer, this is used.
     *
     * @param {Object} state - the current state
     * @param {Object} action - the dispatched action
     * @param {Model} model - the concrete model class being used
     * @param {Session} session - the current {@link Session} instance
     */
    static reducer(state, action, model, session) {
        return model.getNextState();
    }

    static callUserReducer() {
        return this.reducer(this.state, this.session.action, this, this.session);
    }

    /**
     * Gets the default, empty state of the branch.
     * Delegates to a {@link Backend} instance.
     * @return {Object} The default state.
     */
    static getDefaultState() {
        return this.getBackend().getDefaultState();
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
        return this.getBackend().accessId(this.state, id);
    }

    /**
     * A convenience method to call {@link Backend#accessIdList} from
     * the {@link Model} class with the current state.
     */
    static accessIds() {
        return this.getBackend().accessIdList(this.state);
    }

    static accessList() {
        return this.getBackend().accessList(this.state);
    }

    static iterator() {
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
     * Adds the required backenddata about this {@link Model} to the mutation object.
     * @param {Object} mutation - the mutation to add.
     */
    static addMutation(mutation) {
        mutation.meta = {name: this.modelName};
        this.session.addMutation(mutation);
    }

    /**
     * Returns the id to be assigned to a new entity.
     * You may override this to suit your needs.
     * @return {*} the id value for a new entity.
     */
    static nextId() {
        const idArr = this.accessIds();
        if (idArr.length === 0) {
            return 0;
        }
        return Math.max(...idArr) + 1;
    }

    static getQuerySet() {
        return this.getQuerySetFromIds(this.accessIds());
    }

    static getQuerySetFromIds(ids) {
        const QuerySetClass = this.querySetClass;
        return new QuerySetClass(this, ids);
    }

    static invalidateCaches() {
        this._cachedQuerySet = undefined;
        this._backend = undefined;
        this._setupDone = undefined;
    }

    static get query() {
        if (!this._cachedQuerySet) {
            this._cachedQuerySet = this.getQuerySet();
        }
        return this._cachedQuerySet;
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
    static create(props) {
        const idAttribute = this.idAttribute;

        if (!props.hasOwnProperty(idAttribute)) {
            props[idAttribute] = this.nextId();
        }

        this.addMutation({
            type: CREATE,
            payload: props,
        });
        const ModelClass = this;
        return new ModelClass(props);
    }

    static withId(id) {
        const ModelClass = this;
        return new ModelClass(this.accessId(id));
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
     * Records an ordering mutation for the objects.
     * Note that if you create or update any objects after
     * calling this, they won't be in order.
     *
     * @param {function|string|string[]} orderArg - A function, an attribute name or a list of attribute
     *                                              names to order the objects by. If you supply a function,
     *                                              it must return a value user to order the entities.
     * @return {undefined}
     */
    static setOrder(orderArg) {
        this.addMutation({
            type: ORDER,
            payload: orderArg,
        });
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

    equals(otherModel) {
        return this.getClass() === otherModel.getClass() && this.getId() === otherModel.getId();
    }

    /**
     * Returns a plain JavaScript object representation
     * of the {@link Model} instance.
     * @return {Object} a plain JavaScript object representing the {@link Model}
     */
    toPlain() {
        const obj = {};
        this._fieldNames.forEach((fieldName) => {
            obj[fieldName] = this._fields[fieldName];
        });
        return obj;
    }

    /**
     * Records a mutation to the {@link Model} instance for a single
     * field value assignment.
     * @param {string} propertyName - name of the property to set
     * @param {*} value - value assigned to the property
     * @return {undefined}
     */
    set(propertyName, value) {
        this.update({[propertyName]: value});
    }

    /**
     * Records a mutation to the {@link Model} instance for multiple field value assignments.
     * @param  {Object} mergeObj - an object that will be merged with this instance.
     * @return {undefined}
     */
    update(mergeObj) {
        this.getClass().addMutation({
            type: UPDATE,
            payload: {
                idArr: [this.getId()],
                updater: mergeObj,
            },
        });
    }

    /**
     * Records the {@link Model} to be deleted.
     * @return {undefined}
     */
    delete() {
        this.getClass().addMutation({
            type: DELETE,
            payload: [this.getId()],
        });
    }
};

Model.fields = {};
Model.definedProperties = {};
Model.querySetClass = QuerySet;

export default Model;
