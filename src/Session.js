import { getBatchToken } from 'immutable-ops';

import { SUCCESS, FILTER, EXCLUDE, ORDER_BY, UPDATE, DELETE } from './constants';
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

    getDataForModel(modelName) {
        if (!this.modelData[modelName]) {
            this.modelData[modelName] = {};
        }
        return this.modelData[modelName];
    }

    markAccessed(modelName, modelIds = []) {
        const data = this.getDataForModel(modelName);
        if (!data.accessedInstances) {
            data.accessedInstances = {};
        }
        modelIds.forEach((id) => {
            data.accessedInstances[id] = true;
        });
    }

    get accessedModelInstances() {
        return this.sessionBoundModels
            .filter(({ modelName }) => !!this.getDataForModel(modelName).accessedInstances)
            .reduce(
                (result, { modelName }) => ({
                    ...result,
                    [modelName]: this.getDataForModel(modelName).accessedInstances,
                }),
                {}
            );
    }

    markFullTableScanned(modelName) {
        const data = this.getDataForModel(modelName);
        data.fullTableScanned = true;
    }

    get fullTableScannedModels() {
        return this.sessionBoundModels
            .filter(({ modelName }) => !!this.getDataForModel(modelName).fullTableScanned)
            .map(({ modelName }) => modelName);
    }

    /**
     * Applies update to a model state.
     *
     * @private
     * @param {Object} update - the update object. Must have keys
     *                          `type`, `payload`.
     */
    applyUpdate(updateSpec) {
        const tx = this._getTransaction(updateSpec);
        const result = this.db.update(updateSpec, tx, this.state);
        const { status, state, payload } = result;

        if (status !== SUCCESS) {
            throw new Error(`Applying update failed: ${result.toString()}`);
        }

        this.state = state;

        return payload;
    }

    query(querySpec) {
        const result = this.db.query(querySpec, this.state);

        this._markAccessedByQuery(querySpec, result);

        return result;
    }

    _getTransaction(updateSpec) {
        const { withMutations } = this;
        const { action } = updateSpec;
        let batchToken = this.batchToken;
        if ([UPDATE, DELETE].includes(action)) {
            batchToken = getBatchToken();
        }
        return { batchToken, withMutations };
    }

    _markAccessedByQuery(querySpec, result) {
        const { table, clauses } = querySpec;
        const { rows } = result;
        let neededFullTableScan = false;

        const idAttribute = this[table].idAttribute;
        const accessedIds = new Set(rows.map(
            row => row[this[table].idAttribute]
        ));

        clauses.forEach(({ type, payload }) => {
            if ([ORDER_BY, EXCLUDE].includes(type)) {
                neededFullTableScan = true;
                return;
            }
            if (type === FILTER) {
                const id = payload[idAttribute];
                if (id !== null && id !== undefined) {
                    accessedIds.add(id);
                } else {
                    neededFullTableScan = true;
                }
            }
        });

        this.markAccessed(table, accessedIds);
        if (neededFullTableScan) {
            this.markFullTableScanned(table);
        }
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
