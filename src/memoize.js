import every from 'lodash/every';

function defaultEqualityCheck(a, b) { return a === b; }
export const eqCheck = defaultEqualityCheck;

function compareArgs(a, b, equalityCheck) {
    return b.every((value, index) => equalityCheck(value, a[index]));
}

function accessedModelInstancesAreEqual(accessedModels, lastOrmState, nextOrmState) {
    return every(Object.keys(accessedModels), (modelName) => {
        const last = lastOrmState[modelName];
        const next = nextOrmState[modelName];
        if (last === next) return true;
        if (last.items !== next.items) return false;
        return Object.keys(accessedModels[modelName])
            .every(id => lastOrmState[modelName].itemsById[id] === nextOrmState[modelName].itemsById[id]);
    });
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
 * @param  {Function} equalityCheck - equality check function to use with normal
 *                                  selector args
 * @param  {ORM} orm - a redux-orm ORM instance
 * @return {Function} `func` memoized.
 */
export function memoize(func, equalityCheck = defaultEqualityCheck, orm) {
    let lastOrmState = null;
    let lastArgs = null;
    let lastResult = null;
    let allAccessedModels = {};

    return (...args) => {
        const [nextOrmState, ...otherArgs] = args;

        const dbIsEqual = lastOrmState &&
            (lastOrmState === nextOrmState
                || accessedModelInstancesAreEqual(allAccessedModels, lastOrmState, nextOrmState)
            );
        const argsAreEqual = lastArgs && compareArgs(lastArgs, otherArgs, equalityCheck);
        if (dbIsEqual && argsAreEqual) {
            return lastResult;
        }

        const session = orm.session(nextOrmState);
        const newArgs = [session, ...otherArgs];
        const result = func(...newArgs);

        lastResult = result;
        lastOrmState = nextOrmState;
        lastArgs = otherArgs;

        allAccessedModels = {
            ...allAccessedModels,
            ...session.accessedModels,
        };
        return lastResult;
    };
}
