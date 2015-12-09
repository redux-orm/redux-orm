redux-orm
===============

A small, simple and immutable ORM to manage data in your Redux store.

WARNING: Not ready for production. 

[![npm version](https://img.shields.io/npm/v/redux-orm.svg?style=flat-square)](https://www.npmjs.com/package/redux-orm)
[![npm downloads](https://img.shields.io/npm/dm/redux-orm.svg?style=flat-square)](https://www.npmjs.com/package/redux-orm)

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

Book.meta = {name: 'Book'};

// Declare your related fields.
Book.fields = {
    authors: many('Author'),
    publisher: fk('Publisher'),
};
```

### Write Your Model-specific Reducers

Every `Model` has it's own reducer. It'll be called every time Redux dispatches an action and by default it returns the previous state. You can declare your own reducers inside your models as `static reducer()`, or write your reducer elsewhere and connect it to `redux-orm` later. The reducer receives the following arguments: the previous state, the current action, the model class connected to the state through which you can query data and record updates, and finally the `Session` instance. Here's our extended Book model declaration with a reducer:

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

### Connecting to Redux

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

### Using with React

In your top level component, you can begin a `Session` to query your data with `redux-orm`.

```javascript
// components.js
import {Component} from 'React';
import schema from './schema';

class App extends Component {
    getORM() {
        return schema.from(this.props.orm);
    }

    render() {
        const {
            Book,
            Publisher,
            Author
        } = this.getORM();

        const authors = Author.map(author => {
            // .bookSet is a virtual reverse field,
            // generated from book.authors = fk('Author').
            const authorBooks = author.bookSet;
            const bookNames = authorBooks.map(book => book.name).join(', ');

            return (
                <li key={author.getId()}>
                    {author.name} has written {authorBookNames}
                </li>);
        });

        return (
            <ul>
                {authors}
            </ul>
        );
    }
}

```

## Understanding redux-orm

### An ORM?

Well, yeah. `redux-orm` deals with related data, structured similar to a relational database. The database in this case is a simple JavaScript object database.

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

the update will be reflected in the new state. The same principle holds true when you're creating new instances, deleting them and ordering them.

### How the Immutable Updates Work Internally

By default, each Model has the following JavaScript object representation:

```javascript
{
    items: [],
    itemsById: {},
}
```

This representation maintains an array of object ID's and an index of id's for quick access. (A single object array representation is also provided for use. It is also possible to subclass `Meta` to use any structure you want).

`redux-orm` runs a mini-redux inside it. It queues any updates the library user records with action-like objects, and when `getNextState` is called, it applies those actions with its internal reducers. There's some room here to provide performance optimizations similar to Immutable.js.

### Caveats

The ORM abstraction will never be as performant compared to writing reducers by hand, and adds to the build size of your project (last I checked, minimizing the source files without gzipping yielded about 29 KB). If you have very simple data without relations, `redux-orm` may be overkill. The development convenience benefit is considerable though.

### Rationale

For simple apps, writing reducers by hand is alright, but when the number of object types you have increases and you need to maintain relations between them, things get hairy. ImmutableJS goes a long way to reduce complexity in your reducers, but `redux-orm` is specialized for relational data.

## API

### Schema

See the full documentation for Schema [here](http://tommikaikkonen.github.io/redux-orm/Schema.html)

### Model

See the full documentation for `Model` [here](http://tommikaikkonen.github.io/redux-orm/Model.html).

Class Methods:

- `withId(id)` gets the Model instance with id `id`.
- `get(matchObj)` to get a Model instance based on matching properties in `matchObj`,
- `create(props)` to create a new Model instance with `props`. If you don't supply an id, the new `id` will be `Math.max(...allOtherIds) + 1`. You can override the `nextId` class method on your model.

You will also have access to almost all [QuerySet instance methods](http://tommikaikkonen.github.io/redux-orm/QuerySet.html) from the class object for convenience.

Instance methods:

- `toPlain`: returns a plain JavaScript object presentation of the Model.
- `set`: marks a supplied `propertyName` to be updated to `value` at `Model.getNextState`. Returns `undefined`. Is equivalent to normal assignment.
- `update`: marks a supplied object of property names and values to be merged with the Model instance at `Model.getNextState()`. Returns `undefined`.
- `delete`: marks the Model instance to be deleted at `Model.getNextState()`. Returns `undefined`.

### QuerySet

See the full documentation for `QuerySet` [here](http://tommikaikkonen.github.io/redux-orm/QuerySet.html).

You can access all of these methods straight from a `Model` class.

Instance methods:

- `toPlain()`: returns the `Model` instances in `QuerySet`  as an array of plain JavaScript objects.
- `count()`: returns the number of `Model` instances in the `QuerySet`.
- `exists()`: return `true` if number of entities is more than 0, else `false`.
- `filter(filterArg)`: returns a new `QuerySet` with the entities that pass the filter. For `filterArg`, you can either pass an object that `redux-orm` tries to match to the entities, or a function that returns `true` if you want to have it in the new `QuerySet`, `false` if not.
- `exclude` returns a new `QuerySet` with the entities that do not pass the filter. Similarly to `filter`, you may pass an object for matching (all entities that match will not be in the new `QuerySet`) or a function.
- `map(func)` map the entities in `QuerySet`, returning a JavaScript array.
- `all()` returns a new `QuerySet` with the same entities.
- `at(index)` returns an `Model` instance at the supplied `index` in the `QuerySet`.
- `first()` returns an `Model` instance at the `0` index.
- `last()` returns an `Model` instance at the `querySet.count() - 1` index.
- `delete()` marks all the `QuerySet` entities for deletion on `Model.getNextState`.
- `update(updateArg)` marks all the `QuerySet` entities for an update based on the supplied argument. The argument can either be an object that will be merged with the entity, or a mapping function that takes the entity as an argument and **returns a new, updated entity**. Do not mutate the entity if you pass a function to `update`.

**Plain/models flagging**

Sometimes when you want to iterate through all entities with `filter`, `exclude`, `forEach`, `map`, or get an item with `first`, `last` or `at`, you don't always need access to the full Model instance - the plain JavaScript object could do. QuerySets maintain a flag indicating whether these methods operate on plain JavaScript objects (a straight reference from the store) or a Model instances that are instantiated during the operations.

```javascript
const clean = Book.plain.filter(book => book.author === 'Tommi Kaikkonen')
// `book` is a plain javascript object, `clean` is a QuerySet
// 
const clean2 = Book.filter(book => book.name)
// `book` is a Model instance. `clean2` is a QuerySet equivalent to `clean`.
```

The flag persists after settings the flag. The default is to operate on Model instances. You can invert the flag by chaining `plain`. You can flip it back with `models`.

```javascript
clean.filter(book => book.release_year > 2014)
// Since the plain flag was used in `clean`, `book` is a plain instance.

clean.models.filter(book => book.isReleasedAfterYear(2014))
// `models` inverts the flag, `book` is a Model instance.
```

### Meta

See the full documentation for Meta [here](http://tommikaikkonen.github.io/redux-orm/Meta.html)

### Session

See the full documentation for Session [here](http://tommikaikkonen.github.io/redux-orm/Session.html)

## License

MIT. See `LICENSE`