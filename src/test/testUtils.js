import { arrayDiffActions } from '../utils';

describe('Utils', () => {
    describe('arrayDiffActions', () => {
        it('normal case', () => {
            const target = [2, 3];
            const source = [1, 2, 4];

            const actions = arrayDiffActions(source, target);
            expect(actions.add).toEqual([3]);
            expect(actions.delete).toEqual([1, 4]);
        });

        it('only add', () => {
            const target = [2, 3];
            const source = [2];

            const actions = arrayDiffActions(source, target);
            expect(actions.add).toEqual([3]);
            expect(actions.delete).toEqual([]);
        });

        it('only remove', () => {
            const target = [2, 3];
            const source = [2, 3, 4];

            const actions = arrayDiffActions(source, target);
            expect(actions.add).toEqual([]);
            expect(actions.delete).toEqual([4]);
        });

        it('identical', () => {
            const target = [2, 3];
            const source = [2, 3];

            const actions = arrayDiffActions(source, target);
            expect(actions).toBe(null);
        });
    });
});
