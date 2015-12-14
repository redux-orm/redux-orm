import {expect} from 'chai';
import Schema from '../Schema';
import Model from '../Model';
import {ForeignKey, ManyToMany, OneToOne} from '../fields';

describe('Schema', () => {
    describe('simple schema', () => {
        let schema;
        let Person;
        let Location;
        beforeEach(() => {
            schema = new Schema();
            Person = class PersonModel extends Model {
                static get fields() {
                    return {
                        location: new ForeignKey('Location'),
                    };
                }
            };

            Person.modelName = 'Person';

            Location = class LocationModel extends Model {};
            Location.modelName = 'Location';
        });

        it('correctly registers a single model at a time', () => {
            expect(schema.registry).to.have.length(0);
            schema.register(Person);
            expect(schema.registry).to.have.length(1);
            schema.register(Location);
            expect(schema.registry).to.have.length(2);
        });

        it('correctly registers multiple models', () => {
            expect(schema.registry).to.have.length(0);
            schema.register(Person, Location);
            expect(schema.registry).to.have.length(2);
        });

        it('correcly resolves model instance values on create', () => {
            schema.register(Person, Location);
            schema.from(schema.getDefaultState());
            const tommi = Person.create({id: 0, name: 'Tommi', friend: null});
            const friend = Person.create({id: 1, name: 'Matt', friend: tommi});
            expect(friend._fields.friend).to.equal(0);
        });
    });

    it('correctly works with mutations', () => {
        const schema = new Schema();

        class PersonModel extends Model {
            static get fields() {
                return {
                    location: new ForeignKey('Location'),
                };
            }
        }
        PersonModel.modelName = 'Person';

        class LocationModel extends Model {}
        LocationModel.modelName = 'Location';

        schema.register(PersonModel);
        schema.register(LocationModel);

        const state = schema.getDefaultState();
        const {Person, Location} = schema.withMutations(state);
        expect(state.Person.items).to.have.length(0);
        expect(state.Person.itemsById).to.deep.equal({});
        Person.create({name: 'Tommi', age: 25});
        expect(state.Person.items).to.have.length(1);
        expect(state.Person.itemsById).to.deep.equal({
            0: {
                id: 0,
                name: 'Tommi',
                age: 25,
            },
        });
        Person.create({name: 'Matt', age: 35});
        expect(state.Person.items).to.have.length(2);
        expect(state.Person.itemsById).to.deep.equal({
            0: {
                id: 0,
                name: 'Tommi',
                age: 25,
            },
            1: {
                id: 1,
                name: 'Matt',
                age: 35,
            },
        });

        expect(state.Person.items).to.deep.equal([0, 1]);

        Person.setOrder('name');

        expect(state.Person.items).to.deep.equal([1, 0]);

        Person.withId(1).delete();
        expect(state.Person.items).to.have.length(1);
        expect(state.Person.itemsById).to.deep.equal({
            0: {
                id: 0,
                name: 'Tommi',
                age: 25,
            },
        });

        Person.withId(0).update({name: 'Michael'});
        expect(state.Person.itemsById[0].name).to.equal('Michael');
    });

    it('correctly defines models', () => {
        const schema = new Schema();

        class PersonModel extends Model {
            static get fields() {
                return {
                    location: new ForeignKey('Location'),
                };
            }
        }
        PersonModel.modelName = 'Person';

        class LocationModel extends Model {}
        LocationModel.modelName = 'Location';

        schema.register(PersonModel);
        schema.register(LocationModel);

        const reducer = schema.reducer();

        const initReduce = reducer(undefined, {type: 'INIT'});
        expect(initReduce).to.have.property('Person');
        expect(initReduce.Person).to.have.property('items');
        expect(initReduce.Person.items).to.have.length(0);
        expect(initReduce).to.have.property('Location');

        const orm = schema.from({
            Person: {
                items: [0],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'Tommi',
                        age: 25,
                        location: 0,
                    },
                },
            },

            Location: {
                items: [0],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'San Francisco',
                        country: 'United States',
                    },
                },
            },
        });

        expect(orm.Person).to.exist;
        expect(orm.Location).to.exist;

        const {Person, Location} = orm;
        const aPerson = Person.first();
        const aLocation = Location.first();

        expect(aPerson.toPlain()).to.deep.equal({id: 0, name: 'Tommi', age: 25, location: 0});
        expect(aPerson).to.be.an.instanceOf(Model);
        const relatedLocation = aPerson.location;
        expect(relatedLocation.equals(aLocation)).to.be.ok;
    });

    it('correctly defines ManyToMany', () => {
        const schema = new Schema();

        class PersonModel extends Model {
            static get fields() {
                return {
                    locations: new ManyToMany('Location'),
                    currentLocation: new OneToOne('Location'),
                };
            }

            static reducer(state, action, Person) {
                Person.create({id: 5, name: 'Mike', age: 30});
                const me = Person.get({name: 'Tommi'});
                me.update({age: 20});
                const firstLoc = me.locations.first();
                me.locations.remove(firstLoc);
                const result = Person.getNextState();
                return result;
            }
        }
        PersonModel.modelName = 'Person';

        class LocationModel extends Model {
            toString() {
                return `${this.name}, ${this.country}`;
            }
        }

        LocationModel.modelName = 'Location';

        schema.register(PersonModel);
        schema.register(LocationModel);

        const orm = schema.from({
            Person: {
                items: [0, 1],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'Tommi',
                        age: 25,
                    },
                    1: {
                        id: 1,
                        name: 'Ats',
                        age: 28,
                    },
                },
            },

            PersonLocations: {
                items: [0, 1, 2],
                itemsById: {
                    0: {
                        id: 0,
                        fromPersonId: 0,
                        toLocationId: 0,
                    },
                    1: {
                        id: 1,
                        fromPersonId: 0,
                        toLocationId: 1,
                    },
                    2: {
                        id: 2,
                        fromPersonId: 1,
                        toLocationId: 1,
                    },
                },
            },

            Location: {
                items: [0, 1],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'San Francisco',
                        country: 'United States',
                    },
                    1: {
                        id: 1,
                        name: 'Helsinki',
                        country: 'Finland',
                    },
                },
            },
        });

        expect(orm.Person).to.exist;
        expect(orm.Location).to.exist;
        expect(orm.PersonLocations).to.exist;

        const SF = orm.Location.get({name: 'San Francisco'});
        expect(SF.personSet.count()).to.equal(1);

        const hki = orm.Location.get({name: 'Helsinki'});
        expect(hki.personSet.count()).to.equal(2);

        const tommi = orm.Person.first();
        expect(tommi.name).to.equal('Tommi');
        expect(tommi.locations.count()).to.equal(2);

        const ats = orm.Person.get({name: 'Ats'});
        expect(ats.locations.count()).to.equal(1);
        expect(ats.locations.first().equals(hki)).to.be.ok;
    });

    it('correctly handles ManyToMany relations', () => {
        class BookModel extends Model {}
        BookModel.modelName = 'Book';
        BookModel.fields = {
            genres: new ManyToMany('Genre'),
        };

        class GenreModel extends Model {}
        GenreModel.modelName = 'Genre';

        const schema = new Schema();
        schema.register(BookModel, GenreModel);

        const initialState = schema.getDefaultState();
        const {Book, Genre} = schema.withMutations(initialState);

        const g1 = Genre.create({name: 'Fiction'});
        const g2 = Genre.create({name: 'Non-Fiction'});
        const g3 = Genre.create({name: 'Business'});
        Book.create({name: 'A Phenomenal Novel', genres: [0, 1]});
        expect(initialState.BookGenres.items).to.have.length(2);
    });

    it('Correctly defined OneToOne', () => {
        const schema = new Schema();

        class UserModel extends Model {
            static get fields() {
                return {
                    profile: new OneToOne('Profile'),
                    pair: new OneToOne('this'),
                };
            }

            static reducer(state, action, User) {
                switch (action.type) {
                case 'CREATE_USER':
                    User.create(action.payload.user);
                    break;
                case 'REMOVE_USER':
                    User.get({id: action.payload}).delete();
                    break;
                default:
                    return state;
                }
                return User.getNextState();
            }
        }

        UserModel.modelName = 'User';

        class ProfileModel extends Model {
            static reducer(state, action, Profile) {
                switch (action.type) {
                case 'CREATE_USER':
                    Profile.create(action.payload.profile);
                    break;
                case 'REMOVE_USER':
                    Profile.modelFilter(profile => profile.user.getId() === action.payload)
                            .delete();
                    break;
                default:
                    return state;
                }
                return Profile.getNextState();
            }
        }

        ProfileModel.modelName = 'Profile';

        schema.register(UserModel);
        schema.register(ProfileModel);

        const initialState = {
            User: {
                items: [0, 1, 2, 3],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'Tommi',
                        profile: 0,
                        pair: 1,
                    },
                    1: {
                        id: 1,
                        name: 'Matt',
                        profile: 1,
                        pair: 0,
                    },
                    2: {
                        id: 2,
                        name: 'Mary',
                        profile: 2,
                        pair: 3,
                    },
                    3: {
                        id: 3,
                        name: 'Heinz',
                        profile: 3,
                        pair: 2,
                    },
                },
            },

            Profile: {
                items: [0, 1, 2, 3],
                itemsById: {
                    0: {
                        id: 0,
                        greeting: 'Hi, this is Tommi\'s profile!',
                    },
                    1: {
                        id: 1,
                        greeting: 'Hi, this is Matt\'s profile!',
                    },
                    2: {
                        id: 2,
                        greeting: 'Hi, this is Mary\'s profile!',
                    },
                    3: {
                        id: 3,
                        greeting: 'Hi, this is Heinz\'s profile!',
                    },
                },
            },
        };

        const session = schema.from(initialState);
        const {User, Profile} = session;
        expect(User.count()).to.equal(4);
        expect(Profile.count()).to.equal(4);

        const aUser = User.first();
        const aProfile = Profile.last();

        expect(aUser.user.pair).to.deep.equal(aUser);

        const aUsersProfile = aUser.profile;
        expect(aUsersProfile.user).to.deep.equal(aUser);

        const reducer = schema.reducer();
        const nextState = reducer(
            initialState,
            {
                type: 'CREATE_USER',
                payload: {
                    user: {
                        id: 4,
                        name: 'Jonathan',
                    },
                    profile: {
                        id: 4,
                        greeting: 'This is Jonathan!',
                    },
                },
            }
        );
        const {User: nextUser, Profile: nextProfile} = schema.from(nextState);
        expect(nextUser.count()).to.equal(5);
        expect(nextProfile.count()).to.equal(5);

        expect(nextUser.last().profile).to.be.undefined;
    });
});
