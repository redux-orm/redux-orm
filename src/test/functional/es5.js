const { Model, ORM } = require('../../../lib'); // eslint-disable-line import/no-unresolved

describe('ES5 library code', () => {
    describe('With ES6 client code', () => {
        let orm;
        let session;
        beforeEach(() => {
            class Book extends Model {}
            Book.modelName = 'Book';
            orm = new ORM();
            orm.register(Book);
            session = orm.session();
        });
        it('Model CRUD works', () => {
            let book;
            expect(() => {
                book = session.Book.create({ id: 1, title: 'title' });
            }).not.toThrow();
            expect(() => {
                book.update({ id: 1, title: 'new title' });
            }).not.toThrow();
        });
    });
});
