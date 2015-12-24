import partition from 'lodash/collection/partition';

/**
 * Session handles a single
 * action dispatch.
 */
const Session = class Session {
    /**
     * Creates a new Session.
     *
     * @param  {Schema} schema - a Schema instance
     * @param  {Object} state - the database state
     * @param  {Object} [action] - the current action in the dispatch cycle.
     *                             Will be passed to the user defined reducers.
     * @param  {Boolean} withMutations - whether the session should mutate data
     */
    constructor(models, state, action, withMutations) {
        this.models = models;
        this.state = state;
        this.action = action;
        this.withMutations = !!withMutations;

        this.updates = [];

        this._accessedModels = {};

        models.forEach(modelClass => {
            Object.defineProperty(this, modelClass.modelName, {
                get: () => modelClass,
            });

            modelClass.connect(this);
        });
    }

    markAccessed(model) {
        this._accessedModels[model.modelName] = true;
    }

    get accessedModels() {
        return Object.keys(this._accessedModels);
    }

    /**
     * Records an update to the session.
     * @param {Object} update - the update object. Must have keys
     *                            `type`, `payload` and `meta`. `meta`
     *                            must also include a `name` attribute
     *                            that contains the model name.
     */
    addUpdate(update) {
        if (this.withMutations) {
            const modelName = update.meta.name;
            const modelState = this.getState(modelName);
            const state = typeof modelState === 'undefined'
                ? this[modelName].getDefaultState()
                : modelState;

            this[modelName].updateReducer(state, update);
        } else {
            this.updates.push(update);
        }
    }

    /**
     * Gets the recorded updates for `modelClass` and
     * deletes them from the Session instance updates list.
     *
     * @param  {Model} modelClass - the model class to get updates for
     * @return {Object[]} A list of the user-recorded updates for `modelClass`.
     */
    getUpdatesFor(modelClass) {
        const [updates, other] = partition(
            this.updates,
            'meta.name',
            modelClass.modelName);

        this.updates = other;
        return updates;
    }

    getState(modelName) {
        if (this.state) {
            return this.state[modelName];
        }
        return undefined;
    }

    /**
     * Calls the user defined reducers and returns
     * the next state.
     * @return {Object} The next state
     */
    reduce() {
        const nextState = {};
        const currentAction = this.action;
        this.models.forEach(modelClass => {
            const modelState = this.getState(modelClass.modelName);
            nextState[modelClass.modelName] = modelClass.reducer(
                modelState, currentAction, modelClass, this);
        });
        // The remaining updates are for M2M tables.
        const finalState = this.updates.reduce((state, action) => {
            const modelName = action.meta.name;
            state[modelName] = this[modelName].getNextState();
            return state;
        }, nextState);

        this.updates = [];
        return finalState;
    }
};

export default Session;
