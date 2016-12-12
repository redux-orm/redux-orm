import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
chai.use(sinonChai);
const { expect } = chai;
import {
    Model as BaseModel,
    ManyToMany,
    attr,
} from '../';
import Table from '../db/Table';
import { UPDATE, DELETE } from '../constants';

describe('Model', () => {
    describe('static method', () => {
        let Model;
        const sessionMock = { db: { tables: { Model: new Table() } } };

        beforeEach(() => {
            // Get a fresh copy
            // of Model, so our manipulations
            // won't survive longer than each test.
            Model = class TestModel extends BaseModel {};
            Model.modelName = 'Model';
        });

        it('session getter works correctly', () => {
            expect(Model.session).to.be.undefined;
            Model._session = sessionMock;
            expect(Model.session).to.equal(sessionMock);
        });

        it('connect works correctly', () => {
            expect(Model.session).to.be.undefined;
            Model.connect(sessionMock);

            expect(Model.session).to.equal(sessionMock);
        });
    });

    describe('Instance methods', () => {
        let Model;
        let instance;

        beforeEach(() => {
            Model = class TestModel extends BaseModel {};
            Model.modelName = 'Model';
            Model.fields = {
                id: attr(),
                name: attr(),
                tags: new ManyToMany('_'),
            };

            instance = new Model({ id: 0, name: 'Tommi' });
        });


        it('equals works correctly', () => {
            const anotherInstance = new Model({ id: 0, name: 'Tommi' });
            expect(instance.equals(anotherInstance)).to.be.ok;
        });

        it('getClass works correctly', () => {
            expect(instance.getClass()).to.equal(Model);
        });
    });
});
