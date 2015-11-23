import {expect} from 'chai';
import {
    Schema,
    EntityManager,
} from '../index.js';

describe('EntityManager', () => {
    let schema;
    let stateTree;
    let personManager;
    beforeEach(() => {
        schema = new Schema('people', {
            idAttribute: 'id',
        });
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
        personManager = new EntityManager(stateTree.people, schema);
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
});

