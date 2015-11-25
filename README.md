redux-orm
===============

A simple ORM to manage and query your state trees, so you can write your reducers like this:


```javascript
import {EntityManager} from 'redux-orm';
const PeopleManager = EntityManager.extend({schema: 'people'});

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

The API is heavily inspired by the Django ORM. You can also look at it as a Backbone.js-esque API to a collection of items, but without the event framework and the REST API functionality. All edits (delete, create, update, set, orderBy) are deferred to when you call `entityManager.reduce`.

## Installation

```bash
npm install --save redux-orm
```

## Usage

Import module.

```javascript
import {EntityManager} from 'redux-orm';
```

Declare your managers.

```javascript
// The idAttribute value is used when getting the entities as a list of full objects.
const PeopleManager = EntityManager.extend({
  schema: {
    name: 'people',
    idAttribute: 'id'
  },

  // You can define any extra methods you might want.
  licenseEligible() {
    return this.filter(person => person.age > 16);
  },

});
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
  case SET_ELIGIBLE_FOR_LICENSE:
    people.licenseEligible().update({eligibleForLicense: true})
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
import {EntityManager} from 'redux-orm';
const RD = React.DOM;
const PeopleManager = EntityManager.extend({schema: 'people'});

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

If you have different entity types, you'll be writing a lot of boilerplate. The bugs are bound to creep in at some point. Libraries like Immutable can help considerably, but are designed to work generally with any data. Since we know we're dealing with entities, we can use much more expressive code to implement our reducers. `redux-orm` abstracts this particular way of working with entities.

## API

### EntityManager

See the full documentation for EntityManager [here](http://tommikaikkonen.github.io/redux-orm/EntityManager.html).

Class methods:

- `extend` extends the class with the supplied object. You may specify attributes and manager methods, override the default manager methods. Here are some examples:

You must declare a schema for EntityManager to follow; the shape of the tree that stores a collection of entities. If you dont declare it and instantiate straight from EntityManager:

```javascript
const itemManager = new EntityManager();
// itemManager.schema === {
//   idAttribute: 'id',
//   arrName: 'items',
//   mapName: 'itemsById'
// }
// itemManager.getDefaultState() returns: {
//   items: [],
//   itemsById: {},
// }

const CatManager = EntityManager.extend({schema: 'cats'});
const catManager = new CatManager();
// catManager.schema === {
//   idAttribute: 'id',
//   arrName: 'cats',
//   mapName: 'catsById'
// }
// catManager.getDefaultState() returns: {
//   cats: [],
//   catsById: {},
// }

const DogManager = DogManager.extend({
  schema: {
    arrName: 'listOfDogs',
    mapName: 'idMapOfDogs',
    idAttribute: 'collarName',
  }
});
const dogManager = new DogManager();
// dogManager.schema === {
//   idAttribute: 'collarName',
//   arrName: 'listOfDogs',
//   mapName: 'idMapOfDogs'
// }
// dogManager.getDefaultState() returns: {
//   listOfDogs: [],
//   idMapOfDogs: {},
// }

// Define a custom QuerySet class with a couple of
// convenience methods.
const CatQuerySet = QuerySet.extend({
  familyFriendly() {
    return self.filter({accidents: 0, aggressive: false});
  },
  adoptable() {
    return self.filter({upForAdoption: true});
  },

  // If you want to be able to call QuerySet methods from
  // a manager, list the method names here.
  sharedMethodNames: [
    'familyFriendly',
    'adoptable',
  ],
});

// Define a Manager class that uses CatQuerySet.
const CatManagerWithCustomQuerySet = CatManager.extend({querySetClass: CatQuerySet});
const tree = {
  cats: [0, 1],
  catsById: {
    0: {
      name: 'Felix',
      upForAdoption: true,
      aggressive: true,
      accidents: 5,
    },
    1: {
      name: 'Bubbles',
      upForAdoption: false,
      aggressive: false,
      accidents: 0,
    }
  }
};

const catManager = new CatManagerWithCustomQuerySet(tree);

// Since we listed `familyFriendly` in the `CatQuerySet`'s
// `sharedMethodNames`, we can call it from catManager. 
const familyFriendly = catManager.familyFriendly()
familyFriendly.count();
// 1
familyFriendly.getPlainEntities();
// [
//    {
//      id: 1,
//      name: 'Bubbles',
//      upForAdoption: false,
//      aggressive: false,
//      accidents: 0
//    }
// ]

// QuerySet methods that don't record mutations return
// a copy of themselves (or the filtered subset) for chaining.
const couldAdopt = familyFriendly.adoptable();
couldAdopt.count();
// 0
couldAdopt.getPlainEntities();
// []
```

Instance methods:

- `get` to get an entity based on properties,
- `create` to create a new instance. The new `id` will be `Math.max(...allOtherIds) + 1` unless you set it explicitly. You can use a different function to generate the `id` by overriding `nextId` method the manager.
- `reduce` makes a copy of the state tree with the recorded mutations applied

Methods shared with QuerySet:

- `getPlainEntities`: returns the entities as an array of objects with the `id` attribute included.
- `count`: returns the number of entities.
- `exists`: return `true` if number of entities is more than 0, else `false`.
- `filter`: returns a new `QuerySet` with the entities that pass the filter. You can either pass an object that `redux-orm` tries to match to the entities, or a function that returns `true` if you want to have it in the new `QuerySet`, `false` if not.
- `exclude` returns a new `QuerySet` with the entities that do not pass the filter. Similarly to `filter`, you may pass an object for matching (all entities that match will not be in the new `QuerySet`) or a function.
- `all` return a new `QuerySet` with the same entities.
- `at` returns an `Entity` instance at the supplied index.
- `first` returns an `Entity` instance at the `0` index.
- `last` returns an `Entity` instance at the `EntityManager.count() - 1` index.
- `delete` marks all the entities for deletion on `reduce`.
- `update` marks all the entities for an update based on the supplied argument. The argument can either be an object that will be merged with the entity, or a mapping function that takes the entity as an argument and **returns a new, updated entity**. Do not mutate the entity if you pass a function to `update`.


### QuerySet

See the full documentation for `QuerySet` [here](http://tommikaikkonen.github.io/redux-orm/QuerySet.html).

Methods:

- `getPlainEntities`: returns the `QuerySet` entities as an array of objects with the `id` attribute included.
- `count`: returns the number of entities in the `QuerySet`.
- `exists`: return `true` if number of entities is more than 0, else `false`.
- `filter`: returns a new `QuerySet` with the entities that pass the filter. You can either pass an object that `redux-orm` tries to match to the entities, or a function that returns `true` if you want to have it in the new `QuerySet`, `false` if not.
- `exclude` returns a new `QuerySet` with the entities that do not pass the filter. Similarly to `filter`, you may pass an object for matching (all entities that match will not be in the new `QuerySet`) or a function.
- `all` return a new `QuerySet` with the same entities.
- `at` returns an `Entity` instance at the supplied index in the `QuerySet`.
- `first` returns an `Entity` instance at the `0` index.
- `last` returns an `Entity` instance at the `EntityManager.count() - 1` index.
- `delete` marks all the `QuerySet` entities for deletion on `reduce`.
- `update` marks all the `QuerySet` entities for an update based on the supplied argument. The argument can either be an object that will be merged with the entity, or a mapping function that takes the entity as an argument and **returns a new, updated entity**. Do not mutate the entity if you pass a function to `update`.

### Entity

See the full documentation for `Entity` [here](http://tommikaikkonen.github.io/redux-orm/Entity.html).

Entity is a very thin wrapper on the plain JavaScript object presentation of an entity.

```javascript

// person is an instance of Entity.
const person = peopleManager.get({name: 'Tommi'});

person.toPlain()
// returns {
//   id: 0,
//   name: 'Tommi',
//   age: 25
// }

// You can only record a mutation.
// It won't be applied yet.
person.set('name', 'Matt');
// undefined

// You can see that nothing has changed in the Entity.
person.name
// 'Tommi'

person.delete();

person.name
// 'Tommi'

// The changes will be apparent in the new tree returned
// by `peopleManager.reduce()`
```

Methods:

- `toPlain`: returns a plain JavaScript object presentation of the Entity. The attribute name of the id will equal to `manager.schema.idAttribute`, where `manager` is the manager controlling the entity.
- `set`: marks a supplied `propertyName` to be updated to `value` at `reduce`. Returns `undefined`
- `update`: marks a supplied object of property names and values to be merged with the entity at `reduce`. Returns `undefined`.
- `delete`: marks the entity to be deleted at `reduce`. Returns `undefined`.

## License

MIT. See `LICENSE`
