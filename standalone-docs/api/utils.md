---
id: module_utils
title: Utils
sidebar_label: Utils
hide_title: true
---

<a name="module:utils"></a>

#  utils


* [utils](#.utils)
    * [`m2mName(declarationModelName, fieldName)`](#utils.m2mName) ⇒ string
    * [`m2mToFieldName(otherModelName)`](#utils.m2mToFieldName) ⇒ string
    * [`normalizeEntity(entity)`](#utils.normalizeEntity) ⇒ *


<a name="module:utils~m2mName"></a>

## ` m2mName(declarationModelName, fieldName)`⇒ string 

Returns the branch name for a many-to-many relation.
The name is the combination of the model name and the field name the relation
was declared. The field name's first letter is capitalized.

Example: model `Author` has a many-to-many relation to the model `Book`, defined
in the `Author` field `books`. The many-to-many branch name will be `AuthorBooks`.

**Kind**: inner method of [utils](#.utils)  
**Returns**: string - The branch name for the many-to-many relation.  

| Param | Type | Description |
| --- | --- | --- |
| declarationModelName | string | the name of the model the many-to-many relation was declared on |
| fieldName | string | the field name where the many-to-many relation was declared on |


<a name="module:utils~m2mToFieldName"></a>

## ` m2mToFieldName(otherModelName)`⇒ string 

Returns the fieldname that saves a foreign key in a many-to-many through model to the
model where the many-to-many relation was declared.

Example: `Book` => `toBookId`

**Kind**: inner method of [utils](#.utils)  
**Returns**: string - the field name in the through model for `otherModelName`'s foreign key..  

| Param | Type | Description |
| --- | --- | --- |
| otherModelName | string | the name of the model that was the target of the many-to-many                                   declaration. |


<a name="module:utils~normalizeEntity"></a>

## ` normalizeEntity(entity)`⇒ * 

Normalizes `entity` to an id, where `entity` can be an id
or a Model instance.

**Kind**: inner method of [utils](#.utils)  
**Returns**: * - the id value of `entity`  

| Param | Type | Description |
| --- | --- | --- |
| entity | * | either a Model instance or an id value |


