import { createSelectorCreator } from "reselect";
import createCachedSelector, { FlatMapCache } from "re-reselect";

import { memoize } from "./memoize";

import { ORM } from "./ORM";
import SelectorSpec from "./selectors/SelectorSpec";
import MapSelectorSpec from "./selectors/MapSelectorSpec";

/**
 * @module redux
 * @desc Provides functions for integration with Redux.
 */

/**
 * Calls all models' reducers if they exist.
 *
 * @return {undefined}
 * @global
 */
export function defaultUpdater(session, action) {
    session.sessionBoundModels.forEach((modelClass) => {
        if (typeof modelClass.reducer === "function") {
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

/**
 * @private
 * @param {SelectorSpec} spec
 */
function createSelectorFromSpec(spec) {
    if (spec instanceof MapSelectorSpec) {
        const parentSelector = createSelectorFromSpec(spec.parent);
        return spec.createResultFunc(parentSelector);
    }
    return createCachedSelector(
        spec.dependencies,
        spec.resultFunc
    )({
        keySelector: spec.keySelector,
        cacheObject: new FlatMapCache(),
        selectorCreator: createSelector, // eslint-disable-line no-use-before-define
    });
}

/**
 * Tries to find ORM instance using the argument.
 * @private
 * @param {*} arg
 */
function toORM(arg) {
    /* eslint-disable no-underscore-dangle */
    if (arg instanceof ORM) {
        return arg;
    }
    if (arg instanceof SelectorSpec) {
        return arg._orm;
    }
    return false;
}

const selectorCache = new Map();
const SELECTOR_KEY = Symbol.for("REDUX_ORM_SELECTOR");

/**
 * @private
 * @param {function|ORM|SelectorSpec} arg
 */
function toSelector(arg) {
    if (typeof arg === "function") {
        return arg;
    }
    if (arg instanceof ORM) {
        return arg.stateSelector;
    }
    if (arg instanceof MapSelectorSpec) {
        // the argument to map() needs to be callable
        arg.selector = toSelector(arg.selector);
    }
    if (arg instanceof SelectorSpec) {
        const { orm, cachePath } = arg;
        let level;

        // the selector cache for the spec's ORM
        if (!selectorCache.has(orm)) {
            selectorCache.set(orm, new Map());
        }
        const ormSelectors = selectorCache.get(orm);

        /**
         * Drill down into selector map by cachePath.
         *
         * The selector itself is stored under a special SELECTOR_KEY
         * so that we can store selectors below it as well.
         */
        level = ormSelectors;
        for (let i = 0; i < cachePath.length; ++i) {
            const storageKey = cachePath[i];
            if (!level.has(storageKey)) {
                level.set(storageKey, new Map());
            }
            level = level.get(storageKey);
        }
        if (level && level.has(SELECTOR_KEY)) {
            // Cache hit: the selector has been created before
            return level.get(SELECTOR_KEY);
        }
        // Cache miss: the selector needs to be created
        const selector = createSelectorFromSpec(arg);
        // Save the selector at the cachePath position
        level.set(SELECTOR_KEY, selector);

        return selector;
    }
    throw new Error(
        `Failed to interpret selector argument: ${JSON.stringify(
            arg
        )} of type ${typeof arg}`
    );
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
 * function that you pass as the last argument, any of the arguments
 * you pass first will be considered selectors and mapped
 * to their outputs, like in `reselect`.
 *
 * Here are some example selectors:
 *
 * ```javascript
 * // orm is an instance of ORM
 * // reduxState is the state of a Redux store
 * const books = createSelector(orm.Book);
 * books(reduxState) // array of book refs
 *
 * const bookAuthors = createSelector(orm.Book.authors);
 * bookAuthors(reduxState) // two-dimensional array of author refs for each book
 * ```
 * Selectors can easily be applied to related models:
 * ```javascript
 * const bookAuthorNames = createSelector(
 *     orm.Book.authors.map(orm.Author.name),
 * );
 * bookAuthorNames(reduxState, 8) // names of all authors of book with ID 8
 * bookAuthorNames(reduxState, [8, 9]) // 2D array of names of all authors of books with IDs 8 and 9
 * ```
 * Also note that `orm.Author.name` did not need to be wrapped in another `createSelector` call,
 * although that would be possible.
 *
 * For more complex calculations you can access
 * entire session objects by passing an ORM instance.
 * ```javascript
 * const freshBananasCost = createSelector(
 *     orm,
 *     session => {
 *        const banana = session.Product.get({
 *            name: "Banana",
 *        });
 *        // amount of fresh bananas in shopping cart
 *        const amount = session.ShoppingCart.filter({
 *            product_id: banana.id,
 *            is_fresh: true,
 *        }).count();
 *        return `USD ${amount * banana.price}`;
 *     }
 * );
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
 * This way you can use pure rendering in your React components
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
        throw new Error("Cannot create a selector without arguments.");
    }

    const resultArg = args.pop();
    const dependencies = Array.isArray(args[0]) ? args[0] : args;

    const orm = dependencies.map(toORM).find(Boolean);
    const inputFuncs = dependencies.map(toSelector);

    if (typeof resultArg === "function") {
        if (!orm) {
            throw new Error(
                "Failed to resolve the current ORM database state. Please pass an ORM instance or an ORM selector as an argument to `createSelector()`."
            );
        } else if (!orm.stateSelector) {
            throw new Error(
                "Failed to resolve the current ORM database state. Please pass an object to the ORM constructor that specifies a `stateSelector` function."
            );
        } else if (typeof orm.stateSelector !== "function") {
            throw new Error(
                `Failed to resolve the current ORM database state. Please pass a function when specifying the ORM's \`stateSelector\`. Received: ${JSON.stringify(
                    orm.stateSelector
                )} of type ${typeof orm.stateSelector}`
            );
        }

        return createSelectorCreator(
            memoize,
            undefined,
            orm
        )([orm.stateSelector, ...inputFuncs], resultArg);
    }

    if (resultArg instanceof ORM) {
        throw new Error(
            "ORM instances cannot be the result function of selectors. You can access your models in the last function that you pass to `createSelector()`."
        );
    }
    if (inputFuncs.length) {
        console.warn(
            "Your input selectors will be ignored: the passed result function does not require any input."
        );
    }

    return toSelector(resultArg);
}
