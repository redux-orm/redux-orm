import groupBy from 'lodash/groupBy';

/**
 * Handles a single unit of work on the database backend.
 */
const Transaction = class Transaction {
    constructor() {
        this.updates = [];
        this.updatesByModelName = {};

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

    getUnappliedUpdatesByModel() {
        const unappliedUpdates = this.updates
            .filter(update => !update.applied)
            .map(update => update.update);
        if (unappliedUpdates.length) {
            return groupBy(unappliedUpdates, 'meta.name');
        }
        return null;
    }

    markApplied(modelClass) {
        const modelName = modelClass.modelName;
        this.updatesByModelName[modelName].forEach(update => {
            update.applied = true; // eslint-disable-line no-param-reassign
        });
    }

    addUpdate(_update) {
        const update = { update: _update, applied: false };
        this.updates.push(update);
        const modelName = _update.meta.name;
        if (this.updatesByModelName.hasOwnProperty(modelName)) {
            this.updatesByModelName[modelName].push(update);
        } else {
            this.updatesByModelName[modelName] = [update];
        }
    }

    addUpdates(updates) {
        updates.forEach(update => this.addUpdate(update));
    }

    onClose(fn) {
        this.onCloseCallbacks.push(fn);
    }

    close() {
        this.onCloseCallbacks.forEach(cb => cb.call(null, this));
    }
};

export default Transaction;
