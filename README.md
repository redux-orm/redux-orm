<h1 align="center">Redux-ORM</h1>

<div align="center">

[![Build Status](https://img.shields.io/travis/redux-orm/redux-orm.svg?style=flat-square)](https://travis-ci.org/redux-orm/redux-orm)
[![Codacy Grade](https://img.shields.io/codacy/grade/d3ad7e3bd8264012953df9d1967bedaa.svg?style=flat-square)](https://www.codacy.com/app/redux-orm/redux-orm?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=redux-orm/redux-orm&amp;utm_campaign=Badge_Grade)
[![Coverage Status](https://img.shields.io/codecov/c/github/redux-orm/redux-orm/master.svg?style=flat-square)](https://codecov.io/gh/redux-orm/redux-orm/branch/master)
[![NPM package](https://img.shields.io/npm/v/redux-orm.svg?style=flat-square)](https://www.npmjs.com/package/redux-orm)
![GitHub Release Date](https://img.shields.io/github/release-date/redux-orm/redux-orm.svg?style=flat-square)
[![NPM downloads](https://img.shields.io/npm/dm/redux-orm.svg?style=flat-square)](https://www.npmjs.com/package/redux-orm)
[![Gitter](https://badges.gitter.im/redux-orm/Lobby.svg?style=flat-square)](https://gitter.im/redux-orm/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
![NPM license](https://img.shields.io/npm/l/redux-orm.svg?style=flat-square)
</div>

## Installation

```bash
npm install redux-orm --save
```

Or with a script tag exposing a global called `ReduxOrm`:

```html
<script src="https://unpkg.com/redux-orm/dist/redux-orm.min.js"></script>
```

* [Latest browser build (minimized)](https://unpkg.com/redux-orm/dist/redux-orm.min.js)
  * [Source Map](https://unpkg.com/redux-orm/dist/redux-orm.min.js.map)

* [Latest browser build](https://unpkg.com/redux-orm/dist/redux-orm.js) (only use if size does not matter)

### Polyfill

Redux-ORM uses some ES2015+ features, such as `Set`. If you are using Redux-ORM in a pre-ES2015+ environment, you should load a polyfill like [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/) before using Redux-ORM.

### Extensions

* [`redux-orm-proptypes`](https://github.com/tommikaikkonen/redux-orm-proptypes): React PropTypes validation and defaultProps mixin for Redux-ORM Models

## Usage

For a detailed walkthrough see [a guide to creating a simple app with Redux-ORM](https://github.com/tommikaikkonen/redux-orm-primer). Its not up-to-date yet but the [code has a branch for version 0.9](https://github.com/tommikaikkonen/redux-orm-primer/tree/migrate_to_0_9). The Redux docs have a [short section](https://redux.js.org/recipes/structuring-reducers/updating-normalized-data#redux-orm) on Redux-ORM as well.

### Declare Your Models

You can declare your models with the ES6 class syntax, extending from `Model`. You need to declare all your non-relational fields on the Model, and declaring all data fields is recommended as the library doesn't have to redefine getters and setters when instantiating Models. Redux-ORM supports one-to-one and many-to-many relations in addition to foreign keys (`oneToOne`, `many` and `fk` imports respectively). Non-related properties can be accessed like in normal JavaScript objects.

```javascript
// models.js
import { Model, fk, many, attr } from 'redux-orm';

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
    // foreign key field
    publisherId: fk({
        to: 'Publisher',
        as: 'publisher',
        relatedName: 'books',
    }),
    authors: many('Author', 'books'),
};

export default Book;
```

### Register Models and Generate an Empty Database State

Defining fields on a Model specifies the table structure in the database for that Model. In order to generate a description of the whole database's structure, we need a central place to register all Models we want to use.

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
Book.idExists(1)
// false
```

The initial database state is not mutated. A new database state with the updates applied can be found on the `state` property of the Session instance.

```javascript
const updatedDBState = session.state;
```

## Redux Integration

To integrate Redux-ORM with Redux at the most basic level, you can define a reducer that instantiates a session from the database state held in the Redux state slice, then when you've applied all of your updates, you can return the next state from the session.

```javascript
import orm from './orm';

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
        Book.withId(action.payload.bookId).publisherId = action.payload.publisherId;
        break;
    }

    // the state property of Session always points to the current database.
    // Updates don't mutate the original state, so this reference is not
    // equal to `dbState` that was an argument to this reducer.
    return sess.state;
}
```

Previously we advocated for reducers specific to Models by attaching a static `reducer` function on the Model class. If you want to define your update logic on the Model classes, you can specify a `reducer` static method on your model which accepts the action as the first argument, the session-specific Model as the second, and the whole session as the third.

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
            Book.withId(action.payload.bookId).publisherId = action.payload.publisherId;
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
import orm from './orm';

const reducer = createReducer(orm);
```

`createReducer` is really simple, so we'll just paste the source here.

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

Use memoized selectors to make queries into the state. Redux-ORM uses smart memoization: the below selector accesses `Author` and `AuthorBooks` branches (`AuthorBooks` is a many-to-many branch generated from the model field declarations), and the selector will be recomputed only if those branches change. The accessed branches are resolved on the first run.

```javascript
// selectors.js
import { createSelector } from 'redux-orm';
import orm from './orm';

const dbStateSelector = state => state.db;

const authorSelector = createSelector(
    orm,
    // The first input selector should always select the db-state.
    // Behind the scenes, `createSelector` begins a Redux-ORM session
    // with the value returned by `dbStateSelector` and passes
    // that Session instance as an argument instead.
    dbStateSelector,
    session => {
        return session.Author.all().toModelArray().map(author => {
            /**
             * author is a model instance and exposes relationship accessors
             * such as author.books …
             *
             * This gets a reference to the model's underlying object
             * which has no such accessors, containing only raw attributes.
             */
            const { ref } = author;
            // Object.keys(ref) === ['id', 'name']

            return {
                ...ref,
                books: author.books.toRefArray().map(book => book.name),
            };
        });
    }
);

// Will result in something like this when run:
// [
//   {
//     id: 0,
//     name: 'Tommi Kaikkonen',
//     books: ['Introduction to Redux-ORM', 'Developing Redux applications'],
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
import React from 'react';
import { authorSelector } from './selectors';
import { connect } from 'react-redux';

function AuthorList({ authors }) {
    const items = authors.map(author => (
        <li key={author.id}>
            {author.name} has written {author.books.join(', ')}
        </li>
    ));

    return (
        <ul>{items}</ul>
    );
}

function mapStateToProps(state) {
    return {
        authors: authorSelector(state),
    };
}

export default connect(mapStateToProps)(AuthorList);
```

## Understanding Redux-ORM

### An ORM?

Well, yeah. Redux-ORM deals with related data, structured similar to a relational database. The database in this case is a simple JavaScript object database.

### Why?

For simple apps, writing reducers by hand is alright, but when the number of object types you have increases and you need to maintain relations between them, things get hairy. ImmutableJS goes a long way to reduce complexity in your reducers, but Redux-ORM is specialized for relational data.

### Immutability

Say we start a session from an initial database state situated in the Redux atom, update the name of a certain book.

First, a new session:

```javascript
import { orm } from './models';

const dbState = store.getState().db; // getState() returns the Redux state
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
// false
```

The update was applied, and because the session does not mutate the original state, it created a new one and swapped `sess.state` to point to the new one.

Let's update the database state again through the ORM.

```javascript
// Save this reference so we can compare.
const updatedState = sess.state;

book.name = 'Patterns of Enterprise Application Architecture';

sess.state === updatedState
// true. If possible, future updates are applied with mutations. If you want
// to avoid making mutations to a session state, take the session state
// and start a new session with that state.
```

If possible, future updates are applied with mutations. In this case, the database was already mutated, so the pointer doesn't need to change. If you want to avoid making mutations to a session state, take the session state and start a new session with that state.

### Customizability

Just like you can extend `Model`, you can do the same for `QuerySet` (customize methods on Model instance collections). You can also specify the whole database implementation yourself (documentation pending).

### Caveats

![gzip size](https://img.shields.io/bundlephobia/minzip/redux-orm.svg?style=flat-square)

The ORM abstraction will never be as performant compared to writing reducers by hand, and adds to the build size of your project. If you have very simple data without relations, Redux-ORM may be overkill. The development convenience benefit is considerable though.

## API

### ORM

See the full documentation for ORM [here](http://redux-orm.github.io/redux-orm/global.html#ORM)

#### Instantiation:

```javascript
const orm = new ORM(); // no arguments needed.
```

#### Instance methods:

* `register(...models: Array<Model>)`: registers Model classes to the `ORM` instance.
* `session(state: any)`: begins a new `Session` with `state`.

### Redux Integration

* `createReducer(orm: ORM)`: returns a reducer function that can be plugged into Redux. The reducer will return the next state of the database given the provided action. You need to register your models before calling this.
* `createSelector(orm: ORM, [...inputSelectors], selectorFunc)`: returns a memoized selector function for `selectorFunc`. `selectorFunc` receives `session` as the first argument, followed by any inputs from `inputSelectors`. Note that the first inputSelector must return the db-state to create a session from. Read the full documentation for details.

### Model

See the full documentation for `Model` [here](http://redux-orm.github.io/redux-orm/Model.html).

**Instantiation**: Don't instantiate directly; use the class methods `create` and `upsert` as documented below.

**Class Methods**:

* `withId(id)`: gets the Model instance with id `id`.
* `idExists(id)`: returns a boolean indicating if an entity with id `id` exists in the state.
* `exists(matchObj)`: returns a boolean indicating if an entity whose properties match `matchObj` exists in the state.
* `get(matchObj)`: gets a Model instance based on matching properties in `matchObj` (if you are sure there is only one matching instance).
* `create(props)`: creates a new Model instance with `props`. If you don't supply an id, the new `id` will be `Math.max(...allOtherIds) + 1`.
* `upsert(props)`: either creates a new Model instance with `props` or, in case an instance with the same id already exists, updates that one - in other words it's **create or update** behaviour.

You will also have access to almost all [QuerySet instance methods](http://redux-orm.github.io/redux-orm/QuerySet.html) from the class object for convenience, including `where` and the like.

#### Instance Attributes:
* `ref`: returns a direct reference to the plain JavaScript object representing the Model instance in the store.

#### Instance methods:

* `equals(otherModel)`: returns a boolean indicating equality with `otherModel`. Equality is determined by shallow comparison of both model's attributes.
* `set(propertyName, value)`: updates `propertyName` to `value`. Returns `undefined`. Is equivalent to normal assignment.
* `update(mergeObj)`: merges `mergeObj` with the Model instance properties. Returns `undefined`.
* `delete()`: deletes the record for this Model instance in the database. Returns `undefined`.

#### Subclassing:

Use the ES6 syntax to subclass from `Model`. Any instance methods you declare will be available on Model instances. Any static methods you declare will be available on the Model class in Sessions.

For the related fields declarations, either set the `fields` property on the class or declare a static getter that returns the field declarations like this:

#### Declaring `fields`:
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

#### Declaring `modelName`:
```javascript
class Book extends Model {
    static get modelName() {
        return 'Book';
    }
}
// alternative:
Book.modelName = 'Book';
```

#### Declaring `options`:

If you need to specify options to the Redux-ORM database, you can declare a static `options` property on the Model class with an object key.

```javascript
// These are the default values.
Book.options = {
    idAttribute: 'id',
    mapName: 'itemsById',
    arrName: 'items',
};
```

### QuerySet

See the full documentation for `QuerySet` [here](http://redux-orm.github.io/redux-orm/QuerySet.html).

You can access all of these methods straight from a `Model` class, as if they were class methods on `Model`. In this case the functions will operate on a QuerySet that includes all the Model instances.

#### Instance methods:

* `toRefArray()`: returns the objects represented by the `QuerySet` as an array of plain JavaScript objects. The objects are direct references to the store.
* `toModelArray()`: returns the objects represented by the `QuerySet` as an array of `Model` instances objects.
* `count()`: returns the number of `Model` instances in the `QuerySet`.
* `exists()`: return `true` if number of entities is more than 0, else `false`.
* `filter(filterArg)`: returns a new `QuerySet` representing the records from the parent QuerySet that pass the filter. For `filterArg`, you can either pass an object that Redux-ORM tries to match to the entities, or a function that returns `true` if you want to have it in the new `QuerySet`, `false` if not. The function receives a model instance as its sole argument.
* `exclude` returns a new `QuerySet` represeting entities in the parent QuerySet that do not pass the filter. Similarly to `filter`, you may pass an object for matching (all entities that match will not be in the new `QuerySet`) or a function. The function receives a model instance as its sole argument.
* `all()` returns a new `QuerySet` with the same entities.
* `at(index)` returns an `Model` instance at the supplied `index` in the `QuerySet`.
* `first()` returns an `Model` instance at the `0` index.
* `last()` returns an `Model` instance at the `querySet.count() - 1` index.
* `delete()` deleted all entities represented by the `QuerySet`.
* `update(mergeObj)` updates all entities represented by the `QuerySet` based on the supplied object. The object will be merged with each entity.

### Session

See the full documentation for Session [here](http://redux-orm.github.io/redux-orm/Session.html)

#### Instantiation:

You don't need to do this yourself. Use `orm.session` (usually what you want) or `orm.mutableSession`.

#### Instance properties:

* `state`: the current database state in the session.

Additionally, you can access all the registered Models in the schema for querying and updates as properties of this instance. For example, given a schema with `Book` and `Author` models,

```javascript
const session = orm.session(state);
session.Book // Model class: Book
session.Author // Model class: Author
session.Book.create({ id: 5, name: 'Refactoring', release_year: 1999 });
```

## Changelog

API is still unstable. Minor changes before v1.0.0 can and will include breaking changes, adhering to Semantic Versioning.

See [`CHANGELOG.md`](https://github.com/redux-orm/redux-orm/blob/master/CHANGELOG.md).

The 0.9.x versions brought big breaking changes to the API. Please look at the [migration guide](https://github.com/redux-orm/redux-orm/wiki/0.9-Migration-Guide) if you're migrating from earlier versions.

Looking for the 0.8 docs? Read the [old README.md in the repo](https://github.com/redux-orm/redux-orm/tree/3c36fa804d2810b2aaaad89ff1d99534b847ea35). For the API reference, clone the repo, `npm install`, `make build` and open up `index.html` in your browser. Sorry for the inconvenience.

## License

MIT. See [`LICENSE`](https://github.com/redux-orm/redux-orm/blob/master/LICENSE).
