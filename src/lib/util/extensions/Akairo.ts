// @ts-expect-error
import ArgumentRunner = require("discord-akairo/src/struct/commands/arguments/ArgumentRunner");
import type { AkairoModule, Argument, ArgumentRunnerState, ContentParserResult } from "discord-akairo";
import { AkairoError, AkairoHandler } from "discord-akairo";

import { isClass } from "../Functions";
import { extname } from "path";

import type { Message } from "discord.js";
import type { Class } from "type-fest";

export enum ArgumentMatch {
  PHRASE = "phrase",
  FLAG = "flag",
  OPTION = "option",
  REST = "rest",
  SEPARATE = "separate",
  TEXT = "text",
  CONTENT = "content",
  TENTATIVE = "tentative",
  REST_CONTENT = "restContent",
  NONE = "none",
}

ArgumentRunner.prototype.runOne = async function (
  message: Message,
  parsed: ContentParserResult,
  state: ArgumentRunnerState,
  arg: Argument,
) {
  const cases = {
    [ArgumentMatch.PHRASE]: this.runPhrase,
    [ArgumentMatch.FLAG]: this.runFlag,
    [ArgumentMatch.OPTION]: this.runOption,
    [ArgumentMatch.REST]: this.runRest,
    [ArgumentMatch.SEPARATE]: this.runSeparate,
    [ArgumentMatch.TEXT]: this.runText,
    [ArgumentMatch.CONTENT]: this.runContent,
    [ArgumentMatch.TENTATIVE]: this.runTentative,
    [ArgumentMatch.REST_CONTENT]: this.runRestContent,
    [ArgumentMatch.NONE]: this.runNone,
  };

  const runFn = cases[arg.match];
  if (runFn == null) {
    // @ts-expect-error
    throw new AkairoError("UNKNOWN_MATCH_TYPE", arg.match);
  }

  return runFn.call(this, message, parsed, state, arg);
};

ArgumentRunner.prototype.runTentative = async function (
  message: Message,
  parsed: ContentParserResult,
  state: ArgumentRunnerState,
  arg: Argument,
) {
  const phrase = parsed.phrases[state.phraseIndex]
    ? (parsed.phrases[state.phraseIndex] as any).value
    : "",
    ret = await arg.process(message, phrase);

  if (!ret) {
    return null;
  }

  ArgumentRunner.increaseIndex(parsed, state);
  return ret;
};

AkairoHandler.prototype.findExport = function (
  module: Dictionary,
): Class<AkairoModule> | null {
  if (module.__esModule) {
    const _default = Reflect.get(module, "default");
    if (isClass(_default)) {
      return _default as Class<AkairoModule>;
    }

    let _class: Class | null = null;
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

AkairoHandler.prototype.load = function (
  thing: string | typeof AkairoModule,
  isReload: boolean,
): AkairoModule {
  let Module: Class<AkairoModule>;
  if (typeof thing === "function") {
    Module = thing;
  } else {
    if (!this.extensions.has(extname(thing))) {
      return {} as AkairoModule;
    }

    const exported = this.findExport(require(thing));
    delete require.cache[require.resolve(thing)];

    if (!exported) {
      return {} as AkairoModule;
    }

    Module = exported;
  }

  if (!Module || !(Module.prototype instanceof this.classToHandle)) {
    return {} as AkairoModule;
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
