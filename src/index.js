import EntityManager from './EntityManager';
import QuerySet from './QuerySet';
import Schema from './Schema';
import Entity from './Entity';
import {extend} from './utils';

EntityManager.extend = extend.bind(EntityManager);
QuerySet.extend = extend.bind(QuerySet);
Entity.extend = extend.bind(Entity);

const createManager = extend.bind(EntityManager);

export {Schema, EntityManager, Entity, QuerySet, createManager};

export default createManager;
