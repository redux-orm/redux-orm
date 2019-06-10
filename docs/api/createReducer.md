---
id: createreducer
title: createReducer
sidebar_label: createReducer
hide_title: true
---

<a name="createReducer"></a>

## createReducer(orm, [updater]) ⇒ <code>function</code>
Call the returned function to pass actions to Redux-ORM.

**Kind**: global function  
**Returns**: <code>function</code> - reducer that will update the ORM state.  

| Param | Type | Description |
| --- | --- | --- |
| orm | [<code>ORM</code>](#ORM) | the ORM instance. |
| [updater] | <code>function</code> | the function updating the ORM state based on the given action. |

