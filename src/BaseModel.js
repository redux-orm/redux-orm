import forOwn from 'lodash/object/forOwn';
import EntityManager from './EntityManager';
import {ForeignKey, ManyToMany} from './fields';
import sortByAll from 'lodash/collection/sortByAll';
import omit from 'lodash/object/omit';
import {CREATE, UPDATE, DELETE, ORDER} from './constants';
import {m2mName, m2mToFieldName, m2mFromFieldName} from './utils';

class BaseModel {
    constructor(props) {
        this._fields = props;
        const attrs = Object.keys(props);
        this._fieldNames = attrs;
    }

    equals(otherModel) {
        return this.prototype === otherModel.prototype && this.getId() === otherModel.getId();
    }

    static get objects() {
        return new EntityManager(this);
    }

    getId() {
        return this._fields[this.getClass().idAttribute];
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
            obj[fieldName] = this._fields[fieldName];
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
        this.getClass().mutations.push({
            type: UPDATE,
            payload: {
                idArr: [this.getId()], // TODO: What if ID changed?
                updater: mergeObj,
            },
        });
    }

    /**
     * Records the Entity to be deleted.
     * @return {undefined}
     */
    delete() {
        this.getClass().mutations.push({
            type: DELETE,
            payload: [this.getId()],
        });
    }
}

function ModelFactory(defineM2M, orm, modelState, modelName, relatedFields, reducer, metaOpts) {
    const meta = metaOpts || {idAttribute: 'id'};
    // Enqueue any M2M relation definitions needed for this model.
    forOwn(relatedFields, (fieldInstance, fieldName) => {
        if (fieldInstance instanceof ManyToMany) {
            let relatedModelName;
            if (fieldInstance.relatedModelName === 'this') {
                relatedModelName = this.name;
            } else {
                relatedModelName = fieldInstance.relatedModelName;
            }
            const fromFieldName = m2mFromFieldName(modelName);
            const toFieldName = m2mToFieldName(relatedModelName);

            const Through = defineM2M(m2mName(modelName, fieldName), {
                [fromFieldName]: new ForeignKey(modelName),
                [toFieldName]: new ForeignKey(relatedModelName),
            });
        }
    });


    const mutations = [];

    function addMutation(mutation) {
        mutations.push(mutation);
    }

    const currentAction = orm.action;

    const inheritFrom = meta.modelClass || BaseModel;

    class Model extends inheritFrom {
        constructor(props) {
            super(props);
            this.meta = {
                name: modelName,
            };
            this.reducer = reducer;
            this._orm = orm;

            const fieldsAssigned = [];

            forOwn(relatedFields, (fieldInstance, fieldName) => {
                Object.defineProperty(this, fieldName, {
                    get: fieldInstance.getGetter(orm, this, fieldName, props[fieldName]),
                    set: fieldInstance.getSetter(orm, this, fieldName),
                });
                fieldsAssigned.push(fieldName);
            });

            forOwn(props, (fieldValue, fieldName) => {
                if (!fieldsAssigned.includes(fieldName)) {
                    Object.defineProperty(this, fieldName, {
                        get: () => fieldValue,
                        set: (value) => {
                            addMutation({
                                type: UPDATE,
                                payload: {
                                    [meta.idAttribute]: this.getId(),
                                    [fieldName]: value,
                                },
                            });
                        },
                    });
                }
            });
        }

        getClass() {
            return this._orm[this.meta.name];
        }

        static get name() {
            return modelName;
        }

        static get idAttribute() {
            return meta.idAttribute;
        }

        static get arrName() {
            return 'items';
        }

        static get mapName() {
            return 'itemsById';
        }

        static nextId() {
            return Math.max(...modelState[this.arrName]) + 1;
        }

        static getDefaultState() {
            return {
                [this.arrName]: [],
                [this.mapName]: {},
            };
        }

        static get state() {
            return modelState;
        }

        static addMutation(mutation) {
            addMutation(mutation);
        }

        static get mutations() {
            return mutations;
        }

        static get objects() {
            return new EntityManager(this);
        }

        static reducer() {
            if (typeof reducer === 'function') {
                return reducer(modelState, currentAction, this, orm);
            }
            return this.reduce();
        }

        /**
         * Applies recorded mutations and returns a new state tree.
         * @return {Object} the reduced state tree
         */
        static reduce() {
            const arrName = this.arrName;
            const mapName = this.mapName;
            return mutations.reduce((state, action) => {
                switch (action.type) {
                case CREATE:
                case DELETE:
                    // These mutation types operate on both the idArray and entityMap.
                    return {
                        [arrName]: this.reduceIdArray(state[arrName], action),
                        [mapName]: this.reduceEntityMap(state[mapName], action),
                    };
                case ORDER:
                    // Order mutates only the id array.
                    return {
                        [arrName]: this.reduceIdArray(state[arrName], action),
                        [mapName]: state[mapName],
                    };
                case UPDATE:
                    // Update mutates only the entityMap, since we don't allow
                    // for updating id's.
                    return {
                        [arrName]: state[arrName],
                        [mapName]: this.reduceEntityMap(state[mapName], action),
                    };
                default:
                    return state;
                }
            }, modelState);
        }

        static reduceIdArray(idArr, action) {
            const idAttribute = this.idAttribute;
            switch (action.type) {
            case CREATE:
                const payloadId = action.payload[idAttribute];
                const newId = payloadId ? payloadId : this.nextId();
                return [...idArr, newId];
            case DELETE:
                const idsToDelete = action.payload.idArr;
                return idArr.filter(id => !idsToDelete.includes(id));
            case ORDER:
                const entities = sortByAll(this.getFullEntities(), action.payload);
                return entities.map(entity => entity[idAttribute]);
            default:
                return idArr;
            }
        }

        static reduceEntityMap(entityMap, action) {
            switch (action.type) {
            case CREATE:
                const payloadId = action.payload[this.idAttribute];
                const newId = payloadId ? payloadId : this.nextId();
                return {
                    ...entityMap,
                    [newId]: Object.assign({}, omit(action.payload, 'id')),
                };
            case UPDATE:
                let mapper;
                if (typeof action.payload.updater === 'function') {
                    mapper = action.payload.updater;
                } else {
                    mapper = entity => Object.assign({}, entity, action.payload.updater);
                }

                const updatesMap = action.payload.idArr.reduce((map, _id) => {
                    map[_id] = mapper(entityMap[_id]);
                    return map;
                }, {});

                return {
                    ...entityMap,
                    ...updatesMap,
                };
            case DELETE:
                const idsToDelete = action.payload.idArr;
                return omit(entityMap, idsToDelete);
            default:
                return entityMap;
            }
        }
    }

    return Model;
}
export {ModelFactory, BaseModel};
export default ModelFactory;
