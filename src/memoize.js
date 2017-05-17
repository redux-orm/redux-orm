import values from 'lodash/values';

export function eqCheck(a, b) {
    return a === b;
}

function shouldRun(invalidatorMap, state) {
    return values(invalidatorMap).some(invalidate => invalidate(state));
}

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
 * 4. Check which Model's states the selector has accessed on previous runs.
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
 * @param  {Function} equalityCheck - equality check function to use with normal
 *                                  selector args
 * @param  {ORM} orm - a redux-orm ORM instance
 * @return {Function} `func` memoized.
 */
export function memoize(func, equalityCheck = eqCheck, orm) {
    let lastOrmState = null;
    let lastResult = null;
    let lastArgs = null;
    const modelNameToInvalidatorMap = {};

    return (...args) => {
        const [dbState, ...otherArgs] = args;

        const dbIsEqual = lastOrmState === dbState ||
                           !shouldRun(modelNameToInvalidatorMap, dbState);

        const argsAreEqual = lastArgs && otherArgs.every(
            (value, index) => equalityCheck(value, lastArgs[index])
        );

        if (dbIsEqual && argsAreEqual) {
            return lastResult;
        }

        const session = orm.session(dbState);
        const newArgs = [session, ...otherArgs];
        const result = func(...newArgs);

        // If a selector has control flow branching, different
        // input arguments might result in a different set of
        // accessed models. On each run, we check if any new
        // models are accessed and add their invalidator functions.
        session.accessedModels.forEach((modelName) => {
            if (!modelNameToInvalidatorMap.hasOwnProperty(modelName)) {
                modelNameToInvalidatorMap[modelName] = nextState =>
                    lastOrmState[modelName] !== nextState[modelName];
            }
        });

        lastResult = result;
        lastOrmState = dbState;
        lastArgs = otherArgs;

        return lastResult;
    };
}
