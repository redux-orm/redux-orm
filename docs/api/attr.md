---
id: attr
title: attr
sidebar_label: attr
hide_title: true
---

<a name="attr"></a>

## attr([opts]) ⇒ <code>Attribute</code>
Defines a value attribute on the model.
Though not required, it is recommended to define this for each non-foreign key you wish to use.
Getters and setters need to be defined on each Model
instantiation for undeclared data fields, which is slower.
You can use the optional `getDefault` parameter to fill in unpassed values
to [create](#Model.create), such as for generating ID's with UUID:

```javascript
import getUUID from 'your-uuid-package-of-choice';

fields = {
  id: attr({ getDefault: () => getUUID() }),
  title: attr(),
}
```

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> |  |
| [opts.getDefault] | <code>function</code> | if you give a function here, it's return                                       value from calling with zero arguments will                                       be used as the value when creating a new Model                                       instance with [Model#create](Model#create) if the field                                       value is not passed. |

