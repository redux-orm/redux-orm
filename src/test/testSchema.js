import {expect} from 'chai';
import Schema from '../Schema';
import Model from '../Model';
import Manager from '../Manager';
import {ForeignKey, ManyToMany} from '../fields';

describe('Schema', () => {
    it('correctly defines models', () => {
        const schema = new Schema();

        class PersonModel extends Model {
            static getMetaOptions() {
                return {
                    name: 'Person',
                };
            }

            static get fields() {
                return {
                    location: new ForeignKey('Location'),
                };
            }
        }

        class LocationModel extends Model {
            static getMetaOptions() {
                return {
                    name: 'Location',
                };
            }
        }

        schema.register(PersonModel);
        schema.register(LocationModel);

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

        console.log(orm.getDefaultState());
        expect(orm.Person).to.exist;
        expect(orm.Location).to.exist;

        const {Person, Location} = orm;

        expect(Location.objects).to.be.an.instanceof(Manager);
        expect(Person.objects).to.be.an.instanceof(Manager);

        const aPerson = Person.objects.first();
        const aLocation = Location.objects.first();
        expect(aPerson.toPlain()).to.deep.equal({id: 0, name: 'Tommi', age: 25, location: 0});
        expect(aPerson).to.be.an.instanceOf(Model);

        const relatedLocation = aPerson.location;
        expect(relatedLocation.equals(aLocation)).to.be.ok;
    });

    it('correctly defines ManyToMany', () => {
        const schema = new Schema();

        class PersonModel extends Model {
            static getMetaOptions() {
                return {
                    name: 'Person',
                };
            }

            static get fields() {
                return {
                    locations: new ManyToMany('Location'),
                };
            }

            static reducer(state, action, Person, orm) {
                Person.objects.create({id: 5, name: 'Mike', age: 30});
                const me = Person.objects.get({name: 'Tommi'});
                me.update({age: 20});
                const firstLoc = me.locations.first();
                me.locations.remove(firstLoc);
                const result = Person.getNextState();
                return result;
            }
        }

        class LocationModel extends Model {
            static getMetaOptions() {
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
                items: [0],
                itemsById: {
                    0: {
                        id: 0,
                        name: 'Tommi',
                        age: 25,
                    },
                },
            },

            PersonLocations: {
                items: [0, 1],
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

        const SF = orm.Location.objects.get({name: 'San Francisco'});

        const tommi = orm.Person.objects.first();
        expect(tommi.name).to.equal('Tommi');
        expect(tommi.locations.count()).to.equal(2);
    });
});
