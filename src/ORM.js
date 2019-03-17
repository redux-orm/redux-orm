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
export class ORM {
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
            if (model.modelName === undefined) {
                throw new Error('A model was passed that doesn\'t have a modelName set');
            }

            model.invalidateClassCache();

            this.registerManyToManyModelsFor(model);
            this.registry.push(model);
        });
    }

    registerManyToManyModelsFor(model) {
        const { fields } = model;
        const thisModelName = model.modelName;

        Object.entries(fields).forEach(([fieldName, fieldInstance]) => {
            if (!(fieldInstance instanceof ManyToMany)) {
                return;
            }

            let toModelName;
            if (fieldInstance.toModelName === 'this') {
                toModelName = thisModelName;
            } else {
                toModelName = fieldInstance.toModelName; // eslint-disable-line prefer-destructuring
            }

            const selfReferencing = thisModelName === toModelName;
            const fromFieldName = m2mFromFieldName(thisModelName);
            const toFieldName = m2mToFieldName(toModelName);

            if (fieldInstance.through) {
                if (selfReferencing && !fieldInstance.throughFields) {
                    throw new Error(
                        'Self-referencing many-to-many relationship at ' +
                        `"${thisModelName}.${fieldName}" using custom ` +
                        `model "${fieldInstance.through}" has no ` +
                        'throughFields key. Cannot determine which ' +
                        'fields reference the instances partaking ' +
                        'in the relationship.'
                    );
                }
            } else {
                const Through = class ThroughModel extends Model {};

                Through.modelName = m2mName(thisModelName, fieldName);

                const PlainForeignKey = class ThroughForeignKeyField extends ForeignKey {
                    get installsBackwardsVirtualField() {
                        return false;
                    }

                    get installsBackwardsDescriptor() {
                        return false;
                    }
                };
                const ForeignKeyClass = selfReferencing
                    ? PlainForeignKey
                    : ForeignKey;
                Through.fields = {
                    id: attr(),
                    [fromFieldName]: new ForeignKeyClass(thisModelName),
                    [toFieldName]: new ForeignKeyClass(toModelName),
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
        const allModels = this.registry.concat(this.implicitThroughModels);
        const found = Object.values(allModels).find(
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

    /**
     * @private
     */
    _setupModelPrototypes(models) {
        models.forEach((model) => {
            if (!model.isSetUp) {
                const { fields, modelName, querySetClass } = model;
                Object.entries(fields).forEach(([fieldName, field]) => {
                    if (!this._isFieldInstalled(modelName, fieldName)) {
                        this._installField(field, fieldName, model);
                        this._setFieldInstalled(modelName, fieldName);
                    }
                });
                attachQuerySetMethods(model, querySetClass);
                model.isSetUp = true;
            }
        });
    }

    /**
     * @private
     */
    _isFieldInstalled(modelName, fieldName) {
        return this.installedFields.hasOwnProperty(modelName)
            ? !!this.installedFields[modelName][fieldName]
            : false;
    }

    /**
     * @private
     */
    _setFieldInstalled(modelName, fieldName) {
        if (!this.installedFields.hasOwnProperty(modelName)) {
            this.installedFields[modelName] = {};
        }
        this.installedFields[modelName][fieldName] = true;
    }

    /**
     * Installs a field on a model and its related models if necessary.
     * @private
     */
    _installField(field, fieldName, model) {
        const FieldInstaller = field.installerClass;
        (new FieldInstaller({
            field,
            fieldName,
            model,
            orm: this,
        })).run();
    }

    // DEPRECATED AND REMOVED METHODS

    /**
     * @deprecated Use {@link ORM#mutableSession} instead.
     */
    withMutations(state) {
        warnDeprecated(
            '`ORM.prototype.withMutations` has been deprecated. ' +
            'Use `ORM.prototype.mutableSession` instead.'
        );
        return this.mutableSession(state);
    }

    /**
     * @deprecated Use {@link ORM#session} instead.
     */
    from(state) {
        warnDeprecated(
            '`ORM.prototype.from` has been deprecated. ' +
            'Use `ORM.prototype.session` instead.'
        );
        return this.session(state);
    }

    /**
     * @deprecated Access {@link Session#state} instead.
     */
    reducer() {
        warnDeprecated(
            '`ORM.prototype.reducer` has been deprecated. Access ' +
            'the `Session.prototype.state` property instead.'
        );
        return createReducer(this);
    }

    /**
     * @deprecated Use `import { createSelector } from "redux-orm"` instead.
     */
    createSelector(...args) {
        warnDeprecated(
            '`ORM.prototype.createSelector` has been deprecated. ' +
            'Import `createSelector` from Redux-ORM instead.'
        );
        return createSelector(this, ...args);
    }

    /**
     * @deprecated Use {@link ORM#getEmptyState} instead.
     */
    getDefaultState() {
        warnDeprecated(
            '`ORM.prototype.getDefaultState` has been deprecated. Use ' +
            '`ORM.prototype.getEmptyState` instead.'
        );
        return this.getEmptyState();
    }

    /**
     * @deprecated Define a Model class instead.
     */
    define() {
        throw new Error(
            '`ORM.prototype.define` has been removed. Please define a Model class.'
        );
    }
}

export function DeprecatedSchema() {
    throw new Error(
        'Schema has been renamed to ORM. Please import ORM instead of Schema ' +
        'from Redux-ORM.'
    );
}

export default ORM;
