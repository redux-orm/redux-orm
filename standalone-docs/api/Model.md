---
id: Model
title: Model
sidebar_label: Model
hide_title: true
---

<a name="Model"></a>

#  Model

<p>The heart of an ORM, the data model.</p>
<p>The fields you specify to the Model will be used to generate<br>
a schema to the database, related property accessors, and<br>
possibly through models.</p>
<p>In each [Session](Session) you instantiate from an [ORM](ORM) instance,<br>
you will receive a session-specific subclass of this Model. The methods<br>
you define here will be available to you in sessions.</p>
<p>An instance of [Model](#Model) represents a record in the database, though<br>
it is possible to generate multiple instances from the same record in the database.</p>
<p>To create data models in your schema, subclass [Model](#Model). To define<br>
information about the data model, override static class methods. Define instance<br>
logic by defining prototype methods (without <code>static</code> keyword).</p>

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

<p>Creates a Model instance from it's properties.<br>
Don't use this to create a new record; Use the static method [Model#create](Model#create).</p>


| Param | Type | Description |
| --- | --- | --- |
| props | Object | <p>the properties to instantiate with</p> |


<a name="model+ref"></a>

## ` ref`⇒ Object 

<p>Returns a reference to the plain JS object in the store.<br>
It contains all the properties that you pass when creating the model,<br>
except for primary keys of many-to-many relationships with a custom accessor.</p>
<p>Make sure never to mutate this.</p>

**Kind**: instance property of [Model](#.Model)  
**Returns**: Object - <p>a reference to the plain JS object in the store</p>  

<a name="model+getClass"></a>

## ` getClass()`⇒ Model 

<p>Gets the [Model](#Model) class or subclass constructor (the class that<br>
instantiated this instance).</p>

**Kind**: instance method of [Model](#.Model)  
**Returns**: [Model](#.Model) - <p>The [Model](#Model) class or subclass constructor used to instantiate<br>
this instance.</p>  

<a name="model+getId"></a>

## ` getId()`⇒ * 

<p>Gets the id value of the current instance by looking up the id attribute.</p>

**Kind**: instance method of [Model](#.Model)  
**Returns**: * - <p>The id value of the current instance.</p>  

<a name="model+toString"></a>

## ` toString()`⇒ string 

<p>Returns a string representation of the [Model](#Model) instance.</p>

**Kind**: instance method of [Model](#.Model)  
**Returns**: string - <p>A string representation of this [Model](#Model) instance.</p>  

<a name="model+equals"></a>

## ` equals(otherModel)`⇒ Boolean 

<p>Returns a boolean indicating if <code>otherModel</code> equals this [Model](#Model) instance.<br>
Equality is determined by shallow comparing their attributes.</p>
<p>This equality is used when you call [update](#Model+update).<br>
You can prevent model updates by returning <code>true</code> here.<br>
However, a model will always be updated if its relationships are changed.</p>

**Kind**: instance method of [Model](#.Model)  
**Returns**: Boolean - <p>a boolean indicating if the [Model](#Model) instance's are equal.</p>  

| Param | Type | Description |
| --- | --- | --- |
| otherModel | [Model](#.Model) | <p>a [Model](#Model) instance to compare</p> |


<a name="model+set"></a>

## ` set(propertyName, value)`⇒ undefined 

<p>Updates a property name to given value for this [Model](#Model) instance.<br>
The values are immediately committed to the database.</p>

**Kind**: instance method of [Model](#.Model)  

| Param | Type | Description |
| --- | --- | --- |
| propertyName | string | <p>name of the property to set</p> |
| value | * | <p>value assigned to the property</p> |


<a name="model+update"></a>

## ` update(userMergeObj)`⇒ undefined 

<p>Assigns multiple fields and corresponding values to this [Model](#Model) instance.<br>
The updates are immediately committed to the database.</p>

**Kind**: instance method of [Model](#.Model)  

| Param | Type | Description |
| --- | --- | --- |
| userMergeObj | Object | <p>an object that will be merged with this instance.</p> |


<a name="model+refreshFromState"></a>

## ` refreshFromState()`⇒ undefined 

<p>Updates [Model](#Model) instance attributes to reflect the<br>
database state in the current session.</p>

**Kind**: instance method of [Model](#.Model)  

<a name="model+delete"></a>

## ` delete()`⇒ undefined 

<p>Deletes the record for this [Model](#Model) instance.<br>
You'll still be able to access fields and values on the instance.</p>

**Kind**: instance method of [Model](#.Model)  

<a name="model+getNextState"></a>

## ~~` getNextState()`~~

***Deprecated***

**Kind**: instance method of [Model](#.Model)  
**Throws**:

- Error <p>Due to deprecation.</p>


<a name="Model.idAttribute"></a>

## `static  idAttribute`⇒ string 

<p>Returns the id attribute of this [Model](#Model).</p>

**Kind**: static property of [Model](#.Model)  
**Returns**: string - <p>The id attribute of this [Model](#Model).</p>  

<a name="Model.query"></a>

## `static  query`

**Kind**: static property of [Model](#.Model)  
**See**: {@link Model.getQuerySet}

<a name="Model.options"></a>

## `static  options()`⇒ Object 

<p>Returns the options object passed to the database for the table that represents<br>
this Model class.</p>
<p>Returns an empty object by default, which means the database<br>
will use default options. You can either override this function to return the options<br>
you want to use, or assign the options object as a static property of the same name to the<br>
Model class.</p>

**Kind**: static method of [Model](#.Model)  
**Returns**: Object - <p>the options object passed to the database for the table<br>
representing this Model class.</p>  

<a name="Model.markAccessed"></a>

## `static  markAccessed(ids)`⇒ undefined 

<p>Manually mark individual instances as accessed.<br>
This allows invalidating selector memoization within mutable sessions.</p>

**Kind**: static method of [Model](#.Model)  

| Param | Type | Description |
| --- | --- | --- |
| ids | Array.<*> | <p>Array of primary key values</p> |


<a name="Model.markFullTableScanned"></a>

## `static  markFullTableScanned()`⇒ undefined 

<p>Manually mark this model's table as scanned.<br>
This allows invalidating selector memoization within mutable sessions.</p>

**Kind**: static method of [Model](#.Model)  

<a name="Model.markAccessedIndexes"></a>

## `static  markAccessedIndexes(indexes)`⇒ undefined 

<p>Manually mark indexes as accessed.<br>
This allows invalidating selector memoization within mutable sessions.</p>

**Kind**: static method of [Model](#.Model)  

| Param | Type | Description |
| --- | --- | --- |
| indexes | Array.<Array.<*, *>> | <p>Array of column-value pairs</p> |


<a name="Model.getQuerySet"></a>

## `static  getQuerySet()`⇒ Object 

<p>Returns an instance of the model's <code>querySetClass</code> field.<br>
By default, this will be an empty [QuerySet](QuerySet).</p>

**Kind**: static method of [Model](#.Model)  
**Returns**: Object - <p>An instance of the model's <code>querySetClass</code>.</p>  

<a name="Model.invalidateClassCache"></a>

## `static  invalidateClassCache()`⇒ undefined 

**Kind**: static method of [Model](#.Model)  

<a name="Model.create"></a>

## `static  create(userProps)`⇒ Model 

<p>Creates a new record in the database, instantiates a [Model](#Model) and returns it.</p>
<p>If you pass values for many-to-many fields, instances are created on the through<br>
model as well.</p>

**Kind**: static method of [Model](#.Model)  
**Returns**: [Model](#.Model) - <p>a new [Model](#Model) instance.</p>  

| Param | Type | Description |
| --- | --- | --- |
| userProps | Object | <p>the new [Model](#Model)'s properties.</p> |


<a name="Model.upsert"></a>

## `static  upsert(userProps)`⇒ Model 

<p>Creates a new or update existing record in the database, instantiates a [Model](#Model) and returns it.</p>
<p>If you pass values for many-to-many fields, instances are created on the through<br>
model as well.</p>

**Kind**: static method of [Model](#.Model)  
**Returns**: [Model](#.Model) - <p>a [Model](#Model) instance.</p>  

| Param | Type | Description |
| --- | --- | --- |
| userProps | Object | <p>the required [Model](#Model)'s properties.</p> |


<a name="Model.withId"></a>

## `static  withId(id)`⇒ Model,null 

<p>Returns a [Model](#Model) instance for the object with id <code>id</code>.<br>
Returns <code>null</code> if the model has no instance with id <code>id</code>.</p>
<p>You can use [Model#idExists](Model#idExists) to check for existence instead.</p>

**Kind**: static method of [Model](#.Model)  
**Returns**: [Model](#.Model) ⎮ null - <p>[Model](#Model) instance with id <code>id</code></p>  
**Throws**:

- <p>If object with id <code>id</code> doesn't exist</p>


| Param | Type | Description |
| --- | --- | --- |
| id | * | <p>the <code>id</code> of the object to get</p> |


<a name="Model.idExists"></a>

## `static  idExists(id)`⇒ Boolean 

<p>Returns a boolean indicating if an entity<br>
with the id <code>id</code> exists in the state.</p>

**Kind**: static method of [Model](#.Model)  
**Returns**: Boolean - <p>a boolean indicating if entity with <code>id</code> exists in the state</p>  
**Since**: 0.11.0  

| Param | Type | Description |
| --- | --- | --- |
| id | * | <p>a value corresponding to the id attribute of the [Model](#Model) class.</p> |


<a name="Model.exists"></a>

## `static  exists(props)`⇒ Boolean 

<p>Returns a boolean indicating if an entity<br>
with the given props exists in the state.</p>

**Kind**: static method of [Model](#.Model)  
**Returns**: Boolean - <p>a boolean indicating if entity with <code>props</code> exists in the state</p>  

| Param | Type | Description |
| --- | --- | --- |
| props | * | <p>a key-value that [Model](#Model) instances should have to be considered as existing.</p> |


<a name="Model.get"></a>

## `static  get(lookupObj)`⇒ Model 

<p>Gets the [Model](#Model) instance that matches properties in <code>lookupObj</code>.<br>
Throws an error if [Model](#Model) if multiple records match<br>
the properties.</p>

**Kind**: static method of [Model](#.Model)  
**Returns**: [Model](#.Model) - <p>a [Model](#Model) instance that matches the properties in <code>lookupObj</code>.</p>  
**Throws**:

- Error <p>If more than one entity matches the properties in <code>lookupObj</code>.</p>


| Param | Type | Description |
| --- | --- | --- |
| lookupObj | Object | <p>the properties used to match a single entity.</p> |


<a name="Model.hasId"></a>

## ~~`static  hasId(id)`⇒ Boolean ~~

***Deprecated***

<p>Returns a boolean indicating if an entity<br>
with the id <code>id</code> exists in the state.</p>

**Kind**: static method of [Model](#.Model)  
**Returns**: Boolean - <p>a boolean indicating if entity with <code>id</code> exists in the state</p>  

| Param | Type | Description |
| --- | --- | --- |
| id | * | <p>a value corresponding to the id attribute of the [Model](#Model) class.</p> |


