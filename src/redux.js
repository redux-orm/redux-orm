import { createSelectorCreator } from "reselect";

import { memoize, memoizeByKey } from "./memoize";

import { ORM } from "./ORM";
import SelectorSpec from "./selectors/SelectorSpec";
import MapSelectorSpec from "./selectors/MapSelectorSpec";
import ModelSelectorSpec from "./selectors/ModelSelectorSpec";
import ModelBasedSelectorSpec from "./selectors/ModelBasedSelectorSpec";
import idArgSelector from "./selectors/idArgSelector";

import { KEYED_SELECTOR_MARKER } from "./constants";

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
 * Turns a selector specification into its corresponding selector function.
 *
 * @private
 * @param {SelectorSpec} spec
 */
function createSelectorFromSpec(spec) {
    if (spec instanceof MapSelectorSpec) {
        const parentSelector = createSelectorFromSpec(spec.parent);
        const resultFunc = spec.createResultFunc(parentSelector);
        return (state, idArg) => resultFunc.call(spec, state, null, idArg);
    }
    if (
        spec instanceof ModelSelectorSpec ||
        spec instanceof ModelBasedSelectorSpec
    ) {
        const modelSpec = spec.orm[spec.model.modelName];
        return createSelectorCreator(
            memoizeByKey,
            spec.orm,
            spec.dependencies.length
        )(
            [
                spec.orm.stateSelector,
                idArgSelector,
                ...spec.dependencies.map(toSelectorFor(modelSpec)),
            ],
            (...args) => spec.resultFunc.apply(spec, args)
        );
    }
    throw new Error("Unknown selector spec");
}

/**
 * Turns a selector specification into its corresponding selector function.
 *
 * @param {ModelSelectorSpec|ModelBasedSelectorSpec}
 * @private
 * @param {SelectorSpec} spec
 */
function createSelectorFromSpecFor(modelOrModelBasedSpec) {
    if (
        !(modelOrModelBasedSpec instanceof ModelSelectorSpec) &&
        !(modelOrModelBasedSpec instanceof ModelBasedSelectorSpec)
    ) {
        throw new Error(
            "createSelectorFromSpecFor requires a ModelSelectorSpec or a ModelBasedSelectorSpec as its sole argument."
        );
    }
    const {
        orm,
        model: { modelName },
    } = modelOrModelBasedSpec;
    const modelSpec = orm[modelName];
    return function (spec) {
        if (
            !spec ||
            !(
                spec instanceof ModelSelectorSpec ||
                spec instanceof ModelBasedSelectorSpec
            )
        ) {
            throw new Error(
                "createSelectorFromSpecFor(X)(Y) requires Y to be a ModelSelectorSpec or a ModelBasedSelectorSpec."
            );
        }
        if (!spec.modelIs(modelName)) {
            /**
             * This causes user arguments not to affect the dependency.
             * So arguments meant for the model-based selector `spec` don't also get
             * passed to other model-based selector dependencies.
             *
             * Example:
             * const similarAuthors = createSelectorFor(orm.Book)(
             *      orm.Book.genre,
             *      orm.Author,
             *      (genre, allAuthors) =>
             *          allAuthors.books.filter({ genre }).count() > 0
             * );
             *
             * This causes `similarAuthors(state, 1)` to only resolve
             * the genre of the book with ID 1, but not the author with ID 1.
             * Instead, the `orm.Author` resultFunc will receive no arguments.
             */
            const selector = toSelector(arg);
            return (state) => selector(state);
        }
        if (spec instanceof MapSelectorSpec) {
            const parentToModelName = spec.parent.toModelName;
            const parentToModelSpec = orm[parentToModelName];
            spec.selector = toSelectorFor(parentToModelSpec)(spec.selector);
            return createSelectorCreator(
                memoizeByKey,
                spec.orm,
                3
            )(
                [
                    orm.stateSelector,
                    idArgSelector,
                    (state) => state,
                    orm.stateSelector,
                    idArgSelector,
                ],
                (state, session, idArg) => {
                    const parentResult = spec.parent.resultFunc(
                        state,
                        session,
                        idArg
                    );
                    if (parentResult === null) {
                        return null;
                    }
                    if (typeof idArg === "undefined" || Array.isArray(idArg)) {
                        return parentResult.map((refArray) =>
                            refArray === null
                                ? null
                                : refArray.map((parentRef) =>
                                      parentRef === null
                                          ? null
                                          : spec.valueForRef(
                                                parentRef,
                                                session,
                                                state
                                            )
                                  )
                        );
                    }
                    return parentResult.map((ref) =>
                        ref === null
                            ? null
                            : spec.valueForRef(ref, session, state)
                    );
                }
            );
        }
        // Map arg.resultFunc by model using arg.modelSelectorSpec
        return createSelectorCreator(
            memoizeByKey,
            orm,
            3
        )(
            [
                orm.stateSelector,
                idArgSelector,
                // TODO: do the mapping by key in memoizeByKey
                // get "base dependencies" that do not include idArgSelector
                // get "base result func" that does not map by key
                // check if args are equal in memoizeByKey again
                // the only reason we need to do that is to keep backwards
                // compatibility
                (state) => state,
                orm.stateSelector,
                idArgSelector,
            ],
            (state, session, idArg) => {
                const refOrRefs = modelSpec.resultFunc(state, session, idArg);
                if (refOrRefs === null) {
                    return null;
                }
                if (Array.isArray(refOrRefs)) {
                    return refOrRefs.map((ref) =>
                        ref === null
                            ? null
                            : spec.valueForRef(ref, session, state)
                    );
                }
                return spec.valueForRef(refOrRefs, session, state);
            }
        );
    };
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
 * Turns any argument into a selector function if possible.
 *
 * ORM instances become functions returning the ORM's state.
 *
 * Selector specs become actual selector functions. If possible
 * their cached version is retrieved instead of creating new ones.
 * Ordinary functions are kept the same.
 *
 * @private
 * @param {function|ORM|SelectorSpec} arg
 * @return {function}
 * @throws {Error} if argument is invalid
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

function toSelectorFor(spec) {
    if (!(spec instanceof ModelSelectorSpec)) {
        throw new Error(
            "`toSelectorFor(orm.Model)` takes a model selector spec as its single argument."
        );
    }
    return function (arg) {
        if (typeof arg === "function") {
            return arg;
        }
        if (arg instanceof ORM) {
            return arg.stateSelector;
        }
        if (
            arg instanceof ModelSelectorSpec ||
            arg instanceof ModelBasedSelectorSpec
        ) {
            return createSelectorFromSpecFor(spec)(arg);
        }
        /**
         * All other args are treated as regular selectors.
         */
        return toSelector(arg);
    };
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

        return createSelectorCreator(memoize, orm)(
            [orm.stateSelector, ...inputFuncs],
            resultArg
        );
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

/**
 * Creates a selector whose results will be cached by the second argument
 * passed to it.
 */
export function createSelectorFor(spec) {
    if (!spec) {
        throw new Error(
            "`createSelectorFor()` takes one argument of the form `orm.Model`, e.g. `orm.Book`."
        );
    }
    if (!(spec instanceof ModelSelectorSpec)) {
        throw new Error(
            "The argument you passed to `createSelectorFor(orm.Model)` must be a model selector specification, e.g. `orm.Book`."
        );
    }

    return function (...args) {
        if (!args.length) {
            throw new Error("Cannot create a selector without arguments.");
        }

        const resultArg = args.pop();
        const dependencies = Array.isArray(args[0]) ? args[0] : args;

        const orm = spec.orm;
        const inputFuncs = dependencies.map(toSelectorFor(spec));

        if (typeof resultArg === "function") {
            if (!orm.stateSelector) {
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

            // TODO: Somehow detect selectors created by `createSelectorFor` and compare
            //       the models here. We need to mark those selectors.
            const dependencyIsForModelRef = dependencies.map(
                (dep) =>
                    (typeof dep === "function" &&
                        dep.hasOwnProperty(KEYED_SELECTOR_MARKER) &&
                        dep[KEYED_SELECTOR_MARKER] === spec.model.modelName) ||
                    ((dep instanceof ModelSelectorSpec ||
                        dep instanceof ModelBasedSelectorSpec) &&
                        dep.modelIs(spec.model.modelName))
            );

            const selector = createSelectorCreator(
                memoizeByKey,
                orm,
                // the additional argument refOrRefs to be ignored
                2
            )(
                [
                    // for wrapping the selector in a session
                    orm.stateSelector,
                    // idArg for cache key
                    idArgSelector,
                    // returns refOrRefs below
                    idArgSelector,
                    toSelector(spec),
                    // user input functions
                    ...inputFuncs,
                ],
                (idArg, refOrRefs, ...args) => {
                    if (refOrRefs === null) {
                        return null;
                    }
                    if (typeof idArg === "undefined" || Array.isArray(idArg)) {
                        return refOrRefs.map((ref, refIdx) => {
                            if (ref === null) {
                                return null;
                            }
                            return resultArg.apply(
                                null,
                                args.map((arg, i) =>
                                    dependencyIsForModelRef[i]
                                        ? arg[refIdx]
                                        : arg
                                )
                            );
                        });
                    }
                    return resultArg.apply(null, args);
                }
            );
            selector[KEYED_SELECTOR_MARKER] = spec.model.modelName;
            return selector;
        }

        if (resultArg instanceof ORM) {
            throw new Error(
                "ORM instances cannot be the result function of selectors. You can access your models in the last function that you pass to `createSelectorFor()`."
            );
        }
        if (inputFuncs.length) {
            console.warn(
                "Your input selectors will be ignored: the passed result function does not require any input."
            );
        }

        return toSelector(resultArg);
    };
}
