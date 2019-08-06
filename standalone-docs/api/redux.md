---
id: module_redux
title: Redux
sidebar_label: Redux
hide_title: true
---

<a name="module:redux"></a>

#  redux


* [redux](#.redux)
    * _static_
        * [`defaultUpdater()`](#redux.defaultUpdater) ⇒ undefined
    * _inner_
        * [`level`](#redux.level)


<a name="module:redux.defaultUpdater"></a>

## `static  defaultUpdater()`⇒ undefined 

<p>Calls all models' reducers if they exist.</p>

**Kind**: static method of [redux](#.redux)  

<a name="module:redux~level"></a>

## ` level`

<p>Drill down into selector map by cachePath.</p>
<p>The selector itself is stored under a special SELECTOR_KEY<br>
so that we can store selectors below it as well.</p>

**Kind**: inner property of [redux](#.redux)  

<a name="createReducer"></a>

# ` createReducer(orm, [updater])`⇒ function 

<p>Call the returned function to pass actions to Redux-ORM.</p>

**Kind**: global function  
**Returns**: function - <p>reducer that will update the ORM state.</p>  

| Param | Type | Description |
| --- | --- | --- |
| orm | [ORM](#.ORM) | <p>the ORM instance.</p> |
| [updater] | function | <p>the function updating the ORM state based on the given action.</p> |


<a name="createSelector"></a>

# ` createSelector(...args)`⇒ function 

<p>Returns a memoized selector based on passed arguments.<br>
This is similar to <code>reselect</code>'s <code>createSelector</code>,<br>
except you can also pass a single function to be memoized.</p>
<p>If you pass multiple functions, the format will be the<br>
same as in <code>reselect</code>. The last argument is the selector<br>
function and the previous are input selectors.</p>
<p>When you use this method to create a selector, the returned selector<br>
expects the whole <code>redux-orm</code> state branch as input. In the selector<br>
function that you pass as the last argument, you will receive a<br>
<code>session</code> argument (a <code>Session</code> instance) followed by any<br>
input arguments, like in <code>reselect</code>.</p>
<p>This is an example selector:</p>
<pre class="prettyprint source lang-javascript"><code>// orm is an instance of ORM
const bookSelector = createSelector(orm, session => {
    return session.Book.map(book => {
        return Object.assign({}, book.ref, {
            authors: book.authors.map(author => author.name),
            genres: book.genres.map(genre => genre.name),
        });
    });
});
</code></pre>
<p>redux-orm uses a special memoization function to avoid recomputations.</p>
<p>Everytime a selector runs, this function records which instances<br>
of your <code>Model</code>s were accessed.<br><br>
On subsequent runs, the selector first checks if the previously<br>
accessed instances or <code>args</code> have changed in any way:</p>
<ul>
    <li>If yes, the selector calls the function you passed to it.</li>
    <li>If not, it just returns the previous result
        (unless you call it for the first time).</li>
</ul>
<p>This way you can use the <code>PureRenderMixin</code> in your React components<br>
for performance gains.</p>

**Kind**: global function  
**Returns**: function - <p>memoized selector</p>  

| Param | Type | Description |
| --- | --- | --- |
| ...args | function | <p>zero or more input selectors<br> and the selector function.</p> |


