---
id: getting-started
title: Getting Started with Redux-ORM
sidebar_label: Getting Started
hide_title: true
---

# Getting Started with Redux-ORM

Redux-ORM helps you manage relational data in Redux.

## Installation

The library is available as a package on NPM for use with a module bundler or in a Node application:

```bash
npm install redux-orm
```

### Polyfill

Redux-ORM uses some <abbr title="ECMAScript">ES</abbr>6+ features, such as `Set` and `Symbol`.

So if you are dealing with a pre-ES6 environment, you should load a polyfill like [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/) before using Redux-ORM.

### Details

For more details, see the [Installation](Installation.md) page. Or [skip ahead to the Quick Start](basics/README.md).
