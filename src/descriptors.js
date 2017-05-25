import difference from 'lodash/difference';
import {
    normalizeEntity,
    includes,
} from './utils';


function attrDescriptor(fieldName) {
    return {
        get() {
            return this._fields[fieldName];
        },

        set(value) {
            return this.set(fieldName, value);
        },

        enumerable: true,
        configurable: true,
    };
}

// Forwards side a Foreign Key: returns one object.
// Also works as forwardsOneToOneDescriptor.
function forwardManyToOneDescriptor(fieldName, declaredToModelName) {
    return {
        get() {
            const currentSession = this.getClass().session;
            const declaredToModel = currentSession[declaredToModelName];
            const toId = this._fields[fieldName];
            if (typeof toId !== 'undefined' && toId !== null) {
                return declaredToModel.withId(toId);
            }
            return undefined;
        },
        set(value) {
            const currentSession = this.getClass().session;
            const declaredToModel = currentSession[declaredToModelName];

            let toId;
            if (value instanceof declaredToModel) {
                toId = value.getId();
            } else {
                toId = value;
            }

            this.update({ [fieldName]: toId });
        },
    };
}

const forwardOneToOneDescriptor = forwardManyToOneDescriptor;

function backwardOneToOneDescriptor(declaredFieldName, declaredFromModelName) {
    return {
        get() {
            const currentSession = this.getClass().session;
            const declaredFromModel = currentSession[declaredFromModelName];
            const thisId = this.getId();
            let found;
            try {
                found = declaredFromModel.get({ [declaredFieldName]: thisId });
            } catch (e) {
                return null;
            }
            return found;
        },
        set() {
            throw new Error('Can\'t mutate a reverse one-to-one relation.');
        },
    };
}

// Reverse side of a Foreign Key: returns many objects.
function backwardManyToOneDescriptor(declaredFieldName, declaredFromModelName) {
    return {
        get() {
            const currentSession = this.getClass().session;
            const declaredFromModel = currentSession[declaredFromModelName];
            const thisId = this.getId();
            return declaredFromModel.filter({ [declaredFieldName]: thisId });
        },
        set() {
            throw new Error('Can\'t mutate a reverse many-to-one relation.');
        },
    };
}

// Both sides of Many to Many, use the reverse flag.
function manyToManyDescriptor(
    declaredFromModelName,
    declaredToModelName,
    throughModelName,
    throughFields,
    reverse) {
    return {
        get() {
            const currentSession = this.getClass().session;
            const declaredFromModel = currentSession[declaredFromModelName];
            const declaredToModel = currentSession[declaredToModelName];
            const throughModel = currentSession[throughModelName];
            const thisId = this.getId();

            const fromFieldName = throughFields.from;
            const toFieldName = throughFields.to;

            const lookupObj = {};
            if (!reverse) {
                lookupObj[fromFieldName] = thisId;
            } else {
                lookupObj[toFieldName] = thisId;
            }

            const throughQs = throughModel.filter(lookupObj);
            const toIds = throughQs.toRefArray().map(obj => obj[reverse ? fromFieldName : toFieldName]);

            const qsFromModel = reverse ? declaredFromModel : declaredToModel;
            const qs = qsFromModel.filter(attrs =>
                includes(toIds, attrs[qsFromModel.idAttribute])
            );

            qs.add = function add(...args) {
                const idsToAdd = args.map(normalizeEntity);

                const filterWithAttr = reverse ? fromFieldName : toFieldName;

                const existingQs = throughQs.filter(through => includes(idsToAdd, through[filterWithAttr]));

                if (existingQs.exists()) {
                    const existingIds = existingQs
                        .toRefArray()
                        .map(through => through[filterWithAttr]);

                    const toAddModel = reverse
                        ? declaredFromModel.modelName
                        : declaredToModel.modelName;

                    const addFromModel = reverse
                        ? declaredToModel.modelName
                        : declaredFromModel.modelName;
                    throw new Error(`Tried to add already existing ${toAddModel} id(s) ${existingIds} to the ${addFromModel} instance with id ${thisId}`);
                }

                if (reverse) {
                    idsToAdd.forEach((id) => {
                        throughModel.create({
                            [fromFieldName]: id,
                            [toFieldName]: thisId,
                        });
                    });
                } else {
                    idsToAdd.forEach((id) => {
                        throughModel.create({
                            [fromFieldName]: thisId,
                            [toFieldName]: id,
                        });
                    });
                }
            };

            qs.clear = function clear() {
                throughQs.delete();
            };

            qs.remove = function remove(...entities) {
                const idsToRemove = entities.map(normalizeEntity);

                const attrInIdsToRemove = reverse ? fromFieldName : toFieldName;
                const entitiesToDelete = throughQs.filter(
                    through => includes(idsToRemove, through[attrInIdsToRemove])
                );

                if (entitiesToDelete.count() !== idsToRemove.length) {
                    // Tried deleting non-existing entities.
                    const entitiesToDeleteIds = entitiesToDelete
                        .toRefArray()
                        .map(through => through[attrInIdsToRemove]);

                    const unexistingIds = difference(idsToRemove, entitiesToDeleteIds);

                    const toDeleteModel = reverse
                        ? declaredFromModel.modelName
                        : declaredToModel.modelName;

                    const deleteFromModel = reverse
                        ? declaredToModel.modelName
                        : declaredFromModel.modelName;

                    throw new Error(`Tried to delete non-existing ${toDeleteModel} id(s) ${unexistingIds} from the ${deleteFromModel} instance with id ${thisId}`);
                }

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
    attrDescriptor,
    forwardManyToOneDescriptor,
    forwardOneToOneDescriptor,
    backwardOneToOneDescriptor,
    backwardManyToOneDescriptor,
    manyToManyDescriptor,
};
