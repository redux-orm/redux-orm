---
id: ORM
title: ORM
sidebar_label: ORM
hide_title: true
---

<a name="ORM"></a>

#  ORM

<p>ORM - the Object Relational Mapper.</p>
<p>Use instances of this class to:</p>
<ul>
<li>Register your [Model](Model) classes using [register](#ORM+register)</li>
<li>Get the empty state for the underlying database with [getEmptyState](#ORM+getEmptyState)</li>
<li>Start an immutable database session with [session](#ORM+session)</li>
<li>Start a mutating database session with [mutableSession](#ORM+mutableSession)</li>
</ul>
<p>Internally, this class handles generating a schema specification from models<br>
to the database.</p>

**Kind**: global class  

* [ORM](#.ORM)
    * [`new ORM([opts])`](#.ORM)
    * [`register(...models)`](#orm+register) ⇒ undefined
    * [`get(modelName)`](#orm+get) ⇒ Model
    * [`getEmptyState()`](#orm+getEmptyState) ⇒ Object
    * [`session(state)`](#orm+session) ⇒ Session
    * [`mutableSession(state)`](#orm+mutableSession) ⇒ Session
    * ~~[`withMutations()`](#orm+withMutations)~~
    * ~~[`from()`](#orm+from)~~
    * ~~[`getDefaultState()`](#orm+getDefaultState)~~
    * ~~[`define()`](#orm+define)~~


<a name="ORM"></a>

## `new  ORM([opts])`

<p>Creates a new ORM instance.</p>


| Param | Type | Description |
| --- | --- | --- |
| [opts] | Object |  |
| [opts.stateSelector] | function | <p>function that given a Redux state tree<br> will return the ORM state's subtree,<br> e.g. <code>state =&gt; state.orm</code><br> (necessary if you want to use selectors)</p> |
| [opts.createDatabase] | function | <p>function that creates a database</p> |


<a name="orm+register"></a>

## ` register(...models)`⇒ undefined 

<p>Registers a [Model](Model) class to the ORM.</p>
<p>If the model has declared any ManyToMany fields, their<br>
through models will be generated and registered with<br>
this call, unless a custom through model has been specified.</p>

**Kind**: instance method of [ORM](#.ORM)  

| Param | Type | Description |
| --- | --- | --- |
| ...models | [Model](#.Model) | <p>a [Model](Model) class to register</p> |


<a name="orm+get"></a>

## ` get(modelName)`⇒ Model 

<p>Gets a [Model](Model) class by its name from the registry.</p>

**Kind**: instance method of [ORM](#.ORM)  
**Returns**: [Model](#.Model) - <p>the [Model](Model) class, if found</p>  
**Throws**:

- <p>If [Model](Model) class is not found.</p>


| Param | Type | Description |
| --- | --- | --- |
| modelName | string | <p>the name of the [Model](Model) class to get</p> |


<a name="orm+getEmptyState"></a>

## ` getEmptyState()`⇒ Object 

<p>Returns the empty database state.</p>

**Kind**: instance method of [ORM](#.ORM)  
**Returns**: Object - <p>the empty state</p>  

<a name="orm+session"></a>

## ` session(state)`⇒ Session 

<p>Begins an immutable database session.</p>

**Kind**: instance method of [ORM](#.ORM)  
**Returns**: Session - <p>a new [Session](Session) instance</p>  

| Param | Type | Description |
| --- | --- | --- |
| state | Object | <p>the state the database manages</p> |


<a name="orm+mutableSession"></a>

## ` mutableSession(state)`⇒ Session 

<p>Begins a mutable database session.</p>

**Kind**: instance method of [ORM](#.ORM)  
**Returns**: Session - <p>a new [Session](Session) instance</p>  

| Param | Type | Description |
| --- | --- | --- |
| state | Object | <p>the state the database manages</p> |


<a name="orm+withMutations"></a>

## ~~` withMutations()`~~

***Deprecated***

**Kind**: instance method of [ORM](#.ORM)  

<a name="orm+from"></a>

## ~~` from()`~~

***Deprecated***

**Kind**: instance method of [ORM](#.ORM)  

<a name="orm+getDefaultState"></a>

## ~~` getDefaultState()`~~

***Deprecated***

**Kind**: instance method of [ORM](#.ORM)  

<a name="orm+define"></a>

## ~~` define()`~~

***Deprecated***

**Kind**: instance method of [ORM](#.ORM)  

