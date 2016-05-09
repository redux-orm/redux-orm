import groupBy from 'lodash/groupBy';

/**
 * Handles a single unit of work on the database backend.
 */
const Transaction = class Transaction {
    constructor(updates) {
        this.updates = updates.map(update => ({ update, applied: false }));

        this.updatesByModelName = groupBy(this.updates, 'update.meta.name');
        this.meta = {};
        this.onCloseCallbacks = [];
    }

    getUpdatesFor(modelClass) {
        const modelName = modelClass.modelName;
        if (!this.updatesByModelName.hasOwnProperty(modelName)) {
            return [];
        }

        return this.updatesByModelName[modelName]
            .filter(update => !update.applied)
            .map(update => update.update);
    }

    markApplied(modelClass) {
        const modelName = modelClass.modelName;
        this.updatesByModelName[modelName].forEach(update => {
            update.applied = true; // eslint-disable-line no-param-reassign
        });
    }

    onClose(fn) {
        this.onCloseCallbacks.push(fn);
    }

    close() {
        this.onCloseCallbacks.forEach(cb => cb.call(null, this));
    }
};

export default Transaction;
