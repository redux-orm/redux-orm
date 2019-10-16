import Attribute from "./Attribute";
import ForeignKey from "./ForeignKey";
import ManyToMany from "./ManyToMany";
import OneToOne from "./OneToOne";

/**
 * Contains the logic for how fields on {@link Model}s work
 * and which descriptors must be installed.
 *
 * If your goal is to define fields on a Model class,
 * please use the more convenient methods {@link attr},
 * {@link fk}, {@link many} and {@link oneToOne}.
 *
 * @module fields
 */

/**
 * Defines a value attribute on the model.
 * Though not required, it is recommended to define this for each non-foreign key you wish to use.
 * Getters and setters need to be defined on each Model
 * instantiation for undeclared data fields, which is slower.
 * You can use the optional `getDefault` parameter to fill in unpassed values
 * to {@link Model.create}, such as for generating ID's with UUID:
 *
 * ```javascript
 * import getUUID from 'your-uuid-package-of-choice';
 *
 * fields = {
 *   id: attr({ getDefault: () => getUUID() }),
 *   title: attr(),
 * }
 * ```
 *
 * @param  {Object} [opts]
 * @param {Function} [opts.getDefault] - If you give a function here, its return
 *                                       value from calling with zero arguments will
 *                                       be used as the value when creating a new Model
 *                                       instance with {@link Model#create} if the field
 *                                       value is not passed.
 * @return {Attribute}
 */
function attr(opts) {
    return new Attribute(opts);
}

/**
 * Defines a foreign key on a model, which points
 * to a single entity on another model.
 *
 * You can pass arguments as either a single object,
 * or two arguments.
 *
 * If you pass two arguments, the first one is the name
 * of the Model the foreign key is pointing to, and
 * the second one is an optional related name, which will
 * be used to access the Model the foreign key
 * is being defined from, from the target Model.
 *
 * If the related name is not passed, it will be set as
 * `${toModelName}Set`.
 *
 * If you pass an object to `fk`, it has to be in the form
 *
 * ```javascript
 * fields = {
 *   author: fk({ to: 'Author', relatedName: 'books' })
 * }
 * ```
 *
 * Which is equal to
 *
 * ```javascript
 * fields = {
 *   author: fk('Author', 'books'),
 * }
 * ```
 *
 * @param {string|Class<Model>|Object} options - The target Model class, its `modelName`
 *                                               attribute or an options object that
 *                                               contains either as the `to` key.
 * @param {string|Class<Model>} options.to - The target Model class or its `modelName` attribute.
 * @param {string} [options.as] - Name for the new accessor defined for this field. If you don't
 *                                supply this, the key that this field is defined under will be
 *                                overridden.
 * @param {string} [options.relatedName] - The property name that will be used to access
 *                                         a QuerySet for all source models that reference
 *                                         the respective target Model's instance.
 * @param {string} [relatedName] - If you didn't pass an object as the first argument,
 *                                 this is the property name that will be used to
 *                                 access a QuerySet for all source models that reference
 *                                 the respective target Model's instance.
 * @return {ForeignKey}
 */
function fk(...args) {
    return new ForeignKey(...args);
}

/**
 * Defines a many-to-many relationship between
 * this (source) and another (target) model.
 *
 * The relationship is modeled with an extra model called the through model.
 * The through model has foreign keys to both the source and target models.
 *
 * You can define your own through model if you want to associate more information
 * to the relationship. A custom through model must have at least two foreign keys,
 * one pointing to the source Model, and one pointing to the target Model.
 *
 * Like `fk`, this function accepts one or two string arguments specifying the other
 * Model and the related name, or a single object argument that allows you to pass
 * a custom through model.
 *
 * If you have more than one foreign key pointing to a source or target Model in the
 * through Model, you must pass the option `throughFields`, which is an array of two
 * strings, where the strings are the field names that identify the foreign keys to
 * be used for the many-to-many relationship. Redux-ORM will figure out which field name
 * points to which model by checking the "through model" definition.
 *
 * ```javascript
 * class Authorship extends Model {}
 * Authorship.modelName = 'Authorship';
 * Authorship.fields = {
 *   author: fk('Author', 'authorships'),
 *   book: fk('Book', 'authorships'),
 * };
 *
 * class Author extends Model {}
 * Author.modelName = 'Author';
 * Author.fields = {
 *   books: many({
 *     to: 'Book',
 *     relatedName: 'authors',
 *     through: 'Authorship',
 *
 *     // here this is optional: Redux-ORM can figure
 *     // out the through fields itself since the two
 *     // foreign key fields point to different Models
 *     throughFields: ['author', 'book'],
 *   })
 * };
 *
 * class Book extends Model {}
 * Book.modelName = 'Book';
 * ```
 *
 * You should only define the many-to-many relationship on one side. In the
 * above case of Authors to Books through Authorships, the relationship is
 * defined only on the Author model.
 *
 * @param {string|Class<Model>|Object} options - The target Model class, its `modelName`
 *                                               attribute or an options object that
 *                                               contains either as the `to` key.
 * @param {string|Class<Model>} options.to - The target Model class or its `modelName` attribute.
 * @param {string} [options.as] - Name for the new accessor defined for this field. If you don't
 *                                supply this, the key that this field is defined under will be
 *                                overridden.
 * @param {string|Class<Model>} [options.through] - The through Model class or its `modelName`
 *                                                  attribute. It must declare at least one
 *                                                  foreign key to both source and target models.
 *                                                  If not supplied, Redux-ORM will generate one.
 * @param {string[]} [options.throughFields] - Must be supplied only when a custom through
 *                                             Model has more than one foreign key pointing to
 *                                             either the source or target mode. In this case
 *                                             Redux-ORM can't figure out the correct fields for
 *                                             you, you must provide them. The supplied array should
 *                                             have two elements that are the field names for the
 *                                             through fields you want to declare the many-to-many
 *                                             relationship with. The order doesn't matter;
 *                                             Redux-ORM will figure out which field points to
 *                                             the source Model and which to the target Model.
 * @param {string} [options.relatedName] - The attribute used to access a QuerySet for all
 *                                         source models that reference the respective target
 *                                         Model's instance.
 * @param {string} [relatedName] - If you didn't pass an object as the first argument,
 *                                 this is the property name that will be used to
 *                                 access a QuerySet for all source models that reference
 *                                 the respective target Model's instance.
 * @return {ManyToMany}
 */
function many(...args) {
    return new ManyToMany(...args);
}

/**
 * Defines a one-to-one relationship. In database terms, this is a foreign key with the
 * added restriction that only one entity can point to single target entity.
 *
 * The arguments are the same as with `fk`. If `relatedName` is not supplied,
 * the source model name in lowercase will be used. Note that with the one-to-one
 * relationship, the `relatedName` should be in singular, not plural.
 *
 *
 * @param {string|Class<Model>|Object} options - The target Model class, its `modelName`
 *                                               attribute or an options object that
 *                                               contains either as the `to` key.
 * @param {string|Class<Model>} options.to - The target Model class or its `modelName` attribute.
 * @param {string} [options.as] - Name for the new accessor defined for this field. If you don't
 *                                supply this, the key that this field is defined under will be
 *                                overridden.
 * @param {string} [options.relatedName] - The property name that will be used to access the source
 *                                         model instance referencing the target model instance.
 * @param {string} [relatedName] - The property name that will be used to access the source
 *                                 model instance referencing the target model instance
 * @return {OneToOne}
 */
function oneToOne(...args) {
    return new OneToOne(...args);
}

export { fk, attr, many, oneToOne };
