import { getBatchToken } from 'immutable-ops';
import { ops } from './utils';

/**
 * Session handles a single
 * action dispatch.
 */
const Session = class Session {
    /**
     * Creates a new Session.
     *
     * @param  {Schema} schema - a {@link Schema} instance
     * @param  {Object} state - the database state
     * @param  {Object} [action] - the current action in the dispatch cycle.
     *                             Will be passed to the user defined reducers.
     * @param  {Boolean} [withMutations] - whether the session should mutate data
     * @param  {Object} [batchToken] - used by the backend to identify objects that can be
     *                                 mutated.
     */
    constructor(schema, state, action, withMutations, batchToken) {
        this.schema = schema;
        this.state = state || schema.getDefaultState();
        this.initialState = this.state;

        this.action = action;
        this.withMutations = !!withMutations;
        this.batchToken = batchToken || getBatchToken();

        this._accessedModels = {};
        this.modelData = {};

        this.models = schema.getModelClasses();

        this.sessionBoundModels = this.models.map(modelClass => {
            const sessionBoundModel = class SessionBoundModel extends modelClass {};
            Object.defineProperty(this, modelClass.modelName, {
                get: () => sessionBoundModel,
            });

            sessionBoundModel.connect(this);
            return sessionBoundModel;
        });
    }

    markAccessed(model) {
        this.getDataForModel(model.modelName).accessed = true;
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
     *                          `type`, `payload` and `meta`. `meta`
     *                          must also include a `name` attribute
     *                          that contains the model name.
     */
    applyUpdate(update) {
        const modelName = update.meta.name;
        const modelState = this.getState(modelName);
        const newState = this[modelName].applyUpdate(
            modelState,
            update,
            this.withMutations,
            this.batchToken
        );
        this.updateState(modelName, newState);
    }

    /**
     * Gets the current state for the model with name `modelName`.
     *
     * @private
     * @param  {string} modelName - the name of the model to get state for.
     * @return {*} The state for model with name `modelName`.
     */
    getState(modelName) {
        return this.state[modelName];
    }

    /**
     * Updates the current state for the model with name `modelName`.
     *
     * @private
     * @param  {string} modelName - the name of the model to get state for.
     * @param  {*} newState - the new state for the model.
     * @return {undefined}
     */
    updateState(modelName, newState) {
        const newDBState = ops.batch.set(this.batchToken, modelName, newState, this.state);
        this.state = newDBState;
    }

    /**
     * Applies recorded updates and returns the next state.
     * @param  {Object} [opts] - Options object
     * @param  {Boolean} [opts.runReducers] - A boolean indicating if the user-defined
     *                                        model reducers should be run. If not specified,
     *                                        is set to `true` if an action object was specified
     *                                        on session instantiation, otherwise `false`.
     * @return {Object} The next state
     */
    getNextState(userOpts) {
        if (this.withMutations || !this.action) return this.state;
        const { runReducers } = (userOpts || {});

        if (runReducers) {
            this.sessionBoundModels.forEach(modelClass => {
                const modelState = this.getState(modelClass.modelName);
                const nextState = modelClass.reducer(modelState, this.action, modelClass, this);
                this.updateState(modelClass.modelName, nextState || modelClass.getNextState());
            });
        }
        return this.state;
    }

    /**
     * Calls the user-defined reducers and returns the next state.
     * If the session uses mutations, just returns the state.
     * Delegates to {@link Session#getNextState}
     *
     * @return {Object} the next state
     */
    reduce() {
        return this.getNextState({ runReducers: true });
    }
};

export default Session;
