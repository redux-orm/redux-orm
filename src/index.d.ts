declare module "redux-orm" {
   /**
    * Handles the underlying data structure for a {@link Model} class.
    */
   export class Backend {
      /**
       * Handles the underlying data structure for a {@link Model} class.
       */
      constructor(userOpts: { idAttribute: string, arrName: string, mapName: string, withMutations: Boolean });

      /**
       * Returns a reference to the object at index `id`
       * in state `branch`.
       *
       * @param  {Object} branch - the state
       * @param  {Number} id - the id of the object to get
       * @return {Object|undefined} A reference to the raw object in the state or
       *                            `undefined` if not found.
       */
      accessId(branch: Object, id: Number): (Object|undefined);

      /**
       * Returns a {@link ListIterator} instance for
       * the list of objects in `branch`.
       *
       * @param  {Object} branch - the model's state branch
       * @return {ListIterator} An iterator that loops through the objects in `branch`
       */
      iterator(branch: Object): utils.ListIterator;

      /**
       * Returns the default state for the data structure.
       * @return {Object} The default state for this {@link Backend} instance's data structure
       */
      getDefaultState(): Object;

      /**
       * Returns the data structure including a new object `entry`
       * @param  {Object} session - the current Session instance
       * @param  {Object} branch - the data structure state
       * @param  {Object} entry - the object to insert
       * @return {Object} the data structure including `entry`.
       */
      insert(session: Object, branch: Object, entry: Object): Object;

      /**
       * Returns the data structure with objects where id in `idArr`
       * are merged with `mergeObj`.
       *
       * @param  {Object} session - the current Session instance
       * @param  {Object} branch - the data structure state
       * @param  {Array} idArr - the id's of the objects to update
       * @param  {Object} mergeObj - The object to merge with objects
       *                             where their id is in `idArr`.
       * @return {Object} the data structure with objects with their id in `idArr` updated with `mergeObj`.
       */
      update(session: Object, branch: Object, idArr: any[], mergeObj: Object): Object;

      /**
       * Returns the data structure without objects with their id included in `idsToDelete`.
       * @param  {Object} session - the current Session instance
       * @param  {Object} branch - the data structure state
       * @param  {Array} idsToDelete - the ids to delete from the data structure
       * @return {Object} the data structure without ids in `idsToDelete`.
       */
      delete(session: Object, branch: Object, idsToDelete: any[]): Object;
   }

   /**
    * The heart of an ORM, the data model.
    * The static class methods manages the updates
    * passed to this. The class itself is connected to a session,
    * and because of this you can only have a single session at a time
    * for a {@link Model} class.
    *
    * An instance of {@link Model} represents an object in the database.
    *
    * To create data models in your schema, subclass {@link Model}. To define
    * information about the data model, override static class methods. Define instance
    * logic by defining prototype methods (without `static` keyword).
    */
   export class Model {
      /**
       * The heart of an ORM, the data model.
       * The static class methods manages the updates
       * passed to this. The class itself is connected to a session,
       * and because of this you can only have a single session at a time
       * for a {@link Model} class.
       *
       * An instance of {@link Model} represents an object in the database.
       *
       * To create data models in your schema, subclass {@link Model}. To define
       * information about the data model, override static class methods. Define instance
       * logic by defining prototype methods (without `static` keyword).
       */
      constructor(props: Object);

      /**
       * Returns the raw state for this {@link Model} in the current {@link Session}.
       * @return {Object} The state for this {@link Model} in the current {@link Session}.
       */
      static state: any;

      /**
       * Returns the options object passed to the {@link Backend} class constructor.
       * By default, returns an empty object (which means the {@link Backend} instance
       * will use default options). You can either override this function to return the options
       * you want to use, or assign the options object as a static property to the
       * Model class.
       *
       * @return {Object} the options object used to instantiate a {@link Backend} class.
       */
      static backend(): Object;

      /**
       * Returns the {@link Backend} class used to instantiate
       * the {@link Backend} instance for this {@link Model}.
       *
       * Override this if you want to use a custom {@link Backend} class.
       * @return {Backend} The {@link Backend} class or subclass to use for this {@link Model}.
       */
      static getBackendClass(): Backend;

      /**
       * Gets the {@link Backend} instance linked to this {@link Model}.
       *
       * @private
       * @return {Backend} The {@link Backend} instance linked to this {@link Model}.
       */
      private static getBackend(): Backend;

      /**
       * Gets the Model's next state by applying the recorded
       * updates.
       *
       * @private
       * @param {Transction} tx - the current Transaction instance
       * @return {Object} The next state.
       */
      private static getNextState(tx: Transaction): Object;

      /**
       * A reducer that takes the Model's state and an internal redux-orm
       * action object and applies the update specified by the `action` object
       * by delegating to this model's Backend instance.
       *
       * @private
       * @param  {Object} state - the Model's state
       * @param  {Object} action - the internal redux-orm update action to apply
       * @return {Object} the state after applying the action
       */
      private static updateReducer(state: Object, action: Object): Object;

      /**
       * The default reducer implementation.
       * If the user doesn't define a reducer, this is used.
       *
       * @param {Object} state - the current state
       * @param {Object} action - the dispatched action
       * @param {Model} model - the concrete model class being used
       * @param {Session} session - the current {@link Session} instance
       * @return {Object} the next state for the Model
       */
      static reducer(state: Object, action: Object, model: Model, session: Session): Object;

      /**
       * Gets the default, empty state of the branch.
       * Delegates to a {@link Backend} instance.
       *
       * @private
       * @return {Object} The default state.
       */
      private static getDefaultState(): Object;

      /**
       * Returns the id attribute of this {@link Model}.
       * Delegates to the related {@link Backend} instance.
       *
       * @return {string} The id attribute of this {@link Model}.
       */
      static idAttribute: any;

      /**
       * A convenience method to call {@link Backend#accessId} from
       * the {@link Model} class.
       *
       * @param  {Number} id - the object id to access
       * @return {Object} a reference to the object in the database.
       */
      static accessId(id: Number): Object;

      /**
       * A convenience method to call {@link Backend#accessIdList} from
       * the {@link Model} class with the current state.
       */
      static accessIds(): void;

      /**
       * Connect the model class to a {@link Session}.
       *
       * @private
       * @param  {Session} session - The session to connect to.
       */
      private static connect(session: Session): void;

      /**
       * Get the current {@link Session} instance.
       *
       * @private
       * @return {Session} The current {@link Session} instance.
       */
      private static session: any;

      /**
       * A convenience method that delegates to the current {@link Session} instane.
       * Adds the required backenddata about this {@link Model} to the update object.
       *
       * @private
       * @param {Object} update - the update to add.
       */
      private static addUpdate(update: Object): void;

      /**
       * Returns the id to be assigned to a new entity.
       * You may override this to suit your needs.
       * @return {*} the id value for a new entity.
       */
      static nextId(): any;

      /**
       * Returns a {@link QuerySet} containing all {@link Model} instances.
       * @return {QuerySet} a QuerySet containing all {@link Model} instances
       */
      static all(): QuerySet;

      /**
       * Records the addition of a new {@link Model} instance and returns it.
       *
       * @param  {props} props - the new {@link Model}'s properties.
       * @return {Model} a new {@link Model} instance.
       */
      static create(props: Object): Model;

      /**
       * Returns a {@link Model} instance for the object with id `id`.
       *
       * @param  {*} id - the `id` of the object to get
       * @throws If object with id `id` doesn't exist
       * @return {Model} {@link Model} instance with id `id`
       */
      static withId(id: any): Model;

      /**
       * Returns a boolean indicating if an entity with the id `id` exists
       * in the state.
       *
       * @param  {*}  id - a value corresponding to the id attribute of the {@link Model} class.
       * @return {Boolean} a boolean indicating if entity with `id` exists in the state
       */
      static hasId(id: any): Boolean;

      /**
       * Gets the {@link Model} instance that matches properties in `lookupObj`.
       * Throws an error if {@link Model} is not found.
       *
       * @param  {Object} lookupObj - the properties used to match a single entity.
       * @return {Model} a {@link Model} instance that matches `lookupObj` properties.
       */
      static get(lookupObj: Object): Model;

      /**
       * Gets the {@link Model} class or subclass constructor (the class that
       * instantiated this instance).
       *
       * @return {Model} The {@link Model} class or subclass constructor used to instantiate
       *                 this instance.
       */
      getClass(): Model;

      /**
       * Gets the id value of the current instance by looking up the id attribute.
       * @return {*} The id value of the current instance.
       */
      getId(): any;

      /**
       * Returns a reference to the plain JS object in the store.
       * Make sure to not mutate this.
       *
       * @return {Object} a reference to the plain JS object in the store
       */
      ref: any;

      /**
       * Returns a string representation of the {@link Model} instance.
       *
       * @return {string} A string representation of this {@link Model} instance.
       */
      toString(): string;

      /**
       * Returns a boolean indicating if `otherModel` equals this {@link Model} instance.
       * Equality is determined by shallow comparing their attributes.
       *
       * @param  {Model} otherModel - a {@link Model} instance to compare
       * @return {Boolean} a boolean indicating if the {@link Model} instance's are equal.
       */
      equals(otherModel: Model): Boolean;

      /**
       * Records a update to the {@link Model} instance for a single
       * field value assignment.
       *
       * @param {string} propertyName - name of the property to set
       * @param {*} value - value assigned to the property
       * @return {undefined}
       */
      set(propertyName: string, value: any): undefined;

      /**
       * Records an update to the {@link Model} instance for multiple field value assignments.
       * If the session is with mutations, updates the instance to reflect the new values.
       *
       * @param  {Object} userMergeObj - an object that will be merged with this instance.
       * @return {undefined}
       */
      update(userMergeObj: Object): undefined;

      /**
       * Records the {@link Model} to be deleted.
       * @return {undefined}
       */
      delete(): undefined;
   }

   /**
    * A chainable class that keeps track of a list of objects and
    *
    * - returns a subset clone of itself with [filter]{@link QuerySet#filter} and [exclude]{@link QuerySet#exclude}
    * - records updates to objects with [update]{@link QuerySet#update} and [delete]{@link QuerySet#delete}
    *
    */
   export class QuerySet {
      /**
       * A chainable class that keeps track of a list of objects and
       *
       * - returns a subset clone of itself with [filter]{@link QuerySet#filter} and [exclude]{@link QuerySet#exclude}
       * - records updates to objects with [update]{@link QuerySet#update} and [delete]{@link QuerySet#delete}
       *
       */
      constructor(modelClass: Model, idArr: number[], opts?: Object);

      /**
       * Returns a new QuerySet representing the same entities
       * with the `withRefs` flag on.
       *
       * @return {QuerySet}
       */
      withRefs: any;

      /**
       * Alias for withRefs
       * @return {QuerySet}
       */
      ref: any;

      /**
       * Returns a new QuerySet representing the same entities
       * with the `withRefs` flag off.
       *
       * @return {QuerySet}
       */
      withModels: any;

      /**
       * Returns an array of the plain objects represented by the QuerySet.
       * The plain objects are direct references to the store.
       *
       * @return {Object[]} references to the plain JS objects represented by
       *                    the QuerySet
       */
      toRefArray(): Object[];

      /**
       * Returns an array of Model instances represented by the QuerySet.
       * @return {Model[]} model instances represented by the QuerySet
       */
      toModelArray(): Model[];

      /**
       * Returns the number of model instances represented by the QuerySet.
       *
       * @return {number} length of the QuerySet
       */
      count(): number;

      /**
       * Checks if the {@link QuerySet} instance has any entities.
       *
       * @return {Boolean} `true` if the {@link QuerySet} instance contains entities, else `false`.
       */
      exists(): Boolean;

      /**
       * Returns the {@link Model} instance at index `index` in the {@link QuerySet} instance if
       * `withRefs` flag is set to `false`, or a reference to the plain JavaScript
       * object in the model state if `true`.
       *
       * @param  {number} index - index of the model instance to get
       * @return {Model|Object} a {@link Model} instance or a plain JavaScript
       *                        object at index `index` in the {@link QuerySet} instance
       */
      at(index: number): (Model|Object);

      /**
       * Returns the {@link Model} instance at index 0 in the {@link QuerySet} instance.
       * @return {Model}
       */
      first(): Model;

      /**
       * Returns the {@link Model} instance at index `QuerySet.count() - 1`
       * @return {Model}
       */
      last(): Model;

      /**
       * Returns a new {@link QuerySet} instance with the same entities.
       * @return {QuerySet} a new QuerySet with the same entities.
       */
      all(): QuerySet;

      /**
       * Returns a new {@link QuerySet} instance with entities that match properties in `lookupObj`.
       *
       * @param  {Object} lookupObj - the properties to match objects with.
       * @return {QuerySet} a new {@link QuerySet} instance with objects that passed the filter.
       */
      filter(lookupObj: Object): QuerySet;

      /**
       * Returns a new {@link QuerySet} instance with entities that do not match properties in `lookupObj`.
       *
       * @param  {Object} lookupObj - the properties to unmatch objects with.
       * @return {QuerySet} a new {@link QuerySet} instance with objects that passed the filter.
       */
      exclude(lookupObj: Object): QuerySet;

      /**
       * Calls `func` for each object in the {@link QuerySet} instance.
       * The object is either a reference to the plain
       * object in the database or a {@link Model} instance, depending
       * on the flag.
       *
       * @param  {Function} func - the function to call with each object
       * @return {undefined}
       */
      forEach(func: (() => any)): undefined;

      /**
       * Maps the {@link Model} instances in the {@link QuerySet} instance.
       * @param  {Function} func - the mapping function that takes one argument, a
       *                           {@link Model} instance or a reference to the plain
       *                           JavaScript object in the store, depending on the
       *                           QuerySet's `withRefs` flag.
       * @return {Array}  the mapped array
       */
      map(func: (() => any)): any[];

      /**
       * Returns a new {@link QuerySet} instance with entities ordered by `iteratees` in ascending
       * order, unless otherwise specified. Delegates to `lodash.orderBy`.
       *
       * @param  {string[]|Function[]} iteratees - an array where each item can be a string or a
       *                                           function. If a string is supplied, it should
       *                                           correspond to property on the entity that will
       *                                           determine the order. If a function is supplied,
       *                                           it should return the value to order by.
       * @param {Boolean[]} [orders] - the sort orders of `iteratees`. If unspecified, all iteratees
       *                               will be sorted in ascending order. `true` and `'asc'`
       *                               correspond to ascending order, and `false` and `'desc`
       *                               to descending order.
       * @return {QuerySet} a new {@link QuerySet} with objects ordered by `iteratees`.
       */
      orderBy(iteratees: (string[]|(() => any)[]), orders?: Boolean[]): QuerySet;

      /**
       * Records an update specified with `mergeObj` to all the objects
       * in the {@link QuerySet} instance.
       *
       * @param  {Object} mergeObj - an object to merge with all the objects in this
       *                             queryset.
       * @return {undefined}
       */
      update(mergeObj: Object): undefined;

      /**
       * Records a deletion of all the objects in this {@link QuerySet} instance.
       * @return {undefined}
       */
      delete(): undefined;
   }

   /**
    * Schema's responsibility is tracking the set of {@link Model} classes used in the database.
    * To include your model in that set, Schema offers {@link Schema#register} and a
    * shortcut {@link Schema#define} methods.
    *
    * Schema also handles starting a Session with {@link Schema#from}.
    */
   export class Schema {
      /**
       * Schema's responsibility is tracking the set of {@link Model} classes used in the database.
       * To include your model in that set, Schema offers {@link Schema#register} and a
       * shortcut {@link Schema#define} methods.
       *
       * Schema also handles starting a Session with {@link Schema#from}.
       */
      constructor();

      /**
       * Defines a {@link Model} class with the provided options and registers
       * it to the schema instance.
       *
       * Note that you can also define {@link Model} classes by yourself
       * with ES6 classes.
       *
       * @param  {string} modelName - the name of the {@link Model} class
       * @param  {Object} [relatedFields] - a dictionary of `fieldName: fieldInstance`
       * @param  {Function} [reducer] - the reducer function to use for this model
       * @param  {Object} [backendOpts] - {@link Backend} options for this model.
       * @return {Model} The defined model class.
       */
      define(modelName: string, relatedFields?: Object, reducer?: (() => any), backendOpts?: Object): Model;

      /**
       * Registers a {@link Model} class to the schema.
       *
       * If the model has declared any ManyToMany fields, their
       * through models will be generated and registered with
       * this call.
       *
       * @param  {...Model} model - a {@link Model} class to register
       * @return {undefined}
       */
      register(model: Model): undefined;

      /**
       * Gets a {@link Model} class by its name from the registry.
       * @param  {string} modelName - the name of the {@link Model} class to get
       * @throws If {@link Model} class is not found.
       * @return {Model} the {@link Model} class, if found
       */
      get(modelName: string): Model;

      /**
       * Returns the default state.
       * @return {Object} the default state
       */
      getDefaultState(): Object;

      /**
       * Begins an immutable database session.
       *
       * @param  {Object} state  - the state the database manages
       * @param  {Object} [action] - the dispatched action object
       * @return {Session} a new {@link Session} instance
       */
      from(state: Object, action?: Object): Session;

      /**
       * Begins a mutable database session.
       *
       * @param  {Object} state  - the state the database manages
       * @param  {Object} [action] - the dispatched action object
       * @return {Session} a new {@link Session} instance
       */
      withMutations(state: Object, action?: Object): Session;

      /**
       * Returns a reducer function you can plug into your own
       * reducer. One way to do that is to declare your root reducer:
       *
       * ```javascript
       * function rootReducer(state, action) {
       *     return {
       *         entities: schema.reducer(),
       *         // Any other reducers you use.
       *     }
       * }
       * ```
       *
       * @return {Function} a reducer function that creates a new {@link Session} on
       *                    each action dispatch.
       */
      reducer(): (() => any);

      /**
       * Returns a memoized selector based on passed arguments.
       * This is similar to `reselect`'s `createSelector`,
       * except you can also pass a single function to be memoized.
       *
       * If you pass multiple functions, the format will be the
       * same as in `reselect`. The last argument is the selector
       * function and the previous are input selectors.
       *
       * When you use this method to create a selector, the returned selector
       * expects the whole `redux-orm` state branch as input. In the selector
       * function that you pass as the last argument, you will receive
       * `session` argument (a `Session` instance) followed by any
       * input arguments, like in `reselect`.
       *
       * This is an example selector:
       *
       * ```javascript
       * const bookSelector = schema.createSelector(session => {
       *     return session.Book.map(book => {
       *         return Object.assign({}, book.ref, {
       *             authors: book.authors.map(author => author.name),
       *             genres: book.genres.map(genre => genre.name),
       *         });
       *     });
       * });
       * ```
       *
       * redux-orm uses a special memoization function to avoid recomputations.
       * When a selector runs for the first time, it checks which Models' state
       * branches were accessed. On subsequent runs, the selector first checks
       * if those branches have changed -- if not, it just returns the previous
       * result. This way you can use the `PureRenderMixin` in your React
       * components for performance gains.
       *
       * @param  {...Function} args - zero or more input selectors
       *                              and the selector function.
       * @return {Function} memoized selector
       */
      createSelector(args: (() => any)): (() => any);
   }

   /**
    * Session handles a single
    * action dispatch.
    */
   export class Session {
      /**
       * Session handles a single
       * action dispatch.
       */
      constructor(schema: Schema, state: Object, action: Object, withMutations: Boolean);

      /**
       * Records an update to the session.
       *
       * @private
       * @param {Object} update - the update object. Must have keys
       *                          `type`, `payload` and `meta`. `meta`
       *                          must also include a `name` attribute
       *                          that contains the model name.
       */
      private addUpdate(update: Object): void;

      /**
       * Returns the current state for a model with name `modelName`.
       *
       * @private
       * @param  {string} modelName - the name of the model to get state for.
       * @return {*} The state for model with name `modelName`.
       */
      private getState(modelName: string): any;

      /**
       * Applies recorded updates and returns the next state.
       * @param  {Object} [opts] - Options object
       * @param  {Boolean} [opts.runReducers] - A boolean indicating if the user-defined
       *                                        model reducers should be run. If not specified,
       *                                        is set to `true` if an action object was specified
       *                                        on session instantiation, otherwise `false`.
       * @return {Object} The next state
       */
      getNextState(opts?: { runReducers: Boolean }): Object;

      /**
       * Calls the user-defined reducers and returns the next state.
       * If the session uses mutations, just returns the state.
       * Delegates to {@link Session#getNextState}
       *
       * @return {Object} the next state
       */
      reduce(): Object;
   }

   /**
    * Handles a single unit of work on the database backend.
    */
   export class Transaction {
      /**
       * Handles a single unit of work on the database backend.
       */
      constructor();
   }

   /**
    * A memoizer to use with redux-orm
    * selectors. When the memoized function is first run,
    * the memoizer will remember the models that are accessed
    * during that function run.
    *
    * On subsequent runs, the memoizer will check if those
    * models' states have changed compared to the previous run.
    *
    * Memoization algorithm operates like this:
    *
    * 1. Has the selector been run before? If not, go to 5.
    *
    * 2. If the selector has other input selectors in addition to the
    *    ORM state selector, check their results for equality with the previous results.
    *    If they aren't equal, go to 5.
    *
    * 3. Is the ORM state referentially equal to the previous ORM state the selector
    *    was called with? If yes, return the previous result.
    *
    * 4. Check which Model's states the selector has accessed on previous runs.
    *    Check for equality with each of those states versus their states in the
    *    previous ORM state. If all of them are equal, return the previous result.
    *
    * 5. Run the selector. Check the Session object used by the selector for
    *    which Model's states were accessed, and merge them with the previously
    *    saved information about accessed models (if-else branching can change
    *    which models are accessed on different inputs). Save the ORM state and
    *    other arguments the selector was called with, overriding previously
    *    saved values. Save the selector result. Return the selector result.
    *
    * @private
    * @param  {Function} func - function to memoize
    * @param  {Function} equalityCheck - equality check function to use with normal
    *                                  selector args
    * @param  {Schema} modelSchema - a redux-orm Schema instance
    * @return {Function} `func` memoized.
    */
   export function memoize(func: (() => any), equalityCheck: (() => any), modelSchema: Schema): (() => any);

   /**
    * @module utils
    */
   namespace utils {
      /**
       * A simple ListIterator implementation.
       */
      class ListIterator {
         /**
          * A simple ListIterator implementation.
          */
         constructor(list: any[], idx?: Number, getValue?: (() => any));

         /**
          * The default implementation for the `getValue` function.
          *
          * @param  {Number} idx - the current iterator index
          * @param  {Array} list - the list being iterated
          * @return {*} - the value at index `idx` in `list`.
          */
         getValue(idx: Number, list: any[]): any;

         /**
          * Returns the next element from the iterator instance.
          * Always returns an Object with keys `value` and `done`.
          * If the returned element is the last element being iterated,
          * `done` will equal `true`, otherwise `false`. `value` holds
          * the value returned by `getValue`.
          *
          * @return {Object|undefined} Object with keys `value` and `done`, or
          *                            `undefined` if the list index is out of bounds.
          */
         next(): (Object|undefined);
      }

      /**
       * Checks if the properties in `lookupObj` match
       * the corresponding properties in `entity`.
       *
       * @private
       * @param  {Object} lookupObj - properties to match against
       * @param  {Object} entity - object to match
       * @return {Boolean} Returns `true` if the property names in
       *                   `lookupObj` have the same values in `lookupObj`
       *                   and `entity`, `false` if not.
       */
      function match(lookupObj: Object, entity: Object): Boolean;

      /**
       * Returns the branch name for a many-to-many relation.
       * The name is the combination of the model name and the field name the relation
       * was declared. The field name's first letter is capitalized.
       *
       * Example: model `Author` has a many-to-many relation to the model `Book`, defined
       * in the `Author` field `books`. The many-to-many branch name will be `AuthorBooks`.
       *
       * @private
       * @param  {string} declarationModelName - the name of the model the many-to-many relation was declared on
       * @param  {string} fieldName            - the field name where the many-to-many relation was declared on
       * @return {string} The branch name for the many-to-many relation.
       */
      function m2mName(declarationModelName: string, fieldName: string): string;

      /**
       * Returns the fieldname that saves a foreign key to the
       * model id where the many-to-many relation was declared.
       *
       * Example: `Author` => `fromAuthorId`
       *
       * @private
       * @param  {string} declarationModelName - the name of the model where the relation was declared
       * @return {string} the field name in the through model for `declarationModelName`'s foreign key.
       */
      function m2mFromFieldName(declarationModelName: string): string;

      /**
       * Returns the fieldname that saves a foreign key in a many-to-many through model to the
       * model where the many-to-many relation was declared.
       *
       * Example: `Book` => `toBookId`
       *
       * @private
       * @param  {string} otherModelName - the name of the model that was the target of the many-to-many
       *                                   declaration.
       * @return {string} the field name in the through model for `otherModelName`'s foreign key..
       */
      function m2mToFieldName(otherModelName: string): string;

      /**
       * Normalizes `entity` to an id, where `entity` can be an id
       * or a Model instance.
       *
       * @private
       * @param  {*} entity - either a Model instance or an id value
       * @return {*} the id value of `entity`
       */
      function normalizeEntity(entity: any): any;
   }
}
