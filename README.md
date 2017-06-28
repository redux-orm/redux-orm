redux-orm
===============
[![Build Status](https://img.shields.io/travis/tommikaikkonen/redux-orm.svg?style=flat-square)](https://travis-ci.org/tommikaikkonen/redux-orm)
[![Coverage Status](https://img.shields.io/codecov/c/github/tommikaikkonen/redux-orm/master.svg?style=flat-square)](https://codecov.io/gh/tommikaikkonen/redux-orm/branch/master)
[![NPM package](https://img.shields.io/npm/v/redux-orm.svg?style=flat-square)](https://www.npmjs.com/package/redux-orm)
[![NPM downloads](https://img.shields.io/npm/dm/redux-orm.svg?style=flat-square)](https://www.npmjs.com/package/redux-orm)
[![Gitter](https://badges.gitter.im/redux-orm/Lobby.svg)](https://gitter.im/redux-orm/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A small, simple and immutable ORM to manage relational data in your Redux store.

See a [a guide to creating a simple app with Redux-ORM](https://github.com/tommikaikkonen/redux-orm-primer) (includes the source). Its README is not updated for 0.9 yet but the [code has a branch for it](https://github.com/tommikaikkonen/redux-orm-primer/tree/migrate_to_0_9).

**The 0.9 which is in the release candidate stage, brings big breaking changes to the API. Please look at the [migration guide](https://github.com/tommikaikkonen/redux-orm/wiki/0.9-Migration-Guide) if you're migrating from earlier versions.**

Looking for the 0.8 docs? Read the [old README.md in the repo](https://github.com/tommikaikkonen/redux-orm/tree/3c36fa804d2810b2aaaad89ff1d99534b847ea35). For the API reference, clone the repo, `npm install`, `make build` and open up `index.html` in your browser. Sorry for the inconvenience.

API can be unstable until 1.0.0. Minor version bumps before 1.0.0 can and will introduce breaking changes. They will be noted in the [changelog](https://github.com/tommikaikkonen/redux-orm#changelog).

## Extensions

- [`redux-orm-proptypes`](https://github.com/tommikaikkonen/redux-orm-proptypes): React PropTypes validation and defaultProps mixin for Redux-ORM Models

## Installation

```bash
npm install redux-orm --save
```

Or with a script tag

```html
<script src="https://tommikaikkonen.github.io/redux-orm/dist/redux-orm.js"></script>
```

- [Browser build following master](https://tommikaikkonen.github.io/redux-orm/dist/redux-orm.js)
- [Browser build following master (minimized)](https://tommikaikkonen.github.io/redux-orm/dist/redux-orm.min.js)

## Usage

### Declare Your Models

You can declare your models with the ES6 class syntax, extending from `Model`. You need to declare all your non-relational fields on the Model, and declaring all data fields is recommended as the library doesn't have to redefine getters and setters when instantiating Models. `redux-orm` supports one-to-one and many-to-many relations in addition to foreign keys (`oneToOne`, `many` and `fk` imports respectively). Non-related properties can be accessed like in normal JavaScript objects.

```javascript
// models.js
import {fk, many, attr, Model} from 'redux-orm';

class Book extends Model {
    toString() {
        return `Book: ${this.name}`;
    }
    // Declare any static or instance methods you need.
}
Book.modelName = 'Book';

// Declare your related fields.
Book.fields = {
    id: attr(), // non-relational field for any value; optional but highly recommended
    name: attr(),
    authors: many('Author', 'books'),
    publisher: fk('Publisher', 'books'),
};
```

### Register Models and Generate an Empty Database State

Defining fields on a Model specifies the table structure in the database for that Model. In order to generate a description of the whole database's structure, we need a central place register all Models we want to use.

An instance of the ORM class registers Models and handles generating a full schema from all the models and passing that information to the database. Often you'll want to have a file where you can import a single ORM instance across the app, like this:

```javascript
// orm.js
import { ORM } from 'redux-orm';
import { Book, Author, Publisher } from './models';

const orm = new ORM();
orm.register(Book, Author, Publisher);

export default orm;
```

You could also define *and* register the models to an ORM instance in the same file, and export them all.

Now that we've registered Models, we can generate an empty database state. Currently that's a plain, nested JavaScript object that is structured similarly to relational databases.

```javascript
// index.js

import orm from './orm';

const emptyDBState = orm.getEmptyState();
```

### Applying Updates to the Database

When we have a database state, we can start an ORM session on that to apply updates. The ORM instance provides a `session` method that accepts a database state as it's sole argument, and returns a Session instance.

```javascript
const session = orm.session(emptyDBState);
```

Session-specific classes of registered Models are available as properties of the session object.

```javascript
const Book = session.Book;
```

Models provide an interface to query and update the database state.

```javascript
Book.withId(1).update({ name: 'Clean Code' });
Book.all().filter(book => book.name === 'Clean Code').delete();
Book.hasId(1)
// false
```

The initial database state is not mutated. A new database state with the updates applied can be found on the `state` property of the Session instance.

```javascript
const updatedDBState = session.state;
```


## Redux Integration

To integrate Redux-ORM with Redux at the most basic level, you can define a reducer that instantiates a session from the database state held in the Redux atom, then when you've applied all of your updates, you can return the next state from the session.

```javascript
import { orm } from './models';
function ormReducer(dbState, action) {
    const sess = orm.session(dbState);

    // Session-specific Models are available
    // as properties on the Session instance.
    const { Book } = sess;

    switch (action.type) {
    case 'CREATE_BOOK':
        Book.create(action.payload);
        break;
    case 'UPDATE_BOOK':
        Book.withId(action.payload.id).update(action.payload);
        break;
    case 'REMOVE_BOOK':
        Book.withId(action.payload.id).delete();
        break;
    case 'ADD_AUTHOR_TO_BOOK':
        Book.withId(action.payload.bookId).authors.add(action.payload.author);
        break;
    case 'REMOVE_AUTHOR_FROM_BOOK':
        Book.withId(action.payload.bookId).authors.remove(action.payload.authorId);
        break;
    case 'ASSIGN_PUBLISHER':
        Book.withId(action.payload.bookId).publisher = action.payload.publisherId;
        break;
    }

    // the state property of Session always points to the current database.
    // Updates don't mutate the original state, so this reference is not
    // equal to `dbState` that was an argument to this reducer.
    return sess.state;
}
```

Previously Redux-ORM advocated for reducers specific to Models by attaching a static `reducer` function on the Model class. If you want to define your update logic on the Model classes, you can specify a `reducer` static method on your model which accepts the action as the first argument, the session-specific Model as the second, and the whole session as the third.

```javascript
class Book extends Model {
    static reducer(action, Book, session) {
        switch (action.type) {
        case 'CREATE_BOOK':
            Book.create(action.payload);
            break;
        case 'UPDATE_BOOK':
            Book.withId(action.payload.id).update(action.payload);
            break;
        case 'REMOVE_BOOK':
            const book = Book.withId(action.payload);
            book.delete();
            break;
        case 'ADD_AUTHOR_TO_BOOK':
            Book.withId(action.payload.bookId).authors.add(action.payload.author);
            break;
        case 'REMOVE_AUTHOR_FROM_BOOK':
            Book.withId(action.payload.bookId).authors.remove(action.payload.authorId);
            break;
        case 'ASSIGN_PUBLISHER':
            Book.withId(action.payload.bookId).publisher = action.payload.publisherId;
            break;
        }
        // Return value is ignored.
        return undefined;
    }

    toString() {
        return `Book: ${this.name}`;
    }
}
```

To get a reducer for Redux that calls these `reducer` methods:

```javascript
import { createReducer } from 'redux-orm';
import { orm } from './models';

const reducer = createReducer(orm);
```

`createReducer` is really simple, so I'll just paste the source here.

```javascript
function createReducer(orm, updater = defaultUpdater) {
    return (state, action) => {
        const session = orm.session(state || orm.getEmptyState());
        updater(session, action);
        return session.state;
    };
}

function defaultUpdater(session, action) {
    session.sessionBoundModels.forEach(modelClass => {
        if (typeof modelClass.reducer === 'function') {
            modelClass.reducer(action, modelClass, session);
        }
    });
}
```

As you can see, it just instantiates a new Session, loops through all the Models in the session, and calls the `reducer` method if it exists. Then it returns the new database state that has all the updates applied.

### Use with React

Use memoized selectors to make queries into the state. `redux-orm` uses smart memoization: the below selector accesses `Author` and `AuthorBooks` branches (`AuthorBooks` is a many-to-many branch generated from the model field declarations), and the selector will be recomputed only if those branches change. The accessed branches are resolved on the first run.

```javascript
// selectors.js
import schema from './schema';
const authorSelector = schema.createSelector(session => {
    return session.Author.map(author => {

        // Returns a reference to the raw object in the store,
        // so it doesn't include any reverse or m2m fields.
        const obj = author.ref;
        // Object.keys(obj) === ['id', 'name']

        return Object.assign({}, obj, {
            books: author.books.withRefs.map(book => book.name),
        });
    });
});

// Will result in something like this when run:
// [
//   {
//     id: 0,
//     name: 'Tommi Kaikkonen',
//     books: ['Introduction to redux-orm', 'Developing Redux applications'],
//   },
//   {
//     id: 1,
//     name: 'John Doe',
//     books: ['John Doe: an Autobiography']
//   }
// ]
```

Selectors created with `createSelector` can be used as input to any additional `reselect` selectors you want to use. They are also great to use with `redux-thunk`: get the whole state with `getState()`, pass the ORM branch to the selector, and get your results. A good use case is serializing data to a custom format for a 3rd party API call.

Because selectors are memoized, you can use pure rendering in React for performance gains.

```jsx
// components.js
import PureComponent from 'react-pure-render/component';
import { authorSelector } from './selectors';
import { connect } from 'react-redux';

class App extends PureComponent {
    render() {
        const authors = this.props.authors.map(author => {
            return (
                <li key={author.id}>
                    {author.name} has written {author.books.join(', ')}
                </li>
            );
        });

        return (
            <ul>
                {authors}
            </ul>
        );
    }
}

function mapStateToProps(state) {
    return {
        authors: authorSelector(state.orm),
    };
}

export default connect(mapStateToProps)(App);
```

## Understanding redux-orm

### An ORM?

Well, yeah. `redux-orm` deals with related data, structured similar to a relational database. The database in this case is a simple JavaScript object database.

### Why?

For simple apps, writing reducers by hand is alright, but when the number of object types you have increases and you need to maintain relations between them, things get hairy. ImmutableJS goes a long way to reduce complexity in your reducers, but `redux-orm` is specialized for relational data.

### Immutability

Say we start a session from an initial database state situated in the Redux atom, update the name of a certain book.

First, a new session:

```javascript
import { orm } from './models';

const dbState = getState().db; // getState() returns the redux state.
const sess = orm.session(dbState);
```

The session maintains a reference to a database state. We haven't
updated the database state, therefore it is still equal to the original
state.

```javascript
sess.state === dbState
// true
```

Let's apply an update.

```javascript
const book = sess.Book.withId(1)

book.name // 'Refactoring'
book.name = 'Clean Code'
book.name // 'Clean Code'

sess.state === dbState
// false.
```

The update was applied, and because the session does not mutate the original state, it created a new one and swapped `sess.state` to point to the new one.

Let's update the database state again through the ORM.

```javascript

// Save this reference so we can compare.
const updatedState = sess.state;

book.name = 'Patterns of Enterprise Application Architecture'

sess.state === updatedState
// true. If possible, future updates are applied with mutations. If you want
// to avoid making mutations to a session state, take the session state
// and start a new session with that state.
```

If possible, future updates are applied with mutations. In this case, the database was already mutated, so the pointer doesn't need to change. If you want to avoid making mutations to a session state, take the session state and start a new session with that state.

### Customizability

Just like you can extend `Model`, you can do the same for `QuerySet` (customize methods on Model instance collections). You can also specify the whole database implementation yourself (documentation pending).

### Caveats

The ORM abstraction will never be as performant compared to writing reducers by hand, and adds to the build size of your project (last I checked, minimizing the source files and gzipping yielded about 8 KB). If you have very simple data without relations, `redux-orm` may be overkill. The development convenience benefit is considerable though.

## API

### ORM

See the full documentation for ORM [here](http://tommikaikkonen.github.io/redux-orm/global.html#ORM)

Instantiation

```javascript
const orm = new ORM(); // no arguments needed.
```

Instance methods:

- `register(...models: Array<Model>)`: registers Model classes to the `ORM` instance.
- `session(state: any)`: begins a new `Session` with `state`.

### Redux Integration

- `createReducer(orm: ORM)`: returns a reducer function that can be plugged into Redux. The reducer will return the next state of the database given the provided action. You need to register your models before calling this.
- `createSelector(orm: ORM, [...inputSelectors], selectorFunc)`: returns a memoized selector function for `selectorFunc`. `selectorFunc` receives `session` as the first argument, followed by any inputs from `inputSelectors`. Read the full documentation for details.

### Model

See the full documentation for `Model` [here](http://tommikaikkonen.github.io/redux-orm/Model.html).

**Instantiation**: Don't instantiate directly; use class method `create`.

**Class Methods**:

- `hasId(id)`: returns a boolean indicating if entity with id `id` exists in the state.
- `withId(id)`: gets the Model instance with id `id`.
- `get(matchObj)`: to get a Model instance based on matching properties in `matchObj`,
- `create(props)`: to create a new Model instance with `props`. If you don't supply an id, the new `id` will be `Math.max(...allOtherIds) + 1`.
- `upsert(props)`: to create a new Model instance with `props` or to update a existing Model with same `id` - by other words its **create or update** behaviour.

You will also have access to almost all [QuerySet instance methods](http://tommikaikkonen.github.io/redux-orm/QuerySet.html) from the class object for convenience.

**Instance Attributes**:
- `ref`: returns a direct reference to the plain JavaScript object representing the Model instance in the store.

**Instance methods**:

- `equals(otherModel)`: returns a boolean indicating equality with `otherModel`. Equality is determined by shallow comparison of both model's attributes.
- `set(propertyName, value)`: updates `propertyName` to `value`. Returns `undefined`. Is equivalent to normal assignment.
- `update(mergeObj)`: merges `mergeObj` with the Model instance properties. Returns `undefined`.
- `delete()`: deletes the record for this Model instance in the database. Returns `undefined`.

**Subclassing**:

Use the ES6 syntax to subclass from `Model`. Any instance methods you declare will be available on Model instances. Any static methods you declare will be available on the Model class in Sessions.

For the related fields declarations, either set the `fields` property on the class or declare a static getter that returns the field declarations like this:

**Declaring `fields`**:
```javascript
class Book extends Model {
    static get fields() {
        return {
            id: attr(),
            name: attr(),
            author: fk('Author'),
        };
    }
}
// alternative:
Book.fields = {
    id: attr(),
    name: attr(),
    author: fk('Author'),
}
```

All the fields `fk`, `oneToOne` and `many` take a single argument, the related model name. The fields will be available as properties on each `Model` instance. You can set related fields with the id value of the related instance, or the related instance itself. 

For `fk`, you can access the reverse relation through `author.bookSet`, where the related name is `${modelName}Set`. Same goes for `many`. For `oneToOne`, the reverse relation can be accessed by just the model name the field was declared on: `author.book`.

For `many` field declarations, accessing the field on a Model instance will return a `QuerySet` with two additional methods: `add` and `remove`. They take 1 or more arguments, where the arguments are either Model instances or their id's. Calling these methods records updates that will be reflected in the next state.

When declaring model classes, always remember to set the `modelName` property. It needs to be set explicitly, because running your code through a mangler would otherwise break functionality. The `modelName` will be used to resolve all related fields. 

**Declaring `modelName`**:
```javascript
class Book extends Model {
    static get modelName() {
        return 'Book';
    }
}
// alternative:
Book.modelName = 'Book';
```

**Declaring `options`**

If you need to specify options to the redux-orm database, you can declare a static `options` property on the Model class with an object key. Currently you can specify the id attribute name:

```javascript
// This is the default value. 
Book.options = {
    idAttribute: 'id',
};
```

### QuerySet

See the full documentation for `QuerySet` [here](http://tommikaikkonen.github.io/redux-orm/QuerySet.html).

You can access all of these methods straight from a `Model` class, as if they were class methods on `Model`. In this case the functions will operate on a QuerySet that includes all the Model instances.

**Instance methods**:

- `toRefArray()`: returns the objects represented by the `QuerySet` as an array of plain JavaScript objects. The objects are direct references to the store.
- `toModelArray()`: returns the objects represented by the `QuerySet` as an array of `Model` instances objects.
- `count()`: returns the number of `Model` instances in the `QuerySet`.
- `exists()`: return `true` if number of entities is more than 0, else `false`.
- `filter(filterArg)`: returns a new `QuerySet` representing the records from the parent QuerySet that pass the filter. For `filterArg`, you can either pass an object that `redux-orm` tries to match to the entities, or a function that returns `true` if you want to have it in the new `QuerySet`, `false` if not. The function receives a model instance as its sole argument.
- `exclude` returns a new `QuerySet` represeting entities in the parent QuerySet that do not pass the filter. Similarly to `filter`, you may pass an object for matching (all entities that match will not be in the new `QuerySet`) or a function. The function receives a model instance as its sole argument.
- `all()` returns a new `QuerySet` with the same entities.
- `at(index)` returns an `Model` instance at the supplied `index` in the `QuerySet`.
- `first()` returns an `Model` instance at the `0` index.
- `last()` returns an `Model` instance at the `querySet.count() - 1` index.
- `delete()` deleted all entities represented by the `QuerySet`.
- `update(mergeObj)` updates all entities represented by the `QuerySet` based on the supplied object. The object will be merged with each entity.

### Session

See the full documentation for Session [here](http://tommikaikkonen.github.io/redux-orm/Session.html)

**Instantiation**: you don't need to do this yourself. Use `orm.session`.

**Instance properties**:

- `state`: the current database state in the session.

Additionally, you can access all the registered Models in the schema for querying and updates as properties of this instance. For example, given a schema with `Book` and `Author` models,

```javascript
const session = orm.session(state);
session.Book // Model class: Book
session.Author // Model class: Author
session.Book.create({id: 5, name: 'Refactoring', release_year: 1999});
```

## Changelog

Minor changes before 1.0.0 can include breaking changes.

### 0.9.4
fix for filter/query [#99](https://github.com/tommikaikkonen/redux-orm/issues/99)

### 0.9.2 - 0.9.3
fix for many-many updates [#136](https://github.com/tommikaikkonen/redux-orm/issues/136)

### 0.9.1
added 'upsert' method to Model (insert or update behaviour)
major updates for tests
CI integration

### 0.9.0

A lot. See [the migration guide](https://github.com/tommikaikkonen/redux-orm/wiki/0.9-Migration-Guide).

### 0.8.4

Adds UMD build to partially fix [#41](https://github.com/tommikaikkonen/redux-orm/issues/41). You can now use or try out `redux-orm` through a script tag:

```html
<script src="https://tommikaikkonen.github.io/redux-orm/dist/redux-orm.js"></script>
```

`redux-orm.js` will point to the master version of the library; If you need to stick to a version, make a copy or build it yourself.

### 0.8.3

Fixed bug that mutated the backend options in `Model` if you supplied custom ones, see [Issue 37](https://github.com/tommikaikkonen/redux-orm/issues/37). Thanks to [@diffcunha](https://github.com/diffcunha) for the [fix](https://github.com/tommikaikkonen/redux-orm/pull/38)!

### 0.8.2

Fixed [regression in `Model.prototype.update`](https://github.com/tommikaikkonen/redux-orm/issues/23)

### 0.8.1

Added `babel-runtime to dependencies`

### 0.8.0

Adds **batched mutations.** This is a big performance improvement. Previously adding 10,000 objects would take 15s, now it takes about 0.5s. Batched mutations are implemented using [`immutable-ops`](https://github.com/tommikaikkonen/immutable-ops) internally.

**Breaking changes**:

- Removed `indexById` option from Backend. This means that data will always be stored in both an array of id's and a map of `id => entity`, which was the default setting. If you didn't explicitly set `indexById` to `false`, you don't need to change anything.

- Batched mutations brought some internal changes. If you had custom `Backend` or `Session` classes, or have overridden `Model.getNextState`, please check out the diff.

### 0.7.0

**Breaking changes**:

Model classes that you access in reducers and selectors are now session-specific. Previously the user-defined Model class reference was used for sessions, with a private `session` property changing based on the most recently created session. Now Model classes are given a unique dummy subclass for each session. The subclass will be bound to that specific session. This allows multiple sessions to be used at the same time.

You most likely don't need to change anything. The documentation was written with this feature in mind from the start. As long as you've used the model class references given to you in reducers and selectors as arguments (not the reference to the model class you defined), you're fine.

### 0.6.0

**Breaking changes**:

- When calling `QuerySet.filter` or `QuerySet.exclude` with an object argument, any values of that object that look like a `Model` instance (i.e. they have a `getId` property that is a function), will be turned into the id of that instance before performing the filtering or excluding.

E.g.

```javascript
Book.filter({ author: Author.withId(0) });
```

Is equivalent to

```javascript
Book.filter({ author: 0 });
```

### 0.5.0

**Breaking changes**:

- Model instance method `equals(otherModel)` now checks if the two model's attributes are shallow equal. Previously, it checked if the id's and model classes are equal.
- Session constructor now receives a Schema instance as its first argument, instead of an array of Model classes (this only affects you if you're manually instantiating Sessions with the `new` operator).

Other changes:

- Added `hasId` static method to the Model class. It tests for the existence of the supplied id in the model's state.
- Added instance method `getNextState` to the Session class. This enables you to get the next state without running model-reducers. Useful if you're bootstrapping data, writing tests, or otherwise operating on the data outside reducers. You can pass an options object that currently accepts a `runReducers` key. It's value indicates if reducers should be run or not.
- Improved API documentation.

### 0.4.0

- Fixed a bug that mutated props passed to Model constructors, which could be a reference from the state. I highly recommend updating from 0.3.1.
- API cleanup, see breaking changes below.
- Calling getNextState is no longer mandatory in your Model reducers. If your reducer returns `undefined`, `getNextState` will be called for you.

**Breaking changes**:

- Removed static methods `Model.setOrder()` and `Backend.order`. If you want ordered entities, use the QuerySet instance method `orderBy`.
- Added helpful error messages when trying to add a duplicate many-to-many entry (Model.someManyRelated.add(...)), trying to remove an unexisting many-to-many entry (Model.exampleManyRelated.remove(...)), or creating a Model with duplicate many-to-many entry ids (Model.create(...)).
- Removed ability to supply a mapping function to QuerySet instance method `update`. If you need to record updates dynamically based on each entity, iterate through the objects with `forEach` and record updates separately:

```javascript
const authors = publisher.authors;
authors.forEach(author => {
    const isAdult = author.age >= 18;
    author.update({ isAdult });
})
```

or use the ability to merge an object with all objects in a QuerySet. Since the update operation is batched for all objects in the QuerySet, it can be more performant with a large amount of entities:

```javascript
const authors = publisher.authors;
const isAdult = author => author.age >= 18;

const adultAuthors = authors.filter(isAdult);
adultAuthors.update({ isAdult: true });

const youngAuthors = authors.exclude(isAdult);
youngAuthors.update({ isAdult: false });
```

### 0.3.1

A descriptive error is now thrown when a reverse field conflicts with another field declaration.
For example, the following schema:

```javascript
class A extends Model {}
A.modelName = 'A';

class B extends Model {}
B.modelName = 'B';
B.fields = {
    field1: one('A'),
    field2: one('A'),
};
```

would try to define the reverse field `b` on `A` twice, throwing an error with an undescriptive message.

### 0.3.0

**Breaking changes**:

- `Model.withId(id)` now throws if object with id `id` does not exist in the database. 

### 0.2.0

Includes various bugfixes and improvements.

**Breaking changes**:
- Replaced `plain` and `models` instance attributes in `QuerySet` with `withRefs` and `withModels` respectively. The attributes return a new `QuerySet` instead of modifying the existing one. A `ref` alias is also added for `withRefs`, so you can do `Book.ref.at(2)`.
- After calling `filter`, `exclude` or `orderBy` method on a `QuerySet` instance, the `withRefs` flag is always flipped off so that calling the same methods on the returned `QuerySet` would use model instances in the operations. Previously the flag value remained after calling those methods.
- `.toPlain()` from `QuerySet` is renamed to `.toRefArray()` for clarity.
- Added `.toModelArray()` method to `QuerySet`.
- Removed `.objects()` method from `QuerySet`. Use `.toRefArray()` or `.toModelArray()` instead.
- Removed `.toPlain()` method from `Model`, which returned a copy of the Model instance's property values. To replace that, `ref` instance getter was added. It returns a reference to the plain JavaScript object in the database. So you can do `Book.withId(0).ref`. If you need a copy, you can do `Object.assign({}, Book.withId(0).ref)`.
- Removed `.fromEmpty()` instance method from `Schema`.
- Removed `.setReducer()` instance method from `Schema`. You can just do `ModelClass.reducer = reducerFunc;`.


## License

MIT. See `LICENSE`
