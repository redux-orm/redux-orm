---
id: ORM
title: ORM
sidebar_label: ORM
hide_title: true
---

<a name="ORM"></a>

#  ORM

ORM - the Object Relational Mapper.Use instances of this class to:- Register your [Model](Model) classes using [register](#ORM+register)- Get the empty state for the underlying database with [getEmptyState](#ORM+getEmptyState)- Start an immutable database session with [session](#ORM+session)- Start a mutating database session with [mutableSession](#ORM+mutableSession)Internally, this class handles generating a schema specification from modelsto the database.

**Kind**: global class  

* [ORM](#.ORM)
    * [`new ORM()`](#.ORM)
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

## `new  ORM()`

Creates a new ORM instance.


<a name="orm+register"></a>

## ` register(...models)`⇒ undefined 

Registers a [Model](Model) class to the ORM.If the model has declared any ManyToMany fields, theirthrough models will be generated and registered withthis call, unless a custom through model has been specified.

**Kind**: instance method of [ORM](#.ORM)  

| Param | Type | Description |
| --- | --- | --- |
| ...models | Model | a [Model](Model) class to register |


<a name="orm+get"></a>

## ` get(modelName)`⇒ Model 

Gets a [Model](Model) class by its name from the registry.

**Kind**: instance method of [ORM](#.ORM)  
**Returns**: Model - the [Model](Model) class, if found  
**Throws**:

- If [Model](Model) class is not found.


| Param | Type | Description |
| --- | --- | --- |
| modelName | string | the name of the [Model](Model) class to get |


<a name="orm+getEmptyState"></a>

## ` getEmptyState()`⇒ Object 

Returns the empty database state.

**Kind**: instance method of [ORM](#.ORM)  
**Returns**: Object - the empty state  

<a name="orm+session"></a>

## ` session(state)`⇒ Session 

Begins an immutable database session.

**Kind**: instance method of [ORM](#.ORM)  
**Returns**: [Session](#.Session) - a new [Session](Session) instance  

| Param | Type | Description |
| --- | --- | --- |
| state | Object | the state the database manages |


<a name="orm+mutableSession"></a>

## ` mutableSession(state)`⇒ Session 

Begins a mutable database session.

**Kind**: instance method of [ORM](#.ORM)  
**Returns**: [Session](#.Session) - a new [Session](Session) instance  

| Param | Type | Description |
| --- | --- | --- |
| state | Object | the state the database manages |


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

