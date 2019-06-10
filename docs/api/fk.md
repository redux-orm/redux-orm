---
id: fk
title: fk
sidebar_label: fk
hide_title: true
---

<a name="fk"></a>

## fk(toModelNameOrObj, [relatedName]) ⇒ <code>ForeignKey</code>
Defines a foreign key on a model, which points
to a single entity on another model.

You can pass arguments as either a single object,
or two arguments.

If you pass two arguments, the first one is the name
of the Model the foreign key is pointing to, and
the second one is an optional related name, which will
be used to access the Model the foreign key
is being defined from, from the target Model.

If the related name is not passed, it will be set as
`${toModelName}Set`.

If you pass an object to `fk`, it has to be in the form

```javascript
fields = {
  author: fk({ to: 'Author', relatedName: 'books' })
}
```

Which is equal to

```javascript
fields = {
  author: fk('Author', 'books'),
}
```

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| toModelNameOrObj | <code>string</code> \| <code>Object</code> | the `modelName` property of                                            the Model that is the target of the                                            foreign key, or an object with properties                                            `to` and optionally `relatedName`. |
| [relatedName] | <code>string</code> | if you didn't pass an object as the first argument,                                 this is the property name that will be used to                                 access a QuerySet the foreign key is defined from,                                 from the target model. |

