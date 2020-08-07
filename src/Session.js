import { getBatchToken } from "immutable-ops";

import { SUCCESS, UPDATE, DELETE } from "./constants";
import { warnDeprecated, clauseFiltersByAttribute } from "./utils";

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

        this.withMutations = Boolean(withMutations);
        this.batchToken = batchToken || getBatchToken();

        this.modelData = {};

        this.models = schema.getModelClasses();

        this.sessionBoundModels = this.models.map((modelClass) => {
            function SessionBoundModel() {
                return Reflect.construct(
                    modelClass,
                    arguments,
                    SessionBoundModel
                ); // eslint-disable-line prefer-rest-params
            }
            Reflect.setPrototypeOf(
                SessionBoundModel.prototype,
                modelClass.prototype
            );
            Reflect.setPrototypeOf(SessionBoundModel, modelClass);

            Object.defineProperty(this, modelClass.modelName, {
                get: () => SessionBoundModel,
            });

            SessionBoundModel.connect(this);
            return SessionBoundModel;
        });
    }

    getDataForModel(modelName) {
        if (!this.modelData[modelName]) {
            this.modelData[modelName] = {};
        }
        return this.modelData[modelName];
    }

    getModelData() {
        return this.modelData;
    }

    markAccessed(modelName, modelIds) {
        const data = this.getDataForModel(modelName);
        if (!data.accessedInstances) {
            data.accessedInstances = {};
        }
        modelIds.forEach((id) => {
            data.accessedInstances[id] = true;
        });
    }

    get accessedModelInstances() {
        return Object.entries(this.getModelData()).reduce(
            (result, [key, value]) => {
                if (value.accessedInstances) {
                    result[key] = value.accessedInstances;
                }
                return result;
            },
            {}
        );
    }

    markFullTableScanned(modelName) {
        const data = this.getDataForModel(modelName);
        data.fullTableScanned = true;
    }

    get fullTableScannedModels() {
        return Object.entries(this.getModelData()).reduce(
            (result, [key, value]) => {
                if (value.fullTableScanned) {
                    result.push(key);
                }
                return result;
            },
            []
        );
    }

    markAccessedIndexes(indexes) {
        indexes.forEach(([table, attr, value]) => {
            const data = this.getDataForModel(table);
            if (!data.accessedIndexes) {
                data.accessedIndexes = {};
            }
            data.accessedIndexes[attr] = [
                ...(data.accessedIndexes[attr] || []),
                value,
            ];
        });
    }

    get accessedIndexes() {
        return Object.entries(this.getModelData()).reduce(
            (result, [key, value]) => {
                if (value.accessedIndexes) {
                    result[key] = value.accessedIndexes;
                }
                return result;
            },
            {}
        );
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
            throw new Error(
                `Applying update failed with status ${status}. Payload: ${payload}`
            );
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
        let { batchToken } = this;
        if ([UPDATE, DELETE].includes(action)) {
            batchToken = getBatchToken();
        }
        return { batchToken, withMutations };
    }

    _markAccessedByQuery(querySpec, result) {
        const { table, clauses } = querySpec;
        const { rows } = result;

        const { idAttribute } = this[table];
        const accessedIds = new Set(rows.map((row) => row[idAttribute]));

        const anyClauseFilteredByPk = clauses.some((clause) => {
            if (!clauseFiltersByAttribute(clause, idAttribute)) {
                return false;
            }
            /**
             * We previously knew which row we wanted to access,
             * so there was no need to scan the entire table.
             */
            accessedIds.add(clause.payload[idAttribute]);
            return true;
        });

        const accessedIndexes = [];
        const { indexes } = this.state[table];
        clauses.forEach((clause) => {
            Object.keys(indexes).forEach((attr) => {
                if (!clauseFiltersByAttribute(clause, attr)) {
                    return;
                }
                const value = clause.payload[attr];
                accessedIndexes.push([table, attr, value]);
            });
        });

        if (anyClauseFilteredByPk) {
            /**
             * The clauses have been ordered so that an indexed one was
             * the first to have been evaluated, and thus only the row
             * with the specified PK value has actually been accessed.
             */
            this.markAccessed(table, accessedIds);
        } else if (accessedIndexes.length) {
            /**
             * At least one clause was optimized using indexes.
             */
            this.markAccessed(table, accessedIds);
            this.markAccessedIndexes(accessedIndexes);
        } else {
            /**
             * At least one clause could not be efficiently optimized
             * or no clause was specified at all.
             */
            this.markFullTableScanned(table);
        }
    }

    // DEPRECATED AND REMOVED METHODS

    /**
     * @deprecated Access {@link Session#state} instead.
     */
    getNextState() {
        warnDeprecated(
            "`Session.prototype.getNextState` has been deprecated. Access " +
                "the `Session.prototype.state` property instead."
        );
        return this.state;
    }

    /**
     * @deprecated
     * The Redux integration API is now decoupled from ORM and Session.<br>
     * See the 0.9 migration guide in the GitHub repo.
     */
    reduce() {
        throw new Error(
            "`Session.prototype.reduce` has been removed. The Redux integration API " +
                "is now decoupled from ORM and Session - see the 0.9 migration guide " +
                "in the GitHub repo."
        );
    }
};

export default Session;
