---
id: complex-selectors
title: Complex Selectors
sidebar_label: Complex Selectors
hide_title: true
---

# Complex Selectors

Please read up on selectors in the official [reselect](https://github.com/reduxjs/reselect) repository before programming complex calculations using selectors. You should understand the basics of how they work first.

## Custom result functions

As with regular selectors, Redux-ORM selectors can combine the results of multiple selectors.

So the last argument you pass to `createSelector` can be a custom result function that will receive the result of previous selectors as arguments.

```js
const publisherDescription = createSelector(
    orm.Publisher.name,
    orm.Publisher.movies,
    (publisher, movies) => `${publisher} has published ${movies.length} movies.`
);
publisherDescription(state, 1) // Warner Bros. has published 10000 movies.
```

### `SelectorSpec`

In this example, `orm.Publisher.name` and `orm.Publisher.movies` are interpreted as input selectors, although in fact they are so-called `SelectorSpec` objects created by Redux-ORM.

> Don't forget that both of them will receive the `state` and `1` as arguments as well.

`createSelector` will automatically try to turn anything beginning with `orm` into a selector.

### `ORM` instances become sessions

Passing your `ORM` instance at any position of `createSelector` will create a session at the corresponding position in the result function's argument list:
```js
const someSelector = createSelector(
    [ a,  b,     orm,  d], // a, b and d being selectors
    (_a, _b, session, _d) => session.User.count()
);
```

This is important because if you want to access Model classes within the result function, you need to get them using a session (like `session.User` above).

> You always need to pass at least one selector beginning with `orm` to `createSelector()`.

## The `QuerySet` class

Where does the `User.count()` call above come from, you're asking?

There are many functions like `count()` defined on the [`QuerySet`](../api/QuerySet) class. Most of them are copied over to Model classes when a session is created.

Instances of `QuerySet` are automatically created when you access a relationship that potentially returns multiple model instances, like `book.authors`. To get the corresponding database objects, you would write `book.authors.toRefArray()`. In some cases you need to wrap them in Model instances, e.g. in order to access other related models. To do that, use `book.authors.toModelArray()` instead.

## Complex selector example

Let's apply everything we've learned so far into a single useful computation.
```js
// this is just a helper that gets the average value in an array
const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

const publisherAverageRating = createSelector(
    orm.Publisher.movies.map(orm.Movie.rating),
    ratings => ratings && (ratings.length ? avg(ratings) : 'no movies')
);
publisherAverageRating(state, 1) // 3.5
```

## Argument types for custom result functions

Different values of the primary key argument need to be handled if you want to support them ([#282](https://github.com/redux-orm/redux-orm/issues/282)):
```js
const publisherAverageRating = createSelector(
    orm.Publisher.movies.map(orm.Movie.rating),
    (state, idArg) => idArg,
    (ratingsArg, idArg) => {
        if (typeof idArg === 'undefined' || Array.isArray(idArg)) {
            // only state was passed, or an array of IDs
            return ratingsArg.map(
                ratings => ratings && ratings.length ? avg(ratings) : 'no movies'
            );
        }
        // single publisher ID was passed
        return ratingsArg && (ratingsArg.length ? avg(ratingsArg) : 'no movies');
    }
);
```

## Migrating from versions before 0.14.0

Remove the second argument that you previously needed to pass to `createSelector` and pass it to the `ORM` constructor instead (as described [in the previous section](../basics/Selectors.md#prerequisites)).
```diff
-const someSelector = createSelector(orm, state => state.orm, …);
+const someSelector = createSelector(orm, …);
```
