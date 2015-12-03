import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
chai.use(sinonChai);
const {expect} = chai;
import BaseModel from '../Model';
import {ForeignKey, ManyToMany} from '../fields';

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
            Model = Object.create(BaseModel);
            Model.getMetaOptions = () => {
                return {
                    name: 'Model',
                };
            };
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

        it('callUserReducer calls reducer with correct arguments', () => {
            const reducerResult = {};
            const reducerStub = sinon.stub().returns(reducerResult);
            Model.reducer = reducerStub;

            Model._session = sessionMock;

            const result = Model.callUserReducer();
            expect(result).to.equal(reducerResult);
            expect(reducerStub).to.have.been.calledOnce;
            expect(reducerStub).to.have.been.calledWithExactly(stateMock, actionMock, Model, sessionMock);
        });

        it('callUserReducer calls reducer with correct arguments', () => {
            const reducerResult = {};
            const reducerStub = sinon.stub().returns(reducerResult);
            Model.reducer = reducerStub;

            Model._session = sessionMock;
            const MetaMock = {};
            Model.getMetaInstance = () => MetaMock;
        });
    });

    describe('static method delegated to Meta', () => {
        let Model;
        let metaMock;
        const stateMock = {};

        beforeEach(() => {
            Model = Object.create(BaseModel);
            Model.getMetaOptions = () => {
                return {
                    name: 'Model',
                };
            };
            metaMock = {};
            Model.getMetaInstance = () => metaMock;
            Object.defineProperty(Model, 'state', {
                get: () => stateMock,
            });
        });

        it('accessId correctly delegates', () => {
            const accessIdSpy = sinon.spy();
            metaMock.accessId = accessIdSpy;

            const arg = 1;
            Model.accessId(arg);

            expect(accessIdSpy).to.have.been.calledOnce;
            expect(accessIdSpy).to.have.been.calledWithExactly(stateMock, arg);
        });

        it('accessIds correctly delegates', () => {
            const accessIdsSpy = sinon.spy();
            metaMock.accessIdList = accessIdsSpy;

            Model.accessIds();

            expect(accessIdsSpy).to.have.been.calledOnce;
            expect(accessIdsSpy).to.have.been.calledWithExactly(stateMock);
        });

        it('accessList correctly delegates', () => {
            const accessIdsSpy = sinon.spy();
            metaMock.accessIdList = accessIdsSpy;

            Model.accessIds();

            expect(accessIdsSpy).to.have.been.calledOnce;
            expect(accessIdsSpy).to.have.been.calledWithExactly(stateMock);
        });
    });
});
