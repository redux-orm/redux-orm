import { createSelectorCreator } from 'reselect';
import createCachedSelector, { FlatMapCache } from 're-reselect';

import { memoize } from './memoize';

import { ORM } from './ORM';
import {
    SelectorSpec,
    MapSelectorSpec,
} from './selectors';

/**
 * @module redux
 */

/**
 * Calls all models' reducers if they exist.
 * @return {undefined}
 */
export function defaultUpdater(session, action) {
    session.sessionBoundModels.forEach((modelClass) => {
        if (typeof modelClass.reducer === 'function') {
            // This calls this.applyUpdate to update this.state
            modelClass.reducer(action, modelClass, session);
        }
    });
}


/**
 * Call the returned function to pass actions to Redux-ORM.
 *
 * @global
 *
 * @param {ORM} orm - the ORM instance.
 * @param {Function} [updater] - the function updating the ORM state based on the given action.
 * @return {Function} reducer that will update the ORM state.
 */
export function createReducer(orm, updater = defaultUpdater) {
    return (state, action) => {
        const session = orm.session(state || orm.getEmptyState());
        updater(session, action);
        return session.state;
    };
}

function createSelectorFromSpec(spec) {
    return createCachedSelector(
        spec.dependencies,
        spec.resultFunc
    )({
        keySelector: spec.keySelector,
        cacheObject: new FlatMapCache(),
        selectorCreator: createSelector, // eslint-disable-line no-use-before-define
    });
}

function toORM(arg) { /* eslint-disable no-underscore-dangle */
    if (arg instanceof ORM) {
        return arg;
    }
    if (arg instanceof SelectorSpec) {
        return arg._orm;
    }
    return false;
}

const selectorCache = new Map();
const SELECTOR_KEY = Symbol('REDUX_ORM_SELECTOR');

function toSelector(arg) { /* eslint-disable no-underscore-dangle */
    if (typeof arg === 'function') {
        return arg;
    }
    if (arg instanceof ORM) {
        return arg.stateSelector;
    }
    if (arg instanceof MapSelectorSpec) {
        arg._selector = toSelector(arg._selector);
    }
    if (arg instanceof SelectorSpec) {
        const { _orm: orm, cachePath } = arg;
        let ormSelectors;
        let level;
        if (cachePath && cachePath.length) {
            // the selector cache for the spec's ORM
            if (!selectorCache.has(orm)) {
                selectorCache.set(orm, new Map());
            }
            ormSelectors = selectorCache.get(orm);

            /**
             * Drill down into selector map by cachePath.
             *
             * The selector itself is stored under a special SELECTOR_KEY
             * so that we can store selectors below it as well.
             */
            level = ormSelectors;
            for (let i = 0; i < cachePath.length; ++i) {
                if (!level.has(cachePath[i])) {
                    level.set(cachePath[i], new Map());
                }
                level = level.get(cachePath[i]);
            }
            if (level && level.has(SELECTOR_KEY)) {
                // Cache hit: the selector has been created before
                return level.get(SELECTOR_KEY);
            }
        }

        const selector = createSelectorFromSpec(arg);

        if (cachePath && cachePath.length) {
            // Save the selector at the cachePath position
            level.set(SELECTOR_KEY, selector);
        }

        return selector;
    }
    throw new Error(`Failed to interpret selector argument: ${JSON.stringify(arg)} of type ${typeof arg}`);
}

/**
 * Returns a memoized selector based on passed arguments.
 * This is similar to `reselect`'s `createSelector`,
 * except you can also pass a single function to be memoized.
 *
 * If you pass multiple functions, the format will be the
 * same as in `reselect`. The last argument is the selector
 * function and the previous are input selectors.
 *
 * When you use this method to create a selector, the returned selector
 * expects the whole `redux-orm` state branch as input. In the selector
 * function that you pass as the last argument, you will receive a
 * `session` argument (a `Session` instance) followed by any
 * input arguments, like in `reselect`.
 *
 * This is an example selector:
 *
 * ```javascript
 * // orm is an instance of ORM
 * const bookSelector = createSelector(orm, session => {
 *     return session.Book.map(book => {
 *         return Object.assign({}, book.ref, {
 *             authors: book.authors.map(author => author.name),
 *             genres: book.genres.map(genre => genre.name),
 *         });
 *     });
 * });
 * ```
 *
 * redux-orm uses a special memoization function to avoid recomputations.
 *
 * Everytime a selector runs, this function records which instances
 * of your `Model`s were accessed.<br>
 * On subsequent runs, the selector first checks if the previously
 * accessed instances or `args` have changed in any way:
 * <ul>
 *     <li>If yes, the selector calls the function you passed to it.</li>
 *     <li>If not, it just returns the previous result
 *         (unless you call it for the first time).</li>
 * </ul>
 *
 * This way you can use the `PureRenderMixin` in your React components
 * for performance gains.
 *
 * @global
 *
 * @param  {...Function} args - zero or more input selectors
 *                              and the selector function.
 * @return {Function} memoized selector
 */
export function createSelector(...args) {
    if (!args.length) {
        throw new Error('Cannot create a selector without arguments.');
    }

    const resultArg = args.pop();
    const dependencies = Array.isArray(args[0]) ? args[0] : args;

    const orm = dependencies.map(toORM).find(Boolean);
    const inputFuncs = dependencies.map(toSelector);

    if (typeof resultArg === 'function') {
        if (!orm) {
            throw new Error('Failed to resolve the current ORM database state. Please pass an ORM instance or an ORM selector as an argument to `createSelector()`.');
        } else if (!orm.stateSelector) {
            throw new Error('Failed to resolve the current ORM database state. Please pass an object to the ORM constructor that specifies a `stateSelector` function.');
        } else if (typeof orm.stateSelector !== 'function') {
            throw new Error(`Failed to resolve the current ORM database state. Please pass a function when specifying the ORM's \`stateSelector\`. Received: ${JSON.stringify(orm.stateSelector)} of type ${typeof orm.stateSelector}`);
        }

        return createSelectorCreator(memoize, undefined, orm)(
            [orm.stateSelector, ...inputFuncs],
            resultArg
        );
    }

    if (resultArg instanceof ORM) {
        throw new Error('ORM instances cannot be the result function of selectors. You can access your models in the last function that you pass to `createSelector()`.');
    }
    if (inputFuncs.length) {
        console.warn('Your input selectors will be ignored: the passed result function does not require any input.');
    }

    return toSelector(resultArg);
}
