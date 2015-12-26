import {expect} from 'chai';
import Schema from '../Schema';
import Session from '../Session';
import Model from '../Model';
import {ForeignKey, ManyToMany, OneToOne} from '../fields';

describe('Schema', () => {
    it('constructor works', () => {
        const schema = new Schema();
        expect(schema.selectorCreator).to.be.a('function');
    });

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

        it('correctly starts session', () => {
            const initialState = {};
            const session = schema.from(initialState);
            expect(session).to.be.instanceOf(Session);
        });

        it('correctly gets models from registry', () => {
            schema.register(Person, Location);
            expect(schema.get('Person')).to.equal(Person);
            expect(schema.get('Location')).to.equal(Location);
        });
    });
});
