import {expect} from 'chai';
import Schema from '../Schema.js';

describe('Schema constructor', () => {
    it('gets correct default attributes', () => {
        const schema = new Schema('items');
        expect(schema.idAttribute).to.equal('id');
        expect(schema.arrName).to.equal('items');
        expect(schema.mapName).to.equal('itemsById');
    });

    it('overrides idAttribute correctly', () => {
        const schema = new Schema('items', {idAttribute: 'pk'});
        expect(schema.idAttribute).to.equal('pk');
    });

    it('overrides arrName and mapName correctly', () => {
        const schema = new Schema('items', {
            arrName: 'notitemsArr',
            mapName: 'notitemsMap',
        });
        expect(schema.arrName).to.equal('notitemsArr');
        expect(schema.mapName).to.equal('notitemsMap');
    });
});

describe('Schema methods', () => {
    let schema;
    const mockTree = {
        items: [0, 1],
        itemsById: {
            0: {},
            1: {},
        },
    };

    beforeEach(() => {
        schema = new Schema('items');
    });

    it('accessIdArray works', () => {
        expect(schema.accessIdArray(mockTree)).to.equal(mockTree.items);
    });

    it('accessMap works', () => {
        expect(schema.accessMap(mockTree)).to.equal(mockTree.itemsById);
    });

    it('accessId works', () => {
        expect(schema.accessId(mockTree, 1)).to.equal(mockTree.itemsById[1]);
    });

    it('getDefaultState works', () => {
        const expected = {
            items: [],
            itemsById: {},
        };

        expect(schema.getDefaultState()).to.deep.equal(expected);
    });
});
