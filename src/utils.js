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

function extend(props) {
    const parent = this;

    function childConstructor() {
        parent.apply(this, arguments);
    }

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

export {match, extend, attachQuerySetMethods};
