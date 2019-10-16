---
id: module_fields
title: Fields
sidebar_label: Fields
hide_title: true
---

<a name="module:fields"></a>

#  fields

<p>Contains the logic for how fields on [Model](Model)s work<br>
and which descriptors must be installed.</p>
<p>If your goal is to define fields on a Model class,<br>
please use the more convenient methods [attr](attr),<br>
[fk](fk), [many](many) and [oneToOne](oneToOne).</p>


* [fields](#.fields)
    * [`attr([opts])`](#fields.attr) ⇒ Attribute
    * [`fk(options, [relatedName])`](#fields.fk) ⇒ ForeignKey
    * [`many(options, [relatedName])`](#fields.many) ⇒ ManyToMany
    * [`oneToOne(options, [relatedName])`](#fields.oneToOne) ⇒ OneToOne


<a name="module:fields~attr"></a>

## ` attr([opts])`⇒ Attribute 

<p>Defines a value attribute on the model.<br>
Though not required, it is recommended to define this for each non-foreign key you wish to use.<br>
Getters and setters need to be defined on each Model<br>
instantiation for undeclared data fields, which is slower.<br>
You can use the optional <code>getDefault</code> parameter to fill in unpassed values<br>
to [Model.create](Model.create), such as for generating ID's with UUID:</p>
<pre class="prettyprint source lang-javascript"><code>import getUUID from 'your-uuid-package-of-choice';

fields = {
  id: attr({ getDefault: () => getUUID() }),
  title: attr(),
}
</code></pre>

**Kind**: inner method of [fields](#.fields)  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | Object |  |
| [opts.getDefault] | function | <p>If you give a function here, its return<br> value from calling with zero arguments will<br> be used as the value when creating a new Model<br> instance with [Model#create](Model#create) if the field<br> value is not passed.</p> |


<a name="module:fields~fk"></a>

## ` fk(options, [relatedName])`⇒ ForeignKey 

<p>Defines a foreign key on a model, which points<br>
to a single entity on another model.</p>
<p>You can pass arguments as either a single object,<br>
or two arguments.</p>
<p>If you pass two arguments, the first one is the name<br>
of the Model the foreign key is pointing to, and<br>
the second one is an optional related name, which will<br>
be used to access the Model the foreign key<br>
is being defined from, from the target Model.</p>
<p>If the related name is not passed, it will be set as<br>
<code>${toModelName}Set</code>.</p>
<p>If you pass an object to <code>fk</code>, it has to be in the form</p>
<pre class="prettyprint source lang-javascript"><code>fields = {
  author: fk({ to: 'Author', relatedName: 'books' })
}
</code></pre>
<p>Which is equal to</p>
<pre class="prettyprint source lang-javascript"><code>fields = {
  author: fk('Author', 'books'),
}
</code></pre>

**Kind**: inner method of [fields](#.fields)  

| Param | Type | Description |
| --- | --- | --- |
| options | string ⎮ Class.<Model> ⎮ Object | <p>The target Model class, its <code>modelName</code><br> attribute or an options object that<br> contains either as the <code>to</code> key.</p> |
| options.to | string ⎮ Class.<Model> | <p>The target Model class or its <code>modelName</code> attribute.</p> |
| [options.as] | string | <p>Name for the new accessor defined for this field. If you don't<br> supply this, the key that this field is defined under will be<br> overridden.</p> |
| [options.relatedName] | string | <p>The property name that will be used to access<br> a QuerySet for all source models that reference<br> the respective target Model's instance.</p> |
| [relatedName] | string | <p>If you didn't pass an object as the first argument,<br> this is the property name that will be used to<br> access a QuerySet for all source models that reference<br> the respective target Model's instance.</p> |


<a name="module:fields~many"></a>

## ` many(options, [relatedName])`⇒ ManyToMany 

<p>Defines a many-to-many relationship between<br>
this (source) and another (target) model.</p>
<p>The relationship is modeled with an extra model called the through model.<br>
The through model has foreign keys to both the source and target models.</p>
<p>You can define your own through model if you want to associate more information<br>
to the relationship. A custom through model must have at least two foreign keys,<br>
one pointing to the source Model, and one pointing to the target Model.</p>
<p>Like <code>fk</code>, this function accepts one or two string arguments specifying the other<br>
Model and the related name, or a single object argument that allows you to pass<br>
a custom through model.</p>
<p>If you have more than one foreign key pointing to a source or target Model in the<br>
through Model, you must pass the option <code>throughFields</code>, which is an array of two<br>
strings, where the strings are the field names that identify the foreign keys to<br>
be used for the many-to-many relationship. Redux-ORM will figure out which field name<br>
points to which model by checking the &quot;through model&quot; definition.</p>
<pre class="prettyprint source lang-javascript"><code>class Authorship extends Model {}
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

    // here this is optional: Redux-ORM can figure
    // out the through fields itself since the two
    // foreign key fields point to different Models
    throughFields: ['author', 'book'],
  })
};

class Book extends Model {}
Book.modelName = 'Book';
</code></pre>
<p>You should only define the many-to-many relationship on one side. In the<br>
above case of Authors to Books through Authorships, the relationship is<br>
defined only on the Author model.</p>

**Kind**: inner method of [fields](#.fields)  

| Param | Type | Description |
| --- | --- | --- |
| options | string ⎮ Class.<Model> ⎮ Object | <p>The target Model class, its <code>modelName</code><br> attribute or an options object that<br> contains either as the <code>to</code> key.</p> |
| options.to | string ⎮ Class.<Model> | <p>The target Model class or its <code>modelName</code> attribute.</p> |
| [options.as] | string | <p>Name for the new accessor defined for this field. If you don't<br> supply this, the key that this field is defined under will be<br> overridden.</p> |
| [options.through] | string ⎮ Class.<Model> | <p>The through Model class or its <code>modelName</code><br> attribute. It must declare at least one<br> foreign key to both source and target models.<br> If not supplied, Redux-ORM will generate one.</p> |
| [options.throughFields] | Array.<string> | <p>Must be supplied only when a custom through<br> Model has more than one foreign key pointing to<br> either the source or target mode. In this case<br> Redux-ORM can't figure out the correct fields for<br> you, you must provide them. The supplied array should<br> have two elements that are the field names for the<br> through fields you want to declare the many-to-many<br> relationship with. The order doesn't matter;<br> Redux-ORM will figure out which field points to<br> the source Model and which to the target Model.</p> |
| [options.relatedName] | string | <p>The attribute used to access a QuerySet for all<br> source models that reference the respective target<br> Model's instance.</p> |
| [relatedName] | string | <p>If you didn't pass an object as the first argument,<br> this is the property name that will be used to<br> access a QuerySet for all source models that reference<br> the respective target Model's instance.</p> |


<a name="module:fields~oneToOne"></a>

## ` oneToOne(options, [relatedName])`⇒ OneToOne 

<p>Defines a one-to-one relationship. In database terms, this is a foreign key with the<br>
added restriction that only one entity can point to single target entity.</p>
<p>The arguments are the same as with <code>fk</code>. If <code>relatedName</code> is not supplied,<br>
the source model name in lowercase will be used. Note that with the one-to-one<br>
relationship, the <code>relatedName</code> should be in singular, not plural.</p>

**Kind**: inner method of [fields](#.fields)  

| Param | Type | Description |
| --- | --- | --- |
| options | string ⎮ Class.<Model> ⎮ Object | <p>The target Model class, its <code>modelName</code><br> attribute or an options object that<br> contains either as the <code>to</code> key.</p> |
| options.to | string ⎮ Class.<Model> | <p>The target Model class or its <code>modelName</code> attribute.</p> |
| [options.as] | string | <p>Name for the new accessor defined for this field. If you don't<br> supply this, the key that this field is defined under will be<br> overridden.</p> |
| [options.relatedName] | string | <p>The property name that will be used to access the source<br> model instance referencing the target model instance.</p> |
| [relatedName] | string | <p>The property name that will be used to access the source<br> model instance referencing the target model instance</p> |


