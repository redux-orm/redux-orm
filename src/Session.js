
/**
 * Session handles a single
 * action dispatch.
 */
const Session = class Session {
    constructor(schema, state, action) {
        this.schema = schema;
        this.action = action;
        this.state = state;

        const models = schema.getModelClassesFor(this, state);
        this.models = models;

        models.forEach(modelClass => {
            Object.defineProperty(this, modelClass.name, {
                get: () => modelClass,
            });
        });
    }

    getRelatedManager(modelName) {
        return this[modelName].objects;
    }

    getDefaultState() {
        const state = {};
        this.models.forEach(modelClass => {
            state[modelClass.name] = modelClass.getDefaultState();
        });
        return state;
    }

    getState(modelName) {
        const state = this.state[modelName];
        return state;
    }

    reduce() {
        const nextState = {};
        this.models.forEach(model => {
            nextState[model.name] = model.reducer();
        });
        return nextState;
    }
};

export default Session;
