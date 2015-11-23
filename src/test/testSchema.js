import {expect} from 'chai';
import Schema from '../Schema.js';

describe('Schema', () => {
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
