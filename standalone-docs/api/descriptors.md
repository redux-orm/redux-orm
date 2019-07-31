---
id: module_descriptors
title: Descriptors
sidebar_label: Descriptors
hide_title: true
---

<a name="module:descriptors"></a>

#  descriptors

The functions in this file return custom JS property descriptors
that are supposed to be assigned to Model fields.

Some include the logic to look up models using foreign keys and
to add or remove relationships between models.


* [descriptors](#.descriptors)
    * [`attrDescriptor(fieldName)`](#descriptors.attrDescriptor)
    * [`forwardsManyToOneDescriptor(fieldName, declaredToModelName)`](#descriptors.forwardsManyToOneDescriptor)
    * [`forwardsOneToOneDescriptor()`](#descriptors.forwardsOneToOneDescriptor)
    * [`backwardsOneToOneDescriptor(declaredFieldName, declaredFromModelName)`](#descriptors.backwardsOneToOneDescriptor)
    * [`backwardsManyToOneDescriptor()`](#descriptors.backwardsManyToOneDescriptor)
    * [`manyToManyDescriptor()`](#descriptors.manyToManyDescriptor)


<a name="module:descriptors~attrDescriptor"></a>

## ` attrDescriptor(fieldName)`

Defines a basic non-key attribute.

**Kind**: inner method of [descriptors](#.descriptors)  

| Param | Type | Description |
| --- | --- | --- |
| fieldName | string | the name of the field the descriptor will be assigned to. |


<a name="module:descriptors~forwardsManyToOneDescriptor"></a>

## ` forwardsManyToOneDescriptor(fieldName, declaredToModelName)`

Forwards direction of a Foreign Key: returns one object.
Also works as [forwardsOneToOneDescriptor](.forwardsOneToOneDescriptor).

For `book.author` referencing an `Author` model instance,
`fieldName` would be `'author'` and `declaredToModelName` would be `'Author'`.

**Kind**: inner method of [descriptors](#.descriptors)  

| Param | Type | Description |
| --- | --- | --- |
| fieldName | string | the name of the field the descriptor will be assigned to. |
| declaredToModelName | string | the name of the model that the field references. |


<a name="module:descriptors~forwardsOneToOneDescriptor"></a>

## ` forwardsOneToOneDescriptor()`

Dereferencing foreign keys in [oneToOne](module:fields.oneToOne)
relationships works the same way as in many-to-one relationships:
just look up the related model.

For example, a human face tends to have a single nose.
So if we want to resolve `face.nose`, we need to
look up the `Nose` that has the primary key that `face` references.

**Kind**: inner method of [descriptors](#.descriptors)  
**See**: {@link module:descriptors~forwardsManyToOneDescriptor|forwardsManyToOneDescriptor}

<a name="module:descriptors~backwardsOneToOneDescriptor"></a>

## ` backwardsOneToOneDescriptor(declaredFieldName, declaredFromModelName)`

Here we resolve 1-to-1 relationships starting at the model on which the
field was not installed. This means we need to find the instance of the
other model whose [oneToOne](module:fields.oneToOne) FK field contains the current model's primary key.

**Kind**: inner method of [descriptors](#.descriptors)  

| Param | Type | Description |
| --- | --- | --- |
| declaredFieldName | string | the name of the field referencing the current model. |
| declaredFromModelName | string | the name of the other model. |


<a name="module:descriptors~backwardsManyToOneDescriptor"></a>

## ` backwardsManyToOneDescriptor()`

The backwards direction of a n-to-1 relationship (i.e. 1-to-n),
meaning this will return an a collection (`QuerySet`) of model instances.

An example would be `author.books` referencing all instances of
the `Book` model that reference the author using `fk()`.

**Kind**: inner method of [descriptors](#.descriptors)  

<a name="module:descriptors~manyToManyDescriptor"></a>

## ` manyToManyDescriptor()`

This descriptor is assigned to both sides of a many-to-many relationship.
To indicate the backwards direction pass `true` for `reverse`.

**Kind**: inner method of [descriptors](#.descriptors)  

