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

        this.mutations = [];

        models.forEach(modelClass => {
            Object.defineProperty(this, modelClass.getName(), {
                get: () => modelClass,
            });

            modelClass.connect(this);
        });
    }

    /**
     * Records a mutation to the session.
     * @param {Object} mutation - the mutation object. Must have keys
     *                            `type`, `payload` and `meta`. `meta`
     *                            must also include a `name` attribute
     *                            that contains the model name.
     */
    addMutation(mutation) {
        this.mutations.push(mutation);
    }

    /**
     * Gets the recorded mutations for `modelClass` and
     * deletes them from the Session instance mutations list.
     *
     * @param  {Model} modelClass - the model class to get mutations for
     * @return {Object[]} A list of the user-recorded mutations for `modelClass`.
     */
    getMutationsFor(modelClass) {
        const modelName = modelClass.getName();

        const [mutations, other] = partition(this.mutations, 'meta.name', modelName);
        this.mutations = other;
        return mutations;
    }

    getRelatedManager(modelName) {
        return this[modelName].getRelatedManager();
    }

    getDefaultState() {
        const state = {};
        this.models.forEach(modelClass => {
            state[modelClass.getName()] = modelClass.getDefaultState();
        });
        return state;
    }

    getState(modelName) {
        const state = this.state[modelName];
        return state;
    }

    /**
     * Calls the user defined reducers and returns
     * the next state.
     * @return {Object} The next state
     */
    reduce() {
        this.mutations = [];
        const nextState = {};
        // Don't call user reducers when bootstrapping data.
        if (!this._bootstrapping) {
            this.models.forEach(modelClass => {
                nextState[modelClass.getName()] = modelClass.callUserReducer();
            });
        }
        // The remaining mutations are for M2M tables.
        return this.mutations.reduce((state, action) => {
            const modelName = action.meta.name;
            state[modelName] = this[modelName].getNextState();
            return state;
        }, nextState);
    }
};

export default Session;
