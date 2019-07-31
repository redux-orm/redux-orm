---
id: Table
title: Table
sidebar_label: Table
hide_title: true
---

<a name="Table"></a>

#  Table

Handles the underlying data structure for a [Model](Model) class.

**Kind**: global class  

* [Table](#.Table)
    * [`new Table(userOpts)`](#.Table)
    * [`accessId(branch, id)`](#table+accessId) ⇒ Object ⎮ undefined
    * [`getEmptyState()`](#table+getEmptyState) ⇒ Object
    * [`insert(tx, branch, entry)`](#table+insert) ⇒ Object
    * [`update(tx, branch, rows, mergeObj)`](#table+update) ⇒ Object
    * [`delete(tx, branch, rows)`](#table+delete) ⇒ Object


<a name="Table"></a>

## `new  Table(userOpts)`

Creates a new [Table](#Table) instance.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| userOpts | Object |  | options to use. |
| [userOpts.idAttribute] | string | `"id"` | the id attribute of the entity. |
| [userOpts.arrName] | string | `"items"` | the state attribute where an array of                                             entity id's are stored |
| [userOpts.mapName] | string | `"itemsById"` | the state attribute where the entity objects                                                 are stored in a id to entity object                                                 map. |
| [userOpts.fields] | string | `"{}"` | mapping of field key to [Field](Field) object |


<a name="table+accessId"></a>

## ` accessId(branch, id)`⇒ Object,undefined 

Returns a reference to the object at index `id`in state `branch`.

**Kind**: instance method of [Table](#.Table)  
**Returns**: Object ⎮ undefined - A reference to the raw object in the state or                           `undefined` if not found.  

| Param | Type | Description |
| --- | --- | --- |
| branch | Object | the state |
| id | Number | the id of the object to get |


<a name="table+getEmptyState"></a>

## ` getEmptyState()`⇒ Object 

Returns the default state for the data structure.

**Kind**: instance method of [Table](#.Table)  
**Returns**: Object - The default state for this [ORM](ORM) instance's data structure  

<a name="table+insert"></a>

## ` insert(tx, branch, entry)`⇒ Object 

Returns the data structure including a new object `entry`

**Kind**: instance method of [Table](#.Table)  
**Returns**: Object - an object with two keys: `state` and `created`.                 `state` is the new table state and `created` is the                 row that was created.  

| Param | Type | Description |
| --- | --- | --- |
| tx | Object | transaction info |
| branch | Object | the data structure state |
| entry | Object | the object to insert |


<a name="table+update"></a>

## ` update(tx, branch, rows, mergeObj)`⇒ Object 

Returns the data structure with objects where `rows`are merged with `mergeObj`.

**Kind**: instance method of [Table](#.Table)  

| Param | Type | Description |
| --- | --- | --- |
| tx | Object | transaction info |
| branch | Object | the data structure state |
| rows | Array.<Object> | rows to update |
| mergeObj | Object | The object to merge with each row. |


<a name="table+delete"></a>

## ` delete(tx, branch, rows)`⇒ Object 

Returns the data structure without rows `rows`.

**Kind**: instance method of [Table](#.Table)  
**Returns**: Object - the data structure without ids in `idsToDelete`.  

| Param | Type | Description |
| --- | --- | --- |
| tx | Object | transaction info |
| branch | Object | the data structure state |
| rows | Array.<Object> | rows to update |


<a name="normalizeOrders"></a>

# ` normalizeOrders(orders?)`⇒ Array.&lt;(&#x27;asc&#x27;|&#x27;desc&#x27;)&gt;,undefined 

Adapt order directions array to @{lodash.orderBy} API.

**Kind**: global function  
**Returns**: Array.<('asc'|'desc')> ⎮ undefined - A normalized ordering array or null if non was provided.  

| Param | Type | Description |
| --- | --- | --- |
| orders? | Array.<(Boolean|'asc'|'desc')> | an array of optional order query directions as provided to {@Link {QuerySet.orderBy}} |


