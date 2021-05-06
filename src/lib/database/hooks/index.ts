export type Hook<T, U> = [ T, HookSave<U> ];
export type HookSave<U> = (data?: U, push?: boolean) => Promise<void>;

export * from "./tag";
export * from "./profile";
