import UPDATE from './constants';
import {m2mFromFieldName, m2mToFieldName} from './utils';

// Forwards side a Foreign Key: returns one object.
// Also works as forwardsOneToOneDescriptor.
function forwardManyToOneDescriptor(fieldName, declaredToModel) {
    return {
        get() {
            const toId = this._fields[fieldName];
            if (typeof toId !== 'undefined') {
                return declaredToModel.withId(toId);
            }
            return undefined;
        },
        set(value) {
            const thisId = this.getId();
            let toId;
            if (value instanceof declaredToModel) {
                toId = value.getId();
            } else {
                toId = value;
            }

            this.getClass().addUpdate({
                type: UPDATE,
                payload: {
                    idArr: [thisId],
                    updater: {
                        [fieldName]: toId,
                    },
                },
            });
        },
    };
}

const forwardOneToOneDescriptor = forwardManyToOneDescriptor;

function backwardOneToOneDescriptor(declaredFieldName, declaredFromModel) {
    return {
        get() {
            const thisId = this.getId();
            return declaredFromModel.get({[declaredFieldName]: thisId});
        },
        set() {
            throw new Error('Can\'t mutate a reverse one-to-one relation.');
        },
    };
}

// Reverse side of a Foreign Key: returns many objects.
function backwardManyToOneDescriptor(declaredFieldName, declaredFromModel) {
    return {
        get() {
            const thisId = this.getId();
            return declaredFromModel.filter({[declaredFieldName]: thisId});
        },
        set() {
            throw new Error('Can\'t mutate a reverse many-to-one relation.');
        },
    };
}

// Both sides of Many to Many, use the reverse flag.
function manyToManyDescriptor(declaredFromModel, declaredToModel, throughModel, reverse) {
    return {
        get() {
            const thisId = this.getId();

            const fromFieldName = m2mFromFieldName(declaredFromModel.modelName);
            const toFieldName = m2mToFieldName(declaredToModel.modelName);

            const lookupObj = {};
            if (!reverse) {
                lookupObj[fromFieldName] = thisId;
            } else {
                lookupObj[toFieldName] = thisId;
            }

            const throughQs = throughModel.filter(lookupObj);
            const toIdsSet = {};

            throughQs.plain.objects().forEach(throughObject => {
                const id = throughObject[reverse ? fromFieldName : toFieldName];
                if (typeof id !== 'undefined') {
                    toIdsSet[id] = true;
                }
            });
            const toIds = Object.keys(toIdsSet);

            const qsFromModel = reverse ? declaredFromModel : declaredToModel;
            const qs = qsFromModel.getQuerySetFromIds(toIds);

            qs.add = function add(...args) {
                const ids = args.map(entity => {
                    if (Number.isInteger(entity)) {
                        return entity;
                    }
                    return entity.getId();
                });

                ids.forEach(id => {
                    throughModel.create({
                        [fromFieldName]: thisId,
                        [toFieldName]: id,
                    });
                });
            };

            qs.remove = function remove(...entities) {
                let idsToRemove;
                if (Number.isInteger(entities[0])) {
                    idsToRemove = entities;
                } else {
                    idsToRemove = entities.map(entity => entity.getId());
                }

                const entitiesToDelete = throughModel.filter(through => {
                    if (through[fromFieldName] === thisId) {
                        if (idsToRemove.includes(through[toFieldName])) {
                            return true;
                        }
                    }

                    return false;
                });

                entitiesToDelete.delete();
            };

            return qs;
        },

        set() {
            throw new Error('Tried setting a M2M field. Please use the related QuerySet methods add and remove.');
        },
    };
}

export {
    forwardManyToOneDescriptor,
    forwardOneToOneDescriptor,
    backwardOneToOneDescriptor,
    backwardManyToOneDescriptor,
    manyToManyDescriptor,
};
