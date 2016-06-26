import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
    arrayDiffActions,
} from '../utils';

chai.use(sinonChai);
const { expect } = chai;

describe('Utils', () => {
    describe('arrayDiffActions', () => {
        it('normal case', () => {
            const target = [2, 3];
            const source = [1, 2, 4];

            const actions = arrayDiffActions(source, target);
            expect(actions.add).to.deep.equal([3]);
            expect(actions.delete).to.deep.equal([1, 4]);
        });

        it('only add', () => {
            const target = [2, 3];
            const source = [2];

            const actions = arrayDiffActions(source, target);
            expect(actions.add).to.deep.equal([3]);
            expect(actions.delete).to.deep.equal([]);
        });

        it('only remove', () => {
            const target = [2, 3];
            const source = [2, 3, 4];

            const actions = arrayDiffActions(source, target);
            expect(actions.add).to.deep.equal([]);
            expect(actions.delete).to.deep.equal([4]);
        });

        it('identical', () => {
            const target = [2, 3];
            const source = [2, 3];

            const actions = arrayDiffActions(source, target);
            expect(actions).to.equal(null);
        });
    });
});
