---
id: QuerySet
title: QuerySet
sidebar_label: QuerySet
hide_title: true
---

<a name="QuerySet"></a>

#  QuerySet

This class is used to build and make queries to the databaseand operating the resulting set (such as updating attributesor deleting the records).The queries are built lazily. For example:```javascriptconst qs = Book.all()    .filter(book => book.releaseYear > 1999)    .orderBy('name');```Doesn't execute a query. The query is executed only whenyou need information from the query result, such as [count](#QuerySet+count),[toRefArray](#QuerySet+toRefArray). After the query is executed, the resultingset is cached in the QuerySet instance.QuerySet instances also return copies, so chaining filters doesn'tmutate the previous instances.

**Kind**: global class  

* [QuerySet](#.QuerySet)
    * [`new QuerySet(modelClass, clauses, [opts])`](#.QuerySet)
    * ~~[`withModels`](#queryset+withModels)~~
    * ~~[`withRefs`](#queryset+withRefs)~~
    * [`toRefArray()`](#queryset+toRefArray) ⇒ Array.<Object>
    * [`toModelArray()`](#queryset+toModelArray) ⇒ Array.<Model>
    * [`count()`](#queryset+count) ⇒ number
    * [`exists()`](#queryset+exists) ⇒ Boolean
    * [`at(index)`](#queryset+at) ⇒ Model ⎮ undefined
    * [`first()`](#queryset+first) ⇒ Model
    * [`last()`](#queryset+last) ⇒ Model
    * [`all()`](#queryset+all) ⇒ QuerySet
    * [`filter(lookupObj)`](#queryset+filter) ⇒ QuerySet
    * [`exclude(lookupObj)`](#queryset+exclude) ⇒ QuerySet
    * [`orderBy(iteratees, [orders])`](#queryset+orderBy) ⇒ QuerySet
    * [`update(mergeObj)`](#queryset+update) ⇒ undefined
    * [`delete()`](#queryset+delete) ⇒ undefined
    * ~~[`map()`](#queryset+map)~~
    * ~~[`forEach()`](#queryset+forEach)~~


<a name="QuerySet"></a>

## `new  QuerySet(modelClass, clauses, [opts])`

Creates a QuerySet. The constructor is mainly for internal use;You should access QuerySet instances from [Model](Model).


| Param | Type | Description |
| --- | --- | --- |
| modelClass | Model | the model class of objects in this QuerySet. |
| clauses | Array.<any> | query clauses needed to evaluate the set. |
| [opts] | Object | additional options |


<a name="queryset+withModels"></a>

## ~~` withModels`~~

***Deprecated***

**Kind**: instance property of [QuerySet](#.QuerySet)  

<a name="queryset+withRefs"></a>

## ~~` withRefs`~~

***Deprecated***

**Kind**: instance property of [QuerySet](#.QuerySet)  

<a name="queryset+toRefArray"></a>

## ` toRefArray()`⇒ Array.&lt;Object&gt; 

Returns an array of the plain objects represented by the QuerySet.The plain objects are direct references to the store.

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: Array.<Object> - references to the plain JS objects represented by                   the QuerySet  

<a name="queryset+toModelArray"></a>

## ` toModelArray()`⇒ Array.&lt;Model&gt; 

Returns an array of [Model](Model) instances represented by the QuerySet.

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: Array.<Model> - model instances represented by the QuerySet  

<a name="queryset+count"></a>

## ` count()`⇒ number 

Returns the number of [Model](Model) instances represented by the QuerySet.

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: number - length of the QuerySet  

<a name="queryset+exists"></a>

## ` exists()`⇒ Boolean 

Checks if the [QuerySet](#QuerySet) instance has any records matching the queryin the database.

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: Boolean - `true` if the [QuerySet](#QuerySet) instance contains entities, else `false`.  

<a name="queryset+at"></a>

## ` at(index)`⇒ Model,undefined 

Returns the [Model](Model) instance at index `index` in the [QuerySet](#QuerySet) instance if`withRefs` flag is set to `false`, or a reference to the plain JavaScriptobject in the model state if `true`.

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: Model ⎮ undefined - a [Model](Model) instance at index                          `index` in the [QuerySet](#QuerySet) instance,                          or undefined if the index is out of bounds.  

| Param | Type | Description |
| --- | --- | --- |
| index | number | index of the model instance to get |


<a name="queryset+first"></a>

## ` first()`⇒ Model 

Returns the [Model](Model) instance at index 0 in the [QuerySet](#QuerySet) instance.

**Kind**: instance method of [QuerySet](#.QuerySet)  

<a name="queryset+last"></a>

## ` last()`⇒ Model 

Returns the [Model](Model) instance at index `QuerySet.count() - 1`

**Kind**: instance method of [QuerySet](#.QuerySet)  

<a name="queryset+all"></a>

## ` all()`⇒ QuerySet 

Returns a new [QuerySet](#QuerySet) instance with the same entities.

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: [QuerySet](#.QuerySet) - a new QuerySet with the same entities.  

<a name="queryset+filter"></a>

## ` filter(lookupObj)`⇒ QuerySet 

Returns a new [QuerySet](#QuerySet) instance with entities that match properties in `lookupObj`.

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: [QuerySet](#.QuerySet) - a new [QuerySet](#QuerySet) instance with objects that passed the filter.  

| Param | Type | Description |
| --- | --- | --- |
| lookupObj | Object | the properties to match objects with. Can also be a function. |


<a name="queryset+exclude"></a>

## ` exclude(lookupObj)`⇒ QuerySet 

Returns a new [QuerySet](#QuerySet) instance with entities that do not matchproperties in `lookupObj`.

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: [QuerySet](#.QuerySet) - a new [QuerySet](#QuerySet) instance with objects that did not pass the filter.  

| Param | Type | Description |
| --- | --- | --- |
| lookupObj | Object | the properties to unmatch objects with. Can also be a function. |


<a name="queryset+orderBy"></a>

## ` orderBy(iteratees, [orders])`⇒ QuerySet 

Returns a new [QuerySet](#QuerySet) instance with entities ordered by `iteratees` in ascendingorder, unless otherwise specified. Delegates to `lodash.orderBy`.

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: [QuerySet](#.QuerySet) - a new [QuerySet](#QuerySet) with objects ordered by `iteratees`.  

| Param | Type | Description |
| --- | --- | --- |
| iteratees | Array.<string> ⎮ Array.<function()> | an array where each item can be a string or a                                           function. If a string is supplied, it should                                           correspond to property on the entity that will                                           determine the order. If a function is supplied,                                           it should return the value to order by. |
| [orders] | Array.<Boolean> | the sort orders of `iteratees`. If unspecified, all iteratees                               will be sorted in ascending order. `true` and `'asc'`                               correspond to ascending order, and `false` and `'desc`                               to descending order. |


<a name="queryset+update"></a>

## ` update(mergeObj)`⇒ undefined 

Records an update specified with `mergeObj` to all the objectsin the [QuerySet](#QuerySet) instance.

**Kind**: instance method of [QuerySet](#.QuerySet)  

| Param | Type | Description |
| --- | --- | --- |
| mergeObj | Object | an object to merge with all the objects in this                             queryset. |


<a name="queryset+delete"></a>

## ` delete()`⇒ undefined 

Records a deletion of all the objects in this [QuerySet](#QuerySet) instance.

**Kind**: instance method of [QuerySet](#.QuerySet)  

<a name="queryset+map"></a>

## ~~` map()`~~

***Deprecated***

**Kind**: instance method of [QuerySet](#.QuerySet)  

<a name="queryset+forEach"></a>

## ~~` forEach()`~~

***Deprecated***

**Kind**: instance method of [QuerySet](#.QuerySet)  

