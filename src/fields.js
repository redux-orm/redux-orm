import UPDATE from './constants';
import {m2mName, m2mFromFieldName, m2mToFieldName} from './utils';


const Field = class Field {
    getRelatedModelName(thisModel, relatedModelName) {
        if (relatedModelName === 'this') {
            return thisModel.getName();
        }
        return relatedModelName;
    }
};

/**
 * The ForeignKey is a field class that defines a foreign key
 * to another {@link Model}.
 */
const ForeignKey = class ForeignKey extends Field {
    /**
     * Creates a {@link ForeignKey} instance based on the related
     * model name.
     *
     * @param  {string} relatedModelName - name of the related model
     */
    constructor(relatedModelName) {
        super(relatedModelName);
        this.relatedModelName = relatedModelName;
    }

    getGetter(session, instance, attrName, value) {
        const thisModelClass = instance.getClass();

        const relatedModelName = this.getRelatedModelName(thisModelClass, this.relatedModelName);
        const relatedModel = session[relatedModelName];
        const relatedManager = relatedModel.objects;

        const idAttribute = relatedModel.idAttribute;
        return relatedManager.get.bind(relatedManager, {[idAttribute]: value});
    }

    getSetter(session, instance, attrName) {
        return (arg) => {
            let relatedId;
            if (Number.isInteger(arg)) {
                relatedId = arg;
            } else {
                relatedId = arg.getId();
            }
            const modelClass = instance.getClass();
            modelClass.addMutation({
                type: UPDATE,
                payload: {
                    id: this.instance.getId(),
                    [attrName]: relatedId,
                },
            });
        };
    }
};

const ManyToMany = class ManyToMany extends Field {
    constructor(relatedModelName) {
        super(relatedModelName);
        this.relatedModelName = relatedModelName;
    }

    getGetter(session, instance, attrName) {
        return () => {
            const thisModelClass = instance.getClass();
            const tableName = m2mName(thisModelClass.getName(), attrName);
            const thisFieldName = m2mFromFieldName(thisModelClass.getName());
            const toFieldName = m2mToFieldName(this.relatedModelName);
            const throughManager = session[tableName].objects;
            const throughQs = session.getRelatedManager(tableName).filter({[thisFieldName]: instance.getId()});

            const relatedIds = throughQs.toPlain().map((through) => {
                return through[toFieldName];
            });
            const toModelName = this.getRelatedModelName(thisModelClass, this.relatedModelName);
            const toModel = session[toModelName];
            const toModelManager = toModel.objects;
            const qs = toModelManager.getQuerySetFromIds(relatedIds);

            qs.add = function add(...args) {
                const ids = args.map(entity => {
                    if (Number.isInteger(entity)) {
                        return entity;
                    }
                    return entity.getId();
                });

                ids.forEach(id => {
                    throughManager.create({
                        [thisFieldName]: instance.getId(),
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

                const thisId = instance.getId();
                const entitiesToDelete = throughManager.filter(through => {
                    if (through[thisFieldName] === thisId) {
                        if (idsToRemove.includes(through[toFieldName])) {
                            return true;
                        }
                    }

                    return false;
                });

                entitiesToDelete.delete();
            };

            return qs;
        };
    }

    getSetter() {
        return () => {
            throw new Error('Tried setting a M2M field. Please use the related QuerySet methods add and remove.');
        };
    }
};

export {ForeignKey, ManyToMany};
export default ForeignKey;
