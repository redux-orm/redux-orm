import { Model, QuerySet, ORM, Backend, Schema } from "../..";
import { createTestSessionWithData, createTestORM } from "../helpers";

describe("Deprecations", () => {
    let session;
    let orm;
    let state;
    const consoleWarn = {
        timesRun: 0,
        lastMessage: null,
    };

    describe("With session", () => {
        beforeEach(() => {
            ({ session, orm, state } = createTestSessionWithData());
            consoleWarn.timesRun = 0;
            consoleWarn.lastMessage = null;
            console.warn = (msg) => {
                consoleWarn.timesRun++;
                consoleWarn.lastMessage = msg;
            };
        });

        it("ORM#withMutations is deprecated", () => {
            expect(consoleWarn.timesRun).toBe(0);

            expect(orm.withMutations(state).state).toEqual(
                orm.mutableSession(state).state
            );

            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe(
                "`ORM.prototype.withMutations` has been deprecated. Use `ORM.prototype.mutableSession` instead."
            );
        });

        it("ORM#from is deprecated", () => {
            expect(consoleWarn.timesRun).toBe(0);

            expect(orm.from(state).state).toEqual(orm.session(state).state);

            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe(
                "`ORM.prototype.from` has been deprecated. Use `ORM.prototype.session` instead."
            );
        });

        it("ORM#getDefaultState is deprecated", () => {
            expect(consoleWarn.timesRun).toBe(0);

            expect(orm.getDefaultState()).toEqual(orm.getEmptyState());

            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe(
                "`ORM.prototype.getDefaultState` has been deprecated. Use `ORM.prototype.getEmptyState` instead."
            );
        });

        it("ORM#define is deprecated", () => {
            expect(() => orm.define()).toThrow(
                "`ORM.prototype.define` has been removed. Please define a Model class."
            );
        });

        it("Model.hasId is deprecated", () => {
            expect(consoleWarn.timesRun).toBe(0);
            const { Book } = session;

            expect(Book.hasId(0)).toEqual(Book.idExists(0));
            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe(
                "`Model.hasId` has been deprecated. Please use `Model.idExists` instead."
            );

            expect(Book.hasId(4326262342)).toEqual(Book.idExists(4326262342));
            expect(consoleWarn.timesRun).toBe(2);
            expect(consoleWarn.lastMessage).toBe(
                "`Model.hasId` has been deprecated. Please use `Model.idExists` instead."
            );
        });

        it("Model.backend is deprecated", () => {
            expect(consoleWarn.timesRun).toBe(0);
            const { Book } = session;

            Book.backend = () => "retval";
            expect(Book.tableOptions()).toEqual("retval");
            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe(
                "`Model.backend` has been deprecated. Please rename to `.options`."
            );

            Book.backend = "retval";
            expect(Book.tableOptions()).toEqual("retval");
            expect(consoleWarn.timesRun).toBe(2);
            expect(consoleWarn.lastMessage).toBe(
                "`Model.backend` has been deprecated. Please rename to `.options`."
            );
        });

        it("Session#getNextState is deprecated", () => {
            expect(consoleWarn.timesRun).toBe(0);

            expect(session.getNextState()).toEqual(session.state);
            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe(
                "`Session.prototype.getNextState` has been deprecated. Access the `Session.prototype.state` property instead."
            );
        });

        it("Session#reduce is deprecated", () => {
            expect(() => session.reduce()).toThrow(
                "`Session.prototype.reduce` has been removed. The Redux integration API is now decoupled from ORM and Session - see the 0.9 migration guide in the GitHub repo."
            );
        });
    });

    describe("Without session", () => {
        let Book;
        beforeEach(() => {
            orm = createTestORM();
            consoleWarn.timesRun = 0;
            consoleWarn.lastMessage = null;
            console.warn = (msg) => {
                consoleWarn.timesRun++;
                consoleWarn.lastMessage = msg;
            };
            Book = orm.get("Book");
        });

        it("Backend is deprecated", () => {
            expect(() => new Backend()).toThrow(
                "Having a custom Backend instance is now unsupported. Documentation for database customization is upcoming, for now please look at the db folder in the source."
            );
        });

        it("Schema is deprecated", () => {
            expect(() => new Schema()).toThrow(
                "Schema has been renamed to ORM. Please import ORM instead of Schema from Redux-ORM."
            );
        });

        it("QuerySet#withModels is deprecated", () => {
            const bookQs = orm.get("Book").getQuerySet();
            expect(() => bookQs.withModels).toThrow(
                "`QuerySet.prototype.withModels` has been removed. Use `.toModelArray()` or predicate functions that instantiate Models from refs, e.g. `new Model(ref)`."
            );
        });

        it("QuerySet#withRefs is deprecated", () => {
            expect(consoleWarn.timesRun).toBe(0);
            const bookQs = Book.getQuerySet();

            expect(bookQs.withRefs).toBe(undefined);

            expect(consoleWarn.timesRun).toBe(1);
            expect(consoleWarn.lastMessage).toBe(
                "`QuerySet.prototype.withRefs` has been deprecated. " +
                    "Query building operates on refs only now."
            );
        });

        it("QuerySet#map is deprecated", () => {
            const bookQs = Book.getQuerySet();
            expect(() => bookQs.map()).toThrow(
                "`QuerySet.prototype.map` has been removed. Call `.toModelArray()` or `.toRefArray()` first to map."
            );
        });

        it("QuerySet#forEach is deprecated", () => {
            const bookQs = Book.getQuerySet();
            expect(() => bookQs.forEach()).toThrow(
                "`QuerySet.prototype.forEach` has been removed. Call `.toModelArray()` or `.toRefArray()` first to iterate."
            );
        });

        it("Model#getNextState is deprecated", () => {
            const book = new Book();
            expect(() => book.getNextState()).toThrow(
                "`Model.prototype.getNextState` has been removed. See the 0.9 migration guide on the GitHub repo."
            );
        });
    });
});
