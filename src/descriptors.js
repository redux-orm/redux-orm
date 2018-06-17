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
            const {
                session: {
                    [declaredToModelName]: DeclaredToModel,
                },
            } = this.getClass();
            const {
                [fieldName]: toId,
            } = this._fields;

            return DeclaredToModel.withId(toId);
        },
        set(value) {
            this.update({
                [fieldName]: normalizeEntity(value),
            });
        },
    };
}

const forwardOneToOneDescriptor = forwardManyToOneDescriptor;

function backwardOneToOneDescriptor(declaredFieldName, declaredFromModelName) {
    return {
        get() {
            const {
                session: {
                    [declaredFromModelName]: DeclaredFromModel,
                },
            } = this.getClass();

            return DeclaredFromModel.get({
                [declaredFieldName]: this.getId(),
            });
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
            const {
                session: {
                    [declaredFromModelName]: DeclaredFromModel,
                },
            } = this.getClass();

            return DeclaredFromModel.filter({
                [declaredFieldName]: this.getId(),
            });
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
    reverse
) {
    return {
        get() {
            const {
                session: {
                    [declaredFromModelName]: DeclaredFromModel,
                    [declaredToModelName]: DeclaredToModel,
                    [throughModelName]: ThroughModel,
                },
            } = this.getClass();

            const ThisModel = reverse
                ? DeclaredToModel
                : DeclaredFromModel;
            const OtherModel = reverse
                ? DeclaredFromModel
                : DeclaredToModel;

            const thisReferencingField = reverse
                ? throughFields.to
                : throughFields.from;
            const otherReferencingField = reverse
                ? throughFields.from
                : throughFields.to;

            const thisId = this.getId();

            const throughQs = ThroughModel.filter({
                [thisReferencingField]: thisId,
            });

            /**
             * all IDs of instances of the other model that are
             * referenced by any instance of the current model
             */
            const referencedOtherIds = new Set(
                throughQs
                    .toRefArray()
                    .map(obj => obj[otherReferencingField])
            );

            /**
             * selects all instances of other model that are referenced
             * by any instance of the current model
             */
            const qs = OtherModel.filter(otherModelInstance =>
                referencedOtherIds.has(
                    otherModelInstance[OtherModel.idAttribute]
                )
            );

            /**
             * Allows adding OtherModel instances to be referenced by the current instance.
             *
             * E.g. Book.first().authors.add(1, 2) would add the authors with IDs 1 and 2
             * to the first book's list of referenced authors.
             *
             * @return undefined
             */
            qs.add = function add(...args) {
                const idsToAdd = new Set(
                    args.map(normalizeEntity)
                );

                const existingQs = throughQs.filter(through =>
                    idsToAdd.has(through[otherReferencingField])
                );

                if (existingQs.exists()) {
                    const existingIds = existingQs
                        .toRefArray()
                        .map(through => through[otherReferencingField]);

                    throw new Error(`Tried to add already existing ${OtherModel.modelName} id(s) ${existingIds} to the ${ThisModel.modelName} instance with id ${thisId}`);
                }

                idsToAdd.forEach(id =>
                    ThroughModel.create({
                        [otherReferencingField]: id,
                        [thisReferencingField]: thisId,
                    })
                );
            };

            /**
             * Removes references to all OtherModel instances from the current model.
             *
             * E.g. Book.first().authors.clear() would cause the first book's list
             * of referenced authors to become empty.
             *
             * @return undefined
             */
            qs.clear = function clear() {
                throughQs.delete();
            };

            /**
             * Removes references to all passed OtherModel instances from the current model.
             *
             * E.g. Book.first().authors.remove(1, 2) would cause the authors with
             * IDs 1 and 2 to no longer be referenced by the first book.
             *
             * @return undefined
             */
            qs.remove = function remove(...entities) {
                const idsToRemove = new Set(entities.map(normalizeEntity));

                const entitiesToDelete = throughQs.filter(
                    through => idsToRemove.has(through[otherReferencingField])
                );

                if (entitiesToDelete.count() !== idsToRemove.size) {
                    // Tried deleting non-existing entities.
                    const entitiesToDeleteIds = entitiesToDelete
                        .toRefArray()
                        .map(through => through[otherReferencingField]);

                    const unexistingIds = [...idsToRemove].filter(
                        id => !includes(entitiesToDeleteIds, id)
                    );

                    throw new Error(`Tried to delete non-existing ${OtherModel.modelName} id(s) ${unexistingIds} from the ${ThisModel.modelName} instance with id ${thisId}`);
                }

                entitiesToDelete.delete();
            };

            return qs;
        },

        set() {
            throw new Error('Tried setting a M2M field. Please use the related QuerySet methods add, remove and clear.');
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
