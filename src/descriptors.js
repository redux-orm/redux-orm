import UPDATE from './constants';
import {m2mFromFieldName, m2mToFieldName} from './utils';

// Forwards side a Foreign Key: returns one object.
function forwardsManyToOneDescriptor(fieldName, declaredToModel) {
    return {
        get() {
            const toId = this._fields[fieldName];
            const toIdAttribute = declaredToModel.idAttribute;
            return declaredToModel.objects.get({[toIdAttribute]: toId});
        },
        set(value) {
            const thisId = this.getId();
            let toId;
            if (value instanceof declaredToModel) {
                toId = value.getId();
            } else {
                toId = value;
            }

            this.getClass().addMutation({
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

// Reverse side of a Foreign Key: returns many objects.
function reverseManyToOneDescriptor(declaredFieldName, declaredFromModel) {
    return {
        get() {
            const thisId = this.getId();
            return declaredFromModel.objects.filter({[declaredFieldName]: thisId});
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

            const fromFieldName = m2mFromFieldName(declaredFromModel.getName());
            const toFieldName = m2mToFieldName(declaredToModel.getName());

            const throughManager = throughModel.objects;

            const lookupObj = {};
            if (!reverse) {
                lookupObj[fromFieldName] = thisId;
            } else {
                lookupObj[toFieldName] = thisId;
            }

            const throughQs = throughManager.filter(lookupObj);

            const toIds = throughQs.toPlain().map(throughInstance => {
                return throughInstance[reverse ? fromFieldName : toFieldName];
            });

            const qsFromModel = reverse ? declaredFromModel : declaredToModel;
            const qs = qsFromModel.objects.getQuerySetFromIds(toIds);

            qs.add = function add(...args) {
                const ids = args.map(entity => {
                    if (Number.isInteger(entity)) {
                        return entity;
                    }
                    return entity.getId();
                });

                ids.forEach(id => {
                    throughManager.create({
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

                const entitiesToDelete = throughManager.filter(through => {
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

export {forwardsManyToOneDescriptor, reverseManyToOneDescriptor, manyToManyDescriptor};
