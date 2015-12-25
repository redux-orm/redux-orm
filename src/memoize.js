import values from 'lodash/object/values';

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
 * On each run, the memoizer check
 *
 * @param  {Function} func - function to memoize
 * @param  {Function} equalityCheck - equality check function to use with normal
 *                                  selector args
 * @param  {Schema} modelSchema - a redux-orm Schema instance
 * @return {Function} `func` memoized.
 */
export function memoize(func, equalityCheck = eqCheck, modelSchema) {
    let lastOrmState = null;
    let lastResult = null;
    let lastArgs = null;
    const modelNameToInvalidatorMap = {};

    return (...args) => {
        const [ormState, ...otherArgs] = args;
        if (lastOrmState === ormState ||
                !shouldRun(modelNameToInvalidatorMap, ormState) &&
                lastArgs &&
                otherArgs.every((value, index) => equalityCheck(value, lastArgs[index]))) {
            return lastResult;
        }

        const session = modelSchema.from(ormState);
        const newArgs = [session, ...otherArgs];
        const result = func(...newArgs);

        // If a selector has control flow branching, different
        // input arguments might result in a different set of
        // accessed models. On each run, we check if any new
        // models are accessed and add their invalidator functions.
        session.accessedModels.forEach(modelName => {
            if (!modelNameToInvalidatorMap.hasOwnProperty(modelName)) {
                modelNameToInvalidatorMap[modelName] = nextState => {
                    return lastOrmState[modelName] !== nextState[modelName];
                };
            }
        });

        lastResult = result;
        lastOrmState = ormState;
        lastArgs = otherArgs;

        return lastResult;
    };
}
