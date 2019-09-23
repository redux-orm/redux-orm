---
id: complex-selectors
title: Complex Selectors
sidebar_label: Complex Selectors
hide_title: true
---

# Complex Selectors

Please read up on selectors in the official [reselect](https://github.com/reduxjs/reselect) repository before programming complex calculations using selectors. You should understand the basics of how they work first.

## `ORM` instances become sessions

Passing your `ORM` instance at any position of `createSelector` will create a session at the corresponding position in the result function's argument list:
```js
const someSelector = createSelector(
    [ a,  b,     orm,  d], // a, b and d being selectors
    (_a, _b, session, _d) => session.User.count()
);
```

## Complex selector example

The last argument to `createSelector` can be a custom result function:
```js
const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
const publisherAverageRating = createSelector(
    orm.Publisher.movies.map(orm.Movie.rating),
    ratings => ratings && (ratings.length ? avg(ratings) : 'no movies')
);
```

## Caveats
You need to pass at least one selector beginning with `orm` to `createSelector()`.

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

Remove the second argument that you previously needed to pass to `createSelector` and pass it to the `ORM` constructor instead (as described at the top of this page).
```diff
-const someSelector = createSelector(orm, state => state.orm, …);
+const someSelector = createSelector(orm, …);
```
