import {expect} from 'chai';
import sinon from 'sinon';

import Entity from '../Entity.js';
import {
    UPDATE,
    DELETE,
} from '../constants.js';

describe('Entity', () => {
    let mockManager;
    let entity;
    beforeEach(() => {
        mockManager = {
            schema: {
                idAttribute: 'id',
            },
            mutations: [],
        };
    });

    it('constructs a new Entity correctly', () => {
        entity = new Entity(mockManager, {id: 0, name: 'Tommi', age: 25});
        expect(entity.id).to.equal(0);
        expect(entity.name).to.equal('Tommi');
        expect(entity.age).to.equal(25);
    });

    it('getId works', () => {
        entity = new Entity(mockManager, {id: 0, name: 'Tommi', age: 25});
        expect(entity.getId()).to.equal(0);
    });

    it('set delegates to update', () => {
        entity = new Entity(mockManager, {id: 0, name: 'Tommi', age: 25});
        const updateSpy = sinon.spy(entity, 'update');

        entity.set('age', 35);

        expect(updateSpy.calledOnce).to.be.true;
        expect(updateSpy.firstCall.args[0]).to.deep.equal({age: 35});
    });

    it('update records a mutation', () => {
        entity = new Entity(mockManager, {id: 0, name: 'Tommi', age: 25});
        expect(mockManager.mutations).to.have.length(0);

        entity.update({name: 'Matt'});

        expect(mockManager.mutations).to.have.length(1);
        expect(mockManager.mutations[0]).to.deep.equal({
            type: UPDATE,
            payload: {
                idArr: [0],
                updater: {name: 'Matt'},
            },
        });
    });

    it('delete records a mutation', () => {
        entity = new Entity(mockManager, {id: 0, name: 'Tommi', age: 25});
        expect(mockManager.mutations).to.have.length(0);

        entity.delete();

        expect(mockManager.mutations).to.have.length(1);
        expect(mockManager.mutations[0]).to.deep.equal({
            type: DELETE,
            payload: [0],
        });
    });
});
