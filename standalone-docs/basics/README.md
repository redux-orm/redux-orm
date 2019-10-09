---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
hide_title: true
---

# Quick Start

This page shows you the bare minimum to be able to use Redux-ORM in your app.

## Defining a schema

You probably came here because your application's state is quite complex. While Redux by itself helps a lot, it lacks the capabilities for specifying which relationships there are within your data.

This is where Redux-ORM comes in. It lets us define **`Model`** classes …

```js
import { Model, ORM } from "redux-orm";

class Book extends Model {}
Book.modelName = 'Book';

class Author extends Model {}
Author.modelName = 'Author';
```
… which we then combine into a schema that we call **`ORM`**:
```js
const orm = new ORM;
orm.register(Book, Author);
```

## Connecting a schema to Redux

We need to make the Redux store aware of our models so that it can save them.
```js
import { createStore, combineReducers } from "redux";
import { createReducer } from "redux-orm";

const rootReducer = combineReducers({
    orm: createReducer(orm), // This will be the Redux-ORM state.
    // … potentially other reducers
});
const store = createStore(rootReducer);
```
We have now created a new branch within the Redux state tree at the key `orm`.

## Writing to the store

To actually create some model instances, we need to start a **`Session`** and access the models below it.
```js
const session = orm.session();

session.Book.create({
    id: 1,
    title: 'Don Quixote',
});
```

This is necessary so that you can re-use Model classes across different schemas.

## Reading from the store

Reading data also works using sessions, at least under the hood.
```js
const book = session.Book.first();
console.log(book.title); // 'Don Quixote'
```
Most of the times you won't need to do this, though. More on that later.
