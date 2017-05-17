import { getBatchToken } from 'immutable-ops';

import { SUCCESS } from './constants';
import { warnDeprecated } from './utils';

const Session = class Session {
    /**
     * Creates a new Session.
     *
     * @param  {Database} db - a {@link Database} instance
     * @param  {Object} state - the database state
     * @param  {Boolean} [withMutations] - whether the session should mutate data
     * @param  {Object} [batchToken] - used by the backend to identify objects that can be
     *                                 mutated.
     */
    constructor(schema, db, state, withMutations, batchToken) {
        this.schema = schema;
        this.db = db;
        this.state = state || db.getEmptyState();
        this.initialState = this.state;

        this.withMutations = !!withMutations;
        this.batchToken = batchToken || getBatchToken();

        this._accessedModels = {};
        this.modelData = {};

        this.models = schema.getModelClasses();

        this.sessionBoundModels = this.models.map((modelClass) => {
            const sessionBoundModel = class SessionBoundModel extends modelClass {};
            Object.defineProperty(this, modelClass.modelName, {
                get: () => sessionBoundModel,
            });

            sessionBoundModel.connect(this);
            return sessionBoundModel;
        });
    }

    markAccessed(modelName) {
        this.getDataForModel(modelName).accessed = true;
    }

    get accessedModels() {
        return this.sessionBoundModels
            .filter(model => !!this.getDataForModel(model.modelName).accessed)
            .map(model => model.modelName);
    }

    getDataForModel(modelName) {
        if (!this.modelData[modelName]) {
            this.modelData[modelName] = {};
        }
        return this.modelData[modelName];
    }

    /**
     * Applies update to a model state.
     *
     * @private
     * @param {Object} update - the update object. Must have keys
     *                          `type`, `payload`.
     */
    applyUpdate(updateSpec) {
        const { batchToken, withMutations } = this;
        const tx = { batchToken, withMutations };
        const result = this.db.update(updateSpec, tx, this.state);
        const { status, state } = result;

        if (status === SUCCESS) {
            this.state = state;
        } else {
            throw new Error(`Applying update failed: ${result.toString()}`);
        }

        return result.payload;
    }

    query(querySpec) {
        const { table } = querySpec;
        this.markAccessed(table);
        return this.db.query(querySpec, this.state);
    }

    // DEPRECATED AND REMOVED METHODS

    getNextState() {
        warnDeprecated(
            'Session.prototype.getNextState function is deprecated. Access ' +
            'the Session.prototype.state property instead.'
        );
        return this.state;
    }

    reduce() {
        throw new Error(
            'Session.prototype.reduce is removed. The Redux integration API ' +
            'is now decoupled from ORM and Session - see the 0.9 migration guide ' +
            'in the GitHub repo.'
        );
    }
};

export default Session;
