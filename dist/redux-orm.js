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
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.oneToOne = exports.many = exports.fk = exports.OneToOne = exports.ManyToMany = exports.ForeignKey = exports.Session = exports.Schema = exports.Model = exports.Backend = exports.QuerySet = undefined;
	
	var _QuerySet = __webpack_require__(1);
	
	var _QuerySet2 = _interopRequireDefault(_QuerySet);
	
	var _Backend = __webpack_require__(244);
	
	var _Backend2 = _interopRequireDefault(_Backend);
	
	var _Model = __webpack_require__(246);
	
	var _Model2 = _interopRequireDefault(_Model);
	
	var _Schema = __webpack_require__(278);
	
	var _Schema2 = _interopRequireDefault(_Schema);
	
	var _Session = __webpack_require__(262);
	
	var _Session2 = _interopRequireDefault(_Session);
	
	var _fields = __webpack_require__(277);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.QuerySet = _QuerySet2.default;
	exports.Backend = _Backend2.default;
	exports.Model = _Model2.default;
	exports.Schema = _Schema2.default;
	exports.Session = _Session2.default;
	exports.ForeignKey = _fields.ForeignKey;
	exports.ManyToMany = _fields.ManyToMany;
	exports.OneToOne = _fields.OneToOne;
	exports.fk = _fields.fk;
	exports.many = _fields.many;
	exports.oneToOne = _fields.oneToOne;
	exports.default = _Model2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

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
	
	var _reject = __webpack_require__(79);
	
	var _reject2 = _interopRequireDefault(_reject);
	
	var _filter = __webpack_require__(190);
	
	var _filter2 = _interopRequireDefault(_filter);
	
	var _mapValues = __webpack_require__(191);
	
	var _mapValues2 = _interopRequireDefault(_mapValues);
	
	var _orderBy2 = __webpack_require__(192);
	
	var _orderBy3 = _interopRequireDefault(_orderBy2);
	
	var _utils = __webpack_require__(199);
	
	var _constants = __webpack_require__(243);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * A chainable class that keeps track of a list of objects and
	 *
	 * - returns a subset clone of itself with [filter]{@link QuerySet#filter} and [exclude]{@link QuerySet#exclude}
	 * - records updates to objects with [update]{@link QuerySet#update} and [delete]{@link QuerySet#delete}
	 *
	 */
	var QuerySet = function () {
	    /**
	     * Creates a QuerySet.
	     *
	     * @param  {Model} modelClass - the model class of objects in this QuerySet.
	     * @param  {number[]} idArr - an array of the id's this QuerySet includes.
	     * @param {Object} [opts] - additional options
	     */
	
	    function QuerySet(modelClass, idArr, opts) {
	        (0, _classCallCheck3.default)(this, QuerySet);
	
	        (0, _assign2.default)(this, {
	            modelClass: modelClass,
	            idArr: idArr
	        });
	
	        this._opts = opts;
	
	        // A flag that tells if the user wants
	        // the result in plain javascript objects
	        // or {@link Model} instances.
	        // Results are plain objects by default.
	        if (opts && opts.hasOwnProperty('withRefs')) {
	            this._withRefs = opts.withRefs;
	        } else {
	            this._withRefs = false;
	        }
	    }
	
	    (0, _createClass3.default)(QuerySet, [{
	        key: '_new',
	        value: function _new(ids, userOpts) {
	            var opts = (0, _assign2.default)({}, this._opts, userOpts);
	            return new this.constructor(this.modelClass, ids, opts);
	        }
	
	        /**
	         * Returns a new QuerySet representing the same entities
	         * with the `withRefs` flag on.
	         *
	         * @return {QuerySet}
	         */
	
	    }, {
	        key: 'toString',
	        value: function toString() {
	            var _this = this;
	
	            var contents = this.idArr.map(function (id) {
	                return _this.modelClass.withId(id).toString();
	            }).join('\n    - ');
	            return 'QuerySet contents: \n    - ' + contents;
	        }
	
	        /**
	         * Returns an array of the plain objects represented by the QuerySet.
	         * The plain objects are direct references to the store.
	         *
	         * @return {Object[]} references to the plain JS objects represented by
	         *                    the QuerySet
	         */
	
	    }, {
	        key: 'toRefArray',
	        value: function toRefArray() {
	            var _this2 = this;
	
	            return this.idArr.map(function (id) {
	                return _this2.modelClass.accessId(id);
	            });
	        }
	
	        /**
	         * Returns an array of Model instances represented by the QuerySet.
	         * @return {Model[]} model instances represented by the QuerySet
	         */
	
	    }, {
	        key: 'toModelArray',
	        value: function toModelArray() {
	            var _this3 = this;
	
	            return this.idArr.map(function (_, idx) {
	                return _this3.at(idx);
	            });
	        }
	
	        /**
	         * Returns the number of model instances represented by the QuerySet.
	         *
	         * @return {number} length of the QuerySet
	         */
	
	    }, {
	        key: 'count',
	        value: function count() {
	            return this.idArr.length;
	        }
	
	        /**
	         * Checks if the {@link QuerySet} instance has any entities.
	         *
	         * @return {Boolean} `true` if the {@link QuerySet} instance contains entities, else `false`.
	         */
	
	    }, {
	        key: 'exists',
	        value: function exists() {
	            return Boolean(this.count());
	        }
	
	        /**
	         * Returns the {@link Model} instance at index `index` in the {@link QuerySet} instance if
	         * `withRefs` flag is set to `false`, or a reference to the plain JavaScript
	         * object in the model state if `true`.
	         *
	         * @param  {number} index - index of the model instance to get
	         * @return {Model|Object} a {@link Model} instance or a plain JavaScript
	         *                        object at index `index` in the {@link QuerySet} instance
	         */
	
	    }, {
	        key: 'at',
	        value: function at(index) {
	            if (this._withRefs) {
	                return this.modelClass.accessId(this.idArr[index]);
	            }
	            return this.modelClass.withId(this.idArr[index]);
	        }
	
	        /**
	         * Returns the {@link Model} instance at index 0 in the {@link QuerySet} instance.
	         * @return {Model}
	         */
	
	    }, {
	        key: 'first',
	        value: function first() {
	            return this.at(0);
	        }
	
	        /**
	         * Returns the {@link Model} instance at index `QuerySet.count() - 1`
	         * @return {Model}
	         */
	
	    }, {
	        key: 'last',
	        value: function last() {
	            return this.at(this.idArr.length - 1);
	        }
	
	        /**
	         * Returns a new {@link QuerySet} instance with the same entities.
	         * @return {QuerySet} a new QuerySet with the same entities.
	         */
	
	    }, {
	        key: 'all',
	        value: function all() {
	            return this._new(this.idArr);
	        }
	
	        /**
	         * Returns a new {@link QuerySet} instance with entities that match properties in `lookupObj`.
	         *
	         * @param  {Object} lookupObj - the properties to match objects with.
	         * @return {QuerySet} a new {@link QuerySet} instance with objects that passed the filter.
	         */
	
	    }, {
	        key: 'filter',
	        value: function filter(lookupObj) {
	            return this._filterOrExclude(lookupObj, false);
	        }
	
	        /**
	         * Returns a new {@link QuerySet} instance with entities that do not match properties in `lookupObj`.
	         *
	         * @param  {Object} lookupObj - the properties to unmatch objects with.
	         * @return {QuerySet} a new {@link QuerySet} instance with objects that passed the filter.
	         */
	
	    }, {
	        key: 'exclude',
	        value: function exclude(lookupObj) {
	            return this._filterOrExclude(lookupObj, true);
	        }
	    }, {
	        key: '_filterOrExclude',
	        value: function _filterOrExclude(_lookupObj, exclude) {
	            var _this4 = this;
	
	            var func = exclude ? _reject2.default : _filter2.default;
	            var lookupObj = _lookupObj;
	            var operationWithRefs = true;
	            var entities = void 0;
	            if (typeof lookupObj === 'function') {
	                // For filtering with function,
	                // use whatever object type
	                // is flagged.
	                if (this._withRefs) {
	                    entities = this.toRefArray();
	                } else {
	                    entities = this.toModelArray();
	                    operationWithRefs = false;
	                }
	            } else {
	                if ((typeof lookupObj === 'undefined' ? 'undefined' : (0, _typeof3.default)(lookupObj)) === 'object') {
	                    lookupObj = (0, _mapValues2.default)(lookupObj, _utils.normalizeEntity);
	                }
	
	                // Lodash filtering doesn't work with
	                // Model instances.
	                entities = this.toRefArray();
	            }
	            var filteredEntities = func(entities, lookupObj);
	            var getIdFunc = operationWithRefs ? function (obj) {
	                return obj[_this4.modelClass.idAttribute];
	            } : function (obj) {
	                return obj.getId();
	            };
	
	            var newIdArr = filteredEntities.map(getIdFunc);
	
	            return this._new(newIdArr, { withRefs: false });
	        }
	
	        /**
	         * Calls `func` for each object in the {@link QuerySet} instance.
	         * The object is either a reference to the plain
	         * object in the database or a {@link Model} instance, depending
	         * on the flag.
	         *
	         * @param  {Function} func - the function to call with each object
	         * @return {undefined}
	         */
	
	    }, {
	        key: 'forEach',
	        value: function forEach(func) {
	            var arr = this._withRefs ? this.toRefArray() : this.toModelArray();
	
	            arr.forEach(func);
	        }
	
	        /**
	         * Maps the {@link Model} instances in the {@link QuerySet} instance.
	         * @param  {Function} func - the mapping function that takes one argument, a
	         *                           {@link Model} instance or a reference to the plain
	         *                           JavaScript object in the store, depending on the
	         *                           QuerySet's `withRefs` flag.
	         * @return {Array}  the mapped array
	         */
	
	    }, {
	        key: 'map',
	        value: function map(func) {
	            var _this5 = this;
	
	            return this.idArr.map(function (_, idx) {
	                return func(_this5.at(idx));
	            });
	        }
	
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
	
	    }, {
	        key: 'orderBy',
	        value: function orderBy(iteratees, orders) {
	            var _this6 = this;
	
	            var entities = this.toRefArray();
	            var iterateeArgs = iteratees;
	
	            // Lodash only works on plain javascript objects.
	            // If the argument is a function, and the `withRefs`
	            // flag is false, the argument function is wrapped
	            // to get the model instance and pass that as the argument
	            // to the user-supplied function.
	            if (!this._withRefs) {
	                iterateeArgs = iteratees.map(function (arg) {
	                    if (typeof arg === 'function') {
	                        return function (entity) {
	                            var id = entity[_this6.modelClass.idAttribute];
	                            var instance = _this6.modelClass.withId(id);
	                            return arg(instance);
	                        };
	                    }
	                    return arg;
	                });
	            }
	            var sortedEntities = _orderBy3.default.call(null, entities, iterateeArgs, orders);
	            return this._new(sortedEntities.map(function (entity) {
	                return entity[_this6.modelClass.idAttribute];
	            }), { withRefs: false });
	        }
	
	        /**
	         * Records an update specified with `mergeObj` to all the objects
	         * in the {@link QuerySet} instance.
	         *
	         * @param  {Object} mergeObj - an object to merge with all the objects in this
	         *                             queryset.
	         * @return {undefined}
	         */
	
	    }, {
	        key: 'update',
	        value: function update(mergeObj) {
	            this.modelClass.addUpdate({
	                type: _constants.UPDATE,
	                payload: {
	                    idArr: this.idArr,
	                    mergeObj: mergeObj
	                }
	            });
	        }
	
	        /**
	         * Records a deletion of all the objects in this {@link QuerySet} instance.
	         * @return {undefined}
	         */
	
	    }, {
	        key: 'delete',
	        value: function _delete() {
	            this.modelClass.addUpdate({
	                type: _constants.DELETE,
	                payload: this.idArr
	            });
	
	            this.withModels.forEach(function (model) {
	                return model._onDelete();
	            });
	        }
	    }, {
	        key: 'withRefs',
	        get: function get() {
	            if (!this._withRefs) {
	                return this._new(this.idArr, { withRefs: true });
	            }
	            return this;
	        }
	
	        /**
	         * Alias for withRefs
	         * @return {QuerySet}
	         */
	
	    }, {
	        key: 'ref',
	        get: function get() {
	            return this.withRefs;
	        }
	
	        /**
	         * Returns a new QuerySet representing the same entities
	         * with the `withRefs` flag off.
	         *
	         * @return {QuerySet}
	         */
	
	    }, {
	        key: 'withModels',
	        get: function get() {
	            if (this._withRefs) {
	                return this._new(this.idArr, { withRefs: false });
	            }
	            return this;
	        }
	    }], [{
	        key: 'addSharedMethod',
	        value: function addSharedMethod(methodName) {
	            this.sharedMethods = this.sharedMethods.concat(methodName);
	        }
	    }]);
	    return QuerySet;
	}();
	
	QuerySet.sharedMethods = ['count', 'at', 'all', 'last', 'first', 'forEach', 'exists', 'filter', 'map', 'exclude', 'orderBy', 'update', 'delete', 'ref', 'withRefs', 'withModels'];
	
	exports.default = QuerySet;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _iterator = __webpack_require__(3);
	
	var _iterator2 = _interopRequireDefault(_iterator);
	
	var _symbol = __webpack_require__(54);
	
	var _symbol2 = _interopRequireDefault(_symbol);
	
	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(4), __esModule: true };

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	__webpack_require__(49);
	module.exports = __webpack_require__(53).f('iterator');

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 7 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 12 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 13 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(17)
	  , createDesc = __webpack_require__(25);
	module.exports = __webpack_require__(21) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(19);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(21) && !__webpack_require__(22)(function(){
	  return Object.defineProperty(__webpack_require__(23)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(22)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(19)
	  , document = __webpack_require__(12).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(16);

/***/ },
/* 27 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

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
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(44).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write('<script>document.F=Object</script' + gt);
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

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(33)
	  , enumBugKeys = __webpack_require__(43);
	
	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(35)
	  , defined = __webpack_require__(8);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(36);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(7)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(7)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(41)('keys')
	  , uid    = __webpack_require__(42);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(12)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(12).document && document.documentElement;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(17).f
	  , has = __webpack_require__(27)
	  , TAG = __webpack_require__(46)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(41)('wks')
	  , uid        = __webpack_require__(42)
	  , Symbol     = __webpack_require__(12).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(8);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(46);

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(55), __esModule: true };

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(56);
	__webpack_require__(67);
	__webpack_require__(68);
	__webpack_require__(69);
	module.exports = __webpack_require__(13).Symbol;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(12)
	  , core           = __webpack_require__(13)
	  , LIBRARY        = __webpack_require__(10)
	  , wksExt         = __webpack_require__(53)
	  , defineProperty = __webpack_require__(17).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 61 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 62 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(36);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(33)
	  , hiddenKeys = __webpack_require__(43).concat('length', 'prototype');
	
	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 67 */
/***/ function(module, exports) {



/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(58)('asyncIterator');

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(58)('observable');

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(71), __esModule: true };

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(72);
	module.exports = __webpack_require__(13).Object.assign;

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(11);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(73)});

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 74 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	
	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(77), __esModule: true };

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(78);
	var $Object = __webpack_require__(13).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(11);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(21), 'Object', {defineProperty: __webpack_require__(17).f});

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(80),
	    baseFilter = __webpack_require__(81),
	    baseIteratee = __webpack_require__(106),
	    isArray = __webpack_require__(101);
	
	/**
	 * The opposite of `_.filter`; this method returns the elements of `collection`
	 * that `predicate` does **not** return truthy for.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Array|Function|Object|string} [predicate=_.identity]
	 *  The function invoked per iteration.
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
	  predicate = baseIteratee(predicate, 3);
	  return func(collection, function(value, index, collection) {
	    return !predicate(value, index, collection);
	  });
	}
	
	module.exports = reject;


/***/ },
/* 80 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array.length,
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


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(82);
	
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


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(83),
	    createBaseEach = __webpack_require__(105);
	
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


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(84),
	    keys = __webpack_require__(86);
	
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


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(85);
	
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


/***/ },
/* 85 */
/***/ function(module, exports) {

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


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var baseHas = __webpack_require__(87),
	    baseKeys = __webpack_require__(89),
	    indexKeys = __webpack_require__(90),
	    isArrayLike = __webpack_require__(94),
	    isIndex = __webpack_require__(103),
	    isPrototype = __webpack_require__(104);
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
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
	  var isProto = isPrototype(object);
	  if (!(isProto || isArrayLike(object))) {
	    return baseKeys(object);
	  }
	  var indexes = indexKeys(object),
	      skipIndexes = !!indexes,
	      result = indexes || [],
	      length = result.length;
	
	  for (var key in object) {
	    if (baseHas(object, key) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
	        !(isProto && key == 'constructor')) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = keys;


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var getPrototype = __webpack_require__(88);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * The base implementation of `_.has` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHas(object, key) {
	  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
	  // that are composed entirely of index properties, return `false` for
	  // `hasOwnProperty` checks of them.
	  return hasOwnProperty.call(object, key) ||
	    (typeof object == 'object' && key in object && getPrototype(object) === null);
	}
	
	module.exports = baseHas;


/***/ },
/* 88 */
/***/ function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetPrototype = Object.getPrototypeOf;
	
	/**
	 * Gets the `[[Prototype]]` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {null|Object} Returns the `[[Prototype]]`.
	 */
	function getPrototype(value) {
	  return nativeGetPrototype(Object(value));
	}
	
	module.exports = getPrototype;


/***/ },
/* 89 */
/***/ function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = Object.keys;
	
	/**
	 * The base implementation of `_.keys` which doesn't skip the constructor
	 * property of prototypes or treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  return nativeKeys(Object(object));
	}
	
	module.exports = baseKeys;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var baseTimes = __webpack_require__(91),
	    isArguments = __webpack_require__(92),
	    isArray = __webpack_require__(101),
	    isLength = __webpack_require__(99),
	    isString = __webpack_require__(102);
	
	/**
	 * Creates an array of index keys for `object` values of arrays,
	 * `arguments` objects, and strings, otherwise `null` is returned.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array|null} Returns index keys, else `null`.
	 */
	function indexKeys(object) {
	  var length = object ? object.length : undefined;
	  if (isLength(length) &&
	      (isArray(object) || isString(object) || isArguments(object))) {
	    return baseTimes(length, String);
	  }
	  return null;
	}
	
	module.exports = indexKeys;


/***/ },
/* 91 */
/***/ function(module, exports) {

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


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLikeObject = __webpack_require__(93);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
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
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}
	
	module.exports = isArguments;


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(94),
	    isObjectLike = __webpack_require__(100);
	
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


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(95),
	    isFunction = __webpack_require__(97),
	    isLength = __webpack_require__(99);
	
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
	  return value != null && isLength(getLength(value)) && !isFunction(value);
	}
	
	module.exports = isArrayLike;


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(96);
	
	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a
	 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
	 * Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');
	
	module.exports = getLength;


/***/ },
/* 96 */
/***/ function(module, exports) {

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


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(98);
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array and weak map constructors,
	  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}
	
	module.exports = isFunction;


/***/ },
/* 98 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
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
	  return !!value && (type == 'object' || type == 'function');
	}
	
	module.exports = isObject;


/***/ },
/* 99 */
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length,
	 *  else `false`.
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


/***/ },
/* 100 */
/***/ function(module, exports) {

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
	  return !!value && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ },
/* 101 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @type {Function}
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
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


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(101),
	    isObjectLike = __webpack_require__(100);
	
	/** `Object#toString` result references. */
	var stringTag = '[object String]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
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
	    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
	}
	
	module.exports = isString;


/***/ },
/* 103 */
/***/ function(module, exports) {

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


/***/ },
/* 104 */
/***/ function(module, exports) {

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


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(94);
	
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


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(107),
	    baseMatchesProperty = __webpack_require__(173),
	    identity = __webpack_require__(187),
	    isArray = __webpack_require__(101),
	    property = __webpack_require__(188);
	
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


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(108),
	    getMatchData = __webpack_require__(165),
	    matchesStrictComparable = __webpack_require__(172);
	
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


/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(109),
	    baseIsEqual = __webpack_require__(146);
	
	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;
	
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
	            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	
	module.exports = baseIsMatch;


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(110),
	    stackClear = __webpack_require__(118),
	    stackDelete = __webpack_require__(119),
	    stackGet = __webpack_require__(120),
	    stackHas = __webpack_require__(121),
	    stackSet = __webpack_require__(122);
	
	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  this.__data__ = new ListCache(entries);
	}
	
	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;
	
	module.exports = Stack;


/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	var listCacheClear = __webpack_require__(111),
	    listCacheDelete = __webpack_require__(112),
	    listCacheGet = __webpack_require__(115),
	    listCacheHas = __webpack_require__(116),
	    listCacheSet = __webpack_require__(117);
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
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


/***/ },
/* 111 */
/***/ function(module, exports) {

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}
	
	module.exports = listCacheClear;


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(113);
	
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
	  return true;
	}
	
	module.exports = listCacheDelete;


/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(114);
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to search.
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


/***/ },
/* 114 */
/***/ function(module, exports) {

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
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
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
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


/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(113);
	
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


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(113);
	
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


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(113);
	
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
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	module.exports = listCacheSet;


/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(110);
	
	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	}
	
	module.exports = stackClear;


/***/ },
/* 119 */
/***/ function(module, exports) {

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
	  return this.__data__['delete'](key);
	}
	
	module.exports = stackDelete;


/***/ },
/* 120 */
/***/ function(module, exports) {

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


/***/ },
/* 121 */
/***/ function(module, exports) {

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


/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(110),
	    MapCache = __webpack_require__(123);
	
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
	  var cache = this.__data__;
	  if (cache instanceof ListCache && cache.__data__.length == LARGE_ARRAY_SIZE) {
	    cache = this.__data__ = new MapCache(cache.__data__);
	  }
	  cache.set(key, value);
	  return this;
	}
	
	module.exports = stackSet;


/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	var mapCacheClear = __webpack_require__(124),
	    mapCacheDelete = __webpack_require__(140),
	    mapCacheGet = __webpack_require__(143),
	    mapCacheHas = __webpack_require__(144),
	    mapCacheSet = __webpack_require__(145);
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
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


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	var Hash = __webpack_require__(125),
	    ListCache = __webpack_require__(110),
	    Map = __webpack_require__(136);
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}
	
	module.exports = mapCacheClear;


/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	var hashClear = __webpack_require__(126),
	    hashDelete = __webpack_require__(132),
	    hashGet = __webpack_require__(133),
	    hashHas = __webpack_require__(134),
	    hashSet = __webpack_require__(135);
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
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


/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(127);
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}
	
	module.exports = hashClear;


/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(128);
	
	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');
	
	module.exports = nativeCreate;


/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(129);
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object[key];
	  return isNative(value) ? value : undefined;
	}
	
	module.exports = getNative;


/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(97),
	    isHostObject = __webpack_require__(130),
	    isObject = __webpack_require__(98),
	    toSource = __webpack_require__(131);
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (!isObject(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	module.exports = isNative;


/***/ },
/* 130 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}
	
	module.exports = isHostObject;


/***/ },
/* 131 */
/***/ function(module, exports) {

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
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


/***/ },
/* 132 */
/***/ function(module, exports) {

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
	  return this.has(key) && delete this.__data__[key];
	}
	
	module.exports = hashDelete;


/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(127);
	
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


/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(127);
	
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
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}
	
	module.exports = hashHas;


/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(127);
	
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
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}
	
	module.exports = hashSet;


/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(128),
	    root = __webpack_require__(137);
	
	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');
	
	module.exports = Map;


/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, global) {var checkGlobal = __webpack_require__(139);
	
	/** Used to determine if values are of the language type `Object`. */
	var objectTypes = {
	  'function': true,
	  'object': true
	};
	
	/** Detect free variable `exports`. */
	var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
	  ? exports
	  : undefined;
	
	/** Detect free variable `module`. */
	var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
	  ? module
	  : undefined;
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);
	
	/** Detect free variable `self`. */
	var freeSelf = checkGlobal(objectTypes[typeof self] && self);
	
	/** Detect free variable `window`. */
	var freeWindow = checkGlobal(objectTypes[typeof window] && window);
	
	/** Detect `this` as the global object. */
	var thisGlobal = checkGlobal(objectTypes[typeof this] && this);
	
	/**
	 * Used as a reference to the global object.
	 *
	 * The `this` value is used if it's the global object to avoid Greasemonkey's
	 * restricted `window` object, otherwise the `window` object is used.
	 */
	var root = freeGlobal ||
	  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
	    freeSelf || thisGlobal || Function('return this')();
	
	module.exports = root;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(138)(module), (function() { return this; }())))

/***/ },
/* 138 */
/***/ function(module, exports) {

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


/***/ },
/* 139 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a global object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
	 */
	function checkGlobal(value) {
	  return (value && value.Object === Object) ? value : null;
	}
	
	module.exports = checkGlobal;


/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(141);
	
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
	  return getMapData(this, key)['delete'](key);
	}
	
	module.exports = mapCacheDelete;


/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	var isKeyable = __webpack_require__(142);
	
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


/***/ },
/* 142 */
/***/ function(module, exports) {

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


/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(141);
	
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


/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(141);
	
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


/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(141);
	
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
	  getMapData(this, key).set(key, value);
	  return this;
	}
	
	module.exports = mapCacheSet;


/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(147),
	    isObject = __webpack_require__(98),
	    isObjectLike = __webpack_require__(100);
	
	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {boolean} [bitmask] The bitmask of comparison flags.
	 *  The bitmask may be composed of the following flags:
	 *     1 - Unordered comparison
	 *     2 - Partial comparison
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, bitmask, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
	}
	
	module.exports = baseIsEqual;


/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(109),
	    equalArrays = __webpack_require__(148),
	    equalByTag = __webpack_require__(153),
	    equalObjects = __webpack_require__(158),
	    getTag = __webpack_require__(159),
	    isArray = __webpack_require__(101),
	    isHostObject = __webpack_require__(130),
	    isTypedArray = __webpack_require__(164);
	
	/** Used to compose bitmasks for comparison styles. */
	var PARTIAL_COMPARE_FLAG = 2;
	
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
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;
	
	  if (!objIsArr) {
	    objTag = getTag(object);
	    objTag = objTag == argsTag ? objectTag : objTag;
	  }
	  if (!othIsArr) {
	    othTag = getTag(other);
	    othTag = othTag == argsTag ? objectTag : othTag;
	  }
	  var objIsObj = objTag == objectTag && !isHostObject(object),
	      othIsObj = othTag == objectTag && !isHostObject(other),
	      isSameTag = objTag == othTag;
	
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
	      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
	  }
	  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;
	
	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
	}
	
	module.exports = baseIsEqualDeep;


/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(149),
	    arraySome = __webpack_require__(152);
	
	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      arrLength = array.length,
	      othLength = other.length;
	
	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;
	
	  stack.set(array, other);
	
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
	            if (!seen.has(othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
	              return seen.add(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, customizer, bitmask, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  return result;
	}
	
	module.exports = equalArrays;


/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(123),
	    setCacheAdd = __webpack_require__(150),
	    setCacheHas = __webpack_require__(151);
	
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
	      length = values ? values.length : 0;
	
	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}
	
	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	
	module.exports = SetCache;


/***/ },
/* 150 */
/***/ function(module, exports) {

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


/***/ },
/* 151 */
/***/ function(module, exports) {

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


/***/ },
/* 152 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array.length;
	
	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	module.exports = arraySome;


/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(154),
	    Uint8Array = __webpack_require__(155),
	    equalArrays = __webpack_require__(148),
	    mapToArray = __webpack_require__(156),
	    setToArray = __webpack_require__(157);
	
	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;
	
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
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
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
	      // Coerce dates and booleans to numbers, dates to milliseconds and
	      // booleans to `1` or `0` treating invalid dates coerced to `NaN` as
	      // not equal.
	      return +object == +other;
	
	    case errorTag:
	      return object.name == other.name && object.message == other.message;
	
	    case numberTag:
	      // Treat `NaN` vs. `NaN` as equal.
	      return (object != +object) ? other != +other : object == +other;
	
	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');
	
	    case mapTag:
	      var convert = mapToArray;
	
	    case setTag:
	      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
	      convert || (convert = setToArray);
	
	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= UNORDERED_COMPARE_FLAG;
	      stack.set(object, other);
	
	      // Recursively compare objects (susceptible to call stack limits).
	      return equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
	
	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}
	
	module.exports = equalByTag;


/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(137);
	
	/** Built-in value references. */
	var Symbol = root.Symbol;
	
	module.exports = Symbol;


/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(137);
	
	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;
	
	module.exports = Uint8Array;


/***/ },
/* 156 */
/***/ function(module, exports) {

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


/***/ },
/* 157 */
/***/ function(module, exports) {

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


/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	var baseHas = __webpack_require__(87),
	    keys = __webpack_require__(86);
	
	/** Used to compose bitmasks for comparison styles. */
	var PARTIAL_COMPARE_FLAG = 2;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;
	
	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : baseHas(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	
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
	          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
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
	  return result;
	}
	
	module.exports = equalObjects;


/***/ },
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	var DataView = __webpack_require__(160),
	    Map = __webpack_require__(136),
	    Promise = __webpack_require__(161),
	    Set = __webpack_require__(162),
	    WeakMap = __webpack_require__(163),
	    toSource = __webpack_require__(131);
	
	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';
	
	var dataViewTag = '[object DataView]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
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
	function getTag(value) {
	  return objectToString.call(value);
	}
	
	// Fallback for data views, maps, sets, and weak maps in IE 11,
	// for data views in Edge, and promises in Node.js.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : undefined;
	
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


/***/ },
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(128),
	    root = __webpack_require__(137);
	
	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');
	
	module.exports = DataView;


/***/ },
/* 161 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(128),
	    root = __webpack_require__(137);
	
	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');
	
	module.exports = Promise;


/***/ },
/* 162 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(128),
	    root = __webpack_require__(137);
	
	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');
	
	module.exports = Set;


/***/ },
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(128),
	    root = __webpack_require__(137);
	
	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');
	
	module.exports = WeakMap;


/***/ },
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(99),
	    isObjectLike = __webpack_require__(100);
	
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
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
	}
	
	module.exports = isTypedArray;


/***/ },
/* 165 */
/***/ function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(166),
	    toPairs = __webpack_require__(167);
	
	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = toPairs(object),
	      length = result.length;
	
	  while (length--) {
	    result[length][2] = isStrictComparable(result[length][1]);
	  }
	  return result;
	}
	
	module.exports = getMatchData;


/***/ },
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(98);
	
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


/***/ },
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	var createToPairs = __webpack_require__(168),
	    keys = __webpack_require__(86);
	
	/**
	 * Creates an array of own enumerable string keyed-value pairs for `object`
	 * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
	 * entries are returned.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @alias entries
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the key-value pairs.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.toPairs(new Foo);
	 * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
	 */
	var toPairs = createToPairs(keys);
	
	module.exports = toPairs;


/***/ },
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	var baseToPairs = __webpack_require__(169),
	    getTag = __webpack_require__(159),
	    mapToArray = __webpack_require__(156),
	    setToPairs = __webpack_require__(171);
	
	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    setTag = '[object Set]';
	
	/**
	 * Creates a `_.toPairs` or `_.toPairsIn` function.
	 *
	 * @private
	 * @param {Function} keysFunc The function to get the keys of a given object.
	 * @returns {Function} Returns the new pairs function.
	 */
	function createToPairs(keysFunc) {
	  return function(object) {
	    var tag = getTag(object);
	    if (tag == mapTag) {
	      return mapToArray(object);
	    }
	    if (tag == setTag) {
	      return setToPairs(object);
	    }
	    return baseToPairs(object, keysFunc(object));
	  };
	}
	
	module.exports = createToPairs;


/***/ },
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(170);
	
	/**
	 * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
	 * of key-value pairs for `object` corresponding to the property names of `props`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} props The property names to get values for.
	 * @returns {Object} Returns the key-value pairs.
	 */
	function baseToPairs(object, props) {
	  return arrayMap(props, function(key) {
	    return [key, object[key]];
	  });
	}
	
	module.exports = baseToPairs;


/***/ },
/* 170 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array.length,
	      result = Array(length);
	
	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}
	
	module.exports = arrayMap;


/***/ },
/* 171 */
/***/ function(module, exports) {

	/**
	 * Converts `set` to its value-value pairs.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the value-value pairs.
	 */
	function setToPairs(set) {
	  var index = -1,
	      result = Array(set.size);
	
	  set.forEach(function(value) {
	    result[++index] = [value, value];
	  });
	  return result;
	}
	
	module.exports = setToPairs;


/***/ },
/* 172 */
/***/ function(module, exports) {

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


/***/ },
/* 173 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(146),
	    get = __webpack_require__(174),
	    hasIn = __webpack_require__(184),
	    isKey = __webpack_require__(182),
	    isStrictComparable = __webpack_require__(166),
	    matchesStrictComparable = __webpack_require__(172),
	    toKey = __webpack_require__(183);
	
	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;
	
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
	      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
	  };
	}
	
	module.exports = baseMatchesProperty;


/***/ },
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(175);
	
	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is used in its place.
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


/***/ },
/* 175 */
/***/ function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(176),
	    isKey = __webpack_require__(182),
	    toKey = __webpack_require__(183);
	
	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = isKey(path, object) ? [path] : castPath(path);
	
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}
	
	module.exports = baseGet;


/***/ },
/* 176 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(101),
	    stringToPath = __webpack_require__(177);
	
	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value) {
	  return isArray(value) ? value : stringToPath(value);
	}
	
	module.exports = castPath;


/***/ },
/* 177 */
/***/ function(module, exports, __webpack_require__) {

	var memoize = __webpack_require__(178),
	    toString = __webpack_require__(179);
	
	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoize(function(string) {
	  var result = [];
	  toString(string).replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});
	
	module.exports = stringToPath;


/***/ },
/* 178 */
/***/ function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(123);
	
	/** Used as the `TypeError` message for "Functions" methods. */
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
	 * [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `delete`, `get`, `has`, and `set`.
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
	  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
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
	    memoized.cache = cache.set(key, result);
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}
	
	// Assign cache to `_.memoize`.
	memoize.Cache = MapCache;
	
	module.exports = memoize;


/***/ },
/* 179 */
/***/ function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(180);
	
	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
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


/***/ },
/* 180 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(154),
	    isSymbol = __webpack_require__(181);
	
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
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	module.exports = baseToString;


/***/ },
/* 181 */
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(100);
	
	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
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
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}
	
	module.exports = isSymbol;


/***/ },
/* 182 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(101),
	    isSymbol = __webpack_require__(181);
	
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


/***/ },
/* 183 */
/***/ function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(181);
	
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


/***/ },
/* 184 */
/***/ function(module, exports, __webpack_require__) {

	var baseHasIn = __webpack_require__(185),
	    hasPath = __webpack_require__(186);
	
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


/***/ },
/* 185 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return key in Object(object);
	}
	
	module.exports = baseHasIn;


/***/ },
/* 186 */
/***/ function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(176),
	    isArguments = __webpack_require__(92),
	    isArray = __webpack_require__(101),
	    isIndex = __webpack_require__(103),
	    isKey = __webpack_require__(182),
	    isLength = __webpack_require__(99),
	    isString = __webpack_require__(102),
	    toKey = __webpack_require__(183);
	
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
	  path = isKey(path, object) ? [path] : castPath(path);
	
	  var result,
	      index = -1,
	      length = path.length;
	
	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result) {
	    return result;
	  }
	  var length = object ? object.length : 0;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isString(object) || isArguments(object));
	}
	
	module.exports = hasPath;


/***/ },
/* 187 */
/***/ function(module, exports) {

	/**
	 * This method returns the first argument given to it.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	module.exports = identity;


/***/ },
/* 188 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(96),
	    basePropertyDeep = __webpack_require__(189),
	    isKey = __webpack_require__(182),
	    toKey = __webpack_require__(183);
	
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


/***/ },
/* 189 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(175);
	
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


/***/ },
/* 190 */
/***/ function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(80),
	    baseFilter = __webpack_require__(81),
	    baseIteratee = __webpack_require__(106),
	    isArray = __webpack_require__(101);
	
	/**
	 * Iterates over elements of `collection`, returning an array of all elements
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Array|Function|Object|string} [predicate=_.identity]
	 *  The function invoked per iteration.
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


/***/ },
/* 191 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(83),
	    baseIteratee = __webpack_require__(106);
	
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
	 * @param {Array|Function|Object|string} [iteratee=_.identity]
	 *  The function invoked per iteration.
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
	    result[key] = iteratee(value, key, object);
	  });
	  return result;
	}
	
	module.exports = mapValues;


/***/ },
/* 192 */
/***/ function(module, exports, __webpack_require__) {

	var baseOrderBy = __webpack_require__(193),
	    isArray = __webpack_require__(101);
	
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


/***/ },
/* 193 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(170),
	    baseIteratee = __webpack_require__(106),
	    baseMap = __webpack_require__(194),
	    baseSortBy = __webpack_require__(195),
	    baseUnary = __webpack_require__(196),
	    compareMultiple = __webpack_require__(197),
	    identity = __webpack_require__(187);
	
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


/***/ },
/* 194 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(82),
	    isArrayLike = __webpack_require__(94);
	
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


/***/ },
/* 195 */
/***/ function(module, exports) {

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


/***/ },
/* 196 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.unary` without support for storing wrapper metadata.
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


/***/ },
/* 197 */
/***/ function(module, exports, __webpack_require__) {

	var compareAscending = __webpack_require__(198);
	
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


/***/ },
/* 198 */
/***/ function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(181);
	
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


/***/ },
/* 199 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.arrayDiffActions = exports.includes = exports.ops = exports.objectShallowEquals = exports.reverseFieldErrorMessage = exports.normalizeEntity = exports.ListIterator = exports.reverseFieldName = exports.m2mToFieldName = exports.m2mFromFieldName = exports.m2mName = exports.attachQuerySetMethods = exports.match = undefined;
	
	var _defineProperty = __webpack_require__(76);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	var _getOwnPropertyDescriptor = __webpack_require__(200);
	
	var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);
	
	var _getPrototypeOf = __webpack_require__(204);
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _keys = __webpack_require__(207);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(75);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _forOwn = __webpack_require__(210);
	
	var _forOwn2 = _interopRequireDefault(_forOwn);
	
	var _includes = __webpack_require__(211);
	
	var _includes2 = _interopRequireDefault(_includes);
	
	var _immutableOps = __webpack_require__(219);
	
	var _immutableOps2 = _interopRequireDefault(_immutableOps);
	
	var _intersection = __webpack_require__(230);
	
	var _intersection2 = _interopRequireDefault(_intersection);
	
	var _difference = __webpack_require__(238);
	
	var _difference2 = _interopRequireDefault(_difference);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * @module utils
	 */
	
	/**
	 * A simple ListIterator implementation.
	 */
	
	var ListIterator = function () {
	    /**
	     * Creates a new ListIterator instance.
	     * @param  {Array} list - list to iterate over
	     * @param  {Number} [idx=0] - starting index. Defaults to `0`
	     * @param  {Function} [getValue] a function that receives the current `idx`
	     *                               and `list` and should return the value that
	     *                               `next` should return. Defaults to `(idx, list) => list[idx]`
	     */
	
	    function ListIterator(list, idx, getValue) {
	        (0, _classCallCheck3.default)(this, ListIterator);
	
	        this.list = list;
	        this.idx = idx || 0;
	
	        if (typeof getValue === 'function') {
	            this.getValue = getValue;
	        }
	    }
	
	    /**
	     * The default implementation for the `getValue` function.
	     *
	     * @param  {Number} idx - the current iterator index
	     * @param  {Array} list - the list being iterated
	     * @return {*} - the value at index `idx` in `list`.
	     */
	
	
	    (0, _createClass3.default)(ListIterator, [{
	        key: 'getValue',
	        value: function getValue(idx, list) {
	            return list[idx];
	        }
	
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
	
	    }, {
	        key: 'next',
	        value: function next() {
	            if (this.idx < this.list.length - 1) {
	                return {
	                    value: this.getValue(this.list, this.idx++),
	                    done: false
	                };
	            } else if (this.idx < this.list.length) {
	                return {
	                    value: this.getValue(this.list, this.idx++),
	                    done: true
	                };
	            }
	
	            return undefined;
	        }
	    }]);
	    return ListIterator;
	}();
	
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
	
	
	function match(lookupObj, entity) {
	    var keys = (0, _keys2.default)(lookupObj);
	    return keys.every(function (key) {
	        return lookupObj[key] === entity[key];
	    });
	}
	
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
	    return modelName.toLowerCase() + 'Set';
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
	    var keysInB = 0;
	
	    (0, _forOwn2.default)(a, function (value, key) {
	        if (!b.hasOwnProperty(key) || b[key] !== value) {
	            return false;
	        }
	        keysInA++;
	    });
	
	    for (var key in b) {
	        if (b.hasOwnProperty(key)) keysInB++;
	    }
	
	    return keysInA === keysInB;
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
	
	// A global instance of immutable-ops for general use
	var ops = (0, _immutableOps2.default)();
	
	exports.match = match;
	exports.attachQuerySetMethods = attachQuerySetMethods;
	exports.m2mName = m2mName;
	exports.m2mFromFieldName = m2mFromFieldName;
	exports.m2mToFieldName = m2mToFieldName;
	exports.reverseFieldName = reverseFieldName;
	exports.ListIterator = ListIterator;
	exports.normalizeEntity = normalizeEntity;
	exports.reverseFieldErrorMessage = reverseFieldErrorMessage;
	exports.objectShallowEquals = objectShallowEquals;
	exports.ops = ops;
	exports.includes = _includes2.default;
	exports.arrayDiffActions = arrayDiffActions;

/***/ },
/* 200 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(201), __esModule: true };

/***/ },
/* 201 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(202);
	var $Object = __webpack_require__(13).Object;
	module.exports = function getOwnPropertyDescriptor(it, key){
	  return $Object.getOwnPropertyDescriptor(it, key);
	};

/***/ },
/* 202 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject                 = __webpack_require__(34)
	  , $getOwnPropertyDescriptor = __webpack_require__(66).f;
	
	__webpack_require__(203)('getOwnPropertyDescriptor', function(){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ },
/* 203 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 204 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(205), __esModule: true };

/***/ },
/* 205 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(206);
	module.exports = __webpack_require__(13).Object.getPrototypeOf;

/***/ },
/* 206 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 Object.getPrototypeOf(O)
	var toObject        = __webpack_require__(48)
	  , $getPrototypeOf = __webpack_require__(47);
	
	__webpack_require__(203)('getPrototypeOf', function(){
	  return function getPrototypeOf(it){
	    return $getPrototypeOf(toObject(it));
	  };
	});

/***/ },
/* 207 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(208), __esModule: true };

/***/ },
/* 208 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(209);
	module.exports = __webpack_require__(13).Object.keys;

/***/ },
/* 209 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(48)
	  , $keys    = __webpack_require__(32);
	
	__webpack_require__(203)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 210 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(83),
	    baseIteratee = __webpack_require__(106);
	
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
	  return object && baseForOwn(object, baseIteratee(iteratee, 3));
	}
	
	module.exports = forOwn;


/***/ },
/* 211 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(212),
	    isArrayLike = __webpack_require__(94),
	    isString = __webpack_require__(102),
	    toInteger = __webpack_require__(214),
	    values = __webpack_require__(217);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Checks if `value` is in `collection`. If `collection` is a string, it's
	 * checked for a substring of `value`, otherwise
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * is used for equality comparisons. If `fromIndex` is negative, it's used as
	 * the offset from the end of `collection`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to search.
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
	 * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
	 * // => true
	 *
	 * _.includes('pebbles', 'eb');
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


/***/ },
/* 212 */
/***/ function(module, exports, __webpack_require__) {

	var indexOfNaN = __webpack_require__(213);
	
	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  if (value !== value) {
	    return indexOfNaN(array, fromIndex);
	  }
	  var index = fromIndex - 1,
	      length = array.length;
	
	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = baseIndexOf;


/***/ },
/* 213 */
/***/ function(module, exports) {

	/**
	 * Gets the index at which the first occurrence of `NaN` is found in `array`.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
	 */
	function indexOfNaN(array, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 0 : -1);
	
	  while ((fromRight ? index-- : ++index < length)) {
	    var other = array[index];
	    if (other !== other) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = indexOfNaN;


/***/ },
/* 214 */
/***/ function(module, exports, __webpack_require__) {

	var toFinite = __webpack_require__(215);
	
	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This function is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
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


/***/ },
/* 215 */
/***/ function(module, exports, __webpack_require__) {

	var toNumber = __webpack_require__(216);
	
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


/***/ },
/* 216 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(97),
	    isObject = __webpack_require__(98),
	    isSymbol = __webpack_require__(181);
	
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
	    var other = isFunction(value.valueOf) ? value.valueOf() : value;
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


/***/ },
/* 217 */
/***/ function(module, exports, __webpack_require__) {

	var baseValues = __webpack_require__(218),
	    keys = __webpack_require__(86);
	
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
	  return object ? baseValues(object, keys(object)) : [];
	}
	
	module.exports = values;


/***/ },
/* 218 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(170);
	
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


/***/ },
/* 219 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports.canMutate = canMutate;
	exports['default'] = getImmutableOps;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }
	
	var _lodashForOwn = __webpack_require__(210);
	
	var _lodashForOwn2 = _interopRequireDefault(_lodashForOwn);
	
	var _lodashIsArrayLike = __webpack_require__(94);
	
	var _lodashIsArrayLike2 = _interopRequireDefault(_lodashIsArrayLike);
	
	var _ramdaSrcCurry = __webpack_require__(220);
	
	var _ramdaSrcCurry2 = _interopRequireDefault(_ramdaSrcCurry);
	
	var _ramdaSrcWrap = __webpack_require__(227);
	
	var _ramdaSrcWrap2 = _interopRequireDefault(_ramdaSrcWrap);
	
	var _ramdaSrc__ = __webpack_require__(229);
	
	var _ramdaSrc__2 = _interopRequireDefault(_ramdaSrc__);
	
	var MUTABILITY_TAG = '@@_______canMutate';
	
	function fastArrayCopy(arr) {
	    var copied = new Array(arr.length);
	    for (var i = 0; i < arr.length; i++) {
	        copied[i] = arr[i];
	    }
	    return copied;
	}
	
	function canMutate(obj) {
	    return obj.hasOwnProperty(MUTABILITY_TAG);
	}
	
	function addCanMutateTag(opts, obj) {
	    Object.defineProperty(obj, MUTABILITY_TAG, {
	        value: true,
	        configurable: true,
	        enumerable: false
	    });
	
	    opts.batchManager.addMutated(obj);
	
	    return obj;
	}
	
	function removeCanMutateTag(obj) {
	    delete obj[MUTABILITY_TAG];
	    return obj;
	}
	
	function prepareNewObject(opts, instance) {
	    if (opts.batchManager.isWithMutations()) {
	        addCanMutateTag(opts, instance);
	    }
	    opts.createdObjects++;
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
	
	function mutableSet(opts, key, value, obj) {
	    obj[key] = value;
	    return obj;
	}
	
	function mutableSetIn(opts, _pathArg, value, obj) {
	    var originalPathArg = normalizePath(_pathArg);
	
	    var pathLen = originalPathArg.length;
	    originalPathArg.reduce(function (acc, curr, idx) {
	        if (idx === pathLen - 1) {
	            acc[curr] = value;
	            return value;
	        }
	
	        var currType = typeof acc[curr];
	
	        if (currType === 'undefined') {
	            var newObj = {};
	            prepareNewObject(opts, newObj);
	            acc[curr] = newObj;
	            return newObj;
	        }
	
	        if (currType === 'object') {
	            return acc[curr];
	        }
	
	        var pathRepr = originalPathArg[idx - 1] + '.' + curr;
	        throw new Error('A non-object value was encountered when traversing setIn path at ' + pathRepr + '.');
	    });
	
	    return obj;
	}
	
	function valueInPath(opts, _pathArg, obj) {
	    var pathArg = normalizePath(_pathArg);
	
	    var acc = obj;
	    for (var i = 0; i < pathArg.length; i++) {
	        var curr = pathArg[i];
	        var currRef = acc[curr];
	        if (i === pathArg.length - 1) {
	            return currRef;
	        }
	
	        if (typeof currRef === 'object') {
	            acc = currRef;
	        } else {
	            return undefined;
	        }
	    }
	}
	
	function immutableSetIn(opts, _pathArg, value, obj) {
	    var pathArg = normalizePath(_pathArg);
	
	    var currentValue = valueInPath(opts, pathArg, obj);
	    if (value === currentValue) return obj;
	
	    var pathLen = pathArg.length;
	    var acc = Object.assign(prepareNewObject(opts, {}), obj);
	    var rootObj = acc;
	
	    pathArg.forEach(function (curr, idx) {
	        if (idx === pathLen - 1) {
	            acc[curr] = value;
	            return;
	        }
	
	        var currRef = acc[curr];
	        var currType = typeof currRef;
	
	        if (currType === 'object') {
	            if (canMutate(currRef)) {
	                acc = currRef;
	            } else {
	                var newObj = prepareNewObject(opts, {});
	                acc[curr] = Object.assign(newObj, currRef);
	                acc = newObj;
	            }
	            return;
	        }
	
	        if (currType === 'undefined') {
	            var newObj = prepareNewObject(opts, {});
	            acc[curr] = newObj;
	            acc = newObj;
	            return;
	        }
	
	        var pathRepr = pathArg[idx - 1] + '.' + curr;
	        throw new Error('A non-object value was encountered when traversing setIn path at ' + pathRepr + '.');
	    });
	
	    return rootObj;
	}
	
	function mutableMerge(isDeep, opts, _mergeObjs, baseObj) {
	    var mergeObjs = forceArray(_mergeObjs);
	
	    if (opts.deep) {
	        mergeObjs.forEach(function (mergeObj) {
	            (0, _lodashForOwn2['default'])(mergeObj, function (value, key) {
	                if (isDeep && baseObj.hasOwnProperty(key)) {
	                    var assignValue = undefined;
	                    if (typeof value === 'object') {
	                        assignValue = canMutate(value) ? mutableMerge(isDeep, opts, [value], baseObj[key]) : immutableMerge(isDeep, opts, [value], baseObj[key]); // eslint-disable-line
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
	        Object.assign.apply(Object, [baseObj].concat(_toConsumableArray(mergeObjs)));
	    }
	
	    return baseObj;
	}
	
	var mutableShallowMerge = mutableMerge.bind(null, false);
	var mutableDeepMerge = mutableMerge.bind(null, true);
	
	function mutableOmit(opts, _keys, obj) {
	    var keys = forceArray(_keys);
	    keys.forEach(function (key) {
	        delete obj[key];
	    });
	    return obj;
	}
	
	function _shouldMergeKey(obj, other, key) {
	    return obj[key] !== other[key];
	}
	
	function immutableMerge(isDeep, opts, _mergeObjs, obj) {
	    if (canMutate(obj)) return mutableMerge(isDeep, opts, _mergeObjs, obj);
	    var mergeObjs = forceArray(_mergeObjs);
	
	    var hasChanges = false;
	    var nextObject = obj;
	
	    var willChange = function willChange() {
	        if (!hasChanges) {
	            hasChanges = true;
	            nextObject = Object.assign({}, obj);
	            prepareNewObject(opts, nextObject);
	        }
	    };
	
	    mergeObjs.forEach(function (mergeObj) {
	        (0, _lodashForOwn2['default'])(mergeObj, function (mergeValue, key) {
	            if (isDeep && obj.hasOwnProperty(key)) {
	                var currentValue = nextObject[key];
	                if (typeof mergeValue === 'object' && !(mergeValue instanceof Array)) {
	                    if (_shouldMergeKey(nextObject, mergeObj, key)) {
	                        var recursiveMergeResult = immutableMerge(isDeep, opts, mergeValue, currentValue);
	
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
	
	function immutableArrSet(opts, index, value, arr) {
	    if (canMutate(arr)) return mutableSet(opts, index, value, arr);
	
	    if (arr[index] === value) return arr;
	
	    var newArr = fastArrayCopy(arr);
	    newArr[index] = value;
	    prepareNewObject(opts, newArr);
	
	    return newArr;
	}
	
	function immutableSet(opts, key, value, obj) {
	    if ((0, _lodashIsArrayLike2['default'])(obj)) return immutableArrSet(opts, key, value, obj);
	    if (canMutate(obj)) return mutableSet(opts, key, value, obj);
	
	    if (obj[key] === value) return obj;
	
	    var newObj = Object.assign({}, obj);
	    prepareNewObject(opts, newObj);
	    newObj[key] = value;
	    return newObj;
	}
	
	function immutableOmit(opts, _keys, obj) {
	    if (canMutate(obj)) return mutableOmit(opts, _keys, obj);
	
	    var keys = forceArray(_keys);
	    var keysInObj = keys.filter(function (key) {
	        return obj.hasOwnProperty(key);
	    });
	
	    // None of the keys were in the object, so we can return `obj`.
	    if (keysInObj.length === 0) return obj;
	
	    var newObj = Object.assign({}, obj);
	    keysInObj.forEach(function (key) {
	        delete newObj[key];
	    });
	    prepareNewObject(opts, newObj);
	    return newObj;
	}
	
	function mutableArrPush(opts, _vals, arr) {
	    var vals = forceArray(_vals);
	    arr.push.apply(arr, _toConsumableArray(vals));
	    return arr;
	}
	
	function mutableArrFilter(opts, func, arr) {
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
	
	function mutableArrSplice(opts, index, deleteCount, _vals, arr) {
	    var vals = forceArray(_vals);
	    arr.splice.apply(arr, [index, deleteCount].concat(_toConsumableArray(vals)));
	    return arr;
	}
	
	function mutableArrInsert(opts, index, _vals, arr) {
	    return mutableArrSplice(opts, index, 0, _vals, arr);
	}
	
	function immutableArrSplice(opts, index, deleteCount, _vals, arr) {
	    if (canMutate(arr)) return mutableArrSplice(opts, index, deleteCount, _vals, arr);
	
	    var vals = forceArray(_vals);
	    var newArr = arr.slice();
	    prepareNewObject(opts, newArr);
	    newArr.splice.apply(newArr, [index, deleteCount].concat(_toConsumableArray(vals)));
	
	    return newArr;
	}
	
	function immutableArrInsert(opts, index, _vals, arr) {
	    if (canMutate(arr)) return mutableArrInsert(opts, index, _vals, arr);
	    return immutableArrSplice(opts, index, 0, _vals, arr);
	}
	
	function immutableArrPush(opts, vals, arr) {
	    return immutableArrInsert(opts, arr.length, vals, arr);
	}
	
	function immutableArrFilter(opts, func, arr) {
	    if (canMutate(arr)) return mutableArrFilter(opts, func, arr);
	    var newArr = arr.filter(func);
	
	    if (newArr.length === arr.length) return arr;
	
	    prepareNewObject(opts, newArr);
	    return newArr;
	}
	
	var operations = {
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
	    set: immutableSet,
	
	    mutable: {
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
	    }
	};
	
	function bindOperationsToOptions(opsObj, opts) {
	    var boundOperations = {};
	
	    (0, _lodashForOwn2['default'])(opsObj, function (value, key) {
	        if (typeof value === 'object') {
	            boundOperations[key] = bindOperationsToOptions(value, opts);
	        } else {
	            boundOperations[key] = value.bind(null, opts);
	
	            if (opts.curried) {
	                boundOperations[key] = (0, _ramdaSrcCurry2['default'])(boundOperations[key]);
	            }
	        }
	    });
	
	    return boundOperations;
	}
	
	function getBatchManager() {
	    var previousSessionStack = [];
	    var currMutatedObjects = null;
	    var objectsCreated = 0;
	
	    return {
	        open: function open() {
	            if (currMutatedObjects !== null) {
	                previousSessionStack.push(currMutatedObjects);
	            }
	            currMutatedObjects = [];
	        },
	
	        isWithMutations: function isWithMutations() {
	            return currMutatedObjects !== null;
	        },
	
	        addMutated: function addMutated(obj) {
	            currMutatedObjects.push(obj);
	            objectsCreated++;
	        },
	
	        getMutatedObjects: function getMutatedObjects() {
	            return currMutatedObjects;
	        },
	
	        getObjectsCreatedCount: function getObjectsCreatedCount() {
	            return objectsCreated;
	        },
	
	        close: function close() {
	            if (currMutatedObjects !== null) {
	                currMutatedObjects.forEach(removeCanMutateTag);
	                if (previousSessionStack.length) {
	                    currMutatedObjects = previousSessionStack.pop();
	                } else {
	                    currMutatedObjects = null;
	                }
	                objectsCreated = 0;
	            }
	        }
	    };
	}
	
	function getImmutableOps(userOpts) {
	    var defaultOpts = {
	        curried: true,
	        batchManager: getBatchManager()
	    };
	
	    var opts = Object.assign({ createdObjects: 0 }, defaultOpts, userOpts || {});
	
	    var boundOperations = bindOperationsToOptions(operations, opts);
	
	    function batchWrapper() {
	        var func = arguments[0];
	        var args = Array.prototype.slice.call(arguments, 1);
	        opts.batchManager.open();
	        var returnValue = func.apply(null, args);
	        opts.batchManager.close();
	        return returnValue;
	    }
	
	    boundOperations.batched = batchWrapper;
	    boundOperations.batch = (0, _ramdaSrcWrap2['default'])(_ramdaSrc__2['default'], batchWrapper);
	    boundOperations.createdObjectsCount = function () {
	        return opts.createdObjects;
	    };
	    boundOperations.getMutatedObjects = opts.batchManager.getMutatedObjects;
	    boundOperations.__ = _ramdaSrc__2['default'];
	    boundOperations.open = opts.batchManager.open;
	    boundOperations.close = opts.batchManager.close;
	    boundOperations.getBatchManager = getBatchManager;
	
	    boundOperations.useBatchManager = function (manager) {
	        opts.batchManager.close();
	        opts.batchManager = manager;
	        boundOperations.open = manager.open;
	        boundOperations.close = manager.close;
	        boundOperations.getMutatedObjects = manager.getMutatedObjects;
	    };
	
	    return boundOperations;
	}

/***/ },
/* 220 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(221);
	var curryN = __webpack_require__(223);
	
	
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


/***/ },
/* 221 */
/***/ function(module, exports, __webpack_require__) {

	var _isPlaceholder = __webpack_require__(222);
	
	
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


/***/ },
/* 222 */
/***/ function(module, exports) {

	module.exports = function _isPlaceholder(a) {
	  return a != null &&
	         typeof a === 'object' &&
	         a['@@functional/placeholder'] === true;
	};


/***/ },
/* 223 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(224);
	var _curry1 = __webpack_require__(221);
	var _curry2 = __webpack_require__(225);
	var _curryN = __webpack_require__(226);
	
	
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


/***/ },
/* 224 */
/***/ function(module, exports) {

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


/***/ },
/* 225 */
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(221);
	var _isPlaceholder = __webpack_require__(222);
	
	
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


/***/ },
/* 226 */
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(224);
	var _isPlaceholder = __webpack_require__(222);
	
	
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


/***/ },
/* 227 */
/***/ function(module, exports, __webpack_require__) {

	var _concat = __webpack_require__(228);
	var _curry2 = __webpack_require__(225);
	var curryN = __webpack_require__(223);
	
	
	/**
	 * Wrap a function inside another to allow you to make adjustments to the
	 * parameters, or do other processing either before the internal function is
	 * called or with its results.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (a... -> b) -> ((a... -> b) -> a... -> c) -> (a... -> c)
	 * @param {Function} fn The function to wrap.
	 * @param {Function} wrapper The wrapper function.
	 * @return {Function} The wrapped function.
	 * @example
	 *
	 *      var greet = name => 'Hello ' + name;
	 *
	 *      var shoutedGreet = R.wrap(greet, (gr, name) => gr(name).toUpperCase());
	 *
	 *      shoutedGreet("Kathy"); //=> "HELLO KATHY"
	 *
	 *      var shortenedGreet = R.wrap(greet, function(gr, name) {
	 *        return gr(name.substring(0, 3));
	 *      });
	 *      shortenedGreet("Robert"); //=> "Hello Rob"
	 */
	module.exports = _curry2(function wrap(fn, wrapper) {
	  return curryN(fn.length, function() {
	    return wrapper.apply(this, _concat([fn], arguments));
	  });
	});


/***/ },
/* 228 */
/***/ function(module, exports) {

	/**
	 * Private `concat` function to merge two array-like objects.
	 *
	 * @private
	 * @param {Array|Arguments} [set1=[]] An array-like object.
	 * @param {Array|Arguments} [set2=[]] An array-like object.
	 * @return {Array} A new, merged array.
	 * @example
	 *
	 *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
	 */
	module.exports = function _concat(set1, set2) {
	  set1 = set1 || [];
	  set2 = set2 || [];
	  var idx;
	  var len1 = set1.length;
	  var len2 = set2.length;
	  var result = [];
	
	  idx = 0;
	  while (idx < len1) {
	    result[result.length] = set1[idx];
	    idx += 1;
	  }
	  idx = 0;
	  while (idx < len2) {
	    result[result.length] = set2[idx];
	    idx += 1;
	  }
	  return result;
	};


/***/ },
/* 229 */
/***/ function(module, exports) {

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


/***/ },
/* 230 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(170),
	    baseIntersection = __webpack_require__(231),
	    castArrayLikeObject = __webpack_require__(235),
	    rest = __webpack_require__(236);
	
	/**
	 * Creates an array of unique values that are included in all given arrays
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons. The order of result values is determined by the
	 * order they occur in the first array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {...Array} [arrays] The arrays to inspect.
	 * @returns {Array} Returns the new array of intersecting values.
	 * @example
	 *
	 * _.intersection([2, 1], [4, 2], [1, 2]);
	 * // => [2]
	 */
	var intersection = rest(function(arrays) {
	  var mapped = arrayMap(arrays, castArrayLikeObject);
	  return (mapped.length && mapped[0] === arrays[0])
	    ? baseIntersection(mapped)
	    : [];
	});
	
	module.exports = intersection;


/***/ },
/* 231 */
/***/ function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(149),
	    arrayIncludes = __webpack_require__(232),
	    arrayIncludesWith = __webpack_require__(233),
	    arrayMap = __webpack_require__(170),
	    baseUnary = __webpack_require__(196),
	    cacheHas = __webpack_require__(234);
	
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


/***/ },
/* 232 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(212);
	
	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  return !!array.length && baseIndexOf(array, value, 0) > -1;
	}
	
	module.exports = arrayIncludes;


/***/ },
/* 233 */
/***/ function(module, exports) {

	/**
	 * This function is like `arrayIncludes` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} target The value to search for.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	      length = array.length;
	
	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}
	
	module.exports = arrayIncludesWith;


/***/ },
/* 234 */
/***/ function(module, exports) {

	/**
	 * Checks if a cache value for `key` exists.
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


/***/ },
/* 235 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLikeObject = __webpack_require__(93);
	
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


/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(237),
	    toInteger = __webpack_require__(214);
	
	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as
	 * an array.
	 *
	 * **Note:** This method is based on the
	 * [rest parameter](https://mdn.io/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.rest(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function rest(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);
	
	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, array);
	      case 1: return func.call(this, args[0], array);
	      case 2: return func.call(this, args[0], args[1], array);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = array;
	    return apply(func, this, otherArgs);
	  };
	}
	
	module.exports = rest;


/***/ },
/* 237 */
/***/ function(module, exports) {

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
	  var length = args.length;
	  switch (length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}
	
	module.exports = apply;


/***/ },
/* 238 */
/***/ function(module, exports, __webpack_require__) {

	var baseDifference = __webpack_require__(239),
	    baseFlatten = __webpack_require__(240),
	    isArrayLikeObject = __webpack_require__(93),
	    rest = __webpack_require__(236);
	
	/**
	 * Creates an array of unique `array` values not included in the other given
	 * arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons. The order of result values is determined by the
	 * order they occur in the first array.
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
	 * _.difference([3, 2, 1], [4, 2]);
	 * // => [3, 1]
	 */
	var difference = rest(function(array, values) {
	  return isArrayLikeObject(array)
	    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
	    : [];
	});
	
	module.exports = difference;


/***/ },
/* 239 */
/***/ function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(149),
	    arrayIncludes = __webpack_require__(232),
	    arrayIncludesWith = __webpack_require__(233),
	    arrayMap = __webpack_require__(170),
	    baseUnary = __webpack_require__(196),
	    cacheHas = __webpack_require__(234);
	
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
	        computed = iteratee ? iteratee(value) : value;
	
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


/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(241),
	    isFlattenable = __webpack_require__(242);
	
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


/***/ },
/* 241 */
/***/ function(module, exports) {

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


/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(92),
	    isArray = __webpack_require__(101);
	
	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable(value) {
	  return isArray(value) || isArguments(value);
	}
	
	module.exports = isFlattenable;


/***/ },
/* 243 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var UPDATE = exports.UPDATE = 'REDUX_ORM_UPDATE';
	var DELETE = exports.DELETE = 'REDUX_ORM_DELETE';
	var CREATE = exports.CREATE = 'REDUX_ORM_CREATE';

/***/ },
/* 244 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _defineProperty2 = __webpack_require__(245);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _assign = __webpack_require__(70);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(75);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _utils = __webpack_require__(199);
	
	var _immutableOps = __webpack_require__(219);
	
	var _immutableOps2 = _interopRequireDefault(_immutableOps);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var globalOps = (0, _immutableOps2.default)();
	
	/**
	 * Handles the underlying data structure for a {@link Model} class.
	 */
	var Backend = function () {
	    /**
	     * Creates a new {@link Backend} instance.
	     * @param  {Object} userOpts - options to use.
	     * @param  {string} [userOpts.idAttribute=id] - the id attribute of the entity.
	     * @param  {string} [userOpts.arrName=items] - the state attribute where an array of
	     *                                             entity id's are stored
	     * @param  {string} [userOpts.mapName=itemsById] - the state attribute where the entity objects
	     *                                                 are stored in a id to entity object
	     *                                                 map.
	     * @param  {Boolean} [userOpts.withMutations=false] - a boolean indicating if the backend
	     *                                                    operations should be executed
	     *                                                    with or without mutations.
	     */
	
	    function Backend(userOpts) {
	        (0, _classCallCheck3.default)(this, Backend);
	
	        var defaultOpts = {
	            idAttribute: 'id',
	            arrName: 'items',
	            mapName: 'itemsById',
	            withMutations: false
	        };
	
	        (0, _assign2.default)(this, defaultOpts, userOpts);
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
	
	
	    (0, _createClass3.default)(Backend, [{
	        key: 'accessId',
	        value: function accessId(branch, id) {
	            return branch[this.mapName][id];
	        }
	    }, {
	        key: 'accessIdList',
	        value: function accessIdList(branch) {
	            return branch[this.arrName];
	        }
	    }, {
	        key: 'getOps',
	        value: function getOps(tx) {
	            if (!tx) {
	                return globalOps;
	            }
	            if (!tx.meta.hasOwnProperty('ops')) {
	                tx.meta.ops = (0, _immutableOps2.default)();
	                tx.meta.ops.open();
	                tx.onClose(function (_tx) {
	                    _tx.meta.ops.close();
	                });
	            }
	            return tx.meta.ops;
	        }
	
	        /**
	         * Returns a {@link ListIterator} instance for
	         * the list of objects in `branch`.
	         *
	         * @param  {Object} branch - the model's state branch
	         * @return {ListIterator} An iterator that loops through the objects in `branch`
	         */
	
	    }, {
	        key: 'iterator',
	        value: function iterator(branch) {
	            var _this = this;
	
	            return new _utils.ListIterator(branch[this.arrName], 0, function (list, idx) {
	                return branch[_this.mapName][list[idx]];
	            });
	        }
	    }, {
	        key: 'accessList',
	        value: function accessList(branch) {
	            var _this2 = this;
	
	            return branch[this.arrName].map(function (id) {
	                var obj = _this2.accessId(branch, id);
	                return (0, _assign2.default)((0, _defineProperty3.default)({}, _this2.idAttribute, id), obj);
	            });
	        }
	
	        /**
	         * Returns the default state for the data structure.
	         * @return {Object} The default state for this {@link Backend} instance's data structure
	         */
	
	    }, {
	        key: 'getDefaultState',
	        value: function getDefaultState() {
	            var _ref;
	
	            return _ref = {}, (0, _defineProperty3.default)(_ref, this.arrName, []), (0, _defineProperty3.default)(_ref, this.mapName, {}), _ref;
	        }
	
	        /**
	         * Returns the data structure including a new object `entry`
	         * @param  {Object} session - the current Session instance
	         * @param  {Object} branch - the data structure state
	         * @param  {Object} entry - the object to insert
	         * @return {Object} the data structure including `entry`.
	         */
	
	    }, {
	        key: 'insert',
	        value: function insert(tx, branch, entry) {
	            var _ops$merge2;
	
	            var ops = this.getOps(tx);
	            var id = entry[this.idAttribute];
	
	            if (this.withMutations) {
	                ops.mutable.push(id, branch[this.arrName]);
	                ops.mutable.set(id, entry, branch[this.mapName]);
	                return branch;
	            }
	
	            return ops.merge((_ops$merge2 = {}, (0, _defineProperty3.default)(_ops$merge2, this.arrName, ops.push(id, branch[this.arrName])), (0, _defineProperty3.default)(_ops$merge2, this.mapName, ops.merge((0, _defineProperty3.default)({}, id, entry), branch[this.mapName])), _ops$merge2), branch);
	        }
	
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
	
	    }, {
	        key: 'update',
	        value: function update(tx, branch, idArr, mergeObj) {
	            var _this3 = this;
	
	            var ops = this.getOps(tx);
	
	            var mapName = this.mapName;
	
	
	            var mapFunction = function mapFunction(entity) {
	                var merge = _this3.withMutations ? ops.mutable.merge : ops.merge;
	                return merge(mergeObj, entity);
	            };
	
	            var set = this.withMutations ? ops.mutable.set : ops.set;
	
	            var newMap = idArr.reduce(function (map, id) {
	                var result = mapFunction(branch[mapName][id]);
	                return set(id, result, map);
	            }, branch[mapName]);
	            return ops.set(mapName, newMap, branch);
	        }
	
	        /**
	         * Returns the data structure without objects with their id included in `idsToDelete`.
	         * @param  {Object} session - the current Session instance
	         * @param  {Object} branch - the data structure state
	         * @param  {Array} idsToDelete - the ids to delete from the data structure
	         * @return {Object} the data structure without ids in `idsToDelete`.
	         */
	
	    }, {
	        key: 'delete',
	        value: function _delete(tx, branch, idsToDelete) {
	            var _ops$merge3;
	
	            var ops = this.getOps(tx);
	
	            var arrName = this.arrName;
	            var mapName = this.mapName;
	
	            var arr = branch[arrName];
	
	            if (this.withMutations) {
	                idsToDelete.forEach(function (id) {
	                    var idx = arr.indexOf(id);
	                    if (idx !== -1) {
	                        ops.mutable.splice(idx, 1, [], arr);
	                    }
	                    ops.mutable.omit(id, branch[mapName]);
	                });
	                return branch;
	            }
	
	            return ops.merge((_ops$merge3 = {}, (0, _defineProperty3.default)(_ops$merge3, arrName, ops.filter(function (id) {
	                return !(0, _utils.includes)(idsToDelete, id);
	            }, branch[arrName])), (0, _defineProperty3.default)(_ops$merge3, mapName, ops.omit(idsToDelete, branch[mapName])), _ops$merge3), branch);
	        }
	    }]);
	    return Backend;
	}();
	
	exports.default = Backend;

/***/ },
/* 245 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 246 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _extends2 = __webpack_require__(247);
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _toConsumableArray2 = __webpack_require__(248);
	
	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
	
	var _defineProperty2 = __webpack_require__(245);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _defineProperty4 = __webpack_require__(76);
	
	var _defineProperty5 = _interopRequireDefault(_defineProperty4);
	
	var _assign = __webpack_require__(70);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(75);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _forOwn = __webpack_require__(210);
	
	var _forOwn2 = _interopRequireDefault(_forOwn);
	
	var _isArray = __webpack_require__(101);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	var _uniq = __webpack_require__(258);
	
	var _uniq2 = _interopRequireDefault(_uniq);
	
	var _Session = __webpack_require__(262);
	
	var _Session2 = _interopRequireDefault(_Session);
	
	var _Backend = __webpack_require__(244);
	
	var _Backend2 = _interopRequireDefault(_Backend);
	
	var _QuerySet = __webpack_require__(1);
	
	var _QuerySet2 = _interopRequireDefault(_QuerySet);
	
	var _fields = __webpack_require__(277);
	
	var _constants = __webpack_require__(243);
	
	var _utils = __webpack_require__(199);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
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
	var Model = function () {
	    /**
	     * Creates a Model instance.
	     * @param  {Object} props - the properties to instantiate with
	     */
	
	    function Model(props) {
	        (0, _classCallCheck3.default)(this, Model);
	
	        this._initFields(props);
	    }
	
	    (0, _createClass3.default)(Model, [{
	        key: '_initFields',
	        value: function _initFields(props) {
	            var _this = this;
	
	            var ModelClass = this.getClass();
	
	            this._fieldNames = [];
	            this._fields = (0, _assign2.default)({}, props);
	
	            (0, _forOwn2.default)(props, function (fieldValue, fieldName) {
	                _this._fields[fieldName] = fieldValue;
	                _this._fieldNames.push(fieldName);
	                // If the field has not already been defined on the
	                // prototype for a relation.
	                if (!ModelClass.definedProperties[fieldName]) {
	                    (0, _defineProperty5.default)(_this, fieldName, {
	                        get: function get() {
	                            return fieldValue;
	                        },
	                        set: function set(value) {
	                            return _this.set(fieldName, value);
	                        },
	                        configurable: true
	                    });
	                }
	            });
	        }
	
	        /**
	         * Returns the raw state for this {@link Model} in the current {@link Session}.
	         * @return {Object} The state for this {@link Model} in the current {@link Session}.
	         */
	
	    }, {
	        key: 'getClass',
	
	
	        /**
	         * Gets the {@link Model} class or subclass constructor (the class that
	         * instantiated this instance).
	         *
	         * @return {Model} The {@link Model} class or subclass constructor used to instantiate
	         *                 this instance.
	         */
	        value: function getClass() {
	            return this.constructor;
	        }
	
	        /**
	         * Gets the id value of the current instance by looking up the id attribute.
	         * @return {*} The id value of the current instance.
	         */
	
	    }, {
	        key: 'getId',
	        value: function getId() {
	            return this._fields[this.getClass().idAttribute];
	        }
	
	        /**
	         * Returns a reference to the plain JS object in the store.
	         * Make sure to not mutate this.
	         *
	         * @return {Object} a reference to the plain JS object in the store
	         */
	
	    }, {
	        key: 'toString',
	
	
	        /**
	         * Returns a string representation of the {@link Model} instance.
	         *
	         * @return {string} A string representation of this {@link Model} instance.
	         */
	        value: function toString() {
	            var _this2 = this;
	
	            var className = this.getClass().modelName;
	            var fields = this._fieldNames.map(function (fieldName) {
	                var val = _this2._fields[fieldName];
	                return fieldName + ': ' + val;
	            }).join(', ');
	            return className + ': {' + fields + '}';
	        }
	
	        /**
	         * Returns a boolean indicating if `otherModel` equals this {@link Model} instance.
	         * Equality is determined by shallow comparing their attributes.
	         *
	         * @param  {Model} otherModel - a {@link Model} instance to compare
	         * @return {Boolean} a boolean indicating if the {@link Model} instance's are equal.
	         */
	
	    }, {
	        key: 'equals',
	        value: function equals(otherModel) {
	            return (0, _utils.objectShallowEquals)(this._fields, otherModel._fields);
	        }
	
	        /**
	         * Records a update to the {@link Model} instance for a single
	         * field value assignment.
	         *
	         * @param {string} propertyName - name of the property to set
	         * @param {*} value - value assigned to the property
	         * @return {undefined}
	         */
	
	    }, {
	        key: 'set',
	        value: function set(propertyName, value) {
	            this.update((0, _defineProperty3.default)({}, propertyName, value));
	        }
	
	        /**
	         * Records an update to the {@link Model} instance for multiple field value assignments.
	         * If the session is with mutations, updates the instance to reflect the new values.
	         *
	         * @param  {Object} userMergeObj - an object that will be merged with this instance.
	         * @return {undefined}
	         */
	
	    }, {
	        key: 'update',
	        value: function update(userMergeObj) {
	            var relFields = this.getClass().fields;
	            var mergeObj = (0, _assign2.default)({}, userMergeObj);
	
	            // If an array of entities or id's is supplied for a
	            // many-to-many related field, clear the old relations
	            // and add the new ones.
	            for (var mergeKey in mergeObj) {
	                // eslint-disable-line no-restricted-syntax
	                if (relFields.hasOwnProperty(mergeKey)) {
	                    var field = relFields[mergeKey];
	                    if (field instanceof _fields.ManyToMany) {
	                        var currentIds = this[mergeKey].idArr;
	
	                        // TODO: It could be better to check this stuff in Backend.
	                        var normalizedNewIds = mergeObj[mergeKey].map(_utils.normalizeEntity);
	                        var diffActions = (0, _utils.arrayDiffActions)(currentIds, normalizedNewIds);
	                        if (diffActions) {
	                            var idsToDelete = diffActions.delete;
	                            var idsToAdd = diffActions.add;
	                            if (idsToDelete.length > 0) {
	                                var _mergeKey;
	
	                                (_mergeKey = this[mergeKey]).remove.apply(_mergeKey, (0, _toConsumableArray3.default)(idsToDelete));
	                            }
	                            if (idsToAdd.length > 0) {
	                                var _mergeKey2;
	
	                                (_mergeKey2 = this[mergeKey]).add.apply(_mergeKey2, (0, _toConsumableArray3.default)(idsToAdd));
	                            }
	                        }
	                        delete mergeObj[mergeKey];
	                    } else if (field instanceof _fields.ForeignKey || field instanceof _fields.OneToOne) {
	                        mergeObj[mergeKey] = (0, _utils.normalizeEntity)(mergeObj[mergeKey]);
	                    }
	                }
	            }
	
	            var session = this.getClass().session;
	            if (session && session.withMutations) {
	                this._initFields((0, _assign2.default)({}, this._fields, mergeObj));
	            }
	
	            this.getClass().addUpdate({
	                type: _constants.UPDATE,
	                payload: {
	                    idArr: [this.getId()],
	                    mergeObj: mergeObj
	                }
	            });
	        }
	
	        /**
	         * Records the {@link Model} to be deleted.
	         * @return {undefined}
	         */
	
	    }, {
	        key: 'delete',
	        value: function _delete() {
	            this.getClass().addUpdate({
	                type: _constants.DELETE,
	                payload: [this.getId()]
	            });
	            this._onDelete();
	        }
	    }, {
	        key: '_onDelete',
	        value: function _onDelete() {
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
	                        relatedQs.update((0, _defineProperty3.default)({}, field.relatedName, null));
	                    }
	                } else if (field instanceof _fields.OneToOne) {
	                    // Set null to any foreign keys or one to ones pointed to
	                    // this instance.
	                    if (this[key] !== null) {
	                        this[key][field.relatedName] = null;
	                    }
	                }
	            }
	        }
	    }, {
	        key: 'ref',
	        get: function get() {
	            return this.getClass().accessId(this.getId());
	        }
	    }], [{
	        key: 'toString',
	        value: function toString() {
	            return 'ModelClass: ' + this.modelName;
	        }
	
	        /**
	         * Returns the options object passed to the {@link Backend} class constructor.
	         * By default, returns an empty object (which means the {@link Backend} instance
	         * will use default options). You can either override this function to return the options
	         * you want to use, or assign the options object as a static property to the
	         * Model class.
	         *
	         * @return {Object} the options object used to instantiate a {@link Backend} class.
	         */
	
	    }, {
	        key: 'backend',
	        value: function backend() {
	            return {};
	        }
	    }, {
	        key: '_getBackendOpts',
	        value: function _getBackendOpts() {
	            if (typeof this.backend === 'function') {
	                return this.backend();
	            }
	            return this.backend;
	        }
	
	        /**
	         * Returns the {@link Backend} class used to instantiate
	         * the {@link Backend} instance for this {@link Model}.
	         *
	         * Override this if you want to use a custom {@link Backend} class.
	         * @return {Backend} The {@link Backend} class or subclass to use for this {@link Model}.
	         */
	
	    }, {
	        key: 'getBackendClass',
	        value: function getBackendClass() {
	            return _Backend2.default;
	        }
	    }, {
	        key: 'getBackend',
	
	
	        /**
	         * Gets the {@link Backend} instance linked to this {@link Model}.
	         *
	         * @private
	         * @return {Backend} The {@link Backend} instance linked to this {@link Model}.
	         */
	        value: function getBackend() {
	            if (!this._sessionData.backend) {
	                var BackendClass = this.getBackendClass();
	                var opts = (0, _extends3.default)({}, this._getBackendOpts());
	
	                if (this.session && this.session.withMutations) {
	                    opts.withMutations = true;
	                }
	
	                var backend = new BackendClass(opts);
	
	                if (!this.session) {
	                    return backend;
	                }
	                this._sessionData.backend = backend;
	            }
	            return this._sessionData.backend;
	        }
	
	        /**
	         * Gets the Model's next state by applying the recorded
	         * updates.
	         *
	         * @private
	         * @param {Transction} tx - the current Transaction instance
	         * @return {Object} The next state.
	         */
	
	    }, {
	        key: 'getNextState',
	        value: function getNextState(_tx) {
	            var tx = _tx || this.session.currentTx;
	
	            var state = void 0;
	            if (this._sessionData.hasOwnProperty('nextState')) {
	                state = this._sessionData.nextState;
	            } else {
	                state = this.state;
	            }
	
	            var updates = tx.getUpdatesFor(this);
	
	            if (updates.length > 0) {
	                var nextState = updates.reduce(this.updateReducer.bind(this, tx), state);
	                this._sessionData.nextState = nextState;
	                tx.markApplied(this);
	                return nextState;
	            }
	
	            return state;
	        }
	
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
	
	    }, {
	        key: 'updateReducer',
	        value: function updateReducer(tx, state, action) {
	            var backend = this.getBackend();
	            switch (action.type) {
	                case _constants.CREATE:
	                    return backend.insert(tx, state, action.payload);
	                case _constants.UPDATE:
	                    return backend.update(tx, state, action.payload.idArr, action.payload.mergeObj);
	                case _constants.DELETE:
	                    return backend.delete(tx, state, action.payload);
	                default:
	                    return state;
	            }
	        }
	
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
	
	    }, {
	        key: 'reducer',
	        value: function reducer(state, action, model, session) {
	            // eslint-disable-line
	            return this.getNextState();
	        }
	
	        /**
	         * Gets the default, empty state of the branch.
	         * Delegates to a {@link Backend} instance.
	         *
	         * @private
	         * @return {Object} The default state.
	         */
	
	    }, {
	        key: 'getDefaultState',
	        value: function getDefaultState() {
	            return this.getBackend().getDefaultState();
	        }
	    }, {
	        key: 'markAccessed',
	        value: function markAccessed() {
	            this.session.markAccessed(this);
	        }
	
	        /**
	         * Returns the id attribute of this {@link Model}.
	         * Delegates to the related {@link Backend} instance.
	         *
	         * @return {string} The id attribute of this {@link Model}.
	         */
	
	    }, {
	        key: 'accessId',
	
	
	        /**
	         * A convenience method to call {@link Backend#accessId} from
	         * the {@link Model} class.
	         *
	         * @param  {Number} id - the object id to access
	         * @return {Object} a reference to the object in the database.
	         */
	        value: function accessId(id) {
	            this.markAccessed();
	            return this.getBackend().accessId(this.state, id);
	        }
	
	        /**
	         * A convenience method to call {@link Backend#accessIdList} from
	         * the {@link Model} class with the current state.
	         */
	
	    }, {
	        key: 'accessIds',
	        value: function accessIds() {
	            this.markAccessed();
	            return this.getBackend().accessIdList(this.state);
	        }
	    }, {
	        key: 'accessList',
	        value: function accessList() {
	            this.markAccessed();
	            return this.getBackend().accessList(this.state);
	        }
	    }, {
	        key: 'iterator',
	        value: function iterator() {
	            this.markAccessed();
	            return this.getBackend().iterator(this.state);
	        }
	
	        /**
	         * Connect the model class to a {@link Session}.
	         *
	         * @private
	         * @param  {Session} session - The session to connect to.
	         */
	
	    }, {
	        key: 'connect',
	        value: function connect(session) {
	            if (!session instanceof _Session2.default) {
	                throw Error('A model can only connect to a Session instance.');
	            }
	            this._session = session;
	        }
	
	        /**
	         * Get the current {@link Session} instance.
	         *
	         * @private
	         * @return {Session} The current {@link Session} instance.
	         */
	
	    }, {
	        key: 'addUpdate',
	
	
	        /**
	         * A convenience method that delegates to the current {@link Session} instane.
	         * Adds the required backenddata about this {@link Model} to the update object.
	         *
	         * @private
	         * @param {Object} update - the update to add.
	         */
	        value: function addUpdate(update) {
	            update.meta = { name: this.modelName };
	            this.session.addUpdate(update);
	        }
	
	        /**
	         * Returns the id to be assigned to a new entity.
	         * You may override this to suit your needs.
	         * @return {*} the id value for a new entity.
	         */
	
	    }, {
	        key: 'nextId',
	        value: function nextId() {
	            if (typeof this._sessionData.nextId === 'undefined') {
	                var idArr = this.accessIds();
	                if (idArr.length === 0) {
	                    this._sessionData.nextId = 0;
	                } else {
	                    this._sessionData.nextId = Math.max.apply(Math, (0, _toConsumableArray3.default)(idArr)) + 1;
	                }
	            }
	            return this._sessionData.nextId;
	        }
	    }, {
	        key: 'getQuerySet',
	        value: function getQuerySet() {
	            return this.getQuerySetFromIds(this.accessIds());
	        }
	    }, {
	        key: 'getQuerySetFromIds',
	        value: function getQuerySetFromIds(ids) {
	            var QuerySetClass = this.querySetClass;
	            return new QuerySetClass(this, ids);
	        }
	    }, {
	        key: 'invalidateClassCache',
	        value: function invalidateClassCache() {
	            this.isSetUp = undefined;
	            this.definedProperties = {};
	            this.virtualFields = {};
	        }
	    }, {
	        key: 'all',
	
	
	        /**
	         * Returns a {@link QuerySet} containing all {@link Model} instances.
	         * @return {QuerySet} a QuerySet containing all {@link Model} instances
	         */
	        value: function all() {
	            return this.getQuerySet();
	        }
	
	        /**
	         * Records the addition of a new {@link Model} instance and returns it.
	         *
	         * @param  {props} props - the new {@link Model}'s properties.
	         * @return {Model} a new {@link Model} instance.
	         */
	
	    }, {
	        key: 'create',
	        value: function create(userProps) {
	            var _this3 = this;
	
	            var idAttribute = this.idAttribute;
	            var props = (0, _assign2.default)({}, userProps);
	
	            if (!props.hasOwnProperty(idAttribute)) {
	                var nextId = this.nextId();
	                props[idAttribute] = nextId;
	                this._sessionData.nextId++;
	            } else {
	                var id = props[idAttribute];
	                if (id > this.nextId()) {
	                    this._sessionData.nextId = id + 1;
	                }
	            }
	
	            var m2mVals = {};
	
	            (0, _forOwn2.default)(userProps, function (value, key) {
	                props[key] = (0, _utils.normalizeEntity)(value);
	
	                // If a value is supplied for a ManyToMany field,
	                // discard them from props and save for later processing.
	                if ((0, _isArray2.default)(value)) {
	                    if (_this3.fields.hasOwnProperty(key) && _this3.fields[key] instanceof _fields.ManyToMany) {
	                        m2mVals[key] = value;
	                        delete props[key];
	                    }
	                }
	            });
	
	            this.addUpdate({
	                type: _constants.CREATE,
	                payload: props
	            });
	            var ModelClass = this;
	            var instance = new ModelClass(props);
	
	            (0, _forOwn2.default)(m2mVals, function (value, key) {
	                var _instance$key;
	
	                var ids = value.map(_utils.normalizeEntity);
	                var uniqueIds = (0, _uniq2.default)(ids);
	
	                if (ids.length !== uniqueIds.length) {
	                    var idsString = ids;
	                    throw new Error('Found duplicate id(s) when passing "' + idsString + '" to ' + _this3.modelName + '.' + key + ' value on create');
	                }
	                (_instance$key = instance[key]).add.apply(_instance$key, (0, _toConsumableArray3.default)(ids));
	            });
	
	            return instance;
	        }
	
	        /**
	         * Returns a {@link Model} instance for the object with id `id`.
	         *
	         * @param  {*} id - the `id` of the object to get
	         * @throws If object with id `id` doesn't exist
	         * @return {Model} {@link Model} instance with id `id`
	         */
	
	    }, {
	        key: 'withId',
	        value: function withId(id) {
	            var ModelClass = this;
	
	            if (!this.hasId(id)) {
	                throw new Error(this.modelName + ' instance with id ' + id + ' not found');
	            }
	
	            var ref = this.accessId(id);
	
	            return new ModelClass(ref);
	        }
	
	        /**
	         * Returns a boolean indicating if an entity with the id `id` exists
	         * in the state.
	         *
	         * @param  {*}  id - a value corresponding to the id attribute of the {@link Model} class.
	         * @return {Boolean} a boolean indicating if entity with `id` exists in the state
	         */
	
	    }, {
	        key: 'hasId',
	        value: function hasId(id) {
	            var ref = this.accessId(id);
	
	            if (typeof ref === 'undefined') return false;
	
	            return true;
	        }
	
	        /**
	         * Gets the {@link Model} instance that matches properties in `lookupObj`.
	         * Throws an error if {@link Model} is not found.
	         *
	         * @param  {Object} lookupObj - the properties used to match a single entity.
	         * @return {Model} a {@link Model} instance that matches `lookupObj` properties.
	         */
	
	    }, {
	        key: 'get',
	        value: function get(lookupObj) {
	            if (!this.accessIds().length) {
	                throw new Error('No entities found for model ' + this.modelName);
	            }
	            var ModelClass = this;
	
	            // We treat `idAttribute` as unique, so if it's
	            // in `lookupObj` we search with that attribute only.
	            if (lookupObj.hasOwnProperty(this.idAttribute)) {
	                var props = this.accessId(lookupObj[this.idAttribute]);
	                if (typeof props !== 'undefined') {
	                    return new ModelClass(props);
	                }
	
	                throw new Error('Model instance not found when calling get method');
	            }
	
	            var iterator = this.iterator();
	
	            var done = false;
	            while (!done) {
	                var curr = iterator.next();
	                if ((0, _utils.match)(lookupObj, curr.value)) {
	                    return new ModelClass(curr.value);
	                }
	                done = curr.done;
	            }
	
	            throw new Error('Model instance not found when calling get method');
	        }
	    }, {
	        key: 'state',
	        get: function get() {
	            return this.session.getState(this.modelName);
	        }
	    }, {
	        key: '_sessionData',
	        get: function get() {
	            if (!this.session) return {};
	            return this.session.getDataForModel(this.modelName);
	        }
	    }, {
	        key: 'idAttribute',
	        get: function get() {
	            return this.getBackend().idAttribute;
	        }
	    }, {
	        key: 'session',
	        get: function get() {
	            return this._session;
	        }
	    }, {
	        key: 'query',
	        get: function get() {
	            if (!this._sessionData.queryset) {
	                this._sessionData.queryset = this.getQuerySet();
	            }
	            return this._sessionData.queryset;
	        }
	    }]);
	    return Model;
	}();
	
	Model.fields = {};
	Model.definedProperties = {};
	Model.virtualFields = {};
	Model.querySetClass = _QuerySet2.default;
	
	exports.default = Model;

/***/ },
/* 247 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _assign = __webpack_require__(70);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = _assign2.default || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];
	
	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }
	
	  return target;
	};

/***/ },
/* 248 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _from = __webpack_require__(249);
	
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

/***/ },
/* 249 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(250), __esModule: true };

/***/ },
/* 250 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	__webpack_require__(251);
	module.exports = __webpack_require__(13).Array.from;

/***/ },
/* 251 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ctx            = __webpack_require__(14)
	  , $export        = __webpack_require__(11)
	  , toObject       = __webpack_require__(48)
	  , call           = __webpack_require__(252)
	  , isArrayIter    = __webpack_require__(253)
	  , toLength       = __webpack_require__(38)
	  , createProperty = __webpack_require__(254)
	  , getIterFn      = __webpack_require__(255);
	
	$export($export.S + $export.F * !__webpack_require__(257)(function(iter){ Array.from(iter); }), 'Array', {
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


/***/ },
/* 252 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 253 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(28)
	  , ITERATOR   = __webpack_require__(46)('iterator')
	  , ArrayProto = Array.prototype;
	
	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 254 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $defineProperty = __webpack_require__(17)
	  , createDesc      = __webpack_require__(25);
	
	module.exports = function(object, index, value){
	  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
	  else object[index] = value;
	};

/***/ },
/* 255 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(256)
	  , ITERATOR  = __webpack_require__(46)('iterator')
	  , Iterators = __webpack_require__(28);
	module.exports = __webpack_require__(13).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 256 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 257 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 258 */
/***/ function(module, exports, __webpack_require__) {

	var baseUniq = __webpack_require__(259);
	
	/**
	 * Creates a duplicate-free version of an array, using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons, in which only the first occurrence of each
	 * element is kept.
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
	  return (array && array.length)
	    ? baseUniq(array)
	    : [];
	}
	
	module.exports = uniq;


/***/ },
/* 259 */
/***/ function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(149),
	    arrayIncludes = __webpack_require__(232),
	    arrayIncludesWith = __webpack_require__(233),
	    cacheHas = __webpack_require__(234),
	    createSet = __webpack_require__(260),
	    setToArray = __webpack_require__(157);
	
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


/***/ },
/* 260 */
/***/ function(module, exports, __webpack_require__) {

	var Set = __webpack_require__(162),
	    noop = __webpack_require__(261),
	    setToArray = __webpack_require__(157);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/**
	 * Creates a set of `values`.
	 *
	 * @private
	 * @param {Array} values The values to add to the set.
	 * @returns {Object} Returns the new set.
	 */
	var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
	  return new Set(values);
	};
	
	module.exports = createSet;


/***/ },
/* 261 */
/***/ function(module, exports) {

	/**
	 * A no-operation function that returns `undefined` regardless of the
	 * arguments it receives.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.3.0
	 * @category Util
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.noop(object) === undefined;
	 * // => true
	 */
	function noop() {
	  // No operation performed.
	}
	
	module.exports = noop;


/***/ },
/* 262 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _defineProperty = __webpack_require__(76);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	var _getPrototypeOf = __webpack_require__(204);
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _possibleConstructorReturn2 = __webpack_require__(263);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(264);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(75);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _Transaction = __webpack_require__(272);
	
	var _Transaction2 = _interopRequireDefault(_Transaction);
	
	var _utils = __webpack_require__(199);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Session handles a single
	 * action dispatch.
	 */
	var Session = function () {
	    /**
	     * Creates a new Session.
	     *
	     * @param  {Schema} schema - a {@link Schema} instance
	     * @param  {Object} state - the database state
	     * @param  {Object} [action] - the current action in the dispatch cycle.
	     *                             Will be passed to the user defined reducers.
	     * @param  {Boolean} withMutations - whether the session should mutate data
	     */
	
	    function Session(schema, state, action, withMutations) {
	        var _this2 = this;
	
	        (0, _classCallCheck3.default)(this, Session);
	
	        this.schema = schema;
	        this.state = state || schema.getDefaultState();
	        this.action = action;
	        this.withMutations = !!withMutations;
	
	        this.currentTx = new _Transaction2.default();
	
	        this._accessedModels = {};
	        this.modelData = {};
	
	        this.models = schema.getModelClasses();
	
	        this.sessionBoundModels = this.models.map(function (modelClass) {
	            var sessionBoundModel = function (_modelClass) {
	                (0, _inherits3.default)(SessionBoundModel, _modelClass);
	
	                function SessionBoundModel() {
	                    (0, _classCallCheck3.default)(this, SessionBoundModel);
	                    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SessionBoundModel).apply(this, arguments));
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
	
	    (0, _createClass3.default)(Session, [{
	        key: 'markAccessed',
	        value: function markAccessed(model) {
	            this.getDataForModel(model.modelName).accessed = true;
	        }
	    }, {
	        key: 'getDataForModel',
	        value: function getDataForModel(modelName) {
	            if (!this.modelData[modelName]) {
	                this.modelData[modelName] = {};
	            }
	
	            return this.modelData[modelName];
	        }
	
	        /**
	         * Records an update to the session.
	         *
	         * @private
	         * @param {Object} update - the update object. Must have keys
	         *                          `type`, `payload` and `meta`. `meta`
	         *                          must also include a `name` attribute
	         *                          that contains the model name.
	         */
	
	    }, {
	        key: 'addUpdate',
	        value: function addUpdate(update) {
	            if (this.withMutations) {
	                var modelName = update.meta.name;
	                var modelState = this.getState(modelName);
	
	                // The backend used in the updateReducer
	                // will mutate the model state.
	                this[modelName].updateReducer(null, modelState, update);
	            } else {
	                this.currentTx.addUpdate(update);
	            }
	        }
	    }, {
	        key: 'getUpdatesFor',
	        value: function getUpdatesFor(modelName) {
	            return this.currentTx.getUpdatesFor(modelName);
	        }
	    }, {
	        key: 'getState',
	
	
	        /**
	         * Returns the current state for a model with name `modelName`.
	         *
	         * @private
	         * @param  {string} modelName - the name of the model to get state for.
	         * @return {*} The state for model with name `modelName`.
	         */
	        value: function getState(modelName) {
	            return this.state[modelName];
	        }
	
	        /**
	         * Applies recorded updates and returns the next state.
	         * @param  {Object} [opts] - Options object
	         * @param  {Boolean} [opts.runReducers] - A boolean indicating if the user-defined
	         *                                        model reducers should be run. If not specified,
	         *                                        is set to `true` if an action object was specified
	         *                                        on session instantiation, otherwise `false`.
	         * @return {Object} The next state
	         */
	
	    }, {
	        key: 'getNextState',
	        value: function getNextState(userOpts) {
	            var _this3 = this;
	
	            if (this.withMutations) return this.state;
	
	            var prevState = this.state;
	            var action = this.action;
	            var opts = userOpts || {};
	
	            // If the session does not have a specified action object,
	            // don't run the user-defined model reducers unless
	            // explicitly specified.
	            var runReducers = opts.hasOwnProperty('runReducers') ? opts.runReducers : !!action;
	
	            var tx = this.currentTx;
	            _utils.ops.open();
	
	            var nextState = prevState;
	            if (runReducers) {
	                nextState = this.sessionBoundModels.reduce(function (_nextState, modelClass) {
	                    var modelState = _this3.getState(modelClass.modelName);
	
	                    var returnValue = modelClass.reducer(modelState, action, modelClass, _this3);
	                    if (typeof returnValue === 'undefined') {
	                        returnValue = modelClass.getNextState(tx);
	                    }
	                    return _utils.ops.set(modelClass.modelName, returnValue, _nextState);
	                }, nextState);
	            }
	
	            // There might be some m2m updates left.
	            var unappliedUpdates = this.currentTx.getUnappliedUpdatesByModel();
	            if (unappliedUpdates) {
	                nextState = this.sessionBoundModels.reduce(function (_nextState, modelClass) {
	                    var modelName = modelClass.modelName;
	                    if (!unappliedUpdates.hasOwnProperty(modelName)) {
	                        return _nextState;
	                    }
	
	                    return _utils.ops.set(modelName, modelClass.getNextState(tx), _nextState);
	                }, nextState);
	            }
	
	            _utils.ops.close();
	            tx.close();
	            this.currentTx = new _Transaction2.default();
	
	            return nextState;
	        }
	
	        /**
	         * Calls the user-defined reducers and returns the next state.
	         * If the session uses mutations, just returns the state.
	         * Delegates to {@link Session#getNextState}
	         *
	         * @return {Object} the next state
	         */
	
	    }, {
	        key: 'reduce',
	        value: function reduce() {
	            return this.getNextState({ runReducers: true });
	        }
	    }, {
	        key: 'accessedModels',
	        get: function get() {
	            var _this4 = this;
	
	            return this.sessionBoundModels.filter(function (model) {
	                return !!_this4.getDataForModel(model.modelName).accessed;
	            }).map(function (model) {
	                return model.modelName;
	            });
	        }
	    }, {
	        key: 'updates',
	        get: function get() {
	            return this.currentTx.updates.map(function (update) {
	                return update.update;
	            });
	        }
	    }]);
	    return Session;
	}();
	
	exports.default = Session;

/***/ },
/* 263 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 264 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _setPrototypeOf = __webpack_require__(265);
	
	var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);
	
	var _create = __webpack_require__(269);
	
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

/***/ },
/* 265 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(266), __esModule: true };

/***/ },
/* 266 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(267);
	module.exports = __webpack_require__(13).Object.setPrototypeOf;

/***/ },
/* 267 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $export = __webpack_require__(11);
	$export($export.S, 'Object', {setPrototypeOf: __webpack_require__(268).set});

/***/ },
/* 268 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 269 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(270), __esModule: true };

/***/ },
/* 270 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(271);
	var $Object = __webpack_require__(13).Object;
	module.exports = function create(P, D){
	  return $Object.create(P, D);
	};

/***/ },
/* 271 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(11)
	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	$export($export.S, 'Object', {create: __webpack_require__(30)});

/***/ },
/* 272 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(75);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _groupBy = __webpack_require__(273);
	
	var _groupBy2 = _interopRequireDefault(_groupBy);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Handles a single unit of work on the database backend.
	 */
	var Transaction = function () {
	    function Transaction() {
	        (0, _classCallCheck3.default)(this, Transaction);
	
	        this.updates = [];
	        this.updatesByModelName = {};
	
	        this.meta = {};
	        this.onCloseCallbacks = [];
	    }
	
	    (0, _createClass3.default)(Transaction, [{
	        key: 'getUpdatesFor',
	        value: function getUpdatesFor(modelClass) {
	            var modelName = modelClass.modelName;
	            if (!this.updatesByModelName.hasOwnProperty(modelName)) {
	                return [];
	            }
	
	            return this.updatesByModelName[modelName].filter(function (update) {
	                return !update.applied;
	            }).map(function (update) {
	                return update.update;
	            });
	        }
	    }, {
	        key: 'getUnappliedUpdatesByModel',
	        value: function getUnappliedUpdatesByModel() {
	            var unappliedUpdates = this.updates.filter(function (update) {
	                return !update.applied;
	            }).map(function (update) {
	                return update.update;
	            });
	            if (unappliedUpdates.length) {
	                return (0, _groupBy2.default)(unappliedUpdates, 'meta.name');
	            }
	            return null;
	        }
	    }, {
	        key: 'markApplied',
	        value: function markApplied(modelClass) {
	            var modelName = modelClass.modelName;
	            this.updatesByModelName[modelName].forEach(function (update) {
	                update.applied = true; // eslint-disable-line no-param-reassign
	            });
	        }
	    }, {
	        key: 'addUpdate',
	        value: function addUpdate(_update) {
	            var update = { update: _update, applied: false };
	            this.updates.push(update);
	            var modelName = _update.meta.name;
	            if (this.updatesByModelName.hasOwnProperty(modelName)) {
	                this.updatesByModelName[modelName].push(update);
	            } else {
	                this.updatesByModelName[modelName] = [update];
	            }
	        }
	    }, {
	        key: 'addUpdates',
	        value: function addUpdates(updates) {
	            var _this = this;
	
	            updates.forEach(function (update) {
	                return _this.addUpdate(update);
	            });
	        }
	    }, {
	        key: 'onClose',
	        value: function onClose(fn) {
	            this.onCloseCallbacks.push(fn);
	        }
	    }, {
	        key: 'close',
	        value: function close() {
	            var _this2 = this;
	
	            this.onCloseCallbacks.forEach(function (cb) {
	                return cb.call(null, _this2);
	            });
	        }
	    }]);
	    return Transaction;
	}();
	
	exports.default = Transaction;

/***/ },
/* 273 */
/***/ function(module, exports, __webpack_require__) {

	var createAggregator = __webpack_require__(274);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Creates an object composed of keys generated from the results of running
	 * each element of `collection` thru `iteratee`. The order of grouped values
	 * is determined by the order they occur in `collection`. The corresponding
	 * value of each key is an array of elements responsible for generating the
	 * key. The iteratee is invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Array|Function|Object|string} [iteratee=_.identity]
	 *  The iteratee to transform keys.
	 * @returns {Object} Returns the composed aggregate object.
	 * @example
	 *
	 * _.groupBy([6.1, 4.2, 6.3], Math.floor);
	 * // => { '4': [4.2], '6': [6.1, 6.3] }
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.groupBy(['one', 'two', 'three'], 'length');
	 * // => { '3': ['one', 'two'], '5': ['three'] }
	 */
	var groupBy = createAggregator(function(result, value, key) {
	  if (hasOwnProperty.call(result, key)) {
	    result[key].push(value);
	  } else {
	    result[key] = [value];
	  }
	});
	
	module.exports = groupBy;


/***/ },
/* 274 */
/***/ function(module, exports, __webpack_require__) {

	var arrayAggregator = __webpack_require__(275),
	    baseAggregator = __webpack_require__(276),
	    baseIteratee = __webpack_require__(106),
	    isArray = __webpack_require__(101);
	
	/**
	 * Creates a function like `_.groupBy`.
	 *
	 * @private
	 * @param {Function} setter The function to set accumulator values.
	 * @param {Function} [initializer] The accumulator object initializer.
	 * @returns {Function} Returns the new aggregator function.
	 */
	function createAggregator(setter, initializer) {
	  return function(collection, iteratee) {
	    var func = isArray(collection) ? arrayAggregator : baseAggregator,
	        accumulator = initializer ? initializer() : {};
	
	    return func(collection, setter, baseIteratee(iteratee), accumulator);
	  };
	}
	
	module.exports = createAggregator;


/***/ },
/* 275 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `baseAggregator` for arrays.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} setter The function to set `accumulator` values.
	 * @param {Function} iteratee The iteratee to transform keys.
	 * @param {Object} accumulator The initial aggregated object.
	 * @returns {Function} Returns `accumulator`.
	 */
	function arrayAggregator(array, setter, iteratee, accumulator) {
	  var index = -1,
	      length = array.length;
	
	  while (++index < length) {
	    var value = array[index];
	    setter(accumulator, value, iteratee(value), array);
	  }
	  return accumulator;
	}
	
	module.exports = arrayAggregator;


/***/ },
/* 276 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(82);
	
	/**
	 * Aggregates elements of `collection` on `accumulator` with keys transformed
	 * by `iteratee` and values set by `setter`.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} setter The function to set `accumulator` values.
	 * @param {Function} iteratee The iteratee to transform keys.
	 * @param {Object} accumulator The initial aggregated object.
	 * @returns {Function} Returns `accumulator`.
	 */
	function baseAggregator(collection, setter, iteratee, accumulator) {
	  baseEach(collection, function(value, key, collection) {
	    setter(accumulator, value, iteratee(value), collection);
	  });
	  return accumulator;
	}
	
	module.exports = baseAggregator;


/***/ },
/* 277 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.OneToOne = exports.ManyToMany = exports.ForeignKey = undefined;
	
	var _getPrototypeOf = __webpack_require__(204);
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _possibleConstructorReturn2 = __webpack_require__(263);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(264);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	exports.fk = fk;
	exports.many = many;
	exports.oneToOne = oneToOne;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Field = function Field(toModelName, relatedName) {
	    (0, _classCallCheck3.default)(this, Field);
	
	    this.toModelName = toModelName;
	    this.relatedName = relatedName;
	};
	
	var ForeignKey = exports.ForeignKey = function (_Field) {
	    (0, _inherits3.default)(ForeignKey, _Field);
	
	    function ForeignKey() {
	        (0, _classCallCheck3.default)(this, ForeignKey);
	        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ForeignKey).apply(this, arguments));
	    }
	
	    return ForeignKey;
	}(Field);
	var ManyToMany = exports.ManyToMany = function (_Field2) {
	    (0, _inherits3.default)(ManyToMany, _Field2);
	
	    function ManyToMany() {
	        (0, _classCallCheck3.default)(this, ManyToMany);
	        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ManyToMany).apply(this, arguments));
	    }
	
	    return ManyToMany;
	}(Field);
	var OneToOne = exports.OneToOne = function (_Field3) {
	    (0, _inherits3.default)(OneToOne, _Field3);
	
	    function OneToOne() {
	        (0, _classCallCheck3.default)(this, OneToOne);
	        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OneToOne).apply(this, arguments));
	    }
	
	    return OneToOne;
	}(Field);
	
	function fk() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	    }
	
	    return new (Function.prototype.bind.apply(ForeignKey, [null].concat(args)))();
	}
	
	function many() {
	    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        args[_key2] = arguments[_key2];
	    }
	
	    return new (Function.prototype.bind.apply(ManyToMany, [null].concat(args)))();
	}
	
	function oneToOne() {
	    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	        args[_key3] = arguments[_key3];
	    }
	
	    return new (Function.prototype.bind.apply(OneToOne, [null].concat(args)))();
	}

/***/ },
/* 278 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _defineProperty2 = __webpack_require__(76);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _getOwnPropertyDescriptor = __webpack_require__(200);
	
	var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);
	
	var _defineProperty4 = __webpack_require__(245);
	
	var _defineProperty5 = _interopRequireDefault(_defineProperty4);
	
	var _getPrototypeOf = __webpack_require__(204);
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _possibleConstructorReturn2 = __webpack_require__(263);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(264);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _classCallCheck2 = __webpack_require__(74);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(75);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _reselect = __webpack_require__(279);
	
	var _forOwn = __webpack_require__(210);
	
	var _forOwn2 = _interopRequireDefault(_forOwn);
	
	var _find = __webpack_require__(280);
	
	var _find2 = _interopRequireDefault(_find);
	
	var _Session = __webpack_require__(262);
	
	var _Session2 = _interopRequireDefault(_Session);
	
	var _Model3 = __webpack_require__(246);
	
	var _Model4 = _interopRequireDefault(_Model3);
	
	var _fields = __webpack_require__(277);
	
	var _descriptors = __webpack_require__(283);
	
	var _memoize = __webpack_require__(284);
	
	var _utils = __webpack_require__(199);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Schema's responsibility is tracking the set of {@link Model} classes used in the database.
	 * To include your model in that set, Schema offers {@link Schema#register} and a
	 * shortcut {@link Schema#define} methods.
	 *
	 * Schema also handles starting a Session with {@link Schema#from}.
	 */
	var Schema = function () {
	    /**
	     * Creates a new Schema.
	     */
	
	    function Schema() {
	        (0, _classCallCheck3.default)(this, Schema);
	
	        this.registry = [];
	        this.implicitThroughModels = [];
	        this.selectorCreator = (0, _reselect.createSelectorCreator)(_memoize.memoize, _memoize.eqCheck, this);
	    }
	
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
	
	
	    (0, _createClass3.default)(Schema, [{
	        key: 'define',
	        value: function define(modelName, relatedFields, reducer, backendOpts) {
	            var ShortcutDefinedModel = function (_Model) {
	                (0, _inherits3.default)(ShortcutDefinedModel, _Model);
	
	                function ShortcutDefinedModel() {
	                    (0, _classCallCheck3.default)(this, ShortcutDefinedModel);
	                    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ShortcutDefinedModel).apply(this, arguments));
	                }
	
	                return ShortcutDefinedModel;
	            }(_Model4.default);
	
	            ShortcutDefinedModel.modelName = modelName;
	            ShortcutDefinedModel.backend = backendOpts;
	            ShortcutDefinedModel.fields = relatedFields;
	
	            if (typeof reducer === 'function') {
	                ShortcutDefinedModel.reducer = reducer;
	            }
	
	            this.register(ShortcutDefinedModel);
	
	            return ShortcutDefinedModel;
	        }
	
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
	
	    }, {
	        key: 'register',
	        value: function register() {
	            var _this2 = this;
	
	            var models = Array.prototype.slice.call(arguments);
	            models.forEach(function (model) {
	                model.invalidateClassCache();
	
	                _this2.registerManyToManyModelsFor(model);
	                _this2.registry.push(model);
	            });
	        }
	    }, {
	        key: 'registerManyToManyModelsFor',
	        value: function registerManyToManyModelsFor(model) {
	            var _this4 = this;
	
	            var fields = model.fields;
	            var thisModelName = model.modelName;
	
	            (0, _forOwn2.default)(fields, function (fieldInstance, fieldName) {
	                if (fieldInstance instanceof _fields.ManyToMany) {
	                    var _Through$fields;
	
	                    var toModelName = void 0;
	                    if (fieldInstance.toModelName === 'this') {
	                        toModelName = thisModelName;
	                    } else {
	                        toModelName = fieldInstance.toModelName;
	                    }
	
	                    var fromFieldName = (0, _utils.m2mFromFieldName)(thisModelName);
	                    var toFieldName = (0, _utils.m2mToFieldName)(toModelName);
	
	                    var Through = function (_Model2) {
	                        (0, _inherits3.default)(ThroughModel, _Model2);
	
	                        function ThroughModel() {
	                            (0, _classCallCheck3.default)(this, ThroughModel);
	                            return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ThroughModel).apply(this, arguments));
	                        }
	
	                        return ThroughModel;
	                    }(_Model4.default);
	
	                    Through.modelName = (0, _utils.m2mName)(thisModelName, fieldName);
	
	                    Through.fields = (_Through$fields = {}, (0, _defineProperty5.default)(_Through$fields, fromFieldName, new _fields.ForeignKey(thisModelName)), (0, _defineProperty5.default)(_Through$fields, toFieldName, new _fields.ForeignKey(toModelName)), _Through$fields);
	
	                    Through.invalidateClassCache();
	                    _this4.implicitThroughModels.push(Through);
	                }
	            });
	        }
	
	        /**
	         * Gets a {@link Model} class by its name from the registry.
	         * @param  {string} modelName - the name of the {@link Model} class to get
	         * @throws If {@link Model} class is not found.
	         * @return {Model} the {@link Model} class, if found
	         */
	
	    }, {
	        key: 'get',
	        value: function get(modelName) {
	            var found = (0, _find2.default)(this.registry.concat(this.implicitThroughModels), function (model) {
	                return model.modelName === modelName;
	            });
	
	            if (typeof found === 'undefined') {
	                throw new Error('Did not find model ' + modelName + ' from registry.');
	            }
	            return found;
	        }
	    }, {
	        key: 'getModelClasses',
	        value: function getModelClasses() {
	            this._setupModelPrototypes();
	            return this.registry.concat(this.implicitThroughModels);
	        }
	    }, {
	        key: '_attachQuerySetMethods',
	        value: function _attachQuerySetMethods(model) {
	            var querySetClass = model.querySetClass;
	
	            (0, _utils.attachQuerySetMethods)(model, querySetClass);
	        }
	    }, {
	        key: '_setupModelPrototypes',
	        value: function _setupModelPrototypes() {
	            var _this5 = this;
	
	            this.registry.forEach(function (model) {
	                if (!model.isSetUp) {
	                    var fields = model.fields;
	                    (0, _forOwn2.default)(fields, function (fieldInstance, fieldName) {
	                        var descriptor = (0, _getOwnPropertyDescriptor2.default)(model.prototype, fieldName);
	                        if (typeof descriptor === 'undefined') {
	                            var toModelName = fieldInstance.toModelName;
	                            var toModel = toModelName === 'this' ? model : _this5.get(toModelName);
	
	                            if (fieldInstance instanceof _fields.ForeignKey) {
	                                // Forwards.
	                                (0, _defineProperty3.default)(model.prototype, fieldName, (0, _descriptors.forwardManyToOneDescriptor)(fieldName, toModel.modelName));
	                                model.definedProperties[fieldName] = true;
	
	                                // Backwards.
	                                var backwardsFieldName = fieldInstance.relatedName ? fieldInstance.relatedName : (0, _utils.reverseFieldName)(model.modelName);
	
	                                if (toModel.definedProperties[backwardsFieldName]) {
	                                    var errorMsg = (0, _utils.reverseFieldErrorMessage)(model.modelName, fieldName, toModel.modelName, backwardsFieldName);
	                                    throw new Error(errorMsg);
	                                }
	
	                                (0, _defineProperty3.default)(toModel.prototype, backwardsFieldName, (0, _descriptors.backwardManyToOneDescriptor)(fieldName, model.modelName));
	                                toModel.definedProperties[backwardsFieldName] = true;
	                                toModel.virtualFields[backwardsFieldName] = new _fields.ForeignKey(model.modelName, fieldName);
	                            } else if (fieldInstance instanceof _fields.ManyToMany) {
	                                // Forwards.
	                                var throughModelName = (0, _utils.m2mName)(model.modelName, fieldName);
	                                // const throughModel = this.get(throughModelName);
	
	                                (0, _defineProperty3.default)(model.prototype, fieldName, (0, _descriptors.manyToManyDescriptor)(model.modelName, toModel.modelName, throughModelName, false));
	                                model.definedProperties[fieldName] = true;
	                                model.virtualFields[fieldName] = new _fields.ManyToMany(toModel.modelName, fieldName);
	
	                                // Backwards.
	                                var _backwardsFieldName = fieldInstance.relatedName ? fieldInstance.relatedName : (0, _utils.reverseFieldName)(model.modelName);
	
	                                if (toModel.definedProperties[_backwardsFieldName]) {
	                                    var _errorMsg = (0, _utils.reverseFieldErrorMessage)(model.modelName, fieldName, toModel.modelName, _backwardsFieldName);
	                                    throw new Error(_errorMsg);
	                                }
	
	                                (0, _defineProperty3.default)(toModel.prototype, _backwardsFieldName, (0, _descriptors.manyToManyDescriptor)(model.modelName, toModel.modelName, throughModelName, true));
	                                toModel.definedProperties[_backwardsFieldName] = true;
	                                toModel.virtualFields[_backwardsFieldName] = new _fields.ManyToMany(model.modelName, fieldName);
	                            } else if (fieldInstance instanceof _fields.OneToOne) {
	                                // Forwards.
	                                (0, _defineProperty3.default)(model.prototype, fieldName, (0, _descriptors.forwardOneToOneDescriptor)(fieldName, toModel.modelName));
	                                model.definedProperties[fieldName] = true;
	
	                                // Backwards.
	                                var _backwardsFieldName2 = fieldInstance.relatedName ? fieldInstance.relatedName : model.modelName.toLowerCase();
	
	                                if (toModel.definedProperties[_backwardsFieldName2]) {
	                                    var _errorMsg2 = (0, _utils.reverseFieldErrorMessage)(model.modelName, fieldName, toModel.modelName, _backwardsFieldName2);
	                                    throw new Error(_errorMsg2);
	                                }
	
	                                (0, _defineProperty3.default)(toModel.prototype, _backwardsFieldName2, (0, _descriptors.backwardOneToOneDescriptor)(fieldName, model.modelName));
	                                toModel.definedProperties[_backwardsFieldName2] = true;
	                                toModel.virtualFields[_backwardsFieldName2] = new _fields.OneToOne(model.modelName, fieldName);
	                            }
	                        }
	                    });
	                    _this5._attachQuerySetMethods(model);
	                    model.isSetUp = true;
	                }
	            });
	
	            this.implicitThroughModels.forEach(function (model) {
	                if (!model.isSetUp) {
	                    (0, _forOwn2.default)(model.fields, function (fieldInstance, fieldName) {
	                        var toModelName = fieldInstance.toModelName;
	                        var toModel = toModelName === 'this' ? model : _this5.get(toModelName);
	                        // Only Forwards.
	                        (0, _defineProperty3.default)(model.prototype, fieldName, (0, _descriptors.forwardManyToOneDescriptor)(fieldName, toModel.modelName));
	                        model.definedProperties[fieldName] = true;
	                    });
	                    _this5._attachQuerySetMethods(model);
	                    model.isSetUp = true;
	                }
	            });
	        }
	
	        /**
	         * Returns the default state.
	         * @return {Object} the default state
	         */
	
	    }, {
	        key: 'getDefaultState',
	        value: function getDefaultState() {
	            var models = this.getModelClasses();
	            var state = {};
	            models.forEach(function (modelClass) {
	                state[modelClass.modelName] = modelClass.getDefaultState();
	            });
	            return state;
	        }
	
	        /**
	         * Begins an immutable database session.
	         *
	         * @param  {Object} state  - the state the database manages
	         * @param  {Object} [action] - the dispatched action object
	         * @return {Session} a new {@link Session} instance
	         */
	
	    }, {
	        key: 'from',
	        value: function from(state, action) {
	            return new _Session2.default(this, state, action);
	        }
	
	        /**
	         * Begins a mutable database session.
	         *
	         * @param  {Object} state  - the state the database manages
	         * @param  {Object} [action] - the dispatched action object
	         * @return {Session} a new {@link Session} instance
	         */
	
	    }, {
	        key: 'withMutations',
	        value: function withMutations(state, action) {
	            return new _Session2.default(this, state, action, true);
	        }
	
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
	
	    }, {
	        key: 'reducer',
	        value: function reducer() {
	            var _this6 = this;
	
	            return function (state, action) {
	                return _this6.from(state, action).reduce();
	            };
	        }
	
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
	
	    }, {
	        key: 'createSelector',
	        value: function createSelector() {
	            if (arguments.length === 1) {
	                return (0, _memoize.memoize)(arguments.length <= 0 ? undefined : arguments[0], _memoize.eqCheck, this);
	            }
	            return this.selectorCreator.apply(this, arguments);
	        }
	    }]);
	    return Schema;
	}();
	
	exports.default = Schema;

/***/ },
/* 279 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports.defaultMemoize = defaultMemoize;
	exports.createSelectorCreator = createSelectorCreator;
	exports.createSelector = createSelector;
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
	
	    if (lastArgs !== null && lastArgs.length === args.length && args.every(function (value, index) {
	      return equalityCheck(value, lastArgs[index]);
	    })) {
	      return lastResult;
	    }
	    lastArgs = args;
	    lastResult = func.apply(undefined, args);
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
	
	function createSelector() {
	  return createSelectorCreator(defaultMemoize).apply(undefined, arguments);
	}
	
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

/***/ },
/* 280 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(82),
	    baseFind = __webpack_require__(281),
	    baseFindIndex = __webpack_require__(282),
	    baseIteratee = __webpack_require__(106),
	    isArray = __webpack_require__(101);
	
	/**
	 * Iterates over elements of `collection`, returning the first element
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to search.
	 * @param {Array|Function|Object|string} [predicate=_.identity]
	 *  The function invoked per iteration.
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
	function find(collection, predicate) {
	  predicate = baseIteratee(predicate, 3);
	  if (isArray(collection)) {
	    var index = baseFindIndex(collection, predicate);
	    return index > -1 ? collection[index] : undefined;
	  }
	  return baseFind(collection, predicate, baseEach);
	}
	
	module.exports = find;


/***/ },
/* 281 */
/***/ function(module, exports) {

	/**
	 * The base implementation of methods like `_.find` and `_.findKey`, without
	 * support for iteratee shorthands, which iterates over `collection` using
	 * `eachFunc`.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to search.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {Function} eachFunc The function to iterate over `collection`.
	 * @param {boolean} [retKey] Specify returning the key of the found element
	 *  instead of the element itself.
	 * @returns {*} Returns the found element or its key, else `undefined`.
	 */
	function baseFind(collection, predicate, eachFunc, retKey) {
	  var result;
	  eachFunc(collection, function(value, key, collection) {
	    if (predicate(value, key, collection)) {
	      result = retKey ? key : value;
	      return false;
	    }
	  });
	  return result;
	}
	
	module.exports = baseFind;


/***/ },
/* 282 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromRight) {
	  var length = array.length,
	      index = fromRight ? length : -1;
	
	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = baseFindIndex;


/***/ },
/* 283 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.manyToManyDescriptor = exports.backwardManyToOneDescriptor = exports.backwardOneToOneDescriptor = exports.forwardOneToOneDescriptor = exports.forwardManyToOneDescriptor = undefined;
	
	var _defineProperty2 = __webpack_require__(245);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _difference = __webpack_require__(238);
	
	var _difference2 = _interopRequireDefault(_difference);
	
	var _constants = __webpack_require__(243);
	
	var _constants2 = _interopRequireDefault(_constants);
	
	var _utils = __webpack_require__(199);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
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
	            var thisId = this.getId();
	            var toId = void 0;
	            if (value instanceof declaredToModel) {
	                toId = value.getId();
	            } else {
	                toId = value;
	            }
	
	            this.getClass().addUpdate({
	                type: _constants2.default,
	                payload: {
	                    idArr: [thisId],
	                    updater: (0, _defineProperty3.default)({}, fieldName, toId)
	                }
	            });
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
	function manyToManyDescriptor(declaredFromModelName, declaredToModelName, throughModelName, reverse) {
	    return {
	        get: function get() {
	            var currentSession = this.getClass().session;
	            var declaredFromModel = currentSession[declaredFromModelName];
	            var declaredToModel = currentSession[declaredToModelName];
	            var throughModel = currentSession[throughModelName];
	            var thisId = this.getId();
	
	            var fromFieldName = (0, _utils.m2mFromFieldName)(declaredFromModel.modelName);
	            var toFieldName = (0, _utils.m2mToFieldName)(declaredToModel.modelName);
	
	            var lookupObj = {};
	            if (!reverse) {
	                lookupObj[fromFieldName] = thisId;
	            } else {
	                lookupObj[toFieldName] = thisId;
	            }
	            var throughQs = throughModel.filter(lookupObj);
	            var toIds = throughQs.withRefs.map(function (obj) {
	                return obj[reverse ? fromFieldName : toFieldName];
	            });
	
	            var qsFromModel = reverse ? declaredFromModel : declaredToModel;
	            var qs = qsFromModel.getQuerySetFromIds(toIds);
	
	            qs.add = function add() {
	                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                    args[_key] = arguments[_key];
	                }
	
	                var idsToAdd = args.map(_utils.normalizeEntity);
	
	                var filterWithAttr = reverse ? fromFieldName : toFieldName;
	
	                var existingQs = throughQs.withRefs.filter(function (through) {
	                    return (0, _utils.includes)(idsToAdd, through[filterWithAttr]);
	                });
	
	                if (existingQs.exists()) {
	                    var existingIds = existingQs.withRefs.map(function (through) {
	                        return through[filterWithAttr];
	                    });
	
	                    var toAddModel = reverse ? declaredFromModel.modelName : declaredToModel.modelName;
	
	                    var addFromModel = reverse ? declaredToModel.modelName : declaredFromModel.modelName;
	
	                    throw new Error('Tried to add already existing ' + toAddModel + ' id(s) ' + existingIds + ' to the ' + addFromModel + ' instance with id ' + thisId);
	                }
	
	                idsToAdd.forEach(function (id) {
	                    var _throughModel$create;
	
	                    throughModel.create((_throughModel$create = {}, (0, _defineProperty3.default)(_throughModel$create, fromFieldName, thisId), (0, _defineProperty3.default)(_throughModel$create, toFieldName, id), _throughModel$create));
	                });
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
	                var entitiesToDelete = throughQs.withRefs.filter(function (through) {
	                    return (0, _utils.includes)(idsToRemove, through[attrInIdsToRemove]);
	                });
	
	                if (entitiesToDelete.count() !== idsToRemove.length) {
	                    // Tried deleting non-existing entities.
	                    var entitiesToDeleteIds = entitiesToDelete.withRefs.map(function (through) {
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
	
	exports.forwardManyToOneDescriptor = forwardManyToOneDescriptor;
	exports.forwardOneToOneDescriptor = forwardOneToOneDescriptor;
	exports.backwardOneToOneDescriptor = backwardOneToOneDescriptor;
	exports.backwardManyToOneDescriptor = backwardManyToOneDescriptor;
	exports.manyToManyDescriptor = manyToManyDescriptor;

/***/ },
/* 284 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _toConsumableArray2 = __webpack_require__(248);
	
	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
	
	exports.eqCheck = eqCheck;
	exports.memoize = memoize;
	
	var _values = __webpack_require__(217);
	
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
	 * @param  {Schema} modelSchema - a redux-orm Schema instance
	 * @return {Function} `func` memoized.
	 */
	function memoize(func) {
	    var equalityCheck = arguments.length <= 1 || arguments[1] === undefined ? eqCheck : arguments[1];
	    var modelSchema = arguments[2];
	
	    var lastOrmState = null;
	    var lastResult = null;
	    var lastArgs = null;
	    var modelNameToInvalidatorMap = {};
	
	    return function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }
	
	        var ormState = args[0];
	        var otherArgs = args.slice(1);
	
	
	        var ormIsEqual = lastOrmState === ormState || !shouldRun(modelNameToInvalidatorMap, ormState);
	
	        var argsAreEqual = lastArgs && otherArgs.every(function (value, index) {
	            return equalityCheck(value, lastArgs[index]);
	        });
	
	        if (ormIsEqual && argsAreEqual) {
	            return lastResult;
	        }
	
	        var session = modelSchema.from(ormState);
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
	        lastOrmState = ormState;
	        lastArgs = otherArgs;
	
	        return lastResult;
	    };
	}

/***/ }
/******/ ])
});
;
//# sourceMappingURL=redux-orm.js.map