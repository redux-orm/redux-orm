---
id: orm
title: ORM
sidebar_label: ORM
hide_title: true
---

<a name="ORM"></a>

## ORM
ORM - the Object Relational Mapper.

Use instances of this class to:

- Register your [Model](#Model) classes using [register](#ORM+register)
- Get the empty state for the underlying database with [getEmptyState](#ORM+getEmptyState)
- Start an immutable database session with [session](#ORM+session)
- Start a mutating database session with [mutableSession](#ORM+mutableSession)

Internally, this class handles generating a schema specification from models
to the database.

**Kind**: global class  

* [ORM](#ORM)
    * [new ORM()](#new_ORM_new)
    * [.register(...models)](#ORM+register) ⇒ <code>undefined</code>
    * [.get(modelName)](#ORM+get) ⇒ [<code>Model</code>](#Model)
    * [.getEmptyState()](#ORM+getEmptyState) ⇒ <code>Object</code>
    * [.session(state)](#ORM+session) ⇒ [<code>Session</code>](#Session)
    * [.mutableSession(state)](#ORM+mutableSession) ⇒ [<code>Session</code>](#Session)
    * ~~[.withMutations()](#ORM+withMutations)~~
    * ~~[.from()](#ORM+from)~~
    * ~~[.getDefaultState()](#ORM+getDefaultState)~~
    * ~~[.define()](#ORM+define)~~

<a name="new_ORM_new"></a>

### new ORM()
Creates a new ORM instance.

<a name="ORM+register"></a>

### orM.register(...models) ⇒ <code>undefined</code>
Registers a [Model](#Model) class to the ORM.

If the model has declared any ManyToMany fields, their
through models will be generated and registered with
this call, unless a custom through model has been specified.

**Kind**: instance method of [<code>ORM</code>](#ORM)  

| Param | Type | Description |
| --- | --- | --- |
| ...models | [<code>Model</code>](#Model) | a [Model](#Model) class to register |

<a name="ORM+get"></a>

### orM.get(modelName) ⇒ [<code>Model</code>](#Model)
Gets a [Model](#Model) class by its name from the registry.

**Kind**: instance method of [<code>ORM</code>](#ORM)  
**Returns**: [<code>Model</code>](#Model) - the [Model](#Model) class, if found  
**Throws**:

- If [Model](#Model) class is not found.


| Param | Type | Description |
| --- | --- | --- |
| modelName | <code>string</code> | the name of the [Model](#Model) class to get |

<a name="ORM+getEmptyState"></a>

### orM.getEmptyState() ⇒ <code>Object</code>
Returns the empty database state.

**Kind**: instance method of [<code>ORM</code>](#ORM)  
**Returns**: <code>Object</code> - the empty state  
<a name="ORM+session"></a>

### orM.session(state) ⇒ [<code>Session</code>](#Session)
Begins an immutable database session.

**Kind**: instance method of [<code>ORM</code>](#ORM)  
**Returns**: [<code>Session</code>](#Session) - a new [Session](#Session) instance  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> | the state the database manages |

<a name="ORM+mutableSession"></a>

### orM.mutableSession(state) ⇒ [<code>Session</code>](#Session)
Begins a mutable database session.

**Kind**: instance method of [<code>ORM</code>](#ORM)  
**Returns**: [<code>Session</code>](#Session) - a new [Session](#Session) instance  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> | the state the database manages |

<a name="ORM+withMutations"></a>

### ~~orM.withMutations()~~
***Deprecated***

**Kind**: instance method of [<code>ORM</code>](#ORM)  
<a name="ORM+from"></a>

### ~~orM.from()~~
***Deprecated***

**Kind**: instance method of [<code>ORM</code>](#ORM)  
<a name="ORM+getDefaultState"></a>

### ~~orM.getDefaultState()~~
***Deprecated***

**Kind**: instance method of [<code>ORM</code>](#ORM)  
<a name="ORM+define"></a>

### ~~orM.define()~~
***Deprecated***

**Kind**: instance method of [<code>ORM</code>](#ORM)  
