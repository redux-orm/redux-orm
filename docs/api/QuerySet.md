---
id: QuerySet
title: QuerySet
sidebar_label: QuerySet
hide_title: true
---

<a name="QuerySet"></a>

## QuerySet

This class is used to build and make queries to the database
and operating the resulting set (such as updating attributes
or deleting the records).

The queries are built lazily. For example:

```javascript
const qs = Book.all()
    .filter(book => book.releaseYear > 1999)
    .orderBy('name');
```

Doesn't execute a query. The query is executed only when
you need information from the query result, such as [count](#QuerySet+count),
[toRefArray](#QuerySet+toRefArray). 

After the query is executed, the resulting
set is cached in the QuerySet instance.

QuerySet instances also return copies, so chaining filters doesn't
mutate the previous instances.

**Kind**: global class  

* [QuerySet](#QuerySet)
    * [`new QuerySet(modelClass, clauses, [opts])`](#new_QuerySet_new)
    * ~~[`.withModels`](#QuerySet+withModels)~~
    * ~~[`.withRefs`](#QuerySet+withRefs)~~
    * [`.toRefArray()`](#QuerySet+toRefArray) ⇒ `Array.&lt;Object&gt;`
    * [`.toModelArray()`](#QuerySet+toModelArray) ⇒ [`Array.&lt;Model&gt;`](#Model)
    * [`.count()`](#QuerySet+count) ⇒ `number`
    * [`.exists()`](#QuerySet+exists) ⇒ `Boolean`
    * [`.at(index)`](#QuerySet+at) ⇒ [`Model`](#Model) \| `undefined`
    * [`.first()`](#QuerySet+first) ⇒ [`Model`](#Model)
    * [`.last()`](#QuerySet+last) ⇒ [`Model`](#Model)
    * [`.all()`](#QuerySet+all) ⇒ [`QuerySet`](#QuerySet)
    * [`.filter(lookupObj)`](#QuerySet+filter) ⇒ [`QuerySet`](#QuerySet)
    * [`.exclude(lookupObj)`](#QuerySet+exclude) ⇒ [`QuerySet`](#QuerySet)
    * [`.orderBy(iteratees, [orders])`](#QuerySet+orderBy) ⇒ [`QuerySet`](#QuerySet)
    * [`.update(mergeObj)`](#QuerySet+update) ⇒ `undefined`
    * [`.delete()`](#QuerySet+delete) ⇒ `undefined`
    * ~~[`.map()`](#QuerySet+map)~~
    * ~~[`.forEach()`](#QuerySet+forEach)~~

<a name="new_QuerySet_new"></a>

### `new QuerySet(modelClass, clauses, [opts])`
Creates a QuerySet. The constructor is mainly for internal use;
You should access QuerySet instances from [Model](Model).


| Param | Type | Description |
| --- | --- | --- |
| modelClass | [`Model`](#Model) | the model class of objects in this QuerySet. |
| clauses | `Array.&lt;any&gt;` | query clauses needed to evaluate the set. |
| [opts] | `Object` | additional options |

<a name="QuerySet+withModels"></a>

### ~~`querySet.withModels`~~
***Deprecated***

**Kind**: instance property of [`QuerySet`](#QuerySet)  
<a name="QuerySet+withRefs"></a>

### ~~`querySet.withRefs`~~
***Deprecated***

**Kind**: instance property of [`QuerySet`](#QuerySet)  
<a name="QuerySet+toRefArray"></a>

### `querySet.toRefArray()` ⇒ `Array.&lt;Object&gt;`
Returns an array of the plain objects represented by the QuerySet.
The plain objects are direct references to the store.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
**Returns**: `Array.&lt;Object&gt;` - references to the plain JS objects represented by
                   the QuerySet  
<a name="QuerySet+toModelArray"></a>

### `querySet.toModelArray()` ⇒ [`Array.&lt;Model&gt;`](#Model)
Returns an array of [Model](#Model) instances represented by the QuerySet.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
**Returns**: [`Array.&lt;Model&gt;`](#Model) - model instances represented by the QuerySet  
<a name="QuerySet+count"></a>

### `querySet.count()` ⇒ `number`
Returns the number of [Model](#Model) instances represented by the QuerySet.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
**Returns**: `number` - length of the QuerySet  
<a name="QuerySet+exists"></a>

### `querySet.exists()` ⇒ `Boolean`
Checks if the [QuerySet](#QuerySet) instance has any records matching the query
in the database.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
**Returns**: `Boolean` - `true` if the [QuerySet](#QuerySet) instance contains entities, else `false`.  
<a name="QuerySet+at"></a>

### `querySet.at(index)` ⇒ [`Model`](#Model) \| `undefined`
Returns the [Model](#Model) instance at index `index` in the [QuerySet](#QuerySet) instance if
`withRefs` flag is set to `false`, or a reference to the plain JavaScript
object in the model state if `true`.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
**Returns**: [`Model`](#Model) \| `undefined` - a [Model](#Model) instance at index
                          `index` in the [QuerySet](#QuerySet) instance,
                          or undefined if the index is out of bounds.  

| Param | Type | Description |
| --- | --- | --- |
| index | `number` | index of the model instance to get |

<a name="QuerySet+first"></a>

### `querySet.first()` ⇒ [`Model`](#Model)
Returns the [Model](#Model) instance at index 0 in the [QuerySet](#QuerySet) instance.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
<a name="QuerySet+last"></a>

### `querySet.last()` ⇒ [`Model`](#Model)
Returns the [Model](#Model) instance at index `QuerySet.count() - 1`

**Kind**: instance method of [`QuerySet`](#QuerySet)  
<a name="QuerySet+all"></a>

### `querySet.all()` ⇒ [`QuerySet`](#QuerySet)
Returns a new [QuerySet](#QuerySet) instance with the same entities.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
**Returns**: [`QuerySet`](#QuerySet) - a new QuerySet with the same entities.  
<a name="QuerySet+filter"></a>

### `querySet.filter(lookupObj)` ⇒ [`QuerySet`](#QuerySet)
Returns a new [QuerySet](#QuerySet) instance with entities that match properties in `lookupObj`.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
**Returns**: [`QuerySet`](#QuerySet) - a new [QuerySet](#QuerySet) instance with objects that passed the filter.  

| Param | Type | Description |
| --- | --- | --- |
| lookupObj | `Object` | the properties to match objects with. Can also be a function. |

<a name="QuerySet+exclude"></a>

### `querySet.exclude(lookupObj)` ⇒ [`QuerySet`](#QuerySet)
Returns a new [QuerySet](#QuerySet) instance with entities that do not match
properties in `lookupObj`.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
**Returns**: [`QuerySet`](#QuerySet) - a new [QuerySet](#QuerySet) instance with objects that did not pass the filter.  

| Param | Type | Description |
| --- | --- | --- |
| lookupObj | `Object` | the properties to unmatch objects with. Can also be a function. |

<a name="QuerySet+orderBy"></a>

### `querySet.orderBy(iteratees, [orders])` ⇒ [`QuerySet`](#QuerySet)
Returns a new [QuerySet](#QuerySet) instance with entities ordered by `iteratees` in ascending
order, unless otherwise specified. Delegates to `lodash.orderBy`.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
**Returns**: [`QuerySet`](#QuerySet) - a new [QuerySet](#QuerySet) with objects ordered by `iteratees`.  

| Param | Type | Description |
| --- | --- | --- |
| iteratees | `Array.&lt;string&gt;` \| `Array.&lt;function()&gt;` | an array where each item can be a string or a                                           function. If a string is supplied, it should                                           correspond to property on the entity that will                                           determine the order. If a function is supplied,                                           it should return the value to order by. |
| [orders] | `Array.&lt;Boolean&gt;` | the sort orders of `iteratees`. If unspecified, all iteratees                               will be sorted in ascending order. `true` and `'asc'`                               correspond to ascending order, and `false` and `'desc`                               to descending order. |

<a name="QuerySet+update"></a>

### `querySet.update(mergeObj)` ⇒ `undefined`
Records an update specified with `mergeObj` to all the objects
in the [QuerySet](#QuerySet) instance.

**Kind**: instance method of [`QuerySet`](#QuerySet)  

| Param | Type | Description |
| --- | --- | --- |
| mergeObj | `Object` | an object to merge with all the objects in this                             queryset. |

<a name="QuerySet+delete"></a>

### `querySet.delete()` ⇒ `undefined`
Records a deletion of all the objects in this [QuerySet](#QuerySet) instance.

**Kind**: instance method of [`QuerySet`](#QuerySet)  
<a name="QuerySet+map"></a>

### ~~`querySet.map()`~~
***Deprecated***

**Kind**: instance method of [`QuerySet`](#QuerySet)  
<a name="QuerySet+forEach"></a>

### ~~`querySet.forEach()`~~
***Deprecated***

**Kind**: instance method of [`QuerySet`](#QuerySet)  
