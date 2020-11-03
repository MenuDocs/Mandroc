/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

import fetch from "node-fetch";
import ms from "ms";
import { Logger } from "@ayanaware/logger";
import { config, Mandroc } from "@lib";

export class Server {
  public readonly log = Logger.get(Server);

  #auth?: string;

  #interval?: NodeJS.Timeout;

  readonly #client: Mandroc;

  /**
   * @param client The client
   */
  public constructor(client: Mandroc) {
    this.#client = client;
    this.#interval?.refresh();
  }

  /**
   * The URL of the website.
   */
  public get website(): WebsiteConfig {
    return config.get("website");
  }

  /**
   * Starts the server thingy majingy
   */
  public launch() {
    this.requestAuthentication().then(() => {
      this.#interval = this.#client.setInterval(async () => {
        if (!this.#auth) {
          const auth = await this.requestAuthentication();
          if (!auth) {
            this.log.warn("Couldn't fetch the authorization header.");
            return;
          }

          this.#auth = auth;
        }

        await this.sendPing();
      }, ms("5s"));
    });
  }

  /**
   * Sends the gateway ping to the website.
   * @private
   */
  private sendPing() {
    return fetch(`${this.website.url}/pings/${this.website.id}`, {
      method: "put",
      headers: { authorization: `Bearer ${this.#auth}` },
      body: JSON.stringify({ ping: this.#client.ws.ping }),
    });
  }

  /**
   * Requests a JWT from the website api.
   * @private
   */
  private async requestAuthentication(): Promise<string | null> {
    try {
      const response = await fetch(`${this.website.url}/auth/local`, {
        body: JSON.stringify({
          identifier: this.website.username,
          password: this.website.password,
        }),
      });

      const json = await response.json();
      console.log(json);

      return null;
    } catch (e) {
      this.log.error(e);
      return null;
    }
  }
}

interface WebsiteConfig {
  url: string;
  password: string;
  username: string;
  id: number;
}
