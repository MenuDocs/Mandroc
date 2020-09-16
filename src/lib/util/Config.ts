import * as path from "path";
import * as fs from "fs";
import signale from "signale";
import { DN } from "./DotNotation";

class Config {
  /**
   * The configuration data from ".mdrc.yml"
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
      signale.fatal("File 'config.json' does not exist... please create it.");
      return process.exit(1);
    }

    fs.access(file,  fs.constants.F_OK, (err) => {
      if (err) {
        signale.fatal("Cannot read from 'config.json'", err.message);
        return process.exit(1);
      }
    });


    const data = fs.readFileSync(file, "utf-8");

    try {
      this._data = JSON.parse(data);
    } catch (e) {
      signale.fatal("Cannot load 'config.json'", e);
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
