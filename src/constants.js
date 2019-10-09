export const UPDATE = "REDUX_ORM_UPDATE";
export const DELETE = "REDUX_ORM_DELETE";
export const CREATE = "REDUX_ORM_CREATE";

export const FILTER = "REDUX_ORM_FILTER";
export const EXCLUDE = "REDUX_ORM_EXCLUDE";
export const ORDER_BY = "REDUX_ORM_ORDER_BY";

export const SUCCESS = "SUCCESS";
export const FAILURE = "FAILURE";

export const STATE_FLAG = Symbol.for("REDUX_ORM_STATE_FLAG");

export const ALL_INSTANCES = Symbol.for("REDUX_ORM_ALL_INSTANCES");

export const ID_ARG_KEY_SELECTOR = (state, idArg) =>
    typeof idArg === "undefined" ? ALL_INSTANCES : idArg;
