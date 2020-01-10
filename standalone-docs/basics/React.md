---
id: react
title: Usage with React
sidebar_label: Usage with React
hide_title: true
---

# Usage with React

Here is an example of how Redux-ORM can help when using React.

Let's imagine we have a file at `src/orm.js` where we have set up an `ORM` with a `Book` and an `Author` model. Each book is written by a single author, indicated by a foreign key. Our task is to implement a small author profile that shows an author's name and how many books they have written.

We first define a selector to retrieve one or more authors and another to retrieve their books.

**`src/selectors.js`**:
```jsx
import { createSelector } from "redux-orm";
import orm from "./orm";

export const authors = createSelector(orm.Author);
export const authorBooks = createSelector(orm.Author.books);
```

Then, we proceed to implement the author profile component.
We make use of the `useSelector` hook that allows us to easily retrieve
the stored author by their ID and the books they have written.

**`src/components/AuthorProfile.js`**:
```jsx
import React from "react";
import { useSelector } from "react-redux";
import { authors, authorBooks } from "../selectors";

export function AuthorProfile(props) {
  const author = useSelector(state => authors(state, props.authorId));
  const books = useSelector(state => authorBooks(state, props.authorId));
  return (
    <div>{author.name} has written {books.length} books!</div>
  );
};
```

To use this component, we simply pass an author's primary key to it.
```jsx
<AuthorProfile authorId={1} />
```

