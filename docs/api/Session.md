---
id: Session
title: Session
sidebar_label: Session
hide_title: true
---

<a name="Session"></a>

## Session
**Kind**: global class  

* [Session](#Session)
    * [`new Session(db, state, [withMutations], [batchToken])`](#new_Session_new)
    * ~~[`.getNextState()`](#Session+getNextState)~~
    * ~~[`.reduce()`](#Session+reduce)~~

<a name="new_Session_new"></a>

### `new Session(db, state, [withMutations], [batchToken])`
Creates a new Session.


| Param | Type | Description |
| --- | --- | --- |
| db | `Database` | a [Database](Database) instance |
| state | `Object` | the database state |
| [withMutations] | `Boolean` | whether the session should mutate data |
| [batchToken] | `Object` | used by the backend to identify objects that can be                                 mutated. |

<a name="Session+getNextState"></a>

### ~~`session.getNextState()`~~
***Deprecated***

**Kind**: instance method of [`Session`](#Session)  
<a name="Session+reduce"></a>

### ~~`session.reduce()`~~
***Deprecated***

**Kind**: instance method of [`Session`](#Session)  
