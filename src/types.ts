type LazyPromise<T> = () => Promise<T>;

const wrapInError = (reason: any) => (reason instanceof Error) ? reason : new Error(reason.toString());

const noop = () => undefined;

export {noop, wrapInError, LazyPromise};
