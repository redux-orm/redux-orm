redux-orm
===============

A small, simple and immutable ORM to manage relational data in your Redux store.

See a [a guide to creating a simple app with Redux-ORM](https://github.com/tommikaikkonen/redux-orm-primer) (includes the source).

API can be unstable until 1.0.0. Minor version bumps before 1.0.0 can and will introduce breaking changes. They will be noted in the [changelog](https://github.com/tommikaikkonen/redux-orm#changelog).

[![npm version](https://img.shields.io/npm/v/redux-orm.svg?style=flat-square)](https://www.npmjs.com/package/redux-orm)
[![npm downloads](https://img.shields.io/npm/dm/redux-orm.svg?style=flat-square)](https://www.npmjs.com/package/redux-orm)

## Extensions

- [`redux-orm-proptypes`](https://github.com/tommikaikkonen/redux-orm-proptypes): React PropTypes validation and defaultProps mixin for Redux-ORM Models

## Installation

```bash
npm install redux-orm --save
```

## Usage

### Declare Your Models

You can declare your models with the ES6 class syntax, extending from `Model`. You are not required to declare normal fields, only fields that relate to another model. `redux-orm` supports one-to-one and many-to-many relations in addition to foreign keys (`oneToOne`, `many` and `fk` imports respectively). Non-related properties can be accessed like in normal JavaScript objects.

```javascript
// models.js
import {fk, many, Model} from 'redux-orm';

class Book extends Model {
    toString() {
        return `Book: ${this.name}`;
    }
    // Declare any static or instance methods you need.
}
Book.modelName = 'Book';

// Declare your related fields.
Book.fields = {
    authors: many('Author', 'books'),
    publisher: fk('Publisher', 'books'),
};
```

### Write Your Model-Specific Reducers

Every `Model` has it's own reducer. It'll be called every time Redux dispatches an action and by default it returns the previous state. You can declare your own reducers inside your models as `static reducer()`, or write your reducer elsewhere and connect it to `redux-orm` later. The reducer receives the following arguments: the previous state, the current action, the model class connected to the state, and finally the `Session` instance. Here's our extended Book model declaration with a reducer:

```javascript
// models.js
class Book extends Model {
    static reducer(state, action, Book) {
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

        return Book.getNextState();
    }

    toString() {
        return `Book: ${this.name}`;
    }
}

// Below we would declare Author and Publisher models
```

### Connect to Redux

To create our data schema, we create a Schema instance and register our models.

```javascript
// schema.js
import {Schema} from 'redux-orm';
import {Book, Author, Publisher} from './models';

const schema = new Schema();
schema.register(Book, Author, Publisher);

export default schema;
```

`Schema` instances expose a `reducer` method that returns a reducer you can use to plug into Redux. Preferably in your root reducer, plug the reducer under a namespace of your choice:

```javascript
// main.js
import schema from './schema';
import {combineReducers} from 'redux';

const rootReducer = combineReducers({
    orm: schema.reducer()
});
```

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

Selectors created with `schema.createSelector` can be used as input to any additional `reselect` selectors you want to use. They are also great to use with `redux-thunk`: get the whole state with `getState()`, pass the ORM branch to the selector, and get your results. A good use case is serializing data to a custom format for a 3rd party API call.

Because selectors are memoized, you can use pure rendering in React for performance gains.

```jsx
// components.js
import PureComponent from 'react-pure-render/component';
import {authorSelector} from './selectors';
import {connect} from 'react-redux';

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

### Reducers and Immutability

Say we're inside a reducer and want to update the name of a book.

```javascript
const book = Book.withId(action.payload.id)
book.name // 'Refactoring'
book.name = 'Clean Code'
book.name // 'Refactoring'
```

Assigning a new value has no effect on the current state. Behind the scenes, an update to the data was recorded. When you call

```javascript
Book.getNextState()
// the item we edited will have now values {... name: 'Clean Code'}
```

the update will be reflected in the new state. The same principle holds true when you're creating new instances and deleting them.

### How Updates Work Internally

By default, each Model has the following JavaScript object representation:

```javascript
{
    items: [],
    itemsById: {},
}
```

This representation maintains an array of object ID's and an index of id's for quick access. (A single object array representation is also provided for use. It is possible to subclass `Backend` to use any structure you want).

`redux-orm` runs a mini-redux inside it. It queues any updates the library user records with action-like objects, and when `getNextState` is called, it applies those actions with its internal reducers. Updates within each `getNextState` are implemented with batched mutations, so even a big number of updates should be pretty performant.

### Customizability

Just like you can extend `Model`, you can do the same for `QuerySet` (customize methods on Model instance collections) and `Backend` (customize store access and updates).

### Caveats

The ORM abstraction will never be as performant compared to writing reducers by hand, and adds to the build size of your project (last I checked, minimizing the source files and gzipping yielded about 8 KB). If you have very simple data without relations, `redux-orm` may be overkill. The development convenience benefit is considerable though.

## API

### Schema

See the full documentation for Schema [here](http://tommikaikkonen.github.io/redux-orm/Schema.html)

Instantiation

```javascript
const schema = new Schema(); // no arguments needed.
```

Instance methods:

- `register(model1, model2, ...modelN)`: registers Model classes to the `Schema` instance.
- `define(name, [relatedFields], [backendOpts])`: shortcut to define and register simple models.
- `from(state, [action])`: begins a new `Session` with `state`. If `action` is omitted, the session can be used to query the state data.
- `reducer()`: returns a reducer function that can be plugged into Redux. The reducer will return the next state of the database given the provided action. You need to register your models before calling this.
- `createSelector([...inputSelectors], selectorFunc)`: returns a memoized selector function for `selectorFunc`. `selectorFunc` receives `session` as the first argument, followed by any inputs from `inputSelectors`. Read the full documentation for details.

### Model

See the full documentation for `Model` [here](http://tommikaikkonen.github.io/redux-orm/Model.html).

**Instantiation**: Don't instantiate directly; use class method `create`.

**Class Methods**:

- `hasId(id)`: returns a boolean indicating if entity with id `id` exists in the state.
- `withId(id)`: gets the Model instance with id `id`.
- `get(matchObj)`: to get a Model instance based on matching properties in `matchObj`,
- `create(props)`: to create a new Model instance with `props`. If you don't supply an id, the new `id` will be `Math.max(...allOtherIds) + 1`. You can override the `nextId` class method on your model.

You will also have access to almost all [QuerySet instance methods](http://tommikaikkonen.github.io/redux-orm/QuerySet.html) from the class object for convenience.

**Instance Attributes**:
- `ref`: returns a direct reference to the plain JavaScript object representing the Model instance in the store.

**Instance methods**:

- `equals(otherModel)`: returns a boolean indicating equality with `otherModel`. Equality is determined by shallow comparison of both model's attributes.
- `set(propertyName, value)`: marks a supplied `propertyName` to be updated to `value` at `Model.getNextState`. Returns `undefined`. Is equivalent to normal assignment.
- `update(mergeObj)`: marks a supplied object of property names and values (`mergeObj`) to be merged with the Model instance at `Model.getNextState()`. Returns `undefined`.
- `delete()`: marks the Model instance to be deleted at `Model.getNextState()`. Returns `undefined`.

**Subclassing**:

Use the ES6 syntax to subclass from `Model`. Any instance methods you declare will be available on Model instances. Any static methods you declare will be available on the Model class in Sessions.

For the related fields declarations, either set the `fields` property on the class or declare a static getter that returns the field declarations like this:

**Declaring `fields`**:
```javascript
class Book extends Model {
    static get fields() {
        return {
            author: fk('Author')
        };
    }
}
// alternative:
Book.fields = {
    author: fk('Author')
}
```

All the fields `fk`, `oneToOne` and `many` take a single argument, the related model name. The fields will be available as properties on each `Model` instance. You can set related fields with the id value of the related instance, or the related instance itself. 

For `fk`, you can access the reverse relation through `author.bookSet`, where the related name is `${modelName}Set`. Same goes for `many`. For `oneToOne`, the reverse relation can be accessed by just the model name the field was declared on: `author.book`.

For `many` field declarations, accessing the field on a Model instance will return a `QuerySet` with two additional methods: `add` and `remove`. They take 1 or more arguments, where the arguments are either Model instances or their id's. Calling these methods records updates that will be reflected in the next state.

When declaring model classes, always remember to set the `modelName` property. It needs to be set explicitly, because running your code through a mangler would otherwise break functionality. The `modelName` will be used to resolve all related fields. 

**Declaring `backend`**:
```javascript
class Book extends Model {
    static get modelName() {
        return 'Book';
    }
}
// alternative:
Book.modelName = 'Book';
```



### QuerySet

See the full documentation for `QuerySet` [here](http://tommikaikkonen.github.io/redux-orm/QuerySet.html).

You can access all of these methods straight from a `Model` class, as if they were class methods on `Model`. In this case the functions will operate on a QuerySet that includes all the Model instances.

**Instance methods**:

- `toRefArray()`: returns the objects represented by the `QuerySet` as an array of plain JavaScript objects. The objects are direct references to the store.
- `toModelArray()`: returns the objects represented by the `QuerySet` as an array of `Model` instances objects.
- `count()`: returns the number of `Model` instances in the `QuerySet`.
- `exists()`: return `true` if number of entities is more than 0, else `false`.
- `filter(filterArg)`: returns a new `QuerySet` with the entities that pass the filter. For `filterArg`, you can either pass an object that `redux-orm` tries to match to the entities, or a function that returns `true` if you want to have it in the new `QuerySet`, `false` if not. The function receives a model instance as its sole argument.
- `exclude` returns a new `QuerySet` with the entities that do not pass the filter. Similarly to `filter`, you may pass an object for matching (all entities that match will not be in the new `QuerySet`) or a function. The function receives a model instance as its sole argument.
- `map(func)` map the entities in `QuerySet`, returning a JavaScript array.
- `all()` returns a new `QuerySet` with the same entities.
- `at(index)` returns an `Model` instance at the supplied `index` in the `QuerySet`.
- `first()` returns an `Model` instance at the `0` index.
- `last()` returns an `Model` instance at the `querySet.count() - 1` index.
- `delete()` marks all the `QuerySet` entities for deletion on `Model.getNextState`.
- `update(mergeObj)` marks all the `QuerySet` entities for an update based on the supplied object. The object will be merged with each entity.

**withRefs/withModels flagging**

When you want to iterate through all entities with `filter`, `exclude`, `forEach`, `map`, or get an item with `first`, `last` or `at`, you don't always need access to the full Model instance - a reference to the plain JavaScript object in the database could do. QuerySets maintain a flag indicating whether these methods operate on plain JavaScript objects (a direct reference from the store) or a Model instances that are instantiated during the operations.

```javascript
const queryset = Book.withRefs.filter(book => book.author === 'Tommi Kaikkonen')
// `book` is a plain javascript object, `queryset` is a QuerySet
// 
const queryset2 = Book.filter(book => book.name === 'Tommi Kaikkonen - An Autobiography')
// `book` is a Model instance. `queryset2` is a QuerySet equivalent to `queryset`.
```

The flag persists after setting the flag. If you use `filter`, `exclude` or `orderBy`, the returned `QuerySet` will have the flag set to operate on Model instances either way. The default is to operate on Model instances. You can get a copy of the current `QuerySet` with the flag set to operate on references from the `withRefs` attribute. Likewise a `QuerySet` copy with the flag set to operate on model instances can be gotten by accessing the `withModels` attribute.

```javascript
queryset.filter(book => book.isReleasedAfterYear(2014))
// The `withRefs` flag was reverted back to using models after the `filter` operation,
// so `book` here is a model instance.
// You rarely need to use `withModels`, unless you're unsure which way the flag is.

queryset2.withRefs.filter(book => book.release_year > 2014)
// `book` is once again a plain JavaScript object, a direct reference from the store.
```

### Session

See the full documentation for Session [here](http://tommikaikkonen.github.io/redux-orm/Session.html)

**Instantiation**: you don't need to do this yourself. Use `schema.from`.

**Instance properties**:

- `getNextState(opts)`: applies all the recorded updates in the session and returns the next state. You may pass options with the `opts` object.
- `reduce()`: calls model-specific reducers and returns the next state.

Additionally, you can access all the registered Models in the schema for querying and updates as properties of this instance. For example, given a schema with `Book` and `Author` models,

```javascript
const session = schema.from(state, action);
session.Book // Model class: Book
session.Author // Model class: Author
session.Book.create({id: 5, name: 'Refactoring', release_year: 1999});
```


### Backend

Backend implements the logic and holds the information for Models' underlying data structure. If you want to change how that works, subclass `Backend` or implement your own with the same interface, and override your models' `getBackendClass` classmethod.

See the full documentation for `Backend` [here](http://tommikaikkonen.github.io/redux-orm/Backend.html)

**Instantiation**: will be done for you. If you want to specify custom options, you can override the `YourModelClass.backend` property with the custom options that will be merged with the defaults. For most cases, the default options work well. They are:

```javascript
{
    idAttribute: 'id',
    arrName: 'items',
    mapName: 'itemsById',
};
```


## Changelog

Minor changes before 1.0.0 can include breaking changes.

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