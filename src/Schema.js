import modelFactory from './MetaModel';
import ORM from './ORM';
import {Queue} from './utils';

const Schema = class Schema {
    constructor() {
        this.modelDefinitions = new Queue();
    }

    define(modelName, relatedFields, reducer) {
        // Defer instantiation until we have know the ORM instance.
        this.modelDefinitions.enqueue([modelName, relatedFields, reducer]);
    }

    getModelClassesFor(orm, state) {
        const modelClasses = [];
        const thisSchema = this;
        function defineM2M(...args) {
            thisSchema.modelDefinitions.enqueue(args);
        }

        // We use a Queue so that any M2M table definitions
        // are made after all normal Models have been made.
        while (!this.modelDefinitions.isEmpty()) {
            const args = this.modelDefinitions.dequeue();
            const modelName = args[0];
            const modelState = orm.getState(modelName);
            modelClasses.push(modelFactory(defineM2M, orm, modelState, ...args));
        }

        return modelClasses;
    }

    fromEmpty(action) {
        return new ORM(this, this.getDefaultState(), action);
    }

    from(state, action) {
        return new ORM(this, state, action);
    }

    reducer() {
        return (state, action) => {
            return this.from(state, action).reduce();
        };
    }
};

export default Schema;
