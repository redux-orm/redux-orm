import { Model, QuerySet, ORM, attr, many, fk } from '../../';
import { createTestSessionWithData } from '../helpers';

describe('Many to many relationships', () => {
    let session;
    let orm;
    let state;

    beforeEach(() => {
        ({
            session,
            orm,
            state,
        } = createTestSessionWithData());
    });

    describe('many-many forward/backward updates', () => {
        let Team;
        let User;
        let teamFirst;
        let userFirst;
        let userLast;
        let validateRelationState;

        beforeEach(() => {
            User = class extends Model {};
            User.modelName = 'User';
            User.fields = {
                id: attr(),
                name: attr(),
            };

            Team = class extends Model {};
            Team.modelName = 'Team';
            Team.fields = {
                id: attr(),
                name: attr(),
                users: many('User', 'teams'),
            };

            orm = new ORM();
            orm.register(User, Team);
            session = orm.session(orm.getEmptyState());

            session.Team.create({ name: 'team0' });
            session.Team.create({ name: 'team1' });

            session.User.create({ name: 'user0' });
            session.User.create({ name: 'user1' });
            session.User.create({ name: 'user2' });

            teamFirst = session.Team.first();
            userFirst = session.User.first();
            userLast = session.User.last();

            validateRelationState = () => {
                const { TeamUsers } = session;

                teamFirst = session.Team.first();
                userFirst = session.User.first();
                userLast = session.User.last();

                expect(teamFirst.users.toRefArray().map(row => row.id)).toEqual([userFirst.id, userLast.id]);
                expect(userFirst.teams.toRefArray().map(row => row.id)).toEqual([teamFirst.id]);
                expect(userLast.teams.toRefArray().map(row => row.id)).toEqual([teamFirst.id]);

                expect(TeamUsers.count()).toBe(2);
            };
        });

        it('add forward many-many field', () => {
            teamFirst.users.add(userFirst, userLast);
            validateRelationState();
        });

        it('update forward many-many field', () => {
            teamFirst.update({ users: [userFirst, userLast] });
            validateRelationState();
        });

        it('add backward many-many field', () => {
            userFirst.teams.add(teamFirst);
            userLast.teams.add(teamFirst);
            validateRelationState();
        });

        it('update backward many-many field', () => {
            userFirst.update({ teams: [teamFirst] });
            userLast.update({ teams: [teamFirst] });
            validateRelationState();
        });

        it('create with forward many-many field', () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.User.create({ name: 'user0' });
            session.User.create({ name: 'user1' });
            session.User.create({ name: 'user2' });

            session.Team.create({ name: 'team0', users: [session.User.first(), session.User.last()] });
            session.Team.create({ name: 'team1' });

            validateRelationState();
        });

        it('create with backward many-many field', () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.Team.create({ name: 'team0' });
            session.Team.create({ name: 'team1' });

            session.User.create({ name: 'user0', teams: [session.Team.first()] });
            session.User.create({ name: 'user1' });
            session.User.create({ name: 'user2', teams: [session.Team.first()] });

            validateRelationState();
        });

        it('create with forward field with future many-many', () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.Team.create({ id: 't0', users: ['u0', 'u2'] });
            session.Team.create({ id: 't1' });

            session.User.create({ id: 'u0' });
            session.User.create({ id: 'u1' });
            session.User.create({ id: 'u2' });

            validateRelationState();
        });

        it('create with backward field with future many-many', () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.User.create({ id: 'u0', teams: ['t0'] });
            session.User.create({ id: 'u1' });
            session.User.create({ id: 'u2', teams: ['t0'] });

            session.Team.create({ id: 't0' });
            session.Team.create({ id: 't1' });

            validateRelationState();
        });

        it('create with forward field and existing backward many-many', () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.User.create({ id: 'u0', teams: ['t0'] });
            session.User.create({ id: 'u1' });
            session.User.create({ id: 'u2', teams: ['t0'] });

            session.Team.create({ id: 't0', users: ['u0', 'u2'] });
            session.Team.create({ id: 't1' });

            validateRelationState();
        });

        it('create with backward field and existing forward many-many', () => {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.Team.create({ id: 't0', users: ['u0', 'u2'] });
            session.Team.create({ id: 't1' });

            session.User.create({ id: 'u0', teams: ['t0'] });
            session.User.create({ id: 'u1' });
            session.User.create({ id: 'u2', teams: ['t0'] });

            validateRelationState();
        });
    });

    describe('many-many with a custom through model', () => {
        let validateRelationState;
        beforeEach(() => {
            validateRelationState = () => {
                const { User, Team, User2Team } = session;

                // Forward (from many-to-many field declaration)
                const user = User.get({ name: 'user0' });
                const relatedTeams = user.teams;
                expect(relatedTeams).toBeInstanceOf(QuerySet);
                expect(relatedTeams.modelClass).toBe(Team);
                expect(relatedTeams.count()).toBe(1);

                // Backward
                const team = Team.get({ name: 'team0' });
                const relatedUsers = team.users;
                expect(relatedUsers).toBeInstanceOf(QuerySet);
                expect(relatedUsers.modelClass).toBe(User);
                expect(relatedUsers.count()).toBe(2);

                expect(team.users.toRefArray().map(row => row.id)).toEqual(['u0', 'u1']);
                expect(Team.withId('t2').users.toRefArray().map(row => row.id)).toEqual(['u1']);

                expect(user.teams.toRefArray().map(row => row.id)).toEqual([team.id]);
                expect(User.withId('u1').teams.toRefArray().map(row => row.id)).toEqual(['t0', 't2']);

                expect(User2Team.count()).toBe(3);
            };
        });

        it('without throughFields', () => {
            const UserModel = class extends Model {};
            UserModel.modelName = 'User';
            UserModel.fields = {
                id: attr(),
                name: attr(),
            };
            const User2TeamModel = class extends Model {};
            User2TeamModel.modelName = 'User2Team';
            User2TeamModel.fields = {
                user: fk('User'),
                team: fk('Team'),
            };
            const TeamModel = class extends Model {};
            TeamModel.modelName = 'Team';
            TeamModel.fields = {
                id: attr(),
                name: attr(),
                users: many({
                    to: 'User',
                    through: 'User2Team',
                    relatedName: 'teams',
                }),
            };

            orm = new ORM();
            orm.register(UserModel, TeamModel, User2TeamModel);
            session = orm.session(orm.getEmptyState());
            const { User, Team, User2Team } = session;

            Team.create({ id: 't0', name: 'team0' });
            Team.create({ id: 't1', name: 'team1' });
            Team.create({ id: 't2', name: 'team2' });

            User.create({ id: 'u0', name: 'user0', teams: ['t0'] });
            User.create({ id: 'u1', name: 'user1', teams: ['t0', 't2'] });

            validateRelationState();
        });

        it('with throughFields', () => {
            const UserModel = class extends Model {};
            UserModel.modelName = 'User';
            UserModel.fields = {
                id: attr(),
                name: attr(),
            };
            const User2TeamModel = class extends Model {};
            User2TeamModel.modelName = 'User2Team';
            User2TeamModel.fields = {
                user: fk('User'),
                team: fk('Team'),
            };
            const TeamModel = class extends Model {};
            TeamModel.modelName = 'Team';
            TeamModel.fields = {
                id: attr(),
                name: attr(),
                users: many({
                    to: 'User',
                    through: 'User2Team',
                    relatedName: 'teams',
                    throughFields: ['user', 'team'],
                }),
            };

            orm = new ORM();
            orm.register(UserModel, TeamModel, User2TeamModel);
            session = orm.session(orm.getEmptyState());
            const { User, Team, User2Team } = session;

            Team.create({ id: 't0', name: 'team0' });
            Team.create({ id: 't1', name: 'team1' });
            Team.create({ id: 't2', name: 'team2' });

            User.create({ id: 'u0', name: 'user0', teams: ['t0'] });
            User.create({ id: 'u1', name: 'user1', teams: ['t0', 't2'] });

            validateRelationState();
        });

        it('with additional attributes', () => {
            const UserModel = class extends Model {};
            UserModel.modelName = 'User';
            UserModel.fields = {
                id: attr(),
                name: attr(),
            };
            const User2TeamModel = class extends Model {};
            User2TeamModel.modelName = 'User2Team';
            User2TeamModel.fields = {
                user: fk('User', 'links'),
                team: fk('Team', 'links'),
                name: attr(),
            };
            const TeamModel = class extends Model {};
            TeamModel.modelName = 'Team';
            TeamModel.fields = {
                id: attr(),
                name: attr(),
                users: many({
                    to: 'User',
                    through: 'User2Team',
                    relatedName: 'teams',
                }),
            };

            orm = new ORM();
            orm.register(UserModel, TeamModel, User2TeamModel);
            session = orm.session(orm.getEmptyState());
            const { User, Team, User2Team } = session;

            Team.create({ id: 't0', name: 'team0' });
            Team.create({ id: 't1', name: 'team1' });
            Team.create({ id: 't2', name: 'team2' });

            User.create({ id: 'u0', name: 'user0' });
            User.create({ id: 'u1', name: 'user1' });

            User2Team.create({ user: 'u0', team: 't0', name: 'link0' });
            User2Team.create({ user: 'u1', team: 't0', name: 'link1' });
            User2Team.create({ user: 'u1', team: 't2', name: 'link2' });

            validateRelationState();

            expect(User.withId('u0').links.toRefArray().map(row => row.name)).toEqual(['link0']);
            expect(User.withId('u1').links.toRefArray().map(row => row.name)).toEqual(['link1', 'link2']);
        });
    });
});
