import EntityManager from './EntityManager';
import QuerySet from './QuerySet';
import {extend, attachQuerySetMethods} from './utils';

function EntityManagerExtend(...args) {
    const cls = extend.call(EntityManager, ...args);
    const querySetClass = cls.prototype.querySetClass;

    const defaultSharedMethodNames = querySetClass.prototype.defaultSharedMethodNames;
    const additionalSharedMethodNames = querySetClass.prototype.sharedMethodNames;

    attachQuerySetMethods(cls.prototype, defaultSharedMethodNames);
    attachQuerySetMethods(cls.prototype, additionalSharedMethodNames);
    return cls;
}

EntityManager.extend = EntityManagerExtend;
QuerySet.extend = extend.bind(QuerySet);

export {EntityManager, QuerySet};

export default EntityManager;
