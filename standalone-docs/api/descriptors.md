---
id: module_descriptors
title: Descriptors
sidebar_label: Descriptors
hide_title: true
---

<a name="module:descriptors"></a>

#  descriptors

<p>The functions in this file return custom JS property descriptors<br>
that are supposed to be assigned to Model fields.</p>
<p>Some include the logic to look up models using foreign keys and<br>
to add or remove relationships between models.</p>


* [descriptors](#.descriptors)
    * [`attrDescriptor(fieldName)`](#descriptors.attrDescriptor)
    * [`forwardsManyToOneDescriptor(fieldName, declaredToModelName)`](#descriptors.forwardsManyToOneDescriptor)
    * [`forwardsOneToOneDescriptor()`](#descriptors.forwardsOneToOneDescriptor)
    * [`backwardsOneToOneDescriptor(declaredFieldName, declaredFromModelName)`](#descriptors.backwardsOneToOneDescriptor)
    * [`backwardsManyToOneDescriptor()`](#descriptors.backwardsManyToOneDescriptor)
    * [`manyToManyDescriptor()`](#descriptors.manyToManyDescriptor)


<a name="module:descriptors~attrDescriptor"></a>

## ` attrDescriptor(fieldName)`

<p>Defines a basic non-key attribute.</p>

**Kind**: inner method of [descriptors](#.descriptors)  

| Param | Type | Description |
| --- | --- | --- |
| fieldName | string | <p>the name of the field the descriptor will be assigned to.</p> |


<a name="module:descriptors~forwardsManyToOneDescriptor"></a>

## ` forwardsManyToOneDescriptor(fieldName, declaredToModelName)`

<p>Forwards direction of a Foreign Key: returns one object.<br>
Also works as [forwardsOneToOneDescriptor](.forwardsOneToOneDescriptor).</p>
<p>For <code>book.author</code> referencing an <code>Author</code> model instance,<br>
<code>fieldName</code> would be <code>'author'</code> and <code>declaredToModelName</code> would be <code>'Author'</code>.</p>

**Kind**: inner method of [descriptors](#.descriptors)  

| Param | Type | Description |
| --- | --- | --- |
| fieldName | string | <p>the name of the field the descriptor will be assigned to.</p> |
| declaredToModelName | string | <p>the name of the model that the field references.</p> |


<a name="module:descriptors~forwardsOneToOneDescriptor"></a>

## ` forwardsOneToOneDescriptor()`

<p>Dereferencing foreign keys in [oneToOne](module:fields.oneToOne)<br>
relationships works the same way as in many-to-one relationships:<br>
just look up the related model.</p>
<p>For example, a human face tends to have a single nose.<br>
So if we want to resolve <code>face.nose</code>, we need to<br>
look up the <code>Nose</code> that has the primary key that <code>face</code> references.</p>

**Kind**: inner method of [descriptors](#.descriptors)  
**See**: {@link module:descriptors~forwardsManyToOneDescriptor|forwardsManyToOneDescriptor}

<a name="module:descriptors~backwardsOneToOneDescriptor"></a>

## ` backwardsOneToOneDescriptor(declaredFieldName, declaredFromModelName)`

<p>Here we resolve 1-to-1 relationships starting at the model on which the<br>
field was not installed. This means we need to find the instance of the<br>
other model whose [oneToOne](module:fields.oneToOne) FK field contains the current model's primary key.</p>

**Kind**: inner method of [descriptors](#.descriptors)  

| Param | Type | Description |
| --- | --- | --- |
| declaredFieldName | string | <p>the name of the field referencing the current model.</p> |
| declaredFromModelName | string | <p>the name of the other model.</p> |


<a name="module:descriptors~backwardsManyToOneDescriptor"></a>

## ` backwardsManyToOneDescriptor()`

<p>The backwards direction of a n-to-1 relationship (i.e. 1-to-n),<br>
meaning this will return an a collection (<code>QuerySet</code>) of model instances.</p>
<p>An example would be <code>author.books</code> referencing all instances of<br>
the <code>Book</code> model that reference the author using <code>fk()</code>.</p>

**Kind**: inner method of [descriptors](#.descriptors)  

<a name="module:descriptors~manyToManyDescriptor"></a>

## ` manyToManyDescriptor()`

<p>This descriptor is assigned to both sides of a many-to-many relationship.<br>
To indicate the backwards direction pass <code>true</code> for <code>reverse</code>.</p>

**Kind**: inner method of [descriptors](#.descriptors)  

