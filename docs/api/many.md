---
id: many
title: many
sidebar_label: many
hide_title: true
---

<a name="many"></a>

## many(options) ⇒ <code>ManyToMany</code>
Defines a many-to-many relationship between
this (source) and another (target) model.

The relationship is modeled with an extra model called the through model.
The through model has foreign keys to both the source and target models.

You can define your own through model if you want to associate more information
to the relationship. A custom through model must have at least two foreign keys,
one pointing to the source Model, and one pointing to the target Model.

If you have more than one foreign key pointing to a source or target Model in the
through Model, you must pass the option `throughFields`, which is an array of two
strings, where the strings are the field names that identify the foreign keys to
be used for the many-to-many relationship. Redux-ORM will figure out which field name
points to which model by checking the through Model definition.

Unlike `fk`, this function accepts only an object argument.

```javascript
class Authorship extends Model {}
Authorship.modelName = 'Authorship';
Authorship.fields = {
  author: fk('Author', 'authorships'),
  book: fk('Book', 'authorships'),
};

class Author extends Model {}
Author.modelName = 'Author';
Author.fields = {
  books: many({
    to: 'Book',
    relatedName: 'authors',
    through: 'Authorship',

    // this is optional, since Redux-ORM can figure
    // out the through fields itself as there aren't
    // multiple foreign keys pointing to the same models.
    throughFields: ['author', 'book'],
  })
};

class Book extends Model {}
Book.modelName = 'Book';
```

You should only define the many-to-many relationship on one side. In the
above case of Authors to Books through Authorships, the relationship is
defined only on the Author model.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | options |
| options.to | <code>string</code> | the `modelName` attribute of the target Model. |
| [options.through] | <code>string</code> | the `modelName` attribute of the through Model which                                    must declare at least one foreign key to both source and                                    target Models. If not supplied, Redux-Orm will autogenerate                                    one. |
| [options.throughFields] | <code>Array.&lt;string&gt;</code> | this must be supplied only when a custom through                                            Model has more than one foreign key pointing to                                            either the source or target mode. In this case                                            Redux-ORM can't figure out the correct fields for                                            you, you must provide them. The supplied array should                                            have two elements that are the field names for the                                            through fields you want to declare the many-to-many                                            relationship with. The order doesn't matter;                                            Redux-ORM will figure out which field points to                                            the source Model and which to the target Model. |
| [options.relatedName] | <code>string</code> | the attribute used to access a QuerySet                                          of source Models from target Model. |

