/**
 * @module utils
 */

/**
 * A simple ListIterator implementation.
 */
class ListIterator {
    /**
     * Creates a new ListIterator instance.
     * @param  {Array} list - list to iterate over
     * @param  {Number} [idx=0] - starting index. Defaults to `0`
     * @param  {Function} [getValue] a function that receives the current `idx`
     *                               and `list` and should return the value that
     *                               `next` should return. Defaults to `(idx, list) => list[idx]`
     */
    constructor(list, idx, getValue) {
        this.list = list;
        this.idx = idx || 0;

        if (typeof getValue === 'function') {
            this.getValue = getValue;
        }
    }

    /**
     * The default implementation for the `getValue` function.
     *
     * @param  {Number} idx - the current iterator index
     * @param  {Array} list - the list being iterated
     * @return {*} - the value at index `idx` in `list`.
     */
    getValue(idx, list) {
        return list[idx];
    }

    /**
     * Returns the next element from the iterator instance.
     * Always returns an Object with keys `value` and `done`.
     * If the returned element is the last element being iterated,
     * `done` will equal `true`, otherwise `false`. `value` holds
     * the value returned by `getValue`.
     *
     * @return {Object|undefined} Object with keys `value` and `done`, or
     *                            `undefined` if the list index is out of bounds.
     */
    next() {
        if (this.idx < this.list.length - 1) {
            return {
                value: this.getValue(this.list, this.idx++),
                done: false,
            };
        } else if (this.idx < this.list.length) {
            return {
                value: this.getValue(this.list, this.idx++),
                done: true,
            };
        }

        return undefined;
    }
}

/**
 * Checks if the properties in `lookupObj` match
 * the corresponding properties in `entity`.
 * @param  {Object} lookupObj - properties to match against
 * @param  {Object} entity - object to match
 * @return {Boolean} Returns `true` if the property names in
 *                   `lookupObj` have the same values in `lookupObj`
 *                   and `entity`, `false` if not.
 */
function match(lookupObj, entity) {
    const keys = Object.keys(lookupObj);
    return keys.every((key) => {
        return lookupObj[key] === entity[key];
    });
}

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

function reverseFieldName(modelName) {
    return modelName.toLowerCase() + 'Set';
}

function querySetDelegatorFactory(methodName) {
    return function querySetDelegator(...args) {
        return this.getQuerySet()[methodName](...args);
    };
}

function attachQuerySetMethods(modelClass, querySetClass) {
    const querySetSharedMethods = querySetClass.sharedMethods;
    querySetSharedMethods.forEach(methodName => {
        // Check for descriptor.
        const descriptor = Object.getOwnPropertyDescriptor(querySetClass.prototype, methodName);
        if (typeof descriptor !== 'undefined' && typeof descriptor.get !== 'undefined') {
            Object.defineProperty(modelClass, methodName, descriptor);
        } else {
            modelClass[methodName] = querySetDelegatorFactory(methodName);
        }
    });

    // `plain` and `models` are specially handled cases
    // as they're static getters.
    Object.defineProperties(modelClass, {
        plain: {
            get() {
                this._plain = true;
                return this;
            },
        },
        models: {
            get() {
                this._plain = false;
                return this;
            },
        },
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
    if (entity !== null &&
            typeof entity !== 'undefined' &&
            typeof entity.getId === 'function') {
        return entity.getId();
    }
    return entity;
}

export {
    match,
    attachQuerySetMethods,
    m2mName,
    m2mFromFieldName,
    m2mToFieldName,
    reverseFieldName,
    ListIterator,
    normalizeEntity,
};
