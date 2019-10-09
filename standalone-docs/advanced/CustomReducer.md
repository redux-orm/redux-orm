---
id: custom-reducer
title: Custom Reducer
sidebar_label: Custom Reducer
hide_title: true
---

# Custom Reducer

## Updating the store state

If you wish to integrate Redux-ORM with Redux by yourself, you could define your own reducer that instantiates a session from the database state held in the Redux state slice.

Then when you've applied all of your updates, you return the next state from the session.

```javascript
function ormReducer(dbState, action) {
    const session = orm.session(dbState);

    // Session-specific Models are available
    // as properties on the Session instance.
    const { Book } = session;

    switch (action.type) {
    case 'CREATE_BOOK':
        Book.create(action.payload);
        break;
    case 'UPDATE_BOOK':
        Book.withId(action.payload.id).update(action.payload);
        break;
    case 'REMOVE_BOOK':
        Book.withId(action.payload.id).delete();
        break;
    case 'ADD_AUTHOR_TO_BOOK':
        Book.withId(action.payload.bookId).authors.add(action.payload.author);
        break;
    case 'REMOVE_AUTHOR_FROM_BOOK':
        Book.withId(action.payload.bookId).authors.remove(action.payload.authorId);
        break;
    case 'ASSIGN_PUBLISHER':
        Book.withId(action.payload.bookId).publisherId = action.payload.publisherId;
        break;
    }

    // The state property of session always points to the current database.
    // Updates don't mutate the original state, so if you changed something
    // this reference will differ from `dbState` that was an argument to this reducer.
    return session.state;
}
```

## `createStore`

Of course then you need to pass this reducer to Redux' `createStore` function instead.

```js
import { createStore, combineReducers } from "redux";
import { createReducer } from "redux-orm";

const rootReducer = combineReducers({
    orm: ormReducer,
    // … potentially other reducers
});
const store = createStore(rootReducer);
```
