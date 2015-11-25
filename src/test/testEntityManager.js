import {expect} from 'chai';
import {
    EntityManager,
    QuerySet,
    Entity,
} from '../index.js';

describe('EntityManager.extend', () => {
    it('correctly attaches props', () => {
        const Manager = EntityManager.extend({schema: 'people'});

        const manager = new Manager();

        const expectedSchema = {
            name: 'people',
            idAttribute: 'id',
            mapName: 'peopleById',
            arrName: 'people',
        };

        expect(manager.schema).to.deep.equal(expectedSchema);
        expect(manager.querySetClass).to.equal(QuerySet);
    });
});

describe('EntityManager', () => {
    let stateTree;
    const PersonManager = EntityManager.extend({
        schema: 'people',
    });
    let personManager;
    beforeEach(() => {
        stateTree = {
            people: {
                people: [0, 1],
                peopleById: {
                    0: {
                        name: 'Tommi',
                        age: 25,
                    },
                    1: {
                        name: 'John',
                        age: 50,
                    },
                },
            },
        };
        personManager = new PersonManager(stateTree.people);
    });
    it('works correctly', () => {
        personManager.filter({name: 'John'}).update({name: 'NotJohn'});

        const expected = {
            people: [0, 1],
            peopleById: {
                0: {
                    name: 'Tommi',
                    age: 25,
                },
                1: {
                    name: 'NotJohn',
                    age: 50,
                },
            },
        };
        const result = personManager.reduce();
        expect(result).to.deep.equal(expected);
    });

    it('works correctly here too', () => {
        personManager.create({name: 'Martti', age: 40});
        personManager.get({id: 0}).set('age', 30);

        const expected = {
            people: [0, 1, 2],
            peopleById: {
                0: {
                    name: 'Tommi',
                    age: 30,
                },
                1: {
                    name: 'John',
                    age: 50,
                },
                2: {
                    name: 'Martti',
                    age: 40,
                },
            },
        };
        const result = personManager.reduce();
        expect(result).to.deep.equal(expected);
    });

    it('nextId works', () => {
        expect(personManager.nextId()).to.equal(2);
    });

    it('overriding nextId works', () => {
        let nextIdCalled = false;
        const AlternatePersonManager = EntityManager.extend({
            schema: 'people',
            nextId() {
                nextIdCalled = true;
                return new Date();
            },

            oldPeople() {
                return this.getQuerySet().filter((person) => person.age > 40);
            },
        });
        const alternatePersonManager = new AlternatePersonManager(stateTree.people);
        alternatePersonManager.nextId();
        expect(nextIdCalled).to.be.true;

        const oldPeople = alternatePersonManager.oldPeople();
        expect(oldPeople.count()).to.equal(1);
    });

    it('get works', () => {
        const entity = personManager.get({id: 1});
        expect(entity).to.be.an.instanceof(Entity);
        expect(entity.getId()).to.equal(1);
    });
});

