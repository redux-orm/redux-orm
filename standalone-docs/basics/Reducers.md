---
id: reducers
title: Reducers
sidebar_label: Reducers
hide_title: true
---

# Reducers

The default reducer that you passed to the Redux store allows you to update your models based on Redux actions.

## `Model.reducer`

Your model classes' static `reducer` function will automatically be called when a Redux action is dispatched. Override them to add your own behavior.

```js
class Book extends Model {
    static reducer(action, Book, session) {
        let book;
        switch (action.type) {
        case 'CREATE_BOOK':
            Book.create(action.payload);
            break;
        case 'UPDATE_BOOK':
            book = Book.withId(action.payload.id);
            book.update(action.payload);
            break;
        case 'REMOVE_BOOK':
            book = Book.withId(action.payload);
            book.delete();
            break;
        case 'ADD_AUTHOR_TO_BOOK':
            book = Book.withId(action.payload.bookId);
            book.authors.add(action.payload.author);
            break;
        case 'REMOVE_AUTHOR_FROM_BOOK':
            book = Book.withId(action.payload.bookId);
            book.authors.remove(action.payload.authorId);
            break;
        case 'ASSIGN_PUBLISHER':
            book = Book.withId(action.payload.bookId);
            book.publisherId = action.payload.publisherId;
            break;
        }
        // Return value is ignored.
    }
}
```

## Static methods

To find out which methods you can call on your model class [take a look at the API reference](../api/Model). The most useful ones are as follows:

* `create(props)`: creates a new Model instance with `props`. If you don't supply an id, the new `id` will be `Math.max(...allOtherIds) + 1`.
* `upsert(props)`: either creates a new Model instance with `props` or, in case an instance with the same id already exists, updates that one - in other words it's **create or update** behaviour.
* `withId(id)`: gets the Model instance with id `id`.
* `get(matchObj)`: gets a Model instance based on matching properties in `matchObj` (if you are sure there is only one matching instance).

## Instance methods

Once you have a model instance, you may want to call one of the following methods:

* `update(mergeObj)`: merges `mergeObj` with the Model instance properties. Returns `undefined`.
* `delete()`: deletes the record for this Model instance in the database. Returns `undefined`.
