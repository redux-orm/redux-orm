import forOwn from 'lodash/forOwn';
import find from 'lodash/find';

import Session from './Session';
import Model from './Model';
import { createDatabase as defaultCreateDatabase } from './db';
import {
    ForeignKey,
    ManyToMany,
} from './fields';

import {
    m2mName,
    attachQuerySetMethods,
    m2mToFieldName,
    m2mFromFieldName,
} from './utils';

const ORM_DEFAULTS = {
    createDatabase: defaultCreateDatabase,
};

/**
 * Schema's responsibility is tracking the set of {@link Model} classes used in the database.
 * To include your model in that set, Schema offers {@link Schema#register} and a
 * shortcut {@link Schema#define} methods.
 *
 * Schema also handles starting a Session with {@link Schema#from}.
 */
const ORM = class ORM {
    /**
     * Creates a new Schema.
     */
    constructor(opts) {
        const { createDatabase } = Object.assign({}, ORM_DEFAULTS, (opts || {}));
        this.createDatabase = createDatabase;
        this.registry = [];
        this.implicitThroughModels = [];
        this.installedFields = {};
    }

    /**
     * Registers a {@link Model} class to the schema.
     *
     * If the model has declared any ManyToMany fields, their
     * through models will be generated and registered with
     * this call.
     *
     * @param  {...Model} model - a {@link Model} class to register
     * @return {undefined}
     */
    register(...models) {
        models.forEach(model => {
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
            (model) => model.modelName === modelName
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
        models.forEach(model => {
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
            const tableSpec = modelClass._getTableOpts();
            spec[tableName] = Object.assign({}, tableSpec, { fields: modelClass.fields });
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
     * Returns the default state.
     * @return {Object} the default state
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

    // Alias for session.
    from(state) {
        return this.session(state);
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
};

export default ORM;
