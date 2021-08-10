import type { OrmState } from ".";

export declare const UPDATE: string;
export declare const DELETE: string;
export declare const CREATE: string;

export declare const FILTER: string;
export declare const EXCLUDE: string;
export declare const ORDER_BY: string;

export declare const SUCCESS: string;
export declare const FAILURE: string;

export declare const STATE_FLAG: string;

export declare const ALL_INSTANCES: Symbol;
export declare const ID_ARG_KEY_SELECTOR: (
    state: OrmState<any>,
    idArg: any
) => Symbol | any;

export declare const EMPTY_ARRAY: readonly any[];
