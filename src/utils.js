
/**
 * Simple Queue implementation.
 */
class Queue {
    constructor(...args) {
        if (args.length > 1) {
            this._queue = [...args];
        } else if (args.length === 1) {
            this._queue = [args[0]];
        } else {
            this._queue = [];
        }
        this._offset = 0;
    }

    enqueue(item) {
        this._queue.push(item);
    }

    dequeue() {
        if (this._queue.length === 0) return undefined;

        const item = this._queue[this._offset++];

        if (this._offset * 2 > this._queue.length) {
            this._queue = this._queue.slice(this._offset);
            this._offset = 0;
        }

        return item;
    }

    isEmpty() {
        return this._queue.length === 0;
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

function m2mName(declarationModelName, fieldName) {
    return declarationModelName + '_' + fieldName;
}

function m2mFromFieldName(declarationModelName) {
    return `from_${declarationModelName}_id`;
}

function m2mToFieldName(otherModelName) {
    return `to_${otherModelName}_id`;
}

function extend(props) {
    const parent = this;

    function childConstructor() {
        parent.apply(this, arguments);
    }

    Object.assign(childConstructor, parent);

    childConstructor.prototype = Object.create(parent.prototype);
    Object.assign(childConstructor.prototype, props);
    return childConstructor;
}

function querySetDelegatorFactory(methodName) {
    return function querySetDelegator(...args) {
        return this.getQuerySet()[methodName](...args);
    };
}

function attachQuerySetMethods(target, methodNames) {
    methodNames.forEach(methodName => {
        target[methodName] = querySetDelegatorFactory(methodName);
    });
}

export {match, extend, attachQuerySetMethods, m2mName, m2mFromFieldName, m2mToFieldName, Queue};
