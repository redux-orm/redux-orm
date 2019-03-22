import { DEFAULT_TABLE_OPTIONS } from './constants';

const defaultEqualityCheck = (a, b) => a === b;
export const eqCheck = defaultEqualityCheck;

const argsAreEqual = (lastArgs, nextArgs, equalityCheck) => (
    nextArgs.every((arg, index) => (
        equalityCheck(arg, lastArgs[index])
    ))
);

const rowsAreEqual = (ids, rowsA, rowsB) => (
    ids.every(id => rowsA[id] === rowsB[id])
);

const accessedModelInstancesAreEqual = (previous, ormState, orm) => {
    const {
        accessedModelInstances,
    } = previous;

    return Object.entries(accessedModelInstances).every(([modelName, accessedInstances]) => {
        // if the entire table has not been changed, we have nothing to do
        if (previous.ormState[modelName] === ormState[modelName]) {
            return true;
        }

        const ModelClass = orm.get(modelName);
        const mapName = ModelClass.options.mapName || DEFAULT_TABLE_OPTIONS.mapName;

        const { [mapName]: previousRows } = previous.ormState[modelName];
        const { [mapName]: rows } = ormState[modelName];

        const accessedIds = Object.keys(accessedInstances);
        return rowsAreEqual(accessedIds, previousRows, rows);
    });
};

const fullTableScannedModelsAreEqual = (previous, ormState) => (
    previous.fullTableScannedModels.every(modelName => (
        previous.ormState[modelName]
            === ormState[modelName]
    ))
);

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
        /* result of the previous function call */
        result: null,
        /* arguments to the previous function call (excluding ORM state) */
        args: null,
        /**
         * lets us know how the models looked like
         * during the previous function call
         */
        ormState: null,
        /**
        * array of names of models whose tables have been scanned completely
        * during previous function call (contains only model names)
        * format (e.g.): ['Book']
        */
        fullTableScannedModels: [],
        /**
        * map of which model instances have been accessed
        * during previous function call (contains only IDs of accessed instances)
        * format (e.g.): { Book: { 1: true, 3: true } }
        */
        accessedModelInstances: {},
    };

    return (...stateAndArgs) => {
        const [ormState, ...args] = stateAndArgs;

        const selectorWasCalledBefore = (
            previous.args &&
            previous.ormState
        );

        if (
            selectorWasCalledBefore &&
            argsAreEqual(previous.args, args, argEqualityCheck) &&
            fullTableScannedModelsAreEqual(previous, ormState) &&
            accessedModelInstancesAreEqual(previous, ormState, orm)
        ) {
            /**
             * the instances that were accessed as well as
             * the arguments that were passed to func the previous time that
             * func was called have not changed
             */
            return previous.result;
        }

        /* previous result is no longer valid, update cached values */
        previous.args = args;

        const session = orm.session(ormState);
        previous.ormState = ormState;

        /* this is where we call the actual function */
        const result = func(...[session, ...args]);
        previous.result = result;

        /* rows retrieved during function call */
        previous.accessedModelInstances = session.accessedModelInstances;
        /* tables that had to be scanned completely */
        previous.fullTableScannedModels = session.fullTableScannedModels;

        return result;
    };
}
