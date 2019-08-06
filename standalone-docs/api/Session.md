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

<p>Creates a new Session.</p>


| Param | Type | Description |
| --- | --- | --- |
| db | Database | <p>a [Database](Database) instance</p> |
| state | Object | <p>the database state</p> |
| [withMutations] | Boolean | <p>whether the session should mutate data</p> |
| [batchToken] | Object | <p>used by the backend to identify objects that can be<br> mutated.</p> |


<a name="session+getNextState"></a>

## ~~` getNextState()`~~

***Deprecated***

**Kind**: instance method of [Session](#.Session)  

<a name="session+reduce"></a>

## ~~` reduce()`~~

***Deprecated***

**Kind**: instance method of [Session](#.Session)  

