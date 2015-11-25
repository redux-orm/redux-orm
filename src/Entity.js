import {
    DELETE,
    UPDATE,
} from './constants.js';

/**
 * A thin wrapper around an plain object entity to record mutations.
 */
const Entity = class Entity {
    /**
     * Creates a new Entity
     * @param  {EntityManager} manager - the manager instance recording mutations.
     * @param  {Object} props - an object that represents the Entity with the `idAttribute` included.
     */
    constructor(manager, props) {
        Object.assign(this, {_manager: manager}, props);
        this._fieldNames = Object.keys(props);
    }

    getId() {
        return this[this._manager.schema.idAttribute];
    }

    /**
     * Returns a plain JavaScript object representation
     * of the entity, with the id value set on the`idAttribute` key.
     * `idAttribute` is looked up on the `EntityManager` class that controls
     * this entity.
     * @return {Object} a plain JavaScript object representing the Entity
     */
    toPlain() {
        const obj = {};
        this._fieldNames.forEach((fieldName) => {
            obj[fieldName] = this[fieldName];
        });
        return obj;
    }

    /**
     * Records a mutation to the Entity instance for a single
     * field value assignment.
     * @param {string} propertyName - name of the property to set
     * @param {*} value - value assigned to the property
     * @return {undefined}
     */
    set(propertyName, value) {
        this.update({[propertyName]: value});
    }

    /**
     * Records a mutation to the Entity instance for multiple field value assignments.
     * @param  {Object} mergeObj - an object that will be merged with this instance.
     * @return {undefined}
     */
    update(mergeObj) {
        Object.assign(this, mergeObj);
        this._manager.mutations.push({
            type: UPDATE,
            payload: {
                idArr: [this.getId()],
                updater: mergeObj,
            },
        });
    }

    /**
     * Records the Entity to be deleted.
     * @return {undefined}
     */
    delete() {
        this._manager.mutations.push({
            type: DELETE,
            payload: [this.getId()],
        });
    }
};

export default Entity;
