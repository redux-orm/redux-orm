---
id: createReducer
title: createReducer
sidebar_label: createReducer
hide_title: true
---

<a name="createReducer"></a>

## `createReducer(orm, [updater])` ⇒ `function`
Call the returned function to pass actions to Redux-ORM.

**Kind**: global function  
**Returns**: `function` - reducer that will update the ORM state.  

| Param | Type | Description |
| --- | --- | --- |
| orm | [`ORM`](#ORM) | the ORM instance. |
| [updater] | `function` | the function updating the ORM state based on the given action. |

