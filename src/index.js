import EntityManager from './EntityManager';
import QuerySet from './QuerySet';
import Schema from './Schema';
import Entity from './Entity';
import {extend, attachQuerySetMethods} from './utils';

function EntityManagerExtend(...args) {
    const cls = extend.call(EntityManager, ...args);
    const querySetClass = cls.prototype.querySetClass;
    const sharedMethods = querySetClass.prototype.sharedMethods;
    attachQuerySetMethods(cls.prototype, sharedMethods);
    return cls;
}

EntityManager.extend = EntityManagerExtend;
QuerySet.extend = extend.bind(QuerySet);
Entity.extend = extend.bind(Entity);

const createManager = EntityManagerExtend;

export {Schema, EntityManager, Entity, QuerySet, createManager};

export default createManager;
