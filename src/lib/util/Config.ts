import * as path from "path";
import * as fs from "fs";
import Logger from "@ayanaware/logger";
import { FileSystemError, ParseError } from "@ayanaware/errors";

import { dotprop } from "./DotNotation";

const log = Logger.get("Config");

class Config {
  /**
   * The configuration data from "config.json"
   * @private
   */
  private _data?: Dictionary;

  /**
   * Creates a new instanceof Config.
   */
  public constructor() {
    this.load();
  }

  /**
   * Loads the 'config.json' file in the project root.
   */
  public load() {
    const file = path.join(process.cwd(), "config.json");

    if (!fs.existsSync(file)) {
      log.warn("Config file is missing, defaulting to environment variables.");
      return;
    }

    fs.access(file, fs.constants.F_OK, err => {
      if (err) {
        log.error(
          new FileSystemError(
            `Cannot read contents of "${path.basename(file)}"`
          ).setCause(err)
        );

        return process.exit(1);
      }
    });

    const data = fs.readFileSync(file, "utf-8");

    try {
      this._data = JSON.parse(data);
    } catch (e) {
      log.error(
        new ParseError(
          `Error occurred while parsing the contents of "${path.basename(
            file
          )}"`
        ).setCause(e)
      );

      process.exit(1);
    }
  }

  /**
   * Get a configuration value.
   *
   * @param path The path to the value.
   * @param defaultValue Default value to return.
   */
  public get<T>(path: string, defaultValue?: T): T {
    if (!this._data) {
      return this.getEnv(path, defaultValue);
    }

    return (dotprop.get(this._data, path) ??
      this.getEnv(path) ??
      defaultValue) as T;
  }

  /**
   * Retrieves an environment variable with the provided name or path.
   *
   * @param nameOrPath The name of the environment variable or a dot notated path.
   * @param {T} defaultValue
   */
  public getEnv<T>(nameOrPath: string, defaultValue?: T): T {
    nameOrPath = nameOrPath.replace(/\./g, "_").toUpperCase();
    return (process.env[nameOrPath] ?? defaultValue) as T;
  }
}

export const config = new Config();
