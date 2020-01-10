---
id: QuerySet
title: QuerySet
sidebar_label: QuerySet
hide_title: true
---

<a name="QuerySet"></a>

#  QuerySet

<p>This class is used to build and make queries to the database<br>
and operating the resulting set (such as updating attributes<br>
or deleting the records).</p>
<p>The queries are built lazily. For example:</p>
<pre class="prettyprint source lang-javascript"><code>const qs = Book.all()
    .filter(book => book.releaseYear > 1999)
    .orderBy('name');
</code></pre>
<p>Doesn't execute a query. The query is executed only when<br>
you need information from the query result, such as [count](#QuerySet+count),<br>
[toRefArray](#QuerySet+toRefArray). After the query is executed, the resulting<br>
set is cached in the QuerySet instance.</p>
<p>QuerySet instances also return copies, so chaining filters doesn't<br>
mutate the previous instances.</p>

**Kind**: global class  

* [QuerySet](#.QuerySet)
    * [`new QuerySet(modelClass, clauses, [opts])`](#.QuerySet)
    * ~~[`withModels`](#queryset+withModels)~~
    * ~~[`withRefs`](#queryset+withRefs)~~
    * [`toRefArray()`](#queryset+toRefArray) ⇒ Array.<Object>
    * [`toModelArray()`](#queryset+toModelArray) ⇒ Array.<Model>
    * [`count()`](#queryset+count) ⇒ number
    * [`exists()`](#queryset+exists) ⇒ Boolean
    * [`at(index)`](#queryset+at) ⇒ Model ⎮ undefined
    * [`first()`](#queryset+first) ⇒ Model
    * [`last()`](#queryset+last) ⇒ Model
    * [`all()`](#queryset+all) ⇒ QuerySet
    * [`filter(lookupObj)`](#queryset+filter) ⇒ QuerySet
    * [`exclude(lookupObj)`](#queryset+exclude) ⇒ QuerySet
    * [`orderBy(iteratees, [orders])`](#queryset+orderBy) ⇒ QuerySet
    * [`update(mergeObj)`](#queryset+update) ⇒ undefined
    * [`delete()`](#queryset+delete) ⇒ undefined
    * ~~[`map()`](#queryset+map)~~
    * ~~[`forEach()`](#queryset+forEach)~~


<a name="QuerySet"></a>

## `new  QuerySet(modelClass, clauses, [opts])`

<p>Creates a QuerySet. The constructor is mainly for internal use;<br>
You should access QuerySet instances from [Model](Model).</p>


| Param | Type | Description |
| --- | --- | --- |
| modelClass | [Model](#.Model) | <p>the model class of objects in this QuerySet.</p> |
| clauses | Array.<any> | <p>query clauses needed to evaluate the set.</p> |
| [opts] | Object | <p>additional options</p> |


<a name="queryset+withModels"></a>

## ~~` withModels`~~

***Deprecated***

**Kind**: instance property of [QuerySet](#.QuerySet)  

<a name="queryset+withRefs"></a>

## ~~` withRefs`~~

***Deprecated***

**Kind**: instance property of [QuerySet](#.QuerySet)  

<a name="queryset+toRefArray"></a>

## ` toRefArray()`⇒ Array.&lt;Object&gt; 

<p>Returns an array of the plain objects represented by the QuerySet.<br>
The plain objects are direct references to the store.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: Array.<Object> - <p>references to the plain JS objects represented by<br>
the QuerySet</p>  

<a name="queryset+toModelArray"></a>

## ` toModelArray()`⇒ Array.&lt;Model&gt; 

<p>Returns an array of [Model](Model) instances represented by the QuerySet.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: Array.<Model> - <p>model instances represented by the QuerySet</p>  

<a name="queryset+count"></a>

## ` count()`⇒ number 

<p>Returns the number of [Model](Model) instances represented by the QuerySet.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: number - <p>length of the QuerySet</p>  

<a name="queryset+exists"></a>

## ` exists()`⇒ Boolean 

<p>Checks if the [QuerySet](#QuerySet) instance has any records matching the query<br>
in the database.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: Boolean - <p><code>true</code> if the [QuerySet](#QuerySet) instance contains entities, else <code>false</code>.</p>  

<a name="queryset+at"></a>

## ` at(index)`⇒ Model,undefined 

<p>Returns the [Model](Model) instance at index <code>index</code> in the [QuerySet](#QuerySet) instance if<br>
<code>withRefs</code> flag is set to <code>false</code>, or a reference to the plain JavaScript<br>
object in the model state if <code>true</code>.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: [Model](#.Model) ⎮ undefined - <p>a [Model](Model) instance at index<br>
<code>index</code> in the [QuerySet](#QuerySet) instance,<br>
or undefined if the index is out of bounds.</p>  

| Param | Type | Description |
| --- | --- | --- |
| index | number | <p>index of the model instance to get</p> |


<a name="queryset+first"></a>

## ` first()`⇒ Model 

<p>Returns the [Model](Model) instance at index 0 in the [QuerySet](#QuerySet) instance.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  

<a name="queryset+last"></a>

## ` last()`⇒ Model 

<p>Returns the [Model](Model) instance at index <code>QuerySet.count() - 1</code></p>

**Kind**: instance method of [QuerySet](#.QuerySet)  

<a name="queryset+all"></a>

## ` all()`⇒ QuerySet 

<p>Returns a new [QuerySet](#QuerySet) instance with the same entities.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: [QuerySet](#.QuerySet) - <p>a new QuerySet with the same entities.</p>  

<a name="queryset+filter"></a>

## ` filter(lookupObj)`⇒ QuerySet 

<p>Returns a new [QuerySet](#QuerySet) instance with entities that match properties in <code>lookupObj</code>.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: [QuerySet](#.QuerySet) - <p>a new [QuerySet](#QuerySet) instance with objects that passed the filter.</p>  

| Param | Type | Description |
| --- | --- | --- |
| lookupObj | Object | <p>the properties to match objects with. Can also be a function.<br> It works the same as <a href="https://lodash.com/docs/#filter">Lodash filter</a>.</p> |


<a name="queryset+exclude"></a>

## ` exclude(lookupObj)`⇒ QuerySet 

<p>Returns a new [QuerySet](#QuerySet) instance with entities that do not match<br>
properties in <code>lookupObj</code>.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: [QuerySet](#.QuerySet) - <p>a new [QuerySet](#QuerySet) instance with objects that did not pass the filter.</p>  

| Param | Type | Description |
| --- | --- | --- |
| lookupObj | Object | <p>the properties to unmatch objects with. Can also be a function.<br> It works the same as <a href="https://lodash.com/docs/#reject">Lodash reject</a>.</p> |


<a name="queryset+orderBy"></a>

## ` orderBy(iteratees, [orders])`⇒ QuerySet 

<p>Returns a new [QuerySet](#QuerySet) instance with entities ordered by <code>iteratees</code> in ascending<br>
order, unless otherwise specified. Delegates to <a href="https://lodash.com/docs/#orderBy">Lodash orderBy</a>.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  
**Returns**: [QuerySet](#.QuerySet) - <p>a new [QuerySet](#QuerySet) with objects ordered by <code>iteratees</code>.</p>  

| Param | Type | Description |
| --- | --- | --- |
| iteratees | Array.<string> ⎮ Array.<function()> | <p>an array where each item can be a string or a<br> function. If a string is supplied, it should<br> correspond to property on the entity that will<br> determine the order. If a function is supplied,<br> it should return the value to order by.</p> |
| [orders] | Array.<(Boolean|'asc'|'desc')> | <p>the sort orders of <code>iteratees</code>. If unspecified, all iteratees<br> will be sorted in ascending order. <code>true</code> and <code>'asc'</code><br> correspond to ascending order, and <code>false</code> and <code>'desc'</code><br> to descending order.</p> |


<a name="queryset+update"></a>

## ` update(mergeObj)`⇒ undefined 

<p>Records an update specified with <code>mergeObj</code> to all the objects<br>
in the [QuerySet](#QuerySet) instance.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  

| Param | Type | Description |
| --- | --- | --- |
| mergeObj | Object | <p>an object to merge with all the objects in this<br> queryset.</p> |


<a name="queryset+delete"></a>

## ` delete()`⇒ undefined 

<p>Records a deletion of all the objects in this [QuerySet](#QuerySet) instance.</p>

**Kind**: instance method of [QuerySet](#.QuerySet)  

<a name="queryset+map"></a>

## ~~` map()`~~

***Deprecated***

**Kind**: instance method of [QuerySet](#.QuerySet)  

<a name="queryset+forEach"></a>

## ~~` forEach()`~~

***Deprecated***

**Kind**: instance method of [QuerySet](#.QuerySet)  

