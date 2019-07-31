---
---
id: Session
title: Session
sidebar_label: Session
hide_title: true
---

<a name="Session"></a>

#  Session

**Kind**: global class  

* [Session](#.Session)
    * [`new Session(db, state, [withMutations], [batchToken])`](#.Session)
    * ~~[`getNextState()`](#session+getNextState)~~
    * ~~[`reduce()`](#session+reduce)~~


<a name="Session"></a>

## `new  Session(db, state, [withMutations], [batchToken])`

Creates a new Session.


| Param | Type | Description |
| --- | --- | --- |
| db | Database | a [Database](Database) instance |
| state | Object | the database state |
| [withMutations] | Boolean | whether the session should mutate data |
| [batchToken] | Object | used by the backend to identify objects that can be                                 mutated. |


<a name="session+getNextState"></a>

## ~~` getNextState()`~~

***Deprecated***

**Kind**: instance method of [Session](#.Session)  

<a name="session+reduce"></a>

## ~~` reduce()`~~

***Deprecated***

**Kind**: instance method of [Session](#.Session)  

