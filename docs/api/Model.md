---
id: model
title: Model
sidebar_label: Model
hide_title: true
---

<a name="Model"></a>

## Model
The heart of an ORM, the data model.

The fields you specify to the Model will be used to generate
a schema to the database, related property accessors, and
possibly through models.

In each [Session](#Session) you instantiate from an [ORM](#ORM) instance,
you will receive a session-specific subclass of this Model. The methods
you define here will be available to you in sessions.

An instance of [Model](#Model) represents a record in the database, though
it is possible to generate multiple instances from the same record in the database.

To create data models in your schema, subclass [Model](#Model). To define
information about the data model, override static class methods. Define instance
logic by defining prototype methods (without `static` keyword).

**Kind**: global class  

* [Model](#Model)
    * [new Model(props)](#new_Model_new)
    * _instance_
        * [.ref](#Model+ref) ⇒ <code>Object</code>
        * [.getClass()](#Model+getClass) ⇒ [<code>Model</code>](#Model)
        * [.getId()](#Model+getId) ⇒ <code>\*</code>
        * [.toString()](#Model+toString) ⇒ <code>string</code>
        * [.equals(otherModel)](#Model+equals) ⇒ <code>Boolean</code>
        * [.set(propertyName, value)](#Model+set) ⇒ <code>undefined</code>
        * [.update(userMergeObj)](#Model+update) ⇒ <code>undefined</code>
        * [.refreshFromState()](#Model+refreshFromState) ⇒ <code>undefined</code>
        * [.delete()](#Model+delete) ⇒ <code>undefined</code>
        * ~~[.getNextState()](#Model+getNextState)~~
    * _static_
        * [.idAttribute](#Model.idAttribute) ⇒ <code>string</code>
        * [.query](#Model.query)
        * [.options()](#Model.options) ⇒ <code>Object</code>
        * [.markAccessed(ids)](#Model.markAccessed) ⇒ <code>undefined</code>
        * [.markFullTableScanned()](#Model.markFullTableScanned) ⇒ <code>undefined</code>
        * [.markAccessedIndexes(indexes)](#Model.markAccessedIndexes) ⇒ <code>undefined</code>
        * [.getQuerySet()](#Model.getQuerySet) ⇒ <code>Object</code>
        * [.invalidateClassCache()](#Model.invalidateClassCache) ⇒ <code>undefined</code>
        * [.create(userProps)](#Model.create) ⇒ [<code>Model</code>](#Model)
        * [.upsert(userProps)](#Model.upsert) ⇒ [<code>Model</code>](#Model)
        * [.withId(id)](#Model.withId) ⇒ [<code>Model</code>](#Model) \| <code>null</code>
        * [.idExists(id)](#Model.idExists) ⇒ <code>Boolean</code>
        * [.exists(lookupObj)](#Model.exists) ⇒ <code>Boolean</code>
        * [.get(lookupObj)](#Model.get) ⇒ [<code>Model</code>](#Model)
        * ~~[.hasId(id)](#Model.hasId) ⇒ <code>Boolean</code>~~

<a name="new_Model_new"></a>

### new Model(props)
Creates a Model instance from it's properties.
Don't use this to create a new record; Use the static method [Model#create](Model#create).


| Param | Type | Description |
| --- | --- | --- |
| props | <code>Object</code> | the properties to instantiate with |

<a name="Model+ref"></a>

### model.ref ⇒ <code>Object</code>
Returns a reference to the plain JS object in the store.
Make sure to not mutate this.

**Kind**: instance property of [<code>Model</code>](#Model)  
**Returns**: <code>Object</code> - a reference to the plain JS object in the store  
<a name="Model+getClass"></a>

### model.getClass() ⇒ [<code>Model</code>](#Model)
Gets the [Model](#Model) class or subclass constructor (the class that
instantiated this instance).

**Kind**: instance method of [<code>Model</code>](#Model)  
**Returns**: [<code>Model</code>](#Model) - The [Model](#Model) class or subclass constructor used to instantiate
                this instance.  
<a name="Model+getId"></a>

### model.getId() ⇒ <code>\*</code>
Gets the id value of the current instance by looking up the id attribute.

**Kind**: instance method of [<code>Model</code>](#Model)  
**Returns**: <code>\*</code> - The id value of the current instance.  
<a name="Model+toString"></a>

### model.toString() ⇒ <code>string</code>
Returns a string representation of the [Model](#Model) instance.

**Kind**: instance method of [<code>Model</code>](#Model)  
**Returns**: <code>string</code> - A string representation of this [Model](#Model) instance.  
<a name="Model+equals"></a>

### model.equals(otherModel) ⇒ <code>Boolean</code>
Returns a boolean indicating if `otherModel` equals this [Model](#Model) instance.
Equality is determined by shallow comparing their attributes.

This equality is used when you call [update](#Model+update).
You can prevent model updates by returning `true` here.
However, a model will always be updated if its relationships are changed.

**Kind**: instance method of [<code>Model</code>](#Model)  
**Returns**: <code>Boolean</code> - a boolean indicating if the [Model](#Model) instance's are equal.  

| Param | Type | Description |
| --- | --- | --- |
| otherModel | [<code>Model</code>](#Model) | a [Model](#Model) instance to compare |

<a name="Model+set"></a>

### model.set(propertyName, value) ⇒ <code>undefined</code>
Updates a property name to given value for this [Model](#Model) instance.
The values are immediately committed to the database.

**Kind**: instance method of [<code>Model</code>](#Model)  

| Param | Type | Description |
| --- | --- | --- |
| propertyName | <code>string</code> | name of the property to set |
| value | <code>\*</code> | value assigned to the property |

<a name="Model+update"></a>

### model.update(userMergeObj) ⇒ <code>undefined</code>
Assigns multiple fields and corresponding values to this [Model](#Model) instance.
The updates are immediately committed to the database.

**Kind**: instance method of [<code>Model</code>](#Model)  

| Param | Type | Description |
| --- | --- | --- |
| userMergeObj | <code>Object</code> | an object that will be merged with this instance. |

<a name="Model+refreshFromState"></a>

### model.refreshFromState() ⇒ <code>undefined</code>
Updates [Model](#Model) instance attributes to reflect the
database state in the current session.

**Kind**: instance method of [<code>Model</code>](#Model)  
<a name="Model+delete"></a>

### model.delete() ⇒ <code>undefined</code>
Deletes the record for this [Model](#Model) instance.
You'll still be able to access fields and values on the instance.

**Kind**: instance method of [<code>Model</code>](#Model)  
<a name="Model+getNextState"></a>

### ~~model.getNextState()~~
***Deprecated***

**Kind**: instance method of [<code>Model</code>](#Model)  
**Throws**:

- <code>Error</code> Due to deprecation.

<a name="Model.idAttribute"></a>

### Model.idAttribute ⇒ <code>string</code>
Returns the id attribute of this [Model](#Model).

**Kind**: static property of [<code>Model</code>](#Model)  
**Returns**: <code>string</code> - The id attribute of this [Model](#Model).  
<a name="Model.query"></a>

### Model.query
**Kind**: static property of [<code>Model</code>](#Model)  
**See**: [getQuerySet](#Model.getQuerySet)  
<a name="Model.options"></a>

### Model.options() ⇒ <code>Object</code>
Returns the options object passed to the database for the table that represents
this Model class.

Returns an empty object by default, which means the database
will use default options. You can either override this function to return the options
you want to use, or assign the options object as a static property of the same name to the
Model class.

**Kind**: static method of [<code>Model</code>](#Model)  
**Returns**: <code>Object</code> - the options object passed to the database for the table
                 representing this Model class.  
<a name="Model.markAccessed"></a>

### Model.markAccessed(ids) ⇒ <code>undefined</code>
Manually mark individual instances as accessed.
This allows invalidating selector memoization within mutable sessions.

**Kind**: static method of [<code>Model</code>](#Model)  

| Param | Type | Description |
| --- | --- | --- |
| ids | <code>Array.&lt;\*&gt;</code> | Array of primary key values |

<a name="Model.markFullTableScanned"></a>

### Model.markFullTableScanned() ⇒ <code>undefined</code>
Manually mark this model's table as scanned.
This allows invalidating selector memoization within mutable sessions.

**Kind**: static method of [<code>Model</code>](#Model)  
<a name="Model.markAccessedIndexes"></a>

### Model.markAccessedIndexes(indexes) ⇒ <code>undefined</code>
Manually mark indexes as accessed.
This allows invalidating selector memoization within mutable sessions.

**Kind**: static method of [<code>Model</code>](#Model)  

| Param | Type | Description |
| --- | --- | --- |
| indexes | <code>Array.&lt;Array.&lt;\*, \*&gt;&gt;</code> | Array of column-value pairs |

<a name="Model.getQuerySet"></a>

### Model.getQuerySet() ⇒ <code>Object</code>
Returns an instance of the model's `querySetClass` field.
By default, this will be an empty [QuerySet](#QuerySet).

**Kind**: static method of [<code>Model</code>](#Model)  
**Returns**: <code>Object</code> - An instance of the model's `querySetClass`.  
<a name="Model.invalidateClassCache"></a>

### Model.invalidateClassCache() ⇒ <code>undefined</code>
**Kind**: static method of [<code>Model</code>](#Model)  
<a name="Model.create"></a>

### Model.create(userProps) ⇒ [<code>Model</code>](#Model)
Creates a new record in the database, instantiates a [Model](#Model) and returns it.

If you pass values for many-to-many fields, instances are created on the through
model as well.

**Kind**: static method of [<code>Model</code>](#Model)  
**Returns**: [<code>Model</code>](#Model) - a new [Model](#Model) instance.  

| Param | Type | Description |
| --- | --- | --- |
| userProps | <code>props</code> | the new [Model](#Model)'s properties. |

<a name="Model.upsert"></a>

### Model.upsert(userProps) ⇒ [<code>Model</code>](#Model)
Creates a new or update existing record in the database, instantiates a [Model](#Model) and returns it.

If you pass values for many-to-many fields, instances are created on the through
model as well.

**Kind**: static method of [<code>Model</code>](#Model)  
**Returns**: [<code>Model</code>](#Model) - a [Model](#Model) instance.  

| Param | Type | Description |
| --- | --- | --- |
| userProps | <code>props</code> | the required [Model](#Model)'s properties. |

<a name="Model.withId"></a>

### Model.withId(id) ⇒ [<code>Model</code>](#Model) \| <code>null</code>
Returns a [Model](#Model) instance for the object with id `id`.
Returns `null` if the model has no instance with id `id`.

You can use [Model#idExists](Model#idExists) to check for existence instead.

**Kind**: static method of [<code>Model</code>](#Model)  
**Returns**: [<code>Model</code>](#Model) \| <code>null</code> - [Model](#Model) instance with id `id`  
**Throws**:

- If object with id `id` doesn't exist


| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | the `id` of the object to get |

<a name="Model.idExists"></a>

### Model.idExists(id) ⇒ <code>Boolean</code>
Returns a boolean indicating if an entity
with the id `id` exists in the state.

**Kind**: static method of [<code>Model</code>](#Model)  
**Returns**: <code>Boolean</code> - a boolean indicating if entity with `id` exists in the state  
**Since**: 0.11.0  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | a value corresponding to the id attribute of the [Model](#Model) class. |

<a name="Model.exists"></a>

### Model.exists(lookupObj) ⇒ <code>Boolean</code>
Returns a boolean indicating if an entity
with the given props exists in the state.

**Kind**: static method of [<code>Model</code>](#Model)  
**Returns**: <code>Boolean</code> - a boolean indicating if entity with `props` exists in the state  

| Param | Type | Description |
| --- | --- | --- |
| lookupObj | <code>\*</code> | a key-value that [Model](#Model) instances should have to be considered as existing. |

<a name="Model.get"></a>

### Model.get(lookupObj) ⇒ [<code>Model</code>](#Model)
Gets the [Model](#Model) instance that matches properties in `lookupObj`.
Throws an error if [Model](#Model) if multiple records match
the properties.

**Kind**: static method of [<code>Model</code>](#Model)  
**Returns**: [<code>Model</code>](#Model) - a [Model](#Model) instance that matches the properties in `lookupObj`.  
**Throws**:

- <code>Error</code> If more than one entity matches the properties in `lookupObj`.


| Param | Type | Description |
| --- | --- | --- |
| lookupObj | <code>Object</code> | the properties used to match a single entity. |

<a name="Model.hasId"></a>

### ~~Model.hasId(id) ⇒ <code>Boolean</code>~~
***Deprecated***

Returns a boolean indicating if an entity
with the id `id` exists in the state.

**Kind**: static method of [<code>Model</code>](#Model)  
**Returns**: <code>Boolean</code> - a boolean indicating if entity with `id` exists in the state  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | a value corresponding to the id attribute of the [Model](#Model) class. |

