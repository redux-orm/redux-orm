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

<p>Returns the branch name for a many-to-many relation.<br>
The name is the combination of the model name and the field name the relation<br>
was declared. The field name's first letter is capitalized.</p>
<p>Example: model <code>Author</code> has a many-to-many relation to the model <code>Book</code>, defined<br>
in the <code>Author</code> field <code>books</code>. The many-to-many branch name will be <code>AuthorBooks</code>.</p>

**Kind**: inner method of [utils](#.utils)  
**Returns**: string - <p>The branch name for the many-to-many relation.</p>  

| Param | Type | Description |
| --- | --- | --- |
| declarationModelName | string | <p>the name of the model the many-to-many relation was declared on</p> |
| fieldName | string | <p>the field name where the many-to-many relation was declared on</p> |


<a name="module:utils~m2mToFieldName"></a>

## ` m2mToFieldName(otherModelName)`⇒ string 

<p>Returns the fieldname that saves a foreign key in a many-to-many through model to the<br>
model where the many-to-many relation was declared.</p>
<p>Example: <code>Book</code> =&gt; <code>toBookId</code></p>

**Kind**: inner method of [utils](#.utils)  
**Returns**: string - <p>the field name in the through model for <code>otherModelName</code>'s foreign key..</p>  

| Param | Type | Description |
| --- | --- | --- |
| otherModelName | string | <p>the name of the model that was the target of the many-to-many<br> declaration.</p> |


<a name="module:utils~normalizeEntity"></a>

## ` normalizeEntity(entity)`⇒ * 

<p>Normalizes <code>entity</code> to an id, where <code>entity</code> can be an id<br>
or a Model instance.</p>

**Kind**: inner method of [utils](#.utils)  
**Returns**: * - <p>the id value of <code>entity</code></p>  

| Param | Type | Description |
| --- | --- | --- |
| entity | * | <p>either a Model instance or an id value</p> |


