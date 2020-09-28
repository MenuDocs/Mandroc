/**
 * @file Dot Notation Utilities. Based Off https://github.com/sindresorhus/dot-prop
 */

import { isObj } from "./Functions";

function isValidPath(segments: string[]): boolean {
  const disallowedKeys = ["__proto__", "prototype", "constructor"];

  return !segments.some((s) => disallowedKeys.includes(s));
}

function getPathSegments(path: string): string[] {
  const segments = path.split("."),
    parts = [];

  for (let i = 0; i < segments.length; i++) {
    let p = segments[i];

    while (p[p.length - 1] === "\\" && segments[i + 1] !== undefined) {
      p = p.slice(0, -1) + ".";
      p += segments[++i];
    }

    parts.push(p);
  }

  return !isValidPath(parts) ? [] : parts;
}

export const DN = {
  /**
   * Whether or not an object has a property.
   * @param object The object
   * @param path The path to the property.
   */
  has(object: Dictionary, path: string): boolean {
    if (!isObj(object)) return false;

    const segments = getPathSegments(path);
    if (segments.length === 0) return false;

    for (const key of segments) {
      if (isObj(object)) {
        if (!(key in object)) return false;
        object = object[key];
      } else return false;
    }

    return true;
  },

  /**
   * Get a value.
   * @param obj The object.
   * @param path The path to the value.
   * @param defaultValue The default value.
   */
  get<T>(obj: Dictionary, path: string, defaultValue?: T): T | undefined {
    if (!isObj(obj))
      return defaultValue === undefined ? (obj as T) : defaultValue;

    const segments = getPathSegments(path);
    if (segments.length === 0) return;

    for (let i = 0; i < segments.length; i++) {
      if (!Object.prototype.propertyIsEnumerable.call(obj, segments[i]))
        return defaultValue;

      obj = obj[segments[i]];
      if (obj === undefined || obj === null) {
        if (i !== segments.length - 1) return defaultValue;
        break;
      }
    }

    return obj as T;
  },

  /**
   * Set a value.
   * @param object The object.
   * @param path The path.
   * @param value The value.
   */
  set(object: Dictionary, path: string, value: unknown): Dictionary {
    if (!isObj(object)) return object;

    const root = object,
      segments = getPathSegments(path);

    for (let i = 0; i < segments.length; i++) {
      const p = segments[i];
      if (!isObj(object[p])) object[p] = {};

      i === segments.length - 1 ? (object[p] = value) : (object = object[p]);
    }

    return root;
  },

  /**
   * Delete a property.
   * @param object The object.
   * @param path The path.
   */
  delete(object: Dictionary, path: string): void {
    if (!isObj(object)) return;

    const segments = getPathSegments(path);
    for (let i = 0; i < segments.length; i++) {
      const p = segments[i];
      if (i === segments.length - 1) {
        delete object[p];
        return;
      }

      object = object[p];
      if (!isObj(object)) return;
    }
  },
};
