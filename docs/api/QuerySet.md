---
id: queryset
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
[toRefArray](#QuerySet+toRefArray). After the query is executed, the resulting
set is cached in the QuerySet instance.

QuerySet instances also return copies, so chaining filters doesn't
mutate the previous instances.

**Kind**: global class  

* [QuerySet](#QuerySet)
    * [new QuerySet(modelClass, clauses, [opts])](#new_QuerySet_new)
    * ~~[.withModels](#QuerySet+withModels)~~
    * ~~[.withRefs](#QuerySet+withRefs)~~
    * [.toRefArray()](#QuerySet+toRefArray) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.toModelArray()](#QuerySet+toModelArray) ⇒ [<code>Array.&lt;Model&gt;</code>](#Model)
    * [.count()](#QuerySet+count) ⇒ <code>number</code>
    * [.exists()](#QuerySet+exists) ⇒ <code>Boolean</code>
    * [.at(index)](#QuerySet+at) ⇒ [<code>Model</code>](#Model) \| <code>undefined</code>
    * [.first()](#QuerySet+first) ⇒ [<code>Model</code>](#Model)
    * [.last()](#QuerySet+last) ⇒ [<code>Model</code>](#Model)
    * [.all()](#QuerySet+all) ⇒ [<code>QuerySet</code>](#QuerySet)
    * [.filter(lookupObj)](#QuerySet+filter) ⇒ [<code>QuerySet</code>](#QuerySet)
    * [.exclude(lookupObj)](#QuerySet+exclude) ⇒ [<code>QuerySet</code>](#QuerySet)
    * [.orderBy(iteratees, [orders])](#QuerySet+orderBy) ⇒ [<code>QuerySet</code>](#QuerySet)
    * [.update(mergeObj)](#QuerySet+update) ⇒ <code>undefined</code>
    * [.delete()](#QuerySet+delete) ⇒ <code>undefined</code>
    * ~~[.map()](#QuerySet+map)~~
    * ~~[.forEach()](#QuerySet+forEach)~~

<a name="new_QuerySet_new"></a>

### new QuerySet(modelClass, clauses, [opts])
Creates a QuerySet. The constructor is mainly for internal use;
You should access QuerySet instances from [Model](#Model).


| Param | Type | Description |
| --- | --- | --- |
| modelClass | [<code>Model</code>](#Model) | the model class of objects in this QuerySet. |
| clauses | <code>Array.&lt;any&gt;</code> | query clauses needed to evaluate the set. |
| [opts] | <code>Object</code> | additional options |

<a name="QuerySet+withModels"></a>

### ~~querySet.withModels~~
***Deprecated***

**Kind**: instance property of [<code>QuerySet</code>](#QuerySet)  
<a name="QuerySet+withRefs"></a>

### ~~querySet.withRefs~~
***Deprecated***

**Kind**: instance property of [<code>QuerySet</code>](#QuerySet)  
<a name="QuerySet+toRefArray"></a>

### querySet.toRefArray() ⇒ <code>Array.&lt;Object&gt;</code>
Returns an array of the plain objects represented by the QuerySet.
The plain objects are direct references to the store.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
**Returns**: <code>Array.&lt;Object&gt;</code> - references to the plain JS objects represented by
                   the QuerySet  
<a name="QuerySet+toModelArray"></a>

### querySet.toModelArray() ⇒ [<code>Array.&lt;Model&gt;</code>](#Model)
Returns an array of [Model](#Model) instances represented by the QuerySet.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
**Returns**: [<code>Array.&lt;Model&gt;</code>](#Model) - model instances represented by the QuerySet  
<a name="QuerySet+count"></a>

### querySet.count() ⇒ <code>number</code>
Returns the number of [Model](#Model) instances represented by the QuerySet.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
**Returns**: <code>number</code> - length of the QuerySet  
<a name="QuerySet+exists"></a>

### querySet.exists() ⇒ <code>Boolean</code>
Checks if the [QuerySet](#QuerySet) instance has any records matching the query
in the database.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
**Returns**: <code>Boolean</code> - `true` if the [QuerySet](#QuerySet) instance contains entities, else `false`.  
<a name="QuerySet+at"></a>

### querySet.at(index) ⇒ [<code>Model</code>](#Model) \| <code>undefined</code>
Returns the [Model](#Model) instance at index `index` in the [QuerySet](#QuerySet) instance if
`withRefs` flag is set to `false`, or a reference to the plain JavaScript
object in the model state if `true`.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
**Returns**: [<code>Model</code>](#Model) \| <code>undefined</code> - a [Model](#Model) instance at index
                          `index` in the [QuerySet](#QuerySet) instance,
                          or undefined if the index is out of bounds.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | index of the model instance to get |

<a name="QuerySet+first"></a>

### querySet.first() ⇒ [<code>Model</code>](#Model)
Returns the [Model](#Model) instance at index 0 in the [QuerySet](#QuerySet) instance.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
<a name="QuerySet+last"></a>

### querySet.last() ⇒ [<code>Model</code>](#Model)
Returns the [Model](#Model) instance at index `QuerySet.count() - 1`

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
<a name="QuerySet+all"></a>

### querySet.all() ⇒ [<code>QuerySet</code>](#QuerySet)
Returns a new [QuerySet](#QuerySet) instance with the same entities.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
**Returns**: [<code>QuerySet</code>](#QuerySet) - a new QuerySet with the same entities.  
<a name="QuerySet+filter"></a>

### querySet.filter(lookupObj) ⇒ [<code>QuerySet</code>](#QuerySet)
Returns a new [QuerySet](#QuerySet) instance with entities that match properties in `lookupObj`.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
**Returns**: [<code>QuerySet</code>](#QuerySet) - a new [QuerySet](#QuerySet) instance with objects that passed the filter.  

| Param | Type | Description |
| --- | --- | --- |
| lookupObj | <code>Object</code> | the properties to match objects with. Can also be a function. |

<a name="QuerySet+exclude"></a>

### querySet.exclude(lookupObj) ⇒ [<code>QuerySet</code>](#QuerySet)
Returns a new [QuerySet](#QuerySet) instance with entities that do not match
properties in `lookupObj`.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
**Returns**: [<code>QuerySet</code>](#QuerySet) - a new [QuerySet](#QuerySet) instance with objects that did not pass the filter.  

| Param | Type | Description |
| --- | --- | --- |
| lookupObj | <code>Object</code> | the properties to unmatch objects with. Can also be a function. |

<a name="QuerySet+orderBy"></a>

### querySet.orderBy(iteratees, [orders]) ⇒ [<code>QuerySet</code>](#QuerySet)
Returns a new [QuerySet](#QuerySet) instance with entities ordered by `iteratees` in ascending
order, unless otherwise specified. Delegates to `lodash.orderBy`.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
**Returns**: [<code>QuerySet</code>](#QuerySet) - a new [QuerySet](#QuerySet) with objects ordered by `iteratees`.  

| Param | Type | Description |
| --- | --- | --- |
| iteratees | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;function()&gt;</code> | an array where each item can be a string or a                                           function. If a string is supplied, it should                                           correspond to property on the entity that will                                           determine the order. If a function is supplied,                                           it should return the value to order by. |
| [orders] | <code>Array.&lt;Boolean&gt;</code> | the sort orders of `iteratees`. If unspecified, all iteratees                               will be sorted in ascending order. `true` and `'asc'`                               correspond to ascending order, and `false` and `'desc`                               to descending order. |

<a name="QuerySet+update"></a>

### querySet.update(mergeObj) ⇒ <code>undefined</code>
Records an update specified with `mergeObj` to all the objects
in the [QuerySet](#QuerySet) instance.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  

| Param | Type | Description |
| --- | --- | --- |
| mergeObj | <code>Object</code> | an object to merge with all the objects in this                             queryset. |

<a name="QuerySet+delete"></a>

### querySet.delete() ⇒ <code>undefined</code>
Records a deletion of all the objects in this [QuerySet](#QuerySet) instance.

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
<a name="QuerySet+map"></a>

### ~~querySet.map()~~
***Deprecated***

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
<a name="QuerySet+forEach"></a>

### ~~querySet.forEach()~~
***Deprecated***

**Kind**: instance method of [<code>QuerySet</code>](#QuerySet)  
