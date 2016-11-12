import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
chai.use(sinonChai);
const { expect } = chai;
import BaseModel from '../Model';
import { UPDATE, DELETE } from '../constants';
import { many, attribute } from '../fields';

describe('Model', () => {
    describe('static method', () => {
        let Model;
        const sessionMock = {};
        const stateMock = {};
        const actionMock = {};

        sessionMock.action = actionMock;

        sessionMock.getState = () => stateMock;

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

        it('getBackend works correctly', () => {
            const BackendMockClass = sinon.stub();
            Model.getBackendClass = () => BackendMockClass;

            const instance = Model.getBackend();
            expect(instance).to.be.an.instanceOf(BackendMockClass);
        });
    });

    describe('static method delegates to Backend', () => {
        let Model;
        let backendMock;
        let sessionMock;
        let markAccessedSpy;
        const stateMock = {};

        beforeEach(() => {
            Model = Object.create(BaseModel);
            Model.modelName = 'Model';
            markAccessedSpy = sinon.spy();
            sessionMock = { markAccessed: markAccessedSpy };
            backendMock = {};
            Model.getBackend = () => backendMock;
            Model._session = sessionMock;
            Object.defineProperty(Model, 'state', {
                get: () => stateMock,
            });
        });

        it('accessId correctly delegates', () => {
            const accessIdSpy = sinon.spy();
            backendMock.accessId = accessIdSpy;

            const arg = 1;
            Model.accessId(arg);

            expect(accessIdSpy).to.have.been.calledOnce;
            expect(accessIdSpy).to.have.been.calledWithExactly(stateMock, arg);
            expect(markAccessedSpy).to.have.been.calledOnce;
        });

        it('accessIds correctly delegates', () => {
            const accessIdsSpy = sinon.spy();
            backendMock.accessIdList = accessIdsSpy;

            Model.accessIds();

            expect(accessIdsSpy).to.have.been.calledOnce;
            expect(accessIdsSpy).to.have.been.calledWithExactly(stateMock);
            expect(markAccessedSpy).to.have.been.calledOnce;
        });

        it('accessList correctly delegates', () => {
            const accessIdsSpy = sinon.spy();
            backendMock.accessIdList = accessIdsSpy;

            Model.accessIds();

            expect(accessIdsSpy).to.have.been.calledOnce;
            expect(accessIdsSpy).to.have.been.calledWithExactly(stateMock);
            expect(markAccessedSpy).to.have.been.calledOnce;
        });
    });

    describe('Instance methods', () => {
        let Model;
        let Tag;
        let instance;
        let sessionMock;
        let stateMock;
        let actionMock;

        beforeEach(() => {
            sessionMock = {};
            stateMock = {};
            actionMock = {};

            sessionMock.action = actionMock;

            sessionMock.getState = () => stateMock;
            // Get a fresh copy
            // of Model, so our manipulations
            // won't survive longer than each test.
            Model = class TestModel extends BaseModel {};
            Model.modelName = 'Model';
            Model.fields = {
                tags: many('Tag'),
                name: attribute(),
            };
            Tag = class extends BaseModel {};

            Model.markAccessed = () => undefined;

            instance = new Model({ id: 0, name: 'Tommi' });
        });

        it('delete works correctly', () => {
            const addUpdateSpy = sinon.spy();
            Model.addUpdate = addUpdateSpy;

            expect(addUpdateSpy).not.called;
            instance.delete();
            expect(addUpdateSpy).calledOnce;
            expect(addUpdateSpy.getCall(0).args[0]).to.deep.equal({
                type: DELETE,
                payload: [instance.id],
            });
        });

        it('update works correctly', () => {
            const addUpdateSpy = sinon.spy();
            Model.addUpdate = addUpdateSpy;

            expect(addUpdateSpy).not.called;
            instance.update({ name: 'Matt' });
            expect(addUpdateSpy).calledOnce;
            expect(addUpdateSpy.getCall(0).args[0]).to.deep.equal({
                type: UPDATE,
                payload: {
                    idArr: [instance.id],
                    mergeObj: {
                        name: 'Matt',
                    },
                },
            });
        });

        it('update does not save unknown fields', () => {
            const addUpdateSpy = sinon.spy();
            Model.addUpdate = addUpdateSpy;

            instance.update({ unknownKey: 'test' });
            expect(addUpdateSpy.getCall(0).args[0]).to.deep.equal({
                type: UPDATE,
                payload: {
                    idArr: [instance.id],
                    mergeObj: {},
                },
            });
        });

        it('update works correctly when updating many-to-many relation', () => {
            const addSpy = sinon.spy();
            const removeSpy = sinon.spy();

            const addUpdateSpy = sinon.spy();
            Model.addUpdate = addUpdateSpy;
            Model.fields = { fakem2m: many('_') };
            instance = new Model({ id: 0, name: 'Tommi', fakem2m: [1, 2, 3] });

            // instance.fakem2m = ... evokes a setter, needs to use defineProperty
            // for mocking
            Object.defineProperty(instance, 'fakem2m', {
                value: {
                    add: addSpy,
                    remove: removeSpy,
                    idArr: [1, 2, 3],
                },
            });

            instance.update({ fakem2m: [3, 4] });

            expect(removeSpy).to.have.been.calledOnce;
            expect(removeSpy).to.have.been.calledWith(1, 2);

            expect(addSpy).to.have.been.calledOnce;
            expect(addSpy).to.have.been.calledWith(4);
        });

        it('set works correctly', () => {
            Model.addUpdate = () => undefined;

            const updateSpy = sinon.spy(instance, 'update');

            expect(updateSpy).not.called;
            instance.set('name', 'Matt');
            expect(updateSpy).calledOnce;
            expect(updateSpy.getCall(0).args[0]).to.deep.equal({
                name: 'Matt',
            });
        });

        it('ref works correctly', () => {
            const backendMock = {};
            Model.getBackend = () => backendMock;
            const dbObj = {};
            backendMock.accessId = () => dbObj;
            Model._session = sessionMock;
            sessionMock.backend = backendMock;

            expect(instance.ref).to.equal(dbObj);
        });

        it('equals works correctly', () => {
            const anotherInstance = new Model({ id: 0, name: 'Tommi', tags: [] });
            expect(instance.equals(anotherInstance)).to.be.ok;
        });

        it('toString works correctly', () => {
            expect(instance.toString()).to.equal('Model: {tags: , name: Tommi, id: 0}');
        });

        it('getId works correctly', () => {
            expect(instance.getId()).to.equal(0);
        });

        it('getClass works correctly', () => {
            expect(instance.getClass()).to.equal(Model);
        });
    });
});
