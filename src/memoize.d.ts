import { ORM } from "./ORM";

export function memoize<I>(func: Function, orm: ORM<I>): any;

export function memoizeByKey<I>(
    func: Function,
    orm: ORM<I>,
    ignoreDependenciesCount: number
): any;
