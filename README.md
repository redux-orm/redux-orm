redux-orm
===============

THIS IS A WORK IN PROGRESS!

A small, simple and immutable ORM to manage the entities in your Redux store. `redux-orm` doesn't mutate the data, it only returns a new database state.

## Why?

I got tired of the boilerplate I was writing for reducers. I wrote long reducers that do pretty much the same thing with very small variations. Immutability helpers make the task easier, but the code is not as expressive since it doesn't implement an abstraction of entities and their relations (`state.updateIn([id, 'locations'], [0, 2])` vs `Person.objects.get({id}).locations.add(0, 2)`). Hence `redux-orm` was born.

```javascript
import {Schema, fk, many} from 'redux-orm';

const schema = new Schema();

// Define your entities.
schema.define('Person', {
  // You only need to define related fields.
  location: fk('Location')
  friends: many('this'),
}, (state, action, Person, orm) => {
  // Define the reducer for this entity.
  switch (action.type) {
  case ADD_PERSON:
    Person.objects.create(action.payload);
    break;
  case EDIT_PERSON:
    // The data isn't mutated, you're still working with the same data
    // that you started with.
    Person.objects.get({id: action.payload.id}).update(action.payload);
    break;
  case DELETE_PERSON:
    Person.objects.get({id: action.payload.id}).delete();
    break;
  case ADD_FRIENDS:
    Person.objects.get({id: action.payload.id}).friends.add(action.payload.friendIds);
    break;
  case DELETE_FRIENDS:
    Person.objects.get({id: action.payload.id}).friends.remove(action.payload.friendIds);
    break;
  default:
    return state;
  }

  // A new database state is returned based on the recorded mutations.
  return Person.getNextState();
});

schema.define('Location');

function rootReducer(state, action) {
  entities: schema.reducer(),
  // All your other reducers go here.
}

// Use the ORM in your Components too.

class App extends React.Component {
  render() {
    const {entities} = this.props;
    const {Person, Location} = schema.from(entities);

    const people = Person.objects.filter(person => person.age > 18).toPlain();

    const childrenElements = people.map(person => {
      return <li>{person.toString()}</li>
    });

    return <ul>{childrenElements}</ul>;
  }
}
```

The API is heavily inspired by the Django ORM. All edits (delete, create, update, set, orderBy) are deferred to when you call `getNextState` on a Model and don't mutate data.

## Installation

```bash
npm install --save redux-orm
```

## Usage

Import.

```javascript
import {Schema, fk, many, Model} from 'redux-orm';
```

Declare your schema.

```javascript
const schema = new Schema();

const Person = schema.define('Person', {
  friends: many('this'),
  location: fk('Location'),
// You may also define your reducer later (i.e. in another file)
// with schema.setReducer('Person', reducerFunc);
}, (state, action, Person, orm) => {
  // ... Do your thing here
  // At the end, just call `getNextState`.
  return Person.getNextState();
});

// You may also specify instance methods if you declare your model with an ES6 class.

class Person extends Model {
  static getMetaOpts() {
    return {
      name: 'Person',
    };
  }

  toString() {
    return this.getFullName();
  }
  getFullName() {
    return `${this.first_name} ${this.last_name}`;
  },

  friendLocations() {
    return this.friends.map(friend => friend.location);
  }
}

// You may also declare the related fields in the class definition
// with a static getter.
Person.fields = {
  friends: many('this'),
  location: fk('Location'),
};

class Location extends Model {
  toString() {
    return `${this.city}, ${this.country}`;
  }
}

```

Plug the reducer anywhere you like. `entities` in the root reducer is a good bet.

```javascript

function rootReducer(state, action) {
  entities: schema.reducer(),
}
```

## Rationale

If you're storing items in your `redux` state tree this way:

```javascript
const tree = {
  people: [0, 1, 2],
  peopleById: {
    0: {
      name: 'Tommi',
      age: 25
    },
    1: {
      name: 'John',
      age: 35
    },
    2: {
      name: 'Mary',
      age: 30
    }
  }
};
```

You'll end up writing quite a bit of boilerplate to handle create, update and delete operations, especially if you're doing it in pure JS.

```javascript
function peopleReducer(state, action) {
  switch (action.type) {
  case CREATE_PERSON:
    return [...state, action.payload.id];
  case DELETE_PERSON:
    const personIdx = state.indexOf(action.payload);
    return [...state.slice(0, personIdx), ...state.slice(personIdx + 1)];
  default:
    return state;
  }
}

function peopleByIdReducer(state, action) {
  switch (action.type) {
  case CREATE_PERSON:
    return {
      ...state,
      [action.payload.id]: omit(action.payload, 'id'),
    };
  case DELETE_PERSON:
    return omit(state, action.payload);
  case UPDATE_PERSON:
    const prevPerson = state[action.payload.id];
    return {
      ...state,
      [action.payload.id]: Object.assign({}, prevPerson, omit(action.payload, 'id')),
    };
  default:
    return state;
  }
}
```

If you have different entity types, you'll be writing a lot of boilerplate. If you have relations that you need to tip-toe with in the reducers, you'll have to write variations of that boilerplate. The bugs are bound to creep in at some point.

Here's the same logic with `redux-orm`:

```javascript

function peopleReducer(state, action, Person) {
  switch (action.type) {
  case CREATE_PERSON:
    Person.objects.create(action.payload);
    break;
  case UPDATE_PERSON:
    Person.objects.get({id: action.payload.id}).update(action.payload);
    break;
  case DELETE_PERSON:
    Person.objects.delete({id: action.payload.id});
    break;
  default:
    return state;
  }
  return Person.reduce();
}

function ormReducerFromMap(map);

ormReducerFromMap((state, action, Person) => {
  return {
    CREATE_PERSON: () => Person.objects.create(action.payload),
    UPDATE_PERSON: () => Person.objects.get({id: action.payload.id}).update(action.payload),
    DELETE_PERSON: () => Pereson.objects.delete({id: action.payload.id}), 
  };
});

```

Now that's terse.

## Caveats

The ORM abstraction will never be as performant compared to writing reducers by hand, and adds to the build size of your project. If you have very simple data without relations, `redux-orm` may be overkill. The development convenience benefit is considerable though. If you need better performance, you can subclass `Meta` which defines the data structure and it's access and update functions. It's not that hard, because the database is just a JavaScript object store.

## API

### Schema

See the full documentation for Schema [here](http://tommikaikkonen.github.io/redux-orm/Schema.html)

### Model

See the full documentation for `Model` [here](http://tommikaikkonen.github.io/redux-orm/Model.html).

```javascript
import {Model, Schema} from 'redux-orm';

class Person extends Model {
  static getMetaOpts() {
    return {
      name: 'Person';
    }
  }

  toString() {
    return `${this.name}, age ${this.age}`;
  }
}

const schema = new Schema();
schema.register(Person);

// Assume this is our starting state:
// const startingState = {
//   Person: {
//     items: [0],
//     itemsById: {
//       0: {
//         id: 0,
//         name: 'Tommi',
//         age: 25,
//       },
//     },
//   },
// }

schema.from(startingState);

// person is an instance of `Model`.
const person = schema.Person.objects.get({name: 'Tommi'});

// Access fields like you would in a normal object.
person.age;
// 25

// To get the JavaScript object presentation, use `toPlain`:
person.toPlain()
// returns {
//   id: 0,
//   name: 'Tommi',
//   age: 25
// }

// You can use the instance methods you declared in the class.
person.toString();
// returns "Tommi, age 25"

// You can only record a mutation.
// It won't be applied yet.
person.set('name', 'Matt');
// undefined

// You can see that nothing has changed in the Entity.
person.name
// 'Tommi'

// Likewise deleting doesn't mutate state.
person.delete();

person.name
// 'Tommi'

// The changes will be apparent in the new tree returned
// by `peopleManager.getNextState()`

peopleManager.getNextState();
// {
//   Person: {
//     items: [],
//     itemsById: {},
//   },
// }

```

Methods:

- `toPlain`: returns a plain JavaScript object presentation of the Model.
- `set`: marks a supplied `propertyName` to be updated to `value` at `reduce`. Returns `undefined`
- `update`: marks a supplied object of property names and values to be merged with the Model instance at `reduce`. Returns `undefined`.
- `delete`: marks the Model instance to be deleted at `reduce`. Returns `undefined`.

### Meta

See the full documentation for Meta [here](http://tommikaikkonen.github.io/redux-orm/Meta.html)

### Session

See the full documentation for Session [here](http://tommikaikkonen.github.io/redux-orm/Session.html)

### Manager

See the full documentation for Manager [here](http://tommikaikkonen.github.io/redux-orm/Manager.html).

Instance methods:

- `get` to get a Model instance based on matching properties,
- `create` to create a new Model instance. The new `id` will be `Math.max(...allOtherIds) + 1` unless you set it explicitly or override the manager's `nextId` method.

Methods shared with QuerySet:

- `toPlain`: returns the entities as an array of objects.
- `count`: returns the number of entities.
- `exists`: return `true` if number of entities is more than 0, else `false`.
- `filter`: returns a new `QuerySet` with the entities that pass the filter. You can either pass an object that `redux-orm` tries to match to the entities, or a function that returns `true` if you want to have it in the new `QuerySet`, `false` if not.
- `exclude` returns a new `QuerySet` with the entities that do not pass the filter. Similarly to `filter`, you may pass an object for matching (all entities that match will not be in the new `QuerySet`) or a function.
- `map` maps through all Model instances.
- `all` return a new `QuerySet` with the same entities.
- `at` returns an `Entity` instance at the supplied index.
- `first` returns an `Entity` instance at the `0` index.
- `last` returns an `Entity` instance at the `EntityManager.count() - 1` index.
- `delete` marks all the entities for deletion on `reduce`.
- `update` marks all the entities for an update based on the supplied argument. The argument can either be an object that will be merged with the entity, or a mapping function that takes the entity as an argument and **returns a new, updated entity**. Do not mutate the entity if you pass a function to `update`.


### QuerySet

See the full documentation for `QuerySet` [here](http://tommikaikkonen.github.io/redux-orm/QuerySet.html).

Methods:

- `toPlain`: returns the `QuerySet` entities as an array of objects.
- `count`: returns the number of entities in the `QuerySet`.
- `exists`: return `true` if number of entities is more than 0, else `false`.
- `filter`: returns a new `QuerySet` with the entities that pass the filter. You can either pass an object that `redux-orm` tries to match to the entities, or a function that returns `true` if you want to have it in the new `QuerySet`, `false` if not.
- `exclude` returns a new `QuerySet` with the entities that do not pass the filter. Similarly to `filter`, you may pass an object for matching (all entities that match will not be in the new `QuerySet`) or a function.
- `map` maps through all Model instances.
- `all` return a new `QuerySet` with the same entities.
- `at` returns an `Entity` instance at the supplied index in the `QuerySet`.
- `first` returns an `Entity` instance at the `0` index.
- `last` returns an `Entity` instance at the `EntityManager.count() - 1` index.
- `delete` marks all the `QuerySet` entities for deletion on `reduce`.
- `update` marks all the `QuerySet` entities for an update based on the supplied argument. The argument can either be an object that will be merged with the entity, or a mapping function that takes the entity as an argument and **returns a new, updated entity**. Do not mutate the entity if you pass a function to `update`.

## License

MIT. See `LICENSE`
