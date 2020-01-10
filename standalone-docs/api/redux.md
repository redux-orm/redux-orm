---
id: module_redux
title: Redux
sidebar_label: Redux
hide_title: true
---

<a name="module:redux"></a>

#  redux

<p>Provides functions for integration with Redux.</p>


<a name="module:redux~level"></a>

## ` level`

<p>Drill down into selector map by cachePath.</p>
<p>The selector itself is stored under a special SELECTOR_KEY<br>
so that we can store selectors below it as well.</p>

**Kind**: inner property of redux  

<a name="defaultUpdater"></a>

# ` defaultUpdater()`⇒ undefined 

<p>Calls all models' reducers if they exist.</p>

**Kind**: global function  

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
function that you pass as the last argument, any of the arguments<br>
you pass first will be considered selectors and mapped<br>
to their outputs, like in <code>reselect</code>.</p>
<p>Here are some example selectors:</p>
<pre class="prettyprint source lang-javascript"><code>// orm is an instance of ORM
// reduxState is the state of a Redux store
const books = createSelector(orm.Book);
books(reduxState) // array of book refs

const bookAuthors = createSelector(orm.Book.authors);
bookAuthors(reduxState) // two-dimensional array of author refs for each book
</code></pre>
<p>Selectors can easily be applied to related models:</p>
<pre class="prettyprint source lang-javascript"><code>const bookAuthorNames = createSelector(
    orm.Book.authors.map(orm.Author.name),
);
bookAuthorNames(reduxState, 8) // names of all authors of book with ID 8
bookAuthorNames(reduxState, [8, 9]) // 2D array of names of all authors of books with IDs 8 and 9
</code></pre>
<p>Also note that <code>orm.Author.name</code> did not need to be wrapped in another <code>createSelector</code> call,<br>
although that would be possible.</p>
<p>For more complex calculations you can access<br>
entire session objects by passing an ORM instance.</p>
<pre class="prettyprint source lang-javascript"><code>const freshBananasCost = createSelector(
    orm,
    session => {
       const banana = session.Product.get({
           name: &quot;Banana&quot;,
       });
       // amount of fresh bananas in shopping cart
       const amount = session.ShoppingCart.filter({
           product_id: banana.id,
           is_fresh: true,
       }).count();
       return `USD ${amount * banana.price}`;
    }
);
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
<p>This way you can use pure rendering in your React components<br>
for performance gains.</p>

**Kind**: global function  
**Returns**: function - <p>memoized selector</p>  

| Param | Type | Description |
| --- | --- | --- |
| ...args | function | <p>zero or more input selectors<br> and the selector function.</p> |


