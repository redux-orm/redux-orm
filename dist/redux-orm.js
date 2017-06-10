(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("ReduxOrm", [], factory);
	else if(typeof exports === 'object')
		exports["ReduxOrm"] = factory();
	else
		root["ReduxOrm"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.createSelector = exports.createReducer = exports.oneToOne = exports.attr = exports.many = exports.fk = exports.OneToOne = exports.ManyToMany = exports.ForeignKey = exports.Session = exports.Backend = exports.Schema = exports.ORM = exports.Model = exports.QuerySet = exports.Attribute = undefined;
	
	var _QuerySet = __webpack_require__(1);
	
	var _QuerySet2 = _interopRequireDefault(_QuerySet);
	
	var _Model = __webpack_require__(261);
	
	var _Model2 = _interopRequireDefault(_Model);
	
	var _ORM = __webpack_require__(288);
	
	var _Session = __webpack_require__(267);
	
	var _Session2 = _interopRequireDefault(_Session);
	
	var _redux = __webpack_require__(307);
	
	var _fields = __webpack_require__(277);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Schema = _ORM.DeprecatedSchema;
	
	var Backend = function RemovedBackend() {
	    throw new Error('Having a custom Backend instance is now unsupported. ' + 'Documentation for database customization is upcoming, for now ' + 'please look at the db folder in the source.');
	};
	
	exports.Attribute = _fields.Attribute;
	exports.QuerySet = _QuerySet2.default;
	exports.Model = _Model2.default;
	exports.ORM = _ORM.ORM;
	exports.Schema = Schema;
	exports.Backend = Backend;
	exports.Session = _Session2.default;
	exports.ForeignKey = _fields.ForeignKey;
	exports.ManyToMany = _fields.ManyToMany;
	exports.OneToOne = _fields.OneToOne;
	exports.fk = _fields.fk;
	exports.many = _fields.many;
	exports.attr = _fields.attr;
	exports.oneToOne = _fields.oneToOne;
	exports.createReducer = _redux.createReducer;
	exports.createSelector = _redux.createSelector;
	exports.default = _Model2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _typeof2 = __webpack_require__(2);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	var _assign = __webpack_require__(70);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(75);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _mapValues = __webpack_require__(79);
	
	var _mapValues2 = _interopRequireDefault(_mapValues);
	
	var _utils = __webpack_require__(200);
	
	var _constants = __webpack_require__(260);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * This class is used to build and make queries to the database
	 * and operating the resulting set (such as updating attributes
	 * or deleting the records).
	 *
	 * The queries are built lazily. For example:
	 *
	 * ```javascript
	 * const qs = Book.all()
	 *     .filter(book => book.releaseYear > 1999)
	 *     .orderBy('name');
	 * ```
	 *
	 * Doesn't execute a query. The query is executed only when
	 * you need information from the query result, such as {@link QuerySet#count},
	 * {@link QuerySet#toRefArray}. After the query is executed, the resulting
	 * set is cached in the QuerySet instance.
	 *
	 * QuerySet instances also return copies, so chaining filters doesn't
	 * mutate the previous instances.
	 */
	var QuerySet = function () {
	    /**
	     * Creates a QuerySet. The constructor is mainly for internal use;
	     * You should access QuerySet instances from {@link Model}.
	     *
	     * @param  {Model} modelClass - the model class of objects in this QuerySet.
	     * @param  {any[]} clauses - query clauses needed to evaluate the set.
	     * @param {Object} [opts] - additional options
	     */
	    function QuerySet(modelClass, clauses, opts) {
	        (0, _classCallCheck3.default)(this, QuerySet);
	
	        (0, _assign2.default)(this, {
	            modelClass: modelClass,
	            clauses: clauses || []
	        });
	
	        this._opts = opts;
	    }
	
	    QuerySet.addSharedMethod = function addSharedMethod(methodName) {
	        this.sharedMethods = this.sharedMethods.concat(methodName);
	    };
	
	    QuerySet.prototype._new = function _new(clauses, userOpts) {
	        var opts = (0, _assign2.default)({}, this._opts, userOpts);
	        return new this.constructor(this.modelClass, clauses, opts);
	    };
	
	    QuerySet.prototype.toString = function toString() {
	        var _this = this;
	
	        this._evaluate();
	        var contents = this.rows.map(function (id) {
	            return _this.modelClass.withId(id).toString();
	        }).join('\n    - ');
	        return 'QuerySet contents: \n    - ' + contents;
	    };
	
	    /**
	     * Returns an array of the plain objects represented by the QuerySet.
	     * The plain objects are direct references to the store.
	     *
	     * @return {Object[]} references to the plain JS objects represented by
	     *                    the QuerySet
	     */
	
	
	    QuerySet.prototype.toRefArray = function toRefArray() {
	        this._evaluate();
	        return this.rows;
	    };
	
	    /**
	     * Returns an array of {@link Model} instances represented by the QuerySet.
	     * @return {Model[]} model instances represented by the QuerySet
	     */
	
	
	    QuerySet.prototype.toModelArray = function toModelArray() {
	        this._evaluate();
	        var ModelClass = this.modelClass;
	        return this.rows.map(function (props) {
	            return new ModelClass(props);
	        });
	    };
	
	    /**
	     * Returns the number of {@link Model} instances represented by the QuerySet.
	     *
	     * @return {number} length of the QuerySet
	     */
	
	
	    QuerySet.prototype.count = function count() {
	        this._evaluate();
	        return this.rows.length;
	    };
	
	    /**
	     * Checks if the {@link QuerySet} instance has any records matching the query
	     * in the database.
	     *
	     * @return {Boolean} `true` if the {@link QuerySet} instance contains entities, else `false`.
	     */
	
	
	    QuerySet.prototype.exists = function exists() {
	        return Boolean(this.count());
	    };
	
	    /**
	     * Returns the {@link Model} instance at index `index` in the {@link QuerySet} instance if
	     * `withRefs` flag is set to `false`, or a reference to the plain JavaScript
	     * object in the model state if `true`.
	     *
	     * @param  {number} index - index of the model instance to get
	     * @return {Model|undefined} a {@link Model} instance at index
	     *                           `index` in the {@link QuerySet} instance,
	     *                           or undefined if the index is out of bounds.
	     */
	
	
	    QuerySet.prototype.at = function at(index) {
	        this._evaluate();
	        if (index >= 0 && index < this.rows.length) {
	            var ModelClass = this.modelClass;
	            return new ModelClass(this.rows[index]);
	        }
	
	        return undefined;
	    };
	
	    /**
	     * Returns the {@link Model} instance at index 0 in the {@link QuerySet} instance.
	     * @return {Model}
	     */
	
	
	    QuerySet.prototype.first = function first() {
	        return this.at(0);
	    };
	
	    /**
	     * Returns the {@link Model} instance at index `QuerySet.count() - 1`
	     * @return {Model}
	     */
	
	
	    QuerySet.prototype.last = function last() {
	        this._evaluate();
	        return this.at(this.rows.length - 1);
	    };
	
	    /**
	     * Returns a new {@link QuerySet} instance with the same entities.
	     * @return {QuerySet} a new QuerySet with the same entities.
	     */
	
	
	    QuerySet.prototype.all = function all() {
	        return this._new(this.clauses);
	    };
	
	    /**
	     * Returns a new {@link QuerySet} instance with entities that match properties in `lookupObj`.
	     *
	     * @param  {Object} lookupObj - the properties to match objects with.
	     * @return {QuerySet} a new {@link QuerySet} instance with objects that passed the filter.
	     */
	
	
	    QuerySet.prototype.filter = function filter(lookupObj) {
	        var normalizedLookupObj = (typeof lookupObj === 'undefined' ? 'undefined' : (0, _typeof3.default)(lookupObj)) === 'object' ? (0, _mapValues2.default)(lookupObj, _utils.normalizeEntity) : lookupObj;
	        var filterDescriptor = { type: _constants.FILTER, payload: normalizedLookupObj };
	        return this._new(this.clauses.concat(filterDescriptor));
	    };
	
	    /**
	     * Returns a new {@link QuerySet} instance with entities that do not match
	     * properties in `lookupObj`.
	     *
	     * @param  {Object} lookupObj - the properties to unmatch objects with.
	     * @return {QuerySet} a new {@link QuerySet} instance with objects that passed the filter.
	     */
	
	
	    QuerySet.prototype.exclude = function exclude(lookupObj) {
	        var normalizedLookupObj = (typeof lookupObj === 'undefined' ? 'undefined' : (0, _typeof3.default)(lookupObj)) === 'object' ? (0, _mapValues2.default)(lookupObj, _utils.normalizeEntity) : lookupObj;
	        var excludeDescriptor = { type: _constants.EXCLUDE, payload: normalizedLookupObj };
	        return this._new(this.clauses.concat(excludeDescriptor));
	    };
	
	    QuerySet.prototype._evaluate = function _evaluate() {
	        if (!this._evaluated) {
	            var session = this.modelClass.session;
	            var querySpec = {
	                table: this.modelClass.modelName,
	                clauses: this.clauses
	            };
	
	            var _session$query = session.query(querySpec),
	                rows = _session$query.rows;
	
	            this.rows = rows;
	            this._evaluated = true;
	        }
	    };
	
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
	
	
	    QuerySet.prototype.orderBy = function orderBy(iteratees, orders) {
	        var orderByDescriptor = { type: _constants.ORDER_BY, payload: [iteratees, orders] };
	        return this._new(this.clauses.concat(orderByDescriptor));
	    };
	
	    /**
	     * Records an update specified with `mergeObj` to all the objects
	     * in the {@link QuerySet} instance.
	     *
	     * @param  {Object} mergeObj - an object to merge with all the objects in this
	     *                             queryset.
	     * @return {undefined}
	     */
	
	
	    QuerySet.prototype.update = function update(mergeObj) {
	        this.modelClass.session.applyUpdate({
	            action: _constants.UPDATE,
	            query: {
	                table: this.modelClass.modelName,
	                clauses: this.clauses
	            },
	            payload: mergeObj
	        });
	        this._evaluated = false;
	    };
	
	    /**
	     * Records a deletion of all the objects in this {@link QuerySet} instance.
	     * @return {undefined}
	     */
	
	
	    QuerySet.prototype.delete = function _delete() {
	        // eslint-disable-next-line no-underscore-dangle
	        this.toModelArray().forEach(function (model) {
	            return model._onDelete();
	        });
	
	        this.modelClass.session.applyUpdate({
	            action: _constants.DELETE,
	            query: {
	                table: this.modelClass.modelName,
	                clauses: this.clauses
	            }
	        });
	
	        this._evaluated = false;
	    };
	
	    // DEPRECATED AND REMOVED METHODS
	
	    QuerySet.prototype.map = function map() {
	        throw new Error('QuerySet.prototype.map is removed. ' + 'Call .toModelArray() or .toRefArray() first to map.');
	    };
	
	    QuerySet.prototype.forEach = function forEach() {
	        throw new Error('QuerySet.prototype.forEach is removed. ' + 'Call .toModelArray() or .toRefArray() first to iterate.');
	    };
	
	    (0, _createClass3.default)(QuerySet, [{
	        key: 'withModels',
	        get: function get() {
	            throw new Error('QuerySet.prototype.withModels is removed. ' + 'Use .toModelArray() or predicate functions that ' + 'instantiate Models from refs, e.g. new Model(ref).');
	        }
	    }, {
	        key: 'withRefs',
	        get: function get() {
	            (0, _utils.warnDeprecated)('QuerySet.prototype.withRefs is deprecated. ' + 'Query building operates on refs only now.');
	        }
	    }]);
	    return QuerySet;
	}();
	
	QuerySet.sharedMethods = ['count', 'at', 'all', 'last', 'first', 'exists', 'filter', 'exclude', 'orderBy', 'update', 'delete'];
	
	exports.default = QuerySet;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _iterator = __webpack_require__(3);
	
	var _iterator2 = _interopRequireDefault(_iterator);
	
	var _symbol = __webpack_require__(54);
	
	var _symbol2 = _interopRequireDefault(_symbol);
	
	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(4), __esModule: true };

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	__webpack_require__(49);
	module.exports = __webpack_require__(53).f('iterator');

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(6)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(9)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(7)
	  , defined   = __webpack_require__(8);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(10)
	  , $export        = __webpack_require__(11)
	  , redefine       = __webpack_require__(26)
	  , hide           = __webpack_require__(16)
	  , has            = __webpack_require__(27)
	  , Iterators      = __webpack_require__(28)
	  , $iterCreate    = __webpack_require__(29)
	  , setToStringTag = __webpack_require__(45)
	  , getPrototypeOf = __webpack_require__(47)
	  , ITERATOR       = __webpack_require__(46)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';
	
	var returnThis = function(){ return this; };
	
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	module.exports = true;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(12)
	  , core      = __webpack_require__(13)
	  , ctx       = __webpack_require__(14)
	  , hide      = __webpack_require__(16)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(15);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ }),
/* 15 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(17)
	  , createDesc = __webpack_require__(25);
	module.exports = __webpack_require__(21) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(18)
	  , IE8_DOM_DEFINE = __webpack_require__(20)
	  , toPrimitive    = __webpack_require__(24)
	  , dP             = Object.defineProperty;
	
	exports.f = __webpack_require__(21) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(19);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(21) && !__webpack_require__(22)(function(){
	  return Object.defineProperty(__webpack_require__(23)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(22)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(19)
	  , document = __webpack_require__(12).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(19);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(16);

/***/ }),
/* 27 */
/***/ (function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ }),
/* 28 */
/***/ (function(module, exports) {

	module.exports = {};

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(30)
	  , descriptor     = __webpack_require__(25)
	  , setToStringTag = __webpack_require__(45)
	  , IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(16)(IteratorPrototype, __webpack_require__(46)('iterator'), function(){ return this; });
	
	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(18)
	  , dPs         = __webpack_require__(31)
	  , enumBugKeys = __webpack_require__(43)
	  , IE_PROTO    = __webpack_require__(40)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';
	
	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(23)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(44).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};
	
	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(17)
	  , anObject = __webpack_require__(18)
	  , getKeys  = __webpack_require__(32);
	
	module.exports = __webpack_require__(21) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(33)
	  , enumBugKeys = __webpack_require__(43);
	
	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(27)
	  , toIObject    = __webpack_require__(34)
	  , arrayIndexOf = __webpack_require__(37)(false)
	  , IE_PROTO     = __webpack_require__(40)('IE_PROTO');
	
	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(35)
	  , defined = __webpack_require__(8);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(36);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ }),
/* 36 */
/***/ (function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(34)
	  , toLength  = __webpack_require__(38)
	  , toIndex   = __webpack_require__(39);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(7)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(7)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(41)('keys')
	  , uid    = __webpack_require__(42);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(12)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ }),
/* 42 */
/***/ (function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ }),
/* 43 */
/***/ (function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(12).document && document.documentElement;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	var def = __webpack_require__(17).f
	  , has = __webpack_require__(27)
	  , TAG = __webpack_require__(46)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(41)('wks')
	  , uid        = __webpack_require__(42)
	  , Symbol     = __webpack_require__(12).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(27)
	  , toObject    = __webpack_require__(48)
	  , IE_PROTO    = __webpack_require__(40)('IE_PROTO')
	  , ObjectProto = Object.prototype;
	
	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(8);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(50);
	var global        = __webpack_require__(12)
	  , hide          = __webpack_require__(16)
	  , Iterators     = __webpack_require__(28)
	  , TO_STRING_TAG = __webpack_require__(46)('toStringTag');
	
	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(51)
	  , step             = __webpack_require__(52)
	  , Iterators        = __webpack_require__(28)
	  , toIObject        = __webpack_require__(34);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(9)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ }),
/* 51 */
/***/ (function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ }),
/* 52 */
/***/ (function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(46);

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(55), __esModule: true };

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(56);
	__webpack_require__(67);
	__webpack_require__(68);
	__webpack_require__(69);
	module.exports = __webpack_require__(13).Symbol;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(12)
	  , has            = __webpack_require__(27)
	  , DESCRIPTORS    = __webpack_require__(21)
	  , $export        = __webpack_require__(11)
	  , redefine       = __webpack_require__(26)
	  , META           = __webpack_require__(57).KEY
	  , $fails         = __webpack_require__(22)
	  , shared         = __webpack_require__(41)
	  , setToStringTag = __webpack_require__(45)
	  , uid            = __webpack_require__(42)
	  , wks            = __webpack_require__(46)
	  , wksExt         = __webpack_require__(53)
	  , wksDefine      = __webpack_require__(58)
	  , keyOf          = __webpack_require__(59)
	  , enumKeys       = __webpack_require__(60)
	  , isArray        = __webpack_require__(63)
	  , anObject       = __webpack_require__(18)
	  , toIObject      = __webpack_require__(34)
	  , toPrimitive    = __webpack_require__(24)
	  , createDesc     = __webpack_require__(25)
	  , _create        = __webpack_require__(30)
	  , gOPNExt        = __webpack_require__(64)
	  , $GOPD          = __webpack_require__(66)
	  , $DP            = __webpack_require__(17)
	  , $keys          = __webpack_require__(32)
	  , gOPD           = $GOPD.f
	  , dP             = $DP.f
	  , gOPN           = gOPNExt.f
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , PROTOTYPE      = 'prototype'
	  , HIDDEN         = wks('_hidden')
	  , TO_PRIMITIVE   = wks('toPrimitive')
	  , isEnum         = {}.propertyIsEnumerable
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , OPSymbols      = shared('op-symbols')
	  , ObjectProto    = Object[PROTOTYPE]
	  , USE_NATIVE     = typeof $Symbol == 'function'
	  , QObject        = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
	
	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(dP({}, 'a', {
	    get: function(){ return dP(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  dP(it, key, D);
	  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
	} : dP;
	
	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};
	
	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};
	
	var $defineProperty = function defineProperty(it, key, D){
	  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if(has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  it  = toIObject(it);
	  key = toPrimitive(key, true);
	  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
	  var D = gOPD(it, key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var IS_OP  = it === ObjectProto
	    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
	  } return result;
	};
	
	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function(value){
	      if(this === ObjectProto)$set.call(OPSymbols, value);
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
	    return this._k;
	  });
	
	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f   = $defineProperty;
	  __webpack_require__(65).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(62).f  = $propertyIsEnumerable;
	  __webpack_require__(61).f = $getOwnPropertySymbols;
	
	  if(DESCRIPTORS && !__webpack_require__(10)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	
	  wksExt.f = function(name){
	    return wrap(wks(name));
	  }
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});
	
	for(var symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);
	
	for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);
	
	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});
	
	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});
	
	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it){
	    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	    var args = [it]
	      , i    = 1
	      , replacer, $replacer;
	    while(arguments.length > i)args.push(arguments[i++]);
	    replacer = args[1];
	    if(typeof replacer == 'function')$replacer = replacer;
	    if($replacer || !isArray(replacer))replacer = function(key, value){
	      if($replacer)value = $replacer.call(this, key, value);
	      if(!isSymbol(value))return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});
	
	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(16)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(42)('meta')
	  , isObject = __webpack_require__(19)
	  , has      = __webpack_require__(27)
	  , setDesc  = __webpack_require__(17).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(22)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(12)
	  , core           = __webpack_require__(13)
	  , LIBRARY        = __webpack_require__(10)
	  , wksExt         = __webpack_require__(53)
	  , defineProperty = __webpack_require__(17).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(32)
	  , toIObject = __webpack_require__(34);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(32)
	  , gOPS    = __webpack_require__(61)
	  , pIE     = __webpack_require__(62);
	module.exports = function(it){
	  var result     = getKeys(it)
	    , getSymbols = gOPS.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = pIE.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

/***/ }),
/* 61 */
/***/ (function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ }),
/* 62 */
/***/ (function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(36);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(34)
	  , gOPN      = __webpack_require__(65).f
	  , toString  = {}.toString;
	
	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];
	
	var getWindowNames = function(it){
	  try {
	    return gOPN(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};
	
	module.exports.f = function getOwnPropertyNames(it){
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(33)
	  , hiddenKeys = __webpack_require__(43).concat('length', 'prototype');
	
	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(62)
	  , createDesc     = __webpack_require__(25)
	  , toIObject      = __webpack_require__(34)
	  , toPrimitive    = __webpack_require__(24)
	  , has            = __webpack_require__(27)
	  , IE8_DOM_DEFINE = __webpack_require__(20)
	  , gOPD           = Object.getOwnPropertyDescriptor;
	
	exports.f = __webpack_require__(21) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ }),
/* 67 */
/***/ (function(module, exports) {



/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(58)('asyncIterator');

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(58)('observable');

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(71), __esModule: true };

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(72);
	module.exports = __webpack_require__(13).Object.assign;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(11);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(73)});

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(32)
	  , gOPS     = __webpack_require__(61)
	  , pIE      = __webpack_require__(62)
	  , toObject = __webpack_require__(48)
	  , IObject  = __webpack_require__(35)
	  , $assign  = Object.assign;
	
	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(22)(function(){
	  var A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , aLen  = arguments.length
	    , index = 1
	    , getSymbols = gOPS.f
	    , isEnum     = pIE.f;
	  while(aLen > index){
	    var S      = IObject(arguments[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  } return T;
	} : $assign;

/***/ }),
/* 74 */
/***/ (function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	
	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _defineProperty = __webpack_require__(76);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }
	
	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(77), __esModule: true };

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(78);
	var $Object = __webpack_require__(13).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(11);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(21), 'Object', {defineProperty: __webpack_require__(17).f});

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(80),
	    baseForOwn = __webpack_require__(96),
	    baseIteratee = __webpack_require__(120);
	
	/**
	 * Creates an object with the same keys as `object` and values generated
	 * by running each own enumerable string keyed property of `object` thru
	 * `iteratee`. The iteratee is invoked with three arguments:
	 * (value, key, object).
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Object} Returns the new mapped object.
	 * @see _.mapKeys
	 * @example
	 *
	 * var users = {
	 *   'fred':    { 'user': 'fred',    'age': 40 },
	 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
	 * };
	 *
	 * _.mapValues(users, function(o) { return o.age; });
	 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.mapValues(users, 'age');
	 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	 */
	function mapValues(object, iteratee) {
	  var result = {};
	  iteratee = baseIteratee(iteratee, 3);
	
	  baseForOwn(object, function(value, key, object) {
	    baseAssignValue(result, key, iteratee(value, key, object));
	  });
	  return result;
	}
	
	module.exports = mapValues;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	var defineProperty = __webpack_require__(81);
	
	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function baseAssignValue(object, key, value) {
	  if (key == '__proto__' && defineProperty) {
	    defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}
	
	module.exports = baseAssignValue;


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(82);
	
	var defineProperty = (function() {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());
	
	module.exports = defineProperty;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsNative = __webpack_require__(83),
	    getValue = __webpack_require__(95);
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}
	
	module.exports = getNative;


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(84),
	    isMasked = __webpack_require__(92),
	    isObject = __webpack_require__(91),
	    toSource = __webpack_require__(94);
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	module.exports = baseIsNative;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(85),
	    isObject = __webpack_require__(91);
	
	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  if (!isObject(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}
	
	module.exports = isFunction;


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(86),
	    getRawTag = __webpack_require__(89),
	    objectToString = __webpack_require__(90);
	
	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';
	
	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;
	
	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}
	
	module.exports = baseGetTag;


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

	var root = __webpack_require__(87);
	
	/** Built-in value references. */
	var Symbol = root.Symbol;
	
	module.exports = Symbol;


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

	var freeGlobal = __webpack_require__(88);
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	module.exports = root;


/***/ }),
/* 88 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	module.exports = freeGlobal;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(86);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;
	
	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;
	
	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];
	
	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}
	
	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}
	
	module.exports = getRawTag;


/***/ }),
/* 90 */
/***/ (function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;
	
	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}
	
	module.exports = objectToString;


/***/ }),
/* 91 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}
	
	module.exports = isObject;


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

	var coreJsData = __webpack_require__(93);
	
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());
	
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}
	
	module.exports = isMasked;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

	var root = __webpack_require__(87);
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	module.exports = coreJsData;


/***/ }),
/* 94 */
/***/ (function(module, exports) {

	/** Used for built-in method references. */
	var funcProto = Function.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}
	
	module.exports = toSource;


/***/ }),
/* 95 */
/***/ (function(module, exports) {

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	
	module.exports = getValue;


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(97),
	    keys = __webpack_require__(99);
	
	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}
	
	module.exports = baseForOwn;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(98);
	
	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();
	
	module.exports = baseFor;


/***/ }),
/* 98 */
/***/ (function(module, exports) {

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;
	
	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	
	module.exports = createBaseFor;


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayLikeKeys = __webpack_require__(100),
	    baseKeys = __webpack_require__(115),
	    isArrayLike = __webpack_require__(119);
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}
	
	module.exports = keys;


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

	var baseTimes = __webpack_require__(101),
	    isArguments = __webpack_require__(102),
	    isArray = __webpack_require__(105),
	    isBuffer = __webpack_require__(106),
	    isIndex = __webpack_require__(109),
	    isTypedArray = __webpack_require__(110);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray(value),
	      isArg = !isArr && isArguments(value),
	      isBuff = !isArr && !isArg && isBuffer(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;
	
	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = arrayLikeKeys;


/***/ }),
/* 101 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);
	
	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}
	
	module.exports = baseTimes;


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsArguments = __webpack_require__(103),
	    isObjectLike = __webpack_require__(104);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
	    !propertyIsEnumerable.call(value, 'callee');
	};
	
	module.exports = isArguments;


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(85),
	    isObjectLike = __webpack_require__(104);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';
	
	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments(value) {
	  return isObjectLike(value) && baseGetTag(value) == argsTag;
	}
	
	module.exports = baseIsArguments;


/***/ }),
/* 104 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ }),
/* 105 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;
	
	module.exports = isArray;


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(87),
	    stubFalse = __webpack_require__(108);
	
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
	
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
	
	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;
	
	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
	
	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;
	
	module.exports = isBuffer;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(107)(module)))

/***/ }),
/* 107 */
/***/ (function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }),
/* 108 */
/***/ (function(module, exports) {

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}
	
	module.exports = stubFalse;


/***/ }),
/* 109 */
/***/ (function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}
	
	module.exports = isIndex;


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsTypedArray = __webpack_require__(111),
	    baseUnary = __webpack_require__(113),
	    nodeUtil = __webpack_require__(114);
	
	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
	
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
	
	module.exports = isTypedArray;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(85),
	    isLength = __webpack_require__(112),
	    isObjectLike = __webpack_require__(104);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;
	
	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}
	
	module.exports = baseIsTypedArray;


/***/ }),
/* 112 */
/***/ (function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	module.exports = isLength;


/***/ }),
/* 113 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}
	
	module.exports = baseUnary;


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__(88);
	
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
	
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
	
	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;
	
	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;
	
	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());
	
	module.exports = nodeUtil;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(107)(module)))

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

	var isPrototype = __webpack_require__(116),
	    nativeKeys = __webpack_require__(117);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = baseKeys;


/***/ }),
/* 116 */
/***/ (function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;
	
	  return value === proto;
	}
	
	module.exports = isPrototype;


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(118);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);
	
	module.exports = nativeKeys;


/***/ }),
/* 118 */
/***/ (function(module, exports) {

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}
	
	module.exports = overArg;


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(84),
	    isLength = __webpack_require__(112);
	
	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}
	
	module.exports = isArrayLike;


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(121),
	    baseMatchesProperty = __webpack_require__(180),
	    identity = __webpack_require__(196),
	    isArray = __webpack_require__(105),
	    property = __webpack_require__(197);
	
	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}
	
	module.exports = baseIteratee;


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(122),
	    getMatchData = __webpack_require__(177),
	    matchesStrictComparable = __webpack_require__(179);
	
	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}
	
	module.exports = baseMatches;


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(123),
	    baseIsEqual = __webpack_require__(153);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;
	
	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];
	
	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	
	module.exports = baseIsMatch;


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(124),
	    stackClear = __webpack_require__(132),
	    stackDelete = __webpack_require__(133),
	    stackGet = __webpack_require__(134),
	    stackHas = __webpack_require__(135),
	    stackSet = __webpack_require__(136);
	
	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	}
	
	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;
	
	module.exports = Stack;


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

	var listCacheClear = __webpack_require__(125),
	    listCacheDelete = __webpack_require__(126),
	    listCacheGet = __webpack_require__(129),
	    listCacheHas = __webpack_require__(130),
	    listCacheSet = __webpack_require__(131);
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	
	module.exports = ListCache;


/***/ }),
/* 125 */
/***/ (function(module, exports) {

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	  this.size = 0;
	}
	
	module.exports = listCacheClear;


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(127);
	
	/** Used for built-in method references. */
	var arrayProto = Array.prototype;
	
	/** Built-in value references. */
	var splice = arrayProto.splice;
	
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}
	
	module.exports = listCacheDelete;


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(128);
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	
	module.exports = assocIndexOf;


/***/ }),
/* 128 */
/***/ (function(module, exports) {

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}
	
	module.exports = eq;


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(127);
	
	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  return index < 0 ? undefined : data[index][1];
	}
	
	module.exports = listCacheGet;


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(127);
	
	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}
	
	module.exports = listCacheHas;


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(127);
	
	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	module.exports = listCacheSet;


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(124);
	
	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	  this.size = 0;
	}
	
	module.exports = stackClear;


/***/ }),
/* 133 */
/***/ (function(module, exports) {

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	      result = data['delete'](key);
	
	  this.size = data.size;
	  return result;
	}
	
	module.exports = stackDelete;


/***/ }),
/* 134 */
/***/ (function(module, exports) {

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}
	
	module.exports = stackGet;


/***/ }),
/* 135 */
/***/ (function(module, exports) {

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}
	
	module.exports = stackHas;


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(124),
	    Map = __webpack_require__(137),
	    MapCache = __webpack_require__(138);
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var data = this.__data__;
	  if (data instanceof ListCache) {
	    var pairs = data.__data__;
	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new MapCache(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}
	
	module.exports = stackSet;


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(82),
	    root = __webpack_require__(87);
	
	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');
	
	module.exports = Map;


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

	var mapCacheClear = __webpack_require__(139),
	    mapCacheDelete = __webpack_require__(147),
	    mapCacheGet = __webpack_require__(150),
	    mapCacheHas = __webpack_require__(151),
	    mapCacheSet = __webpack_require__(152);
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	
	module.exports = MapCache;


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

	var Hash = __webpack_require__(140),
	    ListCache = __webpack_require__(124),
	    Map = __webpack_require__(137);
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}
	
	module.exports = mapCacheClear;


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

	var hashClear = __webpack_require__(141),
	    hashDelete = __webpack_require__(143),
	    hashGet = __webpack_require__(144),
	    hashHas = __webpack_require__(145),
	    hashSet = __webpack_require__(146);
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	
	module.exports = Hash;


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(142);
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	  this.size = 0;
	}
	
	module.exports = hashClear;


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(82);
	
	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');
	
	module.exports = nativeCreate;


/***/ }),
/* 143 */
/***/ (function(module, exports) {

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}
	
	module.exports = hashDelete;


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(142);
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}
	
	module.exports = hashGet;


/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(142);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
	}
	
	module.exports = hashHas;


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(142);
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}
	
	module.exports = hashSet;


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(148);
	
	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  var result = getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}
	
	module.exports = mapCacheDelete;


/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

	var isKeyable = __webpack_require__(149);
	
	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}
	
	module.exports = getMapData;


/***/ }),
/* 149 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}
	
	module.exports = isKeyable;


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(148);
	
	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}
	
	module.exports = mapCacheGet;


/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(148);
	
	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}
	
	module.exports = mapCacheHas;


/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(148);
	
	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;
	
	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}
	
	module.exports = mapCacheSet;


/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(154),
	    isObjectLike = __webpack_require__(104);
	
	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}
	
	module.exports = baseIsEqual;


/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(123),
	    equalArrays = __webpack_require__(155),
	    equalByTag = __webpack_require__(161),
	    equalObjects = __webpack_require__(165),
	    getTag = __webpack_require__(172),
	    isArray = __webpack_require__(105),
	    isBuffer = __webpack_require__(106),
	    isTypedArray = __webpack_require__(110);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = objIsArr ? arrayTag : getTag(object),
	      othTag = othIsArr ? arrayTag : getTag(other);
	
	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;
	
	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;
	
	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;
	
	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}
	
	module.exports = baseIsEqualDeep;


/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(156),
	    arraySome = __webpack_require__(159),
	    cacheHas = __webpack_require__(160);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      arrLength = array.length,
	      othLength = other.length;
	
	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;
	
	  stack.set(array, other);
	  stack.set(other, array);
	
	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];
	
	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}
	
	module.exports = equalArrays;


/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(138),
	    setCacheAdd = __webpack_require__(157),
	    setCacheHas = __webpack_require__(158);
	
	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;
	
	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}
	
	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	
	module.exports = SetCache;


/***/ }),
/* 157 */
/***/ (function(module, exports) {

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}
	
	module.exports = setCacheAdd;


/***/ }),
/* 158 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}
	
	module.exports = setCacheHas;


/***/ }),
/* 159 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;
	
	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	module.exports = arraySome;


/***/ }),
/* 160 */
/***/ (function(module, exports) {

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}
	
	module.exports = cacheHas;


/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(86),
	    Uint8Array = __webpack_require__(162),
	    eq = __webpack_require__(128),
	    equalArrays = __webpack_require__(155),
	    mapToArray = __webpack_require__(163),
	    setToArray = __webpack_require__(164);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]';
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;
	
	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;
	
	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);
	
	    case errorTag:
	      return object.name == other.name && object.message == other.message;
	
	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');
	
	    case mapTag:
	      var convert = mapToArray;
	
	    case setTag:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
	      convert || (convert = setToArray);
	
	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG;
	
	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;
	
	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}
	
	module.exports = equalByTag;


/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

	var root = __webpack_require__(87);
	
	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;
	
	module.exports = Uint8Array;


/***/ }),
/* 163 */
/***/ (function(module, exports) {

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);
	
	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}
	
	module.exports = mapToArray;


/***/ }),
/* 164 */
/***/ (function(module, exports) {

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);
	
	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}
	
	module.exports = setToArray;


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

	var getAllKeys = __webpack_require__(166);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      objProps = getAllKeys(object),
	      objLength = objProps.length,
	      othProps = getAllKeys(other),
	      othLength = othProps.length;
	
	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);
	
	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];
	
	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;
	
	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}
	
	module.exports = equalObjects;


/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetAllKeys = __webpack_require__(167),
	    getSymbols = __webpack_require__(169),
	    keys = __webpack_require__(99);
	
	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}
	
	module.exports = getAllKeys;


/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(168),
	    isArray = __webpack_require__(105);
	
	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}
	
	module.exports = baseGetAllKeys;


/***/ }),
/* 168 */
/***/ (function(module, exports) {

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;
	
	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}
	
	module.exports = arrayPush;


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(170),
	    stubArray = __webpack_require__(171);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;
	
	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter(nativeGetSymbols(object), function(symbol) {
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};
	
	module.exports = getSymbols;


/***/ }),
/* 170 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];
	
	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}
	
	module.exports = arrayFilter;


/***/ }),
/* 171 */
/***/ (function(module, exports) {

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}
	
	module.exports = stubArray;


/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

	var DataView = __webpack_require__(173),
	    Map = __webpack_require__(137),
	    Promise = __webpack_require__(174),
	    Set = __webpack_require__(175),
	    WeakMap = __webpack_require__(176),
	    baseGetTag = __webpack_require__(85),
	    toSource = __webpack_require__(94);
	
	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';
	
	var dataViewTag = '[object DataView]';
	
	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);
	
	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;
	
	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = baseGetTag(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';
	
	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}
	
	module.exports = getTag;


/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(82),
	    root = __webpack_require__(87);
	
	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');
	
	module.exports = DataView;


/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(82),
	    root = __webpack_require__(87);
	
	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');
	
	module.exports = Promise;


/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(82),
	    root = __webpack_require__(87);
	
	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');
	
	module.exports = Set;


/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(82),
	    root = __webpack_require__(87);
	
	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');
	
	module.exports = WeakMap;


/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(178),
	    keys = __webpack_require__(99);
	
	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys(object),
	      length = result.length;
	
	  while (length--) {
	    var key = result[length],
	        value = object[key];
	
	    result[length] = [key, value, isStrictComparable(value)];
	  }
	  return result;
	}
	
	module.exports = getMatchData;


/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(91);
	
	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}
	
	module.exports = isStrictComparable;


/***/ }),
/* 179 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}
	
	module.exports = matchesStrictComparable;


/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(153),
	    get = __webpack_require__(181),
	    hasIn = __webpack_require__(193),
	    isKey = __webpack_require__(184),
	    isStrictComparable = __webpack_require__(178),
	    matchesStrictComparable = __webpack_require__(179),
	    toKey = __webpack_require__(192);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}
	
	module.exports = baseMatchesProperty;


/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(182);
	
	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}
	
	module.exports = get;


/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(183),
	    toKey = __webpack_require__(192);
	
	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = castPath(path, object);
	
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}
	
	module.exports = baseGet;


/***/ }),
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(105),
	    isKey = __webpack_require__(184),
	    stringToPath = __webpack_require__(186),
	    toString = __webpack_require__(189);
	
	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value, object) {
	  if (isArray(value)) {
	    return value;
	  }
	  return isKey(value, object) ? [value] : stringToPath(toString(value));
	}
	
	module.exports = castPath;


/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(105),
	    isSymbol = __webpack_require__(185);
	
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;
	
	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}
	
	module.exports = isKey;


/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(85),
	    isObjectLike = __webpack_require__(104);
	
	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && baseGetTag(value) == symbolTag);
	}
	
	module.exports = isSymbol;


/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

	var memoizeCapped = __webpack_require__(187);
	
	/** Used to match property names within property paths. */
	var reLeadingDot = /^\./,
	    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoizeCapped(function(string) {
	  var result = [];
	  if (reLeadingDot.test(string)) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});
	
	module.exports = stringToPath;


/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

	var memoize = __webpack_require__(188);
	
	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;
	
	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped(func) {
	  var result = memoize(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });
	
	  var cache = result.cache;
	  return result;
	}
	
	module.exports = memoizeCapped;


/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(138);
	
	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;
	
	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}
	
	// Expose `MapCache`.
	memoize.Cache = MapCache;
	
	module.exports = memoize;


/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(190);
	
	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}
	
	module.exports = toString;


/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(86),
	    arrayMap = __webpack_require__(191),
	    isArray = __webpack_require__(105),
	    isSymbol = __webpack_require__(185);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;
	
	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isArray(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap(value, baseToString) + '';
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	module.exports = baseToString;


/***/ }),
/* 191 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);
	
	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}
	
	module.exports = arrayMap;


/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(185);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	module.exports = toKey;


/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

	var baseHasIn = __webpack_require__(194),
	    hasPath = __webpack_require__(195);
	
	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}
	
	module.exports = hasIn;


/***/ }),
/* 194 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}
	
	module.exports = baseHasIn;


/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(183),
	    isArguments = __webpack_require__(102),
	    isArray = __webpack_require__(105),
	    isIndex = __webpack_require__(109),
	    isLength = __webpack_require__(112),
	    toKey = __webpack_require__(192);
	
	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = castPath(path, object);
	
	  var index = -1,
	      length = path.length,
	      result = false;
	
	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isArguments(object));
	}
	
	module.exports = hasPath;


/***/ }),
/* 196 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	module.exports = identity;


/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(198),
	    basePropertyDeep = __webpack_require__(199),
	    isKey = __webpack_require__(184),
	    toKey = __webpack_require__(192);
	
	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}
	
	module.exports = property;


/***/ }),
/* 198 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	module.exports = baseProperty;


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(182);
	
	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}
	
	module.exports = basePropertyDeep;


/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.warnDeprecated = exports.getBatchToken = exports.arrayDiffActions = exports.includes = exports.ops = exports.objectShallowEquals = exports.reverseFieldErrorMessage = exports.normalizeEntity = exports.reverseFieldName = exports.m2mToFieldName = exports.m2mFromFieldName = exports.m2mName = exports.attachQuerySetMethods = undefined;
	
	var _keys = __webpack_require__(201);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _defineProperty = __webpack_require__(76);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	var _getOwnPropertyDescriptor = __webpack_require__(205);
	
	var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);
	
	var _getPrototypeOf = __webpack_require__(208);
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _forOwn = __webpack_require__(211);
	
	var _forOwn2 = _interopRequireDefault(_forOwn);
	
	var _includes = __webpack_require__(213);
	
	var _includes2 = _interopRequireDefault(_includes);
	
	var _immutableOps = __webpack_require__(224);
	
	var _immutableOps2 = _interopRequireDefault(_immutableOps);
	
	var _intersection = __webpack_require__(243);
	
	var _intersection2 = _interopRequireDefault(_intersection);
	
	var _difference = __webpack_require__(256);
	
	var _difference2 = _interopRequireDefault(_difference);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function warnDeprecated(msg) {
	    var logger = typeof console.warn === 'function' ? console.warn.bind(console) : console.log.bind(console);
	    return logger(msg);
	}
	
	/**
	 * @module utils
	 */
	
	function capitalize(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
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
	function m2mName(declarationModelName, fieldName) {
	    return declarationModelName + capitalize(fieldName);
	}
	
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
	function m2mFromFieldName(declarationModelName) {
	    return 'from' + declarationModelName + 'Id';
	}
	
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
	function m2mToFieldName(otherModelName) {
	    return 'to' + otherModelName + 'Id';
	}
	
	function reverseFieldName(modelName) {
	    return modelName.toLowerCase() + 'Set'; // eslint-disable-line prefer-template
	}
	
	function querySetDelegatorFactory(methodName) {
	    return function querySetDelegator() {
	        var _getQuerySet;
	
	        return (_getQuerySet = this.getQuerySet())[methodName].apply(_getQuerySet, arguments);
	    };
	}
	
	function querySetGetterDelegatorFactory(getterName) {
	    return function querySetGetterDelegator() {
	        var qs = this.getQuerySet();
	        return qs[getterName];
	    };
	}
	
	function forEachSuperClass(subClass, func) {
	    var currClass = subClass;
	    while (currClass !== Function.prototype) {
	        func(currClass);
	        currClass = (0, _getPrototypeOf2.default)(currClass);
	    }
	}
	
	function attachQuerySetMethods(modelClass, querySetClass) {
	    var leftToDefine = querySetClass.sharedMethods.slice();
	
	    // There is no way to get a property descriptor for the whole prototype chain;
	    // only from an objects own properties. Therefore we traverse the whole prototype
	    // chain for querySet.
	    forEachSuperClass(querySetClass, function (cls) {
	        for (var i = 0; i < leftToDefine.length; i++) {
	            var defined = false;
	            var methodName = leftToDefine[i];
	            var descriptor = (0, _getOwnPropertyDescriptor2.default)(cls.prototype, methodName);
	            if (typeof descriptor !== 'undefined') {
	                if (typeof descriptor.get !== 'undefined') {
	                    descriptor.get = querySetGetterDelegatorFactory(methodName);
	                    (0, _defineProperty2.default)(modelClass, methodName, descriptor);
	                    defined = true;
	                } else if (typeof descriptor.value === 'function') {
	                    modelClass[methodName] = querySetDelegatorFactory(methodName);
	                    defined = true;
	                }
	            }
	            if (defined) {
	                leftToDefine.splice(i--, 1);
	            }
	        }
	    });
	}
	
	/**
	 * Normalizes `entity` to an id, where `entity` can be an id
	 * or a Model instance.
	 *
	 * @private
	 * @param  {*} entity - either a Model instance or an id value
	 * @return {*} the id value of `entity`
	 */
	function normalizeEntity(entity) {
	    if (entity !== null && typeof entity !== 'undefined' && typeof entity.getId === 'function') {
	        return entity.getId();
	    }
	    return entity;
	}
	
	function reverseFieldErrorMessage(modelName, fieldName, toModelName, backwardsFieldName) {
	    return ['Reverse field ' + backwardsFieldName + ' already defined', ' on model ' + toModelName + '. To fix, set a custom related', ' name on ' + modelName + '.' + fieldName + '.'].join('');
	}
	
	function objectShallowEquals(a, b) {
	    var keysInA = 0;
	
	    // eslint-disable-next-line consistent-return
	    (0, _forOwn2.default)(a, function (value, key) {
	        if (!b.hasOwnProperty(key) || b[key] !== value) {
	            return false;
	        }
	        keysInA++;
	    });
	
	    return keysInA === (0, _keys2.default)(b).length;
	}
	
	function arrayDiffActions(sourceArr, targetArr) {
	    var itemsInBoth = (0, _intersection2.default)(sourceArr, targetArr);
	    var deleteItems = (0, _difference2.default)(sourceArr, itemsInBoth);
	    var addItems = (0, _difference2.default)(targetArr, itemsInBoth);
	
	    if (deleteItems.length || addItems.length) {
	        return {
	            delete: deleteItems,
	            add: addItems
	        };
	    }
	    return null;
	}
	
	var getBatchToken = _immutableOps2.default.getBatchToken;
	exports.attachQuerySetMethods = attachQuerySetMethods;
	exports.m2mName = m2mName;
	exports.m2mFromFieldName = m2mFromFieldName;
	exports.m2mToFieldName = m2mToFieldName;
	exports.reverseFieldName = reverseFieldName;
	exports.normalizeEntity = normalizeEntity;
	exports.reverseFieldErrorMessage = reverseFieldErrorMessage;
	exports.objectShallowEquals = objectShallowEquals;
	exports.ops = _immutableOps2.default;
	exports.includes = _includes2.default;
	exports.arrayDiffActions = arrayDiffActions;
	exports.getBatchToken = getBatchToken;
	exports.warnDeprecated = warnDeprecated;

/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(202), __esModule: true };

/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(203);
	module.exports = __webpack_require__(13).Object.keys;

/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(48)
	  , $keys    = __webpack_require__(32);
	
	__webpack_require__(204)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(11)
	  , core    = __webpack_require__(13)
	  , fails   = __webpack_require__(22);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(206), __esModule: true };

/***/ }),
/* 206 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(207);
	var $Object = __webpack_require__(13).Object;
	module.exports = function getOwnPropertyDescriptor(it, key){
	  return $Object.getOwnPropertyDescriptor(it, key);
	};

/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject                 = __webpack_require__(34)
	  , $getOwnPropertyDescriptor = __webpack_require__(66).f;
	
	__webpack_require__(204)('getOwnPropertyDescriptor', function(){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ }),
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(209), __esModule: true };

/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(210);
	module.exports = __webpack_require__(13).Object.getPrototypeOf;

/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.9 Object.getPrototypeOf(O)
	var toObject        = __webpack_require__(48)
	  , $getPrototypeOf = __webpack_require__(47);
	
	__webpack_require__(204)('getPrototypeOf', function(){
	  return function getPrototypeOf(it){
	    return $getPrototypeOf(toObject(it));
	  };
	});

/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(96),
	    castFunction = __webpack_require__(212);
	
	/**
	 * Iterates over own enumerable string keyed properties of an object and
	 * invokes `iteratee` for each property. The iteratee is invoked with three
	 * arguments: (value, key, object). Iteratee functions may exit iteration
	 * early by explicitly returning `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.3.0
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 * @see _.forOwnRight
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.forOwn(new Foo, function(value, key) {
	 *   console.log(key);
	 * });
	 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
	 */
	function forOwn(object, iteratee) {
	  return object && baseForOwn(object, castFunction(iteratee));
	}
	
	module.exports = forOwn;


/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(196);
	
	/**
	 * Casts `value` to `identity` if it's not a function.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Function} Returns cast function.
	 */
	function castFunction(value) {
	  return typeof value == 'function' ? value : identity;
	}
	
	module.exports = castFunction;


/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(214),
	    isArrayLike = __webpack_require__(119),
	    isString = __webpack_require__(218),
	    toInteger = __webpack_require__(219),
	    values = __webpack_require__(222);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Checks if `value` is in `collection`. If `collection` is a string, it's
	 * checked for a substring of `value`, otherwise
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * is used for equality comparisons. If `fromIndex` is negative, it's used as
	 * the offset from the end of `collection`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
	 * @returns {boolean} Returns `true` if `value` is found, else `false`.
	 * @example
	 *
	 * _.includes([1, 2, 3], 1);
	 * // => true
	 *
	 * _.includes([1, 2, 3], 1, 2);
	 * // => false
	 *
	 * _.includes({ 'a': 1, 'b': 2 }, 1);
	 * // => true
	 *
	 * _.includes('abcd', 'bc');
	 * // => true
	 */
	function includes(collection, value, fromIndex, guard) {
	  collection = isArrayLike(collection) ? collection : values(collection);
	  fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;
	
	  var length = collection.length;
	  if (fromIndex < 0) {
	    fromIndex = nativeMax(length + fromIndex, 0);
	  }
	  return isString(collection)
	    ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
	    : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
	}
	
	module.exports = includes;


/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFindIndex = __webpack_require__(215),
	    baseIsNaN = __webpack_require__(216),
	    strictIndexOf = __webpack_require__(217);
	
	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  return value === value
	    ? strictIndexOf(array, value, fromIndex)
	    : baseFindIndex(array, baseIsNaN, fromIndex);
	}
	
	module.exports = baseIndexOf;


/***/ }),
/* 215 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 1 : -1);
	
	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = baseFindIndex;


/***/ }),
/* 216 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */
	function baseIsNaN(value) {
	  return value !== value;
	}
	
	module.exports = baseIsNaN;


/***/ }),
/* 217 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.indexOf` which performs strict equality
	 * comparisons of values, i.e. `===`.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function strictIndexOf(array, value, fromIndex) {
	  var index = fromIndex - 1,
	      length = array.length;
	
	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = strictIndexOf;


/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(85),
	    isArray = __webpack_require__(105),
	    isObjectLike = __webpack_require__(104);
	
	/** `Object#toString` result references. */
	var stringTag = '[object String]';
	
	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' ||
	    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
	}
	
	module.exports = isString;


/***/ }),
/* 219 */
/***/ (function(module, exports, __webpack_require__) {

	var toFinite = __webpack_require__(220);
	
	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;
	
	  return result === result ? (remainder ? result - remainder : result) : 0;
	}
	
	module.exports = toInteger;


/***/ }),
/* 220 */
/***/ (function(module, exports, __webpack_require__) {

	var toNumber = __webpack_require__(221);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;
	
	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}
	
	module.exports = toFinite;


/***/ }),
/* 221 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(91),
	    isSymbol = __webpack_require__(185);
	
	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;
	
	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;
	
	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
	
	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;
	
	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;
	
	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;
	
	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}
	
	module.exports = toNumber;


/***/ }),
/* 222 */
/***/ (function(module, exports, __webpack_require__) {

	var baseValues = __webpack_require__(223),
	    keys = __webpack_require__(99);
	
	/**
	 * Creates an array of the own enumerable string keyed property values of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property values.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.values(new Foo);
	 * // => [1, 2] (iteration order is not guaranteed)
	 *
	 * _.values('hi');
	 * // => ['h', 'i']
	 */
	function values(object) {
	  return object == null ? [] : baseValues(object, keys(object));
	}
	
	module.exports = values;


/***/ }),
/* 223 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(191);
	
	/**
	 * The base implementation of `_.values` and `_.valuesIn` which creates an
	 * array of `object` property values corresponding to the property names
	 * of `props`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} props The property names to get values for.
	 * @returns {Object} Returns the array of property values.
	 */
	function baseValues(object, props) {
	  return arrayMap(props, function(key) {
	    return object[key];
	  });
	}
	
	module.exports = baseValues;


/***/ }),
/* 224 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ops = exports.getBatchToken = undefined;
	
	var _toConsumableArray2 = __webpack_require__(225);
	
	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
	
	var _assign = __webpack_require__(70);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _defineProperty = __webpack_require__(76);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	var _symbol = __webpack_require__(54);
	
	var _symbol2 = _interopRequireDefault(_symbol);
	
	var _typeof2 = __webpack_require__(2);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	exports.canMutate = canMutate;
	exports.getImmutableOps = getImmutableOps;
	
	var _curry = __webpack_require__(235);
	
	var _curry2 = _interopRequireDefault(_curry);
	
	var _ = __webpack_require__(242);
	
	var _2 = _interopRequireDefault(_);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function forOwn(obj, fn) {
	    for (var key in obj) {
	        if (obj.hasOwnProperty(key)) {
	            fn(obj[key], key);
	        }
	    }
	}
	
	function isArrayLike(value) {
	    return value && (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object' && typeof value.length === 'number' && value.length >= 0 && value.length % 1 === 0;
	}
	
	var OWNER_ID_TAG = '@@_______immutableOpsOwnerID';
	
	function fastArrayCopy(arr) {
	    var copied = new Array(arr.length);
	    for (var i = 0; i < arr.length; i++) {
	        copied[i] = arr[i];
	    }
	    return copied;
	}
	
	function canMutate(obj, ownerID) {
	    if (!ownerID) return false;
	    return obj[OWNER_ID_TAG] === ownerID;
	}
	
	var newOwnerID = typeof _symbol2.default === 'function' ? function () {
	    return (0, _symbol2.default)('ownerID');
	} : function () {
	    return {};
	};
	
	var getBatchToken = exports.getBatchToken = newOwnerID;
	
	function addOwnerID(obj, ownerID) {
	    (0, _defineProperty2.default)(obj, OWNER_ID_TAG, {
	        value: ownerID,
	        configurable: true,
	        enumerable: false
	    });
	
	    return obj;
	}
	
	function prepareNewObject(instance, ownerID) {
	    if (ownerID) {
	        addOwnerID(instance, ownerID);
	    }
	    return instance;
	}
	
	function forceArray(arg) {
	    if (!(arg instanceof Array)) {
	        return [arg];
	    }
	    return arg;
	}
	
	var PATH_SEPARATOR = '.';
	
	function normalizePath(pathArg) {
	    if (typeof pathArg === 'string') {
	        if (pathArg.indexOf(PATH_SEPARATOR) === -1) {
	            return [pathArg];
	        }
	        return pathArg.split(PATH_SEPARATOR);
	    }
	
	    return pathArg;
	}
	
	function mutableSet(key, value, obj) {
	    obj[key] = value;
	    return obj;
	}
	
	function mutableSetIn(_pathArg, value, obj) {
	    var originalPathArg = normalizePath(_pathArg);
	
	    var pathLen = originalPathArg.length;
	
	    var done = false;
	    var idx = 0;
	    var acc = obj;
	    var curr = originalPathArg[idx];
	
	    while (!done) {
	        if (idx === pathLen - 1) {
	            acc[curr] = value;
	            done = true;
	        } else {
	            var currType = (0, _typeof3.default)(acc[curr]);
	
	            if (currType === 'undefined') {
	                var newObj = {};
	                prepareNewObject(newObj, null);
	                acc[curr] = newObj;
	            } else if (currType !== 'object') {
	                var pathRepr = originalPathArg[idx - 1] + '.' + curr;
	                throw new Error('A non-object value was encountered when traversing setIn path at ' + pathRepr + '.');
	            }
	            acc = acc[curr];
	            idx++;
	            curr = originalPathArg[idx];
	        }
	    }
	
	    return obj;
	}
	
	function valueInPath(_pathArg, obj) {
	    var pathArg = normalizePath(_pathArg);
	
	    var acc = obj;
	    for (var i = 0; i < pathArg.length; i++) {
	        var curr = pathArg[i];
	        var currRef = acc[curr];
	        if (i === pathArg.length - 1) {
	            return currRef;
	        }
	
	        if ((typeof currRef === 'undefined' ? 'undefined' : (0, _typeof3.default)(currRef)) === 'object') {
	            acc = currRef;
	        } else {
	            return undefined;
	        }
	    }
	}
	
	function immutableSetIn(ownerID, _pathArg, value, obj) {
	    var pathArg = normalizePath(_pathArg);
	
	    var currentValue = valueInPath(pathArg, obj);
	    if (value === currentValue) return obj;
	
	    var pathLen = pathArg.length;
	
	    var acc = void 0;
	    if (canMutate(obj, ownerID)) {
	        acc = obj;
	    } else {
	        acc = (0, _assign2.default)(prepareNewObject({}, ownerID), obj);
	    }
	
	    var rootObj = acc;
	
	    pathArg.forEach(function (curr, idx) {
	        if (idx === pathLen - 1) {
	            acc[curr] = value;
	            return;
	        }
	
	        var currRef = acc[curr];
	        var currType = typeof currRef === 'undefined' ? 'undefined' : (0, _typeof3.default)(currRef);
	
	        if (currType === 'object') {
	            if (canMutate(currRef, ownerID)) {
	                acc = currRef;
	            } else {
	                var newObj = prepareNewObject({}, ownerID);
	                acc[curr] = (0, _assign2.default)(newObj, currRef);
	                acc = newObj;
	            }
	            return;
	        }
	
	        if (currType === 'undefined') {
	            var _newObj = prepareNewObject({}, ownerID);
	            acc[curr] = _newObj;
	            acc = _newObj;
	            return;
	        }
	
	        var pathRepr = pathArg[idx - 1] + '.' + curr;
	        throw new Error('A non-object value was encountered when traversing setIn path at ' + pathRepr + '.');
	    });
	
	    return rootObj;
	}
	
	function mutableMerge(isDeep, _mergeObjs, baseObj) {
	    var mergeObjs = forceArray(_mergeObjs);
	
	    if (isDeep) {
	        mergeObjs.forEach(function (mergeObj) {
	            forOwn(mergeObj, function (value, key) {
	                if (isDeep && baseObj.hasOwnProperty(key)) {
	                    var assignValue = void 0;
	                    if ((typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
	                        assignValue = mutableMerge(isDeep, [value], baseObj[key]);
	                    } else {
	                        assignValue = value;
	                    }
	
	                    baseObj[key] = assignValue;
	                } else {
	                    baseObj[key] = value;
	                }
	            });
	        });
	    } else {
	        _assign2.default.apply(Object, [baseObj].concat((0, _toConsumableArray3.default)(mergeObjs)));
	    }
	
	    return baseObj;
	}
	
	var mutableShallowMerge = mutableMerge.bind(null, false);
	var mutableDeepMerge = mutableMerge.bind(null, true);
	
	function mutableOmit(_keys, obj) {
	    var keys = forceArray(_keys);
	    keys.forEach(function (key) {
	        delete obj[key];
	    });
	    return obj;
	}
	
	function _shouldMergeKey(obj, other, key) {
	    return obj[key] !== other[key];
	}
	
	function immutableMerge(isDeep, ownerID, _mergeObjs, obj) {
	    if (canMutate(obj, ownerID)) return mutableMerge(isDeep, _mergeObjs, obj);
	    var mergeObjs = forceArray(_mergeObjs);
	
	    var hasChanges = false;
	    var nextObject = obj;
	
	    var willChange = function willChange() {
	        if (!hasChanges) {
	            hasChanges = true;
	            nextObject = (0, _assign2.default)({}, obj);
	            prepareNewObject(nextObject, ownerID);
	        }
	    };
	
	    mergeObjs.forEach(function (mergeObj) {
	        forOwn(mergeObj, function (mergeValue, key) {
	            if (isDeep && obj.hasOwnProperty(key)) {
	                var currentValue = nextObject[key];
	                if ((typeof mergeValue === 'undefined' ? 'undefined' : (0, _typeof3.default)(mergeValue)) === 'object' && !(mergeValue instanceof Array)) {
	                    if (_shouldMergeKey(nextObject, mergeObj, key)) {
	                        var recursiveMergeResult = immutableMerge(isDeep, ownerID, mergeValue, currentValue);
	
	                        if (recursiveMergeResult !== currentValue) {
	                            willChange();
	                            nextObject[key] = recursiveMergeResult;
	                        }
	                    }
	                    return true; // continue forOwn
	                }
	            }
	            if (_shouldMergeKey(nextObject, mergeObj, key)) {
	                willChange();
	                nextObject[key] = mergeValue;
	            }
	        });
	    });
	
	    return nextObject;
	}
	
	var immutableDeepMerge = immutableMerge.bind(null, true);
	var immutableShallowMerge = immutableMerge.bind(null, false);
	
	function immutableArrSet(ownerID, index, value, arr) {
	    if (canMutate(arr, ownerID)) return mutableSet(index, value, arr);
	
	    if (arr[index] === value) return arr;
	
	    var newArr = fastArrayCopy(arr);
	    newArr[index] = value;
	    prepareNewObject(newArr, ownerID);
	
	    return newArr;
	}
	
	function immutableSet(ownerID, key, value, obj) {
	    if (isArrayLike(obj)) return immutableArrSet(ownerID, key, value, obj);
	    if (canMutate(obj, ownerID)) return mutableSet(key, value, obj);
	
	    if (obj[key] === value) return obj;
	
	    var newObj = (0, _assign2.default)({}, obj);
	    prepareNewObject(newObj, ownerID);
	    newObj[key] = value;
	    return newObj;
	}
	
	function immutableOmit(ownerID, _keys, obj) {
	    if (canMutate(obj, ownerID)) return mutableOmit(_keys, obj);
	
	    var keys = forceArray(_keys);
	    var keysInObj = keys.filter(function (key) {
	        return obj.hasOwnProperty(key);
	    });
	
	    // None of the keys were in the object, so we can return `obj`.
	    if (keysInObj.length === 0) return obj;
	
	    var newObj = (0, _assign2.default)({}, obj);
	    keysInObj.forEach(function (key) {
	        delete newObj[key];
	    });
	    prepareNewObject(newObj, ownerID);
	    return newObj;
	}
	
	function mutableArrPush(_vals, arr) {
	    var vals = forceArray(_vals);
	    arr.push.apply(arr, (0, _toConsumableArray3.default)(vals));
	    return arr;
	}
	
	function mutableArrFilter(func, arr) {
	    var currIndex = 0;
	    var originalIndex = 0;
	    while (currIndex < arr.length) {
	        var item = arr[currIndex];
	        if (!func(item, originalIndex)) {
	            arr.splice(currIndex, 1);
	        } else {
	            currIndex++;
	        }
	        originalIndex++;
	    }
	
	    return arr;
	}
	
	function mutableArrSplice(index, deleteCount, _vals, arr) {
	    var vals = forceArray(_vals);
	    arr.splice.apply(arr, [index, deleteCount].concat((0, _toConsumableArray3.default)(vals)));
	    return arr;
	}
	
	function mutableArrInsert(index, _vals, arr) {
	    return mutableArrSplice(index, 0, _vals, arr);
	}
	
	function immutableArrSplice(ownerID, index, deleteCount, _vals, arr) {
	    if (canMutate(arr, ownerID)) return mutableArrSplice(index, deleteCount, _vals, arr);
	
	    var vals = forceArray(_vals);
	    var newArr = arr.slice();
	    prepareNewObject(newArr, ownerID);
	    newArr.splice.apply(newArr, [index, deleteCount].concat((0, _toConsumableArray3.default)(vals)));
	
	    return newArr;
	}
	
	function immutableArrInsert(ownerID, index, _vals, arr) {
	    if (canMutate(arr, ownerID)) return mutableArrInsert(index, _vals, arr);
	    return immutableArrSplice(ownerID, index, 0, _vals, arr);
	}
	
	function immutableArrPush(ownerID, vals, arr) {
	    return immutableArrInsert(ownerID, arr.length, vals, arr);
	}
	
	function immutableArrFilter(ownerID, func, arr) {
	    if (canMutate(arr, ownerID)) return mutableArrFilter(func, arr);
	    var newArr = arr.filter(func);
	
	    if (newArr.length === arr.length) return arr;
	
	    prepareNewObject(newArr, ownerID);
	    return newArr;
	}
	
	var immutableOperations = {
	    // object operations
	    merge: immutableShallowMerge,
	    deepMerge: immutableDeepMerge,
	    omit: immutableOmit,
	    setIn: immutableSetIn,
	
	    // array operations
	    insert: immutableArrInsert,
	    push: immutableArrPush,
	    filter: immutableArrFilter,
	    splice: immutableArrSplice,
	
	    // both
	    set: immutableSet
	};
	
	var mutableOperations = {
	    // object operations
	    merge: mutableShallowMerge,
	    deepMerge: mutableDeepMerge,
	    omit: mutableOmit,
	    setIn: mutableSetIn,
	
	    // array operations
	    insert: mutableArrInsert,
	    push: mutableArrPush,
	    filter: mutableArrFilter,
	    splice: mutableArrSplice,
	
	    // both
	    set: mutableSet
	};
	
	function getImmutableOps() {
	    var immutableOps = (0, _assign2.default)({}, immutableOperations);
	    forOwn(immutableOps, function (value, key) {
	        immutableOps[key] = (0, _curry2.default)(value.bind(null, null));
	    });
	
	    var mutableOps = (0, _assign2.default)({}, mutableOperations);
	    forOwn(mutableOps, function (value, key) {
	        mutableOps[key] = (0, _curry2.default)(value);
	    });
	
	    var batchOps = (0, _assign2.default)({}, immutableOperations);
	    forOwn(batchOps, function (value, key) {
	        batchOps[key] = (0, _curry2.default)(value);
	    });
	
	    function batched(_token, _fn) {
	        var token = void 0;
	        var fn = void 0;
	
	        if (typeof _token === 'function') {
	            fn = _token;
	            token = getBatchToken();
	        } else {
	            token = _token;
	            fn = _fn;
	        }
	
	        var immutableOpsBoundToToken = (0, _assign2.default)({}, immutableOperations);
	        forOwn(immutableOpsBoundToToken, function (value, key) {
	            immutableOpsBoundToToken[key] = (0, _curry2.default)(value.bind(null, token));
	        });
	        return fn(immutableOpsBoundToToken);
	    }
	
	    return (0, _assign2.default)(immutableOps, {
	        mutable: mutableOps,
	        batch: batchOps,
	        batched: batched,
	        __: _2.default,
	        getBatchToken: getBatchToken
	    });
	}
	
	var ops = exports.ops = getImmutableOps();
	
	exports.default = ops;

/***/ }),
/* 225 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _from = __webpack_require__(226);
	
	var _from2 = _interopRequireDefault(_from);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
	      arr2[i] = arr[i];
	    }
	
	    return arr2;
	  } else {
	    return (0, _from2.default)(arr);
	  }
	};

/***/ }),
/* 226 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(227), __esModule: true };

/***/ }),
/* 227 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	__webpack_require__(228);
	module.exports = __webpack_require__(13).Array.from;

/***/ }),
/* 228 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var ctx            = __webpack_require__(14)
	  , $export        = __webpack_require__(11)
	  , toObject       = __webpack_require__(48)
	  , call           = __webpack_require__(229)
	  , isArrayIter    = __webpack_require__(230)
	  , toLength       = __webpack_require__(38)
	  , createProperty = __webpack_require__(231)
	  , getIterFn      = __webpack_require__(232);
	
	$export($export.S + $export.F * !__webpack_require__(234)(function(iter){ Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = toObject(arrayLike)
	      , C       = typeof this == 'function' ? this : Array
	      , aLen    = arguments.length
	      , mapfn   = aLen > 1 ? arguments[1] : undefined
	      , mapping = mapfn !== undefined
	      , index   = 0
	      , iterFn  = getIterFn(O)
	      , length, result, step, iterator;
	    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
	      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
	        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
	      }
	    } else {
	      length = toLength(O.length);
	      for(result = new C(length); length > index; index++){
	        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});


/***/ }),
/* 229 */
/***/ (function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(18);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(28)
	  , ITERATOR   = __webpack_require__(46)('iterator')
	  , ArrayProto = Array.prototype;
	
	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ }),
/* 231 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $defineProperty = __webpack_require__(17)
	  , createDesc      = __webpack_require__(25);
	
	module.exports = function(object, index, value){
	  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
	  else object[index] = value;
	};

/***/ }),
/* 232 */
/***/ (function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(233)
	  , ITERATOR  = __webpack_require__(46)('iterator')
	  , Iterators = __webpack_require__(28);
	module.exports = __webpack_require__(13).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ }),
/* 233 */
/***/ (function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(36)
	  , TAG = __webpack_require__(46)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';
	
	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};
	
	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ }),
/* 234 */
/***/ (function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(46)('iterator')
	  , SAFE_CLOSING = false;
	
	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }
	
	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ }),
/* 235 */
/***/ (function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(236);
	var curryN = __webpack_require__(238);
	
	
	/**
	 * Returns a curried equivalent of the provided function. The curried function
	 * has two unusual capabilities. First, its arguments needn't be provided one
	 * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
	 * following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	 * following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (* -> a) -> (* -> a)
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curryN
	 * @example
	 *
	 *      var addFourNumbers = (a, b, c, d) => a + b + c + d;
	 *
	 *      var curriedAddFourNumbers = R.curry(addFourNumbers);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry1(function curry(fn) {
	  return curryN(fn.length, fn);
	});


/***/ }),
/* 236 */
/***/ (function(module, exports, __webpack_require__) {

	var _isPlaceholder = __webpack_require__(237);
	
	
	/**
	 * Optimized internal one-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry1(fn) {
	  return function f1(a) {
	    if (arguments.length === 0 || _isPlaceholder(a)) {
	      return f1;
	    } else {
	      return fn.apply(this, arguments);
	    }
	  };
	};


/***/ }),
/* 237 */
/***/ (function(module, exports) {

	module.exports = function _isPlaceholder(a) {
	  return a != null &&
	         typeof a === 'object' &&
	         a['@@functional/placeholder'] === true;
	};


/***/ }),
/* 238 */
/***/ (function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(239);
	var _curry1 = __webpack_require__(236);
	var _curry2 = __webpack_require__(240);
	var _curryN = __webpack_require__(241);
	
	
	/**
	 * Returns a curried equivalent of the provided function, with the specified
	 * arity. The curried function has two unusual capabilities. First, its
	 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
	 * following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	 * following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @since v0.5.0
	 * @category Function
	 * @sig Number -> (* -> a) -> (* -> a)
	 * @param {Number} length The arity for the returned function.
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curry
	 * @example
	 *
	 *      var sumArgs = (...args) => R.sum(args);
	 *
	 *      var curriedAddFourNumbers = R.curryN(4, sumArgs);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry2(function curryN(length, fn) {
	  if (length === 1) {
	    return _curry1(fn);
	  }
	  return _arity(length, _curryN(length, [], fn));
	});


/***/ }),
/* 239 */
/***/ (function(module, exports) {

	module.exports = function _arity(n, fn) {
	  /* eslint-disable no-unused-vars */
	  switch (n) {
	    case 0: return function() { return fn.apply(this, arguments); };
	    case 1: return function(a0) { return fn.apply(this, arguments); };
	    case 2: return function(a0, a1) { return fn.apply(this, arguments); };
	    case 3: return function(a0, a1, a2) { return fn.apply(this, arguments); };
	    case 4: return function(a0, a1, a2, a3) { return fn.apply(this, arguments); };
	    case 5: return function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments); };
	    case 6: return function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments); };
	    case 7: return function(a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments); };
	    case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments); };
	    case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments); };
	    case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments); };
	    default: throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
	  }
	};


/***/ }),
/* 240 */
/***/ (function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(236);
	var _isPlaceholder = __webpack_require__(237);
	
	
	/**
	 * Optimized internal two-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry2(fn) {
	  return function f2(a, b) {
	    switch (arguments.length) {
	      case 0:
	        return f2;
	      case 1:
	        return _isPlaceholder(a) ? f2
	             : _curry1(function(_b) { return fn(a, _b); });
	      default:
	        return _isPlaceholder(a) && _isPlaceholder(b) ? f2
	             : _isPlaceholder(a) ? _curry1(function(_a) { return fn(_a, b); })
	             : _isPlaceholder(b) ? _curry1(function(_b) { return fn(a, _b); })
	             : fn(a, b);
	    }
	  };
	};


/***/ }),
/* 241 */
/***/ (function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(239);
	var _isPlaceholder = __webpack_require__(237);
	
	
	/**
	 * Internal curryN function.
	 *
	 * @private
	 * @category Function
	 * @param {Number} length The arity of the curried function.
	 * @param {Array} received An array of arguments received thus far.
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curryN(length, received, fn) {
	  return function() {
	    var combined = [];
	    var argsIdx = 0;
	    var left = length;
	    var combinedIdx = 0;
	    while (combinedIdx < received.length || argsIdx < arguments.length) {
	      var result;
	      if (combinedIdx < received.length &&
	          (!_isPlaceholder(received[combinedIdx]) ||
	           argsIdx >= arguments.length)) {
	        result = received[combinedIdx];
	      } else {
	        result = arguments[argsIdx];
	        argsIdx += 1;
	      }
	      combined[combinedIdx] = result;
	      if (!_isPlaceholder(result)) {
	        left -= 1;
	      }
	      combinedIdx += 1;
	    }
	    return left <= 0 ? fn.apply(this, combined)
	                     : _arity(left, _curryN(length, combined, fn));
	  };
	};


/***/ }),
/* 242 */
/***/ (function(module, exports) {

	/**
	 * A special placeholder value used to specify "gaps" within curried functions,
	 * allowing partial application of any combination of arguments, regardless of
	 * their positions.
	 *
	 * If `g` is a curried ternary function and `_` is `R.__`, the following are
	 * equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2, _)(1, 3)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @constant
	 * @memberOf R
	 * @since v0.6.0
	 * @category Function
	 * @example
	 *
	 *      var greet = R.replace('{name}', R.__, 'Hello, {name}!');
	 *      greet('Alice'); //=> 'Hello, Alice!'
	 */
	module.exports = {'@@functional/placeholder': true};


/***/ }),
/* 243 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(191),
	    baseIntersection = __webpack_require__(244),
	    baseRest = __webpack_require__(247),
	    castArrayLikeObject = __webpack_require__(254);
	
	/**
	 * Creates an array of unique values that are included in all given arrays
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons. The order and references of result values are
	 * determined by the first array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {...Array} [arrays] The arrays to inspect.
	 * @returns {Array} Returns the new array of intersecting values.
	 * @example
	 *
	 * _.intersection([2, 1], [2, 3]);
	 * // => [2]
	 */
	var intersection = baseRest(function(arrays) {
	  var mapped = arrayMap(arrays, castArrayLikeObject);
	  return (mapped.length && mapped[0] === arrays[0])
	    ? baseIntersection(mapped)
	    : [];
	});
	
	module.exports = intersection;


/***/ }),
/* 244 */
/***/ (function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(156),
	    arrayIncludes = __webpack_require__(245),
	    arrayIncludesWith = __webpack_require__(246),
	    arrayMap = __webpack_require__(191),
	    baseUnary = __webpack_require__(113),
	    cacheHas = __webpack_require__(160);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;
	
	/**
	 * The base implementation of methods like `_.intersection`, without support
	 * for iteratee shorthands, that accepts an array of arrays to inspect.
	 *
	 * @private
	 * @param {Array} arrays The arrays to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new array of shared values.
	 */
	function baseIntersection(arrays, iteratee, comparator) {
	  var includes = comparator ? arrayIncludesWith : arrayIncludes,
	      length = arrays[0].length,
	      othLength = arrays.length,
	      othIndex = othLength,
	      caches = Array(othLength),
	      maxLength = Infinity,
	      result = [];
	
	  while (othIndex--) {
	    var array = arrays[othIndex];
	    if (othIndex && iteratee) {
	      array = arrayMap(array, baseUnary(iteratee));
	    }
	    maxLength = nativeMin(array.length, maxLength);
	    caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
	      ? new SetCache(othIndex && array)
	      : undefined;
	  }
	  array = arrays[0];
	
	  var index = -1,
	      seen = caches[0];
	
	  outer:
	  while (++index < length && result.length < maxLength) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;
	
	    value = (comparator || value !== 0) ? value : 0;
	    if (!(seen
	          ? cacheHas(seen, computed)
	          : includes(result, computed, comparator)
	        )) {
	      othIndex = othLength;
	      while (--othIndex) {
	        var cache = caches[othIndex];
	        if (!(cache
	              ? cacheHas(cache, computed)
	              : includes(arrays[othIndex], computed, comparator))
	            ) {
	          continue outer;
	        }
	      }
	      if (seen) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}
	
	module.exports = baseIntersection;


/***/ }),
/* 245 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(214);
	
	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array == null ? 0 : array.length;
	  return !!length && baseIndexOf(array, value, 0) > -1;
	}
	
	module.exports = arrayIncludes;


/***/ }),
/* 246 */
/***/ (function(module, exports) {

	/**
	 * This function is like `arrayIncludes` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	      length = array == null ? 0 : array.length;
	
	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}
	
	module.exports = arrayIncludesWith;


/***/ }),
/* 247 */
/***/ (function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(196),
	    overRest = __webpack_require__(248),
	    setToString = __webpack_require__(250);
	
	/**
	 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 */
	function baseRest(func, start) {
	  return setToString(overRest(func, start, identity), func + '');
	}
	
	module.exports = baseRest;


/***/ }),
/* 248 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(249);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * A specialized version of `baseRest` which transforms the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @param {Function} transform The rest array transform.
	 * @returns {Function} Returns the new function.
	 */
	function overRest(func, start, transform) {
	  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);
	
	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    index = -1;
	    var otherArgs = Array(start + 1);
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = transform(array);
	    return apply(func, this, otherArgs);
	  };
	}
	
	module.exports = overRest;


/***/ }),
/* 249 */
/***/ (function(module, exports) {

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  switch (args.length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}
	
	module.exports = apply;


/***/ }),
/* 250 */
/***/ (function(module, exports, __webpack_require__) {

	var baseSetToString = __webpack_require__(251),
	    shortOut = __webpack_require__(253);
	
	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var setToString = shortOut(baseSetToString);
	
	module.exports = setToString;


/***/ }),
/* 251 */
/***/ (function(module, exports, __webpack_require__) {

	var constant = __webpack_require__(252),
	    defineProperty = __webpack_require__(81),
	    identity = __webpack_require__(196);
	
	/**
	 * The base implementation of `setToString` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetToString = !defineProperty ? identity : function(func, string) {
	  return defineProperty(func, 'toString', {
	    'configurable': true,
	    'enumerable': false,
	    'value': constant(string),
	    'writable': true
	  });
	};
	
	module.exports = baseSetToString;


/***/ }),
/* 252 */
/***/ (function(module, exports) {

	/**
	 * Creates a function that returns `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {*} value The value to return from the new function.
	 * @returns {Function} Returns the new constant function.
	 * @example
	 *
	 * var objects = _.times(2, _.constant({ 'a': 1 }));
	 *
	 * console.log(objects);
	 * // => [{ 'a': 1 }, { 'a': 1 }]
	 *
	 * console.log(objects[0] === objects[1]);
	 * // => true
	 */
	function constant(value) {
	  return function() {
	    return value;
	  };
	}
	
	module.exports = constant;


/***/ }),
/* 253 */
/***/ (function(module, exports) {

	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 800,
	    HOT_SPAN = 16;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeNow = Date.now;
	
	/**
	 * Creates a function that'll short out and invoke `identity` instead
	 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	 * milliseconds.
	 *
	 * @private
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new shortable function.
	 */
	function shortOut(func) {
	  var count = 0,
	      lastCalled = 0;
	
	  return function() {
	    var stamp = nativeNow(),
	        remaining = HOT_SPAN - (stamp - lastCalled);
	
	    lastCalled = stamp;
	    if (remaining > 0) {
	      if (++count >= HOT_COUNT) {
	        return arguments[0];
	      }
	    } else {
	      count = 0;
	    }
	    return func.apply(undefined, arguments);
	  };
	}
	
	module.exports = shortOut;


/***/ }),
/* 254 */
/***/ (function(module, exports, __webpack_require__) {

	var isArrayLikeObject = __webpack_require__(255);
	
	/**
	 * Casts `value` to an empty array if it's not an array like object.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Array|Object} Returns the cast array-like object.
	 */
	function castArrayLikeObject(value) {
	  return isArrayLikeObject(value) ? value : [];
	}
	
	module.exports = castArrayLikeObject;


/***/ }),
/* 255 */
/***/ (function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(119),
	    isObjectLike = __webpack_require__(104);
	
	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}
	
	module.exports = isArrayLikeObject;


/***/ }),
/* 256 */
/***/ (function(module, exports, __webpack_require__) {

	var baseDifference = __webpack_require__(257),
	    baseFlatten = __webpack_require__(258),
	    baseRest = __webpack_require__(247),
	    isArrayLikeObject = __webpack_require__(255);
	
	/**
	 * Creates an array of `array` values not included in the other given arrays
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons. The order and references of result values are
	 * determined by the first array.
	 *
	 * **Note:** Unlike `_.pullAll`, this method returns a new array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @param {...Array} [values] The values to exclude.
	 * @returns {Array} Returns the new array of filtered values.
	 * @see _.without, _.xor
	 * @example
	 *
	 * _.difference([2, 1], [2, 3]);
	 * // => [1]
	 */
	var difference = baseRest(function(array, values) {
	  return isArrayLikeObject(array)
	    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
	    : [];
	});
	
	module.exports = difference;


/***/ }),
/* 257 */
/***/ (function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(156),
	    arrayIncludes = __webpack_require__(245),
	    arrayIncludesWith = __webpack_require__(246),
	    arrayMap = __webpack_require__(191),
	    baseUnary = __webpack_require__(113),
	    cacheHas = __webpack_require__(160);
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/**
	 * The base implementation of methods like `_.difference` without support
	 * for excluding multiple arrays or iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Array} values The values to exclude.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new array of filtered values.
	 */
	function baseDifference(array, values, iteratee, comparator) {
	  var index = -1,
	      includes = arrayIncludes,
	      isCommon = true,
	      length = array.length,
	      result = [],
	      valuesLength = values.length;
	
	  if (!length) {
	    return result;
	  }
	  if (iteratee) {
	    values = arrayMap(values, baseUnary(iteratee));
	  }
	  if (comparator) {
	    includes = arrayIncludesWith;
	    isCommon = false;
	  }
	  else if (values.length >= LARGE_ARRAY_SIZE) {
	    includes = cacheHas;
	    isCommon = false;
	    values = new SetCache(values);
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee == null ? value : iteratee(value);
	
	    value = (comparator || value !== 0) ? value : 0;
	    if (isCommon && computed === computed) {
	      var valuesIndex = valuesLength;
	      while (valuesIndex--) {
	        if (values[valuesIndex] === computed) {
	          continue outer;
	        }
	      }
	      result.push(value);
	    }
	    else if (!includes(values, computed, comparator)) {
	      result.push(value);
	    }
	  }
	  return result;
	}
	
	module.exports = baseDifference;


/***/ }),
/* 258 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(168),
	    isFlattenable = __webpack_require__(259);
	
	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, depth, predicate, isStrict, result) {
	  var index = -1,
	      length = array.length;
	
	  predicate || (predicate = isFlattenable);
	  result || (result = []);
	
	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && predicate(value)) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, depth - 1, predicate, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}
	
	module.exports = baseFlatten;


/***/ }),
/* 259 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(86),
	    isArguments = __webpack_require__(102),
	    isArray = __webpack_require__(105);
	
	/** Built-in value references. */
	var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;
	
	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable(value) {
	  return isArray(value) || isArguments(value) ||
	    !!(spreadableSymbol && value && value[spreadableSymbol]);
	}
	
	module.exports = isFlattenable;


/***/ }),
/* 260 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var UPDATE = exports.UPDATE = 'REDUX_ORM_UPDATE';
	var DELETE = exports.DELETE = 'REDUX_ORM_DELETE';
	var CREATE = exports.CREATE = 'REDUX_ORM_CREATE';
	
	var FILTER = exports.FILTER = 'REDUX_ORM_FILTER';
	var EXCLUDE = exports.EXCLUDE = 'REDUX_ORM_EXCLUDE';
	var ORDER_BY = exports.ORDER_BY = 'REDUX_ORM_ORDER_BY';
	
	var SUCCESS = exports.SUCCESS = 'SUCCESS';
	var FAILURE = exports.FAILURE = 'FAILURE';

/***/ }),
/* 261 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _toConsumableArray2 = __webpack_require__(225);
	
	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
	
	var _keys = __webpack_require__(201);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _defineProperty2 = __webpack_require__(76);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _assign = __webpack_require__(70);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(75);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _defineProperty4 = __webpack_require__(262);
	
	var _defineProperty5 = _interopRequireDefault(_defineProperty4);
	
	var _forOwn = __webpack_require__(211);
	
	var _forOwn2 = _interopRequireDefault(_forOwn);
	
	var _uniq = __webpack_require__(263);
	
	var _uniq2 = _interopRequireDefault(_uniq);
	
	var _Session = __webpack_require__(267);
	
	var _Session2 = _interopRequireDefault(_Session);
	
	var _QuerySet = __webpack_require__(1);
	
	var _QuerySet2 = _interopRequireDefault(_QuerySet);
	
	var _fields = __webpack_require__(277);
	
	var _constants = __webpack_require__(260);
	
	var _utils = __webpack_require__(200);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Generates a query specification
	// to get a single row from a table identified
	// by a primary key.
	function getByIdQuery(modelInstance) {
	    var modelClass = modelInstance.getClass();
	    return {
	        table: modelClass.modelName,
	        clauses: [{
	            type: _constants.FILTER,
	            payload: (0, _defineProperty5.default)({}, modelClass.idAttribute, modelInstance.getId())
	        }]
	    };
	}
	
	/**
	 * The heart of an ORM, the data model.
	 *
	 * The fields you specify to the Model will be used to generate
	 * a schema to the database, related property accessors, and
	 * possibly through models.
	 *
	 * In each {@link Session} you instantiate from an {@link ORM} instance,
	 * you will receive a session-specific subclass of this Model. The methods
	 * you define here will be available to you in sessions.
	 *
	 * An instance of {@link Model} represents a record in the database, though
	 * it is possible to generate multiple instances from the same record in the database.
	 *
	 * To create data models in your schema, subclass {@link Model}. To define
	 * information about the data model, override static class methods. Define instance
	 * logic by defining prototype methods (without `static` keyword).
	 */
	var Model = function () {
	    /**
	     * Creates a Model instance from it's properties.
	     * Don't use this to create a new record; Use the static method {@link Model#create}.
	     * @param  {Object} props - the properties to instantiate with
	     */
	    function Model(props) {
	        (0, _classCallCheck3.default)(this, Model);
	
	        this._initFields(props);
	    }
	
	    Model.prototype._initFields = function _initFields(props) {
	        var _this = this;
	
	        this._fields = (0, _assign2.default)({}, props);
	
	        (0, _forOwn2.default)(props, function (fieldValue, fieldName) {
	            // In this case, we got a prop that wasn't defined as a field.
	            // Assuming it's an arbitrary data field, making an instance-specific
	            // descriptor for it.
	            // Using the in operator as the property could be defined anywhere
	            // on the prototype chain.
	            if (!(fieldName in _this)) {
	                (0, _defineProperty3.default)(_this, fieldName, {
	                    get: function get() {
	                        return _this._fields[fieldName];
	                    },
	                    set: function set(value) {
	                        return _this.set(fieldName, value);
	                    },
	                    configurable: true,
	                    enumerable: true
	                });
	            }
	        });
	    };
	
	    Model.toString = function toString() {
	        return 'ModelClass: ' + this.modelName;
	    };
	
	    /**
	     * Returns the options object passed to the database for the table that represents
	     * this Model class.
	     *
	     * Returns an empty object by default, which means the database
	     * will use default options. You can either override this function to return the options
	     * you want to use, or assign the options object as a static property of the same name to the
	     * Model class.
	     *
	     * @return {Object} the options object passed to the database for the table
	     *                  representing this Model class.
	     */
	
	
	    Model.options = function options() {
	        return {};
	    };
	
	    Model._getTableOpts = function _getTableOpts() {
	        if (typeof this.backend === 'function') {
	            (0, _utils.warnDeprecated)('Model.backend is deprecated. Please rename to .options');
	            return this.backend();
	        } else if (this.backend) {
	            (0, _utils.warnDeprecated)('Model.backend is deprecated. Please rename to .options');
	            return this.backend;
	        } else if (typeof this.options === 'function') {
	            return this.options();
	        }
	        return this.options;
	    };
	
	    Model.markAccessed = function markAccessed() {
	        this.session.markAccessed(this);
	    };
	
	    /**
	     * Returns the id attribute of this {@link Model}.
	     *
	     * @return {string} The id attribute of this {@link Model}.
	     */
	
	
	    /**
	     * Connect the model class to a {@link Session}.
	     *
	     * @private
	     * @param  {Session} session - The session to connect to.
	     */
	    Model.connect = function connect(session) {
	        if (!(session instanceof _Session2.default)) {
	            throw Error('A model can only connect to a Session instance.');
	        }
	        this._session = session;
	    };
	
	    /**
	     * Get the current {@link Session} instance.
	     *
	     * @private
	     * @return {Session} The current {@link Session} instance.
	     */
	
	
	    Model.getQuerySet = function getQuerySet() {
	        var QuerySetClass = this.querySetClass;
	        return new QuerySetClass(this);
	    };
	
	    Model.invalidateClassCache = function invalidateClassCache() {
	        this.isSetUp = undefined;
	        this.virtualFields = {};
	    };
	
	    /**
	     * Returns a {@link QuerySet} containing all {@link Model} instances.
	     * @return {QuerySet} a QuerySet containing all {@link Model} instances
	     */
	    Model.all = function all() {
	        return this.getQuerySet();
	    };
	
	    /**
	     * Update many-many relations for model.
	     * @param relations
	     */
	
	
	    Model.prototype._refreshMany2Many = function _refreshMany2Many(relations) {
	        var _this2 = this;
	
	        var ThisModel = this.getClass();
	        var fields = ThisModel.fields;
	        var virtualFields = ThisModel.virtualFields;
	
	        (0, _keys2.default)(relations).forEach(function (name) {
	            var reverse = !fields.hasOwnProperty(name);
	            var field = virtualFields[name];
	            var values = relations[name];
	
	            var normalizedNewIds = values.map(_utils.normalizeEntity);
	            var uniqueIds = (0, _uniq2.default)(normalizedNewIds);
	
	            if (normalizedNewIds.length !== uniqueIds.length) {
	                throw new Error('Found duplicate id(s) when passing "' + normalizedNewIds + '" to ' + ThisModel.modelName + '.' + name + ' value');
	            }
	
	            var throughModelName = field.through || (0, _utils.m2mName)(ThisModel.modelName, name);
	            var ThroughModel = ThisModel.session[throughModelName];
	
	            var fromField = void 0;
	            var toField = void 0;
	
	            if (!reverse) {
	                var _field$throughFields = field.throughFields;
	                fromField = _field$throughFields.from;
	                toField = _field$throughFields.to;
	            } else {
	                var _field$throughFields2 = field.throughFields;
	                toField = _field$throughFields2.from;
	                fromField = _field$throughFields2.to;
	            }
	
	            var currentIds = ThroughModel.filter(function (through) {
	                return through[fromField] === _this2[ThisModel.idAttribute];
	            }).toRefArray().map(function (ref) {
	                return ref[toField];
	            });
	
	            var diffActions = (0, _utils.arrayDiffActions)(currentIds, normalizedNewIds);
	
	            if (diffActions) {
	                var idsToDelete = diffActions.delete;
	                var idsToAdd = diffActions.add;
	                if (idsToDelete.length > 0) {
	                    var _name;
	
	                    (_name = _this2[name]).remove.apply(_name, (0, _toConsumableArray3.default)(idsToDelete));
	                }
	                if (idsToAdd.length > 0) {
	                    var _name2;
	
	                    (_name2 = _this2[name]).add.apply(_name2, (0, _toConsumableArray3.default)(idsToAdd));
	                }
	            }
	        });
	    };
	
	    /**
	     * Creates a new record in the database, instantiates a {@link Model} and returns it.
	     *
	     * If you pass values for many-to-many fields, instances are created on the through
	     * model as well.
	     *
	     * @param  {props} userProps - the new {@link Model}'s properties.
	     * @return {Model} a new {@link Model} instance.
	     */
	
	
	    Model.create = function create(userProps) {
	        var _this3 = this;
	
	        var props = (0, _assign2.default)({}, userProps);
	
	        var m2mRelations = {};
	
	        var declaredFieldNames = (0, _keys2.default)(this.fields);
	        var declaredVirtualFieldNames = (0, _keys2.default)(this.virtualFields);
	
	        declaredFieldNames.forEach(function (key) {
	            var field = _this3.fields[key];
	            var valuePassed = userProps.hasOwnProperty(key);
	            if (!(field instanceof _fields.ManyToMany)) {
	                if (valuePassed) {
	                    var value = userProps[key];
	                    props[key] = (0, _utils.normalizeEntity)(value);
	                } else if (field.getDefault) {
	                    props[key] = field.getDefault();
	                }
	            } else if (valuePassed) {
	                // If a value is supplied for a ManyToMany field,
	                // discard them from props and save for later processing.
	                m2mRelations[key] = userProps[key];
	                delete props[key];
	            }
	        });
	
	        // add backward many-many if required
	        declaredVirtualFieldNames.forEach(function (key) {
	            if (!m2mRelations.hasOwnProperty(key)) {
	                var field = _this3.virtualFields[key];
	                if (userProps.hasOwnProperty(key) && field instanceof _fields.ManyToMany) {
	                    // If a value is supplied for a ManyToMany field,
	                    // discard them from props and save for later processing.
	                    m2mRelations[key] = userProps[key];
	                    delete props[key];
	                }
	            }
	        });
	
	        var newEntry = this.session.applyUpdate({
	            action: _constants.CREATE,
	            table: this.modelName,
	            payload: props
	        });
	
	        var ModelClass = this;
	        var instance = new ModelClass(newEntry);
	        instance._refreshMany2Many(m2mRelations); // eslint-disable-line no-underscore-dangle
	        return instance;
	    };
	
	    /**
	     * Creates a new or update existing record in the database, instantiates a {@link Model} and returns it.
	     *
	     * If you pass values for many-to-many fields, instances are created on the through
	     * model as well.
	     *
	     * @param  {props} userProps - the required {@link Model}'s properties.
	     * @return {Model} a {@link Model} instance.
	     */
	
	
	    Model.upsert = function upsert(userProps) {
	        var idAttr = this.idAttribute;
	        if (userProps.hasOwnProperty(idAttr) && this.hasId(userProps[idAttr])) {
	            var model = this.withId(userProps[idAttr]);
	            model.update(userProps);
	            return model;
	        }
	
	        return this.create(userProps);
	    };
	
	    /**
	     * Returns a {@link Model} instance for the object with id `id`.
	     * This throws if the `id` doesn't exist. Use {@link Model#hasId}
	     * to check for existence first if you're not certain.
	     *
	     * @param  {*} id - the `id` of the object to get
	     * @throws If object with id `id` doesn't exist
	     * @return {Model} {@link Model} instance with id `id`
	     */
	
	
	    Model.withId = function withId(id) {
	        var ModelClass = this;
	        var rows = this._findDatabaseRows((0, _defineProperty5.default)({}, ModelClass.idAttribute, id));
	        if (rows.length === 0) {
	            throw new Error(ModelClass.modelName + ' instance with id ' + id + ' not found');
	        }
	
	        return new ModelClass(rows[0]);
	    };
	
	    /**
	     * Returns a boolean indicating if an entity with the id `id` exists
	     * in the state.
	     *
	     * @param  {*}  id - a value corresponding to the id attribute of the {@link Model} class.
	     * @return {Boolean} a boolean indicating if entity with `id` exists in the state
	     */
	
	
	    Model.hasId = function hasId(id) {
	        var rows = this._findDatabaseRows((0, _defineProperty5.default)({}, this.idAttribute, id));
	        return rows.length === 1;
	    };
	
	    Model._findDatabaseRows = function _findDatabaseRows(lookupObj) {
	        var ModelClass = this;
	        return ModelClass.session.query({
	            table: ModelClass.modelName,
	            clauses: [{
	                type: _constants.FILTER,
	                payload: lookupObj
	            }]
	        }).rows;
	    };
	
	    /**
	     * Gets the {@link Model} instance that matches properties in `lookupObj`.
	     * Throws an error if {@link Model} is not found, or multiple records match
	     * the properties.
	     *
	     * @param  {Object} lookupObj - the properties used to match a single entity.
	     * @return {Model} a {@link Model} instance that matches `lookupObj` properties.
	     */
	
	
	    Model.get = function get(lookupObj) {
	        var ModelClass = this;
	
	        var rows = this._findDatabaseRows(lookupObj);
	
	        if (rows.length === 0) {
	            throw new Error('Model instance not found when calling get method');
	        } else if (rows.length > 1) {
	            throw new Error('Expected to find a single row in Model.get. Found ' + rows.length + '.');
	        }
	
	        return new ModelClass(rows[0]);
	    };
	
	    /**
	     * Gets the {@link Model} class or subclass constructor (the class that
	     * instantiated this instance).
	     *
	     * @return {Model} The {@link Model} class or subclass constructor used to instantiate
	     *                 this instance.
	     */
	
	
	    Model.prototype.getClass = function getClass() {
	        return this.constructor;
	    };
	
	    /**
	     * Gets the id value of the current instance by looking up the id attribute.
	     * @return {*} The id value of the current instance.
	     */
	
	
	    Model.prototype.getId = function getId() {
	        return this._fields[this.getClass().idAttribute];
	    };
	
	    /**
	     * Returns a reference to the plain JS object in the store.
	     * Make sure to not mutate this.
	     *
	     * @return {Object} a reference to the plain JS object in the store
	     */
	
	
	    /**
	     * Returns a string representation of the {@link Model} instance.
	     *
	     * @return {string} A string representation of this {@link Model} instance.
	     */
	    Model.prototype.toString = function toString() {
	        var _this4 = this;
	
	        var ThisModel = this.getClass();
	        var className = ThisModel.modelName;
	        var fieldNames = (0, _keys2.default)(ThisModel.fields);
	        var fields = fieldNames.map(function (fieldName) {
	            var field = ThisModel.fields[fieldName];
	            if (field instanceof _fields.ManyToMany) {
	                var ids = _this4[fieldName].toModelArray().map(function (model) {
	                    return model.getId();
	                });
	                return fieldName + ': [' + ids.join(', ') + ']';
	            }
	            var val = _this4._fields[fieldName];
	            return fieldName + ': ' + val;
	        }).join(', ');
	        return className + ': {' + fields + '}';
	    };
	
	    /**
	     * Returns a boolean indicating if `otherModel` equals this {@link Model} instance.
	     * Equality is determined by shallow comparing their attributes.
	     *
	     * @param  {Model} otherModel - a {@link Model} instance to compare
	     * @return {Boolean} a boolean indicating if the {@link Model} instance's are equal.
	     */
	
	
	    Model.prototype.equals = function equals(otherModel) {
	        // eslint-disable-next-line no-underscore-dangle
	        return (0, _utils.objectShallowEquals)(this._fields, otherModel._fields);
	    };
	
	    /**
	     * Updates a property name to given value for this {@link Model} instance.
	     * The values are immediately committed to the database.
	     *
	     * @param {string} propertyName - name of the property to set
	     * @param {*} value - value assigned to the property
	     * @return {undefined}
	     */
	
	
	    Model.prototype.set = function set(propertyName, value) {
	        this.update((0, _defineProperty5.default)({}, propertyName, value));
	    };
	
	    /**
	     * Assigns multiple fields and corresponding values to this {@link Model} instance.
	     * The updates are immediately committed to the database.
	     *
	     * @param  {Object} userMergeObj - an object that will be merged with this instance.
	     * @return {undefined}
	     */
	
	
	    Model.prototype.update = function update(userMergeObj) {
	        var ThisModel = this.getClass();
	        var mergeObj = (0, _assign2.default)({}, userMergeObj);
	
	        var fields = ThisModel.fields;
	        var virtualFields = ThisModel.virtualFields;
	        var m2mRelations = {};
	
	        // If an array of entities or id's is supplied for a
	        // many-to-many related field, clear the old relations
	        // and add the new ones.
	        for (var mergeKey in mergeObj) {
	            // eslint-disable-line no-restricted-syntax, guard-for-in
	            var isRealField = fields.hasOwnProperty(mergeKey);
	
	            if (isRealField) {
	                var field = fields[mergeKey];
	
	                if (field instanceof _fields.ForeignKey || field instanceof _fields.OneToOne) {
	                    // update one-one/fk relations
	                    mergeObj[mergeKey] = (0, _utils.normalizeEntity)(mergeObj[mergeKey]);
	                } else if (field instanceof _fields.ManyToMany) {
	                    // field is forward relation
	                    m2mRelations[mergeKey] = mergeObj[mergeKey];
	                    delete mergeObj[mergeKey];
	                }
	            } else if (virtualFields.hasOwnProperty(mergeKey)) {
	                var _field = virtualFields[mergeKey];
	                if (_field instanceof _fields.ManyToMany) {
	                    // field is backward relation
	                    m2mRelations[mergeKey] = mergeObj[mergeKey];
	                    delete mergeObj[mergeKey];
	                }
	            }
	        }
	
	        this._initFields((0, _assign2.default)({}, this._fields, mergeObj));
	        this._refreshMany2Many(m2mRelations); // eslint-disable-line no-underscore-dangle
	
	        ThisModel.session.applyUpdate({
	            action: _constants.UPDATE,
	            query: getByIdQuery(this),
	            payload: mergeObj
	        });
	    };
	
	    /**
	     * Updates {@link Model} instance attributes to reflect the
	     * database state in the current session.
	     * @return {undefined}
	     */
	
	
	    Model.prototype.refreshFromState = function refreshFromState() {
	        this._initFields(this.ref);
	    };
	
	    /**
	     * Deletes the record for this {@link Model} instance.
	     * You'll still be able to access fields and values on the instance.
	     *
	     * @return {undefined}
	     */
	
	
	    Model.prototype.delete = function _delete() {
	        this._onDelete();
	        this.getClass().session.applyUpdate({
	            action: _constants.DELETE,
	            query: getByIdQuery(this)
	        });
	    };
	
	    Model.prototype._onDelete = function _onDelete() {
	        var virtualFields = this.getClass().virtualFields;
	        for (var key in virtualFields) {
	            // eslint-disable-line
	            var field = virtualFields[key];
	            if (field instanceof _fields.ManyToMany) {
	                // Delete any many-to-many rows the entity is included in.
	                this[key].clear();
	            } else if (field instanceof _fields.ForeignKey) {
	                var relatedQs = this[key];
	                if (relatedQs.exists()) {
	                    relatedQs.update((0, _defineProperty5.default)({}, field.relatedName, null));
	                }
	            } else if (field instanceof _fields.OneToOne) {
	                // Set null to any foreign keys or one to ones pointed to
	                // this instance.
	                if (this[key] !== null) {
	                    this[key][field.relatedName] = null;
	                }
	            }
	        }
	    };
	
	    // DEPRECATED AND REMOVED METHODS
	
	    Model.prototype.getNextState = function getNextState() {
	        throw new Error('Model.prototype.getNextState is removed. See the 0.9 ' + 'migration guide on the GitHub repo.');
	    };
	
	    (0, _createClass3.default)(Model, [{
	        key: 'ref',
	        get: function get() {
	            var ModelClass = this.getClass();
	
	            // eslint-disable-next-line no-underscore-dangle
	            return ModelClass._findDatabaseRows((0, _defineProperty5.default)({}, ModelClass.idAttribute, this.getId()))[0];
	        }
	    }], [{
	        key: '_sessionData',
	        get: function get() {
	            if (!this.session) return {};
	            return this.session.getDataForModel(this.modelName);
	        }
	    }, {
	        key: 'idAttribute',
	        get: function get() {
	            return this.session.db.describe(this.modelName).idAttribute;
	        }
	    }, {
	        key: 'session',
	        get: function get() {
	            return this._session;
	        }
	    }, {
	        key: 'query',
	        get: function get() {
	            return this.getQuerySet();
	        }
	    }]);
	    return Model;
	}();
	
	Model.fields = {
	    id: (0, _fields.attr)()
	};
	Model.virtualFields = {};
	Model.querySetClass = _QuerySet2.default;
	
	exports.default = Model;

/***/ }),
/* 262 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _defineProperty = __webpack_require__(76);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (obj, key, value) {
	  if (key in obj) {
	    (0, _defineProperty2.default)(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }
	
	  return obj;
	};

/***/ }),
/* 263 */
/***/ (function(module, exports, __webpack_require__) {

	var baseUniq = __webpack_require__(264);
	
	/**
	 * Creates a duplicate-free version of an array, using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons, in which only the first occurrence of each element
	 * is kept. The order of result values is determined by the order they occur
	 * in the array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @returns {Array} Returns the new duplicate free array.
	 * @example
	 *
	 * _.uniq([2, 1, 2]);
	 * // => [2, 1]
	 */
	function uniq(array) {
	  return (array && array.length) ? baseUniq(array) : [];
	}
	
	module.exports = uniq;


/***/ }),
/* 264 */
/***/ (function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(156),
	    arrayIncludes = __webpack_require__(245),
	    arrayIncludesWith = __webpack_require__(246),
	    cacheHas = __webpack_require__(160),
	    createSet = __webpack_require__(265),
	    setToArray = __webpack_require__(164);
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/**
	 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function baseUniq(array, iteratee, comparator) {
	  var index = -1,
	      includes = arrayIncludes,
	      length = array.length,
	      isCommon = true,
	      result = [],
	      seen = result;
	
	  if (comparator) {
	    isCommon = false;
	    includes = arrayIncludesWith;
	  }
	  else if (length >= LARGE_ARRAY_SIZE) {
	    var set = iteratee ? null : createSet(array);
	    if (set) {
	      return setToArray(set);
	    }
	    isCommon = false;
	    includes = cacheHas;
	    seen = new SetCache;
	  }
	  else {
	    seen = iteratee ? [] : result;
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;
	
	    value = (comparator || value !== 0) ? value : 0;
	    if (isCommon && computed === computed) {
	      var seenIndex = seen.length;
	      while (seenIndex--) {
	        if (seen[seenIndex] === computed) {
	          continue outer;
	        }
	      }
	      if (iteratee) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	    else if (!includes(seen, computed, comparator)) {
	      if (seen !== result) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}
	
	module.exports = baseUniq;


/***/ }),
/* 265 */
/***/ (function(module, exports, __webpack_require__) {

	var Set = __webpack_require__(175),
	    noop = __webpack_require__(266),
	    setToArray = __webpack_require__(164);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/**
	 * Creates a set object of `values`.
	 *
	 * @private
	 * @param {Array} values The values to add to the set.
	 * @returns {Object} Returns the new set.
	 */
	var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
	  return new Set(values);
	};
	
	module.exports = createSet;


/***/ }),
/* 266 */
/***/ (function(module, exports) {

	/**
	 * This method returns `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.3.0
	 * @category Util
	 * @example
	 *
	 * _.times(2, _.noop);
	 * // => [undefined, undefined]
	 */
	function noop() {
	  // No operation performed.
	}
	
	module.exports = noop;


/***/ }),
/* 267 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _defineProperty = __webpack_require__(76);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	var _possibleConstructorReturn2 = __webpack_require__(268);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(269);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(75);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _immutableOps = __webpack_require__(224);
	
	var _constants = __webpack_require__(260);
	
	var _utils = __webpack_require__(200);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Session = function () {
	    /**
	     * Creates a new Session.
	     *
	     * @param  {Database} db - a {@link Database} instance
	     * @param  {Object} state - the database state
	     * @param  {Boolean} [withMutations] - whether the session should mutate data
	     * @param  {Object} [batchToken] - used by the backend to identify objects that can be
	     *                                 mutated.
	     */
	    function Session(schema, db, state, withMutations, batchToken) {
	        var _this2 = this;
	
	        (0, _classCallCheck3.default)(this, Session);
	
	        this.schema = schema;
	        this.db = db;
	        this.state = state || db.getEmptyState();
	        this.initialState = this.state;
	
	        this.withMutations = !!withMutations;
	        this.batchToken = batchToken || (0, _immutableOps.getBatchToken)();
	
	        this._accessedModels = {};
	        this.modelData = {};
	
	        this.models = schema.getModelClasses();
	
	        this.sessionBoundModels = this.models.map(function (modelClass) {
	            var sessionBoundModel = function (_modelClass) {
	                (0, _inherits3.default)(SessionBoundModel, _modelClass);
	
	                function SessionBoundModel() {
	                    (0, _classCallCheck3.default)(this, SessionBoundModel);
	                    return (0, _possibleConstructorReturn3.default)(this, _modelClass.apply(this, arguments));
	                }
	
	                return SessionBoundModel;
	            }(modelClass);
	            (0, _defineProperty2.default)(_this2, modelClass.modelName, {
	                get: function get() {
	                    return sessionBoundModel;
	                }
	            });
	
	            sessionBoundModel.connect(_this2);
	            return sessionBoundModel;
	        });
	    }
	
	    Session.prototype.markAccessed = function markAccessed(modelName) {
	        this.getDataForModel(modelName).accessed = true;
	    };
	
	    Session.prototype.getDataForModel = function getDataForModel(modelName) {
	        if (!this.modelData[modelName]) {
	            this.modelData[modelName] = {};
	        }
	        return this.modelData[modelName];
	    };
	
	    /**
	     * Applies update to a model state.
	     *
	     * @private
	     * @param {Object} update - the update object. Must have keys
	     *                          `type`, `payload`.
	     */
	
	
	    Session.prototype.applyUpdate = function applyUpdate(updateSpec) {
	        var batchToken = this.batchToken,
	            withMutations = this.withMutations;
	
	        var tx = { batchToken: batchToken, withMutations: withMutations };
	        var result = this.db.update(updateSpec, tx, this.state);
	        var status = result.status,
	            state = result.state;
	
	
	        if (status === _constants.SUCCESS) {
	            this.state = state;
	        } else {
	            throw new Error('Applying update failed: ' + result.toString());
	        }
	
	        return result.payload;
	    };
	
	    Session.prototype.query = function query(querySpec) {
	        var table = querySpec.table;
	
	        this.markAccessed(table);
	        return this.db.query(querySpec, this.state);
	    };
	
	    // DEPRECATED AND REMOVED METHODS
	
	    Session.prototype.getNextState = function getNextState() {
	        (0, _utils.warnDeprecated)('Session.prototype.getNextState function is deprecated. Access ' + 'the Session.prototype.state property instead.');
	        return this.state;
	    };
	
	    Session.prototype.reduce = function reduce() {
	        throw new Error('Session.prototype.reduce is removed. The Redux integration API ' + 'is now decoupled from ORM and Session - see the 0.9 migration guide ' + 'in the GitHub repo.');
	    };
	
	    (0, _createClass3.default)(Session, [{
	        key: 'accessedModels',
	        get: function get() {
	            var _this3 = this;
	
	            return this.sessionBoundModels.filter(function (model) {
	                return !!_this3.getDataForModel(model.modelName).accessed;
	            }).map(function (model) {
	                return model.modelName;
	            });
	        }
	    }]);
	    return Session;
	}();
	
	exports.default = Session;

/***/ }),
/* 268 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _typeof2 = __webpack_require__(2);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }
	
	  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
	};

/***/ }),
/* 269 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _setPrototypeOf = __webpack_require__(270);
	
	var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);
	
	var _create = __webpack_require__(274);
	
	var _create2 = _interopRequireDefault(_create);
	
	var _typeof2 = __webpack_require__(2);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
	  }
	
	  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
	};

/***/ }),
/* 270 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(271), __esModule: true };

/***/ }),
/* 271 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(272);
	module.exports = __webpack_require__(13).Object.setPrototypeOf;

/***/ }),
/* 272 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $export = __webpack_require__(11);
	$export($export.S, 'Object', {setPrototypeOf: __webpack_require__(273).set});

/***/ }),
/* 273 */
/***/ (function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var isObject = __webpack_require__(19)
	  , anObject = __webpack_require__(18);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function(test, buggy, set){
	      try {
	        set = __webpack_require__(14)(Function.call, __webpack_require__(66).f(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch(e){ buggy = true; }
	      return function setPrototypeOf(O, proto){
	        check(O, proto);
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

/***/ }),
/* 274 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(275), __esModule: true };

/***/ }),
/* 275 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(276);
	var $Object = __webpack_require__(13).Object;
	module.exports = function create(P, D){
	  return $Object.create(P, D);
	};

/***/ }),
/* 276 */
/***/ (function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(11)
	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	$export($export.S, 'Object', {create: __webpack_require__(30)});

/***/ }),
/* 277 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.OneToOne = exports.ManyToMany = exports.ForeignKey = exports.Attribute = undefined;
	
	var _slicedToArray2 = __webpack_require__(278);
	
	var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);
	
	var _getOwnPropertyDescriptor = __webpack_require__(205);
	
	var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);
	
	var _possibleConstructorReturn2 = __webpack_require__(268);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(269);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _typeof2 = __webpack_require__(2);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	var _defineProperty = __webpack_require__(76);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	exports.attr = attr;
	exports.fk = fk;
	exports.many = many;
	exports.oneToOne = oneToOne;
	
	var _findKey = __webpack_require__(285);
	
	var _findKey2 = _interopRequireDefault(_findKey);
	
	var _descriptors = __webpack_require__(287);
	
	var _utils = __webpack_require__(200);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * @module fields
	 */
	var Attribute = exports.Attribute = function () {
	    function Attribute(opts) {
	        (0, _classCallCheck3.default)(this, Attribute);
	
	        this.opts = opts || {};
	
	        if (this.opts.hasOwnProperty('getDefault')) {
	            this.getDefault = this.opts.getDefault;
	        }
	    }
	
	    Attribute.prototype.install = function install(model, fieldName, orm) {
	        (0, _defineProperty2.default)(model.prototype, fieldName, (0, _descriptors.attrDescriptor)(fieldName));
	    };
	
	    return Attribute;
	}();
	
	var RelationalField = function () {
	    function RelationalField() {
	        (0, _classCallCheck3.default)(this, RelationalField);
	
	        if (arguments.length === 1 && (0, _typeof3.default)(arguments.length <= 0 ? undefined : arguments[0]) === 'object') {
	            var opts = arguments.length <= 0 ? undefined : arguments[0];
	            this.toModelName = opts.to;
	            this.relatedName = opts.relatedName;
	            this.through = opts.through;
	            this.throughFields = opts.throughFields;
	        } else {
	            this.toModelName = arguments.length <= 0 ? undefined : arguments[0];
	            this.relatedName = arguments.length <= 1 ? undefined : arguments[1];
	        }
	    }
	
	    RelationalField.prototype.getClass = function getClass() {
	        return this.constructor;
	    };
	
	    return RelationalField;
	}();
	
	var ForeignKey = exports.ForeignKey = function (_RelationalField) {
	    (0, _inherits3.default)(ForeignKey, _RelationalField);
	
	    function ForeignKey() {
	        (0, _classCallCheck3.default)(this, ForeignKey);
	        return (0, _possibleConstructorReturn3.default)(this, _RelationalField.apply(this, arguments));
	    }
	
	    ForeignKey.prototype.install = function install(model, fieldName, orm) {
	        var toModelName = this.toModelName;
	        var toModel = toModelName === 'this' ? model : orm.get(toModelName);
	
	        // Forwards.
	        (0, _defineProperty2.default)(model.prototype, fieldName, (0, _descriptors.forwardManyToOneDescriptor)(fieldName, toModel.modelName));
	
	        // Backwards.
	        var backwardsFieldName = this.relatedName ? this.relatedName : (0, _utils.reverseFieldName)(model.modelName);
	
	        var backwardsDescriptor = (0, _getOwnPropertyDescriptor2.default)(toModel.prototype, backwardsFieldName);
	
	        if (backwardsDescriptor) {
	            var errorMsg = (0, _utils.reverseFieldErrorMessage)(model.modelName, fieldName, toModel.modelName, backwardsFieldName);
	            throw new Error(errorMsg);
	        }
	
	        (0, _defineProperty2.default)(toModel.prototype, backwardsFieldName, (0, _descriptors.backwardManyToOneDescriptor)(fieldName, model.modelName));
	
	        var ThisField = this.getClass();
	        toModel.virtualFields[backwardsFieldName] = new ThisField(model.modelName, fieldName);
	    };
	
	    return ForeignKey;
	}(RelationalField);
	
	var ManyToMany = exports.ManyToMany = function (_RelationalField2) {
	    (0, _inherits3.default)(ManyToMany, _RelationalField2);
	
	    function ManyToMany() {
	        (0, _classCallCheck3.default)(this, ManyToMany);
	        return (0, _possibleConstructorReturn3.default)(this, _RelationalField2.apply(this, arguments));
	    }
	
	    ManyToMany.prototype.install = function install(model, fieldName, orm) {
	        var toModelName = this.toModelName;
	        var toModel = toModelName === 'this' ? model : orm.get(toModelName);
	
	        // Forwards.
	
	        var throughModelName = this.through || (0, _utils.m2mName)(model.modelName, fieldName);
	
	        var throughModel = orm.get(throughModelName);
	
	        var throughFields = void 0;
	        if (!this.throughFields) {
	            var toFieldName = (0, _findKey2.default)(throughModel.fields, function (field) {
	                return field instanceof ForeignKey && field.toModelName === toModel.modelName;
	            });
	            var fromFieldName = (0, _findKey2.default)(throughModel.fields, function (field) {
	                return field instanceof ForeignKey && field.toModelName === model.modelName;
	            });
	            throughFields = {
	                to: toFieldName,
	                from: fromFieldName
	            };
	        } else {
	            var _throughFields = (0, _slicedToArray3.default)(this.throughFields, 2),
	                fieldAName = _throughFields[0],
	                fieldBName = _throughFields[1];
	
	            var fieldA = throughModel.fields[fieldAName];
	            if (fieldA.toModelName === toModel.modelName) {
	                throughFields = {
	                    to: fieldAName,
	                    from: fieldBName
	                };
	            } else {
	                throughFields = {
	                    to: fieldBName,
	                    from: fieldAName
	                };
	            }
	        }
	
	        (0, _defineProperty2.default)(model.prototype, fieldName, (0, _descriptors.manyToManyDescriptor)(model.modelName, toModel.modelName, throughModelName, throughFields, false));
	
	        model.virtualFields[fieldName] = new ManyToMany({
	            to: toModel.modelName,
	            relatedName: fieldName,
	            through: this.through,
	            throughFields: throughFields
	        });
	
	        // Backwards.
	        var backwardsFieldName = this.relatedName ? this.relatedName : (0, _utils.reverseFieldName)(model.modelName);
	
	        var backwardsDescriptor = (0, _getOwnPropertyDescriptor2.default)(toModel.prototype, backwardsFieldName);
	
	        if (backwardsDescriptor) {
	            // Backwards field was already defined on toModel.
	            var errorMsg = (0, _utils.reverseFieldErrorMessage)(model.modelName, fieldName, toModel.modelName, backwardsFieldName);
	            throw new Error(errorMsg);
	        }
	
	        (0, _defineProperty2.default)(toModel.prototype, backwardsFieldName, (0, _descriptors.manyToManyDescriptor)(model.modelName, toModel.modelName, throughModelName, throughFields, true));
	        toModel.virtualFields[backwardsFieldName] = new ManyToMany({
	            to: model.modelName,
	            relatedName: fieldName,
	            through: throughModelName,
	            throughFields: throughFields
	        });
	    };
	
	    ManyToMany.prototype.getDefault = function getDefault() {
	        return [];
	    };
	
	    return ManyToMany;
	}(RelationalField);
	
	var OneToOne = exports.OneToOne = function (_RelationalField3) {
	    (0, _inherits3.default)(OneToOne, _RelationalField3);
	
	    function OneToOne() {
	        (0, _classCallCheck3.default)(this, OneToOne);
	        return (0, _possibleConstructorReturn3.default)(this, _RelationalField3.apply(this, arguments));
	    }
	
	    OneToOne.prototype.install = function install(model, fieldName, orm) {
	        var toModelName = this.toModelName;
	        var toModel = toModelName === 'this' ? model : orm.get(toModelName);
	
	        // Forwards.
	        (0, _defineProperty2.default)(model.prototype, fieldName, (0, _descriptors.forwardOneToOneDescriptor)(fieldName, toModel.modelName));
	
	        // Backwards.
	        var backwardsFieldName = this.relatedName ? this.relatedName : model.modelName.toLowerCase();
	
	        var backwardsDescriptor = (0, _getOwnPropertyDescriptor2.default)(toModel.prototype, backwardsFieldName);
	
	        if (backwardsDescriptor) {
	            var errorMsg = (0, _utils.reverseFieldErrorMessage)(model.modelName, fieldName, toModel.modelName, backwardsFieldName);
	            throw new Error(errorMsg);
	        }
	
	        (0, _defineProperty2.default)(toModel.prototype, backwardsFieldName, (0, _descriptors.backwardOneToOneDescriptor)(fieldName, model.modelName));
	        toModel.virtualFields[backwardsFieldName] = new OneToOne(model.modelName, fieldName);
	    };
	
	    return OneToOne;
	}(RelationalField);
	
	/**
	 * Defines a value attribute on the model.
	 * Though not required, it is recommended to define this for each non-foreign key you wish to use.
	 * Getters and setters need to be defined on each Model
	 * instantiation for undeclared data fields, which is slower.
	 * You can use the optional `getDefault` parameter to fill in unpassed values
	 * to {@link Model#create}, such as for generating ID's with UUID:
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
	 * @param {Function} [opts.getDefault] - if you give a function here, it's return
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
	 * @param  {string|boolean} toModelNameOrObj - the `modelName` property of
	 *                                           the Model that is the target of the
	 *                                           foreign key, or an object with properties
	 *                                           `to` and optionally `relatedName`.
	 * @param {string} [relatedName] - if you didn't pass an object as the first argument,
	 *                                 this is the property name that will be used to
	 *                                 access a QuerySet the foreign key is defined from,
	 *                                 from the target model.
	 * @return {ForeignKey}
	 */
	function fk() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	    }
	
	    return new (Function.prototype.bind.apply(ForeignKey, [null].concat(args)))();
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
	 * If you have more than one foreign key pointing to a source or target Model in the
	 * through Model, you must pass the option `throughFields`, which is an array of two
	 * strings, where the strings are the field names that identify the foreign keys to
	 * be used for the many-to-many relationship. Redux-ORM will figure out which field name
	 * points to which model by checking the through Model definition.
	 *
	 * Unlike `fk`, this function accepts only an object argument.
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
	 *     // this is optional, since Redux-ORM can figure
	 *     // out the through fields itself as there aren't
	 *     // multiple foreign keys pointing to the same models.
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
	 * @param  {Object} options - options
	 * @param  {string} options.to - the `modelName` attribute of the target Model.
	 * @param  {string} [options.through] - the `modelName` attribute of the through Model which
	 *                                    must declare at least one foreign key to both source and
	 *                                    target Models. If not supplied, Redux-Orm will autogenerate
	 *                                    one.
	 * @param  {string[]} [options.throughFields] - this must be supplied only when a custom through
	 *                                            Model has more than one foreign key pointing to
	 *                                            either the source or target mode. In this case
	 *                                            Redux-ORM can't figure out the correct fields for
	 *                                            you, you must provide them. The supplied array should
	 *                                            have two elements that are the field names for the
	 *                                            through fields you want to declare the many-to-many
	 *                                            relationship with. The order doesn't matter;
	 *                                            Redux-ORM will figure out which field points to
	 *                                            the source Model and which to the target Model.
	 * @param  {string} [options.relatedName] - the attribute used to access a QuerySet
	 *                                          of source Models from target Model.
	 * @return {ManyToMany}
	 */
	function many() {
	    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        args[_key2] = arguments[_key2];
	    }
	
	    return new (Function.prototype.bind.apply(ManyToMany, [null].concat(args)))();
	}
	
	/**
	 * Defines a one-to-one relationship. In database terms, this is a foreign key with the
	 * added restriction that only one entity can point to single target entity.
	 *
	 * The arguments are the same as with `fk`. If `relatedName` is not supplied,
	 * the source model name in lowercase will be used. Note that with the one-to-one
	 * relationship, the `relatedName` should be in singular, not plural.
	 * @param  {string|boolean} toModelNameOrObj - the `modelName` property of
	 *                                           the Model that is the target of the
	 *                                           foreign key, or an object with properties
	 *                                           `to` and optionally `relatedName`.
	 * @param {string} [relatedName] - if you didn't pass an object as the first argument,
	 *                                 this is the property name that will be used to
	 *                                 access a Model the foreign key is defined from,
	 *                                 from the target Model.
	 * @return {OneToOne}
	 */
	function oneToOne() {
	    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	        args[_key3] = arguments[_key3];
	    }
	
	    return new (Function.prototype.bind.apply(OneToOne, [null].concat(args)))();
	}

/***/ }),
/* 278 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _isIterable2 = __webpack_require__(279);
	
	var _isIterable3 = _interopRequireDefault(_isIterable2);
	
	var _getIterator2 = __webpack_require__(282);
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;
	
	    try {
	      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);
	
	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }
	
	    return _arr;
	  }
	
	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if ((0, _isIterable3.default)(Object(arr))) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	}();

/***/ }),
/* 279 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(280), __esModule: true };

/***/ }),
/* 280 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(49);
	__webpack_require__(5);
	module.exports = __webpack_require__(281);

/***/ }),
/* 281 */
/***/ (function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(233)
	  , ITERATOR  = __webpack_require__(46)('iterator')
	  , Iterators = __webpack_require__(28);
	module.exports = __webpack_require__(13).isIterable = function(it){
	  var O = Object(it);
	  return O[ITERATOR] !== undefined
	    || '@@iterator' in O
	    || Iterators.hasOwnProperty(classof(O));
	};

/***/ }),
/* 282 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(283), __esModule: true };

/***/ }),
/* 283 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(49);
	__webpack_require__(5);
	module.exports = __webpack_require__(284);

/***/ }),
/* 284 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(18)
	  , get      = __webpack_require__(232);
	module.exports = __webpack_require__(13).getIterator = function(it){
	  var iterFn = get(it);
	  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};

/***/ }),
/* 285 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFindKey = __webpack_require__(286),
	    baseForOwn = __webpack_require__(96),
	    baseIteratee = __webpack_require__(120);
	
	/**
	 * This method is like `_.find` except that it returns the key of the first
	 * element `predicate` returns truthy for instead of the element itself.
	 *
	 * @static
	 * @memberOf _
	 * @since 1.1.0
	 * @category Object
	 * @param {Object} object The object to inspect.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @returns {string|undefined} Returns the key of the matched element,
	 *  else `undefined`.
	 * @example
	 *
	 * var users = {
	 *   'barney':  { 'age': 36, 'active': true },
	 *   'fred':    { 'age': 40, 'active': false },
	 *   'pebbles': { 'age': 1,  'active': true }
	 * };
	 *
	 * _.findKey(users, function(o) { return o.age < 40; });
	 * // => 'barney' (iteration order is not guaranteed)
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.findKey(users, { 'age': 1, 'active': true });
	 * // => 'pebbles'
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.findKey(users, ['active', false]);
	 * // => 'fred'
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.findKey(users, 'active');
	 * // => 'barney'
	 */
	function findKey(object, predicate) {
	  return baseFindKey(object, baseIteratee(predicate, 3), baseForOwn);
	}
	
	module.exports = findKey;


/***/ }),
/* 286 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of methods like `_.findKey` and `_.findLastKey`,
	 * without support for iteratee shorthands, which iterates over `collection`
	 * using `eachFunc`.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {Function} eachFunc The function to iterate over `collection`.
	 * @returns {*} Returns the found element or its key, else `undefined`.
	 */
	function baseFindKey(collection, predicate, eachFunc) {
	  var result;
	  eachFunc(collection, function(value, key, collection) {
	    if (predicate(value, key, collection)) {
	      result = key;
	      return false;
	    }
	  });
	  return result;
	}
	
	module.exports = baseFindKey;


/***/ }),
/* 287 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.manyToManyDescriptor = exports.backwardManyToOneDescriptor = exports.backwardOneToOneDescriptor = exports.forwardOneToOneDescriptor = exports.forwardManyToOneDescriptor = exports.attrDescriptor = undefined;
	
	var _defineProperty2 = __webpack_require__(262);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _difference = __webpack_require__(256);
	
	var _difference2 = _interopRequireDefault(_difference);
	
	var _utils = __webpack_require__(200);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function attrDescriptor(fieldName) {
	    return {
	        get: function get() {
	            return this._fields[fieldName];
	        },
	        set: function set(value) {
	            return this.set(fieldName, value);
	        },
	
	
	        enumerable: true,
	        configurable: true
	    };
	}
	
	// Forwards side a Foreign Key: returns one object.
	// Also works as forwardsOneToOneDescriptor.
	function forwardManyToOneDescriptor(fieldName, declaredToModelName) {
	    return {
	        get: function get() {
	            var currentSession = this.getClass().session;
	            var declaredToModel = currentSession[declaredToModelName];
	            var toId = this._fields[fieldName];
	            if (typeof toId !== 'undefined' && toId !== null) {
	                return declaredToModel.withId(toId);
	            }
	            return undefined;
	        },
	        set: function set(value) {
	            var currentSession = this.getClass().session;
	            var declaredToModel = currentSession[declaredToModelName];
	
	            var toId = void 0;
	            if (value instanceof declaredToModel) {
	                toId = value.getId();
	            } else {
	                toId = value;
	            }
	
	            this.update((0, _defineProperty3.default)({}, fieldName, toId));
	        }
	    };
	}
	
	var forwardOneToOneDescriptor = forwardManyToOneDescriptor;
	
	function backwardOneToOneDescriptor(declaredFieldName, declaredFromModelName) {
	    return {
	        get: function get() {
	            var currentSession = this.getClass().session;
	            var declaredFromModel = currentSession[declaredFromModelName];
	            var thisId = this.getId();
	            var found = void 0;
	            try {
	                found = declaredFromModel.get((0, _defineProperty3.default)({}, declaredFieldName, thisId));
	            } catch (e) {
	                return null;
	            }
	            return found;
	        },
	        set: function set() {
	            throw new Error('Can\'t mutate a reverse one-to-one relation.');
	        }
	    };
	}
	
	// Reverse side of a Foreign Key: returns many objects.
	function backwardManyToOneDescriptor(declaredFieldName, declaredFromModelName) {
	    return {
	        get: function get() {
	            var currentSession = this.getClass().session;
	            var declaredFromModel = currentSession[declaredFromModelName];
	            var thisId = this.getId();
	            return declaredFromModel.filter((0, _defineProperty3.default)({}, declaredFieldName, thisId));
	        },
	        set: function set() {
	            throw new Error('Can\'t mutate a reverse many-to-one relation.');
	        }
	    };
	}
	
	// Both sides of Many to Many, use the reverse flag.
	function manyToManyDescriptor(declaredFromModelName, declaredToModelName, throughModelName, throughFields, reverse) {
	    return {
	        get: function get() {
	            var currentSession = this.getClass().session;
	            var declaredFromModel = currentSession[declaredFromModelName];
	            var declaredToModel = currentSession[declaredToModelName];
	            var throughModel = currentSession[throughModelName];
	            var thisId = this.getId();
	
	            var fromFieldName = throughFields.from;
	            var toFieldName = throughFields.to;
	
	            var lookupObj = {};
	            if (!reverse) {
	                lookupObj[fromFieldName] = thisId;
	            } else {
	                lookupObj[toFieldName] = thisId;
	            }
	
	            var throughQs = throughModel.filter(lookupObj);
	            var toIds = throughQs.toRefArray().map(function (obj) {
	                return obj[reverse ? fromFieldName : toFieldName];
	            });
	
	            var qsFromModel = reverse ? declaredFromModel : declaredToModel;
	            var qs = qsFromModel.filter(function (attrs) {
	                return (0, _utils.includes)(toIds, attrs[qsFromModel.idAttribute]);
	            });
	
	            qs.add = function add() {
	                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                    args[_key] = arguments[_key];
	                }
	
	                var idsToAdd = args.map(_utils.normalizeEntity);
	
	                var filterWithAttr = reverse ? fromFieldName : toFieldName;
	
	                var existingQs = throughQs.filter(function (through) {
	                    return (0, _utils.includes)(idsToAdd, through[filterWithAttr]);
	                });
	
	                if (existingQs.exists()) {
	                    var existingIds = existingQs.toRefArray().map(function (through) {
	                        return through[filterWithAttr];
	                    });
	
	                    var toAddModel = reverse ? declaredFromModel.modelName : declaredToModel.modelName;
	
	                    var addFromModel = reverse ? declaredToModel.modelName : declaredFromModel.modelName;
	                    throw new Error('Tried to add already existing ' + toAddModel + ' id(s) ' + existingIds + ' to the ' + addFromModel + ' instance with id ' + thisId);
	                }
	
	                if (reverse) {
	                    idsToAdd.forEach(function (id) {
	                        var _throughModel$create;
	
	                        throughModel.create((_throughModel$create = {}, (0, _defineProperty3.default)(_throughModel$create, fromFieldName, id), (0, _defineProperty3.default)(_throughModel$create, toFieldName, thisId), _throughModel$create));
	                    });
	                } else {
	                    idsToAdd.forEach(function (id) {
	                        var _throughModel$create2;
	
	                        throughModel.create((_throughModel$create2 = {}, (0, _defineProperty3.default)(_throughModel$create2, fromFieldName, thisId), (0, _defineProperty3.default)(_throughModel$create2, toFieldName, id), _throughModel$create2));
	                    });
	                }
	            };
	
	            qs.clear = function clear() {
	                throughQs.delete();
	            };
	
	            qs.remove = function remove() {
	                for (var _len2 = arguments.length, entities = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	                    entities[_key2] = arguments[_key2];
	                }
	
	                var idsToRemove = entities.map(_utils.normalizeEntity);
	
	                var attrInIdsToRemove = reverse ? fromFieldName : toFieldName;
	                var entitiesToDelete = throughQs.filter(function (through) {
	                    return (0, _utils.includes)(idsToRemove, through[attrInIdsToRemove]);
	                });
	
	                if (entitiesToDelete.count() !== idsToRemove.length) {
	                    // Tried deleting non-existing entities.
	                    var entitiesToDeleteIds = entitiesToDelete.toRefArray().map(function (through) {
	                        return through[attrInIdsToRemove];
	                    });
	
	                    var unexistingIds = (0, _difference2.default)(idsToRemove, entitiesToDeleteIds);
	
	                    var toDeleteModel = reverse ? declaredFromModel.modelName : declaredToModel.modelName;
	
	                    var deleteFromModel = reverse ? declaredToModel.modelName : declaredFromModel.modelName;
	
	                    throw new Error('Tried to delete non-existing ' + toDeleteModel + ' id(s) ' + unexistingIds + ' from the ' + deleteFromModel + ' instance with id ' + thisId);
	                }
	
	                entitiesToDelete.delete();
	            };
	
	            return qs;
	        },
	        set: function set() {
	            throw new Error('Tried setting a M2M field. Please use the related QuerySet methods add and remove.');
	        }
	    };
	}
	
	exports.attrDescriptor = attrDescriptor;
	exports.forwardManyToOneDescriptor = forwardManyToOneDescriptor;
	exports.forwardOneToOneDescriptor = forwardOneToOneDescriptor;
	exports.backwardOneToOneDescriptor = backwardOneToOneDescriptor;
	exports.backwardManyToOneDescriptor = backwardManyToOneDescriptor;
	exports.manyToManyDescriptor = manyToManyDescriptor;

/***/ }),
/* 288 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ORM = undefined;
	
	var _defineProperty2 = __webpack_require__(262);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _possibleConstructorReturn2 = __webpack_require__(268);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(269);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _assign = __webpack_require__(70);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	exports.DeprecatedSchema = DeprecatedSchema;
	
	var _forOwn = __webpack_require__(211);
	
	var _forOwn2 = _interopRequireDefault(_forOwn);
	
	var _find = __webpack_require__(289);
	
	var _find2 = _interopRequireDefault(_find);
	
	var _Session = __webpack_require__(267);
	
	var _Session2 = _interopRequireDefault(_Session);
	
	var _Model2 = __webpack_require__(261);
	
	var _Model3 = _interopRequireDefault(_Model2);
	
	var _db = __webpack_require__(292);
	
	var _fields = __webpack_require__(277);
	
	var _redux = __webpack_require__(307);
	
	var _utils = __webpack_require__(200);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var ORM_DEFAULTS = {
	    createDatabase: _db.createDatabase
	};
	
	/**
	 * ORM - the Object Relational Mapper.
	 *
	 * Use instances of this class to:
	 *
	 * - Register your {@link Model} classes using {@link ORM#register}
	 * - Get the empty state for the underlying database with {@link ORM#getEmptyState}
	 * - Start an immutable database session with {@link ORM#session}
	 * - Start a mutating database session with {@link ORM#mutableSession}
	 *
	 * Internally, this class handles generating a schema specification from models
	 * to the database.
	 */
	var ORM = exports.ORM = function () {
	    /**
	     * Creates a new ORM instance.
	     */
	    function ORM(opts) {
	        (0, _classCallCheck3.default)(this, ORM);
	
	        var _Object$assign = (0, _assign2.default)({}, ORM_DEFAULTS, opts || {}),
	            createDatabase = _Object$assign.createDatabase;
	
	        this.createDatabase = createDatabase;
	        this.registry = [];
	        this.implicitThroughModels = [];
	        this.installedFields = {};
	    }
	
	    /**
	     * Registers a {@link Model} class to the ORM.
	     *
	     * If the model has declared any ManyToMany fields, their
	     * through models will be generated and registered with
	     * this call, unless a custom through model has been specified.
	     *
	     * @param  {...Model} model - a {@link Model} class to register
	     * @return {undefined}
	     */
	
	
	    ORM.prototype.register = function register() {
	        var _this = this;
	
	        for (var _len = arguments.length, models = Array(_len), _key = 0; _key < _len; _key++) {
	            models[_key] = arguments[_key];
	        }
	
	        models.forEach(function (model) {
	            model.invalidateClassCache();
	
	            _this.registerManyToManyModelsFor(model);
	            _this.registry.push(model);
	        });
	    };
	
	    ORM.prototype.registerManyToManyModelsFor = function registerManyToManyModelsFor(model) {
	        var _this3 = this;
	
	        var fields = model.fields;
	        var thisModelName = model.modelName;
	
	        (0, _forOwn2.default)(fields, function (fieldInstance, fieldName) {
	            if (fieldInstance instanceof _fields.ManyToMany && !fieldInstance.through) {
	                var _Through$fields;
	
	                var toModelName = void 0;
	                if (fieldInstance.toModelName === 'this') {
	                    toModelName = thisModelName;
	                } else {
	                    toModelName = fieldInstance.toModelName;
	                }
	
	                var fromFieldName = (0, _utils.m2mFromFieldName)(thisModelName);
	                var toFieldName = (0, _utils.m2mToFieldName)(toModelName);
	
	                var Through = function (_Model) {
	                    (0, _inherits3.default)(ThroughModel, _Model);
	
	                    function ThroughModel() {
	                        (0, _classCallCheck3.default)(this, ThroughModel);
	                        return (0, _possibleConstructorReturn3.default)(this, _Model.apply(this, arguments));
	                    }
	
	                    return ThroughModel;
	                }(_Model3.default);
	
	                Through.modelName = (0, _utils.m2mName)(thisModelName, fieldName);
	
	                Through.fields = (_Through$fields = {
	                    id: (0, _fields.attr)()
	                }, (0, _defineProperty3.default)(_Through$fields, fromFieldName, new _fields.ForeignKey(thisModelName)), (0, _defineProperty3.default)(_Through$fields, toFieldName, new _fields.ForeignKey(toModelName)), _Through$fields);
	
	                Through.invalidateClassCache();
	                _this3.implicitThroughModels.push(Through);
	            }
	        });
	    };
	
	    /**
	     * Gets a {@link Model} class by its name from the registry.
	     * @param  {string} modelName - the name of the {@link Model} class to get
	     * @throws If {@link Model} class is not found.
	     * @return {Model} the {@link Model} class, if found
	     */
	
	
	    ORM.prototype.get = function get(modelName) {
	        var found = (0, _find2.default)(this.registry.concat(this.implicitThroughModels), function (model) {
	            return model.modelName === modelName;
	        });
	
	        if (typeof found === 'undefined') {
	            throw new Error('Did not find model ' + modelName + ' from registry.');
	        }
	        return found;
	    };
	
	    ORM.prototype.getModelClasses = function getModelClasses() {
	        this._setupModelPrototypes(this.registry);
	        this._setupModelPrototypes(this.implicitThroughModels);
	        return this.registry.concat(this.implicitThroughModels);
	    };
	
	    ORM.prototype._attachQuerySetMethods = function _attachQuerySetMethods(model) {
	        var querySetClass = model.querySetClass;
	
	        (0, _utils.attachQuerySetMethods)(model, querySetClass);
	    };
	
	    ORM.prototype.isFieldInstalled = function isFieldInstalled(modelName, fieldName) {
	        return this.installedFields.hasOwnProperty(modelName) ? !!this.installedFields[modelName][fieldName] : false;
	    };
	
	    ORM.prototype.setFieldInstalled = function setFieldInstalled(modelName, fieldName) {
	        if (!this.installedFields.hasOwnProperty(modelName)) {
	            this.installedFields[modelName] = {};
	        }
	        this.installedFields[modelName][fieldName] = true;
	    };
	
	    ORM.prototype._setupModelPrototypes = function _setupModelPrototypes(models) {
	        var _this4 = this;
	
	        models.forEach(function (model) {
	            if (!model.isSetUp) {
	                var fields = model.fields;
	                (0, _forOwn2.default)(fields, function (fieldInstance, fieldName) {
	                    if (!_this4.isFieldInstalled(model.modelName, fieldName)) {
	                        fieldInstance.install(model, fieldName, _this4);
	                        _this4.setFieldInstalled(model.modelName, fieldName);
	                    }
	                });
	                _this4._attachQuerySetMethods(model);
	                model.isSetUp = true;
	            }
	        });
	    };
	
	    ORM.prototype.generateSchemaSpec = function generateSchemaSpec() {
	        var models = this.getModelClasses();
	        var tables = models.reduce(function (spec, modelClass) {
	            var tableName = modelClass.modelName;
	            var tableSpec = modelClass._getTableOpts(); // eslint-disable-line no-underscore-dangle
	            spec[tableName] = (0, _assign2.default)({}, { fields: modelClass.fields }, tableSpec);
	            return spec;
	        }, {});
	        return { tables: tables };
	    };
	
	    ORM.prototype.getDatabase = function getDatabase() {
	        if (!this.db) {
	            this.db = this.createDatabase(this.generateSchemaSpec());
	        }
	        return this.db;
	    };
	
	    /**
	     * Returns the empty database state.
	     * @return {Object} the empty state
	     */
	
	
	    ORM.prototype.getEmptyState = function getEmptyState() {
	        return this.getDatabase().getEmptyState();
	    };
	
	    /**
	     * Begins an immutable database session.
	     *
	     * @param  {Object} state  - the state the database manages
	     * @return {Session} a new {@link Session} instance
	     */
	
	
	    ORM.prototype.session = function session(state) {
	        return new _Session2.default(this, this.getDatabase(), state);
	    };
	
	    /**
	     * Begins a mutable database session.
	     *
	     * @param  {Object} state  - the state the database manages
	     * @return {Session} a new {@link Session} instance
	     */
	
	
	    ORM.prototype.mutableSession = function mutableSession(state) {
	        return new _Session2.default(this, this.getDatabase(), state, true);
	    };
	
	    // DEPRECATED AND REMOVED METHODS
	
	    ORM.prototype.withMutations = function withMutations(state) {
	        (0, _utils.warnDeprecated)('ORM.prototype.withMutations is deprecated. ' + 'Use ORM.prototype.mutableSession instead.');
	
	        return this.mutableSession(state);
	    };
	
	    ORM.prototype.from = function from(state) {
	        (0, _utils.warnDeprecated)('ORM.prototype.from function is deprecated. ' + 'Use ORM.prototype.session instead.');
	        return this.session(state);
	    };
	
	    ORM.prototype.reducer = function reducer() {
	        (0, _utils.warnDeprecated)('ORM.prototype.reducer is deprecated. Access ' + 'the Session.prototype.state property instead.');
	        return (0, _redux.createReducer)(this);
	    };
	
	    ORM.prototype.createSelector = function createSelector() {
	        (0, _utils.warnDeprecated)('ORM.prototype.createSelector is deprecated. ' + 'Import `createSelector` from Redux-ORM instead.');
	
	        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	            args[_key2] = arguments[_key2];
	        }
	
	        return _redux.createSelector.apply(undefined, [this].concat(args));
	    };
	
	    ORM.prototype.getDefaultState = function getDefaultState() {
	        (0, _utils.warnDeprecated)('ORM.prototype.getDefaultState is deprecated. Use ' + 'the ORM.prototype.getEmptyState instead.');
	        return this.getEmptyState();
	    };
	
	    ORM.prototype.define = function define() {
	        throw new Error('ORM.prototype.define is removed. Please define a Model class.');
	    };
	
	    return ORM;
	}();
	
	function DeprecatedSchema() {
	    throw new Error('Schema has been renamed to ORM. Please import ORM instead of Schema ' + 'from Redux-ORM.');
	}
	
	exports.default = ORM;

/***/ }),
/* 289 */
/***/ (function(module, exports, __webpack_require__) {

	var createFind = __webpack_require__(290),
	    findIndex = __webpack_require__(291);
	
	/**
	 * Iterates over elements of `collection`, returning the first element
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to inspect.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @returns {*} Returns the matched element, else `undefined`.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney',  'age': 36, 'active': true },
	 *   { 'user': 'fred',    'age': 40, 'active': false },
	 *   { 'user': 'pebbles', 'age': 1,  'active': true }
	 * ];
	 *
	 * _.find(users, function(o) { return o.age < 40; });
	 * // => object for 'barney'
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.find(users, { 'age': 1, 'active': true });
	 * // => object for 'pebbles'
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.find(users, ['active', false]);
	 * // => object for 'fred'
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.find(users, 'active');
	 * // => object for 'barney'
	 */
	var find = createFind(findIndex);
	
	module.exports = find;


/***/ }),
/* 290 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIteratee = __webpack_require__(120),
	    isArrayLike = __webpack_require__(119),
	    keys = __webpack_require__(99);
	
	/**
	 * Creates a `_.find` or `_.findLast` function.
	 *
	 * @private
	 * @param {Function} findIndexFunc The function to find the collection index.
	 * @returns {Function} Returns the new find function.
	 */
	function createFind(findIndexFunc) {
	  return function(collection, predicate, fromIndex) {
	    var iterable = Object(collection);
	    if (!isArrayLike(collection)) {
	      var iteratee = baseIteratee(predicate, 3);
	      collection = keys(collection);
	      predicate = function(key) { return iteratee(iterable[key], key, iterable); };
	    }
	    var index = findIndexFunc(collection, predicate, fromIndex);
	    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
	  };
	}
	
	module.exports = createFind;


/***/ }),
/* 291 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFindIndex = __webpack_require__(215),
	    baseIteratee = __webpack_require__(120),
	    toInteger = __webpack_require__(219);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * This method is like `_.find` except that it returns the index of the first
	 * element `predicate` returns truthy for instead of the element itself.
	 *
	 * @static
	 * @memberOf _
	 * @since 1.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @returns {number} Returns the index of the found element, else `-1`.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney',  'active': false },
	 *   { 'user': 'fred',    'active': false },
	 *   { 'user': 'pebbles', 'active': true }
	 * ];
	 *
	 * _.findIndex(users, function(o) { return o.user == 'barney'; });
	 * // => 0
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.findIndex(users, { 'user': 'fred', 'active': false });
	 * // => 1
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.findIndex(users, ['active', false]);
	 * // => 0
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.findIndex(users, 'active');
	 * // => 2
	 */
	function findIndex(array, predicate, fromIndex) {
	  var length = array == null ? 0 : array.length;
	  if (!length) {
	    return -1;
	  }
	  var index = fromIndex == null ? 0 : toInteger(fromIndex);
	  if (index < 0) {
	    index = nativeMax(length + index, 0);
	  }
	  return baseFindIndex(array, baseIteratee(predicate, 3), index);
	}
	
	module.exports = findIndex;


/***/ }),
/* 292 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.createDatabase = undefined;
	
	var _Database = __webpack_require__(293);
	
	var _Database2 = _interopRequireDefault(_Database);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.createDatabase = _Database2.default;
	exports.default = _Database2.default;

/***/ }),
/* 293 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.createDatabase = createDatabase;
	
	var _mapValues = __webpack_require__(79);
	
	var _mapValues2 = _interopRequireDefault(_mapValues);
	
	var _immutableOps = __webpack_require__(224);
	
	var _immutableOps2 = _interopRequireDefault(_immutableOps);
	
	var _constants = __webpack_require__(260);
	
	var _Table = __webpack_require__(294);
	
	var _Table2 = _interopRequireDefault(_Table);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function replaceTableState(tableName, newTableState, tx, state) {
	    var batchToken = tx.batchToken,
	        withMutations = tx.withMutations;
	
	
	    if (withMutations) {
	        state[tableName] = newTableState;
	        return state;
	    }
	
	    return _immutableOps2.default.batch.set(batchToken, tableName, newTableState, state);
	}
	
	function query(tables, querySpec, state) {
	    var tableName = querySpec.table,
	        clauses = querySpec.clauses;
	
	    var table = tables[tableName];
	    var rows = table.query(state[tableName], clauses);
	    return {
	        rows: rows
	    };
	}
	
	function update(tables, updateSpec, tx, state) {
	    var action = updateSpec.action,
	        payload = updateSpec.payload;
	
	
	    var tableName = void 0;
	    var nextTableState = void 0;
	    var resultPayload = void 0;
	
	    if (action === _constants.CREATE) {
	        tableName = updateSpec.table;
	
	        var table = tables[tableName];
	        var currTableState = state[tableName];
	        var result = table.insert(tx, currTableState, payload);
	        nextTableState = result.state;
	        resultPayload = result.created;
	    } else {
	        var querySpec = updateSpec.query;
	        tableName = querySpec.table;
	
	        var _query = query(tables, querySpec, state),
	            rows = _query.rows;
	
	        var _table = tables[tableName];
	        var _currTableState = state[tableName];
	
	        if (action === _constants.UPDATE) {
	            nextTableState = _table.update(tx, _currTableState, rows, payload);
	        } else if (action === _constants.DELETE) {
	            nextTableState = _table.delete(tx, _currTableState, rows);
	        } else {
	            throw new Error('Database received unknown update type: ' + action);
	        }
	    }
	
	    var nextDBState = replaceTableState(tableName, nextTableState, tx, state);
	    return {
	        status: _constants.SUCCESS,
	        state: nextDBState,
	        payload: resultPayload
	    };
	}
	
	function createDatabase(schemaSpec) {
	    var tablesSpec = schemaSpec.tables;
	
	    var tables = (0, _mapValues2.default)(tablesSpec, function (tableSpec) {
	        return new _Table2.default(tableSpec);
	    });
	
	    var getEmptyState = function getEmptyState() {
	        return (0, _mapValues2.default)(tables, function (table) {
	            return table.getEmptyState();
	        });
	    };
	    return {
	        getEmptyState: getEmptyState,
	        query: query.bind(null, tables),
	        update: update.bind(null, tables),
	        // Used to inspect the schema.
	        describe: function describe(tableName) {
	            return tables[tableName];
	        }
	    };
	}
	
	exports.default = createDatabase;

/***/ }),
/* 294 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _defineProperty2 = __webpack_require__(262);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _slicedToArray2 = __webpack_require__(278);
	
	var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);
	
	var _assign = __webpack_require__(70);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _reject = __webpack_require__(295);
	
	var _reject2 = _interopRequireDefault(_reject);
	
	var _filter = __webpack_require__(300);
	
	var _filter2 = _interopRequireDefault(_filter);
	
	var _orderBy = __webpack_require__(301);
	
	var _orderBy2 = _interopRequireDefault(_orderBy);
	
	var _immutableOps = __webpack_require__(224);
	
	var _immutableOps2 = _interopRequireDefault(_immutableOps);
	
	var _constants = __webpack_require__(260);
	
	var _utils = __webpack_require__(200);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var DEFAULT_OPTS = {
	    idAttribute: 'id',
	    arrName: 'items',
	    mapName: 'itemsById'
	};
	
	// Input is the current max id and the new id passed to the create action.
	// Both may be undefined. The current max id in the case that this is the first Model
	// being created, and the new id if the id was not explicitly passed to the
	// database.
	//
	// Return value is the new max id and the id to use to create the new row.
	// If the id's are strings, the id must be passed explicitly every time.
	// In this case, the current max id will remain `NaN` due to `Math.max`, but that's fine.
	function idSequencer(_currMax, userPassedId) {
	    var currMax = _currMax;
	    var newMax = void 0;
	    var newId = void 0;
	
	    if (currMax === undefined) {
	        currMax = -1;
	    }
	
	    if (userPassedId === undefined) {
	        newMax = currMax + 1;
	        newId = newMax;
	    } else {
	        newMax = Math.max(currMax + 1, userPassedId);
	        newId = userPassedId;
	    }
	
	    return [newMax, // new max id
	    newId];
	}
	
	/**
	 * Handles the underlying data structure for a {@link Model} class.
	 */
	var Table = function () {
	    /**
	     * Creates a new {@link Table} instance.
	     * @param  {Object} userOpts - options to use.
	     * @param  {string} [userOpts.idAttribute=id] - the id attribute of the entity.
	     * @param  {string} [userOpts.arrName=items] - the state attribute where an array of
	     *                                             entity id's are stored
	     * @param  {string} [userOpts.mapName=itemsById] - the state attribute where the entity objects
	     *                                                 are stored in a id to entity object
	     *                                                 map.
	     */
	    function Table(userOpts) {
	        (0, _classCallCheck3.default)(this, Table);
	
	        (0, _assign2.default)(this, DEFAULT_OPTS, userOpts);
	    }
	
	    /**
	     * Returns a reference to the object at index `id`
	     * in state `branch`.
	     *
	     * @param  {Object} branch - the state
	     * @param  {Number} id - the id of the object to get
	     * @return {Object|undefined} A reference to the raw object in the state or
	     *                            `undefined` if not found.
	     */
	
	
	    Table.prototype.accessId = function accessId(branch, id) {
	        return branch[this.mapName][id];
	    };
	
	    Table.prototype.idExists = function idExists(branch, id) {
	        return branch[this.mapName].hasOwnProperty(id);
	    };
	
	    Table.prototype.accessIdList = function accessIdList(branch) {
	        return branch[this.arrName];
	    };
	
	    Table.prototype.accessList = function accessList(branch) {
	        var _this = this;
	
	        return branch[this.arrName].map(function (id) {
	            return _this.accessId(branch, id);
	        });
	    };
	
	    Table.prototype.getMaxId = function getMaxId(branch) {
	        return this.getMeta(branch, 'maxId');
	    };
	
	    Table.prototype.setMaxId = function setMaxId(tx, branch, newMaxId) {
	        return this.setMeta(tx, branch, 'maxId', newMaxId);
	    };
	
	    Table.prototype.nextId = function nextId(id) {
	        return id + 1;
	    };
	
	    Table.prototype.query = function query(branch, clauses) {
	        var _this2 = this;
	
	        return clauses.reduce(function (rows, _ref) {
	            var type = _ref.type,
	                payload = _ref.payload;
	
	            switch (type) {
	                case _constants.FILTER:
	                    {
	                        if (payload.hasOwnProperty(_this2.idAttribute) && payload[_this2.idAttribute]) {
	                            // Payload specified a primary key; Since that is unique, we can directly
	                            // return that.
	                            var id = payload[_this2.idAttribute];
	                            return _this2.idExists(branch, id) ? [_this2.accessId(branch, payload[_this2.idAttribute])] : [];
	                        }
	                        return (0, _filter2.default)(rows, payload);
	                    }
	                case _constants.EXCLUDE:
	                    {
	                        return (0, _reject2.default)(rows, payload);
	                    }
	                case _constants.ORDER_BY:
	                    {
	                        var _payload = (0, _slicedToArray3.default)(payload, 2),
	                            iteratees = _payload[0],
	                            orders = _payload[1];
	
	                        return (0, _orderBy2.default)(rows, iteratees, orders);
	                    }
	                default:
	                    return rows;
	            }
	        }, this.accessList(branch));
	    };
	
	    /**
	     * Returns the default state for the data structure.
	     * @return {Object} The default state for this {@link Backend} instance's data structure
	     */
	
	
	    Table.prototype.getEmptyState = function getEmptyState() {
	        var _ref2;
	
	        return _ref2 = {}, (0, _defineProperty3.default)(_ref2, this.arrName, []), (0, _defineProperty3.default)(_ref2, this.mapName, {}), (0, _defineProperty3.default)(_ref2, 'meta', {}), _ref2;
	    };
	
	    Table.prototype.setMeta = function setMeta(tx, branch, key, value) {
	        var batchToken = tx.batchToken,
	            withMutations = tx.withMutations;
	
	        if (withMutations) {
	            var res = _immutableOps2.default.mutable.setIn(['meta', key], value, branch);
	            return res;
	        }
	
	        return _immutableOps2.default.batch.setIn(batchToken, ['meta', key], value, branch);
	    };
	
	    Table.prototype.getMeta = function getMeta(branch, key) {
	        return branch.meta[key];
	    };
	
	    /**
	     * Returns the data structure including a new object `entry`
	     * @param  {Object} tx - transaction info
	     * @param  {Object} branch - the data structure state
	     * @param  {Object} entry - the object to insert
	     * @return {Object} an object with two keys: `state` and `created`.
	     *                  `state` is the new table state and `created` is the
	     *                  row that was created.
	     */
	
	
	    Table.prototype.insert = function insert(tx, branch, entry) {
	        var _ops$batch$merge2;
	
	        var batchToken = tx.batchToken,
	            withMutations = tx.withMutations;
	
	
	        var hasId = entry.hasOwnProperty(this.idAttribute);
	
	        var workingState = branch;
	
	        // This will not affect string id's.
	
	        var _idSequencer = idSequencer(this.getMaxId(branch), entry[this.idAttribute]),
	            _idSequencer2 = (0, _slicedToArray3.default)(_idSequencer, 2),
	            newMaxId = _idSequencer2[0],
	            id = _idSequencer2[1];
	
	        workingState = this.setMaxId(tx, branch, newMaxId);
	
	        var finalEntry = hasId ? entry : _immutableOps2.default.batch.set(batchToken, this.idAttribute, id, entry);
	
	        if (withMutations) {
	            _immutableOps2.default.mutable.push(id, workingState[this.arrName]);
	            _immutableOps2.default.mutable.set(id, finalEntry, workingState[this.mapName]);
	            return {
	                state: workingState,
	                created: finalEntry
	            };
	        }
	
	        var nextState = _immutableOps2.default.batch.merge(batchToken, (_ops$batch$merge2 = {}, (0, _defineProperty3.default)(_ops$batch$merge2, this.arrName, _immutableOps2.default.batch.push(batchToken, id, workingState[this.arrName])), (0, _defineProperty3.default)(_ops$batch$merge2, this.mapName, _immutableOps2.default.batch.merge(batchToken, (0, _defineProperty3.default)({}, id, finalEntry), workingState[this.mapName])), _ops$batch$merge2), workingState);
	
	        return {
	            state: nextState,
	            created: finalEntry
	        };
	    };
	
	    /**
	     * Returns the data structure with objects where `rows`
	     * are merged with `mergeObj`.
	     *
	     * @param  {Object} tx - transaction info
	     * @param  {Object} branch - the data structure state
	     * @param  {Object[]} rows - rows to update
	     * @param  {Object} mergeObj - The object to merge with each row.
	     * @return {Object}
	     */
	
	
	    Table.prototype.update = function update(tx, branch, rows, mergeObj) {
	        var _this3 = this;
	
	        var batchToken = tx.batchToken,
	            withMutations = tx.withMutations;
	        var mapName = this.mapName;
	
	
	        var mapFunction = function mapFunction(row) {
	            var merge = withMutations ? _immutableOps2.default.mutable.merge : _immutableOps2.default.batch.merge(batchToken);
	            return merge(mergeObj, row);
	        };
	
	        var set = withMutations ? _immutableOps2.default.mutable.set : _immutableOps2.default.batch.set(batchToken);
	
	        var newMap = rows.reduce(function (map, row) {
	            var result = mapFunction(row);
	            return set(result[_this3.idAttribute], result, map);
	        }, branch[mapName]);
	        return _immutableOps2.default.batch.set(batchToken, mapName, newMap, branch);
	    };
	
	    /**
	     * Returns the data structure without rows `rows`.
	     * @param  {Object} tx - transaction info
	     * @param  {Object} branch - the data structure state
	     * @param  {Object[]} rows - rows to update
	     * @return {Object} the data structure without ids in `idsToDelete`.
	     */
	
	
	    Table.prototype.delete = function _delete(tx, branch, rows) {
	        var _this4 = this,
	            _ops$batch$merge3;
	
	        var batchToken = tx.batchToken,
	            withMutations = tx.withMutations;
	        var arrName = this.arrName,
	            mapName = this.mapName;
	
	        var arr = branch[arrName];
	
	        var idsToDelete = rows.map(function (row) {
	            return row[_this4.idAttribute];
	        });
	        if (withMutations) {
	            idsToDelete.forEach(function (id) {
	                var idx = arr.indexOf(id);
	                if (idx !== -1) {
	                    _immutableOps2.default.mutable.splice(idx, 1, [], arr);
	                }
	
	                _immutableOps2.default.mutable.omit(id, branch[mapName]);
	            });
	            return branch;
	        }
	
	        return _immutableOps2.default.batch.merge(batchToken, (_ops$batch$merge3 = {}, (0, _defineProperty3.default)(_ops$batch$merge3, arrName, _immutableOps2.default.batch.filter(batchToken, function (id) {
	            return !(0, _utils.includes)(idsToDelete, id);
	        }, branch[arrName])), (0, _defineProperty3.default)(_ops$batch$merge3, mapName, _immutableOps2.default.batch.omit(batchToken, idsToDelete, branch[mapName])), _ops$batch$merge3), branch);
	    };
	
	    return Table;
	}();
	
	exports.default = Table;

/***/ }),
/* 295 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(170),
	    baseFilter = __webpack_require__(296),
	    baseIteratee = __webpack_require__(120),
	    isArray = __webpack_require__(105),
	    negate = __webpack_require__(299);
	
	/**
	 * The opposite of `_.filter`; this method returns the elements of `collection`
	 * that `predicate` does **not** return truthy for.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 * @see _.filter
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney', 'age': 36, 'active': false },
	 *   { 'user': 'fred',   'age': 40, 'active': true }
	 * ];
	 *
	 * _.reject(users, function(o) { return !o.active; });
	 * // => objects for ['fred']
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.reject(users, { 'age': 40, 'active': true });
	 * // => objects for ['barney']
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.reject(users, ['active', false]);
	 * // => objects for ['fred']
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.reject(users, 'active');
	 * // => objects for ['barney']
	 */
	function reject(collection, predicate) {
	  var func = isArray(collection) ? arrayFilter : baseFilter;
	  return func(collection, negate(baseIteratee(predicate, 3)));
	}
	
	module.exports = reject;


/***/ }),
/* 296 */
/***/ (function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(297);
	
	/**
	 * The base implementation of `_.filter` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function baseFilter(collection, predicate) {
	  var result = [];
	  baseEach(collection, function(value, index, collection) {
	    if (predicate(value, index, collection)) {
	      result.push(value);
	    }
	  });
	  return result;
	}
	
	module.exports = baseFilter;


/***/ }),
/* 297 */
/***/ (function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(96),
	    createBaseEach = __webpack_require__(298);
	
	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);
	
	module.exports = baseEach;


/***/ }),
/* 298 */
/***/ (function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(119);
	
	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);
	
	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}
	
	module.exports = createBaseEach;


/***/ }),
/* 299 */
/***/ (function(module, exports) {

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/**
	 * Creates a function that negates the result of the predicate `func`. The
	 * `func` predicate is invoked with the `this` binding and arguments of the
	 * created function.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Function
	 * @param {Function} predicate The predicate to negate.
	 * @returns {Function} Returns the new negated function.
	 * @example
	 *
	 * function isEven(n) {
	 *   return n % 2 == 0;
	 * }
	 *
	 * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
	 * // => [1, 3, 5]
	 */
	function negate(predicate) {
	  if (typeof predicate != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  return function() {
	    var args = arguments;
	    switch (args.length) {
	      case 0: return !predicate.call(this);
	      case 1: return !predicate.call(this, args[0]);
	      case 2: return !predicate.call(this, args[0], args[1]);
	      case 3: return !predicate.call(this, args[0], args[1], args[2]);
	    }
	    return !predicate.apply(this, args);
	  };
	}
	
	module.exports = negate;


/***/ }),
/* 300 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(170),
	    baseFilter = __webpack_require__(296),
	    baseIteratee = __webpack_require__(120),
	    isArray = __webpack_require__(105);
	
	/**
	 * Iterates over elements of `collection`, returning an array of all elements
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * **Note:** Unlike `_.remove`, this method returns a new array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 * @see _.reject
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney', 'age': 36, 'active': true },
	 *   { 'user': 'fred',   'age': 40, 'active': false }
	 * ];
	 *
	 * _.filter(users, function(o) { return !o.active; });
	 * // => objects for ['fred']
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.filter(users, { 'age': 36, 'active': true });
	 * // => objects for ['barney']
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.filter(users, ['active', false]);
	 * // => objects for ['fred']
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.filter(users, 'active');
	 * // => objects for ['barney']
	 */
	function filter(collection, predicate) {
	  var func = isArray(collection) ? arrayFilter : baseFilter;
	  return func(collection, baseIteratee(predicate, 3));
	}
	
	module.exports = filter;


/***/ }),
/* 301 */
/***/ (function(module, exports, __webpack_require__) {

	var baseOrderBy = __webpack_require__(302),
	    isArray = __webpack_require__(105);
	
	/**
	 * This method is like `_.sortBy` except that it allows specifying the sort
	 * orders of the iteratees to sort by. If `orders` is unspecified, all values
	 * are sorted in ascending order. Otherwise, specify an order of "desc" for
	 * descending or "asc" for ascending sort order of corresponding values.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Array[]|Function[]|Object[]|string[]} [iteratees=[_.identity]]
	 *  The iteratees to sort by.
	 * @param {string[]} [orders] The sort orders of `iteratees`.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
	 * @returns {Array} Returns the new sorted array.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'fred',   'age': 48 },
	 *   { 'user': 'barney', 'age': 34 },
	 *   { 'user': 'fred',   'age': 40 },
	 *   { 'user': 'barney', 'age': 36 }
	 * ];
	 *
	 * // Sort by `user` in ascending order and by `age` in descending order.
	 * _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
	 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
	 */
	function orderBy(collection, iteratees, orders, guard) {
	  if (collection == null) {
	    return [];
	  }
	  if (!isArray(iteratees)) {
	    iteratees = iteratees == null ? [] : [iteratees];
	  }
	  orders = guard ? undefined : orders;
	  if (!isArray(orders)) {
	    orders = orders == null ? [] : [orders];
	  }
	  return baseOrderBy(collection, iteratees, orders);
	}
	
	module.exports = orderBy;


/***/ }),
/* 302 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(191),
	    baseIteratee = __webpack_require__(120),
	    baseMap = __webpack_require__(303),
	    baseSortBy = __webpack_require__(304),
	    baseUnary = __webpack_require__(113),
	    compareMultiple = __webpack_require__(305),
	    identity = __webpack_require__(196);
	
	/**
	 * The base implementation of `_.orderBy` without param guards.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
	 * @param {string[]} orders The sort orders of `iteratees`.
	 * @returns {Array} Returns the new sorted array.
	 */
	function baseOrderBy(collection, iteratees, orders) {
	  var index = -1;
	  iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));
	
	  var result = baseMap(collection, function(value, key, collection) {
	    var criteria = arrayMap(iteratees, function(iteratee) {
	      return iteratee(value);
	    });
	    return { 'criteria': criteria, 'index': ++index, 'value': value };
	  });
	
	  return baseSortBy(result, function(object, other) {
	    return compareMultiple(object, other, orders);
	  });
	}
	
	module.exports = baseOrderBy;


/***/ }),
/* 303 */
/***/ (function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(297),
	    isArrayLike = __webpack_require__(119);
	
	/**
	 * The base implementation of `_.map` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function baseMap(collection, iteratee) {
	  var index = -1,
	      result = isArrayLike(collection) ? Array(collection.length) : [];
	
	  baseEach(collection, function(value, key, collection) {
	    result[++index] = iteratee(value, key, collection);
	  });
	  return result;
	}
	
	module.exports = baseMap;


/***/ }),
/* 304 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.sortBy` which uses `comparer` to define the
	 * sort order of `array` and replaces criteria objects with their corresponding
	 * values.
	 *
	 * @private
	 * @param {Array} array The array to sort.
	 * @param {Function} comparer The function to define sort order.
	 * @returns {Array} Returns `array`.
	 */
	function baseSortBy(array, comparer) {
	  var length = array.length;
	
	  array.sort(comparer);
	  while (length--) {
	    array[length] = array[length].value;
	  }
	  return array;
	}
	
	module.exports = baseSortBy;


/***/ }),
/* 305 */
/***/ (function(module, exports, __webpack_require__) {

	var compareAscending = __webpack_require__(306);
	
	/**
	 * Used by `_.orderBy` to compare multiple properties of a value to another
	 * and stable sort them.
	 *
	 * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
	 * specify an order of "desc" for descending or "asc" for ascending sort order
	 * of corresponding values.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {boolean[]|string[]} orders The order to sort by for each property.
	 * @returns {number} Returns the sort order indicator for `object`.
	 */
	function compareMultiple(object, other, orders) {
	  var index = -1,
	      objCriteria = object.criteria,
	      othCriteria = other.criteria,
	      length = objCriteria.length,
	      ordersLength = orders.length;
	
	  while (++index < length) {
	    var result = compareAscending(objCriteria[index], othCriteria[index]);
	    if (result) {
	      if (index >= ordersLength) {
	        return result;
	      }
	      var order = orders[index];
	      return result * (order == 'desc' ? -1 : 1);
	    }
	  }
	  // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
	  // that causes it, under certain circumstances, to provide the same value for
	  // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
	  // for more details.
	  //
	  // This also ensures a stable sort in V8 and other engines.
	  // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
	  return object.index - other.index;
	}
	
	module.exports = compareMultiple;


/***/ }),
/* 306 */
/***/ (function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(185);
	
	/**
	 * Compares values to sort them in ascending order.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {number} Returns the sort order indicator for `value`.
	 */
	function compareAscending(value, other) {
	  if (value !== other) {
	    var valIsDefined = value !== undefined,
	        valIsNull = value === null,
	        valIsReflexive = value === value,
	        valIsSymbol = isSymbol(value);
	
	    var othIsDefined = other !== undefined,
	        othIsNull = other === null,
	        othIsReflexive = other === other,
	        othIsSymbol = isSymbol(other);
	
	    if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
	        (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
	        (valIsNull && othIsDefined && othIsReflexive) ||
	        (!valIsDefined && othIsReflexive) ||
	        !valIsReflexive) {
	      return 1;
	    }
	    if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
	        (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
	        (othIsNull && valIsDefined && valIsReflexive) ||
	        (!othIsDefined && valIsReflexive) ||
	        !othIsReflexive) {
	      return -1;
	    }
	  }
	  return 0;
	}
	
	module.exports = compareAscending;


/***/ }),
/* 307 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.createReducer = undefined;
	exports.defaultUpdater = defaultUpdater;
	exports.createSelector = createSelector;
	
	var _reselect = __webpack_require__(308);
	
	var _memoize = __webpack_require__(309);
	
	function defaultUpdater(session, action) {
	    session.sessionBoundModels.forEach(function (modelClass) {
	        if (typeof modelClass.reducer === 'function') {
	            // This calls this.applyUpdate to update this.state
	            modelClass.reducer(action, modelClass, session);
	        }
	    });
	}
	
	var createReducer = exports.createReducer = function createReducer(orm) {
	    var updater = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultUpdater;
	    return function (state, action) {
	        var session = orm.session(state || orm.getEmptyState());
	        updater(session, action);
	        return session.state;
	    };
	};
	
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
	 * // orm is an instance of ORM
	 * const bookSelector = createSelector(orm, session => {
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
	 * @param {ORM} orm - the ORM instance
	 * @param  {...Function} args - zero or more input selectors
	 *                              and the selector function.
	 * @return {Function} memoized selector
	 */
	function createSelector(orm) {
	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	    }
	
	    if (args.length === 1) {
	        return (0, _memoize.memoize)(args[0], _memoize.eqCheck, orm);
	    }
	
	    return (0, _reselect.createSelectorCreator)(_memoize.memoize, _memoize.eqCheck, orm).apply(undefined, args);
	}

/***/ }),
/* 308 */
/***/ (function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports.defaultMemoize = defaultMemoize;
	exports.createSelectorCreator = createSelectorCreator;
	exports.createStructuredSelector = createStructuredSelector;
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function defaultEqualityCheck(a, b) {
	  return a === b;
	}
	
	function defaultMemoize(func) {
	  var equalityCheck = arguments.length <= 1 || arguments[1] === undefined ? defaultEqualityCheck : arguments[1];
	
	  var lastArgs = null;
	  var lastResult = null;
	  return function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    if (lastArgs === null || lastArgs.length !== args.length || !args.every(function (value, index) {
	      return equalityCheck(value, lastArgs[index]);
	    })) {
	      lastResult = func.apply(undefined, args);
	    }
	    lastArgs = args;
	    return lastResult;
	  };
	}
	
	function getDependencies(funcs) {
	  var dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;
	
	  if (!dependencies.every(function (dep) {
	    return typeof dep === 'function';
	  })) {
	    var dependencyTypes = dependencies.map(function (dep) {
	      return typeof dep;
	    }).join(', ');
	    throw new Error('Selector creators expect all input-selectors to be functions, ' + ('instead received the following types: [' + dependencyTypes + ']'));
	  }
	
	  return dependencies;
	}
	
	function createSelectorCreator(memoize) {
	  for (var _len2 = arguments.length, memoizeOptions = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	    memoizeOptions[_key2 - 1] = arguments[_key2];
	  }
	
	  return function () {
	    for (var _len3 = arguments.length, funcs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	      funcs[_key3] = arguments[_key3];
	    }
	
	    var recomputations = 0;
	    var resultFunc = funcs.pop();
	    var dependencies = getDependencies(funcs);
	
	    var memoizedResultFunc = memoize.apply(undefined, [function () {
	      recomputations++;
	      return resultFunc.apply(undefined, arguments);
	    }].concat(memoizeOptions));
	
	    var selector = function selector(state, props) {
	      for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
	        args[_key4 - 2] = arguments[_key4];
	      }
	
	      var params = dependencies.map(function (dependency) {
	        return dependency.apply(undefined, [state, props].concat(args));
	      });
	      return memoizedResultFunc.apply(undefined, _toConsumableArray(params));
	    };
	
	    selector.resultFunc = resultFunc;
	    selector.recomputations = function () {
	      return recomputations;
	    };
	    selector.resetRecomputations = function () {
	      return recomputations = 0;
	    };
	    return selector;
	  };
	}
	
	var createSelector = exports.createSelector = createSelectorCreator(defaultMemoize);
	
	function createStructuredSelector(selectors) {
	  var selectorCreator = arguments.length <= 1 || arguments[1] === undefined ? createSelector : arguments[1];
	
	  if (typeof selectors !== 'object') {
	    throw new Error('createStructuredSelector expects first argument to be an object ' + ('where each property is a selector, instead received a ' + typeof selectors));
	  }
	  var objectKeys = Object.keys(selectors);
	  return selectorCreator(objectKeys.map(function (key) {
	    return selectors[key];
	  }), function () {
	    for (var _len5 = arguments.length, values = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
	      values[_key5] = arguments[_key5];
	    }
	
	    return values.reduce(function (composition, value, index) {
	      composition[objectKeys[index]] = value;
	      return composition;
	    }, {});
	  });
	}

/***/ }),
/* 309 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _toConsumableArray2 = __webpack_require__(225);
	
	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
	
	exports.eqCheck = eqCheck;
	exports.memoize = memoize;
	
	var _values = __webpack_require__(222);
	
	var _values2 = _interopRequireDefault(_values);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function eqCheck(a, b) {
	    return a === b;
	}
	
	function shouldRun(invalidatorMap, state) {
	    return (0, _values2.default)(invalidatorMap).some(function (invalidate) {
	        return invalidate(state);
	    });
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
	 * @param  {ORM} orm - a redux-orm ORM instance
	 * @return {Function} `func` memoized.
	 */
	function memoize(func) {
	    var equalityCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : eqCheck;
	    var orm = arguments[2];
	
	    var lastOrmState = null;
	    var lastResult = null;
	    var lastArgs = null;
	    var modelNameToInvalidatorMap = {};
	
	    return function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }
	
	        var dbState = args[0],
	            otherArgs = args.slice(1);
	
	
	        var dbIsEqual = lastOrmState === dbState || !shouldRun(modelNameToInvalidatorMap, dbState);
	
	        var argsAreEqual = lastArgs && otherArgs.every(function (value, index) {
	            return equalityCheck(value, lastArgs[index]);
	        });
	
	        if (dbIsEqual && argsAreEqual) {
	            return lastResult;
	        }
	
	        var session = orm.session(dbState);
	        var newArgs = [session].concat((0, _toConsumableArray3.default)(otherArgs));
	        var result = func.apply(undefined, (0, _toConsumableArray3.default)(newArgs));
	
	        // If a selector has control flow branching, different
	        // input arguments might result in a different set of
	        // accessed models. On each run, we check if any new
	        // models are accessed and add their invalidator functions.
	        session.accessedModels.forEach(function (modelName) {
	            if (!modelNameToInvalidatorMap.hasOwnProperty(modelName)) {
	                modelNameToInvalidatorMap[modelName] = function (nextState) {
	                    return lastOrmState[modelName] !== nextState[modelName];
	                };
	            }
	        });
	
	        lastResult = result;
	        lastOrmState = dbState;
	        lastArgs = otherArgs;
	
	        return lastResult;
	    };
	}

/***/ })
/******/ ])
});
;
//# sourceMappingURL=redux-orm.js.map