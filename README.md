redux-orm
===============

A simple ORM to manage and query your state trees, so you can write your reducers like this:


```javascript
import {EntityManager, Schema} from 'redux-orm';
const PeopleManager = EntityManager.extend({schema: new Schema('people')});

function peopleReducer(state, action) => {
  const peopleManager = new PeopleManager(state);

  switch (action.type) {
  case CREATE_PERSON:
    peopleManager.create(action.payload);
    break;
  case SET_AGE:
    peopleManager.get({id: action.payload.id}).set('age', action.payload.age);
    break;
  case DELETE_PERSON:
    peopleManager.get({id: action.payload.id}).delete();
    break;
  case DELETE_YOUNGEST_AND_OLDEST_PERSON:
    const orderedByAge = peopleManager.orderBy('age');
    orderedByAge.first().delete();
    orderedByAge.last().delete();
    break;
  case ODD_CHANGE:
    peopleManager.filter(person => person.age > 29).exclude({name: 'Mary'}).update({age: 100});
    break;
  default:
    return state;
  }

  // Return a copy of the state tree with mutations applied.
  return peopleManager.reduce();
}
```

The API is heavily inspired by the Django ORM.

## Installation

```bash
npm install --save redux-orm
```

## Usage

Import module.

```javascript
import {Schema, EntityManager} from 'redux-orm';
```

Declare your managers.

```javascript
const peopleSchema = new Schema('people', {idAttribute: 'id'});
const PeopleManager = EntityManager.extend({schema: peopleSchema});
```

Then you can instantiate `PeopleManager` with a state tree when you need. 
```javascript
const tree = {
  people: [0],
  peopleById: {
    0: {
      name: 'Tommi',
      age: 25
    },
  },
};

const people = new PeopleManager(tree);
```

Use the manager in your reducers.

```javascript
function peopleReducer(state, action) {
  const people = new PeopleManager(state);

  switch (action.type) {
  // Handle actions
  case CRAZY_ACTION:
    // Record mutations with `people`
    people.create({name: 'John', age: 50});
    people.get({name: 'Tommi'}).delete();
    break;
  default:
    return state;
  }
  
  // Return a copy of the original tree with
  // mutations applied.
  return people.reduce();
}

function rootReducer(state, action) {
  return {
    people: peopleReducer(state, action),
  };
}
```

You can use it in your React components too.

```javascript
import {EntityManager, Schema} from 'redux-orm';
const RD = React.DOM;
const PeopleManager = EntityManager.extend({schema: new Schema('people', {idAttribute: 'id'})});

const PeopleViewer = React.createClass({
  propTypes: {
    people: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    peopleById: React.PropTypes.object.isRequired,
  },

  getDefaultProps() {
    return {
      people: [],
      peopleById: {},
    };
  }

  renderList(querySet) {
    const chilren = querySet.getPlainEntities().map(person => {
      return RD.li({key: person.id}, `${person.name}, ${person.age}`);
    });
    return RD.ul(null, children);
  }

  render() {
    const people = new PeopleManager(this.props);
    const youngPeople = people.filter(person => person.age < 40);
    const coolAndYoungPeople = youngPeople.exclude({square: true});

    const youngList = this.renderList(youngPeople);
    const coolAndYoungList = this.renderList(coolAndYoungPeople);

    return RD.div(null, youngList, coolAndYoungList);
  }
});
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

You'll end up writing quite a bit of boilerplate to handle create, update and delete operations, especially if you're doing it in pure JS. Libraries like Immutable can help considerably.

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
    const personWithoutId = Object.keys(action.payload).filter(key => key !== 'id')
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

If you have different entity types, you'll be writing a lot of boilerplate. The bugs are bound to creep in at some point. `redux-orm` abstracts this particular way of working with entities.

## API

### EntityManager

See the full documentation for EntityManager [here](http://tommikaikkonen.github.io/redux-orm/EntityManager.html).

Methods:

- `get` to get an entity based on properties,
- `create` to create a new instance. The new `id` will be `Math.max(...allOtherIds) + 1` unless you set it explicitly.
- `reduce` makes a copy of the state tree with the recorded mutations applied

Methods shared with QuerySet:

- `getPlainEntities`: returns the entities as an array of objects with the `id` attribute included.
- `count`: returns the number of entities.
- `exists`: return `true` if number of entities is more than 0, else `false`.
- `filter`: returns a new `QuerySet` with the entities that pass the filter.
- `exclude` returns a new `QuerySet` with the entities that do not pass the filter.
- `all` return a new `QuerySet` with the same entities.
- `at` returns an `Entity` instance at the supplied index.
- `first` returns an `Entity` instance at the `0` index.
- `last` returns an `Entity` instance at the `EntityManager.count() - 1` index.
- `delete` marks all the entities for deletion on `reduce`.
- `update` marks all the entities for an update based on the supplied argument.

### Schema

See the full documentation for Schema [here](http://tommikaikkonen.github.io/redux-orm/Schema.html).

`Schema` holds information about the schema. If you pass a single string arguments, the generated tree will look like this:

```javascript
const schema = new Schema('items');
// Resulting empty tree: {items: [], itemsById: {}}
```

You can pass an optional options object. The defaults are:
```javascript
{
  idAttribute: 'id',
  arrName: 'items', // if not specified, this is the same as the frst argument.
  mapName: 'itemsById', // if not specified, this is the first argument + `'ById'`.
}
```

### QuerySet

See the full documentation for `QuerySet` [here](http://tommikaikkonen.github.io/redux-orm/QuerySet.html).

Methods:

- `getPlainEntities`: returns the `QuerySet` entities as an array of objects with the `id` attribute included.
- `count`: returns the number of entities in the `QuerySet`.
- `exists`: return `true` if number of entities is more than 0, else `false`.
- `filter`: returns a new `QuerySet` with the entities that pass the filter.
- `exclude` returns a new `QuerySet` with the entities that do not pass the filter.
- `all` return a new `QuerySet` with the same entities.
- `at` returns an `Entity` instance at the supplied index in the `QuerySet`.
- `first` returns an `Entity` instance at the `0` index.
- `last` returns an `Entity` instance at the `EntityManager.count() - 1` index.
- `delete` marks all the `QuerySet` entities for deletion on `reduce`.
- `update` marks all the `QuerySet` entities for an update based on the supplied argument.

### Entity

See the full documentation for `Entity` [here](http://tommikaikkonen.github.io/redux-orm/Entity.html).

Methods:

- `set`: marks a supplied `propertyName` to be updated to `value` at `reduce`.
- `update`: marks a supplied object of property names and values to be merged with the entity at `reduce`.
- `delete`: marks the entity to be deleted at `reduce`.

## License

MIT. See `LICENSE`
