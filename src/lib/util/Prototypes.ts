import { AkairoError } from "discord-akairo";
import { AkairoHandler, AkairoModule } from "discord-akairo";
import { extname } from "path";
import { isClass } from "./Functions";

import type { Class } from "type-fest";

AkairoHandler.prototype.findExport = function (
  module: Dictionary
): Class<AkairoModule> | null {
  if (module.__esModule) {
    const _default = Reflect.get(module, "default");
    if (isClass(_default)) {
      return _default as Class<AkairoModule>;
    }

    let _class: Class<unknown> | null = null;
    for (const prop of Object.values(module)) {
      if (isClass(prop)) {
        _class = prop;
        break;
      }
    }

    return _class as Class<AkairoModule> | null;
  }

  return isClass(module) ? (module as Class<AkairoModule>) : null;
};

// @ts-expect-error
AkairoHandler.prototype.load = function (
  thing: string | typeof AkairoModule,
  isReload: boolean
): AkairoModule | undefined {
  let Module: Class<AkairoModule>;
  if (typeof thing === "function") {
    Module = thing;
  } else {
    if (!this.extensions.has(extname(thing))) {
      return;
    }

    const exported = this.findExport(require(thing));
    delete require.cache[require.resolve(thing)];

    if (!exported) {
      return undefined;
    }

    Module = exported;
  }

  if (!Module || !(Module.prototype instanceof this.classToHandle)) {
    return undefined;
  }

  const module: AkairoModule = new Module();
  if (this.modules.has(module.id)) {
    // @ts-expect-error
    throw new AkairoError("ALREADY_LOADED", this.classToHandle.name, module.id);
  }

  this.register(module, typeof thing === "function" ? undefined : thing);
  this.emit("load", module, isReload);

  return module;
};
