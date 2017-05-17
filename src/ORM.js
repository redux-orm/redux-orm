import forOwn from 'lodash/forOwn';
import find from 'lodash/find';

import Session from './Session';
import Model from './Model';
import { createDatabase as defaultCreateDatabase } from './db';
import {
    ForeignKey,
    ManyToMany,
    attr,
} from './fields';

import {
    createReducer,
    createSelector,
} from './redux';

import {
    m2mName,
    attachQuerySetMethods,
    m2mToFieldName,
    m2mFromFieldName,
    warnDeprecated,
} from './utils';

const ORM_DEFAULTS = {
    createDatabase: defaultCreateDatabase,
};

/**
 * ORM - the Object Relational Mapper.
 *
 * Use instances of this class to:
 *
 * - Register your {@link Model} classes using {@link ORM#register}
 * - Get the empty state for the underlying database with {@link ORM#getEmptyState}
 * - Start an immutable database session with {@link ORM#session}
 * - Start a mutating database session with {@link ORM#mutableSession}
 *
 * Internally, this class handles generating a schema specification from models
 * to the database.
 */
export const ORM = class ORM {
    /**
     * Creates a new ORM instance.
     */
    constructor(opts) {
        const { createDatabase } = Object.assign({}, ORM_DEFAULTS, (opts || {}));
        this.createDatabase = createDatabase;
        this.registry = [];
        this.implicitThroughModels = [];
        this.installedFields = {};
    }

    /**
     * Registers a {@link Model} class to the ORM.
     *
     * If the model has declared any ManyToMany fields, their
     * through models will be generated and registered with
     * this call, unless a custom through model has been specified.
     *
     * @param  {...Model} model - a {@link Model} class to register
     * @return {undefined}
     */
    register(...models) {
        models.forEach((model) => {
            model.invalidateClassCache();

            this.registerManyToManyModelsFor(model);
            this.registry.push(model);
        });
    }

    registerManyToManyModelsFor(model) {
        const fields = model.fields;
        const thisModelName = model.modelName;

        forOwn(fields, (fieldInstance, fieldName) => {
            if (fieldInstance instanceof ManyToMany && !fieldInstance.through) {
                let toModelName;
                if (fieldInstance.toModelName === 'this') {
                    toModelName = thisModelName;
                } else {
                    toModelName = fieldInstance.toModelName;
                }

                const fromFieldName = m2mFromFieldName(thisModelName);
                const toFieldName = m2mToFieldName(toModelName);

                const Through = class ThroughModel extends Model {};

                Through.modelName = m2mName(thisModelName, fieldName);

                Through.fields = {
                    id: attr(),
                    [fromFieldName]: new ForeignKey(thisModelName),
                    [toFieldName]: new ForeignKey(toModelName),
                };

                Through.invalidateClassCache();
                this.implicitThroughModels.push(Through);
            }
        });
    }

    /**
     * Gets a {@link Model} class by its name from the registry.
     * @param  {string} modelName - the name of the {@link Model} class to get
     * @throws If {@link Model} class is not found.
     * @return {Model} the {@link Model} class, if found
     */
    get(modelName) {
        const found = find(
            this.registry.concat(this.implicitThroughModels),
            model => model.modelName === modelName
        );

        if (typeof found === 'undefined') {
            throw new Error(`Did not find model ${modelName} from registry.`);
        }
        return found;
    }

    getModelClasses() {
        this._setupModelPrototypes(this.registry);
        this._setupModelPrototypes(this.implicitThroughModels);
        return this.registry.concat(this.implicitThroughModels);
    }

    _attachQuerySetMethods(model) {
        const { querySetClass } = model;
        attachQuerySetMethods(model, querySetClass);
    }

    isFieldInstalled(modelName, fieldName) {
        return this.installedFields.hasOwnProperty(modelName)
            ? !!this.installedFields[modelName][fieldName]
            : false;
    }

    setFieldInstalled(modelName, fieldName) {
        if (!this.installedFields.hasOwnProperty(modelName)) {
            this.installedFields[modelName] = {};
        }
        this.installedFields[modelName][fieldName] = true;
    }

    _setupModelPrototypes(models) {
        models.forEach((model) => {
            if (!model.isSetUp) {
                const fields = model.fields;
                forOwn(fields, (fieldInstance, fieldName) => {
                    if (!this.isFieldInstalled(model.modelName, fieldName)) {
                        fieldInstance.install(model, fieldName, this);
                        this.setFieldInstalled(model.modelName, fieldName);
                    }
                });
                this._attachQuerySetMethods(model);
                model.isSetUp = true;
            }
        });
    }

    generateSchemaSpec() {
        const models = this.getModelClasses();
        const tables = models.reduce((spec, modelClass) => {
            const tableName = modelClass.modelName;
            const tableSpec = modelClass._getTableOpts(); // eslint-disable-line no-underscore-dangle
            spec[tableName] = Object.assign({}, { fields: modelClass.fields }, tableSpec);
            return spec;
        }, {});
        return { tables };
    }

    getDatabase() {
        if (!this.db) {
            this.db = this.createDatabase(this.generateSchemaSpec());
        }
        return this.db;
    }

    /**
     * Returns the empty database state.
     * @return {Object} the empty state
     */
    getEmptyState() {
        return this.getDatabase().getEmptyState();
    }

    /**
     * Begins an immutable database session.
     *
     * @param  {Object} state  - the state the database manages
     * @return {Session} a new {@link Session} instance
     */
    session(state) {
        return new Session(this, this.getDatabase(), state);
    }

    /**
     * Begins a mutable database session.
     *
     * @param  {Object} state  - the state the database manages
     * @return {Session} a new {@link Session} instance
     */
    mutableSession(state) {
        return new Session(this, this.getDatabase(), state, true);
    }

    // DEPRECATED AND REMOVED METHODS

    withMutations(state) {
        warnDeprecated(
            'ORM.prototype.withMutations is deprecated. ' +
            'Use ORM.prototype.mutableSession instead.'
        );

        return this.mutableSession(state);
    }

    from(state) {
        warnDeprecated(
            'ORM.prototype.from function is deprecated. ' +
            'Use ORM.prototype.session instead.'
        );
        return this.session(state);
    }

    reducer() {
        warnDeprecated(
            'ORM.prototype.reducer is deprecated. Access ' +
            'the Session.prototype.state property instead.'
        );
        return createReducer(this);
    }

    createSelector(...args) {
        warnDeprecated(
            'ORM.prototype.createSelector is deprecated. ' +
            'Import `createSelector` from Redux-ORM instead.'
        );
        return createSelector(this, ...args);
    }

    getDefaultState() {
        warnDeprecated(
            'ORM.prototype.getDefaultState is deprecated. Use ' +
            'the ORM.prototype.getEmptyState instead.'
        );
        return this.getEmptyState();
    }

    define() {
        throw new Error(
            'ORM.prototype.define is removed. Please define a Model class.'
        );
    }
};

export function DeprecatedSchema() {
    throw new Error(
        'Schema has been renamed to ORM. Please import ORM instead of Schema ' +
        'from Redux-ORM.'
    );
}

export default ORM;
