import {expect} from 'chai';
import Schema from '../Schema';
import {BaseModel} from '../MetaModel';
import EntityManager from '../EntityManager';
import {ForeignKey, ManyToMany} from '../fields';

describe('Schema', () => {
    it('correctly defines models', () => {
        const schema = new Schema();
        schema.define('Person', {
            location: new ForeignKey('Location'),
        });
        schema.define('Location');

        const orm = schema.from({
            Person: {
                items: [0],
                itemsById: {
                    0: {
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
                        name: 'San Francisco',
                        country: 'United States',
                    },
                },
            },
        });

        expect(orm.Person).to.exist;
        expect(orm.Location).to.exist;

        const {Person, Location} = orm;

        expect(Location.objects).to.be.an.instanceof(EntityManager);
        expect(Person.objects).to.be.an.instanceof(EntityManager);

        const aPerson = Person.objects.first();
        const aLocation = Location.objects.first();

        expect(aPerson.toPlain()).to.deep.equal({id: 0, name: 'Tommi', age: 25, location: 0});
        expect(aPerson).to.be.an.instanceOf(BaseModel);

        const relatedLocation = aPerson.location;
        console.log(relatedLocation);
        expect(relatedLocation.equals(aLocation)).to.be.ok;
    });

    it('correctly defines ManyToMany', () => {
        const schema = new Schema();
        schema.define('Person', {
            locations: new ManyToMany('Location'),
        }, (state, action, Person) => {
            Person.objects.create({id: 5, name: 'Mike', age: 30});
            Person.objects.get({name: 'Tommi'}).update({age: 20});
            const result = Person.reduce(state);
            return result;
        });
        schema.define('Location');

        const orm = schema.from({
            Person: {
                items: [0],
                itemsById: {
                    0: {
                        name: 'Tommi',
                        age: 25,
                    },
                },
            },

            Person_locations: {
                items: [0, 1],
                itemsById: {
                    0: {
                        from_Person_id: 0,
                        to_Location_id: 0,
                    },
                    1: {
                        from_Person_id: 0,
                        to_Location_id: 1,
                    },
                },
            },

            Location: {
                items: [0, 1],
                itemsById: {
                    0: {
                        name: 'San Francisco',
                        country: 'United States',
                    },
                    1: {
                        name: 'Helsinki',
                        country: 'Finland',
                    },
                },
            },
        });

        console.log(orm.Person.objects.first());
        console.log('locations: ', orm.Person.objects.first().locations.toPlain());
        console.log('reduced', orm.reduce());
    });
});
