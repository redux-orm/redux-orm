import Session from "./Session";
import QuerySet from "./QuerySet";

import { attr } from "./fields";
import ForeignKey from "./fields/ForeignKey";
import ManyToMany from "./fields/ManyToMany";
import OneToOne from "./fields/OneToOne";

import { CREATE, UPDATE, DELETE, FILTER } from "./constants";
import {
    normalizeEntity,
    arrayDiffActions,
    objectShallowEquals,
    warnDeprecated,
    m2mName,
} from "./utils";

/**
 * Generates a query specification to get the instance's
 * corresponding table row using its primary key.
 *
 * @private
 * @returns {Object}
 */
function getByIdQuery(modelInstance) {
    const modelClass = modelInstance.getClass();
    const { idAttribute, modelName } = modelClass;

    return {
        table: modelName,
        clauses: [
            {
                type: FILTER,
                payload: {
                    [idAttribute]: modelInstance.getId(),
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
        const propsObj = Object(props);
        this._fields = { ...propsObj };

        Object.keys(propsObj).forEach((fieldName) => {
            // In this case, we got a prop that wasn't defined as a field.
            // Assuming it's an arbitrary data field, making an instance-specific
            // descriptor for it.
            // Using the in operator as the property could be defined anywhere
            // on the prototype chain.
            if (!(fieldName in this)) {
                Object.defineProperty(this, fieldName, {
                    get: () => this._fields[fieldName],
                    set: (value) => this.set(fieldName, value),
                    configurable: true,
                    enumerable: true,
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

    /**
     * Manually mark individual instances as accessed.
     * This allows invalidating selector memoization within mutable sessions.
     *
     * @param {Array.<*>} ids - Array of primary key values
     * @return {undefined}
     */
    static markAccessed(ids) {
        if (typeof this._session === "undefined") {
            throw new Error(
                [
                    `Tried to mark rows of the ${this.modelName} model as accessed without a session. `,
                    "Create a session using `session = orm.session()` and call ",
                    `\`session["${this.modelName}"].markAccessed\` instead.`,
                ].join("")
            );
        }
        this.session.markAccessed(this.modelName, ids);
    }

    /**
     * Manually mark this model's table as scanned.
     * This allows invalidating selector memoization within mutable sessions.
     *
     * @return {undefined}
     */
    static markFullTableScanned() {
        if (typeof this._session === "undefined") {
            throw new Error(
                [
                    `Tried to mark the ${this.modelName} model as full table scanned without a session. `,
                    "Create a session using `session = orm.session()` and call ",
                    `\`session["${this.modelName}"].markFullTableScanned\` instead.`,
                ].join("")
            );
        }
        this.session.markFullTableScanned(this.modelName);
    }

    /**
     * Manually mark indexes as accessed.
     * This allows invalidating selector memoization within mutable sessions.
     *
     * @param {Array.<Array.<*,*>>} indexes - Array of column-value pairs
     * @return {undefined}
     */
    static markAccessedIndexes(indexes) {
        if (typeof this._session === "undefined") {
            throw new Error(
                [
                    `Tried to mark indexes for the ${this.modelName} model as accessed without a session. `,
                    "Create a session using `session = orm.session()` and call ",
                    `\`session["${this.modelName}"].markAccessedIndexes\` instead.`,
                ].join("")
            );
        }
        this.session.markAccessedIndexes(
            indexes.map(([attribute, value]) => [
                this.modelName,
                attribute,
                value,
            ])
        );
    }

    /**
     * Returns the id attribute of this {@link Model}.
     *
     * @return {string} The id attribute of this {@link Model}.
     */
    static get idAttribute() {
        if (typeof this._session === "undefined") {
            throw new Error(
                [
                    `Tried to get the ${this.modelName} model's id attribute without a session. `,
                    "Create a session using `session = orm.session()` and access ",
                    `\`session["${this.modelName}"].idAttribute\` instead.`,
                ].join("")
            );
        }
        return this.session.db.describe(this.modelName).idAttribute;
    }

    /**
     * Connect the model class to a {@link Session}.
     *
     * @private
     * @param  {Session} session - The session to connect to.
     */
    static connect(session) {
        if (!(session instanceof Session)) {
            throw new Error(
                "A model can only be connected to instances of Session."
            );
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

    /**
     * Returns an instance of the model's `querySetClass` field.
     * By default, this will be an empty {@link QuerySet}.
     *
     * @return {Object} An instance of the model's `querySetClass`.
     */
    static getQuerySet() {
        const { querySetClass: QuerySetClass } = this;
        return new QuerySetClass(this);
    }

    /**
     * @return {undefined}
     */
    static invalidateClassCache() {
        this.isSetUp = undefined;
        this.virtualFields = {};
    }

    /**
     * @see {@link Model.getQuerySet}
     */
    static get query() {
        return this.getQuerySet();
    }

    /**
     * Returns parameters to be passed to {@link Table} instance.
     *
     * @private
     */
    static tableOptions() {
        if (typeof this.backend === "function") {
            warnDeprecated(
                "`Model.backend` has been deprecated. Please rename to `.options`."
            );
            return this.backend();
        }
        if (this.backend) {
            warnDeprecated(
                "`Model.backend` has been deprecated. Please rename to `.options`."
            );
            return this.backend;
        }
        if (typeof this.options === "function") {
            return this.options();
        }
        return this.options;
    }

    /**
     * Creates a new record in the database, instantiates a {@link Model} and returns it.
     *
     * If you pass values for many-to-many fields, instances are created on the through
     * model as well.
     *
     * @param  {Object} userProps - the new {@link Model}'s properties.
     * @return {Model} a new {@link Model} instance.
     */
    static create(userProps) {
        if (typeof this._session === "undefined") {
            throw new Error(
                [
                    `Tried to create a ${this.modelName} model instance without a session. `,
                    "Create a session using `session = orm.session()` and call ",
                    `\`session["${this.modelName}"].create\` instead.`,
                ].join("")
            );
        }
        const props = { ...userProps };

        const m2mRelations = {};

        const declaredFieldNames = Object.keys(this.fields);
        const declaredVirtualFieldNames = Object.keys(this.virtualFields);

        declaredFieldNames.forEach((key) => {
            const field = this.fields[key];
            const valuePassed = userProps.hasOwnProperty(key);
            if (!(field instanceof ManyToMany)) {
                if (valuePassed) {
                    const value = userProps[key];
                    props[key] = normalizeEntity(value);
                } else if (field.getDefault) {
                    props[key] = field.getDefault();
                }
            } else if (valuePassed) {
                // Save for later processing
                m2mRelations[key] = userProps[key];

                if (!field.as) {
                    /**
                     * The relationship does not have an accessor
                     * Discard the value from props as the field will be populated later with instances
                     * from the target models when refreshing the M2M relations.
                     * If the relationship does have an accessor (`as`) field then we do want to keep this
                     * original value in the props to expose the raw list of IDs from the instance.
                     */
                    delete props[key];
                }
            }
        });

        // add backward many-many if required
        declaredVirtualFieldNames.forEach((key) => {
            if (!m2mRelations.hasOwnProperty(key)) {
                const field = this.virtualFields[key];
                if (
                    userProps.hasOwnProperty(key) &&
                    field instanceof ManyToMany
                ) {
                    // If a value is supplied for a ManyToMany field,
                    // discard them from props and save for later processing.
                    m2mRelations[key] = userProps[key];
                    delete props[key];
                }
            }
        });

        const newEntry = this.session.applyUpdate({
            action: CREATE,
            table: this.modelName,
            payload: props,
        });

        const ThisModel = this;
        const instance = new ThisModel(newEntry);
        instance._refreshMany2Many(m2mRelations); // eslint-disable-line no-underscore-dangle
        return instance;
    }

    /**
     * Creates a new or update existing record in the database, instantiates a {@link Model} and returns it.
     *
     * If you pass values for many-to-many fields, instances are created on the through
     * model as well.
     *
     * @param  {Object} userProps - the required {@link Model}'s properties.
     * @return {Model} a {@link Model} instance.
     */
    static upsert(userProps) {
        if (typeof this.session === "undefined") {
            throw new Error(
                [
                    `Tried to upsert a ${this.modelName} model instance without a session. `,
                    "Create a session using `session = orm.session()` and call ",
                    `\`session["${this.modelName}"].upsert\` instead.`,
                ].join("")
            );
        }

        const { idAttribute } = this;
        if (userProps.hasOwnProperty(idAttribute)) {
            const id = userProps[idAttribute];
            if (this.idExists(id)) {
                const model = this.withId(id);
                model.update(userProps);
                return model;
            }
        }

        return this.create(userProps);
    }

    /**
     * Returns a {@link Model} instance for the object with id `id`.
     * Returns `null` if the model has no instance with id `id`.
     *
     * You can use {@link Model#idExists} to check for existence instead.
     *
     * @param  {*} id - the `id` of the object to get
     * @throws If object with id `id` doesn't exist
     * @return {Model|null} {@link Model} instance with id `id`
     */
    static withId(id) {
        return this.get({
            [this.idAttribute]: id,
        });
    }

    /**
     * Returns a boolean indicating if an entity
     * with the id `id` exists in the state.
     *
     * @param  {*}  id - a value corresponding to the id attribute of the {@link Model} class.
     * @return {Boolean} a boolean indicating if entity with `id` exists in the state
     *
     * @since 0.11.0
     */
    static idExists(id) {
        return this.exists({
            [this.idAttribute]: id,
        });
    }

    /**
     * Returns a boolean indicating if an entity
     * with the given props exists in the state.
     *
     * @param  {*}  props - a key-value that {@link Model} instances should have to be considered as existing.
     * @return {Boolean} a boolean indicating if entity with `props` exists in the state
     */
    static exists(lookupObj) {
        if (typeof this.session === "undefined") {
            throw new Error(
                [
                    `Tried to check if a ${this.modelName} model instance exists without a session. `,
                    "Create a session using `session = orm.session()` and call ",
                    `\`session["${this.modelName}"].exists\` instead.`,
                ].join("")
            );
        }

        return Boolean(this._findDatabaseRows(lookupObj).length);
    }

    /**
     * Gets the {@link Model} instance that matches properties in `lookupObj`.
     * Throws an error if {@link Model} if multiple records match
     * the properties.
     *
     * @param  {Object} lookupObj - the properties used to match a single entity.
     * @throws {Error} If more than one entity matches the properties in `lookupObj`.
     * @return {Model} a {@link Model} instance that matches the properties in `lookupObj`.
     */
    static get(lookupObj) {
        const ThisModel = this;

        const rows = this._findDatabaseRows(lookupObj);
        if (rows.length === 0) {
            return null;
        }
        if (rows.length > 1) {
            throw new Error(
                `Expected to find a single row in \`${this.modelName}.get\`. Found ${rows.length}.`
            );
        }

        return new ThisModel(rows[0]);
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
     * It contains all the properties that you pass when creating the model,
     * except for primary keys of many-to-many relationships with a custom accessor.
     *
     * Make sure never to mutate this.
     *
     * @return {Object} a reference to the plain JS object in the store
     */
    get ref() {
        const ThisModel = this.getClass();

        // eslint-disable-next-line no-underscore-dangle
        return ThisModel._findDatabaseRows({
            [ThisModel.idAttribute]: this.getId(),
        })[0];
    }

    /**
     * Finds all rows in this model's table that match the given `lookupObj`.
     * If no `lookupObj` is passed, all rows in the model's table will be returned.
     *
     * @param  {*}  props - a key-value that {@link Model} instances should have to be considered as existing.
     * @return {Boolean} a boolean indicating if entity with `props` exists in the state
     * @private
     */
    static _findDatabaseRows(lookupObj) {
        const querySpec = {
            table: this.modelName,
        };
        if (lookupObj) {
            querySpec.clauses = [
                {
                    type: FILTER,
                    payload: lookupObj,
                },
            ];
        }
        return this.session.query(querySpec).rows;
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
        const fields = fieldNames
            .map((fieldName) => {
                const field = ThisModel.fields[fieldName];
                if (field instanceof ManyToMany) {
                    const ids = this[fieldName]
                        .toModelArray()
                        .map((model) => model.getId());
                    return `${fieldName}: [${ids.join(", ")}]`;
                }
                const val = this._fields[fieldName];
                return `${fieldName}: ${val}`;
            })
            .join(", ");
        return `${className}: {${fields}}`;
    }

    /**
     * Returns a boolean indicating if `otherModel` equals this {@link Model} instance.
     * Equality is determined by shallow comparing their attributes.
     *
     * This equality is used when you call {@link Model#update}.
     * You can prevent model updates by returning `true` here.
     * However, a model will always be updated if its relationships are changed.
     *
     * @param  {Model} otherModel - a {@link Model} instance to compare
     * @return {Boolean} a boolean indicating if the {@link Model} instance's are equal.
     */
    equals(otherModel) {
        // eslint-disable-next-line no-underscore-dangle
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
        this.update({
            [propertyName]: value,
        });
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
        if (typeof ThisModel.session === "undefined") {
            throw new Error(
                [
                    `Tried to update a ${ThisModel.modelName} model instance without a session. `,
                    "You cannot call `.update` on an instance that you did not receive from the database.",
                ].join("")
            );
        }

        const mergeObj = { ...userMergeObj };

        const { fields, virtualFields } = ThisModel;

        const m2mRelations = {};

        // If an array of entities or id's is supplied for a
        // many-to-many related field, clear the old relations
        // and add the new ones.
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (const mergeKey in mergeObj) {
            const isRealField = fields.hasOwnProperty(mergeKey);

            if (isRealField) {
                const field = fields[mergeKey];

                if (field instanceof ForeignKey || field instanceof OneToOne) {
                    // update one-one/fk relations
                    mergeObj[mergeKey] = normalizeEntity(mergeObj[mergeKey]);
                } else if (field instanceof ManyToMany) {
                    // field is forward relation
                    m2mRelations[mergeKey] = mergeObj[mergeKey];

                    if (!field.as) {
                        /**
                         * The relationship does not have an accessor
                         * Discard the value from props as the field will be populated later with instances
                         * from the target models when refreshing the M2M relations.
                         * If the relationship does have an accessor (`as`) field then we do want to keep this
                         * original value in the props to expose the raw list of IDs from the instance.
                         */
                        delete mergeObj[mergeKey];
                    }
                }
            } else if (virtualFields.hasOwnProperty(mergeKey)) {
                const field = virtualFields[mergeKey];
                if (field instanceof ManyToMany) {
                    // field is backward relation
                    m2mRelations[mergeKey] = mergeObj[mergeKey];
                    delete mergeObj[mergeKey];
                }
            }
        }

        const mergedFields = {
            ...this._fields,
            ...mergeObj,
        };

        const updatedModel = new ThisModel(mergedFields);
        // only update fields if they have changed (referentially)
        if (!this.equals(updatedModel)) {
            this._initFields(mergedFields);
            ThisModel.session.applyUpdate({
                action: UPDATE,
                query: getByIdQuery(this),
                payload: mergeObj,
            });
        }

        // update virtual fields
        this._refreshMany2Many(m2mRelations);
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
        const ThisModel = this.getClass();
        if (typeof ThisModel.session === "undefined") {
            throw new Error(
                [
                    `Tried to delete a ${ThisModel.modelName} model instance without a session. `,
                    "You cannot call `.delete` on an instance that you did not receive from the database.",
                ].join("")
            );
        }

        this._onDelete();
        ThisModel.session.applyUpdate({
            action: DELETE,
            query: getByIdQuery(this),
        });
    }

    /**
     * Update many-many relations for model.
     * @param relations
     * @return undefined
     * @private
     */
    _refreshMany2Many(relations) {
        const ThisModel = this.getClass();
        const { fields, virtualFields, modelName } = ThisModel;

        Object.keys(relations).forEach((name) => {
            const reverse = !fields.hasOwnProperty(name);
            const field = virtualFields[name];
            const values = relations[name];

            if (!Array.isArray(values)) {
                throw new TypeError(
                    `Failed to resolve many-to-many relationship: ${modelName}[${name}] must be an array (passed: ${values})`
                );
            }

            const normalizedNewIds = values.map(normalizeEntity);
            const uniqueIds = [...new Set(normalizedNewIds)];

            if (normalizedNewIds.length !== uniqueIds.length) {
                throw new Error(
                    `Found duplicate id(s) when passing "${normalizedNewIds}" to ${ThisModel.modelName}.${name} value`
                );
            }

            const throughModelName =
                field.through || m2mName(ThisModel.modelName, name);
            const ThroughModel = ThisModel.session[throughModelName];

            let fromField;
            let toField;

            if (!reverse) {
                ({ from: fromField, to: toField } = field.throughFields);
            } else {
                ({ from: toField, to: fromField } = field.throughFields);
            }

            const currentIds = ThroughModel.filter(
                (through) => through[fromField] === this[ThisModel.idAttribute]
            )
                .toRefArray()
                .map((ref) => ref[toField]);

            const diffActions = arrayDiffActions(currentIds, normalizedNewIds);

            if (diffActions) {
                const { delete: idsToDelete, add: idsToAdd } = diffActions;
                if (idsToDelete.length > 0) {
                    this[field.as || name].remove(...idsToDelete);
                }

                if (idsToAdd.length > 0) {
                    this[field.as || name].add(...idsToAdd);
                }
            }
        });
    }

    /**
     * @return {undefined}
     * @private
     */
    _onDelete() {
        const { virtualFields } = this.getClass();
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (const key in virtualFields) {
            const field = virtualFields[key];
            if (field instanceof ManyToMany) {
                // Delete any many-to-many rows the entity is included in.
                const descriptorKey = field.as || key;
                this[descriptorKey].clear();
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

    // DEPRECATED AND REMOVED METHODS

    /**
     * Returns a boolean indicating if an entity
     * with the id `id` exists in the state.
     *
     * @param  {*}  id - a value corresponding to the id attribute of the {@link Model} class.
     * @return {Boolean} a boolean indicating if entity with `id` exists in the state
     * @deprecated Please use {@link Model.idExists} instead.
     */
    static hasId(id) {
        console.warn(
            "`Model.hasId` has been deprecated. Please use `Model.idExists` instead."
        );
        return this.idExists(id);
    }

    /**
     * @deprecated See the 0.9 migration guide on the GitHub repo.
     * @throws {Error} Due to deprecation.
     */
    getNextState() {
        throw new Error(
            "`Model.prototype.getNextState` has been removed. See the 0.9 " +
                "migration guide on the GitHub repo."
        );
    }
};

Model.fields = {
    id: attr(),
};
Model.virtualFields = {};
Model.querySetClass = QuerySet;

export default Model;
