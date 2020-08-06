---
id: fields
title: Relational Fields
sidebar_label: Relational Fields
hide_title: true
---

# Relational Fields

Our goal is to have each model instance be stored exactly once, and we want to retrieve related model instances easily.

## One-to-many
For this purpose we can define our model to have fields that reference other models. For instance, let's assume that every book is written by a single author that we want to represent using a **foreign key**.

```js
import { fk } from 'redux-orm';
Book.fields = {
    authorId: fk({
        to: 'Author',
        as: 'author',
        relatedName: 'books',
    }),
};
```
Now any `book` returned by Redux-ORM will have a `book.author` accessor that can be used to retrieve its `Author` model instance. In turn, each `author` will receive an `author.books` accessor.

All we need to do is pass an `authorId` when creating each book. APIs commonly return these keys.

## Many-to-many

But if we're realistic, a book could have several authors, and every author can write multiple books. Here's the way to specify such a many-to-many relationship.

```js
import { many } from 'redux-orm';
Book.fields = {
    author_ids: many({
        to: 'Author',
        as: 'authors',
        relatedName: 'books',
    }),
};
```
`author_ids` should be an array of author **primary keys** (by default looked up at `author.id`).

> Never use `many` to specify a backwards foreign key field, only for many-to-many relationships.

## One-to-one

Each `book` has **exactly one** cover. This can be expressed similarly to one-to-many relationships.

```js
import { oneToOne } from 'redux-orm';
Book.fields = {
    coverId: oneToOne({
        to: 'Cover',
        as: 'cover',
        relatedName: 'book',
    }),
};
```

## Shorthand definitions

At times we don't need to keep access to the original `authorId` of a book. Then it's a little easier.
```js
Book.fields = {
    authorId: fk('Author', 'books'),
};
```
The second argument can be omitted. For `fk`, you can then access the reverse relation through `author.bookSet`, where the related name is `${modelName}Set`. Same goes for `many`. For `oneToOne`, the reverse relation can be accessed by just the model name the field was declared on: `author.book`.

## Attributes

It is recommended but not required to list all the possible other fields a model could have.
```js
import { attr, many, oneToOne } from 'redux-orm';
Book.fields = {
    id: attr(),
    title: attr(),
    author_ids: many({
        to: 'Author',
        as: 'authors',
        relatedName: 'books',
    }),
    cover: oneToOne('Cover'),
};
```
### idAttribute
Sometimes backends store use natural keys as primary keys or call them differently. If that's the case we need to change the model's ID attribute.
```js
Book.options = {
  idAttribute: 'title'; // Default: 'id' 
}
```
