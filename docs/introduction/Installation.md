---
id: installation
title: Installation
sidebar_label: Installation
hide_title: true
---

# Installation

## Package managers

Install latest version using NPM:

```bash
npm install redux-orm --save
```

or Yarn:

```bash
yarn add redux-orm
```

## Browser script

Redux-ORM is available as a precompiled script.

Add following tag exposing a global called `ReduxOrm`:

```html
<script src="https://unpkg.com/redux-orm/dist/redux-orm.min.js"></script>
```

## Downloads 

* [Latest browser build (minimized)](https://unpkg.com/redux-orm/dist/redux-orm.min.js)
  * [Source Map](https://unpkg.com/redux-orm/dist/redux-orm.min.js.map)

* [Latest browser build](https://unpkg.com/redux-orm/dist/redux-orm.js) (only use if size does not matter)

### Polyfill

Redux-ORM uses some ES2015+ features, such as `Set`. If you are using Redux-ORM in a pre-ES2015+ environment, you should load a polyfill like [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/) before using Redux-ORM.
