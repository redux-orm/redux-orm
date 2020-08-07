import ops from "immutable-ops";
import { FILTER, EXCLUDE } from "./constants";

/**
 * @module utils
 * @private
 */

/** @private */
function warnDeprecated(msg) {
    const logger =
        typeof console.warn === "function"
            ? console.warn.bind(console)
            : console.log.bind(console);
    return logger(msg);
}

/** @private */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Returns the branch name for a many-to-many relation.
 * The name is the combination of the model name and the field name the relation
 * was declared. The field name's first letter is capitalized.
 *
 * Example: model `Author` has a many-to-many relation to the model `Book`, defined
 * in the `Author` field `books`. The many-to-many branch name will be `AuthorBooks`.
 *
 * @param  {string} declarationModelName - the name of the model the many-to-many relation was declared on
 * @param  {string} fieldName            - the field name where the many-to-many relation was declared on
 * @return {string} The branch name for the many-to-many relation.
 */
function m2mName(declarationModelName, fieldName) {
    return declarationModelName + capitalize(fieldName);
}

/**
 * Returns the fieldname that saves a foreign key to the
 * model id where the many-to-many relation was declared.
 *
 * Example: `Author` => `fromAuthorId`
 *
 * @param  {string} declarationModelName - the name of the model where the relation was declared
 * @return {string} the field name in the through model for `declarationModelName`'s foreign key.
 */
function m2mFromFieldName(declarationModelName) {
    return `from${declarationModelName}Id`;
}

/**
 * Returns the fieldname that saves a foreign key in a many-to-many through model to the
 * model where the many-to-many relation was declared.
 *
 * Example: `Book` => `toBookId`
 *
 * @param  {string} otherModelName - the name of the model that was the target of the many-to-many
 *                                   declaration.
 * @return {string} the field name in the through model for `otherModelName`'s foreign key..
 */
function m2mToFieldName(otherModelName) {
    return `to${otherModelName}Id`;
}

/** */
function reverseFieldName(modelName) {
    return modelName.toLowerCase() + "Set"; // eslint-disable-line prefer-template
}

/** @private */
function querySetDelegatorFactory(methodName) {
    return function querySetDelegator(...args) {
        return this.getQuerySet()[methodName](...args);
    };
}

/** @private */
function querySetGetterDelegatorFactory(getterName) {
    return function querySetGetterDelegator() {
        const qs = this.getQuerySet();
        return qs[getterName];
    };
}

/** @private */
function forEachSuperClass(subClass, func) {
    let currClass = subClass;
    while (currClass !== Function.prototype) {
        func(currClass);
        currClass = Object.getPrototypeOf(currClass);
    }
}

/** */
function attachQuerySetMethods(modelClass, querySetClass) {
    const leftToDefine = querySetClass.sharedMethods.slice();

    // There is no way to get a property descriptor for the whole prototype chain;
    // only from an objects own properties. Therefore we traverse the whole prototype
    // chain for querySet.
    forEachSuperClass(querySetClass, (cls) => {
        for (let i = 0; i < leftToDefine.length; i++) {
            let defined = false;
            const methodName = leftToDefine[i];
            const descriptor = Object.getOwnPropertyDescriptor(
                cls.prototype,
                methodName
            );
            if (typeof descriptor !== "undefined") {
                if (typeof descriptor.get !== "undefined") {
                    descriptor.get = querySetGetterDelegatorFactory(methodName);
                    Object.defineProperty(modelClass, methodName, descriptor);
                } else {
                    modelClass[methodName] = querySetDelegatorFactory(
                        methodName
                    );
                }
                defined = true;
            }
            if (defined) {
                leftToDefine.splice(i--, 1);
            }
        }
    });
}

/**
 * Normalizes `entity` to an id, where `entity` can be an id
 * or a Model instance.
 *
 * @param  {*} entity - either a Model instance or an id value
 * @return {*} the id value of `entity`
 */
function normalizeEntity(entity) {
    if (
        entity !== null &&
        typeof entity !== "undefined" &&
        typeof entity.getId === "function"
    ) {
        return entity.getId();
    }
    return entity;
}

/** */
function reverseFieldErrorMessage(
    modelName,
    fieldName,
    toModelName,
    backwardsFieldName
) {
    return [
        `Reverse field ${backwardsFieldName} already defined`,
        ` on model ${toModelName}. To fix, set a custom related`,
        ` name on ${modelName}.${fieldName}.`,
    ].join("");
}

/**
 * Fastest way to check if two objects are equal.
 * Object and array values have to be referentially equal.
 */
function objectShallowEquals(a, b) {
    const entriesInA = Object.entries(Object(a));

    if (entriesInA.length !== Object.keys(b).length) {
        return false;
    }

    return entriesInA.every(
        ([key, value]) => b.hasOwnProperty(key) && b[key] === value
    );
}

/** */
function arrayDiffActions(sourceArr, targetArr) {
    const itemsInBoth = sourceArr.filter((item) => targetArr.includes(item));
    const deleteItems = sourceArr.filter((item) => !itemsInBoth.includes(item));
    const addItems = targetArr.filter((item) => !itemsInBoth.includes(item));

    if (deleteItems.length || addItems.length) {
        return {
            delete: deleteItems,
            add: addItems,
        };
    }
    return null;
}

const { getBatchToken } = ops;

/**
 * @return boolean
 */
function clauseFiltersByAttribute({ type, payload }, attribute) {
    if (type !== FILTER) return false;

    if (typeof payload !== "object") {
        /**
         * payload could also be a function in which case
         * we would have no way of knowing what it does,
         * so we default to false for non-objects
         */
        return false;
    }

    if (!payload.hasOwnProperty(attribute)) return false;
    const attributeValue = payload[attribute];
    if (attributeValue === null) return false;
    if (attributeValue === undefined) return false;

    return true;
}

/**
 * @return boolean
 */
function clauseReducesResultSetSize({ type }) {
    return [FILTER, EXCLUDE].includes(type);
}

/**
 * @param {Object} object
 * @return Object
 */
function mapValues(object, func) {
    return Object.entries(object).reduce((newObject, [key, value]) => {
        newObject[key] = func(value);
        return newObject;
    }, {});
}

/** */
function normalizeModelReference(modelNameOrClass) {
    if (!modelNameOrClass || typeof modelNameOrClass === "string") {
        return modelNameOrClass;
    }
    return modelNameOrClass.modelName;
}

export {
    attachQuerySetMethods,
    m2mName,
    m2mFromFieldName,
    m2mToFieldName,
    reverseFieldName,
    normalizeEntity,
    reverseFieldErrorMessage,
    objectShallowEquals,
    ops,
    arrayDiffActions,
    getBatchToken,
    clauseFiltersByAttribute,
    clauseReducesResultSetSize,
    warnDeprecated,
    mapValues,
    normalizeModelReference,
};
