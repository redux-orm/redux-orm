import { STATE_FLAG } from "./constants";

const defaultEqualityCheck = (a, b) => a === b;
export const eqCheck = defaultEqualityCheck;

const isOrmState = (arg) =>
    arg && typeof arg === "object" && arg.hasOwnProperty(STATE_FLAG);

const argsAreEqual = (lastArgs, nextArgs, equalityCheck) =>
    nextArgs.every(
        (arg, index) =>
            (isOrmState(arg) && isOrmState(lastArgs[index])) ||
            equalityCheck(arg, lastArgs[index])
    );

const rowsAreEqual = (ids, rowsA, rowsB) =>
    ids.every((id) => rowsA[id] === rowsB[id]);

const accessedModelInstancesAreEqual = (previous, ormState, orm) => {
    const { accessedInstances } = previous;

    return Object.entries(accessedInstances).every(([modelName, instances]) => {
        // if the entire table has not been changed, we have nothing to do
        if (previous.ormState[modelName] === ormState[modelName]) {
            return true;
        }

        const { mapName } = orm.getDatabase().describe(modelName);

        const { [mapName]: previousRows } = previous.ormState[modelName];
        const { [mapName]: rows } = ormState[modelName];

        const accessedIds = Object.keys(instances);
        return rowsAreEqual(accessedIds, previousRows, rows);
    });
};

const accessedIndexesAreEqual = (previous, ormState) => {
    const { accessedIndexes } = previous;

    return Object.entries(accessedIndexes).every(([modelName, indexes]) =>
        Object.entries(indexes).every(([column, values]) =>
            values.every(
                (value) =>
                    previous.ormState[modelName].indexes[column][value] ===
                    ormState[modelName].indexes[column][value]
            )
        )
    );
};

const fullTableScannedModelsAreEqual = (previous, ormState) =>
    previous.fullTableScannedModels.every(
        (modelName) => previous.ormState[modelName] === ormState[modelName]
    );

const MEMOIZATION_STATE_KEY = "@@_______REDUX_ORM_MEMOIZATION_STATE";
const MEMOIZATION_STATE = {
    /* Result of the previous function call */
    result: null,
    /**
     * Snapshot of the previous database.
     *
     * Lets us know how the tables looked like
     * during the previous function call.
     */
    ormState: null,
    /**
     * Names of models whose tables have been scanned completely
     * during previous function call (contains only model names)
     * Format example: ['Book']
     */
    fullTableScannedModels: [],
    /**
     * Map of which model instances have been accessed
     * during previous function call.
     * Contains only PKs of accessed instances.
     * Format example: { Book: { 1: true, 3: true } }
     */
    accessedInstances: {},
    /**
     * Map of which attribute indexes have been accessed
     * during previous function call.
     * Contains only attributes that were actually filtered on.
     * Author.withId(3).books would add 3 to the authorId index below.
     * Format example: { Book: { authorId: [1, 2], publisherId: [5] } }
     */
    accessedIndexes: {},
    /* Whether the selector has been called */
    calledBefore: false,
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
 * 1. Has the selector been run before? If not, go to 6.
 *
 * 2. If the selector has other input selectors in addition to the
 *    ORM state selector, check their results for equality with the previous results.
 *    If they aren't equal, go to 6.
 *
 * 3. Some filter queries may have required scanning entire tables during the last run.
 *    If any of those tables have changed, go to 6.
 *
 * 4. Check which foreign key indexes the database has used to speed up queries
 *    during the last run. If any have changed, go to 6.
 *
 * 5. Check which Model's instances the selector has accessed during the last run.
 *    Check for equality with each of those states versus their states in the
 *    previous ORM state. If all of them are equal, return the previous result.
 *
 * 6. Run the selector. Check the Session object used by the selector for
 *    which Model's states were accessed, and merge them with the previously
 *    saved information about accessed models (if-else branching can change
 *    which models are accessed on different inputs). Save the ORM state and
 *    other arguments the selector was called with, overriding previously
 *    saved values. Save the selector result. Return the selector result.
 *
 * @private
 * @param  {Function} func - function to memoize
 * @param  {ORM} orm - a redux-orm ORM instance
 * @return {Function} `func` memoized.
 */
export function memoize(func, orm) {
    const previous = { ...MEMOIZATION_STATE, args: null };

    return (...stateAndArgs) => {
        /**
         * The first argument to this function needs to be
         * the ORM's reducer state in the user's Redux store.
         */
        const [ormState, ...args] = stateAndArgs;

        if (
            previous.calledBefore &&
            argsAreEqual(previous.args, args, defaultEqualityCheck) &&
            fullTableScannedModelsAreEqual(previous, ormState) &&
            accessedIndexesAreEqual(previous, ormState) &&
            accessedModelInstancesAreEqual(previous, ormState, orm)
        ) {
            /**
             * None of this selector's dependencies have changed
             * since the last time that we called it.
             */
            return previous.result;
        }

        /**
         * Start a session so that the selector can access the database.
         * Make this session immutable. This way we can find out if
         * the operations that the selector performs are cacheable.
         */
        const session = orm.session(ormState);
        /* Replace all ORM state arguments by the session above */
        const argsWithSession = args.map((arg) =>
            isOrmState(arg) ? session : arg
        );

        /* This is where we call the actual function */
        const result = func.apply(null, argsWithSession); // eslint-disable-line prefer-spread

        /**
         * The metadata for the previous call are no longer valid.
         * Update cached values.
         */
        previous.result = result;
        previous.args = args;
        /* Redux state slice for session.state */
        previous.ormState = ormState;
        /* Rows retrieved by resolved primary key */
        previous.accessedInstances = session.accessedModelInstances;
        /* Foreign key indexes that were used to speed up queries */
        previous.accessedIndexes = session.accessedIndexes;
        /* Tables that had to be scanned completely */
        previous.fullTableScannedModels = session.fullTableScannedModels;
        /* Whether the selector has been called */
        previous.calledBefore = true;

        return result;
    };
}

class PreviousCalls extends Map {
    getFromCacheKeys(cacheKeys) {
        let level = this;
        for (const key of cacheKeys) {
            if (level.has(key)) {
                level = level.get(key);
                continue;
            }
            const newLevel = new Map([
                [MEMOIZATION_STATE_KEY, { ...MEMOIZATION_STATE }],
            ]);
            level.set(key, newLevel);
            level = newLevel;
        }
        return level;
    }

    getState(cacheKeys) {
        const call = this.getFromCacheKeys(cacheKeys);
        return call ? call.get(MEMOIZATION_STATE_KEY) : null;
    }
}

export function memoizeByKey(func, orm, ignoreDependenciesCount) {
    const previousCalls = new PreviousCalls([
        [MEMOIZATION_STATE_KEY, { ...MEMOIZATION_STATE }],
    ]);

    return (...stateAndKeysAndArgs) => {
        /**
         * The first argument to this function needs to be
         * the ORM's reducer state in the user's Redux store.
         */
        const [ormState, cacheKeys, ...args] = stateAndKeysAndArgs;
        /** Ignore the first `ignoreDependenciesCount` dependencies. */
        const argsToCompare = args.slice(Math.max(0, ignoreDependenciesCount));

        const previous = previousCalls.getState([cacheKeys]);

        if (
            previous.calledBefore &&
            argsAreEqual(
                previous.argsToCompare,
                argsToCompare,
                defaultEqualityCheck
            ) &&
            fullTableScannedModelsAreEqual(previous, ormState) &&
            accessedIndexesAreEqual(previous, ormState) &&
            accessedModelInstancesAreEqual(previous, ormState, orm)
        ) {
            /**
             * None of this selector's dependencies have changed
             * since the last time that we called it.
             */
            return previous.result;
        }

        /**
         * Start a session so that the selector can access the database.
         * Make this session immutable. This way we can find out if
         * the operations that the selector performs are cacheable.
         */
        const session = orm.session(ormState);
        /* Replace all ORM state arguments by the session above */
        const argsWithSession = args.map((arg) =>
            isOrmState(arg) ? session : arg
        );

        /* This is where we call the actual function */
        const result = func.apply(null, argsWithSession); // eslint-disable-line prefer-spread

        /**
         * The metadata for the previous call are no longer valid.
         * Update cached values.
         */
        previous.result = result;
        /* Redux state slice for session.state */
        previous.ormState = ormState;
        /* Rows retrieved by resolved primary key */
        previous.accessedInstances = session.accessedModelInstances;
        /* Foreign key indexes that were used to speed up queries */
        previous.accessedIndexes = session.accessedIndexes;
        /* Tables that had to be scanned completely */
        previous.fullTableScannedModels = session.fullTableScannedModels;
        /* Whether the selector has been called */
        previous.calledBefore = true;
        previous.argsToCompare = argsToCompare;

        return result;
    };
}
