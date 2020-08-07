import { Model, QuerySet, ORM, attr, many, fk } from "../..";
import { createTestSessionWithData } from "../helpers";

describe("Many to many relationships", () => {
    let session;
    let orm;
    let state;

    describe("many-many forward/backward updates", () => {
        let Team;
        let User;
        let teamFirst;
        let userFirst;
        let userLast;

        const validateRelationState = () => {
            const { TeamUsers } = session;

            teamFirst = session.Team.first();
            userFirst = session.User.first();
            userLast = session.User.last();

            expect(teamFirst.users.toRefArray().map((row) => row.id)).toEqual([
                userFirst.id,
                userLast.id,
            ]);
            expect(userFirst.teams.toRefArray().map((row) => row.id)).toEqual([
                teamFirst.id,
            ]);
            expect(userLast.teams.toRefArray().map((row) => row.id)).toEqual([
                teamFirst.id,
            ]);

            expect(TeamUsers.count()).toBe(2);
        };

        beforeEach(() => {
            User = class extends Model {};
            User.modelName = "User";
            User.fields = {
                id: attr(),
                name: attr(),
                subscribed: many("User", "subscribers"),
            };

            Team = class extends Model {};
            Team.modelName = "Team";
            Team.fields = {
                id: attr(),
                name: attr(),
                users: many("User", "teams"),
            };

            orm = new ORM();
            orm.register(User, Team);
            session = orm.session();

            session.Team.create({ name: "team0" });
            session.Team.create({ name: "team1" });

            session.User.create({ name: "user0" });
            session.User.create({ name: "user1" });
            session.User.create({ name: "user2" });

            teamFirst = session.Team.first();
            userFirst = session.User.first();
            userLast = session.User.last();
        });

        // eslint-disable-next-line jest/expect-expect
        it("add forward many-many field", () => {
            teamFirst.users.add(userFirst, userLast);
            validateRelationState();
        });

        // eslint-disable-next-line jest/expect-expect
        it("update forward many-many field", () => {
            teamFirst.update({ users: [userFirst, userLast] });
            validateRelationState();
        });

        // eslint-disable-next-line jest/expect-expect
        it("add backward many-many field", () => {
            userFirst.teams.add(teamFirst);
            userLast.teams.add(teamFirst);
            validateRelationState();
        });

        // eslint-disable-next-line jest/expect-expect
        it("update backward many-many field", () => {
            userFirst.update({ teams: [teamFirst] });
            userLast.update({ teams: [teamFirst] });
            validateRelationState();
        });

        it("create with forward many-many field", () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.User.create({ name: "user0" });
            session.User.create({ name: "user1" });
            session.User.create({ name: "user2" });

            session.Team.create({
                name: "team0",
                users: [session.User.first(), session.User.last()],
            });
            session.Team.create({ name: "team1" });

            validateRelationState();
        });

        it("create with backward many-many field", () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.Team.create({ name: "team0" });
            session.Team.create({ name: "team1" });

            session.User.create({
                name: "user0",
                teams: [session.Team.first()],
            });
            session.User.create({ name: "user1" });
            session.User.create({
                name: "user2",
                teams: [session.Team.first()],
            });

            validateRelationState();
        });

        it("create with forward field with future many-many", () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.Team.create({ id: "t0", users: ["u0", "u2"] });
            session.Team.create({ id: "t1" });

            session.User.create({ id: "u0" });
            session.User.create({ id: "u1" });
            session.User.create({ id: "u2" });

            validateRelationState();
        });

        it("create with backward field with future many-many", () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.User.create({ id: "u0", teams: ["t0"] });
            session.User.create({ id: "u1" });
            session.User.create({ id: "u2", teams: ["t0"] });

            session.Team.create({ id: "t0" });
            session.Team.create({ id: "t1" });

            validateRelationState();
        });

        it("create with forward field and existing backward many-many", () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.User.create({ id: "u0", teams: ["t0"] });
            session.User.create({ id: "u1" });
            session.User.create({ id: "u2", teams: ["t0"] });

            session.Team.create({ id: "t0", users: ["u0", "u2"] });
            session.Team.create({ id: "t1" });

            validateRelationState();
        });

        it("create with backward field and existing forward many-many", () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.Team.create({ id: "t0", users: ["u0", "u2"] });
            session.Team.create({ id: "t1" });

            session.User.create({ id: "u0", teams: ["t0"] });
            session.User.create({ id: "u1" });
            session.User.create({ id: "u2", teams: ["t0"] });

            validateRelationState();
        });

        it("deletes with custom field name", () => {
            const Apple = class extends Model {};
            Apple.modelName = "Apple";
            Apple.fields = {
                id: attr(),
                comparableIds: many({
                    to: "Orange",
                    as: "comparables",
                    relatedName: "comparableIds",
                }),
            };

            const Orange = class extends Model {};
            Orange.modelName = "Orange";
            Orange.fields = {
                id: attr(),
            };

            orm = new ORM();
            orm.register(Apple, Orange);
            session = orm.session();
            expect(session.Apple.count()).toBe(0);
            expect(session.Orange.count()).toBe(0);

            session.Apple.create({ id: "a0", comparableIds: [] });
            session.Orange.create({ id: "o0" });

            expect(session.Apple.count()).toBe(1);
            session.Apple.first().delete();
            expect(session.Apple.count()).toBe(0);

            expect(session.Orange.count()).toBe(1);
            session.Orange.first().delete();
            expect(session.Orange.count()).toBe(0);

            session.Apple.create({ id: "a0", comparableIds: ["o0"] });
            session.Orange.create({ id: "o0", comparableIds: ["a0"] });

            expect(session.Apple.count()).toBe(1);
            session.Apple.first().delete();
            expect(session.Apple.count()).toBe(0);

            expect(session.Orange.count()).toBe(1);
            session.Orange.first().delete();
            expect(session.Orange.count()).toBe(0);
        });
    });

    describe("many-many with a custom through model", () => {
        const validateRelationState = () => {
            const { User, Team, User2Team } = session;

            // Forward (from many-to-many field declaration)
            const user = User.get({ name: "user0" });
            const { teams: relatedTeams } = user;
            expect(relatedTeams).toBeInstanceOf(QuerySet);
            expect(relatedTeams.modelClass).toBe(Team);
            expect(relatedTeams.count()).toBe(1);

            // Backward
            const team = Team.get({ name: "team0" });
            const { users: relatedUsers } = team;
            expect(relatedUsers).toBeInstanceOf(QuerySet);
            expect(relatedUsers.modelClass).toBe(User);
            expect(relatedUsers.count()).toBe(2);

            expect(relatedUsers.toRefArray().map((row) => row.id)).toEqual([
                "u0",
                "u1",
            ]);
            expect(
                Team.withId("t2")
                    .users.toRefArray()
                    .map((row) => row.id)
            ).toEqual(["u1"]);

            expect(relatedTeams.toRefArray().map((row) => row.id)).toEqual([
                team.id,
            ]);
            expect(
                User.withId("u1")
                    .teams.toRefArray()
                    .map((row) => row.id)
            ).toEqual(["t0", "t2"]);

            expect(User2Team.count()).toBe(3);
        };

        // eslint-disable-next-line jest/expect-expect
        it("without throughFields", () => {
            const UserModel = class extends Model {};
            UserModel.modelName = "User";
            UserModel.fields = {
                id: attr(),
                name: attr(),
            };
            const User2TeamModel = class extends Model {};
            User2TeamModel.modelName = "User2Team";
            User2TeamModel.fields = {
                user: fk("User"),
                team: fk("Team"),
            };
            const TeamModel = class extends Model {};
            TeamModel.modelName = "Team";
            TeamModel.fields = {
                id: attr(),
                name: attr(),
                users: many({
                    to: "User",
                    through: "User2Team",
                    relatedName: "teams",
                }),
            };

            orm = new ORM();
            orm.register(UserModel, TeamModel, User2TeamModel);
            session = orm.session(orm.getEmptyState());
            const { User, Team, User2Team } = session;

            Team.create({ id: "t0", name: "team0" });
            Team.create({ id: "t1", name: "team1" });
            Team.create({ id: "t2", name: "team2" });

            User.create({ id: "u0", name: "user0", teams: ["t0"] });
            User.create({ id: "u1", name: "user1", teams: ["t0", "t2"] });

            validateRelationState();
        });

        // eslint-disable-next-line jest/expect-expect
        it("with throughFields", () => {
            const UserModel = class extends Model {};
            UserModel.modelName = "User";
            UserModel.fields = {
                id: attr(),
                name: attr(),
            };
            const User2TeamModel = class extends Model {};
            User2TeamModel.modelName = "User2Team";
            User2TeamModel.fields = {
                user: fk("User"),
                team: fk("Team"),
            };
            const TeamModel = class extends Model {};
            TeamModel.modelName = "Team";
            TeamModel.fields = {
                id: attr(),
                name: attr(),
                users: many({
                    to: "User",
                    through: "User2Team",
                    relatedName: "teams",
                    throughFields: ["user", "team"],
                }),
            };

            orm = new ORM();
            orm.register(UserModel, TeamModel, User2TeamModel);
            session = orm.session(orm.getEmptyState());
            const { User, Team, User2Team } = session;

            Team.create({ id: "t0", name: "team0" });
            Team.create({ id: "t1", name: "team1" });
            Team.create({ id: "t2", name: "team2" });

            User.create({ id: "u0", name: "user0", teams: ["t0"] });
            User.create({ id: "u1", name: "user1", teams: ["t0", "t2"] });

            validateRelationState();
        });

        it("with additional attributes", () => {
            const UserModel = class extends Model {};
            UserModel.modelName = "User";
            UserModel.fields = {
                id: attr(),
                name: attr(),
            };
            const User2TeamModel = class extends Model {};
            User2TeamModel.modelName = "User2Team";
            User2TeamModel.fields = {
                user: fk("User", "links"),
                team: fk("Team", "links"),
                name: attr(),
            };
            const TeamModel = class extends Model {};
            TeamModel.modelName = "Team";
            TeamModel.fields = {
                id: attr(),
                name: attr(),
                users: many({
                    to: "User",
                    through: "User2Team",
                    relatedName: "teams",
                }),
            };

            orm = new ORM();
            orm.register(UserModel, TeamModel, User2TeamModel);
            session = orm.session(orm.getEmptyState());
            const { User, Team, User2Team } = session;

            Team.create({ id: "t0", name: "team0" });
            Team.create({ id: "t1", name: "team1" });
            Team.create({ id: "t2", name: "team2" });

            User.create({ id: "u0", name: "user0" });
            User.create({ id: "u1", name: "user1" });

            User2Team.create({ user: "u0", team: "t0", name: "link0" });
            User2Team.create({ user: "u1", team: "t0", name: "link1" });
            User2Team.create({ user: "u1", team: "t2", name: "link2" });

            validateRelationState();

            expect(
                User.withId("u0")
                    .links.toRefArray()
                    .map((row) => row.name)
            ).toEqual(["link0"]);
            expect(
                User.withId("u1")
                    .links.toRefArray()
                    .map((row) => row.name)
            ).toEqual(["link1", "link2"]);
        });

        it("throws if self-referencing relationship without throughFields", () => {
            const UserModel = class extends Model {};
            UserModel.modelName = "User";
            UserModel.fields = {
                id: attr(),
                name: attr(),
                users: many({
                    to: "User",
                    through: "User2User",
                    relatedName: "otherUsers",
                }),
            };
            const User2UserModel = class extends Model {};
            User2UserModel.modelName = "User2User";
            User2UserModel.fields = {
                id: attr(),
                name: attr(),
            };

            orm = new ORM();
            expect(() => {
                orm.register(UserModel, User2UserModel);
            }).toThrow(
                'Self-referencing many-to-many relationship at "User.users" using custom model "User2User" has no throughFields key. Cannot determine which fields reference the instances partaking in the relationship.'
            );
        });
    });

    describe('self-referencing many field with "this" as toModelName', () => {
        beforeEach(() => {
            ({ session, orm, state } = createTestSessionWithData());
        });

        it('adds relationships correctly when toModelName is "this"', () => {
            const { Tag, TagSubTags } = session;
            expect(TagSubTags.count()).toBe(0);
            Tag.withId("Technology").subTags.add("Redux");
            expect(TagSubTags.all().toRefArray()).toEqual([
                {
                    id: 0,
                    fromTagId: "Technology",
                    toTagId: "Redux",
                },
            ]);
            expect(Tag.withId("Technology").subTags.count()).toBe(1);
            expect(Tag.withId("Technology").subTags.toRefArray()).toEqual([
                Tag.withId("Redux").ref,
            ]);

            expect(Tag.withId("Redux").subTags.count()).toBe(0);
            expect(Tag.withId("Redux").subTags.toRefArray()).toEqual([]);
        });

        it('removes relationships correctly when toModelName is "this"', () => {
            const { Tag, TagSubTags } = session;
            Tag.withId("Technology").subTags.add("Redux");
            Tag.withId("Redux").subTags.add("Technology");

            Tag.withId("Redux").subTags.remove("Technology");

            expect(Tag.withId("Technology").subTags.toRefArray()).toEqual([
                Tag.withId("Redux").ref,
            ]);
            expect(TagSubTags.all().toRefArray()).toEqual([
                {
                    id: 0,
                    fromTagId: "Technology",
                    toTagId: "Redux",
                },
            ]);
            expect(Tag.withId("Technology").subTags.count()).toBe(1);
            expect(Tag.withId("Redux").subTags.toRefArray()).toEqual([]);
            expect(Tag.withId("Redux").subTags.count()).toBe(0);
        });

        it('querying backwards relationships works when toModelName is "this"', () => {
            const { Tag } = session;
            Tag.withId("Technology").subTags.add("Redux");

            expect(Tag.withId("Redux").parentTags.toRefArray()).toEqual([
                Tag.withId("Technology").ref,
            ]);
            expect(Tag.withId("Redux").parentTags.count()).toBe(1);
            expect(Tag.withId("Technology").parentTags.toRefArray()).toEqual(
                []
            );
            expect(Tag.withId("Technology").parentTags.count()).toBe(0);
        });

        it('adding relationships via backwards descriptor works when toModelName is "this"', () => {
            const { Tag } = session;
            Tag.withId("Redux").parentTags.add("Technology");

            expect(Tag.withId("Redux").parentTags.toRefArray()).toEqual([
                Tag.withId("Technology").ref,
            ]);
            expect(Tag.withId("Redux").parentTags.count()).toBe(1);
            expect(Tag.withId("Technology").subTags.toRefArray()).toEqual([
                Tag.withId("Redux").ref,
            ]);
            expect(Tag.withId("Technology").subTags.count()).toBe(1);
        });

        it('removing relationships via backwards descriptor works when toModelName is "this"', () => {
            const { Tag, TagSubTags } = session;
            Tag.withId("Technology").subTags.add("Redux");
            Tag.withId("Redux").subTags.add("Technology");

            Tag.withId("Technology").parentTags.remove("Redux");

            expect(Tag.withId("Technology").subTags.toRefArray()).toEqual([
                Tag.withId("Redux").ref,
            ]);
            expect(TagSubTags.all().toRefArray()).toEqual([
                {
                    id: 0,
                    fromTagId: "Technology",
                    toTagId: "Redux",
                },
            ]);
            expect(Tag.withId("Technology").subTags.count()).toBe(1);
            expect(Tag.withId("Redux").subTags.toRefArray()).toEqual([]);
            expect(Tag.withId("Redux").subTags.count()).toBe(0);
        });
    });

    describe("self-referencing many field with modelName as toModelName", () => {
        let User;
        let user0;
        let user1;
        let user2;

        const validateRelationState = () => {
            const { UserSubscribed } = session;

            user0 = session.User.withId("u0");
            user1 = session.User.withId("u1");
            user2 = session.User.withId("u2");

            expect(user0.subscribed.toRefArray().map((row) => row.id)).toEqual([
                "u2",
            ]);
            expect(user1.subscribed.toRefArray().map((row) => row.id)).toEqual([
                "u0",
                "u2",
            ]);
            expect(user2.subscribed.toRefArray().map((row) => row.id)).toEqual([
                "u1",
            ]);

            expect(UserSubscribed.count()).toBe(4);
        };

        beforeEach(() => {
            User = class extends Model {};
            User.modelName = "User";
            User.fields = {
                id: attr(),
                subscribed: many("User", "subscribers"),
            };
            orm = new ORM();
            orm.register(User);
            session = orm.session();

            session.User.create({ id: "u0" });
            session.User.create({ id: "u1" });
            session.User.create({ id: "u2" });

            user0 = session.User.withId("u0");
            user1 = session.User.withId("u1");
            user2 = session.User.withId("u2");
        });

        // eslint-disable-next-line jest/expect-expect
        it("add forward many-many field", () => {
            user0.subscribed.add(user2);
            user1.subscribed.add(user0, user2);
            user2.subscribed.add(user1);
            validateRelationState();
        });

        // eslint-disable-next-line jest/expect-expect
        it("update forward many-many field", () => {
            user0.update({ subscribed: [user2] });
            user1.update({ subscribed: [user0, user2] });
            user2.update({ subscribed: [user1] });
            validateRelationState();
        });

        // eslint-disable-next-line jest/expect-expect
        it("add backward many-many field", () => {
            user0.subscribers.add(user1);
            user1.subscribers.add(user2);
            user2.subscribers.add(user0, user1);
            validateRelationState();
        });

        // eslint-disable-next-line jest/expect-expect
        it("update backward many-many field", () => {
            user0.update({ subscribers: [user1] });
            user1.update({ subscribers: [user2] });
            user2.update({ subscribers: [user0, user1] });
            validateRelationState();
        });

        it("create with forward many-many field", () => {
            session.User.all().delete();
            expect(session.User.count()).toBe(0);
            expect(session.UserSubscribed.count()).toBe(0);

            session.User.create({ id: "u0", subscribed: ["u2"] });
            session.User.create({ id: "u1", subscribed: ["u0", "u2"] });
            session.User.create({ id: "u2", subscribed: ["u1"] });

            validateRelationState();
        });

        it("create with backward many-many field", () => {
            session.User.all().delete();
            expect(session.User.count()).toBe(0);
            expect(session.UserSubscribed.count()).toBe(0);

            session.User.create({ id: "u0", subscribers: ["u1"] });
            session.User.create({ id: "u1", subscribers: ["u2"] });
            session.User.create({ id: "u2", subscribers: ["u0", "u1"] });

            validateRelationState();
        });
    });

    describe("many-many with accessor", () => {
        let User;
        let Project;

        beforeEach(() => {
            User = class extends Model {};
            User.modelName = "User";
            User.fields = {
                id: attr(),
                project_ids: many({
                    to: "Project",
                    as: "projects",
                    relatedName: "users",
                }),
            };

            Project = class extends Model {};
            Project.modelName = "Project";
            Project.fields = {
                id: attr(),
            };

            orm = new ORM();
            orm.register(User, Project);
            session = orm.session();
        });

        it("registers relationship with a custom accessor", () => {
            session.Project.create({ id: "p0" });
            session.Project.create({ id: "p1" });
            session.User.create({
                id: "u0",
                project_ids: ["p0", "p1"],
            });

            const u0 = session.User.withId("u0");
            expect(u0.project_ids).toEqual(["p0", "p1"]);
            expect(u0.projects.toRefArray()).toEqual([
                { id: "p0" },
                { id: "p1" },
            ]);

            // Ensure that the backward relation works as expected
            const p0 = session.Project.withId("p0");
            expect(p0.users.toRefArray()).toEqual([
                {
                    id: "u0",
                    project_ids: ["p0", "p1"],
                },
            ]);
        });

        it("updates relationship with a custom accessor", () => {
            session.Project.create({ id: "p0" });
            session.Project.create({ id: "p1" });
            session.User.create({
                id: "u0",
                project_ids: ["p0", "p1"],
            });

            const u0 = session.User.withId("u0");
            u0.update({
                project_ids: ["p1"],
            });
            expect(u0.project_ids).toEqual(["p1"]);
            expect(u0.projects.toRefArray()).toEqual([{ id: "p1" }]);
        });
    });
});
