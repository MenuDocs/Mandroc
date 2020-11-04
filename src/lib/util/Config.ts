/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import * as path from "path";
import * as fs from "fs";

import { DN } from "./DotNotation";
import { main } from "../../index";

class Config {
  /**
   * The configuration data from "config.json"
   * @private
   */
  private _data!: Dictionary;

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
      main.error(
        `File "${path.basename(file)}" does not exist... please create it.`
      );
      return process.exit(1);
    }

    fs.access(file, fs.constants.F_OK, (err) => {
      if (err) {
        main.info(`Cannot read from "${path.basename(file)}"`);
        main.error(err);
        return process.exit(1);
      }
    });

    const data = fs.readFileSync(file, "utf-8");

    try {
      this._data = JSON.parse(data);
    } catch (e) {
      main.info(`Cannot load "${path.basename(file)}"`);
      main.error(e);
      process.exit(1);
    }
  }

  /**
   * Get a configuration value.
   * @param path The path to the value.
   * @param defaultValue Default value to return.
   */
  public get<T>(path: string, defaultValue?: T): T {
    return DN.get(this._data, path, defaultValue) as T;
  }
}

export const config = new Config();
