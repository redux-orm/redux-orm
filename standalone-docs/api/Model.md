---
id: Model
title: Model
sidebar_label: Model
hide_title: true
---

<a name="Model"></a>

#  Model

The heart of an ORM, the data model.

The fields you specify to the Model will be used to generate
a schema to the database, related property accessors, and
possibly through models.

In each [Session](Session) you instantiate from an [ORM](ORM) instance,
you will receive a session-specific subclass of this Model. The methods
you define here will be available to you in sessions.

An instance of [Model](#Model) represents a record in the database, though
it is possible to generate multiple instances from the same record in the database.

To create data models in your schema, subclass [Model](#Model). To define
information about the data model, override static class methods. Define instance
logic by defining prototype methods (without `static` keyword).

**Kind**: global class  

* [Model](#.Model)
    * [`new Model(props)`](#.Model)
    * _instance_
        * [`ref`](#model+ref) ⇒ Object
        * [`getClass()`](#model+getClass) ⇒ Model
        * [`getId()`](#model+getId) ⇒ *
        * [`toString()`](#model+toString) ⇒ string
        * [`equals(otherModel)`](#model+equals) ⇒ Boolean
        * [`set(propertyName, value)`](#model+set) ⇒ undefined
        * [`update(userMergeObj)`](#model+update) ⇒ undefined
        * [`refreshFromState()`](#model+refreshFromState) ⇒ undefined
        * [`delete()`](#model+delete) ⇒ undefined
        * ~~[`getNextState()`](#model+getNextState)~~
    * _static_
        * [`idAttribute`](#Model.idAttribute) ⇒ string
        * [`query`](#Model.query)
        * [`options()`](#Model.options) ⇒ Object
        * [`markAccessed(ids)`](#Model.markAccessed) ⇒ undefined
        * [`markFullTableScanned()`](#Model.markFullTableScanned) ⇒ undefined
        * [`markAccessedIndexes(indexes)`](#Model.markAccessedIndexes) ⇒ undefined
        * [`getQuerySet()`](#Model.getQuerySet) ⇒ Object
        * [`invalidateClassCache()`](#Model.invalidateClassCache) ⇒ undefined
        * [`create(userProps)`](#Model.create) ⇒ Model
        * [`upsert(userProps)`](#Model.upsert) ⇒ Model
        * [`withId(id)`](#Model.withId) ⇒ Model ⎮ null
        * [`idExists(id)`](#Model.idExists) ⇒ Boolean
        * [`exists(props)`](#Model.exists) ⇒ Boolean
        * [`get(lookupObj)`](#Model.get) ⇒ Model
        * ~~[`hasId(id)`](#Model.hasId) ⇒ Boolean~~


<a name="Model"></a>

## `new  Model(props)`

Creates a Model instance from it's properties.
Don't use this to create a new record; Use the static method [Model#create](Model#create).


| Param | Type | Description |
| --- | --- | --- |
| props | Object | the properties to instantiate with |


<a name="model+ref"></a>

## ` ref`⇒ Object 

Returns a reference to the plain JS object in the store.
Make sure to not mutate this.

**Kind**: instance property of [Model](#.Model)  
**Returns**: Object - a reference to the plain JS object in the store  

<a name="model+getClass"></a>

## ` getClass()`⇒ Model 

Gets the [Model](#Model) class or subclass constructor (the class that
instantiated this instance).

**Kind**: instance method of [Model](#.Model)  
**Returns**: [Model](#.Model) - The [Model](#Model) class or subclass constructor used to instantiate
                this instance.  

<a name="model+getId"></a>

## ` getId()`⇒ * 

Gets the id value of the current instance by looking up the id attribute.

**Kind**: instance method of [Model](#.Model)  
**Returns**: * - The id value of the current instance.  

<a name="model+toString"></a>

## ` toString()`⇒ string 

Returns a string representation of the [Model](#Model) instance.

**Kind**: instance method of [Model](#.Model)  
**Returns**: string - A string representation of this [Model](#Model) instance.  

<a name="model+equals"></a>

## ` equals(otherModel)`⇒ Boolean 

Returns a boolean indicating if `otherModel` equals this [Model](#Model) instance.
Equality is determined by shallow comparing their attributes.

This equality is used when you call [update](#Model+update).
You can prevent model updates by returning `true` here.
However, a model will always be updated if its relationships are changed.

**Kind**: instance method of [Model](#.Model)  
**Returns**: Boolean - a boolean indicating if the [Model](#Model) instance's are equal.  

| Param | Type | Description |
| --- | --- | --- |
| otherModel | [Model](#.Model) | a [Model](#Model) instance to compare |


<a name="model+set"></a>

## ` set(propertyName, value)`⇒ undefined 

Updates a property name to given value for this [Model](#Model) instance.
The values are immediately committed to the database.

**Kind**: instance method of [Model](#.Model)  

| Param | Type | Description |
| --- | --- | --- |
| propertyName | string | name of the property to set |
| value | * | value assigned to the property |


<a name="model+update"></a>

## ` update(userMergeObj)`⇒ undefined 

Assigns multiple fields and corresponding values to this [Model](#Model) instance.
The updates are immediately committed to the database.

**Kind**: instance method of [Model](#.Model)  

| Param | Type | Description |
| --- | --- | --- |
| userMergeObj | Object | an object that will be merged with this instance. |


<a name="model+refreshFromState"></a>

## ` refreshFromState()`⇒ undefined 

Updates [Model](#Model) instance attributes to reflect the
database state in the current session.

**Kind**: instance method of [Model](#.Model)  

<a name="model+delete"></a>

## ` delete()`⇒ undefined 

Deletes the record for this [Model](#Model) instance.
You'll still be able to access fields and values on the instance.

**Kind**: instance method of [Model](#.Model)  

<a name="model+getNextState"></a>

## ~~` getNextState()`~~

***Deprecated***

**Kind**: instance method of [Model](#.Model)  
**Throws**:

- Error Due to deprecation.


<a name="Model.idAttribute"></a>

## `static  idAttribute`⇒ string 

Returns the id attribute of this [Model](#Model).

**Kind**: static property of [Model](#.Model)  
**Returns**: string - The id attribute of this [Model](#Model).  

<a name="Model.query"></a>

## `static  query`

**Kind**: static property of [Model](#.Model)  
**See**: {@link Model.getQuerySet}

<a name="Model.options"></a>

## `static  options()`⇒ Object 

Returns the options object passed to the database for the table that represents
this Model class.

Returns an empty object by default, which means the database
will use default options. You can either override this function to return the options
you want to use, or assign the options object as a static property of the same name to the
Model class.

**Kind**: static method of [Model](#.Model)  
**Returns**: Object - the options object passed to the database for the table
                 representing this Model class.  

<a name="Model.markAccessed"></a>

## `static  markAccessed(ids)`⇒ undefined 

Manually mark individual instances as accessed.
This allows invalidating selector memoization within mutable sessions.

**Kind**: static method of [Model](#.Model)  

| Param | Type | Description |
| --- | --- | --- |
| ids | Array.<*> | Array of primary key values |


<a name="Model.markFullTableScanned"></a>

## `static  markFullTableScanned()`⇒ undefined 

Manually mark this model's table as scanned.
This allows invalidating selector memoization within mutable sessions.

**Kind**: static method of [Model](#.Model)  

<a name="Model.markAccessedIndexes"></a>

## `static  markAccessedIndexes(indexes)`⇒ undefined 

Manually mark indexes as accessed.
This allows invalidating selector memoization within mutable sessions.

**Kind**: static method of [Model](#.Model)  

| Param | Type | Description |
| --- | --- | --- |
| indexes | Array.<Array.<*, *>> | Array of column-value pairs |


<a name="Model.getQuerySet"></a>

## `static  getQuerySet()`⇒ Object 

Returns an instance of the model's `querySetClass` field.
By default, this will be an empty [QuerySet](QuerySet).

**Kind**: static method of [Model](#.Model)  
**Returns**: Object - An instance of the model's `querySetClass`.  

<a name="Model.invalidateClassCache"></a>

## `static  invalidateClassCache()`⇒ undefined 

**Kind**: static method of [Model](#.Model)  

<a name="Model.create"></a>

## `static  create(userProps)`⇒ Model 

Creates a new record in the database, instantiates a [Model](#Model) and returns it.

If you pass values for many-to-many fields, instances are created on the through
model as well.

**Kind**: static method of [Model](#.Model)  
**Returns**: [Model](#.Model) - a new [Model](#Model) instance.  

| Param | Type | Description |
| --- | --- | --- |
| userProps | props | the new [Model](#Model)'s properties. |


<a name="Model.upsert"></a>

## `static  upsert(userProps)`⇒ Model 

Creates a new or update existing record in the database, instantiates a [Model](#Model) and returns it.

If you pass values for many-to-many fields, instances are created on the through
model as well.

**Kind**: static method of [Model](#.Model)  
**Returns**: [Model](#.Model) - a [Model](#Model) instance.  

| Param | Type | Description |
| --- | --- | --- |
| userProps | props | the required [Model](#Model)'s properties. |


<a name="Model.withId"></a>

## `static  withId(id)`⇒ Model,null 

Returns a [Model](#Model) instance for the object with id `id`.
Returns `null` if the model has no instance with id `id`.

You can use [Model#idExists](Model#idExists) to check for existence instead.

**Kind**: static method of [Model](#.Model)  
**Returns**: [Model](#.Model) ⎮ null - [Model](#Model) instance with id `id`  
**Throws**:

- If object with id `id` doesn't exist


| Param | Type | Description |
| --- | --- | --- |
| id | * | the `id` of the object to get |


<a name="Model.idExists"></a>

## `static  idExists(id)`⇒ Boolean 

Returns a boolean indicating if an entity
with the id `id` exists in the state.

**Kind**: static method of [Model](#.Model)  
**Returns**: Boolean - a boolean indicating if entity with `id` exists in the state  
**Since**: 0.11.0  

| Param | Type | Description |
| --- | --- | --- |
| id | * | a value corresponding to the id attribute of the [Model](#Model) class. |


<a name="Model.exists"></a>

## `static  exists(props)`⇒ Boolean 

Returns a boolean indicating if an entity
with the given props exists in the state.

**Kind**: static method of [Model](#.Model)  
**Returns**: Boolean - a boolean indicating if entity with `props` exists in the state  

| Param | Type | Description |
| --- | --- | --- |
| props | * | a key-value that [Model](#Model) instances should have to be considered as existing. |


<a name="Model.get"></a>

## `static  get(lookupObj)`⇒ Model 

Gets the [Model](#Model) instance that matches properties in `lookupObj`.
Throws an error if [Model](#Model) if multiple records match
the properties.

**Kind**: static method of [Model](#.Model)  
**Returns**: [Model](#.Model) - a [Model](#Model) instance that matches the properties in `lookupObj`.  
**Throws**:

- Error If more than one entity matches the properties in `lookupObj`.


| Param | Type | Description |
| --- | --- | --- |
| lookupObj | Object | the properties used to match a single entity. |


<a name="Model.hasId"></a>

## ~~`static  hasId(id)`⇒ Boolean ~~

***Deprecated***

Returns a boolean indicating if an entity
with the id `id` exists in the state.

**Kind**: static method of [Model](#.Model)  
**Returns**: Boolean - a boolean indicating if entity with `id` exists in the state  

| Param | Type | Description |
| --- | --- | --- |
| id | * | a value corresponding to the id attribute of the [Model](#Model) class. |


