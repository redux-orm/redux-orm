import forOwn from 'lodash/forOwn';
import isArray from 'lodash/isArray';
import uniq from 'lodash/uniq';

import Session from './Session';
import QuerySet from './QuerySet';
import {
    ManyToMany,
    ForeignKey,
    OneToOne,
    attr,
} from './fields';
import { CREATE, UPDATE, DELETE, FILTER } from './constants';
import {
    normalizeEntity,
    arrayDiffActions,
    objectShallowEquals,
} from './utils';


// Generates a query specification
// to get a single row from a table identified
// by a primary key.
function getByIdQuery(modelInstance) {
    const modelClass = modelInstance.getClass();
    return {
        table: modelClass.modelName,
        clauses: [
            {
                type: FILTER,
                payload: {
                    [modelClass.idAttribute]: modelInstance.getId(),
                },
            },
        ],
    };
}


/**
 * The heart of an ORM, the data model.
 *
 * The fields you specify to the Model will be used to generate
 * a schema to the database, related property accessors, and
 * possibly through models.
 *
 * In each {@link Session} you instantiate from an {@link ORM} instance,
 * you will receive a session-specific subclass of this Model. The methods
 * you define here will be available to you in sessions.
 *
 * An instance of {@link Model} represents a record in the database, though
 * it is possible to generate multiple instances from the same record in the database.
 *
 * To create data models in your schema, subclass {@link Model}. To define
 * information about the data model, override static class methods. Define instance
 * logic by defining prototype methods (without `static` keyword).
 */
const Model = class Model {
    /**
     * Creates a Model instance from it's properties.
     * Don't use this to create a new record; Use the static method {@link Model#create}.
     * @param  {Object} props - the properties to instantiate with
     */
    constructor(props) {
        this._initFields(props);
    }

    _initFields(props) {
        const ModelClass = this.getClass();

        const fieldsDef = this.getClass().fields;
        this._fields = Object.assign({}, props);

        forOwn(props, (fieldValue, fieldName) => {
            if (!fieldsDef.hasOwnProperty(fieldName)) {
                throw new Error(
                    `Unexpected field given to ${ModelClass.modelName} constructor: ${fieldName}. ` +
                    `If ${ModelClass.modelName} should accept this field, ` +
                    'add an attr() field to it.'
                );
            }

            this._fields[fieldName] = fieldValue;

            // If the field has not already been defined on the
            // prototype for a relation.
            if (!ModelClass.definedProperties[fieldName]) {
                Object.defineProperty(this, fieldName, {
                    get: () => this._fields[fieldName],
                    set: (value) => this.set(fieldName, value),
                    configurable: true,
                });
            }
        });
    }

    static toString() {
        return `ModelClass: ${this.modelName}`;
    }

    /**
     * Returns the options object passed to the database for the table that represents
     * this Model class.
     *
     * Returns an empty object by default, which means the database
     * will use default options. You can either override this function to return the options
     * you want to use, or assign the options object as a static property of the same name to the
     * Model class.
     *
     * @return {Object} the options object passed to the database for the table
     *                  representing this Model class.
     */
    static options() {
        return {};
    }

    static _getTableOpts() {
        if (typeof this.options === 'function') {
            return this.options();
        }
        return this.options;
    }

    static get _sessionData() {
        if (!this.session) return {};
        return this.session.getDataForModel(this.modelName);
    }

    static markAccessed() {
        this.session.markAccessed(this);
    }

    /**
     * Returns the id attribute of this {@link Model}.
     *
     * @return {string} The id attribute of this {@link Model}.
     */
    static get idAttribute() {
        return this.session.db.describe(this.modelName).idAttribute;
    }

    /**
     * Connect the model class to a {@link Session}.
     *
     * @private
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
     * @private
     * @return {Session} The current {@link Session} instance.
     */
    static get session() {
        return this._session;
    }

    static getQuerySet() {
        const QuerySetClass = this.querySetClass;
        return new QuerySetClass(this);
    }

    static invalidateClassCache() {
        this.isSetUp = undefined;
        this.definedProperties = {};
        this.virtualFields = {};
    }

    static get query() {
        return this.getQuerySet();
    }

    /**
     * Returns a {@link QuerySet} containing all {@link Model} instances.
     * @return {QuerySet} a QuerySet containing all {@link Model} instances
     */
    static all() {
        return this.getQuerySet();
    }

    /**
     * Creates a new record in the database, instantiates a {@link Model} and returns it.
     *
     * If you pass values for many-to-many fields, instances are created on the through
     * model as well.
     *
     * @param  {props} props - the new {@link Model}'s properties.
     * @return {Model} a new {@link Model} instance.
     */
    static create(userProps) {
        const props = Object.assign({}, userProps);

        const m2mVals = {};

        const allowedFieldNames = Object.keys(this.fields);

        // We don't check for extra field values passed here;
        // the constructor will throw in that case. So we
        // only go through the defined fields.
        allowedFieldNames.forEach(key => {
            const field = this.fields[key];
            const valuePassed = userProps.hasOwnProperty(key);
            if (!valuePassed && !(field instanceof ManyToMany)) {
                if (field.getDefault) {
                    props[key] = field.getDefault();
                }
            } else {
                const value = userProps[key];
                props[key] = normalizeEntity(value);

                // If a value is supplied for a ManyToMany field,
                // discard them from props and save for later processing.
                if (isArray(value)) {
                    if (this.fields.hasOwnProperty(key) && this.fields[key] instanceof ManyToMany) {
                        m2mVals[key] = value;
                        delete props[key];
                    }
                }
            }
        });

        const newEntry = this.session.applyUpdate({
            action: CREATE,
            table: this.modelName,
            payload: props,
        });

        const ModelClass = this;
        const instance = new ModelClass(newEntry);

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
     * This throws if the `id` doesn't exist. Use {@link Model#hasId}
     * to check for existence first if you're not certain.
     *
     * @param  {*} id - the `id` of the object to get
     * @throws If object with id `id` doesn't exist
     * @return {Model} {@link Model} instance with id `id`
     */
    static withId(id) {
        const ModelClass = this;
        const rows = this._findDatabaseRows({ [ModelClass.idAttribute]: id });
        if (rows.length === 0) {
            throw new Error(`${ModelClass.modelName} instance with id ${id} not found`);
        }

        return new ModelClass(rows[0]);
    }

    /**
     * Returns a boolean indicating if an entity with the id `id` exists
     * in the state.
     *
     * @param  {*}  id - a value corresponding to the id attribute of the {@link Model} class.
     * @return {Boolean} a boolean indicating if entity with `id` exists in the state
     */
    static hasId(id) {
        const rows = this._findDatabaseRows({ [this.idAttribute]: id });
        return rows.length === 1;
    }

    static _findDatabaseRows(lookupObj) {
        const ModelClass = this;
        return ModelClass
            .session
            .query({
                table: ModelClass.modelName,
                clauses: [
                    {
                        type: FILTER,
                        payload: lookupObj,
                    },
                ],
            }).rows;
    }

    /**
     * Gets the {@link Model} instance that matches properties in `lookupObj`.
     * Throws an error if {@link Model} is not found, or multiple records match
     * the properties.
     *
     * @param  {Object} lookupObj - the properties used to match a single entity.
     * @return {Model} a {@link Model} instance that matches `lookupObj` properties.
     */
    static get(lookupObj) {
        const ModelClass = this;

        const rows = this._findDatabaseRows(lookupObj);

        if (rows.length === 0) {
            throw new Error('Model instance not found when calling get method');
        } else if (rows.length > 1) {
            throw new Error(`Expected to find a single row in Model.get. Found ${rows.length}.`);
        }

        return new ModelClass(rows[0]);
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
     * Gets the id value of the current instance by looking up the id attribute.
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
        const ModelClass = this.getClass();
        return ModelClass._findDatabaseRows({
            [ModelClass.idAttribute]: this.getId(),
        })[0];
    }

    /**
     * Returns a string representation of the {@link Model} instance.
     *
     * @return {string} A string representation of this {@link Model} instance.
     */
    toString() {
        const ThisModel = this.getClass();
        const className = ThisModel.modelName;
        const fieldNames = Object.keys(ThisModel.fields);
        const fields = fieldNames.map(fieldName => {
            const field = ThisModel.fields[fieldName];
            if (field instanceof ManyToMany) {
                const ids = this[fieldName].toModelArray().map(
                    model => model.getId()
                );
                return `${fieldName}: [${ids.join(', ')}]`;
            }
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
     * Updates a property name to given value for this {@link Model} instance.
     * The values are immediately committed to the database.
     *
     * @param {string} propertyName - name of the property to set
     * @param {*} value - value assigned to the property
     * @return {undefined}
     */
    set(propertyName, value) {
        this.update({ [propertyName]: value });
    }

    /**
     * Assigns multiple fields and corresponding values to this {@link Model} instance.
     * The updates are immediately committed to the database.
     *
     * @param  {Object} userMergeObj - an object that will be merged with this instance.
     * @return {undefined}
     */
    update(userMergeObj) {
        const ThisModel = this.getClass();
        const relFields = ThisModel.fields;
        const mergeObj = Object.assign({}, userMergeObj);

        // If an array of entities or id's is supplied for a
        // many-to-many related field, clear the old relations
        // and add the new ones.
        for (const mergeKey in mergeObj) { // eslint-disable-line no-restricted-syntax
            if (relFields.hasOwnProperty(mergeKey)) {
                const field = relFields[mergeKey];
                if (field instanceof ManyToMany) {
                    const currentIds = this[mergeKey].toRefArray()
                        .map(row => row[ThisModel.idAttribute]);

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

        this._initFields(Object.assign({}, this._fields, mergeObj));

        ThisModel.session.applyUpdate({
            action: UPDATE,
            query: getByIdQuery(this),
            payload: mergeObj,
        });
    }


    /**
     * Updates {@link Model} instance attributes to reflect the
     * database state in the current session.
     * @return {undefined}
     */
    refreshFromState() {
        this._initFields(this.ref);
    }

    /**
     * Deletes the record for this {@link Model} instance.
     * You'll still be able to access fields and values on the instance.
     *
     * @return {undefined}
     */
    delete() {
        this._onDelete();
        this.getClass().session.applyUpdate({
            action: DELETE,
            query: getByIdQuery(this),
        });
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
                    relatedQs.update({ [field.relatedName]: null });
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

Model.fields = {
    id: attr(),
};
Model.definedProperties = {};
Model.virtualFields = {};
Model.querySetClass = QuerySet;

export default Model;
