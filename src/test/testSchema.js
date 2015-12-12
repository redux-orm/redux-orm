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

                static backend() {
                    return {
                        name: 'Person',
                    };
                }
            };

            Location = class LocationModel extends Model {
                static backend() {
                    return {
                        name: 'Location',
                    };
                }
            };
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
    });
    it('correctly defines models', () => {
        const schema = new Schema();

        class PersonModel extends Model {
            static get fields() {
                return {
                    location: new ForeignKey('Location'),
                };
            }

            static backend() {
                return {
                    name: 'Person',
                };
            }
        }

        class LocationModel extends Model {
            static backend() {
                return {
                    name: 'Location',
                };
            }
        }

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

            static backend() {
                return {
                    name: 'Person',
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

        class LocationModel extends Model {
            static backend() {
                return {
                    name: 'Location',
                };
            }

            toString() {
                return `${this.name}, ${this.country}`;
            }
        }

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

    it('Correctly defined OneToOne', () => {
        const schema = new Schema();

        class UserModel extends Model {
            static get fields() {
                return {
                    profile: new OneToOne('Profile'),
                    pair: new OneToOne('this'),
                };
            }
            static backend() {
                return {
                    name: 'User',
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

        class ProfileModel extends Model {
            static backend() {
                return {
                    name: 'Profile',
                };
            }

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
