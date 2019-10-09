export const UPDATE = "REDUX_ORM_UPDATE";
export const DELETE = "REDUX_ORM_DELETE";
export const CREATE = "REDUX_ORM_CREATE";

export const FILTER = "REDUX_ORM_FILTER";
export const EXCLUDE = "REDUX_ORM_EXCLUDE";
export const ORDER_BY = "REDUX_ORM_ORDER_BY";

export const SUCCESS = "SUCCESS";
export const FAILURE = "FAILURE";

// for detecting ORM state objects
export const STATE_FLAG = "@@_______REDUX_ORM_STATE_FLAG";

// for caching selectors based on their ID argument
export const ALL_INSTANCES = Symbol("REDUX_ORM_ALL_INSTANCES");
export const ID_ARG_KEY_SELECTOR = (_state, idArg) =>
    typeof idArg === "undefined" ? ALL_INSTANCES : idArg;
