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
     */
    constructor(models, state, action) {
        this.action = action;
        this.state = state;

        this.models = models;

        this.updates = [];

        models.forEach(modelClass => {
            Object.defineProperty(this, modelClass.modelName, {
                get: () => modelClass,
            });

            modelClass.connect(this);
        });
    }

    /**
     * Records an update to the session.
     * @param {Object} update - the update object. Must have keys
     *                            `type`, `payload` and `meta`. `meta`
     *                            must also include a `name` attribute
     *                            that contains the model name.
     */
    addUpdate(update) {
        this.updates.push(update);
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

    getDefaultState() {
        const state = {};
        this.models.forEach(modelClass => {
            state[modelClass.modelName] = modelClass.getDefaultState();
        });
        return state;
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
        this.updates = [];
        const nextState = {};

        this.models.forEach(modelClass => {
            nextState[modelClass.modelName] = modelClass.callUserReducer();
        });
        // The remaining updates are for M2M tables.
        return this.updates.reduce((state, action) => {
            const modelName = action.meta.name;
            state[modelName] = this[modelName].getNextState();
            return state;
        }, nextState);
    }
};

export default Session;
