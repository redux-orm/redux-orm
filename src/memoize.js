import every from 'lodash/every';

const defaultEqualityCheck = (a, b) => a === b;
export const eqCheck = defaultEqualityCheck;

const argsAreEqual = (lastArgs, nextArgs, equalityCheck) => (
    nextArgs.every((arg, index) =>
        equalityCheck(arg, lastArgs[index])
    )
);

const modelInstancesAreEqual = (ids, modelsA, modelsB) => (
    ids.every(
        id => modelsA[id] === modelsB[id]
    )
);

const allModelInstancesAreEqual = (lastModels, nextModels) => {
    if (lastModels.length !== nextModels.length) return false;

    const lastModelIds = Object.keys(lastModels);
    const nextModelIds = Object.keys(nextModels);

    return modelInstancesAreEqual(lastModelIds, lastModels, nextModels) &&
        modelInstancesAreEqual(nextModelIds, lastModels, nextModels);
};

const accessedModelInstancesAreEqual = (previous, nextOrmState) => {
    const {
        fullTableScannedModels,
        accessedModelInstances,
        ormState,
    } = previous;
    return every(accessedModelInstances, (accessedInstances, modelName) => {
        const { itemsById: lastModels } = ormState[modelName];
        const { itemsById: nextModels } = nextOrmState[modelName];

        if (fullTableScannedModels.includes(modelName)) {
            /**
             * all of this model's instances were checked against some condition
             * invalidate them unless none of them have changed
             */
            return allModelInstancesAreEqual(lastModels, nextModels);
        }

        const accessedIds = Object.keys(accessedInstances);
        return modelInstancesAreEqual(accessedIds, lastModels, nextModels);
    });
};

/**
 * A memoizer to use with redux-orm
 * selectors. When the memoized function is first run,
 * the memoizer will remember the models that are accessed
 * during that function run.
 *
 * On subsequent runs, the memoizer will check if those
 * models' states have changed compared to the previous run.
 *
 * Memoization algorithm operates like this:
 *
 * 1. Has the selector been run before? If not, go to 5.
 *
 * 2. If the selector has other input selectors in addition to the
 *    ORM state selector, check their results for equality with the previous results.
 *    If they aren't equal, go to 5.
 *
 * 3. Is the ORM state referentially equal to the previous ORM state the selector
 *    was called with? If yes, return the previous result.
 *
 * 4. Check which Model's instances the selector has accessed on previous runs.
 *    Check for equality with each of those states versus their states in the
 *    previous ORM state. If all of them are equal, return the previous result.
 *
 * 5. Run the selector. Check the Session object used by the selector for
 *    which Model's states were accessed, and merge them with the previously
 *    saved information about accessed models (if-else branching can change
 *    which models are accessed on different inputs). Save the ORM state and
 *    other arguments the selector was called with, overriding previously
 *    saved values. Save the selector result. Return the selector result.
 *
 * @private
 * @param  {Function} func - function to memoize
 * @param  {Function} argEqualityCheck - equality check function to use with normal
 *                                       selector args
 * @param  {ORM} orm - a redux-orm ORM instance
 * @return {Function} `func` memoized.
 */
export function memoize(func, argEqualityCheck = defaultEqualityCheck, orm) {
    const previous = {
        /* result of previous function call */
        result: null,
        /* arguments to previous function call (excluding ORM state) */
        args: null,
        /* previous ORM state for evaluating whether or not to invalidate cache */
        ormState: null,
        /**
        * array of names of models whose tables have been scanned completely
        * during previous function call (contains only model names)
        * format (e.g.): ["Book"]
        */
        fullTableScannedModels: [],
        /**
        * map of which model instances have been accessed
        * during previous function call (contains only IDs of accessed instances)
        * format (e.g.): { Book: { 1: true, 3: true } }
        */
        accessedModelInstances: {},
    };

    return (...args) => {
        const [nextOrmState, ...otherArgs] = args;

        if (previous.args &&
            previous.ormState &&
            argsAreEqual(previous.args, otherArgs, argEqualityCheck) &&
            accessedModelInstancesAreEqual(previous, nextOrmState)) {
            /**
             * the instances that were accessed as well as
             * the arguments that were passed to func the previous time that
             * func was called have not changed
             */
            return previous.result;
        }

        /* previous result is no longer valid, update cached values */
        const session = orm.session(nextOrmState);
        /* this is where we call the actual function */
        const result = func(...[session, ...otherArgs]);

        previous.result = result;

        previous.ormState = nextOrmState;
        previous.args = otherArgs;

        previous.accessedModelInstances = session.accessedModelInstances;

        previous.fullTableScannedModels = [...session.fullTableScannedModels];
        return result;
    };
}
