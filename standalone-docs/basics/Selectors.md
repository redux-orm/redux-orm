---
id: selectors
title: Selectors
sidebar_label: Selectors
hide_title: true
---

# Selectors

Selectors are functions that cache their result after they are executed. When you call them again with the same parameters, the result will be returned immediately. This can drastically improve the performance of web frontends by preventing unnecessary re-rendering of UI components.

Redux-ORM provides a simple API for creating model related selectors. For example, given Movie is a model class registered to `orm`, we can write:

```js
import { createSelector } from 'redux-orm';
const movies = createSelector(orm.Movie);
```

## Argument types

Pass a single primary key, an array of primary keys or nothing as an argument.

```js
movies(state);             // array of all movies
movies(state, 1);          // movie with ID 1
movies(state, [1, 2, 3]);  // array of movies with ID 1, 2 and 3
```

> Arguments are compared shallowly so make sure not to create new references during each call.

## Mapping models to their fields

A selector can directly retrieve related model references for you.

```js
const moviePublisher = createSelector(orm.Movie.publisher);

moviePublisher(state);            // array of each movie's publisher
moviePublisher(state, 1);         // the first movie's publisher
moviePublisher(state, [1, 2, 3]); // array of each of the movies with ID 1, 2 and 3
```

### Chaining relationship accessors

For relationships, this works in a chained way as well.

```js
const coverBookAuthors = createSelector(orm.Cover.book.authors);
```

### The default is `null`

If the cover or its book don't exist, `null` is returned.

```js
coverBookAuthors(state);  // []
                          // or [null, null, …] if there are covers but no authors
coverBookAuthors(state, 1);         // null
coverBookAuthors(state, [1, 2, 3]); // [null, null, null]
```

## Map over collections using `.map()`

`map()` is a Redux-ORM method which returns a selector that will be called for all instances in a collection. For example, we might want a selector that returns all titles of books within a certain genre.

```js
const genreTitles = createSelector(
    orm.Genre.books.map(orm.Book.title)
);

genreTitles(state, 'Realism');
// ['The Adventures of Huckleberry Finn', 'The Portrait of a Lady']
```

## Prerequisites

You must tell your `ORM` how its selectors can retrieve the Redux branch. You do this by passing a `stateSelector` function to the `ORM` constructor.

```diff
-const orm = new ORM();
+const orm = new ORM({
+    stateSelector: state => state.orm,
+});
```
