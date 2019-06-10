---
id: onetoone
title: oneToOne
sidebar_label: oneToOne
hide_title: true
---

<a name="oneToOne"></a>

## oneToOne(toModelNameOrObj, [relatedName]) ⇒ <code>OneToOne</code>
Defines a one-to-one relationship. In database terms, this is a foreign key with the
added restriction that only one entity can point to single target entity.

The arguments are the same as with `fk`. If `relatedName` is not supplied,
the source model name in lowercase will be used. Note that with the one-to-one
relationship, the `relatedName` should be in singular, not plural.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| toModelNameOrObj | <code>string</code> \| <code>Object</code> | the `modelName` property of                                            the Model that is the target of the                                            foreign key, or an object with properties                                            `to` and optionally `relatedName`. |
| [relatedName] | <code>string</code> | if you didn't pass an object as the first argument,                                 this is the property name that will be used to                                 access a Model the foreign key is defined from,                                 from the target Model. |

