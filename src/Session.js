import partition from 'lodash/partition';
import Transaction from './Transaction';

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
     * @param  {Boolean} withMutations - whether the session should mutate data
     */
    constructor(schema, state, action, withMutations) {
        this.schema = schema;
        this.state = state || schema.getDefaultState();
        this.action = action;
        this.withMutations = !!withMutations;

        this.updates = [];

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
        return this.sessionBoundModels.filter(model => {
            return !!this.getDataForModel(model.modelName).accessed;
        }).map(model => model.modelName);
    }

    getDataForModel(modelName) {
        if (!this.modelData[modelName]) {
            this.modelData[modelName] = {};
        }

        return this.modelData[modelName];
    }

    /**
     * Records an update to the session.
     *
     * @private
     * @param {Object} update - the update object. Must have keys
     *                          `type`, `payload` and `meta`. `meta`
     *                          must also include a `name` attribute
     *                          that contains the model name.
     */
    addUpdate(update) {
        if (this.withMutations) {
            const modelName = update.meta.name;
            const modelState = this.getState(modelName);

            // The backend used in the updateReducer
            // will mutate the model state.
            this[modelName].updateReducer(null, modelState, update);
        } else {
            this.updates.push(update);
        }
    }

    /**
     * Gets the recorded updates for `modelClass` and
     * deletes them from the {@link Session} instance updates list.
     *
     * @private
     * @param  {Model} modelClass - the model class to get updates for
     * @return {Object[]} A list of the user-recorded updates for `modelClass`.
     */
    getUpdatesFor(modelClass) {
        const [updates, other] = partition(
            this.updates,
            ['meta.name', modelClass.modelName]);
        this.updates = other;
        return updates;
    }

    /**
     * Returns the current state for a model with name `modelName`.
     *
     * @private
     * @param  {string} modelName - the name of the model to get state for.
     * @return {*} The state for model with name `modelName`.
     */
    getState(modelName) {
        return this.state[modelName];
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
        if (this.withMutations) return this.state;

        const prevState = this.state;
        const action = this.action;
        const opts = userOpts || {};

        // If the session does not have a specified action object,
        // don't run the user-defined model reducers unless
        // explicitly specified.
        const runReducers = opts.hasOwnProperty('runReducers')
            ? opts.runReducers
            : !!action;

        if (runReducers) {
            this.sessionBoundModels.forEach(modelClass => {
                const modelState = this.getState(modelClass.modelName);
                modelClass.reducer(modelState, action, modelClass, this);
            });
        }

        const tx = new Transaction(this.updates);

        const nextState = this.sessionBoundModels.reduce((_nextState, modelClass) => {
            const nextModelState = modelClass.getNextState(tx);
            if (nextModelState !== prevState[modelClass.modelName]) {
                if (_nextState === prevState) {
                    // We know that something has changed, so we cannot
                    // return the previous state. Switching this reduce function
                    // to use a shallowcopied version of the previous state.
                    const prevStateCopied = Object.assign({}, prevState);
                    prevStateCopied[modelClass.modelName] = nextModelState;
                    return prevStateCopied;
                }
                _nextState[modelClass.modelName] = nextModelState;
            }
            return _nextState;
        }, prevState);

        this.updates = [];

        return nextState;
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
