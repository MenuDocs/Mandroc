/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import type { EventEmitter } from "events";
import type { Class } from "type-fest";

/**
 * A helper function for determining whether something is a class.
 * @param input
 */
export function isClass(input: unknown): input is Class<unknown> {
  return (
    typeof input === "function" &&
    typeof input.prototype === "object" &&
    input.toString().substring(0, 5) === "class"
  );
}

/**
 * A helper function for capitalizing the first letter in the sentence.
 * @param str
 * @param lowerRest
 */
export function capitalize(str: string, lowerRest = true): string {
  const [ f, ...r ] = str.split("");
  return `${f.toUpperCase()}${
    lowerRest ? r.join("").toLowerCase() : r.join("")
  }`;
}

String.prototype.capitalize = function (lowerRest = true) {
  return capitalize(this.toString(), lowerRest);
};

/**
 * A helper function for determining if a value is an event emitter.
 * @param input
 * @since 2.0.0
 */
export function isEmitter(input: unknown): input is EventEmitter {
  return (
    input !== "undefined" &&
    input !== void 0 &&
    typeof (input as EventEmitter).on === "function" &&
    typeof (input as EventEmitter).emit === "function"
  );
}

/**
 * Returns an array.
 * @param v
 */
export function array<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [ v ];
}

/**
 * A helper function for determining if a value is a string.
 * @param value
 */
export function isString(value: unknown): value is string {
  return value !== null && value !== "undefined" && typeof value === "string";
}

/**
 * A helper function for determining whether or not a value is a promise,
 * @param value
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  let val = value as any;

  return (
    !!value && typeof val.then === "function" && typeof val.catch === "function"
  );
}

/**
 * @param value
 */
export function intoCallable<T>(value: T | (() => T)): () => T {
  // @ts-ignore
  return typeof value !== "function" ? () => value : value;
}

/**
 * Code block template tag.
 * @param strings
 * @param values
 */
export function code(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string;
/**
 * Creates a typed code block template tag.
 * @param type The type of code block.
 */
export function code(type: string): TemplateTag<string>;
export function code(...args: unknown[]): string | TemplateTag<string> {
  const block = (type?: string): TemplateTag<string> => (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) =>
    `\`\`\`${type ?? ""}\n${strings
      .map((s, i) => s + (values[i] ?? ""))
      .join("")}\n\`\`\``;

  return typeof args[0] === "string"
    ? block(args.shift() as string)
    : block()(args[0] as TemplateStringsArray, ...args.slice(1));
}

/**
 * A helper function for testing whether or not a value exists.
 * @param value
 */
export function doesExist(value: unknown): boolean {
  return value !== undefined && value !== void 0;
}

/**
 * Test whether or not a value is an object.
 * @param value
 */
export function isObj(value: unknown): value is Dictionary {
  return typeof value === "object" && doesExist(value);
}

/**
 * Merges objects into one.
 * @param objects The objects to merge.
 */
export function mergeObjects<O extends Dictionary = Dictionary>(
  ...objects: Partial<O>[]
): O {
  const o: Dictionary = {};
  for (const object of objects) {
    for (const key of Object.keys(object)) {
      if (o[key] === null || o[key] === void 0) {
        o[key] = object[key];
      }
    }
  }

  return o as O;
}

export function censorToken(token: string): string {
  return token
    .split(".")
    .map((v, i) => (i > 1 ? v.replace(/./g, "*") : v))
    .join(".");
}

/**
 * Create a new pagination
 *
 * @param arr The array to paginate
 * @param itemsPerPage How many items to list per page
 * @param current The page you want to show
 */
export function paginate<T>(arr: T[], itemsPerPage: number, current = 1): PaginationResult<T> {
  const maxPages = Math.ceil(arr.length / itemsPerPage);
  if (current < 1 || current > maxPages || current === 0) {
    current = maxPages;
  }

  const page = arr.slice((current - 1) * itemsPerPage, current * itemsPerPage);
  return {
    current,
    max: maxPages,
    page,
  };
}

interface PaginationResult<T> {
  current: number;
  max: number;
  page: T[];
}

export type TemplateTag<T> = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => T;
