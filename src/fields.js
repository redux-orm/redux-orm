import UPDATE from './constants';
import {m2mName, m2mFromFieldName, m2mToFieldName} from './utils';

class ForeignKey {
    constructor(relatedModelName) {
        this.relatedModelName = relatedModelName;
    }

    getGetter(orm, instance, attrName, value) {
        const relatedManager = orm.getRelatedManager(this.relatedModelName);
        return relatedManager.get.bind(relatedManager, value);
    }

    getSetter(orm, instance, attrName) {
        return (arg) => {
            let relatedId;
            if (Number.isInteger(arg)) {
                relatedId = arg;
            } else {
                relatedId = arg.getId();
            }
            this.manager.mutations.push({
                type: UPDATE,
                payload: {
                    id: this.instance.getId(),
                    [attrName]: relatedId,
                },
            });
        };
    }
}

class ManyToMany {
    constructor(relatedModelName) {
        this.relatedModelName = relatedModelName;
    }

    getGetter(orm, instance, attrName) {
        return () => {
            const tableName = m2mName(instance.getClass().name, attrName);
            const thisFieldName = m2mFromFieldName(instance.getClass().name);
            const toFieldName = m2mToFieldName(this.relatedModelName);
            const throughQs = orm.getRelatedManager(tableName).filter({[thisFieldName]: instance.getId()});
            const relatedIds = throughQs.toPlain().map((through) => {
                return through[toFieldName];
            });

            const toModelManager = orm.getRelatedManager(this.relatedModelName);

            const qs = toModelManager.getQuerySetFromIds(relatedIds);

            const entityWithM2M = instance;

            qs.add = function add(...args) {
                const ids = relatedIds.slice();
                if (args.length > 1) {
                    args.forEach(entity => {
                        if (Number.isInteger(entity)) {
                            ids.push(entity);
                        } else {
                            ids.push(entity.getId());
                        }
                    });
                }
                entityWithM2M.constructor.addMutation({
                    type: UPDATE,
                    payload: {
                        id: entityWithM2M.id,
                        [attrName]: ids,
                    },
                });
            };

            qs.remove = function remove(...entities) {
                if (entities.length < 1) {
                    return undefined;
                }
                let idsToRemove;

                if (Number.isInteger(entities[0])) {
                    idsToRemove = entities;
                } else {
                    idsToRemove = entities.map(entity => entity.getId());
                }

                const nextIds = relatedIds.filter(id => !idsToRemove.includes(id));

                entityWithM2M.constructor.addMutation({
                    type: UPDATE,
                    payload: {
                        id: entityWithM2M.id,
                        [attrName]: nextIds,
                    },
                });
            };

            return qs;
        };
    }

    getSetter() {
        return () => {
            throw new Error('Tried setting a M2M field. Please use the related QuerySet methods add and remove.');
        };
    }
}

export {ForeignKey, ManyToMany};
export default ForeignKey;
