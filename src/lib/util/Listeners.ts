  import type { Class } from "type-fest";
  import { isClass } from "./Functions";
  

export class Listener {
  /**
   * Find a module from an export.
   * @param module The module.
   * @since 1.0.0
   * @private
   */
  private static findModule(
    module: Dictionary<unknown>
  ): Class<unknown> | null {
    if (module.__esModule) {
      if (isClass(module.default)) return module.default;

      const keys = Object.keys(module);
      let _class: Class<unknown> | null = null;

      for (const key of keys) {
        const obj = module[key];
        if (isClass(obj)) {
          _class = obj;
          break;
        }
      }

      return _class;
    }

    if (!isClass(module)) throw new Error("Exported value is not a class.");

    return module;
  }
}
