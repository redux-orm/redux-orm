---
id: Table
title: Table
sidebar_label: Table
hide_title: true
---

<a name="Table"></a>

#  Table

<p>Handles the underlying data structure for a [Model](Model) class.</p>

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

<p>Creates a new [Table](#Table) instance.</p>


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| userOpts | Object |  | <p>options to use.</p> |
| [userOpts.idAttribute] | string | `"id"` | <p>the id attribute of the entity.</p> |
| [userOpts.arrName] | string | `"items"` | <p>the state attribute where an array of<br> entity id's are stored</p> |
| [userOpts.mapName] | string | `"itemsById"` | <p>the state attribute where the entity objects<br> are stored in a id to entity object<br> map.</p> |
| [userOpts.fields] | string | `"{}"` | <p>mapping of field key to [Field](Field) object</p> |


<a name="table+accessId"></a>

## ` accessId(branch, id)`⇒ Object,undefined 

<p>Returns a reference to the object at index <code>id</code><br>
in state <code>branch</code>.</p>

**Kind**: instance method of [Table](#.Table)  
**Returns**: Object ⎮ undefined - <p>A reference to the raw object in the state or<br>
<code>undefined</code> if not found.</p>  

| Param | Type | Description |
| --- | --- | --- |
| branch | Object | <p>the state</p> |
| id | Number | <p>the id of the object to get</p> |


<a name="table+getEmptyState"></a>

## ` getEmptyState()`⇒ Object 

<p>Returns the default state for the data structure.</p>

**Kind**: instance method of [Table](#.Table)  
**Returns**: Object - <p>The default state for this [ORM](ORM) instance's data structure</p>  

<a name="table+insert"></a>

## ` insert(tx, branch, entry)`⇒ Object 

<p>Returns the data structure including a new object <code>entry</code></p>

**Kind**: instance method of [Table](#.Table)  
**Returns**: Object - <p>an object with two keys: <code>state</code> and <code>created</code>.<br>
<code>state</code> is the new table state and <code>created</code> is the<br>
row that was created.</p>  

| Param | Type | Description |
| --- | --- | --- |
| tx | Object | <p>transaction info</p> |
| branch | Object | <p>the data structure state</p> |
| entry | Object | <p>the object to insert</p> |


<a name="table+update"></a>

## ` update(tx, branch, rows, mergeObj)`⇒ Object 

<p>Returns the data structure with objects where <code>rows</code><br>
are merged with <code>mergeObj</code>.</p>

**Kind**: instance method of [Table](#.Table)  

| Param | Type | Description |
| --- | --- | --- |
| tx | Object | <p>transaction info</p> |
| branch | Object | <p>the data structure state</p> |
| rows | Array.<Object> | <p>rows to update</p> |
| mergeObj | Object | <p>The object to merge with each row.</p> |


<a name="table+delete"></a>

## ` delete(tx, branch, rows)`⇒ Object 

<p>Returns the data structure without rows <code>rows</code>.</p>

**Kind**: instance method of [Table](#.Table)  
**Returns**: Object - <p>the data structure without ids in <code>idsToDelete</code>.</p>  

| Param | Type | Description |
| --- | --- | --- |
| tx | Object | <p>transaction info</p> |
| branch | Object | <p>the data structure state</p> |
| rows | Array.<Object> | <p>rows to update</p> |


<a name="normalizeOrders"></a>

# ` normalizeOrders(orders?)`⇒ Array.&lt;(&#x27;asc&#x27;|&#x27;desc&#x27;)&gt;,undefined 

<p>Adapt order directions array to @{lodash.orderBy} API.</p>

**Kind**: global function  
**Returns**: Array.<('asc'|'desc')> ⎮ undefined - <p>A normalized ordering array or null if non was provided.</p>  

| Param | Type | Description |
| --- | --- | --- |
| orders? | Array.<(Boolean|'asc'|'desc')> | <p>an array of optional order query directions as provided to {@Link {QuerySet.orderBy}}</p> |


