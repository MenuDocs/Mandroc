import * as path from "path";
import * as fs from "fs";
import Logger from "@ayanaware/logger";
import { FileSystemError, ParseError } from "@ayanaware/errors";

import { dotprop } from "./DotNotation";

const log = Logger.get("Config");

class Config {
  static BOOLEAN_VALUES: Record<string, boolean> = {
    no: false,
    yes: true,
    "true": true,
    "false": false
  };
  static ARRAY_SEPARATOR = ",";

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
   * @param options Options
   */
  public get<T>(path: string, options: GetOptions<T> = {}): T {
    if (!this._data) {
      return this.getEnv(path, options);
    }

    return (dotprop.get(this._data, path) ?? this.getEnv(path, options) ?? options.default) as T;
  }

  /**
   * Retrieves an environment variable with the provided name or path.
   *
   * @param nameOrPath The name of the environment variable or a dot notated path.
   * @param options Options for this
   */
  public getEnv<T>(nameOrPath: string, options: GetOptions<T> = {}): T {
    nameOrPath = nameOrPath.replace(/\./g, "_").toUpperCase();

    let value: unknown = (process.env[nameOrPath] ?? options.default);
    if (options.envType && typeof value === "string") {
      switch (options.envType) {
        case "boolean":
          value = Config.BOOLEAN_VALUES[value];
          break;
        case "array":
          value = value.split(Config.ARRAY_SEPARATOR);
          break;
        case "float":
        case "integer":
          value = options.envType === "float"
            ? parseFloat(value)
            : parseInt(value);

          break;
      }
    }

    return value as T;
  }
}

export const config = new Config();

interface GetOptions<V> {
  /**
   * The default value to return.
   */
  default?: V;

  /**
   * The type of value to resolve the environment variable into.
   */
  envType?: "array" | "boolean" | "integer" | "float"
}
