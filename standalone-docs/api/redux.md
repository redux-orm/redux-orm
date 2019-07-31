---
id: module_redux
title: Redux
sidebar_label: Redux
hide_title: true
---

<a name="module:redux"></a>

#  redux


* [redux](#.redux)
    * _static_
        * [`defaultUpdater()`](#redux.defaultUpdater) ⇒ undefined
    * _inner_
        * [`level`](#redux.level)


<a name="module:redux.defaultUpdater"></a>

## `static  defaultUpdater()`⇒ `undefined` 

Calls all models' reducers if they exist.

**Kind**: static method of [redux](#.redux)  

<a name="module:redux~level"></a>

## ` level`

Drill down into selector map by cachePath.

The selector itself is stored under a special SELECTOR_KEY
so that we can store selectors below it as well.

**Kind**: inner property of [redux](#.redux)  

<a name="createReducer"></a>

# ` createReducer(orm, [updater])`⇒ `function` 

Call the returned function to pass actions to Redux-ORM.

**Kind**: global function  
**Returns**: function - reducer that will update the ORM state.  

| Param | Type | Description |
| --- | --- | --- |
| orm | ORM | the ORM instance. |
| [updater] | function | the function updating the ORM state based on the given action. |


<a name="createSelector"></a>

# ` createSelector(...args)`⇒ `function` 

Returns a memoized selector based on passed arguments.
This is similar to `reselect`'s `createSelector`,
except you can also pass a single function to be memoized.

If you pass multiple functions, the format will be the
same as in `reselect`. The last argument is the selector
function and the previous are input selectors.

When you use this method to create a selector, the returned selector
expects the whole `redux-orm` state branch as input. In the selector
function that you pass as the last argument, you will receive a
`session` argument (a `Session` instance) followed by any
input arguments, like in `reselect`.

This is an example selector:

```javascript
// orm is an instance of ORM
const bookSelector = createSelector(orm, session => {
    return session.Book.map(book => {
        return Object.assign({}, book.ref, {
            authors: book.authors.map(author => author.name),
            genres: book.genres.map(genre => genre.name),
        });
    });
});
```

redux-orm uses a special memoization function to avoid recomputations.

Everytime a selector runs, this function records which instances
of your `Model`s were accessed.<br>
On subsequent runs, the selector first checks if the previously
accessed instances or `args` have changed in any way:
<ul>
    <li>If yes, the selector calls the function you passed to it.</li>
    <li>If not, it just returns the previous result
        (unless you call it for the first time).</li>
</ul>

This way you can use the `PureRenderMixin` in your React components
for performance gains.

**Kind**: global function  
**Returns**: function - memoized selector  

| Param | Type | Description |
| --- | --- | --- |
| ...args | function | zero or more input selectors                              and the selector function. |


